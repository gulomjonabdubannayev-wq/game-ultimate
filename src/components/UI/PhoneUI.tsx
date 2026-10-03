import { useGameStore } from '../../store/gameStore';
import { useState } from 'react';

export function PhoneUI() {
  const showPhone = useGameStore(s => s.showPhone);
  const togglePhone = useGameStore(s => s.togglePhone);
  const playerMoney = useGameStore(s => s.playerMoney);
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const missions = useGameStore(s => s.missions);
  const vehicles = useGameStore(s => s.vehicles);
  const weather = useGameStore(s => s.weather);
  const [activeApp, setActiveApp] = useState<string | null>(null);
  
  if (!showPhone) return null;
  
  const formatTime = (time: number) => {
    const hours = Math.floor(time);
    const minutes = Math.floor((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };
  
  const weatherEmoji: Record<string, string> = {
    sunny: '☀️', cloudy: '☁️', rain: '🌧️', fog: '🌫️', storm: '⛈️'
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-auto" onClick={(e) => { if (e.target === e.currentTarget) togglePhone(); }}>
      <div className="w-[320px] h-[600px] bg-gray-900 rounded-[40px] border-4 border-gray-700 shadow-2xl overflow-hidden relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10" />
        
        {/* Screen */}
        <div className="w-full h-full bg-gradient-to-b from-blue-900 to-purple-900 p-6 pt-10 flex flex-col">
          {/* Status bar */}
          <div className="flex justify-between items-center text-white text-xs mb-4">
            <span>{formatTime(timeOfDay)}</span>
            <span>{weatherEmoji[weather]}</span>
            <span>📶 📡 🔋</span>
          </div>
          
          {activeApp === null ? (
            <>
              {/* Home screen */}
              <div className="text-center text-white mb-6">
                <div className="text-4xl font-light">{formatTime(timeOfDay)}</div>
                <div className="text-sm opacity-70">Tashkent City</div>
              </div>
              
              {/* App grid */}
              <div className="grid grid-cols-4 gap-4 flex-1">
                <AppIcon icon="🗺️" label="Map" onClick={() => setActiveApp('map')} />
                <AppIcon icon="💬" label="Messages" onClick={() => setActiveApp('messages')} />
                <AppIcon icon="📋" label="Missions" onClick={() => setActiveApp('missions')} />
                <AppIcon icon="🚗" label="Garage" onClick={() => setActiveApp('garage')} />
                <AppIcon icon="💰" label="Bank" onClick={() => setActiveApp('bank')} />
                <AppIcon icon="📞" label="Contacts" onClick={() => setActiveApp('contacts')} />
                <AppIcon icon="📷" label="Camera" onClick={() => setActiveApp('camera')} />
                <AppIcon icon="⚙️" label="Settings" onClick={() => setActiveApp('settings')} />
                <AppIcon icon="🎵" label="Radio" onClick={() => setActiveApp('radio')} />
                <AppIcon icon="🏪" label="Shops" onClick={() => setActiveApp('shops')} />
                <AppIcon icon="📊" label="Stats" onClick={() => setActiveApp('stats')} />
                <AppIcon icon="🔧" label="Mechanic" onClick={() => setActiveApp('mechanic')} />
              </div>
              
              {/* Home indicator */}
              <div className="flex justify-center mt-4">
                <div className="w-32 h-1 bg-white/30 rounded-full" />
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setActiveApp(null)} className="text-white text-sm hover:text-blue-300">← Back</button>
                <span className="text-white font-medium capitalize">{activeApp}</span>
                <div className="w-10" />
              </div>
              
              <div className="flex-1 bg-black/30 rounded-2xl p-4 overflow-y-auto">
                {activeApp === 'map' && <PhoneMapContent />}
                {activeApp === 'missions' && <PhoneMissionsContent />}
                {activeApp === 'garage' && <PhoneGarageContent />}
                {activeApp === 'bank' && <PhoneBankContent money={playerMoney} />}
                {activeApp === 'messages' && <PhoneMessagesContent />}
                {activeApp === 'contacts' && <PhoneContactsContent />}
                {activeApp === 'settings' && <PhoneSettingsContent />}
                {activeApp === 'stats' && <PhoneStatsContent />}
                {activeApp === 'radio' && <PhoneRadioContent />}
                {activeApp === 'shops' && <PhoneShopsContent />}
                {activeApp === 'camera' && <PhoneCameraContent />}
                {activeApp === 'mechanic' && <PhoneMechanicContent />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AppIcon({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl group-hover:bg-white/20 transition-all group-hover:scale-110">
        {icon}
      </div>
      <span className="text-[10px] text-white/70">{label}</span>
    </button>
  );
}

function PhoneMapContent() {
  const playerPosition = useGameStore(s => s.playerPosition);
  return (
    <div className="text-white text-sm space-y-2">
      <div className="text-green-400 font-bold mb-2">📍 Your Location</div>
      <div>X: {playerPosition[0].toFixed(1)}</div>
      <div>Z: {playerPosition[2].toFixed(1)}</div>
      <div className="mt-4 p-3 bg-blue-900/50 rounded-lg">
        <div className="text-xs text-blue-300">District: Downtown</div>
        <div className="text-xs text-gray-400 mt-1">Region: Central Tashkent</div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="p-2 bg-green-900/50 rounded text-xs">🏪 Market - 200m</div>
        <div className="p-2 bg-blue-900/50 rounded text-xs">⛽ Gas - 150m</div>
        <div className="p-2 bg-purple-900/50 rounded text-xs">🏠 Garage - 300m</div>
        <div className="p-2 bg-yellow-900/50 rounded text-xs">🏁 Race - 500m</div>
      </div>
    </div>
  );
}

function PhoneMissionsContent() {
  const missions = useGameStore(s => s.missions);
  const startMission = useGameStore(s => s.startMission);
  return (
    <div className="space-y-2">
      {missions.map(m => (
        <div key={m.id} className={`p-3 rounded-lg ${m.completed ? 'bg-green-900/30' : m.active ? 'bg-yellow-900/30' : 'bg-white/5'}`}>
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-medium">{m.title}</span>
            <span className="text-green-400 text-xs">${m.reward}</span>
          </div>
          <div className="text-gray-400 text-xs mt-1">{m.description}</div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-blue-300 capitalize">{m.type}</span>
            {!m.completed && !m.active && (
              <button onClick={() => startMission(m.id)} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded">
                Start
              </button>
            )}
            {m.completed && <span className="text-xs text-green-400">✓ Complete</span>}
            {m.active && <span className="text-xs text-yellow-400 animate-pulse">● Active</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneGarageContent() {
  const vehicles = useGameStore(s => s.vehicles);
  const ownedVehicles = vehicles.filter(v => v.owned);
  return (
    <div className="space-y-2">
      <div className="text-white text-sm font-bold mb-2">🚗 Owned Vehicles ({ownedVehicles.length})</div>
      {ownedVehicles.map(v => (
        <div key={v.id} className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: v.color }} />
            <div>
              <div className="text-white text-sm">{v.brand} {v.name}</div>
              <div className="text-gray-400 text-xs">{v.category}</div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1 mt-2">
            <StatBar label="SPD" value={v.speed} />
            <StatBar label="ACC" value={v.acceleration} />
            <StatBar label="HND" value={v.handling} />
            <StatBar label="BRK" value={v.braking} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneBankContent({ money }: { money: number }) {
  return (
    <div className="text-white space-y-4">
      <div className="text-center">
        <div className="text-gray-400 text-xs">Balance</div>
        <div className="text-3xl font-bold text-green-400">${money.toLocaleString()}</div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between p-2 bg-white/5 rounded">
          <span className="text-xs text-gray-400">Last Earning</span>
          <span className="text-xs text-green-400">+$500</span>
        </div>
        <div className="flex justify-between p-2 bg-white/5 rounded">
          <span className="text-xs text-gray-400">Spent on Fuel</span>
          <span className="text-xs text-red-400">-$50</span>
        </div>
      </div>
    </div>
  );
}

function PhoneMessagesContent() {
  return (
    <div className="text-white space-y-3">
      <MessageItem from="Rustam" msg="Hey! Want to race tonight? 🏁" time="2m ago" />
      <MessageItem from="Garage" msg="Your car is ready for pickup 🔧" time="1h ago" />
      <MessageItem from="Diler" msg="New arrivals at the dealership! 🚗" time="3h ago" />
      <MessageItem from="System" msg="Welcome to Tashkent City! Complete missions to earn money." time="1d ago" />
    </div>
  );
}

function MessageItem({ from, msg, time }: { from: string; msg: string; time: string }) {
  return (
    <div className="p-3 bg-white/5 rounded-lg">
      <div className="flex justify-between">
        <span className="text-sm font-medium">{from}</span>
        <span className="text-xs text-gray-400">{time}</span>
      </div>
      <div className="text-xs text-gray-300 mt-1">{msg}</div>
    </div>
  );
}

function PhoneContactsContent() {
  const contacts = [
    { name: 'Rustam', role: 'Street Racer', phone: '+998 90 123 4567' },
    { name: 'Diler (Dealer)', role: 'Car Dealership', phone: '+998 91 234 5678' },
    { name: 'Aleksei', role: 'Mechanic', phone: '+998 93 345 6789' },
    { name: 'Malika', role: 'Taxi Dispatcher', phone: '+998 94 456 7890' },
    { name: 'Timur', role: 'Mission Contact', phone: '+998 95 567 8901' },
  ];
  return (
    <div className="text-white space-y-2">
      {contacts.map((c, i) => (
        <div key={i} className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm">
            {c.name[0]}
          </div>
          <div>
            <div className="text-sm">{c.name}</div>
            <div className="text-xs text-gray-400">{c.role}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PhoneSettingsContent() {
  const { musicVolume, sfxVolume, setMusicVolume, setSfxVolume } = useGameStore();
  return (
    <div className="text-white space-y-4">
      <div>
        <label className="text-xs text-gray-400">Music Volume</label>
        <input type="range" min="0" max="100" value={musicVolume * 100} onChange={e => setMusicVolume(Number(e.target.value) / 100)} className="w-full" />
      </div>
      <div>
        <label className="text-xs text-gray-400">SFX Volume</label>
        <input type="range" min="0" max="100" value={sfxVolume * 100} onChange={e => setSfxVolume(Number(e.target.value) / 100)} className="w-full" />
      </div>
    </div>
  );
}

function PhoneStatsContent() {
  const { missions, completedMissions, playerMoney, vehicles } = useGameStore();
  return (
    <div className="text-white space-y-3">
      <div className="text-sm font-bold">📊 Player Statistics</div>
      <div className="p-2 bg-white/5 rounded">
        <div className="text-xs text-gray-400">Missions Completed</div>
        <div className="text-lg">{completedMissions.length} / {missions.length}</div>
      </div>
      <div className="p-2 bg-white/5 rounded">
        <div className="text-xs text-gray-400">Total Money Earned</div>
        <div className="text-lg text-green-400">${playerMoney.toLocaleString()}</div>
      </div>
      <div className="p-2 bg-white/5 rounded">
        <div className="text-xs text-gray-400">Vehicles Owned</div>
        <div className="text-lg">{vehicles.filter(v => v.owned).length}</div>
      </div>
    </div>
  );
}

function PhoneRadioContent() {
  const stations = ['Uzbek Hits FM', 'Road Rock Radio', 'Classical Tashkent', 'Electronic Beats', 'Pop Central'];
  return (
    <div className="text-white space-y-2">
      <div className="text-sm font-bold mb-3">🎵 Radio Stations</div>
      {stations.map((s, i) => (
        <div key={i} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer">
          <div className="text-sm">{s}</div>
          <div className="text-xs text-gray-400">10{i}.{i} FM</div>
        </div>
      ))}
    </div>
  );
}

function PhoneShopsContent() {
  const shops = [
    { name: 'City Mall', type: 'Shopping', dist: '500m' },
    { name: 'Bazaar Market', type: 'Market', dist: '200m' },
    { name: 'Auto Parts Shop', type: 'Auto', dist: '350m' },
    { name: 'Clothing Store', type: 'Fashion', dist: '400m' },
    { name: 'Electronics', type: 'Tech', dist: '600m' },
  ];
  return (
    <div className="text-white space-y-2">
      <div className="text-sm font-bold mb-3">🏪 Nearby Shops</div>
      {shops.map((s, i) => (
        <div key={i} className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
          <div>
            <div className="text-sm">{s.name}</div>
            <div className="text-xs text-gray-400">{s.type}</div>
          </div>
          <div className="text-xs text-blue-300">{s.dist}</div>
        </div>
      ))}
    </div>
  );
}

function PhoneCameraContent() {
  return (
    <div className="text-white text-center space-y-4">
      <div className="text-4xl">📷</div>
      <div className="text-sm">Photo Mode</div>
      <div className="text-xs text-gray-400">Press C to cycle cameras for screenshots</div>
      <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm">
        Take Photo
      </button>
    </div>
  );
}

function PhoneMechanicContent() {
  const vehicles = useGameStore(s => s.vehicles);
  const ownedVehicles = vehicles.filter(v => v.owned && v.damage > 0);
  return (
    <div className="text-white space-y-3">
      <div className="text-sm font-bold">🔧 Mechanic Services</div>
      {ownedVehicles.length === 0 ? (
        <div className="text-xs text-green-400 text-center py-4">All vehicles in good condition! ✓</div>
      ) : (
        ownedVehicles.map(v => (
          <div key={v.id} className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
            <div>
              <div className="text-sm">{v.name}</div>
              <div className="text-xs text-red-400">Damage: {v.damage}%</div>
            </div>
            <button className="text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded">
              Repair ${v.damage * 10}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-[8px] text-gray-400">{label}</div>
      <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-full bg-blue-400" style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  );
}
