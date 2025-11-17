# Миграция существующего кода на LinguiJS

## 📋 Общий подход

Эта инструкция поможет перевести существующий код с хардкодными текстами на LinguiJS.

## 🔄 Паттерны миграции

### 1. Простой текст в JSX

#### Было:
```tsx
<Typography>Список вакансий</Typography>
<Button>Создать</Button>
<h1>Добро пожаловать</h1>
```

#### Стало:
```tsx
import { Trans } from '@lingui/react';

<Typography><Trans>Список вакансий</Trans></Typography>
<Button><Trans>Создать</Trans></Button>
<h1><Trans>Добро пожаловать</Trans></h1>
```

### 2. Атрибуты (placeholder, title, aria-label)

#### Было:
```tsx
<TextField 
  label="Название вакансии"
  placeholder="Введите название"
  helperText="Обязательное поле"
/>
```

#### Стало:
```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();
  
  return (
    <TextField 
      label={_(msg`Название вакансии`)}
      placeholder={_(msg`Введите название`)}
      helperText={_(msg`Обязательное поле`)}
    />
  );
}
```

### 3. Строки в переменных

#### Было:
```tsx
const title = "Список кандидатов";
const description = "Здесь отображаются все кандидаты";
```

#### Стало:
```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();
  
  const title = _(msg`Список кандидатов`);
  const description = _(msg`Здесь отображаются все кандидаты`);
  
  return <div>...</div>;
}
```

### 4. Текст с переменными

#### Было:
```tsx
<Typography>Привет, {userName}!</Typography>
<p>Найдено {count} вакансий</p>
```

#### Стало:
```tsx
import { Trans } from '@lingui/react';

<Typography><Trans>Привет, {userName}!</Trans></Typography>
<p><Trans>Найдено {count} вакансий</Trans></p>
```

### 5. Условный текст

#### Было:
```tsx
<Chip label={status === 'active' ? 'Активен' : 'Неактивен'} />
```

#### Стало:
```tsx
import { Trans } from '@lingui/react';

<Chip 
  label={status === 'active' 
    ? <Trans>Активен</Trans> 
    : <Trans>Неактивен</Trans>
  } 
/>
```

### 6. Массивы с текстами

#### Было:
```tsx
const tabs = ['Все', 'Активные', 'Архив'];

tabs.map(tab => <Tab label={tab} />)
```

#### Стало:
```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();
  
  const tabs = [
    _(msg`Все`),
    _(msg`Активные`),
    _(msg`Архив`)
  ];

  return tabs.map(tab => <Tab label={tab} />);
}
```

### 7. Объекты с метаданными

#### Было:
```tsx
const columns = [
  { field: 'name', headerName: 'Имя' },
  { field: 'email', headerName: 'Email' },
  { field: 'status', headerName: 'Статус' },
];
```

#### Стало:
```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();
  
  const columns = [
    { field: 'name', headerName: _(msg`Имя`) },
    { field: 'email', headerName: _(msg`Email`) },
    { field: 'status', headerName: _(msg`Статус`) },
  ];
  
  return <DataGrid columns={columns} />;
}
```

### 8. Множественное число

#### Было:
```tsx
<Typography>
  {count === 1 ? '1 кандидат' : count < 5 ? `${count} кандидата` : `${count} кандидатов`}
</Typography>
```

#### Стало:
```tsx
import { Plural } from '@lingui/react';

<Typography>
  <Plural 
    value={count}
    one="# кандидат"
    few="# кандидата"
    many="# кандидатов"
    other="# кандидатов"
  />
</Typography>
```

### 9. Форматирование дат

#### Было:
```tsx
const dateStr = new Date().toLocaleDateString('ru-RU');
```

#### Стало:
```tsx
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { i18n } = useLingui();
  
  const dateStr = i18n.date(new Date(), { 
    dateStyle: 'medium' 
  });
  
  return <span>{dateStr}</span>;
}
```

### 10. Alert/Toast сообщения

#### Было:
```tsx
toast.success('Вакансия успешно создана');
toast.error('Произошла ошибка');
```

#### Стало:
```tsx
import { msg } from '@lingui/macro';
import { useLingui } from '@lingui/react';

function MyComponent() {
  const { _ } = useLingui();
  
  const handleSubmit = () => {
    try {
      // ...
      toast.success(_(msg`Вакансия успешно создана`));
    } catch (error) {
      toast.error(_(msg`Произошла ошибка`));
    }
  };
}
```

## 🎯 Пример полной миграции компонента

### Было:

```tsx
export function VacancyCard({ vacancy }) {
  return (
    <Card>
      <Typography variant="h6">Вакансия</Typography>
      <TextField 
        label="Название"
        placeholder="Введите название"
      />
      <Button>Сохранить</Button>
      <Chip label={vacancy.isActive ? 'Активна' : 'Неактивна'} />
      <Typography>Кандидатов: {vacancy.candidatesCount}</Typography>
    </Card>
  );
}
```

### Стало:

```tsx
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';

export function VacancyCard({ vacancy }) {
  const { _ } = useLingui();
  
  return (
    <Card>
      <Typography variant="h6">
        <Trans>Вакансия</Trans>
      </Typography>
      
      <TextField 
        label={_(msg`Название`)}
        placeholder={_(msg`Введите название`)}
      />
      
      <Button>
        <Trans>Сохранить</Trans>
      </Button>
      
      <Chip 
        label={vacancy.isActive 
          ? <Trans>Активна</Trans> 
          : <Trans>Неактивна</Trans>
        } 
      />
      
      <Typography>
        <Trans>Кандидатов: {vacancy.candidatesCount}</Trans>
      </Typography>
    </Card>
  );
}
```

## 📝 Workflow миграции

### Шаг 1: Выберите компонент

Начните с небольших компонентов, затем переходите к крупным страницам.

### Шаг 2: Добавьте импорты

```tsx
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';
```

### Шаг 3: Добавьте хук (если нужно)

```tsx
const { _ } = useLingui();
```

### Шаг 4: Замените тексты

- JSX текст → `<Trans>текст</Trans>`
- Атрибуты → `_(msg\`текст\`)`

### Шаг 5: Извлеките и скомпилируйте

```bash
npm run i18n:extract-compile
```

### Шаг 6: Добавьте переводы

Откройте `src/locales/en/messages.po` и добавьте английские переводы.

### Шаг 7: Протестируйте

Проверьте компонент на обоих языках.

## 🚫 Что НЕ нужно переводить

- Названия полей в API
- Технические строки (ID, keys)
- Пути URL
- Имена классов CSS
- Console.log сообщения
- Комментарии в коде

## ✅ Приоритеты миграции

### Высокий приоритет:
1. ✅ Главная страница
2. ✅ Страницы авторизации
3. ✅ Список вакансий
4. ✅ Создание/редактирование вакансий
5. ✅ Список кандидатов

### Средний приоритет:
6. Профиль пользователя
7. Настройки
8. Регламенты и тесты
9. Интеграции

### Низкий приоритет:
10. Административные страницы
11. Редко используемые функции
12. Служебные страницы

## 💡 Полезные советы

1. **Миграция постепенно**: Не обязательно переводить всё сразу
2. **Тестируйте часто**: После каждого компонента запускайте extract и compile
3. **Используйте поиск**: `Ctrl+F` для поиска строк в кавычках
4. **Коммитьте часто**: После каждой успешной миграции компонента
5. **Проверяйте .po файлы**: Убедитесь, что все тексты корректно извлечены

## 🔍 Поиск текстов для миграции

### В VS Code:

Регулярные выражения для поиска:
- `["']\w+\s+\w+["']` - находит текст в кавычках
- `>\s*[А-Яа-я].+<` - находит русский текст между тегами

## 📊 Отслеживание прогресса

Создайте чеклист в вашей системе управления задачами:

```
[ ] src/app/auth/login/page.tsx
[ ] src/app/auth/register/page.tsx
[ ] src/app/(DashboardLayout)/hr/vacancies/page.tsx
[ ] src/app/(DashboardLayout)/hr/candidates/page.tsx
...
```

---

**Начните с малого и двигайтесь постепенно!** 🚀


