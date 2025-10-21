# Инструкция для создания архива ohp-final-clean.tar.gz

## 📦 Создание архива:

### В терминале выполните:
```bash
cd /Users/brtads/Downloads/ohp-main
tar -czf ohp-final-clean.tar.gz --exclude='node_modules' --exclude='.git' --exclude='*.tar.gz' --exclude='dist' --exclude='.github' .
```

### Или через Finder:
1. Откройте папку `/Users/brtads/Downloads/ohp-main`
2. Выделите все файлы и папки КРОМЕ:
   - `node_modules` (если есть)
   - `.git` (если есть)
   - `*.tar.gz` файлы
   - `dist` (если есть)
   - `.github` (если есть)
3. Создайте ZIP архив
4. Переименуйте в `ohp-final-clean.tar.gz`

## ✅ Что включено в архив:
- **Оранжевые кнопки** в RegistrationView.tsx
- **Кнопка "Назад"** в PersonalDataView.tsx
- **Убраны символы ✓ и ⚠**
- **Обновленный Google Apps Script URL**
- **Версия v25.0**

## 🚀 После создания архива:
1. **Загрузите в GitHub:**
   - Зайдите на https://github.com/TheHuman808/ohp_final
   - Нажмите "Add file" → "Upload files"
   - Перетащите все файлы из архива
   - Напишите коммит: "FINAL REPO v25.0: ORANGE BUTTONS FINAL REPO"
   - Нажмите "Commit changes"

2. **Подключите Netlify/Vercel к репозиторию ohp_final**

---
**Статус:** Готово к созданию архива
