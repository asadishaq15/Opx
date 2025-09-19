'use client'

import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useScrollStore, useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

export default function PalmParticles({ opacity = 1 }) {
  const particlesRef = useRef<THREE.Points>(null)
  const groupRef = useRef<THREE.Group>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameCount = useRef(0)
  const { viewport } = useThree()
  const { progress } = useScrollStore()
  const prefersReducedMotion = useReducedMotion()
  
  // Load the palm model
  const { scene } = useGLTF('/models/palm/scene-v2.glb')
  
  // Create circular texture for particles
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, 64, 64)
    }
    
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }, [])
  
  // Extract vertex positions and colors from the palm model geometry
  const { particlePositions, particleColors } = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    
    if (scene) {
      // Traverse the scene to find all meshes and extract vertices
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const geometry = child.geometry
          const positionAttribute = geometry.attributes.position
          
          if (positionAttribute) {
            const worldMatrix = new THREE.Matrix4()
            child.updateWorldMatrix(true, false)
            worldMatrix.copy(child.matrixWorld)
            
            // Sample vertices at regular intervals for more organized distribution
            const sampleRate = Math.max(2, Math.floor(positionAttribute.count / 3000))
            
            for (let i = 0; i < positionAttribute.count; i += sampleRate) {
              const vertex = new THREE.Vector3()
              vertex.fromBufferAttribute(positionAttribute, i)
              vertex.applyMatrix4(worldMatrix)
              
              // Scale down the positions to fit in our scene
              vertex.multiplyScalar(0.2)
              
              // Move palms down by 20 units
              vertex.y -= 7
              
              positions.push(vertex.x, vertex.y, vertex.z)
              
              // Calculate distance from center (logo position) for gradient
              const distanceFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z)
              const maxDistance = 8 // Adjust this to control gradient spread
              const gradientFactor = Math.min(distanceFromCenter / maxDistance, 1)
              
              // Interpolate between yellow (close to logo) and dark green (far from logo)
              const yellow = { r: 1, g: 1, b: 0 }
              const darkGreen = { r: 0.1, g: 0.4, b: 0.1 }
              
              const r = yellow.r + (darkGreen.r - yellow.r) * gradientFactor
              const g = yellow.g + (darkGreen.g - yellow.g) * gradientFactor
              const b = yellow.b + (darkGreen.b - yellow.b) * gradientFactor
              
              colors.push(r, g, b)
            }
          }
        }
      })
    }
    
    // Fallback if no positions found - create organized grid pattern
    if (positions.length === 0) {
      console.warn('No palm geometry found, using organized fallback positions')
      const gridSize = 20
      const spacing = 0.5
      const centerOffset = (gridSize - 1) * spacing / 2
      
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const posX = x * spacing - centerOffset
          const posZ = z * spacing - centerOffset
          const posY = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2 - 7 // Wave pattern
          
          positions.push(posX, posY, posZ)
          
          // Calculate organized color gradient
          const distanceFromCenter = Math.sqrt(posX * posX + posZ * posZ)
          const maxDistance = centerOffset * 1.4
          const gradientFactor = Math.min(distanceFromCenter / maxDistance, 1)
          
          const yellow = { r: 1, g: 1, b: 0 }
          const darkGreen = { r: 0.1, g: 0.4, b: 0.1 }
          
          const r = yellow.r + (darkGreen.r - yellow.r) * gradientFactor
          const g = yellow.g + (darkGreen.g - yellow.g) * gradientFactor
          const b = yellow.b + (darkGreen.b - yellow.b) * gradientFactor
          
          colors.push(r, g, b)
        }
      }
    }
    
    return {
      particlePositions: new Float32Array(positions),
      particleColors: new Float32Array(colors)
    }
  }, [scene])
  
  // Create original positions for animation reference
  const originalPositions = useMemo(() => {
    return new Float32Array(particlePositions)
  }, [particlePositions])
  
  // Handle mouse movement
  const handlePointerMove = (event: THREE.Event) => {
    if (prefersReducedMotion) return
    
    const { clientX, clientY } = event as any
    const rect = (event.target as any)?.getBoundingClientRect?.() || { 
      left: 0, top: 0, width: window.innerWidth, height: window.innerHeight 
    }
    
    mouseRef.current = {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1,
    }
  }
  
  useFrame((state) => {
    if (!particlesRef.current || !groupRef.current) return
    
    frameCount.current++
    const time = state.clock.elapsedTime
    
    // Slower rotation than logo (0.3x speed)
    const rotationSpeed = prefersReducedMotion ? 0.1 : 0.3
    groupRef.current.rotation.y = progress * Math.PI * 2 * rotationSpeed
    
    // Scroll-based visibility - fade in as we scroll
    // Apply external opacity for text section transition
    const visibility = Math.min(1, progress * 2) * opacity
    const material = particlesRef.current.material as THREE.PointsMaterial
    material.opacity = visibility
    
    // Move palms from bottom to top based on scroll progress
    const verticalMovement = progress * 30 // Move up 30 units over full scroll
    groupRef.current.position.y = -15 + verticalMovement // Start from -15, move to +15
    
    // Mouse interaction - optimized to run every 3rd frame for better performance
    if (!prefersReducedMotion && frameCount.current % 3 === 0) {
      const positionAttribute = particlesRef.current.geometry.attributes.position
      const positions = positionAttribute.array as Float32Array
      const mouseInfluence = 0.3
      
      // Ensure we don't exceed the original array length
      const maxLength = Math.min(positions.length, originalPositions.length)
      
      // Pre-calculate mouse position to avoid repeated calculations
      const mouseX = mouseRef.current.x * 3
      const mouseY = mouseRef.current.y * 3
      
      // Process particles in batches for better performance
      const batchSize = Math.min(300, maxLength / 3) // Process max 100 particles per frame
      const startIndex = (frameCount.current / 3) % Math.ceil(maxLength / (batchSize * 3)) * batchSize * 3
      
      for (let i = startIndex; i < Math.min(startIndex + batchSize * 3, maxLength); i += 3) {
        const originalX = originalPositions[i]
        const originalY = originalPositions[i + 1] 
        const originalZ = originalPositions[i + 2]
        
        // Fast distance calculation using squared distance where possible
        const distanceX = originalX - mouseX
        const distanceY = originalY - mouseY
        const distanceSquared = distanceX * distanceX + distanceY * distanceY
        
        // Apply very subtle mouse repulsion using squared distance
        if (distanceSquared < 4) { // 2 * 2 = 4 (squared)
          const distance = Math.sqrt(distanceSquared)
          const repulsion = (2 - distance) * mouseInfluence
          const dirX = distanceX / distance || 0
          const dirY = distanceY / distance || 0
          
          positions[i] = originalX + dirX * repulsion
          positions[i + 1] = originalY + dirY * repulsion
        } else {
          // Return to original position more quickly
          positions[i] += (originalX - positions[i]) * 0.1
          positions[i + 1] += (originalY - positions[i + 1]) * 0.1
        }
        
        // Add organized floating animation - wave-like pattern
        const waveX = Math.sin(time * 0.5 + originalX * 0.1) * 0.05
        const waveY = Math.cos(time * 0.3 + originalZ * 0.1) * 0.05
        positions[i + 2] = originalZ + waveX + waveY
      }
      
      positionAttribute.needsUpdate = true
    }
  })
  
  return (
    <group ref={groupRef} onPointerMove={handlePointerMove}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleColors.length / 3}
            array={particleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          transparent
          opacity={0}
          sizeAttenuation
          vertexColors
          blending={THREE.AdditiveBlending}
          map={circleTexture}
          alphaTest={0.001}
        />
      </points>
    </group>
  )
}

// Preload the palm model
useGLTF.preload('/models/palm/scene-v2.glb')