import { create } from 'zustand';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  category: string;
  color: string;
  price: number;
  speed: number;
  acceleration: number;
  handling: number;
  braking: number;
  fuel: number;
  maxFuel: number;
  damage: number;
  owned: boolean;
  position: [number, number, number];
  rotation: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'taxi' | 'delivery' | 'race' | 'chase' | 'exploration' | 'parking';
  reward: number;
  completed: boolean;
  active: boolean;
  location: [number, number, number];
  targetLocation?: [number, number, number];
}

export interface GameState {
  // Player
  playerPosition: [number, number, number];
  playerRotation: number;
  playerHealth: number;
  playerMoney: number;
  isInVehicle: boolean;
  currentVehicleId: string | null;
  isRunning: boolean;
  
  // Time & Weather
  timeOfDay: number; // 0-24
  weather: 'sunny' | 'cloudy' | 'rain' | 'fog' | 'storm';
  dayNightSpeed: number;
  
  // UI State
  showPhone: boolean;
  showMap: boolean;
  showGarage: boolean;
  showMissions: boolean;
  showSettings: boolean;
  showPause: boolean;
  cameraMode: 'third' | 'first' | 'interior' | 'cinematic';
  
  // Game Systems
  wantedLevel: number;
  gameMode: 'story' | 'freeroam' | 'racing' | 'taxi' | 'delivery';
  currentMission: Mission | null;
  
  // Vehicles
  vehicles: Vehicle[];
  
  // Missions
  missions: Mission[];
  completedMissions: string[];
  
  // Vehicle speed (for HUD)
  currentSpeed: number;
  
  // Settings
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  trafficDensity: number;
  pedestrianDensity: number;
  musicVolume: number;
  sfxVolume: number;
  language: string;
  
  // Actions
  setCurrentSpeed: (speed: number) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  setPlayerRotation: (rot: number) => void;
  setPlayerHealth: (health: number) => void;
  addMoney: (amount: number) => void;
  spendMoney: (amount: number) => boolean;
  enterVehicle: (vehicleId: string) => void;
  exitVehicle: () => void;
  setTimeOfDay: (time: number) => void;
  setWeather: (weather: 'sunny' | 'cloudy' | 'rain' | 'fog' | 'storm') => void;
  togglePhone: () => void;
  toggleMap: () => void;
  toggleGarage: () => void;
  toggleMissions: () => void;
  toggleSettings: () => void;
  togglePause: () => void;
  setCameraMode: (mode: 'third' | 'first' | 'interior' | 'cinematic') => void;
  setWantedLevel: (level: number) => void;
  setGameMode: (mode: 'story' | 'freeroam' | 'racing' | 'taxi' | 'delivery') => void;
  startMission: (missionId: string) => void;
  completeMission: (missionId: string) => void;
  buyVehicle: (vehicleId: string) => boolean;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high' | 'ultra') => void;
  setTrafficDensity: (density: number) => void;
  setPedestrianDensity: (density: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  setIsRunning: (running: boolean) => void;
}

const initialVehicles: Vehicle[] = [
  { id: 'cobalt', name: 'Cobalt', brand: 'Chevrolet', category: 'Sedan', color: '#FFFFFF', price: 15000, speed: 7, acceleration: 5, handling: 7, braking: 7, fuel: 100, maxFuel: 100, damage: 0, owned: true, position: [5, 0.5, 5], rotation: 0 },
  { id: 'nexia3', name: 'Nexia 3', brand: 'Chevrolet', category: 'Sedan', color: '#C0C0C0', price: 12000, speed: 6, acceleration: 5, handling: 6, braking: 6, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [10, 0.5, 5], rotation: 0 },
  { id: 'malibu2', name: 'Malibu 2', brand: 'Chevrolet', category: 'Sedan', color: '#1a1a2e', price: 35000, speed: 8, acceleration: 7, handling: 8, braking: 8, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [15, 0.5, 5], rotation: 0 },
  { id: 'tracker', name: 'Tracker', brand: 'Chevrolet', category: 'SUV', color: '#2d5016', price: 28000, speed: 7, acceleration: 6, handling: 6, braking: 7, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [20, 0.5, 5], rotation: 0 },
  { id: 'equinox', name: 'Equinox', brand: 'Chevrolet', category: 'SUV', color: '#8B0000', price: 32000, speed: 8, acceleration: 7, handling: 7, braking: 7, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [25, 0.5, 5], rotation: 0 },
  { id: 'bmw_m5', name: 'M5 Competition', brand: 'Bavarian', category: 'Sport', color: '#000080', price: 85000, speed: 10, acceleration: 9, handling: 9, braking: 9, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [30, 0.5, 5], rotation: 0 },
  { id: 'merc_amg', name: 'AMG GT', brand: 'Stuttgart', category: 'Sport', color: '#C0C0C0', price: 120000, speed: 10, acceleration: 10, handling: 9, braking: 9, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [35, 0.5, 5], rotation: 0 },
  { id: 'audi_rs', name: 'RS7', brand: 'Ingolstadt', category: 'Sport', color: '#2F4F4F', price: 95000, speed: 10, acceleration: 9, handling: 9, braking: 9, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [40, 0.5, 5], rotation: 0 },
  { id: 'porsche_911', name: 'Turbo S', brand: 'Stuttgart Sport', category: 'Super', color: '#FFD700', price: 180000, speed: 10, acceleration: 10, handling: 10, braking: 10, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [45, 0.5, 5], rotation: 0 },
  { id: 'ferrari_style', name: 'Maranello F8', brand: 'Modena', category: 'Super', color: '#FF0000', price: 350000, speed: 10, acceleration: 10, handling: 10, braking: 10, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [50, 0.5, 5], rotation: 0 },
  { id: 'lambo_style', name: 'Sant\'Agata SV', brand: 'Bologna', category: 'Super', color: '#00FF00', price: 420000, speed: 10, acceleration: 10, handling: 10, braking: 10, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [55, 0.5, 5], rotation: 0 },
  { id: 'tesla_style', name: 'Model S Plaid', brand: 'ElectroMotors', category: 'Electric', color: '#FFFFFF', price: 110000, speed: 10, acceleration: 10, handling: 8, braking: 9, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [60, 0.5, 5], rotation: 0 },
  { id: 'range_rover', name: 'Autobiography', brand: 'Solihull', category: 'SUV', color: '#000000', price: 150000, speed: 8, acceleration: 7, handling: 7, braking: 8, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [65, 0.5, 5], rotation: 0 },
  { id: 'toyota_camry', name: 'Camry', brand: 'Toyota', category: 'Sedan', color: '#4169E1', price: 25000, speed: 7, acceleration: 6, handling: 7, braking: 7, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [70, 0.5, 5], rotation: 0 },
  { id: 'lexus_ls', name: 'LS 500', brand: 'Lexus', category: 'Luxury', color: '#191970', price: 75000, speed: 8, acceleration: 7, handling: 8, braking: 8, fuel: 100, maxFuel: 100, damage: 0, owned: false, position: [75, 0.5, 5], rotation: 0 },
];

const initialMissions: Mission[] = [
  { id: 'm1', title: 'First Drive', description: 'Drive to the city center to begin your journey.', type: 'exploration', reward: 500, completed: false, active: false, location: [0, 0, 0], targetLocation: [50, 0, 50] },
  { id: 'm2', title: 'Taxi Service', description: 'Pick up a passenger and drive them to their destination safely.', type: 'taxi', reward: 1000, completed: false, active: false, location: [30, 0, 20], targetLocation: [80, 0, 80] },
  { id: 'm3', title: 'Express Delivery', description: 'Deliver this package across the city before time runs out!', type: 'delivery', reward: 1500, completed: false, active: false, location: [-20, 0, 30], targetLocation: [60, 0, -40] },
  { id: 'm4', title: 'Street Race: Downtown', description: 'Win the street race through downtown to prove your skills.', type: 'race', reward: 5000, completed: false, active: false, location: [40, 0, 40], targetLocation: [100, 0, 100] },
  { id: 'm5', title: 'High Speed Chase', description: 'Evade the pursuit vehicles and escape the zone!', type: 'chase', reward: 3000, completed: false, active: false, location: [-30, 0, -30], targetLocation: [90, 0, 90] },
  { id: 'm6', title: 'Parking Master', description: 'Park the vehicle perfectly in the designated spot.', type: 'parking', reward: 2000, completed: false, active: false, location: [20, 0, 60], targetLocation: [25, 0, 65] },
  { id: 'm7', title: 'Highway Run', description: 'Race along the highway and reach the checkpoint in record time.', type: 'race', reward: 4000, completed: false, active: false, location: [60, 0, 0], targetLocation: [120, 0, 0] },
  { id: 'm8', title: 'VIP Transport', description: 'Transport a VIP client safely to the airport.', type: 'taxi', reward: 2500, completed: false, active: false, location: [10, 0, 80], targetLocation: [-50, 0, 100] },
];

export const useGameStore = create<GameState>((set, get) => ({
  // Player
  playerPosition: [0, 1, 0],
  playerRotation: 0,
  playerHealth: 100,
  playerMoney: 25000,
  isInVehicle: false,
  currentVehicleId: null,
  isRunning: false,
  
  // Time & Weather
  timeOfDay: 10,
  weather: 'sunny',
  dayNightSpeed: 0.001,
  
  // UI State
  showPhone: false,
  showMap: false,
  showGarage: false,
  showMissions: false,
  showSettings: false,
  showPause: false,
  cameraMode: 'third',
  
  // Game Systems
  wantedLevel: 0,
  gameMode: 'freeroam',
  currentMission: null,
  
  // Vehicles
  vehicles: initialVehicles,
  
  // Missions
  missions: initialMissions,
  completedMissions: [],
  
  // Vehicle speed
  currentSpeed: 0,
  
  // Settings
  graphicsQuality: 'high',
  trafficDensity: 0.7,
  pedestrianDensity: 0.7,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  language: 'en',
  
  // Actions
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerRotation: (rot) => set({ playerRotation: rot }),
  setPlayerHealth: (health) => set({ playerHealth: Math.max(0, Math.min(100, health)) }),
  addMoney: (amount) => set((state) => ({ playerMoney: state.playerMoney + amount })),
  spendMoney: (amount) => {
    const state = get();
    if (state.playerMoney >= amount) {
      set({ playerMoney: state.playerMoney - amount });
      return true;
    }
    return false;
  },
  enterVehicle: (vehicleId) => set({ isInVehicle: true, currentVehicleId: vehicleId }),
  exitVehicle: () => set({ isInVehicle: false, currentVehicleId: null }),
  setTimeOfDay: (time) => set({ timeOfDay: time % 24 }),
  setWeather: (weather) => set({ weather }),
  togglePhone: () => set((state) => ({ showPhone: !state.showPhone, showMap: false, showGarage: false, showMissions: false, showSettings: false })),
  toggleMap: () => set((state) => ({ showMap: !state.showMap, showPhone: false, showGarage: false, showMissions: false, showSettings: false })),
  toggleGarage: () => set((state) => ({ showGarage: !state.showGarage, showPhone: false, showMap: false, showMissions: false, showSettings: false })),
  toggleMissions: () => set((state) => ({ showMissions: !state.showMissions, showPhone: false, showMap: false, showGarage: false, showSettings: false })),
  toggleSettings: () => set((state) => ({ showSettings: !state.showSettings, showPhone: false, showMap: false, showGarage: false, showMissions: false })),
  togglePause: () => set((state) => ({ showPause: !state.showPause })),
  setCameraMode: (mode) => set({ cameraMode: mode }),
  setWantedLevel: (level) => set({ wantedLevel: Math.max(0, Math.min(5, level)) }),
  setGameMode: (mode) => set({ gameMode: mode }),
  startMission: (missionId) => {
    const mission = get().missions.find(m => m.id === missionId);
    if (mission && !mission.completed) {
      set((state) => ({
        currentMission: { ...mission, active: true },
        missions: state.missions.map(m => m.id === missionId ? { ...m, active: true } : m),
        showMissions: false,
      }));
    }
  },
  completeMission: (missionId) => {
    const mission = get().missions.find(m => m.id === missionId);
    if (mission) {
      set((state) => ({
        missions: state.missions.map(m => m.id === missionId ? { ...m, completed: true, active: false } : m),
        completedMissions: [...state.completedMissions, missionId],
        currentMission: null,
        playerMoney: state.playerMoney + mission.reward,
      }));
    }
  },
  buyVehicle: (vehicleId) => {
    const vehicle = get().vehicles.find(v => v.id === vehicleId);
    if (vehicle && !vehicle.owned && get().playerMoney >= vehicle.price) {
      set((state) => ({
        vehicles: state.vehicles.map(v => v.id === vehicleId ? { ...v, owned: true } : v),
        playerMoney: state.playerMoney - vehicle.price,
      }));
      return true;
    }
    return false;
  },
  updateVehicle: (vehicleId, updates) => set((state) => ({
    vehicles: state.vehicles.map(v => v.id === vehicleId ? { ...v, ...updates } : v),
  })),
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
  setTrafficDensity: (density) => set({ trafficDensity: density }),
  setPedestrianDensity: (density) => set({ pedestrianDensity: density }),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  setSfxVolume: (volume) => set({ sfxVolume: volume }),
  setIsRunning: (running) => set({ isRunning: running }),
  setCurrentSpeed: (speed) => set({ currentSpeed: speed }),
}));
