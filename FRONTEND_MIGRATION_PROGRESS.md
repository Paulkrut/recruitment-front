# 🔄 Frontend Migration Progress

## Метод Работы

Для каждой страницы:
1. Находим все `fetch()` вызовы
2. Смотрим на Backend что **КОНКРЕТНО** возвращается
3. Обновляем обработку **под конкретную структуру**

❌ **НЕ делаем**: универсальную функцию  
✅ **Делаем**: точечные изменения под каждый endpoint

---

## Auth Pages

### ✅ `/auth/login/page.tsx` - DONE
**Backend**: `AuthController::login`
```php
// Успех: {token: string}
// Ошибка: {error: 'auth.email_and_password_required'} 400
// Ошибка: {error: 'auth.invalid_credentials'} 401
```

**Изменения:**
- Импортирован `getErrorMessage`
- Добавлен `i18n` из `useLingui()`
- Обработка: `const errorMessage = i18n._(getErrorMessage(data.error))`

---

### ⏳ `/auth/register/page.tsx` - TODO
**Backend**: `AuthController::register`
```php
// Успех: {message: 'auth.registration_success', emailSent: bool}
// Ошибка: {error: 'auth.field_required', field: string} 400
// Ошибка: {error: 'auth.email_already_exists'} 400
// Ошибка: {error: 'auth.registration_error'} 500
```

---

### ⏳ `/auth/forgot-password/page.tsx` - TODO
**Backend**: `AuthController::forgotPassword`
```php
// Успех: {message: 'auth.password_reset_success'}
// Ошибка: {error: 'auth.email_required'} 400
// Ошибка: {error: 'auth.user_not_found'} 404
// Ошибка: {error: 'auth.email_send_failed'} 500
// Ошибка: {error: 'auth.password_reset_error'} 500
```

---

## Interview Pages

### ⏳ `/interview/[token]/page.tsx` - TODO
**Backend**: `PublicInterviewController`
```php
// Ошибка: {error: 'candidate.not_found'} 404
// Ошибка: {error: 'candidate.does_not_belong_to_vacancy'} 400
// Ошибка: {error: 'common.template_not_found'} 400
// Ошибка: {error: 'interview.finished'} 400
// Ошибка: {error: 'interview.not_started'} 404
// Ошибка: {error: 'interview.file_too_large'} 400
// ... и т.д. (смотри BACKEND_FRONTEND_MAPPING.md)
```

---

### ⏳ `/interview/apply/[token]/page.tsx` - TODO
**Backend**: `PublicApplyController`
```php
// Успех: {title, description, company}
// Ошибка: {error: 'vacancy.not_found'} 404
// Ошибка: {error: 'candidate.name_and_phone_required'} 400
```

---

## HR Pages

### ⏳ `/hr/candidates/[id]/page.tsx` - TODO
**Backend**: `AdminCandidateController`
```php
// Множество endpoint'ов:
// - evaluate: {error: 'candidate.not_found'}
// - compare: {error: 'candidate.invalid_ids_for_comparison'}
// - uploadResume: {success: true, message: 'candidate.resume_saved'}
// ... и т.д.
```

---

### ⏳ `/hr/vacancies/[id]/...` - TODO
**Backend**: `AdminVacancyController`
```php
// Много endpoint'ов с разными форматами
```

---

### ⏳ `/hr/settings/hh-integration/page.tsx` - TODO
**Backend**: `HhIntegrationController`
```php
// Формат: {success: false, error: 'code'} или {success: true, messageCode: 'code'}
```

---

### ⏳ `/hr/employees/page.tsx` - TODO
**Backend**: `CompanyController`
```php
// Ошибки: {error: 'code'}
```

---

## Test Pages

### ⏳ `/test/[token]/page.tsx` - TODO
**Backend**: `RegulationTestPublicController`
```php
// Ошибки: {error: 'regulation_test.invitation_not_found'} etc.
```

---

## Прогресс

**Завершено**: 1 / ~10 страниц (10%)

**Следующие**: register, forgot-password, interview pages

---

**Дата**: 3 декабря 2025







