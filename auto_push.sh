#!/bin/bash

echo "🚀 АВТОМАТИЧЕСКИЙ ПУШ В НОВЫЙ РЕПОЗИТОРИЙ!"

# Проверяем, есть ли уже Git репозиторий
if [ -d ".git" ]; then
    echo "Git репозиторий уже существует, очищаем..."
    rm -rf .git
fi

# Инициализируем новый Git репозиторий
echo "Инициализируем Git..."
git init

# Добавляем все файлы
echo "Добавляем файлы..."
git add .

# Коммитим
echo "Коммитим..."
git commit -m "FIX v30.0: ORANGE BUTTONS FIXED - INITIAL COMMIT"

# Создаем ветку main
echo "Создаем ветку main..."
git branch -M main

echo "✅ Локальный репозиторий готов!"
echo ""
echo "📝 Теперь создайте репозиторий на GitHub:"
echo "   1. Зайдите на https://github.com/new"
echo "   2. Название: ohp-fixed-v30"
echo "   3. Описание: OHP Partner Program v30.0 - Orange Buttons Fixed"
echo "   4. Сделайте публичным"
echo "   5. НЕ добавляйте README, .gitignore или лицензию"
echo "   6. Нажмите 'Create repository'"
echo ""
echo "После создания выполните:"
echo "git remote add origin https://github.com/TheHuman808/ohp-fixed-v30.git"
echo "git push -u origin main"
echo ""
echo "✅ ГОТОВО!"
