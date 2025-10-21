// Google Sheets API service for partner program management

interface PartnerRecord {
  id: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  username?: string;
  promoCode: string;
  inviterCode?: string;
  inviterTelegramId?: string;
  registrationDate: string;
  totalEarnings: number;
  salesCount: number;
  partnerId?: string;
  level?: number;
}

interface SaleRecord {
  id: string;
  date: string;
  amount: number;
  promoCode: string;
  customerInfo?: string;
}

interface CommissionRecord {
  id: string;
  saleId?: string;
  partnerId?: string;
  partnerTelegramId?: string;
  level: number;
  amount: number;
  percentage: number;
  date: string;
  fromPartnerId?: string;
}

interface CommissionSettings {
  level1: number;
  level2: number;
  level3: number;
  level4: number;
}

class GoogleSheetsService {
  private spreadsheetId: string;
  private apiKey: string;
  private webAppUrl: string;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1fh4-V4n0ho-RF06xcxl0JYxK5xQf8WOMSYy-tF6vRkU';
    this.apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'AIzaSyD1-O9ID7-2EFVum1ITNRyrhJYtvlY5wKg';
    this.webAppUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbyCHYl8Cw_pyUUtGigdHzv7VyU9Il4Gnfke1VFbTDu7-nA0Ux1at7ReaUljCr_gwW2E/exec';
    
    console.log('🚀🚀🚀 GoogleSheetsService initialized v7.0 ULTIMATE FIX 🚀🚀🚀');
    console.log('Spreadsheet ID:', this.spreadsheetId ? `${this.spreadsheetId.substring(0, 10)}...` : 'NOT SET');
    console.log('API Key for read:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('Web App URL:', this.webAppUrl ? `${this.webAppUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('Full Web App URL:', this.webAppUrl);
    console.log('🔍 URL CHECK: Should contain AKfycbyCHYl8Cw_pyUUtGigdHzv7VyU9Il4Gnfke1VFbTDu7-nA0Ux1at7ReaUljCr_gwW2E');
    console.log('🔍 URL contains correct ID:', this.webAppUrl.includes('AKfycbyCHYl8Cw_pyUUtGigdHzv7VyU9Il4Gnfke1VFbTDu7-nA0Ux1at7ReaUljCr_gwW2E'));
    
    if (!this.apiKey || !this.spreadsheetId) {
      console.warn('Google Sheets API не настроен полностью. Установите переменные окружения VITE_GOOGLE_SHEETS_API_KEY и VITE_GOOGLE_SHEETS_ID');
    }

    if (!this.webAppUrl) {
      console.warn('Google Apps Script URL не настроен. Установите VITE_GOOGLE_APPS_SCRIPT_URL для записи данных');
    }
  }

  // Очистить все данные localStorage
  clearAllLocalData(): void {
    console.log('=== CLEARING ALL LOCAL DATA ===');
    const keysToRemove: string[] = [];
    
    // Находим все ключи связанные с партнерами
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('partner_') || key.startsWith('fallback_partner_'))) {
        keysToRemove.push(key);
      }
    }
    
    // Удаляем найденные ключи
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Removed from localStorage:', key);
    });
    
    console.log(`Cleared ${keysToRemove.length} partner records from localStorage`);
    console.log('=== LOCAL DATA CLEARED ===');
  }

  // Проверить подключение к Google Sheets
  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    console.log('=== TESTING GOOGLE SHEETS CONNECTION ===');
    
    if (!this.apiKey || !this.spreadsheetId) {
      return {
        success: false,
        message: 'API ключ или ID таблицы не настроены'
      };
    }

    try {
      // Пробуем получить информацию о таблице
      const url = `${this.baseUrl}/${this.spreadsheetId}?key=${this.apiKey}`;
      console.log('Testing connection with URL:', url.replace(this.apiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        console.log('Connection successful:', data.properties?.title);
        return {
          success: true,
          message: `Подключение успешно! Таблица: ${data.properties?.title}`,
          details: data
        };
      } else {
        console.error('Connection failed:', data);
        return {
          success: false,
          message: `Ошибка подключения: ${data.error?.message || 'Неизвестная ошибка'}`,
          details: data
        };
      }
    } catch (error) {
      console.error('Connection test error:', error);
      return {
        success: false,
        message: `Ошибка сети: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
    }
  }

  // Проверить существование промокода
  async validatePromoCode(promoCode: string): Promise<boolean> {
    console.log('=== VALIDATE PROMO CODE START ===');
    console.log('Promo code to validate:', promoCode);
    
    if (!this.apiKey || !this.spreadsheetId) {
      console.error('Missing API configuration');
      throw new Error('Google Sheets API не настроен. Проверьте переменные окружения.');
    }

    try {
      const range = 'Партнеры!H:H';
      const encodedRange = encodeURIComponent(range);
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodedRange}?key=${this.apiKey}`;
      
      console.log('Making request to validate promo code...');
      console.log('Request URL:', url.replace(this.apiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Promo codes response:', data);
      
      const codes = data.values || [];
      console.log('All promo codes from sheet:', codes);
      console.log('Looking for promo code:', promoCode);
      
      const isValid = codes.some((row: string[]) => {
        const code = row[0];
        console.log('Checking code:', code, 'against:', promoCode, 'match:', code === promoCode);
        return code === promoCode;
      });
      
      console.log('Validation result:', isValid);
      console.log('=== VALIDATE PROMO CODE END ===');
      
      return isValid;
    } catch (error) {
      console.error('=== VALIDATE PROMO CODE ERROR ===');
      console.error('Error validating promo code:', error);
      throw error;
    }
  }

  // Получить данные партнера по Telegram ID (только для этого конкретного пользователя)
  async getPartner(telegramId: string): Promise<PartnerRecord | null> {
    try {
      console.log('=== GET PARTNER START ===');
      console.log('Looking for partner with Telegram ID:', telegramId);
      
      if (!telegramId) {
        console.log('No telegram ID provided');
        return null;
      }
      
      const range = 'Партнеры!A:M';
      const encodedRange = encodeURIComponent(range);
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodedRange}?key=${this.apiKey}`;
      
      console.log('GET request URL:', url.replace(this.apiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Failed to fetch partner data:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      const rows = data.values || [];
      console.log('Partner data rows count:', rows.length);
      
      // Ищем ТОЧНО по Telegram ID (только для этого пользователя)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        console.log(`Checking row ${i}:`, row);
        if (row[1] === telegramId) { // Telegram ID в колонке B
          const partner = {
            id: row[0] || '',
            telegramId: row[1] || '',
            firstName: row[2] || '',
            lastName: row[3] || '',
            phone: row[4] || '',
            email: row[5] || '',
            username: row[6] || '',
            promoCode: row[7] || '',
            inviterCode: row[8] || '',
            inviterTelegramId: row[9] || '',
            registrationDate: row[10] || '',
            totalEarnings: parseFloat(row[11]) || 0,
            salesCount: parseInt(row[12]) || 0
          };
          console.log('Found partner for Telegram ID:', telegramId, partner);
          console.log('=== GET PARTNER END ===');
          return partner;
        }
      }
      
      console.log('Partner not found in Google Sheets for Telegram ID:', telegramId);
      console.log('=== GET PARTNER END ===');
      return null;
    } catch (error) {
      console.error('Error fetching partner:', error);
      return null;
    }
  }

  // Получить партнера по промокоду
  async getPartnerByPromoCode(promoCode: string): Promise<PartnerRecord | null> {
    try {
      const range = 'Партнеры!A:M';
      const encodedRange = encodeURIComponent(range);
      const response = await fetch(
        `${this.baseUrl}/${this.spreadsheetId}/values/${encodedRange}?key=${this.apiKey}`
      );
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const rows = data.values || [];
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row[7] === promoCode) { // promoCode в колонке H
          return {
            id: row[0] || '',
            telegramId: row[1] || '',
            firstName: row[2] || '',
            lastName: row[3] || '',
            phone: row[4] || '',
            email: row[5] || '',
            username: row[6] || '',
            promoCode: row[7] || '',
            inviterCode: row[8] || '',
            inviterTelegramId: row[9] || '',
            registrationDate: row[10] || '',
            totalEarnings: parseFloat(row[11]) || 0,
            salesCount: parseInt(row[12]) || 0
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching partner by promo code:', error);
      return null;
    }
  }

  // Улучшенный метод записи через Google Apps Script с поддержкой CORS
  private async writeToAppsScript(action: string, data: any): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.webAppUrl) {
      console.warn('Google Apps Script URL не настроен');
      return { success: false, error: 'Apps Script URL не настроен' };
    }

    try {
      console.log('=== WRITING TO APPS SCRIPT ===');
      console.log('Action:', action);
      console.log('Data:', data);
      console.log('URL:', this.webAppUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

        // Попробуем сначала с JSONP, если не получится - с CORS
        const requestOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            action: action,
            data: data
          }),
          signal: controller.signal,
          mode: 'cors' as RequestMode
        };

      console.log('Request options:', {
        method: requestOptions.method,
        headers: requestOptions.headers,
        bodyLength: requestOptions.body.length
      });
      
      console.log('Request body (JSON):', requestOptions.body);

      const response = await fetch(this.webAppUrl, requestOptions);
      
      clearTimeout(timeoutId);

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('Apps Script response:', result);
        return { success: true, result };
      } else {
        const errorText = await response.text();
        console.error('Apps Script HTTP error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        return { success: false, error: `HTTP ${response.status}: ${response.statusText} - ${errorText}` };
      }
      } catch (error) {
        console.error('=== APPS SCRIPT REQUEST ERROR ===');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error?.message);
        console.error('Full error:', error);
        
        // Если CORS ошибка, попробуем GET запрос как fallback
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          console.log('CORS error detected, trying GET fallback...');
          try {
            const getUrl = `${this.webAppUrl}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(JSON.stringify(data))}`;
            console.log('Trying GET request to:', getUrl);
            
            const getResponse = await fetch(getUrl, {
              method: 'GET',
              mode: 'cors',
              signal: controller.signal
            });
            
            if (getResponse.ok) {
              const result = await getResponse.json();
              console.log('GET fallback successful:', result);
              return { success: true, result };
            }
          } catch (getError) {
            console.error('GET fallback also failed:', getError);
          }
          
          // Если GET тоже не работает, попробуем через JSONP
          console.log('Trying JSONP fallback...');
          try {
            const jsonpUrl = `${this.webAppUrl}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(JSON.stringify(data))}&callback=jsonpCallback`;
            console.log('Trying JSONP request to:', jsonpUrl);
            
            return new Promise((resolve) => {
              const script = document.createElement('script');
              script.src = jsonpUrl;
              
              (window as any).jsonpCallback = (result: any) => {
                console.log('JSONP fallback successful:', result);
                document.head.removeChild(script);
                delete (window as any).jsonpCallback;
                resolve({ success: true, result });
              };
              
              script.onerror = () => {
                console.error('JSONP fallback also failed');
                document.head.removeChild(script);
                delete (window as any).jsonpCallback;
                resolve({ success: false, error: 'All fallback methods failed' });
              };
              
              document.head.appendChild(script);
            });
          } catch (jsonpError) {
            console.error('JSONP fallback also failed:', jsonpError);
          }
        }
        
        let errorMessage = 'Unknown error';
        
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          errorMessage = 'CORS ошибка: Google Apps Script должен быть настроен с правильными разрешениями доступа. Убедитесь, что развертывание настроено как "Anyone" в настройках доступа.';
        } else if (error?.name === 'AbortError') {
          errorMessage = 'Превышен таймаут запроса (30 секунд)';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
      }
  }

  // Зарегистрировать нового партнера (создать нового пользователя)
  async registerPartner(partnerData: {
    telegramId: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    username?: string;
    inviterCode?: string; // Сделаем опциональным
  }): Promise<{ success: boolean; promoCode?: string; error?: string }> {
    try {
      console.log('🚀🚀🚀 REGISTER PARTNER START v5.0 - ' + Date.now() + ' 🚀🚀🚀');
      console.log('🔗 CURRENT WEB APP URL:', this.webAppUrl);
      console.log('Registering NEW partner:', partnerData);
      
      // Сначала проверяем, не существует ли уже партнер с таким Telegram ID
      const existingPartner = await this.getPartner(partnerData.telegramId);
      if (existingPartner) {
        console.log('Partner already exists:', existingPartner);
        return { success: false, error: 'Партнер с таким Telegram ID уже зарегистрирован' };
      }
      
      // ИСПРАВЛЕНИЕ: Проверяем промокод пригласившего только если он есть и не "NOPROMO"
      console.log('🚀🚀🚀 INVITER CODE CHECK START v3.0 - ' + Date.now() + ' 🚀🚀🚀');
      console.log('partnerData.inviterCode:', partnerData.inviterCode);
      console.log('partnerData.inviterCode type:', typeof partnerData.inviterCode);
      console.log('partnerData.inviterCode === "NOPROMO":', partnerData.inviterCode === 'NOPROMO');
      console.log('partnerData.inviterCode.trim() !== "":', partnerData.inviterCode?.trim() !== '');
      
      // ПРОПУСКАЕМ валидацию если inviterCode пустой, null, undefined или "NOPROMO"
      const hasInviterCode = partnerData.inviterCode && partnerData.inviterCode.trim() !== '';
      const isNotNOPROMO = partnerData.inviterCode !== 'NOPROMO';
      const shouldValidate = hasInviterCode && isNotNOPROMO;
      
      console.log('hasInviterCode:', hasInviterCode);
      console.log('isNotNOPROMO:', isNotNOPROMO);
      console.log('shouldValidate:', shouldValidate);
      console.log('=== INVITER CODE CHECK END v2.0 ===');
      
      if (shouldValidate) {
        console.log('Validating inviter code:', partnerData.inviterCode);
        const isValidInviter = await this.validatePromoCode(partnerData.inviterCode);
        if (!isValidInviter) {
          console.log('Invalid inviter code, registration failed');
          return { success: false, error: 'Неверный промокод пригласившего партнера' };
        }
        console.log('Inviter code is valid');
      } else {
        console.log('No inviter code provided or it is NOPROMO, skipping validation');
      }

      // Генерируем уникальный промокод для нового партнера
      const promoCode = `PARTNER${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      console.log('Generated promo code for new partner:', promoCode);
      
      // Подготавливаем данные для записи нового партнера
      const newPartnerData = {
        telegramId: partnerData.telegramId,
        firstName: partnerData.firstName,
        lastName: partnerData.lastName,
        phone: partnerData.phone,
        email: partnerData.email,
        username: partnerData.username || '',
        promoCode: promoCode,
        inviterCode: partnerData.inviterCode && partnerData.inviterCode.trim() !== '' ? partnerData.inviterCode : "NOPROMO", // Отправляем NOPROMO если нет промокода
        registrationDate: new Date().toISOString().split('T')[0]
      };

      console.log('=== SENDING DATA TO GOOGLE SHEETS ===');
      console.log('Partner data to register:', newPartnerData);
      console.log('Original inviterCode:', partnerData.inviterCode);
      console.log('Processed inviterCode:', newPartnerData.inviterCode);
      console.log('inviterCode type:', typeof newPartnerData.inviterCode);
      console.log('inviterCode === "NOPROMO":', newPartnerData.inviterCode === 'NOPROMO');
      console.log('inviterCode === null:', newPartnerData.inviterCode === null);
      console.log('inviterCode === undefined:', newPartnerData.inviterCode === undefined);

      // Записываем нового партнера через Apps Script
      const writeResult = await this.writeToAppsScript('registerPartner', newPartnerData);
      
      if (writeResult.success) {
        console.log('New partner successfully registered via Apps Script');
        return { success: true, promoCode: promoCode };
      } else {
        console.error('Apps Script registration failed:', writeResult.error);
        return { success: false, error: writeResult.error || 'Ошибка при записи в Google Sheets' };
      }
      
    } catch (error) {
      console.error('=== REGISTER PARTNER ERROR ===');
      console.error('Registration error:', error);
      return { success: false, error: 'Ошибка при регистрации партнера' };
    }
  }

  // Получить начисления конкретного партнера (только его данные)
  async getPartnerCommissions(telegramId: string): Promise<CommissionRecord[]> {
    try {
      console.log('=== GET PARTNER COMMISSIONS START ===');
      console.log('Getting commissions for Telegram ID:', telegramId);
      
      if (!telegramId) {
        console.log('No telegram ID provided');
        return [];
      }
      
      const range = 'Начисления!A:G';
      const encodedRange = encodeURIComponent(range);
      const response = await fetch(
        `${this.baseUrl}/${this.spreadsheetId}/values/${encodedRange}?key=${this.apiKey}`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch commissions:', response.status);
        return [];
      }

      const data = await response.json();
      const rows = data.values || [];
      const commissions: CommissionRecord[] = [];
      
      console.log('Commissions data rows count:', rows.length);
      
      // Ищем начисления ТОЛЬКО для этого конкретного партнера
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        console.log(`Checking commission row ${i}:`, row);
        
        if (row[2] === telegramId) { // partnerTelegramId в колонке C
          const commission = {
            id: row[0] || '',
            saleId: row[1] || '',
            partnerTelegramId: row[2] || '',
            level: parseInt(row[3]) || 1,
            amount: parseFloat(row[4]) || 0,
            percentage: parseFloat(row[5]) || 0,
            date: row[6] || ''
          };
          
          console.log('Found commission for partner:', commission);
          commissions.push(commission);
        }
      }
      
      console.log(`Found ${commissions.length} commissions for partner ${telegramId}`);
      console.log('=== GET PARTNER COMMISSIONS END ===');
      
      return commissions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error fetching partner commissions:', error);
      return [];
    }
  }

  // Получить сеть партнера (только его рефералы)
  async getPartnerNetwork(telegramId: string): Promise<{
    level1: PartnerRecord[];
    level2: PartnerRecord[];
    level3: PartnerRecord[];
    level4: PartnerRecord[];
  }> {
    try {
      console.log('=== GET PARTNER NETWORK START ===');
      console.log('Getting network for Telegram ID:', telegramId);
      
      if (!telegramId) {
        console.log('No telegram ID provided');
        return { level1: [], level2: [], level3: [], level4: [] };
      }
      
      const partner = await this.getPartner(telegramId);
      if (!partner) {
        console.log('Partner not found, returning empty network');
        return { level1: [], level2: [], level3: [], level4: [] };
      }

      const range = 'Партнеры!A:M';
      const encodedRange = encodeURIComponent(range);
      const response = await fetch(
        `${this.baseUrl}/${this.spreadsheetId}/values/${encodedRange}?key=${this.apiKey}`
      );
      
      if (!response.ok) {
        console.error('Failed to fetch network data:', response.status);
        return { level1: [], level2: [], level3: [], level4: [] };
      }

      const data = await response.json();
      const rows = data.values || [];
      const allPartners: PartnerRecord[] = [];
      
      // Собираем всех партнеров
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        allPartners.push({
          id: row[0] || '',
          telegramId: row[1] || '',
          firstName: row[2] || '',
          lastName: row[3] || '',
          phone: row[4] || '',
          email: row[5] || '',
          username: row[6] || '',
          promoCode: row[7] || '',
          inviterCode: row[8] || '',
          inviterTelegramId: row[9] || '',
          registrationDate: row[10] || '',
          totalEarnings: parseFloat(row[11]) || 0,
          salesCount: parseInt(row[12]) || 0
        });
      }

      // Находим структуру по уровням (ТОЛЬКО рефералы этого партнера)
      const level1 = allPartners.filter(p => p.inviterTelegramId === telegramId);
      const level2 = allPartners.filter(p => level1.some(l1 => l1.telegramId === p.inviterTelegramId));
      const level3 = allPartners.filter(p => level2.some(l2 => l2.telegramId === p.inviterTelegramId));
      const level4 = allPartners.filter(p => level3.some(l3 => l3.telegramId === p.inviterTelegramId));

      console.log('Network found:', { 
        level1: level1.length, 
        level2: level2.length, 
        level3: level3.length, 
        level4: level4.length 
      });
      console.log('=== GET PARTNER NETWORK END ===');

      return { level1, level2, level3, level4 };
    } catch (error) {
      console.error('Error fetching partner network:', error);
      return { level1: [], level2: [], level3: [], level4: [] };
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
export type { PartnerRecord, SaleRecord, CommissionRecord, CommissionSettings };
