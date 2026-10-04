// Общ портал: един двигател за всички програми (School, Academy, Маратон, Retreat…).
// Структура на всяка седмица/ден: Тренировки · Хранене · Знание · Задачи · Чек-ин.
import { esc } from './store.js';
import { toast } from './ui.js';
import { SECTIONS, buildUnit, unitLabel } from './content.js';
import { activePrograms } from './access.js';
import { doneIds, toggle, hasCheckin, unitStats, sectionCount } from './progress.js';

const ICON = {
  lock: '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check: '<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3.2" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
  doc: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19 13 11"/></svg>',
};

// Ред с отметка (тренировка, урок, задача)
const checkRow = (item, done, extra = '') => `
  <li>
    <label class="flex cursor-pointer items-center gap-4 bg-zinc-950 px-4 py-4 transition hover:bg-white/[0.02] sm:px-5">
      <input type="checkbox" data-item="${item.id}" class="peer sr-only" ${done ? 'checked' : ''} />
      <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/15 text-transparent transition peer-checked:border-transparent peer-checked:bg-gold-300 peer-checked:text-zinc-950 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400/60">${ICON.check}</span>
      <span class="min-w-0 flex-1">
        <span class="block text-[15px] font-medium ${done ? 'text-zinc-500 line-through decoration-zinc-600' : 'text-white'}">${esc(item.title)}</span>
        ${item.meta ? `<span class="mt-0.5 block font-mono text-[11px] text-zinc-500">${esc(item.meta)}</span>` : ''}
      </span>
      ${extra}
    </label>
  </li>`;

const list = rows => `<ul class="divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10" role="list">${rows}</ul>`;

export function initPortal({ user }) {
  const el = {
    switcher: document.getElementById('prog-switcher'),
    eyebrow: document.getElementById('prog-eyebrow'),
    title: document.getElementById('prog-title'),
    meta: document.getElementById('prog-meta'),
    bar: document.getElementById('prog-bar'),
    units: document.getElementById('prog-units'),
    sections: document.getElementById('prog-sections'),
    panel: document.getElementById('prog-panel'),
  };
  let program = null, unit = 1, section = 'training';
  const position = () => user().position[program.value] || 1;

  function renderHeader() {
    const act = activePrograms(user());
    el.switcher.innerHTML = act.length > 1
      ? act.map(p => `<a href="#/program?p=${p.value}" class="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[12.5px] transition ${p.value === program.value ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-200'}">${esc(p.short)}</a>`).join('')
      : '';
    el.switcher.parentElement.hidden = act.length < 2;
    el.eyebrow.textContent = program.format;
    el.title.textContent = program.short;
    const pos = position();
    el.meta.textContent = `${unitLabel(program, pos)} от ${program.length} · ${program.phases[pos - 1]}`;
    el.bar.style.width = (pos / program.length) * 100 + '%';
  }

  function renderUnits() {
    const pos = position();
    el.units.innerHTML = Array.from({ length: program.length }, (_, i) => {
      const n = i + 1, locked = n > pos, on = n === unit;
      const complete = !locked && unitStats(program, n).pct === 100;
      return `<button type="button" role="tab" aria-selected="${on}" data-unit="${n}" aria-label="${unitLabel(program, n)}${locked ? ', заключен' : ''}"
        class="relative flex h-11 min-w-[52px] shrink-0 items-center justify-center gap-1 rounded-xl border px-3 font-mono text-[12.5px] tabular-nums transition
        ${on ? 'border-gold-400/50 bg-gold-400/[0.08] text-gold-200' : locked ? 'border-white/[0.06] text-zinc-600' : 'border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'}">
        ${locked ? ICON.lock : ''}${program.unit === 'day' ? 'Д' : ''}${String(n).padStart(2, '0')}
        ${complete ? `<span class="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-gold-300 text-zinc-950">${ICON.check}</span>` : ''}
      </button>`;
    }).join('');
  }

  function renderSections() {
    const locked = unit > position();
    el.sections.parentElement.hidden = locked;
    el.sections.innerHTML = SECTIONS.map(s => {
      const c = sectionCount(program, unit, s.key);
      const on = s.key === section;
      return `<button type="button" role="tab" aria-selected="${on}" data-section="${s.key}"
        class="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] transition ${on ? 'bg-white/[0.08] text-white' : 'text-zinc-500 hover:text-zinc-200'}">
        ${s.label}${c ? `<span class="font-mono text-[10.5px] ${c[0] === c[1] ? 'text-gold-300' : 'text-zinc-600'}">${c[0]}/${c[1]}</span>` : ''}
      </button>`;
    }).join('');
  }

  function renderPanel(animate = true) {
    const n = unit, pos = position();
    const u = buildUnit(program, n);
    const done = new Set(doneIds(program.value, n));
    const stats = unitStats(program, n);
    let body;

    if (n > pos) {
      body = `
        <div class="grid place-items-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
          <span class="grid h-12 w-12 place-items-center rounded-full border border-white/10 text-zinc-500">${ICON.lock.replace('h-3.5 w-3.5', 'h-5 w-5')}</span>
          <p class="mt-5 text-[17px] font-semibold text-white">${unitLabel(program, n)} · ${esc(u.phase)}</p>
          <p class="mt-1.5 text-[14px] text-zinc-500">Отключва се, когато завършиш ${unitLabel(program, pos).toLowerCase()}.</p>
        </div>`;
    } else {
      const head = `
        <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="font-mono text-[10.5px] uppercase tracking-label text-zinc-500">${unitLabel(program, n)} · ${n === pos ? 'текуща' : 'минала'}</p>
            <h2 class="mt-1.5 text-[22px] font-semibold tracking-tight text-white">${esc(u.phase)}</h2>
          </div>
          <p class="font-mono text-[12px] text-zinc-400"><span class="text-white">${stats.pct}%</span> завършено</p>
        </div>`;

      const sectionBody = {
        training: list(u.training.map(t => checkRow(t, done.has(t.id))).join('')),
        knowledge: list(u.knowledge.map(k => checkRow(k, done.has(k.id))).join('')),
        tasks: list(u.tasks.map(t => checkRow(t, done.has(t.id))).join('')),
        nutrition: `<ul class="grid gap-2" role="list">${u.nutrition.map(f => `
          <li><button type="button" data-material="${esc(f.title)}" class="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-left transition hover:border-white/20">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-gold-300">${f.meta === 'PDF' ? ICON.doc : ICON.leaf}</span>
            <span class="min-w-0"><span class="block truncate text-[14px] text-white">${esc(f.title)}</span><span class="font-mono text-[10.5px] text-zinc-500">${f.meta}</span></span>
          </button></li>`).join('')}</ul>`,
        checkin: hasCheckin(program.value, n)
          ? `<div class="rounded-2xl border border-gold-400/20 bg-gold-400/[0.04] p-6 text-center">
               <p class="text-[16px] font-semibold text-white">Чек-инът е изпратен</p>
               <p class="mt-1.5 text-[14px] text-zinc-400">Обратната връзка от Тони ще се появи в чек-ина.</p>
             </div>`
          : `<div class="rounded-2xl border border-white/10 bg-zinc-950 p-6">
               <p class="text-[16px] font-semibold text-white">${unitLabel(program, n)}: чек-ин</p>
               <p class="mt-1.5 text-[14px] leading-relaxed text-zinc-400">Тегло, енергия, сън, снимки и кратка рефлексия. Отнема под 3 минути.</p>
               <a href="#/checkin?p=${program.value}&u=${n}" class="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-b from-gold-200 via-gold-300 to-gold-500 px-5 text-[14px] font-semibold text-zinc-950 transition hover:brightness-105">Направи чек-ин →</a>
             </div>`,
      }[section];
      body = head + sectionBody;
    }
    el.panel.innerHTML = body;
    if (animate) { el.panel.classList.remove('tab-in'); void el.panel.offsetWidth; el.panel.classList.add('tab-in'); }
  }

  const renderAll = (animate = true) => { renderHeader(); renderUnits(); renderSections(); renderPanel(animate); };

  el.units.addEventListener('click', e => {
    const b = e.target.closest('[data-unit]');
    if (!b) return;
    unit = +b.dataset.unit;
    renderUnits(); renderSections(); renderPanel();
  });
  el.sections.addEventListener('click', e => {
    const b = e.target.closest('[data-section]');
    if (!b) return;
    section = b.dataset.section;
    renderSections(); renderPanel();
  });
  el.panel.addEventListener('change', e => {
    const id = e.target.dataset.item;
    if (!id) return;
    toggle(program.value, unit, id, e.target.checked);
    renderUnits(); renderSections(); renderPanel(false);
    if (unitStats(program, unit).pct === 100) toast(`${unitLabel(program, unit)} е завършен${program.unit === 'day' ? '' : 'а'}`);
  });
  el.panel.addEventListener('click', e => {
    const m = e.target.closest('[data-material]');
    if (m) toast(`Демо: „${m.dataset.material}“ ще се отваря тук`);
  });

  return {
    // Отваря дадена програма; при смяна на програмата започва от текущата седмица/ден
    open(p, { unit: u, section: s } = {}) {
      if (program?.value !== p.value) { unit = user().position[p.value] || 1; section = 'training'; }
      program = p;
      if (u) unit = u;
      if (s) section = s;
      renderAll(false);
      el.units.querySelector(`[data-unit="${unit}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest' });
    },
    current: () => program,
  };
}
