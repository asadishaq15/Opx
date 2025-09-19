'use client'

import React, { useEffect, useRef, useState, useCallback } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

interface PulseWave {
  position: number
  active: boolean
  time: number
}

interface ParticleUserData {
  originalAngle: number
  originalRadius: number
  originalHeight: number
  originalX: number
  originalY: number
  bottomY: number
  distanceFromCenter: number
  speed: number
  floatSpeed: number
  phase: number
  amplitude: number
  maxOpacity: number
  originalSize: number
  bubblePhase: number
  lightIntensity: number
}

const LogoParticleAnimation: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const logoGroupRef = useRef<THREE.Group | null>(null)
  const particlesRef = useRef<THREE.Group & { isResetting?: boolean } | null>(null)
  const scrollProgressRef = useRef(0)
  const animationIdRef = useRef<number | null>(null)
  const isInitializedRef = useRef(false)
  const pulseWaveRef = useRef<PulseWave>({ position: 0, active: false, time: 0 })

  const particleCount = 2500
  const particlePoolRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>[]>([])
  const activeParticlesRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>[]>([])

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const logoSectionHeight = window.innerHeight * 4
    
    let rawProgress = scrollTop / Math.max(logoSectionHeight, 1)
    let scrollProgress = Math.min(rawProgress, 1)
    
    if (scrollProgress < 1) {
      scrollProgress = scrollProgress * scrollProgress * (3 - 2 * scrollProgress)
    }

    if (scrollProgress >= 0.99) {
      if (!particlesRef.current?.isResetting) {
        if (particlesRef.current) {
          particlesRef.current.isResetting = true
        }
        setTimeout(() => {
          pulseWaveRef.current = { position: 0, active: false, time: 0 }

          if (particlesRef.current) {
            particlesRef.current.children.forEach((particle) => {
              const mesh = particle as THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>
              if (mesh.material) {
                mesh.material.opacity = 0
                mesh.material.emissive = new THREE.Color(0x000000)
                mesh.material.emissiveIntensity = 0
              }
              const userData = mesh.userData as ParticleUserData
              if (userData) {
                mesh.position.x = userData.originalX
                mesh.position.y = userData.bottomY || userData.originalY - 15
                mesh.position.z = userData.originalHeight
                mesh.scale.setScalar(1)
                userData.bubblePhase = 0
                userData.lightIntensity = 0
              }
            })
          }

          if (logoGroupRef.current) {
            logoGroupRef.current.rotation.y = 0
          }

          scrollProgressRef.current = 0
          if (particlesRef.current) {
            particlesRef.current.isResetting = false
          }
        }, 150)
      }
    } else {
      if (particlesRef.current) {
        particlesRef.current.isResetting = false
      }
      scrollProgressRef.current = scrollProgress
    }
  }, [])

  const handleMouseMove = useCallback((event: MouseEvent) => {
    setMousePos({
      x: event.clientX,
      y: event.clientY,
    })
  }, [])

  useEffect(() => {
    if (!mountRef.current || isInitializedRef.current) return

    const existingCanvas = mountRef.current.querySelector("canvas")
    if (existingCanvas) {
      existingCanvas.remove()
    }

    isInitializedRef.current = true

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement)
    }
    sceneRef.current = scene
    rendererRef.current = renderer

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 10, 5)
    scene.add(directionalLight)

    const pointLight1 = new THREE.PointLight(0x64ffda, 1, 100)
    pointLight1.position.set(0, 0, 20)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xffffff, 0.5, 50)
    pointLight2.position.set(-10, 10, 10)
    scene.add(pointLight2)

    // Logo creation
    const logoGroup = new THREE.Group()
    let logoModel: THREE.Object3D | null = null

    const createFallbackLogo = () => {
      const fallbackGeometry = new THREE.BoxGeometry(20, 20, 20)
      const fallbackMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x888888,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
        transmission: 0.3,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
        emissive: new THREE.Color(0x888888),
        emissiveIntensity: 0.3,
      })
      const fallbackMesh = new THREE.Mesh(fallbackGeometry, fallbackMaterial)
      fallbackMesh.position.set(0, 0, 0)
      logoGroup.add(fallbackMesh)
      logoModel = fallbackMesh
      return fallbackMesh
    }

    createFallbackLogo()

    const loadActualLogo = async () => {
      try {
        const loader = new GLTFLoader()
        
        loader.load(
          "/models/O.glb",
          (gltf) => {
            if (logoModel && logoGroup.children.includes(logoModel)) {
              logoGroup.remove(logoModel)
              if ((logoModel as THREE.Mesh).geometry) {
                ((logoModel as THREE.Mesh).geometry as THREE.BufferGeometry).dispose()
              }
              if ((logoModel as THREE.Mesh).material) {
                const material = (logoModel as THREE.Mesh).material
                if (Array.isArray(material)) {
                  material.forEach(m => m.dispose())
                } else {
                  (material as THREE.Material).dispose()
                }
              }
            }

            logoModel = gltf.scene
            logoModel.scale.setScalar(120)

            const box = new THREE.Box3().setFromObject(logoModel)
            const center = box.getCenter(new THREE.Vector3())
            logoModel.position.sub(center)
            logoModel.position.set(0, 0, 0)

            logoModel.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh
                mesh.material = new THREE.MeshPhysicalMaterial({
                  color: 0x888888,
                  emissive: new THREE.Color(0x888888),
                  metalness: 0.1,
                  roughness: 0.1,
                  transparent: true,
                  opacity: 0.9,
                  transmission: 0.3,
                  ior: 1.5,
                  clearcoat: 1,
                  clearcoatRoughness: 0,
                  emissiveIntensity: 0.3,
                })
              }
            })

            logoGroup.add(logoModel)
          },
          undefined,
          (error: unknown) => {
            console.log("Using fallback logo:", error instanceof Error ? error.message : 'Unknown error')
          }
        )
      } catch (error) {
        console.log("GLTFLoader not available, using fallback")
      }
    }

    loadActualLogo()

    logoGroup.position.set(0, 0, 0)
    scene.add(logoGroup)
    logoGroupRef.current = logoGroup

    // Particle system
    const particles = new THREE.Group()
    const particleSizes = [0.03, 0.05, 0.08, 0.12, 0.18, 0.25]
    const sharedGeometries = particleSizes.map(
      (size) => new THREE.SphereGeometry(size, 16, 16)
    )

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      const sizeIndex = Math.floor(Math.random() * sharedGeometries.length)

      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x888888),
        emissive: new THREE.Color(0x888888),
        metalness: 0,
        roughness: 0,
        transparent: true,
        opacity: 0.5,
        transmission: 0.95,
        ior: 1.5,
        thickness: 0.5,
        clearcoat: 1,
        clearcoatRoughness: 0,
        emissiveIntensity: 0,
        reflectivity: 0.9,
      })

      const particle = new THREE.Mesh(
        sharedGeometries[sizeIndex],
        glassMaterial
      )

      const angle = Math.random() * Math.PI * 2
      const radius = 0.5 + Math.random() * 25
      const height = (Math.random() - 0.5) * 20
      const clusterVariation = Math.random() * 8

      particle.position.x =
        Math.cos(angle) * radius + (Math.random() - 0.5) * clusterVariation
      particle.position.y =
        Math.sin(angle) * radius + (Math.random() - 0.5) * clusterVariation
      particle.position.z = height

      const bottomY = particle.position.y - 15
      const distanceFromCenter = Math.sqrt(
        particle.position.x * particle.position.x +
          particle.position.y * particle.position.y
      )

      const userData: ParticleUserData = {
        originalAngle: angle,
        originalRadius: radius,
        originalHeight: height,
        originalX: particle.position.x,
        originalY: particle.position.y,
        bottomY: bottomY,
        distanceFromCenter: distanceFromCenter,
        speed: 0.02 + Math.random() * 0.08,
        floatSpeed: 0.05 + Math.random() * 0.15,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.1 + Math.random() * 0.2,
        maxOpacity: 0.8 + Math.random() * 0.2,
        originalSize: particleSizes[sizeIndex],
        bubblePhase: 0,
        lightIntensity: 0,
      }

      particle.userData = userData
      particle.position.y = bottomY
      particles.add(particle)
    }

    scene.add(particles)
    particlesRef.current = particles as THREE.Group & { isResetting?: boolean }

    camera.position.z = 80

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate)
      
      const scrollProgress = scrollProgressRef.current
      const time = Date.now() * 0.001

      // Animate particles based on scroll
      if (particlesRef.current) {
        particlesRef.current.children.forEach((child) => {
          const particle = child as THREE.Mesh<THREE.SphereGeometry, THREE.MeshPhysicalMaterial>
          const userData = particle.userData as ParticleUserData
          
          if (userData && particle.material) {
            const targetY = userData.originalY * (1 - scrollProgress) + userData.bottomY * scrollProgress
            const targetOpacity = userData.maxOpacity * scrollProgress
            
            particle.position.y += (targetY - particle.position.y) * 0.05
            particle.material.opacity += (targetOpacity - particle.material.opacity) * 0.05
            
            // Floating animation
            const floatOffset = Math.sin(time * userData.floatSpeed + userData.phase) * userData.amplitude
            particle.position.z = userData.originalHeight + floatOffset
            
            // Emissive glow based on scroll
            particle.material.emissiveIntensity = scrollProgress * 0.5
          }
        })
      }

      // Rotate logo
      if (logoGroupRef.current) {
        logoGroupRef.current.rotation.y = scrollProgress * Math.PI * 2
      }

      renderer.render(scene, camera)
    }

    animate()

    // Event listeners
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
      }
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
      
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      
      if (renderer && mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement)
      }
      
      // Cleanup Three.js resources
      scene?.clear()
      renderer?.dispose()
    }
  }, [handleScroll, handleMouseMove])

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 z-10 pointer-events-none"
      style={{ background: 'transparent' }}
    />
  )
}

export default LogoParticleAnimation