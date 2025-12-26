# Согласие на обработку ПДн при записи через HH OAuth

## 📋 Описание

На странице самозаписи кандидата `/interview/apply/[token]` добавлено **два синхронизированных чекбокса** для получения согласия на обработку персональных данных.

## 🎯 Решение: Вариант D

**Два чекбокса с общим состоянием:**
- Один чекбокс перед кнопкой "Войти через HeadHunter"
- Второй чекбокс в форме ручной записи

### Синхронизация
- ✅ Клик на любой чекбокс меняет состояние **обоих** чекбоксов
- ✅ Обе кнопки ("Войти через HH" и "Начать интервью") одновременно включаются/выключаются
- ✅ Оба чекбокса используют одно состояние `pdnConsent`

## 🔧 Реализация

### Frontend (`src/app/interview/apply/[token]/page.tsx`)

```tsx
// Состояние
const [pdnConsent, setPdnConsent] = useState(false);

// Чекбокс #1 - перед кнопкой HH
<FormControlLabel
  control={
    <Checkbox
      checked={pdnConsent}
      onChange={(e) => setPdnConsent(e.target.checked)}
      name="pdnConsentHh"
      color="primary"
    />
  }
  label={<Typography>...</Typography>}
/>

<Button
  onClick={handleHhAuth}
  disabled={!pdnConsent}  // ← блокируется без галочки
>
  Войти через HeadHunter
</Button>

// Чекбокс #2 - в форме ручной записи
<FormControlLabel
  control={
    <Checkbox
      checked={pdnConsent}
      onChange={(e) => setPdnConsent(e.target.checked)}
      name="pdnConsent"
      color="primary"
    />
  }
  label={<Typography>...</Typography>}
/>

<Button
  type="submit"
  disabled={!pdnConsent || ...}  // ← блокируется без галочки
>
  Начать интервью
</Button>
```

### Стилизация

**Disabled кнопка HH:**
```tsx
sx={{
  bgcolor: '#D6001C',
  '&:disabled': {
    bgcolor: 'rgba(214, 0, 28, 0.3)',
    color: 'rgba(255, 255, 255, 0.5)',
  },
}}
```

## ⚖️ Юридическая корректность

✅ **Явное согласие**: Кандидат должен поставить галочку
✅ **До обработки**: Кнопки заблокированы без согласия
✅ **Информированное**: Текст содержит ссылку на Политику
✅ **Добровольное**: Можно не ставить галочку и уйти

## 🎨 UX

**Преимущества:**
- ✅ Два метода записи (HH и ручная форма) равноправны
- ✅ Не нужно искать чекбокс внизу страницы для HH OAuth
- ✅ Синхронизация делает интерфейс предсказуемым
- ✅ Единый текст согласия для обоих методов

**Поведение:**
1. Кандидат открывает страницу → обе кнопки disabled
2. Ставит галочку возле HH → обе кнопки активны, второй чекбокс тоже ✓
3. Снимает галочку в форме → обе кнопки disabled, первый чекбокс тоже снят

## 📁 Файлы

- `recruitment-front/src/app/interview/apply/[token]/page.tsx` - форма самозаписи
- Backend логирование согласия: `PublicApplyController.php` (уже было)

## 🔄 Backend

Backend в `ConsentLogService` уже логирует согласие:
```php
$this->consentLogService->logConsent(
    candidate: $candidate,
    ipAddress: $request->getClientIp(),
    userAgent: $request->headers->get('User-Agent')
);
```

Теперь это согласие **реально получено явно** перед отправкой.

## ✅ Тестирование

1. Открыть `/interview/apply/[token]`
2. Проверить: обе кнопки disabled
3. Поставить галочку возле HH → обе кнопки активны
4. Снять галочку в форме → обе кнопки disabled
5. Поставить галочку в форме → обе кнопки активны
6. Кликнуть HH → редирект на HH OAuth (если галочка стоит)
7. Заполнить форму и отправить → работает (если галочка стоит)

