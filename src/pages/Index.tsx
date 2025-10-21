
import { useState, useEffect } from "react";
import { usePartner } from "@/hooks/useGoogleSheets";
import RegistrationView from "@/components/views/RegistrationView";
import PersonalDataView from "@/components/views/PersonalDataView";
import DashboardView from "@/components/views/DashboardView";
import StatsView from "@/components/views/StatsView";
import NetworkView from "@/components/views/NetworkView";
import { usePartnerCommissions, usePartnerNetwork } from "@/hooks/useGoogleSheets";
import { googleSheetsService } from "@/services/googleSheetsService";

interface TelegramUser {
  id: string;
  first_name: string;
  username?: string;
}

const Index = () => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [currentView, setCurrentView] = useState<"registration" | "personalData" | "dashboard" | "stats" | "network">("registration");
  const [inviterCode, setInviterCode] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isExistingUserLogin, setIsExistingUserLogin] = useState(false);

  useEffect(() => {
    const initializeTelegramData = () => {
      console.log('=== TELEGRAM DATA INITIALIZATION ===');
      console.log('window.Telegram:', window.Telegram);
      console.log('window.Telegram?.WebApp:', window.Telegram?.WebApp);
      
      // Инициализируем Telegram Web App
      if (window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        console.log('WebApp object:', webApp);
        console.log('WebApp.initData:', webApp.initData);
        console.log('WebApp.initDataUnsafe:', webApp.initDataUnsafe);
        
        if (webApp.ready) webApp.ready();
        if (webApp.expand) webApp.expand();
        console.log('Telegram Web App initialized');
      }
    
    // Получаем реальные данные из Telegram Web App
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;
      console.log('Real Telegram user data received:', {
        id: user.id,
        first_name: user.first_name,
        username: user.username,
        language_code: user.language_code,
        last_name: user.last_name,
        is_premium: user.is_premium
      });
      
      setTelegramUser({
        id: user.id.toString(),
        first_name: user.first_name,
        username: user.username || undefined
      });
      return;
    }
    
    // Альтернативный способ получения данных через initData
    if (window.Telegram?.WebApp?.initData) {
      console.log('Trying to parse initData:', window.Telegram.WebApp.initData);
      try {
        const urlParams = new URLSearchParams(window.Telegram.WebApp.initData);
        const userParam = urlParams.get('user');
        if (userParam) {
          const user = JSON.parse(decodeURIComponent(userParam));
          console.log('Parsed user from initData:', user);
          
          setTelegramUser({
            id: user.id.toString(),
            first_name: user.first_name,
            username: user.username || undefined
          });
          return;
        }
      } catch (error) {
        console.error('Error parsing initData:', error);
      }
    }

    // Fallback - проверяем URL параметры (для тестирования)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const first_name = params.get('first_name');
    const username = params.get('username');

    if (id && first_name) {
      console.log('Telegram data from URL params:', { id, first_name, username });
      setTelegramUser({
        id,
        first_name,
        username: username || undefined
      });
      return;
    }

    // Для локальной разработки - используем более реалистичные тестовые данные
    const uniqueTestId = `test_user_${Math.random().toString(36).substr(2, 9)}`;
    console.log('No real Telegram data available. Using test user:', uniqueTestId);
    console.log('Приложение должно быть запущено через Telegram бота для получения реальных данных');
    
      // Используем более реалистичные тестовые данные
      setTelegramUser({
        id: uniqueTestId,
        first_name: 'Александр',
        username: 'alex_user'
      });
    };

    // Запускаем инициализацию сразу
    initializeTelegramData();
    
    // Также запускаем с задержкой на случай, если Telegram Web App загружается асинхронно
    const timeoutId = setTimeout(initializeTelegramData, 1000);
    
    // Добавляем обработчик события для Telegram Web App
    const handleTelegramEvent = () => {
      console.log('Telegram Web App event triggered');
      initializeTelegramData();
    };
    
    // Слушаем события Telegram Web App
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.onEvent('viewportChanged', handleTelegramEvent);
      window.Telegram.WebApp.onEvent('themeChanged', handleTelegramEvent);
    }
    
    return () => {
      clearTimeout(timeoutId);
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.offEvent('viewportChanged', handleTelegramEvent);
        window.Telegram.WebApp.offEvent('themeChanged', handleTelegramEvent);
      }
    };
  }, []);

  const { 
    partner, 
    loading: partnerLoading, 
    error: partnerError, 
    registerPartner,
    refreshPartner
  } = usePartner(loggedOut ? '' : (telegramUser?.id || ''), forceRefresh);

  const { 
    commissions, 
    loading: commissionsLoading, 
    error: commissionsError,
    refresh: refreshCommissions
  } = usePartnerCommissions(loggedOut ? '' : (telegramUser?.id || ''));

  const {
    network,
    loading: networkLoading,
    error: networkError
  } = usePartnerNetwork(loggedOut ? '' : (telegramUser?.id || ''));

  const handlePromoCodeSuccess = (validInviterCode: string) => {
    console.log('Promo code validated successfully, proceeding to NEW USER registration:', validInviterCode);
    setInviterCode(validInviterCode);
    setLoggedOut(false);
    setIsExistingUserLogin(false);
    // Переходим к регистрации НОВОГО пользователя
    setCurrentView("personalData");
  };

  const handleNoPromoCodeRegistration = () => {
    console.log('No promo code registration initiated');
    setInviterCode(""); // Очищаем промокод
    setLoggedOut(false);
    setIsExistingUserLogin(false);
    // Переходим к регистрации БЕЗ промокода
    setCurrentView("personalData");
  };

  const handleExistingUserLogin = () => {
    console.log('Existing user login initiated for Telegram ID:', telegramUser?.id);
    setLoggedOut(false);
    setIsExistingUserLogin(true);
    // Принудительно обновляем данные для проверки существующего пользователя
    setForceRefresh(prev => prev + 1);
  };

  const handleRegistrationSuccess = () => {
    console.log('=== NEW USER REGISTRATION COMPLETED SUCCESSFULLY ===');
    setLoggedOut(false);
    setIsExistingUserLogin(false);
    setInviterCode(""); // Очищаем промокод после регистрации
    // После успешной регистрации сразу переходим в дашборд
    setCurrentView("dashboard");
    // Обновляем данные партнера и комиссий
    setForceRefresh(prev => prev + 1);
    refreshCommissions();
    console.log('Redirecting to dashboard...');
  };

  const handleViewChange = (view: "registration" | "dashboard" | "stats" | "network" | "personalData") => {
    setCurrentView(view);
  };

  const handleBackToRegistration = () => {
    console.log('Going back to registration screen');
    setCurrentView("registration");
    setInviterCode(""); // Очищаем промокод при возврате
    setIsExistingUserLogin(false);
  };

  const handleLogout = () => {
    console.log('Logging out user:', telegramUser?.id);
    // Очищаем все локальные данные
    googleSheetsService.clearAllLocalData();
    // Устанавливаем флаг выхода
    setLoggedOut(true);
    // Сбрасываем все состояние
    setInviterCode("");
    setIsExistingUserLogin(false);
    setCurrentView("registration");
    // Принудительно обновляем хуки для сброса данных партнера
    setForceRefresh(prev => prev + 1);
    console.log('Logged out successfully');
  };

  const handlePersonalDataComplete = async (personalData: { firstName: string; lastName: string; phone: string; email: string }) => {
    if (!telegramUser) {
      console.error('No telegram user data');
      return;
    }
    
    console.log('=== STARTING NEW USER REGISTRATION PROCESS ===');
    console.log('Personal data:', personalData);
    console.log('Inviter code:', inviterCode || 'NO PROMO CODE');
    console.log('Telegram user:', telegramUser);
    
    try {
      // Если есть промокод, используем его, иначе регистрируем без промокода
      const result = await registerPartner(
        inviterCode || "", // Пустая строка если нет промокода
        personalData,
        telegramUser.username
      );
      
      console.log('Registration result:', result);
      
      if (result.success) {
        console.log('Registration successful, redirecting to dashboard');
        handleRegistrationSuccess();
      } else {
        console.log('Registration failed:', result.error);
        
        // Если ошибка "Load failed", показываем более понятное сообщение
        if (result.error?.includes('Load failed')) {
          alert('Ошибка подключения к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте еще раз.');
        } else {
          alert(`Ошибка регистрации: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Если ошибка сети, показываем понятное сообщение
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        alert('Ошибка подключения к серверу. Пожалуйста, проверьте интернет-соединение и попробуйте еще раз.');
      } else {
        alert(`Ошибка регистрации: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    }
  };

  // Если пользователь вышел из системы, показываем только регистрацию
  if (loggedOut) {
    if (currentView === "personalData") {
      return (
        <PersonalDataView
          onComplete={handlePersonalDataComplete}
          onBack={handleBackToRegistration}
          loading={partnerLoading}
          telegramUser={telegramUser}
        />
      );
    }

    return (
      <RegistrationView
        telegramUser={telegramUser}
        onPromoCodeSuccess={handlePromoCodeSuccess}
        onNoPromoCodeRegistration={handleNoPromoCodeRegistration}
        onExistingUserLogin={handleExistingUserLogin}
        partnerLoading={partnerLoading}
      />
    );
  }

  // Если данные еще загружаются
  if (partnerLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  // Если есть ошибка загрузки
  if (partnerError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Ошибка
          </h1>
          <p className="text-red-600">{partnerError}</p>
        </div>
      </div>
    );
  }

  // Если партнер найден
  if (partner) {
    if (currentView === "stats") {
      return (
        <StatsView
          commissions={commissions}
          commissionsLoading={commissionsLoading}
          currentView={currentView}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
        />
      );
    }

    if (currentView === "network") {
      return (
        <NetworkView
          network={network}
          networkLoading={networkLoading}
          currentView={currentView}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
        />
      );
    }

    // По умолчанию показываем дашборд для найденного пользователя
    return (
      <DashboardView
        partner={partner}
        commissions={commissions}
        currentView={currentView}
        onViewChange={handleViewChange}
        onLogout={handleLogout}
      />
    );
  }

  // Если это попытка входа существующего пользователя, но партнер не найден
  if (isExistingUserLogin && !partner && !partnerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-md mx-auto pt-20">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Аккаунт не найден
            </h2>
            <p className="text-gray-600 mb-6">
              Ваш аккаунт не найден в системе. Пожалуйста, зарегистрируйтесь.
            </p>
            <button
              onClick={() => {
                setIsExistingUserLogin(false);
                setCurrentView("registration");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
            >
              Зарегистрироваться
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если мы в процессе регистрации НОВОГО пользователя
  if (currentView === "personalData" && !isExistingUserLogin) {
    return (
      <PersonalDataView
        onComplete={handlePersonalDataComplete}
        onBack={handleBackToRegistration}
        loading={partnerLoading}
        telegramUser={telegramUser}
      />
    );
  }

  // По умолчанию показываем экран ввода промокода
  return (
    <RegistrationView
      telegramUser={telegramUser}
      onPromoCodeSuccess={handlePromoCodeSuccess}
      onNoPromoCodeRegistration={handleNoPromoCodeRegistration}
      onExistingUserLogin={handleExistingUserLogin}
      partnerLoading={partnerLoading}
    />
  );
};

export default Index;
