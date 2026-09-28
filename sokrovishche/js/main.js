/* ============================================================
   УНИВЕРСАЛЬНЫЙ СКРИПТ ДЛЯ БЛОКОВ
   Работает без зависимостей. Если JS отключён — сайт всё равно
   читается: скрытие блоков включается только при наличии .js
   ============================================================ */
(function () {
  'use strict';

  var CFG = window.SITE || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 1. Мобильное меню ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  if (burger && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 940) closeNav(); });
  }

  /* ---------- 2. Липкая шапка ---------- */
  var head = $('.site-head');
  var up = $('#up');
  var onScroll = function () {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (head) head.classList.toggle('is-stuck', y > 12);
    if (up) up.classList.toggle('is-on', y > 700);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (up) {
    up.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 3. Появление блоков при прокрутке ---------- */
  var items = $$('.reveal');
  if (items.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      items.forEach(function (el) { io.observe(el); });
    } else {
      items.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------- 4. Табы меню / услуг ---------- */
  var tabs = $$('.tab');
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var id = tab.getAttribute('data-tab');
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });
        $$('.menu-panel').forEach(function (p) {
          p.classList.toggle('is-active', p.getAttribute('data-panel') === id);
        });
      });
      tab.addEventListener('keydown', function (e) {
        var i = tabs.indexOf(tab), next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); next.click(); }
      });
    });
  }

  /* ---------- 5. Вопросы-ответы ---------- */
  $$('.faq__q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentNode;
      var open = item.classList.toggle('is-open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });

  /* ---------- 6. Маска телефона ---------- */
  $$('input[type="tel"]').forEach(function (input) {
    input.addEventListener('input', function () {
      var d = input.value.replace(/\D/g, '');
      if (d.charAt(0) === '8') d = '7' + d.slice(1);
      if (d.charAt(0) !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 5) out += ') ' + d.slice(4, 7);
      if (d.length >= 8) out += '-' + d.slice(7, 9);
      if (d.length >= 10) out += '-' + d.slice(9, 11);
      input.value = out;
    });
    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 (';
    });
    input.addEventListener('blur', function () {
      if (input.value.replace(/\D/g, '').length < 11) input.value = '';
    });
  });

  /* ---------- 7. Отправка формы ---------- */
  var form = $('#lead-form');
  if (form) {
    var note = $('#form-note');
    var baseNote = note ? note.textContent : '';

    var say = function (text, bad) {
      if (!note) return;
      note.textContent = text;
      note.style.color = bad ? '#c0392b' : '';
      note.style.fontWeight = bad ? '600' : '';
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = ($('#f-name') || {}).value || '';
      var phone = ($('#f-phone') || {}).value || '';
      var when = ($('#f-when') || {}).value || '';
      var service = ($('#f-service') || {}).value || '';
      var comment = ($('#f-comment') || {}).value || '';
      var consent = form.querySelector('input[name="consent"]');

      if (name.trim().length < 2) { say('Пожалуйста, напишите, как к вам обращаться.', true); return; }
      if (phone.replace(/\D/g, '').length < 11) { say('Проверьте номер телефона — не хватает цифр.', true); return; }
      if (consent && !consent.checked) { say('Нужно согласие на обработку данных.', true); return; }

      var lines = [
        'Здравствуйте! Заявка с сайта' + (CFG.name ? ' «' + CFG.name + '»' : '') + '.',
        'Имя: ' + name.trim(),
        'Телефон: ' + phone.trim()
      ];
      if (when) lines.push(CFG.whenLabel ? CFG.whenLabel + ': ' + when : 'Когда: ' + when);
      if (service) lines.push('Услуга: ' + service);
      if (comment.trim()) lines.push('Комментарий: ' + comment.trim());
      var text = lines.join('\n');

      say('Отправляем…');

      if (CFG.whatsapp) {
        window.open('https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
        say('Заявка открыта в WhatsApp — осталось нажать «Отправить».');
      } else if (CFG.email) {
        window.location.href = 'mailto:' + CFG.email +
          '?subject=' + encodeURIComponent('Заявка с сайта') +
          '&body=' + encodeURIComponent(text);
        say('Открываем почтовую программу…');
      } else {
        say('Форма пока не подключена к получателю. Позвоните нам: ' + (CFG.phone || ''), true);
        return;
      }
      form.reset();
      setTimeout(function () { say(baseNote); }, 6000);
    });
  }

  /* ---------- 8. Плавный переход по якорям с учётом шапки ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.getElementById(id.slice(1));
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.pageYOffset - 78;
      window.scrollTo({ top: top, behavior: 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
