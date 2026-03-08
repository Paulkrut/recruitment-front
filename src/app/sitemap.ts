import type { MetadataRoute } from 'next';

const BASE_URL = 'https://www.sofihr.ru';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-03-07');

  return [
    {
      url: `${BASE_URL}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/hr-tools`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hr-tools/question-generator`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/hr-tools/resume-analyzer`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/hr-tools/reply-generator`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/hr-tools/salary-guide`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/hr-tools/job-description`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/hr-tools/ai-detector`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/hr-tools/interview-scorecard`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
