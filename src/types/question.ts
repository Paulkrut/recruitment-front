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

export type AnswerFormat = 'typing' | 'audio_video' | 'choice';

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
 * Вложение к вопросу
 */
export interface QuestionAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'document';
  filename: string;
  url: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  description?: string;
  error?: string;
  size: number;
}

/**
 * Вариант вопроса (для рандомных вопросов)
 */
export interface QuestionVariantDraft {
  id?: number;
  text: string;
  referenceAnswer?: string | null;
  attachments?: QuestionAttachment[];
  options?: QuestionOption[];
  position?: number;
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
  allowedAnswerFormats?: AnswerFormat[];
  options?: QuestionOption[];
  maxTime: number;
  position?: number;
  referenceAnswer?: string | null;
  isRedFlag?: boolean;
  affectsKnowledge?: boolean;
  attachments?: QuestionAttachment[];
  
  // ✅ НОВОЕ: Поддержка вариантов вопросов
  // 1 вариант = обычный вопрос, 2+ = рандомный
  variants?: QuestionVariantDraft[];
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
  const errors: string[] = [];
  
  // ✅ Если есть варианты - проверяем каждый
  if (question.variants && question.variants.length > 0) {
    let allVariantsValid = true;
    
    question.variants.forEach((variant, index) => {
      const hasCorrectAnswers = (variant.options || []).some(opt => opt.isCorrect);
      const needsCorrectAnswers = isChoice && (affectsKnowledge || isRedFlag);
      
      if (needsCorrectAnswers && !hasCorrectAnswers) {
        allVariantsValid = false;
        if (affectsKnowledge && isRedFlag) {
          errors.push(`Вариант ${index + 1}: Вопрос участвует в оценке знаний И имеет Red Flag. Необходимо отметить правильные ответы.`);
        } else if (affectsKnowledge) {
          errors.push(`Вариант ${index + 1}: Вопрос участвует в оценке знаний. Необходимо отметить правильные ответы.`);
        } else if (isRedFlag) {
          errors.push(`Вариант ${index + 1}: Вопрос имеет Red Flag. Необходимо отметить правильные ответы.`);
        }
      }
    });
    
    return {
      isValid: allVariantsValid,
      needsCorrectAnswers: isChoice && (affectsKnowledge || isRedFlag),
      hasCorrectAnswers: allVariantsValid,
      errors,
    };
  }
  
  // СТАРЫЙ формат: проверяем options на уровне вопроса
  const hasCorrectAnswers = (question.options || []).some(opt => opt.isCorrect);
  const needsCorrectAnswers = isChoice && (affectsKnowledge || isRedFlag);
  const hasValidationError = needsCorrectAnswers && !hasCorrectAnswers;
  
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
 * Валидация вариантов вопроса
 */
export function validateQuestionVariants(question: QuestionDraft): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Теперь вопрос ВСЕГДА должен иметь минимум 1 вариант
  if (!question.variants || question.variants.length === 0) {
    errors.push('Вопрос должен иметь хотя бы 1 вариант');
    return { isValid: false, errors };
  }
  
  const variantsCount = question.variants.length;
  
  // Максимум 10 вариантов
  if (variantsCount > 10) {
    errors.push('Максимум 10 вариантов на вопрос');
  }
  
  // Проверка текста каждого варианта
  question.variants.forEach((variant, index) => {
    if (!variant.text || variant.text.trim() === '') {
      errors.push(`Вариант ${index + 1}: текст не может быть пустым`);
    }
  });
  
  // Проверка для choice вопросов
  if (question.questionType === 'choice') {
    question.variants.forEach((variant, index) => {
      const options = variant.options || [];
      if (options.length < 2) {
        errors.push(`Вариант ${index + 1}: необходимо минимум 2 варианта ответа`);
      }
    });
  }
  
  // Проверка для open вопросов с Red Flag
  if (question.questionType === 'open' && question.isRedFlag && !question.affectsKnowledge) {
    question.variants.forEach((variant, index) => {
      if (!variant.referenceAnswer || variant.referenceAnswer.trim() === '') {
        errors.push(`Вариант ${index + 1}: Red Flag для компетенционного вопроса требует эталонный ответ`);
      }
    });
  }

  if (question.questionType !== 'choice') {
    const allowedFormats = question.allowedAnswerFormats || [];
    if (allowedFormats.length === 0) {
      errors.push('Для открытого вопроса нужно разрешить хотя бы один формат ответа');
    }
  }
  
  return {
    isValid: errors.length === 0,
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
    .map((q, index) => {
      const choiceValidation = validateChoiceQuestion(q);
      const variantsValidation = validateQuestionVariants(q);
      
      const allErrors = [...choiceValidation.errors, ...variantsValidation.errors];
      const isValid = choiceValidation.isValid && variantsValidation.isValid;
      
      return { index, question: q, isValid, errors: allErrors };
    })
    .filter(({ isValid }) => !isValid);
  
  const isValid = invalidQuestions.length === 0;
  
  const allErrors = invalidQuestions.flatMap(q => q.errors);
  const firstError = allErrors[0] || '';
  const errorMessage = isValid
    ? ''
    : `Ошибка валидации (${invalidQuestions.length} вопр.): ${firstError}`;
  
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
  
  // Берём данные из первого варианта вопроса (теперь вопрос всегда в вариантах)
  const firstVariant = question.variants?.[0];
  const referenceAnswer = firstVariant?.referenceAnswer || question.referenceAnswer;
  const hasReference = !!referenceAnswer;
  
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
    
    if (inputMode === 'audio' || inputMode === 'text') {
      return { tokens: 0, description: '0 токенов на оценку (только Whisper транскрибация)' };
    } else {
      return { tokens: 0, description: '0 токенов' };
    }
  }
}
