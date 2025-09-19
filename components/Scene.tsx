'use client'

import { Environment } from '@react-three/drei'
import LogoGlass from './LogoGlass'
import Particles3D from './Particles3D'
import PostProcessing from './PostProcessing'
import * as THREE from 'three'

/**
 * Main 3D Scene Component
 * Contains all 3D elements: lighting, logo, particles, and effects
 */
export default function Scene() {
  return (
    <>
      {/* Lighting Setup */}
      <ambientLight intensity={0.2} color="#ffffff" />
      
      {/* Key light - neon cyan */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        color="#00F0FF"
        castShadow={false} // Disabled for performance
      />
      
      {/* Fill light - neon magenta */}
      <directionalLight
        position={[-10, -10, -5]}
        intensity={0.6}
        color="#FF1CF7"
      />
      
      {/* Rim light - neon purple */}
      <directionalLight
        position={[0, 0, -10]}
        intensity={0.4}
        color="#7C3AED"
      />
      
      {/* Environment for reflections and global illumination */}
      <Environment
        preset="city" // Fallback preset if custom HDR not available
        background={false} // Don't use as background since we have a dark page
        environmentIntensity={0.5}
      />
      
      {/* 3D Logo */}
      <LogoGlass />
      
      {/* Interactive Particles */}
      <Particles3D />
      
      {/* Simple fog effect for depth */}
      <fog attach="fog" args={['#0A0A0B', 10, 50]} />
      
      {/* Post-processing effects */}
      <PostProcessing />
    </>
  )
}
