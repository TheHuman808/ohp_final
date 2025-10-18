import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TelegramUser } from "@/types/telegram";

interface TelegramWebAuthViewProps {
  onAuthSuccess: (user: TelegramUser) => void;
  onCancel: () => void;
}

const TelegramWebAuthView = ({ onAuthSuccess, onCancel }: TelegramWebAuthViewProps) => {
  const [isOpeningTelegram, setIsOpeningTelegram] = useState(false);
  const [authData, setAuthData] = useState<TelegramUser | null>(null);

  // Проверяем, есть ли данные авторизации в URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const telegramData = urlParams.get('telegram_data');
    
    if (telegramData) {
      try {
        const userData = JSON.parse(decodeURIComponent(telegramData));
        console.log('Received Telegram data:', userData);
        setAuthData(userData);
      } catch (error) {
        console.error('Error parsing Telegram data:', error);
      }
    }
  }, []);

  const openTelegramAuth = () => {
    setIsOpeningTelegram(true);
    
    // Создаем URL для авторизации через Telegram
    const botUsername = 'ohp_bot'; // Замените на ваш username бота
    const webAppUrl = encodeURIComponent(window.location.origin + '?auth=telegram');
    const telegramUrl = `https://t.me/${botUsername}?startapp=${webAppUrl}`;
    
    console.log('Opening Telegram auth:', telegramUrl);
    
    // Открываем Telegram
    window.open(telegramUrl, '_blank');
    
    // Показываем инструкции
    setTimeout(() => {
      setIsOpeningTelegram(false);
    }, 2000);
  };

  const handleConfirmAuth = () => {
    if (!authData) {
      alert('Данные авторизации не получены');
      return;
    }
    
    onAuthSuccess(authData);
  };

  const handleCancel = () => {
    onCancel();
  };

  // Если данные авторизации получены, показываем подтверждение
  if (authData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-800">
                ✅ Данные получены
              </CardTitle>
              <CardDescription>
                Подтвердите авторизацию с полученными данными
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Данные пользователя */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Данные пользователя:</h4>
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {authData.id}</p>
                  <p><strong>Имя:</strong> {authData.first_name}</p>
                  <p><strong>Фамилия:</strong> {authData.last_name || 'Не указана'}</p>
                  <p><strong>Username:</strong> @{authData.username || 'Не указан'}</p>
                  <p><strong>Язык:</strong> {authData.language_code || 'Не указан'}</p>
                </div>
              </div>

              {/* Кнопки действий */}
              <div className="space-y-3">
                <Button 
                  onClick={handleConfirmAuth}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Подтвердить авторизацию
                </Button>
                
                <Button 
                  onClick={handleCancel}
                  variant="outline"
                  className="w-full"
                >
                  Отмена
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
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
              Для входа в реферальную программу необходимо авторизоваться через Telegram
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Инструкции */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Как авторизоваться:</h4>
                <ol className="text-sm text-blue-700 space-y-2">
                  <li>1. Нажмите кнопку "Открыть Telegram"</li>
                  <li>2. В открывшемся Telegram нажмите "Start"</li>
                  <li>3. Разрешите доступ к контакту</li>
                  <li>4. Вернитесь в это приложение</li>
                </ol>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Важно:</h4>
                <p className="text-sm text-yellow-700">
                  Убедитесь, что у вас установлен Telegram на устройстве. 
                  Если Telegram не открывается, скопируйте ссылку и откройте вручную.
                </p>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3">
              <Button 
                onClick={openTelegramAuth}
                disabled={isOpeningTelegram}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isOpeningTelegram ? "Открытие Telegram..." : "📱 Открыть Telegram"}
              </Button>
              
              <Button 
                onClick={handleCancel}
                variant="outline"
                className="w-full"
              >
                Отмена
              </Button>
            </div>

            {/* Альтернативная ссылка */}
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-2">Или откройте вручную:</p>
              <code className="text-xs bg-gray-100 p-2 rounded block break-all">
                t.me/ohp_bot?startapp={encodeURIComponent(window.location.origin)}
              </code>
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

export default TelegramWebAuthView;
