/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  experimental: {
    // Server Actions only; multipart admin uploads use Route Handlers (see nginx client_max_body_size on host).
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  images: {
    loader: 'custom',
    loaderFile: './lib/images/cloudinary-loader.ts',
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
    const globalHeaders = [
      { key: 'Referrer-Policy', value: 'no-referrer-when-downgrade' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ];

    return [
      {
        source: '/:path*',
        headers: globalHeaders,
      },
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          ...globalHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
