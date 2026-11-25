/* =========================================================================
   Hash router  ·  #/home/:tab   #/feed/:tab?gh=..&jira=..&cal=..&runs=..
   Works from file:// (no server needed).
   ========================================================================= */
window.DH = window.DH || {};

(function (DH) {
  const routes = [];
  DH.route = (pattern, handler) => routes.push({ re: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`), handler });

  DH.parseHash = () => {
    const raw = location.hash.replace(/^#/, '') || '/home/prs';
    const [path, qs = ''] = raw.split('?');
    return { path, query: Object.fromEntries(new URLSearchParams(qs)) };
  };

  DH.navigate = (hash, { replace = false } = {}) => {
    if (replace) history.replaceState(null, '', hash); else if (location.hash !== hash) { location.hash = hash; return; }
    DH.resolve();
  };

  let lastPath = null;
  DH.resolve = () => {
    const { path, query } = DH.parseHash();
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        const samePage = lastPath && lastPath.split('/')[1] === path.split('/')[1];
        lastPath = path;
        r.handler({ ...m.groups }, query, { samePage });
        return;
      }
    }
    DH.navigate('#/home/prs', { replace: true });
  };

  addEventListener('hashchange', () => DH.resolve());
})(window.DH);
