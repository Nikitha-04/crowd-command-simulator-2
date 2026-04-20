import React from 'react';

const TopDownAvatar = ({ color = 'blue', isMoving = false, size = 32 }) => {
  // Define color themes
  const themes = {
    blue: { primary: '#3b82f6', skin: '#fcd34d' }, // Player
    red: { primary: '#ef4444', skin: '#fcd34d' }    // NPC
  };

  const theme = themes[color] || themes.blue;

  return (
    <div 
      className="relative flex items-center justify-center pointer-events-none"
      style={{ width: size, height: size }}
    >
      <svg 
        viewBox="0 0 100 100" 
        className={`w-full h-full drop-shadow-md ${isMoving ? 'animate-waddle' : ''}`}
        style={{ transformOrigin: 'center center' }}
      >
        {/* Left Arm / Shoulder */}
        <rect x="15" y="30" width="30" height="40" rx="15" fill={theme.primary} className="opacity-90" />
        
        {/* Right Arm / Shoulder */}
        <rect x="55" y="30" width="30" height="40" rx="15" fill={theme.primary} className="opacity-90" />
        
        {/* Torso/Body */}
        <ellipse cx="50" cy="50" rx="35" ry="25" fill={theme.primary} />
        
        {/* Head */}
        <circle cx="50" cy="50" r="20" fill={theme.skin} stroke="rgba(0,0,0,0.1)" strokeWidth="2" />
        
        {/* Backpack or detail to indicate forward direction */}
        <rect x="35" y="65" width="30" height="10" rx="5" fill="rgba(0,0,0,0.2)" />
      </svg>
    </div>
  );
};

export default TopDownAvatar;
