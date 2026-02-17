import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Paper,
  Collapse,
  Divider,
  Chip,
  Tooltip,
  TextField,
} from "@mui/material";
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconChevronDown,
  IconChevronUp,
  IconHelp,
} from "@tabler/icons-react";
import CustomFormLabel from "@/app/components/forms/theme-elements/CustomFormLabel";
import RichTextEditor from "@/components/RichTextEditor";
import type { QuestionVariantDraft, QuestionDraft, QuestionOption } from "@/types/question";
import { QuestionOptionsEditor } from "@/components/question/QuestionOptionsEditor";
import QuestionAttachmentUploader from "@/components/QuestionAttachmentUploader";

interface QuestionVariantsEditorProps {
  question: QuestionDraft;
  questionIndex: number;
  onUpdateQuestion: (index: number, field: keyof QuestionDraft, value: any) => void;
}

/**
 * Редактор вариантов вопроса
 */
export function QuestionVariantsEditor({ 
  question, 
  questionIndex, 
  onUpdateQuestion 
}: QuestionVariantsEditorProps) {
  const variants = question.variants || [];
  const questionType = question.questionType || 'open';
  // По умолчанию все варианты свёрнуты
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set());

  // Если вариантов нет - создаём один пустой
  useEffect(() => {
    if (variants.length === 0) {
      const emptyVariant: QuestionVariantDraft = {
        text: "",
        referenceAnswer: null,
        attachments: [],
        options: questionType === 'choice' ? [
          { label: "", isCorrect: false },
          { label: "", isCorrect: false }
        ] : [],
        position: 1,
      };
      onUpdateQuestion(questionIndex, "variants", [emptyVariant]);
    }
  }, []); // Только при монтировании

  // Добавить новый вариант
  const handleAddVariant = () => {
    const newVariant: QuestionVariantDraft = {
      text: "",
      referenceAnswer: null,
      attachments: [],
      options: questionType === 'choice' ? [
        { label: "", isCorrect: false },
        { label: "", isCorrect: false }
      ] : [],
      position: variants.length + 1,
    };
    onUpdateQuestion(questionIndex, "variants", [...variants, newVariant]);
    setExpandedVariants(prev => new Set([...prev, variants.length]));
  };

  // Удалить вариант
  const handleRemoveVariant = (variantIndex: number) => {
    const updated = variants.filter((_, i) => i !== variantIndex);
    onUpdateQuestion(questionIndex, "variants", updated);
    setExpandedVariants(prev => {
      const newSet = new Set(prev);
      newSet.delete(variantIndex);
      return newSet;
    });
  };

  // Обновить поле варианта
  const handleUpdateVariant = (
    variantIndex: number, 
    field: keyof QuestionVariantDraft, 
    value: any
  ) => {
    const updated = [...variants];
    updated[variantIndex] = { ...updated[variantIndex], [field]: value };
    onUpdateQuestion(questionIndex, "variants", updated);
  };

  // Toggle раскрытие варианта
  const toggleVariant = (variantIndex: number) => {
    setExpandedVariants(prev => {
      const newSet = new Set(prev);
      if (newSet.has(variantIndex)) {
        newSet.delete(variantIndex);
      } else {
        newSet.add(variantIndex);
      }
      return newSet;
    });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        {variants.length >= 2 ? (
          <Typography variant="h6" fontWeight={600}>
            Варианты вопроса ({variants.length}/10)
          </Typography>
        ) : (
          <Box /> // Пустой элемент для выравнивания
        )}
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="outlined"
            size="small"
            startIcon={<IconPlus size={18} />}
            onClick={handleAddVariant}
            disabled={variants.length >= 10}
          >
            Добавить вариант вопроса
          </Button>
          <Tooltip 
            title="Для режима вариантов нужно минимум 2 варианта. Кандидатам будет показан случайный вариант из списка."
            arrow
            placement="left"
          >
            <IconButton size="small" sx={{ color: 'primary.main' }}>
              <IconHelp size={20} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {variants.map((variant, variantIndex) => (
          <Paper
            key={variantIndex}
            elevation={2}
            sx={{
              p: 2,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            {/* Заголовок варианта */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={expandedVariants.has(variantIndex) ? 2 : 1}>
              <Stack 
                direction="row" 
                alignItems="center" 
                spacing={1} 
                flex={1} 
                sx={{ 
                  minWidth: 0,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.7
                  }
                }}
                onClick={() => toggleVariant(variantIndex)}
              >
                <IconButton size="small" sx={{ cursor: 'grab', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                  <IconGripVertical size={18} />
                </IconButton>
                {!expandedVariants.has(variantIndex) && (
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.4,
                        mb: 0.5
                      }}
                    >
                      {variant.text ? variant.text.replace(/<[^>]*>/g, '') : 'Текст не заполнен'}
                    </Typography>
                    {/* Индикаторы в заголовке */}
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                      {variant.attachments && variant.attachments.length > 0 && (
                        <Chip 
                          label={`📎 Вложений: ${variant.attachments.length}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: '24px' }}
                        />
                      )}
                      {questionType === 'choice' && variant.options && variant.options.length > 0 && (
                        <Chip 
                          label={`Вариантов ответа: ${variant.options.length}`} 
                          size="small" 
                          variant="outlined"
                          color="primary"
                          sx={{ height: '24px' }}
                        />
                      )}
                      {questionType === 'open' && variant.referenceAnswer && (
                        <Chip 
                          label="✓ Есть эталонный ответ" 
                          size="small" 
                          variant="outlined"
                          color="success"
                          sx={{ height: '24px' }}
                        />
                      )}
                    </Stack>
                  </Box>
                )}
                <IconButton 
                  size="small"
                  sx={{ flexShrink: 0 }}
                >
                  {expandedVariants.has(variantIndex) ? (
                    <IconChevronUp size={18} />
                  ) : (
                    <IconChevronDown size={18} />
                  )}
                </IconButton>
              </Stack>
              
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveVariant(variantIndex)}
                disabled={variants.length === 1}
                sx={{ flexShrink: 0, ml: 1 }}
              >
                <IconTrash size={18} />
              </IconButton>
            </Stack>

            <Collapse in={expandedVariants.has(variantIndex)}>
              <Stack spacing={2}>
                {/* Текст варианта */}
                <Box>
                  <CustomFormLabel htmlFor={`variant-text-${variantIndex}`}>
                    Текст вопроса
                  </CustomFormLabel>
                  <RichTextEditor
                    value={variant.text || ''}
                    onChange={(value) => handleUpdateVariant(variantIndex, 'text', value)}
                    placeholder="Введите текст вопроса для этого варианта..."
                  />
                </Box>

                {/* Эталонный ответ (для OPEN) */}
                {questionType === 'open' && (
                  <Box>
                    <CustomFormLabel htmlFor={`variant-reference-${variantIndex}`}>
                      Эталонный ответ (опционально)
                    </CustomFormLabel>
                    <TextField
                      id={`variant-reference-${variantIndex}`}
                      fullWidth
                      multiline
                      rows={4}
                      value={variant.referenceAnswer || ''}
                      onChange={(e) => handleUpdateVariant(variantIndex, 'referenceAnswer', e.target.value)}
                      placeholder="Эталонный ответ для этого варианта..."
                      variant="outlined"
                    />
                  </Box>
                )}

                {/* Варианты ответов (для CHOICE) */}
                {questionType === 'choice' && (
                  <Box>
                    <CustomFormLabel>Варианты ответов</CustomFormLabel>
                    <QuestionOptionsEditor
                      question={question}
                      options={variant.options || []}
                      onOptionsChange={(newOptions: QuestionOption[]) => 
                        handleUpdateVariant(variantIndex, 'options', newOptions)
                      }
                      hasValidationError={false}
                    />
                  </Box>
                )}

                {/* Вложения */}
                {question.id && (
                  <Box>
                    <CustomFormLabel>
                      Вложения (изображения, видео, аудио, документы)
                    </CustomFormLabel>
                    <QuestionAttachmentUploader
                      questionId={question.id}
                      existingAttachments={variant.attachments || []}
                      onAttachmentsChange={(newAttachments) => 
                        handleUpdateVariant(variantIndex, 'attachments', newAttachments)
                      }
                    />
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />
              </Stack>
            </Collapse>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
