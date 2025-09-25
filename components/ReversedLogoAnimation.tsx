'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useScrollStore, useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

export default function ReversedLogoAnimation() {
  const groupRef = useRef<THREE.Group | null>(null)
  const oModelGroupRef = useRef<THREE.Group | null>(null)
  const pModelGroupRef = useRef<THREE.Group | null>(null)
  const xModelGroupRef = useRef<THREE.Group | null>(null)

  const { progress } = useScrollStore()
  const { viewport } = useThree()
  const prefersReducedMotion = useReducedMotion()

  // Models loaded state
  const [modelsLoaded, setModelsLoaded] = useState({ o: false, p: false, x: false })

  // Load GLTFs - reusing the same models from LogoGlass
  const { scene: oScene } = useGLTF('/models/O.glb')
  const { scene: pScene } = useGLTF('/models/P-logo.glb')
  const { scene: xScene } = useGLTF('/models/X-logo.glb')

  // Build mesh descriptor arrays using useMemo
  const oLogoMeshes = useMemo(() => {
    const out: {
      geometry: THREE.BufferGeometry
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: THREE.Vector3
      key: string
    }[] = []
    if (!oScene) return out

    oScene.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        out.push({
          geometry: child.geometry,
          position: child.position ? child.position.clone() : new THREE.Vector3(),
          rotation: child.rotation ? child.rotation.clone() : new THREE.Euler(),
          scale: child.scale ? child.scale.clone() : new THREE.Vector3(1, 1, 1),
          key: child.uuid || child.name || Math.random().toString(36).slice(2, 9),
        })
      }
    })
    return out
  }, [oScene])

  const pLogoMeshes = useMemo(() => {
    const out: {
      geometry: THREE.BufferGeometry
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: THREE.Vector3
      key: string
    }[] = []
    if (!pScene) return out

    pScene.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        out.push({
          geometry: child.geometry,
          position: child.position ? child.position.clone() : new THREE.Vector3(),
          rotation: child.rotation ? child.rotation.clone() : new THREE.Euler(),
          scale: child.scale ? child.scale.clone() : new THREE.Vector3(1, 1, 1),
          key: child.uuid || child.name || Math.random().toString(36).slice(2, 9),
        })
      }
    })
    return out
  }, [pScene])

  const xLogoMeshes = useMemo(() => {
    const out: {
      geometry: THREE.BufferGeometry
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: THREE.Vector3
      key: string
    }[] = []
    if (!xScene) return out

    xScene.traverse((child: any) => {
      if (child.isMesh && child.geometry) {
        out.push({
          geometry: child.geometry,
          position: child.position ? child.position.clone() : new THREE.Vector3(),
          rotation: child.rotation ? child.rotation.clone() : new THREE.Euler(),
          scale: child.scale ? child.scale.clone() : new THREE.Vector3(1, 1, 1),
          key: child.uuid || child.name || Math.random().toString(36).slice(2, 9),
        })
      }
    })
    return out
  }, [xScene])

  // Set modelsLoaded once when models are available
  useEffect(() => {
    setModelsLoaded({
      o: oLogoMeshes.length > 0,
      p: pLogoMeshes.length > 0,
      x: xLogoMeshes.length > 0,
    })
  }, [oLogoMeshes.length, pLogoMeshes.length, xLogoMeshes.length])

  // Pointer tracking for interactive tilt
  const pointerRef = useRef({ x: 0, y: 0 })

  // Main animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return
    
    // Only activate this component at the very end of the scroll
    // Start after the text content sections are completed (progress > 0.95)
    if (progress < 0.95) {
      // Hide all models when not active
      if (oModelGroupRef.current) oModelGroupRef.current.visible = false
      if (pModelGroupRef.current) pModelGroupRef.current.visible = false
      if (xModelGroupRef.current) xModelGroupRef.current.visible = false
      return
    }
    
    // Define thresholds for the final animation sequence
    // We have a small range (0.95 to 1.0) to work with
    const finalAnimationStart = 0.95
    const finalAnimationEnd = 1.0
    const animationRange = finalAnimationEnd - finalAnimationStart
    
    // Normalize progress for final animation (0 to 1 range)
    const finalProgress = Math.min(1, Math.max(0, (progress - finalAnimationStart) / animationRange))
    
    // Scale factor for all models
    const logoScale = 0.0025
    
    // Define animation phases
// Adjust these values to make the logo formation complete sooner
const oAppearComplete = 0.2    // O appears fully by 20% of final animation (was 0.25)
const pAppearStart = 0.2       // P starts appearing at 20% (was 0.25)
const pAppearComplete = 0.4    // P appears fully by 40% (was 0.55)
const xAppearStart = 0.4       // X starts appearing at 40% (was 0.55)
const xAppearComplete = 0.6    // X appears fully by 60% (was 0.85)
const finalRotationStart = 0.6 
    
    // Define positions
    const centerPosition = new THREE.Vector3(0, 0, 0)
    const leftEdgePosition = new THREE.Vector3(-viewport.width * 0.5 - 2, 0, 0)
    
    // Specific horizontal positions for each model in final formation
    const oHorizontalPos = -3.5
    const pHorizontalPos = -1.5
    const xHorizontalPos = 1.3
    
    // Vertical offsets for proper alignment
    const oVerticalOffset = 0.2
    const pVerticalOffset = -0.9
    const xVerticalOffset = -1.0
    
    // --- O MODEL --- (Appears first in center)
    if (oModelGroupRef.current && modelsLoaded.o) {
      oModelGroupRef.current.visible = true
      
      if (finalProgress < oAppearComplete) {
        // O appears from bottom and moves to center
        const appearProgress = Math.min(1, finalProgress / oAppearComplete)
        const easedAppearProgress = 1 - Math.pow(1 - appearProgress, 3) // Cubic ease out
        
        // Start from below and come up to center
        const startPos = new THREE.Vector3(0, -5, 0)
        const targetPos = centerPosition.clone()
        const currentPos = startPos.clone().lerp(targetPos, easedAppearProgress)
        
        oModelGroupRef.current.position.copy(currentPos)
        oModelGroupRef.current.scale.setScalar(logoScale * easedAppearProgress)
        oModelGroupRef.current.rotation.y = easedAppearProgress * Math.PI * 2 // One full rotation as it appears
        
        // Fade in
        oModelGroupRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => {
                if (!mat.transparent) mat.transparent = true
                mat.opacity = easedAppearProgress
              })
            } else {
              if (!child.material.transparent) child.material.transparent = true
              child.material.opacity = easedAppearProgress
            }
          }
        })
      } else if (finalProgress < finalRotationStart) {
        // After fully appearing, O moves to its final position
        const moveProgress = Math.min(1, (finalProgress - oAppearComplete) / (finalRotationStart - oAppearComplete))
        const easedMoveProgress = 1 - Math.pow(1 - moveProgress, 3) // Cubic ease out
        
        const startPos = centerPosition.clone()
        const targetPos = new THREE.Vector3(oHorizontalPos, oVerticalOffset, 0)
        const currentPos = startPos.clone().lerp(targetPos, easedMoveProgress)
        
        oModelGroupRef.current.position.copy(currentPos)
        oModelGroupRef.current.scale.setScalar(logoScale)
      } else {
        // Final assembly complete, maintain position
        oModelGroupRef.current.position.set(oHorizontalPos, oVerticalOffset, 0)
        oModelGroupRef.current.scale.setScalar(logoScale)
        
        // Final subtle rotation of the entire assembly
        const rotationProgress = (finalProgress - finalRotationStart) / (1 - finalRotationStart)
        const rotationAmount = rotationProgress * Math.PI * 0.2 // Subtle 36-degree rotation
        
        oModelGroupRef.current.rotation.y = rotationAmount
      }
    }
    
    // --- P MODEL --- (Appears second)
    if (pModelGroupRef.current && modelsLoaded.p) {
      if (finalProgress < pAppearStart) {
        // P is hidden before its appearance time
        pModelGroupRef.current.visible = false
      } else if (finalProgress < pAppearComplete) {
        // P appears from left edge
        pModelGroupRef.current.visible = true
        
        const appearProgress = Math.min(1, (finalProgress - pAppearStart) / (pAppearComplete - pAppearStart))
        const easedAppearProgress = 1 - Math.pow(1 - appearProgress, 3) // Cubic ease out
        
        // Start from left edge and move to position
        const startPos = leftEdgePosition.clone()
        const targetPos = new THREE.Vector3(pHorizontalPos, pVerticalOffset, 0)
        const currentPos = startPos.clone().lerp(targetPos, easedAppearProgress)
        
        pModelGroupRef.current.position.copy(currentPos)
        pModelGroupRef.current.scale.setScalar(logoScale * (0.5 + 0.5 * easedAppearProgress))
        
        // Fade in
        pModelGroupRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => {
                if (!mat.transparent) mat.transparent = true
                mat.opacity = easedAppearProgress
              })
            } else {
              if (!child.material.transparent) child.material.transparent = true
              child.material.opacity = easedAppearProgress
            }
          }
        })
      } else {
        // P in final position
        pModelGroupRef.current.visible = true
        pModelGroupRef.current.position.set(pHorizontalPos, pVerticalOffset, 0)
        pModelGroupRef.current.scale.setScalar(logoScale)
        
        // Final subtle rotation matched with O
        if (finalProgress >= finalRotationStart) {
          const rotationProgress = (finalProgress - finalRotationStart) / (1 - finalRotationStart)
          const rotationAmount = rotationProgress * Math.PI * 0.2 // Subtle 36-degree rotation
          
          pModelGroupRef.current.rotation.y = rotationAmount
        }
      }
    }
    
    // --- X MODEL --- (Appears last)
    if (xModelGroupRef.current && modelsLoaded.x) {
      if (finalProgress < xAppearStart) {
        // X is hidden before its appearance time
        xModelGroupRef.current.visible = false
      } else if (finalProgress < xAppearComplete) {
        // X appears from left edge
        xModelGroupRef.current.visible = true
        
        const appearProgress = Math.min(1, (finalProgress - xAppearStart) / (xAppearComplete - xAppearStart))
        const easedAppearProgress = 1 - Math.pow(1 - appearProgress, 3) // Cubic ease out
        
        // Start from left edge and move to position
        const startPos = leftEdgePosition.clone()
        const targetPos = new THREE.Vector3(xHorizontalPos, xVerticalOffset, 0)
        const currentPos = startPos.clone().lerp(targetPos, easedAppearProgress)
        
        xModelGroupRef.current.position.copy(currentPos)
        xModelGroupRef.current.scale.setScalar(logoScale * (0.5 + 0.5 * easedAppearProgress))
        
        // Fade in
        xModelGroupRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach((mat: THREE.Material) => {
                if (!mat.transparent) mat.transparent = true
                mat.opacity = easedAppearProgress
              })
            } else {
              if (!child.material.transparent) child.material.transparent = true
              child.material.opacity = easedAppearProgress
            }
          }
        })
      } else {
        // X in final position
        xModelGroupRef.current.visible = true
        xModelGroupRef.current.position.set(xHorizontalPos, xVerticalOffset, 0)
        xModelGroupRef.current.scale.setScalar(logoScale)
        
        // Final subtle rotation matched with O and P
        if (finalProgress >= finalRotationStart) {
          const rotationProgress = (finalProgress - finalRotationStart) / (1 - finalRotationStart)
          const rotationAmount = rotationProgress * Math.PI * 0.2 // Subtle 36-degree rotation
          
          xModelGroupRef.current.rotation.y = rotationAmount
        }
      }
    }

    // Add mouse-based tilt for interactivity
    if (!prefersReducedMotion) {
      const targetRotationZ = pointerRef.current.x * 0.1
      const targetTiltX = pointerRef.current.y * 0.05

      groupRef.current.rotation.z += (targetRotationZ - groupRef.current.rotation.z) * 0.1
      groupRef.current.rotation.x += (targetTiltX - groupRef.current.rotation.x) * 0.1
    }
  })

  // Pointer movement handler
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

  // Only render if we're near the end of the scroll
  if (progress < 0.9) return null

  return (
    <Float
      speed={prefersReducedMotion ? 0 : 1}
      rotationIntensity={prefersReducedMotion ? 0 : 0.1}
      floatIntensity={prefersReducedMotion ? 0 : 0.3}
    >
      <group
        ref={groupRef}
        onPointerMove={handlePointerMove}
        castShadow
        receiveShadow
      >
        {/* O Logo Model */}
        <group ref={oModelGroupRef}>
          {oLogoMeshes.map((m) => (
            <mesh
              key={`final-o-${m.key}`}
              geometry={m.geometry}
              position={m.position}
              rotation={m.rotation}
              scale={m.scale}
              castShadow
              receiveShadow
            >
              <MeshTransmissionMaterial
                transmission={0.95}
                thickness={1.0}
                roughness={0.0}
                ior={1.5}
                chromaticAberration={0.05}
                backside={true}
                backsideThickness={0.5}
                resolution={1024}
                samples={8}
                distortion={0.05}
                distortionScale={0.2}
                temporalDistortion={0.02}
                color="#cccccc"
                transparent={true}
                opacity={0.9}
                clearcoat={1.0}
                clearcoatRoughness={0.0}
                attenuationDistance={0.2}
                attenuationColor="#ffffff"
                anisotropy={0.1}
                anisotropyRotation={0}
                envMapIntensity={1.2}
                metalness={0.2}
                reflectivity={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* P Logo Model */}
        <group ref={pModelGroupRef}>
          {pLogoMeshes.map((m) => (
            <mesh
              key={`final-p-${m.key}`}
              geometry={m.geometry}
              position={m.position}
              rotation={m.rotation}
              scale={m.scale}
              castShadow
              receiveShadow
            >
              <MeshTransmissionMaterial
                transmission={0.95}
                thickness={1.0}
                roughness={0.0}
                ior={1.5}
                chromaticAberration={0.05}
                backside={true}
                backsideThickness={0.5}
                resolution={1024}
                samples={8}
                distortion={0.05}
                distortionScale={0.2}
                temporalDistortion={0.02}
                color="#cccccc"
                transparent={true}
                opacity={0.9}
                clearcoat={1.0}
                clearcoatRoughness={0.0}
                attenuationDistance={0.2}
                attenuationColor="#ffffff"
                anisotropy={0.1}
                anisotropyRotation={0}
                envMapIntensity={1.2}
                metalness={0.2}
                reflectivity={0.2}
              />
            </mesh>
          ))}
        </group>

        {/* X Logo Model */}
        <group ref={xModelGroupRef}>
          {xLogoMeshes.map((m) => (
            <mesh
              key={`final-x-${m.key}`}
              geometry={m.geometry}
              position={m.position}
              rotation={m.rotation}
              scale={m.scale}
              castShadow
              receiveShadow
            >
              <MeshTransmissionMaterial
                transmission={0.95}
                thickness={1.0}
                roughness={0.0}
                ior={1.5}
                chromaticAberration={0.05}
                backside={true}
                backsideThickness={0.5}
                resolution={1024}
                samples={8}
                distortion={0.05}
                distortionScale={0.2}
                temporalDistortion={0.02}
                color="#cccccc"
                transparent={true}
                opacity={0.9}
                clearcoat={1.0}
                clearcoatRoughness={0.0}
                attenuationDistance={0.2}
                attenuationColor="#ffffff"
                anisotropy={0.1}
                anisotropyRotation={0}
                envMapIntensity={1.2}
                metalness={0.2}
                reflectivity={0.2}
              />
            </mesh>
          ))}
        </group>
      </group>
    </Float>
  )
}