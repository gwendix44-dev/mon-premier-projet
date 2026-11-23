/* JetForm : application d'apprentissage (sans dépendances, fonctionne hors connexion) */
'use strict';

// ---------- Icônes (traits fins) ----------
const IC = {
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h5v-6h4v6h5V10"/>',
  review: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>',
  chart: '<path d="M4 20V11M10 20V4M16 20v-6M22 20H2"/>',
  sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.500 2-4.500 0 2 1 3 2 3 1-2 1-5 1-8.500z"/>',
  star: '<path d="M12 3l2.700 5.600 6.100.9-4.400 4.300 1 6.100-5.400-2.900-5.400 2.900 1-6.100-4.400-4.300 6.100-.9z"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.500 8.500a5 5 0 0 1 0 7M19 6a8.500 8.500 0 0 1 0 12"/>',
  check: '<path d="M5 12.500l4.500 4.500L19 7.500"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  left: '<path d="M15 5l-7 7 7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  clock: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7.500V12l3 2"/>',
  turtle: '<path d="M3 13c0-4 4-7 9-7s9 3 9 7z"/><path d="M6 13l-2 4M18 13l2 4M10 13l-1 4M14 13l1 4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
};
const icon = (n, s = 20) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.700" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ''}</svg>`;

// ---------- Couvertures illustrées des modules ----------
function cover(kind, color) {
  const g = (a, b) => `<defs><linearGradient id="g${kind}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="150" fill="url(#g${kind})"/>`;
  const grid = '<g stroke="#fff" stroke-opacity=".06">' + Array.from({ length: 9 }, (_, i) => `<path d="M${i * 50} 0V150"/>`).join('') + Array.from({ length: 4 }, (_, i) => `<path d="M0 ${i * 40}H400"/>`).join('') + '</g>';
  const gold = '#d9b565';
  let art = '';
  if (kind === 'bars') {
    art = [40, 62, 54, 88, 76, 108, 124].map((h, i) => `<rect x="${60 + i * 44}" y="${140 - h}" width="22" height="${h}" fill="#fff" fill-opacity="${.10 + i * .02}"/>`).join('') + `<path d="M60 112L104 94 148 100 192 66 236 78 280 44 324 30" fill="none" stroke="${gold}" stroke-width="2.500"/><circle cx="324" cy="30" r="5" fill="${gold}"/>`;
  } else if (kind === 'gauge') {
    const ticks = Array.from({ length: 13 }, (_, i) => { const a = Math.PI + i * Math.PI / 12; const x1 = 200 + 78 * Math.cos(a), y1 = 140 + 78 * Math.sin(a), x2 = 200 + 92 * Math.cos(a), y2 = 140 + 92 * Math.sin(a); return `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`; }).join('');
    art = `<path d="M108 140A92 92 0 0 1 292 140" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>${ticks}<path d="M200 140L248 78" stroke="${gold}" stroke-width="3" stroke-linecap="round"/><circle cx="200" cy="140" r="7" fill="${gold}"/>`;
  } else if (kind === 'tail') {
    art = `<path d="M-10 118C80 96 170 88 260 90C330 92 390 104 420 116" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2"/><text x="200" y="76" text-anchor="middle" font-family="Georgia,serif" font-size="46" letter-spacing="8" fill="none" stroke="${gold}" stroke-width="1.500">F-ABCD</text><path d="M120 126H280" stroke="#fff" stroke-opacity=".2" stroke-dasharray="4 6"/>`;
  } else if (kind === 'turbine') {
    const blades = Array.from({ length: 14 }, (_, i) => `<rect x="196" y="22" width="8" height="46" rx="3" fill="#fff" fill-opacity=".16" transform="rotate(${i * 360 / 14} 200 90)"/>`).join('');
    art = `${blades}<circle cx="200" cy="90" r="70" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="2"/><circle cx="200" cy="90" r="20" fill="none" stroke="${gold}" stroke-width="2.500"/><circle cx="200" cy="90" r="5" fill="${gold}"/>`;
  } else if (kind === 'runway') {
    art = `<path d="M170 150L196 20M230 150L204 20" stroke="#fff" stroke-opacity=".5" stroke-width="2"/><path d="M200 150L200 22" stroke="${gold}" stroke-width="3" stroke-dasharray="14 12"/><path d="M60 150L180 60M340 150L220 60" stroke="#fff" stroke-opacity=".12" stroke-width="1.500"/><circle cx="200" cy="20" r="3" fill="${gold}"/>`;
  } else {
    art = [0, 1, 2, 3, 4].map(i => `<path d="M0 ${60 + i * 16}C60 ${36 + i * 16} 120 ${86 + i * 16} 200 ${60 + i * 16}S340 ${36 + i * 16} 400 ${60 + i * 16}" fill="none" stroke="${i === 2 ? gold : '#fff'}" stroke-opacity="${i === 2 ? 1 : .22}" stroke-width="${i === 2 ? 2.500 : 1.500}"/>`).join('');
  }
  return `<svg viewBox="0 0 400 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g(color, '#0a1426')}${grid}${art}</svg>`;
}

// ---------- Textes de l'interface (FR / EN) ----------
const UI = {
  learn: ['Parcours', 'Path'], review: ['Révision', 'Review'], stats: ['Progrès', 'Progress'], settings: ['Réglages', 'Settings'],
  continue: ['Continuer', 'Continue'], check: ['Vérifier', 'Check'], resume: ['Reprendre', 'Resume'],
  good: ['Bonne réponse', 'Correct'], bad: ['Pas tout à fait', 'Not quite'], answer: ['Réponse attendue', 'Expected answer'],
  listen: ['Écouter', 'Listen'], slow: ['Plus lent', 'Slower'],
  true: ['Vrai', 'True'], false: ['Faux', 'False'], soon: ['À venir', 'Coming soon'],
  done: ['Leçon terminée', 'Lesson complete'], xp: ['XP gagnés', 'XP earned'], acc: ['Réussite', 'Accuracy'],
  days: ['jours de suite', 'day streak'], noReview: ['Rien à réviser pour le moment. Les questions ratées reviendront ici, à intervalles espacés.', 'Nothing to review. Missed questions will come back here at spaced intervals.'],
  reviewNow: ['Lancer la révision', 'Start review'], due: ['à réviser', 'due'],
  level: ['Anglais de l\'interface', 'Interface English level'], theme: ['Thème', 'Theme'],
  l1: ['Français', 'French'], l2: ['Boutons EN', 'EN buttons'], l3: ['EN + aide', 'EN + help'], l4: ['100 % EN', '100% EN'],
  tAuto: ['Auto', 'Auto'], tLight: ['Clair', 'Light'], tDark: ['Sombre', 'Dark'],
  export: ['Exporter ma progression', 'Export my progress'], import: ['Importer', 'Import'], reset: ['Tout effacer', 'Reset everything'],
  verified: ['Contenu vérifié', 'Verified content'], tocheck: ['À vérifier avant usage', 'Verify before use'], langc: ['Anglais courant', 'Everyday English'],
  sources: ['Sources', 'Sources'], weak: ['Points à retravailler', 'Weak spots'], badges: ['Distinctions', 'Awards'],
  write: ['Votre réponse…', 'Your answer…'], number: ['Votre résultat', 'Your result'],
  leave: ['Quitter la leçon ? La progression de cette leçon sera perdue.', 'Leave the lesson? Progress in this lesson will be lost.'],
  lessons: ['leçons', 'lessons'], min: ['min', 'min'], back: ['Retour', 'Back'], yourPath: ['Votre formation', 'Your training'],
  nextLesson: ['Leçon suivante', 'Next lesson'], backModule: ['Retour au module', 'Back to module'], allDone: ['Parcours terminé. Place à la révision.', 'Path complete. Time to review.'],
  tipL: ['Astuce', 'Tip'], warnL: ['Attention', 'Warning'], keyL: ['À retenir', 'Key point'],
  intro: ['Le métier de courtier en jet privé, pas à pas.', 'The private jet broker trade, step by step.'],
  reliab: ['Fiabilité des contenus', 'Content reliability'],
  reliabTxt: ['Chaque leçon indique si son contenu est vérifié ou à vérifier, avec ses sources. Les prix et chiffres sont des ordres de grandeur.', 'Each lesson shows whether its content is verified or to verify, with sources. Prices and figures are orders of magnitude.'],
  stepOf: ['sur', 'of'], none: ['Aucun pour le moment', 'None yet'],
};

// ---------- État sauvegardé sur le téléphone ----------
const KEY = 'jetform.v1';
const fresh = () => ({ xp: 0, streak: 0, last: null, lang: 1, theme: 'auto', done: {}, srs: {}, badges: {} });
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
const save = () => localStorage.setItem(KEY, JSON.stringify(S));

const t = k => UI[k] ? UI[k][S.lang >= 2 ? 1 : 0] : k;
const tr = x => (x == null ? '' : typeof x === 'string' ? x : (S.lang >= 3 && x.en) ? x.en : (x.fr ?? x.en));
const $ = s => document.querySelector(s);
const el = (tag, attrs = {}, ...kids) => {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') e.className = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
};
const ico = (n, s) => el('span', { class: 'ico', html: icon(n, s) });
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const dayAdd = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);
const pad = n => String(n).padStart(2, '0');

function applyTheme() {
  const dark = S.theme === 'dark' || (S.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', dark ? '#0c1424' : '#f4f1ea');
}

// ---------- Données ----------
const D = { modules: [], lessons: {} };
async function load() {
  D.modules = await (await fetch('data/modules.json')).json();
  for (const m of D.modules) {
    if (!m.file) continue;
    m.lessons = await (await fetch(m.file)).json();
    m.lessons.forEach(l => { l.module = m.id; D.lessons[l.id] = l; });
  }
}
const live = () => D.modules.filter(m => m.lessons);
const modOf = id => D.modules.find(m => m.id === id);
const nextLesson = () => { for (const m of live()) for (const l of m.lessons) if (!S.done[l.id]) return l; return null; };

// ---------- Série, XP, distinctions ----------
function touchStreak() {
  const d = today(); if (S.last === d) return;
  S.streak = S.last && dayDiff(S.last, d) === 1 ? S.streak + 1 : 1; S.last = d;
}
function checkBadges() {
  const n = Object.keys(S.done).length;
  const rules = { first: ['Première leçon', n >= 1], five: ['Cinq leçons', n >= 5], ten: ['Dix leçons', n >= 10], xp100: ['100 XP', S.xp >= 100], xp500: ['500 XP', S.xp >= 500], week: ['Sept jours de suite', S.streak >= 7] };
  for (const m of live()) rules['mod_' + m.id] = ['Module terminé : ' + tr(m.title), m.lessons.every(l => S.done[l.id])];
  const won = [];
  for (const [k, [name, ok]] of Object.entries(rules)) if (ok && !S.badges[k]) { S.badges[k] = { name }; won.push(name); }
  return won;
}

// ---------- Audio ----------
let current = null;
function stopAudio() { if (current) { current.pause(); current = null; } window.speechSynthesis?.cancel?.(); }
function speakFallback(text, voice, rate) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = rate; u.pitch = voice === 'm' ? 0.85 : 1.1; u.onend = u.onerror = () => res();
    speechSynthesis.speak(u);
  });
}
async function playScript(lessonId, exIdx, script, rate = 1) {
  stopAudio();
  for (let i = 0; i < script.length; i++) {
    const ok = await new Promise(res => { const a = new Audio(`audio/${lessonId}_${exIdx}_${i}.mp3`); a.playbackRate = rate; current = a; a.onended = () => res(true); a.onerror = () => res(false); a.play().catch(() => res(false)); });
    if (!ok) await speakFallback(script[i].t, script[i].v, rate);
  }
}
const speakWord = text => { stopAudio(); speakFallback(text, 'f', 0.9); };
const keyOf = ex => { const [l, i] = ex._key.split('#'); return [l, +i]; };

// ---------- Cadre : en-tête et navigation ----------
const view = $('#view');
function chrome(active, opts = {}) {
  document.querySelectorAll('#foot').forEach(f => f.remove());
  document.body.classList.remove('in-lesson');
  $('#top').innerHTML = '';
  $('#top').append(
    el('a', { class: 'brand', href: '#/' }, el('span', { class: 'mark' }), 'JETFORM'),
    el('span', { class: 'chips' }, el('span', { class: 'stat-chip' }, ico('flame', 16), S.streak), el('span', { class: 'stat-chip' }, ico('star', 16), S.xp)));
  const nav = $('#nav'); nav.innerHTML = '';
  [['', 'home', 'learn'], ['review', 'review', 'review'], ['stats', 'chart', 'stats'], ['settings', 'sliders', 'settings']].forEach(([r, ic, k]) =>
    nav.append(el('a', { href: '#/' + r, class: r === active ? 'on' : '' }, ico(ic, 22), el('span', {}, t(k)))));
}

// ---------- Routage ----------
function route() {
  stopAudio();
  const [, a, b] = (location.hash || '#/').split('/');
  window.scrollTo(0, 0);
  if (a === 'm' && modOf(b)?.lessons) return moduleView(modOf(b));
  if (a === 'review') return reviewView();
  if (a === 'stats') return statsView();
  if (a === 'settings') return settingsView();
  return home();
}
const go = h => { location.hash = h; };
const nav = h => { if (location.hash === '#' + h) route(); else go(h); };

// ---------- Accueil ----------
function dueKeys() { const d = today(); return Object.keys(S.srs).filter(k => S.srs[k].due <= d && exFromKey(k)); }
function exFromKey(k) { const [lid, i] = k.split('#'); return D.lessons[lid]?.ex?.[+i]; }

function home() {
  chrome(''); view.innerHTML = '';
  const all = live().flatMap(m => m.lessons), nDone = all.filter(l => S.done[l.id]).length, nl = nextLesson();
  view.append(
    el('div', { class: 'eyebrow' }, t('yourPath')),
    el('h1', { class: 'display' }, tr({ fr: 'Courtier en jet privé', en: 'Private jet broker' })),
    el('p', { class: 'lede' }, t('intro')),
    el('div', { class: 'overall' }, el('div', { class: 'bar' }, el('i', { style: `width:${100 * nDone / all.length}%` })), el('span', {}, `${nDone} / ${all.length} ${t('lessons')}`)));
  if (nl) {
    const m = modOf(nl.module);
    view.append(el('button', { class: 'hero', onclick: () => runLesson(nl) },
      el('div', { class: 'hero-art', html: cover(m.cover, m.color) }),
      el('div', { class: 'hero-body' },
        el('div', { class: 'eyebrow gold' }, t('resume') + ' · ' + tr(m.title)),
        el('div', { class: 'hero-title' }, tr(nl.title)),
        el('div', { class: 'hero-meta' }, ico('clock', 15), `${nl.min || 10} ${t('min')}`, el('span', { class: 'go' }, t('continue'), ico('right', 16))))));
  } else view.append(el('div', { class: 'note' }, t('allDone')));
  view.append(el('div', { class: 'section-title' }, t('learn')));
  live().forEach(m => {
    const n = m.lessons.filter(l => S.done[l.id]).length;
    view.append(el('a', { class: 'mcard', href: '#/m/' + m.id },
      el('div', { class: 'cov', html: cover(m.cover, m.color) }, el('span', { class: 'num' }, pad(m.n))),
      el('div', { class: 'mbody' },
        el('div', { class: 'mtitle' }, tr(m.title)),
        el('div', { class: 'mblurb' }, tr(m.blurb)),
        el('div', { class: 'mfoot' }, el('div', { class: 'bar thin' }, el('i', { style: `width:${100 * n / m.lessons.length}%` })), el('span', {}, `${n}/${m.lessons.length}`)))));
  });
  const soon = D.modules.find(m => m.soon);
  if (soon) view.append(el('div', { class: 'section-title' }, tr(soon.title)), el('ul', { class: 'soon' }, soon.topics.map(x => el('li', {}, tr(x)))));
}

function moduleView(m) {
  chrome(''); view.innerHTML = '';
  const n = m.lessons.filter(l => S.done[l.id]).length;
  view.append(
    el('a', { class: 'back', href: '#/' }, ico('left', 18), t('back')),
    el('div', { class: 'banner', html: cover(m.cover, m.color) }, el('span', { class: 'num big' }, pad(m.n))),
    el('h1', { class: 'display sm' }, tr(m.title)),
    el('p', { class: 'lede' }, tr(m.blurb)),
    el('div', { class: 'overall' }, el('div', { class: 'bar' }, el('i', { style: `width:${100 * n / m.lessons.length}%` })), el('span', {}, `${n} / ${m.lessons.length}`)));
  const list = el('div', { class: 'lessons' });
  m.lessons.forEach((l, i) => {
    const d = S.done[l.id];
    list.append(el('button', { class: 'lrow' + (d ? ' done' : ''), onclick: () => runLesson(l) },
      el('span', { class: 'idx' }, pad(i + 1)),
      el('span', { class: 'ltext' }, el('b', {}, tr(l.title)), el('small', {}, [l.sub ? tr(l.sub) + ' · ' : '', `${l.min || 8} ${t('min')}`, l.conf === 'check' ? ' · ' + t('tocheck') : ''].join(''))),
      d ? el('span', { class: 'tick' }, ico('check', 16), d.score + ' %') : ico('right', 18)));
  });
  view.append(list);
}

// ---------- Révision, progrès, réglages ----------
function reviewView() {
  chrome('review'); view.innerHTML = '';
  const keys = dueKeys();
  view.append(el('div', { class: 'eyebrow' }, t('review')), el('h1', { class: 'display sm' }, tr({ fr: 'Réviser ce qui compte', en: 'Review what matters' })));
  if (!keys.length) { view.append(el('div', { class: 'note' }, t('noReview'))); return; }
  view.append(el('div', { class: 'note' }, el('b', {}, `${keys.length} ${t('due')}`), el('p', {}, S.lang >= 2 ? 'Spaced repetition: 1, 3, 7, 14 then 30 days.' : 'Répétition espacée : 1, 3, 7, 14 puis 30 jours.')),
    el('button', { class: 'btn', onclick: () => runSession({ id: 'review', title: t('review'), cards: [], ex: shuffle(keys).slice(0, 10).map(k => ({ ...exFromKey(k), _key: k })) }) }, t('reviewNow')));
}

function statsView() {
  chrome('stats'); view.innerHTML = '';
  const nd = Object.keys(S.done).length;
  view.append(el('div', { class: 'eyebrow' }, t('stats')), el('h1', { class: 'display sm' }, tr({ fr: 'Votre progression', en: 'Your progress' })),
    el('div', { class: 'kpis' }, [[S.xp, 'XP'], [S.streak, t('days')], [nd, t('lessons')]].map(([v, l]) => el('div', { class: 'kpi' }, el('b', {}, v), el('span', {}, l)))));
  live().forEach(m => {
    const n = m.lessons.filter(l => S.done[l.id]).length;
    view.append(el('div', { class: 'row-card' }, el('div', { class: 'row' }, el('b', {}, tr(m.title)), el('span', { class: 'muted' }, `${n}/${m.lessons.length}`)), el('div', { class: 'bar thin' }, el('i', { style: `width:${100 * n / m.lessons.length}%` }))));
  });
  const weak = Object.entries(S.done).filter(([id, v]) => D.lessons[id] && v.score < 85).sort((a, b) => a[1].score - b[1].score).slice(0, 5);
  view.append(el('div', { class: 'section-title' }, t('weak')),
    weak.length ? weak.map(([id, v]) => el('button', { class: 'row-card row link', onclick: () => runLesson(D.lessons[id]) }, el('span', {}, tr(D.lessons[id].title)), el('b', {}, v.score + ' %'))) : el('p', { class: 'muted' }, t('none')));
  const bs = Object.values(S.badges);
  view.append(el('div', { class: 'section-title' }, t('badges')), bs.length ? el('div', { class: 'chips-row' }, bs.map(b => el('span', { class: 'award' }, ico('star', 14), b.name))) : el('p', { class: 'muted' }, t('none')));
}

function settingsView() {
  chrome('settings'); view.innerHTML = '';
  const seg = (items, cur, fn) => el('div', { class: 'seg' }, items.map(([v, label]) => el('button', { class: cur === v ? 'on' : '', onclick: () => fn(v) }, label)));
  view.append(el('div', { class: 'eyebrow' }, t('settings')), el('h1', { class: 'display sm' }, tr({ fr: 'Réglages', en: 'Settings' })),
    el('div', { class: 'panel' }, el('b', {}, t('level')), seg([1, 2, 3, 4].map(n => [n, t('l' + n)]), S.lang, v => { S.lang = v; save(); settingsView(); }),
      el('p', { class: 'muted' }, S.lang >= 2 ? 'Level 1: all French. 2: English buttons. 3: English with French help. 4: English only. Untranslated content stays in French.' : 'Niveau 1 : tout en français. 2 : boutons en anglais. 3 : anglais avec aide en français. 4 : tout en anglais. Le contenu pas encore traduit reste en français.')),
    el('div', { class: 'panel' }, el('b', {}, t('theme')), seg([['auto', t('tAuto')], ['light', t('tLight')], ['dark', t('tDark')]], S.theme, v => { S.theme = v; save(); applyTheme(); settingsView(); })));
  const ta = el('textarea', { rows: 3, placeholder: 'JSON' });
  view.append(el('div', { class: 'panel' }, el('button', { class: 'btn ghost', onclick: () => { ta.value = JSON.stringify(S); ta.select(); } }, t('export')),
    el('p', { class: 'muted' }, S.lang >= 2 ? 'Copy this text to keep your progress, then paste it here to restore it.' : 'Copiez ce texte pour garder votre progression, puis collez-le ici pour la restaurer.'), ta,
    el('button', { class: 'btn ghost', onclick: () => { try { S = Object.assign(fresh(), JSON.parse(ta.value)); save(); applyTheme(); settingsView(); } catch (e) { alert('JSON ?'); } } }, t('import'))),
    el('div', { class: 'panel' }, el('b', {}, t('reliab')), el('p', { class: 'muted' }, t('reliabTxt'))),
    el('button', { class: 'btn danger', onclick: () => { if (confirm(t('reset') + ' ?')) { S = fresh(); save(); applyTheme(); settingsView(); } } }, t('reset')));
}

// ---------- Moteur de leçon ----------
function runLesson(l) { runSession({ ...l, ex: l.ex.map((e, i) => ({ ...e, _key: l.id + '#' + i, _i: i })) }); }

function runSession(L) {
  document.querySelectorAll('#foot').forEach(f => f.remove()); stopAudio();
  document.body.classList.add('in-lesson');
  $('#nav').innerHTML = ''; $('#top').innerHTML = '';
  const total = L.cards.length + L.ex.length;
  const st = { step: 0, first: 0, queue: L.ex.slice(), retried: new Set(), cardIdx: 0, xp: 0, perfect: true, seen: new Set() };
  const foot = el('div', { id: 'foot' }); document.body.append(foot);
  const cleanup = () => { foot.remove(); stopAudio(); };
  const leave = () => { if (confirm(t('leave'))) { cleanup(); document.body.classList.remove('in-lesson'); nav(L.module ? '/m/' + L.module : '/review'); } };
  const head = () => el('div', { class: 'lhead' }, el('button', { class: 'x', 'aria-label': t('back'), onclick: leave }, ico('close', 22)),
    el('div', { class: 'prog' }, el('i', { style: `width:${100 * st.step / (total + st.retried.size)}%` })),
    el('span', { class: 'count' }, `${Math.min(st.step + 1, total)}/${total}`));
  const setFoot = (cls, ...kids) => { foot.className = cls || ''; foot.style.display = ''; foot.innerHTML = ''; foot.append(el('div', { class: 'in' }, ...kids)); };

  function showCard() {
    const c = L.cards[st.cardIdx]; view.innerHTML = '';
    const box = el('article', { class: 'lcard' });
    if (c.label) box.append(el('div', { class: 'eyebrow gold' }, tr(c.label)));
    if (c.t) { box.append(el('p', { class: 'ctext' }, tr(c.t))); if (S.lang === 3 && c.t.fr && c.t.en) box.append(el('p', { class: 'tr' }, c.t.fr)); }
    if (c.vocab) box.append(el('div', { class: 'vocab' }, c.vocab.map(([en, fr]) => el('div', { class: 'vrow' }, el('div', {}, el('b', {}, en), el('small', {}, fr)), el('button', { class: 'round', 'aria-label': t('listen'), onclick: () => speakWord(en) }, ico('sound', 18))))));
    if (c.table) box.append(el('dl', { class: 'tbl' }, c.table.map(([k, v]) => [el('dt', {}, k), el('dd', {}, v)])));
    if (c.bullets) box.append(el('ul', { class: 'bl' }, c.bullets.map(x => el('li', {}, x))));
    if (c.callout) box.append(el('div', { class: 'callout ' + c.callout[0] }, el('b', {}, t(c.callout[0] + 'L')), el('span', {}, c.callout[1])));
    if (c.svg) box.append(el('img', { class: 'fig', src: `assets/svg/${c.svg}.svg`, alt: '' }));
    if (st.cardIdx === 0 && L.id !== 'review') box.append(el('div', { class: 'rel ' + (L.conf || 'ok') }, ico(L.conf === 'check' ? 'info' : 'check', 15), L.conf === 'check' ? t('tocheck') : L.conf === 'lang' ? t('langc') : t('verified')));
    view.append(head(), box);
    setFoot('', el('button', { class: 'btn', onclick: () => { st.step++; st.cardIdx++; st.cardIdx < L.cards.length ? showCard() : nextEx(); } }, t('continue')));
    window.scrollTo(0, 0);
  }

  const nextEx = () => { if (!st.queue.length) return finish(); showEx(st.queue.shift()); window.scrollTo(0, 0); };
  const normNum = s => parseFloat(String(s).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.\-]/g, ''));
  const normTxt = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function showEx(ex) {
    view.innerHTML = '';
    let result = null, after = null;
    const body = el('div', { class: 'ex' });
    const btn = el('button', { class: 'btn', disabled: '' }, t('check'));
    const ready = on => on ? btn.removeAttribute('disabled') : btn.setAttribute('disabled', '');
    if (ex.type === 'listen') {
      body.append(el('button', { class: 'play', onclick: () => playScript(...keyOf(ex), ex.script, 1) }, ico('sound', 22), t('listen')),
        el('button', { class: 'play slow', onclick: () => playScript(...keyOf(ex), ex.script, 0.75) }, ico('turtle', 18), t('slow')));
      after = el('div', { class: 'script' }, ex.script.map(s => el('div', {}, ex.script.length > 1 ? el('b', {}, (s.v === 'm' ? 'M' : 'F') + ' · ') : '', s.t)));
    }
    body.append(el('h2', { class: 'q' }, tr(ex.q)));

    const letters = 'ABCDEFGH';
    if (ex.type === 'mcq' || ex.type === 'listen') {
      let sel = null; const idxs = ex.opts.map((o, i) => i), opts = ex.fixed ? idxs : shuffle(idxs);
      const bs = opts.map((i, k) => el('button', { class: 'opt', onclick: () => { sel = i; bs.forEach(b => b.classList.remove('sel')); bs[k].classList.add('sel'); ready(true); } }, ex.fixed ? null : el('span', { class: 'let' }, letters[k]), el('span', {}, tr(ex.opts[i]))));
      body.append(...bs);
      result = () => { bs.forEach((b, k) => { b.disabled = true; if (opts[k] === ex.a) b.classList.add('good'); else if (opts[k] === sel) b.classList.add('bad'); }); return { ok: sel === ex.a, correct: tr(ex.opts[ex.a]) }; };
    } else if (ex.type === 'tf') {
      let sel = null;
      const bs = [true, false].map((v, k) => el('button', { class: 'opt', onclick: () => { sel = v; bs.forEach(b => b.classList.remove('sel')); bs[k].classList.add('sel'); ready(true); } }, el('span', { class: 'let' }, v ? 'V' : 'F'), el('span', {}, v ? t('true') : t('false'))));
      body.append(...bs);
      result = () => { bs.forEach((b, k) => { b.disabled = true; if ((k === 0) === ex.a) b.classList.add('good'); else if ((k === 0) === sel) b.classList.add('bad'); }); return { ok: sel === ex.a, correct: ex.a ? t('true') : t('false') }; };
    } else if (ex.type === 'num') {
      const inp = el('input', { class: 'numin', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: t('number'), oninput: () => ready(!isNaN(normNum(inp.value))) });
      body.append(el('div', { class: 'numwrap' }, inp, ex.unit ? el('span', { class: 'unit' }, ex.unit) : ''));
      inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !btn.disabled) btn.click(); });
      result = () => { inp.disabled = true; const v = normNum(inp.value); return { ok: Math.abs(v - ex.a) <= (ex.tol || 0) + 1e-9, correct: String(ex.a).replace('.', ',') + (ex.unit ? ' ' + ex.unit : '') }; };
    } else if (ex.type === 'order') {
      const chosen = [], pool = shuffle(ex.items.map((x, i) => i));
      const line = el('div', { class: 'answerline' }), bank = el('div', { class: 'chips-row' });
      const draw = () => {
        line.innerHTML = ''; bank.innerHTML = '';
        chosen.forEach(i => line.append(el('button', { class: 'tile on', onclick: () => { chosen.splice(chosen.indexOf(i), 1); draw(); } }, tr(ex.items[i]))));
        pool.filter(i => !chosen.includes(i)).forEach(i => bank.append(el('button', { class: 'tile', onclick: () => { chosen.push(i); draw(); } }, tr(ex.items[i]))));
        ready(chosen.length === ex.items.length);
      };
      body.append(line, bank); draw();
      result = () => ({ ok: chosen.every((v, k) => v === k), correct: ex.items.map(tr).join(' → ') });
    } else if (ex.type === 'match') {
      let left = null, mistakes = 0, found = 0;
      const L2 = ex.pairs.map((p, i) => i), R2 = shuffle(L2);
      const lb = L2.map(i => el('button', { class: 'opt c', onclick: () => pick('l', i) }, tr(ex.pairs[i][0])));
      const rb = R2.map(i => el('button', { class: 'opt c', onclick: () => pick('r', i) }, tr(ex.pairs[i][1])));
      body.append(el('div', { class: 'cols' }, el('div', {}, ...lb), el('div', {}, ...rb)));
      function pick(side, i) {
        if (side === 'l') { left = i; lb.forEach(b => b.classList.remove('sel')); lb[i].classList.add('sel'); return; }
        if (left == null) return;
        if (tr(ex.pairs[left][1]) === tr(ex.pairs[i][1])) { lb[left].classList.remove('sel'); lb[left].classList.add('good'); rb[R2.indexOf(i)].classList.add('good'); lb[left].disabled = true; rb[R2.indexOf(i)].disabled = true; left = null; found++; if (found === ex.pairs.length) { ready(true); btn.click(); } }
        else { mistakes++; const b = rb[R2.indexOf(i)]; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 500); }
      }
      foot.style.display = 'none';
      result = () => ({ ok: mistakes === 0, correct: ex.pairs.map(p => tr(p[0]) + ' = ' + tr(p[1])).join(' · ') });
    } else if (ex.type === 'write') {
      const ta = el('textarea', { placeholder: t('write'), oninput: () => ready(ta.value.trim().length > 2) });
      body.append(ta);
      result = () => { ta.disabled = true; const txt = normTxt(ta.value); const hits = ex.keys.filter(k => k.split('|').some(v => txt.includes(normTxt(v)))).length; return { ok: hits >= (ex.min ?? Math.ceil(ex.keys.length / 2)), correct: tr(ex.model) }; };
    }
    view.append(head(), body);
    if (ex.type !== 'match') setFoot('', btn); else { foot.innerHTML = ''; foot.className = ''; foot.append(el('div', { class: 'in' }, btn)); foot.style.display = 'none'; }

    btn.onclick = () => {
      const r = result(); foot.style.display = '';
      const first = !st.seen.has(ex._key); st.seen.add(ex._key);
      if (r.ok) { if (first) { st.first++; st.xp += 10; } } else { st.perfect = false; st.queue.push(ex); st.retried.add(ex._key); }
      if (ex._key) {
        const cur = S.srs[ex._key];
        if (!r.ok) S.srs[ex._key] = { box: 0, due: dayAdd(1) };
        else if (cur && L.id === 'review') { cur.box++; if (cur.box > 4) delete S.srs[ex._key]; else cur.due = dayAdd([1, 3, 7, 14, 30][cur.box]); }
      }
      const why = [];
      if (!r.ok) why.push(el('div', { class: 'ans' }, el('b', {}, t('answer') + ' : '), r.correct));
      if (ex.why) why.push(el('div', {}, tr(ex.why)));
      setFoot(r.ok ? 'good' : 'bad', el('div', { class: 'msg' }, ico(r.ok ? 'check' : 'close', 18), r.ok ? t('good') : t('bad')), el('div', { class: 'why' }, why),
        el('button', { class: 'btn' + (r.ok ? '' : ' alt'), onclick: () => { st.step++; nextEx(); } }, t('continue')));
      if (after) body.append(after);
      save();
    };
  }

  function finish() {
    cleanup();
    const pct = Math.round(100 * st.first / Math.max(1, L.ex.length));
    const xp = st.xp + (st.perfect ? 20 : 5);
    if (L.id !== 'review') { const prev = S.done[L.id]; S.done[L.id] = { score: Math.max(pct, prev?.score ?? 0), date: today() }; }
    S.xp += xp; touchStreak(); const won = checkBadges(); save();
    chrome(L.module ? '' : 'review'); view.innerHTML = '';
    const m = L.module ? modOf(L.module) : null, idx = m ? m.lessons.findIndex(x => x.id === L.id) : -1, nxt = m && idx >= 0 ? m.lessons[idx + 1] : null;
    view.append(el('div', { class: 'result' },
      el('div', { class: 'eyebrow gold' }, t('done')), el('h1', { class: 'display' }, tr(L.title)),
      el('div', { class: 'ring' }, el('b', {}, pct + ' %'), el('span', {}, t('acc'))),
      el('div', { class: 'kpis' }, [['+' + xp, t('xp')], [S.streak, t('days')]].map(([v, l]) => el('div', { class: 'kpi' }, el('b', {}, v), el('span', {}, l)))),
      won.map(w => el('div', { class: 'award big' }, ico('star', 16), w)),
      L.src?.length ? el('div', { class: 'sources' }, el('div', { class: 'eyebrow' }, t('sources')), el('ul', {}, L.src.map(s => el('li', {}, el('a', { href: s[1], target: '_blank', rel: 'noopener' }, s[0]))))) : null,
      nxt ? el('button', { class: 'btn', onclick: () => runLesson(nxt) }, t('nextLesson') + ' : ' + tr(nxt.title)) : null,
      el('button', { class: 'btn ghost', onclick: () => nav(m ? '/m/' + m.id : '/review') }, m ? t('backModule') : t('back'))));
  }

  if (L.cards.length) showCard(); else nextEx();
}

// ---------- Démarrage ----------
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', applyTheme);
addEventListener('hashchange', () => { if (!document.body.classList.contains('in-lesson')) route(); });
load().then(route).catch(e => { view.textContent = 'Erreur de chargement : ' + e.message; });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
