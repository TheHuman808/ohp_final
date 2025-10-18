
import { useState, useEffect } from "react";
import { usePartner } from "@/hooks/useGoogleSheets";
import RegistrationView from "@/components/views/RegistrationView";
import PersonalDataView from "@/components/views/PersonalDataView";
import DashboardView from "@/components/views/DashboardView";
import StatsView from "@/components/views/StatsView";
import NetworkView from "@/components/views/NetworkView";
import TelegramAuthView from "@/components/views/TelegramAuthView";
import TelegramContactAuthView from "@/components/views/TelegramContactAuthView";
import TelegramWebAuthView from "@/components/views/TelegramWebAuthView";
import TelegramDebugView from "@/components/views/TelegramDebugView";
import TestModeView from "@/components/views/TestModeView";
import { usePartnerCommissions, usePartnerNetwork } from "@/hooks/useGoogleSheets";
import { googleSheetsService } from "@/services/googleSheetsService";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import { TelegramUser } from "@/types/telegram";

const Index = () => {
  const [currentView, setCurrentView] = useState<"registration" | "personalData" | "dashboard" | "stats" | "network" | "telegramAuth" | "telegramContactAuth" | "telegramWebAuth" | "debug" | "testMode">("registration");
  const [inviterCode, setInviterCode] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isExistingUserLogin, setIsExistingUserLogin] = useState(false);
  const [isTelegramAuth, setIsTelegramAuth] = useState(false);
  const [testUser, setTestUser] = useState<TelegramUser | null>(null);
  
  // Используем хук Telegram Web App
  const { user: telegramUser, isReady } = useTelegramWebApp();
  
  // Используем тестового пользователя если нет данных из Telegram
  const currentTelegramUser = telegramUser || testUser;

  // Логика получения пользователя теперь обрабатывается в хуке useTelegramWebApp
  useEffect(() => {
    if (isReady && telegramUser) {
      console.log('Telegram user ready:', telegramUser);
    }
  }, [isReady, telegramUser]);

  const { 
    partner, 
    loading: partnerLoading, 
    error: partnerError, 
    registerPartner,
    refreshPartner
  } = usePartner(loggedOut ? '' : (currentTelegramUser?.id?.toString() || ''), forceRefresh);

  const { 
    commissions, 
    loading: commissionsLoading, 
    error: commissionsError,
    refresh: refreshCommissions
  } = usePartnerCommissions(loggedOut ? '' : (currentTelegramUser?.id?.toString() || ''));

  const {
    network,
    loading: networkLoading,
    error: networkError
  } = usePartnerNetwork(loggedOut ? '' : (currentTelegramUser?.id?.toString() || ''));

  const handlePromoCodeSuccess = (validInviterCode: string) => {
    console.log('Promo code validated successfully, proceeding to NEW USER registration:', validInviterCode);
    setInviterCode(validInviterCode);
    setLoggedOut(false);
    setIsExistingUserLogin(false);
    // Переходим к регистрации НОВОГО пользователя
    setCurrentView("personalData");
  };

  const handleExistingUserLogin = () => {
    console.log('Existing user login initiated for Telegram ID:', currentTelegramUser?.id?.toString());
    setLoggedOut(false);
    setIsExistingUserLogin(true);
    // Принудительно обновляем данные для проверки существующего пользователя
    setForceRefresh(prev => prev + 1);
  };

  const handleTelegramAuth = () => {
    console.log('Telegram auth initiated');
    setIsTelegramAuth(true);
    setCurrentView("telegramAuth");
  };

  const handleTelegramContactAuth = () => {
    console.log('Telegram contact auth initiated');
    setIsTelegramAuth(true);
    setCurrentView("telegramContactAuth");
  };

  const handleTelegramWebAuth = () => {
    console.log('Telegram web auth initiated');
    setIsTelegramAuth(true);
    setCurrentView("telegramWebAuth");
  };

  const handleTelegramAuthSuccess = (user: TelegramUser) => {
    console.log('Telegram auth successful:', user);
    setIsTelegramAuth(false);
    setLoggedOut(false);
    setIsExistingUserLogin(true);
    // Принудительно обновляем данные для проверки существующего пользователя
    setForceRefresh(prev => prev + 1);
  };

  const handleTelegramAuthCancel = () => {
    console.log('Telegram auth cancelled');
    setIsTelegramAuth(false);
    setCurrentView("registration");
  };

  const handleDebug = () => {
    console.log('Opening debug view');
    setCurrentView("debug");
  };

  const handleTestMode = () => {
    console.log('Opening test mode');
    setCurrentView("testMode");
  };

  const handleTestUserSet = (user: TelegramUser) => {
    console.log('Test user set:', user);
    setTestUser(user);
    setCurrentView("registration");
  };

  const handleTestModeCancel = () => {
    console.log('Test mode cancelled');
    setCurrentView("registration");
  };

  const handleRegistrationSuccess = () => {
    console.log('New user registration completed successfully');
    setLoggedOut(false);
    setIsExistingUserLogin(false);
    // После успешной регистрации сразу переходим в дашборд
    setCurrentView("dashboard");
    // Обновляем данные
    setForceRefresh(prev => prev + 1);
    refreshCommissions();
    console.log('Redirecting to dashboard...');
  };

  const handleViewChange = (view: "registration" | "dashboard" | "stats" | "network" | "personalData" | "telegramAuth" | "telegramContactAuth" | "telegramWebAuth" | "debug" | "testMode") => {
    setCurrentView(view);
  };

  const handleLogout = () => {
    console.log('Logging out user:', currentTelegramUser?.id?.toString());
    // Очищаем все локальные данные
    googleSheetsService.clearAllLocalData();
    // Устанавливаем флаг выхода
    setLoggedOut(true);
    // Сбрасываем все состояние
    setInviterCode("");
    setIsExistingUserLogin(false);
    setTestUser(null); // Очищаем тестового пользователя
    setCurrentView("registration");
    // Принудительно обновляем хуки для сброса данных партнера
    setForceRefresh(prev => prev + 1);
    console.log('Logged out successfully');
  };

  const handlePersonalDataComplete = async (personalData: { firstName: string; lastName: string; phone: string; email: string }) => {
    if (!currentTelegramUser) {
      console.error('No telegram user data');
      return;
    }
    
    console.log('=== STARTING NEW USER REGISTRATION PROCESS ===');
    console.log('Personal data:', personalData);
    console.log('Inviter code:', inviterCode);
    console.log('Telegram user:', currentTelegramUser);
    console.log('Username to save:', currentTelegramUser.username);
    
    const result = await registerPartner(
      inviterCode,
      personalData,
      currentTelegramUser.username || undefined
    );
    
    console.log('Registration result:', result);
    
    if (result.success) {
      handleRegistrationSuccess();
    }
  };

  // Если пользователь вышел из системы, показываем только регистрацию
  if (loggedOut) {
    if (currentView === "personalData") {
      return (
        <PersonalDataView
          onComplete={handlePersonalDataComplete}
          loading={partnerLoading}
        />
      );
    }

    if (currentView === "telegramAuth") {
      return (
        <TelegramAuthView
          onAuthSuccess={handleTelegramAuthSuccess}
          onCancel={handleTelegramAuthCancel}
        />
      );
    }

    return (
      <RegistrationView
        telegramUser={currentTelegramUser}
        onPromoCodeSuccess={handlePromoCodeSuccess}
        onExistingUserLogin={handleExistingUserLogin}
        onTelegramAuth={handleTelegramAuth}
        onTelegramContactAuth={handleTelegramContactAuth}
        onTelegramWebAuth={handleTelegramWebAuth}
        onDebug={handleDebug}
        onTestMode={handleTestMode}
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
  if (isExistingUserLogin && !partner) {
    console.log('Existing user not found, redirecting to registration');
    setIsExistingUserLogin(false);
    setCurrentView("registration");
  }

  // Если мы в процессе регистрации НОВОГО пользователя
  if (currentView === "personalData" && !isExistingUserLogin) {
    return (
      <PersonalDataView
        onComplete={handlePersonalDataComplete}
        loading={partnerLoading}
      />
    );
  }

  // Если мы в процессе авторизации через Telegram
  if (currentView === "telegramAuth") {
    return (
      <TelegramAuthView
        onAuthSuccess={handleTelegramAuthSuccess}
        onCancel={handleTelegramAuthCancel}
      />
    );
  }

  // Если мы в процессе авторизации через Telegram с запросом контакта
  if (currentView === "telegramContactAuth") {
    return (
      <TelegramContactAuthView
        onAuthSuccess={handleTelegramAuthSuccess}
        onCancel={handleTelegramAuthCancel}
      />
    );
  }

  // Если мы в процессе авторизации через Telegram Web
  if (currentView === "telegramWebAuth") {
    return (
      <TelegramWebAuthView
        onAuthSuccess={handleTelegramAuthSuccess}
        onCancel={handleTelegramAuthCancel}
      />
    );
  }

  // Отладочный режим
  if (currentView === "debug") {
    return <TelegramDebugView />;
  }

  // Тестовый режим
  if (currentView === "testMode") {
    return (
      <TestModeView
        onUserSet={handleTestUserSet}
        onCancel={handleTestModeCancel}
      />
    );
  }

  // По умолчанию показываем экран ввода промокода
  return (
    <RegistrationView
      telegramUser={currentTelegramUser}
      onPromoCodeSuccess={handlePromoCodeSuccess}
      onExistingUserLogin={handleExistingUserLogin}
      onTelegramAuth={handleTelegramAuth}
      onTelegramContactAuth={handleTelegramContactAuth}
      onTelegramWebAuth={handleTelegramWebAuth}
      onDebug={handleDebug}
      onTestMode={handleTestMode}
      partnerLoading={partnerLoading}
    />
  );
};

export default Index;
