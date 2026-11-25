/* =========================================================================
   Reusable UI components (return HTML strings). One definition per pattern,
   mirroring the Figma components: Feed cards, Banner, Tabs, Section header,
   Status light, PR KPI card, Picker (M), Menu, Tables, Empty states, etc.
   ========================================================================= */
window.DH = window.DH || {};

(function (DH) {
  const I = (n) => `assets/icons/${n}`;
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  DH.esc = esc;

  const C = {};

  /* ---------- Feed cards (Home tabs) ---------- */
  C.prCard = (c, i) => `
    <button class="fcard" data-action="open-pr-card" data-index="${i}" aria-label="${esc(c.title)} · ${esc(c.status)}">
      <span class="fcard__icon"><img src="${I('pull-request.svg')}" alt=""></span>
      <span class="fcard__text">
        <span class="fcard__titlerow">
          <span class="fcard__title ellipsis">${esc(c.title)}</span>
          <span class="fcard__status"><img src="${c.dot}" alt="">${esc(c.status)}</span>
        </span>
        <span class="fcard__meta">
          <span class="fcard__metaitem"><img src="${I('folder.svg')}" alt=""><span class="ellipsis">${esc(c.repo)}</span></span>
        </span>
      </span>
    </button>`;

  C.jiraCard = (c, i) => `
    <button class="fcard" data-action="open-jira-card" data-index="${i}" aria-label="${esc(c.title)} · ${esc(c.status)}">
      <span class="fcard__icon"><img src="${I('jira.svg')}" alt=""></span>
      <span class="fcard__text">
        <span class="fcard__titlerow">
          <span class="fcard__title ellipsis">${esc(c.title)}</span>
          <span class="fcard__status"><img src="${c.dot}" alt="">${esc(c.status)}</span>
        </span>
        <span class="fcard__meta fcard__meta--wide">
          <span class="fcard__metaitem"><img src="${I('tag.svg')}" alt="">${esc(c.key)}</span>
          ${c.priority ? `<span class="fcard__metaitem"><img src="${I('flag.svg')}" alt="">${esc(c.priority)}</span>` : ''}
        </span>
      </span>
    </button>`;

  C.meetingCard = (c, i) => `
    <button class="fcard" data-action="open-meeting-card" data-index="${i}" aria-label="${esc(c.time)} · ${esc(c.title)}">
      <span class="fcard__icon fcard__icon--meeting"><img src="${I('calendar.svg')}" alt=""></span>
      <span class="mcard__time">
        <span class="mcard__timecol"><strong>${esc(c.time)}</strong><small>${esc(c.dur)}</small></span>
        <span class="mcard__divider"></span>
      </span>
      <span class="fcard__text fcard__text--meeting">
        <span class="fcard__title ellipsis">${esc(c.title)}</span>
        <span class="fcard__metaitem"><img src="${c.icon}" alt="">${esc(c.loc)}</span>
      </span>
    </button>`;

  /* ---------- Tab cards · Recently Accessed / Favourites / My Team's Services /
     Announcement / Upcoming Events (Figma 1.1A–1.1E) ---------- */
  const meta = (icon, text) => `<span class="tcard__meta-item"><img src="${I(icon)}" alt="">${esc(text)}</span>`;
  const person = (c) => `<span class="tcard__meta-item tcard__meta-item--user"><img class="tcard__avatar" src="${c.avatar}" alt="">${esc(c.user)}</span>`;
  const titleBtn = (c, where, cls = '') => `<button class="tcard__title ${cls}" data-action="open-external" data-what="${esc(c.title)}" data-where="${where}">${esc(c.title)}</button>`;
  const moreBtn = (c) => `<button class="tcard__icon-btn" data-action="card-more" data-what="${esc(c.title)}" aria-label="More actions for ${esc(c.title)}"><img src="${I('tab-more.svg')}" alt="" width="20" height="20"></button>`;
  const star = `<img class="tcard__star" src="${I('tab-star.svg')}" alt="Favourite" width="14" height="14">`;
  const tag = (label) => `<span class="tcard__tag"><img src="${I('tab-dot.svg')}" alt="">${esc(label)}</span>`;

  C.recentCard = (c) => `
    <div class="fcard tcard tcard--recent">
      <img class="tcard__type" src="${I(`tab-${c.icon}.svg`)}" alt="">
      <div class="tcard__body">
        <div class="tcard__titlerow">${titleBtn(c, 'Developer Home')}${moreBtn(c)}</div>
        <div class="tcard__meta">${c.kind ? meta('tab-file.svg', c.kind) : ''}${meta('tab-clock.svg', c.time)}${person(c)}</div>
      </div>
    </div>`;

  C.favouriteCard = (c) => `
    <div class="fcard tcard tcard--fav">
      <div class="tcard__body">
        <div class="tcard__titlerow">${titleBtn(c, 'Developer Home')}${star}</div>
        <div class="tcard__meta">${meta('tab-file.svg', c.kind)}${person(c)}</div>
      </div>
    </div>`;

  C.teamCard = (c) => `
    <div class="fcard tcard tcard--team">
      <div class="tcard__body">
        <div class="tcard__titlerow">${titleBtn(c, 'Service catalog', c.bold ? 'tcard__title--bold' : '')}<span class="tcard__actions">${star}${moreBtn(c)}</span></div>
        <div class="tcard__meta">
          <span class="tcard__badge">${esc(c.badge)}</span>${c.mgr ? '<span class="tcard__badge tcard__badge--mgr">MGR</span>' : ''}
          <span class="tcard__slo"><b>SLO:</b> ${esc(c.slo)}</span>${person(c)}
        </div>
        <div class="tcard__cicd">${c.cicd
    ? `<button class="tcard__cicd-btn" data-action="card-cicd" data-what="${esc(c.title)}"><img src="${I('tab-share.svg')}" alt="" width="16" height="16">CI/CD</button>`
    : '<span class="tcard__cicd-none">This service has no CI/CD pipeline</span>'}</div>
      </div>
    </div>`;

  C.announcementCard = (c) => `
    <div class="fcard tcard tcard--ann">
      <div class="tcard__body">
        <div class="tcard__titlerow">
          <span class="tcard__titlegroup">${titleBtn(c, 'Developer Home', 'ellipsis')}${c.isNew ? '<span class="tcard__badge tcard__badge--new">New</span>' : ''}</span>
          ${tag(c.tag)}
        </div>
        <p class="tcard__desc">${esc(c.desc)}</p>
        <div class="tcard__meta">${meta('tab-file.svg', c.source)}${meta('tab-clock.svg', c.time)}${person(c)}</div>
      </div>
    </div>`;

  C.eventCard = (c) => `
    <div class="fcard tcard tcard--event">
      <span class="tcard__date"><span class="tcard__date-text"><small>${esc(c.month)}</small><strong>${esc(c.day)}</strong></span><span class="tcard__divider"></span></span>
      <div class="tcard__body">
        <div class="tcard__titlerow">${titleBtn(c, 'Events')}${tag(c.tag)}</div>
        <div class="tcard__meta">${meta('tab-desktop.svg', c.location)}${meta('tab-user.svg', `${c.registered} registered`)}${meta('tab-clock.svg', c.time)}</div>
      </div>
    </div>`;

  /* ---------- Tabs ---------- */
  C.tabs = (items, active, { kind = 'home', label = 'Tabs' } = {}) => `
    <div class="tabs" role="tablist" aria-label="${esc(label)}">
      ${items.map((t) => `<button class="tab" role="tab" data-action="${kind}-tab" data-tab="${t.id}" aria-selected="${t.id === active}" tabindex="${t.id === active ? 0 : -1}">${esc(t.label)}</button>`).join('')}
    </div>`;

  /* ---------- Banner · Developer Feed (Streams) ---------- */
  C.banner = () => `
    <section class="banner" aria-label="Developer Feed">
      <div class="banner__orb" aria-hidden="true"><img src="${I('banner-orb.svg')}" alt=""></div>
      <div class="banner__pattern" aria-hidden="true">
        <div class="banner__layer banner__layer--dots"><img src="${I('banner-dotgrid.svg')}" alt=""></div>
        <div class="banner__layer banner__layer--streams"><img src="${I('banner-streams.svg')}" alt=""></div>
      </div>
      <div class="banner__content">
        <h1 class="banner__title" style="margin:0">Developer Feed</h1>
        <p class="banner__desc">Explore your feeds from DevHome, Jira, Git, and more all in one place.</p>
      </div>
    </section>`;

  C.breadcrumb = (homeHref) => `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="${homeHref}" data-tip="Back to Developer home">Developer home</a>
      <span class="breadcrumb__sep" aria-hidden="true"><img src="${I('breadcrumb-chevron.svg')}" alt=""></span>
      <span aria-current="page">Developer feed</span>
    </nav>`;

  /* ---------- Status light ---------- */
  C.status = (dot, label, { muted = false, action = '', syncing = false, tip = '' } = {}) => {
    const cls = `statuslight${muted ? ' statuslight--muted' : ''}${syncing ? ' statuslight--syncing' : ''}`;
    const inner = `<img src="${DH.dots[dot]}" alt="">${esc(label)}`;
    return action
      ? `<button class="${cls}" data-action="${action}" ${tip ? `data-tip="${esc(tip)}"` : ''}>${inner}</button>`
      : `<span class="${cls}">${inner}</span>`;
  };

  /* ---------- Buttons ---------- */
  C.refresh = (scope) => `<button class="btn-quiet" data-action="refresh" data-scope="${scope}"><span class="icon-svg icon-svg--refresh">${DH.svg.refresh}</span>Refresh</button>`;
  C.openBtn = (label, action, extra = '') => `<button class="btn btn--secondary btn--icon" data-action="${action}" ${extra}><span class="icon-svg">${DH.svg.linkout}</span>${esc(label)}</button>`;
  C.btn = (label, action, variant = 'accent', extra = '') => `<button class="btn btn--${variant}" data-action="${action}" ${extra}>${esc(label)}</button>`;

  /* ---------- Section header · Feed tab ---------- */
  C.sechead = (title, desc, actions = '') => `
    <div class="sechead">
      <div class="sechead__text"><h2 class="sechead__title" style="margin:0">${esc(title)}</h2><p class="sechead__desc">${esc(desc)}</p></div>
      ${actions ? `<div class="sechead__actions">${actions}</div>` : ''}
    </div>`;

  /* ---------- In-line alert ---------- */
  C.alert = (variant, title, body, btnLabel, action) => `
    <div class="alert alert--${variant}" role="status">
      <div class="alert__content"><p class="alert__title">${esc(title)}</p><p class="alert__body">${esc(body)}</p></div>
      ${C.btn(btnLabel, action, 'outline')}
    </div>`;

  /* ---------- PR KPI card ---------- */
  C.kpi = ({ id, tone, icon, glyph = false, label, dot, status, value, active = false }) => `
    <button class="kpi${active ? ' is-active' : ''}" role="link" data-action="kpi" data-kpi="${id}" aria-pressed="${active}">
      <span class="kpi__tile tone-${tone}"><img class="${glyph ? 'glyph' : ''}" src="${I(icon)}" alt=""></span>
      <span class="kpi__left">
        <span class="kpi__label ellipsis">${esc(label)}</span>
        <span class="kpi__status"><img src="${I(dot)}" alt="">${esc(status)}</span>
      </span>
      <span class="kpi__right"><span class="kpi__value">${esc(value)}</span><img src="${I('chevron-right-20.svg')}" alt=""></span>
    </button>`;

  /* ---------- Picker (M) ---------- */
  C.picker = (id, label, value) => `
    <div class="picker" data-picker="${id}">
      <div class="field-label" id="lbl-${id}">${esc(label)}</div>
      <button class="picker__field" data-action="picker" data-picker="${id}" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="lbl-${id} val-${id}">
        <span class="picker__value ellipsis" id="val-${id}">${esc(value)}</span>
        <img class="picker__chev" src="${I('s2-chevron.svg')}" alt="">
      </button>
    </div>`;

  /* ---------- Menu (dropdown list) ---------- */
  C.menu = (options, selected, { plain = false, linkout = false } = {}) => `
    ${options.map((o) => {
      const sel = !plain && o.value === selected;
      return `<button class="menu__item${sel ? ' is-selected' : ''}" role="${plain ? 'menuitem' : 'option'}" aria-selected="${sel}" data-value="${esc(o.value)}">
        ${sel ? `<span class="menu__check"><img src="${I('checkmark.svg')}" alt=""></span>` : ''}
        <span class="menu__text">${esc(o.label)}</span>
        ${linkout ? `<span class="menu__action"><img src="${I('linkout-12.svg')}" alt=""></span>` : ''}
      </button>`;
    }).join('')}`;

  /* ---------- Segmented control ---------- */
  C.segmented = (id, items, value) => `
    <div class="segmented" role="radiogroup" aria-label="Show">
      ${items.map((it) => `<button class="segmented__item" role="radio" aria-checked="${it.value === value}" data-action="segment" data-seg="${id}" data-value="${it.value}">${esc(it.label)}</button>`).join('')}
    </div>`;

  /* ---------- Search field ---------- */
  C.search = (id, placeholder, value = '') => `
    <label class="search${value ? ' has-value' : ''}" data-search="${id}">
      <img src="${I('search.svg')}" alt="">
      <span class="sr-only">${esc(placeholder)}</span>
      <input type="search" data-input="${id}" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off">
      <button class="search__clear" type="button" data-action="clear-search" data-search="${id}" aria-label="Clear search"><img src="${I('close.svg')}" alt=""></button>
    </label>`;

  /* ---------- Table ---------- */
  // cols: [{ label, w (px) | 'grow' }]
  C.table = (id, cols, rowsHtml, { autoHead = false, minWidth = 0 } = {}) => `
    <div class="table-wrap" data-table="${id}">
      <div class="table-scroll">
        <div class="table" role="table" style="${minWidth ? `min-width:${minWidth}px` : ''}">
          <div class="thead${autoHead ? ' thead--auto' : ''}" role="row">
            ${cols.map((c) => `<div class="tcell ${c.w === 'grow' ? 'tcell--grow' : ''}" role="columnheader" style="${c.w === 'grow' ? '' : `width:${c.w}px`}">${esc(c.label)}</div>`).join('')}
          </div>
          <div class="tbody" role="rowgroup">${rowsHtml}</div>
        </div>
      </div>
    </div>`;
  C.cell = (w, html, cls = '') => `<div class="tcell ${w === 'grow' ? 'tcell--grow' : ''} ${cls}" role="cell" style="${w === 'grow' ? '' : `width:${w}px`}">${html}</div>`;
  C.statusCell = (dot, label, muted) => `<span class="statuslight${muted ? ' statuslight--muted' : ''}"><img src="${DH.dots[dot]}" alt="">${esc(label)}</span>`;
  C.noResults = (scope) => `<div class="tempty">No results match your filters.<button data-action="clear-filters" data-scope="${scope}">Clear filters</button></div>`;
  C.skeletonRows = (cols, n = 5) => Array.from({ length: n }, () => `
    <div class="trow" role="row" aria-hidden="true">${cols.map((c, i) => C.cell(c.w, `<span class="skel" style="width:${i === 0 ? 70 : 40 + ((i * 17) % 40)}%"></span>`)).join('')}</div>`).join('');

  /* ---------- Attendees ---------- */
  C.attendees = (m, idx) => `
    <div class="attendees">
      ${m.shown.map((src, i) => `<span class="attendees__avatar" style="z-index:${5 - i}"><img src="${src}" alt=""></span>`).join('')}
      ${m.more ? `<button class="attendees__more" data-action="attendees" data-index="${idx}" aria-haspopup="dialog" aria-expanded="false" aria-label="Show all ${m.shown.length + m.more} attendees">+${m.more}</button>` : ''}
    </div>`;

  /* ---------- Empty state ---------- */
  // iconAction: optional attributes that turn the grey icon circle into a button
  C.empty = ({ icon, iconHtml, title, desc, actions = '', variant = '', iconAction = '' }) => `
    <div class="empty panel-in${variant ? ` empty--${variant}` : ''}">
      ${iconAction
    ? `<button class="empty__icon empty__icon--btn" ${iconAction}>${iconHtml || `<img src="${I(icon)}" alt="">`}</button>`
    : `<div class="empty__icon">${iconHtml || `<img src="${I(icon)}" alt="">`}</div>`}
      <div class="empty__msg"><p class="empty__title">${esc(title)}</p><p class="empty__desc">${esc(desc)}</p></div>
      ${actions ? `<div class="empty__actions">${actions}</div>` : ''}
    </div>`;

  DH.C = C;
})(window.DH);
