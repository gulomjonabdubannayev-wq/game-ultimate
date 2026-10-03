import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

export function Environment() {
  const timeOfDay = useGameStore(s => s.timeOfDay);
  const weather = useGameStore(s => s.weather);
  const setTimeOfDay = useGameStore(s => s.setTimeOfDay);
  const sunRef = useRef<THREE.DirectionalLight>(null);
  const rainRef = useRef<THREE.Points>(null);
  
  // Calculate sun position and colors based on time
  const sunData = useMemo(() => {
    const hour = timeOfDay;
    const angle = ((hour - 6) / 12) * Math.PI;
    const sunY = Math.sin(angle) * 100;
    const sunX = Math.cos(angle) * 100;
    
    let skyColor: string;
    let ambientIntensity: number;
    let sunIntensity: number;
    let fogColor: string;
    
    if (hour >= 6 && hour < 8) {
      // Sunrise
      skyColor = '#ff7b54';
      ambientIntensity = 0.3;
      sunIntensity = 1.5;
      fogColor = '#ffaa77';
    } else if (hour >= 8 && hour < 17) {
      // Day
      skyColor = '#87CEEB';
      ambientIntensity = 0.5;
      sunIntensity = 2;
      fogColor = '#c8e8ff';
    } else if (hour >= 17 && hour < 19) {
      // Sunset
      skyColor = '#ff6b35';
      ambientIntensity = 0.3;
      sunIntensity = 1.5;
      fogColor = '#ff8855';
    } else {
      // Night
      skyColor = '#0a0a2a';
      ambientIntensity = 0.1;
      sunIntensity = 0.1;
      fogColor = '#0a0a1a';
    }
    
    if (weather === 'cloudy' || weather === 'rain' || weather === 'storm') {
      ambientIntensity *= 0.6;
      sunIntensity *= 0.3;
      skyColor = '#555566';
      fogColor = '#444455';
    }
    if (weather === 'fog') {
      skyColor = '#888888';
      fogColor = '#888888';
    }
    
    return { sunX, sunY, skyColor, ambientIntensity, sunIntensity, fogColor };
  }, [timeOfDay, weather]);
  
  // Update time
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    setTimeOfDay(timeOfDay + clampedDelta * 0.02);
    
    // Rain particles
    if (rainRef.current && (weather === 'rain' || weather === 'storm')) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 30 * clampedDelta;
        if (positions[i] < 0) {
          positions[i] = 50 + Math.random() * 20;
        }
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  // Rain particles geometry
  const rainGeometry = useMemo(() => {
    const positions = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return positions;
  }, []);
  
  const fogDensity = weather === 'fog' ? 0.02 : weather === 'rain' ? 0.008 : 0.003;
  
  return (
    <>
      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial color={sunData.skyColor} side={THREE.BackSide} />
      </mesh>
      
      {/* Sun/Moon */}
      <mesh position={[sunData.sunX, sunData.sunY, -50]}>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color={timeOfDay > 6 && timeOfDay < 19 ? '#ffdd44' : '#ccccdd'} />
      </mesh>
      
      {/* Stars at night */}
      {(timeOfDay < 5 || timeOfDay > 20) && weather !== 'cloudy' && weather !== 'rain' && (
        <points>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={500}
              array={new Float32Array(500 * 3).map((_, i) => {
                if (i % 3 === 0) return (Math.random() - 0.5) * 350;
                if (i % 3 === 1) return 50 + Math.random() * 100;
                return (Math.random() - 0.5) * 350;
              })}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.5} color="#ffffff" />
        </points>
      )}
      
      {/* Ambient light */}
      <ambientLight intensity={sunData.ambientIntensity} color={sunData.skyColor} />
      
      {/* Sun light */}
      <directionalLight
        ref={sunRef}
        position={[sunData.sunX, Math.max(sunData.sunY, 10), -50]}
        intensity={sunData.sunIntensity}
        color={timeOfDay > 6 && timeOfDay < 19 ? '#fffaf0' : '#4444aa'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={200}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      
      {/* Hemisphere light for better ambient */}
      <hemisphereLight
        args={[sunData.skyColor, '#3a5a3a', 0.3]}
      />
      
      {/* Fog */}
      <fog attach="fog" args={[sunData.fogColor, 20, 200 / (fogDensity * 100 + 1)]} />
      
      {/* Rain */}
      {(weather === 'rain' || weather === 'storm') && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={3000}
              array={rainGeometry}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial size={0.1} color="#aaccff" transparent opacity={0.6} />
        </points>
      )}
      
      {/* Clouds */}
      {(weather === 'cloudy' || weather === 'rain' || weather === 'storm') && (
        <group>
          {Array.from({ length: 20 }).map((_, i) => (
            <mesh key={`cloud-${i}`} position={[
              (Math.random() - 0.5) * 200,
              40 + Math.random() * 20,
              (Math.random() - 0.5) * 200
            ]}>
              <sphereGeometry args={[8 + Math.random() * 12, 8, 8]} />
              <meshBasicMaterial color="#666677" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* Lightning flash for storms */}
      {weather === 'storm' && (
        <LightningEffect />
      )}
    </>
  );
}

function LightningEffect() {
  const lightRef = useRef<THREE.PointLight>(null);
  const timerRef = useRef(0);
  
  useFrame((_, delta) => {
    timerRef.current -= delta;
    if (timerRef.current <= 0) {
      if (lightRef.current) {
        lightRef.current.intensity = 50;
        setTimeout(() => {
          if (lightRef.current) lightRef.current.intensity = 0;
        }, 100);
      }
      timerRef.current = 3 + Math.random() * 10;
    }
  });
  
  return (
    <pointLight
      ref={lightRef}
      position={[0, 50, 0]}
      intensity={0}
      distance={300}
      color="#ffffff"
    />
  );
}
