# 🎮 Tracker d'Arènes Pokémon GO

Un site web moderne pour aider les joueurs de Pokémon GO à tracker les arènes et optimiser leur collecte de PokéCoins.

## ✨ Fonctionnalités

- **🗺️ Carte interactive** avec géolocalisation
- **➕ Ajout d'arènes** avec équipe, nombre de Pokémon et heure de prise
- **⏰ Calcul automatique** du temps optimal (8h20 pour 50 PokéCoins)
- **🎨 Interface en français** avec design moderne et responsive
- **💾 Stockage local** des données (pas besoin de compte utilisateur)
- **🔍 Filtres** par équipe et statut des arènes
- **📱 Compatible mobile** et desktop

## 🚀 Technologies utilisées

- **HTML5, CSS3, JavaScript** vanilla
- **Vite** pour le build et le développement
- **Leaflet + OpenStreetMap** pour la carte interactive (100% gratuit !)
- **Nominatim** pour le géocodage inverse (OpenStreetMap)
- **Local Storage** pour la persistance des données
- **Font Awesome** pour les icônes
- **Google Fonts** (Poppins)

## 🎯 Système de PokéCoins

Le système suit les règles officielles de Pokémon GO :
- **1 PokéCoin** toutes les 10 minutes de défense
- **Maximum 50 PokéCoins** par jour
- **Temps optimal** : 8h20 (500 minutes) pour obtenir les 50 coins maximum
- Les coins sont donnés uniquement quand le Pokémon revient de l'arène

## 🎨 Couleurs des équipes

- **Team Valor (Rouge)** : #FF6B6B 🔥
- **Team Mystic (Bleu)** : #4ECDC4 ❄️
- **Team Instinct (Jaune)** : #FFE66D ⚡

## 🛠️ Installation et utilisation

1. **Cloner le projet**
   ```bash
   git clone [url-du-repo]
   cd raid_pokemon
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Aucune configuration requise !**
   - OpenStreetMap et Leaflet sont gratuits et ne nécessitent pas de clé API
   - Tout fonctionne directement sans configuration supplémentaire

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Build pour la production**
   ```bash
   npm run build
   ```

## 📱 Utilisation

### Ajouter une arène
1. Cliquez sur la carte pour sélectionner la position
2. Ou utilisez le bouton "Ma position" pour votre localisation actuelle
3. Remplissez le formulaire avec les détails de l'arène
4. Cliquez sur "Ajouter l'arène"

### Filtrer les arènes
- **Par équipe** : Toutes, Valor, Mystic, Instinct
- **Par statut** : Tous, Optimal (8h20+), Récent (<8h20)

### Voir les détails
- Cliquez sur une arène dans la liste ou sur un marqueur sur la carte
- Vous pouvez centrer la carte ou supprimer l'arène

## 🔧 Structure du projet

```
raid_pokemon/
├── index.html          # Page principale
├── src/
│   ├── main.js         # Logique JavaScript principale
│   └── style.css       # Styles CSS
├── .github/
│   └── copilot-instructions.md
├── package.json
└── README.md
```

## 🌟 Fonctionnalités avancées

- **Géolocalisation automatique**
- **Géocodage inverse** pour les adresses
- **Marqueurs colorés** selon l'équipe et le statut
- **Info-bulles détaillées** sur la carte
- **Interface responsive** pour tous les appareils
- **Animations fluides** et transitions
- **Notifications** pour les actions utilisateur

## 🚫 Limitations

- Les emplacements d'arènes doivent être ajoutés manuellement
- Pas d'API officielle Niantic disponible pour récupérer automatiquement les arènes
- Les données sont stockées localement (pas de synchronisation entre appareils)
- Le géocodage inverse dépend du service Nominatim d'OpenStreetMap

## 📄 License

Ce projet est à des fins éducatives. Pokémon GO est une marque de Niantic et The Pokémon Company.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou proposer une pull request.
