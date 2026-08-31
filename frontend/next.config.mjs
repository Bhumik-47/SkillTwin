/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: [
    '*.ngrok-free.dev',
    '*.ngrok-free.app',
    '*.ngrok.app',
    '*.loca.lt',
    'sterile-basics-caloric.ngrok-free.dev',
    'localhost:3000',
    '127.0.0.1:3000'
  ],
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
      },
    ];
  },
};

export default nextConfig;

