// Общ двигател за съдържание: една и съща седмична (или дневна) структура за всяка програма.
// Демо съдържание — при истински бекенд идва от базата за всяка програма и седмица/ден.
const pad = n => String(n).padStart(2, '0');

export const SECTIONS = [
  { key: 'training',  label: 'Тренировки' },
  { key: 'nutrition', label: 'Хранене' },
  { key: 'knowledge', label: 'Знание' },
  { key: 'tasks',     label: 'Задачи' },
  { key: 'checkin',   label: 'Чек-ин' },
];

export function unitLabel(program, n, long = true) {
  const word = program.unit === 'day' ? 'Ден' : 'Седмица';
  return long ? `${word} ${pad(n)}` : pad(n);
}

export function buildUnit(program, n) {
  const phase = program.phases[n - 1] || '';
  const isDay = program.unit === 'day';

  const training = isDay
    ? [
        { id: 't1', title: 'Движение', meta: 'Цяло тяло · 30 мин' },
        { id: 't2', title: 'Дишане и разтягане', meta: 'Mind · 10 мин' },
      ]
    : [
        { id: 't1', title: 'Долна част на тялото', meta: 'Ден 1 · Сила · 45 мин' },
        { id: 't2', title: 'Горна част + кор',     meta: 'Ден 2 · Сила · 40 мин' },
        { id: 't3', title: 'Цяло тяло',             meta: 'Ден 4 · Кондиция · 35 мин' },
        { id: 't4', title: 'Mobility и дишане',     meta: 'Ден 6 · Mind · 20 мин' },
      ];

  const nutrition = [
    { title: isDay ? `Хранителен план · ден ${pad(n)}` : `Хранителен план · седмица ${pad(n)}`, meta: 'PDF' },
    { title: 'Протеин във всяко хранене', meta: 'Принцип' },
    { title: isDay ? 'Лека вечеря до 19:00' : 'Списък за пазаруване', meta: isDay ? 'Принцип' : 'PDF' },
  ];

  const knowledge = [
    { id: 'k1', title: isDay ? `Защо ${phase.toLowerCase()}` : `Фаза „${phase}“: какво и защо`, meta: 'Видео · 8 мин' },
    { id: 'k2', title: n % 2 ? 'Сън и възстановяване' : 'Стрес и хранене', meta: 'Статия · 5 мин' },
  ];

  const tasks = [
    { id: 'h1', title: '2 л вода всеки ден' },
    { id: 'h2', title: isDay ? '5 минути тишина сутрин' : '8 000+ стъпки в 5 от 7 дни' },
    { id: 'h3', title: 'Сън преди 23:00' },
  ];
  if (program.value === 'academy') tasks.push({ id: 'h4', title: '1:1 разговор с Тони' });

  return { phase, training, nutrition, knowledge, tasks };
}
