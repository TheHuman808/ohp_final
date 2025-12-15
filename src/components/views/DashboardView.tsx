import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import { Users, TrendingUp, Share2, LogOut, DollarSign, Layers } from "lucide-react";
import type { PartnerRecord, CommissionRecord, PartnerStats, NetworkData } from "@/services/googleSheetsService";
import { useLevelsConfig } from "@/hooks/useLevelsConfig";

interface DashboardViewProps {
  partner: PartnerRecord;
  commissions: CommissionRecord[];
  stats: PartnerStats;
  statsLoading: boolean;
  network: NetworkData;
  currentView: "registration" | "dashboard" | "stats" | "network" | "personalData";
  onViewChange: (view: "registration" | "dashboard" | "stats" | "network" | "personalData") => void;
  onLogout?: () => void;
}

const DashboardView = ({ partner, commissions, stats, statsLoading, network, currentView, onViewChange, onLogout }: DashboardViewProps) => {
  const { levels, loading: levelsLoading, error: levelsError } = useLevelsConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation currentView={currentView} onViewChange={onViewChange} onLogout={onLogout} />
      
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Добро пожаловать, {partner.firstName}!</span>
              <Badge variant="secondary">{partner.promoCode}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Загрузка статистики...</p>
              </div>
            ) : stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Общий доход</p>
                      <p className="text-xl font-bold">₽{stats.totalIncome.toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Партнеры</p>
                      <p className="text-xl font-bold">{stats.partnersCount}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <Share2 className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">Продажи</p>
                      <p className="text-xl font-bold">{stats.uniqueSalesCount}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <Layers className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Доход от уровней</p>
                      <p className="text-lg font-bold text-blue-700">₽{stats.incomeByLevels.toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Доход от партнеров</p>
                      <p className="text-lg font-bold text-green-700">₽{stats.incomeFromPartners.toLocaleString('ru-RU')}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600">Нет данных для отображения</p>
                <p className="text-xs text-gray-500 mt-2">Проверьте консоль браузера для деталей</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Информация о партнере</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Имя:</strong> {partner.firstName} {partner.lastName}
              </div>
              <div>
                <strong>Телефон:</strong> {partner.phone}
              </div>
              <div>
                <strong>Email:</strong> {partner.email}
              </div>
              <div>
                <strong>Username:</strong> {partner.username || 'не указан'}
              </div>
              <div>
                <strong>Промокод:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{partner.promoCode}</code>
              </div>
              <div>
                <strong>Дата регистрации:</strong> {partner.registrationDate}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Условия партнерской программы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {levelsLoading ? (
                <div className="col-span-full text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Загрузка уровней...</p>
                </div>
              ) : levelsError ? (
                <div className="col-span-full text-center py-4">
                  <p className="text-sm text-red-600">Ошибка загрузки уровней: {levelsError}</p>
                </div>
              ) : levels.length > 0 ? (
                levels.map((levelConfig) => (
                  <div key={levelConfig.level} className={`p-3 bg-gradient-to-br ${levelConfig.color.bg} rounded-lg`}>
                    <div className={`text-2xl font-bold ${levelConfig.color.text}`}>
                      {levelConfig.percentage}%
                    </div>
                    <div className={`text-sm ${levelConfig.color.text.replace('800', '700')}`}>
                      Уровень {levelConfig.level}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-4">
                  <p className="text-sm text-gray-600">Нет данных об уровнях</p>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Процент с продаж привлеченных партнеров на соответствующем уровне
            </p>
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
              console.log('Logout button clicked on mobile (bottom)');
              try {
                if (onLogout) {
                  onLogout();
                }
              } catch (error) {
                console.error('Error in logout handler:', error);
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

export default DashboardView;
