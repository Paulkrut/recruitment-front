import ExcelJS from 'exceljs';
import { ExcelStyleHelper } from './ExcelStyleHelper';

/**
 * Вспомогательные методы для создания таблиц в Excel
 */
export class TableBuilder {
  /**
   * Создать таблицу с заголовками и данными
   */
  static createTable(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    headers: string[],
    data: any[][],
    options?: {
      headerStyle?: boolean;
      borders?: boolean;
      columnWidths?: number[];
    }
  ): number {
    let currentRow = startRow;

    // Заголовки
    const headerRow = worksheet.getRow(currentRow++);
    headerRow.values = headers;
    
    if (options?.headerStyle !== false) {
      ExcelStyleHelper.applyHeaderStyle(headerRow);
    }

    // Данные
    data.forEach(rowData => {
      const row = worksheet.getRow(currentRow++);
      row.values = rowData;
      ExcelStyleHelper.applyDataCellStyle(row.getCell(1));
    });

    // Рамки
    if (options?.borders) {
      ExcelStyleHelper.addBorders(
        worksheet,
        startRow,
        1,
        currentRow - 1,
        headers.length
      );
    }

    // Ширина колонок
    if (options?.columnWidths) {
      ExcelStyleHelper.setColumnWidths(worksheet, options.columnWidths);
    }

    return currentRow;
  }

  /**
   * Добавить пустую строку
   */
  static addEmptyRow(worksheet: ExcelJS.Worksheet, currentRow: number): number {
    return currentRow + 1;
  }

  /**
   * Добавить строку с заголовком секции
   */
  static addSectionTitle(
    worksheet: ExcelJS.Worksheet,
    currentRow: number,
    title: string
  ): number {
    const row = worksheet.getRow(currentRow);
    const cell = row.getCell(1);
    cell.value = title;
    ExcelStyleHelper.applySectionTitleStyle(cell);
    row.height = 25;
    
    return currentRow + 1;
  }

  /**
   * Добавить строку с меткой и значением
   */
  static addLabelValueRow(
    worksheet: ExcelJS.Worksheet,
    currentRow: number,
    label: string,
    value: any
  ): number {
    const row = worksheet.getRow(currentRow);
    row.values = [label, value];
    row.getCell(1).font = { bold: true };
    
    return currentRow + 1;
  }
}

