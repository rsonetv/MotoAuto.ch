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

  webpack(config, { isServer }) {
    // Make sure the plugins array exists
    config.plugins = config.plugins || [];

    // Add the MiniCssExtractPlugin
    if (!isServer) {
      config.plugins.push(new (require('mini-css-extract-plugin'))());
    }

    // Provide global.self → globalThis for libraries that expect it
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        "global.self": "globalThis",
      })
    );

    return config;
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

export default nextConfig;
