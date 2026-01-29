/**
 * Типы данных для отчёта по вакансии
 */

export interface VacancyInfo {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
}

export interface CandidateData {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  status: string;
  createdAt: string;
  score: number | null;
  sessionId?: number;
  sessionStatus?: string;
  completedAt?: string;
}

export interface ScoreDistribution {
  score: number;
  count: number;
  candidates: string[];
}

export interface StatusStats {
  status: string;
  count: number;
}

export interface VacancySummary {
  totalCandidates: number;
  completedInterviews: number;
  averageScore: number;
  scoreDistribution: ScoreDistribution[];
  statusStats: StatusStats[];
  topCandidates: CandidateData[];
}

export interface VacancyReportData {
  vacancy: VacancyInfo;
  summary: VacancySummary;
  candidates: CandidateData[];
  generatedAt: string;
}

export interface VacancyReportApiResponse {
  success: boolean;
  data?: VacancyReportData;
  error?: string;
}

