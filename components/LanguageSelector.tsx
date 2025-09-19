'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'
import Image from 'next/image'
import { useGLTF } from '@react-three/drei'

interface LanguageSelectorProps {
  onLanguageSelect: (language: 'en' | 'ar') => void
  exitTransition: boolean
}

interface LoadingState {
  isLoading: boolean
  loadingProgress: number
  selectedLanguage: 'en' | 'ar' | null
  finalZoom: boolean
}

// Enable Three.js cache for better performance
THREE.Cache.enabled = true


// Separate component for 3D particles only
function LanguageSelectorParticles({ exitTransition }: { exitTransition: boolean }) {
  const particlesRef = useRef<THREE.Points>(null)
  const groupRef = useRef<THREE.Group>(null)
  const prefersReducedMotion = useReducedMotion()
  const exitStartTime = useRef<number>(0)
  
  // Create particle positions for PlayStation-style 3D wave
  const particleData = useMemo(() => {
    const positions: number[] = []
    const phases: number[] = []
    
    // Create a grid of particles for the wave effect
    const gridWidth = 60  // particles across
    const gridHeight = 40 // particles deep
    const spacing = 0.8   // space between particles
    
    for (let x = 0; x < gridWidth; x++) {
      for (let z = 0; z < gridHeight; z++) {
        // Center the grid
        const xPos = (x - gridWidth / 2) * spacing
        const zPos = (z - gridHeight / 2) * spacing
        
        // Initial Y position will be animated
        const yPos = 0
        
        positions.push(xPos, yPos, zPos)
        
        // Phase for wave calculation based on position
        phases.push((x * 0.2) + (z * 0.15))
      }
    }

    return {
      positions: new Float32Array(positions),
      phases: new Float32Array(phases),
      gridWidth,
      gridHeight
    }
  }, [])

  const originalPositions = useMemo(() => {
    return new Float32Array(particleData.positions)
  }, [particleData.positions])

  useFrame((state) => {
    if (!particlesRef.current || !groupRef.current) return
    
    const time = state.clock.elapsedTime
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
    const material = particlesRef.current.material as THREE.PointsMaterial

    // Track exit start time
    if (exitTransition && exitStartTime.current === 0) {
      exitStartTime.current = time
    }

    // Smooth entrance transition (3 seconds)
    const entranceProgress = Math.min(1, time / 3)
    const entranceEase = 1 - Math.pow(1 - entranceProgress, 3) // Smooth ease out

    // Exit transition
    let exitProgress = 0
    if (exitTransition && exitStartTime.current > 0) {
      const exitElapsed = time - exitStartTime.current
      exitProgress = Math.min(1, exitElapsed / 1.5) // 1.5 second exit
      const exitEase = Math.pow(exitProgress, 2) // Smooth ease in
      material.opacity = (1 - exitEase) * 0.8
    } else {
      material.opacity = entranceEase * 0.8
    }

    // PlayStation-style 3D wave animation
    for (let i = 0; i < positions.length; i += 3) {
      const particleIndex = i / 3
      const originalX = originalPositions[i]
      const originalZ = originalPositions[i + 2]
      
      const phase = particleData.phases[particleIndex]
      
      // Create multiple sine waves for complex motion (PlayStation style)
      const waveSpeed = 0.4 // Slow, smooth movement
      const wave1 = Math.sin(time * waveSpeed + phase) * 3
      const wave2 = Math.sin(time * waveSpeed * 0.7 + phase * 1.3 + Math.PI * 0.5) * 2
      const wave3 = Math.cos(time * waveSpeed * 0.5 + phase * 0.8) * 1.5
      
      // Combine waves for rich 3D motion
      const yPos = wave1 + wave2 + wave3
      
      // Apply entrance/exit transitions
      if (exitTransition) {
        const exitEase = Math.pow(exitProgress, 2)
        positions[i] = originalX * (1 - exitEase) // Collapse to center X
        positions[i + 1] = yPos * (1 - exitEase) // Fade wave motion
        positions[i + 2] = originalZ * (1 - exitEase) // Collapse to center Z
      } else {
        positions[i] = originalX * entranceEase // Expand from center X
        positions[i + 1] = yPos * entranceEase // Grow wave motion
        positions[i + 2] = originalZ * entranceEase // Expand from center Z
      }
    }

    // Gentle rotation for 3D effect
    if (!prefersReducedMotion && !exitTransition) {
      groupRef.current.rotation.y = time * 0.02
      groupRef.current.rotation.x = Math.sin(time * 0.01) * 0.1
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group ref={groupRef}>
      {/* Soft ambient lighting for depth */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 10]} intensity={0.3} />
      
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleData.positions.length / 3}
            array={particleData.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          color="#888888"
          transparent={true}
          opacity={0}
          sizeAttenuation={true}
          vertexColors={false}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          map={new THREE.TextureLoader().load('data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><circle cx="32" cy="32" r="30" fill="white"/></svg>'))}
        />
      </points>
    </group>
  )
}

// Main component that only renders particles (for use in Canvas)
export default function LanguageSelector({ exitTransition = false }: { exitTransition?: boolean }) {
  return <LanguageSelectorParticles exitTransition={exitTransition} />
}

// UI Component for buttons (to be used outside Canvas)
export function LanguageSelectorUI({ 
  onLanguageSelect, 
  showButtons,
  exitTransition,
  loadingState,
  onLoadingComplete 
}: { 
  onLanguageSelect: (language: 'en' | 'ar') => void
  showButtons: boolean
  exitTransition: boolean
  loadingState?: LoadingState
  onLoadingComplete?: () => void
}) {
  const [localLoadingState, setLocalLoadingState] = useState<LoadingState>({
    isLoading: false,
    loadingProgress: 0,
    selectedLanguage: null,
    finalZoom: false
  })
  
  const currentLoadingState = loadingState || localLoadingState
  
  
  const handleLanguageSelect = (language: 'en' | 'ar') => {
    if (currentLoadingState.isLoading) return
    
    setLocalLoadingState(prev => ({
      ...prev,
      isLoading: true,
      selectedLanguage: language,
      loadingProgress: 0
    }))
    
    onLanguageSelect(language)
  }
  
  // Simple loading completion logic
  useEffect(() => {
    if (currentLoadingState.isLoading && !loadingState) {
      // Wait 2 seconds then complete (simulating loading time)
      const timer = setTimeout(() => {
        setLocalLoadingState(prev => ({ 
          ...prev, 
          loadingProgress: 100
        }))
        onLoadingComplete?.()
      }, 2000)
      
      // Update progress gradually
      const progressTimer = setInterval(() => {
        setLocalLoadingState(prev => {
          if (prev.loadingProgress >= 100) return prev
          return {
            ...prev,
            loadingProgress: Math.min(prev.loadingProgress + 5, 95)
          }
        })
      }, 100)
      
      return () => {
        clearTimeout(timer)
        clearInterval(progressTimer)
      }
    }
  }, [currentLoadingState.isLoading, loadingState, onLoadingComplete])
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-32">
      <div 
        className={`transition-all duration-1000 ease-out ${
          showButtons && !exitTransition && !currentLoadingState.isLoading
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <div className={`flex flex-col sm:flex-row gap-3 items-center justify-center transition-all duration-500 ${
          currentLoadingState.isLoading ? 'mt-8' : 'mt-24'
        }`}>
          <button
            onClick={() => handleLanguageSelect('en')}
            disabled={currentLoadingState.isLoading}
            className={`group relative px-6 py-3 bg-transparent border-2 rounded-lg transition-all duration-300 min-w-[100px] ${
              currentLoadingState.isLoading 
                ? 'border-gray-700 opacity-50 cursor-not-allowed' 
                : 'border-gray-600 hover:border-white hover:bg-white/5 hover:scale-105 active:scale-95'
            } ${currentLoadingState.selectedLanguage === 'en' ? 'border-blue-500 bg-blue-500/10' : ''}`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-white mb-1 group-hover:text-white">
                English
              </div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300">
                Continue in English
              </div>
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </button>

          <button
            onClick={() => handleLanguageSelect('ar')}
            disabled={currentLoadingState.isLoading}
            className={`group relative px-6 py-3 bg-transparent border-2 rounded-lg transition-all duration-300 min-w-[100px] ${
              currentLoadingState.isLoading 
                ? 'border-gray-700 opacity-50 cursor-not-allowed' 
                : 'border-gray-600 hover:border-white hover:bg-white/5 hover:scale-105 active:scale-95'
            } ${currentLoadingState.selectedLanguage === 'ar' ? 'border-green-500 bg-green-500/10' : ''}`}
          >
            <div className="text-center">
              <div className="text-lg font-semibold text-white mb-1 group-hover:text-white" dir="rtl">
                العربية
              </div>
              <div className="text-xs text-gray-400 group-hover:text-gray-300" dir="rtl">
                متابعة بالعربية
              </div>
            </div>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-500/20 to-teal-500/20 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
          </button>
        </div>
      </div>

      {/* Top center animated image - positioned relative to full screen */}
      <div className={`fixed left-1/2 transform -translate-x-1/2 z-40 transition-all duration-500 ${
        currentLoadingState.isLoading ? 'top-1/2 -translate-y-1/2' : 'top-16'
      }`}>
        <div className="relative w-24 h-24">
          {/* Spinning O logo */}
          <div className="animate-spin" style={{ animationDuration: '8s' }}>
            <Image
              src="/assets/O.png"
              alt="Loading"
              width={96}
              height={96}
              className="filter drop-shadow-2xl"
              style={{
                filter: 'brightness(0) saturate(100%) invert(53%) sepia(8%) saturate(19%) hue-rotate(314deg) brightness(96%) contrast(93%)'
              }}
            />
          </div>
          
          {/* Pulsing background effect */}
          <div className="absolute inset-0 animate-ping opacity-30">
            <Image
              src="/assets/O.png"
              alt="Loading pulse"
              width={96}
              height={96}
              className="filter drop-shadow-2xl"
              style={{
                filter: 'brightness(0) saturate(100%) invert(53%) sepia(8%) saturate(19%) hue-rotate(314deg) brightness(96%) contrast(93%)'
              }}
            />
          </div>
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-400/30 to-transparent transform -translate-x-full animate-shimmer"></div>
          </div>
        </div>
      </div>

      {/* Exit transition overlay */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-1500 ease-in-out pointer-events-none ${
          exitTransition ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  )
}