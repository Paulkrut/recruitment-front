/**
 * Интеграция VacancyInfoStep в page.tsx
 * 
 * Добавить в начало файла после импортов:
 */

// ДОБАВИТЬ ИМПОРТ:
import { useSearchParams } from "next/navigation";
import VacancyInfoStep from "./VacancyInfoStep";

// ДОБАВИТЬ В НАЧАЛО КОМПОНЕНТА (после существующих useParams, useState):
export default function CandidateInterviewPage() {
  // ... существующий код ...
  
  const searchParams = useSearchParams();
  const skipVacancyInfo = searchParams?.get('skipVacancyInfo') === 'true';
  const [showVacancyInfo, setShowVacancyInfo] = useState(!skipVacancyInfo);
  
  // ... остальной код ...

/**
 * ИЗМЕНИТЬ строку 175:
 * 
 * Было:
 * const activeStep = result ? 3 : question ? 2 : prepared ? 1 : 0;
 * 
 * Стало:
 */
const activeStep = result ? 3 : question ? 2 : prepared && !showVacancyInfo ? 1 : 0;

/**
 * ИЗМЕНИТЬ строку 370 (useEffect с prepare):
 * 
 * Было:
 * fetch(`${API_BASE}/api/public/interview/${token}/prepare`).then(r=>r.json()).then(setPrepared);
 * 
 * Стало:
 */
fetch(`${API_BASE}/api/public/interview/${token}/prepare`)
  .then(r=>r.json())
  .then(data => {
    setPrepared(data);
    // Извлекаем данные вакансии и кандидата из ответа
    if (data.vacancy) {
      setVacancyData(data.vacancy);
    }
    if (data.candidate) {
      setCandidateData(data.candidate);
    }
  });

/**
 * ДОБАВИТЬ новые состояния (после строки 77 где идут useState):
 */
const [vacancyData, setVacancyData] = useState<any>(null);
const [candidateData, setCandidateData] = useState<any>(null);

/**
 * ДОБАВИТЬ В RETURN (в самом начале, строка 2670, перед основным Box):
 * 
 * Вставить ПЕРЕД <Box sx={{ height: '100vh', ... }}>:
 */

// Показываем VacancyInfoStep если нужно
if (showVacancyInfo && prepared && vacancyData && candidateData) {
  return (
    <VacancyInfoStep
      vacancy={vacancyData}
      candidate={candidateData}
      onContinue={() => setShowVacancyInfo(false)}
    />
  );
}

// ... дальше идёт существующий return со всей логикой интервью

/**
 * ИТОГО: Минимальные изменения
 * 
 * 1. Добавили 2 импорта
 * 2. Добавили 3 useState
 * 3. Изменили 1 строку (activeStep)
 * 4. Изменили 1 useEffect (prepare)
 * 5. Добавили 1 условие в начале return
 * 
 * Все изменения модульные, не трогают основную логику интервью!
 */

