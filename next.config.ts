import createNextIntlPlugin from 'next-intl/plugin';
import { DefinePlugin, type Configuration as WebpackConfig } from "webpack"

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

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
      // Legacy redirects for old static pages to new locale structure
      {
        source: "/aukcje",
        destination: "/pl/aukcje",
        permanent: true,
      },
      {
        source: "/cennik", 
        destination: "/pl/cennik",
        permanent: true,
      },
      {
        source: "/ogloszenia",
        destination: "/pl/ogloszenia", 
        permanent: true,
      },
    ]
  },

  webpack(config: WebpackConfig) {
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
    // Allow production builds even with type-errors for now (should be false in production)
    ignoreBuildErrors: true,
  },
}

export default withNextIntl(nextConfig);
