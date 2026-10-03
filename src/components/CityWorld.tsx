import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

// Building component
function Building({ position, size, color, type }: { position: [number, number, number]; size: [number, number, number]; color: string; type?: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow position={[0, size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Windows */}
      {type !== 'park' && Array.from({ length: Math.floor(size[1] / 3) }).map((_, floor) =>
        Array.from({ length: Math.floor(size[0] / 2.5) }).map((_, w) => (
          <mesh key={`${floor}-${w}`} position={[
            -size[0] / 2 + 1.5 + w * 2.5,
            2 + floor * 3,
            size[2] / 2 + 0.05
          ]}>
            <planeGeometry args={[1.2, 1.8]} />
            <meshStandardMaterial 
              color="#87CEEB" 
              emissive="#4488aa" 
              emissiveIntensity={0.3}
              metalness={0.9}
              roughness={0.1}
            />
          </mesh>
        ))
      )}
    </group>
  );
}

// Road segment
function Road({ position, size, rotation = 0 }: { position: [number, number, number]; size: [number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#333333" roughness={0.9} />
      </mesh>
      {/* Road markings */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[0.2, size[1]]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Traffic light
function TrafficLight({ position }: { position: [number, number, number] }) {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const lightRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (lightRef.current) {
      const cycle = Math.floor(clock.getElapsedTime() / 5) % 3;
      const mat = lightRef.current.material as THREE.MeshStandardMaterial;
      if (cycle === 0) mat.color.set('#00ff00');
      else if (cycle === 1) mat.color.set('#ffff00');
      else mat.color.set('#ff0000');
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 5]} />
        <meshStandardMaterial color="#444444" metalness={0.8} />
      </mesh>
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[0.6, 1.5, 0.6]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
      <mesh ref={lightRef} position={[0, 5.2, 0.35]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// Tree
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 3]} />
        <meshStandardMaterial color="#4a3728" />
      </mesh>
      <mesh position={[0, 4, 0]} castShadow>
        <sphereGeometry args={[2, 8, 8]} />
        <meshStandardMaterial color="#228B22" />
      </mesh>
    </group>
  );
}

// Street lamp
function StreetLamp({ position }: { position: [number, number, number] }) {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const isNight = timeOfDay < 6 || timeOfDay > 19;
  
  return (
    <group position={position}>
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 6]} />
        <meshStandardMaterial color="#555555" metalness={0.9} />
      </mesh>
      <mesh position={[0, 6.2, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial 
          color="#ffffcc" 
          emissive="#ffffcc" 
          emissiveIntensity={isNight ? 3 : 0} 
        />
      </mesh>
      {isNight && (
        <pointLight position={[0, 6, 0]} intensity={5} distance={15} color="#ffffcc" />
      )}
    </group>
  );
}

// Gas station
function GasStation({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 4, 8]} />
        <meshStandardMaterial color="#e8e8e8" />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <boxGeometry args={[14, 0.3, 10]} />
        <meshStandardMaterial color="#cc0000" />
      </mesh>
      {/* Fuel pumps */}
      {[-3, 0, 3].map((x, i) => (
        <mesh key={i} position={[x, 1, 5]} castShadow>
          <boxGeometry args={[0.8, 2, 0.5]} />
          <meshStandardMaterial color="#ffcc00" />
        </mesh>
      ))}
    </group>
  );
}

// Park bench
function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2, 0.1, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0, 0.7, -0.25]} castShadow>
        <boxGeometry args={[2, 0.6, 0.1]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}

export function CityWorld() {
  const buildings = useMemo(() => {
    const b: { position: [number, number, number]; size: [number, number, number]; color: string; type?: string }[] = [];
    
    // Downtown - tall buildings
    const downtownColors = ['#4a6fa5', '#6b7b8d', '#8899aa', '#556677', '#3d5a80', '#778899'];
    for (let x = -60; x <= 60; x += 18) {
      for (let z = -60; z <= 60; z += 18) {
        if (Math.abs(x) < 8 || Math.abs(z) < 8) continue; // Leave space for roads
        if (Math.random() > 0.7) continue;
        const height = 15 + Math.random() * 40;
        const width = 6 + Math.random() * 8;
        const depth = 6 + Math.random() * 8;
        b.push({
          position: [x + (Math.random() - 0.5) * 4, 0, z + (Math.random() - 0.5) * 4],
          size: [width, height, depth],
          color: downtownColors[Math.floor(Math.random() * downtownColors.length)],
        });
      }
    }
    
    // Residential area
    const residentialColors = ['#d4a574', '#c9b896', '#e8d5b7', '#b8a088', '#f5e6d3'];
    for (let x = 70; x <= 140; x += 14) {
      for (let z = -40; z <= 40; z += 14) {
        if (Math.random() > 0.6) continue;
        const height = 4 + Math.random() * 6;
        b.push({
          position: [x, 0, z],
          size: [5 + Math.random() * 4, height, 5 + Math.random() * 4],
          color: residentialColors[Math.floor(Math.random() * residentialColors.length)],
        });
      }
    }
    
    // Industrial area
    for (let x = -140; x <= -80; x += 20) {
      for (let z = -40; z <= 40; z += 20) {
        if (Math.random() > 0.5) continue;
        b.push({
          position: [x, 0, z],
          size: [12 + Math.random() * 8, 6 + Math.random() * 4, 12 + Math.random() * 8],
          color: '#7a7a7a',
        });
      }
    }
    
    // Shopping district
    for (let x = -40; x <= 40; x += 16) {
      for (let z = 70; z <= 120; z += 16) {
        if (Math.random() > 0.6) continue;
        b.push({
          position: [x, 0, z],
          size: [8 + Math.random() * 6, 5 + Math.random() * 5, 8 + Math.random() * 6],
          color: ['#e0c8a8', '#d4b896', '#c8a882'][Math.floor(Math.random() * 3)],
        });
      }
    }
    
    return b;
  }, []);

  const trees = useMemo(() => {
    const t: [number, number, number][] = [];
    // Park area
    for (let i = 0; i < 40; i++) {
      t.push([
        -50 + Math.random() * 30,
        0,
        -50 + Math.random() * 30,
      ]);
    }
    // Along roads
    for (let x = -80; x <= 80; x += 12) {
      if (Math.random() > 0.5) t.push([x, 0, 7]);
      if (Math.random() > 0.5) t.push([x, 0, -7]);
    }
    return t;
  }, []);

  const lamps = useMemo(() => {
    const l: [number, number, number][] = [];
    for (let x = -80; x <= 80; x += 15) {
      l.push([x, 0, 6]);
      l.push([x, 0, -6]);
    }
    for (let z = -80; z <= 80; z += 15) {
      l.push([6, 0, z]);
      l.push([-6, 0, z]);
    }
    return l;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#3a5a3a" />
      </mesh>
      
      {/* Main roads - grid pattern */}
      <Road position={[0, 0, 0]} size={[12, 300]} />
      <Road position={[0, 0, 0]} size={[12, 300]} rotation={Math.PI / 2} />
      
      {/* Highway */}
      <Road position={[0, 0, 40]} size={[16, 300]} />
      <Road position={[0, 0, -40]} size={[16, 300]} rotation={Math.PI / 2} />
      
      {/* Secondary roads */}
      <Road position={[40, 0, 0]} size={[10, 200]} />
      <Road position={[-40, 0, 0]} size={[10, 200]} />
      <Road position={[0, 0, 40]} size={[10, 200]} rotation={Math.PI / 2} />
      <Road position={[0, 0, -40]} size={[10, 200]} rotation={Math.PI / 2} />
      
      {/* Sidewalks */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[7, 0.05, 0]}>
        <planeGeometry args={[2, 300]} />
        <meshStandardMaterial color="#999999" />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-7, 0.05, 0]}>
        <planeGeometry args={[2, 300]} />
        <meshStandardMaterial color="#999999" />
      </mesh>
      
      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} position={b.position} size={b.size} color={b.color} type={b.type} />
      ))}
      
      {/* Trees */}
      {trees.map((pos, i) => (
        <Tree key={`tree-${i}`} position={pos} />
      ))}
      
      {/* Street lamps */}
      {lamps.map((pos, i) => (
        <StreetLamp key={`lamp-${i}`} position={pos} />
      ))}
      
      {/* Traffic lights at intersections */}
      <TrafficLight position={[7, 0, 7]} />
      <TrafficLight position={[-7, 0, -7]} />
      <TrafficLight position={[7, 0, -7]} />
      <TrafficLight position={[-7, 0, 7]} />
      
      {/* Gas station */}
      <GasStation position={[30, 0, 15]} />
      <GasStation position={[-50, 0, -30]} />
      
      {/* Park benches */}
      <Bench position={[-40, 0, -40]} rotation={0} />
      <Bench position={[-35, 0, -45]} rotation={Math.PI / 4} />
      <Bench position={[-45, 0, -35]} rotation={-Math.PI / 4} />
      
      {/* Parking area */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[50, 0.02, -20]}>
        <planeGeometry args={[30, 20]} />
        <meshStandardMaterial color="#444444" />
      </mesh>
      {/* Parking lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`pline-${i}`} receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[38 + i * 3.5, 0.03, -20]}>
          <planeGeometry args={[0.1, 5]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      
      {/* Bridge */}
      <group position={[0, 3, 80]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14, 0.5, 30]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
        {/* Bridge supports */}
        <mesh position={[-5, -1.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 3]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[5, -1.5, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 3]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        {/* Railings */}
        <mesh position={[-6.5, 0.8, 0]}>
          <boxGeometry args={[0.2, 1.2, 30]} />
          <meshStandardMaterial color="#888888" metalness={0.8} />
        </mesh>
        <mesh position={[6.5, 0.8, 0]}>
          <boxGeometry args={[0.2, 1.2, 30]} />
          <meshStandardMaterial color="#888888" metalness={0.8} />
        </mesh>
      </group>
      
      {/* Water under bridge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 80]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#1a4a6a" transparent opacity={0.8} metalness={0.3} />
      </mesh>
      
      {/* Market area */}
      <group position={[60, 0, 60]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <group key={`stall-${i}`} position={[(i % 3) * 6, 0, Math.floor(i / 3) * 5]}>
            <mesh position={[0, 1.5, 0]} castShadow>
              <boxGeometry args={[4, 3, 3]} />
              <meshStandardMaterial color={['#cc4444', '#44cc44', '#4444cc', '#cccc44', '#cc44cc', '#44cccc'][i]} />
            </mesh>
            <mesh position={[0, 3.2, 0]}>
              <boxGeometry args={[4.5, 0.2, 3.5]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
