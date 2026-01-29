/**
 * Типы для интеграции с HeadHunter
 */

export interface HhIntegrationStatus {
  isConnected: boolean;
  hasValidToken: boolean;
  tokenStatus?: string; // 'valid' | 'expired' | 'revoked' | 'refresh_failed' | 'invalid' | 'disconnected'
  tokenMessage?: string;
  employerId?: string;
  companyName?: string;
  lastSyncAt?: string;
  tokenExpiresAt?: string;
  autoSync: boolean;
  syncInterval: number;
  stats?: {
    totalVacancies: number;
    totalCandidates: number;
    newCandidatesToday: number;
  };
  hhLimits?: {
    left: {
      resumeView: number;
      resumeViewFromApi: number;
    };
    limits: {
      resumeView: number;
      resumeViewFromApi: number;
    };
    spend: {
      resumeView: number;
      resumeViewFromApi: number;
    };
    source: string;
  };
  resumeQueueCount?: number;
}

export interface HhVacancy {
  id: string;
  hh_id: string;
  name: string;
  status: string; // 'active' | 'archived'
  responses: number;
  area: string;
  salary_from?: number;
  salary_to?: number;
  currency?: string;
  created_at: string;
  imported?: boolean;
  hh_vacancy_id?: number;
  local_vacancy_id?: number;
  candidates_sync_status?: string; // 'syncing' | 'synced' | 'error'
  candidates_total?: number;
  candidates_synced?: number;
  candidates_sync_error?: string;
  available_statuses?: HhCandidateStatus[];
}

export interface HhCandidateStatus {
  id: string;
  name: string;
  count?: number;
  total_count?: number;
}

export interface HhAutomationSettings {
  defaults: {
    autoInvite: {
      enabled: boolean;
      fromInternalStages: string[];  // Массив внутренних стадий
      toInternalStage: string;       // На какую внутреннюю стадию переводить
      toHhStageId: string;           // В какую HH стадию синхронизировать
      invitationType: 'template' | 'ai';
      messageTemplate?: string;
    };
    reminders: {
      enabled: boolean;
      daysAfter: number;
      messageTemplate: string;
    };
    autoReject: {
      enabled: boolean;
      daysAfter: number;
      hhStageId: string;
      messageTemplate: string;
    };
    statusSync: {
      afterInterview: {
        enabled: boolean;
        hhStageId: string;
      };
      onReject: {
        enabled: boolean;
        hhStageId: string;
        messageTemplate: string;
      };
    };
  };
}

export interface HhStage {
  id: string;
  name: string;
}

export interface VacancyHhSettings {
  useDefaults: boolean;
  autoInvite?: {
    enabled: boolean;
    fromHhStageId: string;
    toHhStageId: string;
    invitationType: 'template' | 'ai';
    messageTemplate?: string;
    fromInternalStages: string
    toInternalStage: string
  },
  reminders: {
    enabled: boolean,
    daysAfter: number,
    messageTemplate: string,
  },
  autoReject: {
    enabled: boolean,
    daysAfter: number,
    hhStageId: string,
    messageTemplate: string,
  },
}

