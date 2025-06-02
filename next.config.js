/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Add SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  transpilePackages: ['@heroicons/react']
};

module.exports = nextConfig; 