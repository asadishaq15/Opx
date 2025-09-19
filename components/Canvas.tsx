'use client'

import { Canvas as R3FCanvas } from '@react-three/fiber'
import { Suspense, ReactNode } from 'react'

type CanvasProps = {
  children?: ReactNode
}

export default function Canvas({ children }: CanvasProps) {
  return (
    <R3FCanvas
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
      }}
      dpr={[1, 2]} // Responsive DPR for better performance
      camera={{ position: [0, 0, 10], fov: 45 }}
      style={{ background: 'radial-gradient(circle at center, #0A0A0B 0%, #050505 100%)' }}
      shadows={false} // Disable shadows for performance
    >
      <Suspense fallback={null}>
        {children}
      </Suspense>
    </R3FCanvas>
  )
}
