import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Phone, Mail, User, LogOut } from "lucide-react";
import type { PartnerRecord } from "@/services/googleSheetsService";
import { useLevelsConfig } from "@/hooks/useLevelsConfig";

interface NetworkViewProps {
  network: {
    level1: PartnerRecord[];
    level2: PartnerRecord[];
    level3: PartnerRecord[];
    level4: PartnerRecord[];
  };
  networkLoading: boolean;
  currentView: "registration" | "dashboard" | "stats" | "network" | "personalData";
  onViewChange: (view: "registration" | "dashboard" | "stats" | "network" | "personalData") => void;
  onLogout?: () => void;
}

const NetworkView = ({ network, networkLoading, currentView, onViewChange, onLogout }: NetworkViewProps) => {
  const { levels, loading: levelsLoading, error: levelsError } = useLevelsConfig();
  
  const renderCustomerCard = (customer: any) => {
    try {
      if (!customer || !customer.id) {
        return (
          <div className="bg-white p-3 rounded-lg border border-red-200">
            <p className="text-red-600 text-sm">Ошибка: неверные данные клиента</p>
          </div>
        );
      }
      
      const orderIds = String(customer.id || '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const ordersCount =
        typeof customer.totalOrdersCount === "number"
          ? customer.totalOrdersCount
          : orderIds.length;
      const saleIdsValue = orderIds.join(", ");
      const amountValue = Number(customer.amount) || 0; // not shown, kept for potential future debug
      const rawPhone = (customer.phone || '').trim();
      const phoneValue = rawPhone
        ? `***${rawPhone.slice(-4)}`
        : 'не указан';
      const tgUsernameRaw =
        (customer.username ||
          customer.telegramUsername ||
          customer.telegram_username ||
          customer.tgUsername ||
          customer.tg_username ||
          '').toString().trim();
      const tgIdValue =
        tgUsernameRaw ? (tgUsernameRaw.startsWith('@') ? tgUsernameRaw : `@${tgUsernameRaw}`) : 'нет';
      const saleDateValue = (customer.saleDate || '').trim();
      const registrationDateValue = (customer.registrationDate || '').trim();
      const partnerNameValue = (customer.partnerName || '').trim();

      return (
        <div key={customer.id} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="font-semibold text-base">{nameValue}</span>
            </div>
            {customer.isPartner && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Партнер
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-800">{phoneValue}</span>
            </div>
            <div className="pt-2 border-t border-gray-200 space-y-1">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Telegram ID:</span> {tgIdValue}
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-medium">Покупок:</span> {ordersCount}
              </p>
              {saleDateValue && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Последняя покупка:</span> {saleDateValue}
                </p>
              )}
              {partnerNameValue && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Имя в партнёрке:</span> {partnerNameValue}
                </p>
              )}
              {registrationDateValue && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Дата регистрации:</span> {registrationDateValue}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div key={customer.id} className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-red-600 text-sm">Ошибка отображения данных клиента</p>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation currentView={currentView} onViewChange={onViewChange} onLogout={onLogout} />
      
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Клиенты, купившие по моему промокоду</CardTitle>
          </CardHeader>
          <CardContent>
            {networkLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Загрузка...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {levelsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Загрузка уровней...</p>
                  </div>
                ) : levelsError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Ошибка загрузки уровней: {levelsError}</p>
                  </div>
                ) : levels.length > 0 ? (
                  levels.map((levelConfig) => {
                    try {
                      const levelKey = `level${levelConfig.level}` as keyof typeof network;
                      const levelData = network?.[levelKey] || [];
                      const levelDataArray = Array.isArray(levelData) ? levelData : [];
                      
                      return (
                        <div key={levelConfig.level} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-lg">
                              Уровень {levelConfig.level} ({levelConfig.percentage}%)
                            </h3>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {levelDataArray.length}
                            </span>
                          </div>
                          {levelDataArray.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {levelDataArray.map((customer, index) => (
                                <div key={`${customer.id}-${index}`}>
                                  {renderCustomerCard(customer)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">
                              Пока нет клиентов на этом уровне
                            </p>
                          )}
                        </div>
                      );
                    } catch (error) {
                      return (
                        <div key={levelConfig.level} className="border rounded-lg p-4 bg-gray-50">
                          <p className="text-red-600">Ошибка отображения уровня {levelConfig.level}</p>
                        </div>
                      );
                    }
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Нет данных об уровнях</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Кнопка выхода в самом низу страницы - только для мобильных, так как в Navigation уже есть кнопка */}
      {onLogout && (
        <div className="bg-white border-t border-gray-200 p-4 md:hidden relative z-10 min-h-[60px]">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onLogout) {
                onLogout();
              }
            }}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 relative z-20 min-h-[44px]"
            style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>
      )}
    </div>
  );
};

export default NetworkView;


