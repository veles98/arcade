// Theme toggle: remembers the viewer's choice, otherwise follows the device setting
(function () {
  var root = document.documentElement, KEY = 'anas_theme';
  try { var saved = localStorage.getItem(KEY); if (saved) root.dataset.theme = saved; } catch (e) {}
  function current() {
    return root.dataset.theme || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.tt');
    if (!b) return;
    var next = current() === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem(KEY, next); } catch (e) {}
  });
})();
