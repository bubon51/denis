// Service de géocodage pour convertir une adresse en coordonnées GPS
// Utilise l'API Nominatim d'OpenStreetMap (gratuit, pas besoin de clé API)

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

// Cache local pour éviter de géocoder plusieurs fois la même adresse
const geocodeCache: Record<string, GeocodeResult> = {};

// Fonction pour géocoder une adresse à La Réunion
export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  // Nettoyer l'adresse
  const cleanAddress = address.trim();
  
  // Vérifier le cache
  if (geocodeCache[cleanAddress]) {
    return geocodeCache[cleanAddress];
  }
  
  try {
    // Ajouter "La Réunion" à l'adresse pour améliorer la précision
    const query = encodeURIComponent(`${cleanAddress}, La Réunion`);
    
    // Utiliser Nominatim API (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PharmacyDeliveryOptimization/2.0 (bubon51)',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Aucun résultat trouvé pour cette adresse');
    }
    
    const result = data[0];
    
    // Vérifier que le résultat est bien à La Réunion
    if (result.display_name && !result.display_name.includes('Réunion')) {
      // Essayer une recherche plus spécifique
      const reunionResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanAddress)}, Réunion&limit=1`,
        {
          headers: {
            'User-Agent': 'PharmacyDeliveryOptimization/2.0 (bubon51)',
          },
        }
      );
      const reunionData = await reunionResponse.json();
      if (reunionData && reunionData.length > 0) {
        const finalResult = {
          latitude: parseFloat(reunionData[0].lat),
          longitude: parseFloat(reunionData[0].lon),
        };
        geocodeCache[cleanAddress] = finalResult;
        return finalResult;
      }
      throw new Error('Adresse non trouvée à La Réunion');
    }
    
    const finalResult = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
    
    // Mettre en cache
    geocodeCache[cleanAddress] = finalResult;
    
    return finalResult;
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    // Retourner des coordonnées par défaut pour La Réunion en cas d'erreur
    throw new Error(`Impossible de géocoder l'adresse: ${cleanAddress}. ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Fonction pour géocoder plusieurs adresses
export const geocodeAddresses = async (addresses: string[]): Promise<GeocodeResult[]> => {
  const results: GeocodeResult[] = [];
  
  for (const address of addresses) {
    try {
      const result = await geocodeAddress(address);
      results.push(result);
    } catch (error) {
      console.error(`Erreur de géocodage pour ${address}:`, error);
      // Utiliser des coordonnées par défaut
      results.push({ latitude: -21.1151, longitude: 55.5364 }); // Centre de La Réunion
    }
  }
  
  return results;
};

// Vérifier si des coordonnées sont valides pour La Réunion
export const isValidReunionCoordinates = (lat: number, lon: number): boolean => {
  // Limites approximatives de La Réunion
  return (
    lat >= -21.4 && lat <= -20.8 &&
    lon >= 55.2 && lon <= 55.8
  );
};

// Effacer le cache de géocodage
export const clearGeocodeCache = (): void => {
  Object.keys(geocodeCache).forEach(key => delete geocodeCache[key]);
};
