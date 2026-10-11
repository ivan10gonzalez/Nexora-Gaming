(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!reduceMotion.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-motion');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    $$('.reveal').forEach((element) => observer.observe(element));
  }
  $('#year').textContent = new Date().getFullYear();
  const menu = $('.menu-toggle');
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menú'); $('#navigation').classList.remove('open'); }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    $('#navigation').classList.toggle('open', open);
  });
  $$('#navigation a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', (event) => { if (!event.target.closest('.header')) closeMenu(); });

  const views = {
    experience: `<div class="demo-screen"><div class="demo-nav"><strong class="demo-name"></strong><span>Inicio &nbsp; / &nbsp; Explorar</span><span>Mi espacio ↗</span></div><div class="demo-hero"><span>UN ESPACIO CON TU IDENTIDAD</span><h4>Tu próxima<br>experiencia empieza acá.</h4><i aria-hidden="true"></i></div><div class="demo-widgets"><div><i></i>Descubrí<small>Contenido a tu medida</small></div><div><i></i>Conectá<small>Todo en un solo lugar</small></div><div><i></i>Explorá<small>Una nueva experiencia</small></div></div></div>`,
    management: `<div class="demo-screen"><div class="demo-nav"><strong class="demo-name"></strong><span>PANEL ADMINISTRATIVO</span><span>Tu equipo ↗</span></div><div class="admin-layout"><div class="demo-sidebar"><b>◫ Resumen</b><span>▤ Contenido</span><span>◎ Usuarios</span><span>⚙ Ajustes</span></div><div><h4 class="demo-heading">Todo, bajo tu control.</h4><div class="demo-widgets"><div>Contenido<small>Organizá tu plataforma</small></div><div>Equipo<small>Definí los accesos</small></div><div>Identidad<small>Configurá tu marca</small></div></div><div class="demo-chart" aria-label="Gráfico ilustrativo, sin datos reales">${[30,48,37,62,52,78,68,90,84,100].map((n) => `<i style="height:${n}%"></i>`).join('')}</div><p class="demo-chart-caption">VISUALIZACIÓN ILUSTRATIVA · SIN DATOS REALES</p></div></div></div>`,
    brand: `<div class="demo-screen"><div class="demo-nav"><strong class="demo-name"></strong><span>SISTEMA DE IDENTIDAD</span><span>Tu estilo ↗</span></div><div class="brand-preview"><div class="brand-tile"><strong class="demo-name"></strong><small>TU PROPIO UNIVERSO</small></div><div class="brand-tile brand-specimen"><span>Aa</span><small>DISEÑO CON CARÁCTER</small></div></div><div class="demo-widgets"><div>Color<small>Tu personalidad</small></div><div>Tipografía<small>Tu manera de hablar</small></div><div>Experiencia<small>Una misma identidad</small></div></div></div>`
  };
  let activeView = 'experience';
  function updateBrand() { $$('.demo-name').forEach((name) => { name.textContent = $('#demo-brand').value.trim() || 'TU MARCA'; }); }
  function setView(view) {
    if (!Object.hasOwn(views, view)) return;
    activeView = view;
    $('#preview-content').innerHTML = views[view];
    $('#preview-route').textContent = { experience: 'inicio', management: 'administración', brand: 'identidad' }[view];
    $('#preview-panel').setAttribute('aria-labelledby', `tab-${view}`);
    $$('.studio-tabs button').forEach((tab) => { const selected = tab.dataset.view === view; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
    updateBrand();
  }
  $('#demo-brand').addEventListener('input', updateBrand);
  $$('.swatch').forEach((button) => button.addEventListener('click', () => {
    $('.studio').style.setProperty('--demo-accent', button.dataset.color);
    $$('.swatch').forEach((swatch) => { swatch.classList.toggle('selected', swatch === button); swatch.setAttribute('aria-pressed', String(swatch === button)); });
  }));
  $$('.studio-tabs button').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
  $('.studio-tabs').addEventListener('keydown', (event) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const tabs = $$('.studio-tabs button'); const current = tabs.findIndex((tab) => tab.dataset.view === activeView);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    setView(tabs[index].dataset.view); tabs[index].focus();
  });
  $$('[data-showcase]').forEach((link) => link.addEventListener('click', () => setView(link.dataset.showcase)));
  setView('experience');

  const dialog = $('#contact-dialog'); let dialogTrigger = null; let brief = '';
  $$('[data-contact]').forEach((button) => button.addEventListener('click', () => {
    dialogTrigger = button; closeMenu(); dialog.showModal();
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => dialogTrigger?.focus());
  const config = window.NEXORA_CONFIG || {};
  const email = typeof config.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email) ? config.email : '';
  const whatsapp = typeof config.whatsapp === 'string' && /^\d{7,15}$/.test(config.whatsapp) ? config.whatsapp : '';
  let contactUrl = '';
  try { const url = new URL(config.contactUrl); if (url.protocol === 'https:') contactUrl = url.href; } catch { /* No external channel configured yet. */ }
  if (email || whatsapp || contactUrl) $('#form-description').textContent = 'Prepará tu consulta y elegí cómo compartirla. El envío se completa desde el canal de contacto que abras.';
  $('#contact-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const data = new FormData(event.currentTarget);
    brief = `NEXORA GAMING — CONSULTA DE PROYECTO\n\nNombre: ${data.get('name')}\nCorreo: ${data.get('email')}\nServicio: ${data.get('service')}\n\n${data.get('message')}\n`;
    const actions = $('.result-actions');
    $$('.configured-contact').forEach((link) => link.remove());
    const addChannel = (label, url) => { const link = document.createElement('a'); link.textContent = label; link.href = url; link.className = 'button small light configured-contact'; link.target = '_blank'; link.rel = 'noopener noreferrer'; actions.append(link); };
    if (email) addChannel('Abrir correo ↗', `mailto:${email}?subject=${encodeURIComponent('Nuevo proyecto — Nexora Gaming')}&body=${encodeURIComponent(brief)}`);
    if (whatsapp) addChannel('Abrir WhatsApp ↗', `https://wa.me/${whatsapp}?text=${encodeURIComponent(brief)}`);
    if (contactUrl) addChannel('Abrir contacto ↗', contactUrl);
    $('#copy-brief').textContent = 'Copiar texto';
    $('#brief-result').hidden = false;
    $('#brief-result').scrollIntoView({ block: 'nearest', behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  });
  $('#contact-form').addEventListener('input', () => { $('#brief-result').hidden = true; brief = ''; });
  $('#download-brief').addEventListener('click', () => {
    if (!brief) return;
    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'mi-proyecto-nexora.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  $('#copy-brief').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(brief); $('#copy-brief').textContent = 'Copiado ✓'; }
    catch { $('#copy-brief').textContent = 'Usá Descargar resumen'; }
  });
  const motion = $('#motion-toggle');
  let userPaused = reduceMotion.matches;
  function syncMotion() {
    document.documentElement.classList.toggle('motion-paused', userPaused);
    motion.setAttribute('aria-pressed', String(userPaused)); motion.setAttribute('aria-label', userPaused ? 'Activar animaciones' : 'Pausar animaciones'); motion.textContent = userPaused ? '▶' : 'Ⅱ';
    window.dispatchEvent(new CustomEvent('nexora-motion', { detail: { paused: userPaused } }));
  }
  motion.addEventListener('click', () => { userPaused = !userPaused; syncMotion(); });
  reduceMotion.addEventListener('change', () => { userPaused = reduceMotion.matches; syncMotion(); });
  syncMotion();
})();
