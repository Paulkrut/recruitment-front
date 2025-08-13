# Используем официальный Node.js образ с Alpine Linux для меньшего размера
FROM node:22-alpine AS base

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./
COPY yarn.lock ./

# Устанавливаем зависимости
RUN yarn install --frozen-lockfile --production=false

# Копируем исходный код
COPY . .

# Создаем пользователя для безопасности
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Собираем приложение
RUN yarn build

# Создаем production образ
FROM node:22-alpine AS runner

WORKDIR /app

# Создаем пользователя
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем необходимые файлы из base образа
COPY --from=base /app/public ./public
COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static

# Устанавливаем права доступа
RUN chown -R nextjs:nodejs /app
USER nextjs

# Открываем порт (важно для Timeweb Cloud)
EXPOSE 3000

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Запускаем приложение
CMD ["node", "server.js"] 