# Шрифты Roboto для PDF экспорта

## Необходимые файлы

Для работы PDF экспорта с кириллическими шрифтами используются следующие файлы:

### 1. Roboto-Regular.ttf
- Путь: `static/Roboto-Regular.ttf`
- Используется для обычного текста

### 2. Roboto-Bold.ttf
- Путь: `static/Roboto-Bold.ttf`
- Используется для заголовков и выделенного текста

## Структура файлов

```
public/fonts/roboto/
├── static/
│   ├── Roboto-Regular.ttf  ← Используется
│   ├── Roboto-Bold.ttf     ← Используется
│   └── ... (другие варианты шрифтов)
├── Roboto-VariableFont_wdth,wght.ttf
├── Roboto-Italic-VariableFont_wdth,wght.ttf
├── OFL.txt
├── README.txt
└── README.md
```

## Как работает система

Функция `exportCandidateToPDFWithFont` автоматически загружает:
- `/fonts/roboto/static/Roboto-Regular.ttf` для обычного текста
- `/fonts/roboto/static/Roboto-Bold.ttf` для жирного текста

## Проверка

После размещения файлов PDF экспорт должен работать с кириллическими шрифтами.

## Доступные варианты шрифтов

В папке `static/` также доступны другие варианты:
- Roboto-Light.ttf
- Roboto-Medium.ttf
- Roboto-SemiBold.ttf
- Roboto-Black.ttf
- И другие...

При необходимости можно изменить используемые шрифты в файле `src/utils/pdfExportWithFont.ts`. 