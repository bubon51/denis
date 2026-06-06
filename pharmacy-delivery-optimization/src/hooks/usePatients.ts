import { useState, useCallback, useEffect } from 'react';
import { Patient, OptimizationResult, DEFAULT_PHARMACY, DELIVERY_TIME_PER_PATIENT } from '../types';
import { getDefaultPatients } from '../data/defaultPatients';
import { optimizeRoute as optimizeRouteFunction } from '../utils/tsp';
import { exportToCSV, importFromCSV } from '../utils/csv';
import { geocodeAddress, clearGeocodeCache } from '../utils/geocoding';
import { calculateRouteDistance, calculateRouteTime, fetchRoutePolyline } from '../utils/distance';

interface UsePatientsResult {
  patients: Patient[];
  setPatients: (patients: Patient[] | ((prev: Patient[]) => Patient[])) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => Promise<void>;
  updatePatient: (id: string, updatedPatient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => void;
  optimizationResult: OptimizationResult | null;
  isOptimizing: boolean;
  optimizeRoute: () => Promise<void>;
  exportPatients: () => string;
  importPatients: (csvContent: string) => void;
  resetToDefault: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredPatients: Patient[];
  isGeocoding: boolean;
  routePolyline: [number, number][] | null;
  getPatientByName: (nom: string, prenom: string) => Patient | undefined;
  // Nouvelle fonctionnalité : base de données de patients
  databasePatients: Patient[];
  addToDatabase: (patient: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => Promise<void>;
  loadFromDatabase: (patientIds: string[]) => void;
  clearCurrentTour: () => void;
}

// Clés pour le localStorage
const STORAGE_KEY = 'pharmacy-delivery-patients';
const DATABASE_KEY = 'pharmacy-delivery-database';

// Fonction pour normaliser les patients et s'assurer que la pharmacie a les bonnes coordonnées
const normalizePatients = (patients: Patient[]): Patient[] => {
  const pharmacyIndex = patients.findIndex(p => p.isPharmacy);
  if (pharmacyIndex !== -1) {
    // Remplacer la pharmacie par la DEFAULT_PHARMACY
    const normalized = [...patients];
    normalized[pharmacyIndex] = DEFAULT_PHARMACY;
    return normalized;
  }
  // Si pas de pharmacie, en ajouter une
  return [DEFAULT_PHARMACY, ...patients];
};

export const usePatients = (): UsePatientsResult => {
  const [patients, _setPatients] = useState<Patient[]>(() => {
    // Charger depuis localStorage si disponible
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return normalizePatients(parsed);
      } catch {
        return getDefaultPatients();
      }
    }
    return getDefaultPatients();
  });

  // Wrapper pour setPatients qui normalise toujours les données
  const setPatients = useCallback((patients: Patient[] | ((prev: Patient[]) => Patient[])) => {
    _setPatients(prev => {
      const newPatients = typeof patients === 'function' ? patients(prev) : patients;
      return normalizePatients(newPatients);
    });
  }, []);
  
  // Base de données de patients (sans la pharmacie)
  const [databasePatients, setDatabasePatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem(DATABASE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [routePolyline, setRoutePolyline] = useState<[number, number][] | null>(null);

  // Sauvegarder dans localStorage à chaque changement (avec throttling pour éviter les sauvegardes trop fréquentes)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    }, 300);
    return () => clearTimeout(timer);
  }, [patients]);

  // Sauvegarder la base de données dans localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DATABASE_KEY, JSON.stringify(databasePatients));
    }, 300);
    return () => clearTimeout(timer);
  }, [databasePatients]);

  // Filtrer les patients en fonction de la recherche
  const filteredPatients = useCallback(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p => 
      p.nom.toLowerCase().includes(query) || 
      p.prenom.toLowerCase().includes(query) ||
      p.adresse.toLowerCase().includes(query) ||
      `${p.prenom} ${p.nom}`.toLowerCase().includes(query)
    );
  }, [patients, searchQuery])();

  // Ajouter un patient avec géocodage automatique (à la tournée ET à la base de données)
  const addPatient = useCallback(async (patientData: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => {
    setIsGeocoding(true);
    try {
      // Géocoder l'adresse pour obtenir les coordonnées
      const { latitude, longitude } = await geocodeAddress(patientData.adresse);
      
      const newPatient: Patient = {
        ...patientData,
        id: `patient-${Date.now()}`,
        latitude,
        longitude,
        isPharmacy: false,
      };
      
      // Ajouter à la tournée actuelle et à la base de données dans une seule opération
      setPatients(prev => {
        const updatedPatients = [...prev, newPatient];
        return updatedPatients;
      });
      
      // Ajouter aussi à la base de données (si le patient n'existe pas déjà)
      setDatabasePatients(prev => {
        const exists = prev.some(p => 
          p.nom.toLowerCase() === patientData.nom.toLowerCase() &&
          p.prenom.toLowerCase() === (patientData.prenom || '').toLowerCase() &&
          p.adresse.toLowerCase() === patientData.adresse.toLowerCase()
        );
        if (!exists) {
          return [...prev, newPatient];
        }
        return prev;
      });
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      throw error;
    } finally {
      setIsGeocoding(false);
    }
  }, [setPatients, setDatabasePatients]);

  // Mettre à jour un patient avec géocodage automatique si l'adresse change
  const updatePatient = useCallback(async (id: string, updatedData: Partial<Patient>) => {
    const patient = patients.find(p => p.id === id);
    if (!patient) return;

    setIsGeocoding(true);
    try {
      let finalData = { ...updatedData };
      
      // Si l'adresse a changé, recalculer les coordonnées
      if (updatedData.adresse && updatedData.adresse !== patient.adresse) {
        const { latitude, longitude } = await geocodeAddress(updatedData.adresse);
        finalData = { ...finalData, latitude, longitude };
      }
      
      const updatedPatient = { ...patient, ...finalData };
      
      // Mettre à jour dans la tournée actuelle
      setPatients(prev => 
        prev.map(p => p.id === id ? updatedPatient : p)
      );
      
      // Mettre à jour aussi dans la base de données si le patient y est présent
      // (pour maintenir la cohérence entre tournée et base de données)
      setDatabasePatients(prev => 
        prev.map(p => p.id === id ? updatedPatient : p)
      );
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      throw error;
    } finally {
      setIsGeocoding(false);
    }
  }, [patients, setPatients, setDatabasePatients]);

  // Supprimer un patient (ne pas supprimer la pharmacie)
  const deletePatient = useCallback((id: string) => {
    setPatients(prev => {
      const pharmacy = prev.find(p => p.isPharmacy);
      if (pharmacy?.id === id) {
        // Ne pas supprimer la pharmacie
        return prev;
      }
      return prev.filter(p => p.id !== id);
    });
    
    // Réinitialiser l'optimisation car la liste des patients a changé
    setOptimizationResult(null);
    setRoutePolyline(null);
  }, [setPatients, setOptimizationResult, setRoutePolyline]);

  // Optimiser l'itinéraire avec calcul des distances routières
  const optimizeRoute = useCallback(async () => {
    setIsOptimizing(true);
    setRoutePolyline(null);
    setOptimizationResult(null);
    
    try {
      // Capturer les patients actuels pour éviter les problèmes de closure
      const currentPatients = patients;
      
      // Optimiser l'ordre des patients
      const result = optimizeRouteFunction(currentPatients);
      
      // Extraire les waypoints pour le calcul routier
      const waypoints: [number, number][] = result.route.map(rp => [rp.patient.latitude, rp.patient.longitude]);
      
      // Récupérer la polyline de l'itinéraire
      const polyline = await fetchRoutePolyline(waypoints);
      setRoutePolyline(polyline);
      
      // Calculer les métriques réelles via OSRM
      const distance = await calculateRouteDistance(waypoints);
      const drivingTime = await calculateRouteTime(waypoints);
      
      // Calculer le temps total : temps de trajet + temps de livraison (1 min par patient)
      // Compter le nombre de patients (exclure la pharmacie du compte de livraison)
      const patientCount = currentPatients.filter(p => !p.isPharmacy).length;
      const deliveryTime = patientCount * DELIVERY_TIME_PER_PATIENT;
      const totalTime = drivingTime + deliveryTime;
      
      // Mettre à jour le résultat avec les distances réelles
      setOptimizationResult({
        ...result,
        totalDistance: Math.round(distance * 100) / 100,
        totalTime: totalTime,
      });
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
      // Réinitialiser en cas d'erreur
      setOptimizationResult(null);
      setRoutePolyline(null);
    } finally {
      setIsOptimizing(false);
    }
  }, [patients, setOptimizationResult, setRoutePolyline, setIsOptimizing]);

  // Exporter en CSV
  const exportPatients = useCallback(() => {
    return exportToCSV(patients);
  }, [patients]);

  // Importer depuis CSV
  const importPatients = useCallback((csvContent: string) => {
    try {
      const importedPatients = importFromCSV(csvContent);
      // Toujours utiliser la DEFAULT_PHARMACY, pas celle de l'import
      setPatients(() => {
        const newPatients = [...importedPatients];
        // Remplacer ou ajouter la pharmacie par défaut
        const pharmacyIndex = newPatients.findIndex(p => p.isPharmacy);
        if (pharmacyIndex !== -1) {
          newPatients[pharmacyIndex] = DEFAULT_PHARMACY;
        } else {
          newPatients.unshift(DEFAULT_PHARMACY);
        }
        return newPatients;
      });
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  }, [setPatients]);

  // Réinitialiser aux données par défaut
  const resetToDefault = useCallback(() => {
    setPatients(getDefaultPatients());
    setOptimizationResult(null);
    setRoutePolyline(null);
    setSearchQuery('');
    clearGeocodeCache();
  }, [setPatients, setOptimizationResult, setRoutePolyline, setSearchQuery]);

  // Fonction pour récupérer un patient par son nom et prénom
  const getPatientByName = useCallback((nom: string, prenom: string): Patient | undefined => {
    return patients.find(p => 
      p.nom.toLowerCase() === nom.toLowerCase() && 
      p.prenom.toLowerCase() === prenom.toLowerCase()
    );
  }, [patients]);

  // Ajouter un patient à la base de données (sans la pharmacie)
  const addToDatabase = useCallback(async (patientData: Omit<Patient, 'id' | 'isPharmacy' | 'latitude' | 'longitude'>) => {
    setIsGeocoding(true);
    try {
      // Géocoder l'adresse pour obtenir les coordonnées
      const { latitude, longitude } = await geocodeAddress(patientData.adresse);
      
      const newPatient: Patient = {
        ...patientData,
        id: `db-patient-${Date.now()}`,
        latitude,
        longitude,
        isPharmacy: false,
      };
      
      // Vérifier que le patient n'existe pas déjà (par nom+prénom+adresse)
      const exists = databasePatients.some(p => 
        p.nom.toLowerCase() === patientData.nom.toLowerCase() &&
        p.prenom.toLowerCase() === (patientData.prenom || '').toLowerCase() &&
        p.adresse.toLowerCase() === patientData.adresse.toLowerCase()
      );
      
      if (!exists) {
        setDatabasePatients(prev => [...prev, newPatient]);
      }
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      throw error;
    } finally {
      setIsGeocoding(false);
    }
  }, [databasePatients, setDatabasePatients, setIsGeocoding]);

  // Charger des patients depuis la base de données dans la tournée actuelle
  const loadFromDatabase = useCallback((patientIds: string[]) => {
    const selectedPatients = databasePatients.filter(p => patientIds.includes(p.id));
    // Ajouter les patients sélectionnés à la tournée actuelle (sans dupliquer la pharmacie)
    setPatients(prev => {
      const pharmacy = prev.find(p => p.isPharmacy);
      const newPatients = [...pharmacy ? [pharmacy] : [], ...selectedPatients];
      return newPatients;
    });
    // Réinitialiser l'optimisation car la liste des patients a changé
    setOptimizationResult(null);
    setRoutePolyline(null);
  }, [databasePatients, setPatients, setOptimizationResult, setRoutePolyline]);

  // Supprimer tous les patients de la tournée actuelle (sauf la pharmacie)
  const clearCurrentTour = useCallback(() => {
    setPatients([DEFAULT_PHARMACY]);
    setOptimizationResult(null);
    setRoutePolyline(null);
    setSearchQuery('');
  }, [setPatients, setOptimizationResult, setRoutePolyline, setSearchQuery]);

  return {
    patients,
    setPatients,
    addPatient,
    updatePatient,
    deletePatient,
    optimizationResult,
    isOptimizing,
    optimizeRoute,
    exportPatients,
    importPatients,
    resetToDefault,
    searchQuery,
    setSearchQuery,
    filteredPatients,
    isGeocoding,
    routePolyline,
    getPatientByName,
    // Base de données
    databasePatients,
    addToDatabase,
    loadFromDatabase,
    clearCurrentTour,
  };
};
