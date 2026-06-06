// Types pour l'application d'optimisation des tournées de livraison
import { REUNION_CENTER, REUNION_ZOOM, REUNION_BOUNDS, DELIVERY_TIME_PER_PATIENT } from '../constants';

// Exporter les constantes pour la compatibilité ascendante
export { REUNION_CENTER, REUNION_ZOOM, REUNION_BOUNDS, DELIVERY_TIME_PER_PATIENT };

// Type pour les patients stockés dans la base de données (sans hasColdDelivery)
export interface DatabasePatient {
  id: string;
  nom: string;
  prenom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  isPharmacy?: boolean; // Point de départ (pharmacie)
  phone?: string; // Numéro de téléphone (optionnel)
}

// Type pour les patients en cours de livraison (avec hasColdDelivery)
export interface Patient extends DatabasePatient {
  hasColdDelivery?: boolean; // Livraison avec du froid (optionnel, uniquement pour la livraison en cours)
}

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
  phone?: string; // Numéro de téléphone (optionnel)
}



// Pharmacie par défaut (point de départ)
export const DEFAULT_PHARMACY: Patient = {
  id: 'pharmacy-1',
  nom: 'Pharmacie de l\'Océan Indien',
  prenom: '',
  adresse: '133 Avenue du Mahatma Gandhi, 97441 Sainte-Suzanne',
  latitude: -20.9320073477941,
  longitude: 55.64138045246851,
  isPharmacy: true,
  phone: '', // Numéro de téléphone vide par défaut
};
