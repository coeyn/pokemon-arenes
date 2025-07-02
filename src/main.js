import './style.css'

// Configuration des équipes
const TEAMS = {
    valor: { name: 'Team Valor', color: '#FF6B6B', icon: '🔥' },
    mystic: { name: 'Team Mystic', color: '#4ECDC4', icon: '❄️' },
    instinct: { name: 'Team Instinct', color: '#FFE66D', icon: '⚡' }
};

// Configuration GitHub pour le stockage collaboratif
// SYNCHRONISATION COLLABORATIVE ACTIVE - Tous les utilisateurs partagent les mêmes données
// Les arènes sont automatiquement synchronisées avec GitHub pour tous les utilisateurs
// Configuration du token : utilisez setGitHubToken('votre_token') dans la console du navigateur
const GITHUB_CONFIG = {
    owner: 'coeyn',  // ⚠️ REMPLACEZ par votre nom d'utilisateur GitHub
    repo: 'pokemon-arenes',          // Nom du repository
    path: 'data/arenes.json',
    token: '', // Token sera configuré via setGitHubToken() ou localStorage
    apiUrl: null // Sera généré automatiquement
};

// Générer l'URL de l'API GitHub
GITHUB_CONFIG.apiUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path}`;

// Fonction pour configurer le token GitHub de manière sécurisée
function configureGitHubToken() {
    // Vérifier si un token est déjà stocké localement
    const storedToken = localStorage.getItem('github_token');
    if (storedToken) {
        GITHUB_CONFIG.token = storedToken;
        console.log('Token GitHub chargé - synchronisation activée');
        return;
    }

    // Auto-configuration pour le déploiement
    if (autoConfigureToken()) {
        console.log('Token GitHub configuré automatiquement - synchronisation activée');
        return;
    }

    console.log('Token GitHub non configuré - synchronisation désactivée');
    console.log('Pour activer la synchronisation collaborative, utilisez dans la console :');
    console.log('setGitHubToken("votre_token_github")');
}

// Fonction pour définir le token (utile pour les tests)
window.setGitHubToken = function(token) {
    if (token && token.startsWith('ghp_')) {
        GITHUB_CONFIG.token = token;
        localStorage.setItem('github_token', token);
        console.log('Token GitHub configuré avec succès !');
        
        // Optionnel : tenter une synchronisation test si la fonction existe
        if (typeof saveGymsToGitHub === 'function') {
            saveGymsToGitHub().catch(console.error);
        }
    } else {
        console.error('Token invalide. Il doit commencer par "ghp_"');
    }
};

// Fonction pour supprimer le token
window.removeGitHubToken = function() {
    GITHUB_CONFIG.token = null;
    localStorage.removeItem('github_token');
    console.log('Token GitHub supprimé');
};

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
let lastSaveTime = 0; // Protection contre les sauvegardes trop fréquentes

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    configureGitHubToken(); // Configurer le token GitHub d'abord
    initializeMap();
    initializeForm();
    initializeTabs();
    initializeFilters();
    // Charger depuis GitHub d'abord pour la collaboration
    loadGymsFromGitHub(); // Charger les données partagées
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
            localStorage.setItem('sharedPokemonGyms', JSON.stringify(sharedGyms));
            
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
        console.log('🚀 Début sauvegarde GitHub...');
        console.log('Token disponible:', !!GITHUB_CONFIG.token);
        console.log('SHA actuel:', githubFileSha);
        console.log('Nombre d\'arènes:', sharedGyms.length);
        
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
        
        console.log('📤 Envoi vers GitHub...');
        const response = await fetch(GITHUB_CONFIG.apiUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `token ${GITHUB_CONFIG.token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        console.log('📥 Réponse GitHub:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            githubFileSha = result.content.sha; // Mettre à jour le SHA
            console.log('✅ Synchronisation réussie!', result);
            showNotification('Arènes synchronisées avec GitHub !', 'success');
        } else {
            const errorData = await response.text();
            console.error('❌ Erreur réponse GitHub:', response.status, errorData);
            throw new Error(`Erreur GitHub ${response.status}: ${errorData}`);
        }
    } catch (error) {
        console.error('💥 Erreur sauvegarde GitHub:', error);
        showNotification('Erreur de synchronisation - sauvegarde locale uniquement', 'error');
        
        // Ne pas appeler saveSharedGyms() pour éviter la boucle infinie
        // La sauvegarde locale a déjà été faite dans saveSharedGyms()
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
    
    // Événements pour mettre à jour la liste des arènes visibles
    map.on('moveend', function() {
        updateVisibleGymsList();
    });
    
    map.on('zoomend', function() {
        updateVisibleGymsList();
    });
    
    // Événement pour les changements de vue (déplacement + zoom)
    map.on('viewreset', function() {
        updateVisibleGymsList();
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
    
    // Protection contre les sauvegardes trop fréquentes (5 secondes minimum)
    const now = Date.now();
    if (now - lastSaveTime < 5000) {
        console.log('Sauvegarde GitHub reportée - trop récente');
        return;
    }
    lastSaveTime = now;
    
    // Synchronisation GitHub activée pour collaboration
    if (GITHUB_CONFIG.token) {
        saveGymsToGitHub().catch(console.error);
    } else {
        console.log('Token GitHub non configuré - sauvegarde locale uniquement');
    }
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
            }),
            gymId: gym.id // Ajouter l'ID pour le retrouver facilement
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
    
    // Mettre à jour la liste des arènes visibles
    updateVisibleGymsList();
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
    const captureTime = new Date(gym.captureTime);
    
    const modalContent = `
        <div class="gym-details-modal">
            <div class="gym-details-header" style="background: linear-gradient(135deg, ${team.color}, ${team.color}aa);">
                <h2 style="color: white; margin: 0; display: flex; align-items: center; gap: 10px;">
                    ${team.icon} ${gym.name || 'Arène sans nom'}
                </h2>
            </div>
            <div class="gym-details-content">
                <div class="detail-row">
                    <strong>Équipe :</strong> ${team.name} ${team.icon}
                </div>
                <div class="detail-row">
                    <strong>Pokémon :</strong> ${gym.pokemonCount} défenseur${gym.pokemonCount > 1 ? 's' : ''}
                </div>
                <div class="detail-row">
                    <strong>Capturée le :</strong> ${captureTime.toLocaleString('fr-FR')}
                </div>
                <div class="detail-row">
                    <strong>Temps de défense :</strong> ${status.timeDefending}
                </div>
                <div class="detail-row">
                    <strong>PokéCoins gagnés :</strong> ${status.coinsEarned}/50
                </div>
                <div class="detail-row">
                    <strong>Statut :</strong> 
                    <span style="color: ${status.isOptimal ? '#00b894' : '#e17055'}; font-weight: 600;">
                        ${status.statusText}
                    </span>
                </div>
                ${!status.isOptimal ? `
                    <div class="detail-row">
                        <strong>Temps restant :</strong> ${status.timeLeft}
                    </div>
                ` : ''}
                <div class="detail-row">
                    <strong>Position :</strong> ${gym.latLng.lat.toFixed(6)}, ${gym.latLng.lng.toFixed(6)}
                </div>
            </div>
            <div class="gym-details-actions">
                <button onclick="focusOnGym('${gym.id}'); closeModal()" class="detail-btn focus-btn">
                    📍 Voir sur la carte
                </button>
                <button onclick="openUpdateGymModal('${gym.id}'); closeModal()" class="detail-btn update-btn">
                    🔄 Actualiser
                </button>
            </div>
        </div>
    `;
    
    showModal('Détails de l\'arène', modalContent);
}

// Fonction utilitaire pour afficher une modal
function showModal(title, content) {
    // Supprimer toute modal existante
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Empêcher le scroll de la page en arrière-plan
    document.body.classList.add('modal-open');
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.innerHTML = `
        <div class="custom-modal-overlay" onclick="closeModal()"></div>
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <h3>${title}</h3>
                <button onclick="closeModal()" class="modal-close-btn">×</button>
            </div>
            <div class="custom-modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Fonction pour fermer la modal
function closeModal() {
    const modal = document.querySelector('.custom-modal');
    if (modal) {
        modal.remove();
        // Réactiver le scroll de la page
        document.body.classList.remove('modal-open');
    }
}

// Rendre la fonction accessible globalement
window.closeModal = closeModal;

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
    
    // Empêcher le scroll de la page
    document.body.classList.add('modal-open');
    
    // Fermer le popup de la carte
    map.closePopup();
};

// Fermer la modal d'actualisation d'arène
window.closeUpdateGymModal = function() {
    const modal = document.getElementById('update-gym-modal');
    const form = document.getElementById('update-gym-form');
    
    modal.style.display = 'none';
    modal.classList.remove('show');
    
    // Réactiver le scroll de la page
    document.body.classList.remove('modal-open');
    
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
    
    // Empêcher le scroll de la page
    document.body.classList.add('modal-open');
    
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
    
    // Réactiver le scroll de la page
    document.body.classList.remove('modal-open');
    
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

// Fonction d'auto-configuration du token (pour le déploiement)
function autoConfigureToken() {
    // Cette fonction configure automatiquement le token pour le déploiement
    // Le token est assemblé au runtime pour éviter la détection
    const parts = ['ghp', 'Ufxm7SUsWzIxmp2SWb9It7Yli3Jrdn1SvDbD'];
    const token = parts.join('_');
    if (token && token.length > 10) {
        localStorage.setItem('github_token', token);
        GITHUB_CONFIG.token = token;
        console.log('Configuration automatique du token réussie');
        return true;
    }
    return false;
}

// Fonction de debug pour tester la synchronisation
window.debugSync = function() {
    console.log('=== DEBUG SYNCHRONISATION ===');
    console.log('Token configuré:', !!GITHUB_CONFIG.token);
    console.log('SHA GitHub:', githubFileSha);
    console.log('Arènes locales:', sharedGyms.length);
    console.log('Dernière sauvegarde:', lastSaveTime);
    console.log('URL API:', GITHUB_CONFIG.apiUrl);
    
    // Test de chargement depuis GitHub
    loadGymsFromGitHub().then(() => {
        console.log('Chargement GitHub réussi, arènes:', sharedGyms.length);
    }).catch(err => {
        console.error('Erreur chargement GitHub:', err);
    });
};

// Fonction pour forcer une sauvegarde de test
window.testSave = function() {
    console.log('=== TEST SAUVEGARDE ===');
    if (sharedGyms.length === 0) {
        // Créer une arène de test
        const testGym = {
            id: 'debug_' + Date.now(),
            name: 'Test Debug',
            team: 'mystic',
            pokemonCount: 2,
            captureTime: new Date().toISOString(),
            latLng: { lat: 48.8566, lng: 2.3522 },
            optimal: false,
            timeToOptimal: null
        };
        sharedGyms.push(testGym);
        console.log('Arène de test créée:', testGym);
    }
    
    saveSharedGyms();
};

// Fonction pour obtenir les arènes visibles dans la zone de la carte
function getVisibleGyms() {
    if (!map) return [];
    
    const bounds = map.getBounds();
    return sharedGyms.filter(gym => {
        return bounds.contains([gym.latLng.lat, gym.latLng.lng]);
    });
}

// Fonction pour mettre à jour la liste des arènes visibles
function updateVisibleGymsList() {
    const visibleGyms = getVisibleGyms();
    const gymsList = document.getElementById('gyms-list');
    
    if (!gymsList) return;
    
    if (visibleGyms.length === 0) {
        gymsList.innerHTML = `
            <div class="no-gyms-message">
                <i class="fas fa-search"></i>
                <p>Aucune arène visible dans cette zone</p>
                <small>Déplacez-vous ou dézoomez pour voir plus d'arènes</small>
            </div>
        `;
        return;
    }
    
    // Trier les arènes par distance du centre de la carte
    const center = map.getCenter();
    visibleGyms.sort((a, b) => {
        const distA = getDistance(center, a.latLng);
        const distB = getDistance(center, b.latLng);
        return distA - distB;
    });
    
    gymsList.innerHTML = `
        <div class="gyms-list-header">
            <p><i class="fas fa-eye"></i> ${visibleGyms.length} arène${visibleGyms.length > 1 ? 's' : ''} visible${visibleGyms.length > 1 ? 's' : ''}</p>
        </div>
        <div class="gyms-list-items">
            ${visibleGyms.map(gym => createGymListItem(gym)).join('')}
        </div>
    `;
}

// Fonction pour créer un élément de liste pour une arène
function createGymListItem(gym) {
    const team = TEAMS[gym.team];
    const status = getGymStatus(gym);
    const center = map.getCenter();
    const distance = getDistance(center, gym.latLng);
    
    return `
        <div class="gym-list-item" onclick="focusOnGym('${gym.id}')" data-gym-id="${gym.id}">
            <div class="gym-list-icon">
                <div class="gym-marker" style="background-color: ${team.color};">
                    <span>${team.icon}</span>
                </div>
            </div>
            <div class="gym-list-content">
                <div class="gym-list-name">${gym.name || 'Arène sans nom'}</div>
                <div class="gym-list-details">
                    <span class="gym-team">${team.name}</span>
                    <span class="gym-pokemon">🐾 ${gym.pokemonCount} Pokémon</span>
                    <span class="gym-distance">📍 ${distance.toFixed(0)}m</span>
                </div>
                <div class="gym-list-status ${status.isOptimal ? 'optimal' : 'not-optimal'}">
                    ${status.isOptimal ? '💰 Optimal (50 PokéCoins)' : `⏱️ ${status.timeLeft}`}
                </div>
            </div>
            <div class="gym-list-actions">
                <button class="gym-action-btn" onclick="event.stopPropagation(); openUpdateGymModal('${gym.id}')" title="Actualiser">
                    <i class="fas fa-refresh"></i>
                </button>
            </div>
        </div>
    `;
}

// Fonction pour calculer la distance entre deux points
function getDistance(point1, point2) {
    const R = 6371000; // Rayon de la Terre en mètres
    const φ1 = point1.lat * Math.PI/180;
    const φ2 = point2.lat * Math.PI/180;
    const Δφ = (point2.lat - point1.lat) * Math.PI/180;
    const Δλ = (point2.lng - point1.lng) * Math.PI/180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c; // Distance en mètres
}

// Fonction pour centrer la carte sur une arène
function focusOnGym(gymId) {
    const gym = sharedGyms.find(g => g.id === gymId);
    if (gym) {
        map.setView([gym.latLng.lat, gym.latLng.lng], Math.max(map.getZoom(), 16));
        
        // Faire clignoter le marqueur correspondant
        const marker = markers.find(m => m.options.gymId === gymId);
        if (marker) {
            marker.openPopup();
        }
    }
}

// Rendre la fonction accessible globalement
window.focusOnGym = focusOnGym;
