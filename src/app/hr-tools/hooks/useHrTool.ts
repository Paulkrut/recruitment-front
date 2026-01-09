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

