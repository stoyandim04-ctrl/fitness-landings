// Единен вход. Демо: проверка срещу DEMO_USER, сесия в localStorage.
// При истински бекенд login() се заменя със заявка към Supabase Auth / собствен API.
import { store, KEYS, DEMO_USER } from './store.js';

const NEXT_KEY = 'intns.next';

export const session = {
  // Профилът + последно отворената програма (запомня се между посещенията)
  get user() { return store.read(KEYS.session).email ? { ...DEMO_USER, ...store.read(KEYS.prefs) } : null; },
  remember(prefs) { store.write(KEYS.prefs, { ...store.read(KEYS.prefs), ...prefs }); },
  async login(email, password) {
    await new Promise(r => setTimeout(r, 700)); // имитира мрежова заявка
    const ok = email.trim().toLowerCase() === DEMO_USER.email && password === DEMO_USER.password;
    if (ok) store.write(KEYS.session, { email: DEMO_USER.email, at: new Date().toISOString() });
    return ok;
  },
  logout() { store.remove(KEYS.session); },
  // Къде да се върнем след вход
  setNext(path) { try { sessionStorage.setItem(NEXT_KEY, path); } catch {} },
  takeNext() { try { const p = sessionStorage.getItem(NEXT_KEY); sessionStorage.removeItem(NEXT_KEY); return p; } catch { return null; } },
};

export function initLogin({ onSuccess, toast }) {
  const form = document.getElementById('login-form');
  const email = document.getElementById('login-email');
  const pass = document.getElementById('login-password');
  const err = document.getElementById('login-error');
  const btn = form.querySelector('[type=submit]');

  const setError = msg => {
    err.textContent = msg || '';
    err.hidden = !msg;
    [email, pass].forEach(i => i.setAttribute('aria-invalid', msg ? 'true' : 'false'));
  };

  document.getElementById('toggle-pass').addEventListener('click', e => {
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    e.currentTarget.setAttribute('aria-label', show ? 'Скрий паролата' : 'Покажи паролата');
    e.currentTarget.querySelector('[data-label]').textContent = show ? 'Скрий' : 'Покажи';
  });

  document.getElementById('fill-demo').addEventListener('click', () => {
    email.value = 'maria@intns.bg';
    pass.value = 'intns2026';
    setError('');
    btn.focus();
  });

  document.getElementById('forgot').addEventListener('click', () =>
    toast('Демо: възстановяването на парола ще изпраща имейл'));

  form.addEventListener('submit', async e => {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email.value)) return setError('Въведи валиден имейл.');
    if (pass.value.length < 6) return setError('Паролата е поне 6 символа.');
    btn.disabled = true;
    btn.dataset.loading = 'true';
    const ok = await session.login(email.value, pass.value);
    btn.disabled = false;
    delete btn.dataset.loading;
    if (!ok) return setError('Грешен имейл или парола.');
    pass.value = '';
    onSuccess();
  });

  return { onEnter() { setError(''); setTimeout(() => (email.value ? pass : email).focus({ preventScroll: true }), 350); } };
}
