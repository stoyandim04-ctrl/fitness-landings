// Минимален hash рутер с плавна смяна на изгледите.
//   #/          → начало (Brand Hub)        #/join[?p=]  → записване и плащане
//   #/login     → вход                      #/portal     → програма по седмици
//   #/checkin   → седмичен чек-ин           #/account    → профил и достъпи
import { prefersReducedMotion } from './ui.js';

const DURATION = 260;

export function createRouter({ routes, guard, onChange }) {
  let currentView = null;
  let token = 0;

  function parse() {
    const [path, qs = ''] = (location.hash.replace(/^#/, '') || '/').split('?');
    return { path: routes[path] ? path : '/', params: new URLSearchParams(qs) };
  }

  async function swap(nextEl) {
    const my = ++token;
    if (currentView === nextEl) return;
    const prev = currentView;
    currentView = nextEl;
    const fast = prefersReducedMotion();

    if (prev) {
      prev.dataset.state = 'leaving';
      if (!fast) await new Promise(r => setTimeout(r, DURATION));
      if (my !== token) return;
      prev.hidden = true;
      prev.dataset.state = '';
    }
    nextEl.hidden = false;
    nextEl.dataset.state = 'entering';
    window.scrollTo(0, 0);
    // два кадъра, за да тръгне transition-ът от началното състояние
    requestAnimationFrame(() => requestAnimationFrame(() => { if (my === token) nextEl.dataset.state = 'active'; }));
  }

  async function resolve() {
    const { path, params } = parse();
    const route = routes[path];
    const redirect = guard(route, path);
    if (redirect && redirect !== path) { location.replace('#' + redirect); return; }
    const el = document.getElementById(route.view);
    onChange(route, path);
    await swap(el);
    route.onEnter?.(params);
  }

  return {
    start() { window.addEventListener('hashchange', resolve); resolve(); },
    go(path) { if (location.hash === '#' + path) resolve(); else location.hash = path; },
  };
}
