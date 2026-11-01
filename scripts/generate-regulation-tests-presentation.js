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
const ORANGE = "F57C00";
const PURPLE = "7B1FA2";

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
    x: 0.8, y: 0.8, w: W - 1.6, h: 0.8,
    fontSize: 20, fontFace: FONT, color: "64B5F6",
  });

  slide.addText("Тестирование знаний\nрегламентов", {
    x: 0.8, y: 1.8, w: W - 1.6, h: 1.8,
    fontSize: 46, fontFace: FONT, color: WHITE, bold: true,
    lineSpacingMultiple: 1.2,
  });

  slide.addText(
    "Автоматическая проверка знаний сотрудников по внутренним документам компании",
    {
      x: 0.8, y: 3.7, w: 8, h: 0.7,
      fontSize: 18, fontFace: FONT, color: "90CAF9",
    }
  );

  const stats = [
    { label: "AI", sub: "генерация вопросов" },
    { label: "24/7", sub: "доступ для сотрудников" },
    { label: "0 мин", sub: "ручной работы HR" },
    { label: "100%", sub: "контроль знаний" },
  ];
  const statW = (W - 1.6) / stats.length;
  stats.forEach((s, i) => {
    const x = 0.8 + i * statW;
    slide.addText(s.label, {
      x, y: 5.3, w: statW, h: 0.6,
      fontSize: 28, fontFace: FONT, color: WHITE, bold: true, align: "center",
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

  slide.addText("Знание регламентов — зона риска", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  slide.addText(
    "Как сейчас проверяют знание сотрудниками внутренних документов?",
    {
      x: 0.8, y: 1.1, w: W - 1.6, h: 0.4,
      fontSize: 14, fontFace: FONT, color: GRAY,
    }
  );

  const problems = [
    {
      icon: "📝",
      title: "Вручную или никак",
      desc: "HR составляет тесты вручную, тратя часы на каждый регламент. Часто проверку просто не проводят — нет ресурсов.",
      risk: "Риск: сотрудники не знают правила",
    },
    {
      icon: "⚠️",
      title: "Нет системного контроля",
      desc: "Нет единой системы: кто-то прошёл, кто-то нет, кто-то забыл. Нет дедлайнов, нет напоминаний, нет статистики.",
      risk: "Риск: нарушения и штрафы",
    },
    {
      icon: "🔄",
      title: "Регламенты обновляются",
      desc: "Документы меняются, а сотрудники продолжают работать по старым правилам. Повторное тестирование — ещё больше работы.",
      risk: "Риск: устаревшие знания",
    },
  ];

  const cardW = (W - 1.6 - 0.6) / 3;
  problems.forEach((p, i) => {
    const x = 0.8 + i * (cardW + 0.3);
    const y = 1.9;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: cardW, h: 4.5,
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
      x: x + 0.3, y: y + 1.7, w: cardW - 0.6, h: 1.8,
      fontSize: 13, fontFace: FONT, color: GRAY, align: "center", valign: "top",
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.2, y: y + 3.6, w: cardW - 0.4, h: 0.5,
      fill: { color: "FFEBEE" },
      rectRadius: 0.05,
    });
    slide.addText(p.risk, {
      x: x + 0.2, y: y + 3.6, w: cardW - 0.4, h: 0.5,
      fontSize: 11, fontFace: FONT, color: RED_ACCENT, bold: true, align: "center", valign: "middle",
    });
  });

  slide.addText("152-ФЗ, охрана труда, внутренние процессы — незнание не освобождает от ответственности", {
    x: 0.8, y: 6.7, w: W - 1.6, h: 0.4,
    fontSize: 13, fontFace: FONT, color: BLUE, bold: true, align: "center",
  });
  addSlideNumber(slide, 2);
}

// ============================================================
// SLIDE 3: Solution overview
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Решение: AI-тестирование регламентов", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  slide.addText(
    "SofiHR автоматически создаёт тесты по вашим документам и проверяет знания сотрудников",
    {
      x: 0.8, y: 1.1, w: W - 1.6, h: 0.4,
      fontSize: 14, fontFace: FONT, color: GRAY,
    }
  );

  const steps = [
    { num: "1", title: "Загрузите\nрегламент", desc: "PDF, DOCX или\nвведите текст", color: BLUE },
    { num: "2", title: "AI создаёт\nвопросы", desc: "Автоматически\nза 30 секунд", color: PURPLE },
    { num: "3", title: "Отправьте\nсотрудникам", desc: "Email или ссылка,\nмассово или лично", color: ORANGE },
    { num: "4", title: "Сотрудники\nпроходят тест", desc: "В удобное время,\nс любого устройства", color: GREEN },
    { num: "5", title: "AI оценивает\nответы", desc: "Автоматический\nскоринг 0–100", color: PURPLE },
    { num: "6", title: "HR получает\nрезультаты", desc: "Статистика, отчёты,\nуведомления", color: BLUE },
  ];

  const stepW = (W - 1.6 - 0.4 * 5) / 6;
  steps.forEach((s, i) => {
    const x = 0.8 + i * (stepW + 0.4);
    const y = 2.0;

    slide.addShape(pres.ShapeType.ellipse, {
      x: x + stepW / 2 - 0.35, y, w: 0.7, h: 0.7,
      fill: { color: s.color },
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

    if (i < steps.length - 1) {
      slide.addText("→", {
        x: x + stepW, y, w: 0.4, h: 0.7,
        fontSize: 20, fontFace: FONT, color: "BDBDBD", align: "center", valign: "middle",
      });
    }
  });

  // Key value prop
  slide.addShape(pres.ShapeType.roundRect, {
    x: 2.0, y: 4.5, w: W - 4, h: 1.2,
    fill: { color: "E3F2FD" },
    rectRadius: 0.1,
  });
  slide.addText("Весь процесс автоматизирован: от создания вопросов до оценки результатов", {
    x: 2.0, y: 4.5, w: W - 4, h: 0.6,
    fontSize: 18, fontFace: FONT, color: BLUE, bold: true, align: "center", valign: "bottom",
  });
  slide.addText("HR тратит 5 минут на настройку — дальше система работает сама", {
    x: 2.0, y: 5.1, w: W - 4, h: 0.5,
    fontSize: 13, fontFace: FONT, color: GRAY, align: "center", valign: "top",
  });

  addSlideNumber(slide, 3);
}

// ============================================================
// SLIDE 4: AI Question Generation
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("AI генерирует вопросы по вашим документам", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 28, fontFace: FONT, color: DARK, bold: true,
  });

  // Left: How it works
  const leftW = 6;
  slide.addText("Как это работает", {
    x: 0.8, y: 1.4, w: leftW, h: 0.4,
    fontSize: 16, fontFace: FONT, color: BLUE, bold: true,
  });

  const howItems = [
    { title: "Загрузите документ", desc: "PDF, DOCX или введите текст регламента в редакторе" },
    { title: "AI анализирует содержание", desc: "Находит ключевые положения, правила, процедуры и требования" },
    { title: "Генерирует вопросы", desc: "Текстовые и с вариантами ответов, с указанием правильного ответа" },
    { title: "Вы можете отредактировать", desc: "Измените, добавьте или удалите вопросы перед отправкой" },
  ];

  howItems.forEach((item, i) => {
    const y = 2.0 + i * 1.1;
    slide.addShape(pres.ShapeType.ellipse, {
      x: 0.8, y: y + 0.05, w: 0.3, h: 0.3,
      fill: { color: BLUE },
    });
    slide.addText(String(i + 1), {
      x: 0.8, y: y + 0.05, w: 0.3, h: 0.3,
      fontSize: 11, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle",
    });
    slide.addText(item.title, {
      x: 1.3, y: y - 0.05, w: leftW - 0.8, h: 0.3,
      fontSize: 14, fontFace: FONT, color: DARK, bold: true,
    });
    slide.addText(item.desc, {
      x: 1.3, y: y + 0.3, w: leftW - 0.8, h: 0.3,
      fontSize: 12, fontFace: FONT, color: GRAY,
    });
  });

  // Right: Types of questions
  const rightX = 7.2;
  const rightW = W - rightX - 0.8;

  slide.addText("Типы вопросов", {
    x: rightX, y: 1.4, w: rightW, h: 0.4,
    fontSize: 16, fontFace: FONT, color: BLUE, bold: true,
  });

  // Question type 1: Text
  slide.addShape(pres.ShapeType.roundRect, {
    x: rightX, y: 2.0, w: rightW, h: 2.0,
    fill: { color: LIGHT_BG },
    rectRadius: 0.08,
  });
  slide.addText("📝  Текстовые вопросы", {
    x: rightX + 0.2, y: 2.1, w: rightW - 0.4, h: 0.4,
    fontSize: 13, fontFace: FONT, color: DARK, bold: true,
  });
  slide.addText(
    "Сотрудник отвечает своими словами.\nAI оценивает полноту и точность ответа по эталону из регламента.",
    {
      x: rightX + 0.2, y: 2.5, w: rightW - 0.4, h: 1.0,
      fontSize: 11, fontFace: FONT, color: GRAY, valign: "top",
      lineSpacingMultiple: 1.4,
    }
  );
  slide.addText("Оценка: 0–100 баллов", {
    x: rightX + 0.2, y: 3.5, w: rightW - 0.4, h: 0.3,
    fontSize: 11, fontFace: FONT, color: BLUE, bold: true,
  });

  // Question type 2: Multiple choice
  slide.addShape(pres.ShapeType.roundRect, {
    x: rightX, y: 4.2, w: rightW, h: 2.0,
    fill: { color: LIGHT_BG },
    rectRadius: 0.08,
  });
  slide.addText("☑️  Вопросы с вариантами", {
    x: rightX + 0.2, y: 4.3, w: rightW - 0.4, h: 0.4,
    fontSize: 13, fontFace: FONT, color: DARK, bold: true,
  });
  slide.addText(
    "Выбор из нескольких вариантов ответа.\nМгновенная автоматическая проверка без AI — 0 или 100 баллов.",
    {
      x: rightX + 0.2, y: 4.7, w: rightW - 0.4, h: 1.0,
      fontSize: 11, fontFace: FONT, color: GRAY, valign: "top",
      lineSpacingMultiple: 1.4,
    }
  );
  slide.addText("Оценка: мгновенная", {
    x: rightX + 0.2, y: 5.7, w: rightW - 0.4, h: 0.3,
    fontSize: 11, fontFace: FONT, color: GREEN, bold: true,
  });

  addSlideNumber(slide, 4);
}

// ============================================================
// SLIDE 5: Key Features
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Возможности платформы", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const features = [
    {
      icon: "📨",
      title: "Массовые\nприглашения",
      items: [
        "Приглашайте до 100 человек за раз",
        "Персональные и общие ссылки",
        "Email-уведомления автоматически",
        "Повторная отправка в один клик",
      ],
    },
    {
      icon: "⏰",
      title: "Дедлайны и\nнапоминания",
      items: [
        "Установите срок прохождения",
        "Автоматические email-напоминания",
        "Настраиваемый период (за N дней)",
        "Отслеживание кто не прошёл",
      ],
    },
    {
      icon: "📊",
      title: "Результаты\nи аналитика",
      items: [
        "Оценка каждого ответа 0–100",
        "Общий балл по тесту",
        "Детализация по вопросам",
        "Экспорт результатов в CSV",
      ],
    },
    {
      icon: "🔔",
      title: "Уведомления\nв реальном времени",
      items: [
        "Push в системе при прохождении",
        "Telegram-уведомления HR",
        "Мгновенный доступ к результатам",
        "Ничего не пропустите",
      ],
    },
  ];

  const colW = (W - 1.6 - 0.4 * 3) / 4;
  features.forEach((f, i) => {
    const x = 0.8 + i * (colW + 0.4);
    const y = 1.6;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: colW, h: 5.0,
      fill: { color: LIGHT_BG },
      rectRadius: 0.1,
    });

    slide.addText(f.icon, {
      x, y: y + 0.2, w: colW, h: 0.7,
      fontSize: 36, align: "center",
    });

    slide.addText(f.title, {
      x: x + 0.15, y: y + 0.95, w: colW - 0.3, h: 0.7,
      fontSize: 14, fontFace: FONT, color: BLUE, bold: true, align: "center",
    });

    const bulletText = f.items.map((item) => `•  ${item}`).join("\n");
    slide.addText(bulletText, {
      x: x + 0.2, y: y + 1.8, w: colW - 0.4, h: 2.8,
      fontSize: 11, fontFace: FONT, color: DARK, valign: "top",
      lineSpacingMultiple: 1.6,
    });
  });

  addSlideNumber(slide, 5);
}

// ============================================================
// SLIDE 6: Use Cases
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Что можно тестировать", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  slide.addText(
    "Любые внутренние документы и регламенты вашей компании",
    {
      x: 0.8, y: 1.1, w: W - 1.6, h: 0.4,
      fontSize: 14, fontFace: FONT, color: GRAY,
    }
  );

  const useCases = [
    {
      icon: "⚖️",
      title: "Законодательство",
      examples: "152-ФЗ, трудовой кодекс, отраслевые стандарты, GDPR",
      who: "Все сотрудники",
      color: BLUE,
    },
    {
      icon: "🦺",
      title: "Охрана труда и ТБ",
      examples: "Техника безопасности, пожарная безопасность, СИЗ, первая помощь",
      who: "Производство, склад",
      color: RED_ACCENT,
    },
    {
      icon: "📋",
      title: "Внутренние процессы",
      examples: "Регламенты работы, стандарты обслуживания, скрипты продаж",
      who: "Отделы продаж, сервис",
      color: GREEN,
    },
    {
      icon: "🔒",
      title: "Информационная\nбезопасность",
      examples: "Политика паролей, работа с данными, антифишинг",
      who: "IT, все сотрудники",
      color: PURPLE,
    },
    {
      icon: "🏢",
      title: "Корпоративная\nкультура",
      examples: "Кодекс этики, ценности компании, антикоррупционная политика",
      who: "Новые сотрудники",
      color: ORANGE,
    },
  ];

  const cardW = (W - 1.6 - 0.35 * 4) / 5;
  useCases.forEach((uc, i) => {
    const x = 0.8 + i * (cardW + 0.35);
    const y = 1.8;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: cardW, h: 4.8,
      fill: { color: LIGHT_BG },
      rectRadius: 0.1,
    });

    // Top color bar
    slide.addShape(pres.ShapeType.rect, {
      x, y, w: cardW, h: 0.07,
      fill: { color: uc.color },
    });

    slide.addText(uc.icon, {
      x, y: y + 0.3, w: cardW, h: 0.6,
      fontSize: 32, align: "center",
    });

    slide.addText(uc.title, {
      x: x + 0.15, y: y + 1.0, w: cardW - 0.3, h: 0.7,
      fontSize: 13, fontFace: FONT, color: uc.color, bold: true, align: "center",
    });

    slide.addText(uc.examples, {
      x: x + 0.15, y: y + 1.8, w: cardW - 0.3, h: 1.6,
      fontSize: 10.5, fontFace: FONT, color: GRAY, align: "center", valign: "top",
      lineSpacingMultiple: 1.4,
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: x + 0.1, y: y + 3.8, w: cardW - 0.2, h: 0.6,
      fill: { color: "E3F2FD" },
      rectRadius: 0.05,
    });
    slide.addText(uc.who, {
      x: x + 0.1, y: y + 3.8, w: cardW - 0.2, h: 0.6,
      fontSize: 10, fontFace: FONT, color: BLUE, bold: true, align: "center", valign: "middle",
    });
  });

  addSlideNumber(slide, 6);
}

// ============================================================
// SLIDE 7: Before / After comparison
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("До и после внедрения", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const halfW = (W - 1.6 - 0.6) / 2;

  // Before
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.5, w: halfW, h: 4.8,
    fill: { color: "FFEBEE" },
    rectRadius: 0.1,
  });
  slide.addText("❌  Без SofiHR", {
    x: 0.8, y: 1.7, w: halfW, h: 0.5,
    fontSize: 20, fontFace: FONT, color: RED_ACCENT, bold: true, align: "center",
  });

  const beforeItems = [
    "HR вручную составляет тесты — часы работы",
    "Сотрудники «проходят» формально",
    "Нет единой системы учёта",
    "Забываете про дедлайны",
    "Нет объективной оценки знаний",
    "Обновился регламент — всё заново вручную",
    "Нет аналитики и отчётности",
  ];

  beforeItems.forEach((item, i) => {
    slide.addText(`•  ${item}`, {
      x: 1.1, y: 2.4 + i * 0.55, w: halfW - 0.6, h: 0.45,
      fontSize: 12, fontFace: FONT, color: "B71C1C", valign: "middle",
    });
  });

  // After
  const afterX = 0.8 + halfW + 0.6;
  slide.addShape(pres.ShapeType.roundRect, {
    x: afterX, y: 1.5, w: halfW, h: 4.8,
    fill: { color: "E8F5E9" },
    rectRadius: 0.1,
  });
  slide.addText("✅  С SofiHR", {
    x: afterX, y: 1.7, w: halfW, h: 0.5,
    fontSize: 20, fontFace: FONT, color: GREEN, bold: true, align: "center",
  });

  const afterItems = [
    "AI создаёт тесты за 30 секунд",
    "Реальная проверка знаний с оценкой",
    "Единая платформа, всё в одном месте",
    "Автоматические напоминания и дедлайны",
    "AI-скоринг каждого ответа 0–100",
    "Новая версия документа → новый тест за минуту",
    "Полная аналитика и экспорт",
  ];

  afterItems.forEach((item, i) => {
    slide.addText(`•  ${item}`, {
      x: afterX + 0.3, y: 2.4 + i * 0.55, w: halfW - 0.6, h: 0.45,
      fontSize: 12, fontFace: FONT, color: "1B5E20", valign: "middle",
    });
  });

  // Bottom highlight
  slide.addShape(pres.ShapeType.roundRect, {
    x: (W - 6) / 2, y: 6.5, w: 6, h: 0.6,
    fill: { color: BLUE },
    rectRadius: 0.1,
  });
  slide.addText("Экономия: 95% времени HR на тестирование", {
    x: (W - 6) / 2, y: 6.5, w: 6, h: 0.6,
    fontSize: 16, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle",
  });

  addSlideNumber(slide, 7);
}

// ============================================================
// SLIDE 8: Employee experience
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Удобно для сотрудников", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  slide.addText(
    "Сотрудник получает ссылку и проходит тест — без установки приложений и регистраций",
    {
      x: 0.8, y: 1.1, w: W - 1.6, h: 0.4,
      fontSize: 14, fontFace: FONT, color: GRAY,
    }
  );

  const expFeatures = [
    {
      icon: "📱",
      title: "Любое устройство",
      desc: "Телефон, планшет или компьютер — адаптивный интерфейс работает везде",
    },
    {
      icon: "🕐",
      title: "В удобное время",
      desc: "Сотрудник выбирает когда пройти тест — до дедлайна, 24/7",
    },
    {
      icon: "⚡",
      title: "Быстро и понятно",
      desc: "Чистый интерфейс, таймер на вопрос, прогресс-бар — без стресса",
    },
    {
      icon: "🔗",
      title: "Один клик для старта",
      desc: "Персональная ссылка в email — никаких логинов и паролей",
    },
  ];

  const fW = (W - 1.6 - 0.4 * 3) / 4;
  expFeatures.forEach((f, i) => {
    const x = 0.8 + i * (fW + 0.4);
    const y = 2.0;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: fW, h: 3.5,
      fill: { color: LIGHT_BG },
      rectRadius: 0.1,
    });

    slide.addText(f.icon, {
      x, y: y + 0.3, w: fW, h: 0.7,
      fontSize: 40, align: "center",
    });

    slide.addText(f.title, {
      x: x + 0.15, y: y + 1.1, w: fW - 0.3, h: 0.5,
      fontSize: 15, fontFace: FONT, color: DARK, bold: true, align: "center",
    });

    slide.addText(f.desc, {
      x: x + 0.2, y: y + 1.7, w: fW - 0.4, h: 1.5,
      fontSize: 12, fontFace: FONT, color: GRAY, align: "center", valign: "top",
      lineSpacingMultiple: 1.4,
    });
  });

  // Process timeline at bottom
  slide.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 5.8, w: W - 1.6, h: 1.0,
    fill: { color: "E3F2FD" },
    rectRadius: 0.08,
  });

  const timeline = [
    "Получил email",
    "→",
    "Открыл ссылку",
    "→",
    "Ответил на вопросы",
    "→",
    "Готово!",
  ];
  const tlW = (W - 1.6) / timeline.length;
  timeline.forEach((t, i) => {
    const isArrow = t === "→";
    slide.addText(t, {
      x: 0.8 + i * tlW, y: 5.8, w: tlW, h: 1.0,
      fontSize: isArrow ? 18 : 13,
      fontFace: FONT,
      color: isArrow ? "BDBDBD" : BLUE,
      bold: !isArrow,
      align: "center",
      valign: "middle",
    });
  });

  addSlideNumber(slide, 8);
}

// ============================================================
// SLIDE 9: Security and compliance
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Безопасность и соответствие", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  const secFeatures = [
    {
      icon: "🔐",
      title: "Персональные токены",
      desc: "Каждая ссылка уникальна — невозможно подделать или передать",
    },
    {
      icon: "⏱",
      title: "Ограничение времени",
      desc: "Таймер на каждый вопрос исключает подглядывание в документы",
    },
    {
      icon: "🛡️",
      title: "152-ФЗ",
      desc: "Хранение данных на территории РФ, шифрование, соответствие закону",
    },
    {
      icon: "📁",
      title: "Версионность",
      desc: "Регламенты с версиями — всегда понятно, по какой версии тестировали",
    },
    {
      icon: "🔍",
      title: "Полный аудит",
      desc: "Кто, когда, с каким результатом — все данные сохранены",
    },
    {
      icon: "🚫",
      title: "Контроль доступа",
      desc: "Только авторизованные сотрудники компании видят результаты",
    },
  ];

  const sW = (W - 1.6 - 0.4 * 2) / 3;
  secFeatures.forEach((f, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.8 + col * (sW + 0.4);
    const y = 1.5 + row * 2.8;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: sW, h: 2.4,
      fill: { color: LIGHT_BG },
      rectRadius: 0.08,
    });

    slide.addText(f.icon, {
      x, y: y + 0.2, w: sW, h: 0.5,
      fontSize: 28, align: "center",
    });

    slide.addText(f.title, {
      x: x + 0.2, y: y + 0.75, w: sW - 0.4, h: 0.4,
      fontSize: 15, fontFace: FONT, color: DARK, bold: true, align: "center",
    });

    slide.addText(f.desc, {
      x: x + 0.2, y: y + 1.2, w: sW - 0.4, h: 1.0,
      fontSize: 12, fontFace: FONT, color: GRAY, align: "center", valign: "top",
      lineSpacingMultiple: 1.3,
    });
  });

  addSlideNumber(slide, 9);
}

// ============================================================
// SLIDE 10: Integration with SofiHR ecosystem
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: WHITE };

  slide.addText("Часть экосистемы SofiHR", {
    x: 0.8, y: 0.4, w: W - 1.6, h: 0.8,
    fontSize: 30, fontFace: FONT, color: DARK, bold: true,
  });

  slide.addText(
    "Тестирование регламентов — одна из возможностей платформы SofiHR",
    {
      x: 0.8, y: 1.1, w: W - 1.6, h: 0.4,
      fontSize: 14, fontFace: FONT, color: GRAY,
    }
  );

  const ecosystem = [
    {
      icon: "🎥",
      title: "AI видео-интервью",
      desc: "Автоматизация найма: AI задаёт вопросы, оценивает ответы кандидатов",
      active: false,
    },
    {
      icon: "📋",
      title: "Тесты по регламентам",
      desc: "Проверка знаний сотрудников по внутренним документам компании",
      active: true,
    },
    {
      icon: "🔗",
      title: "Интеграция с HH",
      desc: "Автосинхронизация вакансий, откликов, приглашений с HeadHunter",
      active: false,
    },
    {
      icon: "📊",
      title: "HR-аналитика",
      desc: "Дашборды, отчёты, статистика по найму и тестированию",
      active: false,
    },
  ];

  const eW = (W - 1.6 - 0.4 * 3) / 4;
  ecosystem.forEach((e, i) => {
    const x = 0.8 + i * (eW + 0.4);
    const y = 1.9;

    slide.addShape(pres.ShapeType.roundRect, {
      x, y, w: eW, h: 3.8,
      fill: { color: e.active ? "E3F2FD" : LIGHT_BG },
      rectRadius: 0.1,
      line: e.active ? { color: BLUE, width: 2 } : undefined,
    });

    slide.addText(e.icon, {
      x, y: y + 0.3, w: eW, h: 0.7,
      fontSize: 36, align: "center",
    });

    slide.addText(e.title, {
      x: x + 0.15, y: y + 1.1, w: eW - 0.3, h: 0.5,
      fontSize: 14, fontFace: FONT, color: e.active ? BLUE : DARK, bold: true, align: "center",
    });

    slide.addText(e.desc, {
      x: x + 0.2, y: y + 1.7, w: eW - 0.4, h: 1.5,
      fontSize: 11.5, fontFace: FONT, color: GRAY, align: "center", valign: "top",
      lineSpacingMultiple: 1.4,
    });

    if (e.active) {
      slide.addText("← Вы здесь", {
        x: x + 0.15, y: y + 3.3, w: eW - 0.3, h: 0.3,
        fontSize: 11, fontFace: FONT, color: BLUE, bold: true, align: "center",
      });
    }
  });

  // Bottom message
  slide.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 6.0, w: W - 3, h: 0.8,
    fill: { color: "E8F5E9" },
    rectRadius: 0.08,
  });
  slide.addText("Все модули доступны в едином личном кабинете — подключайте что нужно", {
    x: 1.5, y: 6.0, w: W - 3, h: 0.8,
    fontSize: 14, fontFace: FONT, color: GREEN, bold: true, align: "center", valign: "middle",
  });

  addSlideNumber(slide, 10);
}

// ============================================================
// SLIDE 11: CTA
// ============================================================
{
  const slide = pres.addSlide();
  slide.background = { fill: DARK_BLUE };

  slide.addText("Начните тестировать знания\nсотрудников уже сегодня", {
    x: 0.8, y: 1.2, w: W - 1.6, h: 1.4,
    fontSize: 36, fontFace: FONT, color: WHITE, bold: true, align: "center",
    lineSpacingMultiple: 1.2,
  });

  slide.addText(
    "Бесплатная настройка  ·  Первые тесты бесплатно  ·  Поддержка на каждом этапе",
    {
      x: 0.8, y: 2.7, w: W - 1.6, h: 0.5,
      fontSize: 16, fontFace: FONT, color: "90CAF9", align: "center",
    }
  );

  // Steps to start
  const startSteps = [
    { num: "1", text: "Зарегистрируйтесь\nна sofihr.ru" },
    { num: "2", text: "Загрузите\nваш регламент" },
    { num: "3", text: "AI создаст\nвопросы" },
    { num: "4", text: "Отправьте\nсотрудникам" },
  ];

  const ssW = (W - 4) / 4;
  startSteps.forEach((s, i) => {
    const x = 2 + i * ssW;
    const y = 3.6;

    slide.addShape(pres.ShapeType.ellipse, {
      x: x + ssW / 2 - 0.3, y, w: 0.6, h: 0.6,
      fill: { color: LIGHT_GREEN },
    });
    slide.addText(s.num, {
      x: x + ssW / 2 - 0.3, y, w: 0.6, h: 0.6,
      fontSize: 18, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle",
    });

    slide.addText(s.text, {
      x, y: y + 0.7, w: ssW, h: 0.7,
      fontSize: 13, fontFace: FONT, color: "BBDEFB", align: "center",
      lineSpacingMultiple: 1.3,
    });
  });

  // CTA button
  slide.addShape(pres.ShapeType.roundRect, {
    x: (W - 5) / 2, y: 5.2, w: 5, h: 0.9,
    fill: { color: LIGHT_GREEN },
    rectRadius: 0.15,
  });
  slide.addText("www.sofihr.ru/register", {
    x: (W - 5) / 2, y: 5.2, w: 5, h: 0.9,
    fontSize: 22, fontFace: FONT, color: WHITE, bold: true, align: "center", valign: "middle",
  });

  // Contact info
  slide.addText("Запросите персональную демонстрацию — покажем на ваших документах", {
    x: 0.8, y: 6.3, w: W - 1.6, h: 0.4,
    fontSize: 14, fontFace: FONT, color: "BBDEFB", align: "center",
  });

  // Trust bar
  const trust = [
    "152-ФЗ",
    "Данные в РФ",
    "Шифрование",
    "24/7 доступ",
  ];
  const trustW = (W - 1.6) / trust.length;
  trust.forEach((t, i) => {
    slide.addText(t, {
      x: 0.8 + i * trustW, y: 6.9, w: trustW, h: 0.3,
      fontSize: 11, fontFace: FONT, color: "64B5F6", align: "center",
    });
  });
}

// Generate file
const outputPath = "SofiHR_RegulationTests_Presentation.pptx";
pres.writeFile({ fileName: outputPath }).then(() => {
  console.log(`Презентация создана: ${outputPath}`);
  console.log("Файл: " + outputPath);
});
