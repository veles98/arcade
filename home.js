// Games page (games.html): games + featured projects from featured.json, «رحلة التعلّم» from learn.json, reels/tools/games from posts.json
// (newest first). The hero numbers are counted from those files, never typed by hand.
// Add a reel or game with tools/add_post.py; edit featured.json by hand for the hero stats and the project cards.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var REEL_LIMIT = 12;                       // most reels shown in the cover grid (keep it a multiple of 6)
  var WIDE = window.matchMedia ? window.matchMedia('(min-width:760px)') : { matches: false };   // 6 columns, else 3
  var V = '';
  try { V = new URL(document.currentScript.src).searchParams.get('v') || ''; } catch (e) {}

  // newest first: date, then the shipment number (الشحنة), then the order inside posts.json
  function newestFirst(list) {
    return list.map(function (p, i) { return { p: p, i: i }; }).sort(function (a, b) {
      var d = (Date.parse(b.p.date) || 0) - (Date.parse(a.p.date) || 0);
      if (d) return d;
      var n = (b.p.n || 0) - (a.p.n || 0);
      return n || a.i - b.i;
    }).map(function (x) { return x.p; });
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function external(href) {
    try { return new URL(href, location.href).hostname !== location.hostname; } catch (e) { return false; }
  }
  function link(a, p) {
    a.href = p.link;
    if (external(p.link)) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }

  function reel(p) {
    var a = link(el('a', 'reel'), p), img = new Image();
    img.src = p.cover; img.alt = p.title; img.loading = 'lazy'; img.width = 360; img.height = 480;
    a.appendChild(img);
    return a;
  }

  function card(p) {
    var a = link(el('a', 'game glass'), p), ico = el('div', 'ico'), body = el('div'), t = el('div', 't', p.title);
    if (p.cover) {
      var img = new Image();
      img.src = p.cover; img.alt = ''; img.loading = 'lazy';
      ico.appendChild(img);
    } else {
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('viewBox', '0 0 32 32');
      svg.innerHTML = p.icon || '<rect x="6" y="6" width="20" height="20" rx="5"/>';   // our own markup from posts.json
      ico.appendChild(svg);
    }
    if (p.badge) t.appendChild(el('span', 'badge', p.badge));
    if (p.n) t.appendChild(el('span', 'chip', 'الشحنة ' + p.n));
    body.appendChild(t);
    if (p.desc) body.appendChild(el('div', 'd', p.desc));
    a.appendChild(ico); a.appendChild(body);
    if (p.best) {
      var b = el('div', 'best');
      try { var v = localStorage.getItem(p.best); if (v && +v > 0) b.textContent = 'أفضل نتيجة لك: ' + v; } catch (e) {}
      a.appendChild(b);
    }
    return a;
  }

  function feature(f, i) {
    var a = el(f.link ? 'a' : 'div', 'feat glass' + (f.soon ? ' soon' : '')), fm = el('div', 'fm'), img = new Image(), fb = el('div', 'fb');
    if (f.link) link(a, f);
    img.src = f.image; img.alt = f.title; img.width = 1200; img.height = 750; img.decoding = 'async';
    if (i > 0) img.loading = 'lazy';
    fm.appendChild(img);
    if (f.badge) fm.appendChild(el('span', 'fbadge', f.badge));
    if (f.kicker) fb.appendChild(el('div', 'fk', f.kicker));
    fb.appendChild(el('h3', null, f.title));
    if (f.desc) fb.appendChild(el('p', null, f.desc));
    if (f.cta) fb.appendChild(el('span', 'fgo', f.cta + ' ←'));
    a.appendChild(fm); a.appendChild(fb);
    return a;
  }

  var AR = '٠١٢٣٤٥٦٧٨٩';
  function arNum(n) { return String(n).replace(/\d/g, function (c) { return AR[c]; }); }
  function key(href) { try { return new URL(href, location.href).href.replace(/\/(index\.html)?$/, ''); } catch (e) { return href; } }
  function visible(posts) { return newestFirst(((posts && posts.posts) || []).filter(function (p) { return !p.hidden; })); }
  function isGame(f) { return f.kind === 'game'; }                 // shown in the games section
  function playable(f) { return isGame(f) && !f.soon && f.link; }   // counted as a game

  // every game once: the big featured game cards first, then the small cards from posts.json that are not featured
  function games(feat, posts) {
    var big = ((feat && feat.featured) || []).filter(isGame), seen = {};
    big.forEach(function (f) { if (f.link) seen[key(f.link)] = 1; });
    var small = visible(posts).filter(function (p) { return p.type === 'game' && !seen[key(p.link)]; });
    return { big: big, small: small };
  }

  // hero numbers: only what the site can count by itself (featured.json "stats": [{auto, l}]). Follower or view
  // counts typed by hand go stale, so they are not supported; the «آخر تحديث» date is the newest content date.
  function renderStats(feat, posts, learn) {
    var s = document.getElementById('stats');
    if (!s) return;
    var g = games(feat, posts), list = visible(posts);
    var count = {
      games: g.big.filter(playable).length + g.small.length,
      lessons: ((learn && learn.lessons) || []).filter(function (l) { return !l.soon; }).length,
      reels: list.filter(function (p) { return p.type === 'reel'; }).length,
      tools: list.filter(function (p) { return p.type === 'tool'; }).length
    };
    s.textContent = '';
    ((feat && feat.stats) || []).forEach(function (x) {
      var v = count[x.auto];
      if (!v) return;
      var li = el('li');
      li.appendChild(el('b', null, arNum(v)));
      li.appendChild(el('small', null, x.l));
      s.appendChild(li);
    });
    var dates = list.map(function (p) { return p.date; }).concat([feat && feat.updated, learn && learn.updated]).filter(Boolean).sort();
    var upd = document.getElementById('upd');
    if (upd && dates.length) {
      upd.textContent = 'آخر تحديث: ';
      upd.appendChild(el('b', null, arabicDate(dates[dates.length - 1])));
      upd.hidden = false;
    }
  }

  function renderHub(feat, posts) {
    var all = (feat && feat.featured) || [], gbox = document.getElementById('gameFeats'), box = document.getElementById('feats');
    if (gbox) {
      gbox.textContent = '';
      all.filter(isGame).forEach(function (f, i) { gbox.appendChild(feature(f, i)); });
      all = all.filter(function (f) { return !isGame(f); });
    }
    if (box) { box.textContent = ''; all.forEach(function (f, i) { box.appendChild(feature(f, i)); }); }
    fill('gameList', games(feat, posts).small, card);
  }

  function fill(id, items, make) {
    var box = document.getElementById(id);
    if (!box) return;
    box.textContent = '';
    items.forEach(function (p) { box.appendChild(make(p)); });
  }

  function arabicDate(iso) {
    try {
      return new Intl.DateTimeFormat('ar-u-nu-latn-ca-gregory', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
        .format(new Date(iso));
    } catch (e) { return iso; }
  }

  // «رحلة التعلّم»: one card per episode from learn.json; the next episode is a greyed «soon» card
  function lesson(l) {
    var a = el(l.link ? 'a' : 'div', 'lesson glass' + (l.soon ? ' soon' : '')), lc = el('div', 'lc'), lb = el('div', 'lb');
    if (l.link) link(a, l);
    if (l.cover) {
      var img = new Image();
      img.src = l.cover; img.alt = l.title; img.width = 600; img.height = 800; img.decoding = 'async';
      lc.appendChild(img);
    } else {
      lc.appendChild(el('span', 'lnum', String(l.n).replace(/\d/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'[c]; })));
    }
    lb.appendChild(el('div', 'ln', 'الحلقة ' + String(l.n).replace(/\d/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'[c]; })));
    if (l.kicker) lb.appendChild(el('div', 'fk', l.kicker));
    lb.appendChild(el('h3', null, l.title));
    if (l.desc) lb.appendChild(el('p', null, l.desc));
    if (l.cta) lb.appendChild(el('span', 'fgo', l.cta + ' ←'));
    a.appendChild(lc); a.appendChild(lb);
    return a;
  }

  function renderLearn(data) { fill('lessons', data.lessons || [], lesson); }

  function render(data) {
    // hidden = archived on Instagram: kept in posts.json for history, never shown
    var posts = visible(data);
    function of(type) { return posts.filter(function (p) { return p.type === type; }); }
    var reels = of('reel');
    // full rows only: the newest multiple of the column count (at most REEL_LIMIT), so the grid never ends with a lonely tile
    var cols = WIDE.matches ? 6 : 3;
    fill('reels', reels.slice(0, Math.min(REEL_LIMIT, Math.max(cols, reels.length - reels.length % cols))), reel);
    fill('tools', of('tool'), card);
  }

  function fail() {
    var r = document.getElementById('reels');
    if (r) { r.textContent = ''; r.appendChild(el('div', 'empty', 'تعذّر تحميل القائمة، حدّث الصفحة.')); }
  }

  // cache: 'no-cache' = always revalidate, so a new post shows up even when this page itself is still cached
  function get(name) {
    return fetch(name + (V ? '?v=' + encodeURIComponent(V) : ''), { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function () { return null; });
  }
  Promise.all([get('featured.json'), get('posts.json'), get('learn.json')]).then(function (r) {
    var feat = r[0], posts = r[1], learn = r[2];
    renderHub(feat, posts);
    if (learn) renderLearn(learn);
    if (posts) render(posts); else fail();
    renderStats(feat, posts, learn);
  });
})();

// hero medallion: replay the gold redraw / flip / glint each time the theme changes (theme.js fires `anas:theme`)
(function () {
  var m = document.getElementById('medal');
  if (!m) return;
  document.addEventListener('anas:theme', function () {
    m.classList.remove('swap');
    void m.offsetWidth;
    m.classList.add('swap');
  });
  m.addEventListener('animationend', function (e) { if (e.animationName === 'draw') m.classList.remove('swap'); });
})();
