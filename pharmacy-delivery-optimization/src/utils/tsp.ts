import { Patient, RoutePoint, OptimizationResult } from '../types';
import { haversineDistance, calculateTotalDistance, calculateTotalTime } from './distance';

// Algorithme glouton (Nearest Neighbor) pour résoudre le TSP
// Commence par la pharmacie (point de départ) et ajoute le patient le plus proche à chaque étape
export const greedyTSP = (patients: Patient[]): OptimizationResult => {
  if (patients.length === 0) {
    return {
      route: [],
      totalDistance: 0,
      totalTime: 0,
      optimized: false,
    };
  }

  // Trouver la pharmacie (point de départ)
  const pharmacy = patients.find(p => p.isPharmacy) || patients[0];
  const otherPatients = patients.filter(p => !p.isPharmacy);

  // Si seulement la pharmacie, retourner un résultat vide
  if (otherPatients.length === 0) {
    return {
      route: [{ patient: pharmacy, order: 0 }],
      totalDistance: 0,
      totalTime: 0,
      optimized: true,
    };
  }

  // Algorithme glouton
  const unvisited = [...otherPatients];
  const route: RoutePoint[] = [{ patient: pharmacy, order: 0 }];
  let current = pharmacy;

  while (unvisited.length > 0) {
    // Trouver le patient non visité le plus proche
    let nearestIndex = 0;
    let minDistance = haversineDistance(
      current.latitude,
      current.longitude,
      unvisited[0].latitude,
      unvisited[0].longitude
    );

    for (let i = 1; i < unvisited.length; i++) {
      const dist = haversineDistance(
        current.latitude,
        current.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    // Ajouter le patient le plus proche à l'itinéraire
    const nextPatient = unvisited.splice(nearestIndex, 1)[0];
    route.push({ patient: nextPatient, order: route.length });
    current = nextPatient;
  }

  // Calculer la distance totale
  const routePatients = route.map(rp => rp.patient);
  const totalDistance = calculateTotalDistance(routePatients);
  const totalTime = calculateTotalTime(totalDistance);

  return {
    route,
    totalDistance: Math.round(totalDistance * 100) / 100, // Arrondir à 2 décimales
    totalTime,
    optimized: true,
  };
};

// Algorithme 2-opt pour améliorer la solution gloutonne
export const twoOptOptimization = (
  patients: Patient[],
  maxIterations: number = 100
): OptimizationResult => {
  // Commencer avec la solution gloutonne
  let result = greedyTSP(patients);
  
  if (result.route.length <= 2) {
    return result;
  }

  let improved = true;
  let iterations = 0;

  while (improved && iterations < maxIterations) {
    improved = false;
    iterations++;

    for (let i = 1; i < result.route.length - 2; i++) {
      for (let j = i + 1; j < result.route.length - 1; j++) {
        // Créer une nouvelle route avec l'échange 2-opt
        const newRoute = twoOptSwap(result.route, i, j);
        
        // Calculer la nouvelle distance
        const newRoutePatients = newRoute.map(rp => rp.patient);
        const newDistance = calculateTotalDistance(newRoutePatients);
        
        // Si amélioration, garder la nouvelle route
        if (newDistance < result.totalDistance) {
          result = {
            route: newRoute,
            totalDistance: newDistance,
            totalTime: calculateTotalTime(newDistance),
            optimized: true,
          };
          improved = true;
        }
      }
    }
  }

  return {
    ...result,
    totalDistance: Math.round(result.totalDistance * 100) / 100,
  };
};

// Effectuer un échange 2-opt sur la route
const twoOptSwap = (route: RoutePoint[], i: number, j: number): RoutePoint[] => {
  const newRoute = [...route];
  
  // Inverser l'ordre entre i et j
  for (let k = i, l = j; k < l; k++, l--) {
    const temp = newRoute[k];
    newRoute[k] = newRoute[l];
    newRoute[l] = temp;
    
    // Mettre à jour les ordres
    newRoute[k].order = k;
    newRoute[l].order = l;
  }
  
  // Recalculer tous les ordres
  return newRoute.map((rp, index) => ({ ...rp, order: index }));
};

// Optimisation complète (glouton + 2-opt)
export const optimizeRoute = (patients: Patient[]): OptimizationResult => {
  // Si moins de 3 points, le glouton suffit
  if (patients.length <= 3) {
    return greedyTSP(patients);
  }
  
  // Sinon, utiliser glouton + 2-opt
  return twoOptOptimization(patients);
};
