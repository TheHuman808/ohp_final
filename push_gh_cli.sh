#!/bin/bash

echo "🚀 ПУШИМ ЧЕРЕЗ GITHUB CLI!"

# Инициализируем Git
echo "Инициализируем Git..."
git init

# Добавляем все файлы
echo "Добавляем файлы..."
git add .

# Коммитим
echo "Коммитим..."
git commit -m "NAVIGATION ORANGE v31.0: Orange buttons in navigation menu - GH CLI PUSH"

# Создаем ветку main
git branch -M main

# Создаем репозиторий и пушим через GitHub CLI
echo "Создаем репозиторий и пушим..."
gh repo create ohp_final --public --description "OHP Partner Program v31.0 - Orange Buttons Fixed" --source=. --remote=origin --push --force

echo "✅ ГОТОВО! Запушено в https://github.com/TheHuman808/ohp_final"
