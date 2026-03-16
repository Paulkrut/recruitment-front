import ExcelJS from 'exceljs';
import type { NewMetrics } from '@/hooks/useCandidateEvaluation';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

interface ExportCandidateData {
  candidateName: string;
  email?: string;
  phone?: string;
  status?: string;
  vacancyTitle?: string;
  createdAt?: string;
  sessionDetail?: any;
  evalData?: any;
}

const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE3EEF7' },
};

const SECTION_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFEFF6FF' },
};

const RED_FLAG_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFCCCC' },
};

const GOOD_SCORE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD4EDDA' },
};

const MED_SCORE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFF3CD' },
};

const BAD_SCORE_FILL: ExcelJS.Fill = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFFFE0E0' },
};

function addSectionTitle(ws: ExcelJS.Worksheet, row: number, text: string): number {
  const r = ws.getRow(row);
  r.getCell(1).value = text;
  r.getCell(1).font = { size: 13, bold: true, color: { argb: 'FF1565C0' } };
  r.getCell(1).fill = SECTION_FILL;
  r.height = 22;
  return row + 1;
}

// Estimate row height: colWidthChars — visible chars per line, lineHeightPt — pt per line
function estimateRowHeight(text: string, colWidthChars: number, lineHeightPt = 15, minHeight = 18): number {
  if (!text) return minHeight;
  const lines = text.split('\n');
  let totalLines = 0;
  for (const line of lines) {
    totalLines += Math.max(1, Math.ceil(line.length / colWidthChars));
  }
  return Math.max(minHeight, totalLines * lineHeightPt + 8);
}

// Sheet 1: 1.5× line height (22 pt per line)
function estimateRowHeightSheet1(text: string, colWidthChars = 80): number {
  return estimateRowHeight(text, colWidthChars, 22, 24);
}

// Sheet 2: 2× line height (30 pt per line)
function estimateRowHeightSheet2(text: string, colWidthChars: number): number {
  return estimateRowHeight(text, colWidthChars, 30, 40);
}

// Sheet 3: 2× line height (30 pt per line)
function estimateRowHeightSheet3(text: string, colWidthChars: number): number {
  return estimateRowHeight(text, colWidthChars, 30, 50);
}

function addKeyValue(ws: ExcelJS.Worksheet, row: number, key: string, value: string | number | null | undefined, valueColWidth = 80): number {
  const r = ws.getRow(row);
  r.getCell(1).value = key;
  r.getCell(1).font = { bold: true, color: { argb: 'FF374151' } };
  r.getCell(1).alignment = { vertical: 'top' };
  r.getCell(2).value = value ?? '—';
  r.getCell(2).alignment = { wrapText: true, vertical: 'top' };
  if (typeof value === 'string' && value.length > 40) {
    r.height = estimateRowHeightSheet1(value, valueColWidth);
  }
  return row + 1;
}

function scoreFill(score: number | null | undefined): ExcelJS.Fill | undefined {
  if (score === null || score === undefined) return undefined;
  if (score >= 8) return GOOD_SCORE_FILL;
  if (score >= 5) return MED_SCORE_FILL;
  return BAD_SCORE_FILL;
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    completed: 'Завершено',
    finished: 'Завершено',
    in_progress: 'В процессе',
    pending: 'Ожидает',
    ready: 'Готов к интервью',
    failed: 'Ошибка',
    canceled: 'Отменено',
    new: 'Новый',
    rejected: 'Отклонён',
    active: 'Активен',
    hired: 'Принят',
  };
  return map[status] ?? status;
}

function formatDuration(startAt: string, finishAt: string | null, answers: any[]): string {
  const start = new Date(startAt);
  let end: Date | null = finishAt ? new Date(finishAt) : null;
  if (!end && answers?.length > 0) {
    const last = answers[answers.length - 1];
    end = last.createdAt ? new Date(last.createdAt) : null;
  }
  if (!end) return '—';
  const ms = end.getTime() - start.getTime();
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  return `${min} мин ${sec} сек`;
}

// ─────────────────────────────────────────────────────────
// Sheet 1: Сводка
// ─────────────────────────────────────────────────────────
function buildSummarySheet(wb: ExcelJS.Workbook, data: ExportCandidateData) {
  const ws = wb.addWorksheet('Сводка');

  ws.columns = [
    { width: 36 },
    { width: 90 },
  ];

  let row = 1;

  // ── Заголовок ──
  const titleRow = ws.getRow(row++);
  titleRow.getCell(1).value = '📋 ОТЧЁТ ПО КАНДИДАТУ';
  titleRow.getCell(1).font = { size: 16, bold: true };
  titleRow.height = 28;
  row++; // пустая

  ws.getRow(row++).values = ['Дата создания отчёта:', new Date().toLocaleString('ru-RU')];

  row++; // пустая

  // ── Основная информация ──
  row = addSectionTitle(ws, row, '👤 Основная информация');
  row = addKeyValue(ws, row, 'Имя:', data.candidateName);
  row = addKeyValue(ws, row, 'Email:', data.email);
  row = addKeyValue(ws, row, 'Телефон:', data.phone);
  row = addKeyValue(ws, row, 'Статус кандидата:', data.status ? statusLabel(data.status) : undefined);
  row = addKeyValue(ws, row, 'Вакансия:', data.vacancyTitle);

  const session = data.sessionDetail;
  if (session) {
    row = addKeyValue(ws, row, 'Шаблон интервью:', session.template?.title);
    row = addKeyValue(ws, row, 'Статус сессии:', session.status ? statusLabel(session.status) : undefined);
    row = addKeyValue(ws, row, 'Начато:', session.startedAt ? new Date(session.startedAt).toLocaleString('ru-RU') : undefined);
    row = addKeyValue(ws, row, 'Завершено:', session.finishedAt ? new Date(session.finishedAt).toLocaleString('ru-RU') : undefined);
    if (session.startedAt) {
      row = addKeyValue(ws, row, 'Длительность:', formatDuration(session.startedAt, session.finishedAt, session.answers));
    }
    row = addKeyValue(ws, row, 'Кол-во ответов:', session.answers?.length ?? 0);

    if (session.tabFocusLostCount > 0) {
      const lostSec = session.tabFocusLostSeconds ?? 0;
      const lostMin = Math.floor(lostSec / 60);
      const lostSecRem = lostSec % 60;
      row = addKeyValue(
        ws, row,
        '⚠️ Покидал окно браузера:',
        `${session.tabFocusLostCount} раз (${lostMin > 0 ? `${lostMin} мин ` : ''}${lostSecRem} сек)`
      );
      ws.getRow(row - 1).getCell(2).font = { color: { argb: 'FFE65100' } };
    }
  }

  row++; // пустая

  // ── Оценки ──
  row = addSectionTitle(ws, row, '📊 Оценки');

  const totalScore = session?.result?.totalScore;
  if (totalScore !== undefined && totalScore !== null) {
    const r = ws.getRow(row++);
    r.getCell(1).value = '🎓 Total Skills (тест):';
    r.getCell(1).font = { bold: true };
    r.getCell(2).value = `${totalScore.toFixed(1)} / 10`;
    r.getCell(2).font = { bold: true };
    const fill = scoreFill(totalScore);
    if (fill) r.getCell(2).fill = fill;
  }

  const evalData = data.evalData;
  if (evalData) {
    const newMetrics = evalData.metrics && typeof evalData.metrics === 'object' && 'summary_table' in evalData.metrics
      ? (evalData.metrics as NewMetrics)
      : null;

    const competencyScore = newMetrics?.summary_table?.average_score;
    if (competencyScore !== undefined) {
      const r = ws.getRow(row++);
      r.getCell(1).value = '💡 Fit (компетенции):';
      r.getCell(1).font = { bold: true };
      r.getCell(2).value = `${competencyScore.toFixed(1)} / 10`;
      r.getCell(2).font = { bold: true };
      const fill = scoreFill(competencyScore);
      if (fill) r.getCell(2).fill = fill;
    }
  }

  // Красные флаги
  if (session?.answers) {
    const redFlagCount = session.answers.filter((a: any) => a.hasRedFlag).length;
    const r = ws.getRow(row++);
    r.getCell(1).value = '🚩 Красных флагов:';
    r.getCell(1).font = { bold: true };
    r.getCell(2).value = redFlagCount;
    if (redFlagCount > 0) {
      r.getCell(2).fill = RED_FLAG_FILL;
      r.getCell(2).font = { bold: true, color: { argb: 'FFCC0000' } };
    }
  }

  row++; // пустая

  // ── AI-оценка ──
  if (evalData) {
    row = addSectionTitle(ws, row, '🤖 AI-оценка');

    if (evalData.summary) {
      row = addKeyValue(ws, row, 'Резюме AI:', evalData.summary);
    }

    if (evalData.strengths?.length) {
      row = addKeyValue(ws, row, 'Сильные стороны:', evalData.strengths.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n'));
    }

    if (evalData.weaknesses?.length) {
      row = addKeyValue(ws, row, 'Зоны развития:', evalData.weaknesses.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n'));
    }

    const newMetrics = evalData.metrics && typeof evalData.metrics === 'object' && 'summary_table' in evalData.metrics
      ? (evalData.metrics as NewMetrics)
      : null;

    if (newMetrics?.summary_table) {
      const st = newMetrics.summary_table;
      if (st.key_strengths?.length) {
        row = addKeyValue(ws, row, 'Ключевые сильные стороны:', st.key_strengths.map((s, i) => `${i + 1}. ${s}`).join('\n'));
      }
      if (st.key_risks?.length) {
        row = addKeyValue(ws, row, 'Ключевые риски:', st.key_risks.map((s, i) => `${i + 1}. ${s}`).join('\n'));
        ws.getRow(row - 1).getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9C4' } };
      }
    }

    if (newMetrics?.recommendation) {
      row = addKeyValue(ws, row, 'Рекомендация AI:', newMetrics.recommendation.comment);
    }

    if (newMetrics?.retention_forecast && !newMetrics.retention_forecast.insufficient_data) {
      row++;
      row = addSectionTitle(ws, row, '📈 Прогноз удержания');
      const rf = newMetrics.retention_forecast;
      row = addKeyValue(ws, row, 'Прогноз срока работы:', rf.predicted_tenure);
      if (rf.reasoning) {
        row = addKeyValue(ws, row, 'Обоснование:', rf.reasoning);
      }
    }
  }
}

// ─────────────────────────────────────────────────────────
// Sheet 2: Ответы на вопросы
// ─────────────────────────────────────────────────────────
function buildAnswersSheet(wb: ExcelJS.Workbook, data: ExportCandidateData) {
  const session = data.sessionDetail;
  if (!session?.answers?.length) return;

  const ws = wb.addWorksheet('Ответы на вопросы');

  ws.columns = [
    { width: 6 },    // №
    { width: 50 },   // Вопрос
    { width: 55 },   // Ответ
    { width: 8 },    // Оценка
    { width: 45 },   // AI-характеристика
    { width: 12 },   // Флаг
    { width: 30 },   // Видео/Аудио
    { width: 20 },   // Время ответа
  ];

  let row = 1;

  // Заголовок листа
  const titleRow = ws.getRow(row++);
  titleRow.getCell(1).value = '📝 ОТВЕТЫ НА ВОПРОСЫ';
  titleRow.getCell(1).font = { size: 15, bold: true };
  titleRow.height = 26;
  row++;

  // Шапка таблицы
  const headerRow = ws.getRow(row++);
  const headers = ['№', 'Вопрос', 'Ответ кандидата', 'Оценка', 'AI-характеристика', 'Флаг', 'Медиа', 'Время ответа'];
  headerRow.values = headers;
  headerRow.font = { bold: true };
  headerRow.fill = HEADER_FILL;
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 28;

  // Строки с ответами
  session.answers.forEach((a: any, idx: number) => {
    const dataRow = ws.getRow(row++);
    dataRow.alignment = { vertical: 'top', wrapText: true };

    // Высота строки 3× — по самому длинному тексту среди вопроса, ответа и AI-комментария
    const questionText = a.question ?? '';
    const answerText  = a.text || a.selectedOption || '';
    const commentText = a.aiComment ?? '';
    dataRow.height = Math.max(
      estimateRowHeightSheet2(questionText, 50),
      estimateRowHeightSheet2(answerText,   55),
      estimateRowHeightSheet2(commentText,  45),
    );

    // № вопроса
    dataRow.getCell(1).value = idx + 1;
    dataRow.getCell(1).alignment = { vertical: 'top', horizontal: 'center' };

    // Текст вопроса
    dataRow.getCell(2).value = questionText || '—';

    // Ответ
    dataRow.getCell(3).value = answerText || '— нет ответа —';

    // Оценка
    if (a.score !== undefined && a.score !== null) {
      dataRow.getCell(4).value = `${a.score}/10`;
      dataRow.getCell(4).alignment = { vertical: 'top', horizontal: 'center' };
      const fill = scoreFill(a.score);
      if (fill) dataRow.getCell(4).fill = fill;
      dataRow.getCell(4).font = { bold: true };
    } else {
      dataRow.getCell(4).value = '—';
      dataRow.getCell(4).alignment = { vertical: 'top', horizontal: 'center' };
    }

    // AI-характеристика
    if (a.aiComment) {
      dataRow.getCell(5).value = a.aiComment;
    }

    // Красный флаг
    if (a.hasRedFlag) {
      dataRow.getCell(6).value = '🚩 Флаг';
      dataRow.getCell(6).fill = RED_FLAG_FILL;
      dataRow.getCell(6).font = { bold: true, color: { argb: 'FFCC0000' } };
      dataRow.getCell(6).alignment = { vertical: 'top', horizontal: 'center' };
      // Подсветить всю строку
      for (let col = 1; col <= 8; col++) {
        const cell = dataRow.getCell(col);
        if (col !== 6 && !cell.fill) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' } };
        }
      }
    } else {
      dataRow.getCell(6).value = '—';
      dataRow.getCell(6).alignment = { vertical: 'top', horizontal: 'center' };
    }

    // Медиа (ссылка на видео или аудио)
    const mediaPath = a.video || a.audio;
    if (mediaPath) {
      const mediaType = a.video ? '🎥 Видео' : '🎤 Аудио';
      const fullUrl = mediaPath.startsWith('http')
        ? mediaPath
        : `${API_BASE}/uploads/${mediaPath}`;
      dataRow.getCell(7).value = {
        text: mediaType,
        hyperlink: fullUrl,
      };
      dataRow.getCell(7).font = { color: { argb: 'FF1565C0' }, underline: true };
      dataRow.getCell(7).alignment = { vertical: 'top', horizontal: 'center' };
    } else {
      dataRow.getCell(7).value = '—';
      dataRow.getCell(7).alignment = { vertical: 'top', horizontal: 'center' };
    }

    // Время ответа
    if (a.createdAt) {
      dataRow.getCell(8).value = new Date(a.createdAt).toLocaleString('ru-RU');
      dataRow.getCell(8).alignment = { vertical: 'top' };
    }
  });
}

// ─────────────────────────────────────────────────────────
// Sheet 3: Компетенции (только при новом формате метрик)
// ─────────────────────────────────────────────────────────
const COMPETENCY_LABELS: Record<string, string> = {
  motivation: 'Мотивация',
  speech_culture: 'Речевая культура',
  client_orientation: 'Клиентоориентированность',
  stress_resistance: 'Стрессоустойчивость',
  responsibility: 'Ответственность',
  system_thinking: 'Системное мышление',
};

const CRITERION_STATUS_LABELS: Record<string, string> = {
  yes: '✅ Да',
  partial: '⚠️ Частично',
  no: '❌ Нет',
  not_checked: '— Не проверено',
};

function buildCompetenciesSheet(wb: ExcelJS.Workbook, data: ExportCandidateData) {
  const evalData = data.evalData;
  if (!evalData?.metrics) return;

  const newMetrics = typeof evalData.metrics === 'object' && 'competencies' in evalData.metrics
    ? (evalData.metrics as NewMetrics)
    : null;

  if (!newMetrics) return;

  const ws = wb.addWorksheet('Компетенции');

  ws.columns = [
    { width: 30 },  // Компетенция
    { width: 10 },  // Оценка
    { width: 40 },  // Критерий
    { width: 15 },  // Статус
    { width: 50 },  // Доказательство
    { width: 40 },  // Комментарий
  ];

  let row = 1;

  const titleRow = ws.getRow(row++);
  titleRow.getCell(1).value = '🎯 FIT-ОЦЕНКА: КОМПЕТЕНЦИИ';
  titleRow.getCell(1).font = { size: 15, bold: true };
  titleRow.height = 26;
  row++;

  // Шапка
  const headerRow = ws.getRow(row++);
  headerRow.values = ['Компетенция', 'Оценка', 'Критерий', 'Статус', 'Доказательство', 'Комментарий'];
  headerRow.font = { bold: true };
  headerRow.fill = HEADER_FILL;
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  headerRow.height = 28;

  const competencies = newMetrics.competencies;

  Object.entries(competencies).forEach(([key, comp]) => {
    if (!comp) return;

    const label = COMPETENCY_LABELS[key] ?? key;
    const score = comp.score;

    if (comp.criteria && comp.criteria.length > 0) {
      comp.criteria.forEach((criterion, idx) => {
        const r = ws.getRow(row++);
        r.alignment = { vertical: 'top', wrapText: true };
        // Высота 2× — по самому длинному тексту среди доказательства и комментария
        r.height = Math.max(
          estimateRowHeightSheet3(criterion.evidence ?? '', 50),
          estimateRowHeightSheet3(criterion.comment  ?? '', 40),
        );

        if (idx === 0) {
          r.getCell(1).value = label;
          r.getCell(1).font = { bold: true };
          r.getCell(2).value = score !== undefined ? `${score}/10` : '—';
          r.getCell(2).alignment = { vertical: 'top', horizontal: 'center' };
          r.getCell(2).font = { bold: true };
          const fill = scoreFill(score);
          if (fill) r.getCell(2).fill = fill;
        }

        r.getCell(3).value = criterion.name;
        r.getCell(4).value = CRITERION_STATUS_LABELS[criterion.status] ?? criterion.status;
        r.getCell(4).alignment = { vertical: 'top', horizontal: 'center' };
        r.getCell(5).value = criterion.evidence;
        r.getCell(6).value = criterion.comment;

        if (criterion.status === 'no') {
          r.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } };
        } else if (criterion.status === 'partial') {
          r.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' } };
        } else if (criterion.status === 'yes') {
          r.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD4EDDA' } };
        }
      });
    } else {
      const r = ws.getRow(row++);
      r.alignment = { vertical: 'top', wrapText: true };
      r.height = estimateRowHeightSheet3(comp.overall_comment ?? comp.comment ?? '', 40);
      r.getCell(1).value = label;
      r.getCell(1).font = { bold: true };
      r.getCell(2).value = score !== undefined ? `${score}/10` : '—';
      r.getCell(2).alignment = { vertical: 'top', horizontal: 'center' };
      r.getCell(2).font = { bold: true };
      const fill = scoreFill(score);
      if (fill) r.getCell(2).fill = fill;
      if (comp.overall_comment || comp.comment) {
        r.getCell(6).value = comp.overall_comment ?? comp.comment;
      }
    }
  });

  // Прогноз удержания
  const rf = newMetrics.retention_forecast;
  if (rf && !rf.insufficient_data && rf.retention_timeline?.length) {
    row += 2;
    row = addSectionTitle(ws, row, '📈 Прогноз удержания');
    row++;

    const rfHeader = ws.getRow(row++);
    rfHeader.values = ['Период', 'События', 'Вероятность удержания', 'Триггер'];
    rfHeader.font = { bold: true };
    rfHeader.fill = HEADER_FILL;
    rfHeader.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    rfHeader.height = 24;

    ws.getRow(row - 1).getCell(1).value = 'Период';

    rf.retention_timeline.forEach((item) => {
      const r = ws.getRow(row++);
      r.alignment = { vertical: 'top', wrapText: true };
      r.height = Math.max(
        estimateRowHeightSheet3(item.events  ?? '', 40),
        estimateRowHeightSheet3(item.trigger ?? '', 40),
      );
      r.getCell(1).value = item.month;
      r.getCell(2).value = item.events;
      r.getCell(3).value = `${item.probability}%`;
      r.getCell(3).alignment = { vertical: 'top', horizontal: 'center' };
      r.getCell(4).value = item.trigger;

      const prob = item.probability;
      if (prob >= 70) {
        r.getCell(3).fill = GOOD_SCORE_FILL;
      } else if (prob >= 40) {
        r.getCell(3).fill = MED_SCORE_FILL;
      } else {
        r.getCell(3).fill = BAD_SCORE_FILL;
      }
    });
  }
}

// ─────────────────────────────────────────────────────────
// Главная функция экспорта
// ─────────────────────────────────────────────────────────
export async function exportCandidateToExcel(data: ExportCandidateData): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SofiHR';
  wb.created = new Date();

  buildSummarySheet(wb, data);
  buildAnswersSheet(wb, data);
  buildCompetenciesSheet(wb, data);

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;

  const safeName = data.candidateName.replace(/[^а-яёА-ЯЁa-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_');
  link.download = `Кандидат_${safeName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
