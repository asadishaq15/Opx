'use client'

import React, { useEffect, useRef, RefObject } from 'react'
import { useScrollStore } from '../lib/scroll'

export default function LiquidContentSection() {
  const { progress } = useScrollStore()
  const sectionRefs = useRef<RefObject<HTMLDivElement>[]>([
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>(),
    React.createRef<HTMLDivElement>()
  ])

  useEffect(() => {
    // Start later at 0.7 instead of 0.65
    // Increase section duration by using even smaller visibility ranges (0.075)
    // This gives more time for each section to be visible
    const sections = [
        { visibilityThreshold: 0.7, visibilityRange: 0.075, exitThreshold: 0.775 },
        { visibilityThreshold: 0.775, visibilityRange: 0.075, exitThreshold: 0.85 },
        { visibilityThreshold: 0.85, visibilityRange: 0.075, exitThreshold: 0.925 },
        // Make the last section exit earlier to make room for logo animation
        { visibilityThreshold: 0.925, visibilityRange: 0.075, exitThreshold: 0.975 }
      ]
    sectionRefs.current.forEach((ref, index) => {
      if (!ref.current) return

      const section = sections[index]
      const entryProgress = Math.max(0, Math.min(1,
        (progress - section.visibilityThreshold) / section.visibilityRange
      ))
      const exitProgress = index < sections.length - 1
        ? Math.max(0, Math.min(1,
            (progress - section.exitThreshold) / (sections[index + 1].visibilityThreshold - section.exitThreshold)
          ))
        : 0
      const opacity = entryProgress * (1 - exitProgress)

      ref.current.style.opacity = opacity.toString()
      ref.current.style.transform = `translateY(${(1 - entryProgress) * 100}px)` // Maintained at 100px for dramatic effect
      ref.current.style.backdropFilter = `blur(${entryProgress * 8}px)` // Maintained at 8px
    })
  }, [progress])

  // Only render if we're approaching the content sections
  // Changed from 0.64 to 0.69 to match our new thresholds
  if (progress < 0.69) return null

  return (
    <>
      {/* Section 1 - Right aligned image, Left aligned content */}
      <div
        ref={sectionRefs.current[0]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 1.8s ease, transform 1.8s cubic-bezier(.4,0,.2,1)' }} // Increased from 1.2s to 1.8s
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2/3 md:w-1/2 lg:w-2/5">
            <div
              className="h-full w-full bg-cover bg-right bg-no-repeat"
              style={{ backgroundImage: "url('/images/hero-palm.png')", transform: 'translateZ(0)', filter: 'saturate(1.05) contrast(1.05)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative h-full flex items-center pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-start">
            <div className="pl-12 lg:pl-24 w-full max-w-xl">
              <div className="rounded-2xl overflow-hidden" style={{
                background: 'linear-gradient(145deg, rgba(0,240,255,0.1), rgba(124,58,237,0.15))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '2.5rem'
              }}>
                <h1 className="font-serif text-[4.2rem] sm:text-[4.6rem] md:text-[5rem] lg:text-[5.4rem] leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 tracking-tight font-light">
                  <span className="block">A Diversified</span>
                  <span className="block">Holding</span>
                  <span className="block">Company</span>
                </h1>
                <div className="mt-8 w-full">
                  <div className="text-gray-50/90 text-sm md:text-base lg:text-lg leading-relaxed font-light">
                    The main trunk of the tree supports a complex of branches which are represented by a variety of businesses.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section 2 - Left aligned image, Right aligned content */}
      <div
        ref={sectionRefs.current[1]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 1.8s ease, transform 1.8s cubic-bezier(.4,0,.2,1)' }} // Increased from 1.2s to 1.8s
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-2/3 md:w-1/2 lg:w-2/5">
            <div
              className="h-full w-full bg-cover bg-left bg-no-repeat"
              style={{ backgroundImage: "url('/images/falcon-bg.png')", transform: 'translateZ(0)', filter: 'saturate(1.05) contrast(1.05)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative h-full flex items-center pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-end">
            <div className="pr-12 lg:pr-24 w-full max-w-xl">
              <div className="rounded-2xl overflow-hidden" style={{
                background: 'linear-gradient(145deg, rgba(255,28,247,0.12), rgba(26,255,163,0.08))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '2.5rem'
              }}>
                <h1 className="font-serif text-[4.2rem] sm:text-[4.6rem] md:text-[5rem] lg:text-[5.4rem] leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 tracking-tight font-light">
                  <span className="block">Global</span>
                  <span className="block">Investment</span>
                  <span className="block">Strategies</span>
                </h1>
                <div className="mt-8 w-full">
                  <div className="text-gray-50/90 text-sm md:text-base lg:text-lg leading-relaxed font-light">
                    Our investment approach spans international markets, focusing on emerging technologies and sustainable infrastructure development.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section 3 - Right aligned image, Left aligned content */}
      <div
        ref={sectionRefs.current[2]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 1.8s ease, transform 1.8s cubic-bezier(.4,0,.2,1)' }} // Increased from 1.2s to 1.8s
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2/3 md:w-1/2 lg:w-2/5">
            <div
              className="h-full w-full bg-cover bg-right bg-no-repeat"
              style={{ backgroundImage: "url('/images/cityscape.png')", transform: 'translateZ(0)', filter: 'saturate(1.05) contrast(1.05)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative h-full flex items-center pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-start">
            <div className="pl-12 lg:pl-24 w-full max-w-xl">
              <div className="rounded-2xl overflow-hidden" style={{
                background: 'linear-gradient(145deg, rgba(124,58,237,0.15), rgba(255,208,0,0.08))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '2.5rem'
              }}>
                <h1 className="font-serif text-[4.2rem] sm:text-[4.6rem] md:text-[5rem] lg:text-[5.4rem] leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 tracking-tight font-light">
                  <span className="block">Innovation</span>
                  <span className="block">Through</span>
                  <span className="block">Collaboration</span>
                </h1>
                <div className="mt-8 w-full">
                  <div className="text-gray-50/90 text-sm md:text-base lg:text-lg leading-relaxed font-light">
                    Partnering with visionary entrepreneurs and industry pioneers to build solutions that shape tomorrow's business landscape.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section 4 - Full image, Right aligned content */}
      <div
        ref={sectionRefs.current[3]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 1.8s ease, transform 1.8s cubic-bezier(.4,0,.2,1)' }} // Increased from 1.2s to 1.8s
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 bottom-0 h-full w-full">
            <div
              className="h-full w-full bg-cover bg-bottom bg-no-repeat"
              style={{ backgroundImage: "url('/images/tech-future.png')", transform: 'translateZ(0)', filter: 'saturate(1.05) contrast(1.05)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        </div>
        <div className="relative h-full flex flex-col justify-end pb-24 pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-end">
            <div className="pr-12 lg:pr-24 w-full max-w-xl">
              <div className="rounded-2xl overflow-hidden" style={{
                background: 'linear-gradient(145deg, rgba(0,240,255,0.12), rgba(255,28,247,0.08))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 0 0 1px rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '2.5rem'
              }}>
                <h1 className="font-serif text-[4.2rem] sm:text-[4.6rem] md:text-[5rem] lg:text-[5.4rem] leading-[0.9] text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-200 tracking-tight font-light">
                  <span className="block">Building The</span>
                  <span className="block">Future</span>
                  <span className="block">Together</span>
                </h1>
                <div className="mt-8 w-full">
                  <div className="text-gray-50/90 text-sm md:text-base lg:text-lg leading-relaxed font-light">
                    Join us in our mission to create a more connected, sustainable, and prosperous world through strategic investments and partnerships.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}