# Auth Components

Модульные компоненты для аутентификации и авторизации.

## Компоненты

### `HhLoginButton`

Кнопка "Войти через HeadHunter" для OAuth авторизации.

**Использование:**
```tsx
import HhLoginButton from '@/components/auth/HhLoginButton';

<HhLoginButton 
  variant="outlined"  // или "contained"
  size="large"
  fullWidth={true}
/>
```

**Props:**
- `variant` - вариант кнопки (outlined/contained)
- `size` - размер (small/medium/large)
- `fullWidth` - на всю ширину
- `sx` - дополнительные стили

**Особенности:**
- Автоматически редиректит на backend OAuth endpoint
- Красный цвет HH (#D6001C)
- Логотип HH встроен как SVG
- Полностью изолирован - импортируй и используй

### `HhOAuthErrorAlert`

Отображение ошибок OAuth авторизации.

**Использование:**
```tsx
import HhOAuthErrorAlert from '@/components/auth/HhOAuthErrorAlert';

const searchParams = useSearchParams();
const error = searchParams.get('error');
const email = searchParams.get('email');

<HhOAuthErrorAlert error={error} email={email} />
```

**Props:**
- `error` - код ошибки из URL параметра
- `email` - email из URL (для ошибки email_not_verified)

**Поддерживаемые ошибки:**
- `hh_access_denied` - пользователь отклонил доступ
- `hh_no_code` - не получен код авторизации
- `hh_invalid_state` - CSRF ошибка
- `hh_init_failed` - ошибка инициализации
- `hh_callback_failed` - ошибка в callback
- `email_not_verified` - email не подтверждён (особая обработка)

**Особенности:**
- Автоматически скрывается если ошибки нет
- Специальное форматирование для email_not_verified
- Кнопка "Отправить письмо повторно" для неподтверждённых email
- Типы ошибок определены inline (без отдельного файла)
- Локализация готова

## Структура

```
recruitment-front/src/
├── components/auth/
│   ├── HhLoginButton.tsx          # Кнопка "Войти через HH"
│   ├── HhOAuthErrorAlert.tsx      # Алерты ошибок OAuth
│   └── README.md                  # Эта документация
└── app/
    ├── auth/login/page.tsx        # Страница входа (использует компоненты)
    └── hr/hh-redirect/page.tsx    # Обработка OAuth callback
```

**Важно:**
- Frontend работает только с **нашим JWT токеном** (SofiHR)
- HH токены хранятся **только на backend**
- OAuth callback: `/hr/hh-redirect?code=...&type=oauth`

## Интеграция

### Страница входа (`/auth/login`)

```tsx
import HhLoginButton from '@/components/auth/HhLoginButton';
import HhOAuthErrorAlert from '@/components/auth/HhOAuthErrorAlert';

// Получаем ошибки из URL
const searchParams = useSearchParams();
const hhError = searchParams.get('error');
const hhEmail = searchParams.get('email');

// Отображаем
<HhOAuthErrorAlert error={hhError} email={hhEmail} />
<HhLoginButton />
```

### Callback страница (`/hr/hh-redirect`)

Автоматически:
1. Получает `code` и `state` из URL
2. Вызывает backend `/api/auth/hh/callback`
3. Получает **наш JWT токен** от backend
4. Сохраняет в `localStorage.recruitment_token`
5. Редиректит на `/hr/`

Или если ошибка:
1. Получает `error` из URL
2. Редиректит на `/auth/login?error=...`

**Важно:** Backend возвращает НАШ JWT токен, а не HH токен!

## Тестирование

```tsx
// Тест кнопки HH
<HhLoginButton />
// Клик → должен редирект на recruitment.test/api/auth/hh

// Тест ошибок
<HhOAuthErrorAlert error="email_not_verified" email="test@test.ru" />
// Должен показать warning с инструкциями

// Тест callback
// Открыть: /hr/hh-redirect?code=xxx&state=yyy&type=oauth
// Должен:
// 1. Вызвать backend /api/auth/hh/callback
// 2. Сохранить recruitment_token
// 3. Редирект на /hr/
```

## Стилизация

Все компоненты используют Material-UI theme:
- Цвета из palette
- Типография из theme
- Responsive spacing
- Доступность (a11y)

