# 🔐 Настройка аутентификации GitHub

## Проблема: Нужна аутентификация для push

GitHub требует аутентификацию для отправки кода. У вас есть несколько вариантов:

## Вариант 1: Personal Access Token (Рекомендуется)

### 1. Создайте токен доступа
1. Перейдите в **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Нажмите **"Generate new token"** → **"Generate new token (classic)"**
3. **Note:** `telegram-referral-bot`
4. **Expiration:** `No expiration` (или выберите срок)
5. **Scopes:** Отметьте `repo` (полный доступ к репозиториям)
6. Нажмите **"Generate token"**
7. **Скопируйте токен** (он больше не будет показан!)

### 2. Используйте токен для push
```bash
# Замените YOUR_TOKEN на ваш токен
git push https://YOUR_TOKEN@github.com/TheHuman808/telegram-referral-bot.git main
```

## Вариант 2: GitHub CLI (Проще)

### 1. Установите GitHub CLI
```bash
# macOS
brew install gh

# Или скачайте с https://cli.github.com/
```

### 2. Войдите в GitHub
```bash
gh auth login
# Выберите: GitHub.com → HTTPS → Yes → Login with a web browser
```

### 3. Push код
```bash
git push -u origin main
```

## Вариант 3: SSH ключи

### 1. Создайте SSH ключ
```bash
ssh-keygen -t ed25519 -C "your-email@example.com"
# Нажмите Enter для всех вопросов
```

### 2. Добавьте ключ в GitHub
```bash
# Скопируйте публичный ключ
cat ~/.ssh/id_ed25519.pub
```

1. Перейдите в **Settings** → **SSH and GPG keys**
2. Нажмите **"New SSH key"**
3. Вставьте скопированный ключ
4. Нажмите **"Add SSH key"**

### 3. Измените URL на SSH
```bash
git remote set-url origin git@github.com:TheHuman808/telegram-referral-bot.git
git push -u origin main
```

## 🚀 После успешного push

```bash
# Разверните на GitHub Pages
gh-pages -d dist
```

## 📱 Настройте GitHub Pages

1. Перейдите в **Settings** → **Pages**
2. **Source:** Deploy from a branch
3. **Branch:** gh-pages
4. **Folder:** / (root)
5. Нажмите **Save**

## 🎯 Результат

Ваше приложение будет доступно по адресу:
`https://thehuman808.github.io/telegram-referral-bot`

---

**Выберите один из вариантов выше для настройки аутентификации! 🔐**
