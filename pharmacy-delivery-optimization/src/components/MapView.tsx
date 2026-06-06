import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Patient, RoutePoint, OptimizationResult } from '../types';
import { REUNION_CENTER, REUNION_ZOOM, REUNION_BOUNDS } from '../types';

// Correction des icônes Leaflet (nécessaire pour React 18+)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const pharmacyIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Composant pour ajuster les limites de la carte
const MapBoundsUpdater: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [bounds, map]);
  
  return null;
};

interface MapViewProps {
  patients: Patient[];
  optimizationResult: OptimizationResult | null;
  height?: string;
}

const MapView: React.FC<MapViewProps> = ({
  patients,
  optimizationResult,
  height = '500px',
}) => {
  const [mapKey, setMapKey] = useState(0);

  // Recharger la carte lorsque les patients changent
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [patients]);

  // Calculer les limites en fonction des patients
  const getBounds = (): L.LatLngBoundsExpression => {
    if (patients.length === 0) {
      return REUNION_BOUNDS as L.LatLngBoundsExpression;
    }
    
    const lats = patients.map(p => p.latitude);
    const lons = patients.map(p => p.longitude);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);
    
    // Ajouter un padding
    const padding = 0.1;
    return [
      [minLat - padding, minLon - padding],
      [maxLat + padding, maxLon + padding],
    ] as L.LatLngBoundsExpression;
  };

  // Obtenir la route optimisée sous forme de tableau de coordonnées
  const getRouteCoordinates = (): [number, number][] => {
    if (!optimizationResult) return [];
    return optimizationResult.route.map(rp => [rp.patient.latitude, rp.patient.longitude]);
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        key={mapKey}
        center={REUNION_CENTER}
        zoom={REUNION_ZOOM}
        style={{ height: '100%', width: '100%' }}
        maxBounds={REUNION_BOUNDS as L.LatLngBoundsExpression}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Limites de La Réunion */}
        <MapBoundsUpdater bounds={getBounds()} />

        {/* Marqueurs des patients */}
        {patients.map((patient) => (
          <Marker
            key={patient.id}
            position={[patient.latitude, patient.longitude]}
            icon={patient.isPharmacy ? pharmacyIcon : defaultIcon}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                  {patient.isPharmacy ? '🏥 Pharmacie' : '👤 Patient'}
                </h4>
                <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                  {patient.nom}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                  {patient.adresse}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  Coordonnées: {patient.latitude.toFixed(4)}, {patient.longitude.toFixed(4)}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  Temps de livraison: {patient.tempsLivraison} min
                </p>
                {optimizationResult && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#52c41a' }}>
                    Ordre: {optimizationResult.route.find(rp => rp.patient.id === patient.id)?.order + 1 || 'Non inclus'}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Itinéraire optimisé */}
        {optimizationResult && optimizationResult.route.length > 1 && (
          <Polyline
            positions={getRouteCoordinates()}
            pathOptions={{ 
              color: '#f5222d', 
              weight: 4, 
              opacity: 0.8,
              fillOpacity: 0.5,
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
