import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material', 'date-fns'],
  },
  turbopack: {
    resolveAlias: {
      '@modules': './src/modules',
    },
  },
  webpack: (config) => {
    config.resolve.modules = config.resolve.modules || ['node_modules'];
    config.resolve.modules.push(path.resolve(__dirname, 'node_modules'));
    config.resolve.alias['@modules'] = path.resolve(__dirname, 'src/modules');
    return config;
  },
};

export default nextConfig;
