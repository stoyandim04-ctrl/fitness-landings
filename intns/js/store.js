// Демо „бекенд“: localStorage на същия домейн.
//   intns.session.v1   → { email, at }                       (вход)
//   intns.progress.v1  → { [week]: [завършени тренировки] }
//   intns.checkins.v1  → { [clientId]: чек-ин }             (пише клиентът)
//   intns.feedback.v1  → { [clientId]: { text, sentAt } }   (пише треньорът)
export const KEYS = {
  session: 'intns.session.v1',
  checkins: 'intns.checkins.v1',
  feedback: 'intns.feedback.v1',
  progress: 'intns.progress.v1',
};

export const store = {
  read(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } },
  write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};

export const STRIPE_3DAY_URL = 'https://buy.stripe.com/bJe4gydoseHk4UNgMxbII1r';

// Демо клиент. При истински бекенд идва от базата (напр. Supabase Auth).
export const DEMO_USER = {
  id: 'maria-p',
  email: 'maria@intns.bg',
  password: 'intns2026',
  name: 'Мария Петрова',
  short: 'Мария',
  initials: 'МП',
  program: 'school',          // активна програма
  week: 6, totalWeeks: 12,    // текуща седмица
  startDate: '2026-08-24',
  access: { '3day': 'active', school: 'active', academy: 'locked', retreat: 'soon' },
};
export const USERS = { client: DEMO_USER };

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
