import './style.css'

// Configuration des équipes
const TEAMS = {
    valor: { name: 'Team Valor', color: '#FF6B6B', icon: '🔥' },
    mystic: { name: 'Team Mystic', color: '#4ECDC4', icon: '❄️' },
    instinct: { name: 'Team Instinct', color: '#FFE66D', icon: '⚡' }
};

// Configuration GitHub pour le stockage collaboratif
const GITHUB_CONFIG = {
    owner: 'coeyn',  // ⚠️ REMPLACEZ par votre nom d'utilisateur GitHub
    repo: 'pokemon-arenes',          // Nom du repository
    path: 'data/arenes.json',
    apiUrl: null // Sera généré automatiquement
};

// Générer l'URL de l'API GitHub
GITHUB_CONFIG.apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;

// Variables globales
let map;
let markers = [];
let selectedLatLng = null;
let gyms = JSON.parse(localStorage.getItem('pokemonGyms')) || [];
let sharedGyms = JSON.parse(localStorage.getItem('sharedPokemonGyms')) || []; // Base d'arènes partagée
let tempMarker = null;
let pendingGymLocation = null; // Stocke la position pour la création d'arène
let pendingUpdateGymId = null; // Stocke l'ID de l'arène à actualiser
let githubFileSha = null; // SHA du fichier pour les mises à jour GitHub

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    initializeForm();
    initializeTabs();
    initializeFilters();
    loadGymsFromGitHub(); // Charger depuis GitHub d'abord
    initializeCreateGymModal();
    initializeUpdateGymModal();
});

// Charger les arènes depuis GitHub
async function loadGymsFromGitHub() {
    try {
        showNotification('Chargement des arènes...', 'info');
        const response = await fetch(GITHUB_CONFIG.apiUrl);
        
        if (response.ok) {
            const data = await response.json();
            githubFileSha = data.sha; // Stocker le SHA pour les mises à jour
            
            const content = JSON.parse(atob(data.content));
            sharedGyms = content.arenes || [];
            
            // Sauvegarder en local comme backup
            saveSharedGyms();
            
            displayGymsOnMap();
            loadGyms();
            showNotification(`${sharedGyms.length} arènes chargées depuis GitHub`, 'success');
        } else {
            throw new Error('Fichier non trouvé sur GitHub');
        }
    } catch (error) {
        console.log('Erreur GitHub, utilisation du stockage local:', error.message);
        showNotification('Mode hors ligne - utilisation du stockage local', 'info');
        
        // Fallback sur localStorage
        loadGyms();
    }
}

// Sauvegarder les arènes sur GitHub
async function saveGymsToGitHub() {
    try {
        const dataToSave = {
            lastUpdated: new Date().toISOString(),
            version: "1.0.0",
            totalArenes: sharedGyms.length,
            arenes: sharedGyms
        };
        
        const content = btoa(JSON.stringify(dataToSave, null, 2));
        
        const requestBody = {
            message: `Mise à jour des arènes - ${sharedGyms.length} arènes`,
            content: content,
            sha: githubFileSha // Requis pour mettre à jour un fichier existant
        };
        
        const response = await fetch(GITHUB_CONFIG.apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                // Note: Pour un vrai déploiement, vous devrez ajouter un token GitHub
                // 'Authorization': 'token VOTRE_TOKEN_GITHUB'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (response.ok) {
            const result = await response.json();
            githubFileSha = result.content.sha; // Mettre à jour le SHA
            showNotification('Arènes synchronisées avec GitHub !', 'success');
        } else {
            throw new Error('Erreur de synchronisation GitHub');
        }
    } catch (error) {
        console.error('Erreur sauvegarde GitHub:', error);
        showNotification('Erreur de synchronisation - sauvegarde locale uniquement', 'error');
        
        // Fallback sur localStorage
        saveSharedGyms();
    }
}

// Initialisation de la carte Leaflet
function initializeMap() {
    // Paris par défaut
    const defaultLocation = [48.8566, 2.3522];
    
    // Créer la carte
    map = L.map('map').setView(defaultLocation, 13);
    
    // Ajouter le layer OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Gestionnaire de clic sur la carte
    map.on('click', function(e) {
        selectLocation(e.latlng);
    });
    
    // Essayer d'obtenir la géolocalisation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const userLocation = [position.coords.latitude, position.coords.longitude];
                map.setView(userLocation, 15);
                
                // Ajouter un marqueur pour la position de l'utilisateur
                L.marker(userLocation, {
                    icon: L.divIcon({
                        html: '<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',
                        className: 'user-location-marker',
                        iconSize: [16, 16],
                        iconAnchor: [8, 8]
                    })
                }).addTo(map).bindPopup('Votre position');
            },
            error => {
                console.log('Géolocalisation non disponible:', error);
            }
        );
    }
    
    // Afficher les arènes existantes
    displayGymsOnMap();
}

// Sélection d'une localisation sur la carte
function selectLocation(latlng) {
    selectedLatLng = latlng;
    
    // Supprimer l'ancien marqueur temporaire
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    
    // Vérifier s'il y a déjà une arène à cet emplacement
    const existingGym = sharedGyms.find(gym => 
        Math.abs(gym.latLng.lat - latlng.lat) < 0.0001 && 
        Math.abs(gym.latLng.lng - latlng.lng) < 0.0001
    );

    if (existingGym) {
        // Si c'est près d'une arène existante, ne rien faire - l'utilisateur peut cliquer directement sur le marqueur
        return;
    } else {
        // Nouvel emplacement - bouton de création
        tempMarker = L.marker([latlng.lat, latlng.lng], {
            icon: L.divIcon({
                html: createMarkerHTML('#6C5CE7', '+', false),
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(map);
        
        tempMarker.bindPopup(`
            <div style="text-align: center;">
                <h3 style="color: #6C5CE7; margin: 0 0 10px 0;">Nouvelle arène</h3>
                <p style="margin: 5px 0; font-size: 12px;">Créer une arène à cet emplacement</p>
                <button onclick="openCreateGymModal(${latlng.lat}, ${latlng.lng})" 
                        style="background: #6C5CE7; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    ➕ Créer une arène
                </button>
            </div>
        `).openPopup();
    }
}

// Utiliser la position actuelle
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const latlng = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setView([latlng.lat, latlng.lng], 16);
                selectLocation(latlng);
            },
            error => {
                showNotification('Impossible d\'obtenir votre position', 'error');
            }
        );
    } else {
        showNotification('Géolocalisation non supportée', 'error');
    }
}

// Créer le HTML pour les marqueurs personnalisés
function createMarkerHTML(color, icon, isOptimal) {
    const strokeColor = isOptimal ? '#00b894' : '#e17055';
    return `
        <div style="
            width: 30px; 
            height: 30px; 
            background: ${color}; 
            border: 3px solid ${strokeColor}; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
            <span style="
                transform: rotate(45deg); 
                font-size: 12px; 
                color: white;
                font-weight: bold;
            ">${icon}</span>
        </div>
    `;
}

// Initialisation simplifiée (plus de formulaires complexes)
function initializeForm() {
    // Plus besoin de gérer les formulaires, tout se fait via la carte
    console.log('Interface simplifiée - interactions via la carte');
}

// Plus besoin d'onglets
function initializeTabs() {
    // Interface simplifiée sans onglets
    console.log('Interface simplifiée - plus d\'onglets');
}

// Définir l'heure actuelle par défaut
function setCurrentTime(fieldId = 'capture-time') {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    // Plus besoin de champ spécifique car tout se fait via prompts maintenant
}

// Plus besoin de populateGymSelector car plus de formulaire de sélection
function populateGymSelector() {
    // Interface simplifiée - plus besoin de sélecteur
}

// Sauvegarder les arènes
function saveGyms() {
    localStorage.setItem('pokemonGyms', JSON.stringify(gyms));
}

// Sauvegarder les arènes partagées
function saveSharedGyms() {
    localStorage.setItem('sharedPokemonGyms', JSON.stringify(sharedGyms));
    
    // Aussi sauvegarder sur GitHub (en arrière-plan)
    saveGymsToGitHub().catch(console.error);
}

// Afficher les arènes sur la carte
function displayGymsOnMap() {
    // Effacer les anciens marqueurs d'arènes
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];

    // Afficher toutes les arènes (partagées)
    sharedGyms.forEach(gym => {
        const team = TEAMS[gym.team];
        const status = getGymStatus(gym);
        
        const marker = L.marker([gym.latLng.lat, gym.latLng.lng], {
            icon: L.divIcon({
                html: createMarkerHTML(team.color, team.icon, status.isOptimal),
                className: 'custom-marker',
                iconSize: [30, 30],
                iconAnchor: [15, 30]
            })
        }).addTo(map);

        // Popup avec aperçu et boutons d'action
        const popupContent = `
            <div style="padding: 5px; min-width: 200px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: ${team.color};">${gym.name}</h3>
                <p><strong>Équipe:</strong> ${team.name} ${team.icon}</p>
                <p><strong>Pokémon:</strong> ${gym.pokemonCount}</p>
                <p><strong>Temps:</strong> ${status.timeDefending}</p>
                <p><strong>Statut:</strong> <span style="color: ${status.isOptimal ? '#00b894' : '#e17055'};">${status.statusText}</span></p>
                <p><strong>Coins:</strong> ${status.coinsEarned}/50</p>
                <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="openUpdateGymModal('${gym.id}')" 
                            style="background: ${team.color}; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                        🔄 Actualiser
                    </button>
                    <button onclick="showGymDetails('${gym.id}')" 
                            style="background: #74b9ff; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                        ℹ️ Détails
                    </button>
                </div>
            </div>
        `;
        marker.bindPopup(popupContent);
        
        // Le clic sur le marqueur ouvre seulement le popup (pas de modal automatique)

        markers.push(marker);
    });
}

// Calculer le statut d'une arène
function getGymStatus(gym) {
    const now = new Date();
    const captureTime = new Date(gym.captureTime);
    const diffMs = now - captureTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffMinutes = diffMs / (1000 * 60);
    
    // Calcul des PokéCoins (1 coin par 10 minutes, max 50 par jour)
    const coinsEarned = Math.min(50, Math.floor(diffMinutes / 10));
    
    // Temps optimal : 8h20 = 500 minutes pour 50 coins
    const isOptimal = diffMinutes >= 500;
    
    // Formatage du temps
    let timeDefending;
    if (diffHours >= 24) {
        const days = Math.floor(diffHours / 24);
        const hours = Math.floor(diffHours % 24);
        timeDefending = `${days}j ${hours}h`;
    } else if (diffHours >= 1) {
        const hours = Math.floor(diffHours);
        const minutes = Math.floor((diffHours - hours) * 60);
        timeDefending = `${hours}h ${minutes}m`;
    } else {
        timeDefending = `${Math.floor(diffMinutes)}m`;
    }
    
    return {
        isOptimal,
        timeDefending,
        coinsEarned,
        statusText: isOptimal ? 'Optimal' : 'Récent',
        diffMinutes
    };
}

// Initialiser les filtres
function initializeFilters() {
    const teamButtons = document.querySelectorAll('[data-team]');
    const statusButtons = document.querySelectorAll('[data-status]');
    
    // Vérifier que les éléments existent
    if (teamButtons.length === 0 || statusButtons.length === 0) {
        console.warn('Éléments de filtres non trouvés dans le DOM');
        return;
    }
    
    teamButtons.forEach(button => {
        button.addEventListener('click', () => {
            teamButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterGyms();
        });
    });
    
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterGyms();
        });
    });
}

// Filtrer les arènes
function filterGyms() {
    const selectedTeamElement = document.querySelector('[data-team].active');
    const selectedStatusElement = document.querySelector('[data-status].active');
    
    // Valeurs par défaut si les éléments ne sont pas trouvés
    const selectedTeam = selectedTeamElement ? selectedTeamElement.dataset.team : 'all';
    const selectedStatus = selectedStatusElement ? selectedStatusElement.dataset.status : 'all';
    
    const filteredGyms = sharedGyms.filter(gym => {
        const teamMatch = selectedTeam === 'all' || gym.team === selectedTeam;
        const status = getGymStatus(gym);
        const statusMatch = selectedStatus === 'all' || 
                           (selectedStatus === 'optimal' && status.isOptimal) ||
                           (selectedStatus === 'recent' && !status.isOptimal);
        
        return teamMatch && statusMatch;
    });
    
    displayFilteredGyms(filteredGyms);
}

// Afficher les arènes filtrées
function displayFilteredGyms(filteredGyms) {
    const gymsList = document.getElementById('gyms-list');
    
    // Vérifier que l'élément existe
    if (!gymsList) {
        console.warn('Élément gyms-list non trouvé dans le DOM');
        return;
    }
    
    if (filteredGyms.length === 0) {
        gymsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune arène trouvée avec ces filtres.</p>';
        return;
    }
    
    gymsList.innerHTML = filteredGyms.map(gym => {
        const team = TEAMS[gym.team];
        const status = getGymStatus(gym);
        
        return `
            <div class="gym-item ${gym.team}" onclick="showGymDetails('${gym.id}')">
                <div class="gym-header">
                    <span class="gym-name">${gym.name}</span>
                    <span class="gym-team ${gym.team}">${team.name}</span>
                </div>
                <div class="gym-details">
                    <span><strong>Pokémon:</strong> ${gym.pokemonCount}</span>
                    <span><strong>Temps:</strong> ${status.timeDefending}</span>
                    <span><strong>Coins:</strong> ${status.coinsEarned}</span>
                    <span class="gym-status ${status.isOptimal ? 'optimal' : 'recent'}">${status.statusText}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Charger et afficher toutes les arènes
function loadGyms() {
    filterGyms();
}

// Afficher les détails d'une arène
window.showGymDetails = function(gymId) {
    const gym = sharedGyms.find(g => g.id === gymId);
    if (!gym) return;
    
    const team = TEAMS[gym.team];
    const status = getGymStatus(gym);
    const modal = document.getElementById('gym-modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2 style="color: ${team.color}; margin-bottom: 20px;">${gym.name}</h2>
        <div style="display: grid; gap: 15px;">
            <div><strong>Équipe:</strong> ${team.name} ${team.icon}</div>
            <div><strong>Nombre de Pokémon:</strong> ${gym.pokemonCount}</div>
            <div><strong>Heure de prise:</strong> ${new Date(gym.captureTime).toLocaleString('fr-FR')}</div>
            <div><strong>Temps de défense:</strong> ${status.timeDefending}</div>
            <div><strong>PokéCoins gagnés:</strong> ${status.coinsEarned}/50</div>
            <div><strong>Statut:</strong> <span style="color: ${status.isOptimal ? '#00b894' : '#e17055'};">${status.statusText}</span></div>
            <div><strong>Localisation:</strong> ${gym.location}</div>
            <div><strong>Dernière mise à jour:</strong> ${new Date(gym.lastUpdated).toLocaleString('fr-FR')}</div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="centerMapOnGym('${gymId}')" style="background: var(--primary-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Voir sur la carte
            </button>
            <button onclick="openUpdateGymModal('${gymId}')" style="background: var(--mystic-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Actualiser cette arène
            </button>
            <button onclick="deleteGym('${gymId}')" style="background: var(--valor-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Supprimer
            </button>
        </div>
    `;
    
    modal.style.display = 'block';
};

// Centrer la carte sur une arène
window.centerMapOnGym = function(gymId) {
    const gym = sharedGyms.find(g => g.id === gymId);
    if (gym && map) {
        map.setView([gym.latLng.lat, gym.latLng.lng], 16);
        document.getElementById('gym-modal').style.display = 'none';
    }
};

// Supprimer une arène
window.deleteGym = function(gymId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette arène ?')) {
        sharedGyms = sharedGyms.filter(g => g.id !== gymId);
        saveSharedGyms();
        displayGymsOnMap();
        loadGyms();
        document.getElementById('gym-modal').style.display = 'none';
        showNotification('Arène supprimée', 'success');
    }
};

// Création rapide d'arène depuis la carte
// Ancienne fonction supprimée - remplacée par la modal

// Initialiser la modal d'actualisation d'arène
function initializeUpdateGymModal() {
    const form = document.getElementById('update-gym-form');
    const modal = document.getElementById('update-gym-modal');
    
    // Gérer la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        updateGymFromModal();
    });
    
    // Fermer la modal en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeUpdateGymModal();
        }
    });
}

// Ouvrir la modal d'actualisation d'arène
window.openUpdateGymModal = function(gymId) {
    const gym = sharedGyms.find(g => g.id === gymId);
    if (!gym) {
        showNotification('Arène introuvable', 'error');
        return;
    }
    
    pendingUpdateGymId = gymId;
    const modal = document.getElementById('update-gym-modal');
    const team = TEAMS[gym.team];
    const status = getGymStatus(gym);
    
    // Remplir les informations actuelles
    document.getElementById('update-gym-info').innerHTML = `
        <h3><span class="team-badge ${gym.team}">${team.icon} ${gym.name}</span></h3>
        <div class="current-status">
            <div class="status-item">
                <i class="fas fa-shield-alt"></i>
                <span><strong>Équipe:</strong> ${team.name}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-users"></i>
                <span><strong>Pokémon:</strong> ${gym.pokemonCount}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-clock"></i>
                <span><strong>Depuis:</strong> ${status.timeDefending}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-coins"></i>
                <span><strong>Coins:</strong> ${status.coinsEarned}/50</span>
            </div>
        </div>
    `;
    
    // Pré-remplir le formulaire avec les valeurs actuelles
    document.getElementById('update-gym-team').value = gym.team;
    document.getElementById('update-pokemon-count').value = gym.pokemonCount;
    
    // Définir l'heure actuelle par défaut
    setCurrentTimeInUpdateModal();
    
    // Afficher la modal avec animation
    modal.style.display = 'block';
    modal.classList.add('show');
    
    // Fermer le popup de la carte
    map.closePopup();
};

// Fermer la modal d'actualisation d'arène
window.closeUpdateGymModal = function() {
    const modal = document.getElementById('update-gym-modal');
    const form = document.getElementById('update-gym-form');
    
    modal.style.display = 'none';
    modal.classList.remove('show');
    
    // Réinitialiser le formulaire
    form.reset();
    
    pendingUpdateGymId = null;
};

// Définir l'heure actuelle dans la modal d'actualisation
function setCurrentTimeInUpdateModal() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('update-capture-time').value = now.toISOString().slice(0, 16);
}

// Actualiser l'arène depuis la modal
function updateGymFromModal() {
    if (!pendingUpdateGymId) {
        showNotification('Erreur: arène non sélectionnée', 'error');
        return;
    }
    
    const gym = sharedGyms.find(g => g.id === pendingUpdateGymId);
    if (!gym) {
        showNotification('Arène introuvable', 'error');
        return;
    }
    
    const team = document.getElementById('update-gym-team').value;
    const pokemonCount = parseInt(document.getElementById('update-pokemon-count').value);
    const captureTime = new Date(document.getElementById('update-capture-time').value);
    
    // Validation
    if (!team || !TEAMS[team]) {
        showNotification('Veuillez sélectionner une équipe', 'error');
        return;
    }
    
    if (!pokemonCount || pokemonCount < 1 || pokemonCount > 6) {
        showNotification('Veuillez sélectionner un nombre de Pokémon valide', 'error');
        return;
    }
    
    // Mettre à jour l'arène
    gym.team = team;
    gym.pokemonCount = pokemonCount;
    gym.captureTime = captureTime;
    gym.lastUpdated = new Date();
    
    saveSharedGyms();
    displayGymsOnMap();
    loadGyms();
    
    // Fermer la modal
    closeUpdateGymModal();
    
    showNotification(`Arène "${gym.name}" mise à jour !`, 'success');
}

// Initialiser la modal de création d'arène
function initializeCreateGymModal() {
    const form = document.getElementById('create-gym-form');
    const modal = document.getElementById('create-gym-modal');
    
    // Gérer la soumission du formulaire
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        createGymFromModal();
    });
    
    // Fermer la modal en cliquant à l'extérieur
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCreateGymModal();
        }
    });
    
    // Définir l'heure actuelle par défaut
    setCurrentTimeInModal();
}

// Ouvrir la modal de création d'arène
window.openCreateGymModal = function(lat, lng) {
    pendingGymLocation = { lat, lng };
    const modal = document.getElementById('create-gym-modal');
    
    // Remplir les coordonnées dans un champ caché ou afficher l'adresse
    document.getElementById('create-gym-name').focus();
    
    // Afficher la modal avec animation
    modal.style.display = 'block';
    modal.classList.add('show');
    
    // Fermer le popup de la carte
    map.closePopup();
    
    // Optionnel : géocodage inverse pour l'adresse
    if (lat && lng) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data.display_name) {
                    // Extraire juste le nom de la rue/quartier pour suggestion
                    const suggestion = data.display_name.split(',')[0];
                    document.getElementById('create-gym-name').placeholder = `Ex: ${suggestion}`;
                }
            })
            .catch(() => {
                // Pas grave si ça échoue
            });
    }
};

// Fermer la modal de création d'arène
window.closeCreateGymModal = function() {
    const modal = document.getElementById('create-gym-modal');
    const form = document.getElementById('create-gym-form');
    
    modal.style.display = 'none';
    modal.classList.remove('show');
    
    // Réinitialiser le formulaire
    form.reset();
    setCurrentTimeInModal();
    
    // Supprimer le marqueur temporaire
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
    
    pendingGymLocation = null;
};

// Définir l'heure actuelle dans la modal
function setCurrentTimeInModal() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('create-capture-time').value = now.toISOString().slice(0, 16);
}

// Créer l'arène depuis la modal
function createGymFromModal() {
    if (!pendingGymLocation) {
        showNotification('Erreur: position non définie', 'error');
        return;
    }
    
    const gymName = document.getElementById('create-gym-name').value.trim();
    const team = document.getElementById('create-gym-team').value;
    const pokemonCount = parseInt(document.getElementById('create-pokemon-count').value);
    const captureTime = new Date(document.getElementById('create-capture-time').value);
    
    // Validation
    if (!gymName) {
        showNotification('Veuillez entrer un nom pour l\'arène', 'error');
        return;
    }
    
    if (!team || !TEAMS[team]) {
        showNotification('Veuillez sélectionner une équipe', 'error');
        return;
    }
    
    if (!pokemonCount || pokemonCount < 1 || pokemonCount > 6) {
        showNotification('Veuillez sélectionner un nombre de Pokémon valide', 'error');
        return;
    }
    
    // Vérifier si l'arène existe déjà
    const existingGym = sharedGyms.find(gym => 
        Math.abs(gym.latLng.lat - pendingGymLocation.lat) < 0.0001 && 
        Math.abs(gym.latLng.lng - pendingGymLocation.lng) < 0.0001
    );

    if (existingGym) {
        showNotification('Une arène existe déjà à cet emplacement !', 'error');
        return;
    }
    
    // Créer l'arène
    const formData = {
        id: 'gym_' + Date.now().toString(),
        name: gymName,
        team: team,
        pokemonCount: pokemonCount,
        captureTime: captureTime,
        location: `${pendingGymLocation.lat.toFixed(6)}, ${pendingGymLocation.lng.toFixed(6)}`,
        latLng: pendingGymLocation,
        createdAt: new Date(),
        lastUpdated: new Date()
    };
    
    sharedGyms.push(formData);
    saveSharedGyms();
    displayGymsOnMap();
    loadGyms();
    
    // Fermer la modal
    closeCreateGymModal();
    
    showNotification(`Arène "${gymName}" créée !`, 'success');
}

// Fermer la modal
document.addEventListener('click', function(e) {
    const modal = document.getElementById('gym-modal');
    if (e.target === modal || e.target.classList.contains('close')) {
        modal.style.display = 'none';
    }
});

// Afficher une notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        background: ${type === 'success' ? '#00b894' : type === 'error' ? '#e17055' : '#6C5CE7'};
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// CSS pour les animations et les marqueurs personnalisés
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .custom-marker {
        background: transparent !important;
        border: none !important;
    }
    .user-location-marker {
        background: transparent !important;
        border: none !important;
    }
`;
document.head.appendChild(style);
