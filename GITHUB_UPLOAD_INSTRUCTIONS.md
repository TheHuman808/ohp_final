# ЗАГРУЗКА В GITHUB ohp_final - v30.0

## 🚀 ЗАГРУЖАЕМ ИСПРАВЛЕННЫЕ ФАЙЛЫ В https://github.com/TheHuman808/ohp_final

### 📁 Файлы для замены:

#### 1. **src/components/views/RegistrationView.tsx**
```tsx
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
```

#### 2. **src/components/views/PersonalDataView.tsx**
```tsx
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
```

#### 3. **src/components/TestAppsScriptConnection.tsx**
```tsx
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
```

#### 4. **index.html**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>OHP - Партнерская программа v30.0 ORANGE BUTTONS FIXED</title>
    <meta name="description" content="Lovable Generated Project" />
    <meta name="author" content="Lovable" />

    <meta property="og:title" content="referral-power-telegram" />
    <meta property="og:description" content="Lovable Generated Project" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@lovable_dev" />
    <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### 5. **vite.config.ts**
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/ohp/', // <-- GitHub Pages base path
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-v30.0-[hash].js`,
        chunkFileNames: `assets/[name]-v30.0-[hash].js`,
        assetFileNames: `assets/[name]-v30.0-[hash].[ext]`
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
```

#### 6. **src/App.tsx**
```tsx
import { Toaster } from "@/components/ui/toaster";
// v30.0 ULTIMATE FIX - FORCE NETLIFY UPDATE - NO SYMBOLS - SUPER RADICAL - ORANGE BUTTONS - NETLIFY READY - MAXIMUM RADICAL - FINAL FIX - GITHUB UPDATED - ORANGE CONFIRMED - FORCE PUSH - FINAL REPO - SUPER RADICAL - ARCHIVE READY - REAL CHANGES - VITE FIXED - GITHUB DIRECT
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Index />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
```

## 🚀 Как загрузить:

### 1. Зайдите на https://github.com/TheHuman808/ohp_final

### 2. Для каждого файла:
- Нажмите на файл
- Нажмите "Edit" (карандаш)
- Удалите все содержимое
- Вставьте содержимое из соответствующего блока выше
- Напишите коммит: "FIX v30.0: ORANGE BUTTONS FIXED"
- Нажмите "Commit changes"

### 3. После загрузки всех файлов:
- Подключите Netlify к репозиторию ohp_final
- Настройки: Build command: `npm run build`, Publish directory: `dist`

## ✅ Что исправлено:

### 🟠 Оранжевые кнопки:
- **RegistrationView** - кнопка "Создать новый аккаунт"
- **PersonalDataView** - кнопка "Завершить регистрацию"
- **TestAppsScriptConnection** - кнопка "Тест регистрации"

### ⬅️ Кнопка "Назад":
- **PersonalDataView** - кнопка "Назад" для возврата

### 🚫 Убраны тестовые сообщения:
- Удалены все символы ⚠ и ✓
- Убраны сообщения "Тестовые данные" и "Telegram Web App активен"

### 🔧 Исправлен Vite:
- Убран параметр `?v=28.0` из `main.tsx`
- Теперь: `<script type="module" src="/src/main.tsx"></script>`

### 📱 Версия v30.0:
- Обновлены все файлы до версии v30.0
- Заголовок: "OHP - Партнерская программа v30.0 ORANGE BUTTONS FIXED"

---
**Статус:** ГОТОВО К ЗАГРУЗКЕ В GITHUB v30.0
**Дата:** 2025-01-20
**Версия:** 30.0.0 ORANGE BUTTONS FIXED
