/* 山田工務店 — フロントスクリプト（依存なし） */
(function () {
  'use strict';

  /* ---------- モバイルナビの開閉 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('global-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // リンクを踏んだら閉じる
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
    // Escで閉じる
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- スクロールで要素をフェードイン ---------- */
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- お知らせ（data/news.json を描画） ---------- */
  var newsBox = document.querySelector('[data-news]');
  if (newsBox) {
    var limit = parseInt(newsBox.getAttribute('data-news-limit') || '0', 10);
    fetch('data/news.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('load failed'); return r.json(); })
      .then(function (items) {
        if (!Array.isArray(items) || items.length === 0) {
          newsBox.innerHTML = '<p class="news-empty">現在お知らせはありません。</p>';
          return;
        }
        items.sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); });
        if (limit > 0) items = items.slice(0, limit);
        var ul = document.createElement('ul');
        ul.className = 'news-list';
        items.forEach(function (it) {
          var li = document.createElement('li');
          li.className = 'news-item';
          var meta = document.createElement('div');
          meta.className = 'news-item__meta';
          var date = document.createElement('span');
          date.className = 'news-item__date';
          date.textContent = formatDate(it.date);
          meta.appendChild(date);
          if (it.category) {
            var cat = document.createElement('span');
            cat.className = 'news-item__cat';
            cat.textContent = it.category;
            meta.appendChild(cat);
          }
          var body = document.createElement('div');
          var title = document.createElement('p');
          title.className = 'news-item__title';
          title.textContent = it.title || '';
          body.appendChild(title);
          if (it.body) {
            var p = document.createElement('p');
            p.className = 'news-item__body';
            p.textContent = it.body;
            body.appendChild(p);
          }
          li.appendChild(meta);
          li.appendChild(body);
          ul.appendChild(li);
        });
        newsBox.innerHTML = '';
        newsBox.appendChild(ul);
      })
      .catch(function () {
        newsBox.innerHTML = '<p class="news-empty">お知らせを読み込めませんでした。</p>';
      });
  }

  function formatDate(s) {
    if (!s) return '';
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    return m ? m[1] + '.' + m[2] + '.' + m[3] : s;
  }

  /* ---------- お問い合わせフォームの検証・送信 ---------- */
  var form = document.getElementById('contact-form');
  if (form) {
    var status = document.getElementById('form-status');

    var rules = [
      { id: 'type', test: function (v) { return v !== ''; } },
      { id: 'name', test: function (v) { return v.trim() !== ''; } },
      { id: 'tel', test: function (v) { return v.trim() !== ''; } },
      { id: 'email', test: function (v) { return v === '' || /.+@.+\..+/.test(v); } },
      { id: 'message', test: function (v) { return v.trim() !== ''; } },
      { id: 'consent', test: function (v, el) { return el.checked; } }
    ];

    function validateField(rule) {
      var el = document.getElementById(rule.id);
      var err = document.getElementById(rule.id + '-err');
      var ok = rule.test(el.value, el);
      if (err) err.hidden = ok;
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return ok;
    }

    // 入力し直したらエラーを消す
    rules.forEach(function (rule) {
      var el = document.getElementById(rule.id);
      var ev = el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(ev, function () {
        if (el.getAttribute('aria-invalid') === 'true') validateField(rule);
      });
    });

    form.addEventListener('submit', function (e) {
      var firstInvalid = null;
      rules.forEach(function (rule) {
        var ok = validateField(rule);
        if (!ok && !firstInvalid) firstInvalid = document.getElementById(rule.id);
      });

      if (firstInvalid) {
        e.preventDefault();
        if (status) { status.hidden = true; }
        firstInvalid.focus();
        return;
      }

      // 送信先が未設定（デモ）のときは実送信せず案内する
      if (form.action.indexOf('REPLACE_WITH_ENDPOINT') !== -1) {
        e.preventDefault();
        showStatus('（デモ）入力チェックは通りました。公開前にフォーム送信先を設定すると、実際に送信できます。', 'ok');
        return;
      }

      // 送信先が設定済みなら fetch 送信し、完了ページへ
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.disabled = true; }
      showStatus('送信しています…', 'ok');
      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (r) {
          if (r.ok) { window.location.href = 'thanks.html'; return; }
          throw new Error('send failed');
        })
        .catch(function () {
          if (btn) { btn.disabled = false; }
          showStatus('送信できませんでした。時間をおいて、もう一度お試しください。お急ぎの場合はお電話ください。', 'err');
        });
    });

    function showStatus(msg, type) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'form__status form__status--' + (type === 'err' ? 'err' : 'ok');
      status.hidden = false;
    }
  }
})();
