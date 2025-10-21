# OHP - Партнерская программа v24.0 ORANGE BUTTONS

## 🚀 Что включено:

### ✅ Оранжевые кнопки вместо синих
- Все кнопки "Создать новый аккаунт" теперь оранжевые
- Кнопка "Завершить регистрацию" оранжевая
- Кнопка "Тест регистрации" оранжевая

### ✅ Кнопка "Назад" на экране ввода данных
- Добавлена кнопка "Назад" в PersonalDataView
- Позволяет вернуться к предыдущему экрану

### ✅ Убраны все символы ✓ и ⚠
- Удалены тестовые сообщения
- Убраны символы из консольных логов

### ✅ Обновленный Google Apps Script URL
- URL: `https://script.google.com/macros/s/AKfycbyCHYl8Cw_pyUUtGigdHzv7VyU9Il4Gnfke1VFbTDu7-nA0Ux1at7ReaUljCr_gwW2E/exec`

## 📁 Структура файлов:

```
src/
├── components/
│   ├── views/
│   │   ├── RegistrationView.tsx     # Оранжевые кнопки
│   │   ├── PersonalDataView.tsx     # Кнопка "Назад"
│   │   └── TestAppsScriptConnection.tsx # Оранжевые кнопки
│   └── ui/
│       └── button.tsx               # Базовый компонент кнопки
├── services/
│   └── googleSheetsService.ts      # Обновленный URL
├── App.tsx                         # v24.0
└── pages/
    └── Index.tsx                   # Убраны символы

index.html                          # v24.0 заголовок
vite.config.ts                      # v24.0 asset names
package.json                        # Зависимости
```

## 🚀 Как развернуть:

### Вариант 1: Netlify
1. Распакуйте архив
2. Зайдите на [app.netlify.com](https://app.netlify.com/)
3. Создайте новый сайт из Git
4. Подключите к репозиторию
5. Настройки: Build command: `npm run build`, Publish directory: `dist`

### Вариант 2: Vercel
1. Распакуйте архив
2. Зайдите на [vercel.com](https://vercel.com/)
3. Создайте новый проект
4. Подключите к репозиторию
5. Настройки: Build command: `npm run build`, Output directory: `dist`

### Вариант 3: GitHub Pages
1. Распакуйте архив
2. Загрузите в GitHub репозиторий
3. Включите GitHub Pages в настройках
4. Выберите источник: GitHub Actions

## 🔧 Команды для сборки:

```bash
# Установка зависимостей
npm install

# Сборка для продакшена
npm run build

# Запуск в режиме разработки
npm run dev
```

## 📝 Изменения в коде:

### RegistrationView.tsx
```tsx
// Было:
className="w-full bg-blue-600 hover:bg-blue-700"

// Стало:
className="w-full bg-orange-600 hover:bg-orange-700"
```

### PersonalDataView.tsx
```tsx
// Добавлена кнопка "Назад":
{onBack && (
  <Button 
    onClick={onBack}
    variant="outline"
    className="w-full"
    disabled={loading}
  >
    Назад
  </Button>
)}
```

### googleSheetsService.ts
```typescript
// Обновлен URL:
this.webAppUrl = 'https://script.google.com/macros/s/AKfycbyCHYl8Cw_pyUUtGigdHzv7VyU9Il4Gnfke1VFbTDu7-nA0Ux1at7ReaUljCr_gwW2E/exec';
```

## 🎯 Ожидаемый результат:

- **Оранжевые кнопки** вместо синих
- **Кнопка "Назад"** на экране ввода данных
- **Убраны символы ✓ и ⚠**
- **Новый заголовок v24.0**
- **Работающий Google Apps Script**

## 📞 Поддержка:

Если что-то не работает, проверьте:
1. Правильность настройки Google Apps Script
2. Настройки CORS в Google Apps Script
3. Переменные окружения в Netlify/Vercel
4. Логи в консоли браузера

---
**Версия:** v24.0 ORANGE BUTTONS FORCE PUSH  
**Дата:** 2025-01-20  
**Статус:** Готово к деплою
