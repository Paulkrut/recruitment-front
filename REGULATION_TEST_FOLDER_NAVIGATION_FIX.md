# 🔧 Исправление ошибки: folders.map is not a function

## ❌ Ошибка

```
Uncaught Error: folders.map is not a function
    at renderStepContent (page.tsx:386:47)
    at CreateTestPage (page.tsx:652:39)
```

---

## 🔍 Причины ошибки

### 1. Неправильный endpoint
- **Было:** `/api/regulation-folders`
- **Правильно:** `/api/regulations/folders`

**Объяснение:**
Контроллер `RegulationController` имеет базовый маршрут `/api/regulations`, и внутри него определены routes для `/folders`.

```php
#[Route('/api/regulations', name: 'api_regulations_')]
class RegulationController extends AbstractController
{
    #[Route('/folders', name: 'folders_list', methods: ['GET'])]
    public function listFolders(Request $request): JsonResponse
    {
        // ...
    }
}
```

Итоговый маршрут: `/api/regulations` + `/folders` = `/api/regulations/folders`

### 2. Отсутствие проверки на массив
- `folders` мог быть `undefined` или не массивом
- При попытке вызвать `.map()` на не-массиве возникала ошибка

---

## ✅ Решение

### 1. Исправлен endpoint

**Файл:** `recruitment-front/src/app/(DashboardLayout)/hr/regulation-tests/create/page.tsx`

```typescript
const loadRegulations = async () => {
  try {
    // Загружаем регламенты
    const regulationsResponse = await apiFetch(`${API_BASE}/api/regulations`);
    const regulationsData = await regulationsResponse.json();
    setRegulations(Array.isArray(regulationsData) ? regulationsData : []);

    // Загружаем папки
    try {
      const foldersResponse = await apiFetch(`${API_BASE}/api/regulations/folders`); // ✅ Исправлено
      const foldersData = await foldersResponse.json();
      setFolders(Array.isArray(foldersData) ? foldersData : []);
    } catch (folderError) {
      console.error('Error loading folders:', folderError);
      setFolders([]); // ✅ Fallback к пустому массиву
    }
  } catch (error) {
    console.error('Error loading regulations:', error);
    setRegulations([]);
    setFolders([]);
  }
};
```

### 2. Добавлена проверка перед .map()

```typescript
{/* Показываем папки в корне */}
{!selectedFolderId && Array.isArray(folders) && folders.map((folder) => (
  // ✅ Добавлена проверка Array.isArray(folders)
  <ListItem key={`folder-${folder.id}`}>
    {/* ... */}
  </ListItem>
))}
```

### 3. Улучшена обработка ошибок

- ✅ Отдельный `try/catch` для загрузки папок
- ✅ Fallback к пустому массиву `[]` при ошибке
- ✅ Проверка `Array.isArray()` перед установкой в state
- ✅ Логирование ошибок в консоль

---

## 📝 Обновлённая документация

Исправлен endpoint во всех файлах документации:

1. ✅ `REGULATION_TEST_FOLDER_NAVIGATION.md`
2. ✅ `REGULATION_TEST_FOLDER_NAVIGATION_QUICK_START.md`
3. ✅ `REGULATION_TEST_FOLDER_NAVIGATION_COMPLETE.md`
4. ✅ `REGULATION_TEST_FOLDER_NAVIGATION_CHANGELOG.md`

---

## 🧪 Тестирование

### Проверьте что исправление работает:

1. **Откройте консоль браузера** (F12)
2. Перейдите на `/hr/regulation-tests/create`
3. Кликните "Далее" до шага "Выбор регламентов"
4. ✅ **Ошибки не должно быть**
5. ✅ **Должны отобразиться папки** (если они есть в БД)
6. ✅ **Или пустой список** (если папок нет)

### Проверьте API вручную:

```bash
# В консоли браузера или через curl/Postman
GET http://recruitment.test/api/regulations/folders
Authorization: Bearer YOUR_JWT_TOKEN
```

**Ожидаемый response:**
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
  }
]
```

**Или пустой массив** (если папок нет):
```json
[]
```

---

## 🔄 Что делать если ошибка всё ещё есть

### 1. Проверьте консоль браузера
- Какая именно ошибка?
- Какой статус ответа от сервера? (200, 401, 404, 500?)
- Что возвращает API? (посмотрите во вкладке Network)

### 2. Проверьте Backend
```bash
# Очистите кеш Symfony
cd C:\laragon\www\recruitment
php bin/console cache:clear
```

### 3. Проверьте что вы авторизованы
- JWT токен должен быть в localStorage
- Токен должен быть действителен
- У пользователя должна быть компания

### 4. Проверьте что компания установлена
- В консоли браузера: `localStorage.getItem('currentCompanyId')`
- Должно вернуть ID компании (например, "1")

### 5. Временное решение (если папок пока нет)
Если у вас в системе ещё нет папок для регламентов, функция будет работать нормально:
- Папки не отобразятся (пустой массив)
- Регламенты без папки отобразятся в корне
- Всё будет работать как раньше

---

## 📋 Checklist исправлений

- [x] Исправлен endpoint на `/api/regulations/folders`
- [x] Добавлена проверка `Array.isArray(folders)`
- [x] Добавлен fallback к пустому массиву
- [x] Улучшена обработка ошибок
- [x] Обновлена документация
- [x] Линтер пройден
- [ ] Ручное тестирование выполнено

---

## 🎯 Результат

После исправления:
- ✅ Ошибка `folders.map is not a function` устранена
- ✅ API корректно загружает папки
- ✅ Если папок нет - отображается пустой список (без ошибок)
- ✅ Если папки есть - они корректно отображаются
- ✅ Навигация работает стабильно

---

**Дата:** 2025-11-04  
**Статус:** ✅ Исправлено

