# 🚀 Руководство по развертыванию реферальной системы

## 📋 Варианты развертывания

### 1. Простой хостинг (рекомендуется для начала)
- **Vercel** - бесплатно, автоматический деплой
- **Netlify** - бесплатно, простое развертывание
- **GitHub Pages** - бесплатно, через GitHub

### 2. VPS/Сервер (для полной функциональности)
- **DigitalOcean** - от $5/месяц
- **AWS EC2** - от $3/месяц
- **VPS от любого провайдера**

## 🌟 Рекомендуемый вариант: Vercel + Railway

### Шаг 1: Подготовка кода

1. **Создайте репозиторий на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/ohp-main.git
   git push -u origin main
   ```

2. **Создайте файл `.env.production`:**
   ```env
   VITE_GOOGLE_SHEETS_ID=your_sheets_id
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key
   VITE_GOOGLE_APPS_SCRIPT_URL=your_apps_script_url
   VITE_TELEGRAM_BOT_TOKEN=8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0
   VITE_WEB_APP_URL=https://your-app.vercel.app
   ```

### Шаг 2: Развертывание фронтенда на Vercel

1. **Перейдите на [vercel.com](https://vercel.com)**
2. **Войдите через GitHub**
3. **Нажмите "New Project"**
4. **Выберите ваш репозиторий**
5. **Настройте переменные окружения:**
   - `VITE_GOOGLE_SHEETS_ID`
   - `VITE_GOOGLE_SHEETS_API_KEY`
   - `VITE_GOOGLE_APPS_SCRIPT_URL`
   - `VITE_TELEGRAM_BOT_TOKEN`
   - `VITE_WEB_APP_URL` (будет автоматически установлен)
6. **Нажмите "Deploy"**

### Шаг 3: Развертывание сервера бота на Railway

1. **Перейдите на [railway.app](https://railway.app)**
2. **Войдите через GitHub**
3. **Создайте новый проект**
4. **Добавьте переменные окружения:**
   ```env
   PORT=3001
   WEB_APP_URL=https://your-app.vercel.app
   WEBHOOK_URL=https://your-bot.railway.app
   ```
5. **Деплойте сервер бота**

### Шаг 4: Настройка Telegram Webhook

```bash
# Замените your-bot.railway.app на ваш URL Railway
curl -X POST "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-bot.railway.app/webhook"}'
```

## 🛠 Альтернативный вариант: Полный VPS

### Требования к серверу
- **CPU:** 1 vCPU
- **RAM:** 1GB
- **Диск:** 20GB SSD
- **ОС:** Ubuntu 20.04+

### Установка на VPS

1. **Подключитесь к серверу:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Установите Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Установите PM2:**
   ```bash
   sudo npm install -g pm2
   ```

4. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/yourusername/ohp-main.git
   cd ohp-main
   ```

5. **Установите зависимости:**
   ```bash
   npm install
   npm run bot:install
   ```

6. **Создайте файл `.env`:**
   ```env
   VITE_GOOGLE_SHEETS_ID=your_sheets_id
   VITE_GOOGLE_SHEETS_API_KEY=your_api_key
   VITE_GOOGLE_APPS_SCRIPT_URL=your_apps_script_url
   VITE_TELEGRAM_BOT_TOKEN=8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0
   VITE_WEB_APP_URL=https://your-domain.com
   PORT=3001
   WEB_APP_URL=https://your-domain.com
   WEBHOOK_URL=https://your-domain.com
   ```

7. **Соберите приложение:**
   ```bash
   npm run build
   ```

8. **Настройте Nginx:**
   ```bash
   sudo apt install nginx
   sudo nano /etc/nginx/sites-available/ohp
   ```

   **Конфигурация Nginx:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /path/to/ohp-main/dist;
           try_files $uri $uri/ /index.html;
       }

       location /webhook {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

9. **Запустите сервисы:**
   ```bash
   # Запуск сервера бота
   pm2 start telegram-bot-server.js --name "telegram-bot"

   # Запуск веб-сервера
   pm2 serve dist 3000 --name "web-app"

   # Сохранение конфигурации PM2
   pm2 save
   pm2 startup
   ```

10. **Настройте SSL (Let's Encrypt):**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

## 🔧 Настройка домена

### 1. Покупка домена
- **Namecheap** - от $8/год
- **GoDaddy** - от $12/год
- **Cloudflare** - от $9/год

### 2. Настройка DNS
```
A    @    your-server-ip
CNAME www your-domain.com
```

## 📱 Настройка Telegram Web App

1. **Откройте [@BotFather](https://t.me/botfather)**
2. **Отправьте `/mybots`**
3. **Выберите вашего бота**
4. **Нажмите "Bot Settings" → "Menu Button"**
5. **Нажмите "Configure Menu Button"**
6. **Введите текст: "Открыть приложение"**
7. **Введите URL: `https://your-domain.com`**

## 🧪 Тестирование развертывания

### 1. Проверка фронтенда
```bash
curl https://your-domain.com
```

### 2. Проверка сервера бота
```bash
curl https://your-domain.com/webhook/health
```

### 3. Проверка Telegram бота
```bash
curl "https://api.telegram.org/bot8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0/getMe"
```

## 💰 Стоимость развертывания

### Бесплатный вариант (Vercel + Railway)
- **Vercel:** $0/месяц (до 100GB трафика)
- **Railway:** $0/месяц (до 500 часов)
- **Домен:** $8-12/год
- **Итого:** $8-12/год

### VPS вариант
- **VPS:** $3-5/месяц
- **Домен:** $8-12/год
- **Итого:** $44-72/год

## 🚀 Автоматический деплой

### GitHub Actions (для VPS)
Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to VPS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /path/to/ohp-main
          git pull origin main
          npm install
          npm run build
          pm2 restart all
```

## 🔒 Безопасность

### 1. Настройка файрвола
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Настройка SSL
```bash
sudo certbot --nginx -d your-domain.com
```

### 3. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

## 📊 Мониторинг

### 1. Логи PM2
```bash
pm2 logs
pm2 monit
```

### 2. Мониторинг Nginx
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 🎉 Готово!

После выполнения этих шагов ваша реферальная система будет полностью развернута и готова к использованию:

✅ **Фронтенд** работает на вашем домене  
✅ **Сервер бота** обрабатывает webhook'и  
✅ **Telegram Web App** интегрирован  
✅ **Google Sheets** подключен  
✅ **SSL сертификат** настроен  

Пользователи смогут открывать бота `@ohp_bot` в Telegram и использовать вашу реферальную систему!
