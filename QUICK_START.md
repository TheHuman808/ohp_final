# ⚡ Быстрый старт - Развертывание за 5 минут

## 🎯 Самый простой способ (Vercel + Railway)

### 1. Подготовка (2 минуты)

```bash
# 1. Загрузите код на GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/ohp-main.git
git push -u origin main

# 2. Создайте файл .env.production
cat > .env.production << EOF
VITE_GOOGLE_SHEETS_ID=your_sheets_id
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_APPS_SCRIPT_URL=your_apps_script_url
VITE_TELEGRAM_BOT_TOKEN=8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0
VITE_WEB_APP_URL=https://your-app.vercel.app
EOF
```

### 2. Развертывание фронтенда на Vercel (1 минута)

1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите ваш репозиторий
5. Добавьте переменные окружения:
   - `VITE_GOOGLE_SHEETS_ID` = ваш ID таблицы
   - `VITE_GOOGLE_SHEETS_API_KEY` = ваш API ключ
   - `VITE_GOOGLE_APPS_SCRIPT_URL` = ваш Apps Script URL
   - `VITE_TELEGRAM_BOT_TOKEN` = `8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0`
6. Нажмите "Deploy"

### 3. Развертывание сервера бота на Railway (1 минута)

1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Создайте новый проект
4. Добавьте переменные окружения:
   - `PORT` = `3001`
   - `WEB_APP_URL` = URL вашего Vercel приложения
   - `WEBHOOK_URL` = URL вашего Railway приложения
5. Деплойте

### 4. Настройка Telegram webhook (1 минута)

```bash
# Замените your-railway-url на ваш URL Railway
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-railway-url.railway.app/webhook"}'
```

## 🎉 Готово!

Теперь ваша реферальная система работает:
- **Фронтенд:** https://your-app.vercel.app
- **Бот:** @ohp_bot в Telegram
- **Webhook:** https://your-railway-url.railway.app/webhook

## 🧪 Тестирование

1. Откройте бота @ohp_bot в Telegram
2. Отправьте `/start`
3. Нажмите "Войти в приложение"
4. Протестируйте авторизацию

## 💰 Стоимость

- **Vercel:** Бесплатно (до 100GB трафика)
- **Railway:** Бесплатно (до 500 часов)
- **Итого:** $0/месяц

## 🔧 Альтернативный способ - VPS

Если нужен полный контроль:

```bash
# Используйте готовый скрипт
./deploy.sh vps

# Или следуйте инструкции в DEPLOYMENT_GUIDE.md
```

## 📞 Поддержка

- **Документация:** `DEPLOYMENT_GUIDE.md`
- **Telegram Bot API:** [core.telegram.org/bots/api](https://core.telegram.org/bots/api)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Railway Docs:** [docs.railway.app](https://docs.railway.app)

---

**Важно:** Не забудьте обновить переменные окружения с вашими реальными данными Google Sheets!
