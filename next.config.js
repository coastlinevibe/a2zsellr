/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dcfgdlwhixdruyewywly.supabase.co', 'ui-avatars.com', 'www.a2zsellr.life'],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/whatsapp/:path*',
          destination: 'http://localhost:3001/api/whatsapp/:path*',
        },
        {
          source: '/api/facebook/:path*',
          destination: 'http://localhost:3001/api/facebook/:path*',
        },
        {
          source: '/api/instagram/:path*',
          destination: 'http://localhost:3001/api/instagram/:path*',
        },
      ],
    }
  },
}

module.exports = nextConfig
