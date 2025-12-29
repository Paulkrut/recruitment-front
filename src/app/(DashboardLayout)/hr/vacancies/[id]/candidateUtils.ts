/**
 * Утилиты для работы с HH кандидатами
 */

interface Candidate {
  id: number;
  hhCandidateId?: number | string | null;
  [key: string]: any;
}

/**
 * Подсчитывает количество HH кандидатов среди выбранных
 */
export function countHhCandidates(candidates: Candidate[]): number {
  return candidates.filter(c => c.hhCandidateId).length;
}

/**
 * Извлекает ID HH кандидатов из массива
 */
export function extractHhCandidateIds(candidates: Candidate[]): (number | string)[] {
  return candidates
    .filter(c => c.hhCandidateId)
    .map(c => c.hhCandidateId!);
}

/**
 * Фильтрует только HH кандидатов
 */
export function filterHhCandidates(candidates: Candidate[]): Candidate[] {
  return candidates.filter(c => c.hhCandidateId);
}

