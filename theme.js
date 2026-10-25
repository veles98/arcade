// Theme picker: five colour dots in a pill. The theme list and "apply before first paint" live in the inline <head>
// snippet (tools/theme_init.html, synced into every page by tools/bump_version.py); this file only builds the picker.
(function () {
  var L = window.ANAS_THEMES, set = window.ANAS_SET_THEME;
  if (!L || !set) return;
  var root = document.documentElement;

  function mount(box) {
    var dots = [], tip = document.createElement('span'), timer = 0;
    box.setAttribute('role', 'radiogroup');
    box.setAttribute('aria-label', 'المظهر');
    tip.className = 'tp-tip';
    tip.setAttribute('aria-hidden', 'true');
    L.forEach(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'dot';
      b.setAttribute('role', 'radio');
      b.setAttribute('aria-label', t[1]);
      b.dataset.t = t[0];
      b.style.setProperty('--sw', t[5]);
      b.addEventListener('click', function () { choose(i, true); });
      b.addEventListener('mouseenter', function () { show(i, 0); });
      b.addEventListener('focus', function () { show(i, 0); });
      b.addEventListener('mouseleave', hide);
      b.addEventListener('blur', hide);
      b.addEventListener('keydown', function (e) { key(e, i); });
      box.appendChild(b);
      dots.push(b);
    });
    box.appendChild(tip);

    function sync() {
      var cur = root.dataset.theme;
      dots.forEach(function (b) {
        var on = b.dataset.t === cur;
        b.setAttribute('aria-checked', on ? 'true' : 'false');
        b.tabIndex = on ? 0 : -1;
      });
    }
    function show(i, ms) {
      clearTimeout(timer);
      tip.textContent = L[i][1];
      tip.classList.add('on');
      var bx = box.getBoundingClientRect(), dx = dots[i].getBoundingClientRect(), w = tip.offsetWidth;
      var x = dx.left + dx.width / 2 - w / 2;
      x = Math.max(8, Math.min(x, window.innerWidth - w - 8));
      tip.style.left = (x - bx.left) + 'px';
      if (ms) timer = setTimeout(hide, ms);
    }
    function hide() { clearTimeout(timer); tip.classList.remove('on'); }
    function choose(i, focus) {
      set(L[i][0]);
      sync();
      show(i, 1500);
      if (focus) dots[i].focus({ preventScroll: true });
    }
    function key(e, i) {
      // arrows move to the visually adjacent dot (RTL aware); Home/End jump
      var rtl = getComputedStyle(box).direction === 'rtl', n = L.length, j = -1;
      if (e.key === 'ArrowLeft') j = i + (rtl ? 1 : -1);
      else if (e.key === 'ArrowRight') j = i + (rtl ? -1 : 1);
      else if (e.key === 'ArrowDown') j = i + 1;
      else if (e.key === 'ArrowUp') j = i - 1;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      else return;
      e.preventDefault();
      choose((j + n) % n, true);
    }
    sync();
    // another tab changed the theme
    window.addEventListener('storage', function (e) {
      if (e.key === 'anas_theme' && e.newValue) { window.ANAS_APPLY_THEME(e.newValue); sync(); }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-tp]'), mount);
})();
