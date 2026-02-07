import React from "react";
import {
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Button,
} from "@mui/material";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import {
  IconTrash,
  IconArrowUp,
  IconArrowDown,
  IconVideo,
  IconKeyboard,
} from "@tabler/icons-react";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';
import type { QuestionDraft } from "@/types/question";
import { QuestionOptionsEditor } from "@/components/question/QuestionOptionsEditor";
import { QuestionSummary } from "@/components/question/QuestionSummary";

// Re-export для обратной совместимости
export type { QuestionDraft };

interface QuestionFormItemProps {
  question: QuestionDraft;
  index: number;
  totalCount: number;
  onUpdate: (index: number, field: keyof QuestionDraft, value: any) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  showTypeSelector?: boolean; // Показывать ли выбор типа вопроса
  variant?: 'create' | 'edit'; // Визуальный стиль
  expertMode?: boolean; // Экспертный режим (доп. параметры)
}

/**
 * 🎯 Универсальный мемоизированный компонент вопроса для максимальной производительности
 * Используется как на странице создания, так и на странице редактирования вакансий
 */
const QuestionFormItem = React.memo(({ 
  question, 
  index, 
  totalCount,
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown,
  showTypeSelector = false,
  variant = 'create',
  expertMode = false
}: QuestionFormItemProps) => {
  const { _ } = useLingui();
  const questionType = question.questionType || 'open';
  const inputMode = question.inputMode || question.type || 'text';
  const options = question.options || [];
  
  // 🔥 Локальный state для мгновенного отклика без задержек
  const [localText, setLocalText] = React.useState(question.text);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Синхронизируем локальный state с props
  React.useEffect(() => {
    setLocalText(question.text);
  }, [question.text]);

  // Debounced update - обновляем родительский state через 300ms после остановки печати
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalText(newValue); // Мгновенно обновляем локальный state
    
    // Отменяем предыдущий таймер
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Устанавливаем новый таймер
    timeoutRef.current = setTimeout(() => {
      onUpdate(index, "text", newValue);
    }, 300);
  };

  // Очищаем таймер при размонтировании
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Helper функции для работы с единым режимом ответа
  const getAnswerMode = (): 'video' | 'typing' | 'choice' => {
    if (questionType === 'choice') {
      return 'choice';
    }
    return inputMode === 'typing' ? 'typing' : 'video';
  };

  const handleAnswerModeChange = (value: 'video' | 'typing' | 'choice') => {
    if (value === 'choice') {
      // Выбор из вариантов
      onUpdate(index, "questionType", 'choice');
      onUpdate(index, "inputMode", 'typing'); // Choice всегда typing (клик мышкой)
      onUpdate(index, "type", 'typing');
      
      // Если нет вариантов — добавляем 2 пустых
      if (!options || options.length === 0) {
        onUpdate(index, "options", [
          { label: '', isCorrect: false },
          { label: '', isCorrect: false }
        ]);
      }
    } else if (value === 'video') {
      // Видео/Аудио ответ
      onUpdate(index, "questionType", 'open');
      onUpdate(index, "inputMode", 'text');
      onUpdate(index, "type", 'text');
      onUpdate(index, "options", null); // Убираем варианты
    } else if (value === 'typing') {
      // Текстовый ответ
      onUpdate(index, "questionType", 'open');
      onUpdate(index, "inputMode", 'typing');
      onUpdate(index, "type", 'typing');
      onUpdate(index, "options", null); // Убираем варианты
    }
  };

  const handleInputModeChange = (value: string) => {
    onUpdate(index, "inputMode", value);
    onUpdate(index, "type", value);
  };

  const handleQuestionTypeChange = (value: string) => {
    onUpdate(index, "questionType", value);
  };

  const handleOptionsChange = (newOptions: { value: string; label: string }[]) => {
    onUpdate(index, "options", newOptions);
  };

  // Стили в зависимости от варианта
  const paperStyles = variant === 'edit' ? {
    p: 3,
    mb: 0,
    background: '#f7f7f7',
    borderRadius: 3,
    border: '1px solid #eee',
    '&.highlight-question': {
      backgroundColor: '#e3f2fd',
      borderColor: '#1976d2',
      boxShadow: '0 0 10px rgba(25, 118, 210, 0.5)',
    }
  } : {
    p: 3,
    background: '#fafafa',
    borderRadius: 2,
    border: '1px solid #e0e0e0'
  };

  return (
    <Paper
      sx={paperStyles}
      data-question-id={question.id || index}
    >
      {/* Заголовок вопроса */}
      {variant === 'edit' ? (
        <Stack direction="row" alignItems="center" spacing={2} mb={2}>
          <Box sx={{ 
            width: 36, 
            height: 36, 
            borderRadius: '50%', 
            background: '#1976d2', 
            color: '#fff', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            fontSize: '1.1rem' 
          }}>
            {index + 1}
          </Box>
          <Typography variant="subtitle1" fontWeight={700} color="text.primary">
            <Trans>Вопрос {index + 1}</Trans>
          </Typography>
          <Box flexGrow={1} />
          <Stack direction="row" spacing={1}>
            <Tooltip title={_(msg`Вверх`)}>
              <span>
                <IconButton 
                  size="small" 
                  onClick={() => onMoveUp(index)} 
                  disabled={index === 0}
                >
                  <IconArrowUp size={18} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={_(msg`Вниз`)}>
              <span>
                <IconButton 
                  size="small" 
                  onClick={() => onMoveDown(index)} 
                  disabled={index === totalCount - 1}
                >
                  <IconArrowDown size={18} />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={_(msg`Удалить`)}>
              <span>
                <IconButton 
                  size="small" 
                  onClick={() => onRemove(index)}
                >
                  <IconTrash size={18} color="#e53935" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      ) : (
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Chip
            label={_(msg`Вопрос ${index + 1}`)}
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              fontSize: '1rem',
              fontWeight: 600,
              height: 28
            }}
          />
          <Box flexGrow={1} />
          <Tooltip title={_(msg`Переместить вверх`)}>
            <IconButton
              size="large"
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              sx={{
                color: '#1976d2',
                backgroundColor: '#fff',
                border: '1px solid #1976d2',
                '&:hover': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
                mr: 1
              }}
            >
              <IconArrowUp size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title={_(msg`Переместить вниз`)}>
            <IconButton
              size="large"
              onClick={() => onMoveDown(index)}
              disabled={index === totalCount - 1}
              sx={{
                color: '#1976d2',
                backgroundColor: '#fff',
                border: '1px solid #1976d2',
                '&:hover': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
                mr: 1
              }}
            >
              <IconArrowDown size={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title={_(msg`Удалить вопрос`)}>
            <IconButton
              size="large"
              onClick={() => onRemove(index)}
              sx={{
                color: '#e53935',
                backgroundColor: '#fff',
                border: '1px solid #e53935',
                '&:hover': {
                  backgroundColor: '#e53935',
                  color: '#fff',
                }
              }}
            >
              <IconTrash size={20} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Текст вопроса */}
      <Box>
        <CustomFormLabel 
          sx={{ 
            fontSize: '1.1rem', 
            fontWeight: 600, 
            mb: variant === 'edit' ? 1 : 2,
            color: variant === 'edit' ? 'text.primary' : '#333'
          }}
        >
          <Trans>Текст вопроса</Trans>
        </CustomFormLabel>
        <CustomTextField
          id={`question-${index}-text`}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          value={localText}
          onChange={handleTextChange}
          placeholder={_(msg`Введите вопрос, на который должен ответить кандидат`)}
          helperText={variant === 'create' ? _(msg`Введите вопрос, на который должен ответить кандидат`) : undefined}
          FormHelperTextProps={{
            sx: { color: '#333', opacity: 0.9 }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#fff',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#fafafa',
              },
              '&.Mui-focused': {
                backgroundColor: '#fff',
              }
            },
            '& .MuiInputBase-input': {
              fontSize: variant === 'edit' ? '1rem' : '1.1rem',
              padding: '16px 20px'
            }
          }}
        />
      </Box>

      
      {/* Экспертный режим: дополнительные параметры */}
      {expertMode && showTypeSelector && (
        <Box mt={3} sx={{ 
          p: 3, 
          borderRadius: 2, 
          background: '#f0f7ff', 
          border: '1px solid #90caf9' 
        }}>
          <Typography variant="subtitle2" fontWeight={700} color="primary" mb={3}>
            <Trans>⚙️ Экспертные настройки</Trans>
          </Typography>
          
          {/* Способ ответа кандидата (объединенный выбор) */}
          <Box mb={3}>
            <CustomFormLabel sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
              <Trans>Способ ответа кандидата</Trans>
            </CustomFormLabel>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              <Trans>
                Выберите как кандидат будет отвечать на вопрос. <b>Видео/Аудио</b> — запись с камеры (AI оценит содержание).
                <b> Текстовый</b> — печать на клавиатуре (экономия токенов на транскрибации).
                <b> Выбор из вариантов</b> — клик мышкой (автопроверка правильности).
              </Trans>
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={getAnswerMode()}
                onChange={(e) => handleAnswerModeChange(e.target.value as 'video' | 'typing' | 'choice')}
              >
                <FormControlLabel
                  value="video"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconVideo size={20} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          <Trans>🎥 Видео/Аудио</Trans>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <Trans>Запись с камеры/микрофона</Trans>
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ mr: 3 }}
                />
                <FormControlLabel
                  value="typing"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconKeyboard size={20} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          <Trans>⌨️ Текстовый</Trans>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <Trans>Печать на клавиатуре</Trans>
                        </Typography>
                      </Box>
                    </Box>
                  }
                  sx={{ mr: 3 }}
                />
                <FormControlLabel
                  value="choice"
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          <Trans>✅ Выбор из вариантов</Trans>
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <Trans>Клик мышкой по варианту</Trans>
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Box>

          {/* Участвует в оценке знаний */}
          <Box 
            mb={3}
            sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              border: '2px solid',
              borderColor: 'primary.main',
              background: 'linear-gradient(to right, #e3f2fd 0%, #f5f5f5 100%)'
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={question.affectsKnowledge !== false}
                  onChange={(e) => onUpdate(index, "affectsKnowledge", e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    <Trans>📚 Участвует в оценке знаний (totalScore)</Trans>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    <Trans>
                      <b>Включено</b> — ответ оценивается и влияет на totalScore (оценка знаний).
                      {questionType === 'choice' ? (
                        <> Для вариантов: правильный выбор = 10 баллов, неправильный = 0.</>
                      ) : (
                        <> Для открытых: AI оценка 0-10 баллов (500-600 токенов).</>
                      )}
                      <br />
                      <b>Выключено</b> — НЕ влияет на totalScore.
                      {questionType === 'choice' ? (
                        <> Для вариантов: только пометка правильности или Red Flag (если включен).</>
                      ) : (
                        <> Для открытых: только сохранение для FIT/retention. Экономия 500 токенов.</>
                      )}
                    </Trans>
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* Разделитель секции */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 3 }}>
            <Box sx={{ flexGrow: 1, height: '1px', background: '#ddd' }} />
            <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 600 }}>
              <Trans>ПРОВЕРКА ОТВЕТА</Trans>
            </Typography>
            <Box sx={{ flexGrow: 1, height: '1px', background: '#ddd' }} />
          </Box>

          {/* Варианты ответа */}
          {questionType === 'choice' && (() => {
            // Валидация для подсветки чекбоксов
            const affectsKnowledge = question.affectsKnowledge !== false;
            const isRedFlag = question.isRedFlag || false;
            const hasCorrectAnswers = options.some(opt => opt.isCorrect);
            const needsCorrectAnswers = affectsKnowledge || isRedFlag;
            const hasValidationError = needsCorrectAnswers && !hasCorrectAnswers;

            return (
              <QuestionOptionsEditor
                question={question}
                options={options}
                onOptionsChange={handleOptionsChange}
                hasValidationError={hasValidationError}
              />
            );
          })()}

          {/* Эталонный ответ (только для open вопросов) */}
          {questionType === 'open' && (
            <Box mb={3}>
              <CustomFormLabel sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
                <Trans>Эталонный ответ</Trans>
                <Typography component="span" color="text.secondary" sx={{ ml: 0.5, fontSize: '0.9rem', fontWeight: 400 }}>
                  (<Trans>необязательно</Trans>)
                </Typography>
              </CustomFormLabel>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              <Trans>
                <b>Без эталона:</b> AI оценивает качество рассуждений и полноту ответа (500 токенов).
                <br />
                <b>С эталоном:</b> AI <u>строго сравнивает</u> ответ с эталоном, проверяет соответствие (600 токенов).
                {question.isRedFlag && (
                  <>
                    <br />
                    <span style={{color: '#d32f2f'}}>⚠️ Критический вопрос: несоответствие эталону → красный флаг.</span>
                  </>
                )}
              </Trans>
            </Typography>
              <CustomTextField
                fullWidth
                multiline
                rows={3}
                placeholder={_(msg`Опишите идеальный ответ на этот вопрос...`)}
                value={question.referenceAnswer || ''}
                onChange={(e) => onUpdate(index, "referenceAnswer", e.target.value)}
              />
            </Box>
          )}

          {/* Разделитель секции */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 4 }}>
            <Box sx={{ flexGrow: 1, height: '1px', background: '#ddd' }} />
            <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 600 }}>
              <Trans>ДОПОЛНИТЕЛЬНО</Trans>
            </Typography>
            <Box sx={{ flexGrow: 1, height: '1px', background: '#ddd' }} />
          </Box>

          {/* Red Flag (критический вопрос) */}
          <Box 
            mb={3}
            sx={{ 
              p: 2.5, 
              borderRadius: 2, 
              border: '2px solid',
              borderColor: 'error.main',
              background: 'linear-gradient(to right, #ffebee 0%, #f5f5f5 100%)'
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={question.isRedFlag || false}
                  onChange={(e) => onUpdate(index, "isRedFlag", e.target.checked)}
                  color="error"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600} color="error">
                    <Trans>🚩 Критический вопрос (Red Flag)</Trans>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {questionType === 'choice' ? (
                      <Trans>
                        Активирует проверку ответа. <b>Обязательно отметьте правильные ответы галочками!</b>
                        <br />
                        {question.affectsKnowledge !== false ? (
                          <>• Если включена оценка знаний: неправильный выбор = 0 баллов + Red Flag</>
                        ) : (
                          <>• Если выключена оценка знаний: неправильный выбор = Red Flag (проверка соответствия требованиям вакансии, без балла)</>
                        )}
                      </Trans>
                    ) : (
                      <Trans>
                        Активирует строгую проверку ответа.
                        {question.affectsKnowledge !== false ? (
                          <>
                            <br />
                            • <b>С эталоном:</b> несоответствие → Red Flag
                            <br />
                            • <b>Без эталона:</b> низкая оценка ({"<"}5) → Red Flag
                          </>
                        ) : (
                          <>
                            <br />
                            • <b>Компетенционный вопрос с Red Flag:</b> обязательно укажите эталонный ответ! AI проверит соответствие эталону без выставления балла.
                          </>
                        )}
                      </Trans>
                    )}
                  </Typography>
                </Box>
              }
            />
          </Box>

          {/* 📋 САММОРИ: Поведение вопроса */}
          <QuestionSummary question={question} />
        </Box>
      )}
    </Paper>
  );
});

QuestionFormItem.displayName = 'QuestionFormItem';

export default QuestionFormItem;

