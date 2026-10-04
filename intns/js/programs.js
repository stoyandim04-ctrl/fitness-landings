// Направленията на INTNS — единствен източник за начална страница, портал и плащания.
// price/stripeUrl = null → няма активен линк в Stripe. available:false → „Скоро“.
// unit/length/phases задават структурата, която общият портал показва (седмици или дни).
// Ред на показване: School → Academy → Retreat → 3-Дневен маратон (равни части на една екосистема).
export const PROGRAMS = [
  {
    value: 'school',
    unit: 'week', length: 12, available: true,
    format: '12 седмици · група',
    phases: ['Основи', 'Техника', 'Сила', 'Издръжливост', 'Възстановяване', 'Build', 'Build II', 'Пик', 'Deload', 'Сила II', 'Финален блок', 'Нов ритъм'],
    label: 'School',
    short: 'INTNS School',
    name: 'INTNS School',
    title: 'Основите на метода',
    description: 'Групова система с ясна структура и седмичен ритъм за трайна промяна.',
    tagline: 'Структура, ритъм и общност.',
    price: null,
    stripeUrl: null,
    features: [
      'Групова програма по метода INTNS',
      'Седмични тренировки и материали в портала',
      'Седмичен чек-ин с прогрес снимки',
      'Обратна връзка от треньора',
    ],
  },
  {
    value: 'academy',
    unit: 'week', length: 12, available: true,
    format: '12 седмици · 1:1',
    phases: ['Анализ', 'Основи', 'Техника', 'Сила', 'Възстановяване', 'Build', 'Build II', 'Пик', 'Deload', 'Сила II', 'Финален блок', 'Самостоятелност'],
    label: 'Academy',
    short: 'INTNS Academy',
    name: 'INTNS Academy',
    title: 'Лично менторство 1:1',
    description: 'Индивидуална работа с Тони — план, корекции и отчетност всяка седмица.',
    tagline: 'Лично менторство 1:1.',
    price: null,
    stripeUrl: null,
    features: [
      'Всичко от School',
      'Лично менторство 1:1',
      'Преглед на прогрес снимки',
      'Индивидуални корекции всяка седмица',
    ],
  },
  {
    value: 'retreat',
    unit: 'day', length: 4, available: false,
    format: 'На живо · малка група',
    phases: ['Пристигане', 'Потапяне', 'Сила', 'Завръщане'],
    label: 'Retreat',
    short: 'INTNS Retreat',
    name: 'INTNS Retreat',
    title: 'Пълно потапяне на живо',
    description: 'Няколко дни далеч от всичко — тренировки, възстановяване и общност на живо.',
    tagline: 'Няколко дни далеч от всичко.',
    price: null,
    stripeUrl: null,
    features: [
      'Програма на живо с Тони',
      'Тренировки, движение и възстановяване',
      'Малка група',
    ],
  },
  {
    value: '3day',
    unit: 'day', length: 3, available: true,
    format: '3 дни · онлайн',
    phases: ['Спри', 'Върни се', 'Прегърни'],
    label: '3 дни',
    short: '3-Дневен маратон',
    name: 'Нова 3-Дневна програма',
    title: 'Да се върна, себе си да прегърна',
    description: 'Ново издание на 3-Дневната програма — три дни за връщане към себе си по метода INTNS.',
    tagline: 'Три дни. Едно ново начало.',
    price: 29.9,
    period: 'еднократно',
    note: 'Pre-order · ново издание',
    stripeUrl: 'https://buy.stripe.com/bJe4gydoseHk4UNgMxbII1r',
    cta: 'Вземи моята 3-дневна програма',
    image: 'assets/program-3day.webp',
    features: [
      '3-дневна програма по метода INTNS',
      'Mind · Health · Body в една система',
      'Ново издание на програмата',
      'Еднократно плащане, без абонамент',
      'Карта, Apple Pay или Link през Stripe',
    ],
  },
];

export const programBy = v => PROGRAMS.find(p => p.value === v);

export const eur = v => v.toLocaleString('bg-BG', Number.isInteger(v)
  ? { maximumFractionDigits: 0 }
  : { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
