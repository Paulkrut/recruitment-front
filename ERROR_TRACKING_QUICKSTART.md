# 🔴 Error Tracking - Quick Start

## ✅ Что сделано

### Backend
- ✅ `AdminNotificationService::notifyFrontendError()` - новый метод
- ✅ `FrontendErrorController.php` - endpoint `/api/public/report-error`

### Frontend
- ✅ `src/utils/errorReporter.ts` - система отлова ошибок
- ✅ `src/app/app.tsx` - автоматическая инициализация

---

## 🚀 Как работает

```
Frontend Error → API → Telegram
```

**Автоматически:**
- Все необработанные JavaScript ошибки → Telegram
- Все необработанные Promise rejections → Telegram

---

## 🧪 Тест (5 минут)

### 1. Проверь .env на беке

```env
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_GROUP_CHAT_ID=your_chat_id
APP_ENV=prod  # Важно для прода!
```

### 2. Создай тестовую страницу

```typescript
// recruitment-front/src/app/test-error/page.tsx
'use client';

export default function TestError() {
  return (
    <button onClick={() => {
      throw new Error('🧪 Test Error');
    }}>
      Test Error Tracking
    </button>
  );
}
```

### 3. Перейди на `/test-error` и нажми кнопку

### 4. Проверь Telegram

Должно прийти:
```
🔴 Frontend Error

❌ Ошибка: 🧪 Test Error
🌐 URL: https://yourdomain.com/test-error
🖥️ Browser: Chrome...
🕐 05.12.2024 15:30:00
```

---

## 📱 Использование

### Автоматически (уже работает)
```typescript
// Просто пишите код - все ошибки отправятся сами
someFunction();
```

### Вручную
```typescript
import { reportError } from '@/utils/errorReporter';

try {
  riskyOperation();
} catch (e) {
  if (e instanceof Error) {
    reportError(e, { context: 'my_operation' });
  }
}
```

---

## 🎛️ Управление

**Отключить в dev**: уже отключено автоматически (`APP_ENV=dev`)

**Тестировать локально**: временно поставь `APP_ENV=prod` в `.env`

**Отключить совсем**: закомментируй `initErrorReporter()` в `app.tsx`

---

## 📋 Checklist для деплоя

- [ ] Backend: `AdminNotificationService.php` обновлён
- [ ] Backend: `FrontendErrorController.php` создан
- [ ] Frontend: `errorReporter.ts` создан
- [ ] Frontend: `app.tsx` обновлён
- [ ] `.env`: `TELEGRAM_BOT_TOKEN` и `TELEGRAM_GROUP_CHAT_ID` заполнены
- [ ] `.env`: `APP_ENV=prod` на проде
- [ ] Протестировано на dev/staging
- [ ] Задеплоено на prod

---

## 🎉 Готово!

Минимум кода, все работает из коробки! 

Полная документация: `ERROR_TRACKING_GUIDE.md`







