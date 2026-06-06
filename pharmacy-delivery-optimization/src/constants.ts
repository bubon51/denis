/**
 * Constantes globales pour l'application Pharmacy Delivery Optimization.
 */

// ============================================
// Configuration de la carte (La Réunion)
// ============================================

export const REUNION_CENTER: [number, number] = [-21.1151, 55.5364];
export const REUNION_ZOOM = 10;
export const REUNION_BOUNDS: [[number, number], [number, number]] = [
  [-21.4, 55.2], // Sud-Ouest
  [-20.8, 55.8], // Nord-Est
];

// ============================================
// Configuration de l'optimisation
// ============================================

export const DELIVERY_TIME_PER_PATIENT = 1; // Temps de livraison par patient (en minutes)
export const PATIENTS_PER_PAGE = 20; // Nombre de patients par page pour l'impression A4

// ============================================
// Délais et timeouts
// ============================================

export const SAVE_DEBOUNCE_MS = 500; // Délai avant sauvegarde automatique (ms)
export const GEOCODING_TIMEOUT_MS = 5000; // Timeout pour le géocodage (ms)
export const OPTIMIZATION_TIMEOUT_MS = 30000; // Timeout pour l'optimisation (ms)

// ============================================
// Clés de stockage
// ============================================

export const LOCAL_STORAGE_PATIENTS_KEY = 'pharmacy-delivery-patients';
export const LOCAL_STORAGE_DATABASE_KEY = 'pharmacy-delivery-database';

// ============================================
// Configuration IndexedDB
// ============================================

export const DB_NAME = 'PharmacyDeliveryDB';
export const DB_VERSION = 1;
export const PATIENTS_STORE = 'patients';
export const DATABASE_PATIENTS_STORE = 'databasePatients';
export const OPTIMIZATION_HISTORY_STORE = 'optimizationHistory';

// ============================================
// Messages d'erreur
// ============================================

export const ERROR_MESSAGES = {
  GEOCODING_FAILED: 'Impossible de trouver les coordonnées GPS pour cette adresse.',
  OPTIMIZATION_FAILED: 'Impossible d\'optimiser l\'itinéraire.',
  SAVE_FAILED: 'Impossible de sauvegarder les données.',
  LOAD_FAILED: 'Impossible de charger les données.',
  INVALID_CSV: 'Format CSV invalide.',
  DUPLICATE_PATIENT: 'Un patient avec ces informations existe déjà.',
  NO_PATIENTS: 'Aucun patient à optimiser.',
};

// ============================================
// Messages de succès
// ============================================

export const SUCCESS_MESSAGES = {
  PATIENT_ADDED: 'Patient ajouté avec succès.',
  PATIENT_UPDATED: 'Patient modifié avec succès.',
  PATIENT_DELETED: 'Patient supprimé avec succès.',
  PATIENT_LOADED: (count: number) => `${count} patient(s) chargé(s) avec succès.`,
  TOUR_CLEARED: 'Tous les patients ont été supprimés de la tournée.',
  DATA_SAVED: 'Données sauvegardées avec succès.',
  DATA_IMPORTED: 'Données importées avec succès.',
  DATA_EXPORTED: 'Données exportées avec succès.',
};

// ============================================
// Configuration de l'impression
// ============================================

export const PRINT_CONFIG = {
  PATIENTS_PER_PAGE: 20,
  SQUARE_PADDING: ' '.repeat(10), // Espaces pour simuler le carré vide (2cm x 1cm)
  DATE_FORMAT: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' } as const,
};
