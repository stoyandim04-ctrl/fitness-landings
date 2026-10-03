// Входна точка: сесия, рутер, споделен хедър.
import { store, KEYS, USERS } from './store.js';
import { createRouter } from './router.js';
import { initClient } from './client.js';
import { initCoach } from './coach.js';
import { initRevenue } from './revenue.js';

const session = {
  get role() { return store.read(KEYS.session).role || null; },
  login(role) { store.write(KEYS.session, { role, at: new Date().toISOString() }); },
  logout() { store.remove(KEYS.session); },
};

const home = { client: '/client', coach: '/coach' };
let activeView = null;

const client = initClient();
const coach = initCoach({ isActive: () => activeView === 'view-coach' });
const revenue = initRevenue();

// ── Хедър според ролята ──
const header = document.getElementById('app-header');
function paintHeader(route, path) {
  const role = route.role;
  header.hidden = !role;
  if (!role) return;
  const u = USERS[role];
  header.querySelector('[data-context]').textContent = role === 'coach' ? 'COACH' : 'CHECK-IN';
  header.querySelector('[data-width]').className = header.querySelector('[data-width]').className
    .replace(/max-w-\S+/, role === 'coach' ? 'max-w-6xl' : 'max-w-xl');
  header.querySelector('[data-user-name]').textContent = u.name;
  header.querySelector('[data-user-meta]').textContent = u.meta;
  const av = header.querySelector('[data-user-avatar]');
  av.innerHTML = u.avatar
    ? `<img src="${u.avatar}" alt="" class="h-full w-full rounded-full object-cover" />`
    : u.initials;
  document.querySelectorAll('[data-coach-nav]').forEach(n => (n.hidden = role !== 'coach'));
  document.querySelectorAll('[data-tab-link]').forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + path ? 'page' : 'false'));
  document.title = role === 'coach' ? 'INTNS // Coach' : 'INTNS // Check-in';
}

// ── Табове в треньорския изглед ──
function showCoachTab(name) {
  document.querySelectorAll('[data-coach-tab]').forEach(p => {
    const on = p.dataset.coachTab === name;
    p.hidden = !on;
    if (on) { p.classList.remove('tab-in'); void p.offsetWidth; p.classList.add('tab-in'); }
  });
}

const router = createRouter({
  routes: {
    '/':              { view: 'view-auth' },
    '/client':        { view: 'view-client', role: 'client', onEnter: () => client.onEnter() },
    '/coach':         { view: 'view-coach',  role: 'coach',  onEnter: () => { showCoachTab('checkins'); coach.onEnter(); } },
    '/coach/revenue': { view: 'view-coach',  role: 'coach',  onEnter: () => { showCoachTab('revenue'); revenue.onEnter(); } },
  },
  guard(route) {
    const role = session.role;
    if (!route.role) return role ? home[role] : null;   // логнат → към своя изглед
    if (route.role !== role) return '/';                // чужда роля → вход
    return null;
  },
  onChange(route, path) { activeView = route.view; paintHeader(route, path); },
});

// ── Вход ──
document.querySelectorAll('[data-login]').forEach(card => card.addEventListener('click', () => {
  if (card.dataset.busy) return;
  card.dataset.busy = '1';
  card.setAttribute('aria-busy', 'true');
  setTimeout(() => {                       // имитира автентикация
    session.login(card.dataset.login);
    delete card.dataset.busy;
    card.removeAttribute('aria-busy');
    router.go(home[card.dataset.login]);
  }, 650);
}));

// ── Изход / смяна на роля ──
function logout() { session.logout(); router.go('/'); }
document.querySelectorAll('[data-logout]').forEach(b => b.addEventListener('click', logout));
document.querySelectorAll('[data-switch-role]').forEach(b => b.addEventListener('click', e => {
  e.preventDefault();
  session.login(b.dataset.switchRole);
  router.go(home[b.dataset.switchRole]);
}));

router.start();
