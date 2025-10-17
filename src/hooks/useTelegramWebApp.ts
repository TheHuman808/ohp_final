import { useState, useEffect } from 'react';
import type { TelegramUser, TelegramWebApp } from '@/types/telegram';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegramWebApp = () => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check if we're in Telegram Web App
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Initialize Telegram Web App
        tg.ready();
        tg.expand();
        
        // Get user data
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
        } else if (tg.initData) {
          // Try to parse user data from initData
          try {
            const urlParams = new URLSearchParams(tg.initData);
            const userParam = urlParams.get('user');
            if (userParam) {
              const userData = JSON.parse(decodeURIComponent(userParam));
              setUser(userData);
            }
          } catch (parseError) {
            console.warn('Failed to parse user data from initData:', parseError);
          }
        }
        
        setIsReady(true);
        setError(null);
      } else {
        // Not in Telegram Web App - set demo mode
        console.log('Not in Telegram Web App, using demo mode');
        setUser(null);
        setIsReady(true);
        setError(null);
      }
    } catch (err) {
      console.error('Error initializing Telegram Web App:', err);
      setError('Failed to initialize Telegram Web App');
      setIsReady(true);
    }
  }, []);

  const showAlert = (message: string) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showConfirm(message, callback);
    } else {
      const confirmed = confirm(message);
      callback?.(confirmed);
    }
  };

  const hapticFeedback = (type: 'impact' | 'notification' | 'selection' = 'impact') => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      switch (type) {
        case 'impact':
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
          break;
        case 'notification':
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          break;
        case 'selection':
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
          break;
      }
    }
  };

  const mainButton = {
    show: (text: string, onClick: () => void) => {
      if (window.Telegram?.WebApp?.MainButton) {
        window.Telegram.WebApp.MainButton.setText(text);
        window.Telegram.WebApp.MainButton.onClick(onClick);
        window.Telegram.WebApp.MainButton.show();
      }
    },
    hide: () => {
      if (window.Telegram?.WebApp?.MainButton) {
        window.Telegram.WebApp.MainButton.hide();
      }
    }
  };

  const backButton = {
    show: (onClick: () => void) => {
      if (window.Telegram?.WebApp?.BackButton) {
        window.Telegram.WebApp.BackButton.onClick(onClick);
        window.Telegram.WebApp.BackButton.show();
      }
    },
    hide: () => {
      if (window.Telegram?.WebApp?.BackButton) {
        window.Telegram.WebApp.BackButton.hide();
      }
    }
  };

  return {
    user,
    isReady,
    error,
    showAlert,
    showConfirm,
    hapticFeedback,
    mainButton,
    backButton,
    isTelegramWebApp: !!window.Telegram?.WebApp
  };
};
