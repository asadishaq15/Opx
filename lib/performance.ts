/**
 * Performance monitoring and optimization utilities
 */

export class PerformanceMonitor {
  private frameCount = 0
  private lastTime = performance.now()
  private fps = 60
  private isLowPerformance = false
  
  public getCurrentFPS(): number {
    return this.fps
  }
  
  public isLowPerformanceDevice(): boolean {
    return this.isLowPerformance
  }
  
  public update(): void {
    this.frameCount++
    const now = performance.now()
    
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.frameCount = 0
      this.lastTime = now
      
      // Consider device low performance if FPS consistently below 30
      this.isLowPerformance = this.fps < 30
    }
  }
  
  public getOptimalSettings() {
    return {
      particleCount: this.isLowPerformance ? 500 : 1500,
      lightCount: this.isLowPerformance ? 3 : 5,
      shardCount: this.isLowPerformance ? 3 : 6,
      updateThrottle: this.isLowPerformance ? 1000 / 30 : 1000 / 60,
      geometryComplexity: this.isLowPerformance ? 'low' : 'medium',
      materialQuality: this.isLowPerformance ? 'basic' : 'standard'
    }
  }
}

export const performanceMonitor = new PerformanceMonitor()

// Device capability detection
export const getDeviceCapabilities = () => {
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl') as WebGLRenderingContext
  
  if (!gl) return { tier: 'low' as const, score: 0, renderer: 'unknown', vendor: 'unknown' }
  
  const renderer = gl.getParameter(gl.RENDERER) as string
  const vendor = gl.getParameter(gl.VENDOR) as string
  
  let score = 1 // Base score
  
  // Check for high-performance indicators
  if (renderer.includes('GeForce') || renderer.includes('Radeon') || renderer.includes('Apple')) {
    score += 2
  }
  
  // Check memory
  const memory = (navigator as any).deviceMemory
  if (memory) {
    score += Math.min(memory / 4, 2) // Up to 2 points for memory
  }
  
  // Check concurrent hardware threads
  const cores = navigator.hardwareConcurrency
  if (cores) {
    score += Math.min(cores / 4, 1) // Up to 1 point for cores
  }
  
  // Check connection (mobile vs desktop indicator)
  const connection = (navigator as any).connection
  if (connection && connection.effectiveType === '4g') {
    score += 1
  }
  
  // Determine tier
  let tier: 'low' | 'medium' | 'high' = 'medium'
  if (score <= 2) tier = 'low'
  else if (score >= 5) tier = 'high'
  
  return { tier, score, renderer, vendor }
}

// Adaptive quality settings based on device capabilities
export const getAdaptiveSettings = () => {
  const capabilities = getDeviceCapabilities()
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  
  const settings = {
    low: {
      particleCount: 300,
      dpr: [0.5, 1],
      antialias: false,
      shadowMap: false,
      transmission: false, // Use basic materials instead
      environmentResolution: 128,
      geometrySegments: 6,
      updateFPS: 30,
      lightCount: 3
    },
    medium: {
      particleCount: 1000,
      dpr: [1, 1.5],
      antialias: false,
      shadowMap: false,
      transmission: true,
      environmentResolution: 256,
      geometrySegments: 8,
      updateFPS: 45,
      lightCount: 4
    },
    high: {
      particleCount: 2000,
      dpr: [1, 2],
      antialias: true,
      shadowMap: false, // Still disabled for performance
      transmission: true,
      environmentResolution: 512,
      geometrySegments: 12,
      updateFPS: 60,
      lightCount: 5
    }
  }
  
  // Override for mobile
  if (isMobile) {
    return {
      ...settings.low,
      particleCount: 200,
      dpr: [0.5, 1],
    }
  }
  
  return settings[capabilities.tier] || settings.medium
}
