'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScrollStore } from '../lib/scroll'
import * as THREE from 'three'

/**
 * Yellow Glowing Particles Component
 * Adjusted to work with the inverted three-model sequence
 */
export default function YellowParticles({ opacity = 1 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const materialRef = useRef<THREE.MeshBasicMaterial>(null)
  const { progress } = useScrollStore()
  const { size, viewport } = useThree()
  
  // Particle configuration - reduced for performance
  const particleCount = 300
  const originalPositionsRef = useRef<Float32Array>()
  
  // Generate initial particle positions and data
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Position particles around the center initially to highlight all three models
      const radius = Math.random() * 10 + 1 
      const angle = Math.random() * Math.PI * 2
      const height = (Math.random() - 0.5) * 8
      
      positions[i3] = radius * Math.cos(angle) // X position 
      positions[i3 + 1] = height // Y position
      positions[i3 + 2] = radius * Math.sin(angle) * 0.7 + 1 // Z position
      
      // Pure bright yellow
      colors[i3] = 1.0
      colors[i3 + 1] = 1.0  
      colors[i3 + 2] = 0.0
      
      // Varied particle sizes for depth
      scales[i] = 0.05 + Math.random() * 0.2
    }
    
    // Store original positions for scroll calculations
    originalPositionsRef.current = positions.slice()
    
    return { positions, colors, scales }
  }, [particleCount])
  
  useFrame((state, delta) => {
    if (!meshRef.current || !originalPositionsRef.current) return
    
    const mesh = meshRef.current
    const time = state.clock.elapsedTime
    const dummy = new THREE.Object3D()
    
    // Updated fade logic to match the new model sequence
    // Start fully visible and begin fading out as we approach the palm tree section
    const fadeThreshold = 0.65 // Start fading at 65% scroll
    const fullFadeThreshold = 0.85 // Completely faded by 85% scroll
    
    let particleOpacity = 1.0
    
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
    
    // Dynamic center shift based on scroll - follows the O model as other models leave
    // No center shift initially when all models are centered
    const centerShiftX = progress > 0.3 ? 0 : 0;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Get original position
      const originalX = originalPositionsRef.current[i3]
      const originalY = originalPositionsRef.current[i3 + 1]
      const originalZ = originalPositionsRef.current[i3 + 2]
      
      // Add gentle floating animation
      let x = originalX + Math.sin(time * 0.3 + i * 0.02) * 0.2 + centerShiftX
      let y = originalY + Math.cos(time * 0.4 + i * 0.03) * 0.15
      let z = originalZ
      
      // Gradually increase particle spread as models separate and leave
      const spreadFactor = Math.min(progress * 2, 1.5) // Max spread at 75% scroll
      x = x * (1 + spreadFactor * 0.2)
      y = y * (1 + spreadFactor * 0.1)
      
      // Apply final position
      dummy.position.set(x, y, z)
      
      // Pulsing scale for glowing effect
      const pulseScale = 1 + Math.sin(time * 2 + i * 0.05) * 0.15
      dummy.scale.setScalar(scales[i] * pulseScale)
      
      // Individual particle rotation
      dummy.rotation.set(
        time * 0.1 + i * 0.01,
        time * 0.08 + i * 0.008,
        time * 0.12 + i * 0.012 + progress * 0.3
      )
      
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      
      // Enhanced color with intensity and minimum brightness for visibility
      const baseGlowIntensity = (0.9 + Math.sin(time * 1.5 + i * 0.08) * 0.1)
      const glowIntensity = Math.max(baseGlowIntensity, 0.7) // Ensure minimum brightness
      const color = new THREE.Color(
        1.0 * glowIntensity, 
        1.0 * glowIntensity, 
        0.0
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
      <sphereGeometry args={[0.1, 6, 6]} />
      <meshBasicMaterial
        ref={materialRef}
        color="#FFD700"
        transparent={true}
        opacity={1.0} // Start fully visible
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  )
}