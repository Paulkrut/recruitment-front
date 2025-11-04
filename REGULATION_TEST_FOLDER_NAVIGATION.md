# 📁 Навигация по папкам при создании теста регламентов

## 📋 Описание

При создании теста по регламентам на шаге выбора регламентов теперь можно:
- 📂 Просматривать папки с регламентами
- 🔍 Заходить в папки для выбора регламентов
- ↩️ Возвращаться к корневому уровню
- ✅ Выбирать регламенты из разных папок

---

## 🎯 Пользовательский сценарий

### Шаг 1: Корневой уровень
```
┌────────────────────────────────────────────────┐
│ Выбор регламентов                              │
├────────────────────────────────────────────────┤
│                                                │
│ 📁 Папка "HR документы"                        │
│    Регламентов: 5                              │
│                                                │
│ 📁 Папка "Технические инструкции"              │
│    Регламентов: 12                             │
│                                                │
│ ☐ Регламент без папки                          │
│   v1.0                                         │
└────────────────────────────────────────────────┘
```

### Шаг 2: Внутри папки
```
┌────────────────────────────────────────────────┐
│ ⬅ Назад к корню / HR документы                │
├────────────────────────────────────────────────┤
│                                                │
│ ☐ Правила найма персонала                      │
│   v2.1                                         │
│                                                │
│ ✅ Регламент адаптации новичков                │
│   v1.5                                         │
│                                                │
│ ☐ Политика отпусков                            │
│   v3.0                                         │
└────────────────────────────────────────────────┘
```

### Шаг 3: Выбрано из разных папок
```
┌────────────────────────────────────────────────┐
│ ✅ Выбрано регламентов: 3                      │
│    Всего вопросов: 15                          │
│                                                │
│ • Регламент адаптации новичков (HR документы)  │
│ • Безопасность труда (Технические инструкции)  │
│ • Регламент без папки                          │
└────────────────────────────────────────────────┘
```

---

## 🏗️ Техническая реализация

### Frontend: Состояние компонента

```typescript
// Интерфейсы
interface RegulationFolder {
  id: number;
  name: string;
  description: string | null;
  regulationsCount: number;
}

interface Regulation {
  id: number;
  title: string;
  description: string | null;
  version: string;
  folderId: number | null;      // Новое поле
  folderName: string | null;
}

// Состояние
const [folders, setFolders] = useState<RegulationFolder[]>([]);
const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
const [selectedRegulations, setSelectedRegulations] = useState<number[]>([]);
```

### Фильтрация регламентов

```typescript
// Вычисляемый список регламентов для отображения
const displayedRegulations = selectedFolderId
  ? regulations.filter(r => r.folderId === selectedFolderId)  // В папке
  : regulations.filter(r => r.folderId === null);              // В корне
```

### Загрузка данных

```typescript
const loadRegulations = async () => {
  try {
    // Загружаем регламенты
    const regulationsResponse = await apiFetch(`${API_BASE}/api/regulations`);
    const regulationsData = await regulationsResponse.json();
    setRegulations(regulationsData);

    // Загружаем папки
    const foldersResponse = await apiFetch(`${API_BASE}/api/regulations/folders`);
    const foldersData = await foldersResponse.json();
    setFolders(foldersData);
  } catch (error) {
    console.error('Error loading regulations:', error);
  }
};
```

---

## 🎨 UI Компоненты

### 1. Карточка папки

```tsx
<ListItem
  button
  onClick={() => setSelectedFolderId(folder.id)}
  sx={{
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: 1,
    mb: 1,
    bgcolor: 'background.paper',
    '&:hover': {
      bgcolor: 'action.hover',
    },
  }}
>
  <ListItemIcon>
    <FolderIcon color="primary" sx={{ fontSize: 40 }} />
  </ListItemIcon>
  <ListItemText
    primary={
      <Typography variant="h6">
        📁 {folder.name}
      </Typography>
    }
    secondary={
      <Box>
        {folder.description && (
          <Typography variant="caption" display="block">
            {folder.description}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          Регламентов: {folder.regulationsCount}
        </Typography>
      </Box>
    }
  />
</ListItem>
```

### 2. Навигация (Breadcrumbs)

```tsx
{selectedFolderId && (
  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
    <Button
      startIcon={<ArrowBackIcon />}
      onClick={() => setSelectedFolderId(null)}
      size="small"
    >
      Назад к корню
    </Button>
    <Typography variant="body2" color="text.secondary">
      / {folders.find(f => f.id === selectedFolderId)?.name}
    </Typography>
  </Box>
)}
```

### 3. Карточка регламента

```tsx
<ListItem
  button
  onClick={() => handleToggleRegulation(regulation.id)}
  sx={{
    border: '1px solid',
    borderColor: selectedRegulations.includes(regulation.id)
      ? 'primary.main'
      : 'divider',
    borderRadius: 1,
    mb: 1,
    bgcolor: selectedRegulations.includes(regulation.id)
      ? 'primary.light'
      : 'background.paper',
  }}
>
  <ListItemIcon>
    <Checkbox
      edge="start"
      checked={selectedRegulations.includes(regulation.id)}
      tabIndex={-1}
      disableRipple
    />
  </ListItemIcon>
  <ListItemIcon>
    <DescriptionIcon color="primary" />
  </ListItemIcon>
  <ListItemText
    primary={regulation.title}
    secondary={
      <Box>
        {regulation.description && (
          <Typography variant="caption" display="block">
            {regulation.description}
          </Typography>
        )}
        <Box sx={{ mt: 0.5 }}>
          <Chip label={`v${regulation.version}`} size="small" sx={{ mr: 1 }} />
          {regulation.folderName && (
            <Chip label={regulation.folderName} size="small" variant="outlined" />
          )}
        </Box>
      </Box>
    }
  />
</ListItem>
```

### 4. Пустая папка

```tsx
{selectedFolderId && displayedRegulations.length === 0 && (
  <Alert severity="info">
    В этой папке пока нет регламентов
  </Alert>
)}
```

---

## 📊 Backend API

### Endpoint: `GET /api/regulations/folders`

**Response:**
```json
[
  {
    "id": 1,
    "name": "HR документы",
    "description": "Регламенты для HR отдела",
    "parentId": null,
    "position": 0,
    "regulationsCount": 5,
    "childrenCount": 2,
    "createdAt": "2025-11-04 10:00:00"
  },
  {
    "id": 2,
    "name": "Технические инструкции",
    "description": null,
    "parentId": null,
    "position": 1,
    "regulationsCount": 12,
    "childrenCount": 0,
    "createdAt": "2025-11-04 10:05:00"
  }
]
```

### Endpoint: `GET /api/regulations`

**Response (обновлено):**
```json
[
  {
    "id": 1,
    "title": "Регламент адаптации новичков",
    "description": "Процесс онбординга новых сотрудников",
    "version": "1.5",
    "folderId": 1,                    // Новое поле
    "folderName": "HR документы",      // Новое поле
    "isActive": true,
    "testsCount": 3,
    "createdBy": {
      "id": 10,
      "name": "Анна Петрова"
    },
    "createdAt": "2025-11-03 14:30:00",
    "updatedAt": "2025-11-04 09:15:00"
  },
  {
    "id": 2,
    "title": "Регламент без папки",
    "description": "Этот регламент в корне",
    "version": "1.0",
    "folderId": null,                 // В корне
    "folderName": null,
    "isActive": true,
    "testsCount": 0,
    "createdBy": {
      "id": 10,
      "name": "Анна Петрова"
    },
    "createdAt": "2025-11-04 10:00:00",
    "updatedAt": "2025-11-04 10:00:00"
  }
]
```

---

## ✅ Преимущества

### 1. **Удобная организация**
- 📂 Регламенты структурированы по папкам
- 🔍 Легко найти нужный регламент
- 📋 Видно сколько регламентов в каждой папке

### 2. **Гибкий выбор**
- ✅ Можно выбирать регламенты из разных папок
- 🔄 Легко переключаться между папками
- 📊 Видно общее количество выбранных регламентов

### 3. **Интуитивный интерфейс**
- ⬅️ Кнопка "Назад" для возврата к корню
- 📍 Breadcrumbs показывает текущее местоположение
- 🎨 Визуальное различие между папками и регламентами

### 4. **Производительность**
- ⚡ Данные загружаются один раз
- 🔍 Фильтрация происходит на клиенте
- 💾 Выбранные регламенты сохраняются при навигации

---

## 🧪 Тестирование

### Сценарий 1: Выбор регламентов из разных папок
1. Перейти к созданию теста
2. На шаге "Выбор регламентов" кликнуть на папку "HR документы"
3. Выбрать 2 регламента (checkbox)
4. Кликнуть "Назад к корню"
5. Кликнуть на папку "Технические инструкции"
6. Выбрать 1 регламент
7. ✅ Должно быть выбрано 3 регламента в итоге

### Сценарий 2: Пустая папка
1. Создать папку без регламентов
2. Перейти к созданию теста
3. Кликнуть на пустую папку
4. ✅ Должно отобразиться "В этой папке пока нет регламентов"

### Сценарий 3: Регламенты без папки
1. Перейти к созданию теста
2. На корневом уровне должны быть видны:
   - Папки (с иконкой 📁)
   - Регламенты без папки (с checkbox)
3. ✅ Можно выбрать регламенты без папки

### Сценарий 4: Предвыбранный регламент из URL
1. Перейти по ссылке `/hr/regulation-tests/create?regulationId=5`
2. Регламент с ID=5 находится в папке "HR документы"
3. ✅ Должен отобразиться корневой уровень с выбранным регламентом
4. ✅ Можно зайти в папку и выбрать дополнительные регламенты

---

## 📝 Изменённые файлы

### Frontend
- `recruitment-front/src/app/(DashboardLayout)/hr/regulation-tests/create/page.tsx`
  - Добавлен `RegulationFolder` интерфейс
  - Добавлено `folderId` в `Regulation` интерфейс
  - Добавлены состояния `folders` и `selectedFolderId`
  - Обновлена `loadRegulations()` для загрузки папок
  - Добавлено вычисляемое значение `displayedRegulations`
  - Обновлён UI шага "Выбор регламентов"

### Backend
- **Изменений не требуется** - API уже поддерживает папки

---

## 🚀 Результат

Теперь при создании теста по регламентам:
1. ✅ HR видит папки с регламентами
2. ✅ Может зайти в папку и выбрать регламенты
3. ✅ Может вернуться назад и зайти в другую папку
4. ✅ Может выбрать регламенты из разных папок
5. ✅ Видит количество регламентов в каждой папке
6. ✅ Видит итоговое количество выбранных регламентов
7. ✅ Интуитивный и удобный интерфейс

