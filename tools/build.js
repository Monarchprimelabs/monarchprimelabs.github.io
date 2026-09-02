#!/usr/bin/env node
// Static site generator for monarchprimelabs.github.io.
// Reads site-data.json + content/ fragments, writes plain HTML. No dependencies.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'site-data.json'), 'utf8'));
const org = data.org;
const YEAR = org.copyrightYear;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
const write = (rel, html) => { const out = path.join(ROOT, rel); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, html); pages.push(rel); };
const pages = [];

const STATUS = {
  live: { label: 'Available on the App Store', short: 'Available now' },
  in_review: { label: 'Submitted to the App Store', short: 'Coming soon' },
  testflight: { label: 'In beta testing', short: 'Coming soon' },
  in_development: { label: 'In development', short: 'Coming soon' },
};

const APPLE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 12.7c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.5-1.8 3.1-.5 7.8 1.3 10.3.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.5 0 2 .8 3.3.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.8-1.1-2.8-4.2zM14.1 5.3c.7-.8 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>';

function layout({ title, description, depth, body, current, heroClass = '' }) {
  const r = '../'.repeat(depth) || './';
  const nav = [['apps', 'Apps', r + '#apps'], ['privacy', 'Privacy', r + 'privacy/'], ['support', 'Support', r + 'support/']]
    .map(([k, l, h]) => `<a href="${h}"${current === k ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="icon" href="${r}assets/icons/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${r}assets/icons/monarch-prime-labs.png">
<link rel="stylesheet" href="${r}assets/css/site.css">
</head>
<body>
<header class="top"><div class="wrap">
  <a class="brand" href="${r}"><img src="${r}assets/icons/monarch-prime-labs.png" alt="" width="28" height="28">Monarch Prime Labs</a>
  <nav class="nav">${nav}</nav>
</div></header>
${body}
<footer><div class="wrap">
  <span>© ${YEAR} ${esc(org.name)}. ${esc(org.footerNote)}</span>
  <span><a href="mailto:${esc(org.email)}">${esc(org.email)}</a> · <a href="${r}privacy/">Privacy</a> · <a href="${r}support/">Support</a></span>
</div></footer>
</body>
</html>
`;
}

function storeButton(app) {
  if (app.appStore && app.status === 'live') {
    return `<a class="btn store" href="${esc(app.appStore.url)}">${APPLE_SVG}<span>Download on the App Store</span></a>`;
  }
  return `<span class="btn ghost">${esc(STATUS[app.status].label)}</span>`;
}

/* ---------- Home ---------- */
function home() {
  const cards = data.apps.map(a => `
    <a class="card appcard" href="apps/${a.key}/">
      <div class="head"><img src="assets/icons/${a.key}.png" alt="" width="56" height="56"><div><h3>${esc(a.name)}</h3><p class="sub">${esc(a.category)}</p></div></div>
      <p>${esc(a.tagline)}</p>
      <div class="foot"><span class="badge ${a.status}">${esc(STATUS[a.status].short)}</span><span>${esc(a.pricingShort)}</span></div>
    </a>`).join('');
  const principles = org.principles.map(p => `<div class="card"><h3>${esc(p.title)}</h3><p style="color:var(--mut);margin:0">${esc(p.detail)}</p></div>`).join('');
  const body = `
<section class="hero"><div class="wrap">
  <h1>${esc(org.heroTitle)}</h1>
  <p>${esc(org.heroText)}</p>
</div></section>
<main><div class="wrap">
  <section class="section" id="apps"><h2>Apps</h2><div class="grid">${cards}</div></section>
  <section class="section"><h2>How we build</h2><div class="grid">${principles}</div></section>
  <section class="section"><div class="card"><h2>Contact</h2><p style="margin:0">${esc(org.contactText)} <a href="mailto:${esc(org.email)}">${esc(org.email)}</a>.</p></div></section>
</div></main>`;
  write('index.html', layout({ title: `${org.name} — ${org.tagline}`, description: org.heroText, depth: 0, body, current: 'apps' }));
}

/* ---------- App landing ---------- */
function appPage(a) {
  const r = '../../';
  const feats = a.features.map(f => `<li><strong>${esc(f.title)}</strong><span>${esc(f.detail)}</span></li>`).join('');
  const points = (a.privacy.dataPoints || []).map(p => `<li>${esc(p)}</li>`).join('');
  const disclaimers = (a.disclaimers || []).map(d => `<div class="note">${esc(d)}</div>`).join('');
  const policyLine = a.privacy.hasPolicy
    ? `<p><a href="privacy.html">Read the full ${esc(a.name)} privacy policy →</a></p>`
    : `<p><a href="privacy.html">Privacy at a glance →</a></p>`;
  const body = `
<section class="hero app"><div class="wrap">
  <div class="row"><img src="${r}assets/icons/${a.key}.png" alt="${esc(a.name)} icon" width="96" height="96">
  <div><h1>${esc(a.name)}</h1><p class="tag">${esc(a.tagline)}</p><span class="badge ${a.status}">${esc(STATUS[a.status].label)}</span></div></div>
  <div class="cta">${storeButton(a)}<a class="btn ghost" href="support.html">Support</a><a class="btn ghost" href="privacy.html">Privacy</a></div>
</div></section>
<main><div class="wrap">
  <section class="section card"><h2>About</h2><p style="margin:0">${esc(a.summary)}</p></section>
  <section class="section card"><h2>What it does</h2><ul class="feat">${feats}</ul></section>
  <div class="grid two section">
    <section class="card"><h2>Details</h2><dl class="kv">
      <dt>Price</dt><dd>${esc(a.pricing)}</dd>
      <dt>Platforms</dt><dd>${esc(a.platforms.join(', '))}</dd>
      ${a.languages && a.languages.length ? `<dt>Languages</dt><dd>${esc(a.languages.join(', '))}</dd>` : ''}
      <dt>Publisher</dt><dd>${esc(a.publisher)}</dd>
    </dl></section>
    <section class="card"><h2>Your data</h2><ul class="points">${points}</ul>${policyLine}</section>
  </div>
  ${disclaimers ? `<section class="section">${disclaimers}</section>` : ''}
</div></main>`;
  write(`apps/${a.key}/index.html`, layout({ title: `${a.name} — ${a.tagline}`, description: a.summary, depth: 2, body, current: 'apps' }));
}

/* ---------- Privacy ---------- */
function privacyPage(a) {
  const r = '../../';
  const frag = read(path.join(ROOT, 'content', 'privacy', `${a.key}.html`));
  let inner;
  if (frag) {
    const hasEs = /lang="es"/.test(frag);
    const langs = hasEs ? `<div class="langs"><a href="#en">English</a><a href="#es">Español</a></div>` : '';
    inner = `${langs}${a.privacy.notice ? `<div class="note">${esc(a.privacy.notice)}</div>` : ''}<div id="en"></div>${frag}`;
  } else {
    const points = (a.privacy.dataPoints || []).map(p => `<li>${esc(p)}</li>`).join('');
    inner = `
<h1>${esc(a.name)} — Privacy</h1>
<p class="sub">${esc(a.privacy.summary || '')}</p>
<p class="updated">Last reviewed: ${esc(a.privacy.lastUpdated || YEAR)}</p>
<h2>At a glance</h2><ul>${points}</ul>
${a.privacy.notice ? `<div class="box">${esc(a.privacy.notice)}</div>` : ''}
<h2>Contact</h2><p>Questions about privacy in ${esc(a.name)}: <a href="mailto:${esc(a.support.email)}">${esc(a.support.email)}</a></p>`;
  }
  const body = `<main><div class="wrap narrow">
  <p class="crumbs"><a href="${r}">Home</a> › <a href="./">${esc(a.name)}</a> › Privacy</p>
  <div class="mini" style="margin-bottom:16px"><img src="${r}assets/icons/${a.key}.png" alt="" width="36" height="36"><span>${esc(a.name)} by ${esc(a.publisher)}</span></div>
  <article class="article">${inner}</article>
</div></main>`;
  write(`apps/${a.key}/privacy.html`, layout({ title: `${a.name} — Privacy Policy`, description: `Privacy policy for ${a.name} by ${a.publisher}.`, depth: 2, body, current: 'privacy' }));
}

/* ---------- Support ---------- */
function supportPage(a) {
  const r = '../../';
  const frag = read(path.join(ROOT, 'content', 'support', `${a.key}.html`));
  let inner;
  if (frag) {
    const hasEs = /lang="es"/.test(frag);
    inner = `${hasEs ? `<div class="langs"><a href="#en">English</a><a href="#es">Español</a></div>` : ''}<div id="en"></div>${frag}`;
  } else {
    const faq = (a.support.faq || []).map(f => `<h2>${esc(f.q)}</h2><p>${esc(f.a)}</p>`).join('');
    inner = `<h1>${esc(a.name)} — Support</h1><p class="sub">${esc(a.tagline)}</p>
<div class="box">Questions, feedback, or something not working right? Email <a href="mailto:${esc(a.support.email)}">${esc(a.support.email)}</a> — we read every message. Include your device model and iOS version if you are reporting a problem.</div>
${faq}`;
  }
  const body = `<main><div class="wrap narrow">
  <p class="crumbs"><a href="${r}">Home</a> › <a href="./">${esc(a.name)}</a> › Support</p>
  <div class="mini" style="margin-bottom:16px"><img src="${r}assets/icons/${a.key}.png" alt="" width="36" height="36"><span>${esc(a.name)} by ${esc(a.publisher)}</span></div>
  <article class="article">${inner}</article>
</div></main>`;
  write(`apps/${a.key}/support.html`, layout({ title: `${a.name} — Support`, description: `Help and support for ${a.name}.`, depth: 2, body, current: 'support' }));
}

/* ---------- Hubs ---------- */
function hub(kind) {
  const r = '../';
  const items = data.apps.map(a => `<li><img src="${r}assets/icons/${a.key}.png" alt="" width="44" height="44"><div><a href="${r}apps/${a.key}/${kind}.html">${esc(a.name)}${kind === 'privacy' ? (a.privacy.hasPolicy ? ' — Privacy Policy' : ' — Privacy at a glance') : ' — Support'}</a><div class="meta">${esc(STATUS[a.status].label)} · ${esc(a.publisher)}</div></div></li>`).join('');
  const title = kind === 'privacy' ? 'Privacy' : 'Support';
  const intro = kind === 'privacy' ? org.privacyIntro : org.supportIntro;
  const body = `<main><div class="wrap narrow">
  <h1 style="color:var(--head);font-size:32px;margin:8px 0 8px">${title}</h1>
  <p style="color:var(--mut);margin:0 0 24px">${esc(intro)}</p>
  <div class="card"><ul class="list">${items}</ul></div>
  <div class="card" style="margin-top:18px"><h2>Contact</h2><p style="margin:0">Email <a href="mailto:${esc(org.email)}">${esc(org.email)}</a>.</p></div>
</div></main>`;
  write(`${kind}/index.html`, layout({ title: `${title} — ${org.name}`, description: intro, depth: 1, body, current: kind }));
}

function notFound() {
  const body = `<main><div class="wrap narrow"><div class="card" style="text-align:center;padding:48px 24px"><h1 style="color:var(--head)">Page not found</h1><p style="color:var(--mut)">That page doesn't exist. <a href="/">Back to Monarch Prime Labs</a>.</p></div></div></main>`;
  write('404.html', layout({ title: `Not found — ${org.name}`, description: 'Page not found.', depth: 0, body }));
}

function extras() {
  const base = org.baseUrl.replace(/\/$/, '');
  const urls = pages.filter(p => p !== '404.html').map(p => `${base}/${p.replace(/index\.html$/, '')}`);
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
  fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');
}

home();
for (const a of data.apps) { appPage(a); privacyPage(a); supportPage(a); }
hub('privacy'); hub('support'); notFound(); extras();
console.log(`built ${pages.length} pages`);
