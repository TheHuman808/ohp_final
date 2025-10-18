// Telegram Bot API service for referral system

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface TelegramWebAppData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

interface BotResponse<T = any> {
  ok: boolean;
  result?: T;
  error_code?: number;
  description?: string;
}

class TelegramBotService {
  private botToken: string;
  private baseUrl: string;

  constructor() {
    this.botToken = '8195455030:AAG6-zvkYu3r4s0LVBXQgWNwS7qyuNluGJ0';
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
    
    console.log('TelegramBotService initialized with token:', this.botToken.substring(0, 10) + '...');
  }

  // Получить информацию о боте
  async getBotInfo(): Promise<BotResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/getMe`);
      const data = await response.json();
      
      console.log('Bot info response:', data);
      return data;
    } catch (error) {
      console.error('Error getting bot info:', error);
      return { ok: false, description: 'Failed to get bot info' };
    }
  }

  // Отправить сообщение пользователю
  async sendMessage(chatId: number, text: string, options?: {
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    reply_markup?: any;
    disable_web_page_preview?: boolean;
  }): Promise<BotResponse> {
    try {
      const payload = {
        chat_id: chatId,
        text,
        ...options
      };

      const response = await fetch(`${this.baseUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('Send message response:', data);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return { ok: false, description: 'Failed to send message' };
    }
  }

  // Создать inline клавиатуру для авторизации
  createAuthKeyboard(webAppUrl: string) {
    return {
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
  }

  // Создать клавиатуру для ввода промокода
  createPromoCodeKeyboard() {
    return {
      inline_keyboard: [
        [
          {
            text: '✅ У меня есть промокод',
            callback_data: 'has_promo_code'
          }
        ],
        [
          {
            text: '🆕 Регистрация через Telegram',
            callback_data: 'telegram_auth'
          }
        ]
      ]
    };
  }

  // Обработать callback query
  async answerCallbackQuery(callbackQueryId: string, text?: string, showAlert?: boolean): Promise<BotResponse> {
    try {
      const payload = {
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert || false
      };

      const response = await fetch(`${this.baseUrl}/answerCallbackQuery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error answering callback query:', error);
      return { ok: false, description: 'Failed to answer callback query' };
    }
  }

  // Валидировать данные Web App
  validateWebAppData(initData: string): TelegramWebAppData | null {
    try {
      const params = new URLSearchParams(initData);
      const userParam = params.get('user');
      
      if (!userParam) {
        console.error('No user data in initData');
        return null;
      }

      const user = JSON.parse(userParam);
      const authDate = parseInt(params.get('auth_date') || '0');
      const hash = params.get('hash') || '';

      return {
        user,
        auth_date: authDate,
        hash
      };
    } catch (error) {
      console.error('Error validating Web App data:', error);
      return null;
    }
  }

  // Проверить, является ли пользователь администратором бота
  async isUserAdmin(chatId: number, userId: number): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/getChatMember?chat_id=${chatId}&user_id=${userId}`);
      const data = await response.json();
      
      if (data.ok && data.result) {
        const status = data.result.status;
        return status === 'creator' || status === 'administrator';
      }
      
      return false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  // Получить информацию о чате
  async getChat(chatId: number): Promise<BotResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/getChat?chat_id=${chatId}`);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error getting chat info:', error);
      return { ok: false, description: 'Failed to get chat info' };
    }
  }

  // Отправить сообщение с кнопкой Web App
  async sendWebAppMessage(chatId: number, text: string, webAppUrl: string): Promise<BotResponse> {
    const keyboard = this.createAuthKeyboard(webAppUrl);
    
    return this.sendMessage(chatId, text, {
      reply_markup: keyboard,
      parse_mode: 'HTML'
    });
  }

  // Отправить приветственное сообщение с инструкциями
  async sendWelcomeMessage(chatId: number, webAppUrl: string): Promise<BotResponse> {
    const text = `
🎉 <b>Добро пожаловать в реферальную программу!</b>

Для начала работы выберите один из вариантов:

• <b>Войти в приложение</b> - авторизация через Telegram
• <b>Ввести промокод</b> - если у вас есть промокод партнера

После авторизации вы получите свой уникальный промокод для привлечения новых участников!
    `.trim();

    return this.sendWebAppMessage(chatId, text, webAppUrl);
  }

  // Отправить сообщение с промокодом пользователя
  async sendPromoCodeMessage(chatId: number, promoCode: string, username?: string): Promise<BotResponse> {
    const text = `
🎊 <b>Поздравляем!</b>

Ваш промокод: <code>${promoCode}</code>

${username ? `Пользователь: @${username}` : ''}

Поделитесь этим промокодом с друзьями и получайте комиссию с их регистраций!
    `.trim();

    return this.sendMessage(chatId, text, {
      parse_mode: 'HTML'
    });
  }

  // Отправить уведомление о новой регистрации
  async sendRegistrationNotification(chatId: number, newUserInfo: {
    username?: string;
    firstName: string;
    promoCode: string;
  }): Promise<BotResponse> {
    const text = `
🎉 <b>Новая регистрация!</b>

Пользователь: ${newUserInfo.firstName}${newUserInfo.username ? ` (@${newUserInfo.username})` : ''}
Промокод: <code>${newUserInfo.promoCode}</code>

Теперь вы будете получать комиссию с его активности!
    `.trim();

    return this.sendMessage(chatId, text, {
      parse_mode: 'HTML'
    });
  }
}

export const telegramBotService = new TelegramBotService();
export type { TelegramUser, TelegramWebAppData, BotResponse };
