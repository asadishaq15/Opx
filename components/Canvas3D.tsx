'use client'

import { Canvas } from '@react-three/fiber'
import Scene3D from './Scene3D'
import { Suspense } from 'react'
import { Loader } from '@react-three/drei'

export default function Canvas3D() {
  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 15], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true
        }}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
        dpr={[1, 1.5]} // Cap pixel ratio for better performance
        performance={{ min: 0.5 }} // Allow frame rate to drop if needed
        shadows={false} // Disable shadows for performance
      >
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  )
}