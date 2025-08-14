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
    print_status "Logs directory created"
}

# Build new version
build_new_version() {
    print_status "Building new version in temp dir (truly zero-downtime)..."

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
    
    export TERM=dumb
    export YARN_ENABLE_PROGRESS_BARS=0
    yarn install
    yarn build

    # Проверка успешности сборки
    if [ ! -d ".next" ]; then
        print_error "Build failed!"
        exit 1
    fi

    # Вернуться в production-папку
    cd -

    # Копируем новые артефакты в production (rsync для атомарности)
    rsync -a --delete $TMP_DIR/.next ./
    rsync -a --delete $TMP_DIR/public ./
    cp $TMP_DIR/package.json ./
    cp $TMP_DIR/yarn.lock ./
    # Можно добавить другие нужные файлы

    rm -rf $TMP_DIR

    print_status "New version built and copied to production folder"
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

    print_status "✅ PM2 deployment with nginx proxy completed successfully!"
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
