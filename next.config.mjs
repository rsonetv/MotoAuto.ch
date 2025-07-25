import webpack from 'webpack';
const { DefinePlugin } = webpack;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Make sure the plugins array exists
    config.plugins = config.plugins || []

    // Provide global.self → globalThis for libraries that expect it
    config.plugins.push(
      new DefinePlugin({
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