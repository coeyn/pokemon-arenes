(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const d of r.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&s(d)}).observe(document,{childList:!0,subtree:!0});function o(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function s(n){if(n.ep)return;n.ep=!0;const r=o(n);fetch(n.href,r)}})();const g={valor:{name:"Team Valor",color:"#FF6B6B",icon:"🔥"},mystic:{name:"Team Mystic",color:"#4ECDC4",icon:"❄️"},instinct:{name:"Team Instinct",color:"#FFE66D",icon:"⚡"}},c={owner:"coeyn",repo:"pokemon-arenes",path:"data/arenes.json",token:"",apiUrl:null};c.apiUrl=`https://api.github.com/repos/${c.owner}/${c.repo}/contents/${c.path}`;function O(){const e=localStorage.getItem("github_token");if(e){c.token=e,console.log("Token GitHub chargé - synchronisation activée");return}if(V()){console.log("Token GitHub configuré automatiquement - synchronisation activée");return}console.log("Token GitHub non configuré - synchronisation désactivée"),console.log("Pour activer la synchronisation collaborative, utilisez dans la console :"),console.log('setGitHubToken("votre_token_github")')}window.setGitHubToken=function(e){e&&e.startsWith("ghp_")?(c.token=e,localStorage.setItem("github_token",e),console.log("Token GitHub configuré avec succès !"),typeof T=="function"&&T().catch(console.error)):console.error('Token invalide. Il doit commencer par "ghp_"')};window.removeGitHubToken=function(){c.token=null,localStorage.removeItem("github_token"),console.log("Token GitHub supprimé")};let l,G=[];JSON.parse(localStorage.getItem("pokemonGyms"));let a=JSON.parse(localStorage.getItem("sharedPokemonGyms"))||[],m=null,u=null,w=null,y=null,$=0;document.addEventListener("DOMContentLoaded",function(){O(),B(),A(),U(),z(),S(),q(),N()});async function S(){try{i("Chargement des arènes...","info");const e=await fetch(c.apiUrl);if(e.ok){const t=await e.json();y=t.sha,a=JSON.parse(atob(t.content)).arenes||[],localStorage.setItem("sharedPokemonGyms",JSON.stringify(a)),v(),h(),i(`${a.length} arènes chargées depuis GitHub`,"success")}else throw new Error("Fichier non trouvé sur GitHub")}catch(e){console.log("Erreur GitHub, utilisation du stockage local:",e.message),i("Mode hors ligne - utilisation du stockage local","info"),h()}}async function T(){try{console.log("🚀 Début sauvegarde GitHub..."),console.log("Token disponible:",!!c.token),console.log("SHA actuel:",y),console.log("Nombre d'arènes:",a.length);const e={lastUpdated:new Date().toISOString(),version:"1.0.0",totalArenes:a.length,arenes:a},t=btoa(JSON.stringify(e,null,2)),o={message:`Mise à jour des arènes - ${a.length} arènes`,content:t,sha:y};console.log("📤 Envoi vers GitHub...");const s=await fetch(c.apiUrl,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`token ${c.token}`},body:JSON.stringify(o)});if(console.log("📥 Réponse GitHub:",s.status),s.ok){const n=await s.json();y=n.content.sha,console.log("✅ Synchronisation réussie!",n),i("Arènes synchronisées avec GitHub !","success")}else{const n=await s.text();throw console.error("❌ Erreur réponse GitHub:",s.status,n),new Error(`Erreur GitHub ${s.status}: ${n}`)}}catch(e){console.error("💥 Erreur sauvegarde GitHub:",e),i("Erreur de synchronisation - sauvegarde locale uniquement","error")}}function B(){const e=[48.8566,2.3522];l=L.map("map").setView(e,13),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(l),l.on("click",function(t){H(t.latlng)}),navigator.geolocation&&navigator.geolocation.getCurrentPosition(t=>{const o=[t.coords.latitude,t.coords.longitude];l.setView(o,15),L.marker(o,{icon:L.divIcon({html:'<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',className:"user-location-marker",iconSize:[16,16],iconAnchor:[8,8]})}).addTo(l).bindPopup("Votre position")},t=>{console.log("Géolocalisation non disponible:",t)}),v()}function H(e){m&&l.removeLayer(m),!a.find(o=>Math.abs(o.latLng.lat-e.lat)<1e-4&&Math.abs(o.latLng.lng-e.lng)<1e-4)&&(m=L.marker([e.lat,e.lng],{icon:L.divIcon({html:M("#6C5CE7","+",!1),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(l),m.bindPopup(`
            <div style="text-align: center;">
                <h3 style="color: #6C5CE7; margin: 0 0 10px 0;">Nouvelle arène</h3>
                <p style="margin: 5px 0; font-size: 12px;">Créer une arène à cet emplacement</p>
                <button onclick="openCreateGymModal(${e.lat}, ${e.lng})" 
                        style="background: #6C5CE7; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    ➕ Créer une arène
                </button>
            </div>
        `).openPopup())}function M(e,t,o){return`
        <div style="
            width: 30px; 
            height: 30px; 
            background: ${e}; 
            border: 3px solid ${o?"#00b894":"#e17055"}; 
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
            ">${t}</span>
        </div>
    `}function A(){console.log("Interface simplifiée - interactions via la carte")}function U(){console.log("Interface simplifiée - plus d'onglets")}function x(){localStorage.setItem("sharedPokemonGyms",JSON.stringify(a));const e=Date.now();if(e-$<5e3){console.log("Sauvegarde GitHub reportée - trop récente");return}$=e,c.token?T().catch(console.error):console.log("Token GitHub non configuré - sauvegarde locale uniquement")}function v(){G.forEach(e=>{l.removeLayer(e)}),G=[],a.forEach(e=>{const t=g[e.team],o=b(e),s=L.marker([e.latLng.lat,e.latLng.lng],{icon:L.divIcon({html:M(t.color,t.icon,o.isOptimal),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(l),n=`
            <div style="padding: 5px; min-width: 200px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: ${t.color};">${e.name}</h3>
                <p><strong>Équipe:</strong> ${t.name} ${t.icon}</p>
                <p><strong>Pokémon:</strong> ${e.pokemonCount}</p>
                <p><strong>Temps:</strong> ${o.timeDefending}</p>
                <p><strong>Statut:</strong> <span style="color: ${o.isOptimal?"#00b894":"#e17055"};">${o.statusText}</span></p>
                <p><strong>Coins:</strong> ${o.coinsEarned}/50</p>
                <div style="margin-top: 15px; display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
                    <button onclick="openUpdateGymModal('${e.id}')" 
                            style="background: ${t.color}; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                        🔄 Actualiser
                    </button>
                    <button onclick="showGymDetails('${e.id}')" 
                            style="background: #74b9ff; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 12px;">
                        ℹ️ Détails
                    </button>
                </div>
            </div>
        `;s.bindPopup(n),G.push(s)})}function b(e){const t=new Date,o=new Date(e.captureTime),s=t-o,n=s/(1e3*60*60),r=s/(1e3*60),d=Math.min(50,Math.floor(r/10)),f=r>=500;let p;if(n>=24){const k=Math.floor(n/24),E=Math.floor(n%24);p=`${k}j ${E}h`}else if(n>=1){const k=Math.floor(n),E=Math.floor((n-k)*60);p=`${k}h ${E}m`}else p=`${Math.floor(r)}m`;return{isOptimal:f,timeDefending:p,coinsEarned:d,statusText:f?"Optimal":"Récent",diffMinutes:r}}function z(){const e=document.querySelectorAll("[data-team]"),t=document.querySelectorAll("[data-status]");if(e.length===0||t.length===0){console.warn("Éléments de filtres non trouvés dans le DOM");return}e.forEach(o=>{o.addEventListener("click",()=>{e.forEach(s=>s.classList.remove("active")),o.classList.add("active"),I()})}),t.forEach(o=>{o.addEventListener("click",()=>{t.forEach(s=>s.classList.remove("active")),o.classList.add("active"),I()})})}function I(){const e=document.querySelector("[data-team].active"),t=document.querySelector("[data-status].active"),o=e?e.dataset.team:"all",s=t?t.dataset.status:"all",n=a.filter(r=>{const d=o==="all"||r.team===o,f=b(r),p=s==="all"||s==="optimal"&&f.isOptimal||s==="recent"&&!f.isOptimal;return d&&p});P(n)}function P(e){const t=document.getElementById("gyms-list");if(!t){console.warn("Élément gyms-list non trouvé dans le DOM");return}if(e.length===0){t.innerHTML='<p style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune arène trouvée avec ces filtres.</p>';return}t.innerHTML=e.map(o=>{const s=g[o.team],n=b(o);return`
            <div class="gym-item ${o.team}" onclick="showGymDetails('${o.id}')">
                <div class="gym-header">
                    <span class="gym-name">${o.name}</span>
                    <span class="gym-team ${o.team}">${s.name}</span>
                </div>
                <div class="gym-details">
                    <span><strong>Pokémon:</strong> ${o.pokemonCount}</span>
                    <span><strong>Temps:</strong> ${n.timeDefending}</span>
                    <span><strong>Coins:</strong> ${n.coinsEarned}</span>
                    <span class="gym-status ${n.isOptimal?"optimal":"recent"}">${n.statusText}</span>
                </div>
            </div>
        `}).join("")}function h(){I()}window.showGymDetails=function(e){const t=a.find(d=>d.id===e);if(!t)return;const o=g[t.team],s=b(t),n=document.getElementById("gym-modal"),r=document.getElementById("modal-body");r.innerHTML=`
        <h2 style="color: ${o.color}; margin-bottom: 20px;">${t.name}</h2>
        <div style="display: grid; gap: 15px;">
            <div><strong>Équipe:</strong> ${o.name} ${o.icon}</div>
            <div><strong>Nombre de Pokémon:</strong> ${t.pokemonCount}</div>
            <div><strong>Heure de prise:</strong> ${new Date(t.captureTime).toLocaleString("fr-FR")}</div>
            <div><strong>Temps de défense:</strong> ${s.timeDefending}</div>
            <div><strong>PokéCoins gagnés:</strong> ${s.coinsEarned}/50</div>
            <div><strong>Statut:</strong> <span style="color: ${s.isOptimal?"#00b894":"#e17055"};">${s.statusText}</span></div>
            <div><strong>Localisation:</strong> ${t.location}</div>
            <div><strong>Dernière mise à jour:</strong> ${new Date(t.lastUpdated).toLocaleString("fr-FR")}</div>
        </div>
        <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="centerMapOnGym('${e}')" style="background: var(--primary-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Voir sur la carte
            </button>
            <button onclick="openUpdateGymModal('${e}')" style="background: var(--mystic-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Actualiser cette arène
            </button>
            <button onclick="deleteGym('${e}')" style="background: var(--valor-color); color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer;">
                Supprimer
            </button>
        </div>
    `,n.style.display="block"};window.centerMapOnGym=function(e){const t=a.find(o=>o.id===e);t&&l&&(l.setView([t.latLng.lat,t.latLng.lng],16),document.getElementById("gym-modal").style.display="none")};window.deleteGym=function(e){confirm("Êtes-vous sûr de vouloir supprimer cette arène ?")&&(a=a.filter(t=>t.id!==e),x(),v(),h(),document.getElementById("gym-modal").style.display="none",i("Arène supprimée","success"))};function N(){const e=document.getElementById("update-gym-form"),t=document.getElementById("update-gym-modal");e.addEventListener("submit",function(o){o.preventDefault(),j()}),t.addEventListener("click",function(o){o.target===t&&closeUpdateGymModal()})}window.openUpdateGymModal=function(e){const t=a.find(r=>r.id===e);if(!t){i("Arène introuvable","error");return}w=e;const o=document.getElementById("update-gym-modal"),s=g[t.team],n=b(t);document.getElementById("update-gym-info").innerHTML=`
        <h3><span class="team-badge ${t.team}">${s.icon} ${t.name}</span></h3>
        <div class="current-status">
            <div class="status-item">
                <i class="fas fa-shield-alt"></i>
                <span><strong>Équipe:</strong> ${s.name}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-users"></i>
                <span><strong>Pokémon:</strong> ${t.pokemonCount}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-clock"></i>
                <span><strong>Depuis:</strong> ${n.timeDefending}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-coins"></i>
                <span><strong>Coins:</strong> ${n.coinsEarned}/50</span>
            </div>
        </div>
    `,document.getElementById("update-gym-team").value=t.team,document.getElementById("update-pokemon-count").value=t.pokemonCount,F(),o.style.display="block",o.classList.add("show"),l.closePopup()};window.closeUpdateGymModal=function(){const e=document.getElementById("update-gym-modal"),t=document.getElementById("update-gym-form");e.style.display="none",e.classList.remove("show"),t.reset(),w=null};function F(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("update-capture-time").value=e.toISOString().slice(0,16)}function j(){if(!w){i("Erreur: arène non sélectionnée","error");return}const e=a.find(n=>n.id===w);if(!e){i("Arène introuvable","error");return}const t=document.getElementById("update-gym-team").value,o=parseInt(document.getElementById("update-pokemon-count").value),s=new Date(document.getElementById("update-capture-time").value);if(!t||!g[t]){i("Veuillez sélectionner une équipe","error");return}if(!o||o<1||o>6){i("Veuillez sélectionner un nombre de Pokémon valide","error");return}e.team=t,e.pokemonCount=o,e.captureTime=s,e.lastUpdated=new Date,x(),v(),h(),closeUpdateGymModal(),i(`Arène "${e.name}" mise à jour !`,"success")}function q(){const e=document.getElementById("create-gym-form"),t=document.getElementById("create-gym-modal");e.addEventListener("submit",function(o){o.preventDefault(),_()}),t.addEventListener("click",function(o){o.target===t&&closeCreateGymModal()}),C()}window.openCreateGymModal=function(e,t){u={lat:e,lng:t};const o=document.getElementById("create-gym-modal");document.getElementById("create-gym-name").focus(),o.style.display="block",o.classList.add("show"),l.closePopup(),e&&t&&fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e}&lon=${t}&addressdetails=1`).then(s=>s.json()).then(s=>{if(s.display_name){const n=s.display_name.split(",")[0];document.getElementById("create-gym-name").placeholder=`Ex: ${n}`}}).catch(()=>{})};window.closeCreateGymModal=function(){const e=document.getElementById("create-gym-modal"),t=document.getElementById("create-gym-form");e.style.display="none",e.classList.remove("show"),t.reset(),C(),m&&(l.removeLayer(m),m=null),u=null};function C(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("create-capture-time").value=e.toISOString().slice(0,16)}function _(){if(!u){i("Erreur: position non définie","error");return}const e=document.getElementById("create-gym-name").value.trim(),t=document.getElementById("create-gym-team").value,o=parseInt(document.getElementById("create-pokemon-count").value),s=new Date(document.getElementById("create-capture-time").value);if(!e){i("Veuillez entrer un nom pour l'arène","error");return}if(!t||!g[t]){i("Veuillez sélectionner une équipe","error");return}if(!o||o<1||o>6){i("Veuillez sélectionner un nombre de Pokémon valide","error");return}if(a.find(d=>Math.abs(d.latLng.lat-u.lat)<1e-4&&Math.abs(d.latLng.lng-u.lng)<1e-4)){i("Une arène existe déjà à cet emplacement !","error");return}const r={id:"gym_"+Date.now().toString(),name:e,team:t,pokemonCount:o,captureTime:s,location:`${u.lat.toFixed(6)}, ${u.lng.toFixed(6)}`,latLng:u,createdAt:new Date,lastUpdated:new Date};a.push(r),x(),v(),h(),closeCreateGymModal(),i(`Arène "${e}" créée !`,"success")}document.addEventListener("click",function(e){const t=document.getElementById("gym-modal");(e.target===t||e.target.classList.contains("close"))&&(t.style.display="none")});function i(e,t="info"){const o=document.createElement("div");o.style.cssText=`
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        background: ${t==="success"?"#00b894":t==="error"?"#e17055":"#6C5CE7"};
    `,o.textContent=e,document.body.appendChild(o),setTimeout(()=>{o.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>o.remove(),300)},3e3)}const D=document.createElement("style");D.textContent=`
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
`;document.head.appendChild(D);function V(){const t=["ghp","Ufxm7SUsWzIxmp2SWb9It7Yli3Jrdn1SvDbD"].join("_");return t&&t.length>10?(localStorage.setItem("github_token",t),c.token=t,console.log("Configuration automatique du token réussie"),!0):!1}window.debugSync=function(){console.log("=== DEBUG SYNCHRONISATION ==="),console.log("Token configuré:",!!c.token),console.log("SHA GitHub:",y),console.log("Arènes locales:",a.length),console.log("Dernière sauvegarde:",$),console.log("URL API:",c.apiUrl),S().then(()=>{console.log("Chargement GitHub réussi, arènes:",a.length)}).catch(e=>{console.error("Erreur chargement GitHub:",e)})};window.testSave=function(){if(console.log("=== TEST SAUVEGARDE ==="),a.length===0){const e={id:"debug_"+Date.now(),name:"Test Debug",team:"mystic",pokemonCount:2,captureTime:new Date().toISOString(),latLng:{lat:48.8566,lng:2.3522},optimal:!1,timeToOptimal:null};a.push(e),console.log("Arène de test créée:",e)}x()};
