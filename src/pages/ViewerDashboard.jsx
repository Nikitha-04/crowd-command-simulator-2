import React, { useState, useEffect } from 'react';
import useStore from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Navigation, Users, ArrowRight, LogOut, CheckCircle, MapPin, Crosshair, Sun, Moon, LayoutGrid, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import InsideView from '../components/InsideView';
import IncidentModal from '../components/IncidentModal';

// Fix Leaflet default marker icon issue in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const VENUES = {
  'chinnaswamy': { name: 'Chinnaswamy Stadium', lat: 12.9788, lng: 77.5996 },
  'phoenix': { name: 'Phoenix Marketcity', lat: 12.9960, lng: 77.6957 },
  'nexus': { name: 'Nexus Mall', lat: 12.9345, lng: 77.6112 }
};

const RecenterMap = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 17);
  }, [center, map]);
  return null;
};

const generateZonePolygons = (centerLat, centerLng) => {
  const radius = 0.0015;
  const zones = [];
  for (let i = 0; i < 5; i++) {
    const angle1 = (i * 2 * Math.PI) / 5;
    const angle2 = ((i + 1) * 2 * Math.PI) / 5;
    zones.push([
      [centerLat, centerLng],
      [centerLat + radius * Math.cos(angle1), centerLng + radius * Math.sin(angle1)],
      [centerLat + radius * Math.cos((angle1+angle2)/2) * 1.2, centerLng + radius * Math.sin((angle1+angle2)/2) * 1.2],
      [centerLat + radius * Math.cos(angle2), centerLng + radius * Math.sin(angle2)]
    ]);
  }
  return zones;
};

const ViewerDashboard = () => {
  const { zones, currentUser, logout, theme, setTheme } = useStore();
  const navigate = useNavigate();

  const [selectedVenueId, setSelectedVenueId] = useState('chinnaswamy');
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  
  // Toggle between 'map' and 'inside'
  const [viewMode, setViewMode] = useState('map');
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  const venue = VENUES[selectedVenueId];
  const zonePolygons = generateZonePolygons(venue.lat, venue.lng);

  useEffect(() => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => {
          setLocationError("Enable location for live paths.");
          // Fallback location for demo purposes if blocked
          setUserLocation([venue.lat - 0.003, venue.lng - 0.003]);
        },
        { enableHighAccuracy: true }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [venue]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const safeZones = [...zones].sort((a, b) => {
    const dA = a.capacity > 0 ? a.current_headcount / a.capacity : 1;
    const dB = b.capacity > 0 ? b.current_headcount / b.capacity : 1;
    return dA - dB;
  });

  const recommendedZone = safeZones.length > 0 ? safeZones[0] : null;
  const recommendedDensity = recommendedZone && recommendedZone.capacity > 0 
    ? Math.round((recommendedZone.current_headcount / recommendedZone.capacity) * 100) : 0;
    
  const recommendedIdx = zones.findIndex(z => z.id === recommendedZone?.id);
  const recommendedTargetCoords = recommendedIdx !== -1 
    ? [venue.lat + 0.001 * Math.cos((recommendedIdx * 2 * Math.PI) / 5), venue.lng + 0.001 * Math.sin((recommendedIdx * 2 * Math.PI) / 5)]
    : [venue.lat, venue.lng];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300 flex flex-col">
      {/* Top Bar */}
      <div className="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 text-accent-blue flex items-center justify-center font-bold">
            {currentUser?.name?.charAt(0) || 'V'}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900 dark:text-gray-200">Hello, {currentUser?.name || 'Viewer'}</div>
            <div className="text-xs text-gray-500">Attendee Mode</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-accent-blue transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <select 
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 text-sm text-gray-900 dark:text-white"
          >
            {Object.entries(VENUES).map(([id, v]) => (
              <option key={id} value={id}>{v.name}</option>
            ))}
          </select>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 lg:p-10 flex flex-col items-center max-w-6xl mx-auto w-full gap-8">
        
        <div className="w-full bg-white dark:bg-gradient-to-br dark:from-dark-surface dark:to-gray-900 border border-gray-200 dark:border-accent-blue/30 rounded-2xl p-6 md:p-10 shadow-lg dark:shadow-[0_0_40px_rgba(59,130,246,0.1)] relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 pointer-events-none">
            <Navigation size={200} className="text-accent-blue" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-green/10 dark:bg-accent-green/20 text-accent-green rounded-full text-sm font-bold mb-4">
                <CheckCircle size={16} /> Optimal Entry Point Found
              </div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2">
                Head to <span className="text-accent-blue">{recommendedZone?.name || 'Zone'}</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg max-w-md mb-4">
                Follow the blue path to reach the fastest entry point at {venue.name}.
              </p>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setViewMode('map')}
                  className={clsx("px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all", viewMode === 'map' ? "bg-accent-blue text-white shadow-md" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300")}
                >
                  <MapPin size={16} /> Street Map
                </button>
                <button 
                  onClick={() => setViewMode('inside')}
                  className={clsx("px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all", viewMode === 'inside' ? "bg-accent-amber text-white shadow-md" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300")}
                >
                  <LayoutGrid size={16} /> Inside View
                </button>
              </div>

              {locationError && viewMode === 'map' && <p className="text-accent-amber text-sm mt-4 flex items-center gap-1"><MapPin size={14}/> {locationError} (Using simulated GPS)</p>}
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center min-w-[200px] transition-colors">
              <div className="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-widest mb-1">Current Status</div>
              <div className="text-5xl font-black text-accent-green mb-2">{recommendedDensity}%</div>
              <div className="text-xs text-gray-500">Capacity Filled</div>
            </div>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="col-span-2 card-surface p-0 overflow-hidden relative min-h-[400px]">
             
             {viewMode === 'map' ? (
               <>
                 <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-dark-surface/90 backdrop-blur px-3 py-2 rounded-lg shadow border border-gray-200 dark:border-gray-700 flex items-center gap-2">
                   <Crosshair className="text-accent-blue animate-pulse" size={18} />
                   <span className="text-sm font-bold text-gray-900 dark:text-white">Live Wayfinding</span>
                 </div>
                 
                 <MapContainer center={[venue.lat, venue.lng]} zoom={17} style={{ height: '100%', width: '100%', minHeight: '600px' }}>
                    <TileLayer 
                      url={theme === 'dark' 
                        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
                        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'} 
                    />
                    <RecenterMap center={[venue.lat, venue.lng]} />
                    
                    {zones.map((z, idx) => {
                      const density = z.capacity > 0 ? z.current_headcount / z.capacity : 0;
                      const color = density >= 0.9 ? '#ef4444' : density >= 0.75 ? '#f59e0b' : density >= 0.5 ? '#3b82f6' : '#22c55e';
                      return (
                        <Polygon 
                          key={z.id} 
                          positions={zonePolygons[idx]} 
                          pathOptions={{ color, fillColor: color, fillOpacity: 0.4, weight: 2 }}
                        >
                          <Popup>
                            <strong>{z.name}</strong><br/>
                            Density: {Math.round(density*100)}%
                          </Popup>
                        </Polygon>
                      );
                    })}

                    {userLocation && (
                      <>
                        <Marker position={userLocation}>
                          <Popup>You are here</Popup>
                        </Marker>
                        <Polyline 
                          positions={[userLocation, recommendedTargetCoords]} 
                          pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10' }} 
                        />
                      </>
                    )}
                 </MapContainer>
               </>
             ) : (
               <InsideView venueId={selectedVenueId} />
             )}
          </div>

          <div className="col-span-1 card-surface p-6 flex flex-col">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="text-gray-400" size={20} /> Zones at {venue.name.split(' ')[0]}
            </h3>
            
            <div className="flex-1 flex flex-col gap-4">
              {safeZones.map((z, idx) => {
                const density = z.capacity > 0 ? Math.round((z.current_headcount / z.capacity) * 100) : 0;
                const isRecommended = idx === 0;
                
                return (
                  <div key={z.id} className={clsx(
                    "p-4 rounded-xl border flex items-center justify-between transition-all",
                    isRecommended 
                      ? "bg-accent-blue/10 border-accent-blue/50" 
                      : density >= 90 ? "bg-red-50 dark:bg-accent-red/5 border-red-200 dark:border-accent-red/20 opacity-70" 
                      : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                  )}>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-gray-200 flex items-center gap-2">
                        {z.name}
                        {isRecommended && <span className="text-[10px] bg-accent-blue px-2 py-0.5 rounded-full text-white">TARGET</span>}
                      </div>
                      <div className="text-sm mt-1">
                        <span className={clsx(
                          "font-bold",
                          density >= 90 ? "text-accent-red" : density >= 75 ? "text-accent-amber" : "text-accent-green"
                        )}>{density}% full</span>
                      </div>
                    </div>
                    {isRecommended && <ArrowRight className="text-accent-blue" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Button for Incident Reporting */}
      <button 
        onClick={() => setIsIncidentModalOpen(true)}
        className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 bg-accent-red hover:bg-red-600 text-white px-6 py-4 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:scale-105 transition-all font-bold text-lg"
      >
        <AlertTriangle size={24} /> REPORT INCIDENT
      </button>

      {/* Modals */}
      {isIncidentModalOpen && (
        <IncidentModal 
          onClose={() => setIsIncidentModalOpen(false)} 
          venueZones={safeZones} 
        />
      )}
    </div>
  );
};

export default ViewerDashboard;
