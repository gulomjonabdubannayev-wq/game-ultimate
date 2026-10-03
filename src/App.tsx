import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { CityWorld } from './components/CityWorld';
import { VehicleSystem } from './components/VehicleSystem';
import { Player, PedestrianSystem } from './components/PlayerSystem';
import { Environment } from './components/Environment';
import { HUD } from './components/UI/HUD';
import { PhoneUI } from './components/UI/PhoneUI';
import { MapUI } from './components/UI/MapUI';
import { GarageUI, SettingsUI, MissionsUI, PauseMenu } from './components/UI/GamePanels';
import { useGameStore } from './store/gameStore';

function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  
  useEffect(() => {
    const texts = [
      'Loading city environment...',
      'Generating buildings...',
      'Spawning vehicles...',
      'Setting up traffic...',
      'Initializing NPCs...',
      'Loading weather system...',
      'Preparing missions...',
      'Almost ready...',
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setProgress(Math.min(i * 12.5, 100));
      if (i < texts.length) {
        setLoadingText(texts[i]);
      }
    }, 400);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center z-[100]">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold text-white tracking-wider">
          <span className="text-blue-400">TASHKENT</span> CITY
        </h1>
        <p className="text-gray-400 text-lg">Open World Driving Experience</p>
        
        <div className="w-80 mx-auto">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-gray-500 text-sm mt-2">{loadingText}</p>
        </div>
        
        <div className="text-gray-600 text-xs mt-8">
          <p>WASD - Move | E - Enter Vehicle | F - Exit Vehicle</p>
          <p>M - Map | Tab - Phone | G - Garage | J - Missions</p>
        </div>
      </div>
    </div>
  );
}

function GameCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 10, -15], fov: 60, near: 0.1, far: 500 }}
      gl={{ antialias: true, alpha: false }}
      style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Environment />
        <CityWorld />
        <VehicleSystem />
        <Player />
        <PedestrianSystem />
      </Suspense>
    </Canvas>
  );
}

function KeyboardHandler() {
  const { toggleMap, togglePhone, toggleGarage, toggleMissions, toggleSettings, togglePause } = useGameStore();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for game keys
      if (['m', 'g', 'j'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      
      switch (e.key.toLowerCase()) {
        case 'm':
          toggleMap();
          break;
        case 'tab':
          e.preventDefault();
          togglePhone();
          break;
        case 'g':
          toggleGarage();
          break;
        case 'j':
          toggleMissions();
          break;
        case 'escape':
          togglePause();
          break;
        case 'c':
          const modes = ['third', 'first', 'interior', 'cinematic'] as const;
          const current = useGameStore.getState().cameraMode;
          const idx = modes.indexOf(current);
          useGameStore.getState().setCameraMode(modes[(idx + 1) % modes.length]);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleMap, togglePhone, toggleGarage, toggleMissions, toggleSettings, togglePause]);
  
  return null;
}

function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center">
      <div className="text-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="relative">
          <h1 className="text-7xl font-black text-white tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              TASHKENT
            </span>
          </h1>
          <h2 className="text-4xl font-light text-gray-300 mt-2">CITY</h2>
          <div className="text-gray-500 text-sm mt-4 tracking-widest">OPEN WORLD DRIVING EXPERIENCE</div>
        </div>
        
        {/* Decorative line */}
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto" />
        
        {/* Menu */}
        <div className="space-y-3 mt-12">
          <button 
            onClick={onContinue}
            className="block w-72 mx-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/20"
          >
            ▶ START GAME
          </button>
          <button className="block w-72 mx-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-medium transition-all">
            🎮 Free Roam
          </button>
          <button className="block w-72 mx-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-medium transition-all">
            🏁 Racing Mode
          </button>
          <button className="block w-72 mx-auto px-8 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg font-medium transition-all">
            ⚙️ Settings
          </button>
        </div>
        
        {/* Footer */}
        <div className="mt-16 text-gray-600 text-xs">
          <p>Original Game Concept • Inspired by Open-World Driving Games</p>
          <p className="mt-1">All vehicles, characters, and locations are original creations</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  
  const handleStart = () => {
    setLoading(true);
    setTimeout(() => {
      setGameStarted(true);
      setLoading(false);
      setTimeout(() => setReady(true), 3500);
    }, 3500);
  };
  
  if (!gameStarted && !loading) {
    return <SplashScreen onContinue={handleStart} />;
  }
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {/* 3D Game Canvas */}
      <GameCanvas />
      
      {/* UI Overlays */}
      {ready && (
        <>
          <HUD />
          <PhoneUI />
          <MapUI />
          <GarageUI />
          <SettingsUI />
          <MissionsUI />
          <PauseMenu />
          <KeyboardHandler />
        </>
      )}
      
      {/* Fade in effect */}
      {!ready && (
        <div className="fixed inset-0 bg-black z-[100] animate-fade-out pointer-events-none" />
      )}
    </div>
  );
}
