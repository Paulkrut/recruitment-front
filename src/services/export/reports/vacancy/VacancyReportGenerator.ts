import ExcelJS from 'exceljs';
import { VacancyReportData } from './types';
import { VacancyReportDataService } from './VacancyReportDataService';
import { SummarySheetBuilder } from './SummarySheetBuilder';
import { CandidatesSheetBuilder } from './CandidatesSheetBuilder';

/**
 * Главный генератор отчёта по вакансии
 */
export class VacancyReportGenerator {
  /**
   * Сгенерировать и скачать отчёт по вакансии
   */
  static async generate(vacancyId: number): Promise<void> {
    try {
      // 1. Загружаем данные с API
      const data = await VacancyReportDataService.fetchVacancyData(vacancyId);

      // 2. Создаём Excel файл
      const workbook = new ExcelJS.Workbook();
      
      // Метаданные
      workbook.creator = 'SofiHR';
      workbook.created = new Date();
      workbook.modified = new Date();

      // 3. Страница 1: Сводный отчёт
      SummarySheetBuilder.build(workbook, data);

      // 4. Страница 2: Список кандидатов
      CandidatesSheetBuilder.build(workbook, data);

      // 5. Скачиваем файл
      await this.downloadWorkbook(workbook, data.vacancy.title);

    } catch (error) {
      console.error('Ошибка генерации отчёта:', error);
      throw error;
    }
  }

  /**
   * Скачать Excel файл
   */
  private static async downloadWorkbook(
    workbook: ExcelJS.Workbook,
    vacancyTitle: string
  ): Promise<void> {
    // Генерируем buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Создаём Blob
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Создаём ссылку для скачивания
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Формируем имя файла
    const date = new Date().toISOString().split('T')[0];
    const safeTitle = vacancyTitle.replace(/[^a-zA-Zа-яА-Я0-9\s]/g, '').substring(0, 50);
    link.download = `Отчёт_${safeTitle}_${date}.xlsx`;
    
    // Скачиваем
    link.click();
    
    // Освобождаем память
    window.URL.revokeObjectURL(url);
  }
}

