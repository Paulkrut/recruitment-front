# 🐛 Исправление: Скрыт встроенный label "Phone"

## Проблема

При использовании `InternationalPhoneInput` компонент из библиотеки `react-phone-input-2` показывал свой встроенный label "Phone" (`.special-label`), который:
- Был на английском языке
- Дублировал наш собственный `FormLabel`
- Нарушал единообразие дизайна

## ✅ Решение

### 1. Добавлен prop `specialLabel=""`

```typescript
<PhoneInput
  country={defaultCountry}
  value={value}
  onChange={onChange}
  specialLabel=""  // ← Отключаем встроенный label
  // ... остальные props
/>
```

### 2. Добавлено CSS правило

```css
/* InternationalPhoneInput.css */

/* Скрываем встроенный label библиотеки (мы используем свой FormLabel) */
.react-tel-input .special-label {
  display: none !important;
}
```

### 3. Удалён лишний prop `variant="outlined"`

Пользователь случайно добавил `variant="outlined"` в `InternationalPhoneInput`, но этот prop не существует в нашем компоненте (он есть только у MUI TextField).

**Было:**
```tsx
<InternationalPhoneInput
  variant="outlined"  // ← Не нужен
  value={formData.phone}
  // ...
/>
```

**Стало:**
```tsx
<InternationalPhoneInput
  value={formData.phone}
  // ...
/>
```

---

## 📁 Обновлённые файлы

1. ✅ `src/components/InternationalPhoneInput.tsx` - добавлен `specialLabel=""`
2. ✅ `src/components/InternationalPhoneInput.css` - добавлено правило скрытия
3. ✅ `src/app/auth/register/page.tsx` - удалён `variant="outlined"`

---

## 🎯 Результат

**До:**
```
┌─────────────────────────┐
│ Phone                   │  ← Встроенный label библиотеки (на английском)
│ Телефон *               │  ← Наш FormLabel
│ ┌───────────────────┐   │
│ │ 🇷🇺 +7 (900) ...  │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

**После:**
```
┌─────────────────────────┐
│ Телефон *               │  ← Только наш FormLabel
│ ┌───────────────────┐   │
│ │ 🇷🇺 +7 (900) ...  │   │
│ └───────────────────┘   │
└─────────────────────────┘
```

---

## ✅ Проверка

Откройте любую форму с телефоном:
- `/auth/register`
- `/interview/apply/[token]`
- `/contact`

**Ожидаемый результат:**
- ✅ Виден только один label (наш FormLabel)
- ✅ Label на правильном языке (переведён через LingUI)
- ✅ Нет дублирования
- ✅ Единообразный дизайн со всеми полями формы

---

*Исправлено: 5 декабря 2024*
*Проблема: Встроенный label "Phone" показывался поверх нашего*
*Решение: specialLabel="" + CSS display: none*







