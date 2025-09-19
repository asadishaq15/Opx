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
    const sections = [
      { visibilityThreshold: 0.45, visibilityRange: 0.14, exitThreshold: 0.61 },
      { visibilityThreshold: 0.61, visibilityRange: 0.14, exitThreshold: 0.77 },
      { visibilityThreshold: 0.77, visibilityRange: 0.14, exitThreshold: 0.93 },
      { visibilityThreshold: 0.93, visibilityRange: 0.14, exitThreshold: 1.09 }
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
      ref.current.style.transform = `translateY(${(1 - entryProgress) * 80}px)`
      ref.current.style.backdropFilter = `blur(${entryProgress * 6}px)`
    })
  }, [progress])

  if (progress < 0.43) return null

  return (
    <>
      {/* Section 1 - Right aligned */}
      <div
        ref={sectionRefs.current[0]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.4,0,.2,1)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2/3 md:w-1/2 lg:w-2/5">
            <div
              className="h-full w-full bg-cover bg-right bg-no-repeat"
              style={{ backgroundImage: "url('/images/hero-palm.png')", transform: 'translateZ(0)', filter: 'saturate(0.95) contrast(0.92)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/40" />
        </div>
        <div className="relative h-full flex items-center pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-end">
            <div className="pr-12 lg:pr-24">
              <h1 className="font-serif text-[4.6rem] sm:text-[5.6rem] md:text-[5.5rem] lg:text-[5.5rem] xl:text-[5.5rem] leading-[0.92] text-white tracking-tight">
                <span className="block">A Diversified</span>
                <span className="block">Holding</span>
                <span className="block">Company</span>
              </h1>
              <div className="mt-8 w-full max-w-xs md:max-w-sm">
                <div className="bg-black/35 backdrop-blur-sm rounded-md p-5 text-gray-100 text-sm md:text-base leading-relaxed">
                  The main trunk of the tree supports a complex of branches which are represented by a variety of businesses.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Section 2 - Left aligned */}
      <div
        ref={sectionRefs.current[1]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.4,0,.2,1)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-2/3 md:w-1/2 lg:w-2/5">
            <div
              className="h-full w-full bg-cover bg-left bg-no-repeat"
              style={{ backgroundImage: "url('/images/falcon-bg.png')", transform: 'translateZ(0)', filter: 'saturate(0.95) contrast(0.92)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/10 to-black/40" />
        </div>
        <div className="relative h-full flex items-center pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-start">
            <div className="pl-12 lg:pl-24">
              <h1 className="font-serif text-[4.6rem] sm:text-[5.6rem] md:text-[5.5rem] lg:text-[5.5rem] xl:text-[5.5rem] leading-[0.92] text-white tracking-tight">
                <span className="block">Global</span>
                <span className="block">Investment</span>
                <span className="block">Strategies</span>
              </h1>
              <div className="mt-8 w-full max-w-xs md:max-w-sm">
                <div className="bg-black/35 backdrop-blur-sm rounded-md p-5 text-gray-100 text-sm md:text-base leading-relaxed">
                  Our investment approach spans international markets, focusing on emerging technologies and sustainable infrastructure development.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Section 3 - Right aligned */}
      <div
        ref={sectionRefs.current[2]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.4,0,.2,1)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-2/3 md:w-1/2 lg:w-2/5">
            <div
              className="h-full w-full bg-cover bg-right bg-no-repeat"
              style={{ backgroundImage: "url('/images/cityscape.png')", transform: 'translateZ(0)', filter: 'saturate(0.95) contrast(0.92)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/40" />
        </div>
        <div className="relative h-full flex items-center pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-end">
            <div className="pr-12 lg:pr-24">
              <h1 className="font-serif text-[4.6rem] sm:text-[5.6rem] md:text-[5.5rem] lg:text-[5.5rem] xl:text-[5.5rem] leading-[0.92] text-white tracking-tight">
                <span className="block">Innovation</span>
                <span className="block">Through</span>
                <span className="block">Collaboration</span>
              </h1>
              <div className="mt-8 w-full max-w-xs md:max-w-sm">
                <div className="bg-black/35 backdrop-blur-sm rounded-md p-5 text-gray-100 text-sm md:text-base leading-relaxed">
                  Partnering with visionary entrepreneurs and industry pioneers to build solutions that shape tomorrow's business landscape.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Section 4 - Left aligned */}
      <div
        ref={sectionRefs.current[3]}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ opacity: 0, transition: 'opacity 0.7s ease, transform 0.7s cubic-bezier(.4,0,.2,1)' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-0 bottom-0 h-full w-full">
            <div
              className="h-full w-full bg-cover bg-bottom bg-no-repeat"
              style={{ backgroundImage: "url('/images/tech-future.png')", transform: 'translateZ(0)', filter: 'saturate(0.95) contrast(0.92)' }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        </div>
        <div className="relative h-full flex flex-col justify-end pb-24 pointer-events-auto">
          <div className="w-full max-w-6xl mx-auto px-8 flex justify-start">
            <div className="pl-12 lg:pl-24 max-w-xl">
              <h1 className="font-serif text-[4.6rem] sm:text-[5.6rem] md:text-[5.5rem] lg:text-[5.5rem] xl:text-[5.5rem] leading-[0.92] text-white tracking-tight">
                <span className="block">Building The</span>
                <span className="block">Future</span>
                <span className="block">Together</span>
              </h1>
              <div className="mt-8 w-full">
                <div className="bg-black/35 backdrop-blur-sm rounded-md p-5 text-gray-100 text-sm md:text-base leading-relaxed">
                  Join us in our mission to create a more connected, sustainable, and prosperous world through strategic investments and partnerships.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}