import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary dark background
        'dark-primary': '#0A0A0B',
        'dark-secondary': '#1A1A1B',
        'dark-tertiary': '#2A2A2B',
        
        // Neon accent palette
        'neon-cyan': '#00F0FF',
        'neon-magenta': '#FF1CF7',
        'neon-purple': '#7C3AED',
        'neon-lime': '#B6FF00',
        
        // Subtle variations
        'glass-dark': 'rgba(26, 26, 27, 0.8)',
        'glass-darker': 'rgba(10, 10, 11, 0.9)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['14px', '20px'],
        'sm': ['16px', '24px'],
        'md': ['18px', '28px'],
        'lg': ['24px', '32px'],
        'xl': ['36px', '44px'],
        '2xl': ['48px', '56px'],
        '3xl': ['64px', '72px'],
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px rgb(0 240 255 / 0.5), 0 0 10px rgb(0 240 255 / 0.3), 0 0 15px rgb(0 240 255 / 0.1)' 
          },
          '100%': { 
            boxShadow: '0 0 10px rgb(0 240 255 / 0.8), 0 0 20px rgb(0 240 255 / 0.6), 0 0 30px rgb(0 240 255 / 0.3)' 
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}

export default config
