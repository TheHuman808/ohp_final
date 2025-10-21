#!/bin/bash

echo "🚀 ПУШИМ В GITHUB ohp_final!"

# Инициализируем Git
git init

# Добавляем remote
git remote add origin https://github.com/TheHuman808/ohp_final.git

# Добавляем все файлы
git add .

# Коммитим
git commit -m "FIX v30.0: ORANGE BUTTONS FIXED - PUSHED BY AI"

# Пушим в main
git branch -M main
git push -u origin main --force

echo "✅ ГОТОВО! Запушено в https://github.com/TheHuman808/ohp_final"
