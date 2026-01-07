"use client";
import * as React from "react";
import { Box, Container, Typography, Button, IconButton, Chip } from "@mui/material";
import { Icon } from "@iconify/react";

interface CaseStudy {
  id: string;
  title: string;
  subtitle: string;
  industry: string;
  icon: string;
  color: string;
  stats: {
    label: string;
    value: string;
    highlight?: boolean;
  }[];
  shortDescription: string;
  fullContent: {
    problem: string;
    solution: string;
    results: string[];
    conclusion: string;
  };
}

export default function CasesSection() {
  const [selectedCase, setSelectedCase] = React.useState<CaseStudy | null>(null);

  const cases: CaseStudy[] = [
    {
      id: 'it-director',
      title: 'IT-директор',
      subtitle: 'Как предотвратили ошибочный найм',
      industry: 'IT / Средний бизнес',
      icon: 'mdi:laptop',
      color: '#2196F3',
      stats: [
        { label: 'Экономия', value: '2,5 млн ₽', highlight: true },
        { label: 'Стоимость проверки', value: '250 ₽' },
        { label: 'Кандидатов', value: '2 финалиста' },
      ],
      shortDescription: 'HRD впервые закрывала роль IT-директора. Харизматичный кандидат получил оценку 4.0, а «нехаризматичный» — 7.0. SofiHR показала критичные пробелы у фаворита.',
      fullContent: {
        problem: `<p>Елена — опытный HRD, но впервые закрывала роль IT-директора для компании, где инфраструктура критична: CRM, сайт, складские интеграции, отчётность.</p>

<p>На финале осталось двое:</p>

<p><strong>Кандидат №1</strong> — харизматичный «визионер». На личном интервью уверенно говорил про стратегию, команды и «как надо строить IT». Елене он понравился сразу — казался сильным профессионалом.</p>

<p><strong>Кандидат №2</strong> — спокойный и менее яркий. Отвечал короче, без «продажи себя», местами даже сухо — Елене он показался слабее.</p>`,
        solution: `<p>Чтобы снять сомнения, Елена решила сделать то, что раньше не делала: дать обоим короткое интервью в SofiHR.</p>

<p><strong>И тут случился разворот:</strong></p>
<ul>
  <li>У фаворита Елены оценка SofiHR — <strong>4.0</strong></li>
  <li>У «нехаризматичного» кандидата — <strong>7.0</strong></li>
</ul>

<p>В отчёте SofiHR Елена увидела то, что в личной беседе легко пропустить: у кандидата №1 были <strong>критичные пробелы</strong> в базовых технических решениях (на уровне архитектуры/надёжности/процессов), из-за которых в реальной работе почти неизбежны дорогие ошибки.</p>

<p>А кандидат №2, наоборот, уверенно закрывал ключевые зоны ответственности из вакансии — просто делал это без шоу.</p>`,
        results: [
          'Через 6 месяцев новый IT-директор стабилизировал ключевые сервисы',
          'Навёл порядок в приоритизации и процессах',
          'Закрыл задачи без «пожаров» и откатов',
          'Избежали архитектурных ошибок на ~1,6 млн ₽',
          'Избежали увольнения и повторного поиска на ~900 тыс. ₽'
        ],
        conclusion: `<p><strong>Итог:</strong> до 2,5 млн ₽ экономии и предсказуемая IT-инфраструктура.</p>

<p><em>«SofiHR показала то, что я не увидела на личном интервью, я избежала большой ошибки»</em> — Елена, HRD.</p>`
      }
    },
    {
      id: 'tour-operator',
      title: 'Туроператор',
      subtitle: 'Сократили HR-команду в 2 раза',
      industry: '300 сотрудников / Многопрофильный найм',
      icon: 'mdi:airplane',
      color: '#4CAF50',
      stats: [
        { label: 'HR-штат', value: '4 → 2', highlight: true },
        { label: 'Успешный ИС', value: '80%' },
        { label: 'Ошибки найма', value: '< 5%' },
      ],
      shortDescription: 'Компания нанимала от курьеров до разработчиков. В работе одновременно 3-6 вакансий у одного HR. SofiHR стал единым инструментом объективной оценки без глубокой экспертизы в каждой профессии.',
      fullContent: {
        problem: `<p><strong>Штат:</strong> 300 сотрудников<br/>
<strong>География:</strong> несколько регионов<br/>
<strong>Тип найма:</strong> от линейных ролей до высококвалифицированных специалистов</p>

<p><strong>Ключевые сложности:</strong></p>
<ul>
  <li>В работе одновременно 3–6 вакансий у одного HR</li>
  <li>Кардинально разная специфика ролей</li>
  <li>Недостаток глубокой экспертизы по сложным позициям</li>
  <li>Оценка кандидатов часто строилась на резюме и интуиции</li>
</ul>

<p><strong>Результат до SofiHR:</strong></p>
<ul>
  <li>Кандидаты выглядели сильнее «на входе», чем оказывались в работе</li>
  <li>Много отказов на испытательном сроке</li>
  <li>Особенно высокий риск ошибок при найме разработчиков и бухгалтеров</li>
  <li>Рост нагрузки на HR и руководителей подразделений</li>
</ul>`,
        solution: `<p>SofiHR стал единым инструментом объективной оценки кандидатов — без необходимости глубоко разбираться в каждой профессии.</p>

<p><strong>Что было сделано:</strong></p>
<ul>
  <li>Автоматизированы интервью под разные типы ролей</li>
  <li>Встроена оценка профессиональных компетенций и мышления</li>
  <li>Стандартизирован процесс принятия решений</li>
  <li>Руководители получают короткий, понятный отчёт по каждому кандидату</li>
</ul>`,
        results: [
          '<strong>Качество найма:</strong> 80% кандидатов успешно проходят испытательный срок',
          'Доля кандидатов с переоценёнными компетенциями — не более 5%',
          'Существенное снижение ошибок в найме сложных специалистов',
          '<strong>HR-команда:</strong> сокращена с 4 до 2 человек без потери скорости и качества',
          'HR перестал «гадать» и начал принимать решения на основе данных',
          '<strong>Эффект для бизнеса:</strong> меньше повторных наймов, быстрее закрытие вакансий'
        ],
        conclusion: `<p><strong>SofiHR позволил туроператору:</strong></p>
<ul>
  <li>Нанимать специалистов любого уровня без экспертизы в каждой профессии</li>
  <li>Сократить HR-команду в 2 раза</li>
  <li>Повысить качество найма до предсказуемого результата</li>
  <li>Свести риск ошибок на испытательном сроке к минимуму</li>
</ul>

<p><strong>Найм стал управляемым процессом, а не лотереей.</strong></p>`
      }
    },
    {
      id: 'business-owner',
      title: 'Собственник бизнеса',
      subtitle: 'Вышел из операционного найма',
      industry: 'Автозапчасти / 10 наймов в месяц',
      icon: 'mdi:car-cog',
      color: '#FF9800',
      stats: [
        { label: 'Время собственника', value: '90ч → 4ч', highlight: true },
        { label: 'Ошибочные наймы', value: '25% → 10%' },
        { label: 'Стоимость', value: '9 000 ₽/мес' },
      ],
      shortDescription: 'Собственница лично проводила 80-90 часов на найм в месяц. После SofiHR — 4 часа. Ошибочные наймы снизились с 25% до 10%. Найм превратился в управляемую систему.',
      fullContent: {
        problem: `<p><strong>Контекст:</strong><br/>
Собственница компании по оптовой продаже автозапчастей лично участвовала в найме сотрудников.</p>

<p>Компания регулярно нанимала:</p>
<ul>
  <li>технических специалистов (склад, логистика, учёт, продажи)</li>
  <li>менеджеров по продажам</li>
</ul>

<p>В среднем — <strong>10 новых сотрудников в месяц</strong>.</p>

<p><strong>Чтобы закрыть 10 позиций:</strong></p>
<ul>
  <li>обрабатывать 2000–3000 откликов в месяц</li>
  <li>вручную отбирать резюме</li>
  <li>приглашать кандидатов на интервью</li>
  <li>проводить интервью лично</li>
</ul>

<p><strong>Фактические трудозатраты:</strong></p>
<ul>
  <li><strong>Собственник:</strong> 80–90 часов в месяц (3-5 интервью в день)</li>
  <li><strong>HR:</strong> 90–110 часов в месяц (скрининг, организация)</li>
  <li><strong>Суммарно:</strong> ~170–200 часов в месяц на найм</li>
</ul>

<p>При этом решения принимались в ручном режиме, оценка была субъективной, отсутствовала единая система сравнения.</p>`,
        solution: `<p>Компания внедрила SofiHR для первичного отбора и интервью кандидатов.</p>

<p><strong>Затраты на систему:</strong> не более 9 000 ₽ в месяц (кратно дешевле стоимости времени собственника).</p>

<p><strong>Процесс «после»:</strong></p>
<ol>
  <li>Кандидаты проходят интервью в SofiHR</li>
  <li>Система формирует скоринг, краткий итог, сравнительную оценку</li>
  <li>HR отбирает только кандидатов с высокой оценкой</li>
  <li>Собственник и HR за 10–15 минут просматривают список</li>
  <li>Собственник проводит выборочные короткие интервью по 15 минут</li>
  <li>Финальное интервью проводит HR</li>
</ol>`,
        results: [
          '<strong>Время:</strong> собственник тратит не более 4 часов в месяц',
          'Высвобожденное время направлено на стратегические задачи',
          '<strong>Прозрачность:</strong> все кандидаты оцениваются по единым метрикам',
          '<strong>Скорость найма:</strong> масштабировано до 10 сотрудников без роста нагрузки',
          '<strong>Ошибочные наймы:</strong> снизились с 25% до 10%',
          'Соответствие роли: 8 из 10 новых сотрудников (ранее — 5 из 10)',
          'Адаптация ускорилась на 20–25%'
        ],
        conclusion: `<p><strong>За 9 000 ₽ в месяц компания:</strong></p>
<ul>
  <li>вывела собственника из операционного найма</li>
  <li>сохранила контроль качества через цифры</li>
  <li>ускорила найм и повысила качество сотрудников</li>
  <li>превратила подбор персонала из ручного процесса в управляемую систему</li>
</ul>`
      }
    },
  ];

  const handleOpenCase = (caseStudy: CaseStudy) => {
    setSelectedCase(caseStudy);
  };

  const handleCloseCase = () => {
    setSelectedCase(null);
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', py: { xs: 6, md: 8 } }}>
      <Container maxWidth="lg">

        {/* Hero */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#4CAF50' }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#999' }}>
              Реальные истории
            </Typography>
          </Box>

          <Typography sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800, lineHeight: 1.1, mb: 1.5 }}>
            Как компании <Box component="span" sx={{ color: '#4CAF50' }}>используют SofiHR</Box>
          </Typography>

          <Typography sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, color: '#666', maxWidth: 650, mx: 'auto' }}>
            Истории реальных компаний с измеримыми результатами и цифрами.
          </Typography>
        </Box>

        {/* Кейсы */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
          {cases.map((caseStudy) => (
            <Box
              key={caseStudy.id}
              sx={{
                bgcolor: '#fff',
                border: '2px solid #e5e5e5',
                borderRadius: 2,
                p: 3,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: caseStudy.color,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${caseStudy.color}33`,
                }
              }}
              onClick={() => handleOpenCase(caseStudy)}
            >
              {/* Иконка и чип индустрии */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  bgcolor: `${caseStudy.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon icon={caseStudy.icon} width={28} height={28} color={caseStudy.color} />
                </Box>
                <Chip
                  label={caseStudy.industry}
                  size="small"
                  sx={{
                    fontSize: '0.65rem',
                    height: 20,
                    bgcolor: `${caseStudy.color}22`,
                    color: caseStudy.color,
                    fontWeight: 600
                  }}
                />
              </Box>

              {/* Заголовок */}
              <Typography sx={{ fontSize: '1.2rem', fontWeight: 700, mb: 0.5, color: '#1a1a1a' }}>
                {caseStudy.title}
              </Typography>
              <Typography sx={{ fontSize: '0.85rem', color: '#666', mb: 2 }}>
                {caseStudy.subtitle}
              </Typography>

              {/* Статистика */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
                {caseStudy.stats.map((stat, index) => (
                  <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: '0.75rem', color: '#888' }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{
                      fontSize: stat.highlight ? '1.1rem' : '0.9rem',
                      fontWeight: stat.highlight ? 800 : 600,
                      color: stat.highlight ? caseStudy.color : '#1a1a1a'
                    }}>
                      {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Краткое описание */}
              <Typography sx={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.5, mb: 2 }}>
                {caseStudy.shortDescription}
              </Typography>

              {/* Кнопка */}
              <Button
                fullWidth
                variant="outlined"
                endIcon={<Icon icon="mdi:arrow-right" width={18} height={18} />}
                sx={{
                  borderColor: caseStudy.color,
                  color: caseStudy.color,
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: caseStudy.color,
                    bgcolor: `${caseStudy.color}11`
                  }
                }}
              >
                Читать полностью
              </Button>
            </Box>
          ))}
        </Box>

      </Container>

      {/* Модальное окно с полным кейсом */}
      {selectedCase && (
        <Box
          onClick={handleCloseCase}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            overflowY: 'auto',
            '@keyframes fadeIn': {
              from: { opacity: 0 },
              to: { opacity: 1 },
            },
            animation: 'fadeIn 0.2s ease-in',
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'relative',
              maxWidth: 900,
              width: '100%',
              maxHeight: '90vh',
              bgcolor: '#fff',
              borderRadius: 3,
              overflow: 'hidden',
              '@keyframes slideUp': {
                from: { transform: 'translateY(20px)', opacity: 0 },
                to: { transform: 'translateY(0)', opacity: 1 },
              },
              animation: 'slideUp 0.3s ease-out',
            }}
          >
            {/* Header */}
            <Box sx={{
              bgcolor: `${selectedCase.color}11`,
              borderBottom: `3px solid ${selectedCase.color}`,
              p: { xs: 2, md: 3 },
              position: 'sticky',
              top: 0,
              zIndex: 1,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 2 }, mb: 1 }}>
                <Box sx={{
                  width: { xs: 40, md: 56 },
                  height: { xs: 40, md: 56 },
                  borderRadius: 2,
                  bgcolor: `${selectedCase.color}22`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon icon={selectedCase.icon} width={32} height={32} color={selectedCase.color} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: { xs: '0.65rem', md: '0.75rem' }, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Кейс
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.8rem' }, fontWeight: 800, color: '#1a1a1a', lineHeight: 1.2 }}>
                    {selectedCase.title}
                  </Typography>
                  <Typography sx={{ fontSize: { xs: '0.85rem', md: '1rem' }, color: '#666', mt: 0.5, display: { xs: 'none', sm: 'block' } }}>
                    {selectedCase.subtitle}
                  </Typography>
                </Box>
              </Box>

              {/* Статистика в header - только на десктопе */}
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mt: 2, flexWrap: 'wrap' }}>
                {selectedCase.stats.map((stat, index) => (
                  <Box key={index}>
                    <Typography sx={{ fontSize: '0.7rem', color: '#888', mb: 0.3 }}>
                      {stat.label}
                    </Typography>
                    <Typography sx={{
                      fontSize: stat.highlight ? '1.3rem' : '1rem',
                      fontWeight: 800,
                      color: stat.highlight ? selectedCase.color : '#1a1a1a'
                    }}>
                      {stat.value}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Кнопка закрытия */}
              <IconButton
                onClick={handleCloseCase}
                sx={{
                  position: 'absolute',
                  top: { xs: 8, md: 16 },
                  right: { xs: 8, md: 16 },
                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                  width: { xs: 32, md: 48 },
                  height: { xs: 32, md: 48 },
                  '&:hover': {
                    bgcolor: '#fff',
                    transform: 'rotate(90deg)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon icon="mdi:close" width={24} height={24} />
              </IconButton>
            </Box>

            {/* Content */}
            <Box sx={{ p: { xs: 2, md: 4 }, maxHeight: { xs: 'calc(90vh - 120px)', md: 'calc(90vh - 200px)' }, overflowY: 'auto' }}>
              {/* Проблема */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Icon icon="mdi:alert-circle" width={24} height={24} color="#f44336" />
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a' }}>
                    Проблема
                  </Typography>
                </Box>
                <Box sx={{ '& p': { mb: 2 }, '& strong': { fontWeight: 700 }, '& ul': { pl: 3, mb: 2 }, '& ol': { pl: 3, mb: 2 }, '& li': { mb: 0.5 } }}>
                  <Typography component="div" sx={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: selectedCase.fullContent.problem }}
                  />
                </Box>
              </Box>

              {/* Решение */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Icon icon="mdi:lightbulb" width={24} height={24} color={selectedCase.color} />
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a' }}>
                    Решение
                  </Typography>
                </Box>
                <Box sx={{ '& p': { mb: 2 }, '& strong': { fontWeight: 700 }, '& ul': { pl: 3, mb: 2 }, '& ol': { pl: 3, mb: 2 }, '& li': { mb: 0.5 } }}>
                  <Typography component="div" sx={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: selectedCase.fullContent.solution }}
                  />
                </Box>
              </Box>

              {/* Результаты */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <Icon icon="mdi:chart-line" width={24} height={24} color="#4CAF50" />
                  <Typography sx={{ fontSize: '1.3rem', fontWeight: 700, color: '#1a1a1a' }}>
                    Результаты
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {selectedCase.fullContent.results.map((result, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                      <Icon icon="mdi:check-circle" width={20} height={20} color="#4CAF50" style={{ marginTop: 2, flexShrink: 0 }} />
                      <Typography component="div" sx={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.8 }}
                        dangerouslySetInnerHTML={{ __html: result }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Заключение */}
              <Box sx={{
                bgcolor: `${selectedCase.color}11`,
                border: `2px solid ${selectedCase.color}33`,
                borderRadius: 2,
                p: 3
              }}>
                <Box sx={{ '& p': { mb: 2 }, '& strong': { fontWeight: 700 }, '& em': { fontStyle: 'italic' }, '& ul': { pl: 3, mb: 2 }, '& li': { mb: 0.5 } }}>
                  <Typography component="div" sx={{ fontSize: '1rem', color: '#333', lineHeight: 1.8, fontWeight: 500 }}
                    dangerouslySetInnerHTML={{ __html: selectedCase.fullContent.conclusion }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

