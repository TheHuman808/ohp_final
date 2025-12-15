// ==========================================
// ГЛАВНЫЙ ОБРАБОТЧИК ЗАПРОСОВ (DO GET / DO POST)
// ==========================================

function doGet(e) {
  // Проверяем и настраиваем триггер при первом запуске
  ensureSalesCountUpdateTrigger();
  return handleRequest(e);
}

function doPost(e) {
  // Проверяем и настраиваем триггер при первом запуске
  ensureSalesCountUpdateTrigger();
  return handleRequest(e);
}

// ==========================================
// ФУНКЦИЯ: ПРОВЕРКА И НАСТРОЙКА ТРИГГЕРА (АВТОМАТИЧЕСКИ)
// ==========================================

function ensureSalesCountUpdateTrigger() {
  try {
    const triggers = ScriptApp.getProjectTriggers();
    const hasTrigger = triggers.some(trigger => 
      trigger.getHandlerFunction() === 'updatePartnersSalesCount'
    );
    
    if (!hasTrigger) {
      console.log('Триггер не найден, создаем новый...');
      setupSalesCountUpdateTrigger();
    }
  } catch (error) {
    console.error('Ошибка при проверке триггера:', error);
  }
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
        case 'importOrders':
          result = importOrdersToSalesSheet();
          break;
        case 'calculateCommissions':
          result = calculateCommissions();
          break;
        case 'updatePartnersSalesCount':
          result = updatePartnersSalesCount();
          break;
        case 'setupSalesCountUpdateTrigger':
          result = setupSalesCountUpdateTrigger();
          break;
        default:
          result = { success: false, error: 'Unknown action: ' + action };
      }
    } else if (e.parameter) {
      // Обработка GET запросов с параметрами
      const action = e.parameter.action;
      const dataParam = e.parameter.data;
      
      console.log('GET request - action:', action);
      
      if (!action) {
        result = { success: true, message: 'Google Apps Script is working' };
      } else {
        let data = {};
        if (dataParam) {
          try {
            data = JSON.parse(decodeURIComponent(dataParam));
          } catch (parseError) {
            console.error('Error parsing data parameter:', parseError);
            return ContentService
              .createTextOutput(JSON.stringify({ success: false, error: 'Invalid data parameter' }))
              .setMimeType(ContentService.MimeType.JSON);
          }
        }
        
        switch (action) {
          case 'registerPartner':
            result = registerPartner(data);
            break;
          case 'getPartner':
            result = getPartner(data.telegramId);
            break;
          case 'getPartnerCommissions':
            result = getPartnerCommissions(data.telegramId);
            break;
          case 'getPartnerNetwork':
            result = getPartnerNetwork(data.telegramId);
            break;
          case 'validatePromoCode':
            result = validatePromoCode(data.promoCode);
            break;
          case 'testConnection':
            result = { success: true, message: 'Connection successful' };
            break;
          case 'importOrders':
            result = importOrdersToSalesSheet();
            break;
          case 'calculateCommissions':
            result = calculateCommissions();
            break;
          case 'updatePartnersSalesCount':
            result = updatePartnersSalesCount();
            break;
          case 'setupSalesCountUpdateTrigger':
            result = setupSalesCountUpdateTrigger();
            break;
          default:
            result = { success: false, error: 'Unknown action: ' + action };
        }
      }
    } else {
      result = { success: true, message: 'Google Apps Script is working' };
    }
    
    const output = ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
    
    return output;
      
  } catch (error) {
    console.error('Server error:', error);
    const errorResult = {
      success: false,
      error: 'Server error: ' + error.toString()
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==========================================
// ИСПРАВЛЕННАЯ ФУНКЦИЯ: ИМПОРТ ЗАКАЗОВ
// ==========================================

function importOrdersToSalesSheet() {
  console.log('=== START ORDER IMPORT TO SALES (V3 FIXED) ===');
  
  const SPREADSHEET = SpreadsheetApp.getActiveSpreadsheet();
  const SALES_SHEET_NAME = 'Продажи';
  const salesSheet = SPREADSHEET.getSheetByName(SALES_SHEET_NAME);
  
  if (!salesSheet) {
    return { success: false, error: `Лист "${SALES_SHEET_NAME}" не найден` };
  }
  
  let allOrders = [];
  
  // НАСТРОЙКА ИНДЕКСОВ КОЛОНОК (A=1, B=2 ... Q=17, X=24, Z=26, AB=28)
  const FIELD_INDICES = {
    ORDER_ID: 1,              // A - ID заказа
    ORDER_TOTAL: 4,           // D - Сумма заказа
    COL_PROMO_OR_EMAIL: 24,   // X - Промокод или Email
    COL_NOTE: 26,             // Z - Информация о клиенте
    COL_DATE: 28,             // AB - Дата
    PRODUCT_NAME_QTY: 17      // Q - Product name(QTY)(SKU)
  };

  // Функция для извлечения количества из строки вида "Инуловит(1)()"
  function extractQuantity(productNameQty) {
    if (!productNameQty) return 0;
    
    const str = String(productNameQty).trim();
    // Ищем паттерн (число) в скобках
    const match = str.match(/\((\d+)\)/);
    if (match && match[1]) {
      return parseInt(match[1], 10) || 0;
    }
    return 0;
  }

  function processSheet(sheetName) {
    const sheet = SPREADSHEET.getSheetByName(sheetName);
    if (!sheet) {
      console.warn(`Лист ${sheetName} не найден`);
      return [];
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];

    // Читаем диапазон до колонки AB (28), чтобы захватить все нужные колонки
    const dataRange = sheet.getRange(2, 1, lastRow - 1, FIELD_INDICES.COL_DATE).getValues();
    
    return dataRange.map(row => {
      const orderId = row[FIELD_INDICES.ORDER_ID - 1];
      if (!orderId || orderId.toString().trim() === "") return null;

      const dateVal = row[FIELD_INDICES.COL_DATE - 1];          
      const totalVal = row[FIELD_INDICES.ORDER_TOTAL - 1];      
      const promoEmailVal = row[FIELD_INDICES.COL_PROMO_OR_EMAIL - 1]; 
      const noteVal = row[FIELD_INDICES.COL_NOTE - 1];
      const productNameQty = row[FIELD_INDICES.PRODUCT_NAME_QTY - 1]; // Q - Product name(QTY)(SKU)
      
      // Извлекаем количество из Product name(QTY)(SKU)
      const quantity = extractQuantity(productNameQty);
      
      // Новая структура: ID, Количество, Дата, Сумма, Промокод, Информация о клиенте, Статус
      return [
        orderId,
        quantity,        // Количество (без скобок)
        dateVal,
        totalVal,
        promoEmailVal,
        noteVal,
        sheetName 
      ];
    }).filter(row => row !== null);
  }
  
  allOrders.push(...processSheet('Pending Orders'));
  allOrders.push(...processSheet('Processing Orders'));
  allOrders.push(...processSheet('Completed Orders'));
  
  if (allOrders.length === 0) {
    // В этом случае мы все равно запускаем расчет, так как могли быть пропущенные старые продажи.
    calculateCommissions(); 
    return { success: true, message: 'Нет новых данных для импорта. Запущен расчет комиссий.' };
  }
  
  salesSheet.clearContents(); 
  
  // Новая структура: ID, Количество, Дата, Сумма, Промокод, Информация о клиенте, Статус
  const headers = ['ID', 'Количество', 'Дата', 'Сумма', 'Промокод', 'Информация о клиенте', 'Статус'];
  salesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  salesSheet.getRange(2, 1, allOrders.length, allOrders[0].length).setValues(allOrders);
  
  console.log(`Импортировано ${allOrders.length} строк.`);
  
  // ЗАПУСКАЕМ РАСЧЕТ КОМИССИЙ СРАЗУ ПОСЛЕ ИМПОРТА
  calculateCommissions();
  
  return { success: true, message: `Успешно импортировано ${allOrders.length} строк и запущен расчет комиссий.` };
}

// ==========================================
// ИСПРАВЛЕННАЯ ФУНКЦИЯ: РАСЧЕТ НАЧИСЛЕНИЙ (MLM)
// ==========================================

function calculateCommissions() {
  console.log('=== START COMMISSION CALCULATION ===');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const salesSheet = ss.getSheetByName('Продажи');
  const partnersSheet = ss.getSheetByName('Партнеры');
  const settingsSheet = ss.getSheetByName('Настройки');
  const accrualsSheet = ss.getSheetByName('Начисления');
  
  if (!salesSheet || !partnersSheet || !settingsSheet || !accrualsSheet) {
    return { success: false, error: 'Не все листы найдены (Продажи, Партнеры, Настройки, Начисления)' };
  }

  // --- ШАГ 1: ПОЛУЧЕНИЕ НАСТРОЕК (УРОВНИ И ПРОЦЕНТЫ) ---
  const settingsLastRow = settingsSheet.getLastRow();
  let levels = {};
  if (settingsLastRow > 1) {
    const settingsData = settingsSheet.getRange(2, 1, settingsLastRow - 1, 2).getValues();
    settingsData.forEach(row => {
      const levelText = String(row[0] || '').trim();
      // Извлекаем номер уровня из текста "Уровень 1" или просто "1"
      const levelMatch = levelText.match(/\d+/);
      if (levelMatch) {
        const levelNum = parseInt(levelMatch[0]);
        // Процент в таблице в формате 8, 4, 2, 1, но нужно преобразовать в 0.08, 0.04, 0.02, 0.01
        const percentage = parseFloat(row[1]) || 0;
        levels[levelNum] = percentage > 1 ? percentage / 100 : percentage;
      }
    });
  } else {
    // Дефолтные настройки
    levels = { 1: 0.08, 2: 0.04, 3: 0.02, 4: 0.01 };
  }
  
  console.log('Levels config:', levels);

  // --- ШАГ 2: ИНДЕКСАЦИЯ ПАРТНЕРОВ (ИСПРАВЛЕНО) ---
  const partnersLastRow = partnersSheet.getLastRow();
  let partnersByPromo = {};
  let partnersByPhone = {};
  let partnersByTgId = {};
  
  if (partnersLastRow > 1) {
    // Структура листа Партнеры: A=ID, B=Telegram ID, C=Имя, D=Фамилия, E=Телефон, F=Email, 
    // G=Username, H=Промокод, I=Код пригласившего, J=Telegram ID пригласившего, K=Дата, L=Доход, M=Продажи
    const partnersData = partnersSheet.getRange(2, 1, partnersLastRow - 1, 13).getValues();
    
    partnersData.forEach((row) => {
      const tgId = String(row[1] || '').trim(); // B - Telegram ID
      const phone = String(row[4] || '').replace(/\D/g, ''); // E - Телефон (убираем все нецифровые символы)
      const promo = String(row[7] || '').trim(); // H - Промокод
      const inviterTgId = String(row[9] || '').trim(); // J - Telegram ID пригласившего
      
      const p = {
        tgId: tgId,
        phone: phone.length >= 7 ? phone.slice(-10) : phone, // Последние 10 цифр для унификации
        promo: promo,
        inviterTgId: inviterTgId
      };
      
      // Нормализуем промокод - убираем пробелы, приводим к строке
      if (p.promo) {
        const normalizedPromo = p.promo.toUpperCase().trim();
        partnersByPromo[normalizedPromo] = p;
        partnersByPromo[p.promo] = p; // Также сохраняем оригинальный вариант
      }
      
      // Нормализуем телефон
      if (p.phone && p.phone.length >= 7) {
        partnersByPhone[p.phone] = p;
      }
      
      // Индексируем по Telegram ID
      if (p.tgId) {
        partnersByTgId[p.tgId] = p;
      }
    });
  }
  
  console.log('Partners indexed:', {
    byPromo: Object.keys(partnersByPromo).length,
    byPhone: Object.keys(partnersByPhone).length,
    byTgId: Object.keys(partnersByTgId).length
  });

  // --- ШАГ 3: ПОЛУЧЕНИЕ СУЩЕСТВУЮЩИХ НАЧИСЛЕНИЙ ---
  const accLastRow = accrualsSheet.getLastRow();
  let existingAccruals = new Set(); 
  
  if (accLastRow > 1) {
    // Структура листа Начисления: A=ID, B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент, G=Дата
    const accData = accrualsSheet.getRange(2, 2, accLastRow - 1, 3).getValues(); 
    accData.forEach(row => {
      const saleId = String(row[0] || '').trim();
      const partnerTgId = String(row[1] || '').trim();
      const level = String(row[2] || '').trim();
      if (saleId && partnerTgId && level) {
        existingAccruals.add(`${saleId}_${partnerTgId}_${level}`);
      }
    });
  }
  
  console.log('Existing accruals count:', existingAccruals.size);

  // --- ШАГ 4: ОБРАБОТКА ПРОДАЖ ---
  const salesLastRow = salesSheet.getLastRow();
  if (salesLastRow <= 1) {
    return { success: true, message: 'Нет продаж для обработки' };
  }
  
  // Новая структура листа Продажи: A=ID, B=Количество, C=Дата, D=Сумма, E=Промокод, F=Инфо о клиенте, G=Статус
  const salesData = salesSheet.getRange(2, 1, salesLastRow - 1, 7).getValues();
  let newAccruals = [];

  salesData.forEach((sale) => {
    const saleId = String(sale[0] || '').trim();
    const saleSum = parseFloat(sale[3]) || 0; // D - Сумма
    const salePromo = String(sale[4] || '').trim(); // E - Промокод
    const customerInfo = String(sale[5] || '').trim(); // F - Информация о клиенте
    const cleanCustomerPhone = customerInfo.replace(/\D/g, ''); // Убираем все нецифровые символы
    const normalizedCustomerPhone = cleanCustomerPhone.length >= 7 ? cleanCustomerPhone.slice(-10) : cleanCustomerPhone;
    
    if (!saleId || isNaN(saleSum) || saleSum <= 0) {
      return; // Пропускаем некорректные продажи
    }

    // --- 4.1 ПОИСК ПАРТНЕРА ПО ПРОМОКОДУ И ПОЛУЧЕНИЕ TELEGRAM ID ПРИГЛАСИВШЕГО ---
    let sourcePartner = null;
    let inviterTgId = null;
    
    // Ищем партнера по промокоду из продажи
    if (salePromo) {
      const normalizedPromo = salePromo.toUpperCase().trim();
      sourcePartner = partnersByPromo[normalizedPromo] || partnersByPromo[salePromo];
      
      if (sourcePartner) {
        // Получаем Telegram ID пригласившего партнера (того, кто пригласил sourcePartner)
        inviterTgId = sourcePartner.inviterTgId;
        console.log(`Sale ${saleId}: Found source partner ${sourcePartner.tgId} (promo: ${sourcePartner.promo}), inviter: ${inviterTgId}`);
      }
    }
    
    // Если по промокоду не нашли, ищем по телефону из информации о клиенте
    if (!sourcePartner && normalizedCustomerPhone && normalizedCustomerPhone.length >= 7) {
      sourcePartner = partnersByPhone[normalizedCustomerPhone];
      if (sourcePartner) {
        inviterTgId = sourcePartner.inviterTgId;
        console.log(`Sale ${saleId}: Found source partner ${sourcePartner.tgId} by phone, inviter: ${inviterTgId}`);
      }
    }

    if (!sourcePartner) {
      console.log(`Sale ${saleId}: No partner found for promo "${salePromo}" or phone "${normalizedCustomerPhone}"`);
      return; // Пропускаем продажи без партнера
    }

    // --- 4.2 РАСЧЕТ MLM ПО ЦЕПОЧКЕ ВВЕРХ (UPLINE) ---
    // Начинаем с пригласившего партнера (inviterTgId), а не с самого sourcePartner
    let currentPartner = inviterTgId && partnersByTgId[inviterTgId] ? partnersByTgId[inviterTgId] : null;
    
    if (!currentPartner) {
      console.log(`Sale ${saleId}: No inviter found for source partner ${sourcePartner.tgId}, skipping commission calculation`);
      return; // Если нет пригласившего, не начисляем комиссию
    }
    
    // Ищем пригласителей до 4 уровня
    for (let level = 1; level <= 4; level++) {
      const inviterTgId = currentPartner.inviterTgId;
      
      // Если нет пригласителя, прерываем цепочку
      if (!inviterTgId || !partnersByTgId[inviterTgId]) {
        console.log(`Sale ${saleId}: No inviter at level ${level}, stopping chain`);
        break;
      }
      
      const beneficiary = partnersByTgId[inviterTgId];
      const percentage = levels[level] || 0;
      
      if (percentage > 0) {
        const uniqueKey = `${saleId}_${beneficiary.tgId}_${level}`;
        
        if (!existingAccruals.has(uniqueKey)) {
          const commissionAmount = saleSum * percentage;
          
          // Структура листа Начисления: A=ID (информация из продажи), B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент
          newAccruals.push([
            customerInfo || saleId,     // A: ID (информация о клиенте или ID продажи)
            saleId,                      // B: ID продажи
            beneficiary.tgId,             // C: Telegram ID партнера (получателя комиссии)
            level,                       // D: Уровень
            commissionAmount,            // E: Сумма комиссии
            percentage                   // F: Процент
          ]);
          
          existingAccruals.add(uniqueKey); // Добавляем, чтобы избежать дублей в этой же сессии
          console.log(`Sale ${saleId}: Added accrual for partner ${beneficiary.tgId} at level ${level}, amount: ${commissionAmount}`);
        } else {
          console.log(`Sale ${saleId}: Accrual already exists for partner ${beneficiary.tgId} at level ${level}`);
        }
      }
      
      // Поднимаемся на уровень выше
      currentPartner = beneficiary;
    }
  });

  // --- ШАГ 5: ЗАПИСЬ РЕЗУЛЬТАТОВ ---
  if (newAccruals.length > 0) {
    accrualsSheet.getRange(accLastRow + 1, 1, newAccruals.length, 6).setValues(newAccruals);
    console.log(`Добавлено ${newAccruals.length} новых начислений.`);
    
    // Обновляем количество продаж после добавления новых начислений
    updatePartnersSalesCount();
    
    return { success: true, message: `Начислено комиссий: ${newAccruals.length}` };
  } else {
    console.log('Новых начислений нет.');
    // Все равно обновляем количество продаж (на случай изменений)
    updatePartnersSalesCount();
    return { success: true, message: 'Новых начислений нет' };
  }
}

// ==========================================
// ФУНКЦИИ ПАРТНЕРСКОЙ ПРОГРАММЫ
// ==========================================

function registerPartner(partnerData) {
  try {
    console.log('=== REGISTER PARTNER START ===');
    console.log('Registering partner:', partnerData);
    
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
    
    // Проверяем существование партнера по Telegram ID
    const existingPartner = partnersData.find(row => String(row[1] || '').trim() === String(partnerData.telegramId || '').trim());
    if (existingPartner) {
      return { success: false, error: 'Партнер с таким Telegram ID уже существует' };
    }
    
    let inviterTelegramId = '';
    
    // Нормализуем inviterCode
    const inviterCode = partnerData.inviterCode && 
                       String(partnerData.inviterCode).trim() !== '' && 
                       String(partnerData.inviterCode).trim() !== 'NOPROMO' 
                       ? String(partnerData.inviterCode).trim() 
                       : null;
    
    console.log('Normalized inviterCode:', inviterCode);
    
    if (inviterCode) {
      // Ищем пригласившего по промокоду (нормализуем для поиска)
      const normalizedInviterCode = inviterCode.toUpperCase().trim();
      const inviter = partnersData.find(row => {
        const promo = String(row[7] || '').trim();
        return promo.toUpperCase() === normalizedInviterCode || promo === inviterCode;
      });
      
      if (!inviter) {
        console.log('Inviter not found for code:', inviterCode);
        return { success: false, error: 'Неверный промокод пригласившего' };
      }
      
      inviterTelegramId = String(inviter[1] || '').trim(); // Telegram ID пригласившего
      console.log('Found inviter:', inviterTelegramId);
    } else {
      console.log('No inviter code - proceeding without inviter');
    }
    
    const newId = lastRow;
    const promoCode = generatePromoCode();
    
    // Проверяем уникальность промокода
    const existingPromo = partnersData.find(row => String(row[7] || '').trim() === promoCode);
    if (existingPromo) {
      return { success: false, error: 'Ошибка генерации промокода' };
    }
    
    const rowData = [
      newId,
      String(partnerData.telegramId || '').trim(),
      String(partnerData.firstName || '').trim(),
      String(partnerData.lastName || '').trim(),
      String(partnerData.phone || '').trim(),
      String(partnerData.email || '').trim(),
      String(partnerData.username || '').trim(),
      promoCode,
      inviterCode || '',
      inviterTelegramId,
      String(partnerData.registrationDate || '').trim(),
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
    const partner = partnersData.find(row => String(row[1] || '').trim() === String(telegramId || '').trim());
    
    if (!partner) {
      return { success: false, error: 'Партнер не найден' };
    }
    
    return {
      success: true,
      partner: {
        id: partner[0],
        telegramId: String(partner[1] || '').trim(),
        firstName: String(partner[2] || '').trim(),
        lastName: String(partner[3] || '').trim(),
        phone: String(partner[4] || '').trim(),
        email: String(partner[5] || '').trim(),
        username: String(partner[6] || '').trim(),
        promoCode: String(partner[7] || '').trim(),
        inviterCode: String(partner[8] || '').trim(),
        inviterTelegramId: String(partner[9] || '').trim(),
        registrationDate: String(partner[10] || '').trim(),
        totalCommissions: parseFloat(partner[11]) || 0,
        totalReferrals: parseInt(partner[12]) || 0
      }
    };
    
  } catch (error) {
    console.error('Get partner error:', error);
    return { success: false, error: 'Ошибка при получении данных партнера' };
  }
}

function getPartnerCommissions(telegramId) {
  try {
    console.log('=== GET PARTNER COMMISSIONS START ===');
    console.log('Getting commissions for Telegram ID:', telegramId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    // ИСПРАВЛЕНО: Используем лист "Начисления" вместо "Комиссии"
    const commissionsSheet = spreadsheet.getSheetByName('Начисления');
    
    if (!commissionsSheet) {
      console.error('Лист "Начисления" не найден');
      return { success: false, error: 'Лист "Начисления" не найден' };
    }
    
    const lastRow = commissionsSheet.getLastRow();
    console.log('Last row in Начисления sheet:', lastRow);
    
    if (lastRow <= 1) {
      console.log('No data in Начисления sheet (only header or empty)');
      return { success: true, commissions: [] };
    }
    
    // Структура листа Начисления: 
    // A=ID, B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент, G=Дата расчета, H=Рассчитались, I=Остаток
    // Читаем минимум 7 колонок (A-G), но можем прочитать больше для будущего использования
    const commissionsData = commissionsSheet.getRange(2, 1, lastRow - 1, 9).getValues();
    console.log(`Read ${commissionsData.length} rows from Начисления sheet`);
    
    // Нормализуем Telegram ID для поиска
    const searchTgId = String(telegramId || '').trim();
    console.log('Searching for Telegram ID:', searchTgId);
    
    // Фильтруем по Telegram ID партнера (колонка C, индекс 2)
    const partnerCommissions = commissionsData.filter(row => {
      if (!row || row.length < 3) {
        return false;
      }
      const rowTgId = String(row[2] || '').trim();
      const match = rowTgId === searchTgId;
      if (match) {
        console.log('Found matching commission row:', {
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
    });
    
    console.log(`Filtered ${partnerCommissions.length} commissions for Telegram ID ${searchTgId}`);
    
    const commissions = partnerCommissions.map(row => ({
      id: String(row[0] || '').trim(),
      saleId: String(row[1] || '').trim(),
      partnerTelegramId: String(row[2] || '').trim(),
      level: parseInt(row[3]) || 1,
      amount: parseFloat(row[4]) || 0,
      commission: parseFloat(row[5]) || 0,
      date: String(row[6] || '').trim() // Дата расчета
    }));
    
    console.log(`Returning ${commissions.length} commissions for partner ${telegramId}`);
    console.log('=== GET PARTNER COMMISSIONS END ===');
    
    return { success: true, commissions };
    
  } catch (error) {
    console.error('Get commissions error:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: 'Ошибка при получении комиссий: ' + error.toString() };
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
    // Колонка J (индекс 9) - Telegram ID пригласившего
    const searchTgId = String(telegramId || '').trim();
    const level1 = partnersData.filter(row => String(row[9] || '').trim() === searchTgId);
    
    const level2 = [];
    const level3 = [];
    const level4 = [];
    
    // Уровень 2
    level1.forEach(partner => {
      const partnerTgId = String(partner[1] || '').trim();
      const level2Partners = partnersData.filter(row => String(row[9] || '').trim() === partnerTgId);
      level2.push(...level2Partners);
    });
    
    // Уровень 3
    level2.forEach(partner => {
      const partnerTgId = String(partner[1] || '').trim();
      const level3Partners = partnersData.filter(row => String(row[9] || '').trim() === partnerTgId);
      level3.push(...level3Partners);
    });
    
    // Уровень 4
    level3.forEach(partner => {
      const partnerTgId = String(partner[1] || '').trim();
      const level4Partners = partnersData.filter(row => String(row[9] || '').trim() === partnerTgId);
      level4.push(...level4Partners);
    });
    
    // Маппим все поля партнера для полной информации
    const mapPartner = (row) => ({
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
    });
    
    const network = {
      level1: level1.map(mapPartner),
      level2: level2.map(mapPartner),
      level3: level3.map(mapPartner),
      level4: level4.map(mapPartner)
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
    
    // Нормализуем промокод для поиска
    const normalizedPromo = String(promoCode || '').toUpperCase().trim();
    const partner = partnersData.find(row => {
      const rowPromo = String(row[7] || '').trim();
      return rowPromo.toUpperCase() === normalizedPromo || rowPromo === promoCode;
    });
    
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

// ==========================================
// ФУНКЦИЯ: ОБНОВЛЕНИЕ КОЛИЧЕСТВА ПРОДАЖ ДЛЯ ПАРТНЕРОВ
// ==========================================

function updatePartnersSalesCount() {
  console.log('=== START UPDATING PARTNERS SALES COUNT ===');
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const partnersSheet = ss.getSheetByName('Партнеры');
  const accrualsSheet = ss.getSheetByName('Начисления');
  
  if (!partnersSheet || !accrualsSheet) {
    console.error('Листы "Партнеры" или "Начисления" не найдены');
    return { success: false, error: 'Листы не найдены' };
  }
  
  // Получаем всех партнеров
  const partnersLastRow = partnersSheet.getLastRow();
  if (partnersLastRow <= 1) {
    console.log('Нет партнеров для обновления');
    return { success: true, message: 'Нет партнеров' };
  }
  
  // Структура листа Партнеры: A=ID, B=Telegram ID, ..., M=Количество продаж (колонка 13, индекс 12)
  const partnersData = partnersSheet.getRange(2, 1, partnersLastRow - 1, 13).getValues();
  
  // Получаем все начисления
  const accrualsLastRow = accrualsSheet.getLastRow();
  let salesByPartner = {}; // { telegramId: Set of unique sale IDs }
  
  if (accrualsLastRow > 1) {
    // Структура листа Начисления: A=ID, B=ID продажи, C=Telegram ID партнера, ...
    const accrualsData = accrualsSheet.getRange(2, 1, accrualsLastRow - 1, 9).getValues();
    
    accrualsData.forEach(row => {
      const saleId = String(row[1] || '').trim(); // B - ID продажи
      const partnerTgId = String(row[2] || '').trim(); // C - Telegram ID партнера
      
      if (saleId && partnerTgId) {
        if (!salesByPartner[partnerTgId]) {
          salesByPartner[partnerTgId] = new Set();
        }
        salesByPartner[partnerTgId].add(saleId);
      }
    });
  }
  
  console.log(`Found sales for ${Object.keys(salesByPartner).length} partners`);
  
  // Обновляем количество продаж для каждого партнера
  let updatedCount = 0;
  partnersData.forEach((row, index) => {
    const telegramId = String(row[1] || '').trim(); // B - Telegram ID
    const currentSalesCount = parseInt(row[12]) || 0; // M - Количество продаж (индекс 12)
    
    if (telegramId) {
      const uniqueSales = salesByPartner[telegramId] ? salesByPartner[telegramId].size : 0;
      
      // Обновляем только если значение изменилось
      if (uniqueSales !== currentSalesCount) {
        // Колонка M (индекс 13, но в массиве это индекс 12, так как начинаем с 0)
        partnersSheet.getRange(index + 2, 13).setValue(uniqueSales);
        updatedCount++;
        console.log(`Updated partner ${telegramId}: ${currentSalesCount} -> ${uniqueSales} sales`);
      }
    }
  });
  
  console.log(`Updated sales count for ${updatedCount} partners`);
  console.log('=== END UPDATING PARTNERS SALES COUNT ===');
  
  return { success: true, message: `Обновлено количество продаж для ${updatedCount} партнеров` };
}

// ==========================================
// ФУНКЦИЯ: НАСТРОЙКА ТРИГГЕРА ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ
// ==========================================

function setupSalesCountUpdateTrigger() {
  // Удаляем существующие триггеры для этой функции
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'updatePartnersSalesCount') {
      ScriptApp.deleteTrigger(trigger);
      console.log('Deleted existing trigger');
    }
  });
  
  // Создаем новый триггер на каждую минуту
  ScriptApp.newTrigger('updatePartnersSalesCount')
    .timeBased()
    .everyMinutes(1)
    .create();
  
  console.log('Created new trigger for updatePartnersSalesCount (every 1 minute)');
  return { success: true, message: 'Триггер настроен на обновление каждую минуту' };
}
