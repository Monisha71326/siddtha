const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

// preloader
window.addEventListener('load', () => setTimeout(() => $('#loader').classList.add('hide'), 1500));

// scroll: progress bar, nav shadow, active link, back-to-top, exam line
const nav = $('#nav'), toTop = $('#toTop'), prog = $('#progress');
const links = $$('.menu a[href^="#"]');
const secs = links.map(a => $(a.getAttribute('href')));
const lineFill = $('#lineFill'), method = $('.method');
function onScroll() {
  const h = document.documentElement;
  prog.style.width = (scrollY / (h.scrollHeight - innerHeight) * 100) + '%';
  nav.classList.toggle('scrolled', scrollY > 40);
  toTop.classList.toggle('show', scrollY > 600);
  let cur = 0; secs.forEach((s, i) => { if (s && scrollY + 220 >= s.offsetTop) cur = i; });
  links.forEach((a, i) => a.classList.toggle('active', i === cur));
  if (lineFill) {
    const r = method.getBoundingClientRect();
    lineFill.style.width = Math.max(0, Math.min(100, ((innerHeight * .8 - r.top) / (r.height * .8)) * 100)) + '%';
  }
}
addEventListener('scroll', onScroll); onScroll();
toTop.onclick = () => scrollTo({ top: 0, behavior: 'smooth' });

// mobile menu
const burger = $('#burger'), menu = $('#menu');
burger.onclick = () => { burger.classList.toggle('open'); menu.classList.toggle('open'); };
$$('#menu a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); menu.classList.remove('open'); }));

// scroll reveal
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), { threshold: .12 });
$$('.reveal,.reveal-left,.reveal-right').forEach(el => io.observe(el));

// counters
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target, target = +el.dataset.count, start = performance.now() + 1700, dur = 1800;
  (function tick(t) {
    const p = Math.max(0, Math.min((t - start) / dur, 1));
    el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))).toLocaleString();
    if (p < 1) requestAnimationFrame(tick);
  })(performance.now());
  cio.unobserve(el);
}), { threshold: .4 });
$$('[data-count]').forEach(el => cio.observe(el));

// 3D tilt on cards
$$('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.transform = `perspective(900px) rotateX(${((y / r.height) - .5) * -8}deg) rotateY(${((x / r.width) - .5) * 8}deg) translateY(-8px)`;
  });
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// FAQ accordion
$$('#acc .q').forEach(q => {
  const a = $('.a', q);
  if (q.classList.contains('open')) a.style.maxHeight = a.scrollHeight + 'px';
  $('button', q).onclick = () => {
    const open = q.classList.contains('open');
    $$('#acc .q').forEach(o => { o.classList.remove('open'); $('.a', o).style.maxHeight = 0; });
    if (!open) { q.classList.add('open'); a.style.maxHeight = a.scrollHeight + 'px'; }
  };
});

// contact form
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault(); $('#ok').classList.add('show'); e.target.reset();
  setTimeout(() => $('#ok').classList.remove('show'), 4000);
});

// poster lightbox
const lb = $('#lightbox');
if (lb) {
  $$('.poster').forEach(b => b.addEventListener('click', () => { $('img', lb).src = b.dataset.src; lb.classList.add('show'); }));
  lb.addEventListener('click', () => lb.classList.remove('show'));
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('show'); });
}



// ===== Course showcase: course list + one animated stage (adds to the end of script.js) =====
(() => {
  const grid = $('.c-grid');
  if (!grid) return;
  const cards = $$('.c-card', grid);
  if (!cards.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'sc';
  const tabs = document.createElement('div');
  tabs.className = 'sc-tabs';
  tabs.setAttribute('role', 'tablist');
  grid.before(wrap);
  wrap.append(tabs, grid);

  const pad = n => String(n).padStart(2, '0');
  const el = (tag, cls, text) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  };

  let cur = 0, timer = null, userStopped = false;

  cards.forEach((card, i) => {
    // cards are shown one at a time, so drop scroll-reveal and tilt
    card.classList.remove('reveal', 'tilt');
    io.unobserve(card);
    card.dataset.n = pad(i + 1);
    const spine = $('.spine', card);
    spine.dataset.n = pad(i + 1);

    // no poster in the cards
    const poster = $('.poster', card);
    if (poster) poster.remove();

    // ---- art panel ----
    const art = el('div', 'sc-art');
    art.dataset.n = pad(i + 1);
    ['r1', 'r2', 'r3'].forEach(r => art.append(el('span', 'ring ' + r)));
    const sym = el('div', 'sc-sym');
    const svg = $('svg', spine);
    if (svg) {
      sym.append(svg.cloneNode(true));
    } else {
      const label = ($('small', spine) || {}).textContent || '';
      sym.classList.add('letter');
      sym.textContent = label.replace(/course/i, '').trim().charAt(0) || pad(i + 1);
    }
    art.append(sym, el('div', 'sc-count', pad(i + 1) + ' / ' + pad(cards.length)), el('div', 'sc-brand', 'K-MED ACADEMY'));
    card.append(art);

    // mouse spotlight + parallax on the art panel
    art.addEventListener('mousemove', e => {
      const r = art.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      art.style.setProperty('--mx', (x * 100) + '%');
      art.style.setProperty('--my', (y * 100) + '%');
      art.style.setProperty('--px', ((x - .5) * 36) + 'px');
      art.style.setProperty('--py', ((y - .5) * 36) + 'px');
    });
    art.addEventListener('mouseleave', () => {
      ['--mx', '--my', '--px', '--py'].forEach(p => art.style.removeProperty(p));
    });

    // ---- tab ----
    const color = ['green', 'blue', 'gold', 'maroon'].find(c => spine.classList.contains(c)) || 'gold';
    const tab = el('button', 'sc-tab ' + color);
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    const arrow = el('i');
    arrow.innerHTML = '&rarr;';
    tab.append(el('span', 'n', pad(i + 1)), el('span', 't', $('h3', spine).textContent), arrow);
    tab.addEventListener('click', () => { userStopped = true; pause(); show(i); });
    tab.addEventListener('keydown', e => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const n = (i + (e.key === 'ArrowDown' ? 1 : cards.length - 1)) % cards.length;
      userStopped = true; pause(); show(n); tabEls[n].focus();
    });
    tabs.append(tab);
  });

  const tabEls = $$('.sc-tab', tabs);

  function show(i) {
    cur = i;
    cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
    tabEls.forEach((t, k) => {
      t.classList.toggle('active', k === i);
      t.setAttribute('aria-selected', k === i ? 'true' : 'false');
    });
  }
  function play() {
    if (userStopped || timer || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    wrap.classList.add('playing');
    timer = setInterval(() => show((cur + 1) % cards.length), 6000);
  }
  function pause() {
    clearInterval(timer);
    timer = null;
    wrap.classList.remove('playing');
  }

  wrap.addEventListener('mouseenter', pause);
  wrap.addEventListener('mouseleave', play);
  show(0);
  play();
})();
// ADD at the END of script.js : mouse spotlight on exam cards
$$('.et-card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});
// ADD at the END of script.js
(() => {
  const cps = $$('.cp');
  if (!cps.length) return;
  const act = i => cps.forEach((c, k) => c.classList.toggle('active', k === i));
  cps.forEach((c, i) => {
    c.addEventListener('mouseenter', () => { if (matchMedia('(min-width:901px)').matches) act(i); });
    c.addEventListener('click', () => act(i));
    c.addEventListener('focus', () => act(i));
  });
})();
// ADD at the END of script.js : mouse spotlight on exam cards
$$('.et-card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});
// ADD at the END of script.js
(() => {
  const cps = $$('.cp');
  if (!cps.length) return;
  const act = i => cps.forEach((c, k) => c.classList.toggle('active', k === i));
  cps.forEach((c, i) => {
    c.addEventListener('mouseenter', () => { if (matchMedia('(min-width:901px)').matches) act(i); });
    c.addEventListener('click', () => act(i));
    c.addEventListener('focus', () => act(i));
  });
})();
// ADD at the END of script.js : mouse spotlight on exam cards
$$('.et-card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});
// ADD at the END of script.js
(() => {
  const cps = $$('.cp');
  if (!cps.length) return;
  const act = i => cps.forEach((c, k) => c.classList.toggle('active', k === i));
  cps.forEach((c, i) => {
    c.addEventListener('mouseenter', () => { if (matchMedia('(min-width:901px)').matches) act(i); });
    c.addEventListener('click', () => act(i));
    c.addEventListener('focus', () => act(i));
  });
})();