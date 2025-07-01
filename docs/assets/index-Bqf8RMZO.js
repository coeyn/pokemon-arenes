(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))s(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&s(l)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();const g={valor:{name:"Team Valor",color:"#FF6B6B",icon:"🔥"},mystic:{name:"Team Mystic",color:"#4ECDC4",icon:"❄️"},instinct:{name:"Team Instinct",color:"#FFE66D",icon:"⚡"}},d={owner:"coeyn",repo:"pokemon-arenes",path:"data/arenes.json",token:null,apiUrl:null};d.apiUrl=`https://api.github.com/repos/${d.owner}/${d.repo}/contents/${d.path}`;function S(){const e=localStorage.getItem("github_token");if(e){d.token=e,r("Token GitHub chargé - synchronisation activée","success");return}}window.setGitHubToken=function(e){e&&e.startsWith("ghp_")?(d.token=e,localStorage.setItem("github_token",e),r("Token GitHub configuré avec succès !","success"),M()):r('Token invalide. Il doit commencer par "ghp_"',"error")};window.removeGitHubToken=function(){d.token=null,localStorage.removeItem("github_token"),r("Token GitHub supprimé","info")};let c,x=[];JSON.parse(localStorage.getItem("pokemonGyms"));let i=JSON.parse(localStorage.getItem("sharedPokemonGyms"))||[],u=null,m=null,k=null,E=null;document.addEventListener("DOMContentLoaded",function(){S(),O(),P(),z(),H(),B(),j(),U()});async function B(){try{r("Chargement des arènes...","info");const e=await fetch(d.apiUrl);if(e.ok){const t=await e.json();E=t.sha,i=JSON.parse(atob(t.content)).arenes||[],localStorage.setItem("sharedPokemonGyms",JSON.stringify(i)),h(),y(),r(`${i.length} arènes chargées depuis GitHub`,"success")}else throw new Error("Fichier non trouvé sur GitHub")}catch(e){console.log("Erreur GitHub, utilisation du stockage local:",e.message),r("Mode hors ligne - utilisation du stockage local","info"),y()}}async function M(){if(!d.token){console.warn("Token GitHub non configuré - sauvegarde locale uniquement");return}try{const e={lastUpdated:new Date().toISOString(),version:"1.0.0",totalArenes:i.length,arenes:i},t=btoa(JSON.stringify(e,null,2)),n={message:`Mise à jour des arènes - ${i.length} arènes`,content:t,sha:E},s=await fetch(d.apiUrl,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`token ${d.token}`,"User-Agent":"Pokemon-Arenes-Tracker"},body:JSON.stringify(n)});if(s.ok)E=(await s.json()).content.sha,r("Arènes synchronisées avec GitHub !","success");else{const o=await s.json();throw new Error(`Erreur ${s.status}: ${o.message||"Erreur de synchronisation GitHub"}`)}}catch(e){console.error("Erreur sauvegarde GitHub:",e),r(`Erreur de synchronisation: ${e.message}`,"error"),localStorage.setItem("sharedPokemonGyms",JSON.stringify(i))}}function O(){const e=[48.8566,2.3522];c=L.map("map").setView(e,13),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(c),c.on("click",function(t){D(t.latlng)}),navigator.geolocation&&navigator.geolocation.getCurrentPosition(t=>{const n=[t.coords.latitude,t.coords.longitude];c.setView(n,15),L.marker(n,{icon:L.divIcon({html:'<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',className:"user-location-marker",iconSize:[16,16],iconAnchor:[8,8]})}).addTo(c).bindPopup("Votre position")},t=>{console.log("Géolocalisation non disponible:",t)}),h()}function D(e){u&&c.removeLayer(u),!i.find(n=>Math.abs(n.latLng.lat-e.lat)<1e-4&&Math.abs(n.latLng.lng-e.lng)<1e-4)&&(u=L.marker([e.lat,e.lng],{icon:L.divIcon({html:I("#6C5CE7","+",!1),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(c),u.bindPopup(`
            <div style="text-align: center;">
                <h3 style="color: #6C5CE7; margin: 0 0 10px 0;">Nouvelle arène</h3>
                <p style="margin: 5px 0; font-size: 12px;">Créer une arène à cet emplacement</p>
                <button onclick="openCreateGymModal(${e.lat}, ${e.lng})" 
                        style="background: #6C5CE7; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    ➕ Créer une arène
                </button>
            </div>
        `).openPopup())}function I(e,t,n){return`
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
    `}function P(){console.log("Interface simplifiée - interactions via la carte")}function z(){console.log("Interface simplifiée - plus d'onglets")}function G(){localStorage.setItem("sharedPokemonGyms",JSON.stringify(i)),M().catch(console.error)}function h(){x.forEach(e=>{c.removeLayer(e)}),x=[],i.forEach(e=>{const t=g[e.team],n=v(e),s=L.marker([e.latLng.lat,e.latLng.lng],{icon:L.divIcon({html:I(t.color,t.icon,n.isOptimal),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(c),o=`
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
        `;s.bindPopup(o),x.push(s)})}function v(e){const t=new Date,n=new Date(e.captureTime),s=t-n,o=s/(1e3*60*60),a=s/(1e3*60),l=Math.min(50,Math.floor(a/10)),f=a>=500;let p;if(o>=24){const b=Math.floor(o/24),w=Math.floor(o%24);p=`${b}j ${w}h`}else if(o>=1){const b=Math.floor(o),w=Math.floor((o-b)*60);p=`${b}h ${w}m`}else p=`${Math.floor(a)}m`;return{isOptimal:f,timeDefending:p,coinsEarned:l,statusText:f?"Optimal":"Récent",diffMinutes:a}}function H(){const e=document.querySelectorAll("[data-team]"),t=document.querySelectorAll("[data-status]");if(e.length===0||t.length===0){console.warn("Éléments de filtres non trouvés dans le DOM");return}e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(s=>s.classList.remove("active")),n.classList.add("active"),$()})}),t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(s=>s.classList.remove("active")),n.classList.add("active"),$()})})}function $(){const e=document.querySelector("[data-team].active"),t=document.querySelector("[data-status].active"),n=e?e.dataset.team:"all",s=t?t.dataset.status:"all",o=i.filter(a=>{const l=n==="all"||a.team===n,f=v(a),p=s==="all"||s==="optimal"&&f.isOptimal||s==="recent"&&!f.isOptimal;return l&&p});A(o)}function A(e){const t=document.getElementById("gyms-list");if(!t){console.warn("Élément gyms-list non trouvé dans le DOM");return}if(e.length===0){t.innerHTML='<p style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune arène trouvée avec ces filtres.</p>';return}t.innerHTML=e.map(n=>{const s=g[n.team],o=v(n);return`
            <div class="gym-item ${n.team}" onclick="showGymDetails('${n.id}')">
                <div class="gym-header">
                    <span class="gym-name">${n.name}</span>
                    <span class="gym-team ${n.team}">${s.name}</span>
                </div>
                <div class="gym-details">
                    <span><strong>Pokémon:</strong> ${n.pokemonCount}</span>
                    <span><strong>Temps:</strong> ${o.timeDefending}</span>
                    <span><strong>Coins:</strong> ${o.coinsEarned}</span>
                    <span class="gym-status ${o.isOptimal?"optimal":"recent"}">${o.statusText}</span>
                </div>
            </div>
        `}).join("")}function y(){$()}window.showGymDetails=function(e){const t=i.find(l=>l.id===e);if(!t)return;const n=g[t.team],s=v(t),o=document.getElementById("gym-modal"),a=document.getElementById("modal-body");a.innerHTML=`
        <h2 style="color: ${n.color}; margin-bottom: 20px;">${t.name}</h2>
        <div style="display: grid; gap: 15px;">
            <div><strong>Équipe:</strong> ${n.name} ${n.icon}</div>
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
    `,o.style.display="block"};window.centerMapOnGym=function(e){const t=i.find(n=>n.id===e);t&&c&&(c.setView([t.latLng.lat,t.latLng.lng],16),document.getElementById("gym-modal").style.display="none")};window.deleteGym=function(e){confirm("Êtes-vous sûr de vouloir supprimer cette arène ?")&&(i=i.filter(t=>t.id!==e),G(),h(),y(),document.getElementById("gym-modal").style.display="none",r("Arène supprimée","success"))};function U(){const e=document.getElementById("update-gym-form"),t=document.getElementById("update-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),F()}),t.addEventListener("click",function(n){n.target===t&&closeUpdateGymModal()})}window.openUpdateGymModal=function(e){const t=i.find(a=>a.id===e);if(!t){r("Arène introuvable","error");return}k=e;const n=document.getElementById("update-gym-modal"),s=g[t.team],o=v(t);document.getElementById("update-gym-info").innerHTML=`
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
                <span><strong>Depuis:</strong> ${o.timeDefending}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-coins"></i>
                <span><strong>Coins:</strong> ${o.coinsEarned}/50</span>
            </div>
        </div>
    `,document.getElementById("update-gym-team").value=t.team,document.getElementById("update-pokemon-count").value=t.pokemonCount,N(),n.style.display="block",n.classList.add("show"),c.closePopup()};window.closeUpdateGymModal=function(){const e=document.getElementById("update-gym-modal"),t=document.getElementById("update-gym-form");e.style.display="none",e.classList.remove("show"),t.reset(),k=null};function N(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("update-capture-time").value=e.toISOString().slice(0,16)}function F(){if(!k){r("Erreur: arène non sélectionnée","error");return}const e=i.find(o=>o.id===k);if(!e){r("Arène introuvable","error");return}const t=document.getElementById("update-gym-team").value,n=parseInt(document.getElementById("update-pokemon-count").value),s=new Date(document.getElementById("update-capture-time").value);if(!t||!g[t]){r("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){r("Veuillez sélectionner un nombre de Pokémon valide","error");return}e.team=t,e.pokemonCount=n,e.captureTime=s,e.lastUpdated=new Date,G(),h(),y(),closeUpdateGymModal(),r(`Arène "${e.name}" mise à jour !`,"success")}function j(){const e=document.getElementById("create-gym-form"),t=document.getElementById("create-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),q()}),t.addEventListener("click",function(n){n.target===t&&closeCreateGymModal()}),T()}window.openCreateGymModal=function(e,t){m={lat:e,lng:t};const n=document.getElementById("create-gym-modal");document.getElementById("create-gym-name").focus(),n.style.display="block",n.classList.add("show"),c.closePopup(),e&&t&&fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e}&lon=${t}&addressdetails=1`).then(s=>s.json()).then(s=>{if(s.display_name){const o=s.display_name.split(",")[0];document.getElementById("create-gym-name").placeholder=`Ex: ${o}`}}).catch(()=>{})};window.closeCreateGymModal=function(){const e=document.getElementById("create-gym-modal"),t=document.getElementById("create-gym-form");e.style.display="none",e.classList.remove("show"),t.reset(),T(),u&&(c.removeLayer(u),u=null),m=null};function T(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("create-capture-time").value=e.toISOString().slice(0,16)}function q(){if(!m){r("Erreur: position non définie","error");return}const e=document.getElementById("create-gym-name").value.trim(),t=document.getElementById("create-gym-team").value,n=parseInt(document.getElementById("create-pokemon-count").value),s=new Date(document.getElementById("create-capture-time").value);if(!e){r("Veuillez entrer un nom pour l'arène","error");return}if(!t||!g[t]){r("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){r("Veuillez sélectionner un nombre de Pokémon valide","error");return}if(i.find(l=>Math.abs(l.latLng.lat-m.lat)<1e-4&&Math.abs(l.latLng.lng-m.lng)<1e-4)){r("Une arène existe déjà à cet emplacement !","error");return}const a={id:"gym_"+Date.now().toString(),name:e,team:t,pokemonCount:n,captureTime:s,location:`${m.lat.toFixed(6)}, ${m.lng.toFixed(6)}`,latLng:m,createdAt:new Date,lastUpdated:new Date};i.push(a),G(),h(),y(),closeCreateGymModal(),r(`Arène "${e}" créée !`,"success")}document.addEventListener("click",function(e){const t=document.getElementById("gym-modal");(e.target===t||e.target.classList.contains("close"))&&(t.style.display="none")});function r(e,t="info"){const n=document.createElement("div");n.style.cssText=`
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
    `,n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>n.remove(),300)},3e3)}const C=document.createElement("style");C.textContent=`
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
`;document.head.appendChild(C);
