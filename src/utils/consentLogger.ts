interface ConsentData {
  subjectType: 'candidate' | 'client' | 'visitor';
  subjectId?: string | null;
  event: 'register' | 'interview_start' | 'self_apply' | 'marketing_opt_in' | 'video_recording_consent' | 'contact_form_submit' | 'login';
  payload?: any;
  policyVersion?: string;
  offerVersion?: string;
}

export const logConsent = async (data: ConsentData): Promise<boolean> => {
  try {
    const response = await fetch('/api/consent/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subjectType: data.subjectType,
        subjectId: data.subjectId,
        event: data.event,
        payload: data.payload,
        policyVersion: data.policyVersion || '22.09.2025',
        offerVersion: data.offerVersion || '22.09.2025'
      })
    });

    if (!response.ok) {
      console.error('Failed to log consent:', response.status, response.statusText);
      return false;
    }

    const result = await response.json();
    
    if (result.success) {
      console.log('Consent logged successfully:', result.consent_id);
      return true;
    } else {
      console.error('Consent logging failed:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Error logging consent:', error);
    return false;
  }
};

// Хелперы для часто используемых событий
export const logRegistrationConsent = (userId: string, hasMarketing: boolean = false) => {
  return logConsent({
    subjectType: 'client',
    subjectId: userId,
    event: 'register',
    payload: { marketing: hasMarketing }
  });
};

export const logInterviewStartConsent = (candidateId: string, sessionId: string, hasVideo: boolean = true) => {
  return logConsent({
    subjectType: 'candidate',
    subjectId: candidateId,
    event: 'interview_start',
    payload: { session_id: sessionId, video_recording: hasVideo }
  });
};

export const logSelfApplyConsent = (candidateId: string, vacancyId: string) => {
  return logConsent({
    subjectType: 'candidate',
    subjectId: candidateId,
    event: 'self_apply',
    payload: { vacancy_id: vacancyId }
  });
};

export const logContactFormConsent = (messageId: string) => {
  return logConsent({
    subjectType: 'visitor',
    subjectId: null,
    event: 'contact_form_submit',
    payload: { contact_message_id: messageId }
  });
}; 