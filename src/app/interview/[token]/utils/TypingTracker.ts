/**
 * TypingTracker - утилита для отслеживания метрик печати
 * 
 * Измеряет:
 * - Скорость печати (начиная с 1-го символа)
 * - Паузы (более 3 секунд без печати)
 * - Исправления (backspace)
 * - Временную линию печати
 */

export interface TypingMetricsData {
  startTime: Date | null;
  endTime: Date | null;
  totalChars: number;
  pauses: Array<{ atChar: number; durationSeconds: number }>;
  corrections: number;
  timeline: Array<{ timestamp: number; char: string; action: 'add' | 'delete' }>;
}

export class TypingTracker {
  private metrics: TypingMetricsData = {
    startTime: null,
    endTime: null,
    totalChars: 0,
    pauses: [],
    corrections: 0,
    timeline: []
  };
  
  private lastKeyTime: Date | null = null;
  private isTracking = false;
  private readonly PAUSE_THRESHOLD_MS = 3000; // 3 секунды
  
  /**
   * Начать отслеживание (автоматически вызывается при первом нажатии клавиши)
   */
  start() {
    if (!this.isTracking) {
      this.metrics.startTime = new Date();
      this.isTracking = true;
      this.lastKeyTime = new Date();
    }
  }
  
  /**
   * Обработать нажатие клавиши
   * @param key - нажатая клавиша
   * @param currentLength - текущая длина текста
   */
  onKeyPress(key: string, currentLength: number) {
    const now = new Date();
    
    if (!this.isTracking) {
      this.start();
    }
    
    // Проверяем паузу (более 3 секунд без печати)
    if (this.lastKeyTime) {
      const pauseDuration = (now.getTime() - this.lastKeyTime.getTime()) / 1000;
      if (pauseDuration >= this.PAUSE_THRESHOLD_MS / 1000) {
        this.metrics.pauses.push({
          atChar: currentLength,
          durationSeconds: parseFloat(pauseDuration.toFixed(2))
        });
      }
    }
    
    // Отслеживаем backspace (исправления)
    if (key === 'Backspace') {
      this.metrics.corrections++;
      this.metrics.timeline.push({
        timestamp: now.getTime(),
        char: '',
        action: 'delete'
      });
    } else if (key.length === 1) {
      // Обычный символ
      this.metrics.timeline.push({
        timestamp: now.getTime(),
        char: key,
        action: 'add'
      });
    }
    
    this.lastKeyTime = now;
    this.metrics.totalChars = currentLength;
  }
  
  /**
   * Завершить отслеживание и получить данные
   */
  finish(): TypingMetricsData {
    this.metrics.endTime = new Date();
    this.isTracking = false;
    return { ...this.metrics };
  }
  
  /**
   * Сбросить все данные
   */
  reset() {
    this.metrics = {
      startTime: null,
      endTime: null,
      totalChars: 0,
      pauses: [],
      corrections: 0,
      timeline: []
    };
    this.lastKeyTime = null;
    this.isTracking = false;
  }
  
  /**
   * Получить текущую скорость печати (символов в минуту)
   */
  getCurrentSpeed(): number {
    if (!this.metrics.startTime || !this.isTracking) return 0;
    
    const now = new Date();
    const seconds = (now.getTime() - this.metrics.startTime.getTime()) / 1000;
    if (seconds <= 0) return 0;
    
    return Math.round((this.metrics.totalChars / seconds) * 60);
  }
  
  /**
   * Проверка, активно ли отслеживание
   */
  isActive(): boolean {
    return this.isTracking;
  }
}


