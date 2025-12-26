# 🔴 Система отслеживания ошибок Frontend → Telegram

## 📋 Что реализовано

Минималистичная система без БД, которая отправляет ошибки фронтенда прямо в ваш Telegram через существующий бот.

### Компоненты

1. **Frontend**: `src/utils/errorReporter.ts` - отлавливает ошибки
2. **Backend**: `src/Controller/Public/FrontendErrorController.php` - принимает отчёты
3. **Service**: `AdminNotificationService::notifyFrontendError()` - отправляет в Telegram

---

## 🚀 Как это работает

```
Frontend Error → fetch() → Backend API → AdminNotificationService → Telegram
```

**Автоматически отлавливаются:**
- ✅ Необработанные исключения (`window.error`)
- ✅ Отклонённые Promise (`unhandledrejection`)
- ✅ Все глобальные ошибки

**Отправляется в Telegram:**
- Текст ошибки
- URL страницы
- User Agent (браузер)
- Stack trace (первые 3 строки)
- Контекст пользователя (если залогинен)
- ID компании (если выбрана)

---

## 📦 Установка (Уже готово!)

### ✅ Backend

1. **Сервис обновлён**: `AdminNotificationService::notifyFrontendError()`
2. **Контроллер создан**: `FrontendErrorController.php`
3. **Endpoint**: `POST /api/public/report-error` (публичный, без авторизации)

### ✅ Frontend

1. **Утилита создана**: `src/utils/errorReporter.ts`
2. **Инициализация**: автоматически в `app.tsx`

---

## 🎯 Как использовать

### Автоматическое отслеживание (Уже работает!)

Все необработанные ошибки автоматически отправляются в Telegram.

```typescript
// Это упадёт и автоматически отправится в Telegram
someUndefinedFunction();

// Это тоже
fetch('/api/broken').then(() => someError());
```

### Ручная отправка ошибок

```typescript
import { reportError } from '@/utils/errorReporter';

try {
  // Ваш код
  dangerousOperation();
} catch (error) {
  if (error instanceof Error) {
    reportError(error, {
      operation: 'dangerousOperation',
      customData: 'some context',
    });
  }
}
```

### Обёртка для функций

```typescript
import { withErrorReport, withErrorReportAsync } from '@/utils/errorReporter';

// Синхронная
const result = withErrorReport(() => {
  return riskyCalculation();
}, { context: 'calculation' });

// Асинхронная
const data = await withErrorReportAsync(async () => {
  return await fetch('/api/data');
}, { context: 'api_call' });
```

---

## 📱 Пример сообщения в Telegram

```
🔴 Frontend Error

❌ Ошибка: Cannot read property 'map' of undefined
🌐 URL: https://sofihr.ru/hr/candidates
🖥️ Browser: Mozilla/5.0 (Windows NT 10.0; Win64; x64)...
👤 Пользователь: user@example.com
🏢 Компания: #42

📍 Stack:
TypeError: Cannot read property 'map' of undefined
    at CandidatesList.tsx:45:12
    at Array.map (native)

🕐 05.12.2024 15:23:45
```

---

## ⚙️ Конфигурация

### Backend (.env)

Используются существующие переменные:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_GROUP_CHAT_ID=your_chat_id
APP_ENV=prod  # Уведомления работают только в prod
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_RECRUITMENT_API=https://api.sofihr.ru
```

---

## 🎛️ Управление

### Отключить в DEV

Система автоматически отключена в `dev` окружении (через `APP_ENV`).

Если хотите тестировать локально, временно измените в `.env`:

```env
APP_ENV=prod  # Временно для тестирования
```

### Отключить на Frontend

Закомментируйте в `app.tsx`:

```typescript
// useEffect(() => {
//   initErrorReporter();
// }, []);
```

### Фильтрация ошибок

Можно добавить фильтры в `errorReporter.ts`:

```typescript
// Игнорировать определённые ошибки
const IGNORED_ERRORS = [
  'ResizeObserver loop limit exceeded',
  'Non-Error promise rejection captured',
];

function shouldIgnoreError(message: string): boolean {
  return IGNORED_ERRORS.some(ignored => message.includes(ignored));
}

// В reportError:
export async function reportError(error: Error, ...): Promise<void> {
  if (shouldIgnoreError(error.message)) {
    return; // Не отправляем
  }
  // ...
}
```

---

## 🧪 Тестирование

### 1. Создать тестовую страницу

```typescript
// src/app/test-error/page.tsx
'use client';

export default function TestError() {
  const testError = () => {
    throw new Error('🧪 Test Frontend Error');
  };

  return (
    <div>
      <h1>Test Error Reporter</h1>
      <button onClick={testError}>
        Throw Test Error
      </button>
    </div>
  );
}
```

### 2. Нажать кнопку

Ошибка должна прилететь в Telegram через несколько секунд!

### 3. Проверить логи

**Backend**:
```bash
tail -f var/log/dev.log | grep "Frontend error"
```

**Frontend**:
Откройте Console → должно быть `✅ Error reporter initialized`

---

## 📊 Что отслеживается

| Тип ошибки | Отслеживается | Примечание |
|-----------|--------------|------------|
| JavaScript exceptions | ✅ | Автоматически |
| Unhandled Promise rejections | ✅ | Автоматически |
| API errors (4xx/5xx) | ❌ | Нужно добавлять вручную |
| Network errors | ✅ | Если приводят к exception |
| React errors | ⚠️ | Частично (нужен Error Boundary) |

---

## 🎯 Дополнительные возможности

### React Error Boundary (Опционально)

Для отлова ошибок в React компонентах:

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import React from 'react';
import { reportError } from '@/utils/errorReporter';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    reportError(error, {
      react: true,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h2>Что-то пошло не так</h2>
          <button onClick={() => window.location.reload()}>
            Перезагрузить страницу
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Использование:

```typescript
// В layout или page
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Отслеживание API ошибок

Добавьте в `apiFetch`:

```typescript
// src/utils/api.ts
import { reportError } from './errorReporter';

export async function apiFetch(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = new Error(`API Error: ${response.status}`);
      reportError(error, {
        api: true,
        url,
        status: response.status,
      });
    }
    
    return response;
  } catch (error) {
    if (error instanceof Error) {
      reportError(error, {
        api: true,
        url,
        network: true,
      });
    }
    throw error;
  }
}
```

---

## 📈 Статистика

Если нужна статистика ошибок, можно позже добавить:
- Счётчик в Redis (сколько ошибок сегодня)
- Группировку одинаковых ошибок
- Rate limiting (не больше N ошибок от одного пользователя)

Но пока это не нужно! 🎯

---

## ✅ Готово к использованию!

Система уже работает! Просто:

1. ✅ Убедитесь что `TELEGRAM_BOT_TOKEN` и `TELEGRAM_GROUP_CHAT_ID` в `.env`
2. ✅ Убедитесь что `APP_ENV=prod` на проде
3. ✅ Деплойте обновления
4. ✅ Все ошибки будут лететь в Telegram!

---

**Минимум кода, максимум пользы!** 🚀







