// Types pour l'application d'optimisation des tournées de livraison

export interface Patient {
  id: string;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  isPharmacy?: boolean; // Point de départ (pharmacie)
}

export interface RoutePoint {
  patient: Patient;
  order: number;
}

export interface OptimizationResult {
  route: RoutePoint[];
  totalDistance: number; // en km
  totalTime: number; // en minutes (basé sur la distance et vitesse moyenne)
  optimized: boolean;
}

export interface CSVPatient {
  nom: string;
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
