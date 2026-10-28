(() => {
  'use strict';

  // Enlace del formulario de Google. Mientras esté vacío, el botón se muestra desactivado.
  const FORM_URL = '';

  // 4 dic 2027, 12:00 (hora peninsular, CET = UTC+1)
  const BODA = new Date('2027-12-04T12:00:00+01:00').getTime();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Botón del formulario
  const rsvp = $('#rsvp');
  if (FORM_URL) {
    rsvp.href = FORM_URL;
  } else {
    rsvp.setAttribute('aria-disabled', 'true');
    rsvp.removeAttribute('target');
    $('#rsvp-note').hidden = false;
  }

  // Cuenta atrás
  const pad = n => String(n).padStart(2, '0');
  function tick() {
    const diff = BODA - Date.now();
    if (diff <= 0) {
      $('#countdown').hidden = true;
      const end = $('#cd-end');
      end.hidden = false;
      end.textContent = '¡Hoy es el gran día!';
      return;
    }
    const s = Math.floor(diff / 1000);
    $('#cd-d').textContent = Math.floor(s / 86400);
    $('#cd-h').textContent = pad(Math.floor(s % 86400 / 3600));
    $('#cd-m').textContent = pad(Math.floor(s % 3600 / 60));
    $('#cd-s').textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  // Barra de navegación
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('scrolled', scrollY > 10);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Aparición al hacer scroll. El horario aparece siempre en orden, del más temprano al más tardío.
  const tlItems = $$('.tl li');
  const tlReady = new Set();
  let tlNext = 0;
  let tlLast = 0;
  function tlFlush() {
    while (tlNext < tlItems.length && tlReady.has(tlItems[tlNext])) {
      const li = tlItems[tlNext++];
      const at = Math.max(performance.now(), tlLast + 160);
      tlLast = at;
      setTimeout(() => li.classList.add('in'), at - performance.now());
    }
  }

  const items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
        .forEach((e, i) => {
          e.target.style.setProperty('--d', i * 0.09 + 's');
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
    }, { threshold: 0.12 });
    const tio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { tlReady.add(e.target); tio.unobserve(e.target); }
      });
      tlFlush();
    }, { threshold: 0.3 });
    items.forEach(n => io.observe(n));
    tlItems.forEach(n => tio.observe(n));
  } else {
    items.forEach(n => n.classList.add('in'));
    tlItems.forEach(n => n.classList.add('in'));
  }
})();
