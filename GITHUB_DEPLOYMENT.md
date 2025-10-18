# 🚀 Развертывание на GitHub Pages

## Быстрый способ (5 минут)

### 1. Создайте репозиторий на GitHub
1. Перейдите на [github.com](https://github.com)
2. Нажмите **"New repository"**
3. Название: `telegram-referral-bot` (или любое другое)
4. Выберите **"Public"** (для бесплатного GitHub Pages)
5. **НЕ** добавляйте README, .gitignore, лицензию
6. Нажмите **"Create repository"**

### 2. Инициализируйте git в проекте
```bash
# В папке проекта
git init
git add .
git commit -m "Initial commit"
```

### 3. Подключите к GitHub
```bash
# Замените YOUR_USERNAME и YOUR_REPO_NAME на ваши данные
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 4. Разверните на GitHub Pages
```bash
# Установите gh-pages
npm install -g gh-pages

# Разверните
gh-pages -d dist
```

### 5. Настройте GitHub Pages
1. Перейдите в **Settings** вашего репозитория
2. Найдите раздел **"Pages"** в левом меню
3. В **Source** выберите **"Deploy from a branch"**
4. В **Branch** выберите **"gh-pages"**
5. Нажмите **"Save"**

## 🎯 Результат

Ваше приложение будет доступно по адресу:
`https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## 🔧 Настройка Telegram бота

После развертывания обновите настройки бота:

### 1. Обновите Webhook
```bash
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/webhook"}'
```

### 2. Настройте Web App URL в @BotFather
1. Откройте @BotFather в Telegram
2. Отправьте `/mybots`
3. Выберите вашего бота
4. Нажмите **"Bot Settings"** → **"Menu Button"**
5. URL: `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`

## 🧪 Тестирование

1. Откройте `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME`
2. Протестируйте все функции:
   - 📱 Авторизация через Telegram
   - 🌐 Открытие Telegram в браузере
   - 🔐 Стандартная авторизация
   - 🧪 Тестовый режим

## 🔄 Обновление приложения

Для обновления приложения:
```bash
# Внесите изменения в код
git add .
git commit -m "Update app"
git push origin main

# Пересоберите и разверните
npm run build
gh-pages -d dist
```

## 📱 Мобильная версия

GitHub Pages автоматически оптимизирует приложение для мобильных устройств.

---

**Готово! Ваше приложение развернуто на GitHub Pages! 🎉**
