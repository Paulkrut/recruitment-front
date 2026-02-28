export type ColdSearchJobStatus =
  | 'pending'
  | 'searching'
  | 'prescoring'
  | 'scoring'
  | 'complete'
  | 'failed';

export interface ColdSearchProgress {
  found: number;
  prescored: number;
  scored: number;
  skipped: number;
  total: number;
}

export interface ColdSearchQueryLog {
  text: string;
  strategy: string;
  expanded: boolean;
  hh_found: number;
  new_added: number;
}

export interface ColdSearchFiltersLog {
  expanded: boolean;
  active_filters: Record<string, unknown>;
  removed_filters: Record<string, unknown>;
}

export interface ColdSearchJob {
  id: number;
  status: ColdSearchJobStatus;
  progress: ColdSearchProgress;
  queries_log: ColdSearchQueryLog[];
  filters_log: ColdSearchFiltersLog[];
  params_expanded: boolean;
  error: string | null;
  search_hints: string | null;
  hh_filters: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ColdCandidate {
  id: number;
  hh_resume_id: string;
  hh_resume_url: string;
  status: 'found' | 'prescored' | 'scored' | 'skipped';
  display_name: string;
  title: string | null;
  age: number | null;
  city: string | null;
  salary_amount: number | null;
  salary_currency: string | null;
  experience_years: number | null;
  skills: string[];
  resume_updated_at: string | null;
  freshness_days: number | null;
  resume_visibility: string | null;
  access_restricted: boolean;
  pre_score: number | null;
  pre_score_passed: boolean | null;
  pre_score_comment: string | null;
  score: number | null;
  score_why: string[];
  score_risks: string[];
  score_comment: string | null;
  first_contact_draft: string | null;
  resume_data: Record<string, unknown> | null;
  found_at: string;
  scored_at: string | null;
}
