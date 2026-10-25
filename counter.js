// Visit counter (hits.sh, no cookies): one hit per page view, plus outbound link clicks
(function () {
  try {
    var base = 'https://hits.sh/veles98.github.io/arcade';
    var p = location.pathname.replace(/^\/arcade/, '').replace(/index\.html$/, '').replace(/\/$/, '');
    var img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.src = base + (p || '') + '.svg';
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.hostname === location.hostname) return;
      var o = new Image();
      o.referrerPolicy = 'no-referrer';
      o.src = base + '/out/' + a.hostname.replace(/[^a-z0-9.-]/gi, '') + '.svg';
    }, true);
  } catch (e) {}
})();
