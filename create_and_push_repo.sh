#!/bin/bash

echo "🚀 СОЗДАЕМ НОВЫЙ РЕПОЗИТОРИЙ И ПУШИМ!"

# Создаем новый репозиторий через GitHub CLI (если установлен)
if command -v gh &> /dev/null; then
    echo "Создаем репозиторий через GitHub CLI..."
    gh repo create ohp-fixed-v30 --public --description "OHP Partner Program v30.0 - Orange Buttons Fixed" --source=. --remote=origin --push
else
    echo "GitHub CLI не найден, создаем репозиторий вручную..."
    
    # Инициализируем Git
    git init
    
    # Добавляем все файлы
    git add .
    
    # Коммитим
    git commit -m "FIX v30.0: ORANGE BUTTONS FIXED - INITIAL COMMIT"
    
    # Создаем ветку main
    git branch -M main
    
    echo "✅ Локальный репозиторий создан!"
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
fi

echo "✅ ГОТОВО!"
