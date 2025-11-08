# 🎨 Frontend для HH Token Management

## ✅ Реализовано

### **Файл:** `KanbanView.tsx`

---

## 🔧 Что добавлено:

### **1. Новые состояния (state)**

```tsx
// Состояние для HH Token Required Dialog
const [hhTokenDialogOpen, setHhTokenDialogOpen] = useState(false);
const [hhTokenError, setHhTokenError] = useState<{
  candidateName?: string;
  message?: string;
} | null>(null);

// Состояние для Snackbar (сводка ошибок при пакетной операции)
const [snackbarOpen, setSnackbarOpen] = useState(false);
const [snackbarMessage, setSnackbarMessage] = useState('');
const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'warning' | 'error'>('success');
```

---

### **2. Обработка ответа от API**

#### **Успешный ответ (HTTP 200):**

```tsx
if (response.ok) {
  const result = await response.json();
  
  // Проверяем есть ли ошибки HH token
  const hhTokenErrors = result.errors?.filter((e: any) => e.error === 'hh_token_required') || [];
  
  if (hhTokenErrors.length > 0) {
    // ⚠️ Пакетная операция с ошибками HH token
    setSnackbarMessage(
      `${successCount} из ${totalCount} кандидатов переведены. ${errorCount} кандидатов требуют авторизации HH.ru`
    );
    setSnackbarSeverity('warning');
    setSnackbarOpen(true);
  } else if (result.updated === result.total) {
    // ✅ Все успешно
    setSnackbarMessage(`✅ Успешно перемещено ${result.updated} кандидатов`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  }
  
  // ... перезагрузка колонок ...
}
```

#### **Ошибка (HTTP 403):**

```tsx
if (response.status === 403 && error.error === 'hh_token_required') {
  // 🔑 Одиночная операция → показываем модальное окно
  setHhTokenError({
    candidateName: error.candidateName,
    message: error.message || 'Требуется авторизация HH.ru для загрузки резюме',
  });
  setHhTokenDialogOpen(true);
}
```

---

### **3. Модальное окно (Dialog) для одиночной операции**

```tsx
<Dialog
  open={hhTokenDialogOpen}
  onClose={() => setHhTokenDialogOpen(false)}
  maxWidth="sm"
  fullWidth
>
  <DialogTitle>
    🔑 Требуется авторизация HH.ru
  </DialogTitle>
  <DialogContent>
    <DialogContentText>
      {hhTokenError?.candidateName && (
        <Box component="span" sx={{ display: 'block', fontWeight: 600, mb: 1 }}>
          Кандидат: {hhTokenError.candidateName}
        </Box>
      )}
      {hhTokenError?.message || 'Для загрузки резюме с HeadHunter необходимо обновить токен доступа.'}
    </DialogContentText>
    <Alert severity="info" sx={{ mt: 2 }}>
      Перейдите в настройки интеграции HH.ru и авторизуйтесь заново
    </Alert>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setHhTokenDialogOpen(false)} color="inherit">
      Отмена
    </Button>
    <Button
      onClick={() => {
        setHhTokenDialogOpen(false);
        window.location.href = '/hr/settings/hh-integration';
      }}
      variant="contained"
      color="primary"
    >
      Подключить HH.ru
    </Button>
  </DialogActions>
</Dialog>
```

**Вид:**
- 🔑 Иконка ключа в заголовке
- Имя кандидата (если доступно)
- Сообщение об ошибке
- Info Alert с инструкцией
- Кнопка "Подключить HH.ru" → `/hr/settings/hh-integration`

---

### **4. Snackbar для пакетных операций**

```tsx
<Snackbar
  open={snackbarOpen}
  autoHideDuration={6000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
>
  <Alert
    onClose={() => setSnackbarOpen(false)}
    severity={snackbarSeverity}
    sx={{ width: '100%' }}
    action={
      snackbarSeverity === 'warning' ? (
        <Button
          color="inherit"
          size="small"
          onClick={() => {
            setSnackbarOpen(false);
            window.location.href = '/hr/settings/hh-integration';
          }}
        >
          Подключить HH.ru
        </Button>
      ) : undefined
    }
  >
    {snackbarMessage}
  </Alert>
</Snackbar>
```

**Вид:**
- ⚠️ Warning severity для ошибок HH token
- ✅ Success severity для успешных операций
- ❌ Error severity для остальных ошибок
- Кнопка "Подключить HH.ru" в Snackbar (только для warning)
- Авто-закрытие через 6 секунд

---

## 🎯 Пользовательские сценарии:

### **Сценарий 1: Одиночная операция + истёкший токен HH**

```
1. HR → перетаскивает HH кандидата в "AI скрининг"
2. Backend → HTTP 403 (hh_token_required)
3. Frontend → показывает модальное окно:

   ┌─────────────────────────────────────┐
   │ 🔑 Требуется авторизация HH.ru     │
   ├─────────────────────────────────────┤
   │ Кандидат: Иванов Иван               │
   │                                     │
   │ Для загрузки резюме с HeadHunter    │
   │ необходимо обновить токен доступа.  │
   │                                     │
   │ ℹ️ Перейдите в настройки интеграции │
   │    HH.ru и авторизуйтесь заново     │
   ├─────────────────────────────────────┤
   │        [Отмена]  [Подключить HH.ru] │
   └─────────────────────────────────────┘

4. HR → нажимает "Подключить HH.ru"
5. → Переход на /hr/settings/hh-integration
6. Статус кандидата НЕ изменился ✅
```

---

### **Сценарий 2: Пакетная операция (5 кандидатов, 3 HH)**

```
1. HR → выбирает 5 кандидатов → перетаскивает в "AI скрининг"
2. Backend → HTTP 200:
   {
     "updated": 2,
     "total": 5,
     "errors": [
       { "candidateId": 1, "error": "hh_token_required", ... },
       { "candidateId": 3, "error": "hh_token_required", ... },
       { "candidateId": 5, "error": "hh_token_required", ... }
     ]
   }
3. Frontend → показывает Snackbar (warning, внизу по центру):

   ┌──────────────────────────────────────────────────────┐
   │ ⚠️ 2 из 5 кандидатов переведены.                     │
   │    3 кандидатов требуют авторизации HH.ru            │
   │                              [Подключить HH.ru]  [✕] │
   └──────────────────────────────────────────────────────┘

4. HR → нажимает "Подключить HH.ru"
5. → Переход на /hr/settings/hh-integration
6. Статусы:
   - 2 обычных кандидата → переведены ✅
   - 3 HH кандидата → остались в старом статусе ✅
```

---

### **Сценарий 3: Успешная операция (без ошибок)**

```
1. HR → перетаскивает 3 кандидатов в "Собеседование"
2. Backend → HTTP 200 (updated: 3, errors: [])
3. Frontend → показывает Snackbar (success):

   ┌──────────────────────────────────────┐
   │ ✅ Успешно перемещено 3 кандидата [✕]│
   └──────────────────────────────────────┘

4. Авто-закрытие через 6 секунд
```

---

## ✨ Преимущества:

### **1. UX:**
- ✅ Модальное окно для критических ошибок (одиночная операция)
- ✅ Snackbar для сводки (пакетная операция)
- ✅ Чёткие кнопки действий ("Подключить HH.ru")
- ✅ Автоматическое закрытие Snackbar

### **2. Информативность:**
- ✅ Имя кандидата (если доступно)
- ✅ Счётчики: "2 из 5 кандидатов переведены"
- ✅ Иконки для быстрой ориентации (🔑, ⚠️, ✅)

### **3. Без блокировки:**
- ✅ Диалог можно закрыть (Esc, клик вне, кнопка "Отмена")
- ✅ Snackbar не блокирует интерфейс
- ✅ Можно продолжить работу

---

## 🧪 Тестирование:

### **1. Симулировать истёкший токен:**
```sql
UPDATE hh_api_token SET expires_at = NOW() - INTERVAL 1 DAY WHERE company_id = 1;
```

### **2. Одиночный HH кандидат:**
1. Открыть Kanban-доску
2. Перетащить HH кандидата в "AI скрининг"
3. **Ожидаем:** Модальное окно с предложением авторизоваться
4. **Проверка:** Статус кандидата не изменился

### **3. Пакетная операция (3 HH, 2 обычных):**
1. Выбрать 5 кандидатов (3 HH, 2 обычных)
2. Переместить в "AI скрининг"
3. **Ожидаем:** Snackbar "2 из 5 кандидатов переведены. 3 кандидатов требуют авторизации HH.ru"
4. **Проверка:** 
   - 2 обычных кандидата переведены ✅
   - 3 HH кандидата остались в старом статусе ✅

---

## ✅ Готово!

**Изменённые файлы:**
1. ✅ `KanbanView.tsx` - добавлены Dialog, Snackbar, обработка ошибок

**Дата:** 2024-11-06  
**Статус:** ✅ Полностью готово (backend + frontend)

**Осталось:** Протестировать на реальных данных! 🚀


