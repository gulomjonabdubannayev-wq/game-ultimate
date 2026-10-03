import { useGameStore } from '../../store/gameStore';
import { useEffect, useState } from 'react';

export function HUD() {
  const { 
    playerMoney, playerHealth, isInVehicle, currentVehicleId, vehicles, 
    timeOfDay, weather, wantedLevel, cameraMode, currentMission,
    setCameraMode, togglePhone, toggleMap, toggleGarage, toggleMissions, toggleSettings
  } = useGameStore();
  
  const currentVehicle = vehicles.find(v => v.id === currentVehicleId);
  const currentSpeed = useGameStore(s => s.currentSpeed);
  const [showControls, setShowControls] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 8000);
    return () => clearTimeout(timer);
  }, []);
  
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const weatherIcons: Record<string, string> = {
    sunny: '☀️',
    cloudy: '☁️',
    rain: '🌧️',
    fog: '🌫️',
    storm: '⛈️',
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-start p-4">
        {/* Left - Player info */}
        <div className="pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">💰</span>
              <span className="font-bold text-green-400">${playerMoney.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all"
                  style={{ width: `${playerHealth}%` }}
                />
              </div>
              <span className="text-xs text-gray-300">{playerHealth}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span>{weatherIcons[weather]}</span>
              <span className="text-gray-300">{formatTime(timeOfDay)}</span>
            </div>
          </div>
        </div>
        
        {/* Right - Wanted level & minimap */}
        <div className="pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
            {wantedLevel > 0 && (
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-lg ${i < wantedLevel ? 'text-yellow-400' : 'text-gray-600'}`}>⭐</span>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-400">
              Camera: <span className="text-white capitalize">{cameraMode}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vehicle HUD */}
      {isInVehicle && currentVehicle && (
        <div className="absolute bottom-4 left-4 pointer-events-auto">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white min-w-[250px]">
            <div className="text-sm text-gray-400 mb-1">{currentVehicle.brand}</div>
            <div className="text-lg font-bold mb-3">{currentVehicle.name}</div>
            
            {/* Speedometer */}
            <div className="flex items-end gap-4 mb-3">
              <div>
                <div className="text-3xl font-mono font-bold text-green-400">
                  {Math.abs(Math.round(currentSpeed))}
                </div>
                <div className="text-xs text-gray-400">KM/H</div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 mb-1">FUEL</div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400" style={{ width: `${currentVehicle.fuel}%` }} />
                </div>
              </div>
            </div>
            
            {/* Damage indicator */}
            {currentVehicle.damage > 0 && (
              <div className="text-xs text-red-400">
                ⚠️ Damage: {currentVehicle.damage}%
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Mission indicator */}
      {currentMission && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-yellow-500/90 backdrop-blur-sm rounded-lg px-4 py-2 text-black font-bold text-center">
            <div className="text-sm">{currentMission.title}</div>
            <div className="text-xs opacity-80">{currentMission.description}</div>
            <div className="text-xs mt-1">Reward: ${currentMission.reward}</div>
          </div>
        </div>
      )}
      
      {/* Bottom controls hint */}
      {showControls && (
        <div className="absolute bottom-4 right-4 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs space-y-1">
            <div><kbd className="bg-gray-700 px-1 rounded">WASD</kbd> Move</div>
            <div><kbd className="bg-gray-700 px-1 rounded">E</kbd> Enter Vehicle</div>
            <div><kbd className="bg-gray-700 px-1 rounded">F</kbd> Exit Vehicle</div>
            <div><kbd className="bg-gray-700 px-1 rounded">C</kbd> Camera</div>
            <div><kbd className="bg-gray-700 px-1 rounded">M</kbd> Map</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Tab</kbd> Phone</div>
            <div><kbd className="bg-gray-700 px-1 rounded">G</kbd> Garage</div>
            <div><kbd className="bg-gray-700 px-1 rounded">J</kbd> Missions</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Shift</kbd> Sprint</div>
            <div><kbd className="bg-gray-700 px-1 rounded">Esc</kbd> Menu</div>
          </div>
        </div>
      )}
      
      {/* Quick action buttons */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto">
        <div className="flex gap-2">
          <button onClick={togglePhone} className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white text-lg transition-all hover:scale-110">
            📱
          </button>
          <button onClick={toggleMap} className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white text-lg transition-all hover:scale-110">
            🗺️
          </button>
          <button onClick={toggleGarage} className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white text-lg transition-all hover:scale-110">
            🏠
          </button>
          <button onClick={toggleMissions} className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white text-lg transition-all hover:scale-110">
            📋
          </button>
          <button onClick={() => {
            const modes: Array<'third' | 'first' | 'interior' | 'cinematic'> = ['third', 'first', 'interior', 'cinematic'];
            const idx = modes.indexOf(cameraMode);
            setCameraMode(modes[(idx + 1) % modes.length]);
          }} className="bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full w-10 h-10 flex items-center justify-center text-white text-lg transition-all hover:scale-110">
            📷
          </button>
        </div>
      </div>
      
      {/* Minimap */}
      <div className="absolute bottom-20 right-4 pointer-events-auto">
        <div className="w-40 h-40 bg-black/80 backdrop-blur-sm rounded-lg border border-gray-600 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 to-green-800/50">
            {/* Roads */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gray-500" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gray-500" />
            <div className="absolute top-[30%] left-0 right-0 h-[1px] bg-gray-600" />
            <div className="absolute top-[70%] left-0 right-0 h-[1px] bg-gray-600" />
            <div className="absolute left-[30%] top-0 bottom-0 w-[1px] bg-gray-600" />
            <div className="absolute left-[70%] top-0 bottom-0 w-[1px] bg-gray-600" />
          </div>
          {/* Player dot */}
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          {/* Mission marker */}
          {currentMission && (
            <div className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{
              top: `${50 + (currentMission.targetLocation?.[2] || 0) / 3}%`,
              left: `${50 + (currentMission.targetLocation?.[0] || 0) / 3}%`,
            }} />
          )}
          <div className="absolute bottom-1 left-1 text-[8px] text-gray-400">MINIMAP</div>
        </div>
      </div>
      
      {/* Interaction prompt */}
      {isInVehicle && (
        <div className="absolute bottom-32 left-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded px-3 py-1.5 text-white text-sm">
            Press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs mx-1">F</kbd> to exit vehicle
          </div>
        </div>
      )}
      
      {!isInVehicle && (
        <div className="absolute bottom-32 left-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm rounded px-3 py-1.5 text-white text-sm">
            Approach a vehicle and press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs mx-1">E</kbd> to enter
          </div>
        </div>
      )}
      
      {/* Game mode indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 py-1 text-white text-xs uppercase tracking-wider">
          {useGameStore.getState().gameMode === 'freeroam' ? '🌍 Free Roam' : 
           useGameStore.getState().gameMode === 'racing' ? '🏁 Racing' :
           useGameStore.getState().gameMode === 'taxi' ? '🚕 Taxi Mode' :
           useGameStore.getState().gameMode === 'delivery' ? '📦 Delivery' : '📖 Story Mode'}
        </div>
      </div>
    </div>
  );
}
