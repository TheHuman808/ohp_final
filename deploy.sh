#!/bin/bash

# Скрипт для быстрого развертывания реферальной системы
# Использование: ./deploy.sh [vercel|vps]

set -e

echo "🚀 Развертывание реферальной системы OHP"
echo "========================================"

# Проверяем аргументы
if [ $# -eq 0 ]; then
    echo "Использование: ./deploy.sh [vercel|vps]"
    echo ""
    echo "vercel - Развертывание на Vercel (рекомендуется)"
    echo "vps    - Развертывание на VPS"
    exit 1
fi

DEPLOY_TYPE=$1

# Функция для развертывания на Vercel
deploy_vercel() {
    echo "📦 Подготовка к развертыванию на Vercel..."
    
    # Проверяем наличие Vercel CLI
    if ! command -v vercel &> /dev/null; then
        echo "❌ Vercel CLI не установлен. Устанавливаем..."
        npm install -g vercel
    fi
    
    # Создаем файл .env.production если его нет
    if [ ! -f .env.production ]; then
        echo "📝 Создаем файл .env.production..."
        cat > .env.production << EOF
VITE_GOOGLE_SHEETS_ID=your_sheets_id
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_APPS_SCRIPT_URL=your_apps_script_url
VITE_TELEGRAM_BOT_TOKEN=8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0
VITE_WEB_APP_URL=https://your-app.vercel.app
EOF
        echo "⚠️  Не забудьте обновить переменные в .env.production!"
    fi
    
    # Собираем приложение
    echo "🔨 Сборка приложения..."
    npm run build
    
    # Развертываем
    echo "🚀 Развертывание на Vercel..."
    vercel --prod
    
    echo "✅ Развертывание на Vercel завершено!"
    echo "📋 Следующие шаги:"
    echo "1. Обновите переменные окружения в Vercel Dashboard"
    echo "2. Разверните сервер бота на Railway"
    echo "3. Настройте webhook для Telegram бота"
}

# Функция для развертывания на VPS
deploy_vps() {
    echo "📦 Подготовка к развертыванию на VPS..."
    
    # Проверяем наличие PM2
    if ! command -v pm2 &> /dev/null; then
        echo "❌ PM2 не установлен. Устанавливаем..."
        npm install -g pm2
    fi
    
    # Создаем файл .env если его нет
    if [ ! -f .env ]; then
        echo "📝 Создаем файл .env..."
        cat > .env << EOF
VITE_GOOGLE_SHEETS_ID=your_sheets_id
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_APPS_SCRIPT_URL=your_apps_script_url
VITE_TELEGRAM_BOT_TOKEN=8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0
VITE_WEB_APP_URL=https://your-domain.com
PORT=3001
WEB_APP_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com
EOF
        echo "⚠️  Не забудьте обновить переменные в .env!"
    fi
    
    # Устанавливаем зависимости
    echo "📦 Установка зависимостей..."
    npm install
    npm run bot:install
    
    # Собираем приложение
    echo "🔨 Сборка приложения..."
    npm run build
    
    # Запускаем сервисы
    echo "🚀 Запуск сервисов..."
    pm2 start telegram-bot-server.js --name "telegram-bot"
    pm2 serve dist 3000 --name "web-app"
    pm2 save
    
    echo "✅ Развертывание на VPS завершено!"
    echo "📋 Следующие шаги:"
    echo "1. Настройте Nginx для проксирования"
    echo "2. Настройте SSL сертификат"
    echo "3. Настройте webhook для Telegram бота"
}

# Функция для настройки webhook
setup_webhook() {
    echo "🔗 Настройка webhook для Telegram бота..."
    
    read -p "Введите URL вашего сервера (например: https://your-domain.com): " WEBHOOK_URL
    
    if [ -z "$WEBHOOK_URL" ]; then
        echo "❌ URL не может быть пустым!"
        exit 1
    fi
    
    echo "Настраиваем webhook: $WEBHOOK_URL/webhook"
    
    curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/setWebhook" \
        -H "Content-Type: application/json" \
        -d "{\"url\": \"$WEBHOOK_URL/webhook\"}"
    
    echo ""
    echo "✅ Webhook настроен!"
}

# Основная логика
case $DEPLOY_TYPE in
    "vercel")
        deploy_vercel
        ;;
    "vps")
        deploy_vps
        ;;
    "webhook")
        setup_webhook
        ;;
    *)
        echo "❌ Неизвестный тип развертывания: $DEPLOY_TYPE"
        echo "Доступные варианты: vercel, vps, webhook"
        exit 1
        ;;
esac

echo ""
echo "🎉 Готово! Ваша реферальная система развернута!"
echo "📖 Подробная документация: DEPLOYMENT_GUIDE.md"
