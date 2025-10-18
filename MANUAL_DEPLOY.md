# 🚀 РУЧНОЕ РАЗВЕРТЫВАНИЕ

## Проблема: Нет места на диске для автоматического развертывания

У вас есть готовое приложение, но нет места для автоматического развертывания. Вот несколько способов:

## Способ 1: Через GitHub Web Interface (Самый простой)

### 1. Откройте репозиторий
Перейдите на https://github.com/TheHuman808/telegram-referral-bot

### 2. Загрузите файлы через веб-интерфейс
1. Нажмите **"Add file"** → **"Upload files"**
2. Перетащите следующие файлы:
   - `package.json`
   - `vite.config.ts`
   - `tsconfig.json`
   - `tailwind.config.ts`
   - `index.html`
   - `src/` (вся папка)
   - `public/` (вся папка)
   - `components.json`
   - `.gitignore`

### 3. Создайте коммит
- **Commit message:** `Add source files`
- Нажмите **"Commit changes"**

## Способ 2: Через GitHub CLI с токеном

### 1. Создайте Personal Access Token
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Note: `telegram-referral-bot`
4. Scopes: `repo`
5. Generate token
6. Скопируйте токен

### 2. Используйте токен для push
```bash
# Замените YOUR_TOKEN на ваш токен
git push https://YOUR_TOKEN@github.com/TheHuman808/telegram-referral-bot.git main
```

## Способ 3: Через Vercel (Рекомендуется)

### 1. Установите Vercel CLI
```bash
npm i -g vercel
```

### 2. Войдите в Vercel
```bash
vercel login
```

### 3. Разверните приложение
```bash
vercel --prod
```

## Способ 4: Через Netlify

### 1. Установите Netlify CLI
```bash
npm i -g netlify-cli
```

### 2. Соберите приложение
```bash
npm run build
```

### 3. Разверните
```bash
netlify deploy --prod --dir=dist
```

## 🎯 После загрузки файлов

### 1. Настройте GitHub Pages
1. Settings → Pages
2. Source: Deploy from a branch
3. Branch: main
4. Folder: / (root)
5. Save

### 2. Соберите приложение
```bash
npm run build
```

### 3. Разверните на GitHub Pages
```bash
gh-pages -d dist
```

## 📱 Результат

Ваше приложение будет доступно по адресу:
`https://thehuman808.github.io/telegram-referral-bot`

---

**Рекомендую использовать Vercel - это самый быстрый способ! 🚀**
