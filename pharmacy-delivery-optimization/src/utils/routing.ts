// Service pour calculer les distances réelles (en suivant les routes) entre deux points
// Utilise l'API OpenRouteService (gratuit pour un usage limité) ou OSRM

interface RoutingResult {
  distance: number; // en mètres
  duration: number; // en secondes
}

// Clé API OpenRouteService (à remplacer par votre propre clé si nécessaire)
// Pour obtenir une clé gratuite : https://openrouteservice.org/
// Note: Sans clé, on utilise OSRM qui est gratuit mais moins précis

// Fonction pour calculer la distance routière entre deux points à La Réunion
// Utilise OSRM (Open Source Routing Machine) qui est gratuit et ne nécessite pas de clé API
export const getRoutingDistance = async (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): Promise<RoutingResult> => {
  try {
    // Utiliser OSRM (gratuit, pas besoin de clé API)
    // URL pour La Réunion (utilise le profil voiture)
    const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PharmacyDeliveryOptimization/1.0',
      },
    });
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    return {
      distance: data.routes[0].distance, // en mètres
      duration: data.routes[0].duration, // en secondes
    };
  } catch (error) {
    console.error('Erreur de calcul de route:', error);
    // En cas d'erreur, retourner une estimation basée sur la distance à vol d'oiseau
    // avec un facteur de 1.3 (les routes sont généralement 30% plus longues)
    const haversineDistance = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    return {
      distance: haversineDistance * 1000 * 1.3, // Convertir km en mètres et appliquer facteur
      duration: (haversineDistance / 40) * 3600, // 40 km/h de moyenne, convertir en secondes
    };
  }
};

// Fonction de secours pour calculer la distance à vol d'oiseau (Haversine)
const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * 
    Math.cos((lat2 * Math.PI) / 180) * 
    Math.sin(dLon / 2) * 
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculer la distance totale d'un itinéraire en suivant les routes
export const calculateRouteDistance = async (
  points: { latitude: number; longitude: number }[]
): Promise<number> => {
  if (points.length < 2) return 0;
  
  let totalDistance = 0;
  
  // Calculer les distances entre chaque paire de points consécutifs
  for (let i = 0; i < points.length - 1; i++) {
    const result = await getRoutingDistance(
      points[i].latitude,
      points[i].longitude,
      points[i + 1].latitude,
      points[i + 1].longitude
    );
    totalDistance += result.distance; // en mètres
  }
  
  return totalDistance / 1000; // Convertir en km
};

// Calculer le temps total basé sur la distance routière
export const calculateRouteTime = async (
  points: { latitude: number; longitude: number }[],
  speedKmh: number = 40
): Promise<number> => {
  if (points.length < 2) return 0;
  
  let totalTime = 0;
  
  for (let i = 0; i < points.length - 1; i++) {
    const result = await getRoutingDistance(
      points[i].latitude,
      points[i].longitude,
      points[i + 1].latitude,
      points[i + 1].longitude
    );
    totalTime += result.duration; // en secondes
  }
  
  return Math.round(totalTime / 60); // Convertir en minutes
};

// Calculer la distance et le temps pour un itinéraire complet
export const calculateFullRouteMetrics = async (
  points: { latitude: number; longitude: number }[]
): Promise<{ distance: number; time: number }> => {
  if (points.length < 2) return { distance: 0, time: 0 };
  
  const distance = await calculateRouteDistance(points);
  const time = await calculateRouteTime(points);
  
  return { distance, time };
};
