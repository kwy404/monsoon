/*
 * Stack, a kanban board. Showcase app for Monsoon (styles) and Voodoo.js (behaviour).
 * Cards move with the Voodoo drag and drop directives (v-sortable in one v-dnd-group).
 */
(function () {
  'use strict';

  var STORE_KEY = 'stack:state:v1';
  var DAY = 86400000;

  // ---------------------------------------------------------------- dates
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function inDays(n) { return iso(new Date(today().getTime() + n * DAY)); }
  function parseDay(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function daysUntil(s) { return Math.round((parseDay(s) - today()) / DAY); }

  // ---------------------------------------------------------------- people
  var PEOPLE = {
    me: { id: 'me', name: 'Rowan Hale', color: 'bg-primary' },
    nora: { id: 'nora', name: 'Nora Ellison', color: 'bg-rose-500' },
    felix: { id: 'felix', name: 'Felix Grant', color: 'bg-sky-600' },
    hana: { id: 'hana', name: 'Hana Sato', color: 'bg-emerald-600' },
    dev: { id: 'dev', name: 'Dev Patel', color: 'bg-amber-500' },
    maya: { id: 'maya', name: 'Maya Brooks', color: 'bg-fuchsia-500' },
    leo: { id: 'leo', name: 'Leo Martins', color: 'bg-indigo-500' }
  };

  var TONES = ['primary', 'accent', 'info', 'success', 'warning', 'danger', 'secondary', 'neutral'];
  var BADGE = {
    primary: 'badge-primary', accent: 'badge-accent', info: 'badge-info', success: 'badge-success',
    warning: 'badge-warning', danger: 'badge-danger', secondary: 'badge-secondary', neutral: 'badge-neutral'
  };
  var BAR = {
    primary: 'bg-primary', accent: 'bg-accent', info: 'bg-info', success: 'bg-success',
    warning: 'bg-warning', danger: 'bg-danger', secondary: 'bg-secondary', neutral: 'bg-neutral-400'
  };
  var CHIP = {
    primary: 'chip-primary', accent: 'chip-accent', info: 'chip-info', success: 'chip-success',
    warning: 'chip-warning', danger: 'chip-danger', secondary: 'chip-secondary', neutral: 'chip-neutral'
  };
  var DOT = {
    neutral: 'status-neutral', info: 'status-info', warning: 'status-warning', success: 'status-success',
    primary: 'status-primary', accent: 'status-accent', danger: 'status-danger', secondary: 'status-secondary'
  };

  var SEEDS = [
    { name: 'Violet', value: '#7c3aed' },
    { name: 'Ocean', value: '#0284c7' },
    { name: 'Teal', value: '#0d9488' },
    { name: 'Forest', value: '#15803d' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Tangerine', value: '#ea580c' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Graphite', value: '#52525b' }
  ];

  // ---------------------------------------------------------------- seed data
  var uid = 0;
  function id(prefix) { return (prefix || 'x') + Date.now().toString(36) + (++uid).toString(36); }
  function checklist(items, doneCount) {
    return items.map(function (t, i) { return { id: id('k'), text: t, done: i < doneCount }; });
  }
  function comments(list) {
    return list.map(function (c) { return { id: id('c'), author: c[0], ts: Date.now() - c[1] * 3600000, text: c[2] }; });
  }
  function card(title, o) {
    o = o || {};
    return {
      id: id('card'), title: title, desc: o.desc || '', labels: o.labels || [], due: o.due === undefined ? null : o.due,
      done: !!o.done, checklist: o.checklist || [], assignees: o.assignees || [], comments: o.comments || [],
      activity: [{ id: id('a'), ts: Date.now() - (o.age || 72) * 3600000, text: 'created this card' }], cover: o.cover || null
    };
  }
  function labels() {
    return [
      { id: 'design', name: 'Design', tone: 'accent' },
      { id: 'eng', name: 'Engineering', tone: 'info' },
      { id: 'mkt', name: 'Marketing', tone: 'warning' },
      { id: 'content', name: 'Content', tone: 'success' },
      { id: 'research', name: 'Research', tone: 'secondary' },
      { id: 'bug', name: 'Bug', tone: 'danger' },
      { id: 'urgent', name: 'Urgent', tone: 'danger' }
    ];
  }
  function columns(todo, doing, review, done) {
    return [
      { id: id('col'), name: 'To do', tone: 'neutral', cards: todo },
      { id: id('col'), name: 'In progress', tone: 'info', cards: doing },
      { id: id('col'), name: 'Review', tone: 'warning', cards: review },
      { id: id('col'), name: 'Done', tone: 'success', done: true, cards: done }
    ];
  }

  function seedBoards() {
    return [
      {
        id: 'launch', name: 'Product launch', seed: '#7c3aed', starred: true,
        members: ['me', 'nora', 'felix', 'hana', 'dev', 'maya', 'leo'], labels: labels(),
        columns: columns(
          [
            card('Write the launch announcement post', { labels: ['content', 'mkt'], due: inDays(3), assignees: ['nora'], desc: 'Long form post for the blog and the newsletter. Lead with the customer story from the beta, then the three headline features.', checklist: checklist(['Outline', 'First draft', 'Review with product', 'Schedule'], 1), comments: comments([['felix', 20, 'Can we include the benchmark chart from the beta?'], ['nora', 18, 'Yes, I will ask Dev for the final numbers.']]) }),
            card('Record the product walkthrough video', { labels: ['mkt'], due: inDays(6), assignees: ['felix', 'hana'], checklist: checklist(['Script', 'Record', 'Edit', 'Captions'], 0) }),
            card('Prepare the press kit', { labels: ['mkt', 'design'], assignees: ['maya'], checklist: checklist(['Logo pack', 'Screenshots', 'Founder bios'], 0) }),
            card('Set up the status page for launch day', { labels: ['eng'], due: inDays(9), assignees: ['dev'] })
          ],
          [
            card('Pricing page redesign', { labels: ['design'], due: inDays(1), assignees: ['maya', 'me'], cover: 'primary', desc: 'Simplify to three tiers, add an annual toggle and a comparison table. Keep the FAQ short.', checklist: checklist(['Wireframes', 'Visual design', 'Copy pass', 'Responsive check', 'Handoff'], 3), comments: comments([['maya', 30, 'First pass is in the design file.'], ['me', 26, 'Love the toggle. Can the comparison table collapse on mobile?'], ['maya', 25, 'Good call, updating now.'], ['hana', 4, 'Copy pass done.']]) }),
            card('Onboarding email sequence', { labels: ['content'], due: inDays(-1), assignees: ['nora'], checklist: checklist(['Welcome', 'Day 2 tips', 'Day 5 case study', 'Day 7 upgrade', 'Day 14 check in', 'Day 30 survey'], 2), comments: comments([['nora', 6, 'Running a day late, the case study needs approval.']]) }),
            card('Load test the checkout flow', { labels: ['eng', 'urgent'], due: inDays(2), assignees: ['dev', 'leo'], checklist: checklist(['Write scenarios', 'Run at 5x traffic', 'Fix hot spots'], 1) })
          ],
          [
            card('Update the docs for the v2 API', { labels: ['eng', 'content'], due: inDays(0), assignees: ['hana'], checklist: checklist(['Auth', 'Webhooks', 'Pagination', 'Errors', 'Examples'], 5), comments: comments([['leo', 3, 'Reviewing the webhook section now.']]) }),
            card('Launch day social posts', { labels: ['mkt'], due: inDays(4), assignees: ['felix'], cover: 'warning', comments: comments([['felix', 50, 'Drafts are ready.'], ['maya', 40, 'Visuals attached.'], ['nora', 30, 'Tweaked the second post.'], ['me', 20, 'Approved from my side.'], ['felix', 10, 'Scheduling tomorrow.'], ['hana', 2, 'Looks great.']]) })
          ],
          [
            card('Finalize brand colors', { labels: ['design'], due: inDays(-5), done: true, assignees: ['maya'], checklist: checklist(['Palette', 'Contrast check', 'Tokens'], 3) }),
            card('Beta feedback survey', { labels: ['research'], done: true, assignees: ['hana', 'nora'], comments: comments([['hana', 80, '142 responses, summary in the research folder.']]) }),
            card('Fix the signup race condition', { labels: ['eng', 'bug'], done: true, due: inDays(-3), assignees: ['dev'] })
          ]
        )
      },
      {
        id: 'web', name: 'Website refresh', seed: '#0d9488', starred: false,
        members: ['me', 'maya', 'felix', 'leo'], labels: labels(),
        columns: columns(
          [card('Audit the current navigation', { labels: ['research'], assignees: ['leo'] }), card('New illustration style', { labels: ['design'], due: inDays(12), assignees: ['maya'], cover: 'primary' })],
          [card('Homepage hero exploration', { labels: ['design'], due: inDays(2), assignees: ['maya', 'me'], checklist: checklist(['Three directions', 'Pick one', 'Polish'], 1) })],
          [card('Migrate the blog to the new templates', { labels: ['eng'], due: inDays(1), assignees: ['felix'] })],
          [card('Kickoff workshop', { labels: ['research'], done: true, assignees: ['me', 'maya', 'felix', 'leo'] })]
        )
      },
      {
        id: 'mobile', name: 'Mobile app v3', seed: '#ea580c', starred: false,
        members: ['me', 'dev', 'hana'], labels: labels(),
        columns: columns(
          [card('Offline mode for saved items', { labels: ['eng'], assignees: ['dev'], due: inDays(14) }), card('Widget for the home screen', { labels: ['design', 'eng'] })],
          [card('Dark mode polish', { labels: ['design'], assignees: ['hana'], due: inDays(-2), checklist: checklist(['Icons', 'Charts', 'Onboarding'], 2) })],
          [],
          [card('Crash on rotate in settings', { labels: ['bug'], done: true, assignees: ['dev'] })]
        )
      }
    ];
  }

  // ---------------------------------------------------------------- persistence
  var saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { saved = null; }

  var S = V.data({
    people: PEOPLE,
    tones: TONES,
    seeds: SEEDS,
    boards: saved && saved.boards ? saved.boards : seedBoards(),
    boardId: saved && saved.boardId ? saved.boardId : 'launch',
    themeCurrent: 'system',

    query: '',
    filter: { labels: [], members: [], due: '' },
    openId: null,
    renaming: null,
    renameText: '',
    addingTo: null,
    newCardTitle: '',
    addingColumn: false,
    newColumnName: '',
    newItem: '',
    newComment: '',
    editingTitle: false,
    boardRename: false,
    boardNameDraft: '',
    toasts: [],

    // ------------------------------------------------------------ lookups
    board: function () {
      for (var i = 0; i < S.boards.length; i++) if (S.boards[i].id === S.boardId) return S.boards[i];
      return S.boards[0];
    },
    person: function (pid) { return S.people[pid] || { id: pid, name: 'Guest', color: 'bg-zinc-500' }; },
    initials: function (name) {
      var p = String(name || '?').trim().split(/\s+/);
      return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
    },
    label: function (lid) {
      var ls = S.board().labels;
      for (var i = 0; i < ls.length; i++) if (ls[i].id === lid) return ls[i];
      return null;
    },
    cardLabels: function (c) { return c.labels.map(S.label).filter(Boolean); },
    badgeTone: function (tone) { return BADGE[tone] || 'badge-neutral'; },
    barTone: function (tone) { return BAR[tone] || 'bg-neutral-400'; },
    chipTone: function (tone) { return CHIP[tone] || 'chip-neutral'; },
    dotTone: function (tone) { return DOT[tone] || 'status-neutral'; },

    // ------------------------------------------------------------ card meta
    checkDone: function (c) { return c.checklist.filter(function (x) { return x.done; }).length; },
    checkPct: function (c) { return c.checklist.length ? Math.round(S.checkDone(c) / c.checklist.length * 100) : 0; },
    dueState: function (c) {
      if (!c.due) return 'none';
      if (c.done) return 'done';
      var d = daysUntil(c.due);
      if (d < 0) return 'overdue';
      if (d <= 1) return 'soon';
      return 'later';
    },
    dueClass: function (c) {
      return { overdue: 'badge-danger badge-solid', soon: 'badge-warning', done: 'badge-success', later: 'badge-neutral' }[S.dueState(c)] || 'badge-neutral';
    },
    dueLabel: function (c) {
      if (!c.due) return '';
      var d = daysUntil(c.due);
      var date = parseDay(c.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (c.done) return date;
      if (d === 0) return 'Today';
      if (d === 1) return 'Tomorrow';
      if (d === -1) return 'Yesterday';
      return date;
    },
    dueLong: function (c) {
      if (!c.due) return 'No due date';
      var d = daysUntil(c.due);
      var date = parseDay(c.due).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (c.done) return date + ', complete';
      if (d < 0) return date + ', overdue by ' + (-d) + (d === -1 ? ' day' : ' days');
      if (d === 0) return date + ', due today';
      return date + ', in ' + d + (d === 1 ? ' day' : ' days');
    },
    ago: function (ts) {
      var m = Math.round((Date.now() - ts) / 60000);
      if (m < 1) return 'just now';
      if (m < 60) return m + (m === 1 ? ' minute ago' : ' minutes ago');
      var h = Math.round(m / 60);
      if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
      var d = Math.round(h / 24);
      return d + (d === 1 ? ' day ago' : ' days ago');
    },

    // ------------------------------------------------------------ filters
    matches: function (c) {
      var q = S.query.trim().toLowerCase();
      if (q) {
        var hay = (c.title + ' ' + c.desc + ' ' + S.cardLabels(c).map(function (l) { return l.name; }).join(' ') + ' ' + c.assignees.map(function (a) { return S.person(a).name; }).join(' ')).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      var f = S.filter;
      if (f.labels.length && !c.labels.some(function (l) { return f.labels.indexOf(l) !== -1; })) return false;
      if (f.members.length && !c.assignees.some(function (a) { return f.members.indexOf(a) !== -1; })) return false;
      if (f.due === 'overdue' && S.dueState(c) !== 'overdue') return false;
      if (f.due === 'week' && !(c.due && !c.done && daysUntil(c.due) >= 0 && daysUntil(c.due) <= 7)) return false;
      if (f.due === 'none' && c.due) return false;
      return true;
    },
    visible: function (col) { return col.cards.filter(S.matches); },
    filterCount: function () { return S.filter.labels.length + S.filter.members.length + (S.filter.due ? 1 : 0); },
    filtering: function () { return S.filterCount() > 0 || !!S.query.trim(); },
    clearFilters: function () { S.filter.labels = []; S.filter.members = []; S.filter.due = ''; S.query = ''; },
    totals: function () {
      var all = [];
      S.board().columns.forEach(function (c) { all = all.concat(c.cards); });
      return {
        cards: all.length,
        overdue: all.filter(function (c) { return S.dueState(c) === 'overdue'; }).length,
        done: all.filter(function (c) { return c.done; }).length,
        shown: all.filter(S.matches).length
      };
    },
    progress: function () { var t = S.totals(); return t.cards ? Math.round(t.done / t.cards * 100) : 0; },

    // ------------------------------------------------------------ boards
    switchBoard: function (bid) {
      S.boardId = bid;
      S.clearFilters();
      applySeed();
      closePopover('board-menu');
    },
    newBoard: function () {
      var b = {
        id: id('b'), name: 'Untitled board', seed: SEEDS[S.boards.length % SEEDS.length].value, starred: false,
        members: ['me'], labels: labels(), columns: columns([], [], [], [])
      };
      S.boards.push(b);
      S.switchBoard(b.id);
      S.startBoardRename();
    },
    startBoardRename: function () {
      S.boardNameDraft = S.board().name;
      S.boardRename = true;
      focus('board-name-input', true);
    },
    saveBoardName: function () {
      var n = S.boardNameDraft.trim();
      if (n) S.board().name = n;
      S.boardRename = false;
    },
    boardKey: function (e) {
      if (e.key === 'Enter') { e.preventDefault(); S.saveBoardName(); }
      else if (e.key === 'Escape') { S.boardRename = false; }
    },
    toggleStar: function () { var b = S.board(); b.starred = !b.starred; },
    setSeed: function (value) { S.board().seed = value; applySeed(); },
    setTheme: function (value) { V.theme.set(value); S.themeCurrent = value; },
    resetDemo: function () {
      try { localStorage.removeItem(STORE_KEY); } catch (e) { /* ignore */ }
      S.boards = seedBoards();
      S.boardId = 'launch';
      S.clearFilters();
      applySeed();
      closePopover('board-menu');
      toast('Demo boards restored');
    },

    // ------------------------------------------------------------ columns
    startRename: function (col) {
      S.renaming = col.id;
      S.renameText = col.name;
      closePopover('col-menu-' + col.id);
      focus('rename-' + col.id, true);
    },
    renameKey: function (e, col) {
      if (e.key === 'Enter') { e.preventDefault(); S.saveRename(col); }
      else if (e.key === 'Escape') { S.renaming = null; }
    },
    saveRename: function (col) {
      if (S.renaming !== col.id) return;
      var n = S.renameText.trim();
      if (n) col.name = n;
      S.renaming = null;
    },
    startAddColumn: function () {
      S.addingColumn = true;
      S.newColumnName = '';
      focus('new-column-input');
    },
    addColumn: function () {
      var n = S.newColumnName.trim();
      if (!n) { S.addingColumn = false; return; }
      var tone = TONES[(S.board().columns.length + 2) % TONES.length];
      S.board().columns.push({ id: id('col'), name: n, tone: tone, cards: [] });
      S.newColumnName = '';
      focus('new-column-input');
      V.nextTick(function () {
        var sc = document.getElementById('board-scroller');
        if (sc) sc.scrollLeft = sc.scrollWidth;
      });
    },
    columnKey: function (e) {
      if (e.key === 'Enter') { e.preventDefault(); S.addColumn(); }
      else if (e.key === 'Escape') { S.addingColumn = false; }
    },
    deleteColumn: function (col) {
      closePopover('col-menu-' + col.id);
      var cols = S.board().columns;
      if (cols.length < 2) return;
      var i = cols.indexOf(col);
      var target = cols[i === 0 ? 1 : i - 1];
      col.cards.forEach(function (c) { target.cards.push(c); });
      cols.splice(i, 1);
      toast('List deleted, ' + (col.cards.length ? col.cards.length + ' cards moved to ' + target.name : 'it was empty'));
    },
    setColumnTone: function (col, tone) { col.tone = tone; },

    // ------------------------------------------------------------ cards
    startAdd: function (col) {
      S.addingTo = col.id;
      S.newCardTitle = '';
      closePopover('col-menu-' + col.id);
      focus('new-card-' + col.id);
    },
    addCard: function (col) {
      var t = S.newCardTitle.trim();
      if (!t) { S.addingTo = null; return; }
      var c = card(t, { age: 0 });
      c.activity[0].ts = Date.now();
      if (col.done) c.done = true;
      col.cards.push(c);
      S.newCardTitle = '';
      focus('new-card-' + col.id);
    },
    addKey: function (e, col) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); S.addCard(col); }
      else if (e.key === 'Escape') { S.addingTo = null; }
    },
    cardKey: function (e, c) {
      if (e.key === 'Enter') { e.preventDefault(); S.openCard(c); }
    },
    openCard: function (c) {
      if (Date.now() - lastDrop < 250) return;
      S.openId = c.id;
      S.newItem = '';
      S.newComment = '';
      S.editingTitle = false;
      var d = document.getElementById('card-modal');
      if (d && !d.open) d.showModal();
    },
    closeCard: function () {
      var d = document.getElementById('card-modal');
      if (d && d.open) d.close();
    },
    current: function () {
      if (!S.openId) return null;
      var found = null;
      S.board().columns.forEach(function (col) { col.cards.forEach(function (c) { if (c.id === S.openId) found = c; }); });
      return found;
    },
    currentColumn: function () {
      var found = null;
      S.board().columns.forEach(function (col) { col.cards.forEach(function (c) { if (c.id === S.openId) found = col; }); });
      return found;
    },
    moveCurrent: function (colId) {
      var c = S.current();
      var from = S.currentColumn();
      var to = null;
      S.board().columns.forEach(function (col) { if (col.id === colId) to = col; });
      if (!c || !from || !to || from === to) return;
      from.cards.splice(from.cards.indexOf(c), 1);
      to.cards.push(c);
      logMove(c, from, to);
    },
    toggleDone: function (c) {
      c.done = !c.done;
      log(c, c.done ? 'marked this card as complete' : 'marked this card as incomplete');
    },
    toggleItem: function (c, item) {
      item.done = !item.done;
      if (c.checklist.length && c.checklist.every(function (x) { return x.done; })) log(c, 'completed the checklist');
    },
    addItem: function (c) {
      var t = S.newItem.trim();
      if (!t) return;
      c.checklist.push({ id: id('k'), text: t, done: false });
      S.newItem = '';
    },
    itemKey: function (e, c) { if (e.key === 'Enter') { e.preventDefault(); S.addItem(c); } },
    removeItem: function (c, item) { c.checklist.splice(c.checklist.indexOf(item), 1); },
    toggleLabel: function (c, lid) {
      var i = c.labels.indexOf(lid);
      if (i === -1) c.labels.push(lid); else c.labels.splice(i, 1);
    },
    toggleAssignee: function (c, pid) {
      var i = c.assignees.indexOf(pid);
      if (i === -1) { c.assignees.push(pid); log(c, pid === 'me' ? 'joined this card' : 'added ' + S.person(pid).name); }
      else { c.assignees.splice(i, 1); log(c, pid === 'me' ? 'left this card' : 'removed ' + S.person(pid).name); }
    },
    setCover: function (c, tone) { c.cover = c.cover === tone ? null : tone; },
    addComment: function (c) {
      var t = S.newComment.trim();
      if (!t) return;
      c.comments.unshift({ id: id('c'), author: 'me', ts: Date.now(), text: t });
      S.newComment = '';
    },
    commentKey: function (e, c) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); S.addComment(c); }
    },
    removeComment: function (c, cm) { c.comments.splice(c.comments.indexOf(cm), 1); },
    feed: function (c) {
      var items = c.comments.map(function (cm) { return { id: cm.id, kind: 'comment', author: cm.author, ts: cm.ts, text: cm.text, ref: cm }; })
        .concat(c.activity.map(function (a) { return { id: a.id, kind: 'activity', author: a.author || 'me', ts: a.ts, text: a.text, ref: a }; }));
      return items.sort(function (a, b) { return b.ts - a.ts; });
    },
    deleteCurrent: function () {
      var c = S.current();
      var col = S.currentColumn();
      if (!c || !col) return;
      S.closeCard();
      col.cards.splice(col.cards.indexOf(c), 1);
      S.openId = null;
      toast('Card deleted');
    },
    copyLink: function () {
      try { navigator.clipboard.writeText(location.href.split('#')[0] + '#card-' + S.openId); } catch (e) { /* clipboard blocked */ }
      toast('Link copied to clipboard');
    },
    titleKey: function (e) {
      if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); }
    },

    // ------------------------------------------------------------ drag and drop
    dragStart: function (e) {
      var item = e.detail && e.detail.item;
      if (item) dragOrigin = { item: item, parent: item.parentNode, next: item.nextSibling };
    },
    sorted: function (e) {
      var d = e.detail;
      if (!d || e.target !== d.to) return;
      var item = d.item;
      var cardId = item.getAttribute('data-id');
      var fromCol = findColumn(d.from && d.from.getAttribute('data-col'));
      var toCol = findColumn(d.to.getAttribute('data-col'));
      var next = item.nextElementSibling;
      var prev = item.previousElementSibling;
      var nextId = next ? next.getAttribute('data-id') : null;
      var prevId = prev ? prev.getAttribute('data-id') : null;
      // Put the DOM back where Voodoo rendered it, then let the data drive the change.
      if (dragOrigin && dragOrigin.item === item) dragOrigin.parent.insertBefore(item, dragOrigin.next);
      dragOrigin = null;
      lastDrop = Date.now();
      if (!fromCol || !toCol) return;
      var i = indexOf(fromCol.cards, cardId);
      if (i === -1) return;
      var c = fromCol.cards.splice(i, 1)[0];
      var at = nextId ? indexOf(toCol.cards, nextId) : -1;
      if (at === -1 && prevId) { at = indexOf(toCol.cards, prevId); if (at !== -1) at++; }
      if (at === -1) toCol.cards.push(c); else toCol.cards.splice(at, 0, c);
      if (fromCol !== toCol) logMove(c, fromCol, toCol);
    },

    // ------------------------------------------------------------ toasts
    dismissToast: function (t) { var i = S.toasts.indexOf(t); if (i !== -1) S.toasts.splice(i, 1); }
  });

  var dragOrigin = null;
  var lastDrop = 0;

  function indexOf(list, cid) {
    for (var i = 0; i < list.length; i++) if (list[i].id === cid) return i;
    return -1;
  }
  function findColumn(colId) {
    var cols = S.board().columns;
    for (var i = 0; i < cols.length; i++) if (cols[i].id === colId) return cols[i];
    return null;
  }
  function log(c, text) { c.activity.push({ id: id('a'), ts: Date.now(), text: text, author: 'me' }); }
  function logMove(c, from, to) {
    log(c, 'moved this card from ' + from.name + ' to ' + to.name);
    if (to.done && !c.done) c.done = true;
    else if (from.done && !to.done && c.done) c.done = false;
  }
  function focus(elId, select) {
    V.nextTick(function () {
      var el = document.getElementById(elId);
      if (el) { el.focus(); if (select && el.select) el.select(); }
    });
  }
  function closePopover(pid) {
    var p = document.getElementById(pid);
    try { if (p && p.matches(':popover-open')) p.hidePopover(); } catch (e) { /* popover unsupported */ }
  }
  var toastSeq = 0;
  function toast(text) {
    var t = { id: ++toastSeq, text: text };
    S.toasts.push(t);
    if (S.toasts.length > 3) S.toasts.shift();
    setTimeout(function () { S.dismissToast(t); }, 3000);
  }
  function applySeed() {
    document.documentElement.style.setProperty('--seed', S.board().seed);
  }

  applySeed();
  try { S.themeCurrent = V.theme.current; } catch (e) { S.themeCurrent = 'system'; }

  var persistTimer = null;
  V.effect(function () {
    var snapshot = JSON.stringify({ boards: S.boards, boardId: S.boardId });
    clearTimeout(persistTimer);
    persistTimer = setTimeout(function () { try { localStorage.setItem(STORE_KEY, snapshot); } catch (e) { /* ignore */ } }, 250);
  });

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
      e.preventDefault();
      var s = document.getElementById('board-search');
      if (s) s.focus();
    }
  });
  var modal = document.getElementById('card-modal');
  if (modal) modal.addEventListener('close', function () { S.openId = null; });
})();
