/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: { 
    NEXT_PUBLIC_API_URL: process.env.RENDER_EXTERNAL_URL || "http://localhost:3005" 
  }
}; 

module.exports = nextConfig
  images: {
    unoptimized: true
  },
  // 添加跨域配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
  env: { 
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005" 
  }
}; 

module.exports = nextConfig