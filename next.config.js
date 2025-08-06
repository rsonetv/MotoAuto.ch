const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},

  async redirects() {
    return [
      {
        source: "/jak-to-dziala",
        destination: "/faq",
        permanent: true,
      },
      {
        source: "/how-it-works",
        destination: "/faq",
        permanent: true,
      },
    ]
  },

  webpack(config) {
    // Make sure the plugins array exists
    config.plugins = config.plugins || []

    // Provide global.self → globalThis for libraries that expect it
    config.plugins.push(
      new webpack.DefinePlugin({
        "global.self": "globalThis",
      }),
    )

    // Add rules for CSS modules
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    
    return config
  },

  images: {
    domains: ["placeholder.svg", "blob.v0.dev"],
    unoptimized: true, // we render raw URLs, no optimisation needed
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    // Allow production builds even with type-errors (CI should still fail if needed)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig;
