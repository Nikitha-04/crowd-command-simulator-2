import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useStore from '../store/useStore';
import clsx from 'clsx';
import { Trophy, ShieldAlert, ArrowRight, Play } from 'lucide-react';
import toast from 'react-hot-toast';
import TopDownAvatar from './TopDownAvatar';

// Define layout data for different venues
const VENUE_LAYOUTS = {
  'chinnaswamy': {
    type: 'stadium',
    gates: [
      { id: 0, x: 50, y: 5, label: "North Gate" },
      { id: 1, x: 95, y: 50, label: "East Gate" },
      { id: 2, x: 50, y: 95, label: "South Gate" },
      { id: 3, x: 5, y: 50, label: "West Gate" },
      { id: 4, x: 80, y: 80, label: "VIP Gate", isVIP: true }
    ]
  },
  'phoenix': {
    type: 'mall',
    gates: [
      { id: 0, x: 10, y: 10, label: "Main Entrance" },
      { id: 1, x: 90, y: 10, label: "Food Court Entry" },
      { id: 2, x: 50, y: 90, label: "Basement Parking" },
      { id: 3, x: 90, y: 50, label: "East Wing" },
      { id: 4, x: 10, y: 50, label: "VIP Entry", isVIP: true }
    ]
  },
  'nexus': {
    type: 'mall',
    gates: [
      { id: 0, x: 50, y: 10, label: "Front Gate" },
      { id: 1, x: 90, y: 90, label: "Rear Gate" },
      { id: 2, x: 10, y: 90, label: "P1 Parking" },
      { id: 3, x: 50, y: 50, label: "Center Atrium" },
      { id: 4, x: 80, y: 30, label: "VIP Entry", isVIP: true }
    ]
  }
};

const NUM_NPCS = 8;

const InsideView = ({ venueId }) => {
  const zones = useStore(state => state.zones) || []; // Fallback if zones is undefined
  const containerRef = useRef(null);
  
  // Game States: 'intro', 'playing', 'won', 'lost', 'freeroam'
  const [gameState, setGameState] = useState('intro');
  const [score, setScore] = useState(1000);
  
  // High-performance DOM Refs (bypasses React state for 60fps)
  const playerRef = useRef(null);
  const npcRefs = useRef([]);
  
  const targetPos = useRef({ x: 50, y: 50 });
  const currentPos = useRef({ x: 50, y: 50 });
  const npcsData = useRef([]);
  
  // UI States (updated occasionally, safe for React state)
  const [activeGate, setActiveGate] = useState(null);
  const [isHit, setIsHit] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [isDanger, setIsDanger] = useState(false);
  
  const isInvulnerable = useRef(false);
  const animationFrameId = useRef(null);

  const layout = VENUE_LAYOUTS[venueId] || VENUE_LAYOUTS['chinnaswamy'];

  // Initialize NPCs Data (runs once)
  useEffect(() => {
    npcsData.current = Array.from({ length: NUM_NPCS }).map((_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 0.15, // Smooth, slow velocity
      vy: (Math.random() - 0.5) * 0.15
    }));
  }, [venueId]);

  // Mouse Movement tracker
  const handleMouseMove = (e) => {
    if (!containerRef.current || gameState === 'intro' || gameState === 'won' || gameState === 'lost') return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    targetPos.current = { x, y };
  };

  const handleCollision = () => {
    if (isInvulnerable.current) return;
    
    isInvulnerable.current = true;
    setIsHit(true);
    setScore(s => {
      const newScore = s - 100;
      if (newScore <= 0) {
        setGameState('lost');
        return 0;
      }
      return newScore;
    });
    
    setTimeout(() => {
      setIsHit(false);
      isInvulnerable.current = false;
    }, 1000); // 1 sec invulnerability
  };

  // 60FPS Game Engine Loop (Direct DOM Manipulation)
  useEffect(() => {
    if (gameState === 'intro' || gameState === 'won' || gameState === 'lost') return;
    
    let lastTime = performance.now();
    let speedUpdateCounter = 0;
    
    const loop = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      // 1. Move Player
      const dx = targetPos.current.x - currentPos.current.x;
      const dy = targetPos.current.y - currentPos.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      const moveMultiplier = 0.05;
      currentPos.current.x += dx * moveMultiplier;
      currentPos.current.y += dy * moveMultiplier;

      if (playerRef.current) {
        playerRef.current.style.left = `${currentPos.current.x}%`;
        playerRef.current.style.top = `${currentPos.current.y}%`;
      }

      // 2. Move NPCs
      let nearbyCrowds = false;
      if (gameState === 'playing') {
        npcsData.current.forEach((npc, idx) => {
          npc.x += npc.vx;
          npc.y += npc.vy;
          
          if (npc.x < 5 || npc.x > 95) npc.vx *= -1;
          if (npc.y < 5 || npc.y > 95) npc.vy *= -1;
          
          if (npcRefs.current[idx]) {
            npcRefs.current[idx].style.left = `${npc.x}%`;
            npcRefs.current[idx].style.top = `${npc.y}%`;
          }

          const distToPlayer = Math.sqrt(Math.pow(currentPos.current.x - npc.x, 2) + Math.pow(currentPos.current.y - npc.y, 2));
          if (distToPlayer < 12) {
            nearbyCrowds = true;
          }
          if (distToPlayer < 3) {
            handleCollision();
          }
        });
      }

      // Throttled UI Updates (every ~10 frames)
      speedUpdateCounter++;
      if (speedUpdateCounter > 10) {
        speedUpdateCounter = 0;
        const speed = Math.min(Math.round(dist * 2), 100);
        setCurrentSpeed(speed);
        setIsMoving(dist > 0.5);
        if (gameState === 'playing') {
          setIsDanger(nearbyCrowds);
        }
      }

      animationFrameId.current = requestAnimationFrame(loop);
    };
    
    animationFrameId.current = requestAnimationFrame(loop);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [gameState]); // Only restart loop if gameState changes

  // Throttled Zone/Gate Logic (Runs every 500ms using setInterval instead of requestAnimationFrame)
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'freeroam') return;
    
    const intervalId = setInterval(() => {
      let closestGate = null;
      let minDistance = Infinity;

      // Find safest gate index
      let safestGateIdx = 0;
      let minDensity = Infinity;
      
      if (zones && zones.length > 0) {
        zones.forEach((z, idx) => {
          const density = z.capacity > 0 ? z.current_headcount / z.capacity : 0;
          if (density < minDensity) {
            minDensity = density;
            safestGateIdx = idx;
          }
        });
      }

      layout.gates.forEach((gate, idx) => {
        const dx = currentPos.current.x - gate.x;
        const dy = currentPos.current.y - gate.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 15 && dist < minDistance) {
          minDistance = dist;
          closestGate = idx;
        }
      });

      setActiveGate(closestGate);

      // Win / Lose Triggers
      if (gameState === 'playing' && closestGate !== null && minDistance < 5) {
        const gate = layout.gates[closestGate];
        if (gate.isVIP) {
          if (!isInvulnerable.current) {
            toast.error("VIP ENTRY - Access Denied!");
            handleCollision();
            // Bounce player back slightly
            targetPos.current = { x: 50, y: 50 };
          }
        } else if (closestGate === safestGateIdx || zones.length === 0) {
          // WIN CONDITION! (Or win if no backend connected)
          setGameState('won');
          setScore(s => s + 500);
        } else {
           if (!isInvulnerable.current) {
              toast.error("Wrong Gate! Find the least crowded one.");
              handleCollision();
              targetPos.current = { x: 50, y: 50 };
           }
        }
      }
    }, 200); // Check 5 times a second
    
    return () => clearInterval(intervalId);
  }, [layout.gates, gameState, zones]);

  const isFullscreen = gameState === 'intro' || gameState === 'playing' || gameState === 'won' || gameState === 'lost';

  const GameContent = (
    <div 
      className={clsx(
        "overflow-hidden transition-colors duration-300",
        isHit ? "bg-red-900/30" : "bg-gray-100 dark:bg-gray-900",
        (gameState === 'playing' || gameState === 'freeroam') ? "cursor-crosshair" : "cursor-default",
        isFullscreen ? "fixed inset-0 z-[2000] w-screen h-screen" : "relative w-full h-[600px] rounded-2xl border-2 border-gray-300 dark:border-gray-700 shadow-inner"
      )}
      onMouseMove={handleMouseMove}
      ref={containerRef}
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Venue Shape Background */}
      <div className="absolute inset-4 opacity-30 dark:opacity-50 pointer-events-none flex items-center justify-center">
        {layout.type === 'stadium' ? (
          <div className={clsx("rounded-full border-[10px] border-accent-blue bg-accent-blue/10 transition-all", isFullscreen ? "w-[70%] h-[80%]" : "w-[80%] h-[80%]")}></div>
        ) : (
          <div className={clsx("rounded-xl border-[10px] border-gray-400 bg-gray-400/10 transition-all", isFullscreen ? "w-[80%] h-[80%]" : "w-[90%] h-[80%]")}></div>
        )}
      </div>

      {/* Game HUD */}
      {(gameState === 'playing' || gameState === 'freeroam') && (
        <div className={clsx("absolute z-40 bg-white/90 dark:bg-black/80 backdrop-blur px-6 py-4 rounded-lg border shadow-lg pointer-events-none transition-all border-gray-200 dark:border-gray-800",
          isFullscreen ? "top-8 left-1/2 -translate-x-1/2 min-w-[400px]" : "top-4 left-4"
        )}>
          <h3 className="font-bold text-xl text-gray-900 dark:text-white flex items-center justify-center gap-2 mb-2">
            {gameState === 'playing' ? "🎮 Crowd Simulator" : "👀 Free Roam Mode"}
          </h3>
          
          {gameState === 'playing' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500">Score:</span>
                <span className={clsx("text-2xl font-black", score > 500 ? "text-accent-green" : "text-accent-red")}>{score}</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>Speed: {currentSpeed} mph</span>
                  {isDanger && <span className="text-accent-red animate-pulse">INCREASE SPEED!</span>}
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={clsx("h-full transition-all", isDanger ? "bg-accent-red" : "bg-accent-blue")} 
                    style={{ width: `${currentSpeed}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-xs text-center text-gray-500 mt-1">
                Find the Green Gate. Avoid Red Crowds!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Render Gates */}
      {layout.gates.map((gate, idx) => {
        const zone = zones && zones.length > 0 ? zones[idx] : null;
        const density = zone && zone.capacity > 0 ? zone.current_headcount / zone.capacity : 0;
        const isApproaching = activeGate === idx;
        
        const isCrowded = density >= 0.75;
        const glowColor = gate.isVIP ? 'rgba(245, 158, 11, 0.6)' : isCrowded ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)';
        const glowShadow = isApproaching ? `0 0 40px 20px ${glowColor}` : 'none';
        
        return (
          <div 
            key={gate.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none transition-all duration-500 z-10"
            style={{ left: `${gate.x}%`, top: `${gate.y}%` }}
          >
            <div 
              className={clsx(
                "w-16 h-16 rounded-xl border-4 flex items-center justify-center bg-white dark:bg-gray-800 transition-all duration-300",
                isApproaching ? (gate.isVIP ? 'border-accent-amber scale-125' : isCrowded ? 'border-accent-red scale-125' : 'border-accent-green scale-125') : 'border-gray-400 dark:border-gray-600'
              )}
              style={{ boxShadow: glowShadow }}
            >
              <div className={clsx(
                "w-full h-full opacity-20",
                gate.isVIP ? "bg-accent-amber" : isCrowded ? "bg-accent-red" : "bg-accent-green"
              )}></div>
            </div>
            
            <div className="mt-3 px-3 py-1.5 bg-white/90 dark:bg-black/80 backdrop-blur rounded text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 whitespace-nowrap shadow-md text-center">
              {gate.label} <br/>
              {!gate.isVIP && (
                <span className={isCrowded ? 'text-accent-red' : 'text-accent-green'}>
                  {Math.round(density * 100)}% Full
                </span>
              )}
            </div>
          </div>
        );
      })}

      {/* Render NPCs (Animated Human Crowds) via Direct DOM manipulation */}
      {(gameState === 'playing' || gameState === 'lost') && npcsData.current.map((npc, idx) => (
        <div 
          key={npc.id}
          ref={el => npcRefs.current[idx] = el}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
          style={{ left: `${npc.x}%`, top: `${npc.y}%` }}
        >
          <TopDownAvatar color="red" isMoving={true} size={40} />
        </div>
      ))}

      {/* Render Player Character (Animated Human Avatar) */}
      {(gameState === 'playing' || gameState === 'freeroam') && (
        <div 
          ref={playerRef}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
          style={{ left: `${currentPos.current.x}%`, top: `${currentPos.current.y}%` }}
        >
          <div className={clsx("relative transition-opacity", isHit ? "opacity-40" : "opacity-100")}>
            <TopDownAvatar color="blue" isMoving={isMoving} size={48} />
            <div className={clsx("absolute inset-[-10px] rounded-full border-2 border-accent-blue animate-ping opacity-50", isMoving ? "block" : "hidden")}></div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* Intro Modal */}
      {gameState === 'intro' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-[1100] text-center px-4">
          <div className="bg-white dark:bg-dark-surface p-10 rounded-2xl max-w-lg w-full border border-accent-blue shadow-[0_0_50px_rgba(59,130,246,0.3)] pointer-events-auto">
            <h2 className="text-4xl font-black mb-4 text-gray-900 dark:text-white tracking-tight">Crowd Simulator</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Learn how to navigate crowd surges safely before starting your journey.
            </p>
            <ul className="text-left text-gray-500 dark:text-gray-400 mb-10 space-y-4">
              <li className="flex items-center gap-3"><ArrowRight size={20} className="text-accent-blue shrink-0" /> Move your mouse to walk.</li>
              <li className="flex items-center gap-3"><ArrowRight size={20} className="text-accent-red shrink-0" /> Avoid bumping into red crowds. You will lose 100 points!</li>
              <li className="flex items-center gap-3"><ArrowRight size={20} className="text-accent-amber shrink-0" /> VIP Gates are restricted entry.</li>
              <li className="flex items-center gap-3 font-bold text-accent-green"><ArrowRight size={20} className="shrink-0" /> Objective: Find and enter the Green Gate!</li>
            </ul>
            <button 
              onClick={() => { setScore(1000); targetPos.current = {x:50, y:50}; currentPos.current = {x:50, y:50}; setGameState('playing'); }}
              className="w-full py-4 text-lg bg-accent-blue hover:bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-xl"
            >
              <Play size={24} /> LAUNCH SIMULATOR
            </button>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {gameState === 'won' && (
        <div className="absolute inset-0 bg-accent-green/20 backdrop-blur-md flex flex-col items-center justify-center z-[1100] text-center px-4">
          <div className="bg-white dark:bg-dark-surface p-10 rounded-2xl max-w-md w-full border-2 border-accent-green shadow-[0_0_80px_rgba(34,197,94,0.4)] transform animate-bounce-short pointer-events-auto">
            <Trophy size={80} className="text-accent-green mx-auto mb-6" />
            <h2 className="text-5xl font-black mb-4 text-gray-900 dark:text-white">SUCCESS!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              You safely navigated the crowds and found the optimal entry point.
            </p>
            <div className="text-4xl font-black text-accent-green mb-10">Score: {score}</div>
            
            <button 
              onClick={() => setGameState('freeroam')}
              className="w-full py-4 text-lg bg-gray-900 dark:bg-white dark:text-black text-white rounded-xl font-bold transition-transform hover:scale-[1.02] shadow-xl"
            >
              EXIT SIMULATION
            </button>
          </div>
        </div>
      )}

      {/* Loss Modal */}
      {gameState === 'lost' && (
        <div className="absolute inset-0 bg-accent-red/20 backdrop-blur-md flex flex-col items-center justify-center z-[1100] text-center px-4">
          <div className="bg-white dark:bg-dark-surface p-10 rounded-2xl max-w-md w-full border-2 border-accent-red shadow-[0_0_80px_rgba(239,68,68,0.4)] pointer-events-auto">
            <ShieldAlert size={80} className="text-accent-red mx-auto mb-6" />
            <h2 className="text-5xl font-black mb-4 text-gray-900 dark:text-white">FAILED</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-10 text-lg">
              You were overwhelmed by the crowd. Always stay alert and look for the green gates!
            </p>
            <button 
              onClick={() => { setScore(1000); targetPos.current = {x:50, y:50}; currentPos.current = {x:50, y:50}; setGameState('playing'); }}
              className="w-full py-4 text-lg bg-accent-red hover:bg-red-600 text-white rounded-xl font-bold transition-transform hover:scale-[1.02] shadow-xl"
            >
              TRY AGAIN
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Use React Portal to guarantee Fullscreen breakout, 
  // otherwise render inline for Free Roam
  if (isFullscreen) {
    return createPortal(GameContent, document.body);
  }

  return GameContent;
};

export default InsideView;
