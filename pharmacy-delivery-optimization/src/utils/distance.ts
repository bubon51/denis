// Calcul de distance entre deux points GPS (formule de Haversine)
// Utilisé comme fallback si OSRM échoue

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

// Calcul de la distance totale d'un itinéraire (à vol d'oiseau)
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

// Décoder une polyline OSRM (format encoded polyline)
export const decodePolyline = (encoded: string): [number, number][] => {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const result: [number, number][] = [];
  
  while (index < encoded.length) {
    let b = 0;
    let shift = 0;
    let resultByte = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      resultByte |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const deltaLat = ((resultByte & 1) ? ~(resultByte >>> 1) : (resultByte >>> 1));
    lat += deltaLat;
    
    shift = 0;
    resultByte = 0;
    
    do {
      b = encoded.charCodeAt(index++) - 63;
      resultByte |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    
    const deltaLng = ((resultByte & 1) ? ~(resultByte >>> 1) : (resultByte >>> 1));
    lng += deltaLng;
    
    result.push([lat / 1e5, lng / 1e5]);
  }
  
  return result;
};

// Récupérer l'itinéraire routier via OSRM
export const fetchRoutePolyline = async (
  waypoints: [number, number][]
): Promise<[number, number][]> => {
  if (waypoints.length < 2) return [];
  
  try {
    // Construire l'URL avec tous les waypoints
    const coordinates = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=polyline`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PharmacyDeliveryOptimization/2.0 (bubon51)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    // Décoder la polyline
    return decodePolyline(data.routes[0].geometry);
  } catch (error) {
    console.error('Erreur OSRM:', error);
    // Retourner une ligne droite en fallback
    return waypoints;
  }
};

// Calculer la distance routière totale via OSRM
export const calculateRouteDistance = async (
  waypoints: [number, number][]
): Promise<number> => {
  if (waypoints.length < 2) return 0;
  
  try {
    const coordinates = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PharmacyDeliveryOptimization/2.0 (bubon51)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    // Distance en mètres, convertir en km
    return data.routes[0].distance / 1000;
  } catch (error) {
    console.error('Erreur calcul distance routière:', error);
    // Fallback: distance à vol d'oiseau
    let total = 0;
    for (let i = 0; i < waypoints.length - 1; i++) {
      total += haversineDistance(
        waypoints[i][0],
        waypoints[i][1],
        waypoints[i + 1][0],
        waypoints[i + 1][1]
      );
    }
    return total;
  }
};

// Calculer le temps total via OSRM
export const calculateRouteTime = async (
  waypoints: [number, number][]
): Promise<number> => {
  if (waypoints.length < 2) return 0;
  
  try {
    const coordinates = waypoints.map(wp => `${wp[1]},${wp[0]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=false`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PharmacyDeliveryOptimization/2.0 (bubon51)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }
    
    // Temps en secondes, convertir en minutes
    return Math.round(data.routes[0].duration / 60);
  } catch (error) {
    console.error('Erreur calcul temps routier:', error);
    // Fallback: estimation basée sur la distance
    const distance = calculateTotalDistance(waypoints.map((wp, i) => ({ latitude: wp[0], longitude: wp[1] })));
    return Math.round((distance / 40) * 60); // 40 km/h de moyenne
  }
};
