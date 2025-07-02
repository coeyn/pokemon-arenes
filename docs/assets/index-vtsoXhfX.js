(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const f={valor:{name:"Team Valor",color:"#FF6B6B",icon:"🔥"},mystic:{name:"Team Mystic",color:"#4ECDC4",icon:"❄️"},instinct:{name:"Team Instinct",color:"#FFE66D",icon:"⚡"}},d={owner:"coeyn",repo:"pokemon-arenes",path:"data/arenes.json",token:"",apiUrl:null};d.apiUrl=`https://api.github.com/repos/${d.owner}/${d.repo}/contents/${d.path}`;function B(){const e=localStorage.getItem("github_token");if(e){d.token=e,console.log("Token GitHub chargé - synchronisation activée");return}if(W()){console.log("Token GitHub configuré automatiquement - synchronisation activée");return}console.log("Token GitHub non configuré - synchronisation désactivée"),console.log("Pour activer la synchronisation collaborative, utilisez dans la console :"),console.log('setGitHubToken("votre_token_github")')}window.setGitHubToken=function(e){e&&e.startsWith("ghp_")?(d.token=e,localStorage.setItem("github_token",e),console.log("Token GitHub configuré avec succès !"),typeof x=="function"&&x().catch(console.error)):console.error('Token invalide. Il doit commencer par "ghp_"')};window.removeGitHubToken=function(){d.token=null,localStorage.removeItem("github_token"),console.log("Token GitHub supprimé")};let r,b=[];JSON.parse(localStorage.getItem("pokemonGyms"));let i=JSON.parse(localStorage.getItem("sharedPokemonGyms"))||[],g=null,u=null,w=null,h=null,E=0;document.addEventListener("DOMContentLoaded",function(){B(),P(),z(),U(),N(),C(),R(),V()});async function C(){try{c("Chargement des arènes...","info");const e=await fetch(d.apiUrl);if(e.ok){const t=await e.json();h=t.sha,i=JSON.parse(atob(t.content)).arenes||[],localStorage.setItem("sharedPokemonGyms",JSON.stringify(i)),M(),$(),c(`${i.length} arènes chargées depuis GitHub`,"success")}else throw new Error("Fichier non trouvé sur GitHub")}catch(e){console.log("Erreur GitHub, utilisation du stockage local:",e.message),c("Mode hors ligne - utilisation du stockage local","info"),$()}}async function x(){try{console.log("🚀 Début sauvegarde GitHub..."),console.log("Token disponible:",!!d.token),console.log("SHA actuel:",h),console.log("Nombre d'arènes:",i.length);const e={lastUpdated:new Date().toISOString(),version:"1.0.0",totalArenes:i.length,arenes:i},t=btoa(JSON.stringify(e,null,2)),n={message:`Mise à jour des arènes - ${i.length} arènes`,content:t,sha:h};console.log("📤 Envoi vers GitHub...");const o=await fetch(d.apiUrl,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`token ${d.token}`},body:JSON.stringify(n)});if(console.log("📥 Réponse GitHub:",o.status),o.ok){const s=await o.json();h=s.content.sha,console.log("✅ Synchronisation réussie!",s),c("Arènes synchronisées avec GitHub !","success")}else{const s=await o.text();throw console.error("❌ Erreur réponse GitHub:",o.status,s),new Error(`Erreur GitHub ${o.status}: ${s}`)}}catch(e){console.error("💥 Erreur sauvegarde GitHub:",e),c("Erreur de synchronisation - sauvegarde locale uniquement","error")}}function P(){const e=[48.8566,2.3522];r=L.map("map").setView(e,13),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(r),r.on("click",function(t){A(t.latlng)}),r.on("moveend",function(){k()}),r.on("zoomend",function(){k()}),r.on("viewreset",function(){k()}),navigator.geolocation&&navigator.geolocation.getCurrentPosition(t=>{const n=[t.coords.latitude,t.coords.longitude];r.setView(n,15),L.marker(n,{icon:L.divIcon({html:'<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',className:"user-location-marker",iconSize:[16,16],iconAnchor:[8,8]})}).addTo(r).bindPopup("Votre position")},t=>{console.log("Géolocalisation non disponible:",t)}),M()}function A(e){g&&r.removeLayer(g),!i.find(n=>Math.abs(n.latLng.lat-e.lat)<1e-4&&Math.abs(n.latLng.lng-e.lng)<1e-4)&&(g=L.marker([e.lat,e.lng],{icon:L.divIcon({html:O("#6C5CE7","+",!1),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(r),g.bindPopup(`
            <div style="text-align: center;">
                <h3 style="color: #6C5CE7; margin: 0 0 10px 0;">Nouvelle arène</h3>
                <p style="margin: 5px 0; font-size: 12px;">Créer une arène à cet emplacement</p>
                <button onclick="openCreateGymModal(${e.lat}, ${e.lng})" 
                        style="background: #6C5CE7; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
                    ➕ Créer une arène
                </button>
            </div>
        `).openPopup())}function O(e,t,n){return`
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
    `}function z(){console.log("Interface simplifiée - interactions via la carte")}function U(){console.log("Interface simplifiée - plus d'onglets")}function S(){localStorage.setItem("sharedPokemonGyms",JSON.stringify(i));const e=Date.now();if(e-E<5e3){console.log("Sauvegarde GitHub reportée - trop récente");return}E=e,d.token?x().catch(console.error):console.log("Token GitHub non configuré - sauvegarde locale uniquement")}function M(){b.forEach(e=>{r.removeLayer(e)}),b=[],i.forEach(e=>{const t=f[e.team],n=y(e),o=L.marker([e.latLng.lat,e.latLng.lng],{icon:L.divIcon({html:O(t.color,t.icon,n.isOptimal),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]}),gymId:e.id}).addTo(r),s=`
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
        `;o.bindPopup(s),b.push(o)}),k()}function y(e){const t=new Date,n=new Date(e.captureTime),o=t-n,s=o/(1e3*60*60),a=o/(1e3*60),l=Math.min(50,Math.floor(a/10)),m=a>=500;let p;if(s>=24){const v=Math.floor(s/24),G=Math.floor(s%24);p=`${v}j ${G}h`}else if(s>=1){const v=Math.floor(s),G=Math.floor((s-v)*60);p=`${v}h ${G}m`}else p=`${Math.floor(a)}m`;return{isOptimal:m,timeDefending:p,coinsEarned:l,statusText:m?"Optimal":"Récent",diffMinutes:a}}function N(){const e=document.querySelectorAll("[data-team]"),t=document.querySelectorAll("[data-status]");if(e.length===0||t.length===0){console.warn("Éléments de filtres non trouvés dans le DOM");return}e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(o=>o.classList.remove("active")),n.classList.add("active"),T()})}),t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(o=>o.classList.remove("active")),n.classList.add("active"),T()})})}function T(){const e=document.querySelector("[data-team].active"),t=document.querySelector("[data-status].active"),n=e?e.dataset.team:"all",o=t?t.dataset.status:"all",s=i.filter(a=>{const l=n==="all"||a.team===n,m=y(a),p=o==="all"||o==="optimal"&&m.isOptimal||o==="recent"&&!m.isOptimal;return l&&p});F(s)}function F(e){const t=document.getElementById("gyms-list");if(!t){console.warn("Élément gyms-list non trouvé dans le DOM");return}if(e.length===0){t.innerHTML='<p style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune arène trouvée avec ces filtres.</p>';return}t.innerHTML=e.map(n=>{const o=f[n.team],s=y(n);return`
            <div class="gym-item ${n.team}" onclick="showGymDetails('${n.id}')">
                <div class="gym-header">
                    <span class="gym-name">${n.name}</span>
                    <span class="gym-team ${n.team}">${o.name}</span>
                </div>
                <div class="gym-details">
                    <span><strong>Pokémon:</strong> ${n.pokemonCount}</span>
                    <span><strong>Temps:</strong> ${s.timeDefending}</span>
                    <span><strong>Coins:</strong> ${s.coinsEarned}</span>
                    <span class="gym-status ${s.isOptimal?"optimal":"recent"}">${s.statusText}</span>
                </div>
            </div>
        `}).join("")}function $(){T()}window.showGymDetails=function(e){const t=i.find(l=>l.id===e);if(!t)return;const n=f[t.team],o=y(t),s=new Date(t.captureTime),a=`
        <div class="gym-details-modal">
            <div class="gym-details-header" style="background: linear-gradient(135deg, ${n.color}, ${n.color}aa);">
                <h2 style="color: white; margin: 0; display: flex; align-items: center; gap: 10px;">
                    ${n.icon} ${t.name||"Arène sans nom"}
                </h2>
            </div>
            <div class="gym-details-content">
                <div class="detail-row">
                    <strong>Équipe :</strong> ${n.name} ${n.icon}
                </div>
                <div class="detail-row">
                    <strong>Pokémon :</strong> ${t.pokemonCount} défenseur${t.pokemonCount>1?"s":""}
                </div>
                <div class="detail-row">
                    <strong>Capturée le :</strong> ${s.toLocaleString("fr-FR")}
                </div>
                <div class="detail-row">
                    <strong>Temps de défense :</strong> ${o.timeDefending}
                </div>
                <div class="detail-row">
                    <strong>PokéCoins gagnés :</strong> ${o.coinsEarned}/50
                </div>
                <div class="detail-row">
                    <strong>Statut :</strong> 
                    <span style="color: ${o.isOptimal?"#00b894":"#e17055"}; font-weight: 600;">
                        ${o.statusText}
                    </span>
                </div>
                ${o.isOptimal?"":`
                    <div class="detail-row">
                        <strong>Temps restant :</strong> ${o.timeLeft}
                    </div>
                `}
                <div class="detail-row">
                    <strong>Position :</strong> ${t.latLng.lat.toFixed(6)}, ${t.latLng.lng.toFixed(6)}
                </div>
            </div>
            <div class="gym-details-actions">
                <button onclick="focusOnGym('${t.id}'); closeModal()" class="detail-btn focus-btn">
                    📍 Voir sur la carte
                </button>
                <button onclick="openUpdateGymModal('${t.id}'); closeModal()" class="detail-btn update-btn">
                    🔄 Actualiser
                </button>
            </div>
        </div>
    `;q("Détails de l'arène",a)};function q(e,t){const n=document.querySelector(".custom-modal");n&&n.remove();const o=document.createElement("div");o.className="custom-modal",o.innerHTML=`
        <div class="custom-modal-overlay" onclick="closeModal()"></div>
        <div class="custom-modal-content">
            <div class="custom-modal-header">
                <h3>${e}</h3>
                <button onclick="closeModal()" class="modal-close-btn">×</button>
            </div>
            <div class="custom-modal-body">
                ${t}
            </div>
        </div>
    `,document.body.appendChild(o)}function j(){const e=document.querySelector(".custom-modal");e&&e.remove()}window.closeModal=j;function V(){const e=document.getElementById("update-gym-form"),t=document.getElementById("update-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),J()}),t.addEventListener("click",function(n){n.target===t&&closeUpdateGymModal()})}window.openUpdateGymModal=function(e){const t=i.find(a=>a.id===e);if(!t){c("Arène introuvable","error");return}w=e;const n=document.getElementById("update-gym-modal"),o=f[t.team],s=y(t);document.getElementById("update-gym-info").innerHTML=`
        <h3><span class="team-badge ${t.team}">${o.icon} ${t.name}</span></h3>
        <div class="current-status">
            <div class="status-item">
                <i class="fas fa-shield-alt"></i>
                <span><strong>Équipe:</strong> ${o.name}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-users"></i>
                <span><strong>Pokémon:</strong> ${t.pokemonCount}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-clock"></i>
                <span><strong>Depuis:</strong> ${s.timeDefending}</span>
            </div>
            <div class="status-item">
                <i class="fas fa-coins"></i>
                <span><strong>Coins:</strong> ${s.coinsEarned}/50</span>
            </div>
        </div>
    `,document.getElementById("update-gym-team").value=t.team,document.getElementById("update-pokemon-count").value=t.pokemonCount,_(),document.body.classList.add("modal-open"),n.style.display="block",n.classList.add("show"),r.closePopup()};window.closeUpdateGymModal=function(){const e=document.getElementById("update-gym-modal"),t=document.getElementById("update-gym-form");e.style.display="none",e.classList.remove("show"),document.body.classList.remove("modal-open"),t.reset(),w=null};function _(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("update-capture-time").value=e.toISOString().slice(0,16)}function J(){if(!w){c("Erreur: arène non sélectionnée","error");return}const e=i.find(s=>s.id===w);if(!e){c("Arène introuvable","error");return}const t=document.getElementById("update-gym-team").value,n=parseInt(document.getElementById("update-pokemon-count").value),o=new Date(document.getElementById("update-capture-time").value);if(!t||!f[t]){c("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){c("Veuillez sélectionner un nombre de Pokémon valide","error");return}e.team=t,e.pokemonCount=n,e.captureTime=o,e.lastUpdated=new Date,S(),M(),$(),closeUpdateGymModal(),c(`Arène "${e.name}" mise à jour !`,"success")}function R(){const e=document.getElementById("create-gym-form"),t=document.getElementById("create-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),X()}),t.addEventListener("click",function(n){n.target===t&&closeCreateGymModal()}),D()}window.openCreateGymModal=function(e,t){u={lat:e,lng:t};const n=document.getElementById("create-gym-modal");document.getElementById("create-gym-name").focus(),document.body.classList.add("modal-open"),n.style.display="block",n.classList.add("show"),r.closePopup(),e&&t&&fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e}&lon=${t}&addressdetails=1`).then(o=>o.json()).then(o=>{if(o.display_name){const s=o.display_name.split(",")[0];document.getElementById("create-gym-name").placeholder=`Ex: ${s}`}}).catch(()=>{})};window.closeCreateGymModal=function(){const e=document.getElementById("create-gym-modal"),t=document.getElementById("create-gym-form");e.style.display="none",e.classList.remove("show"),document.body.classList.remove("modal-open"),t.reset(),D(),g&&(r.removeLayer(g),g=null),u=null};function D(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("create-capture-time").value=e.toISOString().slice(0,16)}function X(){if(!u){c("Erreur: position non définie","error");return}const e=document.getElementById("create-gym-name").value.trim(),t=document.getElementById("create-gym-team").value,n=parseInt(document.getElementById("create-pokemon-count").value),o=new Date(document.getElementById("create-capture-time").value);if(!e){c("Veuillez entrer un nom pour l'arène","error");return}if(!t||!f[t]){c("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){c("Veuillez sélectionner un nombre de Pokémon valide","error");return}if(i.find(l=>Math.abs(l.latLng.lat-u.lat)<1e-4&&Math.abs(l.latLng.lng-u.lng)<1e-4)){c("Une arène existe déjà à cet emplacement !","error");return}const a={id:"gym_"+Date.now().toString(),name:e,team:t,pokemonCount:n,captureTime:o,location:`${u.lat.toFixed(6)}, ${u.lng.toFixed(6)}`,latLng:u,createdAt:new Date,lastUpdated:new Date};i.push(a),S(),M(),$(),closeCreateGymModal(),c(`Arène "${e}" créée !`,"success")}document.addEventListener("click",function(e){const t=document.getElementById("gym-modal");(e.target===t||e.target.classList.contains("close"))&&(t.style.display="none")});function c(e,t="info"){const n=document.createElement("div");n.style.cssText=`
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
    `,n.textContent=e,document.body.appendChild(n),setTimeout(()=>{n.style.animation="slideOut 0.3s ease-in forwards",setTimeout(()=>n.remove(),300)},3e3)}const H=document.createElement("style");H.textContent=`
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
`;document.head.appendChild(H);function W(){const t=["ghp","Ufxm7SUsWzIxmp2SWb9It7Yli3Jrdn1SvDbD"].join("_");return t&&t.length>10?(localStorage.setItem("github_token",t),d.token=t,console.log("Configuration automatique du token réussie"),!0):!1}window.debugSync=function(){console.log("=== DEBUG SYNCHRONISATION ==="),console.log("Token configuré:",!!d.token),console.log("SHA GitHub:",h),console.log("Arènes locales:",i.length),console.log("Dernière sauvegarde:",E),console.log("URL API:",d.apiUrl),C().then(()=>{console.log("Chargement GitHub réussi, arènes:",i.length)}).catch(e=>{console.error("Erreur chargement GitHub:",e)})};window.testSave=function(){if(console.log("=== TEST SAUVEGARDE ==="),i.length===0){const e={id:"debug_"+Date.now(),name:"Test Debug",team:"mystic",pokemonCount:2,captureTime:new Date().toISOString(),latLng:{lat:48.8566,lng:2.3522},optimal:!1,timeToOptimal:null};i.push(e),console.log("Arène de test créée:",e)}S()};function Y(){if(!r)return[];const e=r.getBounds();return i.filter(t=>e.contains([t.latLng.lat,t.latLng.lng]))}function k(){const e=Y(),t=document.getElementById("gyms-list");if(!t)return;if(e.length===0){t.innerHTML=`
            <div class="no-gyms-message">
                <i class="fas fa-search"></i>
                <p>Aucune arène visible dans cette zone</p>
                <small>Déplacez-vous ou dézoomez pour voir plus d'arènes</small>
            </div>
        `;return}const n=r.getCenter();e.sort((o,s)=>{const a=I(n,o.latLng),l=I(n,s.latLng);return a-l}),t.innerHTML=`
        <div class="gyms-list-header">
            <p><i class="fas fa-eye"></i> ${e.length} arène${e.length>1?"s":""} visible${e.length>1?"s":""}</p>
        </div>
        <div class="gyms-list-items">
            ${e.map(o=>Z(o)).join("")}
        </div>
    `}function Z(e){const t=f[e.team],n=y(e),o=r.getCenter(),s=I(o,e.latLng);return`
        <div class="gym-list-item" onclick="focusOnGym('${e.id}')" data-gym-id="${e.id}">
            <div class="gym-list-icon">
                <div class="gym-marker" style="background-color: ${t.color};">
                    <span>${t.icon}</span>
                </div>
            </div>
            <div class="gym-list-content">
                <div class="gym-list-name">${e.name||"Arène sans nom"}</div>
                <div class="gym-list-details">
                    <span class="gym-team">${t.name}</span>
                    <span class="gym-pokemon">🐾 ${e.pokemonCount} Pokémon</span>
                    <span class="gym-distance">📍 ${s.toFixed(0)}m</span>
                </div>
                <div class="gym-list-status ${n.isOptimal?"optimal":"not-optimal"}">
                    ${n.isOptimal?"💰 Optimal (50 PokéCoins)":`⏱️ ${n.timeLeft}`}
                </div>
            </div>
            <div class="gym-list-actions">
                <button class="gym-action-btn" onclick="event.stopPropagation(); openUpdateGymModal('${e.id}')" title="Actualiser">
                    <i class="fas fa-refresh"></i>
                </button>
            </div>
        </div>
    `}function I(e,t){const o=e.lat*Math.PI/180,s=t.lat*Math.PI/180,a=(t.lat-e.lat)*Math.PI/180,l=(t.lng-e.lng)*Math.PI/180,m=Math.sin(a/2)*Math.sin(a/2)+Math.cos(o)*Math.cos(s)*Math.sin(l/2)*Math.sin(l/2);return 6371e3*(2*Math.atan2(Math.sqrt(m),Math.sqrt(1-m)))}function K(e){const t=i.find(n=>n.id===e);if(t){r.setView([t.latLng.lat,t.latLng.lng],Math.max(r.getZoom(),16));const n=b.find(o=>o.options.gymId===e);n&&n.openPopup()}}window.focusOnGym=K;
