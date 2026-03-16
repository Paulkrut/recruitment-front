"use client";

export const HR_TOOLS_CONSENT_STORAGE_KEY = "sofihr.hrToolsConsentAccepted";

export function hasHrToolsConsent(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(HR_TOOLS_CONSENT_STORAGE_KEY) === "true";
}

export function setHrToolsConsent(accepted: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  if (accepted) {
    window.localStorage.setItem(HR_TOOLS_CONSENT_STORAGE_KEY, "true");
  } else {
    window.localStorage.removeItem(HR_TOOLS_CONSENT_STORAGE_KEY);
  }
}
