'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScrollStore } from '../lib/scroll'
import * as THREE from 'three'

/**
 * Enhanced Yellow Glowing Particles Component
 * With fluid movement and color synchronization based on scroll
 */
export default function YellowParticles({ opacity = 1 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const { progress } = useScrollStore()
  const { size, viewport } = useThree()
  
  // Increased particle count for more immersive effect
  const particleCount = 600 // Increased from 500
  const originalPositionsRef = useRef<Float32Array>()
  const velocitiesRef = useRef<Float32Array>()
  
  // Generate initial particle positions, velocities and data
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)
    const velocities = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Position particles in a more fluid, volumetric space
      const radius = Math.random() * 12 + 1 
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 10
      
      positions[i3] = radius * Math.cos(angle) // X position 
      positions[i3 + 1] = height // Y position
      positions[i3 + 2] = radius * Math.sin(angle) * 0.8 + 1 // Z position
      
      // Initial gold/yellow color with slight variations
      colors[i3] = 1.0     // R - full red
      colors[i3 + 1] = 0.9 + Math.random() * 0.1  // G - yellow with variation
      colors[i3 + 2] = Math.random() * 0.2  // B - slight blue tint for some particles
      
      // Varied particle sizes for depth
      scales[i] = 0.05 + Math.random() * 0.25
      
      // Initial velocities for fluid motion
      velocities[i3] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02
    }
    
    // Store original positions and velocities for scroll calculations
    originalPositionsRef.current = positions.slice()
    velocitiesRef.current = velocities
    
    return { positions, colors, scales }
  }, [particleCount])
  
  useFrame((state, delta) => {
    if (!meshRef.current || !originalPositionsRef.current || !velocitiesRef.current) return
    
    const mesh = meshRef.current
    const time = state.clock.elapsedTime
    const dummy = new THREE.Object3D()
    
    // Updated fade logic to match the model sequence
    const fadeThreshold = 0.65 // Start fading at 65% scroll
    const fullFadeThreshold = 0.85 // Completely faded by 85% scroll
    
    // Begin with higher opacity even at start
    let particleOpacity = Math.min(1.0, 0.3 + progress * 0.7)
    
    if (progress > fadeThreshold) {
      particleOpacity = 1.0 - Math.min((progress - fadeThreshold) / (fullFadeThreshold - fadeThreshold), 1)
    }
    
    // Update material opacity
    if (materialRef.current) {
      materialRef.current.opacity = particleOpacity * opacity
    }
    
    // If particles shouldn't be visible, skip rendering
    if (particleOpacity <= 0) {
      return
    }
    
    // Enhanced scroll factor for more dramatic movement
    const scrollFactor = Math.sin(progress * Math.PI) * 1.2
    
    // Process each particle
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Get original position
      const originalX = originalPositionsRef.current[i3]
      const originalY = originalPositionsRef.current[i3 + 1]
      const originalZ = originalPositionsRef.current[i3 + 2]
      
      // Update velocities with enhanced turbulence based on scroll
      velocitiesRef.current[i3] += (Math.random() - 0.5) * 0.003 + scrollFactor * 0.001
      velocitiesRef.current[i3 + 1] += (Math.random() - 0.5) * 0.003 + scrollFactor * 0.001
      velocitiesRef.current[i3 + 2] += (Math.random() - 0.5) * 0.003
      
      // Apply damping to prevent excessive speed
      velocitiesRef.current[i3] *= 0.96 // Reduced from 0.98 for more dynamic movement
      velocitiesRef.current[i3 + 1] *= 0.96
      velocitiesRef.current[i3 + 2] *= 0.96
      
      // Calculate new position with enhanced fluid motion
      let x = originalX + Math.sin(time * 0.5 + i * 0.02) * (0.2 + progress * 0.3) + velocitiesRef.current[i3] * 10
      let y = originalY + Math.cos(time * 0.6 + i * 0.03) * (0.15 + progress * 0.4) + velocitiesRef.current[i3 + 1] * 10
      let z = originalZ + velocitiesRef.current[i3 + 2] * 10
      
      // Enhanced vortex effect based on scroll
      const vortexStrength = progress * 0.3 // Increased from 0.1
      const distance = Math.sqrt(x * x + y * y)
      const vortexAngle = distance * vortexStrength + time * 0.2 // Increased from 0.1
      const vortexX = Math.cos(vortexAngle) * distance * vortexStrength
      const vortexY = Math.sin(vortexAngle) * distance * vortexStrength
      
      x += vortexX * 0.15 // Increased from 0.05
      y += vortexY * 0.15 // Increased from 0.05
      
      // Gradually increase particle spread as models separate and leave
      const spreadFactor = Math.min(progress * 2.5, 2.0) // Increased from 1.5
      x = x * (1 + spreadFactor * 0.3) // Increased from 0.2
      y = y * (1 + spreadFactor * 0.2) // Increased from 0.1
      
      // Apply final position
      dummy.position.set(x, y, z)
      
      // Enhanced pulsing scale for glowing effect
      const pulseScale = 1 + Math.sin(time * 3 + i * 0.05) * 0.25 // Increased from 0.15
      dummy.scale.setScalar(scales[i] * pulseScale * (1 + progress * 0.4)) // Increased from 0.2
      
      // Individual particle rotation with scroll-based increase
      dummy.rotation.set(
        time * 0.1 + i * 0.01 + progress * 0.2,
        time * 0.08 + i * 0.008 + progress * 0.3,
        time * 0.12 + i * 0.012 + progress * 0.5 // Increased from 0.3
      )
      
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      
      // Enhanced color shifts based on scroll position
      const scrollColorFactor = progress * 0.7 // Increased from 0.5
      const baseGlowIntensity = (0.9 + Math.sin(time * 2.5 + i * 0.08) * 0.2) // Increased variation
      const glowIntensity = Math.max(baseGlowIntensity, 0.7)
      
      // More dramatic color transition: yellow → orange → red → purple
      const color = new THREE.Color(
        1.0 * glowIntensity, // Red stays mostly constant
        (1.0 - scrollColorFactor * 0.5) * glowIntensity, // Green decreases faster
        (scrollColorFactor * 1.0) * glowIntensity // Blue increases more dramatically
      )
      mesh.setColorAt(i, color)
    }
    
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  })
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, particleCount]}
    >
      <sphereGeometry args={[0.1, 10, 10]} /> {/* Increased geometry detail */}
      <meshBasicMaterial
        ref={materialRef}
        color="#FFD700"
        transparent={true}
        opacity={1.0}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  )
}