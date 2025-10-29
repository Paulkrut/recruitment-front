# Переход на React Context для компонентов Header

## Дата: 24 октября 2025

---

## ✅ Что было исправлено

### Проблема:
- Компоненты `BalanceInfo` и `CompanyInfo` монтировались раньше, чем выбиралась компания
- Использовались костыли: `setInterval`, `localStorage.getItem('currentCompanyId')`
- Не было реактивности при смене компании

### Решение:
✅ Перенесли данные о текущей компании в **React Context** (`UserContext`)

---

## 📝 Изменения

### 1. **BalanceInfo.tsx**

**Было:**
```typescript
// Проверка localStorage каждую секунду
const interval = setInterval(() => {
  const companyId = localStorage.getItem('currentCompanyId');
  if (companyId && !balance && !loading) {
    loadBalance();
  }
}, 1000);
```

**Стало:**
```typescript
import { useUser } from '@/contexts/UserContext';

const { currentCompany } = useUser();

// Автоматическая загрузка при изменении компании
useEffect(() => {
  if (currentCompany) {
    loadBalance();
  }
}, [currentCompany]);
```

### 2. **CompanyInfo.tsx**

**Было:**
```typescript
// Загрузка из localStorage
const companyId = localStorage.getItem('currentCompanyId');
```

**Стало:**
```typescript
import { useUser } from '@/contexts/UserContext';

const { currentCompany } = useUser();

// Мгновенно показываем название, затем загружаем детали (логотип, ИНН)
const displayName = companyDetails?.name || currentCompany.name;
```

### 3. **UserContext.tsx**

Добавлено сохранение `currentCompanyId` для совместимости:
```typescript
localStorage.setItem('current_company', company.id.toString());
localStorage.setItem('currentCompanyId', company.id.toString()); // Для других компонентов
```

---

## 🎯 Преимущества

### До (localStorage + setInterval):
- ❌ Проверка каждую секунду
- ❌ Задержка в обновлении (до 1 сек)
- ❌ Неэффективно
- ❌ Не реактивно
- ❌ Много кода

### После (React Context):
- ✅ Мгновенное обновление
- ✅ Реактивность из коробки
- ✅ Чистый код
- ✅ Централизованное управление состоянием
- ✅ Автоматическая синхронизация

---

## 🔄 Как это работает

```
1. Пользователь авторизуется
   └─> UserContext загружает список компаний

2. Выбирается компания (автоматически или вручную)
   └─> UserContext.setCurrentCompany(company)
       └─> Сохраняет в localStorage (для совместимости)
       └─> Обновляет состояние currentCompany

3. Компоненты Header реагируют
   ├─> BalanceInfo видит currentCompany → загружает баланс
   └─> CompanyInfo видит currentCompany → показывает название и загружает детали
```

---

## 📊 Последовательность рендеринга

### Первая загрузка:
```
1. Layout монтируется
   ├─> Header монтируется
   │   ├─> BalanceInfo → loading (нет компании)
   │   └─> CompanyInfo → null (нет компании)
   └─> UserContext загружается
       └─> Автовыбор компании (если одна)
           └─> setCurrentCompany(company)
               ├─> BalanceInfo → загружает баланс
               └─> CompanyInfo → показывает компанию
```

### Смена компании:
```
1. Пользователь выбирает другую компанию
   └─> setCurrentCompany(newCompany)
       ├─> BalanceInfo useEffect срабатывает → загружает новый баланс
       └─> CompanyInfo useEffect срабатывает → загружает новые детали
```

---

## 🔧 Совместимость

`UserContext` сохраняет ID компании в **два** ключа localStorage:

1. `current_company` - для UserContext
2. `currentCompanyId` - для совместимости со старыми компонентами

Это позволяет постепенно мигрировать остальные компоненты на контекст без ломания функционала.

---

## 🚀 Следующие шаги (опционально)

### Можно мигрировать на контекст:
- Компоненты страниц биллинга
- Компоненты кандидатов
- Компоненты вакансий
- Любые другие компоненты, использующие `localStorage.getItem('currentCompanyId')`

### Пример миграции:
```typescript
// Было
const companyId = localStorage.getItem('currentCompanyId');

// Стало
import { useUser } from '@/contexts/UserContext';
const { currentCompany } = useUser();
const companyId = currentCompany?.id;
```

---

## ✅ Результат

**Header теперь:**
- ✨ Мгновенно реагирует на смену компании
- 🚀 Загружает данные автоматически
- 🧹 Без костылей и таймеров
- 💪 Использует правильные React паттерны
- 🔄 Полностью реактивный

---

**Готово! 🎉**

**Разработчик:** AI Assistant (Claude Sonnet 4.5)  
**Дата:** 24 октября 2025





