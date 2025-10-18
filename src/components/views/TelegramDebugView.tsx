import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";

const TelegramDebugView = () => {
  const { 
    user, 
    isReady, 
    webApp, 
    initData,
    initDataUnsafe,
    platform,
    colorScheme
  } = useTelegramWebApp();

  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (webApp) {
      setDebugInfo({
        isReady,
        platform,
        colorScheme,
        hasWebApp: !!webApp,
        hasUser: !!user,
        initData: initData,
        initDataUnsafe: initDataUnsafe,
        webAppMethods: {
          ready: typeof webApp.ready,
          expand: typeof webApp.expand,
          requestWriteAccess: typeof webApp.requestWriteAccess,
          requestContact: typeof webApp.requestContact,
          showAlert: typeof webApp.showAlert,
          showConfirm: typeof webApp.showConfirm,
          hapticFeedback: !!webApp.HapticFeedback,
          mainButton: !!webApp.MainButton,
          backButton: !!webApp.BackButton
        }
      });
    }
  }, [webApp, user, isReady, platform, colorScheme, initData, initDataUnsafe]);

  const testRequestWriteAccess = () => {
    if (!webApp) return;
    
    console.log('Testing requestWriteAccess...');
    webApp.requestWriteAccess((granted) => {
      console.log('Write access result:', granted);
      alert(`Write access: ${granted ? 'Granted' : 'Denied'}`);
    });
  };

  const testRequestContact = () => {
    if (!webApp) return;
    
    console.log('Testing requestContact...');
    webApp.requestContact((granted) => {
      console.log('Contact access result:', granted);
      alert(`Contact access: ${granted ? 'Granted' : 'Denied'}`);
    });
  };

  const testShowAlert = () => {
    if (!webApp) return;
    
    webApp.showAlert("Это тестовое уведомление!");
  };

  const testShowConfirm = () => {
    if (!webApp) return;
    
    webApp.showConfirm("Это тестовое подтверждение?", (confirmed) => {
      alert(`Подтверждение: ${confirmed ? 'Да' : 'Нет'}`);
    });
  };

  const testHapticFeedback = () => {
    if (!webApp?.HapticFeedback) return;
    
    webApp.HapticFeedback.impactOccurred('medium');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto pt-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">
              🔧 Отладка Telegram Web App
            </CardTitle>
            <CardDescription>
              Информация о состоянии Telegram Web App и тестирование функций
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Статус */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800">Статус</h3>
                <p className="text-sm">Готов: {isReady ? '✅' : '❌'}</p>
                <p className="text-sm">WebApp: {debugInfo.hasWebApp ? '✅' : '❌'}</p>
                <p className="text-sm">Пользователь: {debugInfo.hasUser ? '✅' : '❌'}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800">Платформа</h3>
                <p className="text-sm">Платформа: {platform || 'Не определена'}</p>
                <p className="text-sm">Тема: {colorScheme || 'Не определена'}</p>
              </div>
            </div>

            {/* Данные пользователя */}
            {user && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Данные пользователя</h3>
                <div className="text-sm space-y-1">
                  <p><strong>ID:</strong> {user.id}</p>
                  <p><strong>Имя:</strong> {user.first_name}</p>
                  <p><strong>Фамилия:</strong> {user.last_name || 'Не указана'}</p>
                  <p><strong>Username:</strong> @{user.username || 'Не указан'}</p>
                  <p><strong>Язык:</strong> {user.language_code || 'Не указан'}</p>
                </div>
              </div>
            )}

            {/* Init Data */}
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Init Data</h3>
              <div className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                <pre>{JSON.stringify(initDataUnsafe, null, 2)}</pre>
              </div>
            </div>

            {/* Тестовые кнопки */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={testRequestWriteAccess} variant="outline" size="sm">
                Тест Write Access
              </Button>
              <Button onClick={testRequestContact} variant="outline" size="sm">
                Тест Contact Access
              </Button>
              <Button onClick={testShowAlert} variant="outline" size="sm">
                Тест Alert
              </Button>
              <Button onClick={testShowConfirm} variant="outline" size="sm">
                Тест Confirm
              </Button>
              <Button onClick={testHapticFeedback} variant="outline" size="sm">
                Тест Haptic
              </Button>
            </div>

            {/* Полная отладочная информация */}
            <details className="bg-gray-50 p-4 rounded-lg">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                Полная отладочная информация
              </summary>
              <div className="text-xs bg-white p-2 rounded border overflow-auto max-h-64 mt-2">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </details>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TelegramDebugView;
