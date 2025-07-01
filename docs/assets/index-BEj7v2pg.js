(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const c of s.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&a(c)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const p={valor:{name:"Team Valor",color:"#FF6B6B",icon:"🔥"},mystic:{name:"Team Mystic",color:"#4ECDC4",icon:"❄️"},instinct:{name:"Team Instinct",color:"#FFE66D",icon:"⚡"}};let r,w=[];JSON.parse(localStorage.getItem("pokemonGyms"));let l=JSON.parse(localStorage.getItem("sharedPokemonGyms"))||[],m=null,d=null,v=null;document.addEventListener("DOMContentLoaded",function(){configureGitHubToken(),C(),T(),B(),D(),b(),A(),S()});function C(){const e=[48.8566,2.3522];r=L.map("map").setView(e,13),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(r),r.on("click",function(t){G(t.latlng)}),navigator.geolocation&&navigator.geolocation.getCurrentPosition(t=>{const n=[t.coords.latitude,t.coords.longitude];r.setView(n,15),L.marker(n,{icon:L.divIcon({html:'<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',className:"user-location-marker",iconSize:[16,16],iconAnchor:[8,8]})}).addTo(r).bindPopup("Votre position")},t=>{console.log("Géolocalisation non disponible:",t)}),h()}function G(e){m&&r.removeLayer(m),!l.find(n=>Math.abs(n.latLng.lat-e.lat)<1e-4&&Math.abs(n.latLng.lng-e.lng)<1e-4)&&(m=L.marker([e.lat,e.lng],{icon:L.divIcon({html:$("#6C5CE7","+",!1),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(r),m.bindPopup(`
            <div style="text-align: center;">
                <h3 style="color: #6C5CE7; margin: 0 0 10px 0;">Nouvelle arène</h3>
                <p style="margin: 5px 0; font-size: 12px;">Créer une arène à cet emplacement</p>
                <button onclick="openCreateGymModal(${e.lat}, ${e.lng})" 
                        style="background: #6C5CE7; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    ➕ Créer une arène
                </button>
            </div>
        `).openPopup())}function $(e,t,n){return`
        <div style="
            width: 30px; 
            height: 30px; 
            background: ${e}; 
            border: 3px solid ${n?"#00b894":"#e17055"}; 
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
    `}function T(){console.log("Interface simplifiée - interactions via la carte")}function B(){console.log("Interface simplifiée - plus d'onglets")}function k(){localStorage.setItem("sharedPokemonGyms",JSON.stringify(l))}function h(){w.forEach(e=>{r.removeLayer(e)}),w=[],l.forEach(e=>{const t=p[e.team],n=f(e),a=L.marker([e.latLng.lat,e.latLng.lng],{icon:L.divIcon({html:$(t.color,t.icon,n.isOptimal),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(r),o=`
            <div style="padding: 5px; min-width: 200px; text-align: center;">
                <h3 style="margin: 0 0 10px 0; color: ${t.color};">${e.name}</h3>
                <p><strong>Équipe:</strong> ${t.name} ${t.icon}</p>
                <p><strong>Pokémon:</strong> ${e.pokemonCount}</p>
                <p><strong>Temps:</strong> ${n.timeDefending}</p>
                <p><strong>Statut:</strong> <span style="color: ${n.isOptimal?"#00b894":"#e17055"};">${n.statusText}</span></p>
                <p><strong>Coins:</strong> ${n.coinsEarned}/50</p>
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
        `;a.bindPopup(o),w.push(a)})}function f(e){const t=new Date,n=new Date(e.captureTime),a=t-n,o=a/(1e3*60*60),s=a/(1e3*60),c=Math.min(50,Math.floor(s/10)),g=s>=500;let u;if(o>=24){const y=Math.floor(o/24),x=Math.floor(o%24);u=`${y}j ${x}h`}else if(o>=1){const y=Math.floor(o),x=Math.floor((o-y)*60);u=`${y}h ${x}m`}else u=`${Math.floor(s)}m`;return{isOptimal:g,timeDefending:u,coinsEarned:c,statusText:g?"Optimal":"Récent",diffMinutes:s}}function D(){const e=document.querySelectorAll("[data-team]"),t=document.querySelectorAll("[data-status]");if(e.length===0||t.length===0){console.warn("Éléments de filtres non trouvés dans le DOM");return}e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(a=>a.classList.remove("active")),n.classList.add("active"),E()})}),t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(a=>a.classList.remove("active")),n.classList.add("active"),E()})})}function E(){const e=document.querySelector("[data-team].active"),t=document.querySelector("[data-status].active"),n=e?e.dataset.team:"all",a=t?t.dataset.status:"all",o=l.filter(s=>{const c=n==="all"||s.team===n,g=f(s),u=a==="all"||a==="optimal"&&g.isOptimal||a==="recent"&&!g.isOptimal;return c&&u});O(o)}function O(e){const t=document.getElementById("gyms-list");if(!t){console.warn("Élément gyms-list non trouvé dans le DOM");return}if(e.length===0){t.innerHTML='<p style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune arène trouvée avec ces filtres.</p>';return}t.innerHTML=e.map(n=>{const a=p[n.team],o=f(n);return`
            <div class="gym-item ${n.team}" onclick="showGymDetails('${n.id}')">
                <div class="gym-header">
                    <span class="gym-name">${n.name}</span>
                    <span class="gym-team ${n.team}">${a.name}</span>
                </div>
                <div class="gym-details">
                    <span><strong>Pokémon:</strong> ${n.pokemonCount}</span>
                    <span><strong>Temps:</strong> ${o.timeDefending}</span>
                    <span><strong>Coins:</strong> ${o.coinsEarned}</span>
                    <span class="gym-status ${o.isOptimal?"optimal":"recent"}">${o.statusText}</span>
                </div>
            </div>
        `}).join("")}function b(){E()}window.showGymDetails=function(e){const t=l.find(c=>c.id===e);if(!t)return;const n=p[t.team],a=f(t),o=document.getElementById("gym-modal"),s=document.getElementById("modal-body");s.innerHTML=`
        <h2 style="color: ${n.color}; margin-bottom: 20px;">${t.name}</h2>
        <div style="display: grid; gap: 15px;">
            <div><strong>Équipe:</strong> ${n.name} ${n.icon}</div>
            <div><strong>Nombre de Pokémon:</strong> ${t.pokemonCount}</div>
            <div><strong>Heure de prise:</strong> ${new Date(t.captureTime).toLocaleString("fr-FR")}</div>
            <div><strong>Temps de défense:</strong> ${a.timeDefending}</div>
            <div><strong>PokéCoins gagnés:</strong> ${a.coinsEarned}/50</div>
            <div><strong>Statut:</strong> <span style="color: ${a.isOptimal?"#00b894":"#e17055"};">${a.statusText}</span></div>
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
    `,o.style.display="block"};window.centerMapOnGym=function(e){const t=l.find(n=>n.id===e);t&&r&&(r.setView([t.latLng.lat,t.latLng.lng],16),document.getElementById("gym-modal").style.display="none")};window.deleteGym=function(e){confirm("Êtes-vous sûr de vouloir supprimer cette arène ?")&&(l=l.filter(t=>t.id!==e),k(),h(),b(),document.getElementById("gym-modal").style.display="none",i("Arène supprimée","success"))};function S(){const e=document.getElementById("update-gym-form"),t=document.getElementById("update-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),P()}),t.addEventListener("click",function(n){n.target===t&&closeUpdateGymModal()})}window.openUpdateGymModal=function(e){const t=l.find(s=>s.id===e);if(!t){i("Arène introuvable","error");return}v=e;const n=document.getElementById("update-gym-modal"),a=p[t.team],o=f(t);document.getElementById("update-gym-info").innerHTML=`
        <h3><span class="team-badge ${t.team}">${a.icon} ${t.name}</span></h3>
        <div class="current-status">
            <div class="status-item">
                <i class="fas fa-shield-alt"></i>
                <span><strong>Équipe:</strong> ${a.name}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-users"></i>
                <span><strong>Pokémon:</strong> ${t.pokemonCount}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-clock"></i>
                <span><strong>Depuis:</strong> ${o.timeDefending}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-coins"></i>
                <span><strong>Coins:</strong> ${o.coinsEarned}/50</span>
            </div>
        </div>
    `,document.getElementById("update-gym-team").value=t.team,document.getElementById("update-pokemon-count").value=t.pokemonCount,z(),n.style.display="block",n.classList.add("show"),r.closePopup()};window.closeUpdateGymModal=function(){const e=document.getElementById("update-gym-modal"),t=document.getElementById("update-gym-form");e.style.display="none",e.classList.remove("show"),t.reset(),v=null};function z(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("update-capture-time").value=e.toISOString().slice(0,16)}function P(){if(!v){i("Erreur: arène non sélectionnée","error");return}const e=l.find(o=>o.id===v);if(!e){i("Arène introuvable","error");return}const t=document.getElementById("update-gym-team").value,n=parseInt(document.getElementById("update-pokemon-count").value),a=new Date(document.getElementById("update-capture-time").value);if(!t||!p[t]){i("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){i("Veuillez sélectionner un nombre de Pokémon valide","error");return}e.team=t,e.pokemonCount=n,e.captureTime=a,e.lastUpdated=new Date,k(),h(),b(),closeUpdateGymModal(),i(`Arène "${e.name}" mise à jour !`,"success")}function A(){const e=document.getElementById("create-gym-form"),t=document.getElementById("create-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),F()}),t.addEventListener("click",function(n){n.target===t&&closeCreateGymModal()}),M()}window.openCreateGymModal=function(e,t){d={lat:e,lng:t};const n=document.getElementById("create-gym-modal");document.getElementById("create-gym-name").focus(),n.style.display="block",n.classList.add("show"),r.closePopup(),e&&t&&fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e}&lon=${t}&addressdetails=1`).then(a=>a.json()).then(a=>{if(a.display_name){const o=a.display_name.split(",")[0];document.getElementById("create-gym-name").placeholder=`Ex: ${o}`}}).catch(()=>{})};window.closeCreateGymModal=function(){const e=document.getElementById("create-gym-modal"),t=document.getElementById("create-gym-form");e.style.display="none",e.classList.remove("show"),t.reset(),M(),m&&(r.removeLayer(m),m=null),d=null};function M(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("create-capture-time").value=e.toISOString().slice(0,16)}function F(){if(!d){i("Erreur: position non définie","error");return}const e=document.getElementById("create-gym-name").value.trim(),t=document.getElementById("create-gym-team").value,n=parseInt(document.getElementById("create-pokemon-count").value),a=new Date(document.getElementById("create-capture-time").value);if(!e){i("Veuillez entrer un nom pour l'arène","error");return}if(!t||!p[t]){i("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){i("Veuillez sélectionner un nombre de Pokémon valide","error");return}if(l.find(c=>Math.abs(c.latLng.lat-d.lat)<1e-4&&Math.abs(c.latLng.lng-d.lng)<1e-4)){i("Une arène existe déjà à cet emplacement !","error");return}const s={id:"gym_"+Date.now().toString(),name:e,team:t,pokemonCount:n,captureTime:a,location:`${d.lat.toFixed(6)}, ${d.lng.toFixed(6)}`,latLng:d,createdAt:new Date,lastUpdated:new Date};l.push(s),k(),h(),b(),closeCreateGymModal(),i(`Arène "${e}" créée !`,"success")}document.addEventListener("click",function(e){const t=document.getElementById("gym-modal");(e.target===t||e.target.classList.contains("close"))&&(t.style.display="none")});function i(e,t="info"){const n=document.createElement("div");n.style.cssText=`
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
    `,n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>n.remove(),300)},3e3)}const I=document.createElement("style");I.textContent=`
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
`;document.head.appendChild(I);
