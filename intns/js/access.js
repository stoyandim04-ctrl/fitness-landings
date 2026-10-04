// Достъпи: един акаунт → статус за всяка програма + правилното действие (CTA).
import { PROGRAMS, programBy } from './programs.js';

export const DM_URL = 'https://ig.me/m/tony_intense';

// 'active' | 'locked' (няма достъп) | 'soon' (програмата още не е отворена)
export function statusOf(user, program) {
  if (user?.access?.[program.value] === 'active') return 'active';
  return program.available ? 'locked' : 'soon';
}

export const STATUS_LABEL = { active: 'Активна', locked: 'Няма достъп', soon: 'Скоро' };
export const STATUS_CLASS = {
  active: 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300',
  locked: 'border-white/10 bg-white/[0.03] text-zinc-400',
  soon:   'border-white/10 bg-white/[0.02] text-zinc-500',
};

// CTA в списъци и карти (кратко)
export function cardCta(user, program) {
  const st = statusOf(user, program);
  if (st === 'active') return { label: 'Влез', href: `#/program?p=${program.value}`, primary: true };
  if (!user) return { label: 'Разгледай', href: `#/explore?p=${program.value}` };
  return { label: st === 'soon' ? 'Скоро' : 'Виж програмата', href: `#/explore?p=${program.value}` };
}

// Основното действие на страницата на програмата
export function mainCta(user, program) {
  const st = statusOf(user, program);
  if (st === 'active') return { label: 'Влез в програмата', href: `#/program?p=${program.value}` };
  if (st === 'soon') return { label: 'Заяви интерес', href: DM_URL, external: true };
  if (program.stripeUrl) return { label: 'Запиши се', href: program.stripeUrl, external: true, stripe: true };
  return { label: 'Заяви достъп', href: DM_URL, external: true };
}

export const activePrograms = user => PROGRAMS.filter(p => statusOf(user, p) === 'active');

// Текущата програма: последно активната, иначе първата активна
export function currentProgram(user) {
  const act = activePrograms(user);
  return act.find(p => p.value === user?.lastActive) || act[0] || null;
}

export { programBy };
