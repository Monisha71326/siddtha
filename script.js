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
  if (lineFill && method) {
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

// contact form -> emailed to the academy inbox through Web3Forms
(() => {
  const ACCESS_KEY = '9f4764c9-cecd-4c62-920c-798b5c4b7b2a';
  const form = $('#contactForm'), ok = $('#ok'), err = $('#cErr'), btn = $('#cBtn');
  form.addEventListener('submit', e => {
    e.preventDefault();
    ok.classList.remove('show'); err.classList.remove('show');
    if ($('#cHp').value) { ok.classList.add('show'); return; }
    const name = $('#cName').value.trim(), email = $('#cEmail').value.trim(),
          phone = $('#cPhone').value.trim(), msg = $('#cMsg').value.trim();
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || !msg) {
      err.textContent = 'Please enter your name, a valid email and your message.';
      err.classList.add('show'); return;
    }
    btn.disabled = true; btn.textContent = 'Sending...';
    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: ACCESS_KEY, subject: 'New website enquiry - ' + name,
        from_name: 'K-Med Academy Website', name, email, phone: phone || 'Not given', message: msg
      })
    })
      .then(r => r.json())
      .then(j => {
        if (!j.success) throw new Error();
        ok.classList.add('show'); form.reset();
        setTimeout(() => ok.classList.remove('show'), 5000);
      })
      .catch(() => {
        err.textContent = 'Sorry, message could not be sent. Please call +91 99624 95128.';
        err.classList.add('show');
      })
      .finally(() => { btn.disabled = false; btn.textContent = 'Send Message'; });
  });
})();

// mouse spotlight on "For Whom" cards
$$('.et-card').forEach(c => {
  c.addEventListener('mousemove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// careers accordion
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