export interface CandidateEvent {
  id: number;
  eventType: string;
  initiator: string;
  oldValue?: string | null;
  newValue?: string | null;
  metadata?: Record<string, any> | null;
  description?: string | null;
  createdAt: string;
  isAutomated: boolean;
  isHhSync: boolean;
}

export interface CandidateEventsResponse {
  events: CandidateEvent[];
  total: number;
}

// Типы событий
export const EventTypes = {
  AUTO_INVITE: 'auto_invite',
  REMINDER: 'reminder',
  AUTO_REJECT: 'auto_reject',
  HH_SYNC_AFTER_INTERVIEW: 'hh_sync_after_interview',
  HH_SYNC_ON_REJECT: 'hh_sync_on_reject',
  MANUAL_STATUS_CHANGE: 'manual_status_change',
  HH_MESSAGE_SENT: 'hh_message_sent',
  INTERVIEW_COMPLETED: 'interview_completed',
  INTERVIEW_STARTED: 'interview_started',
  CANDIDATE_CREATED: 'candidate_created',
} as const;

export type EventType = typeof EventTypes[keyof typeof EventTypes];

