(function () {
  var header = document.querySelector('.masthead, .topbar, .tabs');
  if (!header) return;

  header.classList.add('autohide-header');

  var lastY = window.pageYOffset || document.documentElement.scrollTop;
  var atTopThreshold = 8;
  var deltaThreshold = 4;
  var ticking = false;

  function update() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (y <= atTopThreshold) {
      header.classList.remove('autohide-header--hidden');
    } else if (y < lastY - deltaThreshold) {
      header.classList.remove('autohide-header--hidden');
    } else if (y > lastY + deltaThreshold) {
      header.classList.add('autohide-header--hidden');
    }

    lastY = y < 0 ? 0 : y;
    ticking = false;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
})();
