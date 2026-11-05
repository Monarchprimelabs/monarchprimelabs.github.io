// Monarch Prime Pin landing page interactions. No dependencies.
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';

  /* ---------- Body map (same drawing and zones as the app) ---------- */
  var COMMON = [
    ['path', { d: 'M 50 6 Q 56 6 56 13 Q 56 19 50 19.5 Q 44 19 44 13 Q 44 6 50 6 Z' }],
    ['rect', { x: 47.5, y: 19, width: 5, height: 2.5, rx: 1 }],
    ['path', { d: 'M 50 21.5 Q 38 22 32 26 Q 27 30 27 35 Q 27 42 28 48 Q 29 53 32 55 Q 38 57 50 57 Q 62 57 68 55 Q 71 53 72 48 Q 73 42 73 35 Q 73 30 68 26 Q 62 22 50 21.5 Z' }],
    ['path', { d: 'M 28 27 Q 22 28 20 33 Q 19 38 20 43 Q 21 47 24 47 Q 27 47 28 43 Q 29 38 28 33 Q 28 30 28 27 Z' }],
    ['path', { d: 'M 21 47 Q 18 48 17 53 Q 16 58 17 62 Q 18 65 21 65 Q 24 65 25 62 Q 26 58 25 53 Q 24 49 22 47 Z' }],
    ['path', { d: 'M 72 27 Q 78 28 80 33 Q 81 38 80 43 Q 79 47 76 47 Q 73 47 72 43 Q 71 38 72 33 Q 72 30 72 27 Z' }],
    ['path', { d: 'M 79 47 Q 82 48 83 53 Q 84 58 83 62 Q 82 65 79 65 Q 76 65 75 62 Q 74 58 75 53 Q 76 49 78 47 Z' }],
    ['path', { d: 'M 38 64 Q 35 66 35 75 Q 35 84 37 88 Q 41 89 45 88 Q 47 84 47 75 Q 47 66 45 64 Q 41 63 38 64 Z' }],
    ['path', { d: 'M 38 88 Q 36 90 36 96 Q 36 100 38 102 Q 41 103 44 102 Q 46 100 46 96 Q 46 90 44 88 Q 41 87 38 88 Z' }],
    ['ellipse', { cx: 41, cy: 105, rx: 4, ry: 2 }],
    ['path', { d: 'M 62 64 Q 65 66 65 75 Q 65 84 63 88 Q 59 89 55 88 Q 53 84 53 75 Q 53 66 55 64 Q 59 63 62 64 Z' }],
    ['path', { d: 'M 62 88 Q 64 90 64 96 Q 64 100 62 102 Q 59 103 56 102 Q 54 100 54 96 Q 54 90 56 88 Q 59 87 62 88 Z' }],
    ['ellipse', { cx: 59, cy: 105, rx: 4, ry: 2 }]
  ];
  var FRONT_ONLY = [['path', { d: 'M 35 56 Q 35 61 37 64 Q 42 65 50 65 Q 58 65 63 64 Q 65 61 65 56' }]];
  var BACK_ONLY = [
    ['path', { d: 'M 35 56 Q 35 60 39 63 Q 44 64 49 63 L 49 56' }],
    ['path', { d: 'M 65 56 Q 65 60 61 63 Q 56 64 51 63 L 51 56' }]
  ];
  var ZONES = {
    front: [
      ['sh_l', 'Left shoulder', 32, 28, 2.8], ['sh_r', 'Right shoulder', 68, 28, 2.8],
      ['arm_l', 'Left outer arm', 24, 38, 2.4], ['arm_r', 'Right outer arm', 76, 38, 2.4],
      ['abd_ul', 'Upper left abdomen', 43, 39, 2.4], ['abd_ur', 'Upper right abdomen', 57, 39, 2.4],
      ['abd_ll', 'Lower left abdomen', 43, 47, 2.4], ['abd_lr', 'Lower right abdomen', 57, 47, 2.4],
      ['flk_l', 'Left flank', 35, 43, 2.2], ['flk_r', 'Right flank', 65, 43, 2.2],
      ['th_l', 'Left thigh', 42, 70, 2.6], ['th_r', 'Right thigh', 58, 70, 2.6]
    ],
    back: [
      ['b_sh_l', 'Left rear shoulder', 32, 28, 2.8], ['b_sh_r', 'Right rear shoulder', 68, 28, 2.8],
      ['b_arm_l', 'Left tricep', 24, 38, 2.4], ['b_arm_r', 'Right tricep', 76, 38, 2.4],
      ['hip_l', 'Left hip', 36, 47, 2.4], ['hip_r', 'Right hip', 64, 47, 2.4],
      ['glute_l', 'Left glute', 43, 53, 3], ['glute_r', 'Right glute', 57, 53, 3],
      ['b_th_l', 'Left hamstring', 42, 70, 2.6], ['b_th_r', 'Right hamstring', 58, 70, 2.6],
      ['calf_l', 'Left calf', 41, 94, 2.4], ['calf_r', 'Right calf', 59, 94, 2.4]
    ]
  };
  var COLORS = ['', '#1E88E5', '#34D399', '#FACC15', '#F5871F', '#E53935'];

  function el(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    for (var k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function drawBody(svg, side) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var fig = el('g', { 'class': 'figure' });
    COMMON.concat(side === 'front' ? FRONT_ONLY : BACK_ONLY).forEach(function (p) { fig.appendChild(el(p[0], p[1])); });
    svg.appendChild(fig);
    var zones = {};
    ZONES[side].forEach(function (z) {
      var halo = el('circle', { 'class': 'halo', cx: z[2], cy: z[3], r: z[4] });
      var c = el('circle', { 'class': 'zone', cx: z[2], cy: z[3], r: z[4], 'data-id': z[0], 'data-label': z[1] });
      svg.appendChild(halo);
      svg.appendChild(c);
      zones[z[0]] = { dot: c, halo: halo, label: z[1] };
    });
    return zones;
  }

  function setLevel(zone, level) {
    var l = Math.max(0, Math.min(5, level));
    zone.dot.setAttribute('class', 'zone' + (l ? ' l' + l : '') + (zone.dot.classList.contains('sel') ? ' sel' : ''));
    zone.halo.setAttribute('class', 'halo' + (l >= 4 ? ' on' : ''));
    if (l) zone.halo.setAttribute('stroke', COLORS[l]);
  }

  // Static demo bodies: fixed, plausible rotation patterns.
  var SEEDS = {
    hero: { abd_ul: 2, abd_lr: 4, th_l: 1, th_r: 3, abd_ur: 1, flk_r: 2, sh_l: 1 },
    rotate: { glute_l: 5, glute_r: 2, hip_l: 3, hip_r: 1, b_th_l: 2, b_arm_r: 4, b_sh_l: 1, calf_r: 1 },
    pick: {}
  };
  Array.prototype.forEach.call(document.querySelectorAll('.body-svg[data-seed]'), function (svg) {
    var zones = drawBody(svg, svg.getAttribute('data-body'));
    var seed = SEEDS[svg.getAttribute('data-seed')] || {};
    Object.keys(seed).forEach(function (id) { if (zones[id]) setLevel(zones[id], seed[id]); });
    if (svg.getAttribute('data-seed') === 'pick' && zones.abd_ll) zones.abd_ll.dot.classList.add('pick');
    if (svg.getAttribute('data-seed') === 'hero' && !reduce) {
      // Gently "log" a new site every few seconds so the hero feels alive.
      var ids = Object.keys(zones), i = 0;
      setInterval(function () {
        var id = ids[(i++ * 5) % ids.length];
        seed[id] = ((seed[id] || 0) % 5) + 1;
        setLevel(zones[id], seed[id]);
      }, 2200);
    }
  });

  /* ---------- Interactive heat map ---------- */
  var demo = document.getElementById('demoBody');
  if (demo) {
    var counts = { front: {}, back: {} };
    var side = 'front';
    var zones = drawBody(demo, side);
    var readSite = document.getElementById('readSite');
    var readCount = document.getElementById('readCount');
    var levelFor = function (n) { return n >= 6 ? 5 : n >= 4 ? 4 : n >= 3 ? 3 : n >= 2 ? 2 : n >= 1 ? 1 : 0; };
    var WORDS = ['Rested', 'Light', 'Moderate', 'Frequent', 'Busy', 'Hot'];
    var paint = function () {
      Object.keys(zones).forEach(function (id) { setLevel(zones[id], levelFor(counts[side][id] || 0)); });
    };
    var show = function (id) {
      var n = counts[side][id] || 0;
      readSite.textContent = zones[id].label;
      readCount.textContent = n + (n === 1 ? ' entry' : ' entries') + ' · ' + WORDS[levelFor(n)];
    };
    var select = function (id) {
      Object.keys(zones).forEach(function (k) { zones[k].dot.classList.toggle('sel', k === id); });
    };
    var log = function (id) {
      counts[side][id] = (counts[side][id] || 0) + 1;
      select(id); paint(); show(id);
    };
    demo.addEventListener('click', function (e) {
      var id = e.target.getAttribute && e.target.getAttribute('data-id');
      if (id) log(id);
    });
    // Keyboard: each zone is focusable and logs on Enter or Space.
    var makeFocusable = function () {
      Object.keys(zones).forEach(function (id) {
        var d = zones[id].dot;
        d.setAttribute('tabindex', '0');
        d.setAttribute('role', 'button');
        d.setAttribute('aria-label', 'Log ' + zones[id].label);
        d.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); log(id); }
        });
      });
    };
    makeFocusable();
    Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (b) {
      b.addEventListener('click', function () {
        side = b.getAttribute('data-side');
        Array.prototype.forEach.call(document.querySelectorAll('.seg button'), function (o) { o.setAttribute('aria-selected', String(o === b)); });
        demo.setAttribute('data-body', side);
        zones = drawBody(demo, side);
        makeFocusable(); paint();
        readSite.textContent = 'Tap any circle';
        readCount.textContent = 'Each tap adds one entry';
      });
    });
    var simBtn = document.getElementById('simulate');
    var simTimer = null;
    simBtn.addEventListener('click', function () {
      if (simTimer) return;
      simBtn.disabled = true;
      // A month of entries that favors a few sites, as real rotation drifts.
      var ids = Object.keys(zones);
      var weights = ids.map(function (_, i) { return (i * 7 + 3) % 5 + 1; });
      var total = weights.reduce(function (a, b) { return a + b; }, 0);
      var step = 0;
      simTimer = setInterval(function () {
        var r = ((step * 9301 + 49297) % 233280) / 233280 * total, k = 0;
        while (r > weights[k]) { r -= weights[k]; k++; }
        log(ids[k]);
        if (++step >= 30) { clearInterval(simTimer); simTimer = null; simBtn.disabled = false; }
      }, reduce ? 0 : 90);
    });
    document.getElementById('resetMap').addEventListener('click', function () {
      counts[side] = {};
      select(null); paint();
      readSite.textContent = 'Tap any circle';
      readCount.textContent = 'Each tap adds one entry';
    });
  }

  /* ---------- Nav ---------- */
  var nav = document.getElementById('nav');
  var menuBtn = document.querySelector('.nav-menu');
  var sheet = document.getElementById('sheet');
  var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 12); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  var setMenu = function (open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    sheet.hidden = !open;
  };
  menuBtn.addEventListener('click', function () { setMenu(sheet.hidden); });
  sheet.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Highlight the nav link for the section in view.
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['how', 'map', 'free', 'premium', 'privacy'].forEach(function (id) { var s = document.getElementById(id); if (s) spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var countUp = function (node) {
    var to = Number(node.getAttribute('data-count'));
    var from = Number(node.getAttribute('data-from') || 0);
    var suffix = node.getAttribute('data-suffix') || '';
    if (reduce) { node.textContent = to + suffix; return; }
    var start = null, dur = 1400;
    var tick = function (t) {
      if (!start) start = t;
      var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
      node.textContent = Math.round(from + (to - from) * e) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  var revealTargets = document.querySelectorAll('.reveal, .flip, #notifStack');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        Array.prototype.forEach.call(en.target.querySelectorAll('[data-count]'), countUp);
        io.unobserve(en.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
    Array.prototype.forEach.call(revealTargets, function (n) { io.observe(n); });
  } else {
    Array.prototype.forEach.call(revealTargets, function (n) {
      n.classList.add('in');
      Array.prototype.forEach.call(n.querySelectorAll('[data-count]'), countUp);
    });
  }

  /* ---------- Flip cards ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.flip'), function (card, i) {
    card.style.setProperty('--d', (i % 4) * 0.08 + 's');
    // On arrival each card turns over once to show its back, then settles.
    if (!reduce) {
      card.style.setProperty('--fd', 0.5 + (i % 4) * 0.12 + 's');
      var obs = new MutationObserver(function () {
        if (!card.classList.contains('in')) return;
        obs.disconnect();
        card.classList.add('peek');
        setTimeout(function () { card.classList.remove('peek'); card.style.setProperty('--fd', '0s'); }, 2600 + (i % 4) * 120);
      });
      obs.observe(card, { attributes: true, attributeFilter: ['class'] });
    }
    card.addEventListener('click', function () {
      card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(card.classList.contains('flipped')));
    });
  });

  /* ---------- Hero phone tilt ---------- */
  var phone = document.getElementById('heroPhone');
  if (phone && !reduce) {
    var rx = 0, ry = 0, sy = 0, raf = null;
    var apply = function () {
      raf = null;
      phone.style.transform = 'rotateX(' + (rx + sy).toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    };
    var queue = function () { if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      ry = (e.clientX / window.innerWidth - 0.5) * 18;
      rx = -(e.clientY / window.innerHeight - 0.5) * 12;
      queue();
    }, { passive: true });
    window.addEventListener('scroll', function () {
      sy = Math.min(20, window.scrollY / 30);
      queue();
    }, { passive: true });
    rx = 6; ry = -14; apply();
  }

  /* ---------- Story: sticky phone follows the step in view ---------- */
  var storyPhone = document.getElementById('storyPhone');
  var steps = document.querySelectorAll('.step');
  if (storyPhone && steps.length) {
    var activate = function (step) {
      Array.prototype.forEach.call(steps, function (s) { s.classList.toggle('active', s === step); });
      var screen = step.getAttribute('data-step');
      if (storyPhone.getAttribute('data-screen') !== screen) {
        storyPhone.setAttribute('data-screen', screen);
        if (screen === 'review') Array.prototype.forEach.call(storyPhone.querySelectorAll('.scr-review [data-count]'), countUp);
      }
    };
    activate(steps[0]);
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { if (en.isIntersecting) activate(en.target); });
      }, { rootMargin: window.matchMedia('(max-width: 980px)').matches ? '-62% 0px -30% 0px' : '-45% 0px -45% 0px' });
      Array.prototype.forEach.call(steps, function (s) { so.observe(s); });
    }
  }

  /* ---------- Notification buttons ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  Array.prototype.forEach.call(document.querySelectorAll('[data-act]'), function (b) {
    b.addEventListener('click', function () {
      var later = new Date(Date.now() + 3600000);
      var hh = later.getHours() % 12 || 12, mm = String(later.getMinutes()).padStart(2, '0');
      toast.textContent = b.getAttribute('data-act') === 'log'
        ? '✓ Logged. Nice work.'
        : 'Snoozed until ' + hh + ':' + mm + (later.getHours() >= 12 ? ' PM' : ' AM');
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2400);
    });
  });

  /* ---------- Platform: smart banner, web-app links, "this device" ---------- */
  var ua = navigator.userAgent || '';
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  var webapp = document.body.getAttribute('data-webapp') || '../../app/';
  Array.prototype.forEach.call(document.querySelectorAll('[data-webapp-link]'), function (a) {
    if (a.getAttribute('href') !== '#get') a.setAttribute('href', webapp);
  });
  var mine = isIOS ? 'ios' : isAndroid ? 'android' : 'desktop';
  var card = document.querySelector('.get-card[data-platform="' + mine + '"]');
  if (card) card.classList.add('mine');

  var smart = document.getElementById('smart');
  var dismissed = false;
  try { dismissed = localStorage.getItem('mpp-smart-dismissed') === '1'; } catch (e) { /* storage blocked */ }
  if (smart && !dismissed && !standalone && (isIOS || isAndroid)) {
    var go = document.getElementById('smartGo');
    if (isIOS) {
      document.getElementById('smartSub').textContent = 'Free on the App Store';
      go.textContent = 'Get';
      go.setAttribute('href', 'https://apps.apple.com/app/id6770808426');
    } else {
      document.getElementById('smartSub').textContent = 'Use it on Android in your browser';
      go.textContent = 'Open';
      go.setAttribute('href', webapp);
    }
    smart.hidden = false;
    setTimeout(function () { smart.classList.add('show'); }, 1800);
    document.getElementById('smartX').addEventListener('click', function () {
      smart.classList.remove('show');
      setTimeout(function () { smart.hidden = true; }, 600);
      try { localStorage.setItem('mpp-smart-dismissed', '1'); } catch (e) { /* storage blocked */ }
    });
  }
})();
