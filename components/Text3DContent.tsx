'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text3D, Center, useMatcapTexture } from '@react-three/drei'
import { useScrollStore, useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

interface Text3DContentProps {
  children: string
  position: [number, number, number]
  size?: number
  depth?: number
  color?: string
  glowColor?: string
  maxWidth?: number
  scrollTriggerStart?: number
  scrollTriggerEnd?: number
  animationType?: 'slideUp' | 'slideLeft' | 'slideRight' | 'fade' | 'scale'
}

/**
 * 3D Text Component with scroll-based animations
 * Renders text in 3D space with various entrance/exit animations
 */
export default function Text3DContent({
  children,
  position,
  size = 1,
  depth = 0.2,
  color = '#FFFFFF',
  glowColor = '#00F0FF',
  maxWidth = 10,
  scrollTriggerStart = 0,
  scrollTriggerEnd = 1,
  animationType = 'slideUp'
}: Text3DContentProps) {
  const meshRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const { progress } = useScrollStore()
  const prefersReducedMotion = useReducedMotion()
  
  // Load matcap texture for more interesting material
  const [matcapTexture] = useMatcapTexture('7B5254_E9DCC7_B19986_C8AC91', 256)
  
  // Calculate animation progress
  const animationProgress = useMemo(() => {
    if (progress < scrollTriggerStart) return 0
    if (progress > scrollTriggerEnd) return 1
    return (progress - scrollTriggerStart) / (scrollTriggerEnd - scrollTriggerStart)
  }, [progress, scrollTriggerStart, scrollTriggerEnd])
  
  // Calculate exit progress (for fade out effect)
  const exitProgress = useMemo(() => {
    const exitStart = scrollTriggerEnd
    const exitEnd = Math.min(scrollTriggerEnd + 0.15, 1)
    if (progress < exitStart) return 0
    if (progress > exitEnd) return 1
    return (progress - exitStart) / (exitEnd - exitStart)
  }, [progress, scrollTriggerEnd])
  
  useFrame((state, delta) => {
    if (!meshRef.current || prefersReducedMotion) return
    
    const group = meshRef.current
    const time = state.clock.elapsedTime
    
    // Base animation transforms
    let x = position[0]
    let y = position[1]
    let z = position[2]
    let scaleValue = 1
    let opacity = 1
    
    // Entrance animations
    if (animationProgress < 1) {
      switch (animationType) {
        case 'slideUp':
          y = position[1] - (1 - animationProgress) * 5
          opacity = animationProgress
          break
        case 'slideLeft':
          x = position[0] - (1 - animationProgress) * 8
          opacity = animationProgress
          break
        case 'slideRight':
          x = position[0] + (1 - animationProgress) * 8
          opacity = animationProgress
          break
        case 'scale':
          scaleValue = animationProgress
          opacity = animationProgress
          break
        case 'fade':
        default:
          opacity = animationProgress
          break
      }
    }
    
    // Exit animations (fade out when scrolling past)
    if (exitProgress > 0) {
      opacity = Math.max(0, opacity - exitProgress)
      scaleValue = Math.max(0.1, scaleValue - exitProgress * 0.5)
    }
    
    // Apply smooth easing
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    const easedProgress = easeInOutCubic(Math.max(0, Math.min(1, animationProgress)))
    
    // Update position and scale
    group.position.set(x, y, z)
    group.scale.setScalar(scaleValue)
    
    // Subtle floating animation when fully visible
    if (animationProgress >= 1 && exitProgress === 0) {
      group.position.y += Math.sin(time * 0.5 + position[0] * 0.1) * 0.05
      group.rotation.z = Math.sin(time * 0.3 + position[1] * 0.1) * 0.01
    }
    
    // Update materials opacity
    group.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((mat) => {
            if ('opacity' in mat) {
              mat.opacity = opacity
              mat.transparent = true
            }
          })
        } else if ('opacity' in child.material) {
          child.material.opacity = opacity
          child.material.transparent = true
        }
      }
    })
  })
  
  const isVisible = animationProgress > 0 && exitProgress < 1
  
  if (!isVisible) return null
  
  return (
    <group ref={meshRef} position={position}>
      <Center>
        <Text3D
          font="https://threejs.org/examples/fonts/helvetiker_regular.typeface.json"
          size={size}
          height={depth}
          curveSegments={12}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.01}
          bevelOffset={0}
          bevelSegments={5}
        >
          {children}
          <meshMatcapMaterial 
            matcap={matcapTexture} 
            color={color}
            transparent
            opacity={1}
          />
        </Text3D>
      </Center>
    </group>
  )
}
