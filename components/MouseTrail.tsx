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
  length: number
  angle: number
}

/**
 * Mouse Trail Particles Component
 * Creates light streak particles that follow mouse movement
 */
export default function MouseTrail({ opacity = 1 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const { size, viewport } = useThree()
  const prefersReducedMotion = useReducedMotion()
  
  const [particles, setParticles] = useState<TrailParticle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const lastMouseRef = useRef({ x: 0, y: 0 })
  const particleIdRef = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Adjust particle count based on device
  const isMobile = size.width < 768
  const maxParticles = prefersReducedMotion ? 20 : (isMobile ? 40 : 80)
  
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
      
      // Calculate angle of movement
      const angle = Math.atan2(deltaY, deltaX)
      
      // Only create particles if mouse is moving
      if (speed > 0.003) {
        const worldPos = new THREE.Vector3(
          currentX * viewport.width * 0.5,
          currentY * viewport.height * 0.5,
          0
        )
        
        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        
        // Create streaks with varying sizes
        const createParticles = () => {
          const particleCount = Math.min(Math.floor(speed * (isMobile ? 15 : 30)), isMobile ? 2 : 3)
          
          setParticles(prev => {
            const newParticles: TrailParticle[] = []
            
            for (let i = 0; i < particleCount; i++) {
              // Calculate length based on speed
              const length = speed * (Math.random() * 4 + 4)
              
              // Small angle variation for each streak
              const angleVariation = (Math.random() - 0.5) * 0.2
              const particleAngle = angle + angleVariation
              
              // Velocity in direction of movement, but slower
              const velocity = new THREE.Vector3(
                Math.cos(particleAngle) * (2 + Math.random() * 2),
                Math.sin(particleAngle) * (2 + Math.random() * 2),
                0
              )
              
              newParticles.push({
                id: particleIdRef.current++,
                position: worldPos.clone(),
                velocity,
                life: 1.0 + Math.random() * 0.5, // Longer life
                maxLife: 1.0 + Math.random() * 0.5,
                size: Math.random() * (isMobile ? 0.03 : 0.06) + (isMobile ? 0.02 : 0.04),
                length,
                angle: particleAngle
              })
            }
            
            // Add new particles and remove old ones
            const updated = [...prev, ...newParticles]
              .filter(p => p.life > 0)
              .slice(-maxParticles)
            
            return updated
          })
          
          // Schedule next particle creation for continuous effect
          timeoutRef.current = setTimeout(createParticles, 30)
        }
        
        createParticles()
      } else {
        // Clear timeout when mouse stops
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
          timeoutRef.current = null
        }
      }
      
      lastMouseRef.current = { x: currentX, y: currentY }
      mouseRef.current = { x: currentX, y: currentY }
    }
    
    window.addEventListener('mousemove', handlePointerMove)
    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [size, viewport, prefersReducedMotion, maxParticles])
  
  useFrame((state, delta) => {
    if (!meshRef.current || prefersReducedMotion) return
    
    // Update particles
    setParticles(prev => {
      return prev.map(particle => {
        // Slow down over time for fluid motion
        const slowFactor = particle.life / particle.maxLife
        const updatedVelocity = particle.velocity.clone().multiplyScalar(slowFactor)
        
        return {
          ...particle,
          position: particle.position.clone().add(
            updatedVelocity.clone().multiplyScalar(delta)
          ),
          life: particle.life - delta * 0.7 // Slower fade
        }
      }).filter(p => p.life > 0)
    })
    
    // Update instanced mesh
    const dummy = new THREE.Object3D()
    const particleArray = particles
    
    for (let i = 0; i < maxParticles; i++) {
      if (i < particleArray.length) {
        const particle = particleArray[i]
        
        // Position at center of streak
        dummy.position.copy(particle.position)
        
        // Set rotation based on movement direction
        dummy.rotation.z = particle.angle
        
        // Scale x to create streak effect, scale y for width
        const lifeRatio = particle.life / particle.maxLife
        const fadeMultiplier = Math.sin(lifeRatio * Math.PI) // Fade in and out smoothly
        const lengthFactor = particle.length * fadeMultiplier
        
        dummy.scale.set(
          lengthFactor, // Length of streak
          particle.size * fadeMultiplier * opacity, // Width of streak
          1
        )
        
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        
        // Bright color with blue-white tint
        const intensity = fadeMultiplier * 3 * opacity
        const color = new THREE.Color(0.7, 0.9, 1.0).multiplyScalar(intensity)
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
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        transparent
        opacity={opacity}
        vertexColors
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        color="#ffffff"
        toneMapped={false}
      />
    </instancedMesh>
  )
}