// Home page: hero stats + featured projects from featured.json, reels/tools/games from posts.json (newest first).
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

  function renderHub(data) {
    var s = document.getElementById('stats');
    if (s) {
      s.textContent = '';
      (data.stats || []).forEach(function (x) {
        var li = el('li');
        li.appendChild(el('b', null, x.v));
        li.appendChild(el('small', null, x.l));
        s.appendChild(li);
      });
    }
    var box = document.getElementById('feats');
    if (box) { box.textContent = ''; (data.featured || []).forEach(function (f, i) { box.appendChild(feature(f, i)); }); }
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

  function render(data) {
    var posts = newestFirst(data.posts || []);
    function of(type) { return posts.filter(function (p) { return p.type === type; }); }
    var reels = of('reel');
    // full rows only: the newest multiple of the column count (at most REEL_LIMIT), so the grid never ends with a lonely tile
    var cols = WIDE.matches ? 6 : 3;
    fill('reels', reels.slice(0, Math.min(REEL_LIMIT, Math.max(cols, reels.length - reels.length % cols))), reel);
    fill('tools', of('tool'), card);
    fill('gameList', of('game'), card);
    var upd = document.getElementById('upd');
    if (upd && posts.length) {
      upd.textContent = 'آخر تحديث: ';
      upd.appendChild(el('b', null, arabicDate(posts[0].date)));
    }
  }

  function fail() {
    var r = document.getElementById('reels');
    if (r) { r.textContent = ''; r.appendChild(el('div', 'empty', 'تعذّر تحميل القائمة، حدّث الصفحة.')); }
  }

  fetch('featured.json' + (V ? '?v=' + encodeURIComponent(V) : ''), { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(renderHub)
    .catch(function () {});

  // cache: 'no-cache' = always revalidate, so a new post shows up even when this page itself is still cached
  fetch('posts.json' + (V ? '?v=' + encodeURIComponent(V) : ''), { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(fail);
})();
