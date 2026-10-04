// INTNS // Unified Ecosystem — един акаунт, една платформа, много програми.
//   #/                 публична начална страница (екосистема)
//   #/me               My INTNS — табло с всички програми на потребителя
//   #/program[?p=&u=]  общ портал за всяка програма (по подразбиране: текущата)
//   #/explore?p=       страница на програма + действие според достъпа
//   #/checkin[?p=&u=]  седмичен чек-ин за активната програма
//   #/join  #/login  #/account
import { createRouter } from './router.js';
import { session, initLogin } from './auth.js';
import { initHome, renderDashboard } from './home.js';
import { initPortal } from './portal.js';
import { initClient as initCheckin } from './checkin.js';
import { renderAccount } from './account.js';
import { renderExplore } from './explore.js';
import { initPricing } from './pricing.js';
import { programBy, PROGRAMS } from './programs.js';
import { seedDemo } from './progress.js';
import { statusOf, currentProgram } from './access.js';
import { toast } from './ui.js';

const user = () => session.user;

initHome();
const portal = initPortal({ user });
let checkinCtx = null;
const checkin = initCheckin({ context: () => checkinCtx });
const login = initLogin({ toast, onSuccess: () => { seedDemo(user(), PROGRAMS); paintUser(); router.go(session.takeNext() || '/me'); } });
const pricing = initPricing({ onAsk: () => router.go(user() ? '/checkin' : '/login') });

// Избира програма от параметъра ?p= или текущата активна
function resolveProgram(params) {
  const p = programBy(params.get('p'));
  if (p && statusOf(user(), p) === 'active') return p;
  if (p) return { redirect: '/explore?p=' + p.value };
  return currentProgram(user()) || { redirect: '/me' };
}

// ── Потребител в навигацията ──
function paintUser() {
  const u = user();
  document.querySelectorAll('[data-when="guest"]').forEach(el => (el.hidden = !!u));
  document.querySelectorAll('[data-when="user"]').forEach(el => (el.hidden = !u));
  document.querySelectorAll('[data-home-link]').forEach(a => a.setAttribute('href', u ? '#/me' : '#/'));
  if (u) document.querySelectorAll('[data-user-initials]').forEach(el => (el.textContent = u.initials));
}

const router = createRouter({
  routes: {
    '/':        { view: 'view-home',    title: 'INTNS | Mind, Health & Body' },
    '/me':      { view: 'view-me',      title: 'My INTNS', auth: true, onEnter: () => renderDashboard(user()) },
    '/explore': { view: 'view-explore', title: 'Програма · INTNS', onEnter: p => renderExplore(user(), p.get('p')) },
    '/program': {
      view: 'view-program', title: 'Програма · INTNS', auth: true,
      onEnter: params => {
        const p = resolveProgram(params);
        if (p.redirect) return router.go(p.redirect);
        session.remember({ lastActive: p.value });
        portal.open(p, { unit: +params.get('u') || undefined });
      },
    },
    '/checkin': {
      view: 'view-checkin', title: 'Чек-ин · INTNS', auth: true,
      onEnter: params => {
        const p = resolveProgram(params);
        if (p.redirect) return router.go(p.redirect);
        const unit = +params.get('u') || user().position[p.value];
        checkinCtx = { program: p, unit, phase: p.phases[unit - 1] };
        checkin.onEnter();
      },
    },
    '/join':    { view: 'view-join',    title: 'Записване · INTNS', onEnter: p => p.get('p') && pricing.select(p.get('p')) },
    '/login':   { view: 'view-login',   title: 'Вход · INTNS', onEnter: () => login.onEnter() },
    '/account': { view: 'view-account', title: 'Акаунт · INTNS', auth: true, onEnter: () => renderAccount(user()) },
    '/portal':  { view: 'view-program', alias: '/program' },
  },
  guard(route, path) {
    if (route.alias) return route.alias;
    if (route.auth && !user()) { session.setNext(location.hash.slice(1)); return '/login'; }
    if ((path === '/login' || path === '/') && user()) return '/me';
    return null;
  },
  onChange(route, path) {
    document.title = route.title;
    const tab = path === '/me' || path === '/' ? 'home' : path === '/checkin' ? 'checkin' : path === '/program' ? 'program'
      : path === '/join' || path === '/explore' ? 'join' : path === '/account' ? 'account' : '';
    document.querySelectorAll('[data-tab]').forEach(a => a.setAttribute('aria-current', a.dataset.tab === tab ? 'page' : 'false'));
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
