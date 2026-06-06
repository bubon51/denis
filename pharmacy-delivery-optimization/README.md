# 🏥 Optimisation Tournées Livraison - La Réunion

Une application web complète en **React + TypeScript** pour optimiser les tournées de livraison d'un pharmacien sur l'île de La Réunion, avec **calcul des distances routières réelles** et **géocodage automatique des adresses**.

## 📋 Fonctionnalités

### ✅ Gestion des patients
- **Ajouter/Supprimer/Modifier** des patients avec :
  - Nom (obligatoire)
  - Prénom (optionnel)
  - Adresse (champ texte)
  - **Coordonnées GPS automatiques** (latitude/longitude calculées depuis l'adresse)
  - Temps de livraison estimé (en minutes)
- **Importer/Exporter** la liste des patients en CSV
- **Recherche** par nom, prénom ou adresse
- **Autocomplétion** : Tapez nom + prénom pour retrouver l'adresse automatiquement

### ✅ Optimisation des tournées
- **Algorithme TSP** (Traveling Salesman Problem) avec approche gloutonne + optimisation 2-opt
- **Tournée fermée** : Pharmacie → Patients → **Pharmacie** (retour inclus)
- **Calcul des distances routières réelles** via OSRM (Open Source Routing Machine)
- **Affichage** de :
  - L'ordre optimal des livraisons
  - La **distance totale routière** en km (pas à vol d'oiseau)
  - Le **temps total estimé** basé sur les trajets réels

### ✅ Carte interactive
- **Leaflet + OpenStreetMap** centrée sur La Réunion
- **Itinéraire routier** : Ligne rouge suivant les **vraies routes** (pas des lignes droites)
- Marqueurs cliquables avec popups (nom, prénom, adresse, temps, ordre)
- **Clustering automatique** : Regroupement des patients proches avec affichage du nombre (activable/désactivable)
- Zoom/Dézoom libre
- Limites géographiques pour La Réunion

### ✅ Interface utilisateur
- **Ant Design (antd)** pour tous les composants
- **Design responsive** (mobile-friendly)
- **Barre de recherche** pour filtrer les patients
- **Boutons clairs** pour toutes les actions
- **Locale française**

### ✅ Données par défaut
- **10 patients fictifs** à La Réunion (Saint-Denis, Saint-Pierre, Le Tampon, etc.)
- **Pharmacie** : 133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne (point de départ/arrivée)
- **Persistance** des données dans le localStorage

### ✅ Prêt pour GitHub Pages
- Scripts `predeploy` et `deploy` configurés
- Configuration Vite adaptée

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+ 
- npm 9+ ou yarn 1.22+

### Étapes

1. **Cloner le dépôt** :
```bash
git clone https://github.com/bubon51/denis.git
cd denis/pharmacy-delivery-optimization
```

2. **Installer les dépendances** :
```bash
npm install
```

3. **Lancer l'application en développement** :
```bash
npm run dev
```

4. **Ouvrir dans le navigateur** :
L'application sera disponible à : [http://localhost:5173](http://localhost:5173)

## 🌐 Déploiement sur GitHub Pages

### Configuration GitHub
1. Allez dans **Settings** → **Pages**
2. Sélectionnez :
   - Branch: `gh-pages`
   - Folder: `/ (root)`
3. Sauvegardez

### Déploiement
```bash
npm run deploy
```

L'application sera disponible à :
```
https://[votre-username].github.io/denis/pharmacy-delivery-optimization/
```

## 📁 Structure du projet

```
pharmacy-delivery-optimization/
├── public/
├── src/
│   ├── components/
│   │   ├── PatientForm.tsx
│   │   ├── PatientTable.tsx
│   │   ├── MapView.tsx
│   │   ├── OptimizationPanel.tsx
│   │   ├── ImportExportButtons.tsx
│   │   └── SearchBar.tsx
│   ├── hooks/
│   │   └── usePatients.ts
│   ├── utils/
│   │   ├── distance.ts (calcul distances routières)
│   │   ├── tsp.ts (algorithmes TSP)
│   │   ├── csv.ts (import/export)
│   │   ├── geocoding.ts (géocodage automatique)
│   │   └── db.ts (IndexedDB - persistance des données)
│   ├── types/
│   │   └── index.ts
│   ├── data/
│   │   └── defaultPatients.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
└── README.md
```

## 🎨 Capture d'écran (Description)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏥 Optimisation Tournées Livraison - La Réunion                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Gestion des tournées de livraison                                │
│  Optimisez vos tournées avec calcul des distances routières      │
│                                                                     │
│  [🔍 Rechercher par nom, prénom ou adresse...________]             │
│                                                                     │
│  [Exporter CSV] [Importer CSV] [Réinitialiser]                     │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Optimisation de la tournée                                    │   │
│  │ ┌─────┐ ┌─────────────┐ ┌─────────────┐                       │   │
│  │ │ 👥  │ │ 📏 Distance  │ │ ⏱️ Temps    │                       │   │
│  │ │ 10  │ │ 85.67 km    │ │ 2h 45min    │                       │   │
│  │ └─────┘ └─────────────┘ └─────────────┘                       │   │
│  │                                                             │   │
│  │ [Calculer l'itinéraire optimal]                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Carte des livraisons (itinéraire routier)                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    🗺️ CARTE INTERACTIVE                      │   │
│  │  🏥 Pharmacie (Sainte-Suzanne)                              │   │
│  │  • Jean Martin (Saint-Denis)                               │   │
│  │  • Marie Durand (Saint-Pierre)                             │   │
│  │  └─────────────────────────────────────────────────────────┘   │
│  │  [Ligne rouge = itinéraire ROUTIER réel]                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Liste des patients (10)                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Nom et Prénom    │ Adresse          │ Coordonnées    │ Temps │   │
│  ├──────────────────┼─────────────────┼────────────────┼───────┤   │
│  │ 🏥 Pharmacie      │ 133 Ave Gandhi   │ -20.9333,55.616│  0 min │   │
│  │ Jean Martin      │ 15 Rue Commerce │ -20.8821,55.450│ 10 min │   │
│  │ Marie Durand     │ 23 Ave République│ -21.3408,55.476│ 15 min │   │
│  │ ...             │ ...              │ ...            │ ...   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [+ Ajouter un patient]                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                     [+ Bouton flottant]
```

## 🛠️ Technologies

- **Frontend**: React 18 + TypeScript
- **UI**: Ant Design (antd) 5.x
- **Cartographie**: Leaflet + React-Leaflet + OpenStreetMap + **MarkerCluster**
- **Géocodage**: Nominatim (OpenStreetMap)
- **Routage**: OSRM (Open Source Routing Machine)
- **Stockage**: IndexedDB (avec fallback localStorage)
- **Build**: Vite 5.x
- **Déploiement**: GitHub Pages

## 📊 Algorithmes

### Algorithme Glouton (Nearest Neighbor)
1. Commence par la **pharmacie** (133 Avenue du Mahatma Gandhi, Sainte-Suzanne)
2. À chaque étape, sélectionne le patient non visité le plus proche
3. Ajoute le **retour à la pharmacie** pour fermer la boucle
4. Complexité: O(n²)

### Optimisation 2-opt
1. Prend la solution gloutonne comme point de départ
2. Teste tous les échanges possibles de 2 segments
3. Garde l'échange qui améliore la distance totale
4. Répète jusqu'à ce qu'aucune amélioration ne soit possible

### Calcul des distances
- **OSRM API** pour les distances routières réelles
- **Fallback** sur la distance à vol d'oiseau si OSRM échoue
- **Temps estimé** basé sur la durée réelle du trajet

## 🎯 Fonctionnalités clés

✅ **Géocodage automatique** : Les coordonnées GPS sont automatiquement remplies depuis l'adresse
✅ **Tournée fermée** : L'itinéraire commence et se termine à la pharmacie
✅ **Distances routières** : Calcul basé sur les vraies routes (pas à vol d'oiseau)
✅ **Itinéraire sur carte** : Affichage des trajets réels avec Leaflet
✅ **Autocomplétion** : Tapez nom + prénom pour retrouver l'adresse
✅ **Persistance** : Les données sont sauvegardées dans **IndexedDB** (avec migration automatique depuis localStorage)
✅ **Responsive** : Adapté aux mobiles et tablettes

## 💾 Stockage des données

### IndexedDB
L'application utilise **IndexedDB** pour une persistance avancée des données :

- **Capacité** : Plusieurs Mo/Go selon le navigateur (contre ~5 Mo pour localStorage)
- **Stores** :
  - `patients` : Patients de la tournée en cours
  - `databasePatients` : Base de données locale des patients réutilisables
  - `optimizationHistory` : Historique des tournées optimisées (optionnel)
- **Migration automatique** : Si des données existent dans localStorage, elles sont automatiquement migrées vers IndexedDB au premier chargement
- **Fallback** : Si IndexedDB n'est pas disponible, l'application utilise localStorage

### Structure de la base de données
```
PharmacyDeliveryDB (version 1)
├── patients (clé: id)
│   ├── id, nom, prenom, adresse, latitude, longitude, isPharmacy
│   └── index: nom, isPharmacy
├── databasePatients (clé: id)
│   ├── id, nom, prenom, adresse, latitude, longitude
│   └── index: nom, adresse
└── optimizationHistory (clé: id)
    ├── id, route, totalDistance, totalTime, optimized, timestamp
    └── index: timestamp
```

## 🗺️ Clustering des marqueurs

### Fonctionnalité
L'application utilise **Leaflet.markercluster** pour regrouper les patients proches géographiquement sur la carte :

- **Regroupement automatique** : Les marqueurs proches sont fusionnés en un seul cluster.
- **Affichage du nombre** : Chaque cluster affiche le nombre de patients qu'il contient.
- **Personnalisation** : Les clusters changent de couleur et de taille en fonction du nombre de patients :
  - **Bleu** (#1890ff) : Moins de 10 patients
  - **Orange** (#faad14) : Entre 10 et 50 patients
  - **Rouge** (#f5222d) : Plus de 50 patients
- **Interactif** :
  - Cliquer sur un cluster pour zoomer dessus.
  - Au zoom maximal, les marqueurs se séparent (spiderfy).
  - Survoler un cluster pour voir sa zone de couverture.

### Activation/Désactivation
Un interrupteur (**Switch**) est disponible en haut à droite de la carte pour :
- **Activer le clustering** : Regrouper les patients proches.
- **Désactiver le clustering** : Afficher tous les marqueurs individuellement.

### Options de clustering
| Option | Valeur | Description |
|--------|--------|-------------|
| `maxClusterRadius` | 50 | Rayon maximal (en pixels) pour regrouper les marqueurs. |
| `disableClusteringAtZoom` | 15 | Niveau de zoom à partir duquel le clustering est désactivé. |
| `spiderfyOnMaxZoom` | true | Active la séparation des marqueurs au zoom maximal. |
| `showCoverageOnHover` | true | Affiche la zone couverte par le cluster au survol. |
| `zoomToBoundsOnClick` | true | Zoom sur les limites du cluster au clic. |

## 📄 Licence

MIT License

## 🙏 Remerciements

- [Ant Design](https://ant.design/)
- [Leaflet](https://leafletjs.com/)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [OSRM](https://project-osrm.org/)
- [Nominatim](https://nominatim.org/)

---

**Développé avec ❤️ pour les pharmaciens de La Réunion**
