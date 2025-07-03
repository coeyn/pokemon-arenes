(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))o(s);new MutationObserver(s=>{for(const a of s)if(a.type==="childList")for(const l of a.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&o(l)}).observe(document,{childList:!0,subtree:!0});function n(s){const a={};return s.integrity&&(a.integrity=s.integrity),s.referrerPolicy&&(a.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?a.credentials="include":s.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function o(s){if(s.ep)return;s.ep=!0;const a=n(s);fetch(s.href,a)}})();const y={valor:{name:"Team Valor",color:"#FF6B6B",icon:"🔥"},mystic:{name:"Team Mystic",color:"#4ECDC4",icon:"❄️"},instinct:{name:"Team Instinct",color:"#FFE66D",icon:"⚡"}},d={owner:"coeyn",repo:"pokemon-arenes",path:"data/arenes.json",token:void 0,apiUrl:null};d.apiUrl=`https://api.github.com/repos/${d.owner}/${d.repo}/contents/${d.path}`;function z(){const e=localStorage.getItem("github_token");if(e){d.token=e,console.log("Token GitHub chargé - synchronisation activée");return}if(Q()){console.log("Token GitHub configuré automatiquement - synchronisation activée");return}console.log("Token GitHub non configuré - synchronisation désactivée"),console.log("Pour activer la synchronisation collaborative, utilisez dans la console :"),console.log('setGitHubToken("votre_token_github")')}window.setGitHubToken=function(e){e&&e.startsWith("ghp_")?(d.token=e,localStorage.setItem("github_token",e),console.log("Token GitHub configuré avec succès !"),typeof x=="function"&&x().catch(console.error)):console.error('Token invalide. Il doit commencer par "ghp_"')};window.removeGitHubToken=function(){d.token=null,localStorage.removeItem("github_token"),console.log("Token GitHub supprimé")};let r,w=[];JSON.parse(localStorage.getItem("pokemonGyms"));let i=JSON.parse(localStorage.getItem("sharedPokemonGyms"))||[],f=null,g=null,$=null,b=null,T=0;document.addEventListener("DOMContentLoaded",function(){z(),U(),F(),q(),j(),D(),W(),X(),A()});async function D(){try{c("Chargement des arènes...","info");const e=await fetch(d.apiUrl);if(e.ok){const t=await e.json();b=t.sha,i=JSON.parse(atob(t.content)).arenes||[],localStorage.setItem("sharedPokemonGyms",JSON.stringify(i)),G(),E(),c(`${i.length} arènes chargées depuis GitHub`,"success")}else throw new Error("Fichier non trouvé sur GitHub")}catch(e){console.log("Erreur GitHub, utilisation du stockage local:",e.message),c("Mode hors ligne - utilisation du stockage local","info"),E()}}async function x(){try{console.log("🚀 Début sauvegarde GitHub..."),console.log("Token disponible:",!!d.token),console.log("SHA actuel:",b),console.log("Nombre d'arènes:",i.length);const e={lastUpdated:new Date().toISOString(),version:"1.0.0",totalArenes:i.length,arenes:i},t=btoa(JSON.stringify(e,null,2)),n={message:`Mise à jour des arènes - ${i.length} arènes`,content:t,sha:b};console.log("📤 Envoi vers GitHub...");const o=await fetch(d.apiUrl,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`token ${d.token}`},body:JSON.stringify(n)});if(console.log("📥 Réponse GitHub:",o.status),o.ok){const s=await o.json();b=s.content.sha,console.log("✅ Synchronisation réussie!",s),c("Arènes synchronisées avec GitHub !","success")}else{const s=await o.text();throw console.error("❌ Erreur réponse GitHub:",o.status,s),new Error(`Erreur GitHub ${o.status}: ${s}`)}}catch(e){console.error("💥 Erreur sauvegarde GitHub:",e),c("Erreur de synchronisation - sauvegarde locale uniquement","error")}}function U(){const e=[48.8566,2.3522];r=L.map("map").setView(e,13),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19}).addTo(r),r.on("click",function(t){N(t.latlng)}),r.on("moveend",function(){k()}),r.on("zoomend",function(){k()}),r.on("viewreset",function(){k()}),navigator.geolocation&&navigator.geolocation.getCurrentPosition(t=>{const n=[t.coords.latitude,t.coords.longitude];r.setView(n,15),L.marker(n,{icon:L.divIcon({html:'<div style="background: #007bff; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.3);"></div>',className:"user-location-marker",iconSize:[16,16],iconAnchor:[8,8]})}).addTo(r).bindPopup("Votre position")},t=>{console.log("Géolocalisation non disponible:",t)}),G()}function N(e){f&&r.removeLayer(f),!i.find(n=>Math.abs(n.latLng.lat-e.lat)<1e-4&&Math.abs(n.latLng.lng-e.lng)<1e-4)&&(f=L.marker([e.lat,e.lng],{icon:L.divIcon({html:O("#6C5CE7","+",!1),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]})}).addTo(r),f.bindPopup(`
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
    `}function F(){console.log("Interface simplifiée - interactions via la carte")}function q(){console.log("Interface simplifiée - plus d'onglets")}function S(){localStorage.setItem("sharedPokemonGyms",JSON.stringify(i));const e=Date.now();if(e-T<5e3){console.log("Sauvegarde GitHub reportée - trop récente");return}T=e,d.token?x().catch(console.error):console.log("Token GitHub non configuré - sauvegarde locale uniquement")}function G(){w.forEach(e=>{r.removeLayer(e)}),w=[],i.forEach(e=>{const t=y[e.team],n=h(e),o=L.marker([e.latLng.lat,e.latLng.lng],{icon:L.divIcon({html:O(t.color,t.icon,n.isOptimal),className:"custom-marker",iconSize:[30,30],iconAnchor:[15,30]}),gymId:e.id}).addTo(r),s=`
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
        `;o.bindPopup(s),w.push(o)}),k()}function h(e){const t=new Date,n=new Date(e.captureTime),o=t-n,s=o/(1e3*60*60),a=o/(1e3*60),l=Math.min(50,Math.floor(a/10)),m=a>=500;let u;if(s>=24){const p=Math.floor(s/24),v=Math.floor(s%24);u=`${p}j ${v}h`}else if(s>=1){const p=Math.floor(s),v=Math.floor((s-p)*60);u=`${p}h ${v}m`}else u=`${Math.floor(a)}m`;let M="";if(!m){const p=500-a;if(p>60){const v=Math.floor(p/60),P=Math.floor(p%60);M=`${v}h ${P}m restant`}else M=`${Math.ceil(p)}m restant`}return{isOptimal:m,timeDefending:u,coinsEarned:l,statusText:m?"Optimal":"Récent",diffMinutes:a,timeLeft:M}}function j(){const e=document.querySelectorAll("[data-team]"),t=document.querySelectorAll("[data-status]");if(e.length===0||t.length===0){console.warn("Éléments de filtres non trouvés dans le DOM");return}e.forEach(n=>{n.addEventListener("click",()=>{e.forEach(o=>o.classList.remove("active")),n.classList.add("active"),I()})}),t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(o=>o.classList.remove("active")),n.classList.add("active"),I()})})}function I(){const e=document.querySelector("[data-team].active"),t=document.querySelector("[data-status].active"),n=e?e.dataset.team:"all",o=t?t.dataset.status:"all",s=i.filter(a=>{const l=n==="all"||a.team===n,m=h(a),u=o==="all"||o==="optimal"&&m.isOptimal||o==="recent"&&!m.isOptimal;return l&&u});V(s)}function V(e){const t=document.getElementById("gyms-list");if(!t){console.warn("Élément gyms-list non trouvé dans le DOM");return}if(e.length===0){t.innerHTML='<p style="text-align: center; color: var(--text-muted); padding: 20px;">Aucune arène trouvée avec ces filtres.</p>';return}t.innerHTML=e.map(n=>{const o=y[n.team],s=h(n);return`
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
        `}).join("")}function E(){I()}function _(e){console.log("Ouverture des détails pour l'arène:",e);const t=i.find(u=>u.id===e);if(!t){console.error("Arène non trouvée:",e);return}const n=y[t.team],o=h(t),s=new Date(t.captureTime),a=document.getElementById("gym-details-title"),l=document.getElementById("gym-details-body");a.innerHTML=`<i class="fas fa-info-circle"></i> ${t.name||"Arène sans nom"}`,l.innerHTML=`
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
    `;const m=document.getElementById("gym-details-modal");m.style.display="block",document.body.classList.add("modal-open")}function R(){const e=document.getElementById("gym-details-modal");e.style.display="none",document.body.classList.remove("modal-open")}window.showGymDetails=_;window.closeGymDetailsModal=R;function J(){const e=document.querySelector(".custom-modal");e&&(e.remove(),document.body.classList.remove("modal-open"))}window.closeModal=J;function X(){const e=document.getElementById("update-gym-form"),t=document.getElementById("update-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),K()}),t.addEventListener("click",function(n){n.target===t&&closeUpdateGymModal()})}window.openUpdateGymModal=function(e){const t=i.find(a=>a.id===e);if(!t){c("Arène introuvable","error");return}$=e;const n=document.getElementById("update-gym-modal"),o=y[t.team],s=h(t);document.getElementById("update-gym-info").innerHTML=`
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
    `,document.getElementById("update-gym-team").value=t.team,document.getElementById("update-pokemon-count").value=t.pokemonCount,Z(),n.style.display="block",n.classList.add("show"),document.body.classList.add("modal-open"),r.closePopup()};window.closeUpdateGymModal=function(){const e=document.getElementById("update-gym-modal"),t=document.getElementById("update-gym-form");e.style.display="none",e.classList.remove("show"),document.body.classList.remove("modal-open"),t.reset(),$=null};function Z(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("update-capture-time").value=e.toISOString().slice(0,16)}function K(){if(!$){c("Erreur: arène non sélectionnée","error");return}const e=i.find(s=>s.id===$);if(!e){c("Arène introuvable","error");return}const t=document.getElementById("update-gym-team").value,n=parseInt(document.getElementById("update-pokemon-count").value),o=new Date(document.getElementById("update-capture-time").value);if(!t||!y[t]){c("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){c("Veuillez sélectionner un nombre de Pokémon valide","error");return}e.team=t,e.pokemonCount=n,e.captureTime=o,e.lastUpdated=new Date,S(),G(),E(),closeUpdateGymModal(),c(`Arène "${e.name}" mise à jour !`,"success")}function W(){const e=document.getElementById("create-gym-form"),t=document.getElementById("create-gym-modal");e.addEventListener("submit",function(n){n.preventDefault(),Y()}),t.addEventListener("click",function(n){n.target===t&&closeCreateGymModal()}),B()}window.openCreateGymModal=function(e,t){g={lat:e,lng:t};const n=document.getElementById("create-gym-modal");document.getElementById("create-gym-name").focus(),n.style.display="block",n.classList.add("show"),document.body.classList.add("modal-open"),r.closePopup(),e&&t&&fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e}&lon=${t}&addressdetails=1`).then(o=>o.json()).then(o=>{if(o.display_name){const s=o.display_name.split(",")[0];document.getElementById("create-gym-name").placeholder=`Ex: ${s}`}}).catch(()=>{})};window.closeCreateGymModal=function(){const e=document.getElementById("create-gym-modal"),t=document.getElementById("create-gym-form");e.style.display="none",e.classList.remove("show"),document.body.classList.remove("modal-open"),t.reset(),B(),f&&(r.removeLayer(f),f=null),g=null};function B(){const e=new Date;e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),document.getElementById("create-capture-time").value=e.toISOString().slice(0,16)}function Y(){if(!g){c("Erreur: position non définie","error");return}const e=document.getElementById("create-gym-name").value.trim(),t=document.getElementById("create-gym-team").value,n=parseInt(document.getElementById("create-pokemon-count").value),o=new Date(document.getElementById("create-capture-time").value);if(!e){c("Veuillez entrer un nom pour l'arène","error");return}if(!t||!y[t]){c("Veuillez sélectionner une équipe","error");return}if(!n||n<1||n>6){c("Veuillez sélectionner un nombre de Pokémon valide","error");return}if(i.find(l=>Math.abs(l.latLng.lat-g.lat)<1e-4&&Math.abs(l.latLng.lng-g.lng)<1e-4)){c("Une arène existe déjà à cet emplacement !","error");return}const a={id:"gym_"+Date.now().toString(),name:e,team:t,pokemonCount:n,captureTime:o,location:`${g.lat.toFixed(6)}, ${g.lng.toFixed(6)}`,latLng:g,createdAt:new Date,lastUpdated:new Date};i.push(a),S(),G(),E(),closeCreateGymModal(),c(`Arène "${e}" créée !`,"success")}document.addEventListener("click",function(e){const t=document.getElementById("gym-modal");(e.target===t||e.target.classList.contains("close"))&&(t.style.display="none")});function c(e,t="info"){const n=document.createElement("div");n.style.cssText=`
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
`;document.head.appendChild(H);function Q(){return!1}window.debugSync=function(){console.log("=== DEBUG SYNCHRONISATION ==="),console.log("Token configuré:",!!d.token),console.log("SHA GitHub:",b),console.log("Arènes locales:",i.length),console.log("Dernière sauvegarde:",T),console.log("URL API:",d.apiUrl),D().then(()=>{console.log("Chargement GitHub réussi, arènes:",i.length)}).catch(e=>{console.error("Erreur chargement GitHub:",e)})};window.testSave=function(){if(console.log("=== TEST SAUVEGARDE ==="),i.length===0){const e={id:"debug_"+Date.now(),name:"Test Debug",team:"mystic",pokemonCount:2,captureTime:new Date().toISOString(),latLng:{lat:48.8566,lng:2.3522},optimal:!1,timeToOptimal:null};i.push(e),console.log("Arène de test créée:",e)}S()};function ee(){if(!r)return[];const e=r.getBounds();return i.filter(t=>e.contains([t.latLng.lat,t.latLng.lng]))}function k(){const e=ee(),t=document.getElementById("gyms-list");if(!t)return;if(e.length===0){t.innerHTML=`
            <div class="no-gyms-message">
                <i class="fas fa-search"></i>
                <p>Aucune arène visible dans cette zone</p>
                <small>Déplacez-vous ou dézoomez pour voir plus d'arènes</small>
            </div>
        `;return}const n=r.getCenter();e.sort((o,s)=>{const a=C(n,o.latLng),l=C(n,s.latLng);return a-l}),t.innerHTML=`
        <div class="gyms-list-header">
            <p><i class="fas fa-eye"></i> ${e.length} arène${e.length>1?"s":""} visible${e.length>1?"s":""}</p>
        </div>
        <div class="gyms-list-items">
            ${e.map(o=>te(o)).join("")}
        </div>
    `}function te(e){const t=y[e.team],n=h(e);return`
        <div class="gym-item ${e.team}" onclick="showGymDetails('${e.id}')">
            <div class="gym-header">
                <span class="gym-name">${e.name||"Arène sans nom"}</span>
                <span class="gym-team ${e.team}">${t.name}</span>
            </div>
            <div class="gym-details">
                <span><strong>Pokémon:</strong> ${e.pokemonCount}</span>
                <span><strong>Temps:</strong> ${n.timeDefending}</span>
                <span><strong>Coins:</strong> ${n.coinsEarned}</span>
                <span class="gym-status ${n.isOptimal?"optimal":"recent"}">${n.statusText}</span>
            </div>
        </div>
    `}function C(e,t){const o=e.lat*Math.PI/180,s=t.lat*Math.PI/180,a=(t.lat-e.lat)*Math.PI/180,l=(t.lng-e.lng)*Math.PI/180,m=Math.sin(a/2)*Math.sin(a/2)+Math.cos(o)*Math.cos(s)*Math.sin(l/2)*Math.sin(l/2);return 6371e3*(2*Math.atan2(Math.sqrt(m),Math.sqrt(1-m)))}function ne(e){const t=i.find(n=>n.id===e);if(t){r.setView([t.latLng.lat,t.latLng.lng],Math.max(r.getZoom(),16));const n=w.find(o=>o.options.gymId===e);n&&n.openPopup()}}window.focusOnGym=ne;function A(){document.querySelectorAll("button").forEach(t=>{t.classList.contains("button")||t.classList.add("button")})}document.addEventListener("DOMContentLoaded",function(){A()});
