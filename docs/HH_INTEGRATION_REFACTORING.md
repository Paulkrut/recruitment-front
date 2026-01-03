# 🔨 ПЛАН РЕФАКТОРИНГА HH INTEGRATION

## 📊 Текущая проблема

**Файл:** `hh-integration/page.tsx` - **1454 строки** 😱

**Что в нем:**
1. Статус подключения HH (~180 строк)
2. Настройки синхронизации (~40 строк)
3. Импорт вакансий (~600 строк)
4. Логика работы с API
5. Множество useState
6. Polling для синхронизации

---

## 🎯 Новая структура

```
src/
├── app/(DashboardLayout)/hr/settings/hh-integration/
│   └── page.tsx (композиция, ~100 строк)
│
├── components/hr/hh-integration/
│   ├── types.ts                          # Интерфейсы и типы
│   ├── HhConnectionStatus.tsx            # Статус подключения (~150 строк)
│   ├── HhSyncSettings.tsx                # Настройки синхронизации (~80 строк)
│   ├── HhVacanciesImport.tsx            # Импорт вакансий (~400 строк)
│   ├── HhAutomationSettings.tsx         # 🆕 АВТОМАТИЗАЦИЯ (~200 строк)
│   │
│   ├── vacancy-import/                   # Подкомпоненты импорта
│   │   ├── VacancyFilters.tsx
│   │   ├── VacancyCard.tsx
│   │   ├── StatusSelector.tsx
│   │   └── ImportProgress.tsx
│   │
│   └── automation/                       # 🆕 Подкомпоненты автоматизации
│       ├── AutoInviteSettings.tsx
│       ├── ReminderSettings.tsx
│       ├── MessageTemplateEditor.tsx
│       └── StatusSyncSettings.tsx
│
└── hooks/
    ├── useHhStatus.ts                    # Загрузка статуса HH
    ├── useHhVacancies.ts                 # Работа с вакансиями
    ├── useHhAutomation.ts               # 🆕 Работа с автоматизацией
    └── useHhConnection.ts                # OAuth подключение
```

---

## 📦 Компоненты

### 1. `HhConnectionStatus.tsx`
**Ответственность:**
- Отображение статуса подключения
- Кнопки подключить/отключить
- Информация о токене, компании, лимитах
- OAuth flow

**Props:**
```typescript
interface Props {
  status: HhIntegrationStatus | null;
  loading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}
```

---

### 2. `HhSyncSettings.tsx`
**Ответственность:**
- Переключатель автосинхронизации
- Интервал синхронизации
- Последняя синхронизация

**Props:**
```typescript
interface Props {
  autoSync: boolean;
  syncInterval: number;
  lastSyncAt?: string;
  onToggleAutoSync: (enabled: boolean) => void;
}
```

---

### 3. `HhVacanciesImport.tsx`
**Ответственность:**
- Список вакансий из HH
- Фильтры и сортировка
- Выбор вакансий
- Настройка статусов
- Импорт

**Props:**
```typescript
interface Props {
  isConnected: boolean;
  hasValidToken: boolean;
}
```

**Внутри использует подкомпоненты:**
- `VacancyFilters` - фильтры и поиск
- `VacancyCard` - карточка вакансии
- `StatusSelector` - выбор статусов
- `ImportProgress` - прогресс синхронизации

---

### 4. `HhAutomationSettings.tsx` 🆕
**Ответственность:**
- Настройки автоприглашения
- Настройки напоминаний
- Настройки автоотказов
- Редактирование текстов сообщений
- Настройки синхронизации статусов

**Props:**
```typescript
interface Props {
  isConnected: boolean;
  hasValidToken: boolean;
}
```

**Внутри использует подкомпоненты:**
- `AutoInviteSettings` - настройки автоприглашения
- `ReminderSettings` - напоминания и автоотказ
- `MessageTemplateEditor` - редактор шаблонов
- `StatusSyncSettings` - синхронизация статусов

---

## 🔧 Хуки

### `useHhStatus.ts`
```typescript
export function useHhStatus() {
  const [status, setStatus] = useState<HhIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => { /* ... */ };
  const refresh = () => fetchStatus();

  useEffect(() => {
    fetchStatus();
  }, []);

  return { status, loading, error, refresh };
}
```

### `useHhConnection.ts`
```typescript
export function useHhConnection() {
  const [connecting, setConnecting] = useState(false);

  const startOAuth = async () => { /* ... */ };
  const disconnect = async () => { /* ... */ };
  const handleCallback = async (code, state) => { /* ... */ };

  return { connecting, startOAuth, disconnect, handleCallback };
}
```

### `useHhVacancies.ts`
```typescript
export function useHhVacancies() {
  const [vacancies, setVacancies] = useState<HhVacancy[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const loadVacancies = async () => { /* ... */ };
  const importSelected = async (ids, statuses) => { /* ... */ };
  const toggleSelection = (id) => { /* ... */ };

  return {
    vacancies,
    loading,
    selectedIds,
    loadVacancies,
    importSelected,
    toggleSelection,
  };
}
```

### `useHhAutomation.ts` 🆕
```typescript
export function useHhAutomation() {
  const [settings, setSettings] = useState<HhAutomationSettings | null>(null);
  const [loading, setLoading] = useState(false);

  const loadSettings = async () => { /* ... */ };
  const updateSettings = async (newSettings) => { /* ... */ };

  return { settings, loading, loadSettings, updateSettings };
}
```

---

## 📄 types.ts

```typescript
export interface HhIntegrationStatus {
  isConnected: boolean;
  hasValidToken: boolean;
  tokenStatus?: string;
  tokenMessage?: string;
  employerId?: string;
  companyName?: string;
  lastSyncAt?: string;
  tokenExpiresAt?: string;
  autoSync: boolean;
  syncInterval: number;
  stats?: {
    totalVacancies: number;
    totalCandidates: number;
    newCandidatesToday: number;
  };
  hhLimits?: {
    left: { resumeView: number; resumeViewFromApi: number; };
    limits: { resumeView: number; resumeViewFromApi: number; };
    spend: { resumeView: number; resumeViewFromApi: number; };
    source: string;
  };
  resumeQueueCount?: number;
}

export interface HhVacancy {
  id: string;
  hh_id: string;
  name: string;
  status: string;
  responses: number;
  area: string;
  salary_from?: number;
  salary_to?: number;
  currency?: string;
  created_at: string;
  imported?: boolean;
  hh_vacancy_id?: number;
  local_vacancy_id?: number;
  candidates_sync_status?: string;
  candidates_total?: number;
  candidates_synced?: number;
  candidates_sync_error?: string;
  available_statuses?: Array<{id: string; name: string; count: number}>;
}

export interface HhAutomationSettings {
  defaults: {
    autoInvite: {
      enabled: boolean;
      fromHhStageId: string;
      toHhStageId: string;
      invitationType: 'template' | 'ai';
      messageTemplate?: string;
    };
    reminders: {
      enabled: boolean;
      daysAfter: number;
      messageTemplate: string;
    };
    autoReject: {
      enabled: boolean;
      daysAfter: number;
      hhStageId: string;
      messageTemplate: string;
    };
    statusSync: {
      afterInterview: {
        enabled: boolean;
        hhStageId: string;
      };
      onReject: {
        enabled: boolean;
        hhStageId: string;
        messageTemplate: string;
      };
    };
  };
}
```

---

## 🔄 Главная страница после рефакторинга

```typescript
// page.tsx (~100 строк)

export default function HhIntegrationPage() {
  const searchParams = useSearchParams();
  const { status, loading, error, refresh } = useHhStatus();
  const { connecting, startOAuth, disconnect, handleCallback } = useHhConnection();
  const [success, setSuccess] = useState<string | null>(null);

  // Обработка OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    if (code && state) {
      handleCallback(code, state).then(() => {
        setSuccess('HH.ru успешно подключен!');
        refresh();
      });
    }
  }, [searchParams]);

  if (loading) {
    return <PageContainer><CircularProgress /></PageContainer>;
  }

  return (
    <PageContainer title="Интеграция с HH.ru">
      <Box>
        {/* Алерты */}
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Grid container spacing={3}>
          {/* Статус подключения */}
          <Grid item xs={12}>
            <HhConnectionStatus
              status={status}
              loading={connecting}
              onConnect={startOAuth}
              onDisconnect={disconnect}
            />
          </Grid>

          {/* Настройки синхронизации */}
          {status?.isConnected && (
            <Grid item xs={12}>
              <HhSyncSettings
                autoSync={status.autoSync}
                syncInterval={status.syncInterval}
                lastSyncAt={status.lastSyncAt}
                onToggleAutoSync={async (enabled) => {
                  await apiFetch(`${API_BASE}/api/hh-integration/auto-sync`, {
                    method: 'POST',
                    body: JSON.stringify({ enabled }),
                  });
                  refresh();
                }}
              />
            </Grid>
          )}

          {/* Импорт вакансий */}
          {status?.isConnected && status.hasValidToken && (
            <Grid item xs={12}>
              <HhVacanciesImport
                isConnected={status.isConnected}
                hasValidToken={status.hasValidToken}
              />
            </Grid>
          )}

          {/* 🆕 АВТОМАТИЗАЦИЯ */}
          {status?.isConnected && status.hasValidToken && (
            <Grid item xs={12}>
              <HhAutomationSettings
                isConnected={status.isConnected}
                hasValidToken={status.hasValidToken}
              />
            </Grid>
          )}
        </Grid>
      </Box>
    </PageContainer>
  );
}
```

**Результат: ~100 строк вместо 1454! 🎉**

---

## ✅ Преимущества

1. **Читаемость** - каждый компонент отвечает за одно
2. **Переиспользование** - компоненты можно использовать в других местах
3. **Тестируемость** - легко тестировать отдельные части
4. **Масштабируемость** - легко добавлять новые секции
5. **Поддержка** - легко найти и исправить баги
6. **Разработка** - несколько разработчиков могут работать параллельно

---

## 📋 План действий

1. ✅ Создать структуру папок
2. ✅ Вынести типы в `types.ts`
3. ✅ Создать хуки (`useHhStatus`, `useHhConnection`, `useHhVacancies`)
4. ✅ Разбить на компоненты:
   - `HhConnectionStatus`
   - `HhSyncSettings`
   - `HhVacanciesImport` (с подкомпонентами)
5. ✅ Обновить главную страницу
6. ✅ Создать новый компонент `HhAutomationSettings`
7. ✅ Тестирование

---

## 🚀 Начинаем?

Я могу:
1. Сначала создать всю структуру и хуки
2. Потом по очереди компоненты
3. В конце главную страницу

**Согласен с таким планом?**

