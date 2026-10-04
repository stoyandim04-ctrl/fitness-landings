// Страница на програма (публична): какво включва, структура и правилното действие според достъпа.
import { esc } from './store.js';
import { programBy, eur } from './programs.js';
import { statusOf, mainCta, STATUS_LABEL, STATUS_CLASS } from './access.js';
import { SECTIONS } from './content.js';

const PILLAR_TEXT = {
  training:  'Тренировки за всяка седмица — ясни, с продължителност и фокус.',
  nutrition: 'Хранителни насоки и план, без крайни диети.',
  knowledge: 'Кратки уроци: защо правиш това, което правиш.',
  tasks:     'Малки навици, които се натрупват.',
  checkin:   'Седмичен отчет със снимки и обратна връзка.',
};

export function renderExplore(user, value) {
  const p = programBy(value) || programBy('school');
  const st = user ? statusOf(user, p) : (p.available ? null : 'soon');
  const cta = mainCta(user, p);
  const word = p.unit === 'day' ? 'дни' : 'седмици';

  document.getElementById('explore-body').innerHTML = `
    <p class="font-mono text-[11px] uppercase tracking-label text-gold-400/90">${esc(p.format)}</p>
    <div class="mt-3 flex flex-wrap items-center gap-3">
      <h1 class="text-[34px] font-semibold leading-tight tracking-tight text-white sm:text-[44px]">${esc(p.short)}</h1>
      ${st ? `<span class="rounded-full border px-2.5 py-0.5 font-mono text-[11px] ${STATUS_CLASS[st]}">${STATUS_LABEL[st]}</span>` : ''}
    </div>
    <p class="mt-2 text-[17px] text-zinc-300">${esc(p.title)}</p>
    <p class="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">${esc(p.description)}</p>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <a href="${esc(cta.href)}" ${cta.external ? 'target="_blank" rel="noopener noreferrer"' : ''}
        class="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-gold-200 via-gold-300 to-gold-500 px-6 text-[14px] font-semibold text-zinc-950 shadow-[0_1px_0_0_rgba(255,255,255,.5)_inset,0_12px_36px_-14px_rgba(212,180,110,.6)] transition hover:-translate-y-0.5">
        ${cta.label}${cta.stripe ? ' · ' + eur(p.price) : ''} ${cta.external ? '↗' : '→'}
      </a>
      ${!user && st !== 'soon' ? '<a href="#/login" class="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 px-6 text-[14px] text-zinc-200 transition hover:border-white/25">Вече имаш достъп? Влез</a>' : ''}
    </div>
    ${cta.stripe ? '<p class="mt-3 font-mono text-[11px] text-zinc-500">Еднократно плащане · сигурно през Stripe</p>' : ''}

    <section class="mt-14" aria-labelledby="ex-struct">
      <div class="flex items-baseline justify-between">
        <h2 id="ex-struct" class="text-[18px] font-semibold text-white">Структура</h2>
        <span class="font-mono text-[11px] text-zinc-500">${p.length} ${word}</span>
      </div>
      <ol class="mt-4 flex gap-1" aria-label="${p.length} ${word}">
        ${p.phases.map((ph, i) => `<li class="group relative h-8 flex-1 rounded-md border border-white/[0.07] bg-white/[0.02]" title="${String(i + 1).padStart(2, '0')} · ${esc(ph)}"><span class="sr-only">${esc(ph)}</span></li>`).join('')}
      </ol>
      <p class="mt-3 text-[13px] text-zinc-500">${p.phases.slice(0, 4).map(esc).join(' → ')}${p.phases.length > 4 ? ' → …' : ''}</p>
    </section>

    <section class="mt-12" aria-labelledby="ex-inside">
      <h2 id="ex-inside" class="text-[18px] font-semibold text-white">Всяка ${p.unit === 'day' ? 'ден' : 'седмица'} включва</h2>
      <ul class="mt-4 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] sm:grid-cols-2" role="list">
        ${SECTIONS.map((s, i) => `<li class="bg-zinc-950 p-5 ${i === SECTIONS.length - 1 ? 'sm:col-span-2' : ''}"><p class="text-[15px] font-medium text-white">${s.label}</p><p class="mt-1 text-[13.5px] leading-relaxed text-zinc-500">${PILLAR_TEXT[s.key]}</p></li>`).join('')}
      </ul>
    </section>`;
}
