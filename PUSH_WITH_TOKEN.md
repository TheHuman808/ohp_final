# 🔐 Push с Personal Access Token

## Проблема: Нужен токен доступа

GitHub требует токен для push через HTTPS. Давайте создадим его:

## 1. Создайте Personal Access Token

1. **Перейдите** в GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Нажмите** "Generate new token (classic)"
3. **Note:** `telegram-referral-bot`
4. **Expiration:** `No expiration` (или выберите срок)
5. **Scopes:** Отметьте `repo` (полный доступ к репозиториям)
6. **Нажмите** "Generate token"
7. **Скопируйте токен** (он больше не будет показан!)

## 2. Используйте токен для push

```bash
# Замените YOUR_TOKEN на ваш токен
git push https://YOUR_TOKEN@github.com/TheHuman808/telegram-referral-bot.git main
```

## 3. После успешного push разверните

```bash
gh-pages -d dist
```

## 4. Настройте GitHub Pages

1. Перейдите в Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages
4. Folder: / (root)
5. Save

## 🎯 Результат

Ваше приложение будет доступно по адресу:
`https://thehuman808.github.io/telegram-referral-bot`

---

**Создайте токен и выполните команду push с токеном! 🔐**
