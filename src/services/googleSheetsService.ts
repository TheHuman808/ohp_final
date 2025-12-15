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
  date: string; // Дата расчета
  saleDate?: string; // Дата продажи
}

interface PartnerStats {
  totalIncome: number; // Общий доход
  incomeByLevels: number; // Доход от уровней (сумма всех начислений)
  incomeFromPartners: number; // Доход от партнеров (уровни 2-4)
  partnersCount: number; // Количество приведенных партнеров
  uniqueSalesCount: number; // Количество уникальных продаж
}

interface NetworkData {
  level1: PartnerRecord[];
  level2: PartnerRecord[];
  level3: PartnerRecord[];
  level4: PartnerRecord[];
}

interface LevelConfig {
  level: number;
  percentage: number;
  color: {
    bg: string;
    text: string;
  };
}

class GoogleSheetsService {
  private spreadsheetId: string;
  private apiKey: string;
  private webAppUrl: string;
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

  constructor() {
    this.spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID || '1fh4-V4n0ho-RF06xcxl0JYxK5xQf8WOMSYy-tF6vRkU';
    this.apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'AIzaSyD1-O9ID7-2EFVum1ITNRyrhJYtvlY5wKg';
    this.webAppUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwcQaWB-2PqQcgz-vdMzpqO_9R8RPxvoK1_SIpPWnZ8YYdAaCenak0J-EW2t0j2XOjq/exec';
    
    console.log('🚀🚀🚀 GoogleSheetsService NEW v19.0 ULTIMATE FIX 🚀🚀🚀');
    console.log('Spreadsheet ID:', this.spreadsheetId ? `${this.spreadsheetId.substring(0, 10)}...` : 'NOT SET');
    console.log('API Key for read:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NOT SET');
    console.log('Web App URL:', this.webAppUrl ? `${this.webAppUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('Full Web App URL:', this.webAppUrl);
    console.log('🔍 URL CHECK: Should contain AKfycbwcQaWB-2PqQcgz-vdMzpqO_9R8RPxvoK1_SIpPWnZ8YYdAaCenak0J-EW2t0j2XOjq');
    console.log('🔍 URL contains correct ID:', this.webAppUrl.includes('AKfycbwcQaWB-2PqQcgz-vdMzpqO_9R8RPxvoK1_SIpPWnZ8YYdAaCenak0J-EW2t0j2XOjq'));
    
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
      
      const searchTgId = String(telegramId || '').trim();
      
      for (let i = 0; i < partners.length; i++) {
        const row = partners[i];
        console.log(`Checking row ${i + 1}:`, row);
        
        // Нормализуем Telegram ID для сравнения
        const rowTgId = String(row[1] || '').trim();
        if (rowTgId === searchTgId) { // telegramId is in column B (index 1)
          console.log('Partner found!', row);
          return {
            id: String(row[0] || '').trim(),
            telegramId: rowTgId,
            firstName: String(row[2] || '').trim(),
            lastName: String(row[3] || '').trim(),
            phone: String(row[4] || '').trim(),
            email: String(row[5] || '').trim(),
            username: row[6] ? String(row[6]).trim() : undefined,
            promoCode: String(row[7] || '').trim(),
            inviterCode: row[8] ? String(row[8]).trim() : undefined,
            inviterTelegramId: row[9] ? String(row[9]).trim() : undefined,
            registrationDate: String(row[10] || '').trim(),
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
      
      // Используем Apps Script для получения начислений
      const result = await this.readFromAppsScript('getPartnerCommissions', { telegramId });
      
      console.log('=== APPS SCRIPT COMMISSIONS RESULT ===');
      console.log('Full result:', JSON.stringify(result, null, 2));
      
      if (result.success && result.result) {
        console.log('Result.result type:', typeof result.result);
        console.log('Result.result:', result.result);
        console.log('Result.result.success:', result.result.success);
        console.log('Result.result.commissions:', result.result.commissions);
        console.log('Result.result.commissions type:', typeof result.result.commissions);
        console.log('Result.result.commissions isArray:', Array.isArray(result.result.commissions));
        
        // Apps Script возвращает { success: true, commissions: [...] }
        let commissionsData = null;
        
        // Вариант 1: result.result = { success: true, commissions: [...] }
        if (result.result.commissions && Array.isArray(result.result.commissions)) {
          commissionsData = result.result.commissions;
          console.log('✅ Using result.result.commissions, count:', commissionsData.length);
        }
        // Вариант 2: result.result = [...] напрямую
        else if (Array.isArray(result.result)) {
          commissionsData = result.result;
          console.log('✅ Using result.result directly as array, count:', commissionsData.length);
        }
        // Вариант 3: result.result.success = true, но структура другая
        else if (result.result.success === true && result.result.commissions) {
          commissionsData = result.result.commissions;
          console.log('✅ Using result.result.commissions (nested), count:', Array.isArray(commissionsData) ? commissionsData.length : 'not array');
        }
        
        if (commissionsData) {
          if (Array.isArray(commissionsData)) {
            if (commissionsData.length > 0) {
              console.log('✅ Commissions data from Apps Script:', commissionsData);
              console.log('✅ Commissions count:', commissionsData.length);
              console.log('✅ Sample commission:', commissionsData[0]);
              console.log('✅ Sample commission keys:', Object.keys(commissionsData[0] || {}));
              
          // Маппим данные из Apps Script в формат CommissionRecord
          const mappedCommissions: CommissionRecord[] = commissionsData.map((comm: any, index: number) => {
            const mapped = {
              id: String(comm.id || '').trim(),
              saleId: String(comm.saleId || '').trim(),
              partnerTelegramId: String(comm.partnerTelegramId || '').trim(),
              level: parseInt(String(comm.level || '1')) || 1,
              amount: parseFloat(String(comm.amount || '0')) || 0,
              commission: parseFloat(String(comm.commission || '0')) || 0, // Процент
              date: String(comm.date || '').trim(), // Дата расчета
              saleDate: comm.saleDate ? String(comm.saleDate).trim() : undefined // Дата продажи
            };
            
            if (index < 3) {
              console.log(`Mapping commission ${index}:`, { original: comm, mapped });
            }
            
            return mapped;
          });
              
              console.log('✅ Mapped commissions:', mappedCommissions);
              console.log('✅ Mapped commissions count:', mappedCommissions.length);
              console.log('=== GET PARTNER COMMISSIONS END (SUCCESS) ===');
              return mappedCommissions;
            } else {
              console.warn('⚠️ Apps Script returned empty commissions array');
              return [];
            }
          } else {
            console.warn('⚠️ Apps Script returned commissions but it is not an array:', typeof commissionsData, commissionsData);
          }
        } else {
          console.warn('⚠️ Apps Script returned data but commissionsData is null/undefined');
          console.warn('Result.result structure:', JSON.stringify(result.result, null, 2));
        }
      } else {
        console.warn('❌ Apps Script request failed or returned invalid data:', result);
        console.warn('Result.success:', result.success);
        console.warn('Result.result:', result.result);
        console.warn('Result.error:', result.error);
      }
      
      // Fallback: читаем напрямую из Google Sheets API
      console.log('Apps Script failed or returned invalid data, trying direct Google Sheets API...');
      
      // Пробуем разные варианты названий листа
      const possibleSheetNames = ['Начисления', 'Комиссии', 'Commissions', 'Начисление'];
      let commissions: any[] = [];
      let foundSheet = false;
      
      for (const sheetName of possibleSheetNames) {
        try {
          const url = `${this.baseUrl}/${this.spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:G?key=${this.apiKey}`;
          console.log(`Trying to fetch from sheet: ${sheetName}`, url);
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Response from ${sheetName}:`, data);
            
            if (data.values && data.values.length > 1) {
              commissions = data.values.slice(1);
              foundSheet = true;
              console.log(`Successfully found data in sheet: ${sheetName}, rows: ${commissions.length}`);
              break;
            }
          } else {
            console.log(`Sheet ${sheetName} not found (${response.status}), trying next...`);
          }
        } catch (sheetError) {
          console.log(`Error accessing sheet ${sheetName}:`, sheetError);
          continue;
        }
      }
      
      if (!foundSheet || commissions.length === 0) {
        console.warn('No commissions data found in any sheet');
        return [];
      }
      
      console.log('Commissions data rows count:', commissions.length);
      
      // Структура листа "Начисления": 
      // A - ID, B - ID продажи, C - Telegram ID партнера, D - Уровень, E - Сумма, F - Процент, G - Дата расчета
      const searchTgId = String(telegramId || '').trim();
      console.log('Searching for Telegram ID:', searchTgId);
      console.log('Total commissions rows before filter:', commissions.length);
      
      const partnerCommissions = commissions
        .filter(row => {
          if (!row || row.length < 3) {
            console.log('Skipping invalid row:', row);
            return false;
          }
          // Нормализуем Telegram ID для сравнения (могут быть строки или числа)
          const rowTgId = String(row[2] || '').trim();
          const match = rowTgId === searchTgId;
          if (match) {
            console.log('Found matching commission:', {
              id: row[0],
              saleId: row[1],
              tgId: row[2],
              level: row[3],
              amount: row[4],
              percentage: row[5],
              date: row[6]
            });
          }
          return match;
        })
        .map(row => ({
          id: String(row[0] || '').trim(),
          saleId: String(row[1] || '').trim(),
          partnerTelegramId: String(row[2] || '').trim(),
          level: parseInt(row[3]) || 1,
          amount: parseFloat(row[4]) || 0, // Сумма
          commission: parseFloat(row[5]) || 0, // Процент
          date: String(row[6] || '').trim() // Дата расчета
        }));
      
      console.log(`Filtered ${partnerCommissions.length} commissions for Telegram ID ${searchTgId}`);
      
      console.log(`Found ${partnerCommissions.length} commissions for partner ${telegramId}`);
      console.log('Sample commissions:', partnerCommissions.slice(0, 3));
      console.log('=== GET PARTNER COMMISSIONS END ===');
      return partnerCommissions;
      
    } catch (error) {
      console.error('Error fetching commissions:', error);
      return [];
    }
  }

  async getPartnerStats(telegramId: string, network?: NetworkData): Promise<PartnerStats> {
    try {
      console.log('=== GET PARTNER STATS START ===');
      console.log('Getting stats for Telegram ID:', telegramId);
      console.log('Network provided:', !!network);
      
      // Получаем все начисления партнера
      const commissions = await this.getPartnerCommissions(telegramId);
      console.log('Commissions fetched:', commissions.length);
      console.log('Commissions data:', commissions);
      
      // Общий доход - сумма всех значений из колонки "Сумма"
      const totalIncome = commissions.reduce((sum, comm) => {
        const amount = comm.amount || 0;
        console.log(`Adding commission amount: ${amount}, total so far: ${sum}`);
        return sum + amount;
      }, 0);
      console.log('Total income calculated:', totalIncome);
      
      // Доход от уровней - это общий доход (все начисления)
      const incomeByLevels = totalIncome;
      
      // Доход от партнеров - это доход с уровней 2-4 (не с уровня 1, так как уровень 1 - это прямые продажи)
      const incomeFromPartners = commissions
        .filter(comm => {
          const level = comm.level || 1;
          return level >= 2 && level <= 4;
        })
        .reduce((sum, comm) => sum + (comm.amount || 0), 0);
      console.log('Income from partners (levels 2-4):', incomeFromPartners);
      
      // Количество приведенных партнеров - из сети
      let partnersCount = 0;
      let networkData = network;
      
      // Если сеть не передана, получаем её
      if (!networkData) {
        try {
          console.log('Network not provided, fetching...');
          networkData = await this.getPartnerNetwork(telegramId);
          console.log('Network fetched:', networkData);
        } catch (error) {
          console.warn('Failed to fetch network for stats:', error);
        }
      }
      
      if (networkData) {
        partnersCount = (networkData.level1?.length || 0) + 
                       (networkData.level2?.length || 0) + 
                       (networkData.level3?.length || 0) + 
                       (networkData.level4?.length || 0);
        console.log('Partners count calculated:', partnersCount);
        console.log('Level breakdown:', {
          level1: networkData.level1?.length || 0,
          level2: networkData.level2?.length || 0,
          level3: networkData.level3?.length || 0,
          level4: networkData.level4?.length || 0
        });
      }
      
      // Количество уникальных продаж - уникальные ID продажи
      const uniqueSaleIds = new Set(
        commissions
          .map(comm => comm.saleId)
          .filter(id => id && id.toString().trim() !== '')
      );
      const uniqueSalesCount = uniqueSaleIds.size;
      console.log('Unique sales count:', uniqueSalesCount);
      console.log('Unique sale IDs:', Array.from(uniqueSaleIds));
      
      const stats: PartnerStats = {
        totalIncome,
        incomeByLevels,
        incomeFromPartners,
        partnersCount,
        uniqueSalesCount
      };
      
      console.log('=== FINAL PARTNER STATS ===');
      console.log(JSON.stringify(stats, null, 2));
      console.log('=== GET PARTNER STATS END ===');
      return stats;
      
    } catch (error) {
      console.error('Error fetching partner stats:', error);
      console.error('Error details:', error instanceof Error ? error.stack : error);
      return {
        totalIncome: 0,
        incomeByLevels: 0,
        incomeFromPartners: 0,
        partnersCount: 0,
        uniqueSalesCount: 0
      };
    }
  }

  async getPartnerNetwork(telegramId: string): Promise<NetworkData> {
    try {
      console.log('=== GET PARTNER NETWORK START ===');
      console.log('Getting network for Telegram ID:', telegramId);
      
      // Используем Apps Script для получения сети партнеров
      const result = await this.readFromAppsScript('getPartnerNetwork', { telegramId });
      
      console.log('=== APPS SCRIPT RESULT ===');
      console.log('Full result:', JSON.stringify(result, null, 2));
      
      // Apps Script возвращает { success: true, network: {...} } напрямую
      // result.result содержит весь ответ от Apps Script
      if (result.success && result.result) {
        console.log('Result.result:', result.result);
        console.log('Result.result.success:', result.result.success);
        console.log('Result.result.network:', result.result.network);
        
        // Проверяем разные варианты структуры ответа
        let networkData = null;
        
        // Вариант 1: result.result = { success: true, network: {...} }
        if (result.result.network) {
          networkData = result.result.network;
          console.log('Using result.result.network');
        }
        // Вариант 2: result.result = { level1: [...], level2: [...] } напрямую
        else if (result.result.level1 || result.result.level2 || result.result.level3 || result.result.level4) {
          networkData = result.result;
          console.log('Using result.result directly');
        }
        
        if (networkData && (networkData.level1 || networkData.level2 || networkData.level3 || networkData.level4)) {
          console.log('Network data from Apps Script:', networkData);
          console.log('Level 1 count:', networkData.level1?.length || 0);
          console.log('Level 2 count:', networkData.level2?.length || 0);
          console.log('Level 3 count:', networkData.level3?.length || 0);
          console.log('Level 4 count:', networkData.level4?.length || 0);
          
          // Маппим данные из Apps Script в формат PartnerRecord
          const mapPartner = (partner: any): PartnerRecord => ({
            id: String(partner.id || ''),
            telegramId: String(partner.telegramId || '').trim(),
            firstName: String(partner.firstName || '').trim(),
            lastName: String(partner.lastName || '').trim(),
            phone: String(partner.phone || '').trim(),
            email: String(partner.email || '').trim(),
            username: partner.username ? String(partner.username).trim() : undefined,
            promoCode: String(partner.promoCode || '').trim(),
            inviterCode: partner.inviterCode ? String(partner.inviterCode).trim() : undefined,
            inviterTelegramId: partner.inviterTelegramId ? String(partner.inviterTelegramId).trim() : undefined,
            registrationDate: String(partner.registrationDate || '').trim(),
            totalEarnings: parseFloat(partner.totalEarnings) || 0,
            salesCount: parseInt(partner.salesCount) || 0
          });
          
          const network: NetworkData = {
            level1: (networkData.level1 || []).map(mapPartner),
            level2: (networkData.level2 || []).map(mapPartner),
            level3: (networkData.level3 || []).map(mapPartner),
            level4: (networkData.level4 || []).map(mapPartner)
          };
          
          console.log('Mapped network data:', network);
          console.log(`Level 1: ${network.level1.length}, Level 2: ${network.level2.length}, Level 3: ${network.level3.length}, Level 4: ${network.level4.length}`);
          console.log('=== GET PARTNER NETWORK END ===');
          return network;
        } else {
          console.warn('Apps Script returned data but network structure is invalid:', networkData);
        }
      } else {
        console.warn('Apps Script request failed or returned invalid data:', result);
      }
      
      // Fallback: читаем напрямую из Google Sheets API
      console.log('Apps Script failed or returned invalid data, trying direct Google Sheets API...');
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
      
      // Find partners by levels
      const searchTgId = String(telegramId || '').trim();
      const level1 = partners.filter(row => {
        const inviterTgId = String(row[9] || '').trim();
        return inviterTgId === searchTgId;
      });
      
      console.log(`Found ${level1.length} level 1 partners`);
      
      const level2: any[] = [];
      const level3: any[] = [];
      const level4: any[] = [];
      
      // Level 2
      level1.forEach(partner => {
        const partnerTgId = String(partner[1] || '').trim();
        const level2Partners = partners.filter(row => {
          const inviterTgId = String(row[9] || '').trim();
          return inviterTgId === partnerTgId;
        });
        level2.push(...level2Partners);
      });
      
      console.log(`Found ${level2.length} level 2 partners`);
      
      // Level 3
      level2.forEach(partner => {
        const partnerTgId = String(partner[1] || '').trim();
        const level3Partners = partners.filter(row => {
          const inviterTgId = String(row[9] || '').trim();
          return inviterTgId === partnerTgId;
        });
        level3.push(...level3Partners);
      });
      
      console.log(`Found ${level3.length} level 3 partners`);
      
      // Level 4
      level3.forEach(partner => {
        const partnerTgId = String(partner[1] || '').trim();
        const level4Partners = partners.filter(row => {
          const inviterTgId = String(row[9] || '').trim();
          return inviterTgId === partnerTgId;
        });
        level4.push(...level4Partners);
      });
      
      console.log(`Found ${level4.length} level 4 partners`);
      
      const network: NetworkData = {
        level1: level1.map(row => ({
          id: String(row[0] || ''),
          telegramId: String(row[1] || '').trim(),
          firstName: String(row[2] || '').trim(),
          lastName: String(row[3] || '').trim(),
          phone: String(row[4] || '').trim(),
          email: String(row[5] || '').trim(),
          username: row[6] ? String(row[6]).trim() : undefined,
          promoCode: String(row[7] || '').trim(),
          inviterCode: row[8] ? String(row[8]).trim() : undefined,
          inviterTelegramId: row[9] ? String(row[9]).trim() : undefined,
          registrationDate: String(row[10] || '').trim(),
          totalEarnings: parseFloat(row[11]) || 0,
          salesCount: parseInt(row[12]) || 0
        })),
        level2: level2.map(row => ({
          id: String(row[0] || ''),
          telegramId: String(row[1] || '').trim(),
          firstName: String(row[2] || '').trim(),
          lastName: String(row[3] || '').trim(),
          phone: String(row[4] || '').trim(),
          email: String(row[5] || '').trim(),
          username: row[6] ? String(row[6]).trim() : undefined,
          promoCode: String(row[7] || '').trim(),
          inviterCode: row[8] ? String(row[8]).trim() : undefined,
          inviterTelegramId: row[9] ? String(row[9]).trim() : undefined,
          registrationDate: String(row[10] || '').trim(),
          totalEarnings: parseFloat(row[11]) || 0,
          salesCount: parseInt(row[12]) || 0
        })),
        level3: level3.map(row => ({
          id: String(row[0] || ''),
          telegramId: String(row[1] || '').trim(),
          firstName: String(row[2] || '').trim(),
          lastName: String(row[3] || '').trim(),
          phone: String(row[4] || '').trim(),
          email: String(row[5] || '').trim(),
          username: row[6] ? String(row[6]).trim() : undefined,
          promoCode: String(row[7] || '').trim(),
          inviterCode: row[8] ? String(row[8]).trim() : undefined,
          inviterTelegramId: row[9] ? String(row[9]).trim() : undefined,
          registrationDate: String(row[10] || '').trim(),
          totalEarnings: parseFloat(row[11]) || 0,
          salesCount: parseInt(row[12]) || 0
        })),
        level4: level4.map(row => ({
          id: String(row[0] || ''),
          telegramId: String(row[1] || '').trim(),
          firstName: String(row[2] || '').trim(),
          lastName: String(row[3] || '').trim(),
          phone: String(row[4] || '').trim(),
          email: String(row[5] || '').trim(),
          username: row[6] ? String(row[6]).trim() : undefined,
          promoCode: String(row[7] || '').trim(),
          inviterCode: row[8] ? String(row[8]).trim() : undefined,
          inviterTelegramId: row[9] ? String(row[9]).trim() : undefined,
          registrationDate: String(row[10] || '').trim(),
          totalEarnings: parseFloat(row[11]) || 0,
          salesCount: parseInt(row[12]) || 0
        }))
      };
      
      console.log('Network data from Google Sheets API:', network);
      console.log('=== GET PARTNER NETWORK END ===');
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

  private async readFromAppsScript(action: string, data: any): Promise<{ success: boolean; result?: any; error?: string }> {
    if (!this.webAppUrl) {
      console.warn('Google Apps Script URL не настроен');
      return { success: false, error: 'Apps Script URL не настроен' };
    }

    try {
      const getUrl = `${this.webAppUrl}?action=${encodeURIComponent(action)}&data=${encodeURIComponent(JSON.stringify(data))}`;
      console.log('=== READING FROM APPS SCRIPT ===');
      console.log('Action:', action);
      console.log('Data:', data);
      console.log('URL:', getUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(getUrl, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

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
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }
    } catch (error) {
      console.error('Error reading from Apps Script:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
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

  // Функция для загрузки конфигурации уровней из Google Sheets
  async getLevelsConfig(): Promise<{ success: boolean; levels?: LevelConfig[]; error?: string }> {
    try {
      console.log('=== GET LEVELS CONFIG START ===');
      
      // Список возможных листов для поиска конфигурации уровней
      const possibleSheets = ['Настройки', 'Settings', 'Config', 'Configuration', 'Уровни', 'Levels'];
      
      for (const sheetName of possibleSheets) {
        try {
          const url = `${this.baseUrl}/${this.spreadsheetId}/values/${sheetName}!A2:C5?key=${this.apiKey}`;
          console.log(`Trying to fetch levels config from sheet: ${sheetName}`, url);
          
          const response = await fetch(url);
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Levels config response from ${sheetName}:`, data);
            
            if (data.values && data.values.length > 0) {
              const levels: LevelConfig[] = data.values.map((row: any[], index: number) => {
                const level = index + 1;
                // Умножаем на 100, так как в таблице значения в формате 0.08, 0.04, а в приложении нужно 8, 4
                const percentage = (parseFloat(row[1]) || 0) * 100;
                const colorName = (row[2] || 'blue').toLowerCase();
                
                const colorMap: { [key: string]: { bg: string; text: string } } = {
                  'blue': { bg: 'from-blue-100 to-blue-200', text: 'text-blue-800' },
                  'cyan': { bg: 'from-cyan-100 to-cyan-200', text: 'text-cyan-800' },
                  'teal': { bg: 'from-teal-100 to-teal-200', text: 'text-teal-800' },
                  'green': { bg: 'from-green-100 to-green-200', text: 'text-green-800' },
                  'orange': { bg: 'from-orange-100 to-orange-200', text: 'text-orange-800' },
                  'purple': { bg: 'from-purple-100 to-purple-200', text: 'text-purple-800' },
                  'red': { bg: 'from-red-100 to-red-200', text: 'text-red-800' },
                  'yellow': { bg: 'from-yellow-100 to-yellow-200', text: 'text-yellow-800' }
                };
                
                return {
                  level,
                  percentage,
                  color: colorMap[colorName] || colorMap['blue']
                };
              });
              
              console.log(`Successfully parsed levels config from ${sheetName}:`, levels);
              return { success: true, levels };
            } else {
              console.log(`Sheet ${sheetName} found but no data, trying next...`);
            }
          } else {
            console.log(`Sheet ${sheetName} not found (${response.status}), trying next...`);
          }
        } catch (sheetError) {
          console.log(`Error accessing sheet ${sheetName}:`, sheetError);
          // Продолжаем к следующему листу
          continue;
        }
      }
      
      // Если ни один лист не найден, используем значения по умолчанию
      console.warn('No levels config data found in any sheet, using default values');
      return { success: true, levels: this.getDefaultLevelsConfig() };
      
    } catch (error) {
      console.error('Error fetching levels config:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Функция для получения списка всех листов в Google Sheets
  async getAvailableSheets(): Promise<{ success: boolean; sheets?: string[]; error?: string }> {
    try {
      console.log('=== GET AVAILABLE SHEETS START ===');
      
      const url = `${this.baseUrl}/${this.spreadsheetId}?key=${this.apiKey}`;
      console.log('Fetching spreadsheet info from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('Failed to fetch spreadsheet info:', response.status, response.statusText);
        return { success: false, error: `HTTP error! status: ${response.status}` };
      }
      
      const data = await response.json();
      console.log('Spreadsheet info response:', data);
      
      if (data.sheets && data.sheets.length > 0) {
        const sheetNames = data.sheets.map((sheet: any) => sheet.properties.title);
        console.log('Available sheets:', sheetNames);
        return { success: true, sheets: sheetNames };
      }
      
      return { success: false, error: 'No sheets found' };
      
    } catch (error) {
      console.error('Error fetching available sheets:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Функция для получения конфигурации уровней по умолчанию
  private getDefaultLevelsConfig(): LevelConfig[] {
    return [
      {
        level: 1,
        percentage: 1,
        color: { bg: 'from-blue-100 to-blue-200', text: 'text-blue-800' }
      },
      {
        level: 2,
        percentage: 2,
        color: { bg: 'from-cyan-100 to-cyan-200', text: 'text-cyan-800' }
      },
      {
        level: 3,
        percentage: 4,
        color: { bg: 'from-teal-100 to-teal-200', text: 'text-teal-800' }
      },
      {
        level: 4,
        percentage: 8,
        color: { bg: 'from-green-100 to-green-200', text: 'text-green-800' }
      }
    ];
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
}

export const googleSheetsService = new GoogleSheetsService();

export type { PartnerRecord, CommissionRecord, NetworkData, LevelConfig, PartnerStats };
