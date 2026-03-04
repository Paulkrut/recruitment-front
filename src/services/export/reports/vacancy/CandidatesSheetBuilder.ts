import ExcelJS from 'exceljs';
import { VacancyReportData } from './types';
import { ExcelStyleHelper } from '../../shared/ExcelStyleHelper';
import { TableBuilder } from '../../shared/TableBuilder';

/**
 * Построитель списка кандидатов (страница 2)
 */
export class CandidatesSheetBuilder {
  static build(workbook: ExcelJS.Workbook, data: VacancyReportData): void {
    const sheet = workbook.addWorksheet('Список кандидатов');
    let currentRow = 1;

    // Заголовок
    const titleRow = sheet.getRow(currentRow++);
    titleRow.getCell(1).value = '📋 СПИСОК КАНДИДАТОВ';
    ExcelStyleHelper.applyMainTitleStyle(titleRow.getCell(1));
    titleRow.height = 25;

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    // Информация
    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Вакансия:', data.vacancy.title);
    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Всего записей:', data.candidates.length);

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    // Таблица кандидатов
    const headers = ['№', 'Имя', 'Email', 'Телефон', 'Балл', '🚩', 'Статус', 'Дата создания', 'Дата прохождения'];
    const headerRow = sheet.getRow(currentRow++);
    headerRow.values = headers;
    ExcelStyleHelper.applyHeaderStyle(headerRow);

    // Маппинг статусов
    const statusNames: Record<string, string> = {
      'finished': '✅ Завершено',
      'completed': '✅ Завершено',
      'in_progress': '⏳ В процессе',
      'pending': '⏸️ Ожидает',
      'not_started': '❌ Не начато',
    };

    data.candidates.forEach((candidate, index) => {
      const row = sheet.getRow(currentRow++);
      const score = candidate.score !== null ? candidate.score.toFixed(1) : '-';
      const status = statusNames[candidate.sessionStatus || 'not_started'] || candidate.sessionStatus || '-';
      const createdDate = candidate.createdAt 
        ? new Date(candidate.createdAt).toLocaleDateString('ru-RU')
        : '-';
      const completedDate = candidate.completedAt
        ? new Date(candidate.completedAt).toLocaleDateString('ru-RU')
        : '-';

      const redFlagCount = candidate.redFlagCount ?? 0;
      const redFlagCell = redFlagCount > 0 ? `🚩 ${redFlagCount}` : '—';

      row.values = [
        index + 1,
        candidate.name,
        candidate.email || '-',
        candidate.phone || '-',
        score,
        redFlagCell,
        status,
        createdDate,
        completedDate
      ];

      // Цветовое выделение оценки
      if (candidate.score !== null) {
        ExcelStyleHelper.applyScoreColor(row.getCell(5), candidate.score);
      }

      // Красная заливка ячейки с флагами
      if (redFlagCount > 0) {
        row.getCell(6).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE0E0' },
        };
        row.getCell(6).font = { bold: true, color: { argb: 'FFCC0000' } };
      }

      // Перенос текста
      row.alignment = { vertical: 'top', wrapText: true };
      row.height = 20;
    });

    // Установка ширины колонок
    ExcelStyleHelper.setColumnWidths(sheet, [8, 25, 25, 18, 10, 10, 18, 15, 15]);

    // Добавляем рамки
    if (data.candidates.length > 0) {
      ExcelStyleHelper.addBorders(
        sheet,
        currentRow - data.candidates.length,
        1,
        currentRow - 1,
        9
      );
    }
  }
}

