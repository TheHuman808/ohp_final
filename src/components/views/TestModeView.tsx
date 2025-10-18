import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TelegramUser } from "@/types/telegram";

interface TestModeViewProps {
  onUserSet: (user: TelegramUser) => void;
  onCancel: () => void;
}

const TestModeView = ({ onUserSet, onCancel }: TestModeViewProps) => {
  const [testUser, setTestUser] = useState<TelegramUser>({
    id: 123456789,
    first_name: 'Test',
    last_name: 'User',
    username: 'testuser',
    language_code: 'ru'
  });

  const handleSetUser = () => {
    onUserSet(testUser);
  };

  const handleRandomUser = () => {
    const randomId = Math.floor(Math.random() * 1000000000);
    const names = ['Алексей', 'Мария', 'Дмитрий', 'Анна', 'Сергей', 'Елена'];
    const surnames = ['Иванов', 'Петрова', 'Сидоров', 'Козлова', 'Смирнов', 'Васильева'];
    const usernames = ['alexey123', 'maria_k', 'dmitry_s', 'anna_p', 'sergey_m', 'elena_v'];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)];
    const randomUsername = usernames[Math.floor(Math.random() * usernames.length)];
    
    setTestUser({
      id: randomId,
      first_name: randomName,
      last_name: randomSurname,
      username: randomUsername,
      language_code: 'ru'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto pt-20">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              🧪 Тестовый режим
            </CardTitle>
            <CardDescription>
              Настройте тестового пользователя для разработки
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Telegram ID</label>
                <Input
                  type="number"
                  value={testUser.id}
                  onChange={(e) => setTestUser(prev => ({ ...prev, id: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Имя</label>
                <Input
                  value={testUser.first_name}
                  onChange={(e) => setTestUser(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Фамилия</label>
                <Input
                  value={testUser.last_name || ''}
                  onChange={(e) => setTestUser(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={testUser.username || ''}
                  onChange={(e) => setTestUser(prev => ({ ...prev, username: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Язык</label>
                <Input
                  value={testUser.language_code || ''}
                  onChange={(e) => setTestUser(prev => ({ ...prev, language_code: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleSetUser}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Использовать этого пользователя
              </Button>
              
              <Button 
                onClick={handleRandomUser}
                variant="outline"
                className="w-full"
              >
                Сгенерировать случайного пользователя
              </Button>
              
              <Button 
                onClick={onCancel}
                variant="ghost"
                className="w-full"
              >
                Отмена
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>💡 Этот режим только для разработки</p>
              <p>В реальном Telegram данные будут получены автоматически</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestModeView;
