# Excel-отчёты: Архитектура и использование

## 📊 Обзор

Модульная система для генерации Excel-отчётов на frontend с использованием ExcelJS.

## 📁 Структура

```
recruitment-front/src/services/export/
├── shared/                              # Общие утилиты для всех отчётов
│   ├── types.ts                         # Общие типы
│   ├── ExcelStyleHelper.ts              # Стили (цвета, шрифты, форматирование)
│   ├── ChartBuilder.ts                  # Построитель диаграмм
│   └── TableBuilder.ts                  # Построитель таблиц
│
└── reports/                             # Все отчёты
    ├── vacancy/                         # 📊 Отчёт по вакансии
    │   ├── types.ts                     # Типы данных отчёта
    │   ├── VacancyReportDataService.ts  # Загрузка данных с API
    │   ├── VacancyReportGenerator.ts    # Главный генератор
    │   ├── SummarySheetBuilder.ts       # Страница 1: Сводный отчёт
    │   └── CandidatesSheetBuilder.ts    # Страница 2: Список кандидатов
    │
    └── comparison/                      # 🔀 Сравнение кандидатов
        └── ComparisonReportGenerator.ts # Генератор сравнения
```

## 🎯 Отчёт по вакансии

### Страница 1: Сводный отчёт

- **Общая информация:** название вакансии, дата, статистика
- **Распределение по баллам:** таблица + визуализация (0-10)
- **Статусы кандидатов:** завершено, в процессе, не начато
- **Топ-5 кандидатов:** лучшие результаты

### Страница 2: Список кандидатов

- Полный список всех кандидатов
- Имя, email, телефон, балл, статус, даты
- Цветовое выделение баллов

## 🚀 Использование

### Frontend (в компоненте):

```typescript
import { VacancyReportGenerator } from '@/services/export/reports/vacancy/VacancyReportGenerator';

// Генерация отчёта
await VacancyReportGenerator.generate(vacancyId);
```

### Backend API endpoint:

```
GET /api/admin/vacancies/{id}/export-data
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "vacancy": { "id": 1, "title": "Senior PHP Developer", ... },
    "summary": {
      "totalCandidates": 45,
      "completedInterviews": 32,
      "averageScore": 7.2,
      "scoreDistribution": [...],
      "statusStats": [...],
      "topCandidates": [...]
    },
    "candidates": [...]
  }
}
```

## 🎨 Визуализация

### Диаграммы (текстовые):

- **Гистограмма:** `████████` (Unicode блоки)
- **Круговая диаграмма:** `🔵 🟢 🟡 🟠 🔴` (emoji)
- **Прогресс-бары:** `▓▓▓▓▓` (Unicode)

### Цветовое кодирование оценок:

- 🟢 **9-10:** Отлично (зелёный)
- 🔵 **7-8:** Хорошо (синий)
- 🟡 **5-6:** Средне (жёлтый)
- 🔴 **0-4:** Плохо (красный)

## 🔧 Добавление нового отчёта

### 1. Создать структуру:

```
services/export/reports/my-report/
├── types.ts
├── MyReportDataService.ts
├── MyReportGenerator.ts
└── MySheetBuilder.ts
```

### 2. Типы данных:

```typescript
// types.ts
export interface MyReportData {
  // Ваши данные
}

export interface MyReportApiResponse {
  success: boolean;
  data?: MyReportData;
  error?: string;
}
```

### 3. Data Service:

```typescript
// MyReportDataService.ts
export class MyReportDataService {
  static async fetchData(id: number): Promise<MyReportData> {
    const response = await fetch(`${API_BASE}/api/my-endpoint/${id}/export-data`);
    // ...
    return result.data;
  }
}
```

### 4. Sheet Builder:

```typescript
// MySheetBuilder.ts
import { ExcelStyleHelper } from '../../shared/ExcelStyleHelper';
import { ChartBuilder } from '../../shared/ChartBuilder';
import { TableBuilder } from '../../shared/TableBuilder';

export class MySheetBuilder {
  static build(workbook: ExcelJS.Workbook, data: MyReportData): void {
    const sheet = workbook.addWorksheet('My Report');
    // Используем общие утилиты
    ExcelStyleHelper.applyHeaderStyle(sheet.getRow(1));
    // ...
  }
}
```

### 5. Generator:

```typescript
// MyReportGenerator.ts
export class MyReportGenerator {
  static async generate(id: number): Promise<void> {
    const data = await MyReportDataService.fetchData(id);
    const workbook = new ExcelJS.Workbook();
    MySheetBuilder.build(workbook, data);
    // Скачать файл
  }
}
```

### 6. Backend endpoint:

```php
#[Route('/api/my-endpoint/{id}/export-data', methods: ['GET'])]
public function getExportData(int $id): JsonResponse {
    // Собираем данные
    return $this->json(['success' => true, 'data' => $data]);
}
```

## 📦 Зависимости

- **ExcelJS** (`^4.4.0`): Генерация Excel файлов
- **React/Next.js**: Frontend framework
- **Symfony**: Backend API

## 🎯 Преимущества архитектуры

1. ✅ **Модульность:** Каждый отчёт изолирован
2. ✅ **Переиспользование:** Общие утилиты в `shared/`
3. ✅ **Масштабируемость:** Легко добавить новые отчёты
4. ✅ **Тестируемость:** Каждый модуль независим
5. ✅ **AI-Friendly:** Понятная структура, чёткие интерфейсы
6. ✅ **Производительность:** Генерация на клиенте, не нагружает сервер

## 📝 Файлы отчёта по вакансии

- `recruitment/src/Controller/Api/AdminVacancyController.php` - Backend API
- `recruitment-front/src/services/export/reports/vacancy/*` - Frontend модули
- `recruitment-front/src/app/(DashboardLayout)/hr/vacancies/[id]/page.tsx` - UI кнопка

## 🚦 Статус

✅ **Реализовано:**
- Backend API endpoint
- Frontend структура services/export/
- Shared утилиты (ExcelStyleHelper, ChartBuilder, TableBuilder)
- Отчёт по вакансии (2 страницы)
- Миграция существующего comparison report
- UI кнопка в вакансии

## 📅 Changelog

### 2026-01-29
- ✅ Создана модульная архитектура экспорта
- ✅ Реализован отчёт по вакансии с двумя страницами
- ✅ Добавлены диаграммы и цветовое кодирование
- ✅ Перенесён существующий comparison report в новую структуру

