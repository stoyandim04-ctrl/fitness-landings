// Портал: седмични тренировки и материали за активната програма.
import { store, KEYS, DEMO_USER, esc } from './store.js';
import { programBy } from './programs.js';
import { toast } from './ui.js';

// Демо съдържание. При истински бекенд идва от базата за всяка програма.
const THEMES = ['Основи', 'Техника', 'Сила', 'Издръжливост', 'Възстановяване', 'Build', 'Build II', 'Пик', 'Deload', 'Сила II', 'Финален блок', 'Нов ритъм'];
const weekPlan = n => ({
  theme: THEMES[n - 1],
  workouts: [
    { id: 'w1', day: 'Ден 1', name: 'Долна част на тялото', mins: 45, kind: 'Сила' },
    { id: 'w2', day: 'Ден 2', name: 'Горна част + кор',     mins: 40, kind: 'Сила' },
    { id: 'w3', day: 'Ден 4', name: 'Цяло тяло',             mins: 35, kind: 'Кондиция' },
    { id: 'w4', day: 'Ден 6', name: 'Mobility и дишане',     mins: 20, kind: 'Mind' },
  ],
  materials: [
    { type: 'PDF',   name: `Хранителен план · седмица ${String(n).padStart(2, '0')}` },
    { type: 'Видео', name: `Техника: ${n % 2 ? 'клек и напад' : 'гребане и лицеви'}` },
    { type: 'PDF',   name: 'Списък за пазаруване' },
  ],
});

const ICONS = {
  PDF: '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
  'Видео': '<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
  lock: '<svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check: '<svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3.2" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
};

const unlockDate = n => {
  const d = new Date(DEMO_USER.startDate);
  d.setDate(d.getDate() + (n - 1) * 7);
  return d.toLocaleDateString('bg-BG', { day: 'numeric', month: 'long' });
};

export function initPortal() {
  const u = DEMO_USER;
  const prog = programBy(u.program);
  let selected = u.week;

  const pills = document.getElementById('week-pills');
  const panel = document.getElementById('week-panel');

  document.getElementById('portal-program').textContent = prog.short;
  document.getElementById('portal-week').textContent = `Седмица ${String(u.week).padStart(2, '0')} от ${u.totalWeeks}`;
  document.getElementById('portal-bar').style.width = (u.week / u.totalWeeks) * 100 + '%';

  const done = () => store.read(KEYS.progress);

  function renderPills() {
    pills.innerHTML = Array.from({ length: u.totalWeeks }, (_, i) => {
      const n = i + 1, locked = n > u.week, on = n === selected;
      const complete = !locked && (done()[n] || []).length === 4;
      return `<button type="button" role="tab" aria-selected="${on}" data-week="${n}" aria-label="Седмица ${n}${locked ? ', заключена' : ''}"
        class="relative flex h-11 min-w-[52px] shrink-0 items-center justify-center gap-1 rounded-xl border px-3 font-mono text-[12.5px] tabular-nums transition
        ${on ? 'border-gold-400/50 bg-gold-400/[0.08] text-gold-200' : locked ? 'border-white/[0.06] text-zinc-600' : 'border-white/10 text-zinc-300 hover:border-white/25 hover:text-white'}">
        ${locked ? ICONS.lock : ''}${String(n).padStart(2, '0')}
        ${complete ? '<span class="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-gold-300 text-zinc-950">' + ICONS.check + '</span>' : ''}
      </button>`;
    }).join('');
  }

  function renderWeek(animate = true) {
    const n = selected, plan = weekPlan(n), locked = n > u.week;
    const finished = done()[n] || [];
    const pct = Math.round((finished.length / plan.workouts.length) * 100);

    panel.innerHTML = locked ? `
      <div class="grid place-items-center rounded-3xl border border-dashed border-white/10 px-6 py-16 text-center">
        <span class="grid h-12 w-12 place-items-center rounded-full border border-white/10 text-zinc-500">${ICONS.lock.replace('h-3.5 w-3.5', 'h-5 w-5')}</span>
        <p class="mt-5 text-[17px] font-semibold text-white">Седмица ${String(n).padStart(2, '0')} · ${esc(plan.theme)}</p>
        <p class="mt-1.5 text-[14px] text-zinc-500">Отключва се на ${unlockDate(n)}.</p>
      </div>` : `
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="font-mono text-[10.5px] uppercase tracking-label text-zinc-500">Седмица ${String(n).padStart(2, '0')} · ${n === u.week ? 'текуща' : 'завършена'}</p>
          <h3 class="mt-1.5 text-[24px] font-semibold tracking-tight text-white">${esc(plan.theme)}</h3>
        </div>
        <p class="font-mono text-[12px] text-zinc-400"><span class="text-white">${finished.length}</span>/${plan.workouts.length} тренировки · ${pct}%</p>
      </div>
      <div class="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]"><div class="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500 transition-[width] duration-500" style="width:${pct}%"></div></div>

      <ul class="mt-6 divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10" role="list">
        ${plan.workouts.map(w => {
          const isDone = finished.includes(w.id);
          return `<li>
            <label class="flex cursor-pointer items-center gap-4 bg-zinc-950 px-4 py-4 transition hover:bg-white/[0.02] sm:px-5">
              <input type="checkbox" data-workout="${w.id}" class="peer sr-only" ${isDone ? 'checked' : ''} />
              <span class="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/15 text-transparent transition peer-checked:border-transparent peer-checked:bg-gold-300 peer-checked:text-zinc-950 peer-focus-visible:ring-2 peer-focus-visible:ring-gold-400/60">${ICONS.check}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-[15px] font-medium text-white transition peer-checked:text-zinc-500 ${isDone ? 'text-zinc-500 line-through decoration-zinc-600' : ''}">${esc(w.name)}</span>
                <span class="mt-0.5 block font-mono text-[11px] text-zinc-500">${w.day} · ${w.kind}</span>
              </span>
              <span class="shrink-0 font-mono text-[12px] tabular-nums text-zinc-400">${w.mins} мин</span>
            </label>
          </li>`;
        }).join('')}
      </ul>

      <h4 class="mt-8 font-mono text-[10.5px] uppercase tracking-label text-zinc-500">Материали</h4>
      <ul class="mt-3 grid gap-2 sm:grid-cols-3" role="list">
        ${plan.materials.map(m => `
          <li><button type="button" data-material="${esc(m.name)}" class="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3.5 text-left transition hover:border-white/20">
            <span class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-gold-300">${ICONS[m.type]}</span>
            <span class="min-w-0"><span class="block truncate text-[13.5px] text-white">${esc(m.name)}</span><span class="font-mono text-[10.5px] text-zinc-500">${m.type}</span></span>
          </button></li>`).join('')}
      </ul>`;

    if (animate) { panel.classList.remove('tab-in'); void panel.offsetWidth; panel.classList.add('tab-in'); }
  }

  pills.addEventListener('click', e => {
    const b = e.target.closest('[data-week]');
    if (!b) return;
    selected = +b.dataset.week;
    renderPills(); renderWeek();
  });
  panel.addEventListener('change', e => {
    const id = e.target.dataset.workout;
    if (!id) return;
    const all = done();
    const list = new Set(all[selected] || []);
    e.target.checked ? list.add(id) : list.delete(id);
    all[selected] = [...list];
    store.write(KEYS.progress, all);
    renderPills(); renderWeek(false);
    if (list.size === 4) toast(`Седмица ${String(selected).padStart(2, '0')} е завършена`);
  });
  panel.addEventListener('click', e => {
    const m = e.target.closest('[data-material]');
    if (m) toast(`Демо: „${m.dataset.material}“ ще се отваря тук`);
  });

  return {
    onEnter() {
      renderPills(); renderWeek(false);
      pills.querySelector(`[data-week="${selected}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest' });
    },
  };
}
