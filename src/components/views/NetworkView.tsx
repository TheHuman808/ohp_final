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
  const renderPartnerCard = (partner: PartnerRecord) => (
    <div key={partner.id} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-gray-500" />
        <span className="font-medium">{partner.firstName} {partner.lastName}</span>
      </div>
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex items-center gap-2">
          <Phone className="w-3 h-3" />
          <span>{partner.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="w-3 h-3" />
          <span>{partner.email}</span>
        </div>
        {partner.username && (
          <p>@{partner.username}</p>
        )}
        <p className="text-xs text-gray-500">
          Промокод: <code className="bg-gray-100 px-1 rounded">{partner.promoCode}</code>
        </p>
        <p className="text-xs text-gray-500">
          Доход: ₽{partner.totalEarnings.toLocaleString()}
        </p>
      </div>
    </div>
  );

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
                    const levelData = network[`level${levelConfig.level}` as keyof typeof network];
                    return (
                      <div key={levelConfig.level} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-lg">
                            Уровень {levelConfig.level} ({levelConfig.percentage}%)
                          </h3>
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {levelData.length}
                          </span>
                        </div>
                      {levelData.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {levelData.map(renderPartnerCard)}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          Пока нет партнеров на этом уровне
                        </p>
                      )}
                      </div>
                    );
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
      
      {/* Кнопка выхода в самом низу страницы */}
      {onLogout && (
        <div className="bg-white border-t border-gray-200 p-4 md:hidden relative z-10 min-h-[60px]">
          <Button
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Logout button clicked on mobile');
              onLogout();
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
