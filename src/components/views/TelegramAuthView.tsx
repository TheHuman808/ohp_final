import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { TelegramUser } from "@/types/telegram";

interface TelegramAuthViewProps {
  onAuthSuccess: (user: TelegramUser) => void;
  onCancel: () => void;
}

const TelegramAuthView = ({ onAuthSuccess, onCancel }: TelegramAuthViewProps) => {
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

  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Настройка кнопок Telegram Web App
  useEffect(() => {
    if (isReady && webApp) {
      // Настраиваем главную кнопку
      mainButton.setText("Подтвердить авторизацию");
      mainButton.show();
      mainButton.enable();
      
      mainButton.onClick(() => {
        handleConfirmAuth();
      });

      // Настраиваем кнопку "Назад"
      backButton.show();
      backButton.onClick(() => {
        handleCancel();
      });

      // Проверяем, есть ли данные пользователя
      if (user) {
        setPermissionsGranted(true);
        mainButton.setText("Подтвердить авторизацию");
        mainButton.onClick(() => {
          handleConfirmAuth();
        });
      } else {
        setPermissionsGranted(false);
        mainButton.setText("Запросить разрешения");
        mainButton.onClick(() => {
          requestPermissions();
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

  const requestPermissions = async () => {
    if (!webApp) return;

    setIsRequestingPermissions(true);
    hapticFeedback.impactOccurred('medium');

    try {
      console.log('Requesting permissions...');
      console.log('Current initDataUnsafe:', webApp.initDataUnsafe);
      console.log('Current initData:', webApp.initData);

      // Попробуем получить данные пользователя разными способами
      let userData = webApp.initDataUnsafe?.user;

      if (!userData && webApp.initData) {
        try {
          const urlParams = new URLSearchParams(webApp.initData);
          const userParam = urlParams.get('user');
          if (userParam) {
            userData = JSON.parse(userParam);
            console.log('User data from initData:', userData);
          }
        } catch (error) {
          console.error('Error parsing initData:', error);
        }
      }

      if (userData) {
        setPermissionsGranted(true);
        setUser(userData);
        hapticFeedback.notificationOccurred('success');
        showAlert("Данные пользователя получены!", () => {
          mainButton.setText("Подтвердить авторизацию");
          mainButton.onClick(() => {
            handleConfirmAuth();
          });
        });
      } else {
        // Если данных нет, попробуем запросить разрешения
        webApp.requestWriteAccess((granted) => {
          console.log('Write access granted:', granted);
          
          if (granted) {
            const updatedUser = webApp.initDataUnsafe?.user;
            if (updatedUser) {
              setPermissionsGranted(true);
              setUser(updatedUser);
              hapticFeedback.notificationOccurred('success');
              showAlert("Разрешения получены! Данные пользователя загружены.", () => {
                mainButton.setText("Подтвердить авторизацию");
                mainButton.onClick(() => {
                  handleConfirmAuth();
                });
              });
            } else {
              hapticFeedback.notificationOccurred('error');
              showAlert("Разрешения получены, но данные пользователя недоступны. Попробуйте перезагрузить приложение.");
            }
          } else {
            hapticFeedback.notificationOccurred('error');
            showAlert("Разрешения не предоставлены. Для работы приложения необходимо разрешить доступ к данным.");
          }
          
          setIsRequestingPermissions(false);
        });
      }
      
      setIsRequestingPermissions(false);
    } catch (error) {
      console.error('Error requesting permissions:', error);
      hapticFeedback.notificationOccurred('error');
      showAlert("Ошибка при запросе разрешений. Попробуйте еще раз.");
      setIsRequestingPermissions(false);
    }
  };

  const handleConfirmAuth = () => {
    if (!user) {
      hapticFeedback.notificationOccurred('error');
      showAlert("Сначала необходимо получить данные пользователя.");
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
              🔐 Авторизация через Telegram
            </CardTitle>
            <CardDescription>
              Подтвердите свою личность для входа в реферальную программу
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Статус авторизации */}
            <div className="text-center">
              {permissionsGranted && user ? (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Данные получены</p>
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
                    <span className="text-2xl">🔒</span>
                  </div>
                  <div>
                    <p className="font-semibold text-orange-800">Требуются разрешения</p>
                    <p className="text-sm text-gray-600">
                      Для работы приложения необходимо разрешить доступ к данным профиля
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Информация о разрешениях */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Что мы запрашиваем:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Имя и фамилию для персонализации</li>
                <li>• Username для идентификации</li>
                <li>• Telegram ID для связи с аккаунтом</li>
                <li>• Язык интерфейса для удобства</li>
              </ul>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3">
              {!permissionsGranted ? (
                <Button 
                  onClick={requestPermissions}
                  disabled={isRequestingPermissions}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isRequestingPermissions ? "Запрос разрешений..." : "Запросить разрешения"}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramAuthView;
