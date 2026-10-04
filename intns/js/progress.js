// Прогрес за всяка програма и седмица/ден (общ за всички програми).
import { store, KEYS } from './store.js';
import { buildUnit, SECTIONS } from './content.js';

export const doneIds = (p, n) => store.read(KEYS.progress)[p]?.[n] || [];

export function toggle(p, n, id, on) {
  const all = store.read(KEYS.progress);
  const set = new Set(all[p]?.[n] || []);
  on ? set.add(id) : set.delete(id);
  all[p] = { ...(all[p] || {}), [n]: [...set] };
  store.write(KEYS.progress, all);
}

export const hasCheckin = (p, n) => (store.read(KEYS.checkinLog)[p] || []).includes(n);

// Броим тренировки, знание, задачи и чек-ина; храненето е насоки, не се отметва.
export function unitStats(program, n) {
  const u = buildUnit(program, n);
  const done = new Set(doneIds(program.value, n));
  const items = [
    ...u.training.map(x => ({ ...x, section: 'training' })),
    ...u.knowledge.map(x => ({ ...x, section: 'knowledge' })),
    ...u.tasks.map(x => ({ ...x, section: 'tasks' })),
  ];
  const checked = items.filter(x => done.has(x.id)).length + (hasCheckin(program.value, n) ? 1 : 0);
  const total = items.length + 1;
  const next = items.find(x => !done.has(x.id));
  const nextLabel = next
    ? `${SECTIONS.find(s => s.key === next.section).label}: ${next.title}`
    : hasCheckin(program.value, n) ? null : 'Чек-ин';
  return { done: checked, total, pct: Math.round((checked / total) * 100), next: nextLabel, unit: u };
}

export function sectionCount(program, n, key) {
  const u = buildUnit(program, n);
  const done = new Set(doneIds(program.value, n));
  if (key === 'checkin') return [hasCheckin(program.value, n) ? 1 : 0, 1];
  if (key === 'nutrition') return null;
  return [u[key].filter(x => done.has(x.id)).length, u[key].length];
}

// Демо: при първи вход миналите седмици/дни са завършени, текущата — започната.
export function seedDemo(user, programs) {
  if (Object.keys(store.read(KEYS.progress)).length) return;
  const progress = {}, log = {};
  programs.filter(p => user.access[p.value] === 'active').forEach(p => {
    const pos = user.position[p.value];
    progress[p.value] = {};
    for (let n = 1; n <= pos; n++) {
      const u = buildUnit(p, n);
      const ids = [...u.training, ...u.knowledge, ...u.tasks].map(x => x.id);
      progress[p.value][n] = n < pos ? ids : ids.filter((_, i) => i % 2 === 0);
    }
    log[p.value] = Array.from({ length: pos - 1 }, (_, i) => i + 1);
  });
  store.write(KEYS.progress, progress);
  store.write(KEYS.checkinLog, log);
}
