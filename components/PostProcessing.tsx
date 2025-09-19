'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  Vignette,
  SMAA,
  ToneMapping,
  BrightnessContrast,
  HueSaturation,
  Noise,
  DepthOfField
} from '@react-three/postprocessing'
import { useScrollStore, useReducedMotion } from '../lib/scroll'
import { BlendFunction, ToneMappingMode } from 'postprocessing'
import * as THREE from 'three'

/**
 * PostProcessing Effects Component
 * Adds cinematic visual effects that respond to scroll progress and user preferences
 */
export default function PostProcessing() {
  const { progress, velocity } = useScrollStore()
  const prefersReducedMotion = useReducedMotion()
  
  // Refs for dynamic effect control
  const bloomRef = useRef<any>()
  const chromaticAberrationRef = useRef<any>()
  const vignetteRef = useRef<any>()
  const brightnessContrastRef = useRef<any>()
  const hueSaturationRef = useRef<any>()
  const noiseRef = useRef<any>()
  const depthOfFieldRef = useRef<any>()

  // Animate effects based on scroll progress
  useFrame(() => {
    if (prefersReducedMotion) return

    // Bloom intensity increases with scroll progress
    if (bloomRef.current) {
      const baseIntensity = 0.3
      const maxIntensity = 1.2
      bloomRef.current.intensity = baseIntensity + (progress * (maxIntensity - baseIntensity))
    }

    // Chromatic aberration increases with velocity
    if (chromaticAberrationRef.current) {
      const velocityFactor = Math.abs(velocity) * 0.0001
      const baseOffset = new THREE.Vector2(0.0005, 0.0005)
      const maxOffset = 0.003
      const dynamicOffset = Math.min(velocityFactor, maxOffset)
      chromaticAberrationRef.current.offset = baseOffset.clone().multiplyScalar(1 + dynamicOffset * 5)
    }

    // Vignette darkness varies with scroll
    if (vignetteRef.current) {
      const baseDarkness = 0.3
      const maxDarkness = 0.7
      vignetteRef.current.darkness = baseDarkness + (progress * (maxDarkness - baseDarkness))
    }

    // Brightness/Contrast for cinematic feel
    if (brightnessContrastRef.current) {
      const brightness = -0.05 + (progress * 0.1) // Slight brightness variation
      const contrast = 0.1 + (progress * 0.15) // Increase contrast with scroll
      brightnessContrastRef.current.brightness = brightness
      brightnessContrastRef.current.contrast = contrast
    }

    // Subtle hue shift based on scroll progress
    if (hueSaturationRef.current) {
      const hueShift = progress * 0.1 // Subtle color temperature shift
      const saturation = 0.05 + (progress * 0.1) // Slight saturation boost
      hueSaturationRef.current.hue = hueShift
      hueSaturationRef.current.saturation = saturation
    }

    // Film grain noise that responds to velocity
    if (noiseRef.current) {
      const baseOpacity = 0.02
      const velocityNoise = Math.abs(velocity) * 0.0001
      noiseRef.current.opacity = baseOpacity + Math.min(velocityNoise * 2, 0.08)
    }

    // Depth of field for focus effects
    if (depthOfFieldRef.current) {
      const baseBokehScale = 1.0
      const maxBokehScale = 3.0
      depthOfFieldRef.current.bokehScale = baseBokehScale + (progress * (maxBokehScale - baseBokehScale))
    }
  })

  return (
    <EffectComposer>
      <SMAA />
      
      <ToneMapping
        mode={ToneMappingMode.ACES_FILMIC}
        resolution={256}
        whitePoint={4.0}
        middleGrey={0.6}
        minLuminance={0.01}
        averageLuminance={0.18}
        adaptationRate={2.0}
      />

      <Bloom
        ref={bloomRef}
        intensity={prefersReducedMotion ? 0.5 : 0.3}
        kernelSize={3}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.4}
        mipmapBlur={true}
        blendFunction={BlendFunction.ADD}
      />

      <ChromaticAberration
        ref={chromaticAberrationRef}
        offset={new THREE.Vector2(prefersReducedMotion ? 0.0001 : 0.0005, prefersReducedMotion ? 0.0001 : 0.0005)}
        radialModulation={false}
        modulationOffset={0}
      />

      <Vignette
        ref={vignetteRef}
        offset={0.3}
        darkness={prefersReducedMotion ? 0.4 : 0.3}
        eskil={false}
        blendFunction={BlendFunction.MULTIPLY}
      />

      <BrightnessContrast
        ref={brightnessContrastRef}
        brightness={0.0}
        contrast={0.1}
      />

      <HueSaturation
        ref={hueSaturationRef}
        hue={0.0}
        saturation={0.05}
        blendFunction={BlendFunction.NORMAL}
      />

      <Noise
        ref={noiseRef}
        opacity={prefersReducedMotion ? 0.005 : 0.02}
        blendFunction={BlendFunction.OVERLAY}
      />

      <DepthOfField
        ref={depthOfFieldRef}
        focusDistance={0.0}
        focalLength={0.02}
        bokehScale={prefersReducedMotion ? 0.5 : 1.0}
        height={480}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  )
}