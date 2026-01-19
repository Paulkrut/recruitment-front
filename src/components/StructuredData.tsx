import Script from 'next/script';

interface StructuredDataProps {
  locale?: 'ru' | 'en';
}

export default function StructuredData({ locale = 'ru' }: StructuredDataProps) {
  // Статические переводы для серверного компонента
  const translations = {
    ru: {
      description: "Современная HR-система для управления вакансиями, кандидатами и процессами найма. AI-интервью, интеграция с HeadHunter, автоматизация рекрутинга.",
      organizationDescription: "Платформа для автоматизации рекрутинга с AI-технологиями",
      features: [
        "AI-интервью и оценка кандидатов",
        "Интеграция с HeadHunter.ru",
        "Управление вакансиями и кандидатами",
        "Автоматизация процессов найма",
        "Аналитика и отчеты",
        "Бесплатные HR-инструменты"
      ],
      searchPlaceholder: "Поиск по SofiHR"
    },
    en: {
      description: "Modern HR system for managing vacancies, candidates, and hiring processes. AI interviews, HeadHunter integration, recruitment automation.",
      organizationDescription: "Recruitment automation platform with AI technologies",
      features: [
        "AI interviews and candidate assessment",
        "HeadHunter.ru integration",
        "Vacancy and candidate management",
        "Hiring process automation",
        "Analytics and reports",
        "Free HR tools"
      ],
      searchPlaceholder: "Search SofiHR"
    }
  };

  const t = translations[locale];
  const domain = locale === 'en' ? 'https://www.sofihr.com' : 'https://www.sofihr.ru';

  // 1. WEBSITE SCHEMA - для поисковой строки в Google
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SofiHR",
    "url": domain,
    "description": t.description,
    "inLanguage": locale === 'en' ? 'en-US' : 'ru-RU',
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${domain}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 2. ORGANIZATION SCHEMA - полная информация о компании
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SofiHR",
    "alternateName": "Sofi HR",
    "url": domain,
    "logo": {
      "@type": "ImageObject",
      "url": `${domain}/sofihr-logo.svg`,
      "width": 200,
      "height": 50
    },
    "image": `${domain}/og-image.jpg`,
    "description": t.organizationDescription,
    "email": "info@sofihr.ru",
    "telephone": "+7-962-940-74-73",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "RU",
      "addressLocality": "Москва"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": [locale === 'en' ? 'English' : 'Russian'],
        "email": "info@sofihr.ru",
        "telephone": "+7-962-940-74-73"
      }
    ],
    "founder": {
      "@type": "Organization",
      "name": "SofiHR Team"
    },
    "foundingDate": "2025"
  };

  // 3. SOFTWARE APPLICATION SCHEMA - основное приложение
  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "SofiHR",
    "description": t.description,
    "url": domain,
    "applicationCategory": "BusinessApplication",
    "applicationSubCategory": "Human Resource Management",
    "operatingSystem": "Web Browser",
    "browserRequirements": "Requires JavaScript. Modern browsers (Chrome, Firefox, Safari, Edge)",
    "softwareVersion": "2.0",
    "releaseNotes": "Обновление 2.0: AI-интервью, интеграция с HeadHunter, новые HR-инструменты",
    "screenshot": `${domain}/images/screenshots/vacancies-wide.webp`,
    "image": `${domain}/og-image.jpg`,
    "offers": [
      {
        "@type": "Offer",
        "name": "Пробный",
        "price": "0",
        "priceCurrency": "RUB",
        "description": "10 AI-интервью бесплатно для тестирования платформы"
      },
      {
        "@type": "Offer",
        "name": "Старт",
        "price": "13500",
        "priceCurrency": "RUB",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "13500",
          "priceCurrency": "RUB",
          "unitText": "за 100 интервью"
        },
        "description": "100 AI-интервью для небольших компаний и стартапов"
      },
      {
        "@type": "Offer",
        "name": "Бизнес",
        "price": "54000",
        "priceCurrency": "RUB",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "54000",
          "priceCurrency": "RUB",
          "unitText": "за 500 интервью"
        },
        "description": "500 AI-интервью для средних компаний с активным процессом найма"
      },
      {
        "@type": "Offer",
        "name": "Премиум",
        "price": "90000",
        "priceCurrency": "RUB",
        "priceSpecification": {
          "@type": "UnitPriceSpecification",
          "price": "90000",
          "priceCurrency": "RUB",
          "unitText": "за 1000 интервью"
        },
        "description": "1000 AI-интервью для крупных компаний и HR-агентств"
      }
    ],
    "author": {
      "@type": "Organization",
      "name": "SofiHR",
      "url": domain
    },
    "publisher": {
      "@type": "Organization",
      "name": "SofiHR",
      "url": domain,
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/sofihr-logo.svg`
      }
    },
    "featureList": t.features,
    "keywords": locale === 'en' 
      ? "recruitment, HR, hiring, ATS, candidate management, AI interviews" 
      : "рекрутинг, HR, найм, ATS, управление кандидатами, AI-интервью, HeadHunter"
  };

  // 4. BREADCRUMB SCHEMA - навигация
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": domain
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "HR-инструменты",
        "item": `${domain}/hr-tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Интеграции",
        "item": `${domain}/#hh-integration`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": "Тарифы",
        "item": `${domain}/#pricing`
      }
    ]
  };

  // 5. SERVICE SCHEMA - услуги
  const serviceData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "SofiHR - Автоматизация рекрутинга",
    "description": t.description,
    "provider": {
      "@type": "Organization",
      "name": "SofiHR",
      "url": domain
    },
    "serviceType": "Human Resource Management Software",
    "areaServed": {
      "@type": "Country",
      "name": locale === 'en' ? 'United States' : 'Россия'
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "HR Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "AI-интервью",
            "description": "Автоматическое проведение собеседований с кандидатами"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Интеграция с HeadHunter",
            "description": "Автоматическая синхронизация вакансий и кандидатов"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Управление кандидатами",
            "description": "Ведение базы кандидатов с AI-оценкой"
          }
        }
      ]
    }
  };

  return (
    <>
      <Script
        id="structured-data-website"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteData),
        }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationData),
        }}
      />
      <Script
        id="structured-data-software"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareData),
        }}
      />
      <Script
        id="structured-data-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      <Script
        id="structured-data-service"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceData),
        }}
      />
    </>
  );
}
