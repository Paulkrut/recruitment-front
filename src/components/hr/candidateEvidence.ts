import type { NewMetrics, CompetencyCriterion } from '@/hooks/useCandidateEvaluation';

export type ConditionStatus = 'confirmed' | 'mismatch' | 'unverified';
export interface ScreeningQuestion {
  id?: number;
  questionId?: number;
  question?: string;
  text?: string | null;
  isBasicCondition?: boolean;
  questionMeta?: { isBasicCondition?: boolean; questionType?: string; isRedFlagQuestion?: boolean; affectsKnowledge?: boolean };
  score?: number | null;
  aiComment?: string | null;
  hasRedFlag?: boolean;
  processingStatus?: string;
  isCorrect?: boolean | null;
  basicConditionCheck?: { status?: string; reason?: string; explanation?: string };
}

// Only use existing check outcomes: a missing flag is not a successful check.
export function getConditionStatus(answer?: ScreeningQuestion): ConditionStatus {
  if (!answer) return 'unverified';
  if (answer.hasRedFlag === true) return 'mismatch';
  const status = answer.basicConditionCheck?.status;
  if (status === 'mismatch') return 'mismatch';
  if (status === 'confirmed') return 'confirmed';
  if (answer.processingStatus === 'completed' && answer.questionMeta?.questionType === 'choice') {
    if (answer.isCorrect === true) return 'confirmed';
    if (answer.isCorrect === false) return 'mismatch';
  }
  return 'unverified';
}

export function getBasicConditions(session?: { questions?: ScreeningQuestion[]; answers?: ScreeningQuestion[] } | null) {
  const answers = session?.answers ?? [];
  const questions = session?.questions ?? answers;
  return questions
    .filter(question => question.isBasicCondition === true || question.questionMeta?.isBasicCondition === true)
    .map(question => {
      const questionId = question.questionId ?? question.id;
      const answer = session?.questions
        ? answers.find(item => item.questionId === questionId)
        : question;
      return { question, answer, status: getConditionStatus(answer) };
    });
}

export function getOverallConditionStatus(statuses: ConditionStatus[]): ConditionStatus {
  if (statuses.includes('mismatch')) return 'mismatch';
  return statuses.length > 0 && statuses.every(status => status === 'confirmed') ? 'confirmed' : 'unverified';
}

export function getCompetencyEvidence(metrics?: NewMetrics | null) {
  return Object.entries(metrics?.competencies ?? {}).filter((entry): entry is [string, NonNullable<typeof entry[1]>] => !!entry[1]).map(([key, competency]) => {
    const criteria = competency.criteria ?? [];
    return {
      key,
      competency,
      positives: criteria.filter(criterion => criterion.status === 'yes'),
      concerns: criteria.filter(criterion => criterion.status === 'no' || criterion.status === 'partial'),
      unchecked: criteria.filter(criterion => !['yes', 'no', 'partial'].includes(criterion.status)),
    };
  });
}

export interface SummaryEvidence {
  text: string;
  comment?: string;
  literal: boolean;
  score?: number;
}

export interface CompetencySummary {
  key: string;
  score?: number;
  conclusion?: string;
  positives: SummaryEvidence[];
  concerns: SummaryEvidence[];
  // Legacy evidence has no polarity; do not invent strengths or weaknesses.
  evidence: SummaryEvidence[];
  incomplete: boolean;
}

export interface EvidenceSession {
  questions?: ScreeningQuestion[];
  answers?: ScreeningQuestion[];
  result?: { totalScore?: number | null } | null;
}

const cleanText = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const finiteScore = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function getCompetencySummaries(metrics?: NewMetrics | null, session?: EvidenceSession | null): CompetencySummary[] {
  const answers = (session?.answers ?? []).map(answer => cleanText(answer.text)).filter(Boolean);
  const toEvidence = (text: unknown, comment?: unknown): SummaryEvidence | undefined => {
    const evidence = cleanText(text);
    const explanation = cleanText(comment);
    if (!evidence && !explanation) return undefined;
    return {
      text: evidence,
      comment: explanation || undefined,
      // Only mark an entire saved fragment as literal if it exists verbatim in an answer.
      literal: !!evidence && answers.some(answer => answer.includes(evidence)),
    };
  };
  const deduplicate = (items: Array<SummaryEvidence | undefined>): SummaryEvidence[] => {
    const seen = new Set<string>();
    return items.filter((item): item is SummaryEvidence => {
      if (!item) return false;
      const key = `${item.text}|${item.comment ?? ''}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
  return getCompetencyEvidence(metrics).map(({ key, competency, positives, concerns, unchecked }) => {
    const criteria = competency.criteria;
    const assessed = [...positives, ...concerns].length > 0;
    const legacy = !criteria?.length;
    const conclusion = cleanText(competency.overall_comment) || cleanText(competency.comment);
    const evidence = legacy ? deduplicate((competency.evidence ?? []).map(text => toEvidence(text))) : [];
    const fallbackConclusion = conclusion || (evidence.length
      ? evidence.slice(0, 3).map(item => conciseFragment(item.text)).filter(Boolean).join('\n')
      : undefined);
    return {
      key,
      score: finiteScore(competency.score) && (assessed || (legacy && !!(conclusion || evidence.length)))
        ? competency.score : undefined,
      conclusion: fallbackConclusion,
      positives: deduplicate(positives.map(item => toEvidence(item.evidence, item.comment))),
      concerns: deduplicate(concerns.map(item => toEvidence(item.evidence, item.comment))),
      evidence: [],
      incomplete: !!metrics?.insufficient_data || unchecked.length > 0 || !assessed,
    };
  });
}

const MAX_SUMMARY_FRAGMENT = 240;
const MAX_SUMMARY_ITEMS = 5;

function conciseFragment(value: unknown): string {
  const text = cleanText(value).replace(/\\s+/g, ' ');
  if (text.length <= MAX_SUMMARY_FRAGMENT) return text;
  const fragment = text.slice(0, MAX_SUMMARY_FRAGMENT);
  const sentenceEnd = Math.max(fragment.lastIndexOf('. '), fragment.lastIndexOf('! '), fragment.lastIndexOf('? '));
  const boundary = sentenceEnd > MAX_SUMMARY_FRAGMENT * 0.55 ? sentenceEnd + 1 : fragment.lastIndexOf(' ');
  return `${fragment.slice(0, boundary > 0 ? boundary : MAX_SUMMARY_FRAGMENT).trimEnd()}…`;
}

export function getTechnicalKnowledge(session?: EvidenceSession | null) {
  const answers = (session?.answers ?? []).filter(answer => answer.questionMeta?.affectsKnowledge === true);
  const positives: SummaryEvidence[] = [];
  const concerns: SummaryEvidence[] = [];
  for (const answer of answers) {
    if (!finiteScore(answer.score)) continue;
    const text = conciseFragment(answer.aiComment);
    if (!text) continue;
    const evidence = { text, literal: false, score: answer.score };
    if (answer.score >= 8) positives.push(evidence);
    else if (answer.score < 6) concerns.push(evidence);
  }
  return {
    score: finiteScore(session?.result?.totalScore) ? session.result.totalScore : undefined,
    totalAnswers: answers.length,
    positives: positives.slice(0, MAX_SUMMARY_ITEMS),
    concerns: concerns.slice(0, MAX_SUMMARY_ITEMS),
    assessedCount: answers.filter(answer => finiteScore(answer.score)).length,
    unscoredCount: answers.filter(answer => !finiteScore(answer.score)).length,
  };
}

export function getVerificationTopics(metrics?: NewMetrics | null): Array<CompetencyCriterion & { competency: string }> {
  // Interview agenda is a short list of evidenced weaknesses, not all unchecked criteria.
  const seen = new Set<string>();
  return getCompetencyEvidence(metrics)
    .flatMap(item => item.concerns.map(criterion => ({ ...criterion, competency: item.key })))
    .filter(criterion => !!criterion.evidence?.trim())
    .sort((a, b) => Number(b.status === 'no') - Number(a.status === 'no'))
    .filter(criterion => {
      const key = `${criterion.name.trim().toLowerCase()}|${criterion.evidence?.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 3);
}
