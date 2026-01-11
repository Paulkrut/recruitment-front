# 🔧 Backend TODO: Добавить данные вакансии и кандидата в API

## Эндпоинт: `GET /api/public/interview/{token}/prepare`

### ❌ Текущий ответ:
```json
{
  "total": 6,
  "durationSec": 1080,
  "status": "in_progress"
}
```

### ✅ Нужно добавить:
```json
{
  "total": 6,
  "durationSec": 1080,
  "status": "in_progress",
  
  "vacancy": {
    "title": "Frontend-разработчик (React)",
    "company": "SofiHR",
    "location": "Москва, удалённо",
    "salary": "150 000 - 200 000 ₽",
    "description": "Описание вакансии...",
    "responsibilities": [
      "Разработка UI на React",
      "Работа с TypeScript"
    ],
    "requirements": [
      "Опыт с React от 2 лет",
      "Знание TypeScript"
    ]
  },
  
  "candidate": {
    "firstName": "Иван",
    "lastName": "Петров",
    "email": "ivan@example.com"
  }
}
```

---

## 📝 PHP Пример (примерный код):

```php
public function prepare(string $token): JsonResponse
{
    $session = InterviewSession::where('token', $token)->firstOrFail();
    
    return response()->json([
        'total' => $session->total_questions,
        'durationSec' => $session->duration_seconds,
        'status' => $session->status,
        
        // ДОБАВИТЬ ЭТО:
        'vacancy' => [
            'title' => $session->vacancy->title,
            'company' => $session->vacancy->company->name ?? null,
            'location' => $session->vacancy->location ?? null,
            'salary' => $session->vacancy->salary_range ?? null,
            'description' => $session->vacancy->description ?? null,
            'responsibilities' => $session->vacancy->responsibilities 
                ? json_decode($session->vacancy->responsibilities, true) 
                : [],
            'requirements' => $session->vacancy->requirements 
                ? json_decode($session->vacancy->requirements, true) 
                : [],
        ],
        
        'candidate' => [
            'firstName' => $session->candidate->first_name,
            'lastName' => $session->candidate->last_name,
            'email' => $session->candidate->email ?? null,
        ],
    ]);
}
```

---

## 🎯 Зачем это нужно:

1. **Для прямых ссылок** - кандидат увидит информацию о вакансии перед интервью
2. **Лучший UX** - кандидат вспомнит детали вакансии
3. **Контекст** - понимание что за интервью проходит

---

## ⚠️ Временное решение:

Пока бэкенд не готов, во фронтенде используются **mock-данные для тестирования**.

Ищи в коде комментарии:
```javascript
// ВРЕМЕННО: Мок-данные для тестирования UI
// TODO: Удалить когда бэкенд будет отдавать vacancy
```

Когда бэкенд будет готов - просто удали этот код с моками!

---

## 📋 Checklist:

- [ ] Добавить `vacancy` объект в ответ API
- [ ] Добавить `candidate` объект в ответ API
- [ ] Проверить что все поля опциональные (кроме title, firstName, lastName)
- [ ] Протестировать на фронте
- [ ] Удалить mock-данные из `page.tsx`

---

## 🔍 Как проверить что работает:

1. Открой консоль браузера
2. Перейди на `/interview/{token}`
3. Увидишь:
   - ✅ `Vacancy data found:` - если данные есть
   - ⚠️ `using mock data for testing` - если используются моки
4. Экран с информацией о вакансии должен показаться
5. После клика "Перейти к интервью" → проверка оборудования

