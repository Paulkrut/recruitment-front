import { VacancyReportData, VacancyReportApiResponse } from './types';
import { apiFetch } from '@/utils/api';

const API_BASE = process.env.NEXT_PUBLIC_RECRUITMENT_API || 'http://recruitment.test';

/**
 * Сервис для загрузки данных отчёта по вакансии с API
 */
export class VacancyReportDataService {
  /**
   * Получить данные для отчёта по вакансии
   */
  static async fetchVacancyData(vacancyId: number): Promise<VacancyReportData> {
    const response = await apiFetch(`${API_BASE}/api/admin/vacancies/${vacancyId}/export-data`);

    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
    }

    const result: VacancyReportApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Не удалось получить данные отчёта');
    }

    return result.data;
  }
}

