'use client'

import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useScrollStore, useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

/**
 * Optimized 3D Glass Logo Component
 * Features continuous rotation with scroll-velocity sync and pointer interactions
 * Performance optimizations: reduced geometry complexity, optimized materials, efficient updates
 */
export default function LogoGlass() {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const modelGroupRef = useRef<THREE.Group>(null)
  const { velocity, progress } = useScrollStore()
  const { viewport } = useThree()
  const prefersReducedMotion = useReducedMotion()
  
  // Attempt to load logo model with fallback
  let logoGeometry = null
  let logoMeshes: THREE.Mesh[] = []
  
  try {
    const logoModel = useGLTF('/models/O.glb', true)
    
    if (logoModel?.scene) {
      logoGeometry = logoModel.scene
      
      // Extract meshes and optimize them
      logoGeometry.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const clonedMesh = child.clone()
          clonedMesh.geometry = child.geometry.clone()
          logoMeshes.push(clonedMesh)
        }
      })
    }
  } catch (error) {
    console.warn('Logo model not found, using fallback geometry:', error)
    logoGeometry = null
    logoMeshes = []
  }

  // Optimized pointer tracking
  const pointerRef = useRef({ x: 0, y: 0 })
  const lastUpdateTime = useRef(0)
  const updateThrottle = 1000 / 60 // 60 FPS throttling
  
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    const now = performance.now()
    
    // Throttle updates for performance
    if (now - lastUpdateTime.current < updateThrottle) return
    lastUpdateTime.current = now
    
    const targetMesh = logoGeometry ? modelGroupRef.current : meshRef.current
    if (!targetMesh) return
    
    // Optimized rotation calculation
    const maxYRotation = Math.PI * 2
    const initialRotation = -Math.PI / 2
    targetMesh.rotation.y = initialRotation + (progress * maxYRotation)
    
    // Reset other rotations for performance
    targetMesh.rotation.x = 0
    targetMesh.rotation.z = 0
    
    // Throttled pointer interaction
    if (!prefersReducedMotion && (now % 100 < 16)) { // Update every ~100ms
      const targetRotationZ = pointerRef.current.x * 0.05 // Reduced effect
      const targetTiltX = 0
      
      groupRef.current.rotation.z += (targetRotationZ - groupRef.current.rotation.z) * 0.08
      groupRef.current.rotation.x += (targetTiltX - groupRef.current.rotation.x) * 0.08
    }
  })
  
  // Optimized pointer movement handler
  const handlePointerMove = (event: THREE.Event) => {
    if (prefersReducedMotion) return
    
    const { clientX, clientY } = event as any
    const rect = (event.target as any)?.getBoundingClientRect?.() || { 
      left: 0, top: 0, width: window.innerWidth, height: window.innerHeight 
    }
    
    pointerRef.current = {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1,
    }
  }
  
  // Optimized positioning
  const logoScale = 2.5
  const logoPosition: [number, number, number] = [0, 0, 0]

  return (
    <Float
      speed={prefersReducedMotion ? 0 : 1}
      rotationIntensity={prefersReducedMotion ? 0 : 0.08} // Reduced intensity
      floatIntensity={prefersReducedMotion ? 0 : 0.2} // Reduced intensity
    >
      <group 
        ref={groupRef}
        position={logoPosition}
        scale={logoScale}
        onPointerMove={handlePointerMove}
      >
        {logoGeometry && logoMeshes.length > 0 ? (
          <group ref={modelGroupRef}>
            {logoMeshes.map((originalMesh, index) => (
              <mesh
                key={index}
                geometry={originalMesh.geometry}
                position={originalMesh.position}
                rotation={originalMesh.rotation}
                scale={originalMesh.scale}
                castShadow
                receiveShadow
              >
                {/* Performance-optimized transmission material */}
                <MeshTransmissionMaterial
                  transmission={0.92}
                  thickness={1.2}
                  roughness={0.1}
                  ior={1.45}
                  chromaticAberration={0.1}
                  backside={true}
                  backsideThickness={0.8}
                  resolution={512} // Further reduced for performance
                  distortion={0.15}
                  distortionScale={0.2}
                  temporalDistortion={0.05}
                  color="#00F0FF"
                  transparent={true}
                  opacity={0.88}
                  clearcoat={0.6}
                  clearcoatRoughness={0.2}
                  attenuationDistance={1.0}
                  attenuationColor="#ffffff"
                />
              </mesh>
            ))}
          </group>
        ) : (
          <mesh ref={meshRef} castShadow receiveShadow>
            {/* Simplified geometry for fallback */}
            <torusKnotGeometry args={[0.8, 0.3, 48, 12]} />
            <MeshTransmissionMaterial
              transmission={0.92}
              thickness={1.2}
              roughness={0.1}
              ior={1.45}
              chromaticAberration={0.1}
              backside={true}
              backsideThickness={0.8}
              resolution={512}
              distortion={0.15}
              distortionScale={0.2}
              temporalDistortion={0.05}
              color="#00F0FF"
              transparent={true}
              opacity={0.88}
              clearcoat={0.6}
              clearcoatRoughness={0.2}
              attenuationDistance={1.0}
              attenuationColor="#ffffff"
            />
          </mesh>
        )}
      </group>
    </Float>
  )
}

// Preload the model
useGLTF.preload('/models/O.glb')
