import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
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
      'react-hook-form',
      'zod',
    ],
  },
  // Only transpile CJS packages that need it; Three.js is pure ESM and doesn't need transpilation
  transpilePackages: ['lucide-react', 'recharts'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
