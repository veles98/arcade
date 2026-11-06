// nav.js: the ONE header and footer of anas.ai.ar (veles98.github.io/arcade). Every page loads this file,
// so no page carries its own copy of the header/footer HTML and the pages cannot drift apart again.
//
// Normal page (needs theme.css + theme.js for the colours and the theme picker):
//   <div data-site="header"></div><script src="/arcade/nav.js?v=STAMP"></script>   <- right after the placeholder,
//   ...page...                                                                         so the header is drawn before first paint
//   <div data-site="footer"></div>                                                   <- filled once the page has loaded
// Full-screen canvas game (no theme.css): <div data-site="game"></div> + the same script tag.
//   It draws a small «كل الألعاب» chip that fades out while you play and comes back when you stop.
// The ?v= stamp is rewritten by tools/bump_version.py; run it after editing this file.
(function () {
  'use strict';
  var d = document, R = '/arcade/';
  var here = location.pathname.replace(/index\.html$/, '');
  var IG = 'https://www.instagram.com/anas.ai.ar/';
  var MARK = '<svg class="site-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">' +
    '<path d="M20 3 37 12v16L20 37 3 28V12L20 3Z" stroke="currentColor"/>' +
    '<path d="m12 25 8-15 8 15M15 20h10M20 25v5" stroke="currentColor" stroke-width="2.2"/></svg>';
  var ARROW = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M14 14 6 6m0 8V6h8"/></svg>';
  // header links (the brand itself is the way home = the skills library)
  var NAV = [['games.html', 'الألعاب'], ['p/', 'البرومبتات']];
  // footer: every section of the site
  var ALL = [['', 'مكتبة السكيلات'], ['p/', 'البرومبتات'], ['games.html', 'الألعاب'], ['learn/day-1/', 'رحلة التعلّم']];

  var CSS = [
    /* header: the library's top bar, everywhere */
    '.site-header{position:relative;z-index:45;display:flex;align-items:center;gap:12px;max-width:1360px;margin:0 auto;',
    'padding:calc(18px + env(safe-area-inset-top)) 22px 16px;color:var(--hdr-fg,var(--fg));font-family:"IBM Plex Sans Arabic",sans-serif;line-height:1.7;box-sizing:border-box;zoom:var(--fs,1)}',
    '.site-header *,.site-footer *{box-sizing:border-box}',
    /* reset whatever generic nav/a/ul rules a page has, so the chrome looks the same on every page */
    '.site-header nav,.site-footer nav{margin:0;padding:0;border:0;background:none;flex-wrap:nowrap}',
    '.site-header nav a,.site-footer nav a{border:0;border-radius:0;padding:0;background:none;font-weight:400;font-family:inherit}',
    '.site-header a,.site-footer a{color:inherit;text-decoration:none;-webkit-tap-highlight-color:transparent}',
    '.site-brand{display:flex;align-items:center;gap:9px;min-height:44px;flex-shrink:0}',
    '.site-header .site-mark{width:32px;height:32px;color:var(--hdr-accent,var(--gold-text))}',
    '.site-name{font:600 .88rem/1.2 "IBM Plex Sans Arabic",sans-serif;letter-spacing:-.025em}',
    '.site-header .site-actions{display:flex;align-items:center;gap:10px;margin-inline-start:auto}',
    '.site-link,.site-follow{display:flex;align-items:center;gap:7px;min-height:44px;font-size:.78rem;white-space:nowrap}',
    '.site-header .site-link{color:var(--hdr-mute,var(--mute))}',
    '.site-header .site-link:hover{color:var(--hdr-fg,var(--fg))}',
    '.site-header .site-link[aria-current]{color:var(--hdr-fg,var(--fg));text-decoration:underline;text-decoration-color:var(--hdr-accent,var(--gold-text));text-underline-offset:7px;text-decoration-thickness:2px}',
    '.site-header .site-follow{color:var(--hdr-accent,var(--gold-text))}',
    '.site-follow svg{width:15px;height:15px}',
    '.site-header .tm-btn{min-height:44px;height:auto;border-radius:3px;color:var(--hdr-fg,var(--fg));border-color:var(--hdr-edge,var(--edge));background:var(--hdr-btn,var(--glass))}',
    '.site-header .tm-nm{display:none}',
    '.site-header .tm-menu{color:var(--fg)}',
    '.site-header :focus-visible,.site-footer :focus-visible{outline:2px solid var(--focus,var(--gold-text));outline-offset:4px}',
    /* footer */
    '.site-footer{max-width:1240px;margin:0 auto;padding:45px 22px calc(25px + env(safe-area-inset-bottom));color:var(--fg);font-family:"IBM Plex Sans Arabic",sans-serif;line-height:1.7;zoom:var(--fs,1)}',
    '.site-invite{margin:0 0 28px;font:400 2.2rem/1.4 Lalezar,Alexandria,sans-serif}',
    '.site-footer .site-invite a{color:var(--gold-text);text-decoration:underline;text-underline-offset:8px}',
    '.site-footer .site-links{display:grid;grid-template-columns:1fr 1fr;gap:0 24px;padding-bottom:26px}',
    '.site-footer .site-links a{display:flex;align-items:center;justify-content:space-between;min-height:52px;border-bottom:1px solid var(--edge);font-size:.87rem}',
    '.site-footer .site-links a::after{content:"\\2196";color:var(--gold-text)}',
    '.site-footer .site-links a[aria-current]{color:var(--gold-text)}',
    '.site-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:4px 16px;padding-top:22px;border-top:1px solid var(--edge);font-size:.69rem;color:var(--mute)}',
    '.site-footer .site-bottom a{display:flex;align-items:center;gap:8px;min-height:44px;color:var(--fg)}',
    '.site-bottom .site-mark{width:22px;height:22px;color:var(--gold-text)}',
    '.site-more{display:flex;gap:16px}',
    '@media(hover:hover){.site-footer .site-links a:hover{color:var(--gold-text)}}',
    '@media(min-width:760px){.site-header{padding-inline:40px}.site-header .tm-nm{display:inline}',
    '.site-footer{padding:60px 40px 25px}.site-footer .site-links{grid-template-columns:repeat(4,1fr);gap:30px}.site-invite{font-size:3rem}}',
    '@media(max-width:360px){.site-header{padding-inline:16px;gap:6px}.site-name{font-size:.77rem}.site-header .site-actions{gap:6px}',
    '.site-link,.site-follow{font-size:.72rem}.site-header .site-mark{width:26px}}',
    /* full-screen games: one small chip, own colours (game pages do not load theme.css) */
    '.site-chip{position:fixed;z-index:2147483000;top:calc(10px + env(safe-area-inset-top));right:calc(10px + env(safe-area-inset-right));',
    'display:flex;align-items:center;gap:7px;min-height:40px;padding:0 12px 0 10px;border-radius:3px;border:1px solid #424a3d;',
    'background:rgba(12,16,12,.82);color:#f1f4ec;font:600 13px/1 "IBM Plex Sans Arabic",system-ui,sans-serif;text-decoration:none;',
    '-webkit-tap-highlight-color:transparent;transition:opacity .3s}',
    '.site-chip .site-mark{width:22px;height:22px;color:#d5ff63}',
    '.site-chip.off{opacity:0;pointer-events:none}',
    '.site-chip:focus-visible{outline:2px solid #d5ff63;outline-offset:3px}',
    '@media(prefers-reduced-motion:reduce){.site-chip{transition:none}}'
  ].join('');

  function cur(p) { return here === R + p || (p === '' && here === R + 's/'); }
  function ac(p) { return cur(p) ? ' aria-current="page"' : ''; }

  function header() {
    return '<header class="site-header">' +
      '<a class="site-brand" href="' + R + '" aria-label="أنس: الرئيسية، مكتبة السكيلات"' + ac('') + '>' + MARK +
      '<span class="site-name" dir="ltr">anas.ai.ar</span></a>' +
      '<nav class="site-actions" aria-label="أقسام الموقع">' +
      NAV.map(function (l) { return '<a class="site-link" href="' + R + l[0] + '"' + ac(l[0]) + '>' + l[1] + '</a>'; }).join('') +
      '<a class="site-follow" href="' + IG + '">تابعني' + ARROW + '</a>' +
      '<div class="tp" data-tp></div></nav></header>';
  }

  function footer() {
    return '<footer class="site-footer">' +
      '<p class="site-invite">تبي سكيل أو لعبة لشي معيّن؟<br><a href="' + IG + '">اكتب لي في إنستقرام</a></p>' +
      '<nav class="site-links" aria-label="كل أقسام الموقع">' +
      ALL.map(function (l) { return '<a href="' + R + l[0] + '"' + ac(l[0]) + '>' + l[1] + '</a>'; }).join('') +
      '</nav><div class="site-bottom">' +
      '<a href="' + IG + '" dir="ltr">' + MARK + 'anas.ai.ar</a>' +
      '<span class="site-more"><a href="https://www.youtube.com/@anas_ai_ar">يوتيوب</a><a href="https://anas-ai-ar.itch.io" dir="ltr">itch.io</a></span>' +
      '<span>مهارات جاهزة. شغل على كيفك.</span></div></footer>';
  }

  function chip(box) {
    box.outerHTML = '<a class="site-chip" href="' + R + 'games.html" aria-label="كل ألعاب أنس">' + MARK + '<span>كل الألعاب</span></a>';
    var c = d.querySelector('.site-chip'), t = 0;
    // playing = tapping, dragging or pressing keys: hide the chip; 4 s without input: show it again
    function play(e) {
      if (e.target && e.target.closest && e.target.closest('.site-chip')) return;
      if (e.type === 'pointermove' && !e.buttons && e.pointerType === 'mouse') return;
      c.classList.add('off');
      clearTimeout(t);
      t = setTimeout(function () { c.classList.remove('off'); }, 4000);
    }
    ['pointerdown', 'pointermove', 'keydown', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, play, { capture: true, passive: true });
    });
  }

  function fill(kind, html) {
    Array.prototype.forEach.call(d.querySelectorAll('[data-site="' + kind + '"]'), function (box) { box.outerHTML = html; });
  }

  if (!d.getElementById('site-chrome-css')) {
    var st = d.createElement('style');
    st.id = 'site-chrome-css';
    st.textContent = CSS;
    (d.head || d.documentElement).appendChild(st);
  }
  // the footer title uses the library's display font; add it on pages that do not load it yet
  if (d.querySelector('[data-site="header"],[data-site="footer"]') && !d.querySelector('link[href*="Lalezar"]')) {
    var f = d.createElement('link');
    f.rel = 'stylesheet';
    f.href = 'https://fonts.googleapis.com/css2?family=Lalezar&display=swap';
    d.head.appendChild(f);
  }
  fill('header', header());
  var g = d.querySelector('[data-site="game"]');
  if (g) chip(g);
  function late() { fill('header', header()); fill('footer', footer()); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', late); else late();
})();
