'use client'

import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScrollStore } from '../lib/scroll'

/**
 * Camera Controller Component
 * Manages camera movement based on scroll position
 * Adjusted for reversed model animation
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
    if (progress < 0.4) {
      // During model exit sequence, keep camera fairly stable
      // but move slightly forward to enhance the motion of models exiting
      cameraRef.current.targetPosition = [
        0,
        0,
        10 - progress * 1.5, // Gentler forward movement
      ]
    } else if (progress < 0.8) {
      // After models exit, move camera forward to see atmospheric effects
      const midTransitionProgress = (progress - 0.4) / 0.4 // 0-1 range for middle 40% of scroll
      const easeInOutProgress = midTransitionProgress < 0.5
        ? 2 * midTransitionProgress * midTransitionProgress
        : 1 - Math.pow(-2 * midTransitionProgress + 2, 2) / 2
      
      cameraRef.current.targetPosition = [
        0,
        0,
        9.4 - easeInOutProgress * 2.4, // Move camera from 9.4 to 7.0
      ]
    } else {
      // Move camera back for content section
      const contentTransitionProgress = (progress - 0.8) / 0.2 // 0-1 range for last 20% of scroll
      const easeOutProgress = 1 - Math.pow(1 - contentTransitionProgress, 3) // Cubic ease out
      
      cameraRef.current.targetPosition = [
        0,
        0,
        7 + easeOutProgress * 8, // Move camera back from 7 to 15
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