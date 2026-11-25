/* =========================================================================
   Developer Home · app controller
   - Views: Home (3 designed tabs) and Developer Feed (4 tabs + states)
   - State lives in memory and sessionStorage. It is FRONTEND SIMULATION ONLY:
     no GitHub / Jira / Calendar / Self-service APIs are called.
   ========================================================================= */
(function (DH) {
  const { C } = DH;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const main = $('#main');
  const I = (n) => `assets/icons/${n}`;

  /* ---------------- State ---------------- */
  const DEFAULTS = {
    homeTab: 'prs',
    // First visit starts on the empty / not-connected states; buttons reveal content
    gh: 'not-connected',    // connected | both | corp-vpn | saas | not-connected
    jira: 'disconnected',   // connected | disconnected
    cal: 'disconnected',    // connected | disconnected
    runs: 'empty',          // data | empty
    // Developer Home tabs start on the same empty states as the feed; a button reveals the cards
    home: { prs: false, jira: false, meetings: false },
    pr: { kind: 'all', repo: 'all' },
    jf: { type: 'all', priority: 'all', status: 'all' },
    rf: { show: 'mine', status: 'all', q: '' },
  };
  const saved = JSON.parse(sessionStorage.getItem('dh-state-v2') || 'null');
  const S = Object.assign(structuredClone(DEFAULTS), saved || {});
  S.home = Object.assign({ prs: false, jira: false, meetings: false }, S.home);
  const T = { loading: {}, syncing: {} }; // transient, not persisted
  const persist = () => sessionStorage.setItem('dh-state-v2', JSON.stringify(S));
  DH.state = S;

  const VALID = { gh: ['connected', 'both', 'corp-vpn', 'saas', 'not-connected'], jira: ['connected', 'disconnected'], cal: ['connected', 'disconnected'], runs: ['data', 'empty'] };
  const applyQuery = (q) => {
    Object.keys(VALID).forEach((k) => { if (q[k] && VALID[k].includes(q[k])) S[k] = q[k]; });
    persist();
  };

  /* ---------------- Left rail ---------------- */
  const RAIL = [
    { id: 'home', label: 'Home', icon: 'home.svg', iconSel: 'home-selected.svg', full: true },
    { id: 'selfservice', label: 'Self Service', icon: 'add-nav.svg', full: true },
    { id: 'catalog', label: 'Catalog', icon: 'view-grid.svg' },
    { id: 'tools', label: 'Tools', icon: 'tools-nav.svg' },
    { id: 'docs', label: 'Docs', icon: 'docs-nav.svg' },
    { id: 'community', label: 'Community', icon: 'community-nav.svg' },
  ];
  const renderRail = () => {
    $('#rail').innerHTML = `
      <button class="rail__item" data-action="rail" data-id="apps" data-tip="All apps" aria-label="All apps"><span class="rail__icon"><img src="${I('apps-all.svg')}" alt=""></span></button>
      ${RAIL.map((r) => `
        <a class="rail__item" href="${r.id === 'home' ? `#/home/${S.homeTab}` : '#'}" data-action="rail" data-id="${r.id}" ${r.id === 'home' ? 'aria-current="page"' : ''}>
          <span class="rail__icon"><img class="${r.full ? 'full' : ''}" src="${I(r.id === 'home' ? r.iconSel : r.icon)}" alt=""></span>${r.label}
        </a>`).join('')}`;
  };
  const drawerHtml = () => `
    <div class="drawer__head"><span class="topnav__logo" style="position:static"><img src="${I('adobe-logo.svg')}" alt="">Developer Home</span>
      <button class="popover__close" data-action="drawer-close" aria-label="Close navigation"><img src="${I('close.svg')}" alt=""></button></div>
    ${RAIL.map((r) => `<a class="drawer__item" href="${r.id === 'home' ? `#/home/${S.homeTab}` : '#'}" data-action="rail" data-id="${r.id}" ${r.id === 'home' ? 'aria-current="page"' : ''}>
      <img src="${I(r.icon === 'home.svg' ? 'home.svg' : r.icon)}" alt="">${r.label}</a>`).join('')}`;

  /* ======================================================================
     HOME
     ====================================================================== */
  // Home tab empty states reuse the Developer Feed empty-state designs (icon, copy, buttons, motion)
  const HOME_EMPTY = {
    prs: () => C.empty({ variant: 'github', icon: 'github.svg', title: 'You’re not connected to GitHub', desc: 'Connect to GitHub to view and manage your pull requests.',
      actions: C.btn('Connect to GitHub SaaS', 'home-reveal', 'accent', 'data-tab="prs" data-msg="GitHub SaaS connected (simulated)."')
        + C.btn('Connect to GitHub Corp', 'home-reveal', 'secondary', 'data-tab="prs" data-msg="GitHub Corp connected (simulated)."') }),
    jira: () => C.empty({ variant: 'jira', iconHtml: `<span class="jira-mark"><img src="${I('jira-group.svg')}" alt=""></span>`, title: 'You’re not connected to Jira', desc: 'Please log in here to see your pull requests.',
      actions: C.btn('Login', 'home-reveal', 'accent', 'data-tab="jira" data-msg="Signed in to Jira (simulated)."') }),
    meetings: () => C.empty({ variant: 'calendar', iconHtml: `<span class="cal-icon">${DH.svg.calendar36}</span>`, title: 'Your calendar isn’t connected', desc: 'Connect your calendar to see today’s meetings, time booked, and agendas here.',
      actions: C.btn('Connect calendar', 'home-reveal', 'accent', 'data-tab="meetings" data-msg="Calendar connected (simulated)."') }),
  };
  const homePanel = (tab) => {
    const t = DH.homeTabs.find((x) => x.id === tab);
    if (HOME_EMPTY[tab] && !S.home[tab]) return HOME_EMPTY[tab]().replace('class="empty', 'class="empty empty--home');
    if (tab === 'prs') return `<div class="card-grid">${DH.homePRs.map(C.prCard).join('')}</div>${viewAll('github')}`;
    if (tab === 'jira') return `<div class="card-grid">${DH.homeJira.map(C.jiraCard).join('')}</div>${viewAll('jira')}`;
    if (tab === 'meetings') return `<div class="card-grid">${DH.homeMeetings.map(C.meetingCard).join('')}</div>${viewAll('meetings')}`;
    // Tabs present in the tab bar but not designed in this Figma section
    return C.empty({ icon: 'folder-search.svg', title: 'No items to display', desc: 'There’s nothing to display here right now.' }).replace('class="empty', 'class="empty empty--compact');
  };
  // "View All" always lands on that feed tab's empty / not-connected state
  const EMPTY_QUERY = { github: 'gh=not-connected', jira: 'jira=disconnected', meetings: 'cal=disconnected' };
  const viewAll = (feed) => `<a class="link-viewall" href="#/feed/${feed}?${EMPTY_QUERY[feed]}">View All</a>`;

  const renderHome = (tab, opts) => {
    const existing = $('.home', main);
    if (existing && opts.samePage) {
      $$('.home-tabs .tab', main).forEach((b) => { const sel = b.dataset.tab === tab; b.setAttribute('aria-selected', sel); b.tabIndex = sel ? 0 : -1; });
      const panel = $('#homePanel', main);
      panel.innerHTML = homePanel(tab);
      panel.classList.remove('panel-in'); void panel.offsetWidth; panel.classList.add('panel-in');
      return;
    }
    main.innerHTML = `
      <div class="view page home" data-name="Main Content Container">
        <button class="home__info" data-action="tips" data-tip="Tips" aria-label="Tips"><img src="${I('lightbulb.svg')}" alt=""></button>
        <section class="hero" data-name="Main Header Container">
          <div class="hero__text">
            <p class="hero__greet">${greeting()}, Ronit</p>
            <h1 class="hero__title" style="margin:0"><span>Write better software faster with</span> <span>Developer Home</span></h1>
          </div>
          <form class="search-xl" data-action="ask-ai-form" role="search">
            <label class="sr-only" for="askInput">Describe what you want to build or find</label>
            <input id="askInput" type="text" placeholder="Describe what you want to build or find..." autocomplete="off">
            <button class="ask-ai" type="submit"><span class="ask-ai__label">Ask AI</span><span class="ask-ai__icon">${DH.svg.askai}</span></button>
          </form>
        </section>
        <section class="home__body" data-name="Quick Links Container">
          <div class="quicklinks">
            ${DH.quickLinks.map((q, i) => `
              <button class="quicklink" data-action="quicklink" data-index="${i}">
                <span class="quicklink__icon"><img src="${q.icon}" alt=""></span>
                <span class="quicklink__text"><span class="quicklink__title">${q.title}</span><span class="quicklink__desc">${q.desc}</span></span>
              </button>`).join('')}
          </div>
          <div class="home-tabs">
            <div class="home-tabs__row tabs-scroll">${C.tabs(DH.homeTabs, tab, { kind: 'home', label: 'Developer Home content' })}</div>
            <div class="home-tabs__panel panel-in" id="homePanel" role="tabpanel" style="display:flex;flex-direction:column;align-items:center;gap:24px">${homePanel(tab)}</div>
          </div>
        </section>
      </div>`;
  };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };

  /* ======================================================================
     DEVELOPER FEED
     ====================================================================== */
  const FEED_TABS = [
    { id: 'github', label: 'GitHub PRs' }, { id: 'jira', label: 'Jira Issues' },
    { id: 'meetings', label: 'Meetings' }, { id: 'runs', label: 'Self Service Runs' },
  ];

  /* ---------- GitHub PRs ---------- */
  const PR_COLS = [{ label: 'PR title', w: 'grow' }, { label: 'PR kind', w: 164 }, { label: 'Author', w: 112 }, { label: 'LOC changed', w: 124 }, { label: 'Opened', w: 112 }, { label: 'Last updated', w: 116 }, { label: 'Repo', w: 236 }];
  const PR_KIND_OPTS = [{ value: 'all', label: 'All' }, { value: 'review', label: 'Requires my review' }, { value: 'mine', label: 'My PR' }];
  const prRows = () => {
    let rows = DH.pullRequests;
    if (S.gh === 'saas') rows = rows.filter((r) => r.source === 'saas');
    if (S.pr.kind !== 'all') rows = rows.filter((r) => r.kind === S.pr.kind);
    if (S.pr.repo !== 'all') rows = rows.filter((r) => r.repo === S.pr.repo);
    return rows;
  };
  const prRowsHtml = () => {
    if (T.loading.github || T.syncing.github) return C.skeletonRows(PR_COLS, 6);
    const rows = prRows();
    if (!rows.length) return C.noResults('pr');
    return rows.map((r) => {
      const k = DH.prKinds[r.kind];
      return `<div class="trow" role="row" data-row="${DH.esc(r.title)}">
        ${C.cell('grow', `<button class="t-link ellipsis" data-action="open-external" data-what="${DH.esc(r.title)}" data-where="GitHub">${DH.esc(r.title)}</button>`)}
        ${C.cell(164, C.statusCell(k.dot, k.label, k.muted))}
        ${C.cell(112, `<span class="ellipsis">${r.author}</span>`)}
        ${C.cell(124, `<span class="loc"><span class="add">+${r.add}</span><span class="sep">/</span><span class="del">-${r.del}</span></span>`)}
        ${C.cell(112, `<span class="ellipsis">${r.opened}</span>`)}
        ${C.cell(116, `<span class="ellipsis">${r.updated}</span>`)}
        ${C.cell(236, `<span class="ellipsis t-dark">${r.repo}</span>`)}
      </div>`;
    }).join('');
  };
  const ghStatuses = () => {
    if (T.syncing.github) return C.status('blue', 'Syncing with GitHub…', { syncing: true });
    switch (S.gh) {
      case 'connected': return C.status('green', 'Connected to GitHub', { action: 'conn-info', tip: 'Signed in to GitHub as ronitk' });
      case 'both': return C.status('green', 'GitHub Corp · Connected', { action: 'conn-info', tip: 'git.corp.adobe.com' }) + C.status('green', 'GitHub SaaS · Connected', { action: 'conn-info', tip: 'github.com' });
      case 'corp-vpn': return C.status('green', 'GitHub Corp · Connected', { action: 'conn-info', tip: 'git.corp.adobe.com' }) + C.status('orange', 'GitHub SaaS · VPN required', { action: 'connect-vpn', tip: 'Connect to Adobe VPN' });
      case 'saas': return C.status('gray', 'GitHub Corp · Not connected', { muted: true, action: 'connect-corp', tip: 'Connect to GitHub Corp' }) + C.status('green', 'GitHub SaaS · Connected', { action: 'conn-info', tip: 'github.com' });
      default: return C.status('gray', 'Not connected', { muted: true });
    }
  };
  const githubPanel = () => {
    const head = (actions) => C.sechead('Your raised Git PRs', 'Track pull requests you created, are assigned to, or need to review.', actions);
    if (S.gh === 'not-connected' && !T.syncing.github) {
      return `<div class="feed-top"><div class="feed-head">${head(ghStatuses())}</div></div>
        ${C.empty({ variant: 'github', icon: 'github.svg', title: 'You’re not connected to GitHub', desc: 'Connect to GitHub to view and manage your pull requests.',
          actions: C.btn('Connect to GitHub SaaS', 'gh-connect', 'accent', 'data-target="saas"') + C.btn('Connect to GitHub Corp', 'gh-connect', 'secondary', 'data-target="corp-vpn"') })}`;
    }
    const k = DH.prKpis[S.gh] || DH.prKpis.connected;
    const alert = S.gh === 'corp-vpn'
      ? C.alert('notice', 'GitHub SaaS requires VPN', 'Connect to the Adobe VPN to access GitHub SaaS pull requests. GitHub Corp data remains available.', 'Connect to Adobe VPN', 'connect-vpn')
      : S.gh === 'saas'
        ? C.alert('informative', 'GitHub Corp isn’t connected', 'Connect to GitHub Corp to access GitHub Corp pull requests. GitHub SaaS data remains available.', 'Connect to GitHub Corp', 'connect-corp')
        : '';
    const kpis = `<div class="kpis">
      ${C.kpi({ id: 'pr-mine', tone: 'info', icon: 'kpi-pr-glyph.svg', glyph: true, label: 'Your PRs', dot: 'kpi-dot-blue.svg', status: k.yours[1], value: k.yours[0] })}
      ${C.kpi({ id: 'pr-review', tone: 'notice', icon: 'kpi-review.svg', label: 'Awaiting Your Review', dot: 'kpi-dot-orange.svg', status: k.review[1], value: k.review[0] })}
    </div>`;
    const actions = ghStatuses() + C.refresh('github') + C.openBtn('Open GitHub', 'open-github-menu', 'aria-haspopup="menu" aria-expanded="false"');
    return `
      <div class="feed-top"><div class="feed-head">${head(actions)}
        ${alert ? `<div style="display:flex;flex-direction:column;gap:${S.gh === 'saas' ? 16 : 20}px">${alert}${kpis}</div>` : kpis}
      </div></div>
      <div class="feed-body" style="display:flex;flex-direction:column;gap:24px">
        <div class="filters">
          ${C.picker('prKind', 'PR kind', PR_KIND_OPTS.find((o) => o.value === S.pr.kind).label)}
          ${C.picker('prRepo', 'Repo', S.pr.repo === 'all' ? 'All' : S.pr.repo)}
        </div>
        ${C.table('pr', PR_COLS, prRowsHtml(), { minWidth: 1000 })}
      </div>`;
  };

  /* ---------- Jira ---------- */
  const JIRA_COLS = [{ label: 'Issue type', w: 127 }, { label: 'Issue key', w: 141 }, { label: 'Issue summary', w: 'grow' }, { label: 'Created', w: 119 }, { label: 'Last updated', w: 119 }, { label: 'Priority', w: 81 }, { label: 'Assignee', w: 91 }, { label: 'Reporter', w: 100 }, { label: 'Status', w: 128 }];
  const uniq = (arr) => [...new Set(arr)];
  const JIRA_OPTS = {
    jType: () => [{ value: 'all', label: 'All' }, ...uniq(DH.jiraIssues.map((r) => r.type)).map((v) => ({ value: v, label: v }))],
    jPriority: () => [{ value: 'all', label: 'All' }, { value: 'crit-block', label: 'Critical or blocking' }, ...['Blocking', 'Critical', 'High', 'Normal'].map((v) => ({ value: v, label: v }))],
    jStatus: () => [{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, ...Object.keys(DH.jiraStatusDot).map((v) => ({ value: v, label: v }))],
  };
  const optLabel = (id, v) => (JIRA_OPTS[id]().find((o) => o.value === v) || { label: 'All' }).label;
  const jiraRows = () => DH.jiraIssues.filter((r) =>
    (S.jf.type === 'all' || r.type === S.jf.type) &&
    (S.jf.priority === 'all' || (S.jf.priority === 'crit-block' ? ['Critical', 'Blocking'].includes(r.priority) : r.priority === S.jf.priority)) &&
    (S.jf.status === 'all' || (S.jf.status === 'open' ? r.status !== 'Complete' : r.status === S.jf.status)));
  const jiraRowsHtml = () => {
    if (T.loading.jira || T.syncing.jira) return C.skeletonRows(JIRA_COLS, 6);
    const rows = jiraRows();
    if (!rows.length) return C.noResults('jira');
    return rows.map((r) => `<div class="trow" role="row" data-row="${r.key}">
      ${C.cell(127, `<span class="ellipsis t-dark">${r.type}</span>`)}
      ${C.cell(141, `<span class="ellipsis">${r.key}</span>`)}
      ${C.cell('grow', `<button class="t-link ellipsis" data-action="open-external" data-what="${r.key}" data-where="Jira">${DH.esc(r.summary)}</button>`)}
      ${C.cell(119, `<span class="ellipsis">${r.created}</span>`)}
      ${C.cell(119, `<span class="ellipsis">${r.updated}</span>`)}
      ${C.cell(81, `<span class="ellipsis t-dark">${r.priority}</span>`)}
      ${C.cell(91, `<span class="ellipsis">${r.assignee}</span>`)}
      ${C.cell(100, `<span class="ellipsis">${r.reporter}</span>`)}
      ${C.cell(128, C.statusCell(DH.jiraStatusDot[r.status], r.status))}
    </div>`).join('');
  };
  const jiraPanel = () => {
    const head = (a) => C.sechead('Jira issues', 'Issues assigned to you or reported by you, across your Jira projects.', a);
    if (S.jira === 'disconnected' && !T.syncing.jira) {
      return `<div class="feed-top"><div class="feed-head">${head(C.status('gray', 'Not connected', { muted: true }))}</div></div>
        ${C.empty({ variant: 'jira', iconHtml: `<span class="jira-mark"><img src="${I('jira-group.svg')}" alt=""></span>`, title: 'You’re not connected to Jira', desc: 'Please log in here to see your pull requests.', actions: C.btn('Login', 'jira-login') })}`;
    }
    const status = T.syncing.jira ? C.status('blue', 'Syncing with Jira…', { syncing: true }) : C.status('green', 'Connected to Jira');
    return `
      <div class="feed-top"><div class="feed-head">
        ${head(status + C.refresh('jira') + C.openBtn('Open Jira', 'open-jira'))}
        <div class="kpis kpis--3">
          ${C.kpi({ id: 'j-open', tone: 'notice', icon: 'kpi-list.svg', label: 'Open issues', dot: 'kpi-dot-orange.svg', status: '8 total · 1 complete', value: 7 })}
          ${C.kpi({ id: 'j-progress', tone: 'info', icon: 'kpi-clock-pending.svg', label: 'In progress', dot: 'kpi-dot-blue.svg', status: '1 more in review', value: 2 })}
          ${C.kpi({ id: 'j-critical', tone: 'negative', icon: 'kpi-flag.svg', label: 'Critical or blocking', dot: 'kpi-dot-red.svg', status: '1 blocking · 2 critical', value: 3 })}
        </div>
      </div></div>
      <div class="feed-body" style="display:flex;flex-direction:column;gap:24px">
        <div class="filters">
          ${C.picker('jType', 'Issue type', optLabel('jType', S.jf.type))}
          ${C.picker('jPriority', 'Priority', optLabel('jPriority', S.jf.priority))}
          ${C.picker('jStatus', 'Status', optLabel('jStatus', S.jf.status))}
        </div>
        ${C.table('jira', JIRA_COLS, jiraRowsHtml(), { minWidth: 1100 })}
      </div>`;
  };

  /* ---------- Meetings ---------- */
  const MEET_COLS = [{ label: 'Time', w: 152 }, { label: 'Meeting', w: 220 }, { label: 'Duration', w: 72 }, { label: 'Location', w: 144 }, { label: 'Attendees', w: 136 }, { label: 'Agenda', w: 'grow' }];
  const meetingsPanel = () => {
    const head = (a) => C.sechead('Meetings', 'Everything you need to know about today\'s meetings, at a glance.', a);
    if (S.cal === 'disconnected' && !T.syncing.cal) {
      return `<div class="feed-top"><div class="feed-head">${head(C.status('red', 'Calendar not connected'))}</div></div>
        ${C.empty({ variant: 'calendar', iconHtml: `<span class="cal-icon">${DH.svg.calendar36}</span>`, title: 'Your calendar isn’t connected', desc: 'Connect your calendar to see today’s meetings, time booked, and agendas here.', actions: C.btn('Connect calendar', 'cal-connect') })}`;
    }
    const status = T.syncing.cal ? C.status('blue', 'Syncing calendar…', { syncing: true }) : C.status('green', 'Connected to Calendar', { action: 'conn-info', tip: 'Outlook calendar · synced just now' });
    const rows = T.syncing.cal ? C.skeletonRows(MEET_COLS, 6) : DH.meetings.map((m, i) => `
      <div class="trow trow--auto" role="row" data-row="${DH.esc(m.title)}">
        ${C.cell(152, `<span class="ellipsis t-dark">${m.time}</span>`)}
        ${C.cell(220, `<button class="t-link ellipsis" data-action="open-external" data-what="${DH.esc(m.title)}" data-where="Outlook">${DH.esc(m.title)}</button>`)}
        ${C.cell(72, `<span class="ellipsis">${m.dur}</span>`)}
        ${C.cell(144, `<img src="${I(m.locIcon === 's2' ? 'location-s2.svg' : 'location-16.svg')}" alt=""><span class="ellipsis t-dark">${m.loc}</span>`, 'tcell--location')}
        ${C.cell(136, C.attendees(m, i))}
        ${C.cell('grow', `<span>${DH.esc(m.agenda)}</span>`)}
      </div>`).join('');
    return `
      <div class="feed-top"><div class="feed-head">
        ${head(status)}
        <div class="kpis kpis--3">
          ${C.kpi({ id: 'm-today', tone: 'info', icon: 'kpi-calendar.svg', label: 'Meetings today', dot: 'kpi-dot-blue.svg', status: '9:00 AM – 4:30 PM', value: 6 })}
          ${C.kpi({ id: 'm-time', tone: 'notice', icon: 'kpi-clock.svg', label: 'Time in meetings', dot: 'kpi-dot-orange.svg', status: 'Across 6 meetings', value: '3h 15m' })}
        </div>
      </div></div>
      <div class="feed-body">${C.table('meetings', MEET_COLS, rows, { autoHead: true, minWidth: 1000 })}</div>`;
  };

  /* ---------- Self Service Runs ---------- */
  const RUN_COLS = [{ label: 'Self-service templates', w: 'grow' }, { label: 'Status', w: 160 }, { label: 'Created', w: 220 }, { label: 'Owner', w: 180 }, { label: 'Actions', w: 140 }];
  const RUN_STATUS_OPTS = [{ value: 'all', label: 'All statuses' }, { value: 'Completed', label: 'Completed' }, { value: 'Failed', label: 'Failed' }];
  const runsScope = () => DH.runs.filter((r) => S.rf.show === 'all' || r.mine);
  const runRows = () => {
    const q = S.rf.q.trim().toLowerCase();
    return runsScope().filter((r) => (S.rf.status === 'all' || r.status === S.rf.status) && (!q || r.template.toLowerCase().includes(q) || r.owner.toLowerCase().includes(q)));
  };
  const runRowsHtml = () => {
    if (T.loading.runs) return C.skeletonRows(RUN_COLS, 5);
    const rows = runRows();
    if (!rows.length) return C.noResults('runs');
    return rows.map((r) => `<div class="trow" role="row">
      ${C.cell('grow', `<button class="t-link ellipsis" data-action="open-run" data-what="${DH.esc(r.template)}">${DH.esc(r.template)}</button>`)}
      ${C.cell(160, C.statusCell(DH.runStatusDot[r.status], r.status))}
      ${C.cell(220, `<span class="ellipsis">${r.created}</span>`)}
      ${C.cell(180, `<span class="ellipsis">${r.owner}</span>`)}
      ${C.cell(140, `<button class="t-link t-link--regular ellipsis" data-action="run-logs" data-what="${DH.esc(r.template)} · ${r.created}">View run logs</button>`)}
    </div>`).join('');
  };
  const runsKpis = () => {
    const scope = runsScope();
    const ok = scope.filter((r) => r.status === 'Completed').length, bad = scope.filter((r) => r.status === 'Failed').length;
    return `<div class="kpis kpis--3">
      ${C.kpi({ id: 'r-success', tone: 'positive', icon: 'kpi-check.svg', label: 'Success', dot: 'kpi-dot-green.svg', status: `${ok} of ${scope.length} runs completed`, value: ok })}
      ${C.kpi({ id: 'r-failed', tone: 'negative', icon: 'kpi-alert.svg', label: 'Failures', dot: 'kpi-dot-red.svg', status: `${bad} runs failed`, value: bad })}
    </div>`;
  };
  const runsPanel = () => {
    const head = (a) => C.sechead('Self-service template runs', 'Track progress, review outcomes, and view logs for your template runs.', a);
    if (S.runs === 'empty') {
      return `<div class="feed-top"><div class="feed-head">${head('')}</div></div>
        ${C.empty({ variant: 'rocket', iconHtml: `<span class="rocket">${DH.svg.rocket}</span>`, title: 'No self-service runs yet', desc: 'Create a service from a self-service template, and your runs will show up here.',
          actions: C.btn('Create a service', 'create-service') + C.btn('Browse all templates', 'browse-templates', 'secondary') })}`;
    }
    return `
      <div class="feed-top"><div class="feed-head">
        ${head(C.refresh('runs') + C.openBtn('Browse templates', 'browse-templates'))}
        <div id="runsKpis">${runsKpis()}</div>
      </div></div>
      <div class="feed-body" style="display:flex;flex-direction:column;gap:24px">
        <div class="filters filters--end">
          <div><div class="field-label">Show</div>${C.segmented('show', [{ value: 'mine', label: 'My runs' }, { value: 'all', label: 'All runs' }], S.rf.show)}</div>
          ${C.picker('rStatus', 'Status', RUN_STATUS_OPTS.find((o) => o.value === S.rf.status).label)}
          <div class="spacer"></div>
          ${C.search('runs', 'Search by template name or owner', S.rf.q)}
        </div>
        ${C.table('runs', RUN_COLS, runRowsHtml(), { minWidth: 860 })}
      </div>`;
  };

  const PANELS = { github: githubPanel, jira: jiraPanel, meetings: meetingsPanel, runs: runsPanel };
  let currentFeedTab = 'github';

  const renderFeed = (tab, opts = {}) => {
    currentFeedTab = tab;
    const existing = $('.feed', main);
    if (!existing || !opts.samePage) {
      main.innerHTML = `
        <div class="view page feed" data-name="Feed Content Container">
          ${C.breadcrumb(`#/home/${S.homeTab}`)}
          <div class="feed__content">
            ${C.banner()}
            <section class="feed-tab">
              <div class="tabbar tabs-scroll">${C.tabs(FEED_TABS, tab, { kind: 'feed', label: 'Developer Feed' })}</div>
              <div id="feedPanel" role="tabpanel" class="panel-in" style="display:flex;flex-direction:column;gap:24px"></div>
            </section>
          </div>
        </div>`;
    } else {
      $$('.feed-tab .tab', main).forEach((b) => { const sel = b.dataset.tab === tab; b.setAttribute('aria-selected', sel); b.tabIndex = sel ? 0 : -1; });
    }
    renderPanel(!opts.keepAnim);
  };
  const renderPanel = (animate = true) => {
    const panel = $('#feedPanel');
    if (!panel) return;
    DH.closeMenu(); DH.closePopover(false);
    panel.innerHTML = PANELS[currentFeedTab]();
    if (animate) { panel.classList.remove('panel-in'); void panel.offsetWidth; panel.classList.add('panel-in'); }
  };
  const refreshTable = (scope) => {
    const map = { pr: ['pr', prRowsHtml], jira: ['jira', jiraRowsHtml], runs: ['runs', runRowsHtml] };
    const [id, fn] = map[scope];
    const body = $(`[data-table="${id}"] .tbody`);
    if (body) body.innerHTML = fn();
    if (scope === 'runs' && $('#runsKpis')) $('#runsKpis').innerHTML = runsKpis();
  };
  const setPickerValue = (id, label) => { const v = $(`#val-${id}`); if (v) v.textContent = label; };
  const scrollToTable = (id) => $(`[data-table="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  /* ---------- Simulated async ---------- */
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  // syncKey: transient "Syncing…" flag; stateKey: persisted connection state
  const simulateConnect = async (syncKey, stateKey, target, msg) => {
    T.syncing[syncKey] = true; renderPanel(false);
    await wait(1200);
    T.syncing[syncKey] = false; S[stateKey] = target; persist(); renderPanel(false);
    DH.toast(msg, 'positive');
  };

  const showRuns = async (el, msg) => {
    el.classList.add('is-loading');
    await wait(900);
    S.runs = 'data'; persist(); renderPanel(false);
    DH.toast(msg, 'positive');
  };

  /* ======================================================================
     ROUTES
     ====================================================================== */
  DH.route('/home/:tab', ({ tab }, q, opts) => {
    if (!DH.homeTabs.some((t) => t.id === tab)) return DH.navigate('#/home/prs', { replace: true });
    S.homeTab = tab; persist();
    renderHome(tab, opts);
    renderRail();
    document.title = 'Developer Home';
  });
  DH.route('/feed/:tab', ({ tab }, q, opts) => {
    if (!PANELS[tab]) return DH.navigate('#/feed/github', { replace: true });
    // Entering the Self Service Runs tab always starts on its zero-data state
    const enteringRuns = tab === 'runs' && !(opts.samePage && currentFeedTab === 'runs');
    if (enteringRuns && !q.runs) { S.runs = 'empty'; persist(); }
    applyQuery(q);
    renderFeed(tab, opts);
    renderRail();
    document.title = `Developer feed · ${FEED_TABS.find((t) => t.id === tab).label}`;
    if (!opts.samePage) window.scrollTo({ top: 0 });
    if (q.open) setTimeout(() => openOverlay(q.open), 260);
    if (pendingFlash) { const f = pendingFlash; pendingFlash = null; setTimeout(() => flashRow(f), 280); }
  });
  DH.route('/home', () => DH.navigate(`#/home/${S.homeTab}`, { replace: true }));
  DH.route('/feed', () => DH.navigate('#/feed/github', { replace: true }));

  let pendingFlash = null;
  const flashRow = (key) => {
    const row = $$('.trow[data-row]').find((r) => r.dataset.row === key);
    if (!row) return;
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.remove('is-flash'); void row.offsetWidth; row.classList.add('is-flash');
  };

  /* ---------- Open designed overlay states directly (QA / deep links) ---------- */
  const openOverlay = (what) => {
    if (what === 'prKind' || what === 'prRepo') $(`.picker__field[data-picker="${what}"]`)?.click();
    if (what === 'ghMenu') $('[data-action="open-github-menu"]')?.click();
    if (what.startsWith('attendees')) $(`.attendees__more[data-index="${what.replace('attendees', '') || 0}"]`)?.click();
  };

  /* ======================================================================
     EVENTS (delegated)
     ====================================================================== */
  const PICKERS = {
    prKind: { opts: () => PR_KIND_OPTS, get: () => S.pr.kind, set: (v) => { S.pr.kind = v; }, scope: 'pr', width: 220 },
    prRepo: { opts: () => [{ value: 'all', label: 'All' }, ...DH.prRepos.map((r) => ({ value: r, label: r }))], get: () => S.pr.repo, set: (v) => { S.pr.repo = v; }, scope: 'pr', width: 300 },
    jType: { opts: JIRA_OPTS.jType, get: () => S.jf.type, set: (v) => { S.jf.type = v; }, scope: 'jira', width: 220 },
    jPriority: { opts: JIRA_OPTS.jPriority, get: () => S.jf.priority, set: (v) => { S.jf.priority = v; }, scope: 'jira', width: 220 },
    jStatus: { opts: JIRA_OPTS.jStatus, get: () => S.jf.status, set: (v) => { S.jf.status = v; }, scope: 'jira', width: 220 },
    rStatus: { opts: () => RUN_STATUS_OPTS, get: () => S.rf.status, set: (v) => { S.rf.status = v; }, scope: 'runs', width: 220 },
  };
  const setFilter = (id, value) => {
    const p = PICKERS[id]; p.set(value); persist();
    setPickerValue(id, p.opts().find((o) => o.value === value).label);
    refreshTable(p.scope);
  };

  const KPI = {
    'pr-mine': () => { setFilter('prKind', S.pr.kind === 'mine' ? 'all' : 'mine'); scrollToTable('pr'); },
    'pr-review': () => { setFilter('prKind', S.pr.kind === 'review' ? 'all' : 'review'); scrollToTable('pr'); },
    'j-open': () => { setFilter('jStatus', S.jf.status === 'open' ? 'all' : 'open'); scrollToTable('jira'); },
    'j-progress': () => { setFilter('jStatus', S.jf.status === 'In Progress' ? 'all' : 'In Progress'); scrollToTable('jira'); },
    'j-critical': () => { setFilter('jPriority', S.jf.priority === 'crit-block' ? 'all' : 'crit-block'); scrollToTable('jira'); },
    'm-today': () => scrollToTable('meetings'),
    'm-time': () => scrollToTable('meetings'),
    'r-success': () => { setFilter('rStatus', S.rf.status === 'Completed' ? 'all' : 'Completed'); scrollToTable('runs'); },
    'r-failed': () => { setFilter('rStatus', S.rf.status === 'Failed' ? 'all' : 'Failed'); scrollToTable('runs'); },
  };

  const notInSection = (what) => DH.toast(`${what} isn’t part of this Figma section — no screen to show.`, 'neutral');

  const ACTIONS = {
    'home-reveal': async (el) => {
      if (el.classList.contains('is-loading')) return;
      el.classList.add('is-loading');
      await wait(900);
      S.home[el.dataset.tab] = true; persist();
      const panel = $('#homePanel', main);
      if (panel && S.homeTab === el.dataset.tab) {
        panel.innerHTML = homePanel(el.dataset.tab);
        panel.classList.remove('panel-in'); void panel.offsetWidth; panel.classList.add('panel-in');
      }
      DH.toast(el.dataset.msg, 'positive');
    },
    'home-tab': (el) => DH.navigate(`#/home/${el.dataset.tab}`),
    'feed-tab': (el) => DH.navigate(`#/feed/${el.dataset.tab}`),
    quicklink: (el) => {
      const a = DH.quickLinks[+el.dataset.index].action;
      if (a.startsWith('route:')) DH.navigate(a.slice(6)); else DH.toast(a.slice(6), 'neutral');
    },
    'open-pr-card': (el) => {
      const c = DH.homePRs[+el.dataset.index];
      if (DH.pullRequests.some((p) => p.title === c.title)) { pendingFlash = c.title; DH.navigate('#/feed/github'); }
      else DH.toast(`Opening “${c.title}” on GitHub — simulated, no external link in prototype.`);
    },
    'open-jira-card': (el) => {
      const c = DH.homeJira[+el.dataset.index];
      if (DH.jiraIssues.some((j) => j.key === c.key)) { pendingFlash = c.key; DH.navigate('#/feed/jira'); }
      else DH.toast(`Opening ${c.key} in Jira — simulated, no external link in prototype.`);
    },
    'open-meeting-card': (el) => { pendingFlash = DH.homeMeetings[+el.dataset.index].title; DH.navigate('#/feed/meetings'); },
    'ask-ai': () => {
      const q = $('#askInput').value.trim();
      if (!q) { $('#askInput').focus(); DH.toast('Describe what you want to build or find, then press Ask AI.', 'neutral'); return; }
      DH.toast(`AI search for “${q}” is simulated in this prototype.`);
    },
    tips: () => DH.toast('Tip: use “View All” under any tab to open the full Developer Feed.'),
    rail: (el) => {
      const id = el.dataset.id; DH.closeDrawer();
      if (id === 'home') return; // href handles it
      notInSection(id === 'apps' ? 'App switcher' : RAIL.find((r) => r.id === id).label);
    },
    drawer: () => DH.openDrawer(drawerHtml()),
    'drawer-close': () => DH.closeDrawer(),
    'nav-favourites': () => notInSection('Favourites'),
    'nav-help': () => notInSection('Help'),
    'nav-notifications': () => { $('#notifBadge').style.display = 'none'; DH.toast('17 notifications marked as seen (simulated).', 'neutral'); },
    'nav-profile': () => DH.toast('Signed in as Ronit Kumar (mock user).', 'neutral'),
    picker: (el) => {
      const id = el.dataset.picker, p = PICKERS[id];
      DH.openMenu(el, { html: C.menu(p.opts(), p.get()), width: p.width, container: el.closest('.picker'), onPick: (v) => setFilter(id, v) });
    },
    'clear-filters': (el) => {
      const s = el.dataset.scope;
      if (s === 'pr') S.pr = { kind: 'all', repo: 'all' };
      if (s === 'jira') S.jf = { type: 'all', priority: 'all', status: 'all' };
      if (s === 'runs') S.rf = { ...S.rf, status: 'all', q: '' };
      persist(); renderPanel(false);
    },
    kpi: (el) => KPI[el.dataset.kpi](),
    refresh: async (el) => {
      const scope = el.dataset.scope; const tbl = scope === 'github' ? 'pr' : scope;
      if (T.loading[scope]) return;
      T.loading[scope] = true; el.classList.add('is-spinning'); refreshTable(tbl);
      await wait(800);
      T.loading[scope] = false; el.classList.remove('is-spinning'); refreshTable(tbl);
      DH.toast('Updated just now.', 'neutral', 2200);
    },
    'open-github-menu': (el) => DH.openMenu(el, {
      html: C.menu([{ value: 'GitHub SaaS', label: 'GitHub SaaS' }, { value: 'GitHub Corp', label: 'GitHub Corp' }], null, { plain: true, linkout: true }),
      width: 200, align: 'right', container: el.closest('.sechead__actions'), plain: true,
      onPick: (v) => DH.toast(`Opening ${v} in a new tab — simulated, no external link in prototype.`),
    }),
    'open-jira': () => DH.toast('Opening Jira in a new tab — simulated, no external link in prototype.'),
    'open-external': (el) => DH.toast(`Opening “${el.dataset.what}” in ${el.dataset.where} — simulated.`),
    'conn-info': (el) => DH.toast(el.dataset.tip || 'Connected', 'neutral'),
    // Not connected → SaaS only / Corp (+VPN required); alerts complete the connection
    'gh-connect': (el) => { el.classList.add('is-loading'); simulateConnect('github', 'gh', el.dataset.target, el.dataset.target === 'saas' ? 'GitHub SaaS connected (simulated).' : 'GitHub Corp connected (simulated).'); },
    'connect-vpn': (el) => { el.classList.add('is-loading'); simulateConnect('github', 'gh', 'both', 'Adobe VPN connected — GitHub SaaS data is now available (simulated).'); },
    'connect-corp': (el) => { el.classList.add('is-loading'); simulateConnect('github', 'gh', 'both', 'GitHub Corp connected (simulated).'); },
    'jira-login': (el) => { el.classList.add('is-loading'); simulateConnect('jira', 'jira', 'connected', 'Signed in to Jira (simulated).'); },
    'cal-connect': (el) => { el.classList.add('is-loading'); simulateConnect('cal', 'cal', 'connected', 'Calendar connected (simulated).'); },
    // Zero-data buttons reveal the runs table; the header's "Browse templates" stays a notice
    'create-service': (el) => showRuns(el, 'Service created from template (simulated) — your runs are shown below.'),
    'browse-templates': (el) => (S.runs === 'empty' ? showRuns(el, 'Showing your self-service runs (simulated).') : DH.toast('Template catalog isn’t part of this Figma section.', 'neutral')),
    'open-run': (el) => DH.toast(`Run details for “${el.dataset.what}” — simulated.`),
    'run-logs': (el) => DH.toast(`Opening run logs for ${el.dataset.what} — simulated.`),
    segment: (el) => {
      S.rf.show = el.dataset.value; persist();
      $$('.segmented__item', el.parentElement).forEach((b) => b.setAttribute('aria-checked', b === el));
      refreshTable('runs');
    },
    'clear-search': (el) => {
      const wrap = el.closest('.search'); const inp = $('input', wrap);
      inp.value = ''; S.rf.q = ''; persist(); wrap.classList.remove('has-value'); refreshTable('runs'); inp.focus();
    },
    attendees: (el) => {
      const m = DH.meetings[+el.dataset.index];
      const html = `
        <div class="popover__head">
          <div class="popover__titlerow">
            <p class="popover__title"><strong>Attendees</strong><span>${m.attendees.length}</span></p>
            <button class="popover__close" data-close aria-label="Close"><img src="${I('close.svg')}" alt=""></button>
          </div>
          <p class="popover__sub">${DH.esc(m.title)} · ${m.short}</p>
        </div>
        <div class="popover__divider"></div>
        <div class="popover__list">
          ${m.attendees.map((a) => `<div class="popover__person"><img src="${a.img}" alt=""><span class="popover__name">${a.name}</span>${a.role ? `<span class="popover__role">${a.role}</span>` : ''}</div>`).join('')}
        </div>`;
      DH.openPopover(el, html, `Attendees for ${m.title}`);
    },
    proto: () => toggleProto(),
  };

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.tagName === 'FORM') return;
    const fn = ACTIONS[el.dataset.action];
    if (!fn) return;
    if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
    fn(el, e);
  });
  document.addEventListener('submit', (e) => {
    if (e.target.matches('[data-action="ask-ai-form"]')) { e.preventDefault(); ACTIONS['ask-ai'](); }
  });
  let searchTimer;
  document.addEventListener('input', (e) => {
    if (e.target.dataset.input === 'runs') {
      e.target.closest('.search').classList.toggle('has-value', !!e.target.value);
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { S.rf.q = e.target.value; persist(); refreshTable('runs'); }, 120);
    }
  });
  // Arrow-key navigation inside tab lists (WAI-ARIA tabs pattern)
  document.addEventListener('keydown', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    const tabs = $$('[role="tab"]', tab.parentElement); let i = tabs.indexOf(tab);
    i = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : tabs.length - 1;
    e.preventDefault(); tabs[i].focus(); tabs[i].click();
  });
  addEventListener('resize', () => { if (innerWidth > 767) DH.closeDrawer(); });

  /* ======================================================================
     PROTOTYPE STATES PANEL (tooling only)
     ====================================================================== */
  const SCREENS = [
    ['1.1G Developer Home · Pull Requests', '#/home/prs'],
    ['1.1H Developer Home · Jira Tickets', '#/home/jira'],
    ['1.1I Developer Home · Meetings', '#/home/meetings'],
    ['1.1G PRs View Details (GitHub connected)', '#/feed/github?gh=connected'],
    ['1.1G PRs · PR kind dropdown', '#/feed/github?gh=connected&open=prKind'],
    ['1.1G PRs · Repo dropdown', '#/feed/github?gh=connected&open=prRepo'],
    ['1.1G PRs · Open GitHub menu', '#/feed/github?gh=connected&open=ghMenu'],
    ['1.1G PRs · GitHub not connected', '#/feed/github?gh=not-connected'],
    ['1.1G PRs · GitHub Corp + SaaS connected', '#/feed/github?gh=both'],
    ['1.1G PRs · Corp connected (SaaS needs VPN)', '#/feed/github?gh=corp-vpn'],
    ['1.1G PRs · SaaS connected (Corp not connected)', '#/feed/github?gh=saas'],
    ['1.1H Jira Tickets · View All', '#/feed/jira?jira=connected'],
    ['1.1H Jira Tickets · Empty state', '#/feed/jira?jira=disconnected'],
    ['1.1I Meetings · Calendar connected', '#/feed/meetings?cal=connected'],
    ['1.1I Meetings · Calendar not connected', '#/feed/meetings?cal=disconnected'],
    ['1.1I Meetings · Attendees popover (+2)', '#/feed/meetings?cal=connected&open=attendees0'],
    ['1.1J Self Service Runs · View All', '#/feed/runs?runs=data'],
    ['1.1J Self Service Runs · Zero data', '#/feed/runs?runs=empty'],
  ];
  let protoEl = null;
  DH.closeProto = () => { if (protoEl) { DH.closeWithAnim(protoEl); protoEl = null; $('#protoFab').setAttribute('aria-expanded', 'false'); } };
  const toggleProto = () => {
    if (protoEl) return DH.closeProto();
    protoEl = document.createElement('div');
    protoEl.className = 'proto-panel'; protoEl.setAttribute('role', 'dialog'); protoEl.setAttribute('aria-label', 'Prototype states');
    const sel = (k, opts) => `<select data-proto="${k}">${opts.map((o) => `<option value="${o}" ${S[k] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
    protoEl.innerHTML = `
      <h4>Prototype states</h4><p>Simulated connection states. Not part of the design.</p>
      <label>Jump to Figma screen</label>
      <select data-proto="screen"><option value="">Choose a screen…</option>${SCREENS.map(([n, h]) => `<option value="${h}">${n}</option>`).join('')}</select>
      <label>GitHub</label>${sel('gh', VALID.gh)}
      <label>Jira</label>${sel('jira', VALID.jira)}
      <label>Calendar</label>${sel('cal', VALID.cal)}
      <label>Self-service runs</label>${sel('runs', VALID.runs)}
      <p style="margin:10px 0 0"><button class="t-link" data-proto-reset>Reset prototype</button></p>`;
    document.body.appendChild(protoEl);
    $('#protoFab').setAttribute('aria-expanded', 'true');
    protoEl.addEventListener('change', (e) => {
      const k = e.target.dataset.proto;
      if (k === 'screen') { if (e.target.value) { DH.navigate(e.target.value); if (location.hash === e.target.value) DH.resolve(); } return; }
      S[k] = e.target.value; persist();
      if ($('#feedPanel')) renderPanel();
    });
    protoEl.querySelector('[data-proto-reset]').addEventListener('click', () => { sessionStorage.removeItem('dh-state-v2'); location.hash = '#/home/prs'; location.reload(); });
  };
  document.addEventListener('pointerdown', (e) => { if (protoEl && !protoEl.contains(e.target) && !e.target.closest('#protoFab')) DH.closeProto(); });

  /* ---------------- Boot ---------------- */
  if (/[?&]clean=1/.test(location.search + location.hash)) document.body.classList.add('proto-hidden');
  renderRail();
  DH.resolve();
})(window.DH);
