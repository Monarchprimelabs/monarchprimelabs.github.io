/* FuelRing landing page. No libraries, no tracking. Honors Reduce Motion. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };

  /* ---------- Nav ---------- */
  var nav = $('#nav'), menu = $('#navMenu'), sheet = $('#navSheet');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 24); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  menu.addEventListener('click', function () {
    var open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open)); sheet.hidden = !open;
  });
  $$('#navSheet a').forEach(function (a) { a.addEventListener('click', function () { menu.setAttribute('aria-expanded', 'false'); sheet.hidden = true; }); });

  /* ---------- Reveal on scroll ---------- */
  if (reduce || !('IntersectionObserver' in window)) $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Story: the sticky phone follows the step in view ---------- */
  var shots = $$('#storyScreen img'), steps = $$('.step');
  var show = function (i) {
    shots.forEach(function (img) { img.classList.toggle('on', img.getAttribute('data-step') === String(i)); });
    steps.forEach(function (s) { s.classList.toggle('active', s.getAttribute('data-step') === String(i)); });
  };
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(e.target.getAttribute('data-step')); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(function (s) { so.observe(s); });
  }
  show(0);

  /* ---------- Rings (SVG) ---------- */
  function ring(size, stroke, pct, color, center, label) {
    var r = (size - stroke) / 2, c = size / 2, C = 2 * Math.PI * r, p = Math.max(0, Math.min(1, pct)), d = p * C;
    return '<svg viewBox="0 0 ' + size + ' ' + size + '" role="img" aria-label="' + label + '">' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="' + stroke + '"/>' +
      '<circle class="bar" cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + stroke + '" stroke-linecap="round" ' +
      'stroke-dasharray="' + d.toFixed(1) + ' ' + (C - d + 0.01).toFixed(1) + '" transform="rotate(-90 ' + c + ' ' + c + ')"/>' +
      '<text x="' + c + '" y="' + c + '" text-anchor="middle" dominant-baseline="central" fill="#EAF1F8" font-weight="800" font-size="' + (size / 4.6).toFixed(0) + '">' + center + '</text></svg>';
  }
  // updates a ring in place so the arc animates instead of being redrawn
  function setRing(host, size, stroke, pct, color, center, label) {
    var svg = host.querySelector('svg');
    if (!svg) { host.insertAdjacentHTML('afterbegin', ring(size, stroke, pct, color, center, label)); return; }
    var r = (size - stroke) / 2, C = 2 * Math.PI * r, d = Math.max(0, Math.min(1, pct)) * C;
    svg.querySelector('.bar').setAttribute('stroke-dasharray', d.toFixed(1) + ' ' + (C - d + 0.01).toFixed(1));
    svg.querySelector('.bar').setAttribute('stroke', color);
    svg.querySelector('text').textContent = center;
    svg.setAttribute('aria-label', label);
  }
  function macroRow(host, items) {
    if (!host.children.length) host.innerHTML = items.map(function () { return '<div class="ring"><b></b><span></span></div>'; }).join('');
    items.forEach(function (it, i) {
      var cell = host.children[i];
      setRing(cell, 84, 9, it.pct, it.color, it.center, it.label);
      cell.querySelector('b').textContent = it.value; cell.querySelector('span').textContent = it.name;
    });
  }

  /* ---------- Find your number: the app's own math (src/core.js) ---------- */
  // Mifflin-St Jeor BMR x activity; 500 kcal/day per lb/week; floors 1,200 (women) / 1,500 (men);
  // rounded to 10. Macros 50/20/30 at 4/4/9 kcal per gram.
  var LB_PER_KG = 2.20462;
  var ACTIVITY = { sedentary: 1.2, light: 1.375, active: 1.55, very: 1.725 };
  var calc = { sex: 'male', units: 'imperial', age: 30, heightIn: 70, weightLbs: 190 };
  function calorieGoal(p) {
    var kg = p.weightLbs / LB_PER_KG, cm = p.heightIn * 2.54;
    var bmr = 10 * kg + 6.25 * cm - 5 * p.age + (p.sex === 'male' ? 5 : -161);
    var goal = bmr * (ACTIVITY[p.activity] || 1.2) + 500 * p.rate;
    var floor = p.sex === 'male' ? 1500 : 1200;
    return { goal: Math.round(Math.max(goal, floor) / 10) * 10, floored: goal < floor };
  }
  var cAge = $('#cAge'), cHt = $('#cHt'), cWt = $('#cWt'), cAct = $('#cAct'), cRate = $('#cRate');
  function heightText() {
    if (calc.units === 'metric') return Math.round(calc.heightIn * 2.54) + ' cm';
    var ft = Math.floor(calc.heightIn / 12), inch = Math.round(calc.heightIn - ft * 12);
    if (inch === 12) { ft += 1; inch = 0; }
    return ft + '′ ' + inch + '″';
  }
  function weightText() { return calc.units === 'metric' ? Math.round(calc.weightLbs / LB_PER_KG) + ' kg' : Math.round(calc.weightLbs) + ' lb'; }
  function setSliders() {
    // the sliders run in the units shown; storage stays lb / in, as in the app
    if (calc.units === 'metric') {
      cHt.min = 137; cHt.max = 213; cHt.value = Math.round(calc.heightIn * 2.54);
      cWt.min = 41; cWt.max = 181; cWt.value = Math.round(calc.weightLbs / LB_PER_KG);
    } else {
      cHt.min = 54; cHt.max = 84; cHt.value = Math.round(calc.heightIn);
      cWt.min = 90; cWt.max = 400; cWt.value = Math.round(calc.weightLbs);
    }
  }
  function updateCalc() {
    calc.age = +cAge.value;
    calc.heightIn = calc.units === 'metric' ? +cHt.value / 2.54 : +cHt.value;
    calc.weightLbs = calc.units === 'metric' ? +cWt.value * LB_PER_KG : +cWt.value;
    var r = calorieGoal({ sex: calc.sex, age: calc.age, heightIn: calc.heightIn, weightLbs: calc.weightLbs, activity: cAct.value, rate: +cRate.value });
    $('#oAge').textContent = calc.age; $('#oHt').textContent = heightText(); $('#oWt').textContent = weightText();
    $('#goalOut').textContent = fmt(r.goal);
    $('#goalNote').textContent = r.floored ? 'That pace would go below the safe minimum, so the goal stops at ' + fmt(r.goal) + '.' : '';
    var g = { c: Math.round(r.goal * 0.5 / 4), p: Math.round(r.goal * 0.2 / 4), f: Math.round(r.goal * 0.3 / 9) };
    macroRow($('#macroRings'), [
      { name: 'Carbs', value: g.c + ' g', pct: 0.5, color: '#2E8FD6', center: '50%', label: g.c + ' grams of carbs a day, 50% of calories' },
      { name: 'Protein', value: g.p + ' g', pct: 0.2, color: '#F07800', center: '20%', label: g.p + ' grams of protein a day, 20% of calories' },
      { name: 'Fat', value: g.f + ' g', pct: 0.3, color: '#9578E0', center: '30%', label: g.f + ' grams of fat a day, 30% of calories' },
    ]);
  }
  $$('[data-sex]').forEach(function (b) { b.addEventListener('click', function () {
    calc.sex = b.getAttribute('data-sex'); $$('[data-sex]').forEach(function (x) { x.classList.toggle('on', x === b); }); updateCalc();
  }); });
  $$('[data-units]').forEach(function (b) { b.addEventListener('click', function () {
    calc.units = b.getAttribute('data-units'); $$('[data-units]').forEach(function (x) { x.classList.toggle('on', x === b); });
    setSliders(); updateCalc();
  }); });
  [cAge, cHt, cWt].forEach(function (el) { el.addEventListener('input', updateCalc); });
  [cAct, cRate].forEach(function (el) { el.addEventListener('change', updateCalc); });
  setSliders(); updateCalc();

  /* ---------- Build a plate: servings from FuelRing's food list (src/data.js) ---------- */
  var FOODS = [
    { n: 'Egg, large', s: '1 egg (50g)', cal: 72, c: 0.4, p: 6.3, f: 4.8 },
    { n: 'Oatmeal', s: '1/2 cup dry (40g)', cal: 150, c: 27, p: 5, f: 3 },
    { n: 'Banana', s: '1 medium (118g)', cal: 105, c: 27, p: 1.3, f: 0.4 },
    { n: 'Greek yogurt, 2%', s: '3/4 cup (170g)', cal: 150, c: 7, p: 20, f: 4 },
    { n: 'Chicken breast', s: '4 oz grilled (113g)', cal: 187, c: 0, p: 35, f: 4 },
    { n: 'Brown rice', s: '1 cup cooked (195g)', cal: 216, c: 45, p: 5, f: 1.8 },
    { n: 'Salmon', s: '4 oz cooked (113g)', cal: 233, c: 0, p: 25, f: 14 },
    { n: 'Avocado', s: '1/2 avocado (100g)', cal: 160, c: 8.5, p: 2, f: 14.7 },
    { n: 'Almonds', s: '1 oz (28g)', cal: 164, c: 6, p: 6, f: 14 },
    { n: 'Big Mac', s: '1 sandwich (219g)', cal: 590, c: 46, p: 25, f: 34 },
    { n: 'Chilaquiles verdes', s: 'with egg (350g)', cal: 515, c: 48, p: 18, f: 28 },
    { n: 'Coca-Cola', s: '12 fl oz can', cal: 140, c: 39, p: 0, f: 0 },
  ];
  var GOAL = 1800, G = { c: 225, p: 90, f: 60 }; // a sample day at 50/20/30
  var counts = FOODS.map(function () { return 0; });
  var foodsEl = $('#foods');
  foodsEl.innerHTML = FOODS.map(function (f, i) {
    return '<button type="button" class="food" data-i="' + i + '" aria-label="Add ' + f.n + ', ' + f.cal + ' calories"><span><span class="fn">' + f.n +
      '</span><br><span class="fs">' + f.s + '</span></span><span class="fc">' + f.cal + '</span><span class="cnt" aria-hidden="true"></span></button>';
  }).join('');
  function updatePlate() {
    var t = { cal: 0, c: 0, p: 0, f: 0 };
    FOODS.forEach(function (f, i) { t.cal += f.cal * counts[i]; t.c += f.c * counts[i]; t.p += f.p * counts[i]; t.f += f.f * counts[i]; });
    var left = GOAL - t.cal, over = left < 0;
    setRing($('#calRing'), 170, 14, t.cal / GOAL, over ? '#FF6B61' : '#2FA45C', fmt(Math.abs(left)),
      fmt(t.cal) + ' of ' + fmt(GOAL) + ' calories eaten');
    var lo = $('#leftOut');
    lo.innerHTML = '<b>' + fmt(Math.abs(left)) + '</b> kcal ' + (over ? 'over' : 'left');
    lo.classList.toggle('over', over);
    macroRow($('#plateRings'), [
      { name: 'Carbs', value: Math.round(t.c) + '/' + G.c + ' g', pct: t.c / G.c, color: '#2E8FD6', center: Math.round(t.c), label: Math.round(t.c) + ' of ' + G.c + ' grams of carbs' },
      { name: 'Protein', value: Math.round(t.p) + '/' + G.p + ' g', pct: t.p / G.p, color: '#F07800', center: Math.round(t.p), label: Math.round(t.p) + ' of ' + G.p + ' grams of protein' },
      { name: 'Fat', value: Math.round(t.f) + '/' + G.f + ' g', pct: t.f / G.f, color: '#9578E0', center: Math.round(t.f), label: Math.round(t.f) + ' of ' + G.f + ' grams of fat' },
    ]);
    $$('.food').forEach(function (b, i) {
      b.classList.toggle('has', counts[i] > 0);
      b.querySelector('.cnt').textContent = counts[i] > 1 ? '×' + counts[i] : counts[i] ? '1' : '';
    });
  }
  foodsEl.addEventListener('click', function (e) {
    var b = e.target.closest('.food'); if (!b) return;
    var i = +b.getAttribute('data-i'); counts[i] = Math.min(counts[i] + 1, 9); updatePlate();
  });
  $('#clearPlate').addEventListener('click', function () { counts = counts.map(function () { return 0; }); updatePlate(); });
  updatePlate();

  /* ---------- Platform: the web app link, "your" card first, Android's banner ---------- */
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var webapp = document.body.getAttribute('data-webapp') || 'app/';
  $$('[data-webapp-link]').forEach(function (a) { a.setAttribute('href', webapp); });
  var mine = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
  var card = document.querySelector('.get-card[data-platform="' + mine + '"]');
  if (card) card.classList.add('mine');
  var smart = $('#smart'), dismissed = false;
  try { dismissed = localStorage.getItem('fr-smart-dismissed') === '1'; } catch (e) { /* storage blocked */ }
  // iPhone users get Safari's own App Store banner (the apple-itunes-app meta tag)
  if (smart && isAndroid && !dismissed) {
    smart.hidden = false;
    setTimeout(function () { smart.classList.add('show'); }, reduce ? 0 : 1600);
    $('#smartX').addEventListener('click', function () {
      smart.classList.remove('show');
      setTimeout(function () { smart.hidden = true; }, reduce ? 0 : 600);
      try { localStorage.setItem('fr-smart-dismissed', '1'); } catch (e) { /* storage blocked */ }
    });
  }
})();
