import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Polyline, useMap, Marker } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
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

// Personnalisation des icônes de cluster
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 'small' : count < 100 ? 'medium' : 'large';
  
  // Couleurs basées sur la taille du cluster
  const bgColor = count < 10 ? '#1890ff' : count < 50 ? '#faad14' : '#f5222d';
  
  return L.divIcon({
    html: `<div style="background-color: ${bgColor}; border-radius: 50%; width: ${size === 'small' ? '30' : size === 'medium' ? '40' : '50'}px; height: ${size === 'small' ? '30' : size === 'medium' ? '40' : '50'}px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: ${size === 'small' ? '12' : size === 'medium' ? '14' : '16'}px;">
      ${count}
    </div>`,
    className: 'marker-cluster-custom',
    iconSize: L.point(
      size === 'small' ? 30 : size === 'medium' ? 40 : 50,
      size === 'small' ? 30 : size === 'medium' ? 40 : 50
    ),
  });
};

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

// Composant pour un marqueur individuel avec popup
const PatientMarker: React.FC<{
  patient: Patient;
  optimizationResult: OptimizationResult | null;
}> = ({ patient, optimizationResult }) => {
  const order = optimizationResult 
    ? optimizationResult.route.find((rp) => rp.patient.id === patient.id)?.order! + 1 
    : null;

  return (
    <Marker
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
          {order !== null && (
            <p style={{ margin: '4px 0', fontSize: '12px', color: '#52c41a' }}>
              Ordre: {order}
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

interface MapViewProps {
  patients: Patient[];
  optimizationResult: OptimizationResult | null;
  routePolyline: [number, number][] | null;
  height?: string;
  // Option pour activer/désactiver le clustering
  enableClustering?: boolean;
}

const MapView: React.FC<MapViewProps> = ({
  patients,
  optimizationResult,
  routePolyline,
  height = '500px',
  enableClustering = true,
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

  // Créer les marqueurs pour le clustering
  const markers = useMemo(() => {
    return patients.map((patient) => (
      <PatientMarker 
        key={patient.id} 
        patient={patient} 
        optimizationResult={optimizationResult}
      />
    ));
  }, [patients, optimizationResult]);

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

        {/* Marqueurs des patients avec clustering */}
        {enableClustering ? (
          <MarkerClusterGroup
            // Personnalisation de l'icône de cluster
            iconCreateFunction={createClusterIcon}
            // Options de clustering
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={true}
            zoomToBoundsOnClick={true}
            maxClusterRadius={50}
            disableClusteringAtZoom={15}
          >
            {markers}
          </MarkerClusterGroup>
        ) : (
          // Affichage sans clustering (ancien comportement)
          <>{markers}</>
        )}
      </MapContainer>
    </div>
  );
};

// Composant wrapper pour utiliser useMap
export default MapView;
