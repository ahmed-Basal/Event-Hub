import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '..'),
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    externalDir: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'date-fns'],
  },
  turbopack: {
    resolveAlias: {
      '@features': '../Features',
    },
  },
  webpack: (config) => {
    config.resolve.modules = config.resolve.modules || ['node_modules'];
    config.resolve.modules.push(path.resolve(__dirname, 'node_modules'));
    config.resolve.alias['@features'] = path.resolve(__dirname, '../Features');
    return config;
  },
};

export default nextConfig;
