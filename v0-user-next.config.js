/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't attempt to load these Node.js modules on the client-side
      config.resolve.fallback = {
        fs: false,
        'fs/promises': false,
        child_process: false,
        async_hooks: false,
      }
    }
    return config
  },
  
  // Add headers configuration for proper cookie handling
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Set-Cookie',
          value: 'SameSite=Lax; Secure'
        }
      ]
    }
  ]
}

export default nextConfig 