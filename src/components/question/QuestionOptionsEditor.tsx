import React from "react";
import { Box, Stack, Button, IconButton, Tooltip, Checkbox, Typography } from "@mui/material";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import type { QuestionOption, QuestionDraft } from "@/types/question";

interface QuestionOptionsEditorProps {
  question: QuestionDraft;
  options: QuestionOption[];
  onOptionsChange: (options: QuestionOption[]) => void;
  hasValidationError: boolean;
}

/**
 * Компонент для редактирования вариантов ответа (choice вопросы)
 */
export const QuestionOptionsEditor: React.FC<QuestionOptionsEditorProps> = ({
  question,
  options,
  onOptionsChange,
  hasValidationError,
}) => {
  const { _ } = useLingui();
  const inputMode = question.inputMode || question.type || 'text';

  return (
    <Box mb={3}>
      <CustomFormLabel sx={{ fontSize: '1rem', fontWeight: 600, mb: 1 }}>
        <Trans>Варианты ответа</Trans>
      </CustomFormLabel>
      
      <Typography variant="caption" color="text.secondary" display="block" mb={2}>
        <Trans>
          Список возможных ответов для кандидата. <b>Чекбокс "✓"</b> — отметьте правильный(е) ответ(ы).
          <br />
          {question.affectsKnowledge !== false ? (
            <><b>С оценкой знаний:</b> правильный выбор = 10 баллов, неправильный = 0 (влияет на totalScore).</>
          ) : question.isRedFlag ? (
            <><b>Без оценки знаний + Red Flag:</b> правильный выбор = OK, неправильный = 🚩 красный флаг (не влияет на totalScore).</>
          ) : (
            <><b>Без оценки:</b> правильность отобразится только в списке ответов для HR (не влияет ни на что).</>
          )}
          {inputMode === 'text' && <> Для видео/аудио AI сопоставит речь с вариантом.</>}
        </Trans>
      </Typography>
      
      {options.length === 0 ? (
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={16} />}
          onClick={() => onOptionsChange([
            { label: _(msg`Да`), isCorrect: false },
            { label: _(msg`Нет`), isCorrect: false },
            { label: _(msg`Нет ответа`), isCorrect: false },
          ])}
        >
          <Trans>Добавить варианты по умолчанию</Trans>
        </Button>
      ) : (
        <Stack spacing={2}>
          {options.map((opt, optIndex) => (
            <Stack key={`${optIndex}`} direction="row" spacing={2} alignItems="center">
              <Tooltip title={hasValidationError ? _(msg`⚠️ Отметьте правильный ответ!`) : _(msg`Правильный ответ`)}>
                <Checkbox
                  checked={opt.isCorrect || false}
                  onChange={(e) => {
                    const updated = [...options];
                    updated[optIndex] = { ...updated[optIndex], isCorrect: e.target.checked };
                    onOptionsChange(updated);
                  }}
                  color="success"
                  sx={{ 
                    p: 0.5,
                    ...(hasValidationError && {
                      '& .MuiSvgIcon-root': {
                        color: '#ff9800',
                        filter: 'drop-shadow(0 0 4px rgba(255, 152, 0, 0.6))',
                        animation: 'blink 2s ease-in-out infinite',
                      },
                      '@keyframes blink': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.4 }
                      }
                    })
                  }}
                />
              </Tooltip>
              <CustomTextField
                fullWidth
                label={_(msg`Текст варианта`)}
                value={opt.label}
                onChange={(e) => {
                  const updated = [...options];
                  updated[optIndex] = { ...updated[optIndex], label: e.target.value };
                  onOptionsChange(updated);
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: opt.isCorrect ? '#e8f5e9' : '#fff'
                  }
                }}
              />
              <IconButton
                size="small"
                onClick={() => onOptionsChange(options.filter((_, i) => i !== optIndex))}
              >
                <IconTrash size={16} />
              </IconButton>
            </Stack>
          ))}
          <Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconPlus size={16} />}
              onClick={() => onOptionsChange([...options, { label: '', isCorrect: false }])}
            >
              <Trans>Добавить вариант</Trans>
            </Button>
          </Box>
        </Stack>
      )}
    </Box>
  );
};
