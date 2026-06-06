import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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

// Composant pour afficher l'itinéraire avec Leaflet Routing Machine
const RoutingControl: React.FC<{ 
  waypoints: L.LatLngExpression[]; 
  routeColor?: string; 
}> = ({ waypoints, routeColor = '#f5222d' }) => {
  useEffect(() => {
    // Charger Leaflet Routing Machine dynamiquement
    const loadLrm = async () => {
      // Vérifier si L.Routing est déjà chargé
      if ((L as any).Routing) {
        createRoutingControl();
        return;
      }

      // Charger le CSS de Leaflet Routing Machine
      const lrmCss = document.createElement('link');
      lrmCss.rel = 'stylesheet';
      lrmCss.href = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css';
      document.head.appendChild(lrmCss);

      // Charger le JS de Leaflet Routing Machine
      const lrmJs = document.createElement('script');
      lrmJs.src = 'https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js';
      lrmJs.onload = createRoutingControl;
      lrmJs.onerror = () => {
        console.error('Failed to load Leaflet Routing Machine');
        // Fallback: afficher une ligne droite
        createPolylineFallback();
      };
      document.body.appendChild(lrmJs);
    };

    const createRoutingControl = () => {
      const map = (window as any).currentMap;
      if (!map || !waypoints.length) return;

      // Supprimer les contrôles de routage existants
      (map as any).eachLayer(layer => {
        if (layer instanceof (L as any).Routing.Control) {
          map.removeLayer(layer);
        }
      });

      // Créer le contrôle de routage
      const control = (L as any).Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp)),
        routeWhileDragging: false,
        show: false, // Ne pas afficher le panneau de contrôle
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false,
        lineOptions: {
          styles: [{ color: routeColor, weight: 4, opacity: 0.8 }],
        },
      }).addTo(map);

      // Masquer le panneau de contrôle
      setTimeout(() => {
        const container = control.getContainer();
        if (container) {
          container.style.display = 'none';
        }
      }, 100);
    };

    const createPolylineFallback = () => {
      const map = (window as any).currentMap;
      if (!map || !waypoints.length) return;

      // Supprimer les polylines existantes
      (map as any).eachLayer(layer => {
        if (layer instanceof L.Polyline) {
          map.removeLayer(layer);
        }
      });

      // Créer une polyline simple
      L.polyline(waypoints, {
        color: routeColor,
        weight: 4,
        opacity: 0.8,
      }).addTo(map);
    };

    // Stocker la référence de la carte
    (window as any).currentMap = null;

    loadLrm();

    return () => {
      // Nettoyage
      const map = (window as any).currentMap;
      if (map) {
        (map as any).eachLayer(layer => {
          if (layer instanceof (L as any).Routing.Control || layer instanceof L.Polyline) {
            map.removeLayer(layer);
          }
        });
      }
    };
  }, [waypoints, routeColor]);

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

  // Recharger la carte lorsque les patients ou l'itinéraire changent
  useEffect(() => {
    setMapKey(prev => prev + 1);
  }, [patients, optimizationResult]);

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

  // Obtenir les waypoints pour l'itinéraire (incluant le retour à la pharmacie)
  const getRouteWaypoints = (): L.LatLngExpression[] => {
    if (!optimizationResult || optimizationResult.route.length === 0) {
      return [];
    }
    
    // Inclure tous les points de l'itinéraire (y compris le retour à la pharmacie)
    return optimizationResult.route.map(rp => [rp.patient.latitude, rp.patient.longitude] as L.LatLngExpression);
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
        whenCreated={(map) => {
          (window as any).currentMap = map;
        }}
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
            position={[patient.latitude, patient.longitude] as L.LatLngExpression}
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
                {optimizationResult && (
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#52c41a' }}>
                    Ordre: {optimizationResult.route.find((rp) => rp.patient.id === patient.id)?.order! + 1 || 'Non inclus'}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Itinéraire avec Leaflet Routing Machine */}
        {optimizationResult && optimizationResult.route.length > 1 && (
          <RoutingControl 
            waypoints={getRouteWaypoints()} 
            routeColor="#f5222d"
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
