import React from 'react'
import type { Metadata } from 'next'
import { Inter, Sora } from 'next/font/google'
import './globals.css'
import LanguageWrapper from '../components/LanguageWrapper'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sora',
})

export const metadata: Metadata = {
  title: 'OPX Group',
  description: 'A futuristic, dark-mode 3D website built with Next.js, Three.js, and GSAP ScrollTrigger',
  keywords: ['3D', 'Three.js', 'Next.js', 'GSAP', 'ScrollTrigger', 'WebGL', 'React Three Fiber'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'OPX Group',
    description: 'A futuristic, dark-mode 3D website built with Next.js, Three.js, and GSAP ScrollTrigger',
    type: 'website',
    siteName: 'OPX Group',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OPX Group',
    description: 'A futuristic, dark-mode 3D website built with Next.js, Three.js, and GSAP ScrollTrigger',
  },
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0A0A0B',
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Preload critical 3D assets for better performance */}
        <link rel="preload" href="/models/O.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/models/falcon/falcon.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/models/palm/scene-v2.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/assets/O.png" as="image" />
        <link rel="preload" href="/assets/fake_verthandi.mp3" as="audio" />
      </head>
      <body className="min-h-screen bg-dark-primary text-white antialiased custom-scrollbar">
        {/* Skip to content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-neon-cyan text-black rounded-md font-medium"
        >
          Skip to main content
        </a>
        
        {/* Register Service Worker for asset caching */}
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then((registration) => {
                    console.log('SW registered: ', registration);
                  })
                  .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                  });
              });
            }
          `
        }} />
        
        {/* Language Selector handles everything initially */}
        <LanguageWrapper>
          {children}
        </LanguageWrapper>
      </body>
    </html>
  )
}
