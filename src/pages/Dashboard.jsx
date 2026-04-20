import React from 'react';
import useStore from '../store/useStore';
import TopNavbar from '../components/TopNavbar';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import MapOverlay from '../components/MapOverlay';
import ZoneCard from '../components/ZoneCard';

const Dashboard = () => {
  const { zones, emergency, isConnected } = useStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNavbar />
      
      {emergency && (
        <div className="w-full bg-accent-red text-white py-2 px-4 text-center font-bold flex justify-center items-center gap-4 animate-pulse z-40">
          <span>⚠️ {emergency.message} - {new Date(emergency.timestamp).toLocaleTimeString()} ⚠️</span>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 bg-dark-bg p-6 overflow-y-auto">
          {!isConnected && (
            <div className="mb-6 p-4 bg-accent-amber/20 border border-accent-amber/50 text-accent-amber rounded-lg flex items-center justify-between">
              <span>Connecting to real-time simulation server...</span>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Live Heatmap</h2>
            <MapOverlay />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Zone Densities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {zones.map(zone => (
                <ZoneCard key={zone.id} zone={zone} />
              ))}
            </div>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Dashboard;
