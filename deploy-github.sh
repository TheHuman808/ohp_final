#!/bin/bash

# Скрипт для развертывания на GitHub Pages

echo "🚀 Начинаем развертывание на GitHub Pages..."

# Проверяем, что мы в git репозитории
if [ ! -d ".git" ]; then
    echo "❌ Инициализируем git репозиторий..."
    git init
    git add .
    git commit -m "Initial commit"
fi

# Собираем приложение
echo "📦 Собираем приложение..."
npm run build

# Устанавливаем gh-pages если не установлен
if ! command -v gh-pages &> /dev/null; then
    echo "📥 Устанавливаем gh-pages..."
    npm install -g gh-pages
fi

# Развертываем на GitHub Pages
echo "🌐 Развертываем на GitHub Pages..."
gh-pages -d dist

echo "✅ Развертывание завершено!"
echo "🔗 Ваше приложение доступно по адресу: https://YOUR_USERNAME.github.io/YOUR_REPO_NAME"
echo ""
echo "📝 Следующие шаги:"
echo "1. Создайте репозиторий на GitHub"
echo "2. Добавьте remote: git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
echo "3. Запустите: git push -u origin main"
echo "4. Включите GitHub Pages в настройках репозитория"
