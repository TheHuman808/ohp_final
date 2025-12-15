import { useState, useEffect } from 'react';
import { googleSheetsService, type PartnerRecord, type CommissionRecord, type PartnerStats, type NetworkData } from '@/services/googleSheetsService';

export const usePartner = (telegramId: string, forceRefresh: number = 0) => {
  const [partner, setPartner] = useState<PartnerRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPartner = async () => {
    if (!telegramId) {
      console.log('No Telegram ID provided, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING PARTNER DATA ===');
      console.log('Searching for Telegram ID:', telegramId);
      
      // Получаем данные ТОЛЬКО для этого конкретного пользователя
      const partnerData = await googleSheetsService.getPartner(telegramId);
      
      if (partnerData) {
        console.log('Partner found for this user:', partnerData);
        setPartner(partnerData);
      } else {
        console.log('No partner found for this Telegram ID:', telegramId);
        setPartner(null);
        
        // Проверяем fallback только для этого пользователя
        const fallbackData = localStorage.getItem(`fallback_partner_${telegramId}`);
        if (fallbackData) {
          const fallbackPartner = JSON.parse(fallbackData);
          console.log('Loaded partner from fallback storage:', fallbackPartner);
          setPartner(fallbackPartner);
        }
      }
      
    } catch (err) {
      console.error('Error fetching partner:', err);
      setError('Ошибка загрузки данных партнера');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartner();
  }, [telegramId, forceRefresh]);

  const registerPartner = async (
    inviterCode: string, 
    personalData: { 
      firstName: string; 
      lastName: string; 
      phone: string; 
      email: string; 
    }, 
    username?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('=== STARTING NEW PARTNER REGISTRATION ===');
      console.log('Personal data:', personalData);
      console.log('Inviter code:', inviterCode);
      console.log('Inviter code type:', typeof inviterCode);
      console.log('Inviter code === "":', inviterCode === '');
      console.log('Inviter code.trim() !== "":', inviterCode?.trim() !== '');
      console.log('Processed inviterCode:', inviterCode && inviterCode.trim() !== '' ? inviterCode : "NOPROMO");
      console.log('Telegram ID:', telegramId);
      console.log('Username:', username);
      
      // Создаем НОВОГО партнера
      const result = await googleSheetsService.registerPartner({
        telegramId,
        firstName: personalData.firstName,
        lastName: personalData.lastName,
        phone: personalData.phone,
        email: personalData.email,
        username,
        inviterCode: inviterCode && inviterCode.trim() !== '' ? inviterCode : "NOPROMO" // Отправляем NOPROMO если нет промокода
      });

      console.log('Registration result:', result);

      if (result.success && result.promoCode) {
        console.log('New partner registration successful, refreshing data...');
        
        // Ждем немного, чтобы данные успели записаться в Google Sheets
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Принудительно обновляем данные после успешной регистрации
        try {
          await fetchPartner();
        } catch (refreshError) {
          console.warn('Failed to refresh partner data after registration:', refreshError);
          // Не прерываем процесс, если не удалось обновить данные
        }
        
        return { success: true, promoCode: result.promoCode };
      } else {
        const errorMessage = result.error || 'Ошибка регистрации';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = 'Ошибка при регистрации партнера';
      console.error('Error registering partner:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    partner,
    loading,
    error,
    registerPartner,
    refreshPartner: fetchPartner
  };
};

export const usePartnerCommissions = (telegramId: string) => {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = async () => {
    if (!telegramId) {
      console.log('No Telegram ID provided, skipping commissions fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING COMMISSIONS FOR USER ===');
      console.log('Telegram ID:', telegramId);
      
      // Получаем начисления ТОЛЬКО для этого пользователя
      const commissionsData = await googleSheetsService.getPartnerCommissions(telegramId);
      
      console.log(`Found ${commissionsData.length} commissions for user:`, commissionsData);
      setCommissions(commissionsData);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      setError('Ошибка загрузки начислений');
      setCommissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [telegramId]);

  return {
    commissions,
    loading,
    error,
    refresh: fetchCommissions
  };
};

export const usePartnerNetwork = (telegramId: string) => {
  const [network, setNetwork] = useState<{
    level1: PartnerRecord[];
    level2: PartnerRecord[];
    level3: PartnerRecord[];
    level4: PartnerRecord[];
  }>({ level1: [], level2: [], level3: [], level4: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNetwork = async () => {
    if (!telegramId) {
      console.log('No Telegram ID provided, skipping network fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING NETWORK FOR USER ===');
      console.log('Telegram ID:', telegramId);
      console.log('Telegram ID type:', typeof telegramId);
      console.log('Telegram ID length:', telegramId?.length);
      
      // Получаем сеть ТОЛЬКО для этого пользователя
      const networkData = await googleSheetsService.getPartnerNetwork(telegramId);
      
      console.log('=== NETWORK DATA RECEIVED ===');
      console.log('Network data for user:', networkData);
      console.log('Network data type:', typeof networkData);
      console.log('Level 1:', networkData?.level1);
      console.log('Level 1 length:', networkData?.level1?.length);
      console.log('Level 2 length:', networkData?.level2?.length);
      console.log('Level 3 length:', networkData?.level3?.length);
      console.log('Level 4 length:', networkData?.level4?.length);
      
      setNetwork(networkData);
    } catch (err) {
      console.error('Error fetching network:', err);
      setError('Ошибка загрузки структуры сети');
      setNetwork({ level1: [], level2: [], level3: [], level4: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, [telegramId]);

  return {
    network,
    loading,
    error,
    refresh: fetchNetwork
  };
};

export const usePartnerStats = (telegramId: string, network?: NetworkData) => {
  const [stats, setStats] = useState<PartnerStats>({
    totalIncome: 0,
    incomeByLevels: 0,
    incomeFromPartners: 0,
    partnersCount: 0,
    uniqueSalesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!telegramId) {
      console.log('No Telegram ID provided, skipping stats fetch');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('=== FETCHING PARTNER STATS ===');
      console.log('Telegram ID:', telegramId);
      console.log('Network provided:', !!network);
      console.log('Network data:', network);
      console.log('Network level counts:', {
        level1: network?.level1?.length || 0,
        level2: network?.level2?.length || 0,
        level3: network?.level3?.length || 0,
        level4: network?.level4?.length || 0
      });
      
      const statsData = await googleSheetsService.getPartnerStats(telegramId, network);
      
      console.log('=== STATS DATA RECEIVED ===');
      console.log('Partner stats:', statsData);
      console.log('Partners count in stats:', statsData.partnersCount);
      console.log('Total income in stats:', statsData.totalIncome);
      console.log('Unique sales count in stats:', statsData.uniqueSalesCount);
      
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching partner stats:', err);
      setError('Ошибка загрузки статистики');
      setStats({
        totalIncome: 0,
        incomeByLevels: 0,
        incomeFromPartners: 0,
        partnersCount: 0,
        uniqueSalesCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (telegramId) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramId]);
  
  // Обновляем статистику при изменении сети
  useEffect(() => {
    if (telegramId && network) {
      console.log('Network changed, refreshing stats...');
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats
  };
};
