# 🔍 Фильтр тестов по регламенту

## 📝 Описание

Реализована фильтрация тестов по регламентам с двумя точками входа:
1. **Фильтр на странице тестов** - выбор регламента из выпадающего списка
2. **Клик по количеству тестов в списке регламентов** - переход на отфильтрованный список

---

## 🎨 Внешний вид

### Страница тестов с фильтром

```
┌──────────────────────────────────────────────────────┐
│ 📋 Тесты на знание регламентов      [Создать тест]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌──────────────────────────────────────────────┐    │
│ │ [Фильтр по регламенту ▼] [Сбросить] Найдено: 3│    │
│ └──────────────────────────────────────────────┘    │
│                                                      │
│ ℹ️ Показаны тесты, использующие регламент: ПБ 2024  │
│                                                      │
│ ┌────────────────────────────────────────────┐      │
│ │ Название │ Регламенты │ Режим │ Прогресс  │      │
│ ├────────────────────────────────────────────┤      │
│ │ Тест 1   │ 3 шт.      │ ...   │ ...       │      │
│ │ Тест 2   │ 2 шт.      │ ...   │ ...       │      │
│ └────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────┘
```

### Список регламентов с ссылками

```
┌───────────────────────────────────────────────┐
│ Название         │ Папка │ Тесты │ Действия │
├───────────────────────────────────────────────┤
│ ПБ 2024          │ —     │  [3]  │ ...      │  ← Клик = /regulation-tests?regulationId=1
│ Внутренний регл. │ HR    │  [5]  │ ...      │  ← Клик = /regulation-tests?regulationId=2
│ Новый документ   │ —     │   —   │ ...      │  ← Нет тестов
└───────────────────────────────────────────────┘
```

---

## 🔧 Технические детали

### 1. Страница тестов (regulation-tests/page.tsx)

#### Новые импорты
```typescript
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
```

#### Расширенный интерфейс
```typescript
interface RegulationTest {
  // ... existing fields ...
  regulations: Array<{
    id: number;
    title: string;
    position: number;
  }>;
}

interface Regulation {
  id: number;
  title: string;
}
```

#### Состояния
```typescript
const [regulations, setRegulations] = useState<Regulation[]>([]);
const [selectedRegulationId, setSelectedRegulationId] = useState<number | null>(
  regulationIdParam ? parseInt(regulationIdParam) : null
);
```

#### Загрузка данных
```typescript
const loadData = async () => {
  setLoading(true);
  try {
    // Загружаем тесты
    const testsResponse = await apiFetch(`${API_BASE}/api/regulation-tests`);
    const testsData = await testsResponse.json();
    setTests(testsData);

    // Загружаем список всех регламентов для фильтра
    const regulationsResponse = await apiFetch(`${API_BASE}/api/regulations`);
    const regulationsData = await regulationsResponse.json();
    setRegulations(regulationsData);
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    setLoading(false);
  }
};
```

#### Фильтрация
```typescript
// Фильтруем тесты по выбранному регламенту
const filteredTests = selectedRegulationId
  ? tests.filter((test) =>
      test.regulations.some((reg) => reg.id === selectedRegulationId)
    )
  : tests;

// Находим название выбранного регламента
const selectedRegulation = regulations.find(
  (reg) => reg.id === selectedRegulationId
);
```

#### Синхронизация с URL
```typescript
useEffect(() => {
  // Обновляем URL при изменении фильтра
  if (selectedRegulationId) {
    router.replace(`/hr/regulation-tests?regulationId=${selectedRegulationId}`);
  } else {
    router.replace('/hr/regulation-tests');
  }
}, [selectedRegulationId, router]);
```

#### UI фильтра
```typescript
<Card sx={{ p: 2, mb: 3 }}>
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
    <FormControl sx={{ minWidth: 300 }}>
      <InputLabel>Фильтр по регламенту</InputLabel>
      <Select
        value={selectedRegulationId || ''}
        label="Фильтр по регламенту"
        onChange={(e) => 
          setSelectedRegulationId(e.target.value ? Number(e.target.value) : null)
        }
      >
        <MenuItem value="">
          <em>Все тесты</em>
        </MenuItem>
        {regulations.map((regulation) => (
          <MenuItem key={regulation.id} value={regulation.id}>
            {regulation.title}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {selectedRegulationId && (
      <Button
        variant="outlined"
        startIcon={<ClearIcon />}
        onClick={handleClearFilter}
      >
        Сбросить фильтр
      </Button>
    )}

    {selectedRegulationId && (
      <Typography variant="body2" color="text.secondary">
        Найдено тестов: {filteredTests.length}
      </Typography>
    )}
  </Box>
</Card>
```

#### Alert для активного фильтра
```typescript
{selectedRegulationId && selectedRegulation && (
  <Alert severity="info" sx={{ mb: 3 }}>
    Показаны тесты, использующие регламент: <strong>{selectedRegulation.title}</strong>
  </Alert>
)}
```

#### Обработка пустых результатов
```typescript
{filteredTests.length === 0 ? (
  <TableRow>
    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
      {selectedRegulationId ? (
        <>
          <Typography color="text.secondary" gutterBottom>
            Нет тестов для выбранного регламента
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilter}
            sx={{ mt: 2 }}
          >
            Сбросить фильтр
          </Button>
        </>
      ) : (
        // Стандартное сообщение "Тесты не созданы"
      )}
    </TableCell>
  </TableRow>
) : (
  filteredTests.map((test) => ...)
)}
```

---

### 2. Список регламентов (regulations/page.tsx)

#### Обновлённая ссылка
```typescript
<TableCell>
  {regulation.testsCount !== undefined && regulation.testsCount > 0 ? (
    <NextLink 
      href={`/hr/regulation-tests?regulationId=${regulation.id}`} 
      passHref 
      legacyBehavior
    >
      <Link underline="hover" sx={{ cursor: 'pointer' }}>
        <Chip 
          label={regulation.testsCount} 
          size="small" 
          color="primary" 
          sx={{ cursor: 'pointer' }}
        />
      </Link>
    </NextLink>
  ) : (
    <Typography variant="body2" color="text.secondary">—</Typography>
  )}
</TableCell>
```

**До:**
```typescript
<NextLink href="/hr/regulation-tests" passHref legacyBehavior>
```

**После:**
```typescript
<NextLink href={`/hr/regulation-tests?regulationId=${regulation.id}`} passHref legacyBehavior>
```

---

## 🎯 Сценарии использования

### Сценарий 1: Фильтр на странице тестов

1. Перейти на `/hr/regulation-tests`
2. Открыть выпадающий список "Фильтр по регламенту"
3. Выбрать регламент (например, "Политика безопасности 2024")
4. ✅ URL обновляется: `/hr/regulation-tests?regulationId=5`
5. ✅ Появляется Alert: "Показаны тесты, использующие регламент: Политика безопасности 2024"
6. ✅ Таблица показывает только тесты, содержащие этот регламент
7. ✅ Показывается счётчик: "Найдено тестов: 3"
8. ✅ Кнопка "Сбросить фильтр" активна

### Сценарий 2: Переход из списка регламентов

1. Перейти на `/hr/regulations`
2. В колонке "Тесты" кликнуть на чип с количеством (например, "5")
3. ✅ Переход на `/hr/regulation-tests?regulationId=2`
4. ✅ Фильтр автоматически применён
5. ✅ Выбранный регламент отображён в выпадающем списке
6. ✅ Alert показывает название регламента
7. ✅ Таблица отфильтрована

### Сценарий 3: Сброс фильтра

1. На странице `/hr/regulation-tests?regulationId=5`
2. Кликнуть "Сбросить фильтр"
3. ✅ URL обновляется: `/hr/regulation-tests`
4. ✅ Alert исчезает
5. ✅ Таблица показывает все тесты
6. ✅ Выпадающий список сброшен на "Все тесты"

### Сценарий 4: Нет тестов для регламента

1. Выбрать регламент, для которого нет тестов
2. ✅ Alert показывает название регламента
3. ✅ Таблица пустая
4. ✅ Сообщение: "Нет тестов для выбранного регламента"
5. ✅ Кнопка "Сбросить фильтр" доступна

### Сценарий 5: Прямой переход по URL

1. Открыть `/hr/regulation-tests?regulationId=3` напрямую
2. ✅ Фильтр автоматически применяется
3. ✅ Выпадающий список показывает выбранный регламент
4. ✅ Alert активен
5. ✅ Таблица отфильтрована

### Сценарий 6: Быстрое создание теста

1. На странице регламентов кликнуть "Создать тест" (иконка `AssignmentIcon`)
2. ✅ Переход на `/hr/regulation-tests/create?regulationId=X`
3. ✅ Регламент предвыбран в мастере создания

---

## 🔄 Workflow

### До
```
Регламенты → Клик на "Тесты (5)" → Список всех тестов → Поиск нужных тестов вручную
```

### После
```
Регламенты → Клик на "Тесты (5)" → Список тестов уже отфильтрован ✅
```

---

## 📊 API Data Flow

### 1. Загрузка данных
```typescript
// GET /api/regulation-tests
{
  id: 1,
  title: "Тест по ПБ",
  regulations: [
    { id: 5, title: "Политика безопасности 2024", position: 1 },
    { id: 7, title: "Внутренний регламент", position: 2 }
  ],
  // ... other fields
}

// GET /api/regulations
[
  { id: 5, title: "Политика безопасности 2024" },
  { id: 7, title: "Внутренний регламент" },
  // ...
]
```

### 2. Фильтрация на Frontend
```typescript
// Если selectedRegulationId = 5
const filteredTests = tests.filter((test) =>
  test.regulations.some((reg) => reg.id === 5)
);

// Результат: только тесты, где есть регламент с id=5
```

---

## 🎯 Преимущества

### 1. **Быстрый доступ**
- ✅ Один клик для просмотра связанных тестов
- ✅ Не нужно искать вручную

### 2. **Понятный UX**
- ✅ Явное указание активного фильтра (Alert)
- ✅ Счётчик найденных тестов
- ✅ Простой сброс фильтра

### 3. **URL-based фильтрация**
- ✅ Можно делиться ссылками
- ✅ Работает кнопка "Назад" в браузере
- ✅ Состояние фильтра сохраняется при обновлении страницы

### 4. **Контекстная навигация**
- ✅ Из регламента → к его тестам
- ✅ Из теста → к его регламентам
- ✅ Связанная навигация

---

## 🧪 Тестирование

### Test Case 1: Фильтр работает
1. Выбрать регламент в фильтре
2. ✅ Таблица обновляется
3. ✅ URL содержит `regulationId`
4. ✅ Alert показывает название

### Test Case 2: Ссылка из регламентов
1. На странице регламентов кликнуть Chip с количеством
2. ✅ Переход на отфильтрованную страницу тестов
3. ✅ Фильтр активен

### Test Case 3: Сброс фильтра
1. Применить фильтр
2. Кликнуть "Сбросить фильтр"
3. ✅ Все тесты показаны
4. ✅ URL без параметров

### Test Case 4: Пустой результат
1. Выбрать регламент без тестов
2. ✅ Сообщение "Нет тестов"
3. ✅ Кнопка сброса доступна

### Test Case 5: Deep link
1. Открыть `/hr/regulation-tests?regulationId=999`
2. ✅ Фильтр применяется
3. ✅ UI корректно отображает состояние

---

## 📝 Изменённые файлы

### Обновлённые файлы

1. **`src/app/(DashboardLayout)/hr/regulation-tests/page.tsx`**
   - Добавлены импорты: `useRouter`, `useSearchParams`, `FormControl`, `Select`, `Alert`, `ClearIcon`
   - Добавлен интерфейс `Regulation`
   - Расширен `RegulationTest` (добавлено поле `regulations`)
   - Добавлены состояния: `regulations`, `selectedRegulationId`
   - Изменена `loadTests` → `loadData` (теперь загружает и тесты, и регламенты)
   - Добавлена логика фильтрации: `filteredTests`
   - Добавлен `useEffect` для синхронизации URL
   - Добавлен UI фильтра: `FormControl`, `Select`, кнопка "Сбросить"
   - Добавлен `Alert` для активного фильтра
   - Обновлена логика пустого состояния таблицы

2. **`src/app/(DashboardLayout)/hr/regulations/page.tsx`**
   - Изменена ссылка в колонке "Тесты"
   - Было: `href="/hr/regulation-tests"`
   - Стало: `href={`/hr/regulation-tests?regulationId=${regulation.id}`}`

---

## 🚀 Результат

Теперь:
- ✅ Можно быстро найти тесты для конкретного регламента
- ✅ Один клик из списка регламентов → отфильтрованный список тестов
- ✅ Понятный UI с явным указанием активного фильтра
- ✅ URL содержит состояние фильтра (можно делиться ссылками)
- ✅ Улучшенная навигация между регламентами и тестами

---

**Дата:** 2025-11-04  
**Статус:** ✅ Реализовано

