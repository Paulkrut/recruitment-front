/** @type {import('@lingui/conf').LinguiConfig} */
module.exports = {
  locales: ['ru', 'en'],
  sourceLocale: 'ru',
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src/'],
      exclude: [
        '**/node_modules/**',
        '**/types/**',        // Исключаем TypeScript декларации
        '**/*.d.ts',          // Исключаем все .d.ts файлы
      ],
    },
  ],
  format: 'po',
  compileNamespace: 'cjs', // CommonJS для создания .js файлов
  fallbackLocales: {
    default: 'ru',
  },
};

