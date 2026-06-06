// Service de géocodage pour convertir une adresse en coordonnées GPS
// Utilise l'API Nominatim d'OpenStreetMap (gratuit, pas besoin de clé API)

interface GeocodeResult {
  latitude: number;
  longitude: number;
}

// Fonction pour géocoder une adresse à La Réunion
// Utilise Nominatim (OpenStreetMap) avec un timeout et une gestion d'erreur
export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  // Nettoyer l'adresse pour l'URL
  const cleanAddress = encodeURIComponent(address.trim());
  
  // Ajouter "La Réunion" à l'adresse pour améliorer la précision
  const query = `${cleanAddress}, La Réunion`;
  
  try {
    // Utiliser Nominatim API (OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'PharmacyDeliveryOptimization/1.0',
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${cleanAddress}, Réunion&limit=1`,
        {
          headers: {
            'User-Agent': 'PharmacyDeliveryOptimization/1.0',
          },
        }
      );
      const reunionData = await reunionResponse.json();
      if (reunionData && reunionData.length > 0) {
        return {
          latitude: parseFloat(reunionData[0].lat),
          longitude: parseFloat(reunionData[0].lon),
        };
      }
      throw new Error('Adresse non trouvée à La Réunion');
    }
    
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
  } catch (error) {
    console.error('Erreur de géocodage:', error);
    // Retourner des coordonnées par défaut pour La Réunion en cas d'erreur
    // ou lancer une erreur
    throw new Error(`Impossible de géocoder l'adresse: ${address}. ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Fonction pour géocoder plusieurs adresses (pour l'import CSV)
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
