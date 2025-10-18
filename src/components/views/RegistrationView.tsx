
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { googleSheetsService } from "@/services/googleSheetsService";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { TelegramUser } from "@/types/telegram";

interface RegistrationViewProps {
  telegramUser: TelegramUser | null;
  onPromoCodeSuccess: (inviterCode: string) => void;
  onExistingUserLogin: () => void;
  onTelegramAuth: () => void;
  onTelegramContactAuth?: () => void;
  onTelegramWebAuth?: () => void;
  onDebug?: () => void;
  onTestMode?: () => void;
  partnerLoading: boolean;
}

const RegistrationView = ({ telegramUser, onPromoCodeSuccess, onExistingUserLogin, onTelegramAuth, onTelegramContactAuth, onTelegramWebAuth, onDebug, onTestMode, partnerLoading }: RegistrationViewProps) => {
  const [inviterCode, setInviterCode] = useState("");
  const [validating, setValidating] = useState(false);
  const { toast } = useToast();
  const { 
    user: tgUser, 
    isReady, 
    hapticFeedback, 
    showAlert, 
    showConfirm,
    mainButton,
    backButton 
  } = useTelegramWebApp();

  // Используем данные из Telegram Web App если доступны
  const currentUser = tgUser || telegramUser;

  // Настройка кнопок Telegram Web App
  useEffect(() => {
    if (isReady && mainButton) {
      mainButton.setText("Создать новый аккаунт");
      mainButton.show();
      mainButton.enable();
      
      mainButton.onClick(() => {
        handlePromoCodeSubmit();
      });
    }

    return () => {
      if (mainButton) {
        mainButton.hide();
      }
    };
  }, [isReady, mainButton, inviterCode]);

  const handlePromoCodeSubmitWithDemoUser = async (demoUser: TelegramUser) => {
    console.log('=== DEMO MODE: PROMO CODE VALIDATION START ===');
    console.log('Entered promo code:', inviterCode);
    console.log('Demo user:', demoUser);

    if (!inviterCode.trim()) {
      hapticFeedback?.notificationOccurred('error');
      showAlert("Введите промокод пригласившего вас партнера");
      return;
    }

    setValidating(true);
    mainButton?.showProgress();
    
    try {
      console.log('Starting DEMO validation for promo code:', inviterCode);

      // В демо-режиме всегда показываем успех
      console.log('DEMO: Promo code validation successful');
      hapticFeedback?.notificationOccurred('success');
      showAlert("Демо-режим: Промокод подтвержден! Переходим к созданию аккаунта.", () => {
        onPromoCodeSuccess(inviterCode);
      });

    } catch (error) {
      console.error('=== DEMO ERROR ===');
      console.error('Error details:', error);
      hapticFeedback?.notificationOccurred('error');
      showAlert("Демо-режим: Ошибка при проверке промокода.");
    } finally {
      setValidating(false);
      mainButton?.hideProgress();
      console.log('=== DEMO PROMO CODE VALIDATION END ===');
    }
  };

  const handlePromoCodeSubmit = async () => {
    console.log('=== PROMO CODE VALIDATION FOR NEW USER START ===');
    console.log('Entered promo code:', inviterCode);
    console.log('Telegram user:', currentUser);

    if (!inviterCode.trim()) {
      hapticFeedback.notificationOccurred('error');
      showAlert("Введите промокод пригласившего вас партнера");
      return;
    }

    // Если нет данных пользователя, используем демо-режим
    if (!currentUser) {
      console.log('No Telegram user data, using demo mode');
      hapticFeedback?.impactOccurred('medium');
      showAlert("Демо-режим: Создание аккаунта с тестовыми данными", () => {
        // Создаем тестового пользователя для демо
        const demoUser = {
          id: 123456789,
          first_name: "Демо",
          last_name: "Пользователь",
          username: "demo_user",
          language_code: "ru"
        };
        setUser(demoUser);
        // Продолжаем с демо пользователем
        handlePromoCodeSubmitWithDemoUser(demoUser);
      });
      return;
    }

    setValidating(true);
    mainButton?.showProgress();
    
    try {
      console.log('Starting validation for promo code (NEW USER REGISTRATION):', inviterCode);
      
      // Проверяем существование промокода
      const isValidCode = await googleSheetsService.validatePromoCode(inviterCode);
      
      console.log('Validation result:', isValidCode);
      
      if (!isValidCode) {
        console.log('Promo code validation failed');
        hapticFeedback.notificationOccurred('error');
        showAlert("Промокод не найден. Проверьте правильность ввода.");
        return;
      }

      console.log('Promo code is valid, proceeding to NEW USER registration...');
      hapticFeedback.notificationOccurred('success');
      showAlert("Промокод подтвержден! Заполните персональные данные для создания нового аккаунта.", () => {
        // Переходим к регистрации НОВОГО пользователя
        onPromoCodeSuccess(inviterCode);
      });
      
    } catch (error) {
      console.error('=== ERROR VALIDATING PROMO CODE ===');
      console.error('Error details:', error);
      
      hapticFeedback.notificationOccurred('error');
      showAlert("Не удалось проверить промокод. Попробуйте еще раз.");
    } finally {
      setValidating(false);
      mainButton?.hideProgress();
      console.log('=== PROMO CODE VALIDATION END ===');
    }
  };

  const handleExistingUserLogin = () => {
    console.log('Existing user login clicked for user:', currentUser);
    hapticFeedback?.impactOccurred('light');
    
    // Если нет данных пользователя, используем демо-режим
    if (!currentUser) {
      console.log('No Telegram user data, using demo mode for existing user');
      hapticFeedback?.impactOccurred('medium');
      showAlert("Демо-режим: Вход в существующий аккаунт с тестовыми данными", () => {
        // Создаем тестового пользователя для демо
        const demoUser = {
          id: 123456789,
          first_name: "Демо",
          last_name: "Пользователь",
          username: "demo_user",
          language_code: "ru"
        };
        setUser(demoUser);
        // Переходим к входу с демо пользователем
        onExistingUserLogin();
      });
      return;
    }
    
    showConfirm("Войти в существующий аккаунт через Telegram?", (confirmed) => {
      if (confirmed) {
        onExistingUserLogin();
      }
    });
  };

  const handleTelegramAuth = () => {
    console.log('Telegram auth clicked');
    hapticFeedback.impactOccurred('medium');
    onTelegramAuth();
  };

  const handleTelegramContactAuth = () => {
    console.log('Telegram contact auth clicked');
    hapticFeedback.impactOccurred('medium');
    onTelegramContactAuth?.();
  };

  const handleTelegramWebAuth = () => {
    console.log('Telegram web auth clicked');
    hapticFeedback.impactOccurred('medium');
    onTelegramWebAuth?.();
  };

  // Определяем отображаемое имя пользователя из реальных данных Telegram
  const displayName = currentUser?.first_name || 'Пользователь';
  const displayId = currentUser?.id?.toString() || 'не определен';
  const displayUsername = currentUser?.username || 'не указан';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Добро пожаловать!
            </CardTitle>
                  <CardDescription>
                    {currentUser ? `${displayName}, введите промокод для создания нового аккаунта или войдите в существующий` : 'Демо-режим: Введите промокод для создания нового аккаунта или войдите в существующий'}
                  </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Промокод партнера"
                value={inviterCode}
                onChange={(e) => setInviterCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono"
                disabled={validating || partnerLoading}
              />
            </div>
            <Button 
              onClick={handlePromoCodeSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={partnerLoading || validating}
            >
              {validating ? "Проверка промокода..." : partnerLoading ? "Загрузка..." : "Создать новый аккаунт"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">или</span>
              </div>
            </div>
            
            <Button 
              onClick={handleExistingUserLogin}
              variant="outline"
              className="w-full"
              disabled={partnerLoading}
            >
              {partnerLoading ? "Загрузка..." : "У меня уже есть аккаунт"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">или</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={handlePromoCodeSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={partnerLoading || validating}
              >
                {validating ? "Проверка промокода..." : partnerLoading ? "Загрузка..." : "📝 Создать аккаунт"}
              </Button>
              
              <Button 
                onClick={handleExistingUserLogin}
                variant="outline"
                className="w-full"
                disabled={partnerLoading}
              >
                {partnerLoading ? "Загрузка..." : "👤 У меня уже есть аккаунт"}
              </Button>
            </div>
            
            <div className="text-xs text-gray-500 text-center mt-4">
              {currentUser ? (
                <>
                  <p>Telegram ID: {displayId}</p>
                  <p>Username: @{displayUsername}</p>
                  {isReady ? (
                    <p className="text-green-600 mt-1">✓ Telegram Web App готов</p>
                  ) : (
                    <p className="text-orange-600 mt-1">⚠ Загрузка Telegram Web App...</p>
                  )}
                </>
              ) : (
                <p className="text-blue-600">🧪 Демо-режим: Приложение работает без Telegram авторизации</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationView;
