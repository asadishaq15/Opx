'use client'

import { Environment, Sparkles, Stars } from '@react-three/drei'
import LogoGlass from './LogoGlass'
import MouseTrail from './MouseTrail'
import YellowParticles from './YellowParticles'
import AtmosphericParticles from './AtmosphericParticles'
import CameraController from './CameraController'
import FalconModel from './FalconModel'
import PalmParticles from './PalmParticles'
import LiquidContentSection from './LiquidContentSection'
import { useScrollStore } from '../lib/scroll'

/**
 * Main 3D Scene Component
 * Contains all 3D elements with adjusted timing for reverse model sequence
 */
export default function Scene3D() {
  const { progress } = useScrollStore()
  
  // Calculate opacity values for secondary elements
  // This shows them after the models have moved out of view
  const secondaryElementsOpacity = progress < 0.4 ? 0 : Math.min((progress - 0.4) / 0.2, 1)
  
  return (
    <>
      {/* Camera Controller for dynamic movement */}
      <CameraController />
      
      {/* Optimized Lighting Setup */}
      <ambientLight intensity={0.7} color="#ffffff" />
      
      {/* Main directional light */}
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        color="#00F0FF"
        castShadow={false}
      />

      {/* Central light for logo */}
      <pointLight
        position={[0, 0, 8]}
        intensity={8}
        color="#FFFFFF"
        distance={25}
        decay={1}
        castShadow={false}
      />

      {/* Single hemisphere light for ambient */}
      <hemisphereLight
        args={["#7C3AED", "#FF1CF7", 0.4]}
      />
      
      {/* Environment for reflections */}
      <Environment
        preset="city"
        background={false}
        environmentIntensity={1.0}
      />
      
      {/* Reduced stars for performance */}
      <Stars 
        radius={80} 
        depth={40} 
        count={1000} 
        factor={3} 
        saturation={0} 
        fade 
        speed={0.3}
      />
      
      {/* Reduced sparkles for performance */}
      <Sparkles 
        count={30} 
        scale={[15, 15, 8]}
        size={1.5}
        speed={0.2}
        color="#FFD700"
        opacity={0.4}
      />
      
      {/* 3D Logo Sequence - O, P, X Models with reversed animation */}
      <LogoGlass />
      
      {/* Yellow Glowing Particles - visible throughout */}
      <YellowParticles />
      
      {/* Mouse Trail Particles - visible throughout */}
      <MouseTrail />
      
      {/* Atmospheric Particles - appear after models have exited */}
      <AtmosphericParticles opacity={secondaryElementsOpacity} />
      
      {/* Flying Falcon - appears after models have exited */}
      <FalconModel opacity={secondaryElementsOpacity} />
      
      {/* Palm Tree Particles - appears after models have exited */}
      <PalmParticles opacity={secondaryElementsOpacity} />
      
      {/* Liquid Content Section - Appears at the end */}
      <LiquidContentSection />
      
      {/* Enhanced volumetric fog effect for depth */}
      <fog attach="fog" args={['#050510', 5, 35]} />
    </>
  )
}