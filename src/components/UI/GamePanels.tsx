import { useGameStore } from '../../store/gameStore';
import { useState } from 'react';

export function GarageUI() {
  const showGarage = useGameStore(s => s.showGarage);
  const toggleGarage = useGameStore(s => s.toggleGarage);
  const vehicles = useGameStore(s => s.vehicles);
  const playerMoney = useGameStore(s => s.playerMoney);
  const buyVehicle = useGameStore(s => s.buyVehicle);
  const [selectedTab, setSelectedTab] = useState<'owned' | 'shop'>('owned');
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  
  if (!showGarage) return null;
  
  const ownedVehicles = vehicles.filter(v => v.owned);
  const availableVehicles = vehicles.filter(v => !v.owned);
  const selected = vehicles.find(v => v.id === selectedVehicle);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto" onClick={(e) => { if (e.target === e.currentTarget) toggleGarage(); }}>
      <div className="w-[85vw] h-[85vh] max-w-[1000px] max-h-[700px] bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-white text-xl font-bold">🏠 Garage & Dealership</h2>
            <p className="text-gray-400 text-sm">Balance: <span className="text-green-400">${playerMoney.toLocaleString()}</span></p>
          </div>
          <button onClick={toggleGarage} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button 
            onClick={() => setSelectedTab('owned')}
            className={`px-6 py-3 text-sm font-medium ${selectedTab === 'owned' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            My Vehicles ({ownedVehicles.length})
          </button>
          <button 
            onClick={() => setSelectedTab('shop')}
            className={`px-6 py-3 text-sm font-medium ${selectedTab === 'shop' ? 'text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          >
            Dealership ({availableVehicles.length})
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Vehicle list */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto p-4">
            {(selectedTab === 'owned' ? ownedVehicles : availableVehicles).map(v => (
              <div
                key={v.id}
                onClick={() => setSelectedVehicle(v.id)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-all ${
                  selectedVehicle === v.id ? 'bg-blue-900/50 border border-blue-500' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-600" style={{ backgroundColor: v.color }} />
                  <div>
                    <div className="text-white text-sm font-medium">{v.brand} {v.name}</div>
                    <div className="text-gray-400 text-xs">{v.category}</div>
                  </div>
                </div>
                {!v.owned && (
                  <div className="text-green-400 text-sm mt-1 font-bold">${v.price.toLocaleString()}</div>
                )}
              </div>
            ))}
          </div>
          
          {/* Vehicle details */}
          <div className="flex-1 p-6 overflow-y-auto">
            {selected ? (
              <div>
                {/* Vehicle preview */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl p-8 mb-6 flex items-center justify-center">
                  <div className="relative">
                    {/* Simple car representation */}
                    <div className="w-48 h-20 relative">
                      <div className="absolute bottom-0 left-4 right-4 h-10 rounded-lg" style={{ backgroundColor: selected.color }} />
                      <div className="absolute bottom-8 left-12 right-12 h-8 rounded-t-lg" style={{ backgroundColor: selected.color, opacity: 0.9 }} />
                      <div className="absolute bottom-8 left-14 right-14 h-6 rounded-t-md bg-blue-200/30" />
                      {/* Wheels */}
                      <div className="absolute bottom-0 left-8 w-6 h-6 bg-gray-900 rounded-full border-2 border-gray-600" />
                      <div className="absolute bottom-0 right-8 w-6 h-6 bg-gray-900 rounded-full border-2 border-gray-600" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-white text-2xl font-bold">{selected.brand} {selected.name}</h3>
                <p className="text-gray-400">{selected.category}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <StatItem label="Top Speed" value={selected.speed} max={10} color="red" />
                  <StatItem label="Acceleration" value={selected.acceleration} max={10} color="orange" />
                  <StatItem label="Handling" value={selected.handling} max={10} color="blue" />
                  <StatItem label="Braking" value={selected.braking} max={10} color="green" />
                </div>
                
                {/* Price / Actions */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  {!selected.owned ? (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-400 text-sm">Price</div>
                        <div className="text-2xl font-bold text-green-400">${selected.price.toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => buyVehicle(selected.id)}
                        disabled={playerMoney < selected.price}
                        className={`px-6 py-3 rounded-lg font-bold text-sm ${
                          playerMoney >= selected.price 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {playerMoney >= selected.price ? '🛒 Buy Now' : '💸 Not Enough Money'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-green-400 font-bold">✓ Owned</div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm">
                          🎨 Customize
                        </button>
                        <button className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm">
                          ⚡ Upgrade
                        </button>
                        <button className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm">
                          🔧 Repair
                        </button>
                      </div>
                      
                      {/* Customization options */}
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Paint Color</div>
                        <div className="flex gap-2 flex-wrap">
                          {['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF', '#000000', '#FF8800', '#8800FF'].map(color => (
                            <button key={color} className="w-8 h-8 rounded-full border-2 border-gray-600 hover:border-white transition-all hover:scale-110" style={{ backgroundColor: color }} />
                          ))}
                        </div>
                      </div>
                      
                      {/* Performance upgrades */}
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Performance Upgrades</div>
                        <div className="space-y-2">
                          <UpgradeItem name="Engine Tune" cost={5000} stat="+2 Speed" />
                          <UpgradeItem name="Sport Exhaust" cost={3000} stat="+1 Acceleration" />
                          <UpgradeItem name="Sport Suspension" cost={4000} stat="+2 Handling" />
                          <UpgradeItem name="Sport Brakes" cost={3500} stat="+2 Braking" />
                          <UpgradeItem name="Turbo Kit" cost={10000} stat="+3 Speed, +1 Accel" />
                        </div>
                      </div>
                      
                      {/* Wheel options */}
                      <div className="mt-4">
                        <div className="text-sm text-gray-400 mb-2">Wheels</div>
                        <div className="grid grid-cols-4 gap-2">
                          {['Sport', 'Luxury', 'Off-road', 'Racing', 'Classic', 'Chrome', 'Matte', 'Custom'].map((w, i) => (
                            <button key={w} className="p-2 bg-white/5 hover:bg-white/10 rounded text-xs text-white text-center">
                              {w}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-2">🚗</div>
                  <div>Select a vehicle to view details</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const colorClasses: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };
  
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-400">{label}</span>
        <span className="text-white">{value}/{max}</span>
      </div>
      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${colorClasses[color]} transition-all`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}

function UpgradeItem({ name, cost, stat }: { name: string; cost: number; stat: string }) {
  const playerMoney = useGameStore(s => s.playerMoney);
  return (
    <div className="flex justify-between items-center p-2 bg-white/5 rounded">
      <div>
        <div className="text-white text-sm">{name}</div>
        <div className="text-xs text-blue-300">{stat}</div>
      </div>
      <button 
        disabled={playerMoney < cost}
        className={`px-3 py-1 rounded text-xs ${playerMoney >= cost ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-700 text-gray-500'}`}
      >
        ${cost.toLocaleString()}
      </button>
    </div>
  );
}

export function SettingsUI() {
  const showSettings = useGameStore(s => s.showSettings);
  const toggleSettings = useGameStore(s => s.toggleSettings);
  const { 
    graphicsQuality, setGraphicsQuality, trafficDensity, setTrafficDensity,
    pedestrianDensity, setPedestrianDensity, musicVolume, setMusicVolume,
    sfxVolume, setSfxVolume, weather, setWeather, timeOfDay, setTimeOfDay
  } = useGameStore();
  
  if (!showSettings) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto" onClick={(e) => { if (e.target === e.currentTarget) toggleSettings(); }}>
      <div className="w-[500px] max-h-[80vh] bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold">⚙️ Settings</h2>
          <button onClick={toggleSettings} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {/* Graphics */}
          <div>
            <h3 className="text-white font-bold mb-3">Graphics</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Quality</label>
                <div className="flex gap-2 mt-1">
                  {(['low', 'medium', 'high', 'ultra'] as const).map(q => (
                    <button
                      key={q}
                      onClick={() => setGraphicsQuality(q)}
                      className={`px-3 py-1 rounded text-sm capitalize ${graphicsQuality === q ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* World */}
          <div>
            <h3 className="text-white font-bold mb-3">World</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Traffic Density: {Math.round(trafficDensity * 100)}%</label>
                <input type="range" min="0" max="100" value={trafficDensity * 100} onChange={e => setTrafficDensity(Number(e.target.value) / 100)} className="w-full mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Pedestrian Density: {Math.round(pedestrianDensity * 100)}%</label>
                <input type="range" min="0" max="100" value={pedestrianDensity * 100} onChange={e => setPedestrianDensity(Number(e.target.value) / 100)} className="w-full mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Time of Day: {Math.floor(timeOfDay)}:00</label>
                <input type="range" min="0" max="24" step="0.5" value={timeOfDay} onChange={e => setTimeOfDay(Number(e.target.value))} className="w-full mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-400">Weather</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {(['sunny', 'cloudy', 'rain', 'fog', 'storm'] as const).map(w => (
                    <button
                      key={w}
                      onClick={() => setWeather(w)}
                      className={`px-3 py-1 rounded text-sm capitalize ${weather === w ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-400 hover:bg-white/20'}`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Audio */}
          <div>
            <h3 className="text-white font-bold mb-3">Audio</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-400">Music Volume: {Math.round(musicVolume * 100)}%</label>
                <input type="range" min="0" max="100" value={musicVolume * 100} onChange={e => setMusicVolume(Number(e.target.value) / 100)} className="w-full mt-1" />
              </div>
              <div>
                <label className="text-sm text-gray-400">SFX Volume: {Math.round(sfxVolume * 100)}%</label>
                <input type="range" min="0" max="100" value={sfxVolume * 100} onChange={e => setSfxVolume(Number(e.target.value) / 100)} className="w-full mt-1" />
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div>
            <h3 className="text-white font-bold mb-3">Controls</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Move:</span> <span className="text-white">WASD</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Sprint:</span> <span className="text-white">Shift</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Enter Car:</span> <span className="text-white">E</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Exit Car:</span> <span className="text-white">F</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Camera:</span> <span className="text-white">C</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Map:</span> <span className="text-white">M</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Phone:</span> <span className="text-white">Tab</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Garage:</span> <span className="text-white">G</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Missions:</span> <span className="text-white">J</span></div>
              <div className="p-2 bg-white/5 rounded"><span className="text-gray-400">Pause:</span> <span className="text-white">Esc</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MissionsUI() {
  const showMissions = useGameStore(s => s.showMissions);
  const toggleMissions = useGameStore(s => s.toggleMissions);
  const missions = useGameStore(s => s.missions);
  const startMission = useGameStore(s => s.startMission);
  const completedMissions = useGameStore(s => s.completedMissions);
  
  if (!showMissions) return null;
  
  const missionTypeColors: Record<string, string> = {
    taxi: 'bg-yellow-600',
    delivery: 'bg-blue-600',
    race: 'bg-red-600',
    chase: 'bg-purple-600',
    exploration: 'bg-green-600',
    parking: 'bg-orange-600',
  };
  
  const missionTypeIcons: Record<string, string> = {
    taxi: '🚕',
    delivery: '📦',
    race: '🏁',
    chase: '🚨',
    exploration: '🧭',
    parking: '🅿️',
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto" onClick={(e) => { if (e.target === e.currentTarget) toggleMissions(); }}>
      <div className="w-[700px] max-h-[80vh] bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div>
            <h2 className="text-white text-xl font-bold">📋 Missions</h2>
            <p className="text-gray-400 text-sm">{completedMissions.length}/{missions.length} completed</p>
          </div>
          <button onClick={toggleMissions} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 gap-3">
            {missions.map(m => (
              <div key={m.id} className={`p-4 rounded-lg border ${m.completed ? 'bg-green-900/20 border-green-800' : m.active ? 'bg-yellow-900/20 border-yellow-700' : 'bg-white/5 border-gray-700'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${missionTypeColors[m.type]} flex items-center justify-center text-xl`}>
                      {missionTypeIcons[m.type]}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{m.title}</h3>
                      <p className="text-gray-400 text-sm">{m.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${m.reward.toLocaleString()}</div>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${missionTypeColors[m.type]} text-white`}>{m.type}</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  {m.completed ? (
                    <span className="text-green-400 text-sm">✓ Completed</span>
                  ) : m.active ? (
                    <span className="text-yellow-400 text-sm animate-pulse">● In Progress</span>
                  ) : (
                    <button
                      onClick={() => startMission(m.id)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                    >
                      Start Mission
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PauseMenu() {
  const showPause = useGameStore(s => s.showPause);
  const togglePause = useGameStore(s => s.togglePause);
  const toggleSettings = useGameStore(s => s.toggleSettings);
  
  if (!showPause) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 pointer-events-auto">
      <div className="text-center space-y-6">
        <h1 className="text-white text-5xl font-bold">PAUSED</h1>
        <div className="space-y-3">
          <button onClick={togglePause} className="block w-64 mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            Resume Game
          </button>
          <button onClick={() => { togglePause(); toggleSettings(); }} className="block w-64 mx-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium">
            Settings
          </button>
          <button className="block w-64 mx-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium">
            Save Game
          </button>
          <button className="block w-64 mx-auto px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium">
            Load Game
          </button>
          <button className="block w-64 mx-auto px-6 py-3 bg-red-700 hover:bg-red-600 text-white rounded-lg font-medium">
            Quit to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
