// ИСПРАВЛЕННЫЙ КОД ДЛЯ GOOGLE APPS SCRIPT С CORS
// Скопируйте этот код в ваш Google Apps Script проект

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    let result = { success: false, error: 'No action specified' };
    
    // Обработка POST запросов
    if (e.postData && e.postData.contents) {
      const data = JSON.parse(e.postData.contents);
      const action = data.action;
      
      switch (action) {
        case 'registerPartner':
          result = registerPartner(data.data);
          break;
        case 'getPartner':
          result = getPartner(data.data.telegramId);
          break;
        case 'getPartnerCommissions':
          result = getPartnerCommissions(data.data.telegramId);
          break;
        case 'getPartnerNetwork':
          result = getPartnerNetwork(data.data.telegramId);
          break;
        case 'validatePromoCode':
          result = validatePromoCode(data.data.promoCode);
          break;
        case 'testConnection':
          result = { success: true, message: 'Connection successful' };
          break;
        default:
          result = { success: false, error: 'Unknown action: ' + action };
      }
    } else {
      // Обработка GET запросов
      result = { success: true, message: 'Google Apps Script is working' };
    }
    
    // Создаем ответ с правильными CORS заголовками
    const output = ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
    return output;
      
  } catch (error) {
    const errorResult = {
      success: false,
      error: 'Server error: ' + error.toString()
    };
    
    const output = ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
    
    return output;
  }
}

function registerPartner(partnerData) {
  try {
    console.log('=== REGISTER PARTNER START ===');
    console.log('Registering partner:', partnerData);
    console.log('inviterCode value:', partnerData.inviterCode);
    console.log('inviterCode type:', typeof partnerData.inviterCode);
    console.log('inviterCode === "NOPROMO":', partnerData.inviterCode === 'NOPROMO');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const partnersSheet = spreadsheet.getSheetByName('Партнеры');
    
    if (!partnersSheet) {
      return { success: false, error: 'Лист "Партнеры" не найден' };
    }
    
    const lastRow = partnersSheet.getLastRow();
    let partnersData = [];
    
    if (lastRow > 1) {
      partnersData = partnersSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    }
    
    const existingPartner = partnersData.find(row => row[1] === partnerData.telegramId);
    if (existingPartner) {
      return { success: false, error: 'Партнер с таким Telegram ID уже существует' };
    }
    
    let inviterTelegramId = '';
    
    // Нормализуем inviterCode - если он пустой, null, undefined или "NOPROMO", то считаем его отсутствующим
    const inviterCode = partnerData.inviterCode && 
                       partnerData.inviterCode.trim() !== '' && 
                       partnerData.inviterCode !== 'NOPROMO' 
                       ? partnerData.inviterCode 
                       : null;
    
    console.log('Normalized inviterCode:', inviterCode);
    console.log('Will check inviter code:', !!inviterCode);
    
    if (inviterCode) {
      console.log('Checking inviter code:', inviterCode);
      const inviter = partnersData.find(row => row[7] === inviterCode);
      
      if (!inviter) {
        console.log('Inviter not found for code:', inviterCode);
        return { success: false, error: 'Неверный промокод пригласившего' };
      }
      
      inviterTelegramId = inviter[1]; // Telegram ID пригласившего
      console.log('Found inviter:', inviterTelegramId);
    } else {
      console.log('No inviter code to check - proceeding without inviter');
    }
    
    const newId = lastRow;
    const promoCode = generatePromoCode();
    
    const existingPromo = partnersData.find(row => row[7] === promoCode);
    if (existingPromo) {
      return { success: false, error: 'Ошибка генерации промокода' };
    }
    
    const rowData = [
      newId,
      partnerData.telegramId,
      partnerData.firstName,
      partnerData.lastName,
      partnerData.phone,
      partnerData.email,
      partnerData.username || '',
      promoCode,
      inviterCode || '', // Пустая строка если нет промокода
      inviterTelegramId,
      partnerData.registrationDate,
      0,
      0
    ];
    
    console.log('Row data to insert:', rowData);
    
    partnersSheet.appendRow(rowData);
    
    console.log('Partner registered successfully:', {
      id: newId,
      telegramId: partnerData.telegramId,
      promoCode: promoCode
    });
    
    return {
      success: true,
      promoCode: promoCode,
      message: 'Партнер успешно зарегистрирован'
    };
    
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Ошибка при регистрации: ' + error.toString()
    };
  }
}

function getPartner(telegramId) {
  try {
    console.log('Getting partner for Telegram ID:', telegramId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const partnersSheet = spreadsheet.getSheetByName('Партнеры');
    
    if (!partnersSheet) {
      return { success: false, error: 'Лист "Партнеры" не найден' };
    }
    
    const lastRow = partnersSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, error: 'Партнер не найден' };
    }
    
    const partnersData = partnersSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    const partner = partnersData.find(row => row[1] === telegramId);
    
    if (!partner) {
      return { success: false, error: 'Партнер не найден' };
    }
    
    return {
      success: true,
      partner: {
        id: partner[0],
        telegramId: partner[1],
        firstName: partner[2],
        lastName: partner[3],
        phone: partner[4],
        email: partner[5],
        username: partner[6],
        promoCode: partner[7],
        inviterCode: partner[8],
        inviterTelegramId: partner[9],
        registrationDate: partner[10],
        totalCommissions: partner[11],
        totalReferrals: partner[12]
      }
    };
    
  } catch (error) {
    console.error('Get partner error:', error);
    return { success: false, error: 'Ошибка при получении данных партнера' };
  }
}

function getPartnerCommissions(telegramId) {
  try {
    console.log('Getting commissions for Telegram ID:', telegramId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const commissionsSheet = spreadsheet.getSheetByName('Комиссии');
    
    if (!commissionsSheet) {
      return { success: false, error: 'Лист "Комиссии" не найден' };
    }
    
    const lastRow = commissionsSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, commissions: [] };
    }
    
    const commissionsData = commissionsSheet.getRange(2, 1, lastRow - 1, 7).getValues();
    const partnerCommissions = commissionsData.filter(row => row[2] === telegramId);
    
    const commissions = partnerCommissions.map(row => ({
      id: row[0],
      saleId: row[1],
      partnerTelegramId: row[2],
      level: row[3],
      amount: row[4],
      commission: row[5],
      date: row[6]
    }));
    
    return { success: true, commissions };
    
  } catch (error) {
    console.error('Get commissions error:', error);
    return { success: false, error: 'Ошибка при получении комиссий' };
  }
}

function getPartnerNetwork(telegramId) {
  try {
    console.log('Getting network for Telegram ID:', telegramId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const partnersSheet = spreadsheet.getSheetByName('Партнеры');
    
    if (!partnersSheet) {
      return { success: false, error: 'Лист "Партнеры" не найден' };
    }
    
    const lastRow = partnersSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: true, network: { level1: [], level2: [], level3: [], level4: [] } };
    }
    
    const partnersData = partnersSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    
    // Находим партнеров по уровням
    const level1 = partnersData.filter(row => row[9] === telegramId); // inviterTelegramId
    const level2 = [];
    const level3 = [];
    const level4 = [];
    
    // Уровень 2
    level1.forEach(partner => {
      const level2Partners = partnersData.filter(row => row[9] === partner[1]);
      level2.push(...level2Partners);
    });
    
    // Уровень 3
    level2.forEach(partner => {
      const level3Partners = partnersData.filter(row => row[9] === partner[1]);
      level3.push(...level3Partners);
    });
    
    // Уровень 4
    level3.forEach(partner => {
      const level4Partners = partnersData.filter(row => row[9] === partner[1]);
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
    
    return { success: true, network };
    
  } catch (error) {
    console.error('Get network error:', error);
    return { success: false, error: 'Ошибка при получении сети партнеров' };
  }
}

function validatePromoCode(promoCode) {
  try {
    console.log('Validating promo code:', promoCode);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const partnersSheet = spreadsheet.getSheetByName('Партнеры');
    
    if (!partnersSheet) {
      return { success: false, error: 'Лист "Партнеры" не найден' };
    }
    
    const lastRow = partnersSheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, error: 'Промокод не найден' };
    }
    
    const partnersData = partnersSheet.getRange(2, 1, lastRow - 1, 13).getValues();
    const partner = partnersData.find(row => row[7] === promoCode);
    
    if (!partner) {
      return { success: false, error: 'Промокод не найден' };
    }
    
    return { success: true, message: 'Промокод действителен' };
    
  } catch (error) {
    console.error('Validate promo code error:', error);
    return { success: false, error: 'Ошибка при проверке промокода' };
  }
}

function generatePromoCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PARTNER';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
