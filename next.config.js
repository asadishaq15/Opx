/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    unoptimized: true               // easier for static deploys
  },
  webpack: (config, { isServer }) => {
    // Handle GLSL files for shaders
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader'],
    })

    // Optimize for Three.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    return config
  },
  // Enable static generation optimizations
  trailingSlash: false,
  poweredByHeader: false,
  compress: true,

  // Produce a static `out/` folder usable on shared hosts
  output: 'export',
}

module.exports = nextConfig
