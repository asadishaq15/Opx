'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScrollStore, useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

/**
 * Interactive 3D Particles Component
 * Responds to mouse/touch interactions and scroll progress
 */
export default function Particles3D() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { velocity, progress } = useScrollStore()
  const { size, viewport, camera } = useThree()
  const prefersReducedMotion = useReducedMotion()
  
  // Particle configuration - mobile-friendly
  const isMobile = size.width < 768
  const particleCount = prefersReducedMotion ? 1000 : (isMobile ? 2000 : 4000) // Fewer particles on mobile
  const mouseRef = useRef({ x: 0, y: 0 })
  const mouseMovingRef = useRef(false)
  const mouseStillTimer = useRef<NodeJS.Timeout>()
  const velocityRef = useRef(new Float32Array(particleCount * 3))
  
  // Generate initial particle positions and data
  const { positions, colors, scales } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const scales = new Float32Array(particleCount)
    
    // Color palette
    const colorPalette = [
      new THREE.Color('#00F0FF'), // neon-cyan
      new THREE.Color('#FF1CF7'), // neon-magenta  
      new THREE.Color('#7C3AED'), // neon-purple
      new THREE.Color('#B6FF00'), // neon-lime
    ]
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Distribute particles in the same plane as the logo (Z ≈ 0)
      const radius = Math.random() * (isMobile ? 15 : 25) + 5 // Smaller spread on mobile
      const angle = Math.random() * Math.PI * 2
      
      positions[i3] = radius * Math.cos(angle) // X position
      positions[i3 + 1] = (Math.random() - 0.5) * (isMobile ? 6 : 8) // Y position (smaller vertical range on mobile)
      positions[i3 + 2] = (Math.random() - 0.5) * 2 // Z position (same plane as logo)
      
      // Random color from palette with more variation
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)]
      const brightness = 0.7 + Math.random() * 0.3 // Vary brightness
      colors[i3] = color.r * brightness
      colors[i3 + 1] = color.g * brightness
      colors[i3 + 2] = color.b * brightness
      
      // Smaller, more uniform scales for subtle light points
      scales[i] = Math.random() * 0.3 + 0.1 // Much smaller particles
    }
    
    return { positions, colors, scales }
  }, [particleCount])
  
  // Handle pointer movement with mouse tracking
  const handlePointerMove = (event: THREE.Event) => {
    if (prefersReducedMotion) return
    
    const { clientX, clientY } = event as any
    mouseRef.current = {
      x: (clientX / size.width) * 2 - 1,
      y: -(clientY / size.height) * 2 + 1,
    }
    
    // Track mouse movement
    mouseMovingRef.current = true
    
    // Clear existing timer and set new one
    if (mouseStillTimer.current) {
      clearTimeout(mouseStillTimer.current)
    }
    
    // Consider mouse "still" after 100ms of no movement
    mouseStillTimer.current = setTimeout(() => {
      mouseMovingRef.current = false
    }, 100)
  }
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    const mesh = meshRef.current
    const time = state.clock.elapsedTime
    const dummy = new THREE.Object3D()
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Get original position
      let x = positions[i3]
      let y = positions[i3 + 1]
      let z = positions[i3 + 2]
      
      if (!prefersReducedMotion && mouseMovingRef.current) {
        // Only animate when mouse is moving
        // Add subtle floating animation
        x += Math.sin(time * 0.3 + i * 0.01) * 0.2
        y += Math.cos(time * 0.2 + i * 0.015) * 0.15
        
        // Mouse interaction (attraction/repulsion)
        const mouseWorldPos = new THREE.Vector3(
          mouseRef.current.x * viewport.width * 0.5,
          mouseRef.current.y * viewport.height * 0.5,
          0
        )
        
        const particlePos = new THREE.Vector3(x, y, z)
        const distance = particlePos.distanceTo(mouseWorldPos)
        const maxDistance = 4
        
        if (distance < maxDistance) {
          const force = (1 - distance / maxDistance) * 0.03
          const direction = particlePos.clone().sub(mouseWorldPos).normalize()
          
          // Gentle repulsion when mouse moves
          x += direction.x * force
          y += direction.y * force
        }
        
        // Minimal scroll-based movement to stay in logo plane
        const scrollOffset = progress * 2
        y += scrollOffset * 0.1 // Subtle vertical movement only
      }
      
      // Apply transformations
      dummy.position.set(x, y, z)
      dummy.scale.setScalar(scales[i] * (1 + Math.sin(time * 2 + i) * 0.05)) // Gentle pulsing
      
      // Minimal rotation when mouse is moving, static otherwise
      if (mouseMovingRef.current && !prefersReducedMotion) {
        dummy.rotation.set(
          time * 0.05 + i * 0.005,
          time * 0.03 + i * 0.003,
          0
        )
      } else {
        dummy.rotation.set(0, 0, 0) // Static when mouse not moving
      }
      
      dummy.updateMatrix()
      
      mesh.setMatrixAt(i, dummy.matrix)
      
      // Update color based on scroll progress (subtle hue shift)
      const hueShift = progress * 0.2
      const originalColor = new THREE.Color(colors[i3], colors[i3 + 1], colors[i3 + 2])
      originalColor.offsetHSL(hueShift, 0, 0)
      mesh.setColorAt(i, originalColor)
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
      onPointerMove={handlePointerMove}
    >
      <sphereGeometry args={[0.008, 8, 8]} />
      <meshStandardMaterial
        transparent
        opacity={0.8}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        emissive="#00AAFF"
        emissiveIntensity={0.4}
        roughness={0}
        metalness={0.9}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
