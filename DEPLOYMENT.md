# 🚀 Деплой SofiHR Frontend на боевой сервер

## 📋 Предварительные требования

### На сервере должно быть установлено:
- Ubuntu 20.04+ или 22.04+
- Git
- SSH доступ с ключами
- Права sudo для пользователя ubuntu

## 🔧 Шаг 1: Первоначальная настройка сервера

### 1.1 Подключение к серверу
```bash
ssh ubuntu@sofihr.ru
```

### 1.2 Запуск скрипта настройки
```bash
# Скачиваем скрипт настройки
curl -O https://raw.githubusercontent.com/YOUR_USERNAME/recruitment-front/main/server-setup.sh
chmod +x server-setup.sh

# Запускаем настройку
./server-setup.sh
```

**⚠️ ВАЖНО:** Перед запуском отредактируйте скрипт:
- Замените `YOUR_USERNAME` на ваше имя пользователя в Bitbucket
- Замените `your-email@example.com` на ваш email для SSL сертификатов

## 🔑 Шаг 2: Настройка Bitbucket Pipelines

### 2.1 Настройка SSH ключей
В настройках Bitbucket репозитория добавьте SSH ключ сервера:
```bash
# На сервере генерируем ключ
ssh-keygen -t rsa -b 4096 -C "deploy@sofihr.ru"

# Копируем публичный ключ
cat ~/.ssh/id_rsa.pub
```

### 2.2 Настройка self-hosted runner
В настройках Bitbucket репозитория:
1. Перейдите в **Repository settings** → **Pipelines** → **Runners**
2. Добавьте **Self-hosted runner**
3. Скачайте и запустите runner на сервере

## 🚀 Шаг 3: Первый деплой

### 3.1 Push в master ветку
```bash
git add .
git commit -m "Initial deployment setup"
git push origin master
```

### 3.2 Мониторинг деплоя
В Bitbucket Pipelines следите за процессом деплоя.

## 📊 Шаг 4: Проверка деплоя

### 4.1 Проверка статуса
```bash
# На сервере
./deploy-pm2-nginx-proxy.sh status
```

### 4.2 Проверка логов
```bash
# PM2 логи
./deploy-pm2-nginx-proxy.sh logs

# Nginx логи
sudo tail -f /var/log/nginx/sofihr.ru.access.log
sudo tail -f /var/log/nginx/sofihr.ru.error.log
```

### 4.3 Проверка доступности
```bash
# Health check
curl https://sofihr.ru/api/health

# Основная страница
curl -I https://sofihr.ru
```

## 🔄 Шаг 5: Последующие деплои

### 5.1 Автоматический деплой
При каждом push в master ветку автоматически запускается деплой.

### 5.2 Ручной деплой
```bash
# На сервере
./deploy-pm2-nginx-proxy.sh reload
```

## 🛠 Управление приложением

### Основные команды
```bash
# Статус
./deploy-pm2-nginx-proxy.sh status

# Перезапуск
./deploy-pm2-nginx-proxy.sh restart

# Graceful reload (без простоя)
./deploy-pm2-nginx-proxy.sh reload

# Логи
./deploy-pm2-nginx-proxy.sh logs

# Мониторинг
./deploy-pm2-nginx-proxy.sh monitor

# Остановка
./deploy-pm2-nginx-proxy.sh stop

# Полная очистка
./deploy-pm2-nginx-proxy.sh clean
```

### PM2 команды
```bash
# Список процессов
pm2 list

# Мониторинг
pm2 monit

# Логи
pm2 logs sofihr

# Перезапуск
pm2 restart sofihr

# Остановка
pm2 stop sofihr
```

## 🔒 Безопасность

### Firewall
```bash
# Проверка статуса
sudo ufw status

# Открытые порты
sudo ufw status numbered
```

### SSL сертификаты
```bash
# Проверка статуса
sudo certbot certificates

# Ручное обновление
sudo certbot renew
```

## 📈 Мониторинг

### 1. Health Check
- Endpoint: `https://sofihr.ru/api/health`
- Проверяет состояние приложения
- Возвращает информацию о версии и uptime

### 2. PM2 Dashboard
```bash
pm2 monit
```

### 3. Nginx статус
```bash
sudo systemctl status nginx
```

## 🚨 Устранение неполадок

### Проблема: Приложение не запускается
```bash
# Проверяем логи
./deploy-pm2-nginx-proxy.sh logs

# Проверяем статус PM2
pm2 list

# Проверяем порт
sudo netstat -tlnp | grep :3000
```

### Проблема: Nginx не работает
```bash
# Проверяем статус
sudo systemctl status nginx

# Проверяем конфигурацию
sudo nginx -t

# Перезапускаем
sudo systemctl restart nginx
```

### Проблема: SSL сертификат истек
```bash
# Обновляем сертификат
sudo certbot renew

# Перезапускаем nginx
sudo systemctl reload nginx
```

## 📝 Полезные команды

### Система
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Проверка места на диске
df -h

# Проверка памяти
free -h

# Проверка нагрузки
htop
```

### Git
```bash
# Проверка статуса
git status

# Получение изменений
git fetch origin
git reset --hard origin/master

# Очистка
git clean -fd
```

## 🎯 Результат

После успешного деплоя:
- ✅ Фронтенд доступен по адресу `https://sofihr.ru`
- ✅ Автоматический деплой при push в master
- ✅ Бесшовный деплой без простоя
- ✅ SSL сертификат настроен
- ✅ Мониторинг и логирование
- ✅ Автоматический перезапуск при сбоях

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `./deploy-pm2-nginx-proxy.sh logs`
2. Проверьте статус: `./deploy-pm2-nginx-proxy.sh status`
3. Проверьте nginx: `./deploy-pm2-nginx-proxy.sh nginx`
4. Обратитесь к системному администратору 