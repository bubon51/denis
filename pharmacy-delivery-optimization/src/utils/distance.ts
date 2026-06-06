// Calcul de distance entre deux points GPS (formule de Haversine)

export const haversineDistance = (
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

// Calcul de la distance totale d'un itinéraire
export const calculateTotalDistance = (
  points: { latitude: number; longitude: number }[]
): number => {
  if (points.length < 2) return 0;
  
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += haversineDistance(
      points[i].latitude,
      points[i].longitude,
      points[i + 1].latitude,
      points[i + 1].longitude
    );
  }
  return total;
};

// Calcul du temps total basé uniquement sur la distance (vitesse moyenne : 40 km/h)
export const calculateTotalTime = (
  totalDistance: number,
  speedKmh: number = 40
): number => {
  // Convertir distance en temps (heures) puis en minutes
  return Math.round((totalDistance / speedKmh) * 60);
};
