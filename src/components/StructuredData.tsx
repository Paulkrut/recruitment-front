import Script from 'next/script';

interface StructuredDataProps {
  locale?: 'ru' | 'en';
}

export default function StructuredData({ locale = 'ru' }: StructuredDataProps) {
  // Статические переводы для серверного компонента
  const translations = {
    ru: {
      description: "Современная HR-система для управления вакансиями, кандидатами и процессами найма",
      organizationDescription: "Современная HR-система для управления рекрутингом",
      features: [
        "Управление вакансиями",
        "Управление кандидатами",
        "AI-оценка кандидатов",
        "Автоматизация рекрутинга",
        "Аналитика и отчеты"
      ]
    },
    en: {
      description: "Modern HR system for managing vacancies, candidates, and hiring processes",
      organizationDescription: "Modern HR system for recruitment management",
      features: [
        "Vacancy management",
        "Candidate management",
        "AI candidate assessment",
        "Recruitment automation",
        "Analytics and reports"
      ]
    }
  };

  const t = translations[locale];
  const domain = locale === 'en' ? 'https://www.sofihr.com' : 'https://www.sofihr.ru';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SofiHR",
    "description": t.description,
    "url": domain,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": locale === 'en' ? 'USD' : 'RUB'
    },
    "author": {
      "@type": "Organization",
      "name": "SofiHR",
      "url": domain
    },
    "publisher": {
      "@type": "Organization",
      "name": "SofiHR",
      "url": domain
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": t.features
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SofiHR",
    "url": domain,
    "logo": `${domain}/logo.png`,
    "description": t.organizationDescription,
    "address": {
      "@type": "PostalAddress",
      "addressCountry": locale === 'en' ? 'US' : 'RU'
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": locale === 'en' ? 'English' : 'Russian'
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
