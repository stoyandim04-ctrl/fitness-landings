// Демо „бекенд“: localStorage на същия домейн.
//   intns.session.v1   → { role: 'client' | 'coach', at }
//   intns.checkins.v1  → { [clientId]: чек-ин }             (пише клиентът)
//   intns.feedback.v1  → { [clientId]: { text, sentAt } }   (пише треньорът)
export const KEYS = {
  session: 'intns.session.v1',
  checkins: 'intns.checkins.v1',
  feedback: 'intns.feedback.v1',
};

export const store = {
  read(key) { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } },
  write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};

export const STRIPE_3DAY_URL = 'https://buy.stripe.com/bJe4gydoseHk4UNgMxbII1r';

export const USERS = {
  client: { id: 'maria-p', name: 'Мария Петрова', short: 'Мария', meta: 'INTNS Academy', initials: 'МП' },
  coach:  { id: 'tony',    name: 'Tony Intense',  short: 'Тони',  meta: 'Head Coach',    avatar: 'assets/coach.webp' },
};

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
