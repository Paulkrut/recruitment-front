/**
 * Общие типы для экспорта данных
 */

export interface ExcelStyleConfig {
  headerFontSize?: number;
  titleFontSize?: number;
  defaultFontSize?: number;
  headerBgColor?: string;
  titleBgColor?: string;
  accentColor?: string;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

export interface ExportMetadata {
  generatedAt: string;
  generatedBy?: string;
  version?: string;
}

