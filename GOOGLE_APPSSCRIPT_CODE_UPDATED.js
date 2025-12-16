// ==========================================
// ГЛАВНЫЙ ОБРАБОТЧИК ЗАПРОСОВ (DO GET / DO POST)
// ==========================================

function doGet(e) {
  // Примечание: Триггеры нельзя создавать автоматически через веб-приложение
  // из-за ограничений авторизации. Триггеры должны быть созданы вручную:
  // 1. Запустите функцию setupSalesCountUpdateTrigger() вручную один раз
  // 2. Запустите функцию setupImportOrdersTrigger() вручную один раз
  // Или создайте триггеры через меню: Триггеры -> Добавить триггер
  return handleRequest(e);
}

function doPost(e) {
  // Примечание: Триггеры нельзя создавать автоматически через веб-приложение
  // из-за ограничений авторизации. Триггеры должны быть созданы вручную:
  // 1. Запустите функцию setupSalesCountUpdateTrigger() вручную один раз
  // 2. Запустите функцию setupImportOrdersTrigger() вручную один раз
  // Или создайте триггеры через меню: Триггеры -> Добавить триггер
  return handleRequest(e);
}

// ==========================================
// ФУНКЦИЯ: ПРОВЕРКА И НАСТРОЙКА ТРИГГЕРА (АВТОМАТИЧЕСКИ)
// ==========================================

// ==========================================
// ФУНКЦИИ ДЛЯ ПРОВЕРКИ ТРИГГЕРОВ (ОТКЛЮЧЕНЫ ИЗ-ЗА ОГРАНИЧЕНИЙ АВТОРИЗАЦИИ)
// ==========================================
// Эти функции требуют авторизации и не могут быть вызваны через веб-приложение.
// Используйте setupSalesCountUpdateTrigger() и setupImportOrdersTrigger() вручную.

// function ensureSalesCountUpdateTrigger() {
//   try {
//     const triggers = ScriptApp.getProjectTriggers();
//     const hasTrigger = triggers.some(trigger => 
//       trigger.getHandlerFunction() === 'updatePartnersSalesCount'
//     );
//     
//     if (!hasTrigger) {
//       console.log('Триггер не найден, создаем новый...');
//       setupSalesCountUpdateTrigger();
//     }
//   } catch (error) {
//     console.error('Ошибка при проверке триггера:', error);
//   }
// }

// function ensureImportOrdersTrigger() {
//   try {
//     const triggers = ScriptApp.getProjectTriggers();
//     const hasTrigger = triggers.some(trigger => 
//       trigger.getHandlerFunction() === 'importOrdersToSalesSheet'
//     );
//     
//     if (!hasTrigger) {
//       console.log('Триггер для импорта заказов не найден, создаем новый...');
//       setupImportOrdersTrigger();
//     }
//   } catch (error) {
//     console.error('Ошибка при проверке триггера импорта заказов:', error);
//   }
// }

function handleRequest(e) {
  try {
    let result = { success: true, message: 'Google Apps Script is working' };
    
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
    } else if (e && e.parameter) {
      // Обработка GET запросов с параметрами
      const action = e.parameter.action;
      const dataParam = e.parameter.data;
      
      console.log('GET request - action:', action);
      console.log('GET request - parameters:', e.parameter);
      
      if (!action) {
        // GET запрос без action - просто проверка работоспособности
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
          case 'setupImportOrdersTrigger':
            result = setupImportOrdersTrigger();
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
  // Извлекает число из первой пары скобок
  function extractQuantity(productNameQty) {
    if (!productNameQty) {
      console.log('extractQuantity: пустое значение');
      return 0;
    }
    
    const str = String(productNameQty).trim();
    console.log('extractQuantity: входная строка:', str);
    console.log('extractQuantity: тип данных:', typeof productNameQty);
    console.log('extractQuantity: длина строки:', str.length);
    
    // Ищем паттерн (число) в первой паре скобок
    // Пример: "Инуловит(1)()" -> извлекаем "1"
    // Используем глобальный поиск и берем первое совпадение
    const matches = str.match(/\((\d+)\)/g);
    console.log('extractQuantity: все совпадения:', matches);
    
    if (matches && matches.length > 0) {
      // Берем первое совпадение и извлекаем число
      const firstMatch = matches[0];
      console.log('extractQuantity: первое совпадение:', firstMatch);
      const numberMatch = firstMatch.match(/\d+/);
      if (numberMatch && numberMatch[0]) {
        const quantity = parseInt(numberMatch[0], 10) || 0;
        console.log('extractQuantity: извлечено количество:', quantity);
        return quantity;
      }
    }
    
    // Альтернативный способ: ищем любую пару скобок с числом внутри
    const altMatch = str.match(/\((\d+)\)/);
    if (altMatch && altMatch[1]) {
      const quantity = parseInt(altMatch[1], 10) || 0;
      console.log('extractQuantity (альтернативный способ): извлечено количество:', quantity);
      return quantity;
    }
    
    console.log('extractQuantity: количество не найдено, возвращаем 0');
    console.log('extractQuantity: строка для анализа:', JSON.stringify(str));
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
    // Убеждаемся, что читаем минимум до колонки Q (17) для Product name(QTY)(SKU)
    const maxColumn = Math.max(FIELD_INDICES.COL_DATE, FIELD_INDICES.PRODUCT_NAME_QTY);
    const dataRange = sheet.getRange(2, 1, lastRow - 1, maxColumn).getValues();
    console.log(`Reading ${lastRow - 1} rows from ${sheetName}, columns 1-${maxColumn}`);
    
    return dataRange.map(row => {
      const orderId = row[FIELD_INDICES.ORDER_ID - 1];
      if (!orderId || orderId.toString().trim() === "") return null;

      const dateVal = row[FIELD_INDICES.COL_DATE - 1];          
      const totalVal = row[FIELD_INDICES.ORDER_TOTAL - 1];      
      const promoEmailVal = row[FIELD_INDICES.COL_PROMO_OR_EMAIL - 1]; 
      const noteVal = row[FIELD_INDICES.COL_NOTE - 1];
      const productNameQty = row[FIELD_INDICES.PRODUCT_NAME_QTY - 1]; // Q - Product name(QTY)(SKU) (индекс 16, так как массив начинается с 0)
      
      console.log(`Processing order ${orderId}:`);
      console.log('  Product name(QTY)(SKU) raw value:', productNameQty);
      console.log('  Product name(QTY)(SKU) type:', typeof productNameQty);
      console.log('  Product name(QTY)(SKU) column index:', FIELD_INDICES.PRODUCT_NAME_QTY);
      console.log('  Product name(QTY)(SKU) array index:', FIELD_INDICES.PRODUCT_NAME_QTY - 1);
      
      // Извлекаем количество из Product name(QTY)(SKU)
      const quantity = extractQuantity(productNameQty);
      console.log(`  Extracted quantity for order ${orderId}:`, quantity);
      
      if (quantity === 0 && productNameQty) {
        console.warn(`  WARNING: Quantity is 0 but productNameQty is not empty: "${productNameQty}"`);
      }
      
      // Правильная структура: ID, Количество, Сумма, Промокод, Информация о клиенте, Статус, Дата продажи
      return [
        orderId,         // ID
        quantity,        // Количество (извлечено из Product name(QTY)(SKU))
        totalVal,        // Сумма
        promoEmailVal,   // Промокод
        noteVal,         // Информация о клиенте
        sheetName,       // Статус
        dateVal          // Дата продажи
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
  
  // Правильная структура: ID, Количество, Сумма, Промокод, Информация о клиенте, Статус, Дата продажи
  const headers = ['ID', 'Количество', 'Сумма', 'Промокод', 'Информация о клиенте', 'Статус', 'Дата продажи'];
  salesSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  salesSheet.getRange(2, 1, allOrders.length, allOrders[0].length).setValues(allOrders);
  
  console.log('Структура листа Продажи:');
  console.log('Колонка A (1): ID');
  console.log('Колонка B (2): Количество');
  console.log('Колонка C (3): Сумма');
  console.log('Колонка D (4): Промокод');
  console.log('Колонка E (5): Информация о клиенте');
  console.log('Колонка F (6): Статус');
  console.log('Колонка G (7): Дата продажи');
  
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
  
  // Правильная структура листа Продажи: A=ID, B=Количество, C=Сумма, D=Промокод, E=Информация о клиенте, F=Статус, G=Дата продажи
  const salesData = salesSheet.getRange(2, 1, salesLastRow - 1, 7).getValues();
  
  // Создаем словарь для быстрого доступа к количеству по ID продажи
  const salesQuantityMap = {};
  salesData.forEach(sale => {
    const saleId = String(sale[0] || '').trim();
    const quantity = parseInt(sale[1]) || 0; // Колонка B - Количество
    if (saleId) {
      salesQuantityMap[saleId] = quantity;
    }
  });
  console.log(`Created sales quantity map with ${Object.keys(salesQuantityMap).length} entries`);
  console.log('Sample quantities:', Object.entries(salesQuantityMap).slice(0, 5));
  
  let newAccruals = [];

  salesData.forEach((sale) => {
    const saleId = String(sale[0] || '').trim();           // A - ID
    const saleQuantity = parseInt(sale[1]) || 0;           // B - Количество (не используется в расчете комиссий, но доступно)
    const saleSum = parseFloat(sale[2]) || 0;              // C - Сумма
    const salePromo = String(sale[3] || '').trim();        // D - Промокод
    const customerInfo = String(sale[4] || '').trim();     // E - Информация о клиенте
    const saleStatus = String(sale[5] || '').trim();       // F - Статус
    const saleDate = sale[6];                                // G - Дата продажи
    const cleanCustomerPhone = customerInfo.replace(/\D/g, ''); // Убираем все нецифровые символы
    const normalizedCustomerPhone = cleanCustomerPhone.length >= 7 ? cleanCustomerPhone.slice(-10) : cleanCustomerPhone;
    
    if (!saleId || isNaN(saleSum) || saleSum <= 0) {
      return; // Пропускаем некорректные продажи
    }

    // --- 4.1 ПОИСК ПАРТНЕРА ПО ПРОМОКОДУ И/ИЛИ ПО ТЕЛЕФОНУ И ПОЛУЧЕНИЕ TELEGRAM ID ПРИГЛАСИВШЕГО ---
    let sourcePartner = null;
    let inviterTgId = null;
    
    console.log(`Sale ${saleId}: Searching for partner...`);
    console.log(`  Promo code: ${salePromo}`);
    console.log(`  Customer info: ${customerInfo}`);
    console.log(`  Normalized phone: ${normalizedCustomerPhone}`);
    
    // Сначала ищем партнера по промокоду из продажи
    if (salePromo) {
      const normalizedPromo = salePromo.toUpperCase().trim();
      sourcePartner = partnersByPromo[normalizedPromo] || partnersByPromo[salePromo];
      
      if (sourcePartner) {
        // Получаем Telegram ID пригласившего партнера (того, кто пригласил sourcePartner)
        inviterTgId = sourcePartner.inviterTgId;
        console.log(`Sale ${saleId}: Found source partner ${sourcePartner.tgId} by promo code (promo: ${sourcePartner.promo}), inviter: ${inviterTgId}`);
      } else {
        console.log(`Sale ${saleId}: Partner not found by promo code: ${normalizedPromo}`);
      }
    }
    
    // Если по промокоду не нашли, ищем по телефону из информации о клиенте
    if (!sourcePartner && normalizedCustomerPhone && normalizedCustomerPhone.length >= 7) {
      console.log(`Sale ${saleId}: Trying to find partner by phone: ${normalizedCustomerPhone}`);
      console.log(`Sale ${saleId}: Available phone keys count:`, Object.keys(partnersByPhone).length);
      
      // Пробуем разные варианты нормализации телефона
      const phoneVariants = [
        normalizedCustomerPhone,
        normalizedCustomerPhone.slice(-9), // Последние 9 цифр
        normalizedCustomerPhone.slice(-10), // Последние 10 цифр
        '7' + normalizedCustomerPhone.slice(-10), // С префиксом 7
        '8' + normalizedCustomerPhone.slice(-10) // С префиксом 8
      ];
      
      for (const phoneVariant of phoneVariants) {
        if (partnersByPhone[phoneVariant]) {
          sourcePartner = partnersByPhone[phoneVariant];
          inviterTgId = sourcePartner.inviterTgId;
          console.log(`Sale ${saleId}: Found source partner ${sourcePartner.tgId} by phone variant ${phoneVariant}, inviter: ${inviterTgId}`);
          break;
        }
      }
      
      if (!sourcePartner) {
        console.log(`Sale ${saleId}: Partner not found by phone after trying ${phoneVariants.length} variants`);
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
          const quantity = salesQuantityMap[saleId] || 0; // Получаем количество из словаря
          
          // Структура листа Начисления: 
          // A=ID, B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент, G=Дата расчета, H=Рассчитались, I=Остаток, J=Количество проданных
          const today = new Date();
          const dateStr = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd.MM.yyyy');
          
          newAccruals.push([
            customerInfo || saleId,     // A: ID (информация о клиенте или ID продажи)
            saleId,                      // B: ID продажи
            beneficiary.tgId,             // C: Telegram ID партнера (получателя комиссии)
            level,                       // D: Уровень
            commissionAmount,            // E: Сумма комиссии
            percentage,                  // F: Процент
            dateStr,                     // G: Дата расчета
            '',                          // H: Рассчитались (пусто по умолчанию)
            commissionAmount,            // I: Остаток (равен сумме, пока не рассчитано)
            quantity                     // J: Количество проданных
          ]);
          
          existingAccruals.add(uniqueKey); // Добавляем, чтобы избежать дублей в этой же сессии
          console.log(`Sale ${saleId}: Added accrual for partner ${beneficiary.tgId} at level ${level}, amount: ${commissionAmount}, quantity: ${quantity}`);
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
    // Записываем все 10 колонок: A=ID, B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент, G=Дата расчета, H=Рассчитались, I=Остаток, J=Количество проданных
    accrualsSheet.getRange(accLastRow + 1, 1, newAccruals.length, 10).setValues(newAccruals);
    console.log(`Добавлено ${newAccruals.length} новых начислений с количеством проданных.`);
    
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
    // A=ID, B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент, G=Дата расчета, H=Рассчитались, I=Остаток, J=Количество проданных
    // Читаем все 10 колонок (A-J)
    const commissionsData = commissionsSheet.getRange(2, 1, lastRow - 1, 10).getValues();
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
    
    // Получаем даты продаж из листа "Продажи"
    const salesSheet = spreadsheet.getSheetByName('Продажи');
    let salesDatesMap = {};
    
    if (salesSheet) {
      const salesLastRow = salesSheet.getLastRow();
      if (salesLastRow > 1) {
        // Правильная структура листа Продажи: A=ID, B=Количество, C=Сумма, D=Промокод, E=Информация о клиенте, F=Статус, G=Дата продажи
        const salesData = salesSheet.getRange(2, 1, salesLastRow - 1, 7).getValues();
        salesData.forEach(saleRow => {
          const saleId = String(saleRow[0] || '').trim();
          const saleDate = saleRow[6]; // Колонка G (индекс 6) - Дата продажи
          
          if (saleId) {
            let formattedDate = '';
            if (saleDate) {
              let dateObj = null;
              
              if (saleDate instanceof Date) {
                // Если это уже объект Date
                dateObj = saleDate;
              } else {
                // Если это строка, пытаемся распарсить
                const dateStr = String(saleDate).trim();
                console.log(`Parsing date string: "${dateStr}"`);
                
                try {
                  // Пробуем стандартный парсинг Date
                  dateObj = new Date(dateStr);
                  
                  // Проверяем, что дата валидна
                  if (isNaN(dateObj.getTime())) {
                    console.warn(`Failed to parse date: "${dateStr}"`);
                    // Пробуем альтернативные форматы
                    // Формат: "December 14, 2025 5:58 am"
                    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                                      'july', 'august', 'september', 'october', 'november', 'december'];
                    const dateMatch = dateStr.match(/(\w+)\s+(\d+),\s+(\d+)/i);
                    if (dateMatch) {
                      const monthName = dateMatch[1].toLowerCase();
                      const day = parseInt(dateMatch[2]);
                      const year = parseInt(dateMatch[3]);
                      const monthIndex = monthNames.indexOf(monthName);
                      if (monthIndex !== -1) {
                        dateObj = new Date(year, monthIndex, day);
                        console.log(`Parsed date using month name: ${day}.${monthIndex + 1}.${year}`);
                      }
                    }
                  }
                } catch (e) {
                  console.error(`Error parsing date: "${dateStr}", error:`, e);
                }
              }
              
              // Форматируем дату в формат дд.мм.гг (например, 14.12.25)
              if (dateObj && !isNaN(dateObj.getTime())) {
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const year = String(dateObj.getFullYear()).slice(-2); // Последние 2 цифры года
                formattedDate = `${day}.${month}.${year}`;
                console.log(`Formatted date: "${formattedDate}" from original: "${saleDate}"`);
              } else {
                // Если не удалось распарсить, оставляем как есть
                formattedDate = String(saleDate);
                console.warn(`Could not format date, keeping original: "${formattedDate}"`);
              }
            }
            salesDatesMap[saleId] = formattedDate;
          }
        });
        console.log(`Loaded ${Object.keys(salesDatesMap).length} sale dates from Продажи sheet`);
        console.log('Sample sale dates:', Object.entries(salesDatesMap).slice(0, 5));
        console.log('Sales dates map keys (first 5):', Object.keys(salesDatesMap).slice(0, 5));
        console.log('Sales dates map values (first 5):', Object.values(salesDatesMap).slice(0, 5));
      }
    } else {
      console.warn('Лист "Продажи" не найден, даты продаж не будут добавлены');
    }
    
    const commissions = partnerCommissions.map((row, index) => {
      const saleId = String(row[1] || '').trim();
      const saleDate = salesDatesMap[saleId] || '';
      
      if (index < 3) {
        console.log(`Mapping commission ${index}:`, {
          saleId: saleId,
          saleDateFromMap: saleDate,
          saleDateExists: !!salesDatesMap[saleId],
          allSaleIds: Object.keys(salesDatesMap).slice(0, 5),
          salesDatesMapSize: Object.keys(salesDatesMap).length
        });
      }
      
      const commission = {
        id: String(row[0] || '').trim(),
        saleId: saleId,
        partnerTelegramId: String(row[2] || '').trim(),
        level: parseInt(row[3]) || 1,
        amount: parseFloat(row[4]) || 0,
        commission: parseFloat(row[5]) || 0,
        date: String(row[6] || '').trim(), // Дата расчета
        saleDate: saleDate || '' // Дата продажи (всегда строка, даже если пустая)
      };
      
      // Дополнительное логирование для первых 3 комиссий
      if (index < 3) {
        console.log(`Commission ${index} mapped:`, {
          id: commission.id,
          saleId: commission.saleId,
          saleDate: commission.saleDate,
          saleDateType: typeof commission.saleDate,
          saleDateLength: commission.saleDate ? commission.saleDate.length : 0
        });
      }
      
      return commission;
    });
    
    console.log(`Returning ${commissions.length} commissions for partner ${telegramId}`);
    
    // Проверяем, что saleDate правильно добавлен
    if (commissions.length > 0) {
      console.log('Sample commission with saleDate:', {
        id: commissions[0].id,
        saleId: commissions[0].saleId,
        saleDate: commissions[0].saleDate,
        saleDateType: typeof commissions[0].saleDate,
        date: commissions[0].date
      });
      const commissionsWithSaleDate = commissions.filter(c => c.saleDate && c.saleDate.trim() !== '');
      console.log('Commissions with saleDate count:', commissionsWithSaleDate.length);
      console.log('Commissions without saleDate count:', commissions.length - commissionsWithSaleDate.length);
      
      // Показываем примеры комиссий без даты продажи
      const withoutSaleDate = commissions.filter(c => !c.saleDate || c.saleDate.trim() === '');
      if (withoutSaleDate.length > 0) {
        console.log('Sample commissions without saleDate:', withoutSaleDate.slice(0, 3).map(c => ({
          id: c.id,
          saleId: c.saleId,
          saleDate: c.saleDate
        })));
      }
    }
    
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
    console.log('=== GET PARTNER NETWORK START ===');
    console.log('Getting network for Telegram ID:', telegramId);
    console.log('Telegram ID type:', typeof telegramId);
    console.log('Telegram ID value:', telegramId);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const partnersSheet = spreadsheet.getSheetByName('Партнеры');
    const salesSheet = spreadsheet.getSheetByName('Продажи');
    const accrualsSheet = spreadsheet.getSheetByName('Начисления');
    
    if (!partnersSheet) {
      console.error('Лист "Партнеры" не найден');
      return { success: false, error: 'Лист "Партнеры" не найден' };
    }
    
    if (!salesSheet) {
      console.error('Лист "Продажи" не найден');
      return { success: false, error: 'Лист "Продажи" не найден' };
    }
    
    if (!accrualsSheet) {
      console.error('Лист "Начисления" не найден');
      return { success: false, error: 'Лист "Начисления" не найден' };
    }
    
    // --- ШАГ 1: НАЙТИ ВСЕ НАЧИСЛЕНИЯ ДЛЯ ТЕКУЩЕГО ПАРТНЕРА ---
    const accrualsLastRow = accrualsSheet.getLastRow();
    if (accrualsLastRow <= 1) {
      console.log('No accruals data found, returning empty network');
      return { success: true, network: { level1: [], level2: [], level3: [], level4: [] } };
    }
    
    // Структура листа Начисления: A=ID, B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент, G=Дата расчета, H=Рассчитались, I=Остаток, J=Количество проданных
    const accrualsData = accrualsSheet.getRange(2, 1, accrualsLastRow - 1, 10).getValues();
    
    const searchTgId = String(telegramId || '').trim();
    console.log('Search Telegram ID (normalized):', searchTgId);
    
    // Находим все начисления для текущего партнера
    const partnerAccruals = accrualsData.filter(accrual => {
      const partnerTgId = String(accrual[2] || '').trim(); // Колонка C - Telegram ID партнера
      return partnerTgId === searchTgId;
    });
    
    console.log(`Found ${partnerAccruals.length} accruals for partner ${searchTgId}`);
    
    if (partnerAccruals.length === 0) {
      console.log('No accruals found for current partner');
      return { success: true, network: { level1: [], level2: [], level3: [], level4: [] } };
    }
    
    // Извлекаем все уникальные ID продаж из начислений
    const saleIds = new Set();
    partnerAccruals.forEach(accrual => {
      const saleId = String(accrual[1] || '').trim(); // Колонка B - ID продажи
      if (saleId) {
        saleIds.add(saleId);
      }
    });
    
    console.log(`Extracted ${saleIds.size} unique sale IDs from accruals`);
    
    // --- ШАГ 2: НАЙТИ ВСЕ ПРОДАЖИ ПО ЭТИМ ID И ИЗВЛЕЧЬ ТЕЛЕФОНЫ ---
    const salesLastRow = salesSheet.getLastRow();
    if (salesLastRow <= 1) {
      console.log('No sales data found, returning empty network');
      return { success: true, network: { level1: [], level2: [], level3: [], level4: [] } };
    }
    
    // Структура листа Продажи: A=ID, B=Количество, C=Сумма, D=Промокод, E=Информация о клиенте, F=Статус, G=Дата продажи
    const salesData = salesSheet.getRange(2, 1, salesLastRow - 1, 7).getValues();
    
    // Находим продажи по ID из начислений
    const relevantSales = salesData.filter(sale => {
      const saleId = String(sale[0] || '').trim();
      return saleIds.has(saleId);
    });
    
    console.log(`Found ${relevantSales.length} relevant sales`);
    
    // Извлекаем телефоны клиентов из этих продаж
    const customerPhones = new Set();
    relevantSales.forEach(sale => {
      const customerInfo = String(sale[4] || '').trim(); // Колонка E - Информация о клиенте
      
      if (customerInfo) {
        const cleanPhone = customerInfo.replace(/\D/g, ''); // Убираем все нецифровые символы
        if (cleanPhone.length >= 7) {
          const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
          customerPhones.add(normalizedPhone);
          // Также добавляем варианты с префиксами
          if (normalizedPhone.length === 10) {
            customerPhones.add('7' + normalizedPhone);
            customerPhones.add('8' + normalizedPhone);
          }
          // Также добавляем варианты без префикса (если был префикс)
          if (normalizedPhone.length === 10 && cleanPhone.length > 10) {
            customerPhones.add(normalizedPhone);
          }
        }
      }
    });
    
    console.log(`Extracted ${customerPhones.size} unique customer phones from sales`);
    console.log('Sample customer phones:', Array.from(customerPhones).slice(0, 5));
    
    // --- ШАГ 3: НАЙТИ ВСЕХ ПАРТНЕРОВ ПО ТЕЛЕФОНАМ ---
    const partnersLastRow = partnersSheet.getLastRow();
    if (partnersLastRow <= 1) {
      console.log('No partners data found, returning empty network');
      return { success: true, network: { level1: [], level2: [], level3: [], level4: [] } };
    }
    
    const partnersData = partnersSheet.getRange(2, 1, partnersLastRow - 1, 13).getValues();
    console.log('Total partners data rows:', partnersData.length);
    
    // Создаем индекс партнеров по телефону
    const partnersByPhone = {};
    partnersData.forEach(row => {
      const phone = String(row[4] || '').trim(); // Колонка E - Телефон
      if (phone && phone.length >= 7) {
        const cleanPhone = phone.replace(/\D/g, '');
        const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
        partnersByPhone[normalizedPhone] = row;
        // Также добавляем варианты с префиксами
        if (normalizedPhone.length === 10) {
          partnersByPhone['7' + normalizedPhone] = row;
          partnersByPhone['8' + normalizedPhone] = row;
        }
        // Также добавляем варианты без префикса
        if (cleanPhone.length > 10) {
          const withoutPrefix = cleanPhone.slice(-10);
          if (withoutPrefix.length === 10) {
            partnersByPhone[withoutPrefix] = row;
          }
        }
      }
    });
    
    console.log(`Indexed ${Object.keys(partnersByPhone).length} partners by phone`);
    console.log('Sample partner phone keys:', Object.keys(partnersByPhone).slice(0, 5));
    
    // Находим партнеров по телефонам из продаж
    const foundPartnersByPhone = new Set();
    customerPhones.forEach(phone => {
      if (partnersByPhone[phone]) {
        const partnerTgId = String(partnersByPhone[phone][1] || '').trim();
        if (partnerTgId && partnerTgId !== searchTgId) { // Исключаем текущего партнера
          foundPartnersByPhone.add(partnerTgId);
          console.log(`Found partner by phone ${phone}: ${partnerTgId}`);
        }
      }
    });
    
    console.log(`Found ${foundPartnersByPhone.size} unique partners by phone matching`);
    
    // --- ШАГ 4: ГРУППИРОВКА ПАРТНЕРОВ ПО УРОВНЯМ ИЗ НАЧИСЛЕНИЙ ---
    const level1Partners = new Set();
    const level2Partners = new Set();
    const level3Partners = new Set();
    const level4Partners = new Set();
    
    // Группируем начисления по уровням и находим партнеров
    partnerAccruals.forEach(accrual => {
      const saleId = String(accrual[1] || '').trim(); // Колонка B - ID продажи
      const level = parseInt(accrual[3]) || 0; // Колонка D - Уровень
      
      if (level >= 1 && level <= 4) {
        // Находим продажу по ID
        const sale = relevantSales.find(s => String(s[0] || '').trim() === saleId);
        if (sale) {
          const customerInfo = String(sale[4] || '').trim();
          if (customerInfo) {
            const cleanPhone = customerInfo.replace(/\D/g, '');
            const normalizedPhone = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
            
            // Пробуем разные варианты телефона
            const phoneVariants = [normalizedPhone];
            if (normalizedPhone.length === 10) {
              phoneVariants.push('7' + normalizedPhone);
              phoneVariants.push('8' + normalizedPhone);
            }
            
            // Ищем партнера по телефону
            for (const phoneVariant of phoneVariants) {
              if (partnersByPhone[phoneVariant]) {
                const partnerTgId = String(partnersByPhone[phoneVariant][1] || '').trim();
                if (partnerTgId && partnerTgId !== searchTgId && foundPartnersByPhone.has(partnerTgId)) {
                  if (level === 1) level1Partners.add(partnerTgId);
                  else if (level === 2) level2Partners.add(partnerTgId);
                  else if (level === 3) level3Partners.add(partnerTgId);
                  else if (level === 4) level4Partners.add(partnerTgId);
                  break;
                }
              }
            }
          }
        }
      }
    });
    
    console.log('Partners by level:', {
      level1: level1Partners.size,
      level2: level2Partners.size,
      level3: level3Partners.size,
      level4: level4Partners.size
    });
    
    // --- ШАГ 6: МАППИНГ ПАРТНЕРОВ ---
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
    
    // Получаем данные партнеров по Telegram ID
    const getPartnerByTgId = (tgId) => {
      return partnersData.find(row => String(row[1] || '').trim() === tgId);
    };
    
    const network = {
      level1: Array.from(level1Partners).map(tgId => {
        const partner = getPartnerByTgId(tgId);
        return partner ? mapPartner(partner) : null;
      }).filter(p => p !== null),
      level2: Array.from(level2Partners).map(tgId => {
        const partner = getPartnerByTgId(tgId);
        return partner ? mapPartner(partner) : null;
      }).filter(p => p !== null),
      level3: Array.from(level3Partners).map(tgId => {
        const partner = getPartnerByTgId(tgId);
        return partner ? mapPartner(partner) : null;
      }).filter(p => p !== null),
      level4: Array.from(level4Partners).map(tgId => {
        const partner = getPartnerByTgId(tgId);
        return partner ? mapPartner(partner) : null;
      }).filter(p => p !== null)
    };
    
    console.log('Network structure created:');
    console.log('Level 1 count:', network.level1.length);
    console.log('Level 2 count:', network.level2.length);
    console.log('Level 3 count:', network.level3.length);
    console.log('Level 4 count:', network.level4.length);
    
    if (network.level1.length > 0) {
      console.log('Sample level 1 partner:', network.level1[0]);
    }
    
    console.log('=== GET PARTNER NETWORK END ===');
    return { success: true, network };
    
  } catch (error) {
    console.error('Get network error:', error);
    console.error('Error stack:', error.stack);
    return { success: false, error: 'Ошибка при получении сети партнеров: ' + error.toString() };
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
    // Структура листа Начисления: A=ID, B=ID продажи, C=Telegram ID партнера, D=Уровень, E=Сумма, F=Процент, G=Дата расчета, H=Рассчитались, I=Остаток, J=Количество проданных
    const accrualsData = accrualsSheet.getRange(2, 1, accrualsLastRow - 1, 10).getValues();
    
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
// ФУНКЦИЯ: НАСТРОЙКА ТРИГГЕРА ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ КОЛИЧЕСТВА ПРОДАЖ
// ==========================================
// ВАЖНО: Эта функция должна быть запущена ВРУЧНУЮ один раз в редакторе Apps Script
// для создания триггера. Триггеры нельзя создавать автоматически через веб-приложение.
//
// Инструкция:
// 1. Откройте редактор Apps Script
// 2. Выберите функцию setupSalesCountUpdateTrigger в выпадающем списке
// 3. Нажмите "Выполнить"
// 4. Разрешите доступ при запросе авторизации
//
// Альтернативный способ:
// 1. Перейдите в меню: Триггеры -> Добавить триггер
// 2. Выберите функцию: updatePartnersSalesCount
// 3. Выберите источник события: По времени
// 4. Выберите тип события: Минутный таймер
// 5. Выберите интервал: Каждую минуту

function setupSalesCountUpdateTrigger() {
  try {
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
  } catch (error) {
    console.error('Error setting up trigger:', error);
    return { success: false, error: 'Ошибка при создании триггера: ' + error.toString() };
  }
}

// ==========================================
// ФУНКЦИЯ: НАСТРОЙКА ТРИГГЕРА ДЛЯ АВТОМАТИЧЕСКОГО ИМПОРТА ЗАКАЗОВ
// ==========================================
// ВАЖНО: Эта функция должна быть запущена ВРУЧНУЮ один раз в редакторе Apps Script
// для создания триггера. Триггеры нельзя создавать автоматически через веб-приложение.
//
// Инструкция:
// 1. Откройте редактор Apps Script
// 2. Выберите функцию setupImportOrdersTrigger в выпадающем списке
// 3. Нажмите "Выполнить"
// 4. Разрешите доступ при запросе авторизации
//
// Альтернативный способ:
// 1. Перейдите в меню: Триггеры -> Добавить триггер
// 2. Выберите функцию: importOrdersToSalesSheet
// 3. Выберите источник события: По времени
// 4. Выберите тип события: Минутный таймер
// 5. Выберите интервал: Каждую минуту

function setupImportOrdersTrigger() {
  try {
    // Удаляем существующие триггеры для этой функции
    const triggers = ScriptApp.getProjectTriggers();
    triggers.forEach(trigger => {
      if (trigger.getHandlerFunction() === 'importOrdersToSalesSheet') {
        ScriptApp.deleteTrigger(trigger);
        console.log('Deleted existing import orders trigger');
      }
    });
    
    // Создаем новый триггер на каждую минуту
    ScriptApp.newTrigger('importOrdersToSalesSheet')
      .timeBased()
      .everyMinutes(1)
      .create();
    
    console.log('Created new trigger for importOrdersToSalesSheet (every 1 minute)');
    
    return { success: true, message: 'Триггер успешно настроен для импорта заказов каждую минуту' };
  } catch (error) {
    console.error('Error setting up import orders trigger:', error);
    return { success: false, error: 'Ошибка при создании триггера: ' + error.toString() };
  }
}
