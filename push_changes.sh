#!/bin/bash

echo "🚀 ПУШИМ ИЗМЕНЕНИЯ В ohp_final!"

# Добавляем все файлы
echo "Добавляем файлы..."
git add .

# Коммитим
echo "Коммитим..."
git commit -m "NAVIGATION ORANGE v31.0: Orange buttons in navigation menu - CHANGES PUSH"

# Пушим
echo "Пушим..."
git push origin main --force

echo "✅ ГОТОВО! Запушено в https://github.com/TheHuman808/ohp_final"
