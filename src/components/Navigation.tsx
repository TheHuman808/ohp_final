
import { Button } from "@/components/ui/button";
import { Users, FileText, LogOut } from "lucide-react";

interface NavigationProps {
  currentView: "registration" | "dashboard" | "stats" | "network" | "personalData";
  onViewChange: (view: "registration" | "dashboard" | "stats" | "network" | "personalData") => void;
  onLogout?: () => void;
}

const Navigation = ({ currentView, onViewChange, onLogout }: NavigationProps) => {
  return (
    <div className="bg-white shadow-sm border-b">
      {/* Основная навигация */}
      <div className="flex justify-around py-3">
        <Button
          variant={currentView === "dashboard" ? "default" : "ghost"}
          onClick={() => onViewChange("dashboard")}
          className={`flex-1 mx-1 ${currentView === "dashboard" ? "bg-orange-600 hover:bg-orange-700 text-white font-bold" : ""}`}
        >
          Главная
        </Button>
        <Button
          variant={currentView === "stats" ? "default" : "ghost"}
          onClick={() => onViewChange("stats")}
          className={`flex-1 mx-1 ${currentView === "stats" ? "bg-orange-600 hover:bg-orange-700 text-white font-bold" : ""}`}
        >
          <FileText className="w-4 h-4 mr-1" />
          Статистика
        </Button>
        <Button
          variant={currentView === "network" ? "default" : "ghost"}
          onClick={() => onViewChange("network")}
          className={`flex-1 mx-1 ${currentView === "network" ? "bg-orange-600 hover:bg-orange-700 text-white font-bold" : ""}`}
        >
          <Users className="w-4 h-4 mr-1" />
          Сеть
        </Button>
        {/* Кнопка выхода для десктопа - скрыта на мобильных */}
        {onLogout && (
          <Button
            variant="outline"
            onClick={onLogout}
            className="hidden md:flex flex-1 mx-1 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Выйти
          </Button>
        )}
      </div>
    </div>
  );
};

export default Navigation;
