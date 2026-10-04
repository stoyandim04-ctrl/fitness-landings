// Общи UI помощници.
let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-text').textContent = msg;
  t.classList.remove('opacity-0', 'translate-y-4');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('opacity-0', 'translate-y-4'), 2600);
}

export const prefersReducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
