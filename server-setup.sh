#!/bin/bash

# Скрипт первоначальной настройки сервера для SofiHR
set -e

echo "🚀 Начинаю настройку сервера для SofiHR..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Обновление системы
print_status "Обновление системы..."
sudo apt update && sudo apt upgrade -y

# Установка необходимых пакетов
print_status "Установка необходимых пакетов..."
sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx

# Установка NVM (Node Version Manager)
print_status "Установка NVM..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
    
    # Добавляем в .bashrc
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.bashrc
    echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.bashrc
else
    print_status "NVM уже установлен"
fi

# Загружаем NVM в текущую сессию
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Установка Node.js 22
print_status "Установка Node.js 22..."
nvm install 22
nvm use 22
nvm alias default 22

# Проверка версии
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
print_status "Node.js версия: $NODE_VERSION"
print_status "NPM версия: $NPM_VERSION"

# Установка Yarn
print_status "Установка Yarn..."
npm install -g yarn

# Установка PM2
print_status "Установка PM2..."
npm install -g pm2

# Настройка автозапуска PM2
print_status "Настройка автозапуска PM2..."
pm2 startup

# Создание директории проекта
PROJECT_DIR="/home/ubuntu/sofihr.ru"
print_status "Создание директории проекта: $PROJECT_DIR"
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Клонирование репозитория (если еще не клонирован)
if [ ! -d ".git" ]; then
    print_status "Клонирование репозитория..."
    git clone https://bitbucket.org/YOUR_USERNAME/recruitment-front.git .
else
    print_status "Репозиторий уже клонирован"
fi

# Установка зависимостей
print_status "Установка зависимостей..."
yarn install

# Сборка проекта
print_status "Сборка проекта..."
yarn build

# Настройка nginx
print_status "Настройка nginx..."
sudo cp nginx-sofihr.conf /etc/nginx/sites-available/sofihr.ru
sudo ln -sf /etc/nginx/sites-available/sofihr.ru /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Тест конфигурации nginx
print_status "Тест конфигурации nginx..."
sudo nginx -t

# Перезапуск nginx
print_status "Перезапуск nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

# Создание директории для логов
mkdir -p $PROJECT_DIR/logs

# Настройка прав доступа
print_status "Настройка прав доступа..."
sudo chown -R ubuntu:ubuntu $PROJECT_DIR
chmod +x $PROJECT_DIR/deploy-pm2-nginx-proxy.sh

# Создание health check endpoint
print_status "Создание health check endpoint..."
mkdir -p $PROJECT_DIR/src/app/api/health
cat > $PROJECT_DIR/src/app/api/health/route.ts << 'EOF'
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
}
EOF

# Пересборка после добавления health check
print_status "Пересборка проекта с health check..."
yarn build

# Запуск приложения через PM2
print_status "Запуск приложения через PM2..."
cd $PROJECT_DIR
./deploy-pm2-nginx-proxy.sh

# Настройка firewall
print_status "Настройка firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Настройка SSL сертификата (Let's Encrypt)
print_status "Настройка SSL сертификата..."
sudo certbot --nginx -d sofihr.ru -d www.sofihr.ru --non-interactive --agree-tos --email your-email@example.com

# Настройка автообновления сертификатов
print_status "Настройка автообновления SSL сертификатов..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

print_status "✅ Настройка сервера завершена!"
print_status "🌐 Сайт должен быть доступен по адресу: https://sofihr.ru"
print_status "📊 Статус PM2: pm2 list"
print_status "📋 Логи nginx: sudo tail -f /var/log/nginx/sofihr.ru.access.log"
print_status "🔧 Управление: ./deploy-pm2-nginx-proxy.sh [status|restart|reload|logs]" 