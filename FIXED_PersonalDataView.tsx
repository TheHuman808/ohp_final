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
}

const PersonalDataView = ({ onComplete, onBack, loading }: PersonalDataViewProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

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
    onComplete({ firstName, lastName, phone, email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">Персональные данные</CardTitle>
            <CardDescription>Заполните ваши контактные данные для завершения регистрации</CardDescription>
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
                onChange={(e) => setPhone(e.target.value)}
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
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
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
