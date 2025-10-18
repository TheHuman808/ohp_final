import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { TelegramUser } from "@/types/telegram";

interface TelegramContactAuthViewProps {
  onAuthSuccess: (user: TelegramUser) => void;
  onCancel: () => void;
}

const TelegramContactAuthView = ({ onAuthSuccess, onCancel }: TelegramContactAuthViewProps) => {
  const { 
    user, 
    isReady, 
    webApp, 
    hapticFeedback, 
    showAlert, 
    showConfirm,
    mainButton,
    backButton 
  } = useTelegramWebApp();

  const [isRequestingContact, setIsRequestingContact] = useState(false);
  const [contactGranted, setContactGranted] = useState(false);

  // Настройка кнопок Telegram Web App
  useEffect(() => {
    if (isReady && webApp) {
      // Настраиваем главную кнопку
      mainButton.setText("Запросить контакт");
      mainButton.show();
      mainButton.enable();
      
      mainButton.onClick(() => {
        requestContact();
      });

      // Настраиваем кнопку "Назад"
      backButton.show();
      backButton.onClick(() => {
        handleCancel();
      });

      // Проверяем, есть ли данные пользователя
      if (user) {
        setContactGranted(true);
        mainButton.setText("Подтвердить авторизацию");
        mainButton.onClick(() => {
          handleConfirmAuth();
        });
      }
    }

    return () => {
      if (mainButton) {
        mainButton.hide();
      }
      if (backButton) {
        backButton.hide();
      }
    };
  }, [isReady, webApp, user, mainButton, backButton]);

  const requestContact = () => {
    if (!webApp) {
      showAlert("Telegram Web App не доступен. Откройте приложение через Telegram бота.");
      return;
    }

    setIsRequestingContact(true);
    hapticFeedback.impactOccurred('medium');

    console.log('Requesting contact from Telegram...');
    
    // Запрашиваем контакт через Telegram
    webApp.requestContact((granted) => {
      console.log('Contact access granted:', granted);
      
      if (granted) {
        // После получения разрешения на контакт, получаем данные пользователя
        const userData = webApp.initDataUnsafe?.user;
        
        if (userData) {
          setContactGranted(true);
          setUser(userData);
          hapticFeedback.notificationOccurred('success');
          showAlert("Контакт получен! Данные пользователя загружены.", () => {
            mainButton.setText("Подтвердить авторизацию");
            mainButton.onClick(() => {
              handleConfirmAuth();
            });
          });
        } else {
          hapticFeedback.notificationOccurred('error');
          showAlert("Контакт получен, но данные пользователя недоступны. Попробуйте перезагрузить приложение.");
        }
      } else {
        hapticFeedback.notificationOccurred('error');
        showAlert("Доступ к контакту не предоставлен. Для работы приложения необходимо разрешить доступ к контакту.");
      }
      
      setIsRequestingContact(false);
    });
  };

  const handleConfirmAuth = () => {
    if (!user) {
      hapticFeedback.notificationOccurred('error');
      showAlert("Сначала необходимо получить контакт пользователя.");
      return;
    }

    hapticFeedback.impactOccurred('heavy');
    
    showConfirm(
      `Подтвердить авторизацию для пользователя ${user.first_name}${user.username ? ` (@${user.username})` : ''}?`,
      (confirmed) => {
        if (confirmed) {
          hapticFeedback.notificationOccurred('success');
          onAuthSuccess(user);
        }
      }
    );
  };

  const handleCancel = () => {
    hapticFeedback.impactOccurred('light');
    onCancel();
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Инициализация Telegram Web App...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              📱 Авторизация через Telegram
            </CardTitle>
            <CardDescription>
              Для входа в реферальную программу необходимо предоставить доступ к контакту
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Статус авторизации */}
            <div className="text-center">
              {contactGranted && user ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Контакт получен</p>
                    <p className="text-sm text-gray-600">
                      {user.first_name} {user.last_name || ''}
                    </p>
                    {user.username && (
                      <p className="text-sm text-blue-600">@{user.username}</p>
                    )}
                    <p className="text-xs text-gray-500">ID: {user.id}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">📱</span>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800">Требуется доступ к контакту</p>
                    <p className="text-sm text-gray-600">
                      Нажмите кнопку ниже для запроса доступа к контакту в Telegram
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Информация о контакте */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Что мы запрашиваем:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Доступ к контакту для идентификации</li>
                <li>• Имя и фамилию из профиля Telegram</li>
                <li>• Username для связи с аккаунтом</li>
                <li>• Telegram ID для привязки к реферальной программе</li>
              </ul>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3">
              {!contactGranted ? (
                <Button 
                  onClick={requestContact}
                  disabled={isRequestingContact}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isRequestingContact ? "Запрос контакта..." : "📱 Запросить контакт"}
                </Button>
              ) : (
                <Button 
                  onClick={handleConfirmAuth}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Подтвердить авторизацию
                </Button>
              )}
              
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="w-full"
              >
                Отмена
              </Button>
            </div>

            {/* Информация о безопасности */}
            <div className="text-xs text-gray-500 text-center">
              <p>🔒 Ваши данные защищены и используются только для работы реферальной программы</p>
              <p>📱 Откройте приложение через Telegram бота для полной функциональности</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramContactAuthView;
