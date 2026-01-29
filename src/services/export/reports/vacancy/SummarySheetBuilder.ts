import ExcelJS from 'exceljs';
import { VacancyReportData } from './types';
import { ExcelStyleHelper } from '../../shared/ExcelStyleHelper';
import { ChartBuilder } from '../../shared/ChartBuilder';
import { TableBuilder } from '../../shared/TableBuilder';

/**
 * Построитель сводного отчёта (страница 1)
 */
export class SummarySheetBuilder {
  static build(workbook: ExcelJS.Workbook, data: VacancyReportData): void {
    const sheet = workbook.addWorksheet('Сводный отчёт');
    let currentRow = 1;

    // === ШАПКА ===
    currentRow = this.addHeader(sheet, currentRow, data);
    
    // === РАСПРЕДЕЛЕНИЕ ПО БАЛЛАМ ===
    currentRow = this.addScoreDistribution(sheet, currentRow, data);
    
    // === СТАТУСЫ КАНДИДАТОВ ===
    currentRow = this.addStatusStats(sheet, currentRow, data);
    
    // === ТОП-5 КАНДИДАТОВ ===
    currentRow = this.addTopCandidates(sheet, currentRow, data);

    // Установка ширины колонок
    ExcelStyleHelper.setColumnWidths(sheet, [30, 15, 25, 25, 25]);
  }

  /**
   * Добавить шапку отчёта
   */
  private static addHeader(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    data: VacancyReportData
  ): number {
    let currentRow = startRow;

    // Главный заголовок
    const titleRow = sheet.getRow(currentRow++);
    titleRow.getCell(1).value = '📊 СВОДНЫЙ ОТЧЁТ ПО ВАКАНСИИ';
    ExcelStyleHelper.applyMainTitleStyle(titleRow.getCell(1));
    titleRow.height = 25;

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    // Информация о вакансии
    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Вакансия:', data.vacancy.title);
    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Дата формирования:', new Date().toLocaleString('ru-RU'));
    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Всего кандидатов:', data.summary.totalCandidates);
    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Прошли тест:', data.summary.completedInterviews);
    currentRow = TableBuilder.addLabelValueRow(sheet, currentRow, 'Средний балл:', `${data.summary.averageScore}/10`);

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    return currentRow;
  }

  /**
   * Добавить распределение по баллам
   */
  private static addScoreDistribution(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    data: VacancyReportData
  ): number {
    let currentRow = startRow;

    // Заголовок секции
    currentRow = TableBuilder.addSectionTitle(sheet, currentRow, 'РАСПРЕДЕЛЕНИЕ ПО БАЛЛАМ');
    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    // Таблица
    const headers = ['Балл', 'Количество', '% от всех', 'Визуализация'];
    const headerRow = sheet.getRow(currentRow++);
    headerRow.values = headers;
    ExcelStyleHelper.applyHeaderStyle(headerRow);

    const totalCompleted = data.summary.completedInterviews || 1; // Избегаем деления на 0

    // Данные (от 10 до 0)
    for (let score = 10; score >= 0; score--) {
      const scoreData = data.summary.scoreDistribution.find(s => s.score === score);
      const count = scoreData?.count || 0;
      const percentage = (count / totalCompleted) * 100;
      const barLength = Math.round(percentage / 5);
      const bar = '█'.repeat(barLength);

      const row = sheet.getRow(currentRow++);
      row.values = [score, count, `${percentage.toFixed(1)}%`, bar];
      
      // Цветовое выделение для баллов с кандидатами
      if (count > 0) {
        ExcelStyleHelper.applyScoreColor(row.getCell(1), score);
      }
      
      // Цвет для визуализации
      if (bar) {
        row.getCell(4).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4A90E2' }
        };
      }
    }

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    return currentRow;
  }

  /**
   * Добавить статистику по статусам
   */
  private static addStatusStats(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    data: VacancyReportData
  ): number {
    let currentRow = startRow;

    // Заголовок секции
    currentRow = TableBuilder.addSectionTitle(sheet, currentRow, 'СТАТУСЫ КАНДИДАТОВ');
    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    // Таблица
    const headers = ['Статус', 'Количество', '%', 'Диаграмма'];
    const headerRow = sheet.getRow(currentRow++);
    headerRow.values = headers;
    ExcelStyleHelper.applyHeaderStyle(headerRow);

    const total = data.summary.totalCandidates || 1;
    
    // Маппинг статусов на русский
    const statusNames: Record<string, string> = {
      'finished': 'Завершено',
      'completed': 'Завершено',
      'in_progress': 'В процессе',
      'pending': 'Не начато',
      'not_started': 'Не начато',
    };

    // Цвета для разных статусов
    const statusSymbols = ['🔵', '🟢', '🟡', '🟠', '🔴'];
    
    data.summary.statusStats.forEach((stat, index) => {
      const percentage = (stat.count / total) * 100;
      const statusName = statusNames[stat.status] || stat.status;
      const symbol = statusSymbols[index % statusSymbols.length];
      const pieBar = '▓'.repeat(Math.round(percentage / 5));

      const row = sheet.getRow(currentRow++);
      row.values = [
        `${symbol} ${statusName}`,
        stat.count,
        `${percentage.toFixed(1)}%`,
        pieBar
      ];
    });

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    return currentRow;
  }

  /**
   * Добавить топ-5 кандидатов
   */
  private static addTopCandidates(
    sheet: ExcelJS.Worksheet,
    startRow: number,
    data: VacancyReportData
  ): number {
    let currentRow = startRow;

    // Заголовок секции
    currentRow = TableBuilder.addSectionTitle(sheet, currentRow, 'ТОП-5 КАНДИДАТОВ');
    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    // Таблица
    const headers = ['№', 'Имя', 'Балл', 'Дата прохождения'];
    const headerRow = sheet.getRow(currentRow++);
    headerRow.values = headers;
    ExcelStyleHelper.applyHeaderStyle(headerRow);

    data.summary.topCandidates.forEach((candidate, index) => {
      const row = sheet.getRow(currentRow++);
      const place = index + 1;
      const name = place === 1 ? `👑 ${candidate.name}` : candidate.name;
      const score = candidate.score !== null ? `${candidate.score}/10` : '-';
      const date = candidate.completedAt 
        ? new Date(candidate.completedAt).toLocaleDateString('ru-RU')
        : '-';

      row.values = [place, name, score, date];

      // Золотая медаль для первого места
      if (place === 1 && candidate.score !== null) {
        row.getCell(3).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFD700' }
        };
        row.getCell(3).font = { bold: true };
      }
    });

    currentRow = TableBuilder.addEmptyRow(sheet, currentRow);

    return currentRow;
  }
}

