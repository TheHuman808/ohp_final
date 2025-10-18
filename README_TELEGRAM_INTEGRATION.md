# Интеграция Telegram бота с реферальной системой

## 🎯 Что реализовано

### 1. Система авторизации
- **Авторизация через промокод**: Пользователь вводит промокод партнера, система проверяет его в Google Sheets
- **Авторизация через Telegram**: Пользователь нажимает "У меня уже есть аккаунт", система проверяет Telegram ID
- **Автоматическое получение данных**: Telegram Web App автоматически передает username, имя, фамилию пользователя

### 2. Telegram Bot API интеграция
- **Сервис для работы с ботом** (`telegramBotService.ts`)
- **Хук для Telegram Web App** (`useTelegramWebApp.ts`)
- **Обновленные типы TypeScript** для полной поддержки Telegram API
- **Сервер для обработки webhook'ов** (`telegram-bot-server.js`)

### 3. Улучшенный UI
- **Интеграция с Telegram Web App**: Кнопки, вибрация, уведомления
- **Адаптивный дизайн**: Работает в Telegram и браузере
- **Haptic feedback**: Тактильная обратная связь для действий пользователя

## 🚀 Быстрый старт

### 1. Установка зависимостей
```bash
# Основные зависимости уже установлены
npm install

# Дополнительные зависимости для сервера бота
npm run bot:install
```

### 2. Запуск приложения
```bash
# Запуск React приложения
npm run dev

# В другом терминале - запуск сервера бота
npm run bot:dev
```

### 3. Настройка webhook (для продакшна)
```bash
# Установить webhook
npm run bot:webhook:set

# Проверить информацию о боте
npm run bot:info
```

## 📱 Как это работает

### Сценарий 1: Новый пользователь с промокодом
1. Пользователь открывает бота в Telegram
2. Нажимает "Войти в приложение"
3. Вводит промокод партнера
4. Заполняет персональные данные
5. Получает свой уникальный промокод
6. Username сохраняется в Google Sheets

### Сценарий 2: Существующий пользователь
1. Пользователь открывает бота в Telegram
2. Нажимает "У меня уже есть аккаунт"
3. Система проверяет Telegram ID в Google Sheets
4. Загружаются данные пользователя
5. Показывается дашборд с промокодом

## 🔧 Конфигурация

### Переменные окружения
Создайте файл `.env` в корне проекта:

```env
# Google Sheets (уже настроено)
VITE_GOOGLE_SHEETS_ID=your_sheets_id
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_APPS_SCRIPT_URL=your_apps_script_url

# Telegram Bot (новое)
VITE_TELEGRAM_BOT_TOKEN=8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0
VITE_WEB_APP_URL=https://your-app-url.com
```

### Настройка Google Sheets
Убедитесь, что в Google Sheets есть колонка для username (колонка G в листе "Партнеры").

## 📊 Структура данных в Google Sheets

### Лист "Партнеры"
| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ID | Telegram ID | Имя | Фамилия | Телефон | Email | **Username** | Промокод | Промокод пригласившего | Telegram ID пригласившего | Дата регистрации | Общий доход | Количество продаж |

**Username** (колонка G) теперь автоматически заполняется из Telegram данных.

## 🛠 API Endpoints

### Telegram Bot Server
- `POST /webhook` - Получение обновлений от Telegram
- `GET /health` - Проверка состояния
- `GET /bot-info` - Информация о боте
- `POST /set-webhook` - Установка webhook
- `POST /delete-webhook` - Удаление webhook

### Примеры использования
```bash
# Проверить состояние сервера
curl http://localhost:3001/health

# Получить информацию о боте
curl http://localhost:3001/bot-info

# Отправить сообщение пользователю (через API)
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/sendMessage" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "USER_ID", "text": "Привет!"}'
```

## 🧪 Тестирование

### 1. Тест бота
```bash
# Запустить тестовый скрипт
node test-telegram-bot.js
```

### 2. Тест в браузере
Откройте `http://localhost:5173` - приложение должно работать в тестовом режиме.

### 3. Тест в Telegram
1. Найдите бота по username: `@your_bot_username`
2. Отправьте `/start`
3. Нажмите "Войти в приложение"
4. Протестируйте авторизацию

## 🔒 Безопасность

- **Валидация данных**: Все данные от Telegram проверяются
- **HTTPS только**: Webhook должен использовать HTTPS
- **Ограничение доступа**: Административные endpoint'ы защищены
- **Логирование**: Все действия логируются для отладки

## 📈 Мониторинг

### Логи сервера
Сервер выводит подробные логи:
- Входящие обновления от Telegram
- Ошибки API
- Статус webhook'ов

### Проверка webhook
```bash
curl "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/getWebhookInfo"
```

## 🚀 Деплой

### 1. Подготовка
```bash
# Сборка приложения
npm run build

# Установка зависимостей на сервере
npm run bot:install
```

### 2. Настройка webhook
```bash
# Замените your-domain.com на ваш домен
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-domain.com/webhook"}'
```

### 3. Запуск
```bash
# Запуск сервера бота
npm run bot:start

# Запуск веб-приложения (через PM2, Docker, etc.)
```

## 🎉 Готово!

Ваша реферальная система теперь полностью интегрирована с Telegram:

✅ **Авторизация через промокод** - пользователи могут вводить промокоды партнеров  
✅ **Авторизация через Telegram** - существующие пользователи входят по Telegram ID  
✅ **Автоматическое сохранение username** - данные пользователя сохраняются в Google Sheets  
✅ **Telegram Web App** - нативное приложение в Telegram  
✅ **Haptic feedback** - тактильная обратная связь  
✅ **Адаптивный UI** - работает в Telegram и браузере  

Теперь пользователи могут легко регистрироваться и получать свои реферальные промокоды прямо в Telegram!
