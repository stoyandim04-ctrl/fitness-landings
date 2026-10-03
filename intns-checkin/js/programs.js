// Програмите на INTNS — единствен източник за ценовата секция и таблото.
// price/stripeUrl = null → „Скоро“ (няма активен линк в Stripe).
export const PROGRAMS = [
  {
    value: '3day',
    label: '3 дни',
    name: 'Нова 3-Дневна програма',
    title: 'Да се върна, себе си да прегърна',
    description: 'Ново издание на 3-Дневната програма — три дни за връщане към себе си по метода INTNS.',
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
  {
    value: 'school',
    label: 'School',
    name: 'INTNS School',
    title: 'Основите на метода',
    description: 'Групова система с ясна структура и седмичен ритъм за трайна промяна.',
    price: null,
    stripeUrl: null,
    features: [
      'Групова програма по метода INTNS',
      'Седмичен чек-ин в приложението',
      'Мерки, енергия и сън на едно място',
      'Обратна връзка от треньора',
    ],
  },
  {
    value: 'academy',
    label: 'Academy',
    name: 'INTNS Academy',
    title: 'Лично менторство 1:1',
    description: 'Индивидуална работа с Тони — план, корекции и отчетност всяка седмица.',
    price: null,
    stripeUrl: null,
    features: [
      'Всичко от School',
      'Лично менторство 1:1',
      'Преглед на прогрес снимки',
      'Индивидуални корекции всяка седмица',
      'Разговор с треньора при нужда',
    ],
  },
];

export const eur = v => v.toLocaleString('bg-BG', Number.isInteger(v)
  ? { maximumFractionDigits: 0 }
  : { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
