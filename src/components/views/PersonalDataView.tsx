
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PersonalDataViewProps {
  onComplete: (data: { firstName: string; lastName: string; phone: string; email: string }) => void;
  onBack?: () => void; // Добавляем опциональный проп для кнопки "Назад"
  loading: boolean;
  telegramUser?: { first_name: string; username?: string } | null; // Добавляем данные Telegram пользователя
}

const PersonalDataView = ({ onComplete, onBack, loading, telegramUser }: PersonalDataViewProps) => {
  const [firstName, setFirstName] = useState(telegramUser?.first_name || "");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const formatPhoneNumber = (value: string) => {
    // Удаляем все нецифровые символы кроме +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Если начинается не с +7, добавляем +7
    if (!cleaned.startsWith('+7')) {
      if (cleaned.startsWith('7')) {
        return '+7' + cleaned.slice(1);
      } else if (cleaned.startsWith('8')) {
        return '+7' + cleaned.slice(1);
      } else if (cleaned.startsWith('+')) {
        return '+7' + cleaned.slice(1);
      } else {
        return '+7' + cleaned;
      }
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = () => {
    console.log('=== PERSONAL DATA SUBMIT ===');
    console.log('Form data:', { firstName, lastName, phone, email });

    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все поля",
        variant: "destructive"
      });
      return;
    }

    // Простая валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Ошибка",
        description: "Введите корректный email адрес",
        variant: "destructive"
      });
      return;
    }

    // Валидация российского телефона
    const phoneRegex = /^\+7\d{10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      toast({
        title: "Ошибка",
        description: "Введите корректный российский номер телефона (+7XXXXXXXXXX)",
        variant: "destructive"
      });
      return;
    }

    console.log('Validation passed, submitting data...');
    onComplete({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
      email: email.trim()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Персональные данные
            </CardTitle>
            <CardDescription>
              Заполните ваши контактные данные для завершения регистрации
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="firstName">Имя *</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Введите ваше имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Фамилия *</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Введите вашу фамилию"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="phone">Номер телефона *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+7 (999) 123-45-67"
                value={phone}
                onChange={handlePhoneChange}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
              disabled={loading}
            >
              {loading ? "Регистрация..." : "Завершить регистрацию"}
            </Button>
            
            {onBack && (
              <Button 
                onClick={onBack}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                Назад
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalDataView;
