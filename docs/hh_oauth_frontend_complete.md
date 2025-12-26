# HH OAuth Implementation - Frontend Complete ✅

## Что реализовано

### Модульная архитектура

```
recruitment-front/src/
├── types/
│   └── hhOAuth.ts                      ✅ Типы и ошибки
├── utils/
│   └── hhOAuth.ts                      ✅ Утилиты (initiateHhOAuth, tokens)
├── components/auth/
│   ├── HhLoginButton.tsx               ✅ Кнопка "Войти через HH"
│   ├── HhOAuthErrorAlert.tsx           ✅ Обработка ошибок
│   └── README.md                       ✅ Документация компонентов
└── app/
    └── auth/
        ├── login/page.tsx              ✅ Обновлена (добавлена кнопка HH)
        └── callback/page.tsx           ✅ Обработка OAuth callback
```

## Компоненты (изолированные!)

### 1. `HhLoginButton` - кнопка входа

**Файл:** `src/components/auth/HhLoginButton.tsx`

**Что делает:**
- Красная кнопка с логотипом HH
- Клик → `initiateHhOAuth()` → редирект на backend
- Полностью настраиваемая (variant, size, fullWidth, sx)

**Использование:**
```tsx
import HhLoginButton from '@/components/auth/HhLoginButton';

<HhLoginButton />
```

**Стилизация:**
- Цвет HH: #D6001C (красный)
- Hover: #B00017 (темнее)
- Логотип HH встроен как SVG
- Material-UI совместимость

### 2. `HhOAuthErrorAlert` - обработка ошибок

**Файл:** `src/components/auth/HhOAuthErrorAlert.tsx`

**Что делает:**
- Показывает красивые Alert'ы для ошибок OAuth
- Специальная обработка `email_not_verified`:
  - Инструкция по шагам
  - Кнопка "Отправить письмо повторно"
  - Warning severity (жёлтый)

**Использование:**
```tsx
import HhOAuthErrorAlert from '@/components/auth/HhOAuthErrorAlert';

const error = searchParams.get('error');
const email = searchParams.get('email');

<HhOAuthErrorAlert error={error} email={email} />
```

### 3. Callback страница

**Файл:** `src/app/auth/callback/page.tsx`

**Что делает:**
1. Получает `token` из URL параметров
2. Сохраняет в `localStorage`
3. Редиректит на `/hr/dashboard`

**Или при ошибке:**
1. Получает `error` и `email` из URL
2. Редиректит на `/auth/login?error=...&email=...`

**Особенности:**
- Suspense boundary для безопасного `useSearchParams`
- Loading state с spinner
- Автоматический fallback на login при таймауте

### 4. Типы (TypeScript)

**Файл:** `src/types/hhOAuth.ts`

**Экспорты:**
```typescript
type HhOAuthError = 
  | 'hh_access_denied'
  | 'hh_no_code'
  | 'email_not_verified'
  // ... и другие

const HH_OAUTH_ERROR_MESSAGES: Record<HhOAuthError, { title, message }>

function isHhOAuthError(error): error is HhOAuthError
function getHhOAuthErrorMessage(error): { title, message }
```

### 5. Утилиты

**Файл:** `src/utils/hhOAuth.ts`

**Функции:**
```typescript
initiateHhOAuth()      // Начать OAuth flow
saveAuthToken(token)   // Сохранить JWT
getAuthToken()         // Получить JWT
removeAuthToken()      // Удалить JWT
isAuthenticated()      // Проверка авторизации
```

## UI/UX Flow

### Страница входа `/auth/login`

```
┌─────────────────────────────────────┐
│  🔵 Вход в систему                  │
│  Войдите в свой аккаунт SofiHR     │
├─────────────────────────────────────┤
│                                      │
│  [Ошибка OAuth если есть]           │ ← HhOAuthErrorAlert
│                                      │
│  [🔴 Войти через HeadHunter]        │ ← HhLoginButton
│                                      │
│          ─── или ───                │
│                                      │
│  Email: [__________________]        │
│  Пароль: [__________________]       │
│  [Войти]                            │
│                                      │
│  Забыли пароль?                     │
│  Нет аккаунта? Зарегистрироваться   │
└─────────────────────────────────────┘
```

### Callback обработка `/auth/callback`

```
┌─────────────────────────────────────┐
│         🔄 Spinner                  │
│                                      │
│  Завершаем авторизацию...           │
│  Подождите, мы перенаправляем вас   │
│                                      │
│  [ℹ️ Если не перенаправило...]      │
└─────────────────────────────────────┘
```

### Ошибка: email не подтверждён

```
┌─────────────────────────────────────┐
│  ⚠️ Email не подтверждён            │
├─────────────────────────────────────┤
│  Ваш email ivan@company.ru ещё не   │
│  подтверждён.                       │
│                                      │
│  Для объединения с HH:              │
│  1. Проверьте почту                 │
│  2. Перейдите по ссылке             │
│  3. Попробуйте войти через HH снова │
│                                      │
│  [Отправить письмо повторно]        │
└─────────────────────────────────────┘
```

## Сценарии

### Сценарий 1: Новый пользователь

```
1. User открывает /auth/login
2. Клик "Войти через HeadHunter"
   → initiateHhOAuth()
   → window.location = "recruitment.test/api/auth/hh"
3. Backend редиректит на hh.ru
4. HH.ru: авторизация → разрешение доступа
5. Redirect на recruitment.test/api/auth/hh/callback?code=xxx
6. Backend: создаёт User → генерирует JWT
7. Redirect на sofihr.ru/auth/callback?token=JWT
8. Frontend: saveAuthToken(JWT) → redirect на /hr/dashboard
9. ✅ User вошёл!
```

**Время:** ~10-15 секунд

### Сценарий 2: Email не подтверждён

```
1. User клик "Войти через HH"
2. Backend находит аккаунт с email (emailVerified=false)
3. Backend отменяет OAuth
4. Redirect на /auth/login?error=email_not_verified&email=ivan@test.ru
5. Frontend показывает warning с инструкциями
6. User подтверждает email
7. Попытка снова → успех ✅
```

### Сценарий 3: Повторный вход

```
1. User клик "Войти через HH"
2. HH.ru моментально редиректит (уже разрешено)
3. Backend находит HhOAuthAccount → User
4. Генерирует JWT → redirect
5. Frontend: сохраняет JWT → вход
6. ✅ Вошёл за ~3 секунды!
```

## Безопасность

### CSRF Protection
- Backend генерирует `state` и сохраняет в session
- HH.ru возвращает `state` обратно
- Backend проверяет совпадение

### Token хранение
```typescript
// localStorage - простой доступ
localStorage.setItem('jwt_token', token);

// Автоматически добавляется в headers через apiFetch
```

### Обработка ошибок
- Все ошибки типизированы
- Type guards для безопасности
- Graceful degradation

## Локализация

Все тексты обёрнуты в `<Trans>`:
```tsx
<Trans>Войти через HeadHunter</Trans>
<Trans>или</Trans>
<Trans>Email не подтверждён</Trans>
```

После добавления текстов запустить:
```bash
npm run extract  # Извлечь строки
npm run compile  # Скомпилировать
```

## Тестирование

### Локально

1. Добавить в `.env.local`:
```bash
NEXT_PUBLIC_RECRUITMENT_API=http://recruitment.test
```

2. Запустить dev server:
```bash
npm run dev
```

3. Открыть: http://localhost:3000/auth/login

4. Кликнуть "Войти через HeadHunter"

### Проверка компонентов

```tsx
// Тест кнопки
<HhLoginButton variant="contained" size="medium" />

// Тест ошибок
<HhOAuthErrorAlert error="hh_access_denied" />
<HhOAuthErrorAlert error="email_not_verified" email="test@test.ru" />

// Тест callback
// URL: /auth/callback?token=fake_jwt_token
// Должен сохранить токен и редирект
```

## Что НЕ требуется

❌ Дополнительные API запросы - всё через redirect  
❌ State management (Redux/Zustand) - достаточно localStorage  
❌ Сложная валидация - backend всё проверяет  

## Следующие шаги

### После деплоя backend:

1. Зарегистрировать приложение на https://dev.hh.ru/admin
2. Добавить redirect URI: `https://api.sofihr.ru/api/auth/hh/callback`
3. Получить Client ID и Secret
4. Добавить в backend `.env`
5. Запустить миграции на production
6. Протестировать OAuth flow

### Дополнительные фичи (опционально):

- Кнопка "Связать HH" в настройках профиля
- Индикация связанного HH аккаунта
- Синхронизация данных с HH
- Автоимпорт вакансий после входа

## Документация

- `components/auth/README.md` - документация компонентов
- Backend: `docs/hh_oauth_backend_complete.md`
- Концепция: `docs/hh_oauth_integration.md`

---

**Frontend полностью готов! Модульно, типизировано, документировано!** 🚀


