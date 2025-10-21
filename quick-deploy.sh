#!/bin/bash

# OHP - Партнерская программа v16.0
# Скрипт для быстрого деплоя

echo "🚀 OHP - Партнерская программа v16.0"
echo "=================================="

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта"
    exit 1
fi

echo "✅ Проект найден"

# Устанавливаем зависимости
echo "📦 Устанавливаем зависимости..."
npm install

# Собираем проект
echo "🔨 Собираем проект..."
npm run build

# Проверяем, что сборка прошла успешно
if [ ! -d "dist" ]; then
    echo "❌ Ошибка: Сборка не удалась"
    exit 1
fi

echo "✅ Сборка завершена успешно"
echo "📁 Файлы готовы в директории dist/"

# Показываем размер сборки
echo "📊 Размер сборки:"
du -sh dist/

echo ""
echo "🎯 Готово к деплою!"
echo ""
echo "Варианты деплоя:"
echo "1. Vercel: https://vercel.com/dashboard"
echo "2. GitHub Pages: https://github.com/TheHuman808/ohp/settings/pages"
echo "3. Netlify: https://app.netlify.com/"
echo ""
echo "📝 Версия: v16.0"
echo "📅 Дата: $(date)"
echo "🔑 Коммит: $(git rev-parse --short HEAD)"
