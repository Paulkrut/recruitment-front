import ExcelJS from 'exceljs';

/**
 * Интерфейсы для типизации данных
 */
interface Candidate {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  score?: number;
  sessionsCount?: number;
}

interface ComparisonCandidate {
  candidateId: number;
  name: string;
  scores: Record<string, string>;
  overallScore: string;
  recommendation: string;
}

interface ComparisonResult {
  vacancy?: {
    title: string;
  };
  winnerId?: number;
  comparison?: ComparisonCandidate[];
  criteria?: {
    general?: string[];
    specific?: string[];
  };
  analysis?: string;
  reasoning?: string;
}

interface Question {
  id: number;
  position: number;
  text: string;
  type: string; // text, audio, typing
  questionType: string; // open, choice
}

interface AnswerData {
  answerId: number;
  answerText?: string;
  score?: number;
  hasRedFlag?: boolean;
  videoUrl?: string;
  selectedOption?: string;
}

interface AnswersMatrixData {
  candidates: Array<{ id: number; name: string }>;
  questions: Question[];
  answers: Record<number, Record<number, AnswerData>>; // [candidateId][questionPosition]
}

/**
 * Экспорт результатов сравнения кандидатов в Excel
 * 
 * @param candidates - массив кандидатов с базовой информацией
 * @param comparisonResult - результаты AI-сравнения
 * @param answersMatrix - матрица ответов на вопросы (опционально)
 */
export async function exportComparisonToExcel(
  candidates: Candidate[],
  comparisonResult: ComparisonResult,
  answersMatrix?: AnswersMatrixData
): Promise<void> {
  if (!comparisonResult || !candidates.length) {
    throw new Error('Нет данных для экспорта');
  }

  // Создаём книгу и лист
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Сравнение кандидатов');

  let currentRow = 1;

  // === ШАПКА ===
  const titleRow = worksheet.getRow(currentRow++);
  titleRow.getCell(1).value = '📊 СРАВНЕНИЕ КАНДИДАТОВ';
  titleRow.getCell(1).font = { size: 16, bold: true };
  titleRow.height = 25;

  currentRow++; // Пустая строка

  worksheet.getRow(currentRow++).values = ['Вакансия:', comparisonResult.vacancy?.title || 'Не указана'];
  worksheet.getRow(currentRow++).values = ['Дата сравнения:', new Date().toLocaleString('ru-RU')];
  worksheet.getRow(currentRow++).values = ['Количество кандидатов:', candidates.length];

  currentRow++; // Пустая строка

  // === ТАБЛИЦА ДЕТАЛЬНОГО СРАВНЕНИЯ ПО КРИТЕРИЯМ ===
  const sectionTitleRow = worksheet.getRow(currentRow++);
  sectionTitleRow.getCell(1).value = 'ДЕТАЛЬНОЕ СРАВНЕНИЕ ПО КРИТЕРИЯМ';
  sectionTitleRow.getCell(1).font = { size: 14, bold: true };

  currentRow++; // Пустая строка

  if (comparisonResult.comparison && comparisonResult.criteria) {
    // Заголовки таблицы
    const headers = ['Кандидат'];
    comparisonResult.criteria.general?.forEach(criterion => headers.push(criterion));
    comparisonResult.criteria.specific?.forEach(criterion => headers.push(criterion));
    headers.push('Оценка за тест', 'Рекомендация');

    const headerRow = worksheet.getRow(currentRow++);
    headerRow.values = headers;
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    headerRow.height = 30;

    // Данные по кандидатам
    comparisonResult.comparison.forEach(candidate => {
      const row = worksheet.getRow(currentRow++);
      const rowData: any[] = [];

      // Имя с отметкой победителя
      const isWinner = candidate.candidateId === comparisonResult.winnerId;
      rowData.push(isWinner ? `👑 ${candidate.name}` : candidate.name);

      // Оценки по критериям
      const scores: number[] = [];
      
      comparisonResult.criteria!.general?.forEach(criterion => {
        const scoreText = candidate.scores[criterion] || '-';
        rowData.push(scoreText);
        
        if (scoreText !== '-') {
          const match = scoreText.match(/(\d+)/);
          if (match) scores.push(parseInt(match[1]));
        }
      });

      comparisonResult.criteria!.specific?.forEach(criterion => {
        const scoreText = candidate.scores[criterion] || '-';
        rowData.push(scoreText);
        
        if (scoreText !== '-') {
          const match = scoreText.match(/(\d+)/);
          if (match) scores.push(parseInt(match[1]));
        }
      });

      // Оценка за тестирование (из данных кандидата, не из критериев)
      const candidateData = candidates.find(c => c.id === candidate.candidateId);
      const testScore = candidateData?.score 
        ? `${candidateData.score}/10` 
        : '-';
      
      rowData.push(testScore);
      
      // Рекомендация
      rowData.push(candidate.recommendation);

      row.values = rowData;
      row.alignment = { vertical: 'top', wrapText: true };
      row.height = 50; // Увеличенная высота для переноса текста
    });
  }

  currentRow++; // Пустая строка

  // === ОСНОВНАЯ ИНФОРМАЦИЯ О КАНДИДАТАХ ===
  const infoTitleRow = worksheet.getRow(currentRow++);
  infoTitleRow.getCell(1).value = 'ИНФОРМАЦИЯ О КАНДИДАТАХ';
  infoTitleRow.getCell(1).font = { size: 14, bold: true };

  currentRow++; // Пустая строка

  const infoHeaderRow = worksheet.getRow(currentRow++);
  infoHeaderRow.values = ['Кандидат', 'Email', 'Телефон', 'Статус', 'Дата создания'];
  infoHeaderRow.font = { bold: true };
  infoHeaderRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  infoHeaderRow.alignment = { vertical: 'middle', horizontal: 'center' };

  candidates.forEach(c => {
    const isWinner = c.id === comparisonResult.winnerId;
    const row = worksheet.getRow(currentRow++);
    row.values = [
      isWinner ? `👑 ${c.name}` : c.name,
      c.email || '-',
      c.phone || '-',
      c.status || '-',
      c.createdAt ? new Date(c.createdAt).toLocaleDateString('ru-RU') : '-'
    ];
    row.alignment = { vertical: 'top', wrapText: true };
  });

  currentRow++; // Пустая строка

  // === AI-АНАЛИЗ И РЕКОМЕНДАЦИИ ===
  if (comparisonResult.analysis || comparisonResult.reasoning) {
    const analysisTitleRow = worksheet.getRow(currentRow++);
    analysisTitleRow.getCell(1).value = 'AI-АНАЛИЗ И РЕКОМЕНДАЦИИ';
    analysisTitleRow.getCell(1).font = { size: 14, bold: true };

    currentRow++; // Пустая строка

    if (comparisonResult.analysis) {
      const analysisLabelRow = worksheet.getRow(currentRow++);
      analysisLabelRow.getCell(1).value = 'Общий анализ:';
      analysisLabelRow.getCell(1).font = { bold: true };

      const analysisRow = worksheet.getRow(currentRow++);
      analysisRow.getCell(1).value = comparisonResult.analysis;
      analysisRow.alignment = { vertical: 'top', wrapText: true };
      analysisRow.height = 100;

      currentRow++; // Пустая строка
    }

    if (comparisonResult.reasoning) {
      const reasoningLabelRow = worksheet.getRow(currentRow++);
      reasoningLabelRow.getCell(1).value = 'Обоснование рекомендаций:';
      reasoningLabelRow.getCell(1).font = { bold: true };

      const reasoningRow = worksheet.getRow(currentRow++);
      reasoningRow.getCell(1).value = comparisonResult.reasoning;
      reasoningRow.alignment = { vertical: 'top', wrapText: true };
      reasoningRow.height = 100;
    }
  }

  // Настраиваем ширину колонок
  worksheet.columns = [
    { width: 30 },  // Кандидат/Параметр
    { width: 25 },  // Критерий 1 / Email
    { width: 25 },  // Критерий 2 / Телефон
    { width: 25 },  // Критерий 3 / Статус
    { width: 25 },  // Критерий 4 / Дата
    { width: 15 },  // Средняя оценка
    { width: 40 },  // Рекомендация
  ];

  // === ВТОРОЙ ЛИСТ: МАТРИЦА ОТВЕТОВ НА ВОПРОСЫ ===
  if (answersMatrix && answersMatrix.questions.length > 0) {
    const answersSheet = workbook.addWorksheet('Ответы на вопросы');
    
    let row = 1;

    // Заголовок
    const titleRow = answersSheet.getRow(row++);
    titleRow.getCell(1).value = '📝 ОТВЕТЫ КАНДИДАТОВ НА ВОПРОСЫ';
    titleRow.getCell(1).font = { size: 16, bold: true };
    titleRow.height = 25;
    row++; // Пустая строка

    // Шапка таблицы: первая колонка "Вопрос", затем имена кандидатов
    const headerRow = answersSheet.getRow(row++);
    headerRow.getCell(1).value = 'Вопрос';
    headerRow.getCell(1).font = { bold: true };
    headerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    headerRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    answersMatrix.candidates.forEach((candidate, index) => {
      const cell = headerRow.getCell(index + 2);
      cell.value = candidate.name;
      cell.font = { bold: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    headerRow.height = 30;

    // Данные: каждая строка = вопрос, каждая колонка = ответ кандидата
    answersMatrix.questions.forEach((question) => {
      const dataRow = answersSheet.getRow(row++);
      
      // Первая колонка: текст вопроса
      const questionCell = dataRow.getCell(1);
      const questionText = `${question.position + 1}. ${question.text}`;
      questionCell.value = questionText;
      questionCell.alignment = { vertical: 'top', wrapText: true };
      questionCell.font = { bold: true };

      // Остальные колонки: ответы кандидатов
      answersMatrix.candidates.forEach((candidate, index) => {
        const answerCell = dataRow.getCell(index + 2);
        const answerData = answersMatrix.answers[candidate.id]?.[question.position];

        if (!answerData) {
          answerCell.value = '—';
          answerCell.alignment = { vertical: 'top', horizontal: 'center' };
        } else {
          // Формируем содержимое ячейки
          let cellValue = '';

          // Если есть видео/аудио - добавляем ссылку
          if (answerData.videoUrl) {
            cellValue = '🎥 Видео/аудио ответ';
            // Формируем полный URL к видео (если это относительный путь)
            const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';
            const fullVideoUrl = answerData.videoUrl.startsWith('http') 
              ? answerData.videoUrl 
              : `${API_BASE}${answerData.videoUrl}`;
            
            answerCell.value = {
              text: cellValue,
              hyperlink: fullVideoUrl,
            };
            answerCell.font = { color: { argb: 'FF0000FF' }, underline: true };
          } else if (answerData.answerText) {
            // Текстовый ответ
            cellValue = answerData.answerText;
            answerCell.value = cellValue;
          } else if (answerData.selectedOption !== undefined) {
            // Choice вопрос - показываем выбранный вариант
            cellValue = answerData.selectedOption;
            answerCell.value = cellValue;
          } else {
            cellValue = '—';
            answerCell.value = cellValue;
          }

          answerCell.alignment = { vertical: 'top', wrapText: true };

          // Добавляем заливку для red flag
          if (answerData.hasRedFlag) {
            answerCell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFCCCC' } // Светло-красный
            };
          }

          // Добавляем оценку если есть
          if (answerData.score !== null && answerData.score !== undefined) {
            const scoreInfo = `\n[Оценка: ${answerData.score}/10]`;
            if (typeof answerCell.value === 'string') {
              answerCell.value += scoreInfo;
            } else if (answerCell.value && typeof answerCell.value === 'object' && 'text' in answerCell.value) {
              answerCell.value.text += scoreInfo;
            }
          }
        }
      });

      dataRow.height = 60; // Увеличенная высота для читабельности
    });

    // Настройка ширины колонок
    const columns: Array<{ width: number }> = [{ width: 50 }]; // Первая колонка (вопрос)
    answersMatrix.candidates.forEach(() => {
      columns.push({ width: 40 }); // Колонки для ответов кандидатов
    });
    answersSheet.columns = columns;
  }

  // Генерируем файл
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Создаём ссылку для скачивания
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Сравнение_кандидатов_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  
  // Освобождаем память
  window.URL.revokeObjectURL(url);
}

