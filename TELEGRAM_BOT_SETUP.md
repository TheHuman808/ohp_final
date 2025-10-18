# Настройка Telegram бота для реферальной системы

## 1. Создание бота в Telegram

1. Откройте [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Введите имя бота (например: "Реферальная программа")
4. Введите username бота (например: "referral_program_bot")
5. Сохраните полученный токен: `8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0`

## 2. Настройка Web App

1. Отправьте команду `/newapp` боту @BotFather
2. Выберите вашего бота
3. Введите название приложения: "Реферальная программа"
4. Введите описание: "Система реферальных промокодов"
5. Загрузите иконку (опционально)
6. Введите URL вашего приложения: `https://your-domain.com`
7. Сохраните полученную ссылку на Web App

## 3. Настройка сервера бота

### Установка зависимостей

```bash
# В корневой папке проекта
npm install express axios nodemon
```

### Запуск сервера

```bash
# Разработка
npm run dev

# Продакшн
npm start
```

### Переменные окружения

Создайте файл `.env`:

```env
PORT=3001
WEB_APP_URL=https://your-app-url.com
WEBHOOK_URL=https://your-server-url.com
```

## 4. Настройка Webhook

### Локальная разработка (ngrok)

1. Установите ngrok: `npm install -g ngrok`
2. Запустите ngrok: `ngrok http 3001`
3. Скопируйте HTTPS URL (например: `https://abc123.ngrok.io`)
4. Установите webhook:

```bash
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://abc123.ngrok.io/webhook"}'
```

### Продакшн сервер

```bash
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-server-url.com/webhook"}'
```

## 5. Проверка работы

1. Отправьте `/start` боту в Telegram
2. Нажмите "Войти в приложение"
3. Проверьте, что приложение открывается и получает данные пользователя

## 6. API Endpoints

### Сервер бота

- `POST /webhook` - Webhook для получения обновлений от Telegram
- `GET /health` - Проверка состояния сервера
- `GET /bot-info` - Информация о боте
- `POST /set-webhook` - Установка webhook
- `POST /delete-webhook` - Удаление webhook

### Примеры запросов

```bash
# Проверить состояние
curl http://localhost:3001/health

# Получить информацию о боте
curl http://localhost:3001/bot-info

# Установить webhook
curl -X POST http://localhost:3001/set-webhook \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

## 7. Структура проекта

```
ohp-main/
├── src/
│   ├── services/
│   │   ├── telegramBotService.ts    # Сервис для работы с Telegram Bot API
│   │   └── googleSheetsService.ts   # Сервис для работы с Google Sheets
│   ├── hooks/
│   │   └── useTelegramWebApp.ts     # Хук для работы с Telegram Web App
│   ├── types/
│   │   └── telegram.d.ts            # TypeScript типы для Telegram
│   └── components/views/
│       └── RegistrationView.tsx     # Компонент авторизации
├── telegram-bot-server.js           # Сервер для обработки webhook'ов
├── package-bot.json                 # Зависимости для сервера бота
└── TELEGRAM_BOT_SETUP.md           # Эта инструкция
```

## 8. Логика работы

### Авторизация через промокод

1. Пользователь вводит промокод партнера
2. Система проверяет промокод в Google Sheets
3. При успешной проверке пользователь переходит к заполнению персональных данных
4. Создается новый аккаунт с уникальным промокодом
5. Username пользователя сохраняется в Google Sheets

### Авторизация через Telegram

1. Пользователь нажимает "У меня уже есть аккаунт"
2. Система проверяет Telegram ID в Google Sheets
3. Если пользователь найден - загружаются его данные
4. Если не найден - предлагается создать новый аккаунт

### Получение данных пользователя

Telegram Web App автоматически передает:
- `user.id` - уникальный ID пользователя
- `user.first_name` - имя
- `user.last_name` - фамилия (если указана)
- `user.username` - username (если указан)
- `user.language_code` - язык интерфейса

## 9. Отладка

### Проверка webhook

```bash
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/getWebhookInfo"
```

### Логи сервера

Сервер выводит подробные логи всех входящих обновлений и ошибок.

### Проверка в браузере

Откройте `https://your-app-url.com?tgWebAppStartParam=test` для тестирования без Telegram.

## 10. Безопасность

- Webhook URL должен использовать HTTPS
- Проверяйте подпись webhook'ов (опционально)
- Ограничьте доступ к административным endpoint'ам
- Используйте переменные окружения для чувствительных данных

## 11. Масштабирование

- Используйте Redis для кеширования
- Настройте load balancer для webhook'ов
- Мониторинг через логи и метрики
- Резервное копирование данных Google Sheets
