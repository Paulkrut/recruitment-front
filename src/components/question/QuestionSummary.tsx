import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Trans } from "@lingui/macro";
import type { QuestionDraft } from "@/types/question";
import { calculateQuestionTokens } from "@/types/question";

interface QuestionSummaryProps {
  question: QuestionDraft;
}

/**
 * Компонент для отображения саммори поведения вопроса
 */
export const QuestionSummary: React.FC<QuestionSummaryProps> = ({ question }) => {
  const questionType = question.questionType || 'open';
  const inputMode = question.inputMode || question.type || 'text';
  const options = question.options || [];
  const affectsKnowledge = question.affectsKnowledge !== false;
  const hasReference = !!question.referenceAnswer;
  const isRedFlag = question.isRedFlag || false;
  const isChoice = questionType === 'choice';
  const isAudio = inputMode === 'text';
  const isTyping = inputMode === 'typing';
  const correctOptions = options.filter(opt => opt.isCorrect);
  const hasCorrectAnswers = correctOptions.length > 0;
  
  // Валидация
  const needsCorrectAnswers = isChoice && (affectsKnowledge || isRedFlag);
  const hasValidationError = needsCorrectAnswers && !hasCorrectAnswers;
  
  // Расчет токенов
  const { tokens, description: tokenText } = calculateQuestionTokens(question);
  
  return (
    <Box
      sx={{ 
        mt: 4,
        p: 3, 
        borderRadius: 2, 
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <Typography variant="h6" fontWeight={700} mb={2} sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.primary' }}>
        📋 <Trans>Поведение этого вопроса</Trans>
      </Typography>
      
      <Stack spacing={2} sx={{ color: 'text.primary' }}>
        {/* Ошибка валидации */}
        {hasValidationError && (
          <Box 
            sx={{ 
              p: 2, 
              borderRadius: 2, 
              background: 'linear-gradient(135deg, #fee 0%, #fdd 100%)',
              border: '2px solid #d32f2f',
              boxShadow: '0 4px 12px rgba(211,47,47,0.2)'
            }}
          >
            <Typography variant="body1" fontWeight={700} color="error" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              ❌ <Trans>ОШИБКА: Требуются правильные ответы!</Trans>
            </Typography>
            <Typography variant="body2" color="error.dark">
              {affectsKnowledge && isRedFlag ? (
                <Trans>
                  Этот вопрос <b>участвует в оценке знаний</b> И имеет <b>Red Flag</b>. 
                  Необходимо отметить хотя бы один правильный ответ в списке вариантов выше, 
                  иначе система не сможет оценить ответ и проверить критичность.
                </Trans>
              ) : affectsKnowledge ? (
                <Trans>
                  Этот вопрос <b>участвует в оценке знаний</b>. 
                  Необходимо отметить хотя бы один правильный ответ в списке вариантов выше, 
                  иначе система не сможет выставить балл.
                </Trans>
              ) : (
                <Trans>
                  Этот вопрос имеет <b>Red Flag</b> (критическая проверка). 
                  Необходимо отметить хотя бы один правильный ответ в списке вариантов выше, 
                  иначе система не сможет определить неправильный ответ для срабатывания флага.
                </Trans>
              )}
            </Typography>
          </Box>
        )}

        {/* 1. Кандидат отвечает */}
        <Box>
          <Typography variant="body2" fontWeight={600} mb={0.5} color="primary">
            1️⃣ <Trans>Кандидат отвечает:</Trans>
          </Typography>
          <Typography variant="body2" sx={{ pl: 2.5 }}>
            {isChoice ? (
              <Trans>✅ Кликает мышкой на один из {options.length} вариантов ответа</Trans>
            ) : (
              isTyping ? (
                <Trans>⌨️ Печатает текстовый ответ (измеряется скорость печати)</Trans>
              ) : (
                <Trans>🎥 Записывает видео/аудио ответ (транскрибация в текст)</Trans>
              )
            )}
          </Typography>
        </Box>

        {/* 2. Система обрабатывает */}
        <Box>
          <Typography variant="body2" fontWeight={600} mb={0.5} color="primary">
            2️⃣ <Trans>Система обрабатывает:</Trans>
          </Typography>
          <Typography variant="body2" sx={{ pl: 2.5, color: hasValidationError ? 'error.main' : 'text.primary' }}>
            {hasValidationError ? (
              <Trans>❌ <b>ОШИБКА:</b> Невозможно обработать — не отмечены правильные ответы!</Trans>
            ) : isChoice ? (
              hasCorrectAnswers ? (
                affectsKnowledge ? (
                  correctOptions.length === 1 ? (
                    <Trans>✅ Автопроверка: выбор "{correctOptions[0].label}" = правильно (10 баллов), остальные = 0 баллов</Trans>
                  ) : (
                    <Trans>✅ Автопроверка: любой из {correctOptions.length} правильных ответов = 10 баллов, остальные = 0 баллов</Trans>
                  )
                ) : isRedFlag ? (
                  <Trans>✅ Проверка требований: правильный выбор = OK, неправильный = 🚩 Red Flag (без балла)</Trans>
                ) : (
                  <Trans>💾 Сохранение + визуальная пометка правильности для HR (без балла, без проверки)</Trans>
                )
              ) : (
                <Trans>💾 Просто сохранение выбора (информационный вопрос, без проверки)</Trans>
              )
            ) : affectsKnowledge ? (
              hasReference ? (
                <>
                  <Trans>🤖 Система оценивает ответ <b>строго по эталону</b> → 0-10 баллов</Trans>
                  <br />
                  <Typography variant="caption" component="span" sx={{ pl: 0, opacity: 0.8 }}>
                    <Trans>Эталонный ответ добавляется в анализ: "{question.referenceAnswer?.substring(0, 50)}{question.referenceAnswer && question.referenceAnswer.length > 50 ? '...' : ''}" — система будет сравнивать с ним</Trans>
                  </Typography>
                </>
              ) : (
                <Trans>🤖 Система оценивает качество и полноту ответа (без сравнения с эталоном) → 0-10 баллов</Trans>
              )
            ) : isRedFlag && hasReference ? (
              <>
                <Trans>💾 Сохранение текста (без оценки)</Trans>
                <br />
                <Trans>🚩 Система проверяет соответствие эталону для Red Flag (без выставления балла)</Trans>
              </>
            ) : (
              <Trans>💾 Только транскрибация/сохранение текста (без оценки)</Trans>
            )}
          </Typography>
        </Box>

        {/* 3. Влияние на оценки */}
        <Box>
          <Typography variant="body2" fontWeight={600} mb={0.5} color="primary">
            3️⃣ <Trans>Влияние на оценки:</Trans>
          </Typography>
          <Typography variant="body2" sx={{ pl: 2.5, color: hasValidationError ? 'error.main' : 'text.primary' }}>
            {hasValidationError ? (
              <Trans>❌ <b>НЕТ ВЛИЯНИЯ</b> — вопрос не будет работать без правильных ответов!</Trans>
            ) : affectsKnowledge ? (
              <>
                <Trans>✅ Влияет на <b>оценку знаний</b></Trans>
                <br />
                <Trans>✅ Участвует в <b>FIT</b> оценке (все вопросы)</Trans>
                <br />
                <Trans>✅ Участвует в <b>Retention</b> прогнозе (все вопросы)</Trans>
              </>
            ) : isChoice && hasCorrectAnswers && isRedFlag ? (
              <>
                <Trans>❌ НЕ влияет на <b>оценку знаний</b> (проверка требований, не знаний)</Trans>
                <br />
                <Trans>🚩 Проверяет <b>соответствие вакансии</b> (Red Flag если неправильно)</Trans>
                <br />
                <Trans>✅ Участвует в <b>FIT</b> и <b>Retention</b> (все вопросы)</Trans>
              </>
            ) : isChoice && hasCorrectAnswers ? (
              <>
                <Trans>❌ НЕ влияет на <b>оценку знаний</b></Trans>
                <br />
                <Trans>ℹ️ Визуальная пометка правильности в списке ответов</Trans>
                <br />
                <Trans>✅ Участвует в <b>FIT</b> и <b>Retention</b> (все вопросы)</Trans>
              </>
            ) : !isChoice && isRedFlag && hasReference ? (
              <>
                <Trans>❌ НЕ влияет на <b>оценку знаний</b></Trans>
                <br />
                <Trans>🚩 Проверяет <b>соответствие требованиям</b> через эталон (Red Flag если несоответствие)</Trans>
                <br />
                <Trans>✅ Участвует в <b>FIT</b> и <b>Retention</b> (все вопросы)</Trans>
              </>
            ) : (
              <>
                <Trans>❌ НЕ влияет на <b>оценку знаний</b></Trans>
                <br />
                <Trans>✅ Участвует в <b>FIT</b> оценке (все вопросы)</Trans>
                <br />
                <Trans>✅ Участвует в <b>Retention</b> прогнозе (все вопросы)</Trans>
              </>
            )}
          </Typography>
        </Box>

        {/* 4. Red Flag */}
        {isRedFlag && (
          <Box>
            <Typography variant="body2" fontWeight={600} mb={0.5} color="error">
              4️⃣ <Trans>🚩 Проверка критичности:</Trans>
            </Typography>
            <Typography variant="body2" sx={{ pl: 2.5, color: hasValidationError ? 'error.main' : 'text.primary', fontWeight: hasValidationError ? 700 : 400 }}>
              {isChoice ? (
                hasCorrectAnswers ? (
                  affectsKnowledge ? (
                    <Trans>⚠️ Если выбран НЕправильный ответ → <b>RED FLAG</b> + 0 баллов → кандидат помечается</Trans>
                  ) : (
                    <Trans>⚠️ Если выбран НЕправильный ответ → <b>RED FLAG</b> (без балла, проверка требований вакансии)</Trans>
                  )
                ) : (
                  <Trans>❌ <b>ОШИБКА:</b> Для критического вопроса нужно отметить правильные ответы!</Trans>
                )
              ) : affectsKnowledge ? (
                hasReference ? (
                  <Trans>⚠️ Если ответ НЕ соответствует эталону → <b>RED FLAG</b> → кандидат помечается</Trans>
                ) : (
                  <Trans>⚠️ Если оценка меньше 5 баллов → <b>RED FLAG</b> → кандидат помечается</Trans>
                )
              ) : hasReference ? (
                <Trans>⚠️ Если ответ НЕ соответствует эталону → <b>RED FLAG</b> (без балла, проверка соответствия требованиям)</Trans>
              ) : (
                <Trans>⚠️ <b>ВНИМАНИЕ:</b> Red Flag для OPEN вопроса без эталона и без оценки знаний не имеет смысла. Добавьте эталонный ответ!</Trans>
              )}
            </Typography>
          </Box>
        )}

        {/* 5. Расход токенов - УБРАН */}
      </Stack>
    </Box>
  );
};
