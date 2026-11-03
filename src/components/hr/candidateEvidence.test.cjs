const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, 'candidateEvidence.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const implementation = { exports: {} };
new Function('exports', 'require', 'module', compiled)(implementation.exports, require, implementation);
const { getConditionStatus, getBasicConditions, getOverallConditionStatus, getCompetencyEvidence, getCompetencySummaries, getTechnicalKnowledge, getVerificationTopics } = implementation.exports;

test('summary flattens arbitrary competencies without criterion names or unchecked lists', () => {
  const metrics = { competencies: { custom_competency: { score: 6.5, overall_comment: 'Общий вывод', criteria: [
    { name: 'Внутренний критерий', status: 'yes', evidence: 'Помогаю коллегам', comment: 'Рабочий пример' },
    { name: 'Риск', status: 'partial', evidence: 'Косвенное подтверждение', comment: 'Нужно уточнить' },
    { name: 'Не оценивали', status: 'not_checked', evidence: 'Не выдавать за минус' },
  ] } } };
  const [summary] = getCompetencySummaries(metrics, { answers: [{ text: 'Я помогаю коллегам. Помогаю коллегам каждый день.' }] });
  assert.equal(summary.key, 'custom_competency');
  assert.equal(summary.score, 6.5);
  assert.equal(summary.conclusion, 'Общий вывод');
  assert.deepEqual(summary.positives, [{ text: 'Помогаю коллегам', comment: 'Рабочий пример', literal: true }]);
  assert.equal(summary.concerns[0].literal, false);
  assert.deepEqual(summary.evidence, []);
  assert.equal(summary.incomplete, true);
  assert.equal(JSON.stringify(summary).includes('Внутренний критерий'), false);
  assert.equal(JSON.stringify(summary).includes('Не выдавать за минус'), false);
});

test('missing assessment does not present placeholder zero as assessed or invent legacy polarity', () => {
  const metrics = { competencies: {
    speech_culture: { score: 0, criteria: [{ status: 'not_checked' }], overall_comment: 'Нет материала' },
    legacy: { score: 8, evidence: ['Сохранённый текст'], comment: 'Старый вывод' },
    empty: { score: 0 },
    assessed_zero: { score: 0, criteria: [{ status: 'no', evidence: '', comment: 'Нет рабочего примера' }] },
  } };
  const summaries = getCompetencySummaries(metrics);
  assert.equal(summaries[0].score, undefined);
  assert.equal(summaries[1].score, 8);
  assert.deepEqual(summaries[1].positives, []);
  assert.deepEqual(summaries[1].concerns, []);
  assert.equal(summaries[1].conclusion, 'Старый вывод');
  assert.deepEqual(summaries[1].evidence, []);
  assert.equal(summaries[2].score, undefined);
  assert.equal(summaries[3].score, 0);
  assert.equal(summaries[3].concerns[0].comment, 'Нет рабочего примера');
  assert.deepEqual(getCompetencySummaries(null), []);
});

test('knowledge summarizes scored comments using project thresholds and keeps unscored answers neutral', () => {
  const knowledge = getTechnicalKnowledge({ result: { totalScore: 7.4 }, answers: [
    { id: 901, text: 'Полный ответ не должен попасть в сводку', score: 8, aiComment: 'Уверенно объяснил решение.', questionMeta: { affectsKnowledge: true } },
    { id: 902, score: 5.9, aiComment: 'Не смог обосновать выбор.', questionMeta: { affectsKnowledge: true } },
    { id: 903, score: 6, aiComment: 'Промежуточная оценка.', questionMeta: { affectsKnowledge: true } },
    { id: 904, score: 10, aiComment: 'Исключённый ответ.', questionMeta: { affectsKnowledge: false } },
    { id: 905, score: 0 },
    { id: 906, score: null, aiComment: 'Без оценки.', questionMeta: { affectsKnowledge: true } },
  ] });
  assert.equal(knowledge.score, 7.4);
  assert.equal(knowledge.assessedCount, 3);
  assert.equal(knowledge.unscoredCount, 1);
  assert.deepEqual(knowledge.positives.map(item => item.text), ['Уверенно объяснил решение.']);
  assert.deepEqual(knowledge.concerns.map(item => item.text), ['Не смог обосновать выбор.']);
  assert.equal(JSON.stringify(knowledge).includes('Полный ответ'), false);
  assert.equal(JSON.stringify(knowledge).includes('Промежуточная оценка'), false);
  assert.equal(JSON.stringify(knowledge).includes('Без оценки.'), false);
  assert.deepEqual(getTechnicalKnowledge({ answers: knowledge.positives }).positives, []);
});

test('knowledge comments are bounded to concise fragments', () => {
  const longComment = `${'Очень подробное замечание '.repeat(30)}Финал.`;
  const knowledge = getTechnicalKnowledge({ answers: [{ score: 2, aiComment: longComment, questionMeta: { affectsKnowledge: true } }] });
  assert.ok(knowledge.concerns[0].text.length <= 241);
  assert.ok(knowledge.concerns[0].text.endsWith('…'));
});

test('no red flag alone, pending choice and unvalidated open answer require clarification', () => {
  assert.equal(getConditionStatus({ hasRedFlag: false }), 'unverified');
  assert.equal(getConditionStatus({ processingStatus: 'pending', isCorrect: true, questionMeta: { questionType: 'choice' } }), 'unverified');
  assert.equal(getConditionStatus({ processingStatus: 'completed', text: 'Да', hasRedFlag: false }), 'unverified');
});

test('existing choice and explicit check outcomes determine condition status', () => {
  assert.equal(getConditionStatus({ processingStatus: 'completed', isCorrect: true, questionMeta: { questionType: 'choice' } }), 'confirmed');
  assert.equal(getConditionStatus({ processingStatus: 'completed', isCorrect: false, questionMeta: { questionType: 'choice' } }), 'mismatch');
  assert.equal(getConditionStatus({ basicConditionCheck: { status: 'confirmed' } }), 'confirmed');
  assert.equal(getConditionStatus({ basicConditionCheck: { status: 'unverified' } }), 'unverified');
  assert.equal(getConditionStatus({ hasRedFlag: true, basicConditionCheck: { status: 'confirmed' } }), 'mismatch');
});

test('unanswered marked session questions remain visible and require clarification', () => {
  const rows = getBasicConditions({ questions: [{ id: 31, text: 'Условие', isBasicCondition: true }, { id: 32, isBasicCondition: false }], answers: [] });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].status, 'unverified');
  const answered = getBasicConditions({ questions: [{ id: 31, isBasicCondition: true }], answers: [{ questionId: 31, basicConditionCheck: { status: 'confirmed' } }] });
  assert.equal(answered[0].status, 'confirmed');
});

test('aggregate respects mismatch precedence and does not confirm an empty list', () => {
  assert.equal(getOverallConditionStatus([]), 'unverified');
  assert.equal(getOverallConditionStatus(['confirmed', 'confirmed']), 'confirmed');
  assert.equal(getOverallConditionStatus(['confirmed', 'unverified']), 'unverified');
  assert.equal(getOverallConditionStatus(['mismatch', 'unverified']), 'mismatch');
});

test('interview agenda prioritizes evidenced negatives, deduplicates and stays short', () => {
  const partial = { name: 'Пример', status: 'partial', evidence: 'Описание' };
  const no = { name: 'Опыт', status: 'no', evidence: 'Нет примера' };
  const metrics = { competencies: { motivation: { criteria: [partial, no, no, { name: 'Без доказательств', status: 'no', evidence: ' ' }, { name: 'Риск 2', status: 'no', evidence: 'Ответ 2' }, { name: 'Риск 3', status: 'no', evidence: 'Ответ 3' }] } } };
  const topics = getVerificationTopics(metrics);
  assert.equal(topics.length, 3);
  assert.deepEqual(topics.map(topic => topic.name), ['Опыт', 'Риск 2', 'Риск 3']);
});

test('criterion evidence is preserved and verification topics use only existing concerns', () => {
  const yes = { name: 'Подтверждено', status: 'yes', evidence: 'Цитата', comment: 'Комментарий' };
  const no = { name: 'Не подтверждено', status: 'no', evidence: 'Ответ', comment: 'Проверить опыт' };
  const unchecked = { name: 'Не проверено', status: 'not_checked', evidence: '', comment: '' };
  const metrics = { competencies: { motivation: { score: 7, criteria: [yes, no, unchecked] } } };
  assert.deepEqual(getCompetencyEvidence(metrics)[0].positives, [yes]);
  assert.deepEqual(getVerificationTopics(metrics), [{ ...no, competency: 'motivation' }]);
  assert.deepEqual(getCompetencyEvidence({}), []);
});
