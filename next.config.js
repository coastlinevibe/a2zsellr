/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['dcfgdlwhixdruyewywly.supabase.co', 'ui-avatars.com', 'www.a2zsellr.life'],
  },
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/whatsapp/:path*',
          destination: 'http://localhost:3001/api/whatsapp/:path*',
        },
      ],
    }
  },
}

module.exports = nextConfig
