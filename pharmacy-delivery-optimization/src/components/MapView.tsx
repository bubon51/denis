import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Patient, OptimizationResult } from '../types';
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

// Composant pour afficher l'itinéraire
const RouteLayer: React.FC<{ 
  routePolyline: [number, number][] | null;
  color?: string;
}> = ({ routePolyline, color = '#f5222d' }) => {
  if (!routePolyline || routePolyline.length < 2) {
    return null;
  }

  return (
    <Polyline
      positions={routePolyline as L.LatLngExpression[]}
      pathOptions={{
        color: color,
        weight: 4,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
};

interface MapViewProps {
  patients: Patient[];
  optimizationResult: OptimizationResult | null;
  routePolyline: [number, number][] | null;
  height?: string;
}

const MapView: React.FC<MapViewProps> = ({
  patients,
  optimizationResult,
  routePolyline,
  height = '500px',
}) => {
  const [mapKey, setMapKey] = useState(0);

  // Recharger la carte lorsque les patients ou l'itinéraire changent
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [patients, routePolyline]);

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

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
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

        {/* Itinéraire routier (en dessous des marqueurs) */}
        <RouteLayer routePolyline={routePolyline} color="#f5222d" />

        {/* Marqueurs des patients */}
        {patients.map((patient) => (
          <Marker
            key={patient.id}
            position={[patient.latitude, patient.longitude] as L.LatLngExpression}
            icon={patient.isPharmacy ? pharmacyIcon : defaultIcon}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                  {patient.isPharmacy ? '🏥 Pharmacie' : '👤 Patient'}
                </h4>
                <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
                  {patient.prenom && `${patient.prenom} `}{patient.nom}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                  {patient.adresse}
                </p>
                <p style={{ margin: '4px 0', fontSize: '12px' }}>
                  Coordonnées: {patient.latitude.toFixed(4)}, {patient.longitude.toFixed(4)}
                </p>
                {optimizationResult && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#52c41a' }}>
                    Ordre: {optimizationResult.route.find((rp) => rp.patient.id === patient.id)?.order! + 1 || 'Non inclus'}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

// Composant wrapper pour utiliser useMap
const MapViewWrapper: React.FC<MapViewProps> = (props) => {
  return <MapView {...props} />;
};

export default MapViewWrapper;
