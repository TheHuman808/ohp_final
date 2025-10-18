import { useState, useEffect } from 'react';
import { TelegramUser, TelegramWebApp } from '@/types/telegram';

interface UseTelegramWebAppResult {
  telegramWebApp: TelegramWebApp | null;
  currentUser: TelegramUser | null;
  loading: boolean;
  error: string | null;
  isReady: boolean;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
}

export const useTelegramWebApp = (): UseTelegramWebAppResult => {
  const [telegramWebApp, setTelegramWebApp] = useState<TelegramWebApp | null>(null);
  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      setTelegramWebApp(tg);

      tg.ready();
      tg.expand();

      if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setCurrentUser(tg.initDataUnsafe.user);
        console.log('Telegram user data from initDataUnsafe:', tg.initDataUnsafe.user);
      } else if (tg.initData) {
        try {
          const parsedInitData = new URLSearchParams(tg.initData);
          const userData = parsedInitData.get('user');
          if (userData) {
            const user: TelegramUser = JSON.parse(decodeURIComponent(userData));
            setCurrentUser(user);
            console.log('Telegram user data parsed from initData:', user);
          } else {
            setError('Telegram user data not found in initData.');
            console.warn('Telegram user data not found in initData.');
          }
        } catch (parseError) {
          setError('Failed to parse Telegram initData.');
          console.error('Failed to parse Telegram initData:', parseError);
        }
      } else {
        setError('Telegram Web App initData not available.');
        console.warn('Telegram Web App initData not available.');
        setIsReady(true); // Still set ready to true to allow demo mode
      }
      setIsReady(true);
    } else {
      setError('Telegram Web App script not loaded or not available.');
      console.warn('Telegram Web App script not loaded or not available.');
      setIsReady(true); // Still set ready to true to allow demo mode
    }
    setLoading(false);
  }, []);

  const showAlert = (message: string, callback?: () => void) => {
    if (telegramWebApp) {
      telegramWebApp.showAlert(message, callback);
    } else {
      alert(message);
      if (callback) callback();
    }
  };

  const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
    if (telegramWebApp) {
      telegramWebApp.showConfirm(message, callback);
    } else {
      const confirmed = window.confirm(message);
      if (callback) callback(confirmed);
    }
  };

  return { telegramWebApp, currentUser, loading, error, isReady, showAlert, showConfirm };
};