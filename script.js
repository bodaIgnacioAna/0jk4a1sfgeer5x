(() => {
  'use strict';

  // Enlace del formulario de Google. Mientras esté vacío, el botón se muestra desactivado.
  const FORM_URL = '';

  // 4 dic 2027, 12:00 (hora peninsular, CET = UTC+1)
  const BODA = new Date('2027-12-04T12:00:00+01:00').getTime();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- Botón del formulario ----------
  const rsvp = $('#rsvp');
  if (FORM_URL) {
    rsvp.href = FORM_URL;
  } else {
    rsvp.setAttribute('aria-disabled', 'true');
    rsvp.removeAttribute('target');
    $('#rsvp-note').hidden = false;
  }

  // ---------- Cuenta atrás ----------
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

  // ---------- Aparición al hacer scroll ----------
  // El horario aparece siempre en orden, del más temprano al más tardío.
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

  let io = null;
  let tio = null;
  if ('IntersectionObserver' in window && !reduce) {
    io = new IntersectionObserver(entries => {
      entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1)
        .forEach((e, i) => {
          e.target.style.setProperty('--d', i * 0.09 + 's');
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
    }, { threshold: 0.12 });
    tio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { tlReady.add(e.target); tio.unobserve(e.target); }
      });
      tlFlush();
    }, { threshold: 0.3 });
    $$('.reveal').forEach(n => io.observe(n));
    tlItems.forEach(n => tio.observe(n));
  } else {
    $$('.reveal').forEach(n => n.classList.add('in'));
    tlItems.forEach(n => n.classList.add('in'));
  }

  // ---------- Secciones ----------
  const VIEWS = ['inicio', 'celebracion', 'horario', 'autobus', 'alojamiento'];
  const top = $('#top');
  let current = null;

  function routeFromHash() {
    const h = location.hash.replace(/^#\/?/, '');
    if (h === 'confirmar') return { view: 'inicio', target: '#rsvp-block' };
    return { view: VIEWS.includes(h) ? h : 'inicio' };
  }

  function updateTop() {
    const onHome = current === 'inicio';
    top.classList.toggle('show', !onHome || scrollY > 160);
  }

  function show(view, target, first) {
    const changed = view !== current;
    if (changed) {
      VIEWS.forEach(v => { $('#v-' + v).hidden = v !== view; });
      current = view;
      document.body.dataset.view = view;
      document.title = $('#v-' + view).dataset.title;
      $$('[data-nav]').forEach(a => {
        if (a.dataset.nav === view) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
      const el = $('#v-' + view);
      el.classList.remove('enter');
      void el.offsetWidth;
      el.classList.add('enter');
    }
    closeMenu();
    if (target) {
      requestAnimationFrame(() => $(target).scrollIntoView({ behavior: reduce || changed ? 'auto' : 'smooth' }));
    } else if (changed || !first) {
      scrollTo({ top: 0, behavior: 'auto' });
    }
    if (changed && !first && !target) {
      const h2 = $('#v-' + view + ' h2[tabindex]');
      if (h2) h2.focus({ preventScroll: true });
    }
    updateTop();
  }

  function onRoute(first) {
    const r = routeFromHash();
    show(r.view, r.target, first);
  }
  addEventListener('hashchange', () => onRoute(false));
  addEventListener('scroll', updateTop, { passive: true });

  // Enlace "Confirmar" estando ya en el inicio: el hash no cambia, hay que desplazar a mano
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    if (a.hasAttribute('data-scroll')) {
      e.preventDefault();
      $(a.getAttribute('href')).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    } else if (a.getAttribute('href') === location.hash && a.getAttribute('href').startsWith('#/')) {
      onRoute(false);
    }
  });

  // ---------- Menú móvil ----------
  const burger = $('#burger');
  function closeMenu() {
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
  }
  burger.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  $('#scrim').addEventListener('click', closeMenu);
  addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

  onRoute(true);
})();
