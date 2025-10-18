// Тестовый скрипт для проверки сохранения username и Telegram ID
import axios from 'axios';

const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzsMyAyZx5GPFoHTxZzOfE1HnMoaEwIESra0T__yGlYZmQnFDod75lVw4e_M3yLOfId/exec';

async function testUsernameSave() {
  console.log('🧪 Тестирование сохранения username и Telegram ID...\n');

  try {
    // Тестовые данные пользователя
    const testUserData = {
      telegramId: 'test_telegram_12345',
      firstName: 'Тест',
      lastName: 'Пользователь',
      phone: '79999999999',
      email: 'test@example.com',
      username: 'testuser123', // Это должно сохраниться в колонку G
      inviterCode: 'TEST123',
      registrationDate: new Date().toISOString().split('T')[0]
    };

    console.log('📝 Тестовые данные:');
    console.log('   Telegram ID:', testUserData.telegramId);
    console.log('   Username:', testUserData.username);
    console.log('   Имя:', testUserData.firstName);
    console.log('   Email:', testUserData.email);
    console.log('');

    // Отправляем запрос на регистрацию
    console.log('🚀 Отправка запроса на регистрацию...');
    const response = await axios.post(GOOGLE_APPS_SCRIPT_URL, {
      action: 'registerPartner',
      data: testUserData
    }, {
      headers: {
        'Content-Type': 'text/plain'
      }
    });

    console.log('📊 Ответ от Google Apps Script:');
    console.log(JSON.stringify(response.data, null, 2));
    console.log('');

    if (response.data.success) {
      console.log('✅ Регистрация успешна!');
      console.log('   Промокод:', response.data.promoCode);
      console.log('');
      console.log('📋 Проверьте в Google Sheets:');
      console.log('   1. Откройте таблицу: https://docs.google.com/spreadsheets/d/1fh4-V4n0ho-RF06xcxl0JYxK5xQf8WOMSYy-tF6vRkU/edit');
      console.log('   2. Перейдите на лист "Партнеры"');
      console.log('   3. Найдите новую строку с Telegram ID:', testUserData.telegramId);
      console.log('   4. Проверьте, что Username сохранен в колонке G');
      console.log('   5. Проверьте, что Telegram ID сохранен в колонке B');
    } else {
      console.log('❌ Ошибка регистрации:', response.data.error);
    }

  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    if (error.response) {
      console.error('   Детали ошибки:', error.response.data);
    }
  }
}

// Запуск теста
testUsernameSave();
