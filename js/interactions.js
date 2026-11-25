/* =========================================================================
   Interaction primitives: toast, tooltip, anchored menu, popover, drawer.
   ========================================================================= */
window.DH = window.DH || {};

(function (DH) {
  const $ = (s, r = document) => r.querySelector(s);
  const closeWithAnim = (el, done) => {
    if (!el || !el.isConnected) { done && done(); return; }
    el.classList.add('is-closing');
    const finish = () => { el.remove(); done && done(); };
    el.addEventListener('animationend', finish, { once: true });
    setTimeout(() => el.isConnected && finish(), 300);
  };
  DH.closeWithAnim = closeWithAnim;

  /* ---------------- Toast ---------------- */
  DH.toast = (msg, variant = 'info', ms = 3600) => {
    const host = $('#toasts');
    const t = document.createElement('div');
    t.className = `toast${variant === 'neutral' ? ' toast--neutral' : variant === 'positive' ? ' toast--positive' : ''}`;
    t.setAttribute('role', 'status');
    t.innerHTML = `<span>${DH.esc(msg)}</span><button aria-label="Dismiss"><img src="assets/icons/close.svg" alt=""></button>`;
    host.appendChild(t);
    const kill = () => closeWithAnim(t);
    t.querySelector('button').addEventListener('click', kill);
    setTimeout(kill, ms);
  };

  /* ---------------- Tooltip (data-tip) ---------------- */
  let tipEl = null, tipTimer = null;
  const hideTip = () => { clearTimeout(tipTimer); if (tipEl) { tipEl.remove(); tipEl = null; } };
  const showTip = (target) => {
    hideTip();
    tipTimer = setTimeout(() => {
      const r = target.getBoundingClientRect();
      tipEl = document.createElement('div');
      tipEl.className = 'tooltip'; tipEl.setAttribute('role', 'tooltip');
      tipEl.textContent = target.dataset.tip;
      document.body.appendChild(tipEl);
      const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
      let top = r.bottom + 8; let above = false;
      if (top + h > innerHeight - 8) { top = r.top - h - 8; above = true; }
      const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8);
      tipEl.style.top = `${top}px`; tipEl.style.left = `${left}px`;
      tipEl.classList.toggle('is-above', above);
    }, 350);
  };
  document.addEventListener('mouseover', (e) => { const t = e.target.closest('[data-tip]'); if (t) showTip(t); });
  document.addEventListener('mouseout', (e) => { const t = e.target.closest('[data-tip]'); if (t && !t.contains(e.relatedTarget)) hideTip(); });
  document.addEventListener('focusin', (e) => { const t = e.target.closest('[data-tip]'); if (t && t.matches(':focus-visible')) showTip(t); });
  document.addEventListener('focusout', hideTip);
  addEventListener('scroll', hideTip, true);

  /* ---------------- Anchored menu (single instance) ---------------- */
  let menu = null; // { el, anchor, onPick, onClose }
  DH.closeMenu = (restoreFocus = false) => {
    if (!menu) return;
    const m = menu; menu = null;
    m.anchor.setAttribute('aria-expanded', 'false');
    m.anchor.closest('.picker')?.classList.remove('is-open');
    closeWithAnim(m.el);
    m.onClose && m.onClose();
    if (restoreFocus) m.anchor.focus();
  };
  // opts: { html, width, align: 'left'|'right', gap, onPick(value), container }
  DH.openMenu = (anchor, opts) => {
    if (menu && menu.anchor === anchor) { DH.closeMenu(true); return; }
    DH.closeMenu();
    hideTip();
    const el = document.createElement('div');
    el.className = `menu${opts.align === 'right' ? ' menu--right' : ''}${opts.plain ? ' menu--plain' : ''}`;
    el.setAttribute('role', opts.plain ? 'menu' : 'listbox');
    el.innerHTML = opts.html;
    const host = opts.container || anchor.parentElement;
    host.style.position = host.style.position || 'relative';
    host.appendChild(el);
    if (opts.width) { el.style.width = `${opts.width}px`; el.style.minWidth = '0'; } // fixed width (e.g. Open GitHub menu = 200px)
    const gap = opts.gap ?? 6;
    // position relative to host
    const hr = host.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
    el.style.top = `${ar.bottom - hr.top + gap}px`;
    if (opts.align === 'right') {
      el.style.right = `${hr.right - ar.right}px`;
    } else {
      el.style.left = `${ar.left - hr.left}px`;
      // keep within viewport
      requestAnimationFrame(() => {
        const mr = el.getBoundingClientRect();
        if (mr.right > innerWidth - 8) el.style.left = `${Math.max(0, ar.left - hr.left - (mr.right - innerWidth + 8))}px`;
      });
    }
    anchor.setAttribute('aria-expanded', 'true');
    anchor.closest('.picker')?.classList.add('is-open');
    menu = { el, anchor, onPick: opts.onPick, onClose: opts.onClose };
    el.addEventListener('click', (e) => {
      const it = e.target.closest('.menu__item'); if (!it) return;
      const v = it.dataset.value; const cb = menu && menu.onPick;
      DH.closeMenu(true); cb && cb(v);
    });
    el.addEventListener('keydown', (e) => {
      const items = [...el.querySelectorAll('.menu__item')];
      const i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
      if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
      if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
      if (e.key === 'Tab') DH.closeMenu();
    });
    (el.querySelector('.is-selected') || el.querySelector('.menu__item'))?.focus({ preventScroll: true });
  };
  document.addEventListener('pointerdown', (e) => {
    if (menu && !menu.el.contains(e.target) && !menu.anchor.contains(e.target)) DH.closeMenu();
  });

  /* ---------------- Popover (attendees) ---------------- */
  let pop = null;
  DH.closePopover = (restore = true) => {
    if (!pop) return;
    const p = pop; pop = null;
    p.anchor.setAttribute('aria-expanded', 'false');
    p.backdrop.remove();
    closeWithAnim(p.el);
    if (restore && p.anchor.isConnected) p.anchor.focus();
  };
  DH.openPopover = (anchor, html, label) => {
    DH.closeMenu(); DH.closePopover(false);
    const backdrop = document.createElement('div');
    backdrop.className = 'backdrop'; backdrop.setAttribute('data-name', 'Backdrop · tap to dismiss');
    const el = document.createElement('div');
    el.className = 'popover'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', label);
    el.innerHTML = html;
    document.body.append(backdrop, el);
    // Figma: popover sits 56px right of the "+N" counter and 4px below it
    const r = anchor.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;
    let left = r.right + 56, top = r.bottom + 4;
    if (left + w > innerWidth - 12) left = Math.max(12, innerWidth - w - 12);
    if (top + h > innerHeight - 12) { top = Math.max(12, r.top - h - 4); el.style.transformOrigin = 'bottom left'; }
    el.style.left = `${left}px`; el.style.top = `${top}px`;
    anchor.setAttribute('aria-expanded', 'true');
    pop = { el, anchor, backdrop };
    backdrop.addEventListener('click', () => DH.closePopover());
    el.querySelector('[data-close]')?.addEventListener('click', () => DH.closePopover());
    el.querySelector('[data-close]')?.focus({ preventScroll: true });
  };
  addEventListener('resize', () => DH.closePopover(false));
  document.addEventListener('scroll', (e) => { if (pop && !pop.el.contains(e.target)) DH.closePopover(false); }, true);

  /* ---------------- Drawer (mobile nav) ---------------- */
  let drawer = null;
  DH.openDrawer = (html) => {
    if (drawer) return;
    const bd = document.createElement('div'); bd.className = 'drawer-backdrop';
    const el = document.createElement('nav'); el.className = 'drawer'; el.setAttribute('aria-label', 'Main navigation');
    el.innerHTML = html;
    document.body.append(bd, el);
    drawer = { el, bd };
    $('#menuBtn').setAttribute('aria-expanded', 'true');
    bd.addEventListener('click', DH.closeDrawer);
    el.querySelector('a,button')?.focus();
  };
  DH.closeDrawer = () => {
    if (!drawer) return;
    const d = drawer; drawer = null;
    $('#menuBtn').setAttribute('aria-expanded', 'false');
    closeWithAnim(d.bd); closeWithAnim(d.el);
  };

  /* ---------------- Global Escape ---------------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (pop) return DH.closePopover();
    if (menu) return DH.closeMenu(true);
    if (drawer) return DH.closeDrawer();
    DH.closeProto && DH.closeProto();
  });
})(window.DH);
