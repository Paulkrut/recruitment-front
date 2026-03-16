"use client";
import { useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || "http://recruitment.test";

interface UseHrToolOptions<TRequest, TResponse> {
  endpoint: string;
}

interface UseHrToolResult<TRequest, TResponse> {
  data: TResponse | null;
  loading: boolean;
  error: string | null;
  execute: (request: TRequest) => Promise<TResponse | null>;
  reset: () => void;
}

export function useHrTool<TRequest, TResponse>({
  endpoint,
}: UseHrToolOptions<TRequest, TResponse>): UseHrToolResult<TRequest, TResponse> {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (request: TRequest): Promise<TResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/api/public/hr-tools${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Произошла ошибка");
        }

        setData(result.data);
        return result.data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Произошла ошибка";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// Типы для инструментов

export interface QuestionGeneratorRequest {
  jobDescription: string;
  count: number;
  resumeText?: string;
}

export interface Question {
  number: number;
  text: string;
  category: string;
  checks: string;
}

export interface QuestionGeneratorResponse {
  questions: Question[];
}

export interface JobDescriptionRequest {
  position: string;
  level: string;
  additionalInfo?: string;
}

export interface JobDescriptionResponse {
  title: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  offers: string[];
  fullText: string;
}

export interface ResumeAnalyzerRequest {
  resumeText: string;
  jobDescription?: string;
}

export interface ResumeAnalysisResponse {
  summary: string;
  skills: string[];
  experience: {
    totalYears: number;
    companies: number;
    growth: string;
    stability: string;
  };
  strengths: string[];
  improvements: string[];
  score: number;
}

export interface ResumeMatchResponse {
  matchPercentage: number;
  requirements: Array<{
    text: string;
    status: "matched" | "partial" | "not_found";
    evidence: string;
  }>;
  recommendation: string;
  recommendationText: string;
  strengths: string[];
  gaps: string[];
}

export interface ReplyGeneratorRequest {
  type: "accept" | "reject";
  context?: string;
}

export interface ReplyGeneratorResponse {
  subject: string;
  body: string;
}

export interface SalaryGuideRequest {
  position: string;
  city: string;
  level: string;
  experience?: number;
}

export interface SalaryGuideResponse {
  position: string;
  city: string;
  level: string;
  salary: {
    min: number;
    median: number;
    max: number;
    currency: string;
    type: string;
  };
  trend: {
    direction: "growing" | "stable" | "declining";
    percentChange: number;
    period: string;
  };
  cityComparison: Array<{
    city: string;
    median: number;
    diffPercent: number;
  }>;
  factors: Array<{
    name: string;
    impact: string;
    description: string;
  }>;
  marketInsight: string;
  disclaimer: string;
}

// Готовые хуки для каждого инструмента

export function useQuestionGenerator() {
  return useHrTool<QuestionGeneratorRequest, QuestionGeneratorResponse>({
    endpoint: "/generate-questions",
  });
}

export function useJobDescription() {
  return useHrTool<JobDescriptionRequest, JobDescriptionResponse>({
    endpoint: "/generate-job-description",
  });
}

export function useResumeAnalyzer() {
  return useHrTool<ResumeAnalyzerRequest, ResumeAnalysisResponse | ResumeMatchResponse>({
    endpoint: "/analyze-resume",
  });
}

export function useReplyGenerator() {
  return useHrTool<ReplyGeneratorRequest, ReplyGeneratorResponse>({
    endpoint: "/generate-reply",
  });
}

export function useSalaryGuide() {
  return useHrTool<SalaryGuideRequest, SalaryGuideResponse>({
    endpoint: "/salary-guide",
  });
}

export interface AiDetectorRequest {
  resumeText: string;
}

export interface AiDetectorResponse {
  probability: number;
  verdict: string;
  confidence: string;
  suspiciousFragments: Array<{
    text: string;
    reason: string;
  }> | string[]; // AI иногда возвращает просто массив строк
  humanSignals: string[];
  aiSignals: string[];
  recommendation: string;
  summary: string;
  disclaimer?: string;
}

export function useAiDetector() {
  return useHrTool<AiDetectorRequest, AiDetectorResponse>({
    endpoint: "/detect-ai-resume",
  });
}

export interface ScorecardRequest {
  position: string;
  level: string;
  interviewType: string;
  competencies?: string;
  jobDescription?: string;
}

export interface ScorecardCriterion {
  id: number;
  name: string;
  category: "hard_skills" | "soft_skills" | "motivation" | "culture";
  description: string;
  strongSignal: string;
  weakSignal: string;
  maxScore: number;
}

export interface ScorecardLegendItem {
  range: string;
  label: string;
  recommendation: "hire" | "consider" | "doubt" | "reject";
}

export interface ScorecardResponse {
  position: string;
  interviewType: string;
  summary: string;
  criteria: ScorecardCriterion[];
  redFlags: string[];
  finalSection: {
    totalMaxScore: number;
    legend: ScorecardLegendItem[];
  };
}

export function useInterviewScorecard() {
  return useHrTool<ScorecardRequest, ScorecardResponse>({
    endpoint: "/generate-scorecard",
  });
}

export interface JobInstructionRequest {
  position: string;
  level: string;
  department?: string;
  reportsTo?: string;
  mainTasks?: string;
  requirements?: string;
  companyContext?: string;
}

export interface JobInstructionResponse {
  title: string;
  purpose: string;
  department: string;
  reportsTo: string;
  summary: string;
  responsibilities: string[];
  functions: string[];
  rights: string[];
  responsibilityAreas: string[];
  requirements: string[];
  kpis: string[];
  interactions: string[];
  fullText: string;
}

export function useJobInstructionGenerator() {
  return useHrTool<JobInstructionRequest, JobInstructionResponse>({
    endpoint: "/generate-job-instruction",
  });
}

// ========================================
// ОФФЕР
// ========================================

export interface OfferRequest {
  candidateName: string;
  position: string;
  salary?: string;
  startDate?: string;
  probation?: string;
  workFormat?: string;
  bonuses?: string;
  companyName?: string;
}

export interface OfferResponse {
  title: string;
  greeting: string;
  introduction: string;
  positionDetails: string;
  compensationDetails: string;
  conditions: string[];
  benefits: string[];
  nextSteps: string[];
  closing: string;
  fullText: string;
}

export function useOfferGenerator() {
  return useHrTool<OfferRequest, OfferResponse>({
    endpoint: "/generate-offer",
  });
}

// ========================================
// ДОПСОГЛАШЕНИЕ
// ========================================

export interface AdditionalAgreementRequest {
  changeType: string;
  employeeName: string;
  position?: string;
  currentConditions?: string;
  newConditions: string;
  effectiveDate?: string;
  companyName?: string;
}

export interface AdditionalAgreementResponse {
  title: string;
  preamble: string;
  clauses: string[];
  effectiveDate: string;
  signatures: string;
  disclaimer: string;
  fullText: string;
}

export function useAdditionalAgreementGenerator() {
  return useHrTool<AdditionalAgreementRequest, AdditionalAgreementResponse>({
    endpoint: "/generate-additional-agreement",
  });
}

// ========================================
// ТРУДОВОЙ ДОГОВОР
// ========================================

export interface EmploymentContractRequest {
  employeeName: string;
  position: string;
  salary: string;
  contractType?: string;
  workFormat?: string;
  schedule?: string;
  probation?: string;
  startDate?: string;
  companyName?: string;
  companyAddress?: string;
}

export interface EmploymentContractSection {
  number: string;
  title: string;
  content: string;
}

export interface EmploymentContractResponse {
  title: string;
  contractNumber: string;
  preamble: string;
  sections: EmploymentContractSection[];
  signatures: string;
  disclaimer: string;
  fullText: string;
}

export function useEmploymentContractGenerator() {
  return useHrTool<EmploymentContractRequest, EmploymentContractResponse>({
    endpoint: "/generate-employment-contract",
  });
}

// ========================================
// ДОГОВОР ГПХ
// ========================================

export interface GphContractRequest {
  contractorType: string;
  contractorName: string;
  serviceDescription: string;
  amount?: string;
  deadline?: string;
  companyName?: string;
}

export interface GphContractResponse {
  title: string;
  contractNumber: string;
  preamble: string;
  sections: EmploymentContractSection[];
  signatures: string;
  disclaimer: string;
  fullText: string;
}

export function useGphContractGenerator() {
  return useHrTool<GphContractRequest, GphContractResponse>({
    endpoint: "/generate-gph-contract",
  });
}

// ========================================
// ПРИКАЗ О ПРИЁМЕ
// ========================================

export interface JobOrderRequest {
  employeeName: string;
  position: string;
  department?: string;
  salary?: string;
  startDate?: string;
  contractType?: string;
  probation?: string;
  workFormat?: string;
  companyName?: string;
}

export interface JobOrderResponse {
  title: string;
  orderNumber: string;
  orderDate: string;
  companyName: string;
  orderBody: string;
  conditions: string[];
  basis: string;
  signatures: string;
  disclaimer: string;
  fullText: string;
}

export function useJobOrderGenerator() {
  return useHrTool<JobOrderRequest, JobOrderResponse>({
    endpoint: "/generate-job-order",
  });
}

