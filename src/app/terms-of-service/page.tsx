"use client";
import React from 'react';
import TermsOfServiceRU from '@/components/legal/TermsOfServiceRU';
import TermsOfServiceEN from '@/components/legal/TermsOfServiceEN';

export default function TermsOfServicePage() {
  const region = process.env.NEXT_PUBLIC_REGION;
  const isUS = region === 'US';

  return isUS ? <TermsOfServiceEN /> : <TermsOfServiceRU />;
}
