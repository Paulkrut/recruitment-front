# Изменение: Единая callback страница для HH OAuth

## 🎯 Проблема

HH.ru разрешает только **один redirect URI** на приложение. Нельзя было создать отдельную callback страницу для кандидатов.

---

## ✅ Решение

Используем **единую страницу** `/hr/hh-redirect` с параметром `type` для различения:

| Type | Пользователь | Redirect после успеха |
|------|--------------|----------------------|
| `type=oauth` | HR менеджер | `/hr/` (админка) |
| `type=candidate` | Кандидат | `/interview/{hash}` |
| `type=null` | API интеграция | `/hr/settings/hh-integration` |

---

## 📝 Изменения

### **Frontend: `/hr/hh-redirect/page.tsx`**

#### **Добавлена обработка `type=candidate`:**

```tsx
const type = searchParams.get("type");

if (error) {
  if (type === "oauth") {
    router.push("/auth/login?error=" + error);
  } else if (type === "candidate") {
    router.push(`/interview/apply/${state}?error=${error}`);
  } else {
    router.push("/hr/settings/hh-integration?error=" + error);
  }
}

// Обработка успешного callback
if (type === "oauth") {
  handleUserOAuthCallback(code, state);
} else if (type === "candidate") {
  handleCandidateOAuthCallback(code, state);
} else {
  handleApiIntegrationCallback(code, state);
}
```

#### **Новая функция `handleCandidateOAuthCallback`:**

```tsx
const handleCandidateOAuthCallback = async (code: string, state: string) => {
  try {
    const response = await fetch(
      `${API_BASE}/api/public/apply/hh-callback?code=${code}&state=${state}`
    );
    const data = await response.json();

    if (data.success && data.interviewHash) {
      window.location.href = `/interview/${data.interviewHash}`;
    } else {
      router.push(`/interview/apply/${state}?error=${data.error}`);
    }
  } catch (err) {
    router.push(`/interview/apply/${state}?error=hh_callback_failed`);
  }
};
```

---

## 🔄 Flow для кандидата

```
1. Кандидат нажимает "Войти через HH"
   ↓
2. GET /api/public/apply/{publicToken}/hh-auth
   ↓
3. Redirect на HH:
   https://hh.ru/oauth/authorize?
     client_id=...
     redirect_uri=http://localhost:3002/hr/hh-redirect?type=candidate
     state={publicToken}
   ↓
4. HH авторизация
   ↓
5. Callback:
   /hr/hh-redirect?type=candidate&code=...&state={publicToken}
   ↓
6. Frontend: handleCandidateOAuthCallback()
   ↓
7. GET /api/public/apply/hh-callback?code=...&state={publicToken}
   ↓
8. Backend: создание/поиск кандидата
   ↓
9. Response: { success: true, interviewHash: "..." }
   ↓
10. Redirect: /interview/{interviewHash}
```

---

## 🆚 Различие типов callback

### **type=oauth (HR пользователь):**
- **State:** CSRF токен (случайная строка)
- **Backend:** `/api/auth/hh/callback`
- **Redirect:** `/hr/` (админка)
- **LocalStorage:** Сохраняет JWT токен

### **type=candidate (Кандидат):**
- **State:** `publicToken` вакансии
- **Backend:** `/api/public/apply/hh-callback`
- **Redirect:** `/interview/{candidateToken}`
- **LocalStorage:** Ничего не сохраняет (публичный доступ)

### **type=null (API интеграция):**
- **State:** Внутренний state для безопасности
- **Backend:** `/api/hh-integration/oauth-callback`
- **Redirect:** `/hr/settings/hh-integration`
- **Действие:** Сохраняет HH API токены

---

## 📊 Преимущества решения

✅ **Единая точка входа** - все HH callbacks в одном месте  
✅ **Соответствие требованиям HH** - один redirect URI  
✅ **Переиспользование кода** - общая логика обработки  
✅ **Гибкость** - легко добавить новые типы  
✅ **Безопасность** - различные обработчики для разных контекстов  

---

## 🗑️ Удалено

- ❌ `/interview/apply/hh-callback/page.tsx` (дубликат)

---

## 📅 Дата обновления

**19 декабря 2024**

