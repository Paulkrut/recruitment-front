import ExcelJS from 'exceljs';

/**
 * Вспомогательные утилиты для стилизации Excel-файлов
 */
export class ExcelStyleHelper {
  /**
   * Стандартные цвета
   */
  static readonly COLORS = {
    HEADER_BG: 'FFE0E0E0',
    TITLE_BG: 'FF4A90E2',
    ACCENT: 'FF1976D2',
    SUCCESS: 'FF4CAF50',
    WARNING: 'FFFF9800',
    ERROR: 'FFF44336',
    INFO: 'FF2196F3',
  };

  /**
   * Применить стиль заголовка таблицы
   */
  static applyHeaderStyle(row: ExcelJS.Row): void {
    row.font = { bold: true, size: 11 };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.HEADER_BG }
    };
    row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    row.height = 30;
  }

  /**
   * Применить стиль заголовка секции
   */
  static applySectionTitleStyle(cell: ExcelJS.Cell): void {
    cell.font = { bold: true, size: 14 };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: this.COLORS.TITLE_BG }
    };
    cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' } };
  }

  /**
   * Применить стиль для основного заголовка
   */
  static applyMainTitleStyle(cell: ExcelJS.Cell): void {
    cell.font = { bold: true, size: 16 };
    cell.alignment = { vertical: 'middle', horizontal: 'left' };
  }

  /**
   * Применить стиль для ячейки с данными
   */
  static applyDataCellStyle(cell: ExcelJS.Cell, wrapText: boolean = true): void {
    cell.alignment = { vertical: 'top', wrapText, horizontal: 'left' };
  }

  /**
   * Применить цветовое выделение на основе оценки
   */
  static applyScoreColor(cell: ExcelJS.Cell, score: number): void {
    let color: string;
    
    if (score >= 9) {
      color = this.COLORS.SUCCESS;
    } else if (score >= 7) {
      color = this.COLORS.INFO;
    } else if (score >= 5) {
      color = this.COLORS.WARNING;
    } else {
      color = this.COLORS.ERROR;
    }

    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color }
    };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  }

  /**
   * Установить ширину колонок
   */
  static setColumnWidths(worksheet: ExcelJS.Worksheet, widths: number[]): void {
    widths.forEach((width, index) => {
      const col = worksheet.getColumn(index + 1);
      col.width = width;
    });
  }

  /**
   * Добавить рамки для диапазона ячеек
   */
  static addBorders(
    worksheet: ExcelJS.Worksheet,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): void {
    const borderStyle: Partial<ExcelJS.Border> = {
      style: 'thin',
      color: { argb: 'FF000000' }
    };

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        const cell = worksheet.getRow(row).getCell(col);
        cell.border = {
          top: borderStyle,
          left: borderStyle,
          bottom: borderStyle,
          right: borderStyle
        };
      }
    }
  }
}

