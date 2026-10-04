// Акаунт: профил и управление на достъпите до всички програми.
import { esc } from './store.js';
import { PROGRAMS } from './programs.js';
import { statusOf, cardCta, STATUS_LABEL, STATUS_CLASS } from './access.js';

export function renderAccount(u) {
  document.getElementById('acc-name').textContent = u.name;
  document.getElementById('acc-email').textContent = u.email;
  document.getElementById('acc-initials').textContent = u.initials;

  document.getElementById('acc-access').innerHTML = PROGRAMS.map(p => {
    const st = statusOf(u, p), cta = cardCta(u, p);
    return `
      <li class="flex items-center gap-4 px-4 py-4 sm:px-5">
        <div class="min-w-0 flex-1">
          <p class="text-[15px] font-medium text-white">${esc(p.short)}</p>
          <p class="mt-0.5 truncate font-mono text-[11px] text-zinc-500">${esc(p.format)}</p>
        </div>
        <span class="hidden rounded-full border px-2.5 py-0.5 font-mono text-[11px] sm:inline ${STATUS_CLASS[st]}">${STATUS_LABEL[st]}</span>
        <a href="${cta.href}" class="shrink-0 text-[13px] font-medium ${cta.primary ? 'text-gold-300 hover:text-gold-200' : 'text-zinc-300 hover:text-white'}">${cta.label} →</a>
      </li>`;
  }).join('');
}
