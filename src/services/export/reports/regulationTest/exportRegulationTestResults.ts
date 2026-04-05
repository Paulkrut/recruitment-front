import ExcelJS from 'exceljs';
import { ExcelStyleHelper } from '../../shared/ExcelStyleHelper';

interface TestResult {
  sessionId: number;
  employeeName: string | null;
  employeeEmail: string | null;
  employeeDepartment: string | null;
  status: string;
  score: number | null;
  startedAt: string;
  finishedAt: string | null;
}

interface SessionDetail {
  sessionId: number;
  employee: { name: string | null; email: string | null; department: string | null };
  status: string;
  score: number | null;
  startedAt: string;
  finishedAt: string | null;
  answers: Array<{
    questionText: string;
    answerText: string;
    transcription: string | null;
    score: number;
    aiComment: string;
    regulation: { title: string };
  }>;
}

interface ExportParams {
  testTitle: string;
  results: TestResult[];
  sessionDetails: SessionDetail[];
}

function statusLabel(status: string): string {
  switch (status) {
    case 'finished': return 'Завершён';
    case 'started': return 'В процессе';
    default: return 'Новый';
  }
}

export async function exportRegulationTestResults({ testTitle, results, sessionDetails }: ExportParams): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SofiHR';
  workbook.created = new Date();

  // ---- Sheet 1: Results summary ----
  const summarySheet = workbook.addWorksheet('Результаты');

  const titleRow = summarySheet.addRow([`Результаты теста: ${testTitle}`]);
  titleRow.font = { bold: true, size: 14 };
  summarySheet.mergeCells('A1:G1');
  summarySheet.addRow([`Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}`]);
  summarySheet.addRow([]);

  const headerRow = summarySheet.addRow([
    'Сотрудник', 'Email', 'Отдел', 'Статус', 'Балл (%)', 'Начало', 'Окончание'
  ]);
  ExcelStyleHelper.applyHeaderStyle(headerRow);

  const finishedResults = results.filter(r => r.status === 'finished');
  const avgScore = finishedResults.length > 0
    ? Math.round(finishedResults.reduce((sum, r) => sum + (r.score || 0), 0) / finishedResults.length)
    : 0;

  for (const r of results) {
    const row = summarySheet.addRow([
      r.employeeName || '—',
      r.employeeEmail || '—',
      r.employeeDepartment || '—',
      statusLabel(r.status),
      r.score !== null ? r.score : '—',
      r.startedAt ? new Date(r.startedAt).toLocaleString('ru-RU') : '—',
      r.finishedAt ? new Date(r.finishedAt).toLocaleString('ru-RU') : '—',
    ]);

    if (r.score !== null) {
      const scoreCell = row.getCell(5);
      if (r.score >= 70) {
        scoreCell.font = { bold: true, color: { argb: 'FF4CAF50' } };
      } else {
        scoreCell.font = { bold: true, color: { argb: 'FFF44336' } };
      }
    }
  }

  summarySheet.addRow([]);
  const summaryRow = summarySheet.addRow([
    `Итого: ${results.length} сессий, ${finishedResults.length} завершено, средний балл: ${avgScore}%`
  ]);
  summaryRow.font = { bold: true, italic: true };

  summarySheet.columns = [
    { width: 25 }, { width: 30 }, { width: 20 }, { width: 15 }, { width: 12 }, { width: 20 }, { width: 20 },
  ];

  // ---- Sheet 2: Answer details (one row per answer) ----
  if (sessionDetails.length > 0) {
    const answersSheet = workbook.addWorksheet('Детали ответов');

    const titleRow2 = answersSheet.addRow([`Детали ответов: ${testTitle}`]);
    titleRow2.font = { bold: true, size: 14 };
    answersSheet.mergeCells('A1:H1');
    answersSheet.addRow([]);

    const ansHeaderRow = answersSheet.addRow([
      'Сотрудник', 'Email', 'Регламент', 'Вопрос', 'Ответ / Транскрипция', 'Балл (%)', 'Комментарий AI', 'Итоговый балл сессии'
    ]);
    ExcelStyleHelper.applyHeaderStyle(ansHeaderRow);

    for (const session of sessionDetails) {
      for (const answer of session.answers) {
        const answerText = answer.transcription || answer.answerText || '—';
        const row = answersSheet.addRow([
          session.employee.name || '—',
          session.employee.email || '—',
          answer.regulation.title,
          answer.questionText,
          answerText,
          answer.score,
          answer.aiComment || '—',
          session.score !== null ? `${session.score}%` : '—',
        ]);

        const scoreCell = row.getCell(6);
        if (answer.score >= 70) {
          scoreCell.font = { color: { argb: 'FF4CAF50' } };
        } else {
          scoreCell.font = { color: { argb: 'FFF44336' } };
        }
      }
    }

    answersSheet.columns = [
      { width: 22 }, { width: 28 }, { width: 22 }, { width: 40 }, { width: 50 }, { width: 10 }, { width: 40 }, { width: 15 },
    ];

    answersSheet.getColumn(4).alignment = { wrapText: true };
    answersSheet.getColumn(5).alignment = { wrapText: true };
    answersSheet.getColumn(7).alignment = { wrapText: true };
  }

  // ---- Save ----
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Результаты_${testTitle.replace(/[^\w\sа-яА-ЯёЁ]/gi, '').substring(0, 50)}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
