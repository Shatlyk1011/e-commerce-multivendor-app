import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {},
  async rewrites() {
    return [
      {
        source: '/medusa/:path*',
        destination: `${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? 'http://localhost:9000'}/:path*`,
      },
    ]
  },
}

export default nextConfig
