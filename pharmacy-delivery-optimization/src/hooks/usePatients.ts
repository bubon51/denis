import { useState, useCallback, useEffect } from 'react';
import { Patient, OptimizationResult } from '../types';
import { getDefaultPatients } from '../data/defaultPatients';
import { optimizeRoute as optimizeRouteFunction } from '../utils/tsp';
import { exportToCSV, importFromCSV } from '../utils/csv';
import { geocodeAddress } from '../utils/geocoding';
import { calculateFullRouteMetrics } from '../utils/routing';

interface UsePatientsResult {
  patients: Patient[];
  setPatients: (patients: Patient[]) => void;
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
  getPatientByName: (name: string) => Patient | undefined;
}

export const usePatients = (): UsePatientsResult => {
  const [patients, setPatients] = useState<Patient[]>(() => {
    // Charger depuis localStorage si disponible
    const saved = localStorage.getItem('delivery-patients');
    return saved ? JSON.parse(saved) : getDefaultPatients();
  });
  
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('delivery-patients', JSON.stringify(patients));
  }, [patients]);

  // Filtrer les patients en fonction de la recherche
  const filteredPatients = useCallback(() => {
    if (!searchQuery.trim()) return patients;
    const query = searchQuery.toLowerCase();
    return patients.filter(p => 
      p.nom.toLowerCase().includes(query) || 
      p.adresse.toLowerCase().includes(query)
    );
  }, [patients, searchQuery])();

  // Ajouter un patient avec géocodage automatique
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
      setPatients(prev => [...prev, newPatient]);
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      throw error;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

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
      
      setPatients(prev => 
        prev.map(p => p.id === id ? { ...p, ...finalData } : p)
      );
    } catch (error) {
      console.error('Erreur de géocodage:', error);
      throw error;
    } finally {
      setIsGeocoding(false);
    }
  }, [patients]);

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
  }, []);

  // Optimiser l'itinéraire avec calcul des distances réelles
  const optimizeRoute = useCallback(async () => {
    setIsOptimizing(true);
    
    try {
      // Optimiser l'ordre des patients (inclut déjà le retour à la pharmacie)
      const result = optimizeRouteFunction(patients);
      
      // Calculer les métriques réelles (distance routière, temps réel)
      // Inclut le retour à la pharmacie
      const routePatients = result.route.map(rp => rp.patient);
      const { distance, time } = await calculateFullRouteMetrics(routePatients);
      
      // Mettre à jour le résultat avec les distances réelles
      setOptimizationResult({
        ...result,
        totalDistance: Math.round(distance * 100) / 100,
        totalTime: time,
      });
    } catch (error) {
      console.error('Erreur lors de l\'optimisation:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [patients]);

  // Fonction pour récupérer un patient par son nom (pour l'autocomplétion)
  const getPatientByName = useCallback((name: string): Patient | undefined => {
    return patients.find(p => p.nom.toLowerCase() === name.toLowerCase());
  }, [patients]);

  // Exporter en CSV
  const exportPatients = useCallback(() => {
    return exportToCSV(patients);
  }, [patients]);

  // Importer depuis CSV
  const importPatients = useCallback((csvContent: string) => {
    try {
      const importedPatients = importFromCSV(csvContent);
      // Conserver la pharmacie existante si elle existe
      const existingPharmacy = patients.find(p => p.isPharmacy);
      
      setPatients(() => {
        const newPatients = [...importedPatients];
        // Ajouter la pharmacie existante si elle n'est pas dans l'import
        if (existingPharmacy && !importedPatients.some(p => p.isPharmacy)) {
          newPatients.unshift(existingPharmacy);
        }
        return newPatients;
      });
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      throw error;
    }
  }, [patients]);

  // Réinitialiser aux données par défaut
  const resetToDefault = useCallback(() => {
    setPatients(getDefaultPatients());
    setOptimizationResult(null);
  }, []);

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
    getPatientByName,
  };
};
