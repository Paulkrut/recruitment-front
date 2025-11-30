"use client";
import React from 'react';
import PrivacyPolicyRU from '@/components/legal/PrivacyPolicyRU';
import PrivacyPolicyEN from '@/components/legal/PrivacyPolicyEN';

export default function PrivacyPolicyPage() {
  const region = process.env.NEXT_PUBLIC_REGION;
  const isUS = region === 'US';

  return isUS ? <PrivacyPolicyEN /> : <PrivacyPolicyRU />;
}
