// Types pour l'application d'optimisation des tournées de livraison

export interface Patient {
  id: string;
  nom: string;
  prenom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  isPharmacy?: boolean; // Point de départ (pharmacie)
}

// Temps de livraison fixe pour chaque patient (1 minute)
export const DELIVERY_TIME_PER_PATIENT = 1; // en minutes

export interface RoutePoint {
  patient: Patient;
  order: number;
}

export interface OptimizationResult {
  route: RoutePoint[];
  totalDistance: number; // en km (distance routière)
  totalTime: number; // en minutes (temps de trajet réel)
  optimized: boolean;
}

export interface CSVPatient {
  nom: string;
  prenom: string;
  adresse: string;
  latitude: string;
  longitude: string;
}

// Coordonnées pour La Réunion (centre approximatif)
export const REUNION_CENTER: [number, number] = [-21.1151, 55.5364];
export const REUNION_ZOOM = 10;

// Limites pour La Réunion (pour validation)
export const REUNION_BOUNDS: [[number, number], [number, number]] = [
  [-21.4, 55.2], // Sud-Ouest
  [-20.8, 55.8]  // Nord-Est
];

// Pharmacie par défaut (point de départ)
export const DEFAULT_PHARMACY: Patient = {
  id: 'pharmacy-1',
  nom: 'Pharmacie de l\'Océan Indien',
  prenom: '',
  adresse: '133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne',
  latitude: -20.9320073477941,
  longitude: 55.64138045246851,
  isPharmacy: true,
};
