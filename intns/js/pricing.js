// Ценова секция „Избери своя следващ етап“ (порт на Pricing компонента:
// превключвател на програмите + анимирана смяна на картата).
import { PROGRAMS, eur } from './programs.js';
import { esc } from './store.js';
import { prefersReducedMotion } from './ui.js';

const ICON_CHECK = '<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3.2" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';
const ICON_UPRIGHT = '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>';

function cardHTML(p) {
  const priceBlock = p.price != null
    ? `<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
         <span class="whitespace-nowrap text-[44px] font-semibold leading-none tracking-tight tabular-nums text-white sm:text-[52px]">${eur(p.price)}</span>
         <span class="text-[15px] text-zinc-500">/ ${esc(p.period)}</span>
       </div>
       <p class="mt-2 font-mono text-[11px] text-gold-300/90">${esc(p.note)}</p>`
    : `<div class="text-[40px] font-semibold leading-none tracking-tight text-zinc-300">Скоро</div>
       <p class="mt-2 font-mono text-[11px] text-zinc-500">Записванията отварят скоро</p>`;

  const cta = p.stripeUrl
    ? `<a href="${esc(p.stripeUrl)}" target="_blank" rel="noopener noreferrer"
          class="group relative flex h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b from-gold-200 via-gold-300 to-gold-500 text-[13px] font-semibold tracking-[0.04em] text-zinc-950 shadow-[0_1px_0_0_rgba(255,255,255,.5)_inset,0_12px_36px_-14px_rgba(212,180,110,.6)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_1px_0_0_rgba(255,255,255,.6)_inset,0_18px_44px_-12px_rgba(212,180,110,.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-200 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:translate-y-0 active:scale-[0.99]">
         <span class="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/40 opacity-0 blur-md transition-all duration-700 ease-out group-hover:left-[110%] group-hover:opacity-100" aria-hidden="true"></span>
         <span class="relative">${esc(p.cta)}</span>
         <span class="relative transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">${ICON_UPRIGHT}</span>
         <span class="sr-only">(отваря Stripe в нов раздел)</span>
       </a>`
    : `<button type="button" disabled class="flex h-[52px] w-full cursor-not-allowed items-center justify-center rounded-xl border border-white/10 text-[13px] font-medium text-zinc-500">Очаквай скоро</button>`;

  return `
    <div class="rounded-[22px] bg-zinc-950 p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,.9)] sm:p-7">
      <div class="flex gap-4">
        ${p.image ? `<img src="${esc(p.image)}" alt="" width="360" height="360" class="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10" />` : ''}
        <div class="min-w-0">
          <p class="font-mono text-[10.5px] uppercase tracking-label text-zinc-500">${esc(p.name)}</p>
          <h3 class="mt-1.5 text-[19px] font-semibold leading-snug text-white">${esc(p.title)}</h3>
        </div>
      </div>
      <p class="mt-4 text-[14px] leading-relaxed text-zinc-400">${esc(p.description)}</p>

      <div class="mt-6">${priceBlock}</div>
      <div class="mt-6">${cta}</div>

      <div class="my-6 h-px bg-white/[0.07]" aria-hidden="true"></div>

      <ul class="flex flex-col gap-3" role="list">
        ${p.features.map(f => `
          <li class="flex items-start gap-3">
            <span class="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-b from-gold-200 to-gold-500 text-zinc-950">${ICON_CHECK}</span>
            <span class="text-[14px] text-zinc-300">${esc(f)}</span>
          </li>`).join('')}
      </ul>
    </div>`;
}

export function initPricing({ onAsk } = {}) {
  const root = document.getElementById('pricing');
  if (!root) return;
  const tabs = root.querySelector('[data-pricing-tabs]');
  const card = root.querySelector('[data-pricing-card]');
  let selected = (PROGRAMS.find(p => p.stripeUrl) || PROGRAMS[0]).value;
  let busy = null;

  tabs.innerHTML = PROGRAMS.map(p => `
    <button type="button" role="radio" data-value="${p.value}" aria-checked="${p.value === selected}" tabindex="${p.value === selected ? 0 : -1}"
      class="min-w-[86px] rounded-full px-4 py-2 text-[13px] font-medium text-zinc-500 transition duration-200 hover:text-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 aria-checked:bg-zinc-900 aria-checked:text-white aria-checked:shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_1px_2px_rgba(0,0,0,.6)] sm:min-w-[100px] sm:px-5">${p.label}</button>`).join('');

  const draw = () => { card.innerHTML = cardHTML(PROGRAMS.find(p => p.value === selected)); };

  // exit → смяна → enter (пружина), като AnimatePresence mode="wait"
  function select(value) {
    if (value === selected) return;
    selected = value;
    tabs.querySelectorAll('[role=radio]').forEach(b => {
      const on = b.dataset.value === value;
      b.setAttribute('aria-checked', on);
      b.tabIndex = on ? 0 : -1;
    });
    if (prefersReducedMotion()) { draw(); return; }
    clearTimeout(busy);
    card.dataset.anim = 'exit';
    busy = setTimeout(() => {
      draw();
      card.dataset.anim = 'init';
      void card.offsetWidth;
      card.dataset.anim = 'in';
    }, 150);
  }

  tabs.addEventListener('click', e => { const b = e.target.closest('[role=radio]'); if (b) select(b.dataset.value); });
  tabs.addEventListener('keydown', e => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    const i = PROGRAMS.findIndex(p => p.value === selected);
    const next = PROGRAMS[(i + (e.key === 'ArrowRight' ? 1 : -1) + PROGRAMS.length) % PROGRAMS.length];
    select(next.value);
    tabs.querySelector(`[data-value="${next.value}"]`).focus();
  });
  root.querySelector('[data-ask]')?.addEventListener('click', () => onAsk?.());

  draw();
  return { select };
}
