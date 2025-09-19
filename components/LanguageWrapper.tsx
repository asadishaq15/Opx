'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import LanguageSelector, { LanguageSelectorUI } from './LanguageSelector'
import { useGLTF } from '@react-three/drei'

// Dynamically import Canvas to avoid SSR issues
const Canvas = dynamic(() => import('@react-three/fiber').then(mod => ({ default: mod.Canvas })), { 
  ssr: false 
})

// Dynamically import the main 3D scene ONLY when needed
const CanvasRoot = dynamic(() => import('./CanvasRoot'), { 
  ssr: false
})

interface LanguageWrapperProps {
  children: React.ReactNode
}

export default function LanguageWrapper({ children }: LanguageWrapperProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'ar' | null>(null)
  const [isClient, setIsClient] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [exitTransition, setExitTransition] = useState(false)
  const [showMainApp, setShowMainApp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Check if running on client side
  useEffect(() => {
    setIsClient(true)
    
    // Preload 3D assets immediately for caching
    useGLTF.preload('/models/O.glb')
    useGLTF.preload('/models/falcon/falcon.glb') 
    useGLTF.preload('/models/palm/scene-v2.glb')
    
    // Check if language was previously selected
    const savedLanguage = localStorage.getItem('selectedLanguage')
    if (savedLanguage) {
      // If language was already selected, go directly to main app
      setSelectedLanguage(savedLanguage as 'en' | 'ar')
      setShowMainApp(true)
      return
    }
    
    // Show buttons after 3 seconds (match particle entrance)
    const timer = setTimeout(() => {
      setShowButtons(true)
    }, 3000)

    // Add keyboard shortcut to reset language selection (for testing)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'R') {
        localStorage.removeItem('selectedLanguage')
        window.location.reload()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [])

  const handleLanguageSelect = (language: 'en' | 'ar') => {
    setSelectedLanguage(language)
    localStorage.setItem('selectedLanguage', language)
    setIsLoading(true)
  }
  
  const handleLoadingComplete = () => {
    setExitTransition(true)
    setTimeout(() => {
      setShowMainApp(true)
    }, 1500) // Wait for exit animation
  }

  // Don't render anything on server side
  if (!isClient) {
    return null
  }

  // Show main 3D application
  if (showMainApp) {
    return (
      <>
        {/* Fixed 3D Canvas Layer */}
        <div className="fixed inset-0 z-50 pointer-events-none">
          <CanvasRoot />
        </div>
        
        {/* Scrollable Content Layer */}
        <div className="relative z-0">
          {children}
        </div>
      </>
    )
  }

  // Show language selector screen
  return (
    <>
      {/* Full screen black background */}
      <div className="fixed inset-0 z-55 bg-black" />
      
      {/* 3D Canvas for particles ONLY */}
      <Canvas
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 60,
          pointerEvents: 'none'
        }}
        camera={{ 
          position: [0, 2, 25], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <LanguageSelector exitTransition={exitTransition} />
      </Canvas>

      {/* UI Layer */}
      <LanguageSelectorUI 
        onLanguageSelect={handleLanguageSelect}
        showButtons={showButtons}
        exitTransition={exitTransition}
        onLoadingComplete={handleLoadingComplete}
      />
    </>
  )
}