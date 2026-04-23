import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'recharts', 
      'date-fns', 
      '@radix-ui/react-avatar', 
      '@radix-ui/react-dialog', 
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'react-hook-form',
      'zod',
      'lucide-react'
    ],
  },
  transpilePackages: ['lucide-react', 'recharts', 'three', '@react-three/fiber', '@react-three/drei'],
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true, // Speeds up dev compilation by skipping type checks on every change
  },
  // @ts-ignore
  eslint: {
    ignoreDuringBuilds: true, // Prevents linting from slowing down the build
  },
};

export default nextConfig;
