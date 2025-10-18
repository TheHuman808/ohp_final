
import { useState, useEffect } from "react";
import { usePartner } from "@/hooks/useGoogleSheets";
import { useTelegramWebApp } from "@/hooks/useTelegramWebApp";
import RegistrationView from "@/components/views/RegistrationView";
import PersonalDataView from "@/components/views/PersonalDataView";
import DashboardView from "@/components/views/DashboardView";
import StatsView from "@/components/views/StatsView";
import NetworkView from "@/components/views/NetworkView";
import { usePartnerCommissions, usePartnerNetwork } from "@/hooks/useGoogleSheets";
import { googleSheetsService } from "@/services/googleSheetsService";
import { TelegramUser } from "@/types/telegram";

const Index = () => {
  const { currentUser, isReady } = useTelegramWebApp();
  const [currentView, setCurrentView] = useState<"registration" | "personalData" | "dashboard" | "stats" | "network">("registration");
  const [inviterCode, setInviterCode] = useState("");
  const [loggedOut, setLoggedOut] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isExistingUserLogin, setIsExistingUserLogin] = useState(false);

  // Преобразуем currentUser в telegramUser для совместимости
  const telegramUser: TelegramUser | null = currentUser ? {
    id: currentUser.id.toString(),
    first_name: currentUser.first_name,
    username: currentUser.username
  } : null;

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

  const handleExistingUserLogin = () => {
    console.log('Existing user login initiated for Telegram ID:', telegramUser?.id);
    setLoggedOut(false);
    setIsExistingUserLogin(true);
    // Принудительно обновляем данные для проверки существующего пользователя
    setForceRefresh(prev => prev + 1);
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
  };

  const handleViewChange = (view: "registration" | "dashboard" | "stats" | "network" | "personalData") => {
    setCurrentView(view);
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
    console.log('Inviter code:', inviterCode);
    console.log('Telegram user:', telegramUser);
    
    const result = await registerPartner(
      inviterCode,
      personalData,
      telegramUser.username
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

    return (
      <RegistrationView
        telegramUser={telegramUser}
        onPromoCodeSuccess={handlePromoCodeSuccess}
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

  // По умолчанию показываем экран ввода промокода
  return (
    <RegistrationView
      telegramUser={telegramUser}
      onPromoCodeSuccess={handlePromoCodeSuccess}
      onExistingUserLogin={handleExistingUserLogin}
      partnerLoading={partnerLoading}
    />
  );
};

export default Index;
