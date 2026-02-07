/**
 * 🎯 Общие типы для работы с вопросами интервью
 * 
 * Этот файл содержит единый источник правды для типов вопросов,
 * используемых во всех частях приложения:
 * - Создание вакансии
 * - Редактирование вакансии
 * - Шаблоны вопросов
 * - Прохождение интервью
 */

/**
 * Тип вопроса
 */
export type QuestionType = 'open' | 'choice' | 'code';

/**
 * Режим ввода ответа
 */
export type InputMode = 'text' | 'typing'; // text = video/audio, typing = текстовый ввод

/**
 * Вариант ответа для choice вопроса
 */
export interface QuestionOption {
  label: string;
  isCorrect?: boolean;
}

/**
 * Черновик вопроса (используется в формах создания/редактирования)
 */
export interface QuestionDraft {
  id?: number;
  text: string;
  type: string; // Устаревшее поле для обратной совместимости (text/typing)
  questionType?: QuestionType;
  inputMode?: InputMode;
  options?: QuestionOption[];
  maxTime: number;
  allowFollowups: boolean;
  followupsMax: number;
  position?: number;
  referenceAnswer?: string | null;
  isRedFlag?: boolean;
  affectsKnowledge?: boolean;
}

/**
 * Валидация вопроса с вариантами ответа
 */
export interface QuestionValidationResult {
  isValid: boolean;
  needsCorrectAnswers: boolean;
  hasCorrectAnswers: boolean;
  errors: string[];
}

/**
 * Проверка валидности choice вопроса
 */
export function validateChoiceQuestion(question: QuestionDraft): QuestionValidationResult {
  const isChoice = (question.questionType || 'open') === 'choice';
  const affectsKnowledge = question.affectsKnowledge !== false;
  const isRedFlag = question.isRedFlag || false;
  const hasCorrectAnswers = (question.options || []).some(opt => opt.isCorrect);
  
  const needsCorrectAnswers = isChoice && (affectsKnowledge || isRedFlag);
  const hasValidationError = needsCorrectAnswers && !hasCorrectAnswers;
  
  const errors: string[] = [];
  
  if (hasValidationError) {
    if (affectsKnowledge && isRedFlag) {
      errors.push('Вопрос участвует в оценке знаний И имеет Red Flag. Необходимо отметить правильные ответы.');
    } else if (affectsKnowledge) {
      errors.push('Вопрос участвует в оценке знаний. Необходимо отметить правильные ответы.');
    } else if (isRedFlag) {
      errors.push('Вопрос имеет Red Flag. Необходимо отметить правильные ответы.');
    }
  }
  
  return {
    isValid: !hasValidationError,
    needsCorrectAnswers,
    hasCorrectAnswers,
    errors,
  };
}

/**
 * Проверка всех вопросов на валидность
 */
export function validateQuestions(questions: QuestionDraft[]): {
  isValid: boolean;
  invalidQuestions: Array<{ index: number; question: QuestionDraft; errors: string[] }>;
  errorMessage: string;
} {
  const invalidQuestions = questions
    .map((q, index) => ({ index, question: q, validation: validateChoiceQuestion(q) }))
    .filter(({ validation }) => !validation.isValid)
    .map(({ index, question, validation }) => ({ index, question, errors: validation.errors }));
  
  const isValid = invalidQuestions.length === 0;
  
  const errorMessage = isValid
    ? ''
    : `Ошибка валидации: ${invalidQuestions.length} вопрос(ов) с вариантами ответов требуют отметки правильных ответов (галочками "✓"). Проверьте вопросы с оценкой знаний или Red Flag.`;
  
  return {
    isValid,
    invalidQuestions,
    errorMessage,
  };
}

/**
 * Расчет токенов для вопроса
 */
export function calculateQuestionTokens(question: QuestionDraft): {
  tokens: number;
  description: string;
} {
  const questionType = question.questionType || 'open';
  const inputMode = question.inputMode || question.type || 'text';
  const affectsKnowledge = question.affectsKnowledge !== false;
  const hasReference = !!question.referenceAnswer;
  const isRedFlag = question.isRedFlag || false;
  
  if (questionType === 'choice') {
    // Choice всегда typing (клик мышкой), никогда audio
    return { tokens: 0, description: '0 токенов' };
  }
  
  // OPEN вопросы
  if (affectsKnowledge) {
    // Оценка знаний + возможно Red Flag
    const baseTokens = hasReference ? 600 : 500;
    
    if (isRedFlag) {
      if (hasReference) {
        // Red Flag с эталоном: нужен дополнительный AI запрос
        const total = baseTokens + 150;
        return { tokens: total, description: `~${total} токенов (AI оценка + эталон + Red Flag проверка)` };
      } else {
        // Red Flag без эталона: проверка по score < 5 (БЕЗ дополнительного AI)
        return { tokens: baseTokens, description: `${baseTokens} токенов (AI оценка + Red Flag по score)` };
      }
    }
    
    return { 
      tokens: baseTokens, 
      description: hasReference ? '600 токенов (AI оценка + эталон)' : '500 токенов (AI оценка)' 
    };
  } else {
    // НЕ оценка знаний, но может быть Red Flag
    if (isRedFlag && hasReference) {
      // Компетенционный вопрос с критической проверкой
      return { tokens: 150, description: '~150 токенов (только Red Flag проверка)' };
    }
    
    if (inputMode === 'text') {
      return { tokens: 0, description: '0 токенов на оценку (только Whisper транскрибация)' };
    } else {
      return { tokens: 0, description: '0 токенов' };
    }
  }
}
