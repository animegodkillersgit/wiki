// Вики RE_Aevo: меню, появление блоков и фильтры списка петов.
(function () {
  var menuButton = document.getElementById('menu-button');
  var nav = document.getElementById('mainnav');
  var groups = Array.prototype.slice.call(nav.querySelectorAll('.nav-group'));

  function setMenu(open) {
    nav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  }

  function setGroup(group, open) {
    group.classList.toggle('open', open);
    group.querySelector('.nav-top').setAttribute('aria-expanded', String(open));
  }

  menuButton.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });
  groups.forEach(function (group) {
    group.querySelector('.nav-top').addEventListener('click', function () {
      var open = !group.classList.contains('open');
      groups.forEach(function (other) { setGroup(other, false); });
      setGroup(group, open);
    });
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      setMenu(false);
      groups.forEach(function (group) { setGroup(group, false); });
    }
  });

  // Блоки плавно появляются при прокрутке; без поддержки браузера просто видны сразу.
  var motionOff = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!motionOff) {
    var waiting = Array.prototype.filter.call(
      document.querySelectorAll('.bar-title, .table-wrap, .block, .token-world, .well, .home-band, .home-map, .tier-bar, .note'),
      function (block) { return block.getBoundingClientRect().top > window.innerHeight; });
    var revealVisible = function () {
      waiting = waiting.filter(function (block) {
        if (block.getBoundingClientRect().top > window.innerHeight * 0.95) return true;
        block.classList.add('shown');
        return false;
      });
      if (!waiting.length) window.removeEventListener('scroll', revealVisible);
    };
    waiting.forEach(function (block) { block.classList.add('reveal'); });
    window.addEventListener('scroll', revealVisible, { passive: true });
    window.addEventListener('resize', revealVisible);
  }

  // Вкладки новостей: показываем записи выбранного типа.
  var newsTabs = document.querySelectorAll('.news-tabs button');
  newsTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var shown = 0;
      newsTabs.forEach(function (other) { other.setAttribute('aria-pressed', String(other === tab)); });
      document.querySelectorAll('.news-grid .showcase').forEach(function (card) {
        card.hidden = card.dataset.kind !== tab.dataset.kind;
        if (!card.hidden) shown += 1;
      });
      document.querySelector('.news-empty').hidden = shown !== 0;
    });
  });

  // Фильтры списка: нажатая кнопка отбирает карточки, повторное нажатие снимает отбор.
  var bar = document.querySelector('.filter-bar');
  if (!bar) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid] .portrait'));
  var empty = document.querySelector('.filter-empty');
  var chosen = { tier: '', egg: '' };
  var nameInput = bar.querySelector('input');

  function apply() {
    var q = nameInput.value.trim().toLowerCase();
    var shown = 0;
    cards.forEach(function (card) {
      var match = (!chosen.tier || card.dataset.tier === chosen.tier) &&
        (!chosen.egg || card.dataset.egg === chosen.egg) &&
        (!q || card.textContent.toLowerCase().indexOf(q) !== -1);
      card.hidden = !match;
      if (match) shown += 1;
    });
    empty.hidden = shown !== 0;
  }

  bar.querySelectorAll('button').forEach(function (button) {
    button.addEventListener('click', function () {
      var key = button.dataset.key;
      chosen[key] = chosen[key] === button.dataset.value ? '' : button.dataset.value;
      bar.querySelectorAll('[data-key="' + key + '"]').forEach(function (other) {
        other.setAttribute('aria-pressed', String(other.dataset.value === chosen[key]));
      });
      apply();
    });
  });
  nameInput.addEventListener('input', apply);
})();
