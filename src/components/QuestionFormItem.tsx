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

export interface QuestionDraft {
  id?: number;
  text: string;
  type: string;
  maxTime: number;
  allowFollowups: boolean;
  followupsMax: number;
  position?: number;
}

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
  variant = 'create'
}: QuestionFormItemProps) => {
  const { _ } = useLingui();
  
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
      
      {/* Тип вопроса (только если showTypeSelector = true) */}
      {showTypeSelector && (
        <Box mt={3}>
          <CustomFormLabel sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 2 }}>
            <Trans>Тип ответа</Trans>
          </CustomFormLabel>
          <FormControl component="fieldset">
            <RadioGroup
              row
              value={question.type || 'text'}
              onChange={(e) => onUpdate(index, "type", e.target.value)}
            >
              <FormControlLabel
                value="text"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconVideo size={20} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        <Trans>Видео/Аудио</Trans>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Кандидат записывает себя</Trans>
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ mr: 4 }}
              />
              <FormControlLabel
                value="typing"
                control={<Radio />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconKeyboard size={20} />
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        <Trans>Письменный</Trans>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        <Trans>Кандидат печатает текст</Trans>
                      </Typography>
                    </Box>
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>
        </Box>
      )}
    </Paper>
  );
});

QuestionFormItem.displayName = 'QuestionFormItem';

export default QuestionFormItem;

