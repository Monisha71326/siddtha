/* about.js - K-MED About section
   Load LAST:  <script src="about.js"></script>  (after courses.js)
   - enter-view animations
   - concept web: lights each subject in turn (hover/focus to take over)
   - philosophy staircase: steps through Understand > Remember > Apply > Score
   - founder portrait: lotus placeholder (until images/founder.jpg is added) + cursor tilt
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

  /* ---------- founder portrait : Siddha placeholder (lotus + fireflies + pulse waves, no text) ---------- */
  (function founderFx() {
    var frame = $('.kab-frame');
    if (!frame || frame.querySelector('.fx')) return;

    var css = '' +
    '.fx{position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;background:radial-gradient(circle at 50% 38%,rgba(244,207,122,.22),transparent 55%)}' +
    '.kab-ini{display:none!important}' +
    '.fx-star{position:absolute;width:var(--s);height:var(--s);border-radius:50%;background:#fff;opacity:.2;animation:fxTw var(--t) ease-in-out infinite;animation-delay:var(--d)}' +
    '@keyframes fxTw{50%{opacity:1;box-shadow:0 0 8px 2px rgba(255,255,255,.8)}}' +
    '.fx-halo{position:absolute;left:50%;top:44%;width:84%;aspect-ratio:1;translate:-50% -50%;animation:fxSpin 40s linear infinite}' +
    '.fx-halo circle{fill:none;stroke:#f4cf7a}' +
    '@keyframes fxSpin{to{rotate:360deg}}' +
    '.fx-lotus{position:absolute;left:50%;top:44%;width:70%;aspect-ratio:1;translate:-50% -50%;overflow:visible;animation:fxFloat 6s ease-in-out infinite;filter:drop-shadow(0 8px 22px rgba(244,207,122,.55))}' +
    '@keyframes fxFloat{50%{translate:-50% calc(-50% - 8px)}}' +
    '.pt{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(0deg) scale(.15);opacity:.4;animation:fxBloom 7s cubic-bezier(.4,0,.2,1) infinite alternate;animation-delay:var(--dl)}' +
    '.pt.o{fill:rgba(244,207,122,.16);stroke:#f4cf7a;stroke-width:1.4}' +
    '.pt.m{fill:rgba(255,255,255,.16);stroke:#fff;stroke-width:1.3}' +
    '.pt.i{fill:rgba(244,207,122,.6);stroke:#fff3c4;stroke-width:1}' +
    '@keyframes fxBloom{0%,8%{transform:rotate(0deg) scale(.15);opacity:.4}75%,100%{transform:rotate(var(--a)) scale(var(--sc));opacity:1}}' +
    '.fx-orb{fill:#fff;animation:fxOrb 2.4s ease-in-out infinite;transform-box:fill-box;transform-origin:center}' +
    '@keyframes fxOrb{50%{transform:scale(1.7);opacity:.6}}' +
    '.fx-rip{fill:none;stroke:#f4cf7a;stroke-width:1;transform-box:fill-box;transform-origin:center;animation:fxRip 4s ease-out infinite;opacity:0}' +
    '@keyframes fxRip{0%{transform:scale(.4);opacity:.9}100%{transform:scale(1.35);opacity:0}}' +
    '.fx-ff{position:absolute;bottom:30%;width:var(--s);height:var(--s);border-radius:50%;background:#fff3c4;box-shadow:0 0 10px 3px rgba(244,207,122,.85);opacity:0;animation:fxFf var(--t) ease-in infinite;animation-delay:var(--d)}' +
    '@keyframes fxFf{0%{translate:0 0;opacity:0}20%{opacity:1}100%{translate:var(--x) -280px;opacity:0}}' +
    '.fx-wv{position:absolute;left:0;bottom:0;width:100%;height:27%;overflow:hidden;' +
      '-webkit-mask-image:linear-gradient(180deg,transparent,#000 35%);mask-image:linear-gradient(180deg,transparent,#000 35%)}' +
    '.fx-wv svg{position:absolute;left:0;bottom:0;width:200%;height:100%;animation:fxSlide var(--sp) linear infinite}' +
    '.fx-wv path{fill:none;stroke-width:2.4;stroke-linecap:round}' +
    '@keyframes fxSlide{to{transform:translateX(-50%)}}' +
    '@media(prefers-reduced-motion:reduce){.fx *{animation:none!important}.pt{transform:rotate(var(--a)) scale(var(--sc))!important;opacity:1!important}}';

    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);

    /* sine wave path, 4 cycles over 400 units -> shifting by 50% loops seamlessly */
    function wave(amp, mid, period, phase) {
      var d = '';
      for (var x = 0; x <= 400; x += 5) {
        var y = mid + amp * Math.sin((x / period) * 2 * Math.PI + phase);
        d += (x ? 'L' : 'M') + x + ' ' + y.toFixed(1);
      }
      return d;
    }
    function waveSvg(color, amp, mid, period, phase, sp) {
      return '<svg viewBox="0 0 400 60" preserveAspectRatio="none" style="--sp:' + sp + 's"><path d="' + wave(amp, mid, period, phase) + '" stroke="' + color + '"/></svg>';
    }

    var h = '';
    for (var i = 0; i < 22; i++) {
      h += '<i class="fx-star" style="left:' + (4 + Math.random() * 92).toFixed(0) + '%;top:' + (3 + Math.random() * 62).toFixed(0) + '%;--s:' + (1.5 + Math.random() * 2.5).toFixed(1) + 'px;--t:' + (2 + Math.random() * 3).toFixed(1) + 's;--d:-' + (Math.random() * 5).toFixed(1) + 's"></i>';
    }

    h += '<svg class="fx-halo" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" stroke-width=".5" stroke-dasharray="1 2.2"/><circle cx="50" cy="50" r="44" stroke-width=".35" stroke-dasharray="6 4" opacity=".7"/></svg>';

    var petal = 'M0 0C-18 -18 -18 -48 0 -72C18 -48 18 -18 0 0Z';
    function layer(cls, angles, sc, dl0) {
      return angles.map(function (a, k) {
        return '<path class="pt ' + cls + '" d="' + petal + '" style="--a:' + a + 'deg;--sc:' + sc + ';--dl:' + (dl0 + k * .12).toFixed(2) + 's"/>';
      }).join('');
    }
    h += '<svg class="fx-lotus" viewBox="0 0 200 200"><g transform="translate(100 150)">' +
         '<ellipse class="fx-rip" cx="0" cy="6" rx="62" ry="7"/><ellipse class="fx-rip" cx="0" cy="6" rx="62" ry="7" style="animation-delay:2s"/>' +
         layer('o', [-75, -50, -25, 0, 25, 50, 75], 1, 0) +
         layer('m', [-50, -25, 0, 25, 50], .8, .5) +
         layer('i', [-25, 0, 25], .56, 1) +
         '<circle class="fx-orb" cx="0" cy="-26" r="4"/></g></svg>';

    for (var f = 0; f < 18; f++) {
      h += '<i class="fx-ff" style="left:' + (28 + Math.random() * 44).toFixed(0) + '%;--s:' + (3 + Math.random() * 4).toFixed(1) + 'px;--t:' + (4 + Math.random() * 4).toFixed(1) + 's;--d:-' + (Math.random() * 8).toFixed(1) + 's;--x:' + ((Math.random() * 90 - 45) | 0) + 'px"></i>';
    }

    h += '<div class="fx-wv">' +
         waveSvg('#7fa6ff', 9, 22, 100, 0, 7) +
         waveSvg('#f4cf7a', 12, 34, 100, 2, 9) +
         waveSvg('#5fd0a8', 7, 44, 100, 4, 11) + '</div>';

    var box = document.createElement('div');
    box.className = 'fx';
    box.setAttribute('aria-hidden', 'true');
    box.innerHTML = h;
    frame.insertBefore(box, frame.firstChild);
  })();

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