# 🔧 Инструкция по Обновлению Frontend для i18n

## 📝 Шаблон Обновления

Для каждой страницы с `fetch()` вызовами выполни 3 шага:

### Шаг 1: Добавить импорты

```typescript
// В начало файла добавить:
import { getErrorMessage } from '@/utils/errorTranslator';

// Если уже есть useLingui, добавить i18n:
const { _, i18n } = useLingui(); // было: const { _ } = useLingui();
```

### Шаг 2: Обновить обработку ошибок

**БЫЛО:**
```typescript
if (!response.ok) {
  setError(data.message || "Какая-то ошибка");
}
```

**СТАЛО:**
```typescript
if (!response.ok) {
  // Backend возвращает: {error: 'код_ошибки'}
  const errorCode = data.error || 'common.internal_error';
  const errorMessage = i18n._(getErrorMessage(errorCode));
  setError(errorMessage);
}
```

### Шаг 3: Обработка Success Messages (если есть)

**БЫЛО:**
```typescript
if (response.ok) {
  toast.success(data.message);
}
```

**СТАЛО:**
```typescript
if (response.ok) {
  // Backend может вернуть: {message: 'код_сообщения'} или {messageCode: 'код'}
  if (data.message) {
    const successMessage = i18n._(getErrorMessage(data.message));
    toast.success(successMessage);
  }
  if (data.messageCode) {
    const successMessage = i18n._(getErrorMessage(data.messageCode));
    toast.success(successMessage);
  }
}
```

---

## 📋 Список Страниц для Обновления

### ✅ Auth Pages

#### ✅ 1. `/auth/login/page.tsx` - ГОТОВО

#### 🔄 2. `/auth/register/page.tsx`

**Backend**: `AuthController::register`

**Что возвращает:**
```php
// Успех: {message: 'auth.registration_success', emailSent: bool}
// Ошибка: {error: 'auth.field_required', field: string}
// Ошибка: {error: 'auth.email_already_exists'}
// Ошибка: {error: 'auth.registration_error'}
```

**Обновить в строках ~150:**
```typescript
if (response.ok) {
  setSuccess(true);
  // ... существующий код
} else {
  const errorCode = data.error || 'common.internal_error';
  const errorMessage = i18n._(getErrorMessage(errorCode));
  setErrors({ general: errorMessage });
}
```

---

#### 🔄 3. `/auth/forgot-password/page.tsx`

**Backend**: `AuthController::forgotPassword`

**Что возвращает:**
```php
// Успех: {message: 'auth.password_reset_success'}
// Ошибка: {error: 'auth.email_required'}
// Ошибка: {error: 'auth.user_not_found'}
// Ошибка: {error: 'auth.password_reset_error'}
```

**Обновить:**
```typescript
if (response.ok) {
  const successMessage = i18n._(getErrorMessage(data.message));
  setSuccess(successMessage);
} else {
  const errorCode = data.error || 'common.internal_error';
  const errorMessage = i18n._(getErrorMessage(errorCode));
  setErrors({ general: errorMessage });
}
```

---

### 🔄 Interview Pages

#### 4. `/interview/[token]/page.tsx`

**Backend**: `PublicInterviewController`

**Что возвращает:** (см. `BACKEND_FRONTEND_MAPPING.md`)
```php
// {error: 'candidate.not_found'}
// {error: 'interview.finished'}
// {error: 'interview.file_too_large'}
// ... и т.д.
```

**Обновить все fetch вызовы:**
```typescript
// Для /prepare, /start, /next, /answer endpoints:
if (!response.ok) {
  const errorCode = data.error || 'common.internal_error';
  const errorMessage = i18n._(getErrorMessage(errorCode));
  setError(errorMessage);
}
```

---

#### 5. `/interview/apply/[token]/page.tsx`

**Backend**: `PublicApplyController`

**Что возвращает:**
```php
// Успех: {title, description, company}
// Ошибка: {error: 'vacancy.not_found'}
// Ошибка: {error: 'candidate.name_and_phone_required'}
```

---

### 🔄 HR Pages

#### 6. `/hr/candidates/[id]/page.tsx`

**Backend**: `AdminCandidateController`

**Множество endpoint'ов:**
- `evaluate`: `{error: 'candidate.not_found'}`
- `compare`: `{error: 'candidate.invalid_ids_for_comparison'}`
- `uploadResume`: `{success: true, message: 'candidate.resume_saved'}`

**Каждый fetch нужно обновлять отдельно!**

---

#### 7. `/hr/vacancies/[id]/...`

**Backend**: `AdminVacancyController`

**Что возвращает:**
```php
// {error: 'vacancy.not_found'}
// {error: 'candidate.status_required'}
// {error: 'candidate.does_not_belong_to_vacancy'}
```

---

#### 8. `/hr/settings/hh-integration/page.tsx`

**Backend**: `HhIntegrationController`

**ВАЖНО! Специальный формат:**
```php
// Ошибка: {success: false, error: 'hh.token_not_found'}
// Успех: {success: true, messageCode: 'hh.vacancies_synced'}
```

**Обновить:**
```typescript
const data = await response.json();

if (!response.ok || data.success === false) {
  const errorCode = data.error || 'common.internal_error';
  const errorMessage = i18n._(getErrorMessage(errorCode));
  setError(errorMessage);
}

if (data.success && data.messageCode) {
  const successMessage = i18n._(getErrorMessage(data.messageCode));
  toast.success(successMessage);
}
```

---

#### 9. `/hr/employees/page.tsx`

**Backend**: `CompanyController`

**Что возвращает:**
```php
// {error: 'company.name_required'}
// {error: 'common.forbidden'}
// {error: 'company.invite_not_found'}
```

---

#### 10. `/test/[token]/page.tsx`

**Backend**: `RegulationTestPublicController`

**Что возвращает:**
```php
// {error: 'regulation_test.invitation_not_found'}
// {error: 'regulation_test.invitation_expired'}
// {error: 'regulation_test.insufficient_balance'}
```

---

## 🎯 Быстрая Проверка

После обновления каждой страницы:

1. ✅ Добавлен импорт `getErrorMessage`
2. ✅ Добавлен `i18n` в `useLingui()`
3. ✅ Все `data.message` заменены на `i18n._(getErrorMessage(data.error))`
4. ✅ Учтена структура ответа от backend (см. `BACKEND_FRONTEND_MAPPING.md`)

---

## 💡 Полезные Команды

После всех изменений:

```bash
cd recruitment-front
npm run extract  # Извлечь все тексты для LingUI
npm run compile  # Скомпилировать переводы
```

---

## 📚 Справочные Документы

- `BACKEND_FRONTEND_MAPPING.md` - все форматы ответов от backend
- `ErrorCode.php` - все коды ошибок на backend
- `errorTranslator.tsx` - все переводы кодов

---

**Дата**: 3 декабря 2025  
**Статус**: Login готов, остальные - по инструкции выше







