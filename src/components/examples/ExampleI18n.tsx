'use client';
import React from 'react';
import { Trans, useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';
import { Box, Button, TextField, Typography } from '@mui/material';

/**
 * Пример компонента с переводами через LinguiJS
 * 
 * Использование:
 * 1. Импортируйте Trans для текста
 * 2. Импортируйте msg и useLingui для атрибутов
 * 3. Оберните тексты в <Trans>
 * 4. Для атрибутов используйте _(msg`текст`)
 */
export function ExampleI18nComponent() {
  const { _ } = useLingui();

  return (
    <Box sx={{ p: 3 }}>
      {/* Простой заголовок */}
      <Typography variant="h4">
        <Trans>Пример использования переводов</Trans>
      </Typography>

      {/* Текст с описанием */}
      <Typography variant="body1" sx={{ mt: 2 }}>
        <Trans>
          Это демонстрационный компонент, показывающий как правильно использовать
          LinguiJS для интернационализации вашего приложения.
        </Trans>
      </Typography>

      {/* Поле ввода с переведенными атрибутами */}
      <TextField
        fullWidth
        label={_(msg`Название вакансии`)}
        placeholder={_(msg`Введите название вакансии`)}
        helperText={_(msg`Это поле обязательно для заполнения`)}
        sx={{ mt: 2 }}
      />

      {/* Кнопка с переводом */}
      <Button variant="contained" sx={{ mt: 2 }}>
        <Trans>Создать вакансию</Trans>
      </Button>

      {/* Пример с переменной */}
      <Typography variant="body2" sx={{ mt: 2 }}>
        <Trans>
          Количество кандидатов: {42}
        </Trans>
      </Typography>
    </Box>
  );
}

/**
 * Пример использования в обычном компоненте вакансий
 */
export function VacancyListExample() {
  const { _ } = useLingui();

  return (
    <Box>
      <Typography variant="h5">
        <Trans>Список вакансий</Trans>
      </Typography>
      
      <TextField
        placeholder={_(msg`Поиск по вакансиям`)}
        aria-label={_(msg`Поле поиска вакансий`)}
      />
      
      <Button>
        <Trans>Добавить вакансию</Trans>
      </Button>
    </Box>
  );
}


