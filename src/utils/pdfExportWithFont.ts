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
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  
  // Функция для добавления текста с переносом строк
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 12) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * fontSize * 0.4;
  };
  
  // Функция для проверки необходимости новой страницы
  const checkNewPage = (requiredHeight: number) => {
    if (yPosition + requiredHeight > doc.internal.pageSize.height - margin) {
      doc.addPage();
      yPosition = 20;
    }
  };
  
  // Главный заголовок
  doc.setFontSize(24);
  doc.setFont('Roboto', 'bold');
  doc.text('Отчет по кандидату', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;
  
  // Информация о кандидате
  doc.setFontSize(18);
  doc.setFont('Roboto', 'bold');
  doc.text('Основная информация', margin, yPosition);
  yPosition += 12;
  
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
    doc.text(info, margin, yPosition);
    yPosition += 8;
  });
  
  yPosition += 10;
  
  // Информация о сессии интервью
  if (data.sessionDetail) {
    checkNewPage(50);
    
    doc.setFontSize(18);
    doc.setFont('Roboto', 'bold');
    doc.text('Детали интервью', margin, yPosition);
    yPosition += 12;
    
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
      doc.text(info, margin, yPosition);
      yPosition += 8;
    });
    
    yPosition += 10;
    
    // Ответы на вопросы
    if (data.sessionDetail.answers && data.sessionDetail.answers.length > 0) {
      checkNewPage(30);
      
      doc.setFontSize(18);
      doc.setFont('Roboto', 'bold');
      doc.text('Ответы на вопросы', margin, yPosition);
      yPosition += 12;
      
      data.sessionDetail.answers.forEach((answer: AnswerData, index: number) => {
        checkNewPage(100);
        
        doc.setFontSize(16);
        doc.setFont('Roboto', 'bold');
        doc.text(`Вопрос ${index + 1}:`, margin, yPosition);
        yPosition += 8;
        
        doc.setFontSize(12);
        doc.setFont('Roboto', 'normal');
        
        // Вопрос
        const questionHeight = addWrappedText(answer.question, margin, yPosition, contentWidth, 12);
        yPosition += questionHeight + 6;
        
        // Ответ
        doc.setFont('Roboto', 'bold');
        doc.text('Ответ:', margin, yPosition);
        yPosition += 8;
        
        doc.setFont('Roboto', 'normal');
        const answerText = answer.text || 'Нет ответа';
        const answerHeight = addWrappedText(answerText, margin, yPosition, contentWidth, 12);
        yPosition += answerHeight + 6;
        
        // Оценка
        if (answer.score !== undefined && answer.score !== null) {
          doc.setFont('Roboto', 'bold');
          doc.text(`Оценка: ${answer.score}`, margin, yPosition);
          yPosition += 8;
        }
        
        // AI комментарий
        if (answer.aiComment) {
          doc.setFont('Roboto', 'bold');
          doc.text('AI-характеристика:', margin, yPosition);
          yPosition += 8;
          
          doc.setFont('Roboto', 'normal');
          const commentHeight = addWrappedText(answer.aiComment, margin, yPosition, contentWidth, 12);
          yPosition += commentHeight + 6;
        }
        
        // Время ответа
        if (answer.createdAt) {
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
    checkNewPage(50);
    
    doc.setFontSize(18);
    doc.setFont('Roboto', 'bold');
    doc.text('AI-оценка кандидата', margin, yPosition);
    yPosition += 12;
    
    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    
    // Статус AI-оценки
    if (data.evalData.status) {
      doc.text(`Статус: ${data.evalData.status}`, margin, yPosition);
      yPosition += 8;
    }
    
    // Резюме
    if (data.evalData.summary) {
      doc.setFont('Roboto', 'bold');
      doc.text('Резюме:', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('Roboto', 'normal');
      const summaryHeight = addWrappedText(data.evalData.summary, margin, yPosition, contentWidth, 12);
      yPosition += summaryHeight + 6;
    }
    
    // Сильные стороны
    if (data.evalData.strengths && Array.isArray(data.evalData.strengths) && data.evalData.strengths.length > 0) {
      doc.setFont('Roboto', 'bold');
      doc.text('Сильные стороны:', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('Roboto', 'normal');
      data.evalData.strengths.forEach((strength: string) => {
        doc.text(`• ${strength}`, margin + 5, yPosition);
        yPosition += 8;
      });
      yPosition += 6;
    }
    
    // Слабые стороны
    if (data.evalData.weaknesses && Array.isArray(data.evalData.weaknesses) && data.evalData.weaknesses.length > 0) {
      doc.setFont('Roboto', 'bold');
      doc.text('Слабые стороны:', margin, yPosition);
      yPosition += 8;
      
      doc.setFont('Roboto', 'normal');
      data.evalData.weaknesses.forEach((weakness: string) => {
        doc.text(`• ${weakness}`, margin + 5, yPosition);
        yPosition += 8;
      });
      yPosition += 6;
    }
    
    // Метрики
    if (data.evalData.metrics) {
      checkNewPage(30);
      
      doc.setFont('Roboto', 'bold');
      doc.text('Метрики оценки:', margin, yPosition);
      yPosition += 12;
      
      doc.setFont('Roboto', 'normal');
      Object.entries(data.evalData.metrics).forEach(([metric, value]) => {
        const score = typeof value === 'number' ? value : 0;
        const label = getMetricLabel(metric);
        doc.text(`${label}: ${score}/100`, margin, yPosition);
        yPosition += 8;
      });
    }
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