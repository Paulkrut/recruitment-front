# ✅ Очистка HH OAuth - Frontend

## 🎯 Проблема (найдена пользователем)

**Была путаница с токенами:**
- ❌ Frontend думал что работает с HH токенами
- ❌ Использовал ключ `jwt_token` вместо `recruitment_token`
- ❌ Дублировалась логика сохранения токенов

**На самом деле:**
- ✅ Backend возвращает **НАШ JWT токен** (SofiHR)
- ✅ HH токены хранятся ТОЛЬКО на backend
- ✅ Frontend работает с нашим JWT так же, как при обычной авторизации

---

## 🧹 Что было удалено/исправлено

### 1. **Удалены файлы:**
- ❌ `src/utils/hhOAuth.ts` - дублировал логику auth
- ❌ `src/types/hhOAuth.ts` - типы для HH токенов (не нужны на фронте)
- ❌ `src/app/auth/callback/page.tsx` - старый callback (используем `/hr/hh-redirect`)

### 2. **Исправлены файлы:**

#### **`src/app/hr/hh-redirect/page.tsx`**
```typescript
// Было:
import { saveAuthToken } from "@/utils/hhOAuth";
saveAuthToken(data.token); // Сохранял в jwt_token ❌

// Стало:
localStorage.setItem("recruitment_token", data.token); // ✅
```

#### **`src/components/auth/HhLoginButton.tsx`**
```typescript
// Было:
import { initiateHhOAuth } from '@/utils/hhOAuth';

// Стало:
const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
window.location.href = `${API_BASE}/api/auth/hh`;
```

#### **`src/components/auth/HhOAuthErrorAlert.tsx`**
```typescript
// Было:
import { isHhOAuthError, getHhOAuthErrorMessage } from '@/types/hhOAuth';

// Стало:
// Инлайн определения ошибок (без отдельного файла)
const HH_OAUTH_ERRORS = { ... };
```

---

## ✅ Как теперь работает HH OAuth

### **1. Пользователь нажимает "Войти через HH"**
```typescript
// HhLoginButton.tsx
window.location.href = `${API_BASE}/api/auth/hh`;
```

### **2. Backend редиректит на HH.ru**
```php
// HhOAuthController::authorize()
return new RedirectResponse($authorizationUrl);
```

### **3. HH.ru редиректит обратно на `/hr/hh-redirect?code=...&type=oauth`**

### **4. Frontend обрабатывает callback**
```typescript
// /hr/hh-redirect/page.tsx
const response = await fetch(`${API_BASE}/api/auth/hh/callback?code=${code}&state=${state}`);
const data = await response.json();

// Сохраняем НАШ JWT токен (НЕ HH токен!)
localStorage.setItem("recruitment_token", data.token);

// Редирект в кабинет
router.push("/hr/");
```

### **5. Backend создаёт User + сохраняет HH токены**
```php
// HhOAuthController::hhCallback()

// 1. Обменивает code на HH токен (access_token, refresh_token)
// 2. Сохраняет HH токены в hh_oauth_account (на backend!)
// 3. Создаёт User, Company, Employee
// 4. Генерирует НАШ JWT токен
// 5. Возвращает: { success: true, token: "наш_jwt" }
```

---

## 🔑 Ключевые моменты

### **Два типа токенов (НЕ путать!):**

| Тип | Где хранится | Для чего | Scope |
|-----|-------------|----------|-------|
| **HH Access Token** | Backend (`hh_oauth_account`) | Получение профиля HH | `email` |
| **HH Refresh Token** | Backend (`hh_oauth_account`) | Обновление access token | - |
| **SofiHR JWT Token** | Frontend (`recruitment_token`) | Аутентификация в SofiHR | - |

### **Frontend НИКОГДА не видит HH токены!**
- ✅ Frontend работает только с **нашим JWT**
- ✅ Все запросы к HH API идут через backend
- ✅ Backend использует сохранённый HH токен из `hh_oauth_account`

---

## 📊 Схема потоков

### **OAuth вход:**
```
User → "Войти через HH" (Frontend)
  ↓
Backend: /api/auth/hh (redirect)
  ↓
HH.ru: OAuth authorization
  ↓
Backend: /api/auth/hh/callback
  - Получает HH токены
  - Сохраняет в hh_oauth_account
  - Создаёт User
  - Генерирует SofiHR JWT
  ↓
Frontend: /hr/hh-redirect
  - Получает SofiHR JWT
  - Сохраняет в localStorage
  - Редирект в /hr/
```

### **Обычная авторизация (для сравнения):**
```
User → Логин/пароль (Frontend)
  ↓
Backend: /api/auth/login
  - Проверяет credentials
  - Генерирует SofiHR JWT
  ↓
Frontend:
  - Получает SofiHR JWT
  - Сохраняет в localStorage
  - Редирект в /hr/
```

**Одинаковые шаги:**
- ✅ Получаем SofiHR JWT
- ✅ Сохраняем в `localStorage.recruitment_token`
- ✅ Используем для всех API запросов

---

## ✅ Проверка

### **Убедись что используется правильный ключ:**
```typescript
// Во ВСЕХ местах авторизации:
localStorage.setItem("recruitment_token", token); // ✅

// НЕ:
localStorage.setItem("jwt_token", token); // ❌
```

### **Убедись что нет импортов удалённых файлов:**
```bash
# В recruitment-front выполни:
grep -r "from.*hhOAuth" src/
grep -r "from.*types/hhOAuth" src/

# Должно быть пусто!
```

---

## 📝 Итог

**Почищено:**
- ✅ Удалены дублирующие утилиты
- ✅ Исправлен ключ localStorage (`jwt_token` → `recruitment_token`)
- ✅ Убрана путаница с HH токенами на фронте
- ✅ Удалён старый callback

**Теперь:**
- ✅ OAuth вход работает **точно так же** как обычная авторизация
- ✅ Frontend работает только с **нашим JWT**
- ✅ HH токены хранятся **только на backend**
- ✅ Код чистый и понятный

**Спасибо пользователю за внимательность!** 🎉


