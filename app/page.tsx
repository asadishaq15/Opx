'use client'

import dynamic from 'next/dynamic'
import TextContentSection from '../components/TextContentSection'

// Dynamically import the 3D scene to prevent SSR issues
const Scene3DWithNoSSR = dynamic(
  () => import('../components/Scene3D'),
  { ssr: false }
)

// Dynamically import the Canvas to prevent SSR issues
const CanvasWithNoSSR = dynamic(
  () => import('../components/Canvas'),
  { ssr: false }
)

export default function HomePage() {
  return (
    <main id="main-content" className="relative">
      {/* 3D Canvas */}
      <div className="fixed inset-0 z-10">
        <CanvasWithNoSSR>
          <Scene3DWithNoSSR />
        </CanvasWithNoSSR>
      </div>
      
      {/* Text content that appears at the end */}
      <TextContentSection />
      
      {/* Invisible scroll container to enable scrolling and trigger scroll events */}
      <div className="h-[1500vh] w-full" /> {/* Increased from 500vh to 900vh (9x viewport height) */}
    </main>
  )
}