// Изглед „Чек-ин“: седмичен отчет (тегло, енергия, сън, снимки, рефлексия).
import { store, KEYS, USERS } from './store.js';

// context() → { program, unit, phase } от портала: чек-инът е общ за всички програми.
export function initClient({ context } = {}) {
  const CLIENT_ID = USERS.client.id;
  let ctx = null;

  // Последната бележка от треньора (пише се от таблото)
  function refreshCoachNote() {
    const fb = store.read(KEYS.feedback)[CLIENT_ID];
    if (!fb || !fb.text) return;
    document.getElementById('coach-note').textContent = '„' + fb.text + '“';
    document.getElementById('coach-note-when').textContent = new Date(fb.sentAt).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short' });
  }

  // ── Биометрия: прогрес спрямо целта ──
  const START = 72.4, GOAL = 64.0;
  const weight = document.getElementById('weight');
  const bar = document.getElementById('progress-bar');
  const knob = document.getElementById('progress-knob');
  const progress = document.getElementById('progress');
  const pct = document.getElementById('progress-pct');
  const remaining = document.getElementById('remaining');
  const delta = document.getElementById('delta-chip');

  function renderWeight() {
    const w = parseFloat(weight.value);
    if (Number.isNaN(w)) return;
    const p = Math.max(0, Math.min(100, ((START - w) / (START - GOAL)) * 100));
    const r = Math.round(p);
    bar.style.width = knob.style.left = p + '%';
    progress.setAttribute('aria-valuenow', r);
    pct.textContent = r + '%';
    const left = Math.max(0, w - GOAL);
    remaining.textContent = left === 0 ? 'Целта е постигната' : left.toFixed(1) + ' кг';
    const d = w - START;
    delta.textContent = (d <= 0 ? '−' : '+') + Math.abs(d).toFixed(1) + ' кг';
    delta.className = 'rounded-full border px-2.5 py-1 font-mono text-[11px] ' + (d <= 0
      ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'
      : 'border-amber-400/20 bg-amber-400/[0.07] text-amber-300');
  }
  weight.addEventListener('input', renderWeight);
  document.querySelectorAll('[data-step]').forEach(btn => btn.addEventListener('click', () => {
    weight.value = (parseFloat(weight.value || START) + parseFloat(btn.dataset.step)).toFixed(1);
    renderWeight();
  }));
  renderWeight();

  // ── Скали 1–10 ──
  const captions = {
    energy: ['Изтощена', 'Изтощена', 'Ниска', 'Ниска', 'Неутрална', 'Неутрална', 'Фокусирана', 'Фокусирана', 'Остра', 'Пикова'],
    sleep:  ['Разбит', 'Разбит', 'Слаб', 'Слаб', 'Накъсан', 'Стабилен', 'Стабилен', 'Дълбок', 'Дълбок', 'Перфектен'],
  };
  document.querySelectorAll('[data-scale]').forEach(fs => {
    const key = fs.dataset.scale, def = +fs.dataset.default;
    const wrap = fs.querySelector('[data-options]');
    const out = fs.querySelector('[data-value]');
    const cap = fs.querySelector('[data-caption]');
    for (let i = 1; i <= 10; i++) {
      const label = document.createElement('label');
      label.className = 'relative';
      label.innerHTML =
        `<input type="radio" name="${key}" value="${i}" class="scale-input peer sr-only" ${i === def ? 'checked' : ''} aria-label="${i} от 10" />` +
        `<span class="scale-dot grid h-10 cursor-pointer place-items-center rounded-lg border border-white/10 bg-white/[0.02] font-mono text-[13px] tabular-nums text-zinc-400 transition duration-200 hover:border-white/25 hover:text-white">${i}</span>`;
      wrap.appendChild(label);
    }
    fs.addEventListener('change', e => {
      const v = +e.target.value;
      out.textContent = v;
      cap.textContent = captions[key][v - 1];
      if (navigator.vibrate) navigator.vibrate(6);
    });
  });

  // ── Снимки: локален преглед ──
  const photoCount = document.getElementById('photo-count');
  document.querySelectorAll('.photo-slot').forEach(slot => {
    const input = slot.querySelector('input');
    const img = slot.querySelector('img');
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (img.src.startsWith('blob:')) URL.revokeObjectURL(img.src);
      img.src = URL.createObjectURL(file);
      img.classList.remove('hidden');
      slot.querySelector('[data-empty]').classList.add('hidden');
      slot.querySelector('[data-filled]').classList.replace('hidden', 'flex');
      slot.classList.replace('border-dashed', 'border-solid');
      slot.classList.add('border-gold-400/30');
      photoCount.textContent = [...document.querySelectorAll('.photo-slot input')].filter(i => i.files.length).length;
    });
  });

  // ── Рефлексия ──
  const ta = document.getElementById('reflection');
  const count = document.getElementById('char-count');
  const updateCount = () => count.textContent = ta.value.length;
  ta.addEventListener('input', updateCount);
  document.querySelectorAll('[data-prompt]').forEach(btn => btn.addEventListener('click', () => {
    const sep = ta.value && !ta.value.endsWith('\n') ? '\n' : '';
    ta.value = (ta.value + sep + btn.dataset.prompt).slice(0, 600);
    ta.focus();
    ta.setSelectionRange(ta.value.length, ta.value.length);
    updateCount();
  }));

  // ── Изпращане (демо: без бекенд) ──
  const form = document.getElementById('checkin');
  const submit = document.getElementById('submit');
  const success = document.getElementById('success');
  form.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) form.requestSubmit();
  });
  // Смалява снимката до ~480px JPEG, за да се събере в localStorage
  const shrink = file => new Promise(resolve => {
    if (!file) return resolve(null);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 480 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(img.src);
      resolve(c.toDataURL('image/jpeg', 0.72));
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });

  async function saveCheckin() {
    const data = new FormData(form);
    const file = name => { const f = data.get(name); return f && f.size ? f : null; };
    const [front, side, back] = await Promise.all(['photoFront', 'photoSide', 'photoBack'].map(n => shrink(file(n))));
    const all = store.read(KEYS.checkins);
    all[CLIENT_ID] = {
      clientId: CLIENT_ID, program: ctx?.program.value, unit: ctx?.unit, submittedAt: new Date().toISOString(),
      weight: parseFloat(data.get('weight')),
      energy: +data.get('energy'), sleep: +data.get('sleep'), sleepHours: data.get('sleepHours'),
      reflection: (data.get('reflection') || '').trim(),
      wantsCall: data.get('wantsCall') === 'on',
      photos: { front, side, back },
    };
    // Ако снимките не се побират, запази поне данните
    // Дневник: кои седмици/дни на коя програма имат чек-ин
    if (ctx) {
      const log = store.read(KEYS.checkinLog);
      log[ctx.program.value] = [...new Set([...(log[ctx.program.value] || []), ctx.unit])];
      store.write(KEYS.checkinLog, log);
    }
    if (!store.write(KEYS.checkins, all)) {
      all[CLIENT_ID].photos = { front: null, side: null, back: null };
      store.write(KEYS.checkins, all);
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    submit.disabled = true;
    submit.querySelector('[data-label]').textContent = 'Изпращане…';
    submit.querySelector('[data-arrow]').classList.add('hidden');
    submit.querySelector('[data-spinner]').classList.remove('hidden');
    await Promise.all([saveCheckin(), new Promise(r => setTimeout(r, 1100))]);
    {
      form.classList.add('hidden');
      success.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
  document.getElementById('again').addEventListener('click', () => {
    success.classList.add('hidden');
    form.classList.remove('hidden');
    submit.disabled = false;
    submit.querySelector('[data-label]').textContent = 'Изпрати чек-ин';
    submit.querySelector('[data-arrow]').classList.remove('hidden');
    submit.querySelector('[data-spinner]').classList.add('hidden');
  });

  // Заглавието следва активната програма и текущата седмица/ден
  function paintContext() {
    ctx = context?.();
    if (!ctx) return;
    const { program: p, unit, phase } = ctx;
    const pad = n => String(n).padStart(2, '0');
    document.getElementById('ci-program').textContent = p.short;
    document.getElementById('ci-unit-label').textContent = p.unit === 'day' ? 'Ден' : 'Седмица';
    document.getElementById('ci-unit').textContent = pad(unit);
    document.getElementById('ci-total').textContent = p.length;
    document.getElementById('ci-phase').textContent = phase;
    document.getElementById('ci-segments').innerHTML = Array.from({ length: p.length }, (_, i) =>
      `<li class="h-1 flex-1 rounded-full ${i + 1 < unit ? 'bg-zinc-300' : i + 1 === unit ? 'bg-gradient-to-r from-gold-300 to-gold-500 shadow-[0_0_12px_rgba(212,180,110,.6)]' : 'bg-white/10'}"></li>`).join('');
    document.getElementById('ci-back').setAttribute('href', '#/program?p=' + p.value);
  }

  return { onEnter() { paintContext(); refreshCoachNote(); } };
}
