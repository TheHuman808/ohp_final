// Тестовый скрипт для проверки работы Telegram бота
import axios from 'axios';

const BOT_TOKEN = '8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0';
const BOT_API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function testBot() {
  console.log('🤖 Тестирование Telegram бота...\n');

  try {
    // 1. Получить информацию о боте
    console.log('1. Получение информации о боте...');
    const botInfo = await axios.get(`${BOT_API_URL}/getMe`);
    console.log('✅ Бот найден:', botInfo.data.result);
    console.log('   Имя:', botInfo.data.result.first_name);
    console.log('   Username:', botInfo.data.result.username);
    console.log('   ID:', botInfo.data.result.id);
    console.log('');

    // 2. Проверить webhook
    console.log('2. Проверка webhook...');
    const webhookInfo = await axios.get(`${BOT_API_URL}/getWebhookInfo`);
    console.log('✅ Webhook статус:', webhookInfo.data);
    console.log('');

    // 3. Отправить тестовое сообщение (замените CHAT_ID на ваш ID)
    const TEST_CHAT_ID = 'YOUR_CHAT_ID'; // Замените на ваш Telegram ID
    
    if (TEST_CHAT_ID !== 'YOUR_CHAT_ID') {
      console.log('3. Отправка тестового сообщения...');
      const message = await axios.post(`${BOT_API_URL}/sendMessage`, {
        chat_id: TEST_CHAT_ID,
        text: '🎉 Тестовое сообщение от реферального бота!\n\nБот работает корректно.',
        parse_mode: 'HTML'
      });
      console.log('✅ Сообщение отправлено:', message.data);
      console.log('');
    } else {
      console.log('3. ⚠️  Пропуск отправки сообщения (не указан CHAT_ID)');
      console.log('   Для тестирования отправки сообщений замените YOUR_CHAT_ID в скрипте');
      console.log('');
    }

    // 4. Создать Web App кнопку
    console.log('4. Создание Web App кнопки...');
    const webAppUrl = 'https://your-app-url.com'; // Замените на ваш URL
    
    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🚀 Войти в приложение',
            web_app: {
              url: webAppUrl
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

    if (TEST_CHAT_ID !== 'YOUR_CHAT_ID') {
      const webAppMessage = await axios.post(`${BOT_API_URL}/sendMessage`, {
        chat_id: TEST_CHAT_ID,
        text: '🎉 <b>Добро пожаловать в реферальную программу!</b>\n\nДля начала работы выберите один из вариантов:',
        reply_markup: keyboard,
        parse_mode: 'HTML'
      });
      console.log('✅ Web App сообщение отправлено:', webAppMessage.data);
      console.log('');
    } else {
      console.log('4. ⚠️  Пропуск отправки Web App сообщения (не указан CHAT_ID)');
      console.log('');
    }

    console.log('🎉 Все тесты завершены успешно!');
    console.log('');
    console.log('📋 Следующие шаги:');
    console.log('1. Замените YOUR_CHAT_ID на ваш Telegram ID');
    console.log('2. Замените your-app-url.com на URL вашего приложения');
    console.log('3. Запустите сервер бота: npm run bot:dev');
    console.log('4. Настройте webhook: npm run bot:webhook:set');

  } catch (error) {
    console.error('❌ Ошибка при тестировании бота:', error.message);
    if (error.response) {
      console.error('   Детали ошибки:', error.response.data);
    }
  }
}

// Запуск тестов
testBot();
