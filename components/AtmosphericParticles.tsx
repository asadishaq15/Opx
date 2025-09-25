'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../lib/scroll'

/**
 * Enhanced Atmospheric Particles - Creates a more fluid, scroll-responsive nebula effect
 */
export default function AtmosphericParticles({ opacity = 1 }) {
  const meshRef = useRef<THREE.Points>(null)
  const { progress } = useScrollStore()
  
  // Increased particle count for more immersive effect
  const particleCount = 1200 // Increased from 1000
  const velocitiesRef = useRef<Float32Array>()
  
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)
    
    // Enhanced color palette with more vibrant colors
    const colorPalette = [
      new THREE.Color('#00F5FF'), // Bright Cyan
      new THREE.Color('#FF25FF'), // Vibrant Pink
      new THREE.Color('#8240FF'), // Vibrant Purple
      new THREE.Color('#FFE000'), // Bright Gold
      new THREE.Color('#20FFA3'), // Bright Mint
      new THREE.Color('#FF4B4B'), // Bright Coral red
      new THREE.Color('#4369FF'), // Vibrant Royal blue
      new THREE.Color('#FC2FA9'), // Hot Pink
      new THREE.Color('#21EAFF'), // Electric Blue
    ]
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Create more varied particle cloud with fluid distribution
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(Math.random() * 2 - 1)
      const radius = 15 + Math.random() * 25
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Assign colors from palette
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
      
      // Varied sizes for depth perception
      sizes[i] = Math.random() * 0.8 + 0.3 // Increased size range
      
      // Initial velocities for fluid motion
      velocities[i3] = (Math.random() - 0.5) * 0.015 // Increased velocity
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.015
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.015
    }
    
    velocitiesRef.current = velocities
    
    return { positions, colors, sizes }
  }, [particleCount])
  
  useFrame((state, delta) => {
    if (!meshRef.current || !velocitiesRef.current) return
    
    const time = state.clock.elapsedTime
    const positionArray = meshRef.current.geometry.attributes.position.array as Float32Array
    const colorArray = meshRef.current.geometry.attributes.color.array as Float32Array
    
    // Create fluid swirling effect based on scroll
    const rotationSpeed = 0.08 + progress * 0.2 // Increased from 0.05 and 0.1
    meshRef.current.rotation.y = time * rotationSpeed + progress * Math.PI
    meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.2 + progress * 0.1 // Increased movement
    
    // Scroll-based fluid motion intensity
    const scrollFluidityFactor = progress * 3 // Increased from 2
    
    // Update each particle position for fluid motion
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Update velocities with turbulence affected by scroll
      velocitiesRef.current[i3] += (Math.random() - 0.5) * 0.002 * scrollFluidityFactor // Increased turbulence
      velocitiesRef.current[i3 + 1] += (Math.random() - 0.5) * 0.002 * scrollFluidityFactor
      velocitiesRef.current[i3 + 2] += (Math.random() - 0.5) * 0.002 * scrollFluidityFactor
      
      // Apply damping to prevent excessive speeds
      velocitiesRef.current[i3] *= 0.98 // Changed from 0.99 for more movement
      velocitiesRef.current[i3 + 1] *= 0.98
      velocitiesRef.current[i3 + 2] *= 0.98
      
      // Apply velocity to position
      positionArray[i3] += velocitiesRef.current[i3]
      positionArray[i3 + 1] += velocitiesRef.current[i3 + 1]
      positionArray[i3 + 2] += velocitiesRef.current[i3 + 2]
      
      // Add swirling effect based on distance from center
      const x = positionArray[i3]
      const y = positionArray[i3 + 1]
      const z = positionArray[i3 + 2]
      
      const distance = Math.sqrt(x*x + y*y + z*z)
      const swirlingFactor = 0.01 * scrollFluidityFactor // Doubled from 0.005
      
      const swirlingAngle = distance * swirlingFactor + time * 0.2 // Increased from 0.1
      positionArray[i3] += Math.sin(swirlingAngle) * 0.05 // Increased from 0.03
      positionArray[i3 + 1] += Math.cos(swirlingAngle) * 0.05 // Increased from 0.03
      
      // More dramatic color shift based on scroll progress
      // Create a gentle color wave through the particles
      const colorShiftFactor = Math.sin(progress * Math.PI * 1.5 + distance * 0.15 + time * 0.3) * 0.3 // Increased values
      
      // More vibrant color shifts based on scroll
      colorArray[i3] = Math.max(0, Math.min(1, colorArray[i3] + colorShiftFactor * 0.2))     // Red
      colorArray[i3 + 1] = Math.max(0, Math.min(1, colorArray[i3 + 1] - colorShiftFactor * 0.1))  // Green
      colorArray[i3 + 2] = Math.max(0, Math.min(1, colorArray[i3 + 2] + colorShiftFactor * 0.25))  // Blue
    }
    
    // Update geometry
    meshRef.current.geometry.attributes.position.needsUpdate = true
    meshRef.current.geometry.attributes.color.needsUpdate = true
    
    // Update material opacity based on scroll and passed opacity prop
    // Make particles appear earlier in the scroll (around 0.2 instead of 0.4)
    const material = meshRef.current.material as THREE.PointsMaterial
    
    // Start showing atmospheric particles at 20% scroll instead of 40%
    const visibilityProgress = progress < 0.2 ? 0 : Math.min((progress - 0.2) / 0.2, 1)
    material.opacity = (0.4 + progress * 0.7) * opacity * visibilityProgress // Increased from 0.3 and 0.6
    
    // Increase size more dramatically as we scroll
    material.size = 0.3 + progress * 0.2 // Increased from 0.2 and 0.1
  })
  
  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3} // Increased from 0.2
        sizeAttenuation
        transparent
        opacity={0.4 * opacity} // Increased from 0.3
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}