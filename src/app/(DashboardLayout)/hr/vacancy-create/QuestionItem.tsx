import React from "react";
import {
  Box,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import {
  IconTrash,
  IconArrowUp,
  IconArrowDown,
} from "@tabler/icons-react";
import { useLingui } from '@lingui/react';
import { msg, Trans } from '@lingui/macro';

interface QuestionDraft {
  text: string;
  type: string;
  maxTime: number;
  allowFollowups: boolean;
  followupsMax: number;
  position?: number;
}

interface QuestionItemProps {
  question: QuestionDraft;
  index: number;
  totalCount: number;
  onUpdate: (index: number, field: keyof QuestionDraft, value: any) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

// 🎯 Изолированный мемоизированный компонент вопроса для максимальной производительности
const QuestionItem = React.memo(({ 
  question, 
  index, 
  totalCount,
  onUpdate, 
  onRemove, 
  onMoveUp, 
  onMoveDown
}: QuestionItemProps) => {
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

  return (
    <Paper sx={{
      p: 3,
      background: '#fafafa',
      borderRadius: 2,
      border: '1px solid #e0e0e0'
    }}>
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

      <Box sx={{ mb: 3 }}>
        <CustomFormLabel
          htmlFor={`question-${index}-text`}
          sx={{
            color: '#333',
            fontSize: '1.1rem',
            fontWeight: 600,
            mb: 2
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
          helperText={_(msg`Введите вопрос, на который должен ответить кандидат`)}
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
              fontSize: '1.1rem',
              padding: '16px 20px'
            }
          }}
        />
      </Box>
    </Paper>
  );
});

QuestionItem.displayName = 'QuestionItem';

export default QuestionItem;
export type { QuestionDraft };

