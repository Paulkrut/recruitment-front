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

  // Убираем headers и redirects - они не работают с output: export
  // async headers() {
  //   return [
  //     {
  //       source: '/(.*)',
  //       headers: [
  //         {
  //           key: 'X-Frame-Options',
  //           value: 'DENY',
  //         },
  //         {
  //           key: 'X-Content-Type-Options',
  //           value: 'nosniff',
  //         },
  //         {
  //           key: 'Referrer-Policy',
  //           value: 'strict-origin-when-cross-origin',
  //         },
  //         {
  //           key: 'X-XSS-Protection',
  //           value: '1; mode=block',
  //         },
  //       ],
  //     },
  //   ];
  // },

  // async redirects() {
  //   return [
  //     {
  //       source: '/home',
  //       destination: '/',
  //       permanent: true,
  //     },
  //   ];
  // },

  compress: true,
  poweredByHeader: false,
  generateEtags: false,

  // Статический экспорт для Timeweb
  output: 'export',
  
  // Отключаем trailing slash для статического экспорта
  trailingSlash: false,
  
  // Настройки для статического экспорта
  distDir: 'out',
};

export default nextConfig;
