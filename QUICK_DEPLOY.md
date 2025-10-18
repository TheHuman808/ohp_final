# 🚀 БЫСТРОЕ РАЗВЕРТЫВАНИЕ (5 минут)

## Шаг 1: Создайте репозиторий на GitHub

1. **Откройте** [github.com](https://github.com)
2. **Нажмите** зеленую кнопку **"New"** или **"+"** → **"New repository"**
3. **Название репозитория:** `telegram-referral-bot`
4. **Описание:** `Telegram referral bot with full auth system`
5. **Выберите:** `Public` (для бесплатного GitHub Pages)
6. **НЕ** добавляйте README, .gitignore, лицензию
7. **Нажмите** **"Create repository"**

## Шаг 2: Подключите к GitHub

**Скопируйте и выполните эти команды** (замените YOUR_USERNAME на ваш GitHub username):

```bash
# Подключите к вашему репозиторию
git remote add origin https://github.com/YOUR_USERNAME/telegram-referral-bot.git

# Отправьте код на GitHub
git branch -M main
git push -u origin main
```

## Шаг 3: Разверните на GitHub Pages

```bash
# Разверните приложение
gh-pages -d dist
```

## Шаг 4: Настройте GitHub Pages

1. **Перейдите** в ваш репозиторий на GitHub
2. **Нажмите** вкладку **"Settings"**
3. **Найдите** раздел **"Pages"** в левом меню
4. **В разделе "Source":**
   - Выберите **"Deploy from a branch"**
   - В **"Branch"** выберите **"gh-pages"**
   - В **"Folder"** выберите **"/ (root)"**
5. **Нажмите** **"Save"**

## Шаг 5: Получите ссылку

Ваше приложение будет доступно по адресу:
`https://YOUR_USERNAME.github.io/telegram-referral-bot`

## 🎯 Готово!

Теперь у вас есть:
- ✅ **Развернутое приложение** на GitHub Pages
- ✅ **Публичный URL** для тестирования
- ✅ **Автоматические обновления** при push в main

## 🔄 Обновление приложения

Для обновления:
```bash
# Внесите изменения
git add .
git commit -m "Update app"
git push origin main

# Пересоберите и разверните
npm run build
gh-pages -d dist
```

---

**Создайте репозиторий на GitHub и выполните команды выше! 🚀**
