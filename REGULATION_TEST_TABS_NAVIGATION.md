# 🔗 Табы навигации для страниц теста регламентов

## 📝 Описание

На страницах просмотра/редактирования теста добавлены табы для быстрого переключения между разделами:
- 📝 **Редактировать** - изменение настроек теста
- 📊 **Результаты** - просмотр результатов тестирования
- ✉️ **Приглашения** - управление приглашениями

---

## 🎨 Внешний вид

```
┌───────────────────────────────────────────────────┐
│ Результаты тестирования                  [Назад] │
├───────────────────────────────────────────────────┤
│                                                   │
│ [📝 Редактировать] [📊 Результаты] [✉️ Приглашения] │
│        ─────────────────────                      │
│ (активный таб подчёркнут)                         │
│                                                   │
│ [Содержимое текущей страницы]                     │
└───────────────────────────────────────────────────┘
```

---

## 🔧 Технические детали

### Компонент RegulationTestTabs

**Файл:** `src/app/(DashboardLayout)/hr/regulation-tests/[id]/components/RegulationTestTabs.tsx`

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { Tabs, Tab, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MailIcon from '@mui/icons-material/Mail';

interface RegulationTestTabsProps {
  testId: string | number;
}

export default function RegulationTestTabs({ testId }: RegulationTestTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Определяем текущий активный таб на основе pathname
  const getCurrentTab = () => {
    if (pathname.includes('/edit')) return 'edit';
    if (pathname.includes('/results')) return 'results';
    if (pathname.includes('/invitations')) return 'invitations';
    return 'edit';
  };

  const currentTab = getCurrentTab();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    router.push(`/hr/regulation-tests/${testId}/${newValue}`);
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs value={currentTab} onChange={handleTabChange} aria-label="regulation test tabs">
        <Tab
          icon={<EditIcon />}
          iconPosition="start"
          label="Редактировать"
          value="edit"
        />
        <Tab
          icon={<AssessmentIcon />}
          iconPosition="start"
          label="Результаты"
          value="results"
        />
        <Tab
          icon={<MailIcon />}
          iconPosition="start"
          label="Приглашения"
          value="invitations"
        />
      </Tabs>
    </Box>
  );
}
```

### Логика определения активного таба

```typescript
const getCurrentTab = () => {
  if (pathname.includes('/edit')) return 'edit';
  if (pathname.includes('/results')) return 'results';
  if (pathname.includes('/invitations')) return 'invitations';
  return 'edit';
};
```

- Использует `usePathname()` из Next.js
- Проверяет текущий URL
- Возвращает соответствующее значение таба

### Навигация между табами

```typescript
const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
  router.push(`/hr/regulation-tests/${testId}/${newValue}`);
};
```

- При клике на таб вызывается `router.push()`
- Переход на соответствующую страницу
- Клиентская навигация (без перезагрузки страницы)

---

## 📄 Интеграция на страницах

### 1. results/page.tsx

```typescript
import RegulationTestTabs from '../components/RegulationTestTabs';

export default function TestResultsPage() {
  const params = useParams();
  const testId = parseInt(params.id as string);

  return (
    <PageContainer>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">📊 Результаты тестирования</Typography>
        <Button onClick={...}>Назад к тестам</Button>
      </Box>

      {/* Tabs navigation */}
      <RegulationTestTabs testId={testId} />

      {/* Содержимое страницы */}
      <Card>...</Card>
    </PageContainer>
  );
}
```

### 2. edit/page.tsx

```typescript
import RegulationTestTabs from '../components/RegulationTestTabs';

export default function EditTestPage() {
  const params = useParams();
  const testId = params?.id as string;

  return (
    <PageContainer>
      {/* Breadcrumbs */}
      <Breadcrumbs>...</Breadcrumbs>

      {/* Заголовок */}
      <Typography variant="h5">Редактировать тест</Typography>

      {/* Tabs navigation */}
      <RegulationTestTabs testId={testId} />

      {/* Форма редактирования */}
      <Card>...</Card>
    </PageContainer>
  );
}
```

### 3. invitations/page.tsx

```typescript
import RegulationTestTabs from '../components/RegulationTestTabs';

export default function InvitationsPage() {
  const params = useParams();
  const testId = parseInt(params.id as string);

  return (
    <PageContainer>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4">🔗 Приглашения на тест</Typography>
        <Button onClick={...}>Создать приглашение</Button>
      </Box>

      {/* Tabs navigation */}
      <RegulationTestTabs testId={testId} />

      {/* Таблица приглашений */}
      <Card>...</Card>
    </PageContainer>
  );
}
```

---

## 🎯 Преимущества

### 1. **Быстрая навигация**
- ✅ Переключение между разделами в один клик
- ✅ Не нужно возвращаться к списку тестов
- ✅ Контекст теста сохраняется

### 2. **Понятный интерфейс**
- ✅ Иконки для визуального различия
- ✅ Активный таб подсвечен
- ✅ Привычный UX (как в браузере)

### 3. **Улучшенный workflow**
```
До:
Результаты → Назад к списку → Найти тест → Приглашения

После:
Результаты → [клик на таб Приглашения] ✅
```

### 4. **Единообразие**
- ✅ Одинаковый UI на всех трёх страницах
- ✅ Предсказуемое поведение
- ✅ Профессиональный вид

---

## 🎨 Визуальные детали

### Табы

- **Активный таб**: Подчёркнут синей линией, текст синий
- **Неактивный таб**: Серый текст, без подчёркивания
- **Hover**: Лёгкое изменение цвета

### Иконки

- 📝 `EditIcon` - Редактировать
- 📊 `AssessmentIcon` - Результаты
- ✉️ `MailIcon` - Приглашения

### Отступы

```typescript
sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
```

- Линия под табами
- Отступ снизу 3 единицы (24px)

---

## 🧪 Тестирование

### Сценарий 1: Навигация между табами
1. Перейти на `/hr/regulation-tests/2/results`
2. ✅ Таб "Результаты" должен быть активен
3. Кликнуть на таб "Приглашения"
4. ✅ URL должен измениться на `/hr/regulation-tests/2/invitations`
5. ✅ Таб "Приглашения" должен стать активным
6. ✅ Загружается страница приглашений

### Сценарий 2: Прямой переход по URL
1. Открыть `/hr/regulation-tests/2/edit`
2. ✅ Таб "Редактировать" должен быть активен
3. Открыть `/hr/regulation-tests/2/results`
4. ✅ Таб "Результаты" должен быть активен

### Сценарий 3: Обратная навигация браузера
1. Перейти на `/hr/regulation-tests/2/results`
2. Кликнуть таб "Приглашения"
3. Нажать кнопку "Назад" в браузере
4. ✅ Должен вернуться на "Результаты"
5. ✅ Таб "Результаты" должен быть активен

### Сценарий 4: Разные тесты
1. Открыть `/hr/regulation-tests/2/results`
2. Кликнуть таб "Редактировать"
3. ✅ URL должен быть `/hr/regulation-tests/2/edit` (ID=2)
4. Открыть `/hr/regulation-tests/5/results`
5. Кликнуть таб "Приглашения"
6. ✅ URL должен быть `/hr/regulation-tests/5/invitations` (ID=5)

---

## 📝 Изменённые файлы

### Новые файлы
- ✅ `src/app/(DashboardLayout)/hr/regulation-tests/[id]/components/RegulationTestTabs.tsx`

### Обновлённые файлы
- ✅ `src/app/(DashboardLayout)/hr/regulation-tests/[id]/results/page.tsx`
  - Добавлен импорт `RegulationTestTabs`
  - Добавлен компонент `<RegulationTestTabs testId={testId} />`

- ✅ `src/app/(DashboardLayout)/hr/regulation-tests/[id]/edit/page.tsx`
  - Добавлен импорт `RegulationTestTabs`
  - Добавлен компонент `<RegulationTestTabs testId={testId} />`
  - Изменена структура заголовка

- ✅ `src/app/(DashboardLayout)/hr/regulation-tests/[id]/invitations/page.tsx`
  - Добавлен импорт `RegulationTestTabs`
  - Добавлен компонент `<RegulationTestTabs testId={testId} />`

---

## 🚀 Результат

Теперь при работе с тестом:
- ✅ Быстрое переключение между разделами
- ✅ Интуитивная навигация
- ✅ Профессиональный вид
- ✅ Улучшенный UX для HR

---

**Дата:** 2025-11-04  
**Статус:** ✅ Реализовано

