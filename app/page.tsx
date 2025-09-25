'use client'

import dynamic from 'next/dynamic'
import TextContentSection from '../components/TextContentSection'

// Use ONLY ONE of these canvas implementations, not both
const CanvasWithNoSSR = dynamic(
  () => import('../components/Canvas'),
  { ssr: false }
)

// In HomePage.jsx
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
      <div className="h-[2500vh] w-full" /> {/* Increased from 2000vh to 2500vh */}
    </main>
  )
}