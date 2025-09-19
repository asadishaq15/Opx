'use client'

import React, { useState, useEffect, useRef } from "react"

interface Tab {
  title: string
  description: string
}

interface TabSliderProps {
  tabs: Tab[]
  interval?: number
}

const TabSlider: React.FC<TabSliderProps> = ({ tabs, interval = 4000 }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [progress, setProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setActiveTab((prev) => (prev + 1) % tabs.length)
          setIsTransitioning(false)
          setProgress(0)
        }, 200)
      }, interval)
    }

    startInterval()

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + 100 / (interval / 50)
      })
    }, 50)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      clearInterval(progressInterval)
    }
  }, [tabs.length, interval])

  const switchToTab = (index: number) => {
    if (index === activeTab || isTransitioning) return

    setIsTransitioning(true)
    setProgress(0)

    setTimeout(() => {
      setActiveTab(index)
      setIsTransitioning(false)
    }, 200)

    if (intervalRef.current) clearInterval(intervalRef.current)
    setTimeout(() => {
      intervalRef.current = setInterval(() => {
        setIsTransitioning(true)
        setTimeout(() => {
          setActiveTab((prev) => (prev + 1) % tabs.length)
          setIsTransitioning(false)
          setProgress(0)
        }, 200)
      }, interval)
    }, 100)
  }

  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl max-w-xs sm:max-w-lg lg:max-w-2xl mx-auto">
      <div className="relative min-h-[80px] sm:min-h-[100px] lg:min-h-[120px]">
        <div
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            isTransitioning
              ? "opacity-0 translate-y-6 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          }`}
        >
          <div className="text-center">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 lg:mb-4 text-white bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              {tabs[activeTab]?.title}
            </h3>
            <p className="text-white/80 leading-relaxed text-xs sm:text-sm lg:text-base">
              {tabs[activeTab]?.description}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-1 sm:space-x-2 mt-4 sm:mt-6">
        {tabs.map((_, index) => (
          <button
            key={index}
            onClick={() => switchToTab(index)}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-400 ${
              index === activeTab
                ? "bg-white scale-125 shadow-lg shadow-white/30"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

interface Section {
  title: string
  description: string | React.ReactNode
  hasSlider?: boolean
  tabsData?: Tab[]
}

const Parallax3DLayout: React.FC = () => {
  const [scrollY, setScrollY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY
          const logoSectionHeight = window.innerHeight * 4
          const parallaxScrollY = Math.max(0, scrollTop - logoSectionHeight)
          setScrollY(parallaxScrollY)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const sections: Section[] = [
    {
      title: "Welcome to OPX",
      description: "Innovative solutions for modern challenges.",
      hasSlider: true,
      tabsData: [
        {
          title: "Vision",
          description: "Our vision is to transform the digital landscape through innovative technology solutions."
        },
        {
          title: "Mission",
          description: "We create cutting-edge applications that deliver exceptional user experiences."
        },
        {
          title: "Values",
          description: "Innovation, excellence, and customer satisfaction drive everything we do."
        }
      ]
    },
    {
      title: "Our Services",
      description: "Comprehensive solutions tailored to your needs.",
      hasSlider: true,
      tabsData: [
        {
          title: "Web Development",
          description: "Modern, responsive websites built with the latest technologies."
        },
        {
          title: "Mobile Apps",
          description: "Native and cross-platform mobile applications for iOS and Android."
        },
        {
          title: "3D Experiences",
          description: "Immersive 3D web experiences using Three.js and WebGL."
        }
      ]
    },
    {
      title: "Our Portfolio",
      description: "Showcasing our best work and achievements.",
      hasSlider: true,
      tabsData: [
        {
          title: "Enterprise Solutions",
          description: "Large-scale applications serving millions of users worldwide."
        },
        {
          title: "Creative Projects",
          description: "Artistic and interactive digital experiences that inspire."
        },
        {
          title: "Startups",
          description: "Helping emerging companies build their digital presence."
        }
      ]
    },
    {
      title: "Contact Us",
      description: "Ready to start your project? Let's work together.",
      hasSlider: false
    }
  ]

  const titles = ["Home", "Services", "Portfolio", "Contact"]
  const sectionHeight = typeof window !== 'undefined' ? window.innerHeight * 3 : 3000
  const totalHeight = sectionHeight * sections.length

  const getProgress = (sectionIndex: number): number => {
    const sectionStart = sectionIndex * sectionHeight
    const sectionEnd = sectionStart + sectionHeight
    
    if (scrollY < sectionStart) return 0
    if (scrollY > sectionEnd) return 1
    
    return (scrollY - sectionStart) / sectionHeight
  }

  const getCurrentSection = (): number => {
    return Math.floor(scrollY / sectionHeight)
  }

  const smoothScrollTo = (targetY: number) => {
    const startY = window.pageYOffset
    const distance = targetY - startY
    const duration = Math.min(Math.abs(distance) / 2, 1000)
    let start: number | null = null

    const step = (timestamp: number) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : (progress - 1) * (2 * progress - 2) * (2 * progress - 2) + 1

      window.scrollTo(0, startY + distance * easeInOutCubic)
      
      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }

  const navigateToSection = (index: number) => {
    const logoSectionHeight = window.innerHeight * 4
    const targetY = logoSectionHeight + index * sectionHeight + sectionHeight * 0.1
    smoothScrollTo(targetY)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: totalHeight }}
      id="layer2"
    >
      {/* Navigation */}
      <div className="fixed top-20 left-4 lg:left-8 z-50 space-y-2 lg:space-y-3">
        {titles.map((title, index) => {
          const isActive = getCurrentSection() === index
          const progress = getProgress(index)
          
          return (
            <div
              key={index}
              className={`group cursor-pointer transition-all duration-300 ${
                isMobile ? "scale-75" : ""
              }`}
              onClick={() => navigateToSection(index)}
            >
              <div
                className={`w-2 h-2 lg:w-3 lg:h-3 rounded-full transition-all duration-300 mb-1 ${
                  isActive
                    ? "bg-white scale-125 shadow-lg shadow-white/50"
                    : "bg-white/30 group-hover:bg-white/60"
                }`}
              />
              {!isMobile && (
                <span
                  className={`text-xs lg:text-sm transition-all duration-300 block ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-white/60 group-hover:text-white/85"
                  }`}
                >
                  {title}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Sections */}
      {sections.map((sec, i) => {
        const progress = getProgress(i)
        const titleOpacity = Math.min(progress / 0.2, 1)
        const titleTransform = `translateY(${(1 - titleOpacity) * 50}px)`

        const descriptionOpacity =
          progress > 0.2 ? Math.min((progress - 0.2) / 0.2, 1) : 0
        const descriptionTransform = `translateY(${
          (1 - descriptionOpacity) * 50
        }px)`

        const sliderOpacity =
          progress > 0.4 ? Math.min((progress - 0.4) / 0.3, 1) : 0
        const sliderTransform = `translateY(${
          (1 - sliderOpacity) * 50
        }px) scale(${0.95 + sliderOpacity * 0.05})`

        return (
          <div
            key={i}
            className="absolute inset-0 top-auto"
            style={{ top: i * sectionHeight }}
            id={`section-${i}`}
          >
            <div
              className="sticky top-0 h-screen flex items-center lg:px-20 justify-end bg-gradient-to-br from-black via-gray-900 to-indigo-900"
              style={{
                clipPath:
                  i % 2 === 0
                    ? "polygon(0 60px, 100% 0, 100% 100%, 0% 100%)"
                    : "polygon(0 0, 100% 60px, 100% 100%, 0% 100%)",
              }}
            >
              <div className="flex flex-col items-center justify-center w-full max-w-xl px-4 sm:px-6 lg:px-8 space-y-4 sm:space-y-6 lg:space-y-8">
                <h1
                  style={{
                    opacity: titleOpacity,
                    transform: titleTransform,
                  }}
                  className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-center transition-all duration-1000 ease-out leading-tight px-2 sm:px-0"
                >
                  {sec.title}
                </h1>

                <div
                  style={{
                    opacity: descriptionOpacity,
                    transform: descriptionTransform,
                  }}
                  className="text-white/85 text-sm sm:text-base md:text-sm lg:text-sm text-left max-w-4xl leading-relaxed transition-all duration-1000 ease-out delay-200 px-2 sm:px-4 lg:px-0"
                >
                  {typeof sec.description === "string" ? (
                    <p>{sec.description}</p>
                  ) : (
                    sec.description
                  )}
                </div>

                {sec.hasSlider && sec.tabsData && sec.tabsData.length > 0 && (
                  <div
                    style={{
                      opacity: sliderOpacity,
                      transform: sliderTransform,
                    }}
                    className="w-full transition-all duration-1000 ease-out delay-400"
                  >
                    <TabSlider tabs={sec.tabsData} interval={5000} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Parallax3DLayout