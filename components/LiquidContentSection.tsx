'use client'

import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import { useScrollStore } from '../lib/scroll'
import * as THREE from 'three'

export default function LiquidContentSection() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { progress } = useScrollStore()
  const { viewport } = useThree()
  
  // Create displacement texture for liquid effect
  const displacementMap = useTexture('/textures/displacement.jpg')
  
  useEffect(() => {
    if (displacementMap) {
      displacementMap.wrapS = displacementMap.wrapT = THREE.RepeatWrapping
    }
  }, [displacementMap])
  
  useFrame((state) => {
    if (!meshRef.current || !meshRef.current.material) return
    
    const material = meshRef.current.material as THREE.ShaderMaterial
    
    // Control visibility based on scroll progress
    // Start appearing at 80% scroll
    const visibilityThreshold = 0.80
    const visibilityRange = 0.15
    const fadeProgress = Math.max(0, Math.min(1, (progress - visibilityThreshold) / visibilityRange))
    
    // Update shader uniforms
    if (material.uniforms) {
      // Time for liquid animation
      material.uniforms.uTime.value = state.clock.elapsedTime
      
      // Transition progress for fade effect
      material.uniforms.uProgress.value = fadeProgress
      
      // Displacement amount increases with scroll
      material.uniforms.uDisplacementScale.value = 0.3 * fadeProgress
    }
  })

  // Content definitions with multiple paragraphs
  const content = useMemo(() => ({
    heading: "IMMERSIVE DIGITAL EXPERIENCE",
    leftColumn: {
      paragraph1: "Discover a new dimension of interactive design where technology meets art. Our cutting-edge solutions blend seamlessly with your vision, creating memorable user experiences that stand out in the digital landscape.",
    },
    rightColumn: {
      paragraph1: "We leverage the latest in WebGL and 3D rendering to deliver performances that captivate audiences while maintaining optimal efficiency across all devices and platforms.",
      paragraph2: "Our team of experts constantly pushes boundaries, exploring new techniques and approaches to create immersive environments that tell your story in the most engaging way possible."
    }
  }), [])

  // Only render if we're at least 70% through the scroll (optimization)
  if (progress < 0.7) return null
  
  return (
    <group>
      <mesh 
        ref={meshRef}
        position={[0, 0, -5]} // Behind the logo
        rotation={[0, 0, 0]}
        scale={[viewport.width, viewport.height, 1]}
      >
        <planeGeometry args={[1, 1, 128, 128]} />
        <shaderMaterial
          transparent={true}
          uniforms={{
            uTime: { value: 0 },
            uProgress: { value: 0 },
            uDisplacementMap: { value: displacementMap },
            uDisplacementScale: { value: 0 },
            uColor: { value: new THREE.Color('#111111') },
          }}
          vertexShader={`
            uniform float uTime;
            uniform float uProgress;
            uniform sampler2D uDisplacementMap;
            uniform float uDisplacementScale;
            
            varying vec2 vUv;
            
            void main() {
              vUv = uv;
              
              // Sample displacement map
              vec4 displacement = texture2D(uDisplacementMap, vUv + uTime * 0.05);
              
              // Calculate displacement amount
              float displacementAmount = displacement.r * uDisplacementScale;
              
              // Apply displacement only in z direction for ripple effect
              vec3 newPosition = position + normal * displacementAmount * uProgress;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uProgress;
            uniform vec3 uColor;
            
            varying vec2 vUv;
            
            void main() {
              // Radial gradient for a more interesting effect
              float distFromCenter = length(vUv - 0.5) * 2.0;
              float alpha = smoothstep(0.0, 1.0, uProgress) * (1.0 - distFromCenter * 0.3);
              
              gl_FragColor = vec4(uColor, alpha);
            }
          `}
        />
      </mesh>

      {/* Content layout with heading on left and paragraphs in columns */}
      <group position={[0, 0, -3]}>
        {/* Left Column */}
        <group position={[-viewport.width * 0.3, viewport.height * 0.25, 0]}>
          {/* Heading on the left */}
          <Text
            position={[0, 0, 0]}
            fontSize={0.4}
            maxWidth={viewport.width * 0.35}
            lineHeight={1.2}
            font="/fonts/Inter-Bold.woff"
            color="#FFFFFF"
            anchorX="left"
            anchorY="top"
            material-transparent={true}
            material-opacity={
              Math.max(0, Math.min(1, (progress - 0.85) / 0.1))
            }
          >
            {content.heading}
          </Text>

          {/* First paragraph below heading */}
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.18}
            maxWidth={viewport.width * 0.35}
            lineHeight={1.5}
            font="/fonts/Inter-Regular.woff"
            color="#CCCCCC"
            anchorX="left"
            anchorY="top"
            material-transparent={true}
            material-opacity={
              Math.max(0, Math.min(1, (progress - 0.87) / 0.1))
            }
          >
            {content.leftColumn.paragraph1}
          </Text>
        </group>

        {/* Right Column */}
        <group position={[0, viewport.height * 0.25, 0]}>
          {/* First paragraph in right column */}
          <Text
            position={[0, 0, 0]}
            fontSize={0.18}
            maxWidth={viewport.width * 0.35}
            lineHeight={1.5}
            font="/fonts/Inter-Regular.woff"
            color="#CCCCCC"
            anchorX="left"
            anchorY="top"
            material-transparent={true}
            material-opacity={
              Math.max(0, Math.min(1, (progress - 0.89) / 0.1))
            }
          >
            {content.rightColumn.paragraph1}
          </Text>

          {/* Second paragraph below first paragraph in right column */}
          <Text
            position={[0, -1.5, 0]}
            fontSize={0.18}
            maxWidth={viewport.width * 0.35}
            lineHeight={1.5}
            font="/fonts/Inter-Regular.woff"
            color="#CCCCCC"
            anchorX="left"
            anchorY="top"
            material-transparent={true}
            material-opacity={
              Math.max(0, Math.min(1, (progress - 0.91) / 0.1))
            }
          >
            {content.rightColumn.paragraph2}
          </Text>
        </group>
      </group>
    </group>
  )
}