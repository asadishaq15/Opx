'use client'

import { useRef, useState, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useScrollStore, useReducedMotion } from '../lib/scroll'
import * as THREE from 'three'

/**
 * 3D Glass Logo Component - OPX Models with reverse animation
 * - All models start visible in center
 * - Models move and fade to right as user scrolls
 */
export default function LogoGlass() {
  const groupRef = useRef<THREE.Group | null>(null)
  const oModelGroupRef = useRef<THREE.Group | null>(null)
  const pModelGroupRef = useRef<THREE.Group | null>(null)
  const xModelGroupRef = useRef<THREE.Group | null>(null)

  const { velocity, progress } = useScrollStore()
  const { viewport, camera } = useThree()
  const prefersReducedMotion = useReducedMotion()

  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(true)
  const transitionProgressRef = useRef(0)
  const transitionDuration = 2000 // ms

  // Models loaded state
  const [modelsLoaded, setModelsLoaded] = useState({ o: false, p: false, x: false })

  // Load GLTFs at top-level
  const oGltf = useGLTF('/models/O.glb') as any
  const pGltf = useGLTF('/models/P-logo.glb') as any
  const xGltf = useGLTF('/models/X-logo.glb') as any

  // Build mesh descriptor arrays using useMemo
  const oLogoMeshes = useMemo(() => {
    const out: {
      geometry: THREE.BufferGeometry
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: THREE.Vector3
      key: string
    }[] = []
    if (!oGltf?.scene) return out

    oGltf.scene.traverse((child: any) => {
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
  }, [oGltf])

  const pLogoMeshes = useMemo(() => {
    const out: {
      geometry: THREE.BufferGeometry
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: THREE.Vector3
      key: string
    }[] = []
    if (!pGltf?.scene) return out

    pGltf.scene.traverse((child: any) => {
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
  }, [pGltf])

  const xLogoMeshes = useMemo(() => {
    const out: {
      geometry: THREE.BufferGeometry
      position: THREE.Vector3
      rotation: THREE.Euler
      scale: THREE.Vector3
      key: string
    }[] = []
    if (!xGltf?.scene) return out

    xGltf.scene.traverse((child: any) => {
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
  }, [xGltf])

  // Set modelsLoaded once when glTFs are available
  useEffect(() => {
    setModelsLoaded({
      o: oLogoMeshes.length > 0,
      p: pLogoMeshes.length > 0,
      x: xLogoMeshes.length > 0,
    })
  }, [oLogoMeshes.length, pLogoMeshes.length, xLogoMeshes.length])

  // Pointer tracking
  const pointerRef = useRef({ x: 0, y: 0 })

  // Initial transition
  useEffect(() => {
    if (prefersReducedMotion) {
      setIsTransitioning(false)
      return
    }

    const startTime = Date.now()
    let raf = 0

    const animateTransition = () => {
      const elapsed = Date.now() - startTime
      const p = Math.min(elapsed / transitionDuration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      transitionProgressRef.current = eased

      if (p < 1) raf = requestAnimationFrame(animateTransition)
      else setIsTransitioning(false)
    }

    animateTransition()
    return () => cancelAnimationFrame(raf)
  }, [prefersReducedMotion])

  // Main animation loop
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Define scroll thresholds for model transitions
    const xExitThreshold = 0.1    // X exits first
    const xFadeOutComplete = 0.2
    const pExitThreshold = 0.2    // P exits second
    const pFadeOutComplete = 0.25  // Make P exit faster by reducing this value
    const oExitThreshold = 0.3    // O exits last
    const oFadeOutComplete = 0.4
    
    // Scale factor for all models
    const logoScale = 0.0025

    // Positions
    const centerPosition = new THREE.Vector3(0, 0.2, 0)
    const rightEdgePosition = new THREE.Vector3(viewport.width * 0.5 + 2, 0, 0)
    
    // Adjust specific vertical positions for better alignment
    const oHorizontalPos = -2.7    // O's start
    const pHorizontalPos = -0.7    // P's start (and O's mid destination)
    const xHorizontalPos = 1.3     // X's start
    
    const oVerticalOffset = 0.2
    const pVerticalOffset = -0.6
    const xVerticalOffset = -1.0
    

    if (isTransitioning) {
      const transitionProgress = transitionProgressRef.current

      // All models enter from the right and position in center
      if (oModelGroupRef.current && modelsLoaded.o) {
        const startPosition = rightEdgePosition.clone()
        const endPosition = new THREE.Vector3(oHorizontalPos, oVerticalOffset, 0)
        const currentPosition = startPosition.clone().lerp(endPosition, transitionProgress)

        oModelGroupRef.current.position.copy(currentPosition)
        oModelGroupRef.current.scale.setScalar(logoScale * (0.5 + 0.5 * transitionProgress))
        oModelGroupRef.current.rotation.set(0, 0, 0)
        oModelGroupRef.current.visible = true
      }

      if (pModelGroupRef.current && modelsLoaded.p) {
        const startPosition = rightEdgePosition.clone()
        const endPosition = new THREE.Vector3(pHorizontalPos, pVerticalOffset, 0)
        const currentPosition = startPosition.clone().lerp(endPosition, transitionProgress)

        pModelGroupRef.current.position.copy(currentPosition)
        pModelGroupRef.current.scale.setScalar(logoScale * (0.5 + 0.5 * transitionProgress))
        pModelGroupRef.current.rotation.set(0, 0, 0)
        pModelGroupRef.current.visible = true
      }

      if (xModelGroupRef.current && modelsLoaded.x) {
        const startPosition = rightEdgePosition.clone()
        const endPosition = new THREE.Vector3(xHorizontalPos, xVerticalOffset, 0)
        const currentPosition = startPosition.clone().lerp(endPosition, transitionProgress)

        xModelGroupRef.current.position.copy(currentPosition)
        xModelGroupRef.current.scale.setScalar(logoScale * (0.5 + 0.5 * transitionProgress))
        xModelGroupRef.current.rotation.set(0, 0, 0)
        xModelGroupRef.current.visible = true
      }
    } else {
      // --- X MODEL --- (Exits first)
      if (xModelGroupRef.current && modelsLoaded.x) {
        if (progress < xExitThreshold) {
          // X stays in position before exit threshold
          xModelGroupRef.current.position.set(xHorizontalPos, xVerticalOffset, 0)
          xModelGroupRef.current.scale.setScalar(logoScale)
          xModelGroupRef.current.visible = true
        } else {
          // X exits to the right
          const exitProgress = Math.min((progress - xExitThreshold) / (xFadeOutComplete - xExitThreshold), 1)
          const easedExitProgress = 1 - Math.pow(1 - exitProgress, 3)
          
          // Move X to the right and fade out
          const xStartPosition = new THREE.Vector3(xHorizontalPos, xVerticalOffset, 0)
          const xTargetPosition = rightEdgePosition.clone()
          const currentPosition = xStartPosition.clone().lerp(xTargetPosition, easedExitProgress)
          
          xModelGroupRef.current.position.copy(currentPosition)
          xModelGroupRef.current.visible = true
          
          // Apply opacity to each mesh material
          xModelGroupRef.current.traverse((child: any) => {
            if (child.isMesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: THREE.Material) => {
                  if (!mat.transparent) mat.transparent = true
                  mat.opacity = 1 - easedExitProgress
                })
              } else {
                if (!child.material.transparent) child.material.transparent = true
                child.material.opacity = 1 - easedExitProgress
              }
            }
          })
        }
      }

      // --- P MODEL --- (Exits second)
      if (pModelGroupRef.current && modelsLoaded.p) {
        if (progress < pExitThreshold) {
          // P stays in position before exit threshold
          pModelGroupRef.current.position.set(pHorizontalPos, pVerticalOffset, 0)
          pModelGroupRef.current.scale.setScalar(logoScale)
          pModelGroupRef.current.visible = true
        } else {
          // P exits to the right
          const exitProgress = Math.min((progress - pExitThreshold) / (pFadeOutComplete - pExitThreshold), 1)
          const easedExitProgress = 1 - Math.pow(1 - exitProgress, 3)
          
          // Move P to the right and fade out
          const pStartPosition = new THREE.Vector3(pHorizontalPos, pVerticalOffset, 0)
          const pTargetPosition = rightEdgePosition.clone()
          const currentPosition = pStartPosition.clone().lerp(pTargetPosition, easedExitProgress)
          
          pModelGroupRef.current.position.copy(currentPosition)
          pModelGroupRef.current.visible = true
          
          // Apply opacity to each mesh material
          pModelGroupRef.current.traverse((child: any) => {
            if (child.isMesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: THREE.Material) => {
                  if (!mat.transparent) mat.transparent = true
                  mat.opacity = 1 - easedExitProgress
                })
              } else {
                if (!child.material.transparent) child.material.transparent = true
                child.material.opacity = 1 - easedExitProgress
              }
            }
          })
        }
      }

      // --- O MODEL --- (Exits last)
      if (oModelGroupRef.current && modelsLoaded.o) {
        if (progress < oExitThreshold) {
          // O stays in position before exit threshold
          // As P exits, O moves to P's position with a delay
          let oPosition = new THREE.Vector3(oHorizontalPos, oVerticalOffset, 0);
          
          // If P has started exiting and moved far enough, start moving O toward P's original position
          if (progress >= pExitThreshold + 0.03) { // Add a delay before O starts moving
            const centeringProgress = Math.min(
              (progress - (pExitThreshold + 0.03)) / (oExitThreshold - (pExitThreshold + 0.03)), 
              1
            );
            const easedCenteringProgress = 1 - Math.pow(1 - centeringProgress, 3);
            
            // Move toward P's original position instead of center
            const pOriginalPosition = new THREE.Vector3(pHorizontalPos, pVerticalOffset, 0);
            oPosition = oPosition.lerp(pOriginalPosition, easedCenteringProgress);
          }
          
          oModelGroupRef.current.position.copy(oPosition);
          oModelGroupRef.current.scale.setScalar(logoScale);
          oModelGroupRef.current.visible = true;
        } else {
          // O exits to the right
          const exitProgress = Math.min((progress - oExitThreshold) / (oFadeOutComplete - oExitThreshold), 1)
          const easedExitProgress = 1 - Math.pow(1 - exitProgress, 3)
          
          // Use O's current position as the starting point instead of centerPosition
          const oStartPosition = new THREE.Vector3(pHorizontalPos, pVerticalOffset, 0) // P's original position
          const oTargetPosition = new THREE.Vector3(rightEdgePosition.x, pVerticalOffset, 0) // Maintain same Y
          const currentPosition = oStartPosition.clone().lerp(oTargetPosition, easedExitProgress)
          
          oModelGroupRef.current.position.copy(currentPosition)
          oModelGroupRef.current.visible = true
          
          // Apply opacity to each mesh material
          oModelGroupRef.current.traverse((child: any) => {
            if (child.isMesh && child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat: THREE.Material) => {
                  if (!mat.transparent) mat.transparent = true
                  mat.opacity = 1 - easedExitProgress
                })
              } else {
                if (!child.material.transparent) child.material.transparent = true
                child.material.opacity = 1 - easedExitProgress
              }
            }
          })
        }
      }
    }

    // Pointer-based tilt for whole group
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
    const rect = (event.target as any)?.getBoundingClientRect?.() || { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight }
    pointerRef.current = {
      x: ((clientX - rect.left) / rect.width) * 2 - 1,
      y: -((clientY - rect.top) / rect.height) * 2 + 1,
    }
  }

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
        {modelsLoaded.o && oLogoMeshes.length > 0 && (
          <group ref={oModelGroupRef}>
            {oLogoMeshes.map((m) => (
              <mesh
                key={`o-${m.key}`}
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
        )}

        {/* P Logo Model */}
        {modelsLoaded.p && pLogoMeshes.length > 0 && (
          <group ref={pModelGroupRef}>
            {pLogoMeshes.map((m) => (
              <mesh
                key={`p-${m.key}`}
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
        )}

        {/* X Logo Model */}
        {modelsLoaded.x && xLogoMeshes.length > 0 && (
          <group ref={xModelGroupRef}>
            {xLogoMeshes.map((m) => (
              <mesh
                key={`x-${m.key}`}
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
        )}
      </group>
    </Float>
  )
}

// Preload all models
useGLTF.preload('/models/O.glb')
useGLTF.preload('/models/P-logo.glb')
useGLTF.preload('/models/X-logo.glb')