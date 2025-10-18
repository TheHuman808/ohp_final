# 🌐 Настройка для домена partners.omemo-health.ru

## ✅ Приложение настроено для вашего домена!

**Ваш домен:** https://partners.omemo-health.ru

## 🔧 Настройка GitHub Pages с кастомным доменом:

### 1. Откройте репозиторий:
https://github.com/TheHuman808/telegram-referral-bot

### 2. Настройте GitHub Pages:
- Нажмите **"Settings"** (вкладка справа)
- Прокрутите до **"Pages"** (левое меню)
- В разделе **"Source"** выберите **"Deploy from a branch"**
- В поле **"Branch"** выберите **"gh-pages"**
- В поле **"Folder"** выберите **"/ (root)"**

### 3. Настройте кастомный домен:
- В разделе **"Custom domain"** введите: `partners.omemo-health.ru`
- Нажмите **"Save"**
- GitHub покажет DNS записи для настройки

### 4. Настройте DNS у вашего провайдера:
Добавьте CNAME запись:
```
Type: CNAME
Name: partners
Value: thehuman808.github.io
TTL: 3600
```

## 🚀 Развертывание:

```bash
npm run deploy
```

## 📱 Настройка Telegram бота:

### 1. Откройте @BotFather в Telegram
### 2. Отправьте `/mybots`
### 3. Выберите вашего бота
### 4. Нажмите **"Bot Settings"** → **"Menu Button"**
### 5. URL: `https://partners.omemo-health.ru`

## 🧪 Тестирование:

1. **Откройте** https://partners.omemo-health.ru
2. **Введите промокод** (например: `DEMO123`)
3. **Нажмите "Создать аккаунт"** - появится сообщение о демо-режиме
4. **Подтвердите** - создастся тестовый пользователь

## ✅ Готово!

После настройки DNS ваше приложение будет доступно по адресу:
**https://partners.omemo-health.ru**

- ✅ **Публичный доступ** без авторизации
- ✅ **Демо-режим** для показа клиентам
- ✅ **Полная интеграция** с Telegram ботом
- ✅ **Работа с Google Sheets**
