import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.sofihr.ru',
      },
      {
        protocol: 'https',
        hostname: 'sofihr.ru',
      },
    ],
    formats: ['image/webp', 'image/avif'],
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

  // Убираем i18n - в Next.js 13+ используется app router
  // i18n: {
  //   locales: ['ru'],
  //   defaultLocale: 'ru',
  // },

  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Добавляем настройки для Timeweb
  output: 'standalone',
};

export default nextConfig;
