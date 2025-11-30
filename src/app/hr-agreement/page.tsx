"use client";
import React from 'react';
import HrAgreementRU from '@/components/legal/HrAgreementRU';
import HrAgreementEN from '@/components/legal/HrAgreementEN';

export default function HrAgreementPage() {
  const region = process.env.NEXT_PUBLIC_REGION;
  const isUS = region === 'US';

  return isUS ? <HrAgreementEN /> : <HrAgreementRU />;
}
