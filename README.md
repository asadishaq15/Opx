# ScrollTrigger 3D Website Template

A futuristic, dark-mode 3D website built with Next.js, Three.js, React Three Fiber, and GSAP ScrollTrigger.

## Features

- 🎨 **Futuristic Design**: Dark theme with neon accent colors and glass morphism effects
- 🎯 **3D Graphics**: Interactive 3D logo with glass material and particle systems
- 📱 **Responsive**: Optimized for all devices with adaptive performance
- ♿ **Accessible**: Respects `prefers-reduced-motion` and includes proper ARIA labels
- ⚡ **Performance**: GPU-accelerated rendering with optimized particle systems
- 🔄 **Interactive**: Mouse/touch interactions with scroll-synchronized animations

## Tech Stack

- **Framework**: Next.js 14+ with App Router and TypeScript
- **3D Engine**: Three.js with React Three Fiber and Drei
- **Animation**: GSAP with ScrollTrigger for smooth scroll-based animations
- **Styling**: Tailwind CSS with custom neon theme
- **State Management**: Zustand for scroll state management
- **Post-processing**: Bloom effects and anti-aliasing

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scrolltrigger-3d-website-template
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout with font loading
│   └── page.tsx           # Main page with content sections
├── components/            # React components
│   ├── CanvasRoot.tsx     # 3D canvas setup and configuration
│   ├── LogoGlass.tsx      # Animated glass 3D logo
│   ├── LoaderOverlay.tsx  # Loading screen with progress
│   ├── Particles3D.tsx    # Interactive particle system
│   └── Scene.tsx          # Main 3D scene with lighting
├── lib/                   # Utility functions and hooks
│   ├── scroll.ts          # ScrollTrigger setup and state
│   └── useIsClient.ts     # SSR-safe client detection
└── public/               # Static assets
    ├── env.hdr           # HDRI environment map (add your own)
    └── models/           # 3D models (optional)
```

## Key Features Explained

### 3D Glass Logo
- Continuously rotating 3D logo with physics-based glass material
- Rotation speed syncs with scroll velocity for dynamic interaction
- Responsive positioning (top-left desktop, top-center mobile)
- Hover interactions with subtle parallax effects

### Interactive Particles
- GPU-optimized instanced particle system (2k-5k particles)
- Mouse/touch attraction/repulsion interactions
- Scroll-coupled movement and color transitions
- Adaptive particle count based on `prefers-reduced-motion`

### Loading Experience  
- Animated loading screen with progress tracking
- GSAP-powered fade-out transition when assets are ready
- Loading tips that change based on progress percentage
- Background particle effects for visual interest

### Scroll Integration
- GSAP ScrollTrigger for smooth scroll-based animations
- Velocity tracking affects logo rotation speed
- Progress tracking for particle color shifts and z-movement
- Responsive refresh on window resize

### Performance Optimizations
- Adaptive device pixel ratio (DPR) capping at 2x
- Frustum culling and material reuse
- Conditional shadow mapping (disabled by default)
- Dynamic imports to prevent SSR issues with Three.js
- Bloom post-processing with optimized settings

### Accessibility
- Respects `prefers-reduced-motion` system preference
- Semantic HTML structure with proper landmarks
- Skip-to-content link for keyboard navigation  
- High contrast text and proper color ratios
- ARIA labels for interactive elements

## Customization

### Colors
Edit the color palette in `tailwind.config.ts`:
```typescript
colors: {
  'neon-cyan': '#00F0FF',
  'neon-magenta': '#FF1CF7', 
  'neon-purple': '#7C3AED',
  'neon-lime': '#B6FF00',
}
```

### 3D Models
Add your own logo model:
1. Place a `.glb` file at `/public/models/logo.glb`
2. The `LogoGlass` component will automatically load it
3. Falls back to a procedural torus knot if not found

### Environment Map
Add an HDRI environment map:
1. Place a `.hdr` or `.exr` file at `/public/env.hdr`  
2. Used for realistic reflections on the glass logo

### Content
Edit page content in `app/page.tsx` with your own:
- Hero section with title and CTA
- Feature cards showcasing your product
- Technology stack showcase
- Call-to-action sections

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with WebGL support

## Performance Guidelines

- Maintains 60fps on modern devices
- Adaptive quality based on device capabilities
- Graceful degradation for older hardware
- Memory-efficient particle systems

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this template for personal and commercial projects.

## Support

For questions and support:
- Check the [issues page](link-to-issues)
- Review the code comments for implementation details
- Consult the Three.js and React Three Fiber documentation

---

Built with ❤️ using modern web technologies
# OPX
