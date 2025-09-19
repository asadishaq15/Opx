'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

interface TrailParticle {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  size: number
  startPosition: THREE.Vector3
}

/**
 * Mouse Trail Particles Component
 * Creates white light particles that shoot in the direction of mouse movement
 */
export default function MouseTrail({ opacity = 1 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { size, viewport, camera } = useThree()
  const prefersReducedMotion = useReducedMotion()
  
  const [particles, setParticles] = useState<TrailParticle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const particleIdRef = useRef(0)
  
  // Adjust particle count based on device
  const isMobile = size.width < 768
  const maxParticles = prefersReducedMotion ? 25 : (isMobile ? 50 : 100)
  
  // Handle pointer movement
  useEffect(() => {
    const handlePointerMove = (event: MouseEvent) => {
      if (prefersReducedMotion) return
      
      const currentX = (event.clientX / size.width) * 2 - 1
      const currentY = -(event.clientY / size.height) * 2 + 1
      
      // Calculate mouse velocity
      const deltaX = currentX - lastMouseRef.current.x
      const deltaY = currentY - lastMouseRef.current.y
      const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
      
      // Only create particles if mouse is moving fast enough
      if (speed > 0.008) { // Lower threshold for more sensitivity
        const worldPos = new THREE.Vector3(
          currentX * viewport.width * 0.5,
          currentY * viewport.height * 0.5,
          0 // Keep in same plane
        )
        
        // Create straight-line velocity vector
        const velocity = new THREE.Vector3(
          deltaX * 15, // Faster, straighter movement
          deltaY * 15,
          0 // No Z movement for straight lines
        ).normalize().multiplyScalar(8) // Consistent speed
        
        // Create fewer but more visible particles (less on mobile)
        const particleCount = Math.min(Math.floor(speed * (isMobile ? 15 : 30)), isMobile ? 2 : 3)
        
        setParticles(prev => {
          const newParticles: TrailParticle[] = []
          
          for (let i = 0; i < particleCount; i++) {
            const startPos = worldPos.clone()
            newParticles.push({
              id: particleIdRef.current++,
              position: startPos.clone(),
              startPosition: startPos.clone(),
              velocity: velocity.clone(), // No spread - straight line
              life: 1.5, // Longer life for visibility
              maxLife: 1.5,
              size: Math.random() * (isMobile ? 0.03 : 0.05) + (isMobile ? 0.02 : 0.03) // Slightly smaller on mobile
            })
          }
          
          // Add new particles and remove old ones
          const updated = [...prev, ...newParticles]
            .filter(p => p.life > 0)
            .slice(-maxParticles) // Keep only the most recent particles
          
          return updated
        })
      }
      
      lastMouseRef.current = { x: currentX, y: currentY }
      mouseRef.current = { x: currentX, y: currentY }
    }
    
    window.addEventListener('mousemove', handlePointerMove)
    return () => window.removeEventListener('mousemove', handlePointerMove)
  }, [size, viewport, prefersReducedMotion, maxParticles])
  
  useFrame((state, delta) => {
    if (!meshRef.current || prefersReducedMotion) return
    
    // Update particles - straight line movement, no friction
    setParticles(prev => {
      return prev.map(particle => ({
        ...particle,
        position: particle.position.clone().add(
          particle.velocity.clone().multiplyScalar(delta)
        ),
        // No friction - maintain straight line movement
        life: particle.life - delta * 0.8 // Slower fade for visibility
      })).filter(p => p.life > 0)
    })
    
    // Update instanced mesh
    const dummy = new THREE.Object3D()
    const particleArray = particles
    
    for (let i = 0; i < maxParticles; i++) {
      if (i < particleArray.length) {
        const particle = particleArray[i]
        dummy.position.copy(particle.position)
        dummy.scale.setScalar(particle.size * Math.min(particle.life, 1) * opacity) // Apply external opacity
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        
        // Gradient color based on life with glow effect
        const alpha = Math.min(particle.life, 1) * opacity // Apply external opacity
        const hue = (particle.id * 0.1 + state.clock.elapsedTime * 0.5) % 1
        const color = new THREE.Color().setHSL(hue, 1, 0.7)
        color.multiplyScalar(alpha * 3) // Extra bright for glow
        meshRef.current.setColorAt(i, color)
      } else {
        // Hide unused instances
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
      }
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  })
  
  if (prefersReducedMotion) return null
  
  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, maxParticles]}
    >
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial
        transparent
        opacity={opacity}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color="white"
        emissive="white"
        emissiveIntensity={2.0 * opacity}
        roughness={0}
        metalness={0.5}
        toneMapped={false}
      />
    </instancedMesh>
  )
}