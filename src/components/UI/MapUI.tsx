import { useGameStore } from '../../store/gameStore';

export function MapUI() {
  const showMap = useGameStore(s => s.showMap);
  const toggleMap = useGameStore(s => s.toggleMap);
  const playerPosition = useGameStore(s => s.playerPosition);
  const missions = useGameStore(s => s.missions);
  const currentMission = useGameStore(s => s.currentMission);
  
  if (!showMap) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto" onClick={(e) => { if (e.target === e.currentTarget) toggleMap(); }}>
      <div className="w-[80vw] h-[80vh] max-w-[900px] max-h-[700px] bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-700 overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-white text-xl font-bold">🗺️ City Map</h2>
          <button onClick={toggleMap} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>
        
        {/* Map content */}
        <div className="flex h-[calc(100%-60px)]">
          {/* Map area */}
          <div className="flex-1 relative bg-green-900/30 overflow-hidden">
            {/* Grid */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
              {/* Background */}
              <rect width="400" height="400" fill="#1a3a1a" />
              
              {/* Water */}
              <ellipse cx="200" cy="320" rx="80" ry="30" fill="#1a4a6a" opacity="0.5" />
              
              {/* Main roads */}
              <line x1="200" y1="0" x2="200" y2="400" stroke="#555" strokeWidth="4" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#555" strokeWidth="4" />
              <line x1="0" y1="120" x2="400" y2="120" stroke="#444" strokeWidth="3" />
              <line x1="0" y1="280" x2="400" y2="280" stroke="#444" strokeWidth="3" />
              <line x1="120" y1="0" x2="120" y2="400" stroke="#444" strokeWidth="3" />
              <line x1="280" y1="0" x2="280" y2="400" stroke="#444" strokeWidth="3" />
              
              {/* Highway */}
              <line x1="0" y1="160" x2="400" y2="160" stroke="#666" strokeWidth="5" />
              <line x1="160" y1="0" x2="160" y2="400" stroke="#666" strokeWidth="5" />
              
              {/* Buildings (blocks) */}
              {Array.from({ length: 30 }).map((_, i) => {
                const x = 30 + (i % 6) * 60 + Math.sin(i) * 15;
                const y = 30 + Math.floor(i / 6) * 60 + Math.cos(i) * 15;
                return <rect key={i} x={x} y={y} width="20" height="20" fill="#334" opacity="0.5" rx="2" />;
              })}
              
              {/* Parks */}
              <circle cx="80" cy="80" r="25" fill="#2a5a2a" opacity="0.7" />
              <text x="80" y="85" textAnchor="middle" fill="#6a6" fontSize="8">Park</text>
              
              {/* Market */}
              <rect x="280" y="240" width="40" height="30" fill="#5a4a2a" opacity="0.7" rx="3" />
              <text x="300" y="258" textAnchor="middle" fill="#aa8" fontSize="7">Market</text>
              
              {/* Gas stations */}
              <circle cx="120" cy="60" r="5" fill="#ffcc00" />
              <circle cx="300" cy="120" r="5" fill="#ffcc00" />
              
              {/* Player position */}
              <circle 
                cx={200 + playerPosition[0] * 1.2} 
                cy={200 + playerPosition[2] * 1.2} 
                r="6" 
                fill="#4488ff" 
                stroke="white" 
                strokeWidth="2"
              />
              <circle 
                cx={200 + playerPosition[0] * 1.2} 
                cy={200 + playerPosition[2] * 1.2} 
                r="10" 
                fill="none" 
                stroke="#4488ff" 
                strokeWidth="1"
                opacity="0.5"
              >
                <animate attributeName="r" from="6" to="15" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
              
              {/* Mission markers */}
              {missions.filter(m => !m.completed).map(m => (
                <g key={m.id}>
                  <circle 
                    cx={200 + (m.location[0] || 0) * 1.2} 
                    cy={200 + (m.location[2] || 0) * 1.2} 
                    r="4" 
                    fill={m.type === 'race' ? '#ff4444' : m.type === 'taxi' ? '#ffcc00' : '#44ff44'} 
                  />
                </g>
              ))}
              
              {/* Current mission target */}
              {currentMission?.targetLocation && (
                <g>
                  <circle 
                    cx={200 + currentMission.targetLocation[0] * 1.2} 
                    cy={200 + currentMission.targetLocation[2] * 1.2} 
                    r="6" 
                    fill="none" 
                    stroke="#ffcc00" 
                    strokeWidth="2"
                  >
                    <animate attributeName="r" from="4" to="10" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                  <text 
                    x={200 + currentMission.targetLocation[0] * 1.2} 
                    y={200 + currentMission.targetLocation[2] * 1.2 - 10}
                    textAnchor="middle" 
                    fill="#ffcc00" 
                    fontSize="8"
                  >
                    🎯 Target
                  </text>
                </g>
              )}
              
              {/* District labels */}
              <text x="200" y="200" textAnchor="middle" fill="#888" fontSize="10">DOWNTOWN</text>
              <text x="340" y="200" textAnchor="middle" fill="#888" fontSize="8">RESIDENTIAL</text>
              <text x="60" y="200" textAnchor="middle" fill="#888" fontSize="8">INDUSTRIAL</text>
              <text x="200" y="350" textAnchor="middle" fill="#888" fontSize="8">SHOPPING</text>
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-black/70 rounded-lg p-2 text-xs text-white space-y-1">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /> You</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /> Race</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /> Taxi</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /> Mission</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full" /> Gas</div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-64 border-l border-gray-700 p-4 overflow-y-auto">
            <h3 className="text-white font-bold mb-3">Locations</h3>
            <div className="space-y-2">
              <LocationItem icon="🏢" name="City Center" dist="0m" />
              <LocationItem icon="⛽" name="Gas Station" dist="150m" />
              <LocationItem icon="🏪" name="Bazaar Market" dist="200m" />
              <LocationItem icon="🏠" name="Your Garage" dist="300m" />
              <LocationItem icon="🏁" name="Race Point" dist="500m" />
              <LocationItem icon="🏥" name="Hospital" dist="400m" />
              <LocationItem icon="🚔" name="Police Station" dist="350m" />
              <LocationItem icon="🌳" name="Central Park" dist="250m" />
              <LocationItem icon="🏭" name="Industrial Zone" dist="800m" />
              <LocationItem icon="🌉" name="Bridge" dist="600m" />
            </div>
            
            <h3 className="text-white font-bold mt-4 mb-2">Coordinates</h3>
            <div className="text-xs text-gray-400 space-y-1">
              <div>X: {playerPosition[0].toFixed(1)}</div>
              <div>Y: {playerPosition[1].toFixed(1)}</div>
              <div>Z: {playerPosition[2].toFixed(1)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LocationItem({ icon, name, dist }: { icon: string; name: string; dist: string }) {
  return (
    <div className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 cursor-pointer">
      <div className="flex items-center gap-2">
        <span>{icon}</span>
        <span className="text-white text-sm">{name}</span>
      </div>
      <span className="text-xs text-gray-400">{dist}</span>
    </div>
  );
}
