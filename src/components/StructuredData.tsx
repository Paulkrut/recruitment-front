'use client';

import Script from 'next/script';
import { useLingui } from '@lingui/react';
import { msg } from '@lingui/macro';


export default function StructuredData() {
  const { _ } = useLingui();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SofiHR",
    "description": _(msg`Современная HR-система для управления вакансиями, кандидатами и процессами найма`),
    "url": "https://www.sofihr.ru",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RUB"
    },
    "author": {
      "@type": "Organization",
      "name": "SofiHR",
      "url": "https://www.sofihr.ru"
    },
    "publisher": {
      "@type": "Organization",
      "name": "SofiHR",
      "url": "https://www.sofihr.ru"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      _(msg`Управление вакансиями`),
      _(msg`Управление кандидатами`),
      _(msg`AI-оценка кандидатов`),
      _(msg`Автоматизация рекрутинга`),
      _(msg`Аналитика и отчеты`)
    ]
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SofiHR",
    "url": "https://www.sofihr.ru",
    "logo": "https://www.sofihr.ru/logo.png",
    "description": _(msg`Современная HR-система для управления рекрутингом`),
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "Russian"
    },
    "sameAs": [
      "https://t.me/sofihr",
      "https://vk.com/sofihr"
    ]
  };

  return (
    <>
      <Script
        id="structured-data-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
    </>
  );
}
