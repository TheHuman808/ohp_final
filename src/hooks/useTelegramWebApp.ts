import { useState, useEffect, useCallback } from 'react';
import { TelegramUser, TelegramWebApp } from '@/types/telegram';

interface UseTelegramWebAppReturn {
  user: TelegramUser | null;
  webApp: TelegramWebApp | null;
  isReady: boolean;
  isExpanded: boolean;
  platform: string;
  colorScheme: 'light' | 'dark';
  initData: string;
  initDataUnsafe: TelegramWebApp['initDataUnsafe'];
  // Methods
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  hapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  mainButton: {
    text: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  backButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
}

export const useTelegramWebApp = (): UseTelegramWebAppReturn => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [platform, setPlatform] = useState('');
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');
  const [initData, setInitData] = useState('');
  const [initDataUnsafe, setInitDataUnsafe] = useState<TelegramWebApp['initDataUnsafe']>({});

  useEffect(() => {
    const initTelegramWebApp = () => {
      console.log('Initializing Telegram Web App...');
      
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log('Telegram WebApp found:', tg);
        
        setWebApp(tg);
        setUser(tg.initDataUnsafe?.user || null);
        setIsReady(true);
        setIsExpanded(tg.isExpanded);
        setPlatform(tg.platform);
        setColorScheme(tg.colorScheme);
        setInitData(tg.initData);
        setInitDataUnsafe(tg.initDataUnsafe || {});

        // Инициализируем WebApp
        tg.ready();
        tg.expand();

        // Проверяем данные пользователя
        if (tg.initDataUnsafe?.user) {
          console.log('User data available:', tg.initDataUnsafe.user);
          setUser(tg.initDataUnsafe.user);
        } else {
          console.log('No user data available in initDataUnsafe');
          // Попробуем получить данные из initData
          if (tg.initData) {
            try {
              const urlParams = new URLSearchParams(tg.initData);
              const userParam = urlParams.get('user');
              if (userParam) {
                const userData = JSON.parse(userParam);
                console.log('User data from initData:', userData);
                setUser(userData);
              }
            } catch (error) {
              console.error('Error parsing user data from initData:', error);
            }
          }
          
          // Если данных нет, не устанавливаем пользователя
          // Это нормально для веб-версии
          console.log('Running in web mode - no Telegram user data');
        }

        console.log('Telegram WebApp initialized successfully');
        console.log('User data:', tg.initDataUnsafe?.user);
        console.log('Platform:', tg.platform);
        console.log('Color scheme:', tg.colorScheme);
        console.log('Init data:', tg.initData);
      } else {
        console.warn('Telegram WebApp not found. Running in development mode.');
        
        // В режиме разработки не устанавливаем пользователя автоматически
        // Пользователь должен быть получен через Telegram Web App
        setUser(null);
        setIsReady(true);
        setIsExpanded(true);
        setPlatform('web');
        setColorScheme('light');
        setInitData('');
        setInitDataUnsafe({});
      }
    };

    // Проверяем, загружен ли Telegram WebApp
    if (window.Telegram?.WebApp) {
      initTelegramWebApp();
    } else {
      // Ждем загрузки скрипта Telegram WebApp
      const checkInterval = setInterval(() => {
        if (window.Telegram?.WebApp) {
          clearInterval(checkInterval);
          initTelegramWebApp();
        }
      }, 100);

      // Таймаут для fallback
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.Telegram?.WebApp) {
          initTelegramWebApp();
        }
      }, 2000);
    }
  }, []);

  // Методы для работы с WebApp
  const expand = useCallback(() => {
    if (webApp) {
      webApp.expand();
      setIsExpanded(true);
    }
  }, [webApp]);

  const close = useCallback(() => {
    if (webApp) {
      webApp.close();
    }
  }, [webApp]);

  const sendData = useCallback((data: string) => {
    if (webApp) {
      webApp.sendData(data);
    }
  }, [webApp]);

  const showAlert = useCallback((message: string, callback?: () => void) => {
    if (webApp) {
      webApp.showAlert(message, callback);
    } else {
      // Fallback для разработки
      alert(message);
      if (callback) callback();
    }
  }, [webApp]);

  const showConfirm = useCallback((message: string, callback?: (confirmed: boolean) => void) => {
    if (webApp) {
      webApp.showConfirm(message, callback);
    } else {
      // Fallback для разработки
      const confirmed = confirm(message);
      if (callback) callback(confirmed);
    }
  }, [webApp]);

  const showPopup = useCallback((params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => {
    if (webApp) {
      webApp.showPopup(params, callback);
    } else {
      // Fallback для разработки
      const result = confirm(params.message);
      if (callback) callback(result ? 'ok' : 'cancel');
    }
  }, [webApp]);

  const hapticFeedback = {
    impactOccurred: useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred(style);
      }
    }, [webApp]),
    
    notificationOccurred: useCallback((type: 'error' | 'success' | 'warning') => {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.notificationOccurred(type);
      }
    }, [webApp]),
    
    selectionChanged: useCallback(() => {
      if (webApp?.HapticFeedback) {
        webApp.HapticFeedback.selectionChanged();
      }
    }, [webApp])
  };

  const mainButton = {
    text: webApp?.MainButton?.text || '',
    isVisible: webApp?.MainButton?.isVisible || false,
    isActive: webApp?.MainButton?.isActive || false,
    
    setText: useCallback((text: string) => {
      if (webApp?.MainButton) {
        webApp.MainButton.setText(text);
      }
    }, [webApp]),
    
    onClick: useCallback((callback: () => void) => {
      if (webApp?.MainButton) {
        webApp.MainButton.onClick(callback);
      }
    }, [webApp]),
    
    offClick: useCallback((callback: () => void) => {
      if (webApp?.MainButton) {
        webApp.MainButton.offClick(callback);
      }
    }, [webApp]),
    
    show: useCallback(() => {
      if (webApp?.MainButton) {
        webApp.MainButton.show();
      }
    }, [webApp]),
    
    hide: useCallback(() => {
      if (webApp?.MainButton) {
        webApp.MainButton.hide();
      }
    }, [webApp]),
    
    enable: useCallback(() => {
      if (webApp?.MainButton) {
        webApp.MainButton.enable();
      }
    }, [webApp]),
    
    disable: useCallback(() => {
      if (webApp?.MainButton) {
        webApp.MainButton.disable();
      }
    }, [webApp]),
    
    showProgress: useCallback((leaveActive?: boolean) => {
      if (webApp?.MainButton) {
        webApp.MainButton.showProgress(leaveActive);
      }
    }, [webApp]),
    
    hideProgress: useCallback(() => {
      if (webApp?.MainButton) {
        webApp.MainButton.hideProgress();
      }
    }, [webApp]),
    
    setParams: useCallback((params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => {
      if (webApp?.MainButton) {
        webApp.MainButton.setParams(params);
      }
    }, [webApp])
  };

  const backButton = {
    isVisible: webApp?.BackButton?.isVisible || false,
    
    onClick: useCallback((callback: () => void) => {
      if (webApp?.BackButton) {
        webApp.BackButton.onClick(callback);
      }
    }, [webApp]),
    
    offClick: useCallback((callback: () => void) => {
      if (webApp?.BackButton) {
        webApp.BackButton.offClick(callback);
      }
    }, [webApp]),
    
    show: useCallback(() => {
      if (webApp?.BackButton) {
        webApp.BackButton.show();
      }
    }, [webApp]),
    
    hide: useCallback(() => {
      if (webApp?.BackButton) {
        webApp.BackButton.hide();
      }
    }, [webApp])
  };

  return {
    user,
    webApp,
    isReady,
    isExpanded,
    platform,
    colorScheme,
    initData,
    initDataUnsafe,
    expand,
    close,
    sendData,
    showAlert,
    showConfirm,
    showPopup,
    hapticFeedback,
    mainButton,
    backButton
  };
};
