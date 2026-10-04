// Начална страница: карти за направленията на INTNS.
import { PROGRAMS, eur } from './programs.js';
import { esc } from './store.js';

const ARROW = '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';

export function initHome() {
  const grid = document.getElementById('hub-programs');
  // Подредба на картите: маратонът е входната точка, после School → Academy → Retreat
  const [marathon, ...rest] = PROGRAMS;

  grid.innerHTML = `
    <li class="sm:col-span-2 lg:row-span-2 lg:col-span-1">
      <a href="#/join?p=${marathon.value}" class="card group relative flex h-full flex-col overflow-hidden rounded-3xl border border-gold-400/25 bg-zinc-950 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-gold-400/50 sm:p-6">
        <span class="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" aria-hidden="true"></span>
        <div class="flex items-center justify-between">
          <span class="font-mono text-[10.5px] uppercase tracking-label text-gold-300">01 · Отворено</span>
          <span class="rounded-full border border-gold-400/25 bg-gold-400/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gold-300">Pre-order</span>
        </div>
        <img src="${esc(marathon.image)}" alt="" width="360" height="360" class="mt-5 aspect-square w-full max-w-[260px] rounded-2xl object-cover ring-1 ring-white/10 sm:max-w-[220px] lg:max-w-none" />
        <h3 class="mt-6 text-[24px] font-semibold tracking-tight text-white">${esc(marathon.short)}</h3>
        <p class="mt-1 text-[14px] text-zinc-400">„${esc(marathon.title)}“</p>
        <div class="mt-auto flex items-end justify-between gap-3 pt-6">
          <p class="text-[26px] font-semibold tabular-nums text-white">${eur(marathon.price)}</p>
          <span class="inline-flex items-center gap-1.5 text-[13px] font-medium text-gold-200 transition group-hover:gap-2.5">Запиши се ${ARROW}</span>
        </div>
      </a>
    </li>
    ${rest.map((p, i) => `
    <li class="${i === rest.length - 1 ? 'sm:col-span-2' : ''}">
      <a href="#/join?p=${p.value}" class="card group flex h-full flex-col rounded-3xl border border-white/10 bg-zinc-950 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 sm:p-6">
        <span class="font-mono text-[10.5px] uppercase tracking-label text-zinc-500">0${i + 2} · ${p.stripeUrl ? 'Отворено' : 'Скоро'}</span>
        <h3 class="mt-8 text-[22px] font-semibold tracking-tight text-white">${esc(p.short)}</h3>
        <p class="mt-2 text-[14px] leading-relaxed text-zinc-400">${esc(p.description)}</p>
        <span class="mt-auto inline-flex items-center gap-1.5 pt-6 text-[13px] font-medium text-zinc-300 transition group-hover:gap-2.5 group-hover:text-white">Научи повече ${ARROW}</span>
      </a>
    </li>`).join('')}`;
}
