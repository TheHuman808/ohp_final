#!/bin/bash

echo "🚀 ПУШИМ NAVIGATION ORANGE v31.0!"

# Проверяем, есть ли уже Git репозиторий
if [ ! -d ".git" ]; then
    echo "Инициализируем Git..."
    git init
fi

# Добавляем все файлы
echo "Добавляем файлы..."
git add .

# Коммитим
echo "Коммитим..."
git commit -m "NAVIGATION ORANGE v31.0: Orange buttons in navigation menu"

# Создаем ветку main если не существует
git branch -M main

# Добавляем remote если не существует
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "Добавляем remote..."
    git remote add origin https://github.com/TheHuman808/ohp_final.git
fi

# Пушим
echo "Пушим..."
git push -u origin main --force

echo "✅ ГОТОВО! Запушено в https://github.com/TheHuman808/ohp_final"
