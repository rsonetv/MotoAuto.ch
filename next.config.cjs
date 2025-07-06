/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.plugins.push(
      new config.webpack.DefinePlugin({
        'global.self': 'globalThis',
      })
    )
    return config
  },
  images: {
    domains: ['placeholder.svg', 'blob.v0.dev'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
