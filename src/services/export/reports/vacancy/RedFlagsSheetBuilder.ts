import ExcelJS from 'exceljs';
import { VacancyReportData } from './types';
import { ExcelStyleHelper } from '../../shared/ExcelStyleHelper';
import { TableBuilder } from '../../shared/TableBuilder';

/** Убирает HTML-теги и декодирует базовые HTML-сущности */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')          // теги → пробел
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s{2,}/g, ' ')           // схлопываем двойные пробелы
    .trim();
}

/**
 * Построитель листа «Красные флаги» (страница 3)
 */
export class RedFlagsSheetBuilder {
  static build(workbook: ExcelJS.Workbook, data: VacancyReportData): void {
    // Собираем только кандидатов с флагами
    const flaggedCandidates = data.candidates.filter(c => (c.redFlagCount ?? 0) > 0);

    const sheet = workbook.addWorksheet('🚩 Красные флаги');
    let currentRow = 1;

    // Заголовок
    const titleRow = sheet.getRow(currentRow++);
    titleRow.getCell(1).value = '🚩 КРАСНЫЕ ФЛАГИ';
    ExcelStyleHelper.applyMainTitleStyle(titleRow.getCell(1));
    titleRow.height = 25;

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Вакансия:', data.vacancy.title);
    currentRow = TableBuilder.addLabelValueRow(
      sheet, currentRow,
      'Кандидатов с флагами:',
      `${flaggedCandidates.length} из ${data.candidates.length}`
    );

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    if (flaggedCandidates.length === 0) {
      const noFlagsRow = sheet.getRow(currentRow++);
      noFlagsRow.getCell(1).value = '✅ Красных флагов не обнаружено';
      noFlagsRow.getCell(1).font = { italic: true, color: { argb: 'FF4CAF50' } };
      ExcelStyleHelper.setColumnWidths(sheet, [30, 20, 50, 60]);
      return;
    }

    // === СВОДНАЯ ТАБЛИЦА: кандидаты с флагами ===
    currentRow = TableBuilder.addSectionTitle(sheet, currentRow, 'СВОДКА ПО КАНДИДАТАМ');
    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    const summaryHeaders = ['Кандидат', 'Балл', 'Кол-во флагов'];
    const summaryHeaderRow = sheet.getRow(currentRow++);
    summaryHeaderRow.values = summaryHeaders;
    ExcelStyleHelper.applyHeaderStyle(summaryHeaderRow);

    const summaryStartRow = currentRow;
    flaggedCandidates.forEach(candidate => {
      const row = sheet.getRow(currentRow++);
      const score = candidate.score !== null ? candidate.score.toFixed(1) : '—';
      row.values = [candidate.name, score, candidate.redFlagCount];

      // Красная заливка строки
      for (let col = 1; col <= 3; col++) {
        row.getCell(col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3F3' },
        };
      }
      row.getCell(3).font = { bold: true, color: { argb: 'FFCC0000' } };
      row.height = 18;
    });

    ExcelStyleHelper.addBorders(sheet, summaryStartRow, 1, currentRow - 1, 3);

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);
    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    // === ДЕТАЛЬНАЯ ТАБЛИЦА: каждый флаг отдельной строкой ===
    currentRow = TableBuilder.addSectionTitle(sheet, currentRow, 'ДЕТАЛИ ПО КАЖДОМУ ФЛАГУ');
    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    const detailHeaders = ['Кандидат', 'Балл', 'Вопрос (красный флаг)', 'Ответ кандидата'];
    const detailHeaderRow = sheet.getRow(currentRow++);
    detailHeaderRow.values = detailHeaders;
    ExcelStyleHelper.applyHeaderStyle(detailHeaderRow);

    const detailStartRow = currentRow;
    let hasAnyDetail = false;

    flaggedCandidates.forEach(candidate => {
      const details = candidate.redFlagDetails ?? [];

      if (details.length === 0) {
        // Есть флаги но нет деталей (старые данные)
        const row = sheet.getRow(currentRow++);
        const score = candidate.score !== null ? candidate.score.toFixed(1) : '—';
        row.values = [candidate.name, score, '(детали недоступны)', ''];
        row.height = 18;
        hasAnyDetail = true;
        return;
      }

      details.forEach((flag, index) => {
        const row = sheet.getRow(currentRow++);
        const score = candidate.score !== null ? candidate.score.toFixed(1) : '—';

        row.values = [
          index === 0 ? candidate.name : '',
          index === 0 ? score : '',
          stripHtml(flag.question_text),
          flag.answer_text || '(пустой ответ)',
        ];

        // Красная заливка для колонки с вопросом
        row.getCell(3).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF0F0' },
        };
        row.getCell(3).font = { color: { argb: 'FF990000' } };

        row.alignment = { vertical: 'top', wrapText: true };
        row.height = 40;
        hasAnyDetail = true;
      });
    });

    if (hasAnyDetail) {
      ExcelStyleHelper.addBorders(sheet, detailStartRow, 1, currentRow - 1, 4);
    }

    // Ширина колонок
    ExcelStyleHelper.setColumnWidths(sheet, [28, 10, 55, 60]);
  }
}
