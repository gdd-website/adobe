/* =========================================================================
   Developer Home · mock data
   All values below are taken verbatim from the Figma section
   "Developer Feed Screens" (node 16424:47422). Rows marked `mock: true`
   are NOT in Figma: they exist only so "All runs" / extra popovers have
   something meaningful to show. Nothing here talks to a real backend.
   ========================================================================= */
window.DH = window.DH || {};

(function (DH) {
  const ICON = (n) => `assets/icons/${n}`;
  const IMG = (n) => `assets/images/${n}`;

  /* ---------- Shared people (avatars from Figma) ---------- */
  DH.people = {
    p0: IMG('person-0.png'), p1: IMG('person-1.png'), p2: IMG('person-2.png'),
    p3: IMG('person-3.png'), p4: IMG('person-4.png'), p5: IMG('person-5.png'),
    p6: IMG('person-6.png'), p7: IMG('person-7.png'),
    a0: IMG('attendee-0.png'), a1: IMG('attendee-1.png'),
    a2: IMG('attendee-2.png'), a3: IMG('attendee-3.png'),
  };

  /* ---------- Status lights (S2 semantic dots) ---------- */
  DH.dots = {
    green: ICON('status-green.svg'),      // #079355 positive
    darkgreen: ICON('status-darkgreen.svg'), // #025D3C
    blue: ICON('status-blue.svg'),        // #5D89FF informative
    orange: ICON('status-orange.svg'),    // #D45B00 notice
    yellow: ICON('status-jira-inreview.svg'), // #D29500
    red: ICON('status-red.svg'),          // #FF513D negative
    gray: ICON('status-gray.svg'),        // #8F8F8F
    graydark: ICON('status-gray-dark.svg'), // #717171
    graylight: ICON('status-gray-light.svg'), // #C6C6C6
  };

  /* ---------- Home · Quick links ---------- */
  DH.quickLinks = [
    { icon: ICON('add-24.svg'), title: 'Create service', desc: 'Create and run a production ready service', action: 'toast:Self-service template catalog opens here (not part of this Figma section).' },
    { icon: ICON('cloud.svg'), title: 'View services', desc: 'View all Adobe services', action: 'toast:Service catalog opens here (not part of this Figma section).' },
    { icon: ICON('code.svg'), title: 'Open director (ABX)', desc: 'Work with AI agents in Adobe cloud', action: 'toast:Opens Director (ABX) in a new tab — simulated.' },
    { icon: ICON('globe-grid.svg'), title: 'Browse developer resources', desc: 'A directory of common developer portals and Links', action: 'toast:Developer resources directory opens here (not part of this Figma section).' },
    { icon: ICON('tools-24.svg'), title: 'View my self service runs', desc: 'View your previous self service runs', action: 'route:#/feed/runs' },
  ];

  /* ---------- Home · tab bar (order from Figma instance) ---------- */
  DH.homeTabs = [
    { id: 'recent', label: 'Recently Accessed' },
    { id: 'favourites', label: 'Favourites' },
    { id: 'team', label: 'My Team’s Services' },
    { id: 'prs', label: 'Pull Requests', feed: 'github' },
    { id: 'jira', label: 'Jira Tickets', feed: 'jira' },
    { id: 'meetings', label: 'Meetings', feed: 'meetings' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'events', label: 'Upcoming Events' },
  ];

  /* ---------- Home · Pull Request cards ---------- */
  DH.homePRs = [
    { title: 'Refactor auth middleware', status: 'Requires my review', dot: ICON('dot-orange.svg'), repo: 'security/auth-gateway' },
    { title: 'Add dashboard pagination', status: 'Requires my review', dot: ICON('dot-orange.svg'), repo: 'devhome/portal' },
    { title: 'Update SDK version to 3.2.1', status: 'Requires my review', dot: ICON('dot-orange.svg'), repo: 'platform/client-sdk' },
    { title: 'Add retry logic to event transporter', status: 'My open PR', dot: ICON('dot-blue.svg'), repo: 'experience-platform/transporter' },
    { title: 'Migrate config to typed schema', status: 'My open PR', dot: ICON('dot-blue.svg'), repo: 'commerce/app-registry' },
  ];

  /* ---------- Home · Jira ticket cards ---------- */
  DH.homeJira = [
    { title: 'Implement caching layer', status: 'Blocked', dot: ICON('dot-red.svg'), key: 'DEV-1234' },
    { title: 'Fix auth token rotation', status: 'In Progress', dot: ICON('dot-blue-2.svg'), key: 'DEV-1290', priority: 'Priority: Critical' },
    { title: 'Update OTel SDK to v2.4', status: 'In Progress', dot: ICON('dot-blue-2.svg'), key: 'DEV-1301' },
    { title: 'Add accessible service filters', status: 'In Review', dot: ICON('dot-yellow.svg'), key: 'DEV-1312' },
    { title: 'Document local development setup', status: 'To Do', dot: ICON('dot-gray.svg'), key: 'DEV-1318' },
  ];

  /* ---------- Home · Meeting cards ---------- */
  DH.homeMeetings = [
    { time: '9:00 AM', dur: '15 min', title: 'Sprint standup', loc: 'Team channel', icon: ICON('chat.svg') },
    { time: '10:00 AM', dur: '30 min', title: 'Service catalog planning', loc: 'Conference room 4A', icon: ICON('location.svg') },
    { time: '11:00 AM', dur: '45 min', title: 'Architecture review', loc: 'Video meeting', icon: ICON('device-desktop.svg') },
    { time: '1:30 PM', dur: '30 min', title: 'Home experience design review', loc: 'Video meeting', icon: ICON('device-desktop.svg') },
    { time: '3:00 PM', dur: '45 min', title: 'Security review', loc: 'Conference room 2B', icon: ICON('location.svg') },
  ];

  /* ---------- Developer Feed · GitHub PRs ---------- */
  // kind: 'mine' | 'review' | 'closed'   source: 'saas' | 'corp'
  DH.pullRequests = [
    { title: 'Add retry logic to event transporter', kind: 'mine', author: 'you', add: 210, del: 36, opened: '7h ago', updated: '2h ago', repo: 'experience-platform/transporter', source: 'saas' },
    { title: 'Refactor auth middleware', kind: 'review', author: 'kronit', add: 480, del: 122, opened: '2h ago', updated: '40m ago', repo: 'security/auth-gateway', source: 'saas' },
    { title: 'Migrate config to typed schema', kind: 'mine', author: 'you', add: 96, del: 310, opened: '5h ago', updated: '1h ago', repo: 'commerce/app-registry', source: 'corp' },
    { title: 'Add dashboard pagination', kind: 'review', author: 'james.c', add: 152, del: 18, opened: '9h ago', updated: '3h ago', repo: 'devhome/portal', source: 'corp' },
    { title: 'Template updates for deploy repo Auto CMRs', kind: 'review', author: 'amitmi', add: 11, del: 12, opened: '12 days ago', updated: '10 days ago', repo: 'marketo/eng-payment-test', source: 'corp' },
    { title: 'Documentation upgrade for Developer Home', kind: 'review', author: 'japer', add: 1100, del: 1200, opened: '1 day ago', updated: '30m ago', repo: 'japer/developer-home', source: 'saas' },
    { title: '[UDVT-1239] Upgrading Toolbox user experience', kind: 'review', author: 'lcrabb', add: 1100, del: 2000, opened: '3 days ago', updated: '6h ago', repo: 'japer/developer-home', source: 'saas' },
    { title: 'Implementing new Playwright tests', kind: 'review', author: 'mtoledo', add: 640, del: 45, opened: '2 days ago', updated: '1h ago', repo: 'japer/developer-home', source: 'saas' },
    { title: 'Update SDK dependency versions', kind: 'closed', author: 'you', add: 64, del: 27, opened: '4 days ago', updated: '1 day ago', repo: 'devhome/portal', source: 'corp' },
  ];
  DH.prKinds = {
    mine: { label: 'My PR', dot: 'blue' },
    review: { label: 'Requires my review', dot: 'orange' },
    closed: { label: 'Closed', dot: 'gray', muted: true },
  };
  DH.prRepos = ['commerce/app-registry', 'devhome/portal', 'experience-platform/transporter', 'japer/developer-home', 'marketo/eng-payment-test', 'security/auth-gateway'];

  // KPI values exactly as designed for each GitHub connection state
  DH.prKpis = {
    connected: { yours: [2, '1 in progress · 1 closed'], review: [2, '1 pending · 1 in review'] },
    both: { yours: [3, '2 in progress · 1 closed'], review: [6, '4 pending · 2 in review'] },
    'corp-vpn': { yours: [3, '2 in progress · 1 closed'], review: [6, '4 pending · 2 in review'] },
    saas: { yours: [1, '1 in progress · 0 closed'], review: [4, '3 pending · 1 in review'] },
  };

  /* ---------- Developer Feed · Jira ---------- */
  DH.jiraIssues = [
    { type: 'Story', key: 'DEV-1234', summary: 'Implement caching layer', created: '2 weeks ago', updated: '3h ago', priority: 'Blocking', assignee: 'kronit', reporter: 'cj.dotson', status: 'Blocked' },
    { type: 'Bug', key: 'DEV-1290', summary: 'Auth token rotation failing', created: '1 week ago', updated: '1h ago', priority: 'Critical', assignee: 'kronit', reporter: 'amit.mishra', status: 'In Progress' },
    { type: 'Task', key: 'DEV-1301', summary: 'Update OTel SDK to v2.4', created: '5 days ago', updated: '5h ago', priority: 'Normal', assignee: 'you', reporter: 'cj.dotson', status: 'In Progress' },
    { type: 'Bug', key: 'DEV-1278', summary: 'Rate limiter bypass on batch', created: '4 days ago', updated: '8h ago', priority: 'High', assignee: 'james.c', reporter: 'you', status: 'In Review' },
    { type: 'Epic', key: 'UDVT-1999', summary: 'Toolbox is getting a facelift', created: '12 days ago', updated: '10 days ago', priority: 'Normal', assignee: 'lynn.crabb', reporter: 'cj.dotson', status: 'To Do' },
    { type: 'Security+', key: 'PS-19589', summary: 'Let’s tighten down Security', created: '59 seconds ago', updated: '30 seconds ago', priority: 'High', assignee: 'cj.dotson', reporter: 'amit.mishra', status: 'Not Started' },
    { type: 'Story', key: 'EON-41215', summary: 'New k8s cluster needs to be created', created: '2 weeks ago', updated: '1 week ago', priority: 'Normal', assignee: 'cj.dotson', reporter: 'manuel.t', status: 'Ready for Dev' },
    { type: 'Support Request', key: 'WWABDOPS-41341', summary: 'Failed to connect Atlas Whitelist Service', created: '59 seconds ago', updated: '30 seconds ago', priority: 'Critical', assignee: 'casey.d', reporter: 'manuel.t', status: 'Complete' },
  ];
  DH.jiraStatusDot = {
    'Blocked': 'red', 'In Progress': 'blue', 'In Review': 'yellow', 'To Do': 'graydark',
    'Not Started': 'graylight', 'Ready for Dev': 'darkgreen', 'Complete': 'green',
  };

  /* ---------- Developer Feed · Meetings ---------- */
  const A = (name, img, role) => ({ name, img, role });
  DH.meetings = [
    { time: '9:00 AM – 9:15 AM', short: '9:00 – 9:15 AM', title: 'Sprint standup', dur: '15 min', loc: 'No rooms', locIcon: 's2',
      shown: [DH.people.p0, DH.people.p1], more: 2,
      attendees: [A('Ronit Kumar', DH.people.a0, 'Organizer'), A('Arun Kaza', DH.people.a1), A('Neha Sharma', DH.people.a2), A('Ravi Teja', DH.people.a3)],
      agenda: 'Share progress and raise blockers for the current sprint.' },
    { time: '10:00 AM – 10:30 AM', short: '10:00 – 10:30 AM', title: 'Service catalog planning', dur: '30 min', loc: 'Single room',
      shown: [DH.people.p2], agenda: 'Prioritize catalog improvements and review the next milestone.' },
    { time: '11:00 AM – 11:45 AM', short: '11:00 – 11:45 AM', title: 'Architecture review', dur: '45 min', loc: 'No rooms',
      shown: [DH.people.p3, DH.people.p4], agenda: 'Discuss the event-driven migration proposal and open questions.' },
    { time: '1:30 PM – 2:00 PM', short: '1:30 – 2:00 PM', title: 'Home experience design review', dur: '30 min', loc: 'Multiple rooms',
      shown: [DH.people.p5, DH.people.p6, DH.people.p7, DH.people.p0], more: 3,
      // mock: names for the +3 popover (Figma only designs the +2 popover)
      attendees: [A('Ronit Kumar', DH.people.p5, 'Organizer'), A('Arun Kaza', DH.people.p6), A('Neha Sharma', DH.people.p7), A('Ravi Teja', DH.people.p0), A('Casey Dotson', DH.people.p1), A('Lynn Crabb', DH.people.p2), A('Manuel Toledo', DH.people.p3)],
      agenda: 'Walk through the simplified Home content bar and accessibility decisions.' },
    { time: '3:00 PM – 3:45 PM', short: '3:00 – 3:45 PM', title: 'Security review', dur: '45 min', loc: 'Single room',
      shown: [DH.people.p7], agenda: 'Review the proposed token rotation changes and test plan.' },
    { time: '4:00 PM – 4:30 PM', short: '4:00 – 4:30 PM', title: 'Developer office hours', dur: '30 min', loc: 'Multiple rooms', locIcon: 's2',
      shown: [DH.people.p1, DH.people.p3], agenda: 'Bring questions about services, documentation, and tooling.' },
  ];

  /* ---------- Developer Feed · Self Service Runs ---------- */
  DH.runs = [
    { template: 'Publish a new MCP server', status: 'Completed', created: '12/1/2025, 7:25:57 PM', owner: 'Ronit Kumar', mine: true },
    { template: 'Publish a new MCP server', status: 'Completed', created: '12/1/2025, 7:21:02 PM', owner: 'Ronit Kumar', mine: true },
    { template: 'Publish a new MCP server', status: 'Failed', created: '12/1/2025, 7:20:18 PM', owner: 'Ronit Kumar', mine: true },
    { template: 'Publish a new MCP server', status: 'Failed', created: '12/1/2025, 7:18:51 PM', owner: 'Ronit Kumar', mine: true },
    { template: 'Onboard an Existing Application to Flex', status: 'Completed', created: '7/23/2025, 5:33:34 PM', owner: 'Ronit Kumar', mine: true },
    // mock: team runs shown only for "All runs"
    { template: 'Create a Node.js microservice', status: 'Completed', created: '11/28/2025, 2:10:44 PM', owner: 'Arun Kaza', mine: false, mock: true },
    { template: 'Provision a Postgres database', status: 'Failed', created: '11/26/2025, 9:02:13 AM', owner: 'Neha Sharma', mine: false, mock: true },
    { template: 'Onboard an Existing Application to Flex', status: 'Completed', created: '11/20/2025, 4:47:09 PM', owner: 'Ravi Teja', mine: false, mock: true },
  ];
  DH.runStatusDot = { Completed: 'green', Failed: 'red' };
})(window.DH);
