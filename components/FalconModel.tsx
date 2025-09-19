'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

export default function FalconModel({ opacity = 1 }) {
  const meshRef = useRef<THREE.Group>(null)
  const prefersReducedMotion = useReducedMotion()
  
  // Load the falcon model with animations - hooks must always be called
  const { scene, animations } = useGLTF('/models/falcon/falcon.glb')
  const { actions, mixer } = useAnimations(animations, meshRef)
  
  // Animation parameters - made more visible
  const radius = 7  // Very close radius around logo
  const speed = prefersReducedMotion ? 0.5 : 1.0
  const height = 0  // At logo level
  const tiltIntensity = 0.2
  
  // Start only the fly_A1 animation when component mounts - only first 10 frames
  useEffect(() => {
    if (actions && actions['Bird|fly_A2']) {
      const action = actions['Bird|fly_A2']
      const clip = action.getClip()
      const frameRate = 30 // Assume 30fps, adjust if needed
      const duration = clip.duration
      const totalFrames = Math.floor(duration * frameRate)
      
      // Calculate time for first 10 frames
      const frameCount = Math.min(90, totalFrames)
      const loopDuration = frameCount / frameRate
      
      // Set the action to loop only the first 10 frames
      action.setLoop(THREE.LoopRepeat, Infinity)
      action.time = 0
      action.setEffectiveTimeScale(1)
      action.setDuration(loopDuration)
      action.play()
    }
    
    return () => {
      // Cleanup fly_A1 animation when component unmounts
      if (actions && actions['Bird|fly_A2']) {
        actions['Bird|fly_A2'].stop()
      }
    }
  }, [actions])
  
  useFrame((state, delta) => {
    if (!meshRef.current) return
    
    const time = state.clock.elapsedTime * speed
    
    // Circular flight path
    const x = Math.cos(time) * radius
    const z = Math.sin(time) * radius
    const y = Math.sin(time * 2) * 2 + height // Figure-8 vertical movement
    
    meshRef.current.position.set(x, y, z)
    
    // Calculate banking/tilting based on movement direction
    const nextX = Math.cos(time + 0.1) * radius
    const nextZ = Math.sin(time + 0.1) * radius
    
    const directionX = nextX - x
    const directionZ = nextZ - z
    
    // Face the direction of movement
    meshRef.current.lookAt(nextX, y, nextZ)
    
    // Apply opacity
    if (opacity < 1) {
      meshRef.current.traverse(child => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              if (mat.transparent === false) {
                mat.transparent = true;
              }
              mat.opacity = opacity;
            });
          } else {
            if (child.material.transparent === false) {
              child.material.transparent = true;
            }
            child.material.opacity = opacity;
          }
        }
      });
    }
  })
  
  if (!scene) {
    return null
  }

  return (
    <group ref={meshRef} scale={4.0} castShadow receiveShadow>
      <primitive object={scene} />
    </group>
  )
}

// Preload the falcon model
useGLTF.preload('/models/falcon/falcon.glb')