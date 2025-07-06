/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },

  webpack: (config) => {
    // Some libraries expect global.self – alias it to globalThis.
    config.plugins.push(
      new config.webpack.DefinePlugin({
        "global.self": "globalThis",
      }),
    )
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

export default nextConfig
