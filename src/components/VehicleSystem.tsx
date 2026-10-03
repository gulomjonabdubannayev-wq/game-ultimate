import { useRef, useEffect, useState, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, Vehicle } from '../store/gameStore';

interface VehicleProps {
  vehicle: Vehicle;
  isPlayerVehicle: boolean;
}

function VehicleModel({ vehicle, isPlayerVehicle }: VehicleProps) {
  const groupRef = useRef<THREE.Group>(null);
  const wheelRefs = useRef<THREE.Mesh[]>([]);
  const { camera } = useThree();
  
  const isInVehicle = useGameStore(s => s.isInVehicle);
  const currentVehicleId = useGameStore(s => s.currentVehicleId);
  const cameraMode = useGameStore(s => s.cameraMode);
  const enterVehicle = useGameStore(s => s.enterVehicle);
  const exitVehicle = useGameStore(s => s.exitVehicle);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const timeOfDay = useGameStore(s => s.timeOfDay);
  
  const setCurrentSpeed = useGameStore(s => s.setCurrentSpeed);
  const [speed, setSpeed] = useState(0);
  const [steering, setSteering] = useState(0);
  const velocityRef = useRef(new THREE.Vector3());
  const rotationRef = useRef(vehicle.rotation);
  const posRef = useRef(new THREE.Vector3(...vehicle.position));
  const keysRef = useRef<Set<string>>(new Set());
  const headlightsOn = useRef(false);
  
  const isDriving = isPlayerVehicle && isInVehicle && currentVehicleId === vehicle.id;
  const isNight = timeOfDay < 6 || timeOfDay > 19;
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key.toLowerCase() === 'e' && isPlayerVehicle && !isInVehicle) {
        const dist = posRef.current.distanceTo(new THREE.Vector3(...useGameStore.getState().playerPosition));
        if (dist < 5 && vehicle.owned) {
          enterVehicle(vehicle.id);
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlayerVehicle, isInVehicle, vehicle.id, vehicle.owned, enterVehicle]);
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    
    const clampedDelta = Math.min(delta, 0.05);
    
    if (isDriving) {
      const keys = keysRef.current;
      const maxSpeed = vehicle.speed * 3;
      const accel = vehicle.acceleration * 0.8;
      const handling = vehicle.handling * 0.03;
      const brakeForce = vehicle.braking * 1.5;
      
      // Acceleration
      if (keys.has('w') || keys.has('arrowup')) {
        setSpeed(prev => Math.min(prev + accel * clampedDelta * 60, maxSpeed));
      } else if (keys.has('s') || keys.has('arrowdown')) {
        setSpeed(prev => Math.max(prev - brakeForce * clampedDelta * 60, -maxSpeed * 0.3));
      } else {
        setSpeed(prev => prev * 0.98);
      }
      
      // Steering
      if (keys.has('a') || keys.has('arrowleft')) {
        setSteering(prev => Math.min(prev + handling * clampedDelta * 60, 0.8));
      } else if (keys.has('d') || keys.has('arrowright')) {
        setSteering(prev => Math.max(prev - handling * clampedDelta * 60, -0.8));
      } else {
        setSteering(prev => prev * 0.9);
      }
      
      // Horn
      if (keys.has('h')) {
        // Horn effect could go here
      }
      
      // Exit vehicle
      if (keys.has('f')) {
        keys.delete('f');
        exitVehicle();
        setPlayerPosition([
          posRef.current.x + 3,
          1,
          posRef.current.z
        ]);
        setSpeed(0);
        return;
      }
      
      // Apply movement
      const currentSpeed = speed;
      setCurrentSpeed(Math.abs(currentSpeed) * 15); // Convert to km/h for display
      rotationRef.current += steering * (currentSpeed / maxSpeed) * clampedDelta * 3;
      
      const direction = new THREE.Vector3(
        Math.sin(rotationRef.current),
        0,
        Math.cos(rotationRef.current)
      );
      
      posRef.current.add(direction.multiplyScalar(currentSpeed * clampedDelta));
      
      // Keep in bounds
      posRef.current.x = Math.max(-150, Math.min(150, posRef.current.x));
      posRef.current.z = Math.max(-150, Math.min(150, posRef.current.z));
      
      setPlayerPosition([posRef.current.x, 1, posRef.current.z]);
      
      // Camera follow
      if (cameraMode === 'third') {
        const camOffset = new THREE.Vector3(
          -Math.sin(rotationRef.current) * 12,
          6,
          -Math.cos(rotationRef.current) * 12
        );
        camera.position.lerp(posRef.current.clone().add(camOffset), 0.05);
        camera.lookAt(posRef.current.x, posRef.current.y + 1, posRef.current.z);
      } else if (cameraMode === 'first' || cameraMode === 'interior') {
        const camPos = new THREE.Vector3(
          posRef.current.x + Math.sin(rotationRef.current) * 0.5,
          posRef.current.y + 1.8,
          posRef.current.z + Math.cos(rotationRef.current) * 0.5
        );
        camera.position.copy(camPos);
        const lookAt = new THREE.Vector3(
          posRef.current.x + Math.sin(rotationRef.current) * 10,
          posRef.current.y + 1.5,
          posRef.current.z + Math.cos(rotationRef.current) * 10
        );
        camera.lookAt(lookAt);
      }
      
      // Spin wheels
      wheelRefs.current.forEach(wheel => {
        if (wheel) {
          wheel.rotation.x += currentSpeed * clampedDelta * 5;
        }
      });
    }
    
    // Update group transform
    groupRef.current.position.copy(posRef.current);
    groupRef.current.rotation.y = rotationRef.current;
  });
  
  const vehicleColor = vehicle.color;
  const isSUV = vehicle.category === 'SUV';
  const isSport = vehicle.category === 'Sport' || vehicle.category === 'Super';
  const bodyHeight = isSUV ? 1.2 : isSport ? 0.6 : 0.8;
  const bodyLength = isSport ? 4.5 : 4.2;
  const bodyWidth = isSUV ? 2.1 : 1.9;
  
  return (
    <group ref={groupRef} position={vehicle.position}>
      {/* Car body - lower */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[bodyWidth, bodyHeight, bodyLength]} />
        <meshStandardMaterial color={vehicleColor} metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Car body - upper/cabin */}
      <mesh castShadow position={[0, 0.5 + bodyHeight / 2 + 0.4, -0.3]}>
        <boxGeometry args={[bodyWidth - 0.2, 0.8, bodyLength * 0.55]} />
        <meshStandardMaterial color={vehicleColor} metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Windshield */}
      <mesh position={[0, 0.5 + bodyHeight / 2 + 0.4, 0.6]} rotation={[0.3, 0, 0]}>
        <planeGeometry args={[bodyWidth - 0.4, 0.7]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Rear window */}
      <mesh position={[0, 0.5 + bodyHeight / 2 + 0.4, -1.4]} rotation={[-0.3, Math.PI, 0]}>
        <planeGeometry args={[bodyWidth - 0.4, 0.7]} />
        <meshStandardMaterial color="#88ccff" transparent opacity={0.6} metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Headlights */}
      <mesh position={[-0.6, 0.5, bodyLength / 2]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={isNight ? "#ffffff" : "#333333"}
          emissiveIntensity={isNight ? 3 : 0.2} 
        />
      </mesh>
      <mesh position={[0.6, 0.5, bodyLength / 2]}>
        <sphereGeometry args={[0.15]} />
        <meshStandardMaterial 
          color="#ffffff" 
          emissive={isNight ? "#ffffff" : "#333333"}
          emissiveIntensity={isNight ? 3 : 0.2} 
        />
      </mesh>
      
      {/* Headlight beams at night */}
      {isNight && isDriving && (
        <>
          <spotLight position={[-0.6, 0.5, bodyLength / 2 + 0.5]} target-position={[0, 0, 20]} angle={0.4} intensity={10} distance={30} color="#ffffcc" />
          <spotLight position={[0.6, 0.5, bodyLength / 2 + 0.5]} target-position={[0, 0, 20]} angle={0.4} intensity={10} distance={30} color="#ffffcc" />
        </>
      )}
      
      {/* Tail lights */}
      <mesh position={[-0.6, 0.5, -bodyLength / 2]}>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.6, 0.5, -bodyLength / 2]}>
        <sphereGeometry args={[0.12]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Wheels */}
      {[
        [-bodyWidth / 2, 0.25, bodyLength / 3],
        [bodyWidth / 2, 0.25, bodyLength / 3],
        [-bodyWidth / 2, 0.25, -bodyLength / 3],
        [bodyWidth / 2, 0.25, -bodyLength / 3],
      ].map((pos, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) wheelRefs.current[i] = el; }}
          position={pos as [number, number, number]}
          rotation={[0, 0, Math.PI / 2]}
          castShadow
        >
          <cylinderGeometry args={[0.3, 0.3, 0.25, 16]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}
      
      {/* Vehicle name label (visible when nearby) */}
      {isPlayerVehicle && !isInVehicle && vehicle.owned && (
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
}

// NPC Traffic Vehicle
function TrafficVehicle({ startPos, direction }: { startPos: [number, number, number]; direction: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const speedRef = useRef(3 + Math.random() * 5);
  const posRef = useRef(new THREE.Vector3(...startPos));
  const colors = ['#cc0000', '#0000cc', '#ffffff', '#333333', '#006600', '#ffcc00', '#8B4513'];
  const color = colors[Math.floor(Math.random() * colors.length)];
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);
    
    posRef.current.x += Math.sin(direction) * speedRef.current * clampedDelta;
    posRef.current.z += Math.cos(direction) * speedRef.current * clampedDelta;
    
    // Wrap around
    if (posRef.current.x > 150) posRef.current.x = -150;
    if (posRef.current.x < -150) posRef.current.x = 150;
    if (posRef.current.z > 150) posRef.current.z = -150;
    if (posRef.current.z < -150) posRef.current.z = 150;
    
    groupRef.current.position.copy(posRef.current);
    groupRef.current.rotation.y = direction;
  });
  
  return (
    <group ref={groupRef}>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 0.8, 4]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh castShadow position={[0, 1.1, -0.3]}>
        <boxGeometry args={[1.6, 0.7, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, 0.25, 1.2], [0.9, 0.25, 1.2], [-0.9, 0.25, -1.2], [0.9, 0.25, -1.2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.2, 12]} />
          <meshStandardMaterial color="#111111" />
        </mesh>
      ))}
    </group>
  );
}

export function VehicleSystem() {
  const vehicles = useGameStore(s => s.vehicles);
  const trafficDensity = useGameStore(s => s.trafficDensity);
  
  const trafficVehicles = useRef(
    Array.from({ length: Math.floor(20 * trafficDensity) }).map((_, i) => ({
      startPos: [
        (Math.random() - 0.5) * 200,
        0.5,
        (Math.random() - 0.5) * 200,
      ] as [number, number, number],
      direction: [0, Math.PI / 2, Math.PI, Math.PI * 1.5][Math.floor(Math.random() * 4)],
    }))
  ).current;
  
  return (
    <group>
      {/* Player's vehicles */}
      {vehicles.map(v => (
        <VehicleModel key={v.id} vehicle={v} isPlayerVehicle={true} />
      ))}
      
      {/* Traffic */}
      {trafficVehicles.map((tv, i) => (
        <TrafficVehicle key={`traffic-${i}`} startPos={tv.startPos} direction={tv.direction} />
      ))}
    </group>
  );
}
