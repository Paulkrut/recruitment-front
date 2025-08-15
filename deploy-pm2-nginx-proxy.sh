#!/bin/bash

# PM2 Deployment с nginx как статичным прокси
set -e

echo "🚀 Starting PM2 deployment with nginx proxy..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create logs directory
create_logs_dir() {
    mkdir -p /home/ubuntu/sofihr.ru/logs
    mkdir -p /home/ubuntu/sofihr.ru/.yarn-cache
    print_status "Logs and cache directories created"
}

# Fast dependency check with caching
check_dependencies_cache() {
    local CACHE_FILE="/home/ubuntu/sofihr.ru/.deps-cache"
    local CURRENT_HASH=""
    
    # Создаем хеш из package.json и yarn.lock
    if [ -f "package.json" ] && [ -f "yarn.lock" ]; then
        CURRENT_HASH=$(sha256sum package.json yarn.lock | sha256sum | cut -d' ' -f1)
    fi
    
    # Проверяем кэш
    if [ -f "$CACHE_FILE" ] && [ -n "$CURRENT_HASH" ]; then
        local CACHED_HASH=$(cat "$CACHE_FILE")
        if [ "$CURRENT_HASH" = "$CACHED_HASH" ]; then
            print_status "⚡ Зависимости не изменились (кэш совпадает)"
            return 0  # false - зависимости НЕ изменились
        fi
    fi
    
    # Обновляем кэш
    if [ -n "$CURRENT_HASH" ]; then
        echo "$CURRENT_HASH" > "$CACHE_FILE"
        print_status "📦 Зависимости изменились (обновлен кэш)"
    fi
    
    return 1  # true - зависимости изменились
}

# Build new version
build_new_version() {
    print_status "Building new version with smart dependency caching..."

    TMP_DIR="/tmp/deploy-build-$(date +%s)"
    rm -rf $TMP_DIR
    git clone . $TMP_DIR --depth=1 --single-branch
    cd $TMP_DIR

    # Проверяем и используем Node.js 22
    if command -v nvm &> /dev/null; then
        print_status "Using NVM to switch to Node.js 22..."
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
        nvm use 22
    fi
    
    # Проверяем версию Node.js
    NODE_VERSION=$(node --version)
    print_status "Using Node.js version: $NODE_VERSION"
    
    # ВРЕМЕННО ОТКЛЮЧАЕМ КЭШИРОВАНИЕ ДЛЯ ДИАГНОСТИКИ
    print_status "🔍 ВРЕМЕННО ОТКЛЮЧАЕМ КЭШИРОВАНИЕ..."
    DEPENDENCIES_CHANGED=true
    print_status "📦 Принудительно устанавливаем зависимости заново!"

    export TERM=dumb
    export YARN_ENABLE_PROGRESS_BARS=0
    
    # Выполняем yarn install только если нужно
    if [ "$DEPENDENCIES_CHANGED" = "true" ]; then
        print_status "🔧 Устанавливаем зависимости..."
        # Оптимизированные флаги для быстрой установки
        yarn install --frozen-lockfile --prefer-offline --production=false --cache-folder ../.yarn-cache
    fi
    
    print_status "🏗️ Собираем проект..."
    yarn build

    # Проверка успешности сборки
    if [ ! -d ".next" ]; then
        print_error "Build failed!"
        exit 1
    fi

    # Вернуться в production-папку
    cd -

    # Копируем новые артефакты в production (rsync для атомарности)
    print_status "📋 Копируем новые файлы..."
    
    # ПРИНУДИТЕЛЬНО ОЧИЩАЕМ ВСЕ КЭШИ Next.js
    print_status "🧹 ПРИНУДИТЕЛЬНО ОЧИЩАЕМ ВСЕ КЭШИ Next.js..."
    rm -rf .next
    rm -rf ../.next
    
    # Копируем новые файлы
    rsync -a --delete $TMP_DIR/.next ./
    rsync -a --delete $TMP_DIR/public ./
    cp $TMP_DIR/package.json ./
    cp $TMP_DIR/yarn.lock ./
    
    # ПРИНУДИТЕЛЬНО КОПИРУЕМ node_modules
    print_status "📁 ПРИНУДИТЕЛЬНО КОПИРУЕМ node_modules..."
    rsync -a --delete $TMP_DIR/node_modules ./

    rm -rf $TMP_DIR

    print_status "✅ Новая версия собрана и скопирована в production"
}

# Check if app is running
is_app_running() {
    pm2 list | grep -q "sofihr"
}

# Create PM2 ecosystem config
create_ecosystem_config() {
    print_status "Creating PM2 ecosystem configuration..."

    cat > ecosystem-server.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'sofihr',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max', // Используем все доступные CPU ядра
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/ubuntu/sofihr.ru/logs/err.log',
    out_file: '/home/ubuntu/sofihr.ru/logs/out.log',
    log_file: '/home/ubuntu/sofihr.ru/logs/combined.log',
    time: true,
    // Настройки для graceful reload
    kill_timeout: 5000,
    listen_timeout: 10000
  }]
}
EOF
    print_status "PM2 ecosystem configuration created"
}

# Start application for first time
start_first_time() {
    print_status "Starting application for the first time..."

    # Create ecosystem config
    create_ecosystem_config

    # Start the application
    pm2 start ecosystem-server.config.js

    # Wait for health check
    wait_for_health_check

    print_status "Application started successfully"
}

# Wait for health check
wait_for_health_check() {
    local max_attempts=30
    local attempt=1

    print_status "Waiting for application to become healthy..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f "http://localhost:3000/api/health" > /dev/null 2>&1; then
            print_status "Application is healthy!"
            return 0
        fi

        print_warning "Attempt $attempt/$max_attempts - Application not ready yet..."
        sleep 5
        attempt=$((attempt + 1))
    done

    print_error "Application failed to become healthy"
    return 1
}

# Reload application with zero downtime
reload_application() {
    print_status "Reloading application with zero downtime..."

    # PM2 graceful reload (zero-downtime)
    # Это запустит новые процессы, а старые продолжат работать

    if pm2 list | grep -q "sofihr"; then
        print_status "Application is running, performing zero-downtime reload..."
        pm2 reload sofihr
    else
        print_status "Application is not running, starting for the first time..."
        pm2 start ecosystem-server.config.js
    fi

    # Wait for health check
    wait_for_health_check

    print_status "Application reloaded successfully"
}

# Restart application (with downtime)
restart_application() {
    print_status "Restarting application..."

    pm2 restart sofihr

    # Wait for health check
    wait_for_health_check

    print_status "Application restarted successfully"
}

# Check nginx status
check_nginx() {
    print_status "Checking nginx status..."

    if systemctl is-active --quiet nginx; then
        print_status "Nginx is running"
        return 0
    else
        print_warning "Nginx is not running, starting it..."
        sudo systemctl start nginx
        return $?
    fi
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."

    # Save PM2 configuration
    pm2 save

    # ПРИНУДИТЕЛЬНО ОЧИЩАЕМ ВСЕ КЭШИ Next.js
    print_status "🧹 ПРИНУДИТЕЛЬНО ОЧИЩАЕМ ВСЕ КЭШИ Next.js..."
    rm -rf /home/ubuntu/sofihr.ru/.next 2>/dev/null || true

    # Optional: Clean old logs (keep last 7 days)
    find /home/ubuntu/sofihr.ru/logs -name "*.log" -mtime +7 -delete 2>/dev/null || true

    print_status "Cleanup completed"
}

# Rollback function
rollback() {
    print_error "Rolling back to previous version..."

    # Get the previous version from PM2
    pm2 resurrect

    # Restart the application
    pm2 restart sofihr

    print_status "Rollback completed"
}

# Main deployment function
main() {
    local START_TIME=$(date +%s)
    print_status "Starting PM2 deployment with nginx proxy..."

    create_logs_dir

    # Check nginx
    check_nginx

    # Build new version
    build_new_version

    # Check if application is already running
    if is_app_running; then
        print_status "Application is running, performing zero-downtime reload..."
        reload_application
    else
        print_status "Application is not running, starting for the first time..."
        start_first_time
    fi

    # Cleanup
    cleanup

    local END_TIME=$(date +%s)
    local DURATION=$((END_TIME - START_TIME))

    print_status "✅ PM2 deployment with nginx proxy completed successfully!"
    print_status "⏱️ Время выполнения: ${DURATION} секунд"
    print_status "📊 Current PM2 status:"
    pm2 list
    print_status "🌐 Application is accessible via nginx proxy"
}

# Handle script arguments
case "${1:-}" in
    "status")
        print_status "Current deployment status:"
        pm2 list
        echo ""
        if is_app_running; then
            print_status "Application is running"
            print_status "Health check:"
            curl -s http://localhost:3000/api/health || echo "Health check failed"
            echo ""
            print_status "Nginx status:"
            systemctl status nginx --no-pager -l
        else
            print_warning "Application is not running"
        fi
        ;;
    "restart")
        print_status "Restarting application..."
        restart_application
        ;;
    "reload")
        print_status "Reloading application..."
        reload_application
        ;;
    "rollback")
        rollback
        ;;
    "logs")
        pm2 logs sofihr
        ;;
    "monitor")
        pm2 monit
        ;;
    "nginx")
        print_status "Nginx status:"
        systemctl status nginx --no-pager -l
        echo ""
        print_status "Nginx configuration test:"
        nginx -t
        ;;
    "stop")
        print_status "Stopping application..."
        pm2 stop sofihr
        ;;
    "delete")
        print_status "Deleting application..."
        pm2 delete sofihr
        pm2 save
        ;;
    "clean")
        print_status "Cleaning up everything..."
        pm2 delete all
        pm2 save
        rm -rf /home/ubuntu/sofihr.ru/logs/*
        ;;
    *)
        main
        ;;
esac
