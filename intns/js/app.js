// INTNS // Unified Ecosystem — входна точка: рутер, сесия, навигация.
import { createRouter } from './router.js';
import { session, initLogin } from './auth.js';
import { initHome } from './home.js';
import { initPortal } from './portal.js';
import { initClient as initCheckin } from './checkin.js';
import { initAccount } from './account.js';
import { initPricing } from './pricing.js';
import { toast } from './ui.js';

initHome();
const portal = initPortal();
const checkin = initCheckin();
const login = initLogin({ toast, onSuccess: () => { paintUser(); router.go(session.takeNext() || '/portal'); } });
const pricing = initPricing({ onAsk: () => router.go(session.user ? '/checkin' : '/login') });

// ── Потребител в навигацията ──
function paintUser() {
  const u = session.user;
  document.querySelectorAll('[data-when="guest"]').forEach(el => (el.hidden = !!u));
  document.querySelectorAll('[data-when="user"]').forEach(el => (el.hidden = !u));
  if (u) {
    document.querySelectorAll('[data-user-initials]').forEach(el => (el.textContent = u.initials));
    document.querySelectorAll('[data-user-short]').forEach(el => (el.textContent = u.short));
    initAccount();
  }
}

const router = createRouter({
  routes: {
    '/':        { view: 'view-home',    title: 'INTNS | Mind, Health & Body' },
    '/join':    { view: 'view-join',    title: 'Записване · INTNS', onEnter: p => p.get('p') && pricing.select(p.get('p')) },
    '/login':   { view: 'view-login',   title: 'Вход · INTNS', onEnter: () => login.onEnter() },
    '/portal':  { view: 'view-portal',  title: 'Моята програма · INTNS', auth: true, onEnter: () => portal.onEnter() },
    '/checkin': { view: 'view-checkin', title: 'Чек-ин · INTNS', auth: true, onEnter: () => checkin.onEnter() },
    '/account': { view: 'view-account', title: 'Акаунт · INTNS', auth: true },
  },
  guard(route, path) {
    if (route.auth && !session.user) { session.setNext(path); return '/login'; }
    if (path === '/login' && session.user) return '/portal';
    return null;
  },
  onChange(route, path) {
    document.title = route.title;
    document.querySelectorAll('[data-nav]').forEach(a => {
      const target = a.getAttribute('href').slice(1);
      a.setAttribute('aria-current', target === path ? 'page' : 'false');
    });
  },
});

document.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', () => {
  session.logout();
  paintUser();
  toast('Излезе успешно');
  router.go('/');
}));

paintUser();
router.start();
