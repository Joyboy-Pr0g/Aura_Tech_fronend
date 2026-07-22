/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/products/category/:slug/:subCategory',
        destination: '/products?category=:slug&sub_category=:subCategory',
      },
      {
        source: '/products/category/:slug',
        destination: '/products?category=:slug',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
