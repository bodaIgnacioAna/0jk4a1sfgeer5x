(() => {
  'use strict';

  // Enlace del formulario de Google. Mientras esté vacío, el botón se muestra desactivado.
  const FORM_URL = '';

  // 4 dic 2027, 12:00 (hora peninsular, CET = UTC+1)
  const BODA = new Date('2027-12-04T12:00:00+01:00').getTime();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Botón del formulario
  const rsvp = document.getElementById('rsvp');
  if (FORM_URL) {
    rsvp.href = FORM_URL;
  } else {
    rsvp.setAttribute('aria-disabled', 'true');
    rsvp.removeAttribute('target');
    document.getElementById('rsvp-note').hidden = false;
  }

  // Cuenta atrás
  const el = id => document.getElementById(id);
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const diff = BODA - Date.now();
    if (diff <= 0) {
      el('countdown').hidden = true;
      const end = el('cd-end');
      end.hidden = false;
      end.textContent = '¡Hoy es el gran día!';
      return;
    }
    const s = Math.floor(diff / 1000);
    el('cd-d').textContent = Math.floor(s / 86400);
    el('cd-h').textContent = pad(Math.floor(s % 86400 / 3600));
    el('cd-m').textContent = pad(Math.floor(s % 3600 / 60));
    el('cd-s').textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  // Barra de navegación
  const nav = el('nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Aparición al hacer scroll
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach((n, i) => {
      n.style.setProperty('--d', (i % 4) * 0.08 + 's');
      io.observe(n);
    });
  } else {
    items.forEach(n => n.classList.add('in'));
  }

  // Nieve sutil
  if (reduce) return;
  const cv = el('nieve');
  const ctx = cv.getContext('2d');
  let w, h, flakes, raf;

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, w / 22));
    flakes = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 1.2 + Math.random() * 2.6,
      v: 0.25 + Math.random() * 0.6,
      p: Math.random() * Math.PI * 2,
      a: 0.45 + Math.random() * 0.4,
    }));
  }

  function frame(t) {
    ctx.clearRect(0, 0, w, h);
    for (const f of flakes) {
      f.y += f.v;
      f.x += Math.sin(t / 1800 + f.p) * 0.3;
      if (f.y > h + 5) { f.y = -5; f.x = Math.random() * w; }
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${f.a})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(110,125,120,${f.a * 0.35})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  }

  size();
  raf = requestAnimationFrame(frame);
  addEventListener('resize', size);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) raf = requestAnimationFrame(frame);
  });
})();
