import jsPDF from 'jspdf';
import 'jspdf-font';

interface CandidateData {
  candidate: string;
  email?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  finishedAt?: string;
  sessionDetail?: any;
  evalData?: any;
}

interface AnswerData {
  id: string;
  question: string;
  text?: string;
  score?: number;
  aiComment?: string;
  audio?: string;
  video?: string;
  createdAt?: string;
}

export const exportCandidateToPDFWithFont = async (data: CandidateData) => {
  // Создаем новый PDF документ
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  // Добавляем локальный кириллический шрифт
  doc.addFont('/fonts/roboto/static/Roboto-Regular.ttf', 'Roboto', 'normal');
  doc.addFont('/fonts/roboto/static/Roboto-Bold.ttf', 'Roboto', 'bold');
  doc.setFont('Roboto');
  
  let yPosition = 15;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  const bottomMargin = 20; // Нижний отступ
  
  // Добавляем логотип и заголовок в шапку
  const addHeader = () => {
    // Фоновая полоса сверху (акцентный цвет)
    doc.setFillColor(33, 150, 243); // Синий
    doc.rect(0, 0, pageWidth, 8, 'F');
    
    // Логотип SofiHR (текстовый)
    doc.setFontSize(20);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(33, 150, 243); // Синий цвет #2196F3 (Material Blue)
    doc.text('SofiHR', margin, yPosition);
    
    // Подзаголовок
    doc.setFontSize(10);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(128, 128, 128); // Серый
    doc.text('Система рекрутинга', margin, yPosition + 6);
    
    // Дата генерации справа
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    const currentDate = new Date().toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    });
    doc.text(`${currentDate}`, pageWidth - margin, yPosition, { align: 'right' });
    
    // Элегантная линия-разделитель с градиентом (имитация)
    doc.setDrawColor(33, 150, 243);
    doc.setLineWidth(1);
    doc.line(margin, yPosition + 10, pageWidth - margin, yPosition + 10);
    
    // Тонкая серая линия под основной
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition + 11, pageWidth - margin, yPosition + 11);
    
    // Сброс цвета текста на чёрный
    doc.setTextColor(0, 0, 0);
    
    yPosition += 18; // Отступ после шапки
  };
  
  // Добавляем шапку на первую страницу
  addHeader();
  
  // Функция для добавления текста с переносом строк
  const addWrappedText = (text: string, x: number, maxWidth: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    
    // Расчет высоты строки с учетом межстрочного интервала
    // fontSize в pt, нужно конвертировать в mm и добавить интервал
    const lineHeight = fontSize * 0.35277778 * 1.15; // +15% для межстрочного интервала
    const totalHeight = lines.length * lineHeight;
    
    // Если не помещается - создаём новую страницу
    if (yPosition + totalHeight > pageHeight - bottomMargin) {
      doc.addPage();
      yPosition = margin;
    }
    
    // Рисуем текст на текущей позиции
    doc.text(lines, x, yPosition);
    
    // ВАЖНО: Обновляем yPosition, сдвигая вниз на высоту добавленного текста
    yPosition += totalHeight;
    
    return totalHeight;
  };
  
  // Функция для проверки необходимости новой страницы
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > pageHeight - bottomMargin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };
  
  // Функция для добавления заголовка секции с фоном
  const addSectionHeader = (title: string, icon: string = '📋') => {
    checkNewPage(20);
    
    // Фоновый прямоугольник для заголовка
    doc.setFillColor(240, 248, 255); // Очень светло-синий
    doc.roundedRect(margin - 2, yPosition - 5, contentWidth + 4, 12, 2, 2, 'F');
    
    // Акцентная линия слева
    doc.setFillColor(33, 150, 243); // Синий
    doc.rect(margin - 2, yPosition - 5, 3, 12, 'F');
    
    // Заголовок
    doc.setFontSize(16);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(33, 150, 243);
    doc.text(`${icon} ${title}`, margin + 5, yPosition + 2);
    
    // Сброс цвета
    doc.setTextColor(0, 0, 0);
    yPosition += 15;
  };
  
  // Функция для добавления информационного блока
  const addInfoBox = (title: string, content: string, type: 'info' | 'success' | 'warning' = 'info') => {
    checkNewPage(20);
    
    // Цвета в зависимости от типа
    const colors = {
      info: { bg: [240, 248, 255] as [number, number, number], border: [33, 150, 243] as [number, number, number], text: [25, 118, 210] as [number, number, number] },
      success: { bg: [232, 245, 233] as [number, number, number], border: [76, 175, 80] as [number, number, number], text: [56, 142, 60] as [number, number, number] },
      warning: { bg: [255, 248, 225] as [number, number, number], border: [255, 152, 0] as [number, number, number], text: [245, 124, 0] as [number, number, number] }
    };
    
    const color = colors[type];
    
    // Фон блока
    doc.setFillColor(color.bg[0], color.bg[1], color.bg[2]);
    doc.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'F');
    
    // Рамка
    doc.setDrawColor(color.border[0], color.border[1], color.border[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, yPosition, contentWidth, 15, 2, 2, 'S');
    
    // Заголовок
    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(color.text[0], color.text[1], color.text[2]);
    doc.text(title, margin + 3, yPosition + 5);
    
    // Контент
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(content, margin + 3, yPosition + 11);
    
    // Сброс
    doc.setTextColor(0, 0, 0);
    yPosition += 18;
  };
  
  // Главный заголовок
  doc.setFontSize(22);
  doc.setFont('Roboto', 'bold');
  doc.text('Отчет по кандидату', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;
  
  // Информация о кандидате
  addSectionHeader('Основная информация', '👤');
  
  doc.setFontSize(12);
  doc.setFont('Roboto', 'normal');
  
  const candidateInfo = [
    `Имя: ${data.candidate}`,
    `Email: ${data.email || 'Не указан'}`,
    `Телефон: ${data.phone || 'Не указан'}`,
    `Статус: ${data.status || 'Не указан'}`,
    `Создано: ${data.createdAt || 'Не указано'}`,
    `Завершено: ${data.finishedAt || 'Не указано'}`
  ];
  
  candidateInfo.forEach(info => {
    checkNewPage(10);
    doc.text(info, margin, yPosition);
    yPosition += 7;
  });
  
  yPosition += 10;
  
  // Информация о сессии интервью
  if (data.sessionDetail) {
    addSectionHeader('Детали интервью', '💼');
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    
    const sessionInfo = [
      `Статус сессии: ${data.sessionDetail.status || 'Не указан'}`,
      `Начата: ${data.sessionDetail.startedAt || 'Не указано'}`,
      `Завершена: ${data.sessionDetail.finishedAt || 'Не указано'}`,
      `Количество ответов: ${data.sessionDetail.answers?.length || 0}`,
      `Общая оценка: ${data.sessionDetail.result?.totalScore || 'Не указана'}`
    ];
    
    sessionInfo.forEach(info => {
      checkNewPage(10);
      doc.text(info, margin, yPosition);
      yPosition += 7;
    });
    
    yPosition += 10;
    
    // Ответы на вопросы
    if (data.sessionDetail.answers && data.sessionDetail.answers.length > 0) {
      addSectionHeader('Ответы на вопросы', '💬');
      
      data.sessionDetail.answers.forEach((answer: AnswerData, index: number) => {
        checkNewPage(80);
        
        doc.setFontSize(16);
        doc.setFont('Roboto', 'bold');
        doc.text(`Вопрос ${index + 1}:`, margin, yPosition);
        yPosition += 10;
        
        doc.setFontSize(12);
        doc.setFont('Roboto', 'normal');
        
        // Вопрос
        addWrappedText(answer.question, margin, contentWidth, 12);
        yPosition += 8;
        
        // Ответ
        checkNewPage(15);
        doc.setFont('Roboto', 'bold');
        doc.text('Ответ:', margin, yPosition);
        yPosition += 8;
        
        doc.setFont('Roboto', 'normal');
        const answerText = answer.text || 'Нет ответа';
        addWrappedText(answerText, margin, contentWidth, 12);
        yPosition += 10; // Увеличен отступ после ответа
        
        // Оценка
        if (answer.score !== undefined && answer.score !== null) {
          checkNewPage(12);
          doc.setFont('Roboto', 'bold');
          doc.text(`Оценка: ${answer.score}`, margin, yPosition);
          yPosition += 8;
        }
        
        // AI комментарий
        if (answer.aiComment) {
          checkNewPage(15);
          doc.setFont('Roboto', 'bold');
          doc.text('AI-характеристика:', margin, yPosition);
          yPosition += 8;
          
          doc.setFont('Roboto', 'normal');
          addWrappedText(answer.aiComment, margin, contentWidth, 12);
          yPosition += 8;
        }
        
        // Время ответа
        if (answer.createdAt) {
          checkNewPage(8);
          doc.setFontSize(10);
          doc.text(`Время ответа: ${answer.createdAt}`, margin, yPosition);
          yPosition += 6;
        }
        
        yPosition += 12;
      });
    }
  }
  
  // AI-оценка
  if (data.evalData) {
    addSectionHeader('AI-оценка кандидата', '🤖');
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    
    // Статус AI-оценки
    if (data.evalData.status) {
      doc.text(`Статус: ${data.evalData.status}`, margin, yPosition);
      yPosition += 8;
    }
    
    // Резюме
    if (data.evalData.summary) {
      checkNewPage(15);
      doc.setFont('Roboto', 'bold');
      doc.text('Резюме:', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('Roboto', 'normal');
      addWrappedText(data.evalData.summary, margin, contentWidth, 12);
      yPosition += 10;
    }
    
    // Сильные стороны
    if (data.evalData.strengths && Array.isArray(data.evalData.strengths) && data.evalData.strengths.length > 0) {
      checkNewPage(20);
      doc.setFont('Roboto', 'bold');
      doc.text('Сильные стороны:', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('Roboto', 'normal');
      data.evalData.strengths.forEach((strength: string) => {
        checkNewPage(10);
        addWrappedText(`• ${strength}`, margin + 5, contentWidth - 5, 12);
        yPosition += 4;
      });
      yPosition += 6;
    }
    
    // Слабые стороны
    if (data.evalData.weaknesses && Array.isArray(data.evalData.weaknesses) && data.evalData.weaknesses.length > 0) {
      checkNewPage(20);
      doc.setFont('Roboto', 'bold');
      doc.text('Слабые стороны:', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('Roboto', 'normal');
      data.evalData.weaknesses.forEach((weakness: string) => {
        checkNewPage(10);
        addWrappedText(`• ${weakness}`, margin + 5, contentWidth - 5, 12);
        yPosition += 4;
      });
      yPosition += 6;
    }
    
    // Метрики
    if (data.evalData.metrics) {
      checkNewPage(30);
      
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(14);
      doc.text('📊 Метрики оценки:', margin, yPosition);
      yPosition += 10;
      
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(11);
      
      Object.entries(data.evalData.metrics).forEach(([metric, value]) => {
        checkNewPage(12);
        const score = typeof value === 'number' ? value : 0;
        const label = getMetricLabel(metric);
        
        // Название метрики
        doc.text(`${label}:`, margin, yPosition);
        
        // Визуальная шкала (прогресс-бар)
        const labelWidth = 70; // Ширина для названия метрики
        const barWidth = contentWidth - labelWidth - 20; // Остаток для бара и значения
        const barHeight = 4;
        const barX = margin + labelWidth;
        
        // Фон шкалы
        doc.setFillColor(240, 240, 240);
        doc.roundedRect(barX, yPosition - 3, barWidth, barHeight, 1, 1, 'F');
        
        // Заполнение шкалы (цвет зависит от оценки)
        const fillWidth = (score / 100) * barWidth;
        if (score >= 80) {
          doc.setFillColor(76, 175, 80); // Зелёный
        } else if (score >= 60) {
          doc.setFillColor(255, 193, 7); // Жёлтый
        } else {
          doc.setFillColor(244, 67, 54); // Красный
        }
        doc.roundedRect(barX, yPosition - 3, fillWidth, barHeight, 1, 1, 'F');
        
        // Значение справа (выровнено по правому краю)
        doc.setFont('Roboto', 'bold');
        doc.text(`${score}`, pageWidth - margin, yPosition, { align: 'right' });
        doc.setFont('Roboto', 'normal');
        
        yPosition += 10;
      });
    }
  }
  
  // Добавляем номера страниц в футер
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Футер с номером страницы
    doc.setFontSize(9);
    doc.setFont('Roboto', 'normal');
    doc.setTextColor(128, 128, 128);
    const footerText = `Страница ${i} из ${pageCount}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Подпись справа
    doc.setFontSize(8);
    doc.text('SofiHR', pageWidth - margin, pageHeight - 10, { align: 'right' });
  }
  
  // Сохраняем PDF
  const fileName = `candidate_${data.candidate.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Функция для перевода метрик на русский язык
const getMetricLabel = (metric: string): string => {
  const labels: { [key: string]: string } = {
    'COMMUNICATION': 'Коммуникация',
    'PROBLEM_SOLVING': 'Решение проблем',
    'LEADERSHIP': 'Лидерство',
    'TECHNICAL': 'Технические навыки',
    'TEAMWORK': 'Работа в команде',
    'MOTIVATION': 'Мотивация',
    'Стрессоустойчивость': 'Стрессоустойчивость'
  };
  return labels[metric] || metric;
}; 