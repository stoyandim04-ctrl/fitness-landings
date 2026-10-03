// Треньорски изглед: приходи (демо данни) + продукт в Stripe.
import { esc, STRIPE_3DAY_URL } from './store.js';
import { toast } from './ui.js';
import { eur } from './programs.js';

// Демо данни — сменят се с реални от Stripe API при истински бекенд.
const MONTHS = [
  { m: 'май',  v: 4820 },
  { m: 'юни',  v: 5340 },
  { m: 'юли',  v: 6110 },
  { m: 'авг',  v: 5870 },
  { m: 'сеп',  v: 6538.6 },
  { m: 'окт',  v: 1980, partial: true },
];
const PROGRAMS = [
  { name: 'INTNS Academy',            clients: 5,  revenue: 3960 },
  { name: 'INTNS School',             clients: 12, revenue: 2160 },
  { name: '3-дневна програма',         clients: 14, revenue: 418.6, tag: 'Pre-order' },
];
const PAYMENTS = [
  { who: 'Калина Илиева',   what: '3-дневна програма', amount: 29.9, ago: 'преди 2 ч',  kind: 'preorder' },
  { who: 'Стефан Василев',  what: 'INTNS Academy',     amount: 790, ago: 'вчера',      kind: 'paid' },
  { who: 'Никол Стоянова',  what: 'INTNS School',      amount: 180, ago: 'вчера',      kind: 'paid' },
  { who: 'Рая Маринова',    what: '3-дневна програма', amount: 29.9, ago: 'преди 2 д',  kind: 'preorder' },
  { who: 'Иван Георгиев',   what: 'INTNS Academy',     amount: 790, ago: 'преди 3 д',  kind: 'paid' },
];


export function initRevenue() {
  let rendered = false;

  function renderChart() {
    const wrap = document.getElementById('rev-chart');
    const max = Math.ceil(Math.max(...MONTHS.map(d => d.v)) / 2000) * 2000; // чиста горна граница
    const ticks = [0, max / 2, max];
    const peak = MONTHS.reduce((a, b) => (b.v > a.v ? b : a));

    wrap.innerHTML = `
      <div class="relative h-48 pl-10">
        ${ticks.map(t => `
          <div class="pointer-events-none absolute left-10 right-0 border-t border-white/[0.05]" style="bottom:${(t / max) * 100}%">
            <span class="absolute -left-10 -translate-y-1/2 font-mono text-[10px] text-zinc-600">${t / 1000}k</span>
          </div>`).join('')}
        <div class="relative flex h-full items-end gap-[2px]">
          ${MONTHS.map((d, i) => `
            <div class="group relative flex h-full flex-1 items-end justify-center" tabindex="0"
                 aria-label="${d.m}: ${eur(d.v)}${d.partial ? ' (до днес)' : ''}">
              <div class="w-full max-w-[44px] rounded-t-[4px] transition-colors duration-200 ${d.partial
                ? 'bg-[repeating-linear-gradient(135deg,rgba(212,180,110,.55)_0_3px,rgba(212,180,110,.2)_3px_6px)]'
                : 'bg-gold-400/80 group-hover:bg-gold-300 group-focus:bg-gold-300'}"
                   style="height:${(d.v / max) * 100}%"></div>
              ${d === peak ? `<span class="pointer-events-none absolute font-mono text-[10.5px] text-zinc-300" style="bottom:calc(${(d.v / max) * 100}% + 6px)">${(d.v / 1000).toFixed(1)}k</span>` : ''}
              <div role="tooltip" class="pointer-events-none absolute z-10 ${i === 0 ? 'left-0' : i === MONTHS.length - 1 ? 'right-0' : ''} whitespace-nowrap rounded-lg border border-white/10 bg-zinc-900/95 px-2.5 py-1.5 text-[12px] opacity-0 shadow-xl transition group-hover:opacity-100 group-focus:opacity-100"
                   style="bottom:calc(${(d.v / max) * 100}% + 26px)">
                <span class="text-zinc-400">${d.m}${d.partial ? ' · до днес' : ''}</span>
                <span class="ml-1.5 font-medium tabular-nums text-white">${eur(d.v)}</span>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div class="mt-2 flex gap-[2px] pl-10">
        ${MONTHS.map(d => `<span class="flex-1 text-center font-mono text-[10.5px] ${d.partial ? 'text-zinc-500' : 'text-zinc-400'}">${d.m}</span>`).join('')}
      </div>
      <table class="sr-only"><caption>Приходи по месеци</caption>
        <tbody>${MONTHS.map(d => `<tr><th>${d.m}</th><td>${eur(d.v)}</td></tr>`).join('')}</tbody>
      </table>`;
  }

  function renderPrograms() {
    const top = Math.max(...PROGRAMS.map(p => p.revenue));
    const total = PROGRAMS.reduce((s, p) => s + p.revenue, 0);
    document.getElementById('rev-programs').innerHTML = PROGRAMS.map(p => `
      <tr class="border-t border-white/[0.06]">
        <th scope="row" class="py-3 pr-3 text-left font-normal">
          <span class="text-[13.5px] text-white">${esc(p.name)}</span>
          ${p.tag ? `<span class="ml-1.5 rounded-full border border-gold-400/25 bg-gold-400/[0.08] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-gold-300">${p.tag}</span>` : ''}
          <div class="mt-1.5 h-1 rounded-full bg-white/[0.05]"><div class="h-full rounded-full bg-gold-400/70" style="width:${(p.revenue / top) * 100}%"></div></div>
        </th>
        <td class="py-3 pr-3 text-right font-mono text-[12.5px] tabular-nums text-zinc-400">${p.clients}</td>
        <td class="py-3 text-right font-mono text-[12.5px] tabular-nums text-zinc-200">${eur(p.revenue)}</td>
      </tr>`).join('') + `
      <tr class="border-t border-white/10">
        <th scope="row" class="pt-3 text-left font-mono text-[10.5px] uppercase tracking-wider text-zinc-500">Общо</th>
        <td></td>
        <td class="pt-3 text-right font-mono text-[13px] font-medium tabular-nums text-white">${eur(total)}</td>
      </tr>`;
  }

  function renderPayments() {
    document.getElementById('rev-payments').innerHTML = PAYMENTS.map(p => `
      <li class="flex items-center gap-3 py-3">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/[0.05] text-[11px] font-semibold text-zinc-300">${esc(p.who.split(' ').map(w => w[0]).join(''))}</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13.5px] text-white">${esc(p.who)}</p>
          <p class="truncate font-mono text-[11px] text-zinc-500">${esc(p.what)} · ${p.ago}</p>
        </div>
        <div class="text-right">
          <p class="font-mono text-[13px] tabular-nums text-zinc-100">+${eur(p.amount)}</p>
          <p class="mt-0.5 inline-flex items-center gap-1 font-mono text-[10.5px] ${p.kind === 'paid' ? 'text-emerald-300' : 'text-gold-300'}">
            ${p.kind === 'paid'
              ? '<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>Платено'
              : '<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 2"/></svg>Pre-order'}
          </p>
        </div>
      </li>`).join('');
  }

  // Копиране на Stripe линка за изпращане към клиент
  document.getElementById('copy-stripe').addEventListener('click', async e => {
    const btn = e.currentTarget;
    try {
      await navigator.clipboard.writeText(STRIPE_3DAY_URL);
      toast('Stripe линкът е копиран');
      btn.querySelector('[data-label]').textContent = 'Копирано';
      setTimeout(() => (btn.querySelector('[data-label]').textContent = 'Копирай линка'), 1800);
    } catch {
      prompt('Копирай линка:', STRIPE_3DAY_URL);
    }
  });

  return {
    onEnter() {
      if (rendered) return;
      renderChart(); renderPrograms(); renderPayments();
      rendered = true;
    },
  };
}
