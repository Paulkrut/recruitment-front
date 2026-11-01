const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in

const BLUE = "1976D2";
const DARK_BLUE = "0D47A1";
const GREEN = "2E7D32";
const LIGHT_GREEN = "4CAF50";
const DARK = "212121";
const GRAY = "757575";
const LIGHT_BG = "F5F7FA";
const WHITE = "FFFFFF";
const RED_ACCENT = "E53935";

const FONT = "Calibri";
const W = 13.33;
const H = 7.5;

function addFooter(slide, text) {
  slide.addText(text, {
    x: 0.5, y: 7.0, w: W - 1, h: 0.35,
    fontSize: 9, color: GRAY, fontFace: FONT, align: "center",
  });
}

function addSlideNumber(slide, num) {
  slide.addText(String(num), {
    x: W - 0.8, y: 7.0, w: 0.5, h: 0.35,
    fontSize: 9, color: GRAY, fontFace: FONT, align: "right",
  });
}

// ============================================================
// SLIDE 1: Title
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: DARK_BLUE };

  slide.addText("SofiHR", {
    x: 0.8, y: 1.2, w: W - 1.6, h: 1.2,
    fontSize: 54, fontFace: FONT, color: WHITE, bold: true,
  });

  slide.addText("HR-платформа для автоматизации найма", {
    x: 0.8, y: 2.4, w: W - 1.6, h: 0.7,
    fontSize: 28, fontFace: FONT, color: WHITE, bold: false,
  });

  slide.addText(
    "AI-интервью  ·  Интеграция с HeadHunter  ·  Объективная оценка кандидатов",
    {
      x: 0.8, y: 3.2, w: W - 1.6, h: 0.6,
      fontSize: 16, fontFace: FONT, color: "90CAF9",
    }
  );

  // Stats bar at bottom
  const stats = [
    { label: "50 000+", sub: "интервью проведено" },
    { label: "75 000+", sub: "кандидатов оценено" },
    { label: "17x", sub: "быстрее найм" },
    { label: "152-ФЗ", sub: "соответствие" },
  ];
  const statW = (W - 1.6) / stats.length;
  stats.forEach((s, i) => {
    const x = 0.8 + i * statW;
    slide.addText(s.label, {
      x, y: 5.3, w: statW, h: 0.6,
      fontSize: 26, fontFace: FONT, color: WHITE, bold: true, align: "center",
    });
    slide.addText(s.sub, {
      x, y: 5.85, w: statW, h: 0.4,
      fontSize: 12, fontFace: FONT, color: "90CAF9", align: "center",
    });
  });

  slide.addText("www.sofihr.ru", {
    x: 0.8, y: 6.8, w: W - 1.6, h: 0.4,
    fontSize: 12, fontFace: FONT, color: "64B5F6", align: "center",
  });
}

// ============================================================
// SLIDE 2: Problem
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Найм в крупных компаниях — это боль", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const problems = [
    {
      icon: "⏱",
      title: "5+ часов в день",
      desc: "HR тратит на ручные интервью, координацию и обработку откликов. При 10+ вакансиях одновременно это становится невозможным.",
    },
    {
      icon: "⚖️",
      title: "Субъективность оценок",
      desc: "Кого берут — зависит от настроения, усталости и личных предпочтений HR. Нет единого стандарта оценки.",
    },
    {
      icon: "📈",
      title: "Масштабирование = хаос",
      desc: "Рост числа вакансий требует пропорционального роста HR-команды. Качество найма падает, сроки растут.",
    },
  ];

  const cardW = (W - 1.6 - 0.6) / 3;
  problems.forEach((p, i) => {
    const x = 0.8 + i * (cardW + 0.3);
    const y = 1.8;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: cardW, h: 4.0,
      fill: { color: LIGHT_BG },
      rectRadius: 0.1,
    });

    slide.addText(p.icon, {
      x, y: y + 0.3, w: cardW, h: 0.7,
      fontSize: 36, fontFace: FONT, align: "center",
    });

    slide.addText(p.title, {
      x: x + 0.3, y: y + 1.1, w: cardW - 0.6, h: 0.5,
      fontSize: 18, fontFace: FONT, color: RED_ACCENT, bold: true, align: "center",
    });

    slide.addText(p.desc, {
      x: x + 0.3, y: y + 1.7, w: cardW - 0.6, h: 2.0,
      fontSize: 13, fontFace: FONT, color: GRAY, align: "center", valign: "top",
    });
  });

  slide.addText("Нужна система, а не героизм отдельных HR", {
    x: 0.8, y: 6.3, w: W - 1.6, h: 0.5,
    fontSize: 16, fontFace: FONT, color: BLUE, bold: true, align: "center",
  });
  addSlideNumber(slide, 2);
}

// ============================================================
// SLIDE 3: Solution — how SofiHR works
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Как работает SofiHR", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const steps = [
    { num: "1", title: "Описание\nвакансии", desc: "Загрузите или\nсоздайте вакансию" },
    { num: "2", title: "AI генерирует\nвопросы", desc: "За 30 секунд\nрелевантные вопросы" },
    { num: "3", title: "Отправка\nссылки", desc: "Кандидат получает\nперсональную ссылку" },
    { num: "4", title: "Видео-\nинтервью", desc: "Кандидат проходит\n24/7 в удобное время" },
    { num: "5", title: "AI\nанализирует", desc: "Транскрипция,\nоценка, ранжирование" },
    { num: "6", title: "Готовый\nотчёт", desc: "HR получает рейтинг\nи рекомендации" },
  ];

  const stepW = (W - 1.6 - 0.5 * 5) / 6;
  steps.forEach((s, i) => {
    const x = 0.8 + i * (stepW + 0.5);
    const y = 1.8;

    // Circle with number
    slide.addShape(pres.ShapeType.ellipse, {
      x: x + stepW / 2 - 0.35, y, w: 0.7, h: 0.7,
      fill: { color: BLUE },
    });
    slide.addText(s.num, {
      x: x + stepW / 2 - 0.35, y, w: 0.7, h: 0.7,
      fontSize: 22, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle",
    });

    slide.addText(s.title, {
      x, y: y + 0.9, w: stepW, h: 0.7,
      fontSize: 13, fontFace: FONT, color: DARK, bold: true, align: "center",
    });

    slide.addText(s.desc, {
      x, y: y + 1.65, w: stepW, h: 0.7,
      fontSize: 11, fontFace: FONT, color: GRAY, align: "center",
    });

    // Arrow between steps
    if (i < steps.length - 1) {
      slide.addText("→", {
        x: x + stepW, y, w: 0.5, h: 0.7,
        fontSize: 22, fontFace: FONT, color: "BDBDBD", align: "center", valign: "middle",
      });
    }
  });

  // Bottom highlight
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.5, y: 4.8, w: W - 5, h: 1.0,
    fill: { color: "E3F2FD" },
    rectRadius: 0.1,
  });
  slide.addText("0 минут HR-времени на проведение интервью", {
    x: 2.5, y: 4.8, w: W - 5, h: 1.0,
    fontSize: 22, fontFace: FONT, color: BLUE, bold: true, align: "center", valign: "middle",
  });

  slide.addText("Кандидат проходит интервью самостоятельно. HR работает только с готовыми результатами.", {
    x: 0.8, y: 6.0, w: W - 1.6, h: 0.5,
    fontSize: 13, fontFace: FONT, color: GRAY, align: "center",
  });

  addSlideNumber(slide, 3);
}

// ============================================================
// SLIDE 4: HeadHunter Integration
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Интеграция с HeadHunter", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  slide.addText("Полный цикл автоматизации — от отклика до решения", {
    x: 0.8, y: 1.1, w: W - 1.6, h: 0.4,
    fontSize: 14, fontFace: FONT, color: GRAY,
  });

  // Left column: automated features
  const features = [
    { title: "Автосинхронизация", desc: "Вакансии и отклики загружаются автоматически" },
    { title: "AI-приглашения", desc: "Персональное сообщение для каждого кандидата, не шаблон" },
    { title: "Автонапоминания", desc: "Кандидатам, не прошедшим интервью, через 7 дней" },
    { title: "Автоотказы", desc: "Неподходящим кандидатам через 14 дней" },
    { title: "Синхронизация стадий", desc: "Статусы кандидатов обновляются в HH автоматически" },
  ];

  features.forEach((f, i) => {
    const y = 1.8 + i * 0.85;
    slide.addShape(pres.ShapeType.ellipse, {
      x: 0.8, y: y + 0.05, w: 0.35, h: 0.35,
      fill: { color: LIGHT_GREEN },
    });
    slide.addText("✓", {
      x: 0.8, y: y + 0.05, w: 0.35, h: 0.35,
      fontSize: 14, fontFace: FONT, color: WHITE, align: "center", valign: "middle",
    });
    slide.addText(f.title, {
      x: 1.35, y, w: 4, h: 0.3,
      fontSize: 15, fontFace: FONT, color: DARK, bold: true,
    });
    slide.addText(f.desc, {
      x: 1.35, y: y + 0.3, w: 4.5, h: 0.3,
      fontSize: 12, fontFace: FONT, color: GRAY,
    });
  });

  // Right column: comparison
  const compX = 7;
  const compW = (W - 7 - 0.8);

  // "Before" box
  slide.addShape(pres.ShapeType.roundRect, {
    x: compX, y: 1.8, w: compW, h: 2.2,
    fill: { color: "FFEBEE" },
    rectRadius: 0.1,
  });
  slide.addText("Без SofiHR", {
    x: compX, y: 1.9, w: compW, h: 0.4,
    fontSize: 16, fontFace: FONT, color: RED_ACCENT, bold: true, align: "center",
  });
  slide.addText(
    "• Заходите в HH каждый день\n• Шаблонные приглашения\n• Забываете напомнить\n• 5 часов/день на рутину",
    {
      x: compX + 0.3, y: 2.3, w: compW - 0.6, h: 1.5,
      fontSize: 12, fontFace: FONT, color: "B71C1C", valign: "top",
      lineSpacingMultiple: 1.5,
    }
  );

  // "After" box
  slide.addShape(pres.ShapeType.roundRect, {
    x: compX, y: 4.2, w: compW, h: 2.2,
    fill: { color: "E8F5E9" },
    rectRadius: 0.1,
  });
  slide.addText("С SofiHR", {
    x: compX, y: 4.3, w: compW, h: 0.4,
    fontSize: 16, fontFace: FONT, color: GREEN, bold: true, align: "center",
  });
  slide.addText(
    "• Автосинхронизация 24/7\n• AI персонализация\n• Авто-напоминания и отказы\n• 0 минут/день",
    {
      x: compX + 0.3, y: 4.7, w: compW - 0.6, h: 1.5,
      fontSize: 12, fontFace: FONT, color: "1B5E20", valign: "top",
      lineSpacingMultiple: 1.5,
    }
  );

  addSlideNumber(slide, 4);
}

// ============================================================
// SLIDE 5: Company types
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Кому подходит SofiHR", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const types = [
    {
      icon: "💻",
      title: "IT-компании",
      desc: "Массовый найм разработчиков, QA, DevOps. AI оценивает технические знания и soft skills по видео.",
      metric: "Сокращение time-to-hire на 70%",
    },
    {
      icon: "🏭",
      title: "Ритейл и производство",
      desc: "От курьеров до менеджеров — единый стандарт оценки без глубокой экспертизы HR в каждой профессии.",
      metric: "Единый процесс для всех ролей",
    },
    {
      icon: "🏢",
      title: "HR-агентства",
      desc: "White Label решение под ваш бренд. Масштабируйте бизнес без увеличения штата рекрутеров.",
      metric: "Обслуживайте в 3x больше клиентов",
    },
    {
      icon: "🏛",
      title: "Крупные холдинги",
      desc: "Мультикомпанийность, единая аналитика, соответствие 152-ФЗ. API для интеграции с вашими системами.",
      metric: "Полный контроль и compliance",
    },
  ];

  const cardW = (W - 1.6 - 0.4 * 3) / 4;
  types.forEach((t, i) => {
    const x = 0.8 + i * (cardW + 0.4);
    const y = 1.7;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: cardW, h: 4.5,
      fill: { color: LIGHT_BG },
      rectRadius: 0.1,
    });

    slide.addText(t.icon, {
      x, y: y + 0.3, w: cardW, h: 0.7,
      fontSize: 40, align: "center",
    });

    slide.addText(t.title, {
      x: x + 0.2, y: y + 1.1, w: cardW - 0.4, h: 0.5,
      fontSize: 16, fontFace: FONT, color: BLUE, bold: true, align: "center",
    });

    slide.addText(t.desc, {
      x: x + 0.2, y: y + 1.7, w: cardW - 0.4, h: 1.5,
      fontSize: 12, fontFace: FONT, color: GRAY, align: "center", valign: "top",
    });

    // Metric highlight
    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.15, y: y + 3.5, w: cardW - 0.3, h: 0.6,
      fill: { color: "E3F2FD" },
      rectRadius: 0.05,
    });
    slide.addText(t.metric, {
      x: x + 0.15, y: y + 3.5, w: cardW - 0.3, h: 0.6,
      fontSize: 11, fontFace: FONT, color: BLUE, bold: true, align: "center", valign: "middle",
    });
  });

  addSlideNumber(slide, 5);
}

// ============================================================
// SLIDE 6: Case studies
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Кейсы клиентов", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const cases = [
    {
      industry: "IT / Средний бизнес",
      title: "Предотвратили ошибочный найм IT-директора",
      story:
        "HRD впервые закрывала роль IT-директора. Харизматичный кандидат получил оценку 4.0 от AI, а «нехаризматичный» — 7.0. SofiHR показала критичные пробелы у фаворита.",
      metrics: [
        { label: "Экономия", value: "2.5 млн ₽" },
        { label: "Стоимость проверки", value: "250 ₽" },
      ],
      color: BLUE,
    },
    {
      industry: "Туроператор / 300 сотрудников",
      title: "Сократили HR-команду в 2 раза",
      story:
        "Компания нанимала от курьеров до разработчиков. SofiHR стал единым инструментом объективной оценки без глубокой экспертизы в каждой профессии.",
      metrics: [
        { label: "HR-штат", value: "4 → 2" },
        { label: "Ошибки найма", value: "< 5%" },
      ],
      color: GREEN,
    },
    {
      industry: "Автозапчасти / 10 наймов в мес.",
      title: "Собственник вышел из операционного найма",
      story:
        "Собственница лично проводила 80–90 часов на найм в месяц. После SofiHR — 4 часа. Найм превратился в управляемую систему.",
      metrics: [
        { label: "Время собственника", value: "90ч → 4ч" },
        { label: "Ошибки найма", value: "25% → 10%" },
      ],
      color: "FF6F00",
    },
  ];

  const caseW = (W - 1.6 - 0.4 * 2) / 3;
  cases.forEach((c, i) => {
    const x = 0.8 + i * (caseW + 0.4);
    const y = 1.5;

    // Card background
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: caseW, h: 5.2,
      fill: { color: LIGHT_BG },
      rectRadius: 0.1,
    });

    // Top color bar
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: caseW, h: 0.08,
      fill: { color: c.color },
    });

    slide.addText(c.industry, {
      x: x + 0.25, y: y + 0.25, w: caseW - 0.5, h: 0.3,
      fontSize: 10, fontFace: FONT, color: c.color, bold: true,
    });

    slide.addText(c.title, {
      x: x + 0.25, y: y + 0.6, w: caseW - 0.5, h: 0.7,
      fontSize: 15, fontFace: FONT, color: DARK, bold: true, valign: "top",
    });

    slide.addText(c.story, {
      x: x + 0.25, y: y + 1.4, w: caseW - 0.5, h: 1.8,
      fontSize: 11.5, fontFace: FONT, color: GRAY, valign: "top",
      lineSpacingMultiple: 1.4,
    });

    // Metrics
    c.metrics.forEach((m, mi) => {
      const my = y + 3.5 + mi * 0.75;
      slide.addText(m.label, {
        x: x + 0.25, y: my, w: caseW - 0.5, h: 0.3,
        fontSize: 10, fontFace: FONT, color: GRAY,
      });
      slide.addText(m.value, {
        x: x + 0.25, y: my + 0.25, w: caseW - 0.5, h: 0.4,
        fontSize: 22, fontFace: FONT, color: c.color, bold: true,
      });
    });
  });

  addSlideNumber(slide, 6);
}

// ============================================================
// SLIDE 7: Additional capabilities
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Дополнительные возможности", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const caps = [
    {
      icon: "📋",
      title: "Тестирование\nрегламентов",
      items: [
        "Проверка знания 152-ФЗ, ТБ, внутренних процессов",
        "AI генерирует тесты из документов (PDF, DOCX)",
        "Массовые рассылки сотрудникам",
        "Автоматические напоминания",
        "Дедлайны и отслеживание прогресса",
      ],
    },
    {
      icon: "📊",
      title: "Аналитика\nи отчёты",
      items: [
        "Детальные PDF/Excel отчёты",
        "Сравнение кандидатов side-by-side",
        "Red flags и предупреждения",
        "Оценка компетенций по шкале",
        "Статистика по вакансиям",
      ],
    },
    {
      icon: "🔌",
      title: "API и\nинтеграции",
      items: [
        "RESTful API с документацией",
        "Webhook уведомления",
        "SDK для популярных языков",
        "Интеграция с вашими системами",
        "Тестовый доступ бесплатно",
      ],
    },
    {
      icon: "🏷",
      title: "White Label",
      items: [
        "Платформа под вашим брендом",
        "Ваш логотип и фирменные цвета",
        "Собственный домен",
        "Для HR-агентств и аутсорсинга",
        "Техническая поддержка",
      ],
    },
  ];

  const colW = (W - 1.6 - 0.4 * 3) / 4;
  caps.forEach((c, i) => {
    const x = 0.8 + i * (colW + 0.4);
    const y = 1.6;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h: 5.0,
      fill: { color: LIGHT_BG },
      rectRadius: 0.1,
    });

    slide.addText(c.icon, {
      x, y: y + 0.2, w: colW, h: 0.7,
      fontSize: 36, align: "center",
    });

    slide.addText(c.title, {
      x: x + 0.15, y: y + 0.95, w: colW - 0.3, h: 0.7,
      fontSize: 14, fontFace: FONT, color: BLUE, bold: true, align: "center",
    });

    const bulletText = c.items.map((item) => `•  ${item}`).join("\n");
    slide.addText(bulletText, {
      x: x + 0.2, y: y + 1.75, w: colW - 0.4, h: 3.0,
      fontSize: 10.5, fontFace: FONT, color: DARK, valign: "top",
      lineSpacingMultiple: 1.5,
    });
  });

  addSlideNumber(slide, 7);
}

// ============================================================
// SLIDE 8: Pricing / Economics
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Экономика: почему это выгодно", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  // Comparison: Competitor vs SofiHR
  const halfW = (W - 1.6 - 0.6) / 2;

  // Competitor
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: halfW, h: 2.8,
    fill: { color: "FFF3E0" },
    rectRadius: 0.1,
  });
  slide.addText("Типичный конкурент", {
    x: 0.8, y: 1.6, w: halfW, h: 0.4,
    fontSize: 16, fontFace: FONT, color: "E65100", bold: true, align: "center",
  });
  slide.addText("Оплата за приглашения", {
    x: 0.8, y: 2.0, w: halfW, h: 0.3,
    fontSize: 12, fontFace: FONT, color: GRAY, align: "center",
  });
  slide.addText(
    "100 приглашений → 10 000 ₽\n35 откликнулись — уже заплатили\n25 прошли интервью — уже заплатили\n\nИтого: 10 000 ₽ за 25 интервью\n= 400 ₽ / интервью",
    {
      x: 1.1, y: 2.5, w: halfW - 0.6, h: 1.6,
      fontSize: 12, fontFace: FONT, color: "BF360C", valign: "top",
      lineSpacingMultiple: 1.4,
    }
  );

  // SofiHR
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8 + halfW + 0.6, y: 1.5, w: halfW, h: 2.8,
    fill: { color: "E8F5E9" },
    rectRadius: 0.1,
  });
  slide.addText("SofiHR", {
    x: 0.8 + halfW + 0.6, y: 1.6, w: halfW, h: 0.4,
    fontSize: 16, fontFace: FONT, color: GREEN, bold: true, align: "center",
  });
  slide.addText("Оплата за результат", {
    x: 0.8 + halfW + 0.6, y: 2.0, w: halfW, h: 0.3,
    fontSize: 12, fontFace: FONT, color: GRAY, align: "center",
  });
  slide.addText(
    "100 приглашений → 0 ₽ (бесплатно!)\n35 откликнулись → не платите\n25 прошли интервью → 2 500 ₽\n\nИтого: 2 500 ₽ за 25 интервью\n= 100 ₽ / интервью",
    {
      x: 1.1 + halfW + 0.6, y: 2.5, w: halfW - 0.6, h: 1.6,
      fontSize: 12, fontFace: FONT, color: "1B5E20", valign: "top",
      lineSpacingMultiple: 1.4,
    }
  );

  // Savings highlight
  slide.addShape(pres.ShapeType.roundRect, {
    x: (W - 4) / 2, y: 4.5, w: 4, h: 0.7,
    fill: { color: BLUE },
    rectRadius: 0.1,
  });
  slide.addText("Экономия в 4 раза", {
    x: (W - 4) / 2, y: 4.5, w: 4, h: 0.7,
    fontSize: 20, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle",
  });

  // Tariffs table
  slide.addText("Тарифы", {
    x: 0.8, y: 5.5, w: W - 1.6, h: 0.4,
    fontSize: 16, fontFace: FONT, color: DARK, bold: true,
  });

  const tariffs = [
    { name: "Пробный", price: "0 ₽", qty: "10 интервью", per: "бесплатно" },
    { name: "Старт", price: "13 500 ₽", qty: "100 интервью", per: "135 ₽/шт" },
    { name: "Бизнес", price: "54 000 ₽", qty: "500 интервью", per: "108 ₽/шт" },
    { name: "Премиум", price: "90 000 ₽", qty: "1000 интервью", per: "90 ₽/шт" },
  ];

  const tarW = (W - 1.6 - 0.3 * 3) / 4;
  tariffs.forEach((t, i) => {
    const x = 0.8 + i * (tarW + 0.3);
    const y = 6.0;

    const isBiz = t.name === "Бизнес";
    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: tarW, h: 0.9,
      fill: { color: isBiz ? "E3F2FD" : LIGHT_BG },
      rectRadius: 0.05,
      line: isBiz ? { color: BLUE, width: 1.5 } : undefined,
    });
    slide.addText(`${t.name}  |  ${t.price}  |  ${t.qty}  |  ${t.per}`, {
      x, y, w: tarW, h: 0.9,
      fontSize: 10, fontFace: FONT, color: DARK, align: "center", valign: "middle",
    });
  });

  addSlideNumber(slide, 8);
}

// ============================================================
// SLIDE 9: CTA — Next step
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: DARK_BLUE };

  slide.addText("Начните с 10 бесплатных интервью", {
    x: 0.8, y: 1.5, w: W - 1.6, h: 1.0,
    fontSize: 36, fontFace: FONT, color: WHITE, bold: true, align: "center",
  });

  slide.addText(
    "Без кредитной карты  ·  Настройка за 5 минут  ·  Полный функционал",
    {
      x: 0.8, y: 2.6, w: W - 1.6, h: 0.5,
      fontSize: 16, fontFace: FONT, color: "90CAF9", align: "center",
    }
  );

  // CTA button shape
  slide.addShape(pres.ShapeType.roundRect, {
    x: (W - 5) / 2, y: 3.5, w: 5, h: 0.9,
    fill: { color: LIGHT_GREEN },
    rectRadius: 0.15,
  });
  slide.addText("www.sofihr.ru/register", {
    x: (W - 5) / 2, y: 3.5, w: 5, h: 0.9,
    fontSize: 22, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle",
  });

  // Contact info
  const contactItems = [
    "Сайт: www.sofihr.ru",
    "Демо: запросите персональную демонстрацию",
  ];
  slide.addText(contactItems.join("\n"), {
    x: 0.8, y: 4.8, w: W - 1.6, h: 0.8,
    fontSize: 14, fontFace: FONT, color: "BBDEFB", align: "center",
    lineSpacingMultiple: 1.6,
  });

  // Bottom trust bar
  const trust = [
    "152-ФЗ соответствие",
    "24/7 работа",
    "Шифрование данных",
    "50 000+ интервью",
  ];
  const trustW = (W - 1.6) / trust.length;
  trust.forEach((t, i) => {
    slide.addText(t, {
      x: 0.8 + i * trustW, y: 6.2, w: trustW, h: 0.4,
      fontSize: 11, fontFace: FONT, color: "64B5F6", align: "center",
    });
  });

  slide.addText("SofiHR — HR-платформа для автоматизации найма", {
    x: 0.8, y: 6.8, w: W - 1.6, h: 0.4,
    fontSize: 11, fontFace: FONT, color: "5C6BC0", align: "center",
  });
}

// Generate file
const outputPath = "SofiHR_Presentation.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log(`Презентация создана: ${outputPath}`);
  console.log("Загрузите файл в Google Drive → Открыть с помощью Google Slides");
});
