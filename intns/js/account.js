// Акаунт: профил и управление на достъпите до програмите.
import { DEMO_USER, esc } from './store.js';
import { PROGRAMS, eur } from './programs.js';

const STATUS = {
  active: { label: 'Активен',     cls: 'border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300' },
  locked: { label: 'Няма достъп', cls: 'border-white/10 bg-white/[0.03] text-zinc-400' },
  soon:   { label: 'Скоро',       cls: 'border-white/10 bg-white/[0.03] text-zinc-500' },
};

export function initAccount() {
  const u = DEMO_USER;
  document.getElementById('acc-name').textContent = u.name;
  document.getElementById('acc-email').textContent = u.email;
  document.getElementById('acc-initials').textContent = u.initials;

  document.getElementById('acc-access').innerHTML = PROGRAMS.map(p => {
    const st = STATUS[u.access[p.value]] || STATUS.locked;
    const action = u.access[p.value] === 'active'
      ? (p.value === u.program ? '<a href="#/portal" class="text-[13px] font-medium text-gold-300 hover:text-gold-200">Към портала →</a>' : '<span class="text-[13px] text-zinc-500">Закупено</span>')
      : p.stripeUrl
        ? `<a href="${esc(p.stripeUrl)}" target="_blank" rel="noopener noreferrer" class="text-[13px] font-medium text-gold-300 hover:text-gold-200">Купи · ${eur(p.price)} ↗</a>`
        : `<a href="#/join?p=${p.value}" class="text-[13px] font-medium text-zinc-300 hover:text-white">Виж повече →</a>`;
    return `
      <li class="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 sm:px-5">
        <div class="min-w-0 flex-1">
          <p class="text-[15px] font-medium text-white">${esc(p.short)}</p>
          <p class="mt-0.5 truncate text-[12.5px] text-zinc-500">${esc(p.tagline)}</p>
        </div>
        <span class="rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${st.cls}">${st.label}</span>
        <span class="w-full text-right sm:w-auto">${action}</span>
      </li>`;
  }).join('');
}
