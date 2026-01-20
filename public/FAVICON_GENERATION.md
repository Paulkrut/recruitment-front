# Генерация фавиконок

## Исходный файл
`favicon.svg` - векторное изображение на основе иконки из логотипа (речевые пузыри).

## Необходимые размеры для генерации

Для полной поддержки всех устройств и браузеров нужно сгенерировать следующие файлы:

### 1. favicon.ico (мультиразмерный ICO)
Содержит: 16x16, 32x32, 48x48 пикселей
```bash
# Используя ImageMagick
convert favicon.svg -define icon:auto-resize=16,32,48 favicon.ico
```

### 2. PNG версии
```bash
# Для favicon-16x16.png
convert favicon.svg -resize 16x16 favicon-16x16.png

# Для favicon-32x32.png
convert favicon.svg -resize 32x32 favicon-32x32.png
```

### 3. Apple Touch Icon
```bash
# Для apple-touch-icon.png (180x180)
convert favicon.svg -resize 180x180 apple-touch-icon.png
```

## Онлайн генератор

Если ImageMagick недоступен, можно использовать онлайн-сервисы:
- https://realfavicongenerator.net/
- https://favicon.io/

Просто загрузите `favicon.svg` и скачайте все необходимые размеры.

## Структура файлов

После генерации в папке `public/` должны быть:
- favicon.svg (основной, уже создан)
- favicon.ico (для старых браузеров)
- favicon-16x16.png
- favicon-32x32.png
- apple-touch-icon.png (180x180)

## Проверка

После размещения файлов проверьте:
1. В браузере во вкладке должна отображаться иконка
2. При добавлении сайта на домашний экран iOS должна использоваться правильная иконка
3. В закладках браузера должна быть видна иконка

