/* about.js - K-MED About section
   Load LAST:  <script src="about.js"></script>  (after courses.js)
   - enter-view animations
   - concept web: lights each subject in turn (hover/focus to take over)
   - philosophy staircase: steps through Understand > Remember > Apply > Score
   - founder's note: words darken as you read down */
(function () {
  var root = document.getElementById('about');
  if (!root || !root.classList.contains('kab')) return;
  root.classList.add('kab-js');

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch  = window.matchMedia('(hover: none)').matches;
  var $  = function (s, c) { return (c || root).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || root).querySelectorAll(s)); };
  var hasIO = 'IntersectionObserver' in window;

  /* ---------- 1. enter-view : adds .go once ---------- */
  var goEls = $$('[data-go]');
  if (hasIO) {
    var goIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('go'); goIO.unobserve(e.target); }
      });
    }, { threshold: .18, rootMargin: '0px 0px -6% 0px' });
    goEls.forEach(function (el) { goIO.observe(el); });
  } else {
    goEls.forEach(function (el) { el.classList.add('go'); });
  }

  /* ---------- helper : cycle through items while visible ---------- */
  function cycler(box, items, onLight, ms, startAt) {
    var cur = startAt || 0, timer = null, paused = false, visible = false;
    function light(k) {
      cur = k;
      items.forEach(function (it, j) { it.classList.toggle('on', j === k); });
      onLight && onLight(k);
    }
    function run() {
      clearInterval(timer);
      if (reduce || paused || !visible) return;
      timer = setInterval(function () { light((cur + 1) % items.length); }, ms);
    }
    items.forEach(function (it, k) {
      it.addEventListener('mouseenter', function () { paused = true; light(k); run(); });
      it.addEventListener('focus',      function () { paused = true; light(k); run(); });
      it.addEventListener('click',      function () { paused = true; light(k); run(); });
    });
    box.addEventListener('mouseleave', function () { paused = false; run(); });
    box.addEventListener('focusout',   function () { paused = false; run(); });
    if (hasIO) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; run(); }, { threshold: .35 }).observe(box);
    } else { visible = true; run(); }
    light(cur);
  }

  /* ---------- 2. concept web ---------- */
  var web = document.getElementById('kabWeb');
  if (web) {
    var wNodes = $$('.kab-node', web), wLines = $$('.kab-lines line', web);
    cycler(web, wNodes, function (k) {
      wLines.forEach(function (l, j) { l.classList.toggle('on', j === k); });
    }, 2300, 0);
  }

  /* ---------- 3. philosophy staircase ---------- */
  var phil = document.getElementById('kabPhil');
  if (phil) {
    var steps = $$('.kab-st', phil), bar = $('.kab-rail span', phil);
    cycler(phil, steps, function (k) {
      if (bar) bar.style.width = ((k + 1) / steps.length * 100) + '%';
    }, 3000, 0);
  }

  /* ---------- hero glow follows the cursor ---------- */
  var heroEl = document.getElementById('kabHero');
  if (heroEl && !reduce && !touch) {
    heroEl.addEventListener('pointermove', function (e) {
      var r = heroEl.getBoundingClientRect();
      heroEl.style.setProperty('--gx', (e.clientX - r.left) + 'px');
      heroEl.style.setProperty('--gy', (e.clientY - r.top) + 'px');
    });
  }

  /* ---------- core values : each card shrinks + dims as the next one slides over it ---------- */
  var vcs = $$('.kab-vc');
  if (vcs.length && !reduce) {
    var vTick = false;
    var vPaint = function () {
      vTick = false;
      vcs.forEach(function (c, i) {
        var n = vcs[i + 1];
        if (!n) { c.style.transform = ''; c.style.filter = ''; return; }
        var cr = c.getBoundingClientRect(), nr = n.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (cr.bottom - nr.top) / cr.height));
        c.style.transform = 'scale(' + (1 - p * .07).toFixed(4) + ')';
        c.style.filter = 'brightness(' + (1 - p * .38).toFixed(3) + ')';
      });
    };
    window.addEventListener('scroll', function () { if (!vTick) { vTick = true; requestAnimationFrame(vPaint); } }, { passive: true });
    window.addEventListener('resize', vPaint);
    vPaint();
  }

  /* ---------- founder portrait tilts with the cursor ---------- */
  var photo = $('.kab-photo');
  if (photo && !reduce && !touch) {
    photo.addEventListener('pointermove', function (e) {
      var r = photo.getBoundingClientRect();
      photo.style.setProperty('--ry', (((e.clientX - r.left) / r.width - .5) * 10).toFixed(2) + 'deg');
      photo.style.setProperty('--rx', (-((e.clientY - r.top) / r.height - .5) * 8).toFixed(2) + 'deg');
    });
    photo.addEventListener('pointerleave', function () {
      photo.style.setProperty('--ry', '0deg'); photo.style.setProperty('--rx', '0deg');
    });
  }

  /* ---------- 5. founder's note : read-along word highlight ---------- */
  var quote = document.getElementById('kabQuote'), note = document.getElementById('kabNote');
  if (quote && note) {
    var words = quote.textContent.trim().split(/\s+/);
    quote.setAttribute('aria-label', words.join(' '));
    quote.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
    var spans = $$('.w', quote);
    if (reduce) {
      spans.forEach(function (s) { s.classList.add('on'); });
    } else {
      var ticking = false;
      var paint = function () {
        ticking = false;
        var r = note.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * .88 - r.top) / (r.height * .8 + vh * .12);
        p = Math.max(0, Math.min(1, p));
        var n = Math.round(p * spans.length);
        spans.forEach(function (s, i) { s.classList.toggle('on', i < n); });
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; requestAnimationFrame(paint); }
      }, { passive: true });
      window.addEventListener('resize', paint);
      paint();
    }
  }
})();