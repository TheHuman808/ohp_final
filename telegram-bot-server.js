// Простой сервер для обработки webhook'ов от Telegram бота
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Конфигурация бота
const BOT_TOKEN = '8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0';
const WEB_APP_URL = process.env.WEB_APP_URL || 'https://your-app-url.com';
const BOT_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Получить информацию о боте
async function getBotInfo() {
  try {
    const response = await axios.get(`${BOT_API_URL}/getMe`);
    console.log('Bot info:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting bot info:', error.message);
    return null;
  }
}

// Отправить сообщение пользователю
async function sendMessage(chatId, text, options = {}) {
  try {
    const payload = {
      chat_id: chatId,
      text,
      ...options
    };

    const response = await axios.post(`${BOT_API_URL}/sendMessage`, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error.message);
    return null;
  }
}

// Создать inline клавиатуру для авторизации
function createAuthKeyboard() {
  return {
    inline_keyboard: [
      [
        {
          text: '🚀 Войти в приложение',
          web_app: {
            url: WEB_APP_URL
          }
        }
      ],
      [
        {
          text: '📋 Ввести промокод',
          callback_data: 'enter_promo_code'
        }
      ]
    ]
  };
}

// Обработать команду /start
async function handleStartCommand(chatId, user) {
  const text = `
🎉 <b>Добро пожаловать в реферальную программу!</b>

Для начала работы выберите один из вариантов:

• <b>Войти в приложение</b> - авторизация через Telegram
• <b>Ввести промокод</b> - если у вас есть промокод партнера

После авторизации вы получите свой уникальный промокод для привлечения новых участников!
  `.trim();

  const keyboard = createAuthKeyboard();
  
  await sendMessage(chatId, text, {
    reply_markup: keyboard,
    parse_mode: 'HTML'
  });
}

// Обработать callback query
async function handleCallbackQuery(callbackQuery) {
  const { id, data, from } = callbackQuery;
  const chatId = from.id;

  try {
    // Отвечаем на callback query
    await axios.post(`${BOT_API_URL}/answerCallbackQuery`, {
      callback_query_id: id
    });

    if (data === 'enter_promo_code') {
      const text = `
📋 <b>Ввод промокода</b>

Для ввода промокода партнера:
1. Нажмите кнопку "Войти в приложение"
2. Введите промокод в открывшемся приложении
3. Заполните персональные данные

Или используйте команду /start для повторного входа.
      `.trim();

      await sendMessage(chatId, text, {
        parse_mode: 'HTML'
      });
    }
  } catch (error) {
    console.error('Error handling callback query:', error.message);
  }
}

// Обработать сообщения
async function handleMessage(message) {
  const { chat, text, from } = message;
  const chatId = chat.id;

  console.log('Received message:', { chatId, text, from: from.username });

  if (text === '/start') {
    await handleStartCommand(chatId, from);
  } else {
    // Отправляем приветственное сообщение для любых других сообщений
    await handleStartCommand(chatId, from);
  }
}

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('Received update:', JSON.stringify(update, null, 2));

    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Получить информацию о боте при запуске
app.get('/bot-info', async (req, res) => {
  const botInfo = await getBotInfo();
  res.json(botInfo);
});

// Установить webhook
app.post('/set-webhook', async (req, res) => {
  try {
    const webhookUrl = req.body.url || `${process.env.WEBHOOK_URL}/webhook`;
    
    const response = await axios.post(`${BOT_API_URL}/setWebhook`, {
      url: webhookUrl
    });

    console.log('Webhook set:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error setting webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Удалить webhook
app.post('/delete-webhook', async (req, res) => {
  try {
    const response = await axios.post(`${BOT_API_URL}/deleteWebhook`);
    console.log('Webhook deleted:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Error deleting webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Telegram bot server running on port ${PORT}`);
  console.log(`Web App URL: ${WEB_APP_URL}`);
  console.log(`Bot API URL: ${BOT_API_URL}`);
  
  // Получаем информацию о боте при запуске
  getBotInfo();
});

module.exports = app;
