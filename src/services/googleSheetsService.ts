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

interface CommissionRecord {
  id: string;
  saleId: string;
  partnerTelegramId: string;
  level: number;
  amount: number;
  commission: number;
  date: string;
}

interface NetworkData {
  level1: PartnerRecord[];
  level2: PartnerRecord[];
  level3: PartnerRecord[];
  level4: PartnerRecord[];
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
    
    console.log('🚀🚀🚀 GoogleSheetsService NEW v19.0 ULTIMATE FIX 🚀🚀🚀');
    console.log('Spreadsheet ID:', this.spreadsheetId ? `${this.spreadsheetId.substring(0, 10)}...` : 'NOT SET');
    console.log('API Key for read:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('Web App URL:', this.webAppUrl ? `${this.webAppUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('Full Web App URL:', this.webAppUrl);
    console.log('🔍 URL CHECK: Should contain AKfycbyCHYl8Cw_pyUUtGigdHzv7VyU9Il4Gnfke1VFbTDu7-nA0Ux1at7ReaUljCr_gwW2E');
    console.log('🔍 URL contains correct ID:', this.webAppUrl.includes('AKfycbyCHYl8Cw_pyUUtGigdHzv7VyU9Il4Gnfke1VFbTDu7-nA0Ux1at7ReaUljCr_gwW2E'));
    
    if (!this.apiKey || !this.spreadsheetId) {
      console.warn('Google Sheets API не настроен полностью. Установите переменные окружения VITE_GOOGLE_SHEETS_API_KEY и VITE_GOOGLE_SHEETS_ID');
    }
  }

  async getPartner(telegramId: string): Promise<PartnerRecord | null> {
    try {
      console.log('=== GET PARTNER START ===');
      console.log('Looking for partner with Telegram ID:', telegramId);
      
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/Партнеры!A:M?key=${this.apiKey}`;
      console.log('GET request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('onComplete called successfully');
      
      if (!data.values || data.values.length <= 1) {
        console.log('No partner data found');
        return null;
      }
      
      const partners = data.values.slice(1); // Skip header row
      console.log('Partner data rows count:', partners.length);
      
      for (let i = 0; i < partners.length; i++) {
        const row = partners[i];
        console.log(`Checking row ${i + 1}:`, row);
        
        if (row[1] === telegramId) { // telegramId is in column B (index 1)
          console.log('Partner found!');
          return {
            id: row[0],
            telegramId: row[1],
            firstName: row[2],
            lastName: row[3],
            phone: row[4],
            email: row[5],
            username: row[6],
            promoCode: row[7],
            inviterCode: row[8],
            inviterTelegramId: row[9],
            registrationDate: row[10],
            totalEarnings: parseFloat(row[11]) || 0,
            salesCount: parseInt(row[12]) || 0
          };
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

  async getPartnerCommissions(telegramId: string): Promise<CommissionRecord[]> {
    try {
      console.log('=== GET PARTNER COMMISSIONS START ===');
      console.log('Getting commissions for Telegram ID:', telegramId);
      
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/Комиссии!A:G?key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length <= 1) {
        return [];
      }
      
      const commissions = data.values.slice(1);
      console.log('Commissions data rows count:', commissions.length);
      
      for (let i = 0; i < commissions.length; i++) {
        const row = commissions[i];
        console.log(`Checking commission row ${i + 1}:`, row);
      }
      
      const partnerCommissions = commissions
        .filter(row => row[2] === telegramId) // partnerTelegramId is in column C (index 2)
        .map(row => ({
          id: row[0],
          saleId: row[1],
          partnerTelegramId: row[2],
          level: parseInt(row[3]),
          amount: parseFloat(row[4]),
          commission: parseFloat(row[5]),
          date: row[6]
        }));
      
      console.log(`Found ${partnerCommissions.length} commissions for partner ${telegramId}`);
      console.log('=== GET PARTNER COMMISSIONS END ===');
      return partnerCommissions;
      
    } catch (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }
  }

  async getPartnerNetwork(telegramId: string): Promise<NetworkData> {
    try {
      console.log('=== GET PARTNER NETWORK START ===');
      console.log('Getting network for Telegram ID:', telegramId);
      
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/Партнеры!A:M?key=${this.apiKey}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.values || data.values.length <= 1) {
        return { level1: [], level2: [], level3: [], level4: [] };
      }
      
      const partners = data.values.slice(1);
      console.log('Partner data rows count:', partners.length);
      
      for (let i = 0; i < partners.length; i++) {
        const row = partners[i];
        console.log(`Checking row ${i + 1}:`, row);
      }
      
      // Find partners by levels
      const level1 = partners.filter(row => row[9] === telegramId); // inviterTelegramId
      const level2: any[] = [];
      const level3: any[] = [];
      const level4: any[] = [];
      
      // Level 2
      level1.forEach(partner => {
        const level2Partners = partners.filter(row => row[9] === partner[1]);
        level2.push(...level2Partners);
      });
      
      // Level 3
      level2.forEach(partner => {
        const level3Partners = partners.filter(row => row[9] === partner[1]);
        level3.push(...level3Partners);
      });
      
      // Level 4
      level3.forEach(partner => {
        const level4Partners = partners.filter(row => row[9] === partner[1]);
        level4.push(...level4Partners);
      });
      
      const network = {
        level1: level1.map(row => ({
          id: row[0],
          telegramId: row[1],
          firstName: row[2],
          lastName: row[3],
          promoCode: row[7],
          registrationDate: row[10]
        })),
        level2: level2.map(row => ({
          id: row[0],
          telegramId: row[1],
          firstName: row[2],
          lastName: row[3],
          promoCode: row[7],
          registrationDate: row[10]
        })),
        level3: level3.map(row => ({
          id: row[0],
          telegramId: row[1],
          firstName: row[2],
          lastName: row[3],
          promoCode: row[7],
          registrationDate: row[10]
        })),
        level4: level4.map(row => ({
          id: row[0],
          telegramId: row[1],
          firstName: row[2],
          lastName: row[3],
          promoCode: row[7],
          registrationDate: row[10]
        }))
      };
      
      console.log('Partner not found, returning empty network');
      console.log('Network data for user:', network);
      return network;
      
    } catch (error) {
      console.error('Error fetching network:', error);
      return { level1: [], level2: [], level3: [], level4: [] };
    }
  }

  async validatePromoCode(promoCode: string): Promise<boolean> {
    try {
      console.log('=== VALIDATE PROMO CODE START ===');
      console.log('Promo code to validate:', promoCode);
      
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/Партнеры!H:H?key=${this.apiKey}`;
      console.log('Making request to validate promo code...');
      console.log('Request URL:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Promo codes response:', data);
      
      if (!data.values || data.values.length <= 1) {
        console.log('Validation result: false');
        console.log('=== VALIDATE PROMO CODE END ===');
        return false;
      }
      
      const promoCodes = data.values.slice(1).flat();
      const isValid = promoCodes.includes(promoCode);
      
      console.log('Validation result:', isValid);
      console.log('=== VALIDATE PROMO CODE END ===');
      return isValid;
      
    } catch (error) {
      console.error('Error validating promo code:', error);
      return false;
    }
  }

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
      console.log('🚀🚀🚀 REGISTER PARTNER START v8.2 - ' + Date.now() + ' 🚀🚀🚀');
      console.log('🔗 CURRENT WEB APP URL:', this.webAppUrl);
      console.log('Registering NEW partner:', partnerData);
      
      // Сначала проверяем, не существует ли уже партнер с таким Telegram ID
      const existingPartner = await this.getPartner(partnerData.telegramId);
      if (existingPartner) {
        console.log('Partner already exists:', existingPartner);
        return { success: false, error: 'Партнер с таким Telegram ID уже зарегистрирован' };
      }

      // ИСПРАВЛЕНИЕ: Проверяем промокод пригласившего только если он есть и не "NOPROMO"
      console.log('🚀🚀🚀 INVITER CODE CHECK START v8.2 - ' + Date.now() + ' 🚀🚀🚀');
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
      console.log('=== INVITER CODE CHECK END v8.0 ===');
      
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

      // Генерируем промокод для нового партнера
      const promoCode = this.generatePromoCode();
      console.log('Generated promo code for new partner:', promoCode);

      // Подготавливаем данные для отправки
      const dataToSend = {
        ...partnerData,
        promoCode: promoCode,
        registrationDate: new Date().toISOString().split('T')[0]
      };

      console.log('=== SENDING DATA TO GOOGLE SHEETS ===');
      console.log('Partner data to register:', dataToSend);
      console.log('Original inviterCode:', partnerData.inviterCode);
      console.log('Processed inviterCode:', partnerData.inviterCode);
      console.log('inviterCode type:', typeof partnerData.inviterCode);
      console.log('inviterCode === null:', partnerData.inviterCode === null);
      console.log('inviterCode === undefined:', partnerData.inviterCode === undefined);
      console.log('inviterCode === "":', partnerData.inviterCode === '');
      console.log('Telegram ID:', partnerData.telegramId);
      console.log('Real Telegram data check:', {
        isTestUser: partnerData.telegramId.startsWith('test_user_'),
        telegramId: partnerData.telegramId,
        firstName: partnerData.firstName,
        username: partnerData.username
      });
      console.log('Sending data to Apps Script...');

      // Отправляем данные в Google Apps Script
      const result = await this.writeToAppsScript('registerPartner', dataToSend);
      
      if (result.success) {
        console.log('✅ Partner registered successfully via Apps Script');
        return { success: true, promoCode: promoCode };
      } else {
        console.log('❌ Apps Script registration failed:', result.error);
        return { success: false, error: result.error || 'Ошибка регистрации через Apps Script' };
      }
      
    } catch (error) {
      console.error('Error registering partner:', error);
      return { success: false, error: 'Ошибка при регистрации партнера' };
    }
  }

  private generatePromoCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'PARTNER';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async writeToAppsScript(action: string, data: any): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.webAppUrl) {
      console.warn('Google Apps Script URL не настроен');
      return { success: false, error: 'Apps Script URL не настроен' };
    }

    try {
      const fullWebAppUrl = `${this.webAppUrl}?v=${Date.now()}&bust=${Math.random()}`; // Ultra aggressive cache busting
      console.log('=== WRITING TO APPS SCRIPT ===');
      console.log('Action:', action);
      console.log('Data:', data);
      console.log('URL:', fullWebAppUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Попробуем сначала GET запрос, так как Google Apps Script лучше работает с GET
      const getUrl = `${this.webAppUrl}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(JSON.stringify(data))}`;
      console.log('Trying GET request to:', getUrl);
      
      const requestOptions = {
        method: 'GET',
        mode: 'cors' as RequestMode,
        signal: controller.signal
      };

      console.log('Request options:', {
        method: requestOptions.method,
        mode: requestOptions.mode
      });
      
      console.log('Request URL:', getUrl);

      const response = await fetch(getUrl, requestOptions);
      
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
          
          const getController = new AbortController();
          const getTimeoutId = setTimeout(() => getController.abort(), 30000);
          
          const getResponse = await fetch(getUrl, {
            method: 'GET',
            mode: 'cors',
            signal: getController.signal
          });
          
          clearTimeout(getTimeoutId);
          
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
}

export const googleSheetsService = new GoogleSheetsService();
