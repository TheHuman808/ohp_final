import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface RegistrationViewProps {
  onPromoCodeSubmit: (promoCode: string) => void;
  onNewUserNoPromo: () => void;
  onExistingUserLogin: () => void;
  telegramUser: { id: string; first_name: string; username?: string } | null;
  partnerLoading: boolean;
  validating: boolean;
}

const RegistrationView = ({
  onPromoCodeSubmit,
  onNewUserNoPromo,
  onExistingUserLogin,
  telegramUser,
  partnerLoading,
  validating
}: RegistrationViewProps) => {
  const [inviterCode, setInviterCode] = useState("");
  const { toast } = useToast();

  const handlePromoCodeSubmit = () => {
    if (!inviterCode.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите промокод",
        variant: "destructive"
      });
      return;
    }
    onPromoCodeSubmit(inviterCode);
  };

  // Определяем отображаемое имя пользователя из реальных данных Telegram
  const displayName = telegramUser?.first_name || 'Пользователь';
  const displayId = telegramUser?.id || 'не определен';
  const displayUsername = telegramUser?.username || 'не указан';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Добро пожаловать!
            </CardTitle>
            <CardDescription>
              {displayName}, введите промокод для создания нового аккаунта или войдите в существующий
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="inviterCode">Промокод партнера</Label>
              <Input
                id="inviterCode"
                type="text"
                placeholder="Введите промокод"
                value={inviterCode}
                onChange={(e) => setInviterCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono"
                disabled={validating || partnerLoading}
              />
            </div>
            <Button 
              onClick={handlePromoCodeSubmit}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
              disabled={partnerLoading || validating}
            >
              {validating ? "Проверка промокода..." : partnerLoading ? "Загрузка..." : "Создать новый аккаунт"}
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  или
                </span>
              </div>
            </div>

            <Button 
              onClick={onExistingUserLogin}
              variant="outline"
              className="w-full"
              disabled={partnerLoading || validating}
            >
              У меня уже есть аккаунт
            </Button>
            <Button 
              onClick={onNewUserNoPromo}
              variant="outline"
              className="w-full"
              disabled={partnerLoading || validating}
            >
              Я новый пользователь (без промокода)
            </Button>

            <div className="text-xs text-gray-500 text-center mt-4">
              <p>Данные пользователя:</p>
              <p>ID: {displayId}</p>
              <p>Имя: {displayName}</p>
              <p>Username: @{displayUsername}</p>
              {window.Telegram?.WebApp ? (
                <p className="text-green-600 mt-1">Telegram Web App</p>
              ) : (
                <p className="text-orange-600 mt-1">Тестовый режим</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationView;
