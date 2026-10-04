// Ниво екосистема: публична начална страница и таблото „My INTNS“ след вход.
import { esc } from './store.js';
import { PROGRAMS, eur } from './programs.js';
import { statusOf, cardCta, currentProgram, STATUS_LABEL, STATUS_CLASS } from './access.js';
import { unitStats } from './progress.js';
import { unitLabel } from './content.js';

const ARROW = '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';
const pad = n => String(n).padStart(2, '0');

// Карта на програма — еднаква за всички направления, разлика само в статуса и действието
function programCard(user, p, i, { current = false } = {}) {
  const st = user ? statusOf(user, p) : (p.available ? null : 'soon');
  const cta = cardCta(user, p);
  const pos = user && st === 'active' ? user.position[p.value] : null;
  return `
    <li>
      <article class="card group relative flex h-full flex-col rounded-3xl border ${current ? 'border-gold-400/30' : 'border-white/10'} bg-zinc-950 p-5 transition duration-300 hover:border-white/20 sm:p-6">
        ${current ? '<span class="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/60 to-transparent" aria-hidden="true"></span>' : ''}
        <div class="flex items-center justify-between gap-3">
          <span class="font-mono text-[10.5px] uppercase tracking-label text-zinc-500">${pad(i + 1)}</span>
          ${st ? `<span class="rounded-full border px-2 py-0.5 font-mono text-[10.5px] ${STATUS_CLASS[st]}">${current ? 'Текуща' : STATUS_LABEL[st]}</span>` : ''}
        </div>
        <h3 class="mt-8 text-[22px] font-semibold tracking-tight text-white">${esc(p.short)}</h3>
        <p class="mt-1 font-mono text-[11px] text-zinc-500">${esc(p.format)}${p.price ? ' · ' + eur(p.price) : ''}</p>
        <p class="mt-3 text-[14px] leading-relaxed text-zinc-400">${esc(p.description)}</p>
        ${pos ? `<div class="mt-5">
          <div class="flex justify-between font-mono text-[10.5px] text-zinc-500"><span>${unitLabel(p, pos)} от ${p.length}</span><span>${unitStats(p, pos).pct}%</span></div>
          <div class="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><div class="h-full rounded-full bg-gold-400/80" style="width:${(pos / p.length) * 100}%"></div></div>
        </div>` : ''}
        <a href="${cta.href}" class="mt-auto inline-flex items-center gap-1.5 pt-6 text-[13.5px] font-medium transition hover:gap-2.5 ${cta.primary ? 'text-gold-200' : 'text-zinc-300 hover:text-white'}">
          ${cta.label} ${ARROW}<span class="sr-only"> — ${esc(p.short)}</span>
        </a>
      </article>
    </li>`;
}

export function initHome() {
  // Публична страница: четирите направления като равни части
  document.getElementById('hub-programs').innerHTML = PROGRAMS.map((p, i) => programCard(null, p, i)).join('');
  document.getElementById('hub-scroll').addEventListener('click', () =>
    document.getElementById('hub-title').scrollIntoView({ behavior: 'smooth', block: 'start' }));
}

export function renderDashboard(user) {
  document.getElementById('me-name').textContent = user.short;
  const cur = currentProgram(user);
  const primary = document.getElementById('me-primary');

  if (cur) {
    const pos = user.position[cur.value];
    const s = unitStats(cur, pos);
    primary.innerHTML = `
      <div class="card relative overflow-hidden rounded-3xl border border-gold-400/25 bg-zinc-950 p-5 sm:p-7">
        <span class="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" aria-hidden="true"></span>
        <span class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gold-400/[0.07] blur-3xl" aria-hidden="true"></span>
        <div class="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-mono text-[10.5px] uppercase tracking-label text-gold-300">Продължи оттам, докъдето стигна</p>
            <h2 class="mt-3 text-[26px] font-semibold tracking-tight text-white sm:text-[30px]">${esc(cur.short)}</h2>
            <p class="mt-1 font-mono text-[11.5px] text-zinc-500">${unitLabel(cur, pos)} от ${cur.length} · ${esc(cur.phases[pos - 1])}</p>
          </div>
          <div class="text-right">
            <p class="text-[30px] font-semibold tabular-nums text-white">${s.pct}%</p>
            <p class="font-mono text-[10.5px] text-zinc-500">${cur.unit === 'day' ? 'от деня' : 'от седмицата'}</p>
          </div>
        </div>
        <div class="relative mt-5 h-1 overflow-hidden rounded-full bg-white/[0.06]"><div class="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style="width:${s.pct}%"></div></div>
        <p class="relative mt-4 text-[14px] text-zinc-400">${s.next ? `Следва: <span class="text-zinc-200">${esc(s.next)}</span>` : 'Всичко за този период е завършено.'}</p>
        <div class="relative mt-6 flex flex-col gap-2 sm:flex-row">
          <a href="#/program?p=${cur.value}" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-200 via-gold-300 to-gold-500 px-5 text-[14px] font-semibold text-zinc-950 transition hover:brightness-105">Продължи ${ARROW}</a>
          <a href="#/checkin?p=${cur.value}" class="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-[14px] text-zinc-200 transition hover:border-white/25 hover:text-white">Чек-ин</a>
        </div>
      </div>`;
  } else {
    primary.innerHTML = `
      <div class="rounded-3xl border border-dashed border-white/10 p-7 text-center">
        <p class="text-[17px] font-semibold text-white">Още нямаш активна програма</p>
        <p class="mt-1.5 text-[14px] text-zinc-500">Разгледай направленията по-долу и избери своето.</p>
      </div>`;
  }

  document.getElementById('me-programs').innerHTML =
    PROGRAMS.map((p, i) => programCard(user, p, i, { current: p === cur })).join('');
}
