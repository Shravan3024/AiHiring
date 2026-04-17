"use client";
import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function PolymerStructure() {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    mesh.current.rotation.x = Math.cos(time / 4) * 0.2;
    mesh.current.rotation.y = Math.sin(time / 4) * 0.3;
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere ref={mesh} args={[1, 100, 100]} scale={1.8}>
        <MeshDistortMaterial
          color="#2563eb"
          attach="material"
          distort={0.4}
          speed={4}
          roughness={0}
          emissive="#1d4ed8"
          emissiveIntensity={0.5}
          transparent
          opacity={0.9}
        />
      </Sphere>
    </Float>
  );
}

function ParticleField({ count = 1000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 10;
      p[i * 3 + 1] = (Math.random() - 0.5) * 10;
      p[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return p;
  }, [count]);

  return (
    <Points positions={points}>
      <PointMaterial
        transparent
        color="#3b82f6"
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

export function IndustrialCore() {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
        
        <PolymerStructure />
        <ParticleField count={2000} />
        
        <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <MeshDistortMaterial
            transparent
            opacity={0.1}
            color="#2563eb"
            distort={0.1}
            speed={2}
          />
        </mesh>
      </Canvas>
      
      {/* Overlay UI elements to make it feel techy */}
      <div className="absolute top-10 left-10 pointer-events-none">
        <div className="flex flex-col gap-2">
           <div className="w-12 h-1 bg-blue-500 rounded-full" />
           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Polymer Density Analysis</p>
           <p className="text-2xl font-black text-slate-900">98.4% STABLE</p>
        </div>
      </div>
      
      <div className="absolute bottom-10 right-10 pointer-events-none text-right">
        <div className="flex flex-col gap-2 items-end">
           <div className="w-20 h-0.5 bg-slate-200 rounded-full" />
           <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Neural Link Synchronized</p>
           <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
