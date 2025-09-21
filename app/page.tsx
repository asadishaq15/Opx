'use client'

import dynamic from 'next/dynamic'
import TextContentSection from '../components/TextContentSection'

// Use ONLY ONE of these canvas implementations, not both
const CanvasWithNoSSR = dynamic(
  () => import('../components/Canvas'),
  { ssr: false }
)

export default function HomePage() {
  return (
    <main id="main-content" className="relative">
      {/* 3D Canvas - ONLY ONE canvas should be rendered */}
      <div className="fixed inset-0 z-10">
        <CanvasWithNoSSR />
      </div>
      
      {/* Text content that appears at the end */}
      <TextContentSection />
      
      {/* Invisible scroll container to enable scrolling and trigger scroll events */}
      {/* Increased from 1500vh to 2000vh to provide more scrolling space */}
      <div className="h-[1700vh] w-full" />
    </main>
  )
}