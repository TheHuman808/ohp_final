#!/bin/bash

echo "🚀 ПУШИМ В СУЩЕСТВУЮЩИЙ РЕПОЗИТОРИЙ ohp_final!"

# Инициализируем Git
echo "Инициализируем Git..."
git init

# Добавляем все файлы
echo "Добавляем файлы..."
git add .

# Коммитим
echo "Коммитим..."
git commit -m "NAVIGATION ORANGE v31.0: Orange buttons in navigation menu - EXISTING REPO PUSH"

# Создаем ветку main
git branch -M main

# Добавляем remote
echo "Добавляем remote..."
git remote add origin https://github.com/TheHuman808/ohp_final.git

# Пушим в существующий репозиторий
echo "Пушим в существующий репозиторий..."
git push -u origin main --force

echo "✅ ГОТОВО! Запушено в https://github.com/TheHuman808/ohp_final"
