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
  
  // Отладочная информация
  console.log('=== NETWORK VIEW DEBUG ===');
  console.log('NetworkView - network data:', network);
  console.log('NetworkView - networkLoading:', networkLoading);
  console.log('NetworkView - levels:', levels);
  console.log('NetworkView - level1 count:', network?.level1?.length || 0);
  console.log('NetworkView - level2 count:', network?.level2?.length || 0);
  console.log('NetworkView - level3 count:', network?.level3?.length || 0);
  console.log('NetworkView - level4 count:', network?.level4?.length || 0);
  console.log('NetworkView - level1 data:', network?.level1);
  console.log('NetworkView - level2 data:', network?.level2);
  
  const renderPartnerCard = (partner: PartnerRecord) => {
    try {
      const totalEarnings = partner.totalEarnings || 0;
      // Формируем имя: Имя + первая буква фамилии (если есть)
      const lastNameInitial = partner.lastName && partner.lastName.trim() ? partner.lastName.trim()[0].toUpperCase() + '.' : '';
      const displayName = `${partner.firstName || ''} ${lastNameInitial}`.trim();
      
      return (
        <div key={partner.id} className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-base">{displayName}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-800">{partner.phone || 'не указан'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-800 break-all">{partner.email || 'не указан'}</span>
            </div>
            {partner.username && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Username:</span> @{partner.username}
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 space-y-1">
              <p className="text-xs text-gray-500">
                <span className="font-medium">Промокод:</span> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{partner.promoCode || 'не указан'}</code>
              </p>
              <p className="text-xs text-gray-500">
                <span className="font-medium">Доход:</span> <span className="text-green-600 font-semibold">₽{totalEarnings.toLocaleString('ru-RU')}</span>
              </p>
            </div>
          </div>
        </div>
      );
    } catch (error) {
      console.error('Error rendering partner card:', error, partner);
      return (
        <div key={partner.id} className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-red-600 text-sm">Ошибка отображения данных партнера</p>
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
            <CardTitle>Моя партнерская сеть</CardTitle>
          </CardHeader>
          <CardContent>
            {networkLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Загрузка...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Отладочная информация - всегда показываем для отладки */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
                  <p className="font-semibold mb-2">Отладочная информация:</p>
                  <p>Network data: Level1={network?.level1?.length || 0}, Level2={network?.level2?.length || 0}, Level3={network?.level3?.length || 0}, Level4={network?.level4?.length || 0}</p>
                  <p>Network object: {JSON.stringify(network, null, 2).substring(0, 500)}</p>
                  <p>Level1 data sample: {network?.level1?.[0] ? JSON.stringify(network.level1[0]) : 'нет данных'}</p>
                </div>
                
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
                      const levelData = network[levelKey] || [];
                      const levelDataArray = Array.isArray(levelData) ? levelData : [];
                      
                      console.log(`Level ${levelConfig.level} data:`, levelDataArray);
                      
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
                              {levelDataArray.map((partner, index) => (
                                <div key={`${partner.telegramId}-${index}`}>
                                  {renderPartnerCard(partner)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">
                              Пока нет партнеров на этом уровне
                            </p>
                          )}
                        </div>
                      );
                    } catch (error) {
                      console.error('Error rendering level:', error, levelConfig);
                      return (
                        <div key={levelConfig.level} className="border rounded-lg p-4 bg-gray-50">
                          <p className="text-red-600">Ошибка отображения уровня {levelConfig.level}</p>
                          <p className="text-xs text-gray-500 mt-2">{error instanceof Error ? error.message : String(error)}</p>
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

export default NetworkView;
