'use client'

import { create } from 'zustand'
import { useEffect, useState } from 'react'

/**
 * Zustand store for scroll-related state
 */
interface ScrollStore {
  velocity: number
  progress: number
  setVelocity: (velocity: number) => void
  setProgress: (progress: number) => void
}

export const useScrollStore = create<ScrollStore>((set) => ({
  velocity: 0,
  progress: 0,
  setVelocity: (velocity) => set({ velocity }),
  setProgress: (progress) => set({ progress }),
}))

/**
 * Hook to initialize GSAP ScrollTrigger and manage scroll state
 * Only runs on client side to avoid SSR issues
 */
export function useScrollTrigger() {
  const { setVelocity, setProgress } = useScrollStore()

  useEffect(() => {
    // Ensure we're on the client and window is available
    if (typeof window === 'undefined') return

    let gsap: any
    let ScrollTrigger: any

    // Dynamically import GSAP to avoid SSR issues
    const initGSAP = async () => {
      try {
        gsap = (await import('gsap')).gsap
        ScrollTrigger = (await import('gsap/ScrollTrigger')).ScrollTrigger
        
        // Register ScrollTrigger plugin
        gsap.registerPlugin(ScrollTrigger)

        // Create scroll velocity tracker
        const velocityTracker = ScrollTrigger.create({
          onUpdate: (self: any) => {
            const velocity = self.getVelocity()
            setVelocity(velocity)
          },
        })

        // Create scroll progress tracker
        const progressTracker = ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self: any) => {
            setProgress(self.progress)
          },
        })

        // Refresh ScrollTrigger after a brief delay to ensure canvas is mounted
        setTimeout(() => {
          ScrollTrigger.refresh()
        }, 100)

        return () => {
          velocityTracker.kill()
          progressTracker.kill()
        }
      } catch (error) {
        console.error('Failed to initialize GSAP:', error)
      }
    }

    const cleanup = initGSAP()

    // Handle resize events
    const handleResize = () => {
      if (ScrollTrigger) {
        ScrollTrigger.refresh()
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cleanup?.then((cleanupFn) => cleanupFn?.())
    }
  }, [setVelocity, setProgress])
}

/**
 * Utility to check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}
