import type { NewMetrics, CompetencyCriterion } from '@/hooks/useCandidateEvaluation';

export type ConditionStatus = 'confirmed' | 'mismatch' | 'unverified';
export interface ScreeningQuestion {
  id?: number;
  questionId?: number;
  question?: string;
  text?: string | null;
  isBasicCondition?: boolean;
  questionMeta?: { isBasicCondition?: boolean; questionType?: string; isRedFlagQuestion?: boolean };
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
