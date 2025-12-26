# 🌍 Международные телефонные номера - ГОТОВО

## ✅ Что сделано

### Frontend
1. ✅ Установлен `react-phone-input-2`
2. ✅ Создан компонент `InternationalPhoneInput`
3. ✅ Обновлена валидация в `interview/apply/[token]/page.tsx`
4. ✅ Убрана проверка на "начинается с 7 или 8"
5. ✅ Заменён TextField на InternationalPhoneInput

### Backend
✅ Валидация масок не требуется - номер приходит в международном формате `+XXXXXXXXXXX`

---

## 📱 Как теперь работает

### Пользовательский опыт

```
1. Пользователь видит красивый выбор страны:
   [🇷🇺 ▼] +7 (___) ___-__-__

2. Может выбрать любую страну:
   [🇧🇾 ▼] +375 (__) ___-__-__
   [🇺🇸 ▼] +1 (___) ___-____
   [🇸🇦 ▼] +966 _ ____ ____

3. Маска автоматически подстраивается под выбранную страну

4. Можно искать страну по названию
```

### Технический процесс

```
Frontend:
- Компонент InternationalPhoneInput
- Автоматическое форматирование под страну
- Валидация: +XXXXXXXXXXX (10-15 цифр)

Backend:
- Получает: "+79991234567"
- Сохраняет как есть
- Никакой дополнительной валидации не нужно
```

---

## 🎨 Использование компонента

```typescript
import InternationalPhoneInput from '@/components/InternationalPhoneInput';

<InternationalPhoneInput
  value={phone}
  onChange={(phone) => setPhone(phone)}
  label={_(msg`Номер телефона`)}
  error={phoneError}
  required
  placeholder={_(msg`+7 (999) 123-45-67`)}
/>
```

---

## ✅ Валидация

### Frontend (упрощённая)

```typescript
function validatePhone(phone: string): string => {
  if (!phone.trim()) return _(msg`Телефон обязателен для заполнения`);

  // Убираем все символы кроме цифр и +
  const cleanPhone = phone.replace(/[^\d+]/g, '');

  // Проверяем базовый формат: +XXXXXXXXXX (10-15 цифр)
  if (!/^\+\d{10,15}$/.test(cleanPhone)) {
    return _(msg`Введите корректный международный номер`);
  }

  return '';
}
```

### Backend (не требуется)

Номер приходит уже в валидном формате `+79991234567`.
Symfony Entity просто сохраняет его в поле `phone` как `string`.

---

## 🌍 Поддерживаемые страны

**Приоритетные (показываются сверху):**
- 🇷🇺 Россия (+7)
- 🇧🇾 Беларусь (+375)
- 🇰🇿 Казахстан (+7)
- 🇺🇦 Украина (+380)
- 🇺🇸 США (+1)
- 🇸🇦 Саудовская Аравия (+966)

**Доступны:**
- Все 200+ стран мира!

---

## 📋 Где используется

### Текущее использование:
1. ✅ `/interview/apply/[token]` - публичная форма заявки

### Где ещё можно добавить:

#### Auth Forms
```typescript
// src/app/auth/register/page.tsx
<InternationalPhoneInput
  value={formData.phone}
  onChange={(phone) => setFormData({...formData, phone})}
  label={_(msg`Телефон`)}
  error={errors.phone}
  required
/>
```

#### HR Dashboard
```typescript
// src/app/(DashboardLayout)/hr/candidates/create/page.tsx
<InternationalPhoneInput
  value={candidate.phone}
  onChange={(phone) => setCandidate({...candidate, phone})}
  label={_(msg`Телефон кандидата`)}
  error={errors.phone}
/>
```

#### Profile Settings
```typescript
// src/app/(DashboardLayout)/hr/settings/profile/page.tsx
<InternationalPhoneInput
  value={user.phone}
  onChange={(phone) => setUser({...user, phone})}
  label={_(msg`Ваш телефон`)}
/>
```

---

## 🎛️ Настройки компонента

### Изменить дефолтную страну

```typescript
// В components/InternationalPhoneInput.tsx
country={'us'} // Для США
country={'by'} // Для Беларуси
country={'sa'} // Для Саудовской Аравии
```

### Изменить приоритетные страны

```typescript
preferredCountries={['ru', 'by', 'kz', 'ua', 'us', 'sa', 'ae', 'tr']}
```

### Добавить больше локализаций

```typescript
localization={{
  Russia: 'Россия',
  Belarus: 'Беларусь',
  Kazakhstan: 'Казахстан',
  Ukraine: 'Украина',
  'United States': 'США',
  'Saudi Arabia': 'Саудовская Аравия',
  'United Arab Emirates': 'ОАЭ',
  Turkey: 'Турция',
  // и т.д.
}}
```

---

## 🔄 Миграция существующих номеров

Если в БД есть номера в формате `89991234567`:

```sql
-- Конвертация российских номеров
UPDATE users 
SET phone = CONCAT('+7', SUBSTRING(phone, 2)) 
WHERE phone LIKE '8%' AND LENGTH(phone) = 11;

UPDATE candidates 
SET phone = CONCAT('+7', SUBSTRING(phone, 2)) 
WHERE phone LIKE '8%' AND LENGTH(phone) = 11;
```

---

## 🧪 Тестирование

### Российский номер
```
Ввод: 79991234567
Результат: +7 (999) 123-45-67
Сохранено: +79991234567
```

### Белорусский номер
```
Ввод: 375291234567
Результат: +375 (29) 123-45-67
Сохранено: +375291234567
```

### США номер
```
Ввод: 15551234567
Результат: +1 (555) 123-4567
Сохранено: +15551234567
```

### Саудовская Аравия
```
Ввод: 966512345678
Результат: +966 5 1234 5678
Сохранено: +966512345678
```

---

## 💡 Дополнительно (опционально)

### Добавить libphonenumber-js для точной валидации

```bash
npm install libphonenumber-js
```

```typescript
import { isValidPhoneNumber } from 'libphonenumber-js';

function validatePhone(phone: string): string {
  if (!phone.trim()) return _(msg`Телефон обязателен`);
  
  if (!isValidPhoneNumber(phone)) {
    return _(msg`Введите корректный номер телефона`);
  }
  
  return '';
}
```

Это даст точную валидацию для каждой конкретной страны!

---

## ✅ Готово!

**Что получили:**
- 🌍 Поддержка 200+ стран
- 🎨 Красивый UI с флагами
- ✅ Автоматическое форматирование
- 🔍 Поиск по странам
- 📱 Работает на мобильных
- 🚫 Нет ограничений на "только Россия"

**Пользователи из любой страны теперь могут удобно ввести номер!** 🎉

---

*Создано: 5 декабря 2024*
*Библиотека: react-phone-input-2*
*Размер: ~100kb (флаги + форматы)*







