import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Важно для Docker деплоя
  transpilePackages: ['@iconify/react', '@iconify/iconify'],
  images: {
    domains: ['www.sofihr.ru', 'sofihr.ru'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Настройка SWC для работы с Lingui макросами
  experimental: {
    swcPlugins: [
      ['@lingui/swc-plugin', {}]
    ],
  },
  
  webpack: (config) => {
    // Поддержка Lingui Loader
    config.module.rules.push({
      test: /\.po$/,
      use: {
        loader: '@lingui/loader',
      },
    });
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
