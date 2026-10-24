// Theme toggle: dark by default, light only when the viewer picks it (remembered)
(function () {
  var root = document.documentElement, KEY = 'anas_theme';
  try { var saved = localStorage.getItem(KEY); if (saved) root.dataset.theme = saved; } catch (e) {}
  function current() {
    return root.dataset.theme || 'dark';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.tt');
    if (!b) return;
    var next = current() === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });
})();
