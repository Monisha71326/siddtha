// ===== K-Med Academy : LMS API integration =====
(() => {
  'use strict';

  // ---------- CONFIG (maathanum na inga mattum maathunga) ----------
  const LMS   = 'https://lms.sleekspaceinterior.in';
  const API   = LMS + '/api/collections';
  const LOGIN = LMS + '/login';

  // Course card click panna enga pogum nu ONE line-la inga set pannunga.
  // {slug} = course slug, {id} = course id. LMS-la oru course open panni
  // address bar URL paathu, athula slug/id irukkura idathula {slug} / {id} nu maathi podunga.
  //   Example 1:  LMS + '/courses/{slug}'
  //   Example 2:  LMS + '/course/{id}'
  //   Example 3:  LMS + '/course/details/{slug}'
  const COURSE_URL = LMS + '/courses/{slug}';
  const BLOG_PAGE  = LMS;   // blog URL theriyum na inga podunga

  const fill = (tpl, o) => tpl.replace('{slug}', encodeURIComponent(o.slug || '')).replace('{id}', encodeURIComponent(o.id ?? ''));
  const courseLink = c => ((c.slug || c.id != null) ? fill(COURSE_URL, c) : LOGIN);
  const blogLink   = () => BLOG_PAGE;

  // ---------- TESTIMONIALS (6 cards, Tamil names + photos) ----------
  // true  -> inga ezhudhina 6 testimonials kaattum (LMS API demo data use aagaadhu)
  // false -> LMS API testimonials kaattum
  const USE_LOCAL_TESTIMONIALS = true;
  // Photos: images/testimonials/ folder-la t1.jpg ... t6.jpg podunga.
  // Photo illa na peyar-oda mudhal ezhuthu circle-la theriyum.
  // GAVANIKKA: ithu sample text. Unga real students-oda peyar, photo, avanga sonna
  // vaarthaigalai (avangaloda anumathiyoda) maathi podunga.
  const LOCAL_TESTIMONIALS = [
    { name: 'Karthik Raja',   image: 'images/testimonials/t1.jpg', rating: 5, description: 'The concepts are explained very clearly. The revision notes and mock tests were extremely useful for my exam preparation.' },
    { name: 'Priya Sundaram',    image: 'images/testimonials/t2.jpg', rating: 5, description: 'Siddha subjects are linked with modern medical sciences, which makes everything much easier to understand.' },
    { name: 'Aravind Kumar',    image: 'images/testimonials/t3.jpg', rating: 5, description: 'The weekly tests show exactly where I am weak. My preparation has improved a lot because of them.' },
    { name: 'Divya Lakshmi',     image: 'images/testimonials/t4.jpg', rating: 4, description: 'The recorded classes let me study at my own pace, and the doubt support is very helpful.' },
    { name: 'Suresh Balaji',     image: 'images/testimonials/t5.jpg', rating: 5, description: 'The teaching is exam-focused and the high-yield points are well organised. My confidence has grown a lot.' },
    { name: 'Meena Krishnan',    image: 'images/testimonials/t6.jpg', rating: 5, description: 'The Research Methodology MCQ practice is very helpful. I could understand biostatistics easily.' }
  ];

  // ---------- helpers ----------
  const q = (s, c = document) => c.querySelector(s);
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ESC[m]);
  const plain = h => new DOMParser().parseFromString(String(h ?? ''), 'text/html').body.textContent.replace(/\s+/g, ' ').trim();
  const clip = (s, n) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);
  const abs = u => (!u ? '' : /^https?:\/\//i.test(u) ? u : LMS + (u.startsWith('/') ? '' : '/') + u);
  const money = n => '₹' + Number(n).toLocaleString('en-IN');
  const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
  const LANG = { ta: 'Tamil', en: 'English', hi: 'Hindi', te: 'Telugu', ml: 'Malayalam', kn: 'Kannada' };
  const delay = i => `style="animation-delay:${Math.min(i, 8) * 0.07}s"`;

  // Image error aana remove pannidum (initial / placeholder theriyum)
  function fixImgs(root) {
    root.querySelectorAll('img').forEach(img => {
      const bad = () => img.remove();
      img.addEventListener('error', bad);
      if (img.complete && img.naturalWidth === 0 && img.src) bad();
    });
  }

  // API response eppadi vandhaalum list-ah maathum
  // (sila API-la data "collection"-la irukkum, sila API-la "ids"-la object-ah varum)
  async function get(path) {
    try {
      const r = await fetch(`${API}/${path}`, { headers: { Accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const j = await r.json();
      const isObj = x => x && typeof x === 'object';
      if (Array.isArray(j.collection) && j.collection.length) return j.collection.filter(isObj);
      if (isObj(j.collection) && !Array.isArray(j.collection)) return [j.collection];
      if (Array.isArray(j.ids) && j.ids.some(isObj)) return j.ids.filter(isObj);
      return [];
    } catch (e) {
      console.warn('[K-Med API] failed:', path, e);
      return [];
    }
  }

  // ---------- COURSES + CATEGORIES ----------
  async function initCourses() {
    const sec = q('#lms-courses');
    if (!sec) return;

    const [top, nw, best] = await Promise.all([get('courses/top'), get('courses/new'), get('courses/best')]);
    let cats = await get('course_categories/featured');
    if (!cats.length) cats = await get('course_categories/top');
    if (!cats.length) cats = await get('course_categories/new');
    if (!cats.length) cats = await get('course_categories/best');

    const tabs = [
      { k: 'top', label: 'Top Courses', list: top },
      { k: 'new', label: 'New Courses', list: nw },
      { k: 'best', label: 'Best Courses', list: best }
    ].filter(t => t.list.length);
    if (!tabs.length) return; // data illa na section hidden-ah irukkum

    const state = { tab: tabs[0].k, cat: 0 };
    const catName = id => (cats.find(c => c.id === id) || {}).title || '';
    const catsEl = q('#lcCats'), tabsEl = q('#lcTabs'), gridEl = q('#lcGrid');

    function card(c, i) {
      const free = c.pricing_type === 'free' || Number(c.price) === 0;
      const hasDisc = !free && Number(c.discount_price) > 0 && Number(c.discount_price) < Number(c.price);
      const priceHtml = free
        ? 'Free'
        : hasDisc
          ? `<s>${money(c.price)}</s>${money(c.discount_price)}`
          : money(c.price);
      const cat = (c.course_category && c.course_category.title) || catName(c.course_category_id);
      const img = abs(c.thumbnail || c.banner);
      const desc = clip(plain(c.short_description || c.description), 150);
      const lang = LANG[c.language] || (c.language ? String(c.language).toUpperCase() : '');
      const rating = Number(c.average_rating) > 0 ? `<span>★ <b>${Number(c.average_rating).toFixed(1)}</b> (${c.reviews_count || 0})</span>` : '';
      const enrolled = Number(c.enrollments_count) > 0 ? `<span>👥 <b>${c.enrollments_count}</b> enrolled</span>` : '';
      const initial = esc((c.title || 'K').trim().charAt(0).toUpperCase());
      return `
      <article class="lc-card" ${delay(i)}>
        <a class="lc-thumb" href="${esc(courseLink(c))}" target="_blank" rel="noopener" aria-label="${esc(c.title)}">
          <span class="ph">${initial}</span>
          ${img ? `<img loading="lazy" src="${esc(img)}" alt="${esc(c.title)}">` : ''}
          ${cat ? `<span class="lc-cat">${esc(cat)}</span>` : ''}
          ${free ? '<span class="lc-badge">FREE</span>' : ''}
        </a>
        <div class="lc-body">
          <div class="lc-meta">${c.level ? `<span>${esc(cap(c.level))}</span>` : ''}${lang ? `<span>${esc(lang)}</span>` : ''}${c.expiry_type === 'lifetime' ? '<span>Lifetime access</span>' : ''}</div>
          <h3>${esc(c.title)}</h3>
          <p>${esc(desc)}</p>
          ${(rating || enrolled) ? `<div class="lc-stats">${rating}${enrolled}</div>` : ''}
          <div class="lc-foot">
            <div class="lc-price">${priceHtml}</div>
            <a class="btn navy sm" href="${esc(courseLink(c))}" target="_blank" rel="noopener">Enroll Now <i>&rarr;</i></a>
          </div>
        </div>
      </article>`;
    }

    function render() {
      // category chips
      if (cats.length) {
        catsEl.innerHTML =
          `<button type="button" class="lc-chip ${state.cat === 0 ? 'on' : ''}" data-cat="0">All</button>` +
          cats.map(c => `<button type="button" class="lc-chip ${state.cat === c.id ? 'on' : ''}" data-cat="${c.id}">${esc(c.title)}${c.courses_count != null ? `<small>${c.courses_count}</small>` : ''}</button>`).join('');
      } else catsEl.innerHTML = '';

      // tabs (onnu mattum irundha tab bar venam)
      tabsEl.innerHTML = tabs.length > 1
        ? tabs.map(t => `<button type="button" class="lc-tab ${state.tab === t.k ? 'on' : ''}" data-tab="${t.k}">${t.label}</button>`).join('')
        : '';

      // cards
      const list = tabs.find(t => t.k === state.tab).list
        .filter(c => !state.cat || c.course_category_id === state.cat);
      gridEl.innerHTML = list.length
        ? list.map(card).join('')
        : '<p class="lc-empty">No courses in this category yet.</p>';
      fixImgs(gridEl);
    }

    sec.addEventListener('click', e => {
      const chip = e.target.closest('[data-cat]');
      const tab = e.target.closest('[data-tab]');
      if (chip) { state.cat = Number(chip.dataset.cat); render(); }
      if (tab) { state.tab = tab.dataset.tab; render(); }
    });

    render();
    sec.hidden = false;
  }

  // ---------- TESTIMONIALS ----------
  async function initTestimonials() {
    const sec = q('#testimonials');
    if (!sec) return;
    let list = USE_LOCAL_TESTIMONIALS
      ? LOCAL_TESTIMONIALS.map(t => ({ ...t, local: true }))
      : await get('testimonials/top');
    if (!list.length) list = await get('testimonials/new');
    if (!list.length) return;

    q('#tmGrid').innerHTML = list.slice(0, 6).map((t, i) => {
      const name = t.name || t.title || 'Learner';
      const r = Math.max(0, Math.min(5, Math.round(Number(t.rating) || 5)));
      const img = t.local ? (t.image || '') : abs(t.image || t.photo || t.thumbnail);
      return `
      <article class="tm-card" ${delay(i)}>
        <div class="tm-stars" aria-label="${r} out of 5">${'★'.repeat(r)}${'☆'.repeat(5 - r)}</div>
        <p>${esc(plain(t.description || t.message || t.comment))}</p>
        <div class="tm-who">
          <span class="tm-av"><b>${esc(Array.from(name.trim())[0] || '')}</b>${img ? `<img loading="lazy" src="${esc(img)}" alt="">` : ''}</span>
          <strong>${esc(name)}</strong>
        </div>
      </article>`;
    }).join('');
    fixImgs(q('#tmGrid'));
    sec.hidden = false;
  }

  // ---------- BLOGS ----------
  async function initBlogs() {
    const sec = q('#blogs');
    if (!sec) return;
    const list = await get('blogs/best');
    if (!list.length) return;

    q('#blGrid').innerHTML = list.slice(0, 6).map((b, i) => {
      const img = abs(b.thumbnail || b.image || b.banner || b.photo);
      const date = b.created_at ? new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const text = clip(plain(b.short_description || b.excerpt || b.description || b.content), 130);
      return `
      <article class="bl-card" ${delay(i)}>
        <div class="bl-img">${img ? `<img loading="lazy" src="${esc(img)}" alt="${esc(b.title)}">` : ''}</div>
        <div class="bl-body">
          ${date ? `<time>${esc(date)}</time>` : ''}
          <h3>${esc(b.title)}</h3>
          <p>${esc(text)}</p>
          <a href="${esc(blogLink(b))}" target="_blank" rel="noopener">Read more &rarr;</a>
        </div>
      </article>`;
    }).join('');
    fixImgs(q('#blGrid'));
    sec.hidden = false;
  }

  // ---------- SPONSORS ----------
  async function initSponsors() {
    const sec = q('#sponsors');
    if (!sec) return;
    const list = await get('sponsors/top');
    if (!list.length) return;

    q('#spRow').innerHTML = list.map(s => {
      const name = s.name || s.title || '';
      const img = abs(s.logo || s.image || s.thumbnail || s.photo);
      const href = s.link || s.url || s.website || '';
      const inner = img ? `<img loading="lazy" src="${esc(img)}" alt="${esc(name)}">` : esc(name);
      return /^https?:\/\//i.test(href)
        ? `<a class="sp-item" href="${esc(href)}" target="_blank" rel="noopener" title="${esc(name)}">${inner}</a>`
        : `<div class="sp-item" title="${esc(name)}">${inner}</div>`;
    }).join('');
    fixImgs(q('#spRow'));
    sec.hidden = false;
  }

  // ---------- run (oru API fail aanalum matha sections work aagum) ----------
  [initCourses, initTestimonials, initBlogs, initSponsors].forEach(fn => fn().catch(e => console.warn('[K-Med API]', fn.name, e)));
})();