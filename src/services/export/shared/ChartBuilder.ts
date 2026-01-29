import ExcelJS from 'exceljs';

/**
 * Вспомогательные методы для создания диаграмм в Excel
 * 
 * Примечание: ExcelJS поддерживает диаграммы через изображения.
 * Для более сложных диаграмм можно использовать Chart.js + canvas.
 */
export class ChartBuilder {
  /**
   * Создать простую гистограмму с использованием символов
   * (fallback если нужна простая визуализация без изображений)
   */
  static createTextBarChart(
    worksheet: ExcelJS.Worksheet,
    data: Array<{ label: string; value: number }>,
    startRow: number,
    maxBarLength: number = 20
  ): number {
    let currentRow = startRow;
    
    const maxValue = Math.max(...data.map(d => d.value));
    
    data.forEach(item => {
      const row = worksheet.getRow(currentRow++);
      const barLength = Math.round((item.value / maxValue) * maxBarLength);
      const bar = '█'.repeat(barLength);
      
      row.values = [item.label, item.value, bar];
      row.getCell(3).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4A90E2' }
      };
    });

    return currentRow;
  }

  /**
   * Добавить горизонтальную гистограмму
   * Использует условное форматирование для визуализации
   */
  static addHorizontalBarChart(
    worksheet: ExcelJS.Worksheet,
    dataRange: { startRow: number; endRow: number; col: number },
    options?: { color?: string; maxValue?: number }
  ): void {
    const maxValue = options?.maxValue || 100;
    const color = options?.color || '4A90E2';

    for (let row = dataRange.startRow; row <= dataRange.endRow; row++) {
      const cell = worksheet.getRow(row).getCell(dataRange.col);
      const value = parseFloat(cell.value as string) || 0;
      
      // Применяем цветное форматирование
      const intensity = Math.round((value / maxValue) * 255);
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: `FF${intensity.toString(16).padStart(2, '0')}${color}` }
      };
    }
  }

  /**
   * Создать круговую диаграмму с помощью символов
   */
  static createTextPieChart(
    worksheet: ExcelJS.Worksheet,
    data: Array<{ label: string; value: number; percentage: number }>,
    startRow: number
  ): number {
    let currentRow = startRow;
    
    data.forEach((item, index) => {
      const row = worksheet.getRow(currentRow++);
      const pieSlice = this.getPieSliceSymbol(index);
      const percentBar = '▓'.repeat(Math.round(item.percentage / 5));
      
      row.values = [
        `${pieSlice} ${item.label}`,
        item.value,
        `${item.percentage.toFixed(1)}%`,
        percentBar
      ];
    });

    return currentRow;
  }

  /**
   * Получить символ для сектора круговой диаграммы
   */
  private static getPieSliceSymbol(index: number): string {
    const symbols = ['🔵', '🟢', '🟡', '🟠', '🔴', '🟣', '🟤', '⚫', '⚪'];
    return symbols[index % symbols.length];
  }

  /**
   * Добавить спарклайн (мини-график) в ячейку
   * Использует символы Unicode для создания визуализации
   */
  static createSparkline(values: number[]): string {
    const blocks = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    return values
      .map(v => {
        if (range === 0) return blocks[0];
        const normalized = (v - min) / range;
        const blockIndex = Math.floor(normalized * (blocks.length - 1));
        return blocks[blockIndex];
      })
      .join('');
  }
}

