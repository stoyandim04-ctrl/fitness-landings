// Треньорски изглед: чек-ини на клиентите + Quick View.
import { store, KEYS, esc } from './store.js';
import { toast } from './ui.js';

export function initCoach({ isActive }) {
  const hoursAgo = h => new Date(Date.now() - h * 36e5).toISOString();

  // ── Демо данни (седмица 06). Снимките са placeholder силуети. ──
  const SEED = [
    { id: 'maria-p',  name: 'Мария Петрова',    program: 'Academy', week: 6,  weight: 68.6, prev: 69.3, energy: 7, sleep: 6, sleepHours: '7–8', avg: [6.5, 5.8], photos: 3, hours: 1.2,  wantsCall: false, reviewed: false,
      reflection: 'Mind: по-спокойна съм тази седмица, медитацията сутрин помага.\nBody: силова 4/4, клек 60 кг × 5.\nПобеда на седмицата: без сладко 6 от 7 дни.' },
    { id: 'elena-d',  name: 'Елена Димитрова',  program: 'School',  week: 4,  weight: 74.2, prev: 75.6, energy: 8, sleep: 8, sleepHours: '7–8', avg: [7.0, 7.3], photos: 3, hours: 3,    wantsCall: false, reviewed: false,
      reflection: 'Най-добрата седмица досега. Хапвам по-рано вечер и спя като бебе.' },
    { id: 'ivan-g',   name: 'Иван Георгиев',    program: 'Academy', week: 9,  weight: 88.1, prev: 87.6, energy: 4, sleep: 3, sleepHours: '5–6', avg: [6.3, 5.5], photos: 2, hours: 5,    wantsCall: true,  reviewed: false,
      reflection: 'Тежка седмица в работата, два пъти пропуснах тренировка. Чувствам се изцеден.' },
    { id: 'nikol-s',  name: 'Никол Стоянова',   program: 'School',  week: 2,  weight: 61.8, prev: 62.4, energy: 6, sleep: 7, sleepHours: '7–8', avg: [6.0, 6.5], photos: 3, hours: 8,    wantsCall: false, reviewed: false,
      reflection: 'Още свиквам с режима. Мускулна треска след краката, но е приятна.' },
    { id: 'viktor-a', name: 'Виктор Ангелов',   program: 'Academy', week: 11, weight: 81.4, prev: 82.0, energy: 9, sleep: 8, sleepHours: '8+',  avg: [8.0, 7.5], photos: 3, hours: 14,   wantsCall: false, reviewed: true,
      reflection: 'Готов съм за финалния блок. Лежанка 100 кг × 3!' },
    { id: 'gabi-k',   name: 'Габриела Колева',  program: 'School',  week: 6,  weight: 57.9, prev: 58.0, energy: 5, sleep: 5, sleepHours: '6–7', avg: [6.0, 6.0], photos: 0, hours: 20,   wantsCall: false, reviewed: false,
      reflection: 'Тази седмица без снимки, бях на път. Храненето — 80% по плана.' },
    { id: 'dimitar-t',name: 'Димитър Тодоров',  program: 'School',  week: 7,  weight: 95.3, prev: 96.9, energy: 7, sleep: 6, sleepHours: '6–7', avg: [6.5, 5.8], photos: 3, hours: 26,   wantsCall: false, reviewed: true,
      reflection: 'Минах под 96! Стъпките ми са средно 11k.' },
    { id: 'raya-m',   name: 'Рая Маринова',     program: 'Academy', week: 3,  weight: 66.0, prev: 66.1, energy: 3, sleep: 4, sleepHours: '< 5', avg: [5.0, 5.3], photos: 1, hours: 30,   wantsCall: true,  reviewed: false,
      reflection: 'Не спя добре, тревожна съм. Искам да говорим.' },
    { id: 'stefan-v', name: 'Стефан Василев',   program: 'Academy', week: 5,  weight: 78.8, prev: 79.9, energy: 8, sleep: 7, sleepHours: '7–8', avg: [7.3, 6.8], photos: 3, hours: 40,   wantsCall: false, reviewed: true,
      reflection: 'Всичко по плана. Добавих кардио в почивните дни.' },
  ];
  const MISSING = [
    { name: 'Калина Илиева', program: 'School' },
    { name: 'Петър Николов', program: 'Academy' },
    { name: 'Цвета Русева',  program: 'School' },
  ];

  // Placeholder снимка: тъмен градиент + силует (front/side/back)
  function placeholder(view, seed) {
    const hue = 30 + (seed * 37) % 40;
    const body = {
      front: '<circle cx="60" cy="38" r="12"/><path d="M42 58q18-8 36 0l4 46h-8l-2 58h-10l-2-40-2 40H48l-2-58h-8z"/>',
      side:  '<circle cx="60" cy="38" r="12"/><path d="M52 56q14-4 18 6l2 42h-6l-2 58H54l-2-58h-6z"/>',
      back:  '<circle cx="60" cy="38" r="12"/><path d="M42 58q18-8 36 0l4 46h-8l-2 58h-10l-2-40-2 40H48l-2-58h-8z"/><path d="M60 54v40" stroke="#000" stroke-opacity=".35" stroke-width="2"/>',
    }[view];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 180"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${hue},18%,16%)"/><stop offset="1" stop-color="hsl(${hue},10%,6%)"/></linearGradient></defs><rect width="120" height="180" fill="url(#g)"/><g fill="hsl(${hue},30%,70%)" fill-opacity=".22">${body}</g></svg>`;
    return 'data:image/svg+xml,' + encodeURIComponent(svg);
  }

  const VIEWS = [['front', 'Предна'], ['side', 'Странична'], ['back', 'Задна']];

  // ── Сглобяване: демо + реален чек-ин от клиентската страница ──
  let clients = [];
  function load() {
    const live = store.read(KEYS.checkins);
    const feedback = store.read(KEYS.feedback);
    clients = SEED.map((s, i) => {
      const c = { ...s, submittedAt: hoursAgo(s.hours), live: false };
      c.photoUrls = Object.fromEntries(VIEWS.map(([v], j) => [v, j < s.photos ? placeholder(v, i) : null]));
      const l = live[s.id];
      if (l) {
        Object.assign(c, {
          live: true, reviewed: false, submittedAt: l.submittedAt,
          weight: l.weight, energy: l.energy, sleep: l.sleep, sleepHours: l.sleepHours,
          wantsCall: l.wantsCall, reflection: l.reflection || '—',
          photoUrls: l.photos || {},
        });
        c.photos = VIEWS.filter(([v]) => c.photoUrls[v]).length;
      }
      const fb = feedback[s.id];
      c.feedback = fb || null;
      if (fb && new Date(fb.sentAt) >= new Date(c.submittedAt)) c.reviewed = true;
      c.delta = +(c.weight - c.prev).toFixed(1);
      c.attention = (c.energy <= 4 ? 1 : 0) + (c.sleep <= 4 ? 1 : 0) + (c.wantsCall ? 1 : 0) + (c.delta > 0 ? 1 : 0);
      return c;
    });
  }

  // ── Помощни визуални елементи ──
  const initials = n => n.split(' ').map(p => p[0]).slice(0, 2).join('');
  const avatarClass = c => c.program === 'Academy'
    ? 'bg-gradient-to-b from-gold-300/25 to-gold-500/10 text-gold-200 ring-1 ring-gold-400/30'
    : 'bg-white/[0.06] text-zinc-300 ring-1 ring-white/10';
  const fmtDelta = d => (d < 0 ? '−' : d > 0 ? '+' : '±') + Math.abs(d).toFixed(1) + ' кг';
  const deltaClass = d => d < 0
    ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'
    : d > 0 ? 'border-amber-400/20 bg-amber-400/[0.07] text-amber-300'
    : 'border-white/10 bg-white/[0.03] text-zinc-400';
  const scoreTone = v => v <= 4 ? 'bg-rose-400' : v <= 6 ? 'bg-zinc-300' : 'bg-gold-300';
  const relTime = iso => {
    const m = Math.max(1, Math.round((Date.now() - new Date(iso)) / 6e4));
    if (m < 60) return `преди ${m} мин`;
    const h = Math.round(m / 60);
    return h < 24 ? `преди ${h} ч` : `преди ${Math.round(h / 24)} д`;
  };
  const meter = (label, v) => `
    <div>
      <div class="flex items-baseline justify-between text-[12px]">
        <span class="text-zinc-500">${label}</span>
        <span class="font-mono tabular-nums text-zinc-200">${v}<span class="text-zinc-600">/10</span></span>
      </div>
      <div class="mt-1.5 flex gap-[3px]" aria-hidden="true">
        ${Array.from({ length: 10 }, (_, i) => `<span class="h-1 flex-1 rounded-full ${i < v ? scoreTone(v) : 'bg-white/[0.07]'}"></span>`).join('')}
      </div>
    </div>`;

  // ── Списък ──
  const grid = document.getElementById('grid');
  const state = { filter: 'all', q: '', sort: 'recent' };

  function visible() {
    let list = clients.filter(c =>
      (state.filter === 'all' || (state.filter === 'pending' ? !c.reviewed : c.program === state.filter)) &&
      c.name.toLowerCase().includes(state.q));
    const sorters = {
      recent: (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt),
      attention: (a, b) => b.attention - a.attention || a.energy - b.energy,
      delta: (a, b) => a.delta - b.delta,
    };
    return list.sort(sorters[state.sort]);
  }

  function card(c) {
    const flags = [];
    if (c.live) flags.push('<span class="rounded-full border border-emerald-400/25 bg-emerald-400/[0.08] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-emerald-300">Live</span>');
    if (c.wantsCall) flags.push('<span class="rounded-full border border-sky-400/20 bg-sky-400/[0.07] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-sky-300">Разговор</span>');
    if (c.energy <= 4 || c.sleep <= 4) flags.push('<span class="rounded-full border border-rose-400/20 bg-rose-400/[0.07] px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-rose-300">Внимание</span>');

    const photoIndicator = c.photos
      ? `<span class="inline-flex items-center gap-1.5 text-[12px] ${c.reviewed ? 'text-zinc-500' : 'text-gold-300'}">
           ${c.reviewed ? '' : '<span class="h-1.5 w-1.5 rounded-full bg-gold-300 shadow-[0_0_8px_rgba(212,180,110,.8)]"></span>'}
           <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="5" width="18" height="15" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>
           ${c.photos}/3 ${c.reviewed ? 'снимки' : 'нови'}</span>`
      : '<span class="text-[12px] text-zinc-600">Без снимки</span>';

    return `
    <li>
      <button type="button" data-open="${c.id}"
        class="card group relative block w-full rounded-2xl border p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/50 ${c.reviewed ? 'border-white/[0.07] opacity-70 hover:opacity-100' : 'border-white/10'}">
        <div class="flex items-start gap-3">
          <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold ${avatarClass(c)}">${esc(initials(c.name))}</span>
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-1.5 truncate text-[15px] font-medium text-white">${esc(c.name)}</p>
            <p class="mt-0.5 truncate font-mono text-[11px] text-zinc-500">${c.program} · седм. ${String(c.week).padStart(2, '0')} · ${relTime(c.submittedAt)}</p>
          </div>
          <span class="shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11.5px] tabular-nums ${deltaClass(c.delta)}" title="Спрямо миналата седмица">${fmtDelta(c.delta)}</span>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-4">
          ${meter('Енергия', c.energy)}
          ${meter('Сън', c.sleep)}
        </div>

        <div class="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
          ${photoIndicator}
          <span class="flex items-center gap-1">${flags.join('')}
            ${c.reviewed
              ? '<span class="inline-flex items-center gap-1 font-mono text-[10.5px] text-zinc-500"><svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>Прегледан</span>'
              : '<svg viewBox="0 0 24 24" class="h-4 w-4 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-gold-300" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>'}
          </span>
        </div>
      </button>
    </li>`;
  }

  function render() {
    const list = visible();
    grid.innerHTML = list.map(card).join('');
    document.getElementById('empty').classList.toggle('hidden', list.length > 0);

    // Броячи по табове
    const counts = { all: clients.length, pending: clients.filter(c => !c.reviewed).length,
      School: clients.filter(c => c.program === 'School').length, Academy: clients.filter(c => c.program === 'Academy').length };
    document.querySelectorAll('[data-count]').forEach(el => el.textContent = counts[el.dataset.count]);

    // KPI
    const avg = k => (clients.reduce((s, c) => s + c[k], 0) / clients.length);
    document.getElementById('kpi-received').textContent = clients.length;
    document.getElementById('kpi-total').textContent = clients.length + MISSING.length;
    document.getElementById('kpi-pending').textContent = counts.pending;
    document.getElementById('kpi-pending-inline').textContent = counts.pending;
    document.getElementById('kpi-energy').textContent = avg('energy').toFixed(1);
    document.getElementById('kpi-sleep').textContent = avg('sleep').toFixed(1);
    const d = avg('delta');
    const kd = document.getElementById('kpi-delta');
    kd.textContent = fmtDelta(+d.toFixed(2));
    kd.className = 'mt-1.5 text-[24px] font-semibold tabular-nums ' + (d <= 0 ? 'text-emerald-300' : 'text-amber-300');
  }

  // Липсващи
  document.getElementById('missing-count').textContent = MISSING.length;
  document.getElementById('missing').innerHTML = MISSING.map(m => `
    <li class="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] py-1 pl-1 pr-3">
      <span class="grid h-6 w-6 place-items-center rounded-full bg-white/[0.06] text-[10px] font-semibold text-zinc-400">${esc(initials(m.name))}</span>
      <span class="text-[12.5px] text-zinc-300">${esc(m.name)}</span>
      <span class="font-mono text-[10.5px] text-zinc-600">${m.program}</span>
    </li>`).join('');
  document.getElementById('remind-all').addEventListener('click', () => toast(`Напомняне изпратено на ${MISSING.length} клиента`));

  // ── Филтри / търсене / подредба ──
  document.querySelectorAll('.filter-tab').forEach(tab => tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.setAttribute('aria-selected', t === tab));
    state.filter = tab.dataset.filter;
    render();
  }));
  const search = document.getElementById('search');
  search.addEventListener('input', () => { state.q = search.value.trim().toLowerCase(); render(); });
  document.getElementById('sort').addEventListener('change', e => { state.sort = e.target.value; render(); });

  // ── Quick View ──
  const qv = document.getElementById('qv');
  const fbInput = document.getElementById('feedback');
  const fbCount = document.getElementById('fb-count');
  let current = null, lastFocus = null;

  function stat(label, value, sub = '', tone = 'text-white') {
    return `<div class="bg-zinc-950 px-3 py-3">
      <dt class="font-mono text-[10px] uppercase tracking-wider text-zinc-500">${label}</dt>
      <dd class="mt-1 text-[18px] font-semibold tabular-nums ${tone}">${value}</dd>
      ${sub ? `<dd class="mt-0.5 font-mono text-[10.5px] text-zinc-500">${sub}</dd>` : ''}
    </div>`;
  }

  function openQV(id) {
    const c = clients.find(x => x.id === id);
    if (!c) return;
    current = c;
    const av = document.getElementById('qv-avatar');
    av.textContent = initials(c.name);
    av.className = 'grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-semibold ' + avatarClass(c);
    document.getElementById('qv-name').textContent = c.name;
    document.getElementById('qv-meta').textContent = `INTNS ${c.program} · седмица ${String(c.week).padStart(2, '0')} · ${relTime(c.submittedAt)}`;

    const trend = (v, a) => { const d = +(v - a).toFixed(1); return `ср. 4 седм. ${a.toFixed(1)} <span class="${d >= 0 ? 'text-emerald-400' : 'text-rose-400'}">${d >= 0 ? '↑' : '↓'}</span>`; };
    document.getElementById('qv-stats').innerHTML =
      stat('Тегло', `${c.weight.toFixed(1)}<span class="text-[12px] font-normal text-zinc-500"> кг</span>`, `мин. седм. ${c.prev.toFixed(1)}`) +
      stat('Промяна', fmtDelta(c.delta), 'седмица/седмица', c.delta < 0 ? 'text-emerald-300' : c.delta > 0 ? 'text-amber-300' : 'text-zinc-300') +
      stat('Енергия', `${c.energy}<span class="text-[12px] font-normal text-zinc-500">/10</span>`, trend(c.energy, c.avg[0])) +
      stat('Сън', `${c.sleep}<span class="text-[12px] font-normal text-zinc-500">/10</span>`, `${esc(c.sleepHours)} ч · ` + trend(c.sleep, c.avg[1]));

    const flags = [];
    if (c.live) flags.push(['emerald', 'Изпратен от клиентската страница']);
    if (c.wantsCall) flags.push(['sky', 'Иска 10-мин разговор']);
    if (c.energy <= 4) flags.push(['rose', 'Ниска енергия']);
    if (c.sleep <= 4) flags.push(['rose', 'Лош сън']);
    if (c.delta > 0) flags.push(['amber', 'Тегло нагоре']);
    document.getElementById('qv-flags').innerHTML = flags.map(([t, l]) =>
      `<span class="rounded-full border border-${t}-400/20 bg-${t}-400/[0.07] px-2.5 py-1 text-[12px] text-${t}-300">${l}</span>`).join('');
    document.getElementById('qv-flags').classList.toggle('hidden', !flags.length);

    document.getElementById('qv-photos-status').textContent = c.photos ? `${c.photos}/3 качени` : 'Няма снимки тази седмица';
    document.getElementById('qv-photos').innerHTML = VIEWS.map(([v, label]) => {
      const url = c.photoUrls[v];
      return url
        ? `<button type="button" data-zoom="${v}" class="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400/60">
             <img src="${esc(url)}" alt="${label} снимка на ${esc(c.name)}" class="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
             <span class="absolute inset-x-1.5 bottom-1.5 rounded-md bg-black/70 px-2 py-1 text-center font-mono text-[10px] text-zinc-300 backdrop-blur">${label}</span>
           </button>`
        : `<div class="grid aspect-[3/4] place-items-center rounded-xl border border-dashed border-white/10 bg-white/[0.01] text-center">
             <span class="font-mono text-[10.5px] text-zinc-600">${label}<br/>липсва</span>
           </div>`;
    }).join('');

    document.getElementById('qv-reflection').textContent = c.reflection;

    const last = document.getElementById('qv-last-fb');
    if (c.feedback) {
      last.innerHTML = `<span class="font-mono text-[10.5px] uppercase tracking-wider text-gold-400/80">Изпратено ${relTime(c.feedback.sentAt)}</span><br/>${esc(c.feedback.text)}`;
      last.classList.remove('hidden');
    } else last.classList.add('hidden');

    fbInput.value = '';
    fbCount.textContent = 0;
    const btn = document.getElementById('send-fb');
    btn.querySelector('[data-label]').textContent = c.reviewed ? 'Изпрати нова бележка' : 'Изпрати и маркирай';

    if (qv.dataset.open !== 'true') {
      lastFocus = document.activeElement;
      qv.dataset.open = 'true';
      qv.setAttribute('aria-hidden', 'false');
      qv.classList.remove('pointer-events-none');
      document.body.style.overflow = 'hidden';
    }
    document.getElementById('qv-body').scrollTop = 0;
    setTimeout(() => fbInput.focus({ preventScroll: true }), 50);
  }

  function closeQV() {
    qv.dataset.open = 'false';
    qv.setAttribute('aria-hidden', 'true');
    qv.classList.add('pointer-events-none');
    document.body.style.overflow = '';
    current = null;
    if (lastFocus) lastFocus.focus();
  }

  function step(dir) {
    if (!current) return;
    const list = visible();
    const i = list.findIndex(c => c.id === current.id);
    const next = list[(i + dir + list.length) % list.length];
    if (next) openQV(next.id);
  }

  grid.addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b) openQV(b.dataset.open); });
  qv.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) closeQV();
    const nav = e.target.closest('[data-nav]'); if (nav) step(+nav.dataset.nav);
    const z = e.target.closest('[data-zoom]'); if (z) zoom(z.dataset.zoom);
  });

  // Шаблони + брояч
  document.querySelectorAll('[data-tpl]').forEach(b => b.addEventListener('click', () => {
    const sep = fbInput.value && !fbInput.value.endsWith('\n') ? '\n' : '';
    fbInput.value = (fbInput.value + sep + b.dataset.tpl).slice(0, 600);
    fbCount.textContent = fbInput.value.length;
    fbInput.focus();
  }));
  fbInput.addEventListener('input', () => fbCount.textContent = fbInput.value.length);

  // Изпращане на обратна връзка → видима в клиентския чек-ин
  function sendFeedback() {
    if (!current) return;
    const text = fbInput.value.trim();
    if (!text) { fbInput.focus(); fbInput.classList.add('border-rose-400/50'); setTimeout(() => fbInput.classList.remove('border-rose-400/50'), 900); return; }
    const all = store.read(KEYS.feedback);
    all[current.id] = { text, sentAt: new Date().toISOString() };
    store.write(KEYS.feedback, all);
    const name = current.name.split(' ')[0];
    const id = current.id;
    load(); render();
    toast(`Обратната връзка към ${name} е изпратена`);
    // Към следващия непрегледан клиент, иначе затвори
    const next = visible().find(c => !c.reviewed && c.id !== id);
    next ? openQV(next.id) : closeQV();
  }
  document.getElementById('send-fb').addEventListener('click', sendFeedback);

  // Lightbox
  const lb = document.getElementById('lightbox');
  function zoom(view) {
    if (!current) return;
    const label = VIEWS.find(([v]) => v === view)[1];
    document.getElementById('lightbox-img').src = current.photoUrls[view];
    document.getElementById('lightbox-img').alt = `${label} снимка на ${current.name}`;
    document.getElementById('lightbox-cap').textContent = `${current.name} · ${label} · седм. ${String(current.week).padStart(2, '0')}`;
    lb.classList.replace('hidden', 'flex');
    document.getElementById('lightbox-close').focus();
  }
  const closeLb = () => lb.classList.replace('flex', 'hidden');
  lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('#lightbox-close')) closeLb(); });

  // Клавиатура
  document.addEventListener('keydown', e => {
    if (!isActive()) return;
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === 'Escape') { if (!lb.classList.contains('hidden')) closeLb(); else if (current) closeQV(); return; }
    if (current && e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); sendFeedback(); return; }
    if (typing) return;
    if (current && (e.key === 'j' || e.key === 'k')) step(e.key === 'j' ? 1 : -1);
    if (!current && e.key === '/') { e.preventDefault(); search.focus(); }
  });

  // Focus trap в Quick View
  qv.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = [...qv.querySelectorAll('button, textarea, [href]')].filter(el => el.offsetParent !== null);
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Синхрон, ако чек-инът е изпратен в друг таб
  window.addEventListener('storage', e => { if (e.key && e.key.startsWith('intns.')) { load(); render(); } });

  return { onEnter() { load(); render(); } };
}
