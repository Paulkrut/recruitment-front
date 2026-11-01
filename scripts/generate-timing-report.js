const ExcelJS = require('exceljs');
const fs = require('fs');

const QUESTIONS_CSV = 'c:/Users/Admin/Downloads/questions.csv';
const VIDEO_DURATIONS_FILE = 'c:/Users/Admin/Downloads/questions_video_durations.txt';
const OUTPUT_FILE = 'c:/Users/Admin/Downloads/Анализ_времени_ответов_вакансия_647_v6.xlsx';

const TEST_CANDIDATES = [
  'Артем первый тест', 'Артем тест РФ', 'тест старта диалога',
  'Анастасия тест', 'Павел тест3', 'Карина Ш',
];

function isTestCandidate(name) {
  const n = name.trim().toLowerCase();
  return TEST_CANDIDATES.some(t => n === t.trim().toLowerCase()) || /тест/i.test(n);
}

function stripHtml(text) {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

function parseCsv(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const rows = [];
  let current = '', inQuote = false;
  for (const ch of raw) {
    if (ch === '"') { inQuote = !inQuote; current += ch; }
    else if (ch === '\n' && !inQuote) { if (current.trim()) rows.push(current); current = ''; }
    else current += ch;
  }
  if (current.trim()) rows.push(current);
  const header = parseRow(rows[0]).map(h => h.trim().replace(/\r/g, ''));
  return rows.slice(1).map(r => {
    const vals = parseRow(r);
    const obj = {};
    header.forEach((h, i) => { obj[h] = (vals[i] || '').trim().replace(/\r/g, ''); });
    return obj;
  });
}

function parseRow(row) {
  const result = []; let current = '', inQuote = false;
  for (const ch of row) {
    if (ch === '"') inQuote = !inQuote;
    else if (ch === ',' && !inQuote) { result.push(current); current = ''; }
    else current += ch;
  }
  result.push(current);
  return result;
}

function formatDuration(seconds) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function median(arr) {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function normalizeForCompare(text) {
  return text.toLowerCase()
    .replace(/[.,;:!?()«»"'\-—–…]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordSimilarity(a, b) {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);

  // If normalized first 45 chars match — same question (catches punctuation/space diffs)
  if (na.substring(0, 45) === nb.substring(0, 45)) return 1.0;

  const wa = new Set(na.split(/\s+/).filter(w => w.length > 3));
  const wb = new Set(nb.split(/\s+/).filter(w => w.length > 3));
  if (wa.size === 0 || wb.size === 0) return 0;
  let overlap = 0;
  for (const w of wa) { if (wb.has(w)) overlap++; }
  return overlap / Math.max(wa.size, wb.size);
}

// --- Canonical question mapping ---
function buildCanonicalQuestionMap(rows) {
  const textToFull = new Map();
  const textToPositions = new Map();

  for (const r of rows) {
    const text = stripHtml(r.questionText);
    const key = normalizeForCompare(text).substring(0, 50);
    if (!textToFull.has(key) || text.length > textToFull.get(key).length) {
      textToFull.set(key, text);
    }
    if (!textToPositions.has(key)) textToPositions.set(key, new Set());
    textToPositions.get(key).add(r.position);
  }

  const allKeys = [...textToFull.keys()];
  const keyToCanon = new Map();
  const visited = new Set();

  for (let i = 0; i < allKeys.length; i++) {
    if (visited.has(allKeys[i])) continue;
    const group = [allKeys[i]];
    for (let j = i + 1; j < allKeys.length; j++) {
      if (visited.has(allKeys[j])) continue;
      const sim = wordSimilarity(textToFull.get(allKeys[i]), textToFull.get(allKeys[j]));
      if (sim > 0.55) {
        group.push(allKeys[j]);
        visited.add(allKeys[j]);
      }
    }
    visited.add(allKeys[i]);

    let bestKey = group[0];
    for (const k of group) {
      if (textToFull.get(k).length > textToFull.get(bestKey).length) bestKey = k;
    }
    for (const k of group) {
      keyToCanon.set(k, bestKey);
    }
  }

  const canonicals = new Map();
  for (const [key, canon] of keyToCanon) {
    if (!canonicals.has(canon)) {
      canonicals.set(canon, {
        text: textToFull.get(canon),
        positions: new Set(),
        variants: [],
        changed: false,
      });
    }
    const entry = canonicals.get(canon);
    for (const p of (textToPositions.get(key) || [])) entry.positions.add(p);
    if (key !== canon) {
      entry.variants.push(textToFull.get(key));
      entry.changed = true;
    }
  }

  return { keyToCanon, canonicals, textToFull };
}

const GREEN_BG = 'FFE8F5E9';
const YELLOW_BG = 'FFFFF8E1';
const RED_BG = 'FFFFEBEE';
const CHANGED_BG = 'FFEDE7F6'; // light purple for changed questions
const HEADER_BG = 'FF37474F';
const HEADER_FONT = 'FFFFFFFF';
const SUMMARY_BG = 'FFE3F2FD';
const TITLE_BG = 'FF1565C0';

function loadVideoDurations(filepath) {
  const raw = fs.readFileSync(filepath, 'utf8');
  const map = new Map();
  for (const line of raw.split('\n')) {
    const trimmed = line.trim().replace(/\r/g, '');
    if (!trimmed) continue;
    const parts = trimmed.split(',');
    if (parts.length < 5) continue;
    const sessionId = parts[0].trim();
    const pos = parts[2].trim();
    const dur = parseFloat(parts[parts.length - 1]);
    if (!isNaN(dur) && dur > 0) {
      map.set(`${sessionId}_${pos}`, dur);
    }
  }
  return map;
}

const SESSION_TO_CANDIDATE = {
  '5234': 55432, '5237': 55433, '5249': 56605, '5273': 57022,
  '5545': 60818, '5674': 62865, '5716': 63146, '6199': 68685,
  '6217': 68766, '6224': 68881, '6228': 68904, '6264': 69541,
  '6266': 69543, '6567': 71205, '6865': 72544, '6881': 72556,
  '6957': 73181, '6971': 73216, '7218': 75233, '7247': 75595,
  '7265': 75634, '7530': 77153, '7584': 77485, '7794': 78567,
  '7812': 78689, '8144': 81110, '8303': 81873, '8596': 82918,
  '8645': 83128,
};

async function main() {
  console.log('Читаю CSV...');
  const allRows = parseCsv(QUESTIONS_CSV);
  console.log(`Всего строк: ${allRows.length}`);

  console.log('Читаю длительности видео...');
  const videoDurations = loadVideoDurations(VIDEO_DURATIONS_FILE);
  console.log(`Видео с длительностями: ${videoDurations.size}`);

  const rows = allRows.filter(r => {
    if (isTestCandidate(r.candidate_name)) return false;
    if (parseInt(r.answer_duration_sec) > 10000) return false;
    return true;
  });
  console.log(`После фильтрации: ${rows.length}`);

  const data = rows.map(r => {
    const sessionId = r.session_id;
    const pos = parseInt(r.question_position);
    const duration = Math.max(0, parseInt(r.answer_duration_sec));
    const vidKey = `${sessionId}_${pos}`;
    const videoDur = videoDurations.get(vidKey) || null;
    const thinkTime = videoDur !== null ? Math.max(0, Math.round(duration - videoDur)) : null;
    const isTimeout = (r.likely_auto_finished || '').toUpperCase() === 'TIMEOUT';
    const maxTime = parseInt(r.max_time_sec) || 120;
    const displayDuration = isTimeout ? maxTime : duration;
    const displayThinkTime = videoDur !== null ? Math.max(0, Math.round(displayDuration - videoDur)) : null;
    return {
      sessionId,
      name: r.candidate_name.trim(),
      position: pos,
      questionText: stripHtml(r.question_text),
      maxTime,
      duration: displayDuration,
      videoDuration: videoDur !== null ? Math.round(videoDur) : null,
      thinkTime: displayThinkTime,
      answeredAt: r.answered_at,
      isTimeout,
    };
  });

  // Build canonical question map
  const { keyToCanon, canonicals } = buildCanonicalQuestionMap(data);

  function getCanonKey(text) {
    const key = normalizeForCompare(text).substring(0, 50);
    return keyToCanon.get(key) || key;
  }

  function getCanonInfo(text) {
    const canon = getCanonKey(text);
    return canonicals.get(canon);
  }

  // Per-question aggregates using canonical keys
  const questionAggMap = new Map();
  for (const d of data) {
    const canon = getCanonKey(d.questionText);
    if (!questionAggMap.has(canon)) {
      const info = canonicals.get(canon);
      questionAggMap.set(canon, {
        text: info ? info.text : d.questionText,
        maxTime: d.maxTime,
        durations: [],
        timeouts: 0,
        changed: info ? info.changed : false,
        positions: info ? info.positions : new Set([d.position]),
        variants: info ? info.variants : [],
      });
    }
    const q = questionAggMap.get(canon);
    q.durations.push(d.duration);
    if (d.isTimeout) q.timeouts++;
  }
  const questionAgg = [...questionAggMap.values()].sort((a, b) => Math.min(...a.positions) - Math.min(...b.positions));

  // Stats
  const uniqueCandidates = new Set(data.map(d => d.name));
  const totalAnswers = data.length;
  const allDurations = data.map(d => d.duration);
  const avgDuration = Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length);
  const medianDuration = Math.round(median(allDurations));
  const timeouts = data.filter(d => d.isTimeout);
  const timeoutPct = ((timeouts.length / totalAnswers) * 100).toFixed(1);

  function getRecommendation(qAgg, row) {
    const parts = [];
    if (qAgg && qAgg.timeouts > 2) {
      parts.push('Частые таймауты — рекомендуется увеличить время или упростить формулировку');
    }
    if (qAgg && qAgg.durations.length > 0) {
      const avg = qAgg.durations.reduce((a, b) => a + b, 0) / qAgg.durations.length;
      if (avg < qAgg.maxTime * 0.3 && qAgg.timeouts === 0) {
        parts.push('Вопрос не вызывает затруднений');
      }
    }
    if (row && row.isTimeout && /перепечат|набери|напиши текст/i.test(row.questionText)) {
      parts.push('Рассмотрите увеличение лимита для текстовых вопросов');
    }
    return parts.join('; ') || '';
  }

  // =================== BUILD EXCEL ===================
  const wb = new ExcelJS.Workbook();
  wb.creator = 'SofiHR';
  wb.created = new Date();

  // =============== SHEET 1: Summary (compact) ===============
  const ws1 = wb.addWorksheet('Сводка');

  const titleRow = ws1.addRow(['Анализ времени ответов — Вакансия 647']);
  ws1.mergeCells('A1:B1');
  titleRow.font = { bold: true, size: 16, color: { argb: HEADER_FONT } };
  titleRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TITLE_BG } };
  titleRow.height = 40;
  titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

  ws1.addRow([`Дата формирования: ${new Date().toLocaleDateString('ru-RU')}`]).font = { italic: true, size: 10, color: { argb: 'FF757575' } };
  ws1.addRow([]);

  const metrics = [
    ['Кандидатов', uniqueCandidates.size],
    ['Всего ответов', totalAnswers],
    ['Среднее время ответа', `${avgDuration} сек (${formatDuration(avgDuration)})`],
    ['Медианное время ответа', `${medianDuration} сек (${formatDuration(medianDuration)})`],
    ['Автозавершений (таймаут)', timeouts.length],
    ['% таймаутов', `${timeoutPct}%`],
  ];
  for (const [label, value] of metrics) {
    const r = ws1.addRow([label, value]);
    r.getCell(1).font = { bold: true };
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUMMARY_BG } };
    r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SUMMARY_BG } };
    r.getCell(1).border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };
    r.getCell(2).border = { bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } } };
  }

  ws1.getColumn(1).width = 30;
  ws1.getColumn(2).width = 30;

  // =============== SHEET 2: All answers ===============
  const ws2 = wb.addWorksheet('Время ответов');

  const h2 = ws2.addRow(['Кандидат', 'Ссылка', '№ вопроса', 'Текст вопроса', 'Лимит (сек)', 'Общее время (сек)', 'Общее время', 'Запись (сек)', 'Раздумья (сек)', 'Статус', 'Дата ответа', 'Рекомендация']);
  h2.eachCell(c => {
    c.font = { bold: true, color: { argb: HEADER_FONT }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.border = { bottom: { style: 'medium' } };
  });
  ws2.autoFilter = 'A1:L1';

  // Assign canonical question number to each answer
  const canonOrder = new Map();
  questionAgg.forEach((q, idx) => {
    const canon = getCanonKey(q.text);
    canonOrder.set(canon, idx + 1);
  });

  for (const d of data) {
    const canon = getCanonKey(d.questionText);
    const qAgg = questionAggMap.get(canon);
    const qNum = canonOrder.get(canon) || (d.position + 1);
    const rec = getRecommendation(qAgg, d);
    const ratio = d.maxTime > 0 ? d.duration / d.maxTime : 0;
    const status = d.isTimeout ? 'Таймаут' : 'OK';
    const isChanged = qAgg && qAgg.changed;

    const candidateId = SESSION_TO_CANDIDATE[d.sessionId];
    const candidateUrl = candidateId ? `https://www.sofihr.ru/hr/candidates/${candidateId}` : '';

    const r = ws2.addRow([
      d.name,
      candidateUrl ? 'Открыть' : '',
      d.position + 1,
      d.questionText.substring(0, 200),
      d.maxTime,
      d.duration,
      formatDuration(d.duration),
      d.videoDuration !== null ? d.videoDuration : '—',
      d.thinkTime !== null ? d.thinkTime : '—',
      status,
      d.answeredAt,
      rec,
    ]);

    if (candidateUrl) {
      r.getCell(2).value = { text: 'Открыть', hyperlink: candidateUrl };
      r.getCell(2).font = { color: { argb: 'FF1565C0' }, underline: true, size: 10 };
    }

    let bgColor;
    if (d.isTimeout || ratio > 0.85) bgColor = RED_BG;
    else if (ratio > 0.5) bgColor = YELLOW_BG;
    else bgColor = GREEN_BG;

    r.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      c.alignment = { wrapText: true, vertical: 'top' };
    });
    if (candidateUrl) {
      r.getCell(2).font = { color: { argb: 'FF1565C0' }, underline: true, size: 10 };
    }

    if (isChanged) {
      r.getCell(3).font = { color: { argb: 'FF7B1FA2' }, bold: true };
    }
    if (d.isTimeout) {
      r.getCell(10).font = { bold: true, color: { argb: 'FFF44336' } };
    }
  }

  ws2.getColumn(1).width = 28;
  ws2.getColumn(2).width = 10;
  ws2.getColumn(3).width = 10;
  ws2.getColumn(4).width = 55;
  ws2.getColumn(5).width = 12;
  ws2.getColumn(6).width = 16;
  ws2.getColumn(7).width = 14;
  ws2.getColumn(8).width = 13;
  ws2.getColumn(9).width = 14;
  ws2.getColumn(10).width = 12;
  ws2.getColumn(11).width = 18;
  ws2.getColumn(12).width = 50;

  // =============== SHEET 3: Timeouts ===============
  const ws3 = wb.addWorksheet('Автозавершения');

  const h3 = ws3.addRow(['Кандидат', '№ вопроса', 'Текст вопроса', 'Лимит (сек)', 'Общее время (сек)', 'Общее время', 'Запись (сек)', 'Раздумья (сек)', 'Дата ответа', 'Рекомендация']);
  h3.eachCell(c => {
    c.font = { bold: true, color: { argb: HEADER_FONT }, size: 10 };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_BG } };
    c.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    c.border = { bottom: { style: 'medium' } };
  });

  for (const d of data.filter(d => d.isTimeout)) {
    const canon = getCanonKey(d.questionText);
    const qAgg = questionAggMap.get(canon);
    const qNum = canonOrder.get(canon) || (d.position + 1);
    const rec = getRecommendation(qAgg, d);
    const r = ws3.addRow([
      d.name,
      d.position + 1,
      d.questionText.substring(0, 200),
      d.maxTime,
      d.duration,
      formatDuration(d.duration),
      d.videoDuration !== null ? d.videoDuration : '—',
      d.thinkTime !== null ? d.thinkTime : '—',
      d.answeredAt,
      rec,
    ]);
    r.eachCell(c => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: RED_BG } };
      c.alignment = { wrapText: true, vertical: 'top' };
    });
  }

  ws3.getColumn(1).width = 28;
  ws3.getColumn(2).width = 10;
  ws3.getColumn(3).width = 55;
  ws3.getColumn(4).width = 12;
  ws3.getColumn(5).width = 16;
  ws3.getColumn(6).width = 14;
  ws3.getColumn(7).width = 13;
  ws3.getColumn(8).width = 14;
  ws3.getColumn(9).width = 18;
  ws3.getColumn(10).width = 50;

  // Save
  await wb.xlsx.writeFile(OUTPUT_FILE);
  console.log(`\nОтчёт сохранён: ${OUTPUT_FILE}`);
  console.log(`  Кандидатов: ${uniqueCandidates.size}`);
  console.log(`  Ответов: ${totalAnswers}`);
  console.log(`  Таймаутов: ${timeouts.length}`);
  console.log(`  Уникальных вопросов: ${questionAgg.length}`);
  console.log(`  Вопросов с изменениями текста: ${questionAgg.filter(q => q.changed).length}`);
  console.log(`  Исключено тестовых: ${allRows.length - rows.length} строк`);
}

main().catch(e => { console.error(e); process.exit(1); });
