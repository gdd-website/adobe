# Developer Home · Developer Feed — Adobe S2 prototype

An interactive, responsive HTML/CSS/vanilla JS prototype of every screen in the Figma section **"Developer Feed Screens"** (`AIsWDpBOwfqThF4gUhrOuC`, node `16424:47422`). The Figma file is the source of truth. Layout, colour, type, spacing, radii, icons and copy all come from Figma's design context.

## Run it

```bash
cd adobe-s2-prototype
python3 -m http.server 5178      # then open http://127.0.0.1:5178
```

You can also open `index.html` directly. Classic scripts and hash routing work over `file://`. Tailwind loads from the Play CDN, so layout utilities need a network connection; all component styling is in `css/styles.css`.

- Add `?clean=1` to hide the **Prototype states** button, e.g. `index.html?clean=1#/home/prs`.
- To reset state, use Prototype states → *Reset prototype*, or clear sessionStorage.

## Structure

```
index.html            shell: top nav, left rail, <main>, toasts
css/styles.css        tokens, components, responsive rules
css/animations.css    keyframes (150–250 ms, ease-out)
js/data.js            mock data copied from Figma (+ a few rows flagged `mock: true`)
js/components.js      reusable renderers: cards, tabs, banner, status light, KPI card,
                      picker, menu, segmented control, search, table, empty state, skeleton
js/interactions.js    toast, tooltip, anchored menu, popover, mobile drawer, Esc handling
js/router.js          hash router
js/app.js             state, views, routes, event delegation, prototype-state panel
assets/icons          SVGs exported from Figma (S2 icons, status dots, banner art)
assets/images         avatars exported from Figma
assets/fonts          Adobe Clean 400/500/700/800 (copied from this Mac)
assets/reference      Figma screenshots used for visual QA
```

> **Font licence:** Adobe Clean is proprietary. The files in `assets/fonts` are for local use only. Remove them before sharing the project outside Adobe; the CSS falls back to `local()` and then to a system font.

## Routes

| Route | Screen |
|---|---|
| `#/home/prs` · `#/home/jira` · `#/home/meetings` | 1.1G / 1.1H / 1.1I Developer Home tabs |
| `#/feed/github` | 1.1G Pull Requests · View Details |
| `#/feed/jira` | 1.1H Jira Tickets · View All |
| `#/feed/meetings` | 1.1I Meetings · View All |
| `#/feed/runs` | 1.1J Self Service Runs · View All |

These query params set a connection state: `gh=connected|both|corp-vpn|saas|not-connected`, `jira=connected|disconnected`, `cal=connected|disconnected`, `runs=data|empty`. `open=prKind|prRepo|ghMenu|attendees0` opens a designed overlay.

## Completed screens (18/18)

1. 1.1G Developer Home · Pull Requests
2. 1.1H Developer Home · Jira Tickets
3. 1.1I Developer Home · Meetings
4. 1.1G PRs View Details · GitHub connected
5. · PR kind dropdown
6. · Repo dropdown
7. · Open GitHub menu
8. · GitHub not connected
9. · GitHub Corp + SaaS connected
10. · GitHub Corp connected (SaaS needs VPN)
11. · GitHub SaaS connected (Corp not connected)
12. 1.1H Jira Tickets · View All
13. 1.1H Jira Tickets · Empty state (not connected)
14. 1.1I Meetings · Calendar connected
15. 1.1I Meetings · Calendar not connected
16. 1.1I Meetings · Attendees popover (+2)
17. 1.1J Self Service Runs · View All
18. 1.1J Self Service Runs · Zero data

The **Prototype states → Jump to Figma screen** list opens each one.

## Interactions (tested in Chrome)

- Home tabs switch content. "View All" opens the matching feed tab. The "View my self service runs" quick link opens Runs.
- Home cards open the feed and highlight the matching row. Cards with no matching feed row show a toast.
- Breadcrumb returns to the Home tab you came from. The feed tabs switch, and arrow keys move between tabs.
- **Pickers** filter the tables, show a checkmark on the selected value, and work with the keyboard (arrows, Home/End, Esc). They close when you click outside.
- **KPI cards** apply or toggle their filter and scroll to the table. Example: "Critical or blocking" → 3 rows.
- Refresh shows a spinning icon, skeleton rows and an "Updated" toast.
- The Open GitHub menu has SaaS and Corp items with link-out icons.
- Connection flows:
  - Not connected → Connect Corp → VPN-required state → Connect to Adobe VPN → Corp + SaaS connected.
  - Not connected → Connect SaaS → Corp-not-connected state → Connect to GitHub Corp → Corp + SaaS connected.
  - Jira Login and Connect calendar each go to "Syncing…" and then to data.
- Self Service Runs: the My/All runs segmented control, the status picker and the search all filter the table. KPI counts update with the scope.
- Attendees "+N" opens a popover at Figma's position (56 px right of the counter). It closes on outside click, the × button or Esc.
- Table rows get the Figma hover overlay (#3B63FB at 8%, 150 ms). Card, button, KPI and nav hover/pressed states also work.
- Top nav: tooltips, the notification badge clears on click, and the profile shows a toast. The lightbulb shows tips.
- Responsive:
  - The left rail becomes a slide-in drawer below 768 px.
  - Quick links, cards and KPIs reflow at each breakpoint.
  - Tables scroll sideways inside their card, with a sticky first column on mobile.
  - No horizontal page overflow at 1366, 900 or ~500 px.

## Frontend simulation vs backend

Nothing connects to GitHub, Jira, Outlook or the self-service backend. Connect, Login, VPN and Refresh are timed simulations. External links show a toast instead of opening a site.

## Gaps and decisions

- **Undesigned destinations.** Five Home tabs (Recently Accessed, Favourites, My Team's Services, Announcement, Upcoming Events) have no content in this section, and neither do the left-rail items other than Home, Help or Favourites. They show a neutral notice saying the content isn't in this section instead of an invented design.
- **No designed hover/pressed states.** Figma only specifies hover for table rows and focus for KPI cards. Other hover/pressed states are subtle S2-style shifts in background or border.
- **Mock data not in Figma (`mock: true`).** The three extra "All runs" rows, and the attendee names for the "+3" popover. Figma only designs the "+2" popover.
- **The two "connected" GitHub states are separate.** `gh=connected` is the single "Connected to GitHub" header from the View Details frame. `gh=both` is the newer "Updated Github Tab page" header with Corp and SaaS statuses. Both are kept.
- **Syncing state.** "Syncing…" status during a connection comes from the Section header component's description. It has no frame of its own.
- **No dedicated mobile or tablet frames in Figma.** Responsive layouts adapt the desktop design.
- **Copy kept verbatim.** The Jira empty state reads "Please log in here to see your pull requests." This looks like a copy slip, but it is kept as designed.
