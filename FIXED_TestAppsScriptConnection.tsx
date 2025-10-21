import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { googleSheetsService } from '@/services/googleSheetsService';
import { useToast } from '@/hooks/use-toast';

const TestAppsScriptConnection: React.FC = () => {
  const [testTelegramId, setTestTelegramId] = useState('test_user_123');
  const [testFirstName, setTestFirstName] = useState('Тест');
  const [testLastName, setTestLastName] = useState('Пользователь');
  const [testPhone, setTestPhone] = useState('79999999999');
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testInviterCode, setTestInviterCode] = useState('TEST123');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const { toast } = useToast();

  const envWebAppUrl = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL;
  const envSheetsId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
  const envApiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;

  const testRegistration = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await googleSheetsService.registerPartner({
        telegramId: testTelegramId,
        firstName: testFirstName,
        lastName: testLastName,
        phone: testPhone,
        email: testEmail,
        inviterCode: testInviterCode,
      });

      if (result.success) {
        setTestResult(`Успех: ${JSON.stringify(result.promoCode)}`);
        toast({
          title: "Успех",
          description: `Регистрация тестового пользователя ${testTelegramId} прошла успешно.`,
        });
      } else {
        setTestResult(`Ошибка: ${result.error}`);
        toast({
          title: "Ошибка",
          description: `Ошибка регистрации тестового пользователя: ${result.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setTestResult(`Исключение: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Критическая ошибка",
        description: `Произошла непредвиденная ошибка: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Тест Google Apps Script Connection</CardTitle>
          <CardDescription>
            Проверка подключения к Google Apps Script и регистрация тестового партнера.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Статус переменных окружения:</h3>
            <div className="text-sm space-y-1">
              <div className={envWebAppUrl ? 'text-green-700' : 'text-orange-600'}>
                <strong>VITE_GOOGLE_APPS_SCRIPT_URL:</strong> 
                {envWebAppUrl ? ' Установлена из ENV' : ' Используется fallback'}
              </div>
              <div className={envSheetsId ? 'text-green-700' : 'text-orange-600'}>
                <strong>VITE_GOOGLE_SHEETS_ID:</strong> 
                {envSheetsId ? ' Установлена из ENV' : ' Используется fallback'}
              </div>
              <div className={envApiKey ? 'text-green-700' : 'text-orange-600'}>
                <strong>VITE_GOOGLE_SHEETS_API_KEY:</strong> 
                {envApiKey ? ' Установлена из ENV' : ' Используется fallback'}
              </div>
            </div>
          </div>

          {/* Показываем используемые значения */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Используемые значения:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Web App URL:</strong> {googleSheetsService['webAppUrl']}</p>
              <p><strong>Spreadsheet ID:</strong> {googleSheetsService['spreadsheetId']}</p>
              <p><strong>API Key (для чтения):</strong> {googleSheetsService['apiKey'] ? `${googleSheetsService['apiKey'].substring(0, 5)}...` : 'Не установлен'}</p>
            </div>
          </div>

          <h3 className="font-semibold text-gray-800">Тестовая регистрация партнера:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testTelegramId">Telegram ID</Label>
              <Input id="testTelegramId" value={testTelegramId} onChange={(e) => setTestTelegramId(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="testFirstName">Имя</Label>
              <Input id="testFirstName" value={testFirstName} onChange={(e) => setTestFirstName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="testLastName">Фамилия</Label>
              <Input id="testLastName" value={testLastName} onChange={(e) => setTestLastName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="testPhone">Телефон</Label>
              <Input id="testPhone" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="testEmail">Email</Label>
              <Input id="testEmail" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="testInviterCode">Промокод пригласившего</Label>
              <Input id="testInviterCode" value={testInviterCode} onChange={(e) => setTestInviterCode(e.target.value)} />
            </div>
          </div>
          <Button 
            onClick={testRegistration}
            disabled={testing}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold"
          >
            {testing ? "Тестируем..." : "Тест регистрации"}
          </Button>
          {testResult && (
            <div className={`p-3 rounded-md ${testResult.startsWith('Успех') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <strong>Результат:</strong> {testResult}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestAppsScriptConnection;
