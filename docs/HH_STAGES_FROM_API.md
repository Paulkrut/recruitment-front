# ✅ HH СТАДИИ ИЗ API

## 🔍 ПРОБЛЕМА

**Было:** HH стадии были захардкожены в компоненте
```typescript
const HH_STAGES = [
  { id: 'response', name: 'Отклик' },
  { id: 'invitation', name: 'Приглашение' },
  ...
];
```

**Проблема:** Реальные стадии могут отличаться у разных компаний в HH

---

## ✅ РЕШЕНИЕ

**Стало:** HH стадии загружаются через API и передаются как проп

### 1. В родительском компоненте (`page.tsx`)

```typescript
// Загружаются один раз при загрузке вакансий
const [availableStatuses, setAvailableStatuses] = useState<
  {id: string, name: string, total_count?: number}[]
>([]);

// При загрузке вакансий
if (data.available_statuses && data.available_statuses.length > 0) {
  setAvailableStatuses(data.available_statuses);
}

// Передаём в компонент автоматизации
<HhAutomationSettings
  isConnected={status.isConnected}
  hasValidToken={status.hasValidToken}
  hhStages={availableStatuses}  // ← НОВОЕ
/>
```

### 2. В компоненте автоматизации (`HhAutomationSettings.tsx`)

```typescript
interface Props {
  isConnected: boolean;
  hasValidToken: boolean;
  hhStages?: Array<{id: string, name: string, total_count?: number}>; // ← НОВОЕ
}

// Fallback на дефолтные если не загрузились
const DEFAULT_HH_STAGES = [
  { id: 'response', name: 'Отклик' },
  { id: 'invitation', name: 'Приглашение' },
  { id: 'interview', name: 'Интервью' },
  { id: 'offer', name: 'Предложение о работе' },
  { id: 'hired', name: 'Принят на работу' },
  { id: 'discard', name: 'Отказ' },
];

export default function HhAutomationSettings({ hhStages }: Props) {
  // Используем переданные или дефолтные
  const HH_STAGES = hhStages && hhStages.length > 0 ? hhStages : DEFAULT_HH_STAGES;
  
  // ...
}
```

---

## 🎨 UI УЛУЧШЕНИЯ

### 1. Показываем количество кандидатов (если есть)

```tsx
<Select>
  {HH_STAGES.map((stage) => (
    <MenuItem key={stage.id} value={stage.id}>
      {stage.name}
      {stage.total_count !== undefined && (
        <Typography variant="caption" color="text.secondary" ml={1}>
          ({stage.total_count})
        </Typography>
      )}
    </MenuItem>
  ))}
</Select>
```

**Пример в UI:**
```
┌────────────────────────────────┐
│ Отклик (15)                   │
│ Приглашение (8)               │
│ Интервью (3)                  │
│ Предложение о работе (1)      │
│ Отказ (22)                    │
└────────────────────────────────┘
```

### 2. Подсказка о источнике данных

```tsx
<Typography variant="caption" color="text.secondary">
  🔄 Список стадий загружен из HH.ru
</Typography>
```

---

## 📊 КАК ЭТО РАБОТАЕТ

### Поток данных:

```
1. Пользователь открывает страницу HH Integration
   ↓
2. Загружается список вакансий: /api/hh/vacancies/list
   ↓
3. API возвращает:
   {
     vacancies: [...],
     available_statuses: [
       { id: 'response', name: 'Отклик', total_count: 15 },
       { id: 'invitation', name: 'Приглашение', total_count: 8 },
       ...
     ]
   }
   ↓
4. setAvailableStatuses(data.available_statuses)
   ↓
5. Передаём в <HhAutomationSettings hhStages={availableStatuses} />
   ↓
6. Компонент использует реальные стадии из HH
```

---

## 🔧 BACKEND (УЖЕ РАБОТАЕТ)

Backend уже возвращает стадии в `/api/hh/vacancies/list`:

```php
// HhVacancyController::list()
return [
    'vacancies' => $vacancies,
    'available_statuses' => [
        ['id' => 'response', 'name' => 'Отклики', 'total_count' => 15],
        ['id' => 'invitation', 'name' => 'Приглашения', 'total_count' => 8],
        ['id' => 'interview', 'name' => 'Интервью', 'total_count' => 3],
        ['id' => 'offer', 'name' => 'Предложение о работе', 'total_count' => 1],
        ['id' => 'hired', 'name' => 'Принято на работу', 'total_count' => 0],
        ['id' => 'discard', 'name' => 'Отказ', 'total_count' => 22],
    ]
];
```

---

## ✅ ПРЕИМУЩЕСТВА

1. ✅ **Реальные данные из HH** - не захардкожены
2. ✅ **Показываем количество** кандидатов на каждой стадии
3. ✅ **Fallback на дефолтные** если API не вернул данные
4. ✅ **Переиспользование данных** - загружаем один раз, используем в двух местах:
   - В блоке настройки импорта
   - В блоке автоматизации

---

## 🎯 ЧТО ВИДИТ ПОЛЬЗОВАТЕЛЬ

### До изменений:
```
Синхронизировать в HH стадию:
┌────────────────────────────────┐
│ Приглашение                   │  ← захардкожено
└────────────────────────────────┘
```

### После изменений:
```
Синхронизировать в HH стадию:
┌────────────────────────────────┐
│ Отклик (15)                   │  ← из API HH
│ Приглашение (8)               │
│ Интервью (3)                  │
│ Предложение о работе (1)      │
│ Отказ (22)                    │
└────────────────────────────────┘
🔄 Список стадий загружен из HH.ru
```

---

## 📝 TODO

### Для `VacancyHhAutomationSettings.tsx`:

Там тоже используются HH стадии. Варианты:

**Вариант А (быстрый):** Также принимать `hhStages` как проп

**Вариант Б (правильный):** Загружать стадии для конкретной вакансии через API
```typescript
useEffect(() => {
  // GET /api/hh/vacancy/{id}/statuses
  // Возвращает доступные стадии для этой вакансии
}, [vacancyId]);
```

---

**Дата:** 2 января 2026  
**Статус:** ✅ ГОТОВО - стадии из HH API  
**Компонент:** `HhAutomationSettings.tsx`

