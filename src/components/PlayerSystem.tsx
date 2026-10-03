import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

// Player character
export function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  const isInVehicle = useGameStore(s => s.isInVehicle);
  const cameraMode = useGameStore(s => s.cameraMode);
  const playerPosition = useGameStore(s => s.playerPosition);
  const setPlayerPosition = useGameStore(s => s.setPlayerPosition);
  const setPlayerRotation = useGameStore(s => s.setPlayerRotation);
  const setIsRunning = useGameStore(s => s.setIsRunning);
  
  const posRef = useRef(new THREE.Vector3(...playerPosition));
  const rotRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const animTime = useRef(0);
  const legLeftRef = useRef<THREE.Mesh>(null);
  const legRightRef = useRef<THREE.Mesh>(null);
  const armLeftRef = useRef<THREE.Mesh>(null);
  const armRightRef = useRef<THREE.Mesh>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === 'Shift') setIsRunning(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
      if (e.key === 'Shift') setIsRunning(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setIsRunning]);
  
  useFrame((_, delta) => {
    if (!groupRef.current || isInVehicle) return;
    
    const clampedDelta = Math.min(delta, 0.05);
    const keys = keysRef.current;
    const isRunning = keys.has('shift');
    const moveSpeed = isRunning ? 12 : 5;
    
    let moveX = 0;
    let moveZ = 0;
    let isMoving = false;
    
    if (keys.has('w') || keys.has('arrowup')) { moveZ = 1; isMoving = true; }
    if (keys.has('s') || keys.has('arrowdown')) { moveZ = -1; isMoving = true; }
    if (keys.has('a') || keys.has('arrowleft')) { moveX = 1; isMoving = true; }
    if (keys.has('d') || keys.has('arrowright')) { moveX = -1; isMoving = true; }
    
    if (isMoving) {
      const angle = Math.atan2(moveX, moveZ);
      rotRef.current = angle;
      setPlayerRotation(angle);
      
      posRef.current.x += Math.sin(angle) * moveSpeed * clampedDelta;
      posRef.current.z += Math.cos(angle) * moveSpeed * clampedDelta;
      
      // Bounds
      posRef.current.x = Math.max(-150, Math.min(150, posRef.current.x));
      posRef.current.z = Math.max(-150, Math.min(150, posRef.current.z));
      
      setPlayerPosition([posRef.current.x, 1, posRef.current.z]);
      
      // Walking animation
      animTime.current += clampedDelta * (isRunning ? 15 : 8);
      const swing = Math.sin(animTime.current) * 0.5;
      if (legLeftRef.current) legLeftRef.current.rotation.x = swing;
      if (legRightRef.current) legRightRef.current.rotation.x = -swing;
      if (armLeftRef.current) armLeftRef.current.rotation.x = -swing * 0.7;
      if (armRightRef.current) armRightRef.current.rotation.x = swing * 0.7;
    } else {
      // Reset pose
      if (legLeftRef.current) legLeftRef.current.rotation.x *= 0.9;
      if (legRightRef.current) legRightRef.current.rotation.x *= 0.9;
      if (armLeftRef.current) armLeftRef.current.rotation.x *= 0.9;
      if (armRightRef.current) armRightRef.current.rotation.x *= 0.9;
    }
    
    // Camera follow for on-foot
    if (!isInVehicle && cameraMode === 'third') {
      const camOffset = new THREE.Vector3(0, 8, -10);
      const targetCamPos = posRef.current.clone().add(camOffset);
      camera.position.lerp(targetCamPos, 0.05);
      camera.lookAt(posRef.current.x, posRef.current.y + 1, posRef.current.z);
    }
    
    groupRef.current.position.copy(posRef.current);
    groupRef.current.rotation.y = rotRef.current;
  });
  
  if (isInVehicle) return null;
  
  return (
    <group ref={groupRef} position={playerPosition}>
      {/* Body */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Head */}
      <mesh castShadow position={[0, 1.7, 0]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#d4a574" />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1.85, -0.02]}>
        <sphereGeometry args={[0.21, 12, 8]} />
        <meshStandardMaterial color="#2c1810" />
      </mesh>
      
      {/* Arms */}
      <mesh ref={armLeftRef} castShadow position={[-0.35, 1.1, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh ref={armRightRef} castShadow position={[0.35, 1.1, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Legs */}
      <mesh ref={legLeftRef} castShadow position={[-0.12, 0.4, 0]}>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh ref={legRightRef} castShadow position={[0.12, 0.4, 0]}>
        <boxGeometry args={[0.18, 0.7, 0.18]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      
      {/* Shoes */}
      <mesh position={[-0.12, 0.05, 0.05]}>
        <boxGeometry args={[0.18, 0.1, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.12, 0.05, 0.05]}>
        <boxGeometry args={[0.18, 0.1, 0.25]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

// NPC Pedestrian
function Pedestrian({ startPos }: { startPos: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null);
  const posRef = useRef(new THREE.Vector3(...startPos));
  const dirRef = useRef(Math.random() * Math.PI * 2);
  const speedRef = useRef(1 + Math.random() * 2);
  const changeTimer = useRef(Math.random() * 10);
  const animTime = useRef(Math.random() * 10);
  const legLeftRef = useRef<THREE.Mesh>(null);
  const legRightRef = useRef<THREE.Mesh>(null);
  
  const shirtColors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#ffffff', '#34495e'];
  const pantColors = ['#2c3e50', '#34495e', '#1a1a2e', '#4a4a4a', '#2d2d44'];
  const skinColors = ['#d4a574', '#c68642', '#8d5524', '#e0ac69', '#f1c27d'];
  
  const shirtColor = shirtColors[Math.floor(Math.random() * shirtColors.length)];
  const pantColor = pantColors[Math.floor(Math.random() * pantColors.length)];
  const skinColor = skinColors[Math.floor(Math.random() * skinColors.length)];
  
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);
    
    changeTimer.current -= clampedDelta;
    if (changeTimer.current <= 0) {
      dirRef.current += (Math.random() - 0.5) * Math.PI;
      speedRef.current = 0.5 + Math.random() * 2;
      changeTimer.current = 3 + Math.random() * 8;
    }
    
    posRef.current.x += Math.sin(dirRef.current) * speedRef.current * clampedDelta;
    posRef.current.z += Math.cos(dirRef.current) * speedRef.current * clampedDelta;
    
    // Keep in city bounds
    if (Math.abs(posRef.current.x) > 100 || Math.abs(posRef.current.z) > 100) {
      dirRef.current += Math.PI;
    }
    
    // Walking animation
    animTime.current += clampedDelta * 6;
    const swing = Math.sin(animTime.current) * 0.4;
    if (legLeftRef.current) legLeftRef.current.rotation.x = swing;
    if (legRightRef.current) legRightRef.current.rotation.x = -swing;
    
    groupRef.current.position.copy(posRef.current);
    groupRef.current.rotation.y = dirRef.current;
  });
  
  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <boxGeometry args={[0.45, 0.65, 0.25]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Legs */}
      <mesh ref={legLeftRef} castShadow position={[-0.1, 0.4, 0]}>
        <boxGeometry args={[0.16, 0.65, 0.16]} />
        <meshStandardMaterial color={pantColor} />
      </mesh>
      <mesh ref={legRightRef} castShadow position={[0.1, 0.4, 0]}>
        <boxGeometry args={[0.16, 0.65, 0.16]} />
        <meshStandardMaterial color={pantColor} />
      </mesh>
    </group>
  );
}

export function PedestrianSystem() {
  const pedestrianDensity = useGameStore(s => s.pedestrianDensity);
  
  const pedestrians = useRef(
    Array.from({ length: Math.floor(50 * pedestrianDensity) }).map((_, i) => ({
      startPos: [
        (Math.random() - 0.5) * 160,
        0,
        (Math.random() - 0.5) * 160,
      ] as [number, number, number],
    }))
  ).current;
  
  return (
    <group>
      {pedestrians.map((p, i) => (
        <Pedestrian key={`ped-${i}`} startPos={p.startPos} />
      ))}
    </group>
  );
}
