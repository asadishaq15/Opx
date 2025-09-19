'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { useIsClient } from '../lib/useIsClient'
import { useScrollTrigger } from '../lib/scroll'

// Dynamically import R3F components to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { 
  ssr: false 
})

const Scene3D = dynamic(() => import('./Scene3D'), { ssr: false })

/**
 * Root canvas component that sets up the 3D scene
 * Uses dynamic imports to prevent SSR issues with Three.js
 */
export default function CanvasRoot() {
  const isClient = useIsClient()
  
  // Initialize scroll trigger effects
  useScrollTrigger()

  // Check if mobile for camera adjustments
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  if (!isClient) {
    return null
  }

  return (
    <>
      <Canvas
        dpr={[1, isMobile ? 1.5 : 2]} // Lower DPR on mobile for performance
        camera={{ 
          position: [0, 0, isMobile ? 15 : 12], // Further back on mobile for better view
          fov: isMobile ? 70 : 60, // Wider FOV on mobile
          near: 0.1,
          far: 1000 
        }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMappingExposure: 1.2,
          outputColorSpace: 'srgb',
          preserveDrawingBuffer: true,
        }}
        className="pointer-events-auto"
        style={{ 
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1
        }}
        onCreated={({ gl }) => {
          // Configure renderer settings
          gl.outputColorSpace = 'srgb'
          gl.toneMapping = 5 // ACESFilmicToneMapping
          gl.toneMappingExposure = 1.2
          
          // Disable shadows for performance
          gl.shadowMap.enabled = false
        }}
      >
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
      
    </>
  )
}
