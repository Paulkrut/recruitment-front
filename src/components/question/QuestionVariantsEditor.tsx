import React, { useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  IconButton,
  Paper,
  Collapse,
  Divider,
  Alert,
  Chip,
} from "@mui/material";
import {
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconChevronDown,
  IconChevronUp,
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
  const [expandedVariants, setExpandedVariants] = useState<Set<number>>(new Set([0]));

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
        <Typography variant="h6" fontWeight={600}>
          Варианты вопроса ({variants.length}/10)
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<IconPlus size={18} />}
          onClick={handleAddVariant}
          disabled={variants.length >= 10}
        >
          Добавить вариант
        </Button>
      </Stack>

      {variants.length < 2 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Для режима вариантов нужно минимум 2 варианта. Кандидатам будет показан случайный вариант.
        </Alert>
      )}

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
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <IconButton size="small" sx={{ cursor: 'grab' }}>
                  <IconGripVertical size={18} />
                </IconButton>
                <Chip 
                  label={`Вариант ${variantIndex + 1}`} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                />
              </Stack>
              
              <Stack direction="row" spacing={1}>
                <IconButton 
                  size="small" 
                  onClick={() => toggleVariant(variantIndex)}
                >
                  {expandedVariants.has(variantIndex) ? (
                    <IconChevronUp size={18} />
                  ) : (
                    <IconChevronDown size={18} />
                  )}
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveVariant(variantIndex)}
                  disabled={variants.length === 1}
                >
                  <IconTrash size={18} />
                </IconButton>
              </Stack>
            </Stack>

            <Collapse in={expandedVariants.has(variantIndex)}>
              <Stack spacing={2}>
                {/* Текст варианта */}
                <Box>
                  <CustomFormLabel htmlFor={`variant-text-${variantIndex}`}>
                    Текст вопроса для варианта {variantIndex + 1}
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
                    <RichTextEditor
                      value={variant.referenceAnswer || ''}
                      onChange={(value) => handleUpdateVariant(variantIndex, 'referenceAnswer', value)}
                      placeholder="Эталонный ответ для этого варианта..."
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

            {/* Краткая информация в свернутом виде */}
            {!expandedVariants.has(variantIndex) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {variant.text ? 
                  variant.text.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 
                  'Текст не заполнен'
                }
              </Typography>
            )}
          </Paper>
        ))}
      </Stack>

      {variants.length === 0 && (
        <Alert severity="info">
          Нажмите "Добавить вариант" чтобы создать варианты вопроса
        </Alert>
      )}
    </Box>
  );
}
