# 🏥 Optimisation Tournées Livraison - La Réunion

Une application web complète en React + TypeScript pour optimiser les tournées de livraison d'un pharmacien sur l'île de La Réunion.

## 📋 Fonctionnalités

### ✅ Gestion des patients
- **Ajouter/Supprimer/Modifier** des patients avec :
  - Nom
  - Adresse (champ texte)
  - Coordonnées GPS (latitude/longitude, champs numériques)
  - Temps de livraison estimé (en minutes)
- **Importer/Exporter** la liste des patients en CSV
- **Recherche** par nom ou adresse
- **Validation** des coordonnées (doivent être sur La Réunion)

### ✅ Optimisation des tournées
- **Algorithme TSP** (Traveling Salesman Problem) avec approche gloutonne (Nearest Neighbor)
- **Optimisation 2-opt** pour améliorer la solution initiale
- **Affichage** de :
  - L'ordre optimal des livraisons
  - La distance totale en km
  - Le temps total estimé (incluant temps de livraison + temps de trajet)

### ✅ Carte interactive
- **Intégration** de Leaflet + OpenStreetMap
- **Centrée sur La Réunion** par défaut
- **Affichage** de :
  - Tous les patients sous forme de marqueurs cliquables
  - Popups avec informations détaillées (nom, adresse, temps, ordre)
  - L'itinéraire optimisé sous forme de ligne rouge
- **Zoom/Dézoom** libre
- **Limites géographiques** pour rester sur La Réunion

### ✅ Interface utilisateur
- **Ant Design (antd)** pour tous les composants
- **Design responsive** (mobile-friendly)
- **Barre de recherche** pour filtrer les patients
- **Boutons clairs** pour toutes les actions
- **Locale française** pour une meilleure expérience utilisateur

### ✅ Données par défaut
- **10 patients fictifs** à La Réunion (Saint-Denis, Saint-Pierre, Le Tampon, etc.)
- **Pharmacie** comme point de départ (premier point de la liste)
- **Persistance** des données dans le localStorage

## 🚀 Installation et lancement

### Prérequis
- Node.js 18+ 
- npm 9+ ou yarn 1.22+

### Étapes

1. **Cloner le dépôt** (si vous ne l'avez pas déjà) :
```bash
git clone https://github.com/bubon51/denis.git
cd denis/pharmacy-delivery-optimization
```

2. **Installer les dépendances** :
```bash
npm install
# ou
yarn install
```

3. **Lancer l'application en développement** :
```bash
npm run dev
# ou
yarn dev
```

4. **Ouvrir dans le navigateur** :
L'application sera disponible à l'adresse : [http://localhost:5173](http://localhost:5173)

## 🌐 Déploiement sur GitHub Pages

### Configuration initiale

1. **Installer gh-pages** (déjà inclus dans les dépendances) :
```bash
npm install gh-pages --save-dev
```

2. **Configurer le repository** :
   - Assurez-vous que le champ `homepage` dans `package.json` est correct
   - Vérifiez que le champ `repository.url` pointe vers votre dépôt GitHub

3. **Créer une branche gh-pages** (si elle n'existe pas) :
```bash
npm run deploy
```

### Déploiement

Pour déployer l'application sur GitHub Pages :

```bash
# Construire et déployer
npm run deploy
```

Cela exécutera :
1. `npm run build` - Compile l'application
2. `gh-pages -d dist` - Déploie le dossier dist sur la branche gh-pages

### Configuration GitHub

1. Allez dans les **Settings** de votre dépôt GitHub
2. Sélectionnez **Pages** dans le menu de gauche
3. Sous **Source**, sélectionnez :
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Cliquez sur **Save**

Votre application sera disponible à l'adresse :
```
https://[votre-username].github.io/denis/pharmacy-delivery-optimization/
```

## 📁 Structure du projet

```
pharmacy-delivery-optimization/
├── public/                    # Fichiers statiques
├── src/
│   ├── components/           # Composants React
│   │   ├── PatientForm.tsx   # Formulaire d'ajout/modification
│   │   ├── PatientTable.tsx  # Tableau des patients
│   │   ├── MapView.tsx       # Carte interactive
│   │   ├── OptimizationPanel.tsx
│   │   ├── ImportExportButtons.tsx
│   │   └── SearchBar.tsx
│   ├── hooks/                 # Hooks personnalisés
│   │   └── usePatients.ts     # Gestion des patients
│   ├── utils/                 # Fonctions utilitaires
│   │   ├── distance.ts        # Calcul de distances
│   │   ├── tsp.ts             # Algorithmes TSP
│   │   └── csv.ts             # Import/Export CSV
│   ├── types/                 # Types TypeScript
│   │   └── index.ts           # Interfaces et types
│   ├── data/                  # Données
│   │   └── defaultPatients.ts # Patients par défaut
│   ├── App.tsx                # Composant principal
│   ├── main.tsx              # Point d'entrée
│   ├── index.css             # Styles globaux
│   └── vite-env.d.ts          # Déclarations Vite
├── package.json              # Configuration npm
├── tsconfig.json             # Configuration TypeScript
├── vite.config.ts            # Configuration Vite
├── index.html                # Page HTML principale
└── README.md                  # Documentation
```

## 🎨 Capture d'écran (ASCII)

```
┌─────────────────────────────────────────────────────────────────────┐
│  🏥 Optimisation Tournées Livraison - La Réunion                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Gestion des tournées de livraison                                │
│  Optimisez vos tournées de livraison pour les patients à La Réunion│
│                                                                     │
│  [🔍 Rechercher par nom ou adresse...________]                      │
│                                                                     │
│  [Exporter CSV] [Importer CSV] [Réinitialiser]                      │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Optimisation de la tournée                                    │   │
│  │ ┌─────┐ ┌─────┐ ┌─────┐                                    │   │
│  │ │ 👥  │ │ 📏  │ │ ⏱️  │                                    │   │
│  │ │ 10  │ │35.2 │ │ 2h30│                                    │   │
│  │ └─────┘ └─────┘ └─────┘                                    │   │
│  │                                                             │   │
│  │ [Calculer l'itinéraire optimal]                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Carte des livraisons                                              │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    🗺️ CARTE INTERACTIVE                      │   │
│  │  • Pharmacie Centrale (Saint-Denis)                          │   │
│  │  • M. Martin (Saint-Denis)                                   │   │
│  │  • Mme Durand (Saint-Pierre)                                 │   │
│  │  • Dr. Bernard (Le Tampon)                                   │   │
│  │  └─────────────────────────────────────────────────────────┘   │
│  │  [Ligne rouge = itinéraire optimisé]                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Liste des patients (10)                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Nom          │ Adresse          │ Coordonnées    │ Temps │   │
│  ├──────────────┼─────────────────┼────────────────┼───────┤   │
│  │ 🏥 Pharmacie  │ 1 Rue de Paris    │ -20.8785,55.448 │  0 min │   │
│  │ M. Martin    │ 15 Rue Commerce  │ -20.8821,55.450 │ 10 min │   │
│  │ Mme Durand   │ 23 Ave République│ -21.3408,55.476 │ 15 min │   │
│  │ ...         │ ...              │ ...            │ ...   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  [+ Ajouter un patient]                                           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                     [+ Bouton flottant]
```

## 🛠️ Technologies utilisées

- **Frontend** : React 18 + TypeScript
- **UI Framework** : Ant Design (antd) 5.x
- **Cartographie** : Leaflet + React-Leaflet + OpenStreetMap
- **Build Tool** : Vite 5.x
- **Gestion d'état** : React Hooks (useState, useEffect, useCallback)
- **CSV** : PapaParse
- **Déploiement** : GitHub Pages

## 📊 Algorithmes

### Algorithme Glouton (Nearest Neighbor)
1. Commence par la pharmacie (point de départ)
2. À chaque étape, sélectionne le patient non visité le plus proche
3. Répète jusqu'à ce que tous les patients soient visités
4. Complexité : O(n²)

### Optimisation 2-opt
1. Prend une solution initiale (gloutonne)
2. Teste tous les échanges possibles de 2 arêtes
3. Garde l'échange qui améliore la distance totale
4. Répète jusqu'à ce qu'aucune amélioration ne soit possible
5. Complexité : O(n²) par itération

## 🎯 Améliorations possibles

- [ ] Intégration avec OR-Tools via une API backend
- [ ] Algorithme génétique pour de meilleures solutions
- [ ] Prise en compte des contraintes horaires
- [ ] Optimisation multi-véhicules
- [ ] Synchronisation avec un backend (Firebase, etc.)
- [ ] Authentification utilisateur
- [ ] Historique des tournées
- [ ] Export vers Google Maps

## 📄 Licence

MIT License - Libre d'utilisation pour des projets personnels ou commerciaux.

## 🙏 Remerciements

- [Ant Design](https://ant.design/) pour les composants UI
- [Leaflet](https://leafletjs.com/) pour la cartographie
- [OpenStreetMap](https://www.openstreetmap.org/) pour les cartes
- [Vite](https://vitejs.dev/) pour le build ultra-rapide

---

**Développé avec ❤️ pour les pharmaciens de La Réunion**
