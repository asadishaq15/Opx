'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useScrollStore } from '../lib/scroll'

/**
 * Atmospheric Particles - Creates a beautiful nebula-like effect
 */
export default function AtmosphericParticles({ opacity = 1 }) {
  const meshRef = useRef<THREE.Points>(null)
  const { progress } = useScrollStore()
  
  const particleCount = 500
  
  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const colorPalette = [
      new THREE.Color('#00F0FF'),
      new THREE.Color('#FF1CF7'),
      new THREE.Color('#7C3AED'),
      new THREE.Color('#FFD700'),
      new THREE.Color('#1AFFA3'),
    ]
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Create particle cloud with varying density
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
      
      // Varied sizes for depth
      sizes[i] = Math.random() * 0.5 + 0.1
    }
    
    return { positions, colors, sizes }
  }, [])
  
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime
    
    // Rotate the entire particle system
    meshRef.current.rotation.y = time * 0.05 + progress * Math.PI * 0.5
    meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.1
    
    // Update material opacity based on scroll and passed opacity prop
    const material = meshRef.current.material as THREE.PointsMaterial
    material.opacity = (0.3 + progress * 0.4) * opacity
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
        size={0.2}
        sizeAttenuation
        transparent
        opacity={0.3 * opacity}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}