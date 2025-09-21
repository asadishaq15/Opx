'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScrollStore } from '../lib/scroll'

/**
 * Camera Controller Component
 * Manages camera movement based on scroll position
 */
export default function CameraController() {
  const { camera } = useThree()
  const { progress } = useScrollStore()
  const cameraRef = useRef({
    initialPosition: [0, 0, 10],
    targetPosition: [0, 0, 10],
  })
  
  useFrame((_, delta) => {
    // Calculate camera position based on scroll progress
    if (progress < 0.8) {
      // Normal camera behavior for most of the scroll
      cameraRef.current.targetPosition = [
        0,
        0,
        10 - progress * 2, // Move camera closer as we scroll
      ]
    } else {
      // Move camera back for content section
      const contentTransitionProgress = (progress - 0.8) / 0.2 // 0-1 range for last 20% of scroll
      const easeOutProgress = 1 - Math.pow(1 - contentTransitionProgress, 3) // Cubic ease out
      
      cameraRef.current.targetPosition = [
        0,
        0,
        8 + easeOutProgress * 7, // Move camera back from 8 to 15
      ]
    }
    
    // Smooth camera movement
    camera.position.x += (cameraRef.current.targetPosition[0] - camera.position.x) * 2 * delta
    camera.position.y += (cameraRef.current.targetPosition[1] - camera.position.y) * 2 * delta
    camera.position.z += (cameraRef.current.targetPosition[2] - camera.position.z) * 2 * delta
    
    // Always look at center
    camera.lookAt(0, 0, 0)
  })
  
  return null
}