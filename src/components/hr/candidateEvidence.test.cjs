const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, 'candidateEvidence.ts'), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const implementation = { exports: {} };
new Function('exports', 'require', 'module', compiled)(implementation.exports, require, implementation);
const { getConditionStatus, getBasicConditions, getOverallConditionStatus, getCompetencyEvidence, getVerificationTopics } = implementation.exports;

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

test('criterion evidence is preserved and verification topics use only existing concerns', () => {
  const yes = { name: 'Подтверждено', status: 'yes', evidence: 'Цитата', comment: 'Комментарий' };
  const no = { name: 'Не подтверждено', status: 'no', evidence: 'Ответ', comment: 'Проверить опыт' };
  const unchecked = { name: 'Не проверено', status: 'not_checked', evidence: '', comment: '' };
  const metrics = { competencies: { motivation: { score: 7, criteria: [yes, no, unchecked] } } };
  assert.deepEqual(getCompetencyEvidence(metrics)[0].positives, [yes]);
  assert.deepEqual(getVerificationTopics(metrics), [{ ...no, competency: 'motivation' }, { ...unchecked, competency: 'motivation' }]);
  assert.deepEqual(getCompetencyEvidence({}), []);
});
