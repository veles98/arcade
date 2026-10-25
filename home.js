// Home page: renders the reels, tools and games from posts.json, newest first.
// Add an item with tools/add_post.py (or edit posts.json by hand) - no HTML to touch.
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var REEL_LIMIT = 12;                       // most reels shown in the cover grid (keep it a multiple of 3)
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
    // full rows only: the newest multiple of 3 (at most REEL_LIMIT), so the grid never ends with a lonely tile
    fill('reels', reels.slice(0, Math.min(REEL_LIMIT, Math.max(3, reels.length - reels.length % 3))), reel);
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

  // cache: 'no-cache' = always revalidate, so a new post shows up even when this page itself is still cached
  fetch('posts.json' + (V ? '?v=' + encodeURIComponent(V) : ''), { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(fail);
})();
