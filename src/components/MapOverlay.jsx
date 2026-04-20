import React from 'react';
import useStore from '../store/useStore';
import clsx from 'clsx';

const MapOverlay = () => {
  const { zones } = useStore();

  const getFillColor = (status) => {
    switch(status) {
      case 'critical': return 'rgba(239, 68, 68, 0.6)'; // red
      case 'high': return 'rgba(245, 158, 11, 0.6)'; // amber
      case 'moderate': return 'rgba(59, 130, 246, 0.4)'; // blue
      default: return 'rgba(34, 197, 94, 0.3)'; // green
    }
  };

  const getStrokeColor = (status) => {
    switch(status) {
      case 'critical': return 'rgba(239, 68, 68, 1)';
      case 'high': return 'rgba(245, 158, 11, 1)';
      case 'moderate': return 'rgba(59, 130, 246, 1)';
      default: return 'rgba(34, 197, 94, 1)';
    }
  };

  const getZoneData = (id) => zones.find(z => z.id === id) || { status: 'safe', current_headcount: 0, capacity: 1 };

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-inner flex items-center justify-center group">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Venue Label */}
      <div className="absolute top-4 left-4 font-mono text-sm text-gray-500 uppercase tracking-widest bg-dark-bg/80 px-2 py-1 rounded">
        Venue Floor Plan - Sector Alpha
      </div>

      <svg width="80%" height="80%" viewBox="0 0 800 500" className="drop-shadow-2xl z-10 transition-transform duration-700 group-hover:scale-105">
        
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Zone A - Main Hall */}
        <path 
          d="M 50 50 L 350 50 L 350 300 L 50 300 Z" 
          fill={getFillColor(getZoneData('zone-A').status)} 
          stroke={getStrokeColor(getZoneData('zone-A').status)} 
          strokeWidth="3"
          className="transition-colors duration-1000 cursor-pointer hover:opacity-80"
          filter={getZoneData('zone-A').status === 'critical' ? 'url(#glow)' : ''}
        />
        <text x="200" y="175" textAnchor="middle" fill="white" className="font-bold text-xl drop-shadow-md pointer-events-none">Zone A</text>
        <text x="200" y="200" textAnchor="middle" fill="white" className="text-sm font-mono opacity-80 pointer-events-none">{getZoneData('zone-A').current_headcount}</text>

        {/* Zone B - North Wing */}
        <path 
          d="M 370 50 L 600 50 L 600 200 L 370 200 Z" 
          fill={getFillColor(getZoneData('zone-B').status)} 
          stroke={getStrokeColor(getZoneData('zone-B').status)} 
          strokeWidth="3"
          className="transition-colors duration-1000 cursor-pointer hover:opacity-80"
        />
        <text x="485" y="125" textAnchor="middle" fill="white" className="font-bold text-xl drop-shadow-md pointer-events-none">Zone B</text>
        <text x="485" y="150" textAnchor="middle" fill="white" className="text-sm font-mono opacity-80 pointer-events-none">{getZoneData('zone-B').current_headcount}</text>

        {/* Zone C - East Wing */}
        <path 
          d="M 620 50 L 750 50 L 750 450 L 620 450 Z" 
          fill={getFillColor(getZoneData('zone-C').status)} 
          stroke={getStrokeColor(getZoneData('zone-C').status)} 
          strokeWidth="3"
          className="transition-colors duration-1000 cursor-pointer hover:opacity-80"
          filter={getZoneData('zone-C').status === 'critical' ? 'url(#glow)' : ''}
        />
        <text x="685" y="250" textAnchor="middle" fill="white" className="font-bold text-xl drop-shadow-md pointer-events-none">Zone C</text>
        <text x="685" y="275" textAnchor="middle" fill="white" className="text-sm font-mono opacity-80 pointer-events-none">{getZoneData('zone-C').current_headcount}</text>

        {/* Zone D - South Corridor */}
        <path 
          d="M 50 320 L 350 320 L 350 450 L 50 450 Z" 
          fill={getFillColor(getZoneData('zone-D').status)} 
          stroke={getStrokeColor(getZoneData('zone-D').status)} 
          strokeWidth="3"
          className="transition-colors duration-1000 cursor-pointer hover:opacity-80"
        />
        <text x="200" y="385" textAnchor="middle" fill="white" className="font-bold text-xl drop-shadow-md pointer-events-none">Zone D</text>
        <text x="200" y="410" textAnchor="middle" fill="white" className="text-sm font-mono opacity-80 pointer-events-none">{getZoneData('zone-D').current_headcount}</text>

        {/* Zone E - Central Hub */}
        <path 
          d="M 370 220 L 600 220 L 600 450 L 370 450 Z" 
          fill={getFillColor(getZoneData('zone-E').status)} 
          stroke={getStrokeColor(getZoneData('zone-E').status)} 
          strokeWidth="3"
          className="transition-colors duration-1000 cursor-pointer hover:opacity-80"
          filter={getZoneData('zone-E').status === 'critical' ? 'url(#glow)' : ''}
        />
        <text x="485" y="335" textAnchor="middle" fill="white" className="font-bold text-xl drop-shadow-md pointer-events-none">Zone E</text>
        <text x="485" y="360" textAnchor="middle" fill="white" className="text-sm font-mono opacity-80 pointer-events-none">{getZoneData('zone-E').current_headcount}</text>

      </svg>
    </div>
  );
};

export default MapOverlay;
