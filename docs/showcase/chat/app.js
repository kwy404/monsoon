/*
 * Harbor, a community chat. Showcase app for Monsoon (styles) and Voodoo.js (behaviour).
 * All state lives in the Voodoo root scope (V.data) and is saved to localStorage.
 */
(function () {
  'use strict';

  var STORE_KEY = 'harbor:state:v1';
  var AUTH_KEY = 'harbor:auth:v1';
  var MIN = 60000;
  var HOUR = 60 * MIN;
  var DAY = 24 * HOUR;
  var NOW = Date.now();

  // ---------------------------------------------------------------- icons
  var ICON_PATHS = {
    like: '<path d="M7 10v12"/><path d="M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 8a2 2 0 0 1-1.9 1.4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 2a3.1 3.1 0 0 1 3 3.9z"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>',
    smile: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01M15 9h.01"/>',
    fire: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3.2.3 1.6 1.4 2.7 2.5 2.7z"/>',
    sparkles: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
    check: '<circle cx="12" cy="12" r="10"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    eyes: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
    coffee: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
    wave: '<path d="M18 11V6a2 2 0 0 0-4 0v5"/><path d="M14 10V4a2 2 0 0 0-4 0v6"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1z"/>',
    hash: '<path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/>',
    voice: '<path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
    megaphone: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>'
  };
  var ICON_TONES = {
    like: 'text-sky-500', heart: 'text-rose-500', smile: 'text-amber-500', fire: 'text-orange-500',
    sparkles: 'text-violet-500', check: 'text-emerald-500', eyes: 'text-cyan-600', rocket: 'text-fuchsia-500',
    coffee: 'text-amber-700', wave: 'text-yellow-500', star: 'text-yellow-500'
  };
  var REACTION_KEYS = ['like', 'heart', 'smile', 'fire', 'sparkles', 'check', 'eyes', 'rocket'];
  var SHORTCODES = ['like', 'heart', 'smile', 'fire', 'sparkles', 'check', 'eyes', 'rocket', 'coffee', 'wave', 'star'];

  function svg(name, cls) {
    var body = ICON_PATHS[name] || '';
    return '<svg class="' + (cls || 'size-4') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }

  // ---------------------------------------------------------------- people
  var ROLES = {
    admin: { name: 'Harbormasters', text: 'text-rose-500', order: 0 },
    mod: { name: 'Crew', text: 'text-emerald-600', order: 1 },
    bot: { name: 'Helpers', text: 'text-sky-600', order: 2 },
    member: { name: 'Members', text: '', order: 3 }
  };

  var USERS = {
    mira: { id: 'mira', name: 'Mira Okafor', color: 'bg-rose-500', role: 'admin', status: 'online', activity: 'Shipping the 2.0 release', about: 'Runs Driftwood Devs. Frontend platform lead, coffee snob, weekend sailor.' },
    theo: { id: 'theo', name: 'Theo Lindqvist', color: 'bg-emerald-600', role: 'mod', status: 'online', activity: 'Reviewing pull requests', about: 'Accessibility nerd. Ask me about focus order.' },
    priya: { id: 'priya', name: 'Priya Raman', color: 'bg-violet-500', role: 'mod', status: 'away', activity: 'In a meeting', about: 'Design systems at a fintech. Tokens all the way down.' },
    jonas: { id: 'jonas', name: 'Jonas Weber', color: 'bg-sky-600', role: 'member', status: 'online', activity: 'Pairing in Pairing room', about: 'Backend person who keeps getting pulled into CSS.' },
    lena: { id: 'lena', name: 'Lena Duarte', color: 'bg-amber-500', role: 'member', status: 'dnd', activity: 'Focus mode until 5 PM', about: 'Illustrator and motion designer.' },
    kai: { id: 'kai', name: 'Kai Nakamura', color: 'bg-teal-600', role: 'member', status: 'online', activity: 'Playing with view transitions', about: 'Creative coder. Shaders, canvas and too many side projects.' },
    sol: { id: 'sol', name: 'Sol Rivera', color: 'bg-orange-500', role: 'member', status: 'offline', activity: '', about: 'Product engineer, plant parent.' },
    ines: { id: 'ines', name: 'Ines Moreau', color: 'bg-fuchsia-500', role: 'member', status: 'online', activity: 'Writing docs', about: 'Technical writer. I will fix your README.' },
    omar: { id: 'omar', name: 'Omar Haddad', color: 'bg-indigo-500', role: 'member', status: 'offline', activity: '', about: 'Mobile developer, trail runner.' },
    ruth: { id: 'ruth', name: 'Ruth Abernathy', color: 'bg-lime-600', role: 'member', status: 'away', activity: 'Back in 20', about: 'QA lead. I break things for a living.' },
    beacon: { id: 'beacon', name: 'Beacon', color: 'bg-cyan-600', role: 'bot', status: 'online', activity: 'Watching 12 repos', about: 'The friendly automation that posts releases and reminders.', bot: true }
  };

  function initials(name) {
    var parts = String(name || '?').trim().split(/\s+/);
    return ((parts[0] || '?')[0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
  }

  // ---------------------------------------------------------------- seed data
  var seq = 0;
  function msg(author, minutesAgo, text, extra) {
    var m = { id: 'm' + (++seq), author: author, ts: NOW - minutesAgo * MIN, text: text, reactions: [], replyTo: null, edited: false, attachment: null };
    if (extra) for (var k in extra) m[k] = extra[k];
    return m;
  }
  function rx(key, n, me) { return { k: key, n: n, me: !!me }; }

  function seedServers() {
    seq = 0;
    var general = [
      msg('beacon', 1500, 'Good morning, Driftwood. Today is **release freeze** for the 2.0 branch. Merge windows close at 4 PM.', { reactions: [rx('like', 6), rx('coffee', 3)] }),
      msg('jonas', 1460, 'Does anyone have a clean pattern for a sticky table header that also works inside a scroll container?'),
      msg('theo', 1455, 'Put `position: sticky` on the `th` cells, not the row. And make sure no ancestor between the table and the scroller has `overflow: hidden`.'),
      msg('jonas', 1452, 'That was it. An old wrapper had overflow hidden on it. Thank you :sparkles:', { reactions: [rx('check', 2)] }),
      msg('lena', 1390, 'Dropping the new illustration set for the onboarding flow in #show-and-tell later today. Feedback very welcome.', { reactions: [rx('heart', 5), rx('eyes', 2)] }),
      msg('mira', 95, 'Morning crew! Quick heads up: the 2.0 release candidate is live on staging. Please give it a spin and report anything odd in #code-review.', { reactions: [rx('rocket', 9, true), rx('fire', 4)] }),
      msg('kai', 88, 'Already on it. The new theme switcher feels great. Here is the snippet I used to test the seed color:\n```css\n:root {\n  --seed: #0284c7;\n}\n[data-theme="dark"] {\n  color-scheme: dark;\n}\n```'),
      msg('kai', 87, 'One color in, a whole palette out. Still feels like magic.'),
      msg('priya', 64, '@me could you check whether the focus rings look right in high contrast mode? You found the last regression too.', { reactions: [rx('eyes', 1)] }),
      msg('theo', 41, 'Reminder that our community call is Thursday at 6 PM UTC. Agenda doc is pinned above.', { reactions: [rx('like', 7, true)] }),
      msg('ines', 23, 'I rewrote the getting started guide. It is now about half as long and covers the same ground. **Shorter docs, happier humans.**', { reactions: [rx('heart', 4), rx('like', 3)] }),
      msg('jonas', 9, 'Pairing room is open if anyone wants to debug the drag and drop list with me.'),
      msg('mira', 4, 'Love it, Ines. Shipping it with the release notes.', { reactions: [rx('sparkles', 2)] })
    ];
    general[11].replyTo = null;
    general[12].replyTo = general[10].id;
    general[3].replyTo = general[2].id;
    var pinnedGeneral = general[9].id;

    var announcements = [
      msg('mira', 4300, '**Welcome to Driftwood Devs!** Read #welcome, pick your roles, and say hi in #general. Be kind, share what you learn, and credit people.', { reactions: [rx('wave', 31), rx('heart', 18)] }),
      msg('beacon', 2900, 'Release 1.9.4 is out with 14 fixes and a faster color engine. Full notes: https://example.com/releases/1-9-4', { reactions: [rx('rocket', 12)] }),
      msg('mira', 130, 'The 2.0 release candidate is on staging. Community call on Thursday, bring questions!', { reactions: [rx('fire', 22), rx('star', 9)] })
    ];
    var frontend = [
      msg('kai', 600, 'Hot take: container queries made half of my media queries obsolete.', { reactions: [rx('fire', 5), rx('like', 3)] }),
      msg('priya', 590, 'Not even a hot take anymore. Cards that adapt to their slot are the best thing to happen to design systems.'),
      msg('theo', 350, 'Has anyone tried `:has()` for form validation states? Works nicely with `:user-invalid`.'),
      msg('jonas', 30, 'Yes, we use it for the field wrapper. Zero JavaScript for error styling now.', { reactions: [rx('check', 2)] })
    ];
    var review = [
      msg('beacon', 300, 'Pull request #482 "Composer keeps draft per channel" is ready for review.'),
      msg('theo', 120, 'Left two comments. The keyboard handling needs Shift Enter for new lines, otherwise looks great.'),
      msg('beacon', 15, 'Pull request #487 "Member list groups by role" was opened by @Jonas.')
    ];
    var showtell = [
      msg('lena', 200, 'Onboarding illustrations, round two. Calmer palette, fewer gradients, more texture.', { attachment: { name: 'onboarding-set-v2.fig', size: '18.4 MB' }, reactions: [rx('heart', 8), rx('sparkles', 5)] }),
      msg('kai', 180, 'The lighthouse one is gorgeous.')
    ];
    var offtopic = [
      msg('sol', 2600, 'Weekend plans? I am repotting every plant I own.'),
      msg('omar', 2590, 'Trail half marathon on Sunday. Wish my knees luck.', { reactions: [rx('fire', 4)] })
    ];

    var design = [
      msg('priya', 720, 'Critique thread for the dashboard redesign is open. Please be specific and kind.'),
      msg('lena', 400, 'The density toggle is lovely. I would bump the contrast on the secondary labels a bit.', { reactions: [rx('like', 3)] }),
      msg('ines', 35, 'Agreed on contrast. Also the empty states could use a friendlier sentence.')
    ];
    var trail = [
      msg('omar', 900, 'Saturday plan: Cedar Ridge loop, 14 km, meeting at the north trailhead at 7:30 AM.', { reactions: [rx('like', 6)] }),
      msg('sol', 860, 'Count me in. Bringing the good trail mix.'),
      msg('ruth', 60, 'Forecast says light rain until 9. Pack a shell.', { reactions: [rx('eyes', 2)] })
    ];
    var synth = [
      msg('kai', 1300, 'New patch: a slow evolving pad with a filter on the mod wheel. Sharing the preset later.'),
      msg('jonas', 50, 'Jam room tonight at 9? I finally fixed my MIDI clock drift.', { reactions: [rx('fire', 3)] })
    ];

    function ch(id, name, type, topic, messages, opts) {
      var c = { id: id, name: name, type: type, topic: topic || '', messages: messages || [], unread: false, mentions: 0, pinned: null, voice: [] };
      if (opts) for (var k in opts) c[k] = opts[k];
      return c;
    }

    return [
      {
        id: 'drift', name: 'Driftwood Devs', color: 'bg-sky-600', muted: false,
        categories: [
          { id: 'info', name: 'Information', collapsed: false, channels: [
            ch('welcome', 'welcome', 'text', 'Start here. House rules and how roles work.', [msg('mira', 9000, 'Hi and welcome! Be kind, share what you learn, and keep self promotion in #show-and-tell.')], { icon: 'megaphone' }),
            ch('announcements', 'announcements', 'text', 'Releases, events and news from the Harbormasters.', announcements, { icon: 'megaphone', unread: true, pinned: announcements[0].id })
          ] },
          { id: 'text', name: 'Text channels', collapsed: false, channels: [
            ch('general', 'general', 'text', 'Everything web: CSS, HTML, JavaScript and the people who write it.', general, { pinned: pinnedGeneral }),
            ch('frontend', 'frontend', 'text', 'Layouts, components, browsers and their quirks.', frontend, { unread: true }),
            ch('code-review', 'code-review', 'text', 'Pull requests looking for a second pair of eyes.', review, { unread: true, mentions: 1 }),
            ch('show-and-tell', 'show-and-tell', 'text', 'Share what you made. Feedback is a gift.', showtell),
            ch('off-topic', 'off-topic', 'text', 'Plants, runs, music and everything else.', offtopic)
          ] },
          { id: 'voice', name: 'Voice channels', collapsed: false, channels: [
            ch('lounge', 'Lounge', 'voice', '', [], { voice: ['kai', 'ines'] }),
            ch('pairing', 'Pairing room', 'voice', '', [], { voice: ['jonas'] }),
            ch('stage', 'Community stage', 'voice', '', [], { voice: [] })
          ] }
        ]
      },
      {
        id: 'night', name: 'Night Shift Design', color: 'bg-violet-600', muted: false,
        categories: [
          { id: 'text', name: 'Text channels', collapsed: false, channels: [
            ch('n-general', 'general', 'text', 'Designers who do their best work after dark.', [msg('lena', 3000, 'Welcome to Night Shift. Post your late night experiments here.'), msg('priya', 500, 'Anyone else sketching grids at 1 AM?')]),
            ch('n-critique', 'critique', 'text', 'Ask for feedback. Give feedback. Be specific.', design, { unread: true, mentions: 2 }),
            ch('n-resources', 'resources', 'text', 'Type, color, tools and reading lists.', [])
          ] },
          { id: 'voice', name: 'Voice channels', collapsed: false, channels: [
            ch('n-studio', 'Studio', 'voice', '', [], { voice: ['lena', 'priya'] })
          ] }
        ]
      },
      {
        id: 'trail', name: 'Trail Club', color: 'bg-emerald-600', muted: false,
        categories: [
          { id: 'text', name: 'Text channels', collapsed: false, channels: [
            ch('t-general', 'general', 'text', 'Weekend hikes and weekday daydreams.', trail, { unread: true }),
            ch('t-routes', 'routes', 'text', 'Maps, distances and elevation.', [msg('omar', 4000, 'Pinned the Cedar Ridge GPX in here.')]),
            ch('t-gear', 'gear-talk', 'text', 'Boots, packs and the eternal sock debate.', [])
          ] },
          { id: 'voice', name: 'Voice channels', collapsed: false, channels: [
            ch('t-camp', 'Campfire', 'voice', '', [], { voice: [] })
          ] }
        ]
      },
      {
        id: 'synth', name: 'Synth Lab', color: 'bg-amber-500', muted: false,
        categories: [
          { id: 'text', name: 'Text channels', collapsed: false, channels: [
            ch('s-general', 'general', 'text', 'Knobs, patches and happy accidents.', synth),
            ch('s-patches', 'patches', 'text', 'Share presets and patch notes.', [])
          ] },
          { id: 'voice', name: 'Voice channels', collapsed: false, channels: [
            ch('s-jam', 'Jam room', 'voice', '', [], { voice: ['kai'] })
          ] }
        ]
      }
    ];
  }

  var REPLIES = [
    'Good point. I will try that in the next build.',
    'Agreed! Let me write that down for the call on Thursday.',
    'Oh nice, I did not know that one.',
    'Can you share a screenshot? Curious how it looks in dark mode.',
    'Ha, same here. Coffee number three is kicking in.',
    'That is exactly the kind of feedback we needed, thank you.',
    'Works on my machine, which is the scariest sentence in software.',
    'Added it to the release checklist.'
  ];

  var SEEDS = [
    { name: 'Harbor', value: '#0284c7' },
    { name: 'Lagoon', value: '#0d9488' },
    { name: 'Kelp', value: '#16a34a' },
    { name: 'Sunset', value: '#ea580c' },
    { name: 'Coral', value: '#e11d48' },
    { name: 'Orchid', value: '#c026d3' },
    { name: 'Dusk', value: '#7c3aed' },
    { name: 'Slate', value: '#475569' }
  ];

  // ---------------------------------------------------------------- persistence
  function load(key, storage) {
    try { var raw = (storage || localStorage).getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function save(key, value, storage) {
    try { (storage || localStorage).setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
  }
  function drop(key) {
    try { localStorage.removeItem(key); sessionStorage.removeItem(key); } catch (e) { /* ignore */ }
  }

  var saved = load(STORE_KEY);
  var auth = load(AUTH_KEY) || load(AUTH_KEY, sessionStorage);

  var defaults = {
    servers: seedServers(),
    serverId: 'drift',
    channelByServer: { drift: 'general', night: 'n-general', trail: 't-general', synth: 's-general' },
    me: { id: 'me', name: 'Alex Rivers', color: 'bg-primary', status: 'online', about: 'Here for the CSS and the company.', role: 'member' },
    settings: { seed: SEEDS[0].value, density: 'cozy', desktop: true, sounds: true, mentionsOnly: false, reduceMotion: false },
    muted: false,
    deafened: false,
    membersOpen: true,
    voice: null
  };
  var base = saved && saved.servers ? saved : defaults;

  // ---------------------------------------------------------------- state
  var S = V.data({
    // auth screen
    authed: !!(auth && auth.ok),
    authMode: 'signin',
    form: { name: '', email: '', password: '', remember: true },
    errors: { name: '', email: '', password: '' },
    showPassword: false,
    busy: false,
    notice: '',

    // app
    users: USERS,
    roles: ROLES,
    seeds: SEEDS,
    reactionKeys: REACTION_KEYS,
    shortcodes: SHORTCODES,
    servers: base.servers,
    serverId: base.serverId,
    channelByServer: base.channelByServer,
    me: base.me || defaults.me,
    settings: Object.assign({}, defaults.settings, base.settings || {}),
    muted: !!base.muted,
    deafened: !!base.deafened,
    membersOpen: base.membersOpen !== false,
    voice: base.voice || null,

    navOpen: false,
    membersSheet: false,
    wide: true,
    query: '',
    draft: '',
    replyTo: null,
    editing: null,
    editText: '',
    pickerFor: null,
    composerPicker: false,
    typing: null,
    flash: null,
    hidePinned: {},
    attachment: null,
    settingsTab: 'account',
    profileId: null,
    newServer: { name: '' },
    newChannel: { name: '', type: 'text', categoryId: '' },
    pendingDelete: null,
    toasts: [],

    // ------------------------------------------------------------ helpers for templates
    icon: function (name, cls) { return svg(name, cls); },
    iconTone: function (name) { return ICON_TONES[name] || ''; },
    initials: initials,
    user: function (id) { return id === 'me' ? S.me : (S.users[id] || { id: id, name: 'Unknown', color: 'bg-zinc-500', role: 'member', status: 'offline' }); },
    roleText: function (u) { return u && S.roles[u.role] ? S.roles[u.role].text : ''; },
    statusAvatar: function (status) {
      return { online: 'avatar-online', away: 'avatar-away', dnd: 'avatar-busy', offline: 'avatar-offline', invisible: 'avatar-offline' }[status] || 'avatar-offline';
    },
    statusLabel: function (status) {
      return { online: 'Online', away: 'Idle', dnd: 'Do not disturb', offline: 'Offline', invisible: 'Invisible' }[status] || 'Offline';
    },
    statusDot: function (status) {
      return { online: 'status-online', away: 'status-away', dnd: 'status-busy', offline: 'status-offline', invisible: 'status-offline' }[status] || 'status-offline';
    },

    server: function () {
      for (var i = 0; i < S.servers.length; i++) if (S.servers[i].id === S.serverId) return S.servers[i];
      return S.servers[0];
    },
    channelId: function () {
      var sv = S.server();
      return sv ? S.channelByServer[sv.id] : null;
    },
    allChannels: function (sv) {
      var out = [];
      (sv || S.server()).categories.forEach(function (c) { c.channels.forEach(function (x) { out.push(x); }); });
      return out;
    },
    channel: function () {
      var id = S.channelId();
      var list = S.allChannels();
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return list.filter(function (c) { return c.type === 'text'; })[0] || null;
    },
    serverUnread: function (sv) {
      return S.allChannels(sv).some(function (c) { return c.unread || c.mentions > 0; });
    },
    serverMentions: function (sv) {
      return S.allChannels(sv).reduce(function (n, c) { return n + (c.mentions || 0); }, 0);
    },
    totalMentions: function () {
      return S.servers.reduce(function (n, sv) { return n + S.serverMentions(sv); }, 0);
    },

    // message list rows: date dividers plus messages grouped by author
    rows: function () {
      var ch = S.channel();
      if (!ch) return [];
      var q = S.query.trim().toLowerCase();
      var list = ch.messages;
      if (q) list = list.filter(function (m) { return m.text.toLowerCase().indexOf(q) !== -1 || S.user(m.author).name.toLowerCase().indexOf(q) !== -1; });
      var out = [];
      var prev = null;
      var prevDay = null;
      list.forEach(function (m) {
        var day = dayKey(m.ts);
        if (day !== prevDay) {
          out.push({ key: 'd' + day, divider: true, label: dayLabel(m.ts), m: null, head: false });
          prevDay = day;
          prev = null;
        }
        var head = !prev || prev.author !== m.author || m.ts - prev.ts > 7 * MIN || !!m.replyTo || !!m.attachment && !prev;
        out.push({ key: m.id, divider: false, label: '', m: m, head: head });
        prev = m;
      });
      return out;
    },
    resultCount: function () { return S.rows().filter(function (r) { return !r.divider; }).length; },
    findMessage: function (id) {
      var ch = S.channel();
      if (!ch || !id) return null;
      for (var i = 0; i < ch.messages.length; i++) if (ch.messages[i].id === id) return ch.messages[i];
      return null;
    },
    pinnedMessage: function () {
      var ch = S.channel();
      return ch && ch.pinned && !S.hidePinned[ch.id] ? S.findMessage(ch.pinned) : null;
    },
    mentionsMe: function (m) {
      var first = S.me.name.split(' ')[0].toLowerCase();
      var t = m.text.toLowerCase();
      return t.indexOf('@me') !== -1 || t.indexOf('@' + first) !== -1;
    },
    render: function (m) { return renderText(m.text); },
    snippet: function (m) {
      if (!m) return '';
      var t = m.text.replace(/```[\s\S]*?```/g, '[code]').replace(/[*`]/g, '').replace(/@me\b/g, '@' + S.me.name.split(' ')[0]).replace(/:([a-z]+):/g, '');
      return t.length > 90 ? t.slice(0, 90) + '...' : t;
    },
    stamp: function (ts) {
      var d = new Date(ts);
      var t = timeOf(ts);
      var k = dayKey(ts);
      if (k === dayKey(Date.now())) return 'Today at ' + t;
      if (k === dayKey(Date.now() - DAY)) return 'Yesterday at ' + t;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + t;
    },
    shortTime: function (ts) { return timeOf(ts).replace(/\s?[AP]M$/i, ''); },
    fullDate: function (ts) { return new Date(ts).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }); },

    memberGroups: function () {
      var everyone = Object.keys(S.users).map(function (k) { return S.users[k]; }).concat([S.me]);
      var groups = {};
      var offline = [];
      everyone.forEach(function (u) {
        if (u.status === 'offline' || u.status === 'invisible') { offline.push(u); return; }
        (groups[u.role] = groups[u.role] || []).push(u);
      });
      var out = Object.keys(groups).sort(function (a, b) { return S.roles[a].order - S.roles[b].order; }).map(function (role) {
        return { key: role, label: S.roles[role].name, users: groups[role].sort(byName), offline: false };
      });
      if (offline.length) out.push({ key: 'offline', label: 'Offline', users: offline.sort(byName), offline: true });
      return out;
    },
    onlineCount: function () {
      return Object.keys(S.users).filter(function (k) { return S.users[k].status !== 'offline'; }).length + (S.me.status === 'invisible' ? 0 : 1);
    },
    typingLabel: function () {
      var ch = S.channel();
      if (!S.typing || !ch || S.typing.channel !== ch.id) return '';
      return S.user(S.typing.user).name.split(' ')[0] + ' is typing';
    },
    draftRows: function () { return Math.min(8, Math.max(1, S.draft.split('\n').length)); },
    themeChoice: function () { return S.themeCurrent; },
    themeCurrent: 'system',
    membersVisible: function () { return S.wide ? S.membersOpen : S.membersSheet; },

    // ------------------------------------------------------------ auth
    submitAuth: function () {
      var f = S.form;
      S.errors.name = S.authMode === 'signup' && f.name.trim().length < 2 ? 'Tell us what to call you.' : '';
      S.errors.email = !f.email.trim() ? 'Enter your email address.' : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()) ? '' : 'That email address does not look right.');
      S.errors.password = !f.password ? 'Enter your password.' : (f.password.length < 6 ? 'Passwords have at least 6 characters.' : '');
      if (S.errors.name || S.errors.email || S.errors.password) {
        V.nextTick(function () {
          var el = document.querySelector('[aria-invalid="true"]');
          if (el) el.focus();
        });
        return;
      }
      var name = f.name.trim() || nameFromEmail(f.email);
      S.busy = true;
      setTimeout(function () { finishLogin(name, f.remember); }, 650);
    },
    quickLogin: function (method) {
      S.busy = true;
      S.notice = '';
      setTimeout(function () { finishLogin(S.form.name.trim() || 'Alex Rivers', true, method); }, 500);
    },
    forgot: function () {
      S.notice = S.form.email ? 'If an account exists for ' + S.form.email + ', a reset link is on its way.' : 'Enter your email above and we will send you a reset link.';
    },
    switchMode: function (mode) {
      S.authMode = mode;
      S.errors.name = S.errors.email = S.errors.password = '';
      S.notice = '';
    },
    signOut: function () {
      closePopover('status-menu');
      closeDialog('settings');
      drop(AUTH_KEY);
      S.authed = false;
      S.busy = false;
      S.form.password = '';
      S.authMode = 'signin';
    },

    // ------------------------------------------------------------ navigation
    selectServer: function (id) {
      S.serverId = id;
      S.query = '';
      S.editing = null;
      S.replyTo = null;
      var ch = S.channel();
      if (ch) markRead(ch);
      scrollToEnd();
    },
    selectChannel: function (ch) {
      if (ch.type === 'voice') { S.joinVoice(ch); return; }
      S.channelByServer[S.serverId] = ch.id;
      S.query = '';
      S.editing = null;
      S.replyTo = null;
      S.pickerFor = null;
      markRead(ch);
      if (!S.wide) S.navOpen = false;
      scrollToEnd();
      focusComposer();
    },
    toggleCategory: function (cat) { cat.collapsed = !cat.collapsed; },
    toggleMembers: function () {
      if (S.wide) S.membersOpen = !S.membersOpen;
      else S.membersSheet = !S.membersSheet;
    },

    joinVoice: function (ch) {
      if (S.voice && S.voice.channel === ch.id) return;
      S.leaveVoice(true);
      ch.voice.push('me');
      S.voice = { server: S.serverId, channel: ch.id, name: ch.name, serverName: S.server().name };
      toast('Connected to ' + ch.name, 'voice');
    },
    leaveVoice: function (silent) {
      if (!S.voice) return;
      S.servers.forEach(function (sv) {
        S.allChannels(sv).forEach(function (c) {
          var i = c.voice ? c.voice.indexOf('me') : -1;
          if (i !== -1) c.voice.splice(i, 1);
        });
      });
      S.voice = null;
      if (silent !== true) toast('Disconnected from voice', 'voice');
    },

    // ------------------------------------------------------------ composer
    composerKey: function (e) {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); S.send(); }
      else if (e.key === 'Escape') { S.replyTo = null; S.composerPicker = false; }
      else if (e.key === 'ArrowUp' && !S.draft) {
        var ch = S.channel();
        var mine = ch ? ch.messages.filter(function (m) { return m.author === 'me'; }) : [];
        if (mine.length) { e.preventDefault(); S.startEdit(mine[mine.length - 1]); }
      }
    },
    send: function () {
      var ch = S.channel();
      var text = S.draft.replace(/\s+$/, '');
      if (!ch || (!text.trim() && !S.attachment)) return;
      var m = { id: 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), author: 'me', ts: Date.now(), text: text, reactions: [], replyTo: S.replyTo, edited: false, attachment: S.attachment };
      ch.messages.push(m);
      S.draft = '';
      S.replyTo = null;
      S.attachment = null;
      S.composerPicker = false;
      S.query = '';
      scrollToEnd();
      simulateReply(ch, m);
    },
    reply: function (m) {
      S.replyTo = m.id;
      S.pickerFor = null;
      focusComposer();
    },
    insertCode: function (code) {
      S.draft = (S.draft && !/\s$/.test(S.draft) ? S.draft + ' ' : S.draft) + ':' + code + ': ';
      S.composerPicker = false;
      focusComposer();
    },
    pickFile: function () { var el = document.getElementById('file-input'); if (el) el.click(); },
    fileChosen: function (e) {
      var f = e.target.files && e.target.files[0];
      if (!f) return;
      S.attachment = { name: f.name, size: prettySize(f.size) };
      e.target.value = '';
      focusComposer();
    },

    // ------------------------------------------------------------ message actions
    toggleReaction: function (m, key) {
      var r = null;
      for (var i = 0; i < m.reactions.length; i++) if (m.reactions[i].k === key) r = m.reactions[i];
      if (!r) m.reactions.push({ k: key, n: 1, me: true });
      else if (r.me) {
        r.me = false;
        r.n--;
        if (r.n <= 0) m.reactions.splice(m.reactions.indexOf(r), 1);
      } else { r.me = true; r.n++; }
      S.pickerFor = null;
    },
    openPicker: function (m) { S.pickerFor = S.pickerFor === m.id ? null : m.id; },
    startEdit: function (m) {
      S.editing = m.id;
      S.editText = m.text;
      S.pickerFor = null;
      V.nextTick(function () {
        var el = document.getElementById('edit-' + m.id);
        if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); }
      });
    },
    editKey: function (e, m) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); S.saveEdit(m); }
      else if (e.key === 'Escape') { e.preventDefault(); S.editing = null; focusComposer(); }
    },
    saveEdit: function (m) {
      var t = S.editText.trim();
      if (!t) { S.askDelete(m); return; }
      if (t !== m.text) { m.text = t; m.edited = true; }
      S.editing = null;
      focusComposer();
    },
    askDelete: function (m) {
      S.pendingDelete = m.id;
      S.editing = null;
      openDialog('confirm-delete');
    },
    confirmDelete: function () {
      var ch = S.channel();
      if (ch && S.pendingDelete) {
        var i = ch.messages.findIndex(function (x) { return x.id === S.pendingDelete; });
        if (i !== -1) ch.messages.splice(i, 1);
        if (ch.pinned === S.pendingDelete) ch.pinned = null;
        toast('Message deleted', 'trash');
      }
      S.pendingDelete = null;
      closeDialog('confirm-delete');
    },
    togglePin: function (m) {
      var ch = S.channel();
      if (!ch) return;
      ch.pinned = ch.pinned === m.id ? null : m.id;
      S.hidePinned[ch.id] = false;
      S.pickerFor = null;
      toast(ch.pinned ? 'Message pinned to #' + ch.name : 'Message unpinned', 'pin');
    },
    jumpTo: function (id) {
      S.query = '';
      V.nextTick(function () {
        var el = document.getElementById('msg-' + id);
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: S.settings.reduceMotion ? 'auto' : 'smooth' });
          S.flash = id;
          setTimeout(function () { if (S.flash === id) S.flash = null; }, 1600);
        }
      });
    },
    hidePin: function () { var ch = S.channel(); if (ch) S.hidePinned[ch.id] = true; },

    // ------------------------------------------------------------ server menu
    markServerRead: function () {
      S.allChannels().forEach(function (c) { c.unread = false; c.mentions = 0; });
      closePopover('server-menu');
      toast('Marked ' + S.server().name + ' as read', 'check');
    },
    toggleServerMute: function () {
      var sv = S.server();
      sv.muted = !sv.muted;
      closePopover('server-menu');
      toast(sv.muted ? sv.name + ' muted' : sv.name + ' unmuted', 'bell');
    },
    invite: function () {
      closePopover('server-menu');
      var link = 'https://harbor.example/invite/' + S.server().id + '-' + Math.random().toString(36).slice(2, 7);
      try { navigator.clipboard.writeText(link); } catch (e) { /* clipboard blocked */ }
      toast('Invite link copied to clipboard', 'link');
    },
    openCreateChannel: function (categoryId) {
      closePopover('server-menu');
      var sv = S.server();
      S.newChannel.name = '';
      S.newChannel.type = 'text';
      S.newChannel.categoryId = categoryId || (sv.categories.filter(function (c) { return c.id !== 'voice'; })[0] || sv.categories[0]).id;
      openDialog('create-channel');
    },
    createChannel: function () {
      var sv = S.server();
      var name = S.newChannel.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (S.newChannel.type === 'voice') name = S.newChannel.name.trim();
      if (!name) return;
      var cat = null;
      var wanted = S.newChannel.type === 'voice' ? 'voice' : S.newChannel.categoryId;
      sv.categories.forEach(function (c) { if (c.id === wanted) cat = c; });
      if (!cat) cat = sv.categories[sv.categories.length - 1];
      var c = { id: 'c' + Date.now().toString(36), name: name, type: S.newChannel.type, topic: '', messages: [], unread: false, mentions: 0, pinned: null, voice: [] };
      cat.channels.push(c);
      cat.collapsed = false;
      closeDialog('create-channel');
      if (c.type === 'text') S.selectChannel(c);
      toast('Created ' + (c.type === 'text' ? '#' : '') + c.name, 'plus');
    },
    openCreateServer: function () {
      S.newServer.name = S.me.name.split(' ')[0] + '\'s place';
      openDialog('create-server');
    },
    createServer: function () {
      var name = S.newServer.name.trim();
      if (!name) return;
      var colors = ['bg-pink-500', 'bg-cyan-600', 'bg-lime-600', 'bg-orange-500', 'bg-indigo-500', 'bg-teal-600'];
      var id = 's' + Date.now().toString(36);
      var gid = id + '-general';
      S.servers.push({
        id: id, name: name, color: colors[S.servers.length % colors.length], muted: false,
        categories: [
          { id: 'text', name: 'Text channels', collapsed: false, channels: [{ id: gid, name: 'general', type: 'text', topic: 'Say hello to your new server.', messages: [{ id: 'm' + Date.now().toString(36), author: 'beacon', ts: Date.now(), text: 'Welcome to **' + name + '**! Invite friends with the server menu, then start a conversation here. :wave:', reactions: [], replyTo: null, edited: false, attachment: null }], unread: false, mentions: 0, pinned: null, voice: [] }] },
          { id: 'voice', name: 'Voice channels', collapsed: false, channels: [{ id: id + '-lounge', name: 'Lounge', type: 'voice', topic: '', messages: [], unread: false, mentions: 0, pinned: null, voice: [] }] }
        ]
      });
      S.channelByServer[id] = gid;
      closeDialog('create-server');
      S.selectServer(id);
      toast('Server created', 'plus');
    },
    leaveServer: function () {
      closePopover('server-menu');
      if (S.servers.length < 2) return;
      var sv = S.server();
      var i = S.servers.indexOf(sv);
      S.servers.splice(i, 1);
      S.selectServer(S.servers[Math.max(0, i - 1)].id);
      toast('You left ' + sv.name, 'logout');
    },

    // ------------------------------------------------------------ user panel and settings
    setStatus: function (status) {
      S.me.status = status;
      closePopover('status-menu');
    },
    toggleMute: function () {
      S.muted = !S.muted;
      if (!S.muted && S.deafened) S.deafened = false;
    },
    toggleDeafen: function () {
      S.deafened = !S.deafened;
      S.muted = S.deafened ? true : S.muted;
    },
    openSettings: function (tab) {
      S.settingsTab = tab || 'account';
      closePopover('status-menu');
      openDialog('settings');
    },
    openProfile: function (id) {
      S.profileId = id;
      if (!S.wide) S.membersSheet = false;
      openDialog('profile');
    },
    mentionUser: function (u) {
      closeDialog('profile');
      S.draft = (S.draft ? S.draft.replace(/\s*$/, ' ') : '') + '@' + u.name.split(' ')[0] + ' ';
      focusComposer();
    },
    setTheme: function (value) {
      V.theme.set(value);
      S.themeCurrent = value;
    },
    setSeed: function (value) {
      S.settings.seed = value;
      applySeed();
    },
    resetDemo: function () {
      drop(STORE_KEY);
      var fresh = seedServers();
      S.servers = fresh;
      S.serverId = 'drift';
      S.channelByServer = { drift: 'general', night: 'n-general', trail: 't-general', synth: 's-general' };
      S.voice = null;
      S.settings.seed = SEEDS[0].value;
      applySeed();
      closeDialog('settings');
      scrollToEnd();
      toast('Demo data restored', 'check');
    },

    // ------------------------------------------------------------ dialogs and toasts
    openDialog: function (id) { openDialog(id); },
    closeDialog: function (id) { closeDialog(id); },
    dismissToast: function (t) { var i = S.toasts.indexOf(t); if (i !== -1) S.toasts.splice(i, 1); }
  });

  // ---------------------------------------------------------------- functions outside the scope
  function byName(a, b) { return a.name.localeCompare(b.name); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function dayKey(ts) { var d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayLabel(ts) {
    var k = dayKey(ts);
    if (k === dayKey(Date.now())) return 'Today';
    if (k === dayKey(Date.now() - DAY)) return 'Yesterday';
    return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  function timeOf(ts) { return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function prettySize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }
  function nameFromEmail(email) {
    var local = String(email).split('@')[0].replace(/[._-]+/g, ' ').trim();
    if (!local) return 'Alex Rivers';
    return local.split(' ').map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(' ');
  }
  function finishLogin(name, remember, method) {
    S.me.name = name;
    S.busy = false;
    S.authed = true;
    S.form.password = '';
    S.notice = '';
    var record = { ok: true, at: Date.now(), method: method || 'password' };
    if (remember) save(AUTH_KEY, record);
    else save(AUTH_KEY, record, sessionStorage);
    var ch = S.channel();
    if (ch) markRead(ch);
    scrollToEnd();
    focusComposer();
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function inlineMarkup(text) {
    // split on inline code first so code is never transformed
    return text.split(/(`[^`\n]+`)/).map(function (part) {
      if (/^`[^`\n]+`$/.test(part)) return '<code class="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">' + esc(part.slice(1, -1)) + '</code>';
      var s = esc(part);
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold">$1</strong>');
      s = s.replace(/(https?:\/\/[^\s<]+)/g, '<a class="link link-primary" href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
      s = s.replace(/(^|[^\w])#([a-z0-9-]{2,})/g, function (m, pre, name) {
        return pre + '<span class="rounded-md bg-primary/10 px-1 py-0.5 font-medium text-primary">#' + name + '</span>';
      });
      s = s.replace(/(^|[^\w])@(\w+)/g, function (m, pre, name) {
        var first = S.me.name.split(' ')[0];
        var isMe = name.toLowerCase() === 'me' || name.toLowerCase() === first.toLowerCase();
        var label = name.toLowerCase() === 'me' ? first : name;
        return pre + '<span class="rounded-md px-1 py-0.5 font-medium ' + (isMe ? 'bg-warning/20 text-foreground' : 'bg-primary/10 text-primary') + '">@' + esc(label) + '</span>';
      });
      s = s.replace(/:([a-z]+):/g, function (m, k) {
        if (!ICON_PATHS[k] || !ICON_TONES[k]) return m;
        return '<span class="inline-flex align-text-bottom ' + ICON_TONES[k] + '" title="' + k + '">' + svg(k, 'size-5') + '</span>';
      });
      return s.replace(/\n/g, '<br>');
    }).join('');
  }
  function renderText(text) {
    var html = String(text).split(/```/).map(function (chunk, i) {
      if (i % 2 === 1) {
        var nl = chunk.indexOf('\n');
        var lang = nl > 0 ? chunk.slice(0, nl).trim() : '';
        var code = nl > 0 ? chunk.slice(nl + 1) : chunk;
        return '<figure class="code-block my-2 max-w-2xl"><figcaption class="code-block-header"><span>' + esc(lang || 'code') + '</span><span>' + code.replace(/\n$/, '').split('\n').length + ' lines</span></figcaption><pre><code>' + esc(code.replace(/\n$/, '')) + '</code></pre></figure>';
      }
      return inlineMarkup(chunk.replace(/^\n+|\n+$/g, ''));
    }).join('');
    // v-pre keeps Voodoo from reading braces typed by people as expressions
    return '<div v-pre class="break-words">' + html + '</div>';
  }

  function markRead(ch) { ch.unread = false; ch.mentions = 0; }

  function scrollToEnd() {
    var tries = 0;
    V.nextTick(function attempt() {
      var el = document.getElementById('message-scroller');
      if (!el || !el.clientHeight || el.closest('[v-cloak]')) { if (++tries < 60) setTimeout(attempt, 50); return; }
      el.scrollTop = el.scrollHeight;
    });
  }
  function focusComposer() {
    V.nextTick(function () {
      if (!S.wide && S.navOpen) return;
      var el = document.getElementById('composer');
      if (el && window.matchMedia('(pointer: fine)').matches) el.focus();
    });
  }
  function openDialog(id) {
    var d = document.getElementById(id);
    if (d && !d.open) d.showModal();
  }
  function closeDialog(id) {
    var d = document.getElementById(id);
    if (d && d.open) d.close();
  }
  function closePopover(id) {
    var p = document.getElementById(id);
    try { if (p && p.matches(':popover-open')) p.hidePopover(); } catch (e) { /* popover unsupported */ }
  }

  var toastSeq = 0;
  function toast(text, kind) {
    var t = { id: ++toastSeq, text: text, kind: kind || 'check' };
    S.toasts.push(t);
    if (S.toasts.length > 3) S.toasts.shift();
    setTimeout(function () { S.dismissToast(t); }, 3200);
  }

  var typingTimer = null;
  function simulateReply(ch, m) {
    if (S.deafened) return;
    var pool = Object.keys(USERS).filter(function (k) { return USERS[k].status === 'online' && !USERS[k].bot; });
    var who = pool[Math.floor(Math.random() * pool.length)];
    clearTimeout(typingTimer);
    typingTimer = setTimeout(function () {
      S.typing = { channel: ch.id, user: who };
      typingTimer = setTimeout(function () {
        S.typing = null;
        var text = REPLIES[Math.floor(Math.random() * REPLIES.length)];
        ch.messages.push({ id: 'm' + Date.now().toString(36) + 'r', author: who, ts: Date.now(), text: text, reactions: [], replyTo: Math.random() < 0.4 ? m.id : null, edited: false, attachment: null });
        if (S.channel() === ch) {
          var el = document.getElementById('message-scroller');
          var nearBottom = el && el.scrollHeight - el.scrollTop - el.clientHeight < 240;
          if (nearBottom) scrollToEnd();
        } else ch.unread = true;
      }, 1800 + Math.random() * 1400);
    }, 700);
  }

  function applySeed() {
    document.documentElement.style.setProperty('--seed', S.settings.seed);
  }

  // ---------------------------------------------------------------- wiring
  applySeed();
  try { S.themeCurrent = V.theme.current; } catch (e) { S.themeCurrent = 'system'; }

  var mq = window.matchMedia('(min-width: 1280px)');
  function syncWide() { S.wide = mq.matches; if (S.wide) S.membersSheet = false; }
  syncWide();
  if (mq.addEventListener) mq.addEventListener('change', syncWide);

  var persistTimer = null;
  V.effect(function () {
    var snapshot = JSON.stringify({
      servers: S.servers, serverId: S.serverId, channelByServer: S.channelByServer, me: S.me,
      settings: S.settings, muted: S.muted, deafened: S.deafened, membersOpen: S.membersOpen, voice: S.voice
    });
    clearTimeout(persistTimer);
    persistTimer = setTimeout(function () { try { localStorage.setItem(STORE_KEY, snapshot); } catch (e) { /* ignore */ } }, 250);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (S.pickerFor) S.pickerFor = null;
      if (S.composerPicker) S.composerPicker = false;
      if (S.membersSheet) S.membersSheet = false;
      if (S.navOpen && !S.wide) S.navOpen = false;
    }
    var tag = (e.target && e.target.tagName) || '';
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      var s = document.getElementById('message-search');
      if (s) s.focus();
    } else if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && S.authed) {
      e.preventDefault();
      var list = S.allChannels().filter(function (c) { return c.type === 'text'; });
      var i = list.indexOf(S.channel());
      var next = list[(i + (e.key === 'ArrowDown' ? 1 : -1) + list.length) % list.length];
      if (next) S.selectChannel(next);
    } else if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && S.authed) {
      e.preventDefault();
      focusComposer();
    }
  });

  document.addEventListener('click', function (e) {
    if (S.composerPicker && !e.target.closest('[data-composer-picker]')) S.composerPicker = false;
    if (S.pickerFor && !e.target.closest('[data-reaction-picker]')) S.pickerFor = null;
  });

  if (S.authed) {
    var first = S.channel();
    if (first) markRead(first);
    scrollToEnd();
  }
})();
