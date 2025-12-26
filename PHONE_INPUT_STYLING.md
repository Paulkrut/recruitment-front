# 🎨 InternationalPhoneInput - Стилизация под ваш дизайн

## ✅ Что изменено

Компонент теперь полностью соответствует вашему дизайн-системе:

### До (стандартный MUI):
```
Height: 56px
Border Radius: 4px
Font Size: 16px
Padding: 16.5px 14px
```

### После (ваш дизайн):
```
Height: 44px ✅
Border Radius: 7px ✅
Font Size: 14px ✅
Padding: 12px 14px ✅
```

---

## 🎨 Визуальные улучшения

### 1. Размеры и отступы
- **Height**: 44px (как все ваши TextField'ы)
- **Padding**: 12px 14px (соответствует `MuiOutlinedInput`)
- **Font Size**: 14px (компактнее)

### 2. Закругления
- **Border Radius**: 7px (вместо стандартных 4px)
- **Button Radius**: 7px 0 0 7px (левая сторона)
- **Dropdown Radius**: 7px

### 3. Цвета и borders
- **Border Color**: `theme.palette.grey[300]` (как в вашей теме)
- **Hover**: `theme.palette.grey[400]`
- **Focus**: `primary.main` с border-width: 2px
- **Error**: `error.main` с красной обводкой

### 4. Состояния
- **Normal**: серая обводка
- **Hover**: чуть темнее
- **Focus**: синяя обводка 2px
- **Error**: красная обводка
- **Disabled**: серый фон (как в MUI)

### 5. Dropdown
- **Shadow**: `theme.shadows[8]` (как в вашей теме)
- **Colors**: адаптируется под светлую/тёмную тему
- **Search**: закруглённое поле поиска 7px

### 6. Тёмная тема
- Автоматическая адаптация цветов
- Правильные контрасты
- Соответствие вашей палитре

---

## 📁 Созданные файлы

### 1. `InternationalPhoneInput.tsx`
- Основной компонент
- Интеграция с вашей темой через `useTheme()`
- Использует все цвета из палитры

### 2. `InternationalPhoneInput.css`
- Кастомные стили для hover/focus
- Адаптация под тёмную тему
- Стили для dropdown и search

---

## 🎯 Сравнение с TextField

### Стандартный TextField:
```typescript
<TextField
  label="Email"
  variant="outlined"
  fullWidth
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={!!errors.email}
  helperText={errors.email}
/>
```

### InternationalPhoneInput (выглядит точно так же!):
```typescript
<InternationalPhoneInput
  label={_(msg`Телефон`)}
  value={phone}
  onChange={(phone) => setPhone(phone)}
  error={errors.phone}
/>
```

---

## 📱 Примеры использования

### В форме регистрации:
```typescript
<TextField label="Имя" ... />
<TextField label="Должность" ... />
<TextField label="Компания" ... />
<TextField label="Email" ... />
<InternationalPhoneInput label="Телефон" ... />  // ← Выглядит одинаково!
```

### Все поля визуально идентичны:
- Одинаковая высота
- Одинаковое закругление
- Одинаковые отступы
- Одинаковые цвета

---

## 🎨 Детали стилизации

### Input стили:
```typescript
{
  height: '44px',          // Как в вашем дизайне
  borderRadius: '7px',     // Соответствует Cards (18px/2.5)
  fontSize: '14px',        // Компактный шрифт
  fontFamily: theme.typography.fontFamily, // Ваш шрифт
  paddingTop: '12px',      // Как в MuiOutlinedInput
  paddingBottom: '12px',
  paddingLeft: '48px',     // Место для флага
  paddingRight: '14px',
}
```

### Button (флаг) стили:
```typescript
{
  height: '44px',          // Как input
  width: '46px',           // Стандартная ширина
  borderRadius: '7px 0 0 7px', // Соответствует input
  borderRight: 'none',     // Без двойной линии
}
```

### Dropdown стили:
```typescript
{
  maxHeight: '200px',      // Не слишком большой
  borderRadius: '7px',     // Соответствует общему стилю
  boxShadow: theme.shadows[8], // Из вашей темы
}
```

---

## 🌓 Поддержка тёмной темы

Компонент автоматически адаптируется:

**Светлая тема:**
- Background: `#ffffff`
- Border: `grey[300]`
- Text: `text.primary`

**Тёмная тема:**
- Background: `#1e1e1e`
- Border: `grey[200]`
- Text: `#ffffff`
- Highlight: `rgba(144, 202, 249, 0.16)`

---

## ✅ Checklist соответствия дизайну

- [x] Высота 44px (как TextField)
- [x] Border radius 7px
- [x] Padding 12px 14px
- [x] Font size 14px
- [x] Font family из темы
- [x] Цвета из палитры темы
- [x] Hover эффект
- [x] Focus эффект (2px border)
- [x] Error состояние (красная обводка)
- [x] Disabled состояние (серый фон)
- [x] Поддержка тёмной темы
- [x] Box shadow из темы
- [x] FormHelperText для ошибок
- [x] Margin bottom 2 (как TextField)

---

## 🧪 Проверка

Откройте любую форму:
- `/auth/register`
- `/interview/apply/token`
- `/contact`

**Сравните:**
- Email TextField ← должен выглядеть одинаково с →
- Phone InternationalPhoneInput

**Проверьте состояния:**
- Normal - обычное состояние
- Hover - при наведении
- Focus - при клике
- Error - с ошибкой валидации
- Disabled - неактивное поле

---

## 🎉 Готово!

Компонент теперь **полностью** соответствует вашему дизайну и выглядит как родной TextField! 🎨

---

*Обновлено: 5 декабря 2024*
*Стилизация: 100% соответствие дизайн-системе*







