/**
 * Service IndexedDB pour l'application d'optimisation des tournées de livraison.
 * Gère la persistance des patients, de la base de données locale et de l'historique des optimisations.
 */

// Types pour les données stockées
import { Patient, OptimizationResult } from '../types';

// Nom de la base de données et version
const DB_NAME = 'PharmacyDeliveryDB';
const DB_VERSION = 1;

// Noms des stores
const PATIENTS_STORE = 'patients';
const DATABASE_PATIENTS_STORE = 'databasePatients';
const OPTIMIZATION_HISTORY_STORE = 'optimizationHistory';

interface StoredOptimization extends OptimizationResult {
  id: string;
  timestamp: number;
}

// État de la base de données
let db: IDBDatabase | null = null;
let isInitializing = false;
const initPromises: Array<(db: IDBDatabase) => void> = [];

/**
 * Initialise la base de données IndexedDB.
 * Crée les stores nécessaires si la base n'existe pas.
 */
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    if (isInitializing) {
      // Si une initialisation est déjà en cours, attendre son résultat
      initPromises.push((initializedDb) => {
        db = initializedDb;
        resolve(initializedDb);
      });
      return;
    }

    isInitializing = true;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      isInitializing = false;
      console.error('Erreur lors de l\'ouverture de IndexedDB:', event);
      reject(new Error('Impossible d\'ouvrir la base de données IndexedDB'));
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      isInitializing = false;
      
      // Résoudre toutes les promesses en attente
      initPromises.forEach((callback) => callback(db!));
      initPromises.length = 0;
      
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Créer les stores si ils n'existent pas
      if (!db.objectStoreNames.contains(PATIENTS_STORE)) {
        const patientsStore = db.createObjectStore(PATIENTS_STORE, { keyPath: 'id' });
        patientsStore.createIndex('nom', 'nom', { unique: false });
        patientsStore.createIndex('isPharmacy', 'isPharmacy', { unique: false });
      }

      if (!db.objectStoreNames.contains(DATABASE_PATIENTS_STORE)) {
        const dbPatientsStore = db.createObjectStore(DATABASE_PATIENTS_STORE, { keyPath: 'id' });
        dbPatientsStore.createIndex('nom', 'nom', { unique: false });
        dbPatientsStore.createIndex('adresse', 'adresse', { unique: false });
      }

      if (!db.objectStoreNames.contains(OPTIMIZATION_HISTORY_STORE)) {
        const historyStore = db.createObjectStore(OPTIMIZATION_HISTORY_STORE, { keyPath: 'id' });
        historyStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

/**
 * Vérifie si IndexedDB est disponible dans le navigateur.
 */
export const isIndexedDBAvailable = (): boolean => {
  return typeof indexedDB !== 'undefined';
};

/**
 * Ferme la connexion à la base de données.
 */
export const closeDB = (): void => {
  if (db) {
    db.close();
    db = null;
  }
};

/**
 * Supprime la base de données (à utiliser avec prudence).
 */
export const deleteDB = async (): Promise<void> => {
  closeDB();
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Erreur lors de la suppression de la base de données:', event);
      reject(new Error('Impossible de supprimer la base de données'));
    };
  });
};

// ============================================
// Méthodes pour le store PATIENTS (tournée en cours)
// ============================================

/**
 * Récupère tous les patients de la tournée en cours.
 */
export const getAllPatients = async (): Promise<Patient[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PATIENTS_STORE, 'readonly');
    const store = transaction.objectStore(PATIENTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as Patient[]);
    };
    request.onerror = (event) => {
      console.error('Erreur lors de la récupération des patients:', event);
      reject(new Error('Impossible de récupérer les patients'));
    };
  });
};

/**
 * Récupère un patient par son ID.
 */
export const getPatientById = async (id: string): Promise<Patient | undefined> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PATIENTS_STORE, 'readonly');
    const store = transaction.objectStore(PATIENTS_STORE);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result as Patient | undefined);
    };
    request.onerror = (event) => {
      console.error('Erreur lors de la récupération du patient:', event);
      reject(new Error('Impossible de récupérer le patient'));
    };
  });
};

/**
 * Sauvegarde tous les patients de la tournée en cours.
 */
export const saveAllPatients = async (patients: Patient[]): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PATIENTS_STORE, 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE);

    // D'abord, supprimer tous les patients existants
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      // Puis ajouter tous les nouveaux patients
      patients.forEach((patient) => {
        store.add(patient);
      });
    };
    clearRequest.onerror = (event) => {
      console.error('Erreur lors de la suppression des patients:', event);
      reject(new Error('Impossible de sauvegarder les patients'));
    };

    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      console.error('Erreur lors de la transaction:', event);
      reject(new Error('Impossible de sauvegarder les patients'));
    };
  });
};

/**
 * Ajoute ou met à jour un patient dans la tournée en cours.
 */
export const savePatient = async (patient: Patient): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PATIENTS_STORE, 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE);
    const request = store.put(patient);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Erreur lors de la sauvegarde du patient:', event);
      reject(new Error('Impossible de sauvegarder le patient'));
    };
  });
};

/**
 * Supprime un patient de la tournée en cours.
 */
export const deletePatient = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(PATIENTS_STORE, 'readwrite');
    const store = transaction.objectStore(PATIENTS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Erreur lors de la suppression du patient:', event);
      reject(new Error('Impossible de supprimer le patient'));
    };
  });
};

// ============================================
// Méthodes pour le store DATABASE_PATIENTS (base de données locale)
// ============================================

/**
 * Récupère tous les patients de la base de données locale.
 */
export const getAllDatabasePatients = async (): Promise<Patient[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DATABASE_PATIENTS_STORE, 'readonly');
    const store = transaction.objectStore(DATABASE_PATIENTS_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as Patient[]);
    };
    request.onerror = (event) => {
      console.error('Erreur lors de la récupération des patients de la base de données:', event);
      reject(new Error('Impossible de récupérer les patients de la base de données'));
    };
  });
};

/**
 * Ajoute un patient à la base de données locale.
 */
export const addDatabasePatient = async (patient: Patient): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DATABASE_PATIENTS_STORE, 'readwrite');
    const store = transaction.objectStore(DATABASE_PATIENTS_STORE);
    const request = store.add(patient);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Erreur lors de l\'ajout du patient à la base de données:', event);
      // Si le patient existe déjà, ignorer l'erreur
      if ((event.target as IDBRequest).error?.name === 'ConstraintError') {
        resolve();
      } else {
        reject(new Error('Impossible d\'ajouter le patient à la base de données'));
      }
    };
  });
};

/**
 * Met à jour un patient dans la base de données locale.
 */
export const updateDatabasePatient = async (patient: Patient): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DATABASE_PATIENTS_STORE, 'readwrite');
    const store = transaction.objectStore(DATABASE_PATIENTS_STORE);
    const request = store.put(patient);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Erreur lors de la mise à jour du patient dans la base de données:', event);
      reject(new Error('Impossible de mettre à jour le patient dans la base de données'));
    };
  });
};

/**
 * Supprime un patient de la base de données locale.
 */
export const deleteDatabasePatient = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DATABASE_PATIENTS_STORE, 'readwrite');
    const store = transaction.objectStore(DATABASE_PATIENTS_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Erreur lors de la suppression du patient de la base de données:', event);
      reject(new Error('Impossible de supprimer le patient de la base de données'));
    };
  });
};

/**
 * Sauvegarde tous les patients de la base de données locale.
 */
export const saveAllDatabasePatients = async (patients: Patient[]): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DATABASE_PATIENTS_STORE, 'readwrite');
    const store = transaction.objectStore(DATABASE_PATIENTS_STORE);

    // D'abord, supprimer tous les patients existants
    const clearRequest = store.clear();
    clearRequest.onsuccess = () => {
      // Puis ajouter tous les nouveaux patients
      patients.forEach((patient) => {
        store.add(patient);
      });
    };
    clearRequest.onerror = (event) => {
      console.error('Erreur lors de la suppression des patients de la base de données:', event);
      reject(new Error('Impossible de sauvegarder les patients de la base de données'));
    };

    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = (event) => {
      console.error('Erreur lors de la transaction:', event);
      reject(new Error('Impossible de sauvegarder les patients de la base de données'));
    };
  });
};

// ============================================
// Méthodes pour le store OPTIMIZATION_HISTORY (optionnel)
// ============================================

/**
 * Sauvegarde un résultat d'optimisation dans l'historique.
 */
export const saveOptimizationToHistory = async (result: OptimizationResult): Promise<string> => {
  const database = await initDB();
  const id = `optimization-${Date.now()}`;
  const storedOptimization: StoredOptimization = {
    ...result,
    id,
    timestamp: Date.now(),
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(OPTIMIZATION_HISTORY_STORE, 'readwrite');
    const store = transaction.objectStore(OPTIMIZATION_HISTORY_STORE);
    const request = store.add(storedOptimization);

    request.onsuccess = () => resolve(id);
    request.onerror = (event) => {
      console.error('Erreur lors de la sauvegarde de l\'optimisation:', event);
      reject(new Error('Impossible de sauvegarder l\'optimisation'));
    };
  });
};

/**
 * Récupère l'historique des optimisations.
 */
export const getOptimizationHistory = async (): Promise<StoredOptimization[]> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(OPTIMIZATION_HISTORY_STORE, 'readonly');
    const store = transaction.objectStore(OPTIMIZATION_HISTORY_STORE);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result as StoredOptimization[]);
    };
    request.onerror = (event) => {
      console.error('Erreur lors de la récupération de l\'historique:', event);
      reject(new Error('Impossible de récupérer l\'historique'));
    };
  });
};

/**
 * Supprime une entrée de l'historique.
 */
export const deleteOptimizationFromHistory = async (id: string): Promise<void> => {
  const database = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(OPTIMIZATION_HISTORY_STORE, 'readwrite');
    const store = transaction.objectStore(OPTIMIZATION_HISTORY_STORE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error('Erreur lors de la suppression de l\'optimisation:', event);
      reject(new Error('Impossible de supprimer l\'optimisation'));
    };
  });
};

// ============================================
// Migration depuis localStorage
// ============================================

/**
 * Clé pour le localStorage des patients de la tournée.
 */
const LOCAL_STORAGE_PATIENTS_KEY = 'pharmacy-delivery-patients';

/**
 * Clé pour le localStorage de la base de données des patients.
 */
const LOCAL_STORAGE_DATABASE_KEY = 'pharmacy-delivery-database';

/**
 * Vérifie si des données existent dans localStorage.
 */
export const hasLocalStorageData = (): boolean => {
  return (
    localStorage.getItem(LOCAL_STORAGE_PATIENTS_KEY) !== null ||
    localStorage.getItem(LOCAL_STORAGE_DATABASE_KEY) !== null
  );
};

/**
 * Migre les données depuis localStorage vers IndexedDB.
 * Supprime les données de localStorage après migration.
 */
export const migrateFromLocalStorage = async (): Promise<void> => {
  if (!isIndexedDBAvailable()) {
    console.warn('IndexedDB non disponible, migration annulée');
    return;
  }

  try {
    // Récupérer les données de localStorage
    const patientsData = localStorage.getItem(LOCAL_STORAGE_PATIENTS_KEY);
    const databaseData = localStorage.getItem(LOCAL_STORAGE_DATABASE_KEY);

    if (!patientsData && !databaseData) {
      console.log('Aucune donnée à migrer depuis localStorage');
      return;
    }

    console.log('Migration des données depuis localStorage vers IndexedDB...');

    // Initialiser la base de données
    await initDB();

    // Migre les patients de la tournée
    if (patientsData) {
      try {
        const patients: Patient[] = JSON.parse(patientsData);
        await saveAllPatients(patients);
        console.log(`Migration réussie: ${patients.length} patients de la tournée`);
      } catch (error) {
        console.error('Erreur lors de la migration des patients de la tournée:', error);
      }
    }

    // Migre les patients de la base de données
    if (databaseData) {
      try {
        const databasePatients: Patient[] = JSON.parse(databaseData);
        await saveAllDatabasePatients(databasePatients);
        console.log(`Migration réussie: ${databasePatients.length} patients de la base de données`);
      } catch (error) {
        console.error('Erreur lors de la migration des patients de la base de données:', error);
      }
    }

    // Supprimer les données de localStorage après migration réussie
    localStorage.removeItem(LOCAL_STORAGE_PATIENTS_KEY);
    localStorage.removeItem(LOCAL_STORAGE_DATABASE_KEY);
    console.log('Migration terminée. Données supprimées de localStorage.');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    throw error;
  }
};

/**
 * Charge les données depuis IndexedDB ou localStorage (fallback).
 * Utilisé au démarrage de l'application.
 */
export const loadInitialData = async (): Promise<{
  patients: Patient[];
  databasePatients: Patient[];
}> => {
  if (!isIndexedDBAvailable()) {
    // Fallback vers localStorage
    const patientsData = localStorage.getItem(LOCAL_STORAGE_PATIENTS_KEY);
    const databaseData = localStorage.getItem(LOCAL_STORAGE_DATABASE_KEY);
    return {
      patients: patientsData ? JSON.parse(patientsData) : [],
      databasePatients: databaseData ? JSON.parse(databaseData) : [],
    };
  }

  try {
    // Essayer de charger depuis IndexedDB
    const [patients, databasePatients] = await Promise.all([
      getAllPatients(),
      getAllDatabasePatients(),
    ]);

    // Si IndexedDB est vide mais que localStorage a des données, migrer
    if (patients.length === 0 && databasePatients.length === 0 && hasLocalStorageData()) {
      await migrateFromLocalStorage();
      // Recharger les données après migration
      return loadInitialData();
    }

    return { patients, databasePatients };
  } catch (error) {
    console.error('Erreur lors du chargement des données depuis IndexedDB:', error);
    // Fallback vers localStorage
    const patientsData = localStorage.getItem(LOCAL_STORAGE_PATIENTS_KEY);
    const databaseData = localStorage.getItem(LOCAL_STORAGE_DATABASE_KEY);
    return {
      patients: patientsData ? JSON.parse(patientsData) : [],
      databasePatients: databaseData ? JSON.parse(databaseData) : [],
    };
  }
};
