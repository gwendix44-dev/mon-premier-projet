/* JetForm : application d'apprentissage (sans dépendances, fonctionne hors connexion) */
'use strict';

// ---------- Textes de l'interface (FR / EN) ----------
const UI = {
  learn:['Parcours','Path'], review:['Révision','Review'], stats:['Progrès','Progress'], settings:['Réglages','Settings'],
  start:['Commencer','Start'], next:['Continuer','Continue'], check:['Vérifier','Check'], skip:['Passer','Skip'],
  good:['Bravo !','Correct!'], bad:['Pas tout à fait','Not quite'], answer:['Réponse :','Answer:'],
  listen:['Écouter','Listen'], slow:['Plus lent','Slower'], script:['Voir le texte','Show transcript'],
  true:['Vrai','True'], false:['Faux','False'], soon:['Bientôt','Coming soon'], locked:['À débloquer','Locked'],
  done:['Leçon terminée !','Lesson complete!'], xp:['XP gagnés','XP earned'], acc:['Réussite','Accuracy'],
  streak:['jours de suite','day streak'], noReview:['Rien à réviser pour le moment. Revenez après quelques leçons.','Nothing to review right now. Come back after a few lessons.'],
  reviewNow:['Réviser maintenant','Review now'], due:['à réviser','due'],
  level:['Niveau d\'anglais de l\'interface','Interface English level'],
  l1:['1 · Français','1 · French'], l2:['2 · Boutons EN','2 · EN buttons'], l3:['3 · EN + aide','3 · EN + help'], l4:['4 · 100 % EN','4 · 100% EN'],
  unlockAll:['Tout déverrouiller','Unlock everything'], export:['Exporter ma progression','Export my progress'], import:['Importer','Import'], reset:['Tout effacer','Reset everything'],
  verified:['Vérifié','Verified'], langc:['Anglais courant','Everyday English'], tocheck:['À vérifier','To verify'], sources:['Sources','Sources'],
  flags:['Indicateur de fiabilité','Reliability'], badges:['Badges','Badges'], weak:['Points faibles','Weak spots'],
  write:['Écrivez votre réponse…','Type your answer…'], tapPair:['Associez les paires','Match the pairs'], order:['Remettez dans l\'ordre','Put in order'],
  leave:['Quitter la leçon ? Votre progression de cette leçon sera perdue.','Leave the lesson? Progress in this lesson will be lost.'],
  modules:['modules','modules'], lessons:['leçons','lessons'], total:['Total','Total'],
};

// ---------- État sauvegardé sur le téléphone ----------
const KEY = 'jetform.v1';
const fresh = () => ({ xp:0, streak:0, last:null, lang:1, unlockAll:false, done:{}, srs:{}, miss:{}, badges:{} });
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
  kids.flat(Infinity).forEach(c => e.append(c?.nodeType ? c : document.createTextNode(c ?? '')));
  return e;
};
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const today = () => new Date().toISOString().slice(0, 10);
const dayDiff = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5);

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
const liveMods = () => D.modules.filter(m => m.lessons);
function unlocked(m, i) { return S.unlockAll || i === 0 || !!S.done[m.lessons[i - 1].id]; }

// ---------- Série, XP, badges ----------
function touchStreak() {
  const d = today();
  if (S.last === d) return;
  S.streak = S.last && dayDiff(S.last, d) === 1 ? S.streak + 1 : 1;
  S.last = d;
}
function checkBadges() {
  const done = Object.keys(S.done).length;
  const rules = {
    first: ['🎯', 'Première leçon', done >= 1],
    five: ['📚', '5 leçons', done >= 5],
    xp100: ['⭐', '100 XP', S.xp >= 100],
    xp500: ['🌟', '500 XP', S.xp >= 500],
    week: ['🔥', '7 jours de suite', S.streak >= 7],
  };
  for (const m of liveMods()) rules['mod_' + m.id] = ['🏆', 'Module terminé : ' + tr(m.title), m.lessons.every(l => S.done[l.id])];
  const won = [];
  for (const [k, [ic, name, ok]] of Object.entries(rules)) if (ok && !S.badges[k]) { S.badges[k] = { ic, name }; won.push(name); }
  return won;
}

// ---------- Audio ----------
let current = null;
function stopAudio() { if (current) { current.pause(); current = null; } speechSynthesis?.cancel?.(); }
function speakFallback(text, voice, rate) {
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return res();
    const u = new SpeechSynthesisUtterance(text); u.lang = 'en-GB'; u.rate = rate;
    u.pitch = voice === 'm' ? 0.85 : 1.15; u.onend = u.onerror = () => res();
    speechSynthesis.speak(u);
  });
}
async function playScript(lessonId, exIdx, script, rate = 1) {
  stopAudio();
  for (let i = 0; i < script.length; i++) {
    const seg = script[i];
    const ok = await new Promise(res => {
      const a = new Audio(`audio/${lessonId}_${exIdx}_${i}.mp3`);
      a.playbackRate = rate; current = a;
      a.onended = () => res(true); a.onerror = () => res(false);
      a.play().catch(() => res(false));
    });
    if (!ok) await speakFallback(seg.t, seg.v, rate);
    if (current === null && !ok) { /* cancelled */ }
  }
}
function speakWord(text) { stopAudio(); speakFallback(text, 'f', 0.9); }

// ---------- Vues principales ----------
const view = $('#view');
function chrome(active) {
  document.querySelectorAll('#foot').forEach(f => f.remove());
  document.body.classList.remove('in-lesson');
  $('#top').innerHTML = '';
  $('#top').append(el('span', { class: 'logo' }, '✈ JetForm'),
    el('span', { class: 'chips' }, el('span', { class: 'chip' }, '🔥 ' + S.streak), el('span', { class: 'chip' }, '⭐ ' + S.xp)));
  const nav = $('#nav'); nav.innerHTML = '';
  [['home', '🗺️', 'learn'], ['review', '🔁', 'review'], ['stats', '📊', 'stats'], ['settings', '⚙️', 'settings']].forEach(([id, ic, k]) =>
    nav.append(el('button', { class: id === active ? 'on' : '', onclick: () => go(id) }, el('span', {}, ic), t(k))));
}
function go(v) { stopAudio(); ({ home, review: reviewView, stats, settings }[v])(); window.scrollTo(0, 0); }

function dueKeys() { const d = today(); return Object.keys(S.srs).filter(k => S.srs[k].due <= d && exFromKey(k)); }
function exFromKey(k) { const [lid, i] = k.split('#'); return D.lessons[lid]?.ex?.[+i]; }

function home() {
  chrome('home'); view.innerHTML = '';
  view.append(el('h1', {}, S.lang >= 2 ? 'Your learning path' : 'Votre parcours'));
  const offs = [0, 38, 62, 38, 0, -38, -62, -38];
  D.modules.forEach(m => {
    const live = !!m.lessons, nDone = live ? m.lessons.filter(l => S.done[l.id]).length : 0;
    view.append(el('div', { class: 'mod' + (live ? '' : ' soon'), style: `background:${m.color}` },
      el('span', { class: 'ic' }, m.icon),
      el('div', { style: 'flex:1' }, el('b', {}, `${m.n}. ${tr(m.title)}`),
        el('small', {}, live ? `${nDone}/${m.lessons.length} ${t('lessons')}` : t('soon')),
        live ? el('div', { class: 'bar' }, el('i', { style: `width:${100 * nDone / m.lessons.length}%` })) : '')));
    if (!live) { view.append(el('div', { class: 'soonlist' }, '• ' + m.topics.map(tr).join('  • '))); return; }
    const path = el('div', { class: 'path' });
    m.lessons.forEach((l, i) => {
      const open = unlocked(m, i), done = !!S.done[l.id];
      path.append(el('div', { style: `margin-left:${offs[i % offs.length]}px;text-align:center` },
        el('button', { class: 'node' + (open ? '' : ' locked') + (done ? ' done' : ''), style: `background:${m.color}`, onclick: () => open && runLesson(l) }, open ? l.icon : '🔒'),
        el('div', { class: 'nlabel' }, tr(l.title))));
    });
    view.append(path);
  });
}

function reviewView() {
  chrome('review'); view.innerHTML = '';
  const keys = dueKeys();
  view.append(el('h1', {}, t('review')));
  if (!keys.length) { view.append(el('div', { class: 'card' }, t('noReview'))); return; }
  view.append(el('div', { class: 'card' }, el('b', {}, `${keys.length} ${t('due')}`), el('p', { class: 'muted' }, S.lang >= 2 ? 'Questions you missed come back at spaced intervals (1, 3, 7, 14, 30 days).' : 'Les questions ratées reviennent à intervalles espacés (1, 3, 7, 14, 30 jours).')),
    el('button', { class: 'btn', onclick: () => runSession({ id: 'review', icon: '🔁', title: t('review'), cards: [], ex: shuffle(keys).slice(0, 10).map(k => ({ ...exFromKey(k), _key: k })) }) }, t('reviewNow')));
}

function stats() {
  chrome('stats'); view.innerHTML = '';
  const nd = Object.keys(S.done).length;
  view.append(el('h1', {}, t('stats')),
    el('div', { class: 'stats' },
      el('div', { class: 'stat' }, el('b', {}, '⭐ ' + S.xp), 'XP'),
      el('div', { class: 'stat' }, el('b', {}, '🔥 ' + S.streak), t('streak')),
      el('div', { class: 'stat' }, el('b', {}, '✅ ' + nd), t('lessons'))));
  liveMods().forEach(m => {
    const n = m.lessons.filter(l => S.done[l.id]).length;
    view.append(el('div', { class: 'card' }, el('div', { class: 'row' }, el('b', {}, `${m.icon} ${tr(m.title)}`), `${n}/${m.lessons.length}`),
      el('div', { class: 'mini' }, el('i', { style: `width:${100 * n / m.lessons.length}%` }))));
  });
  const weak = Object.values(S.done).length ? Object.entries(S.done).sort((a, b) => a[1].score - b[1].score).filter(([, v]) => v.score < 85).slice(0, 4) : [];
  view.append(el('h2', {}, t('weak')));
  view.append(...(weak.length ? weak.map(([id, v]) => el('div', { class: 'card row' }, el('span', {}, `${D.lessons[id].icon} ${tr(D.lessons[id].title)}`), el('b', {}, v.score + ' %'))) : [el('p', { class: 'muted' }, '—')]));
  view.append(el('h2', {}, t('badges')));
  const bs = Object.values(S.badges);
  view.append(bs.length ? el('div', { class: 'chips-row' }, bs.map(b => el('span', { class: 'chip' }, `${b.ic} ${b.name}`))) : el('p', { class: 'muted' }, '—'));
}

function settings() {
  chrome('settings'); view.innerHTML = '';
  view.append(el('h1', {}, t('settings')), el('div', { class: 'card' }, el('b', {}, t('level')),
    el('div', { class: 'seg' }, [1, 2, 3, 4].map(n => el('button', { class: S.lang === n ? 'on' : '', onclick: () => { S.lang = n; save(); settings(); } }, t('l' + n)))),
    el('p', { class: 'muted' }, S.lang >= 2 ? 'Level 1: all in French. 2: buttons in English. 3: English with French help. 4: English only. Content not yet translated stays in French.' : 'Niveau 1 : tout en français. 2 : boutons en anglais. 3 : anglais avec aide en français. 4 : tout en anglais. Le contenu pas encore traduit reste en français.')));
  view.append(el('div', { class: 'card' }, el('label', { class: 'row' }, el('span', {}, t('unlockAll')), el('input', { type: 'checkbox', ...(S.unlockAll ? { checked: '' } : {}), onchange: e => { S.unlockAll = e.target.checked; save(); } }))));
  const ta = el('textarea', { rows: 4, placeholder: 'JSON' });
  view.append(el('div', { class: 'card' },
    el('button', { class: 'btn ghost', onclick: () => { ta.value = JSON.stringify(S); ta.select(); } }, t('export')),
    el('p', { class: 'muted' }, S.lang >= 2 ? 'Copy this text to keep your progress, then paste it back here to restore it.' : 'Copiez ce texte pour garder votre progression, puis collez-le ici pour la restaurer.'),
    ta,
    el('button', { class: 'btn blue', style: 'margin-top:10px', onclick: () => { try { S = Object.assign(fresh(), JSON.parse(ta.value)); save(); settings(); } catch (e) { alert('JSON ?'); } } }, t('import'))));
  view.append(el('button', { class: 'btn red', onclick: () => { if (confirm(t('reset') + ' ?')) { S = fresh(); save(); settings(); } } }, t('reset')));
}

// ---------- Moteur de leçon ----------
function runLesson(l) { runSession({ ...l, ex: l.ex.map((e, i) => ({ ...e, _key: l.id + '#' + i, _i: i })) }); }

function runSession(L) {
  document.querySelectorAll('#foot').forEach(f => f.remove()); stopAudio();
  document.body.classList.add('in-lesson');
  $('#nav').innerHTML = ''; $('#top').innerHTML = '';
  const total = L.cards.length + L.ex.length;
  const st = { step: 0, first: 0, tries: 0, queue: L.ex.slice(), retried: new Set(), cardIdx: 0, xp: 0, perfect: true, seen: new Set() };
  const foot = el('div', { id: 'foot' }); document.body.append(foot);
  const cleanup = () => { foot.remove(); stopAudio(); };
  const head = () => el('div', { class: 'lhead' }, el('button', { class: 'x', onclick: () => { if (confirm(t('leave'))) { cleanup(); go('home'); } } }, '✕'),
    el('div', { class: 'prog' }, el('i', { style: `width:${100 * st.step / (total + st.retried.size)}%` })));

  function showCard() {
    const c = L.cards[st.cardIdx]; view.innerHTML = ''; foot.className = ''; foot.innerHTML = '';
    const box = el('div', { class: 'lcard' });
    if (c.t) { box.append(el('div', {}, tr(c.t))); if (S.lang === 3 && c.t.fr && c.t.en) box.append(el('div', { class: 'tr' }, c.t.fr)); }
    if (c.vocab) c.vocab.forEach(([en, fr]) => box.append(el('div', { class: 'row', style: 'padding:6px 0;border-bottom:1px solid var(--line)' },
      el('span', {}, el('b', {}, en), el('span', { class: 'muted' }, '  ' + fr)), el('button', { class: 'tile', onclick: () => speakWord(en) }, '🔊'))));
    if (c.svg) box.append(el('img', { src: `assets/svg/${c.svg}.svg`, alt: '' }));
    if (st.cardIdx === 0 && L.id !== 'review') {
      box.append(el('div', { style: 'margin-top:10px' },
        el('span', { class: 'badge ' + (L.conf === 'check' ? 'check' : 'ok') }, L.conf === 'check' ? '⚠ ' + t('tocheck') : L.conf === 'lang' ? '🗣 ' + t('langc') : '✓ ' + t('verified'))));
      if (L.src?.length) box.append(el('div', { class: 'src' }, t('sources') + ' : ', L.src.map((s, i) => [i ? ' · ' : '', el('a', { href: s[1], target: '_blank', rel: 'noopener' }, s[0])])));
    }
    view.append(head(), box);
    foot.append(el('div', { class: 'in' }, el('button', { class: 'btn', onclick: () => { st.step++; st.cardIdx++; st.cardIdx < L.cards.length ? showCard() : nextEx(); } }, t('next'))));
  }

  function nextEx() {
    if (!st.queue.length) return finish();
    showEx(st.queue.shift());
  }

  function showEx(ex) {
    view.innerHTML = ''; foot.className = ''; foot.innerHTML = ''; foot.style.display = '';
    let result = null;           // fonction qui renvoie {ok, correct}
    const body = el('div');
    const btn = el('button', { class: 'btn', disabled: '' }, t('check'));
    const ready = on => on ? btn.removeAttribute('disabled') : btn.setAttribute('disabled', '');
    body.append(el('div', { class: 'q' }, tr(ex.q)));
    let after = null;            // contenu supplémentaire révélé (transcription)

    if (ex.type === 'mcq' || ex.type === 'listen') {
      if (ex.type === 'listen') {
        body.insertBefore(el('button', { class: 'play', onclick: () => playScript(...keyOf(ex), ex.script, 1) }, '🔊 ' + t('listen')), body.firstChild);
        body.insertBefore(el('button', { class: 'play slow', onclick: () => playScript(...keyOf(ex), ex.script, 0.75) }, '🐢 ' + t('slow')), body.children[1]);
        after = el('div', { class: 'script' }, ex.script.map(s => el('div', {}, ex.script.length > 1 ? el('b', {}, (s.v === 'm' ? 'M' : 'F') + ' · ') : '', s.t)));
      }
      let sel = null; const order = ex.opts.map((o, i) => i); const opts = shuffle(order);
      const bs = opts.map(i => el('button', { class: 'opt', onclick: () => { sel = i; bs.forEach(b => b.classList.remove('sel')); bs[opts.indexOf(i)].classList.add('sel'); ready(true); } }, tr(ex.opts[i])));
      body.append(...bs);
      result = () => { bs.forEach((b, k) => { b.disabled = true; if (opts[k] === ex.a) b.classList.add('good'); else if (opts[k] === sel) b.classList.add('bad'); }); return { ok: sel === ex.a, correct: tr(ex.opts[ex.a]) }; };
    } else if (ex.type === 'tf') {
      let sel = null;
      const bs = [true, false].map(v => el('button', { class: 'opt', onclick: () => { sel = v; bs.forEach(b => b.classList.remove('sel')); bs[v ? 0 : 1].classList.add('sel'); ready(true); } }, v ? t('true') : t('false')));
      body.append(...bs);
      result = () => { bs.forEach((b, k) => { b.disabled = true; if ((k === 0) === ex.a) b.classList.add('good'); else if ((k === 0) === sel) b.classList.add('bad'); }); return { ok: sel === ex.a, correct: ex.a ? t('true') : t('false') }; };
    } else if (ex.type === 'order') {
      const chosen = [], pool = shuffle(ex.items.map((x, i) => i));
      const line = el('div', { class: 'answerline' }), bank = el('div', { class: 'chips-row' });
      const draw = () => {
        line.innerHTML = ''; bank.innerHTML = '';
        chosen.forEach(i => line.append(el('button', { class: 'tile', onclick: () => { chosen.splice(chosen.indexOf(i), 1); draw(); } }, tr(ex.items[i]))));
        pool.filter(i => !chosen.includes(i)).forEach(i => bank.append(el('button', { class: 'tile', onclick: () => { chosen.push(i); draw(); } }, tr(ex.items[i]))));
        ready(chosen.length === ex.items.length);
      };
      body.append(line, bank); draw();
      result = () => ({ ok: chosen.every((v, k) => v === k), correct: ex.items.map(tr).join(' → ') });
    } else if (ex.type === 'match') {
      let left = null, mistakes = 0, found = 0;
      const L2 = ex.pairs.map((p, i) => i), R2 = shuffle(L2);
      const lb = L2.map(i => el('button', { class: 'opt', onclick: () => pick('l', i) }, tr(ex.pairs[i][0])));
      const rb = R2.map(i => el('button', { class: 'opt', onclick: () => pick('r', i) }, tr(ex.pairs[i][1])));
      body.append(el('div', { class: 'cols' }, el('div', {}, lb), el('div', {}, rb)));
      function pick(side, i) {
        if (side === 'l') { left = i; lb.forEach(b => b.classList.remove('sel')); lb[i].classList.add('sel'); return; }
        if (left == null) return;
        if (left === i) { lb[i].classList.remove('sel'); lb[i].classList.add('good', 'done'); rb[R2.indexOf(i)].classList.add('good', 'done'); lb[i].disabled = true; rb[R2.indexOf(i)].disabled = true; left = null; found++; if (found === ex.pairs.length) { btn.removeAttribute('disabled'); btn.click(); } }
        else { mistakes++; const b = rb[R2.indexOf(i)]; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 500); }
      }
      btn.style.display = 'none'; foot.style.display = 'none';
      result = () => ({ ok: mistakes === 0, correct: ex.pairs.map(p => tr(p[0]) + ' = ' + tr(p[1])).join(' · ') });
    } else if (ex.type === 'write') {
      const ta = el('textarea', { placeholder: t('write'), oninput: () => ready(ta.value.trim().length > 2) });
      body.append(ta);
      result = () => {
        ta.disabled = true; const norm = x => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); const txt = norm(ta.value);
        const hits = ex.keys.filter(k => k.split('|').some(v => txt.includes(norm(v)))).length;
        return { ok: hits >= (ex.min ?? Math.ceil(ex.keys.length / 2)), correct: tr(ex.model) };
      };
    }
    view.append(head(), body);
    foot.append(el('div', { class: 'in' }, btn));

    btn.onclick = () => {
      const r = result(); btn.style.display = ''; foot.style.display = '';
      const first = !st.retried.has(ex._key) && !st.seen.has(ex._key);
      st.seen.add(ex._key);
      if (r.ok) { if (first) { st.first++; st.xp += 10; } } else { st.perfect = false; st.queue.push(ex); st.retried.add(ex._key); }
      if (first) st.tries++;
      // révision espacée
      if (ex._key) {
        const cur = S.srs[ex._key];
        if (!r.ok) S.srs[ex._key] = { box: 0, due: dayAdd(1) };
        else if (cur && L.id === 'review') { cur.box++; if (cur.box > 4) delete S.srs[ex._key]; else cur.due = dayAdd([1, 3, 7, 14, 30][cur.box]); }
      }
      foot.className = r.ok ? 'good' : 'bad'; foot.innerHTML = '';
      const why = [];
      if (!r.ok) why.push(el('div', {}, el('b', {}, t('answer') + ' '), r.correct));
      if (ex.why) why.push(el('div', {}, tr(ex.why)));
      foot.append(el('div', { class: 'in' }, el('div', { class: 'msg' }, (r.ok ? '✓ ' + t('good') : '✗ ' + t('bad'))), el('div', { class: 'why' }, why),
        el('button', { class: 'btn' + (r.ok ? '' : ' red'), onclick: () => { st.step++; nextEx(); } }, t('next'))));
      if (after) body.append(after);
      if (!r.ok) btn.style.display = 'none';
      save();
    };
  }

  function finish() {
    cleanup();
    const pct = Math.round(100 * st.first / Math.max(1, L.ex.length));
    let bonus = st.perfect ? 20 : 5; const xp = st.xp + bonus;
    let won = [];
    if (L.id !== 'review') { const prev = S.done[L.id]; S.done[L.id] = { score: Math.max(pct, prev?.score ?? 0), date: today() }; }
    S.xp += xp; touchStreak(); won = checkBadges(); save();
    view.innerHTML = ''; document.body.classList.remove('in-lesson');
    view.append(el('div', { class: 'res' }, el('div', { class: 'big' }, pct >= 80 ? '🎉' : '👍'), el('h1', {}, t('done')),
      el('div', { class: 'stats' }, el('div', { class: 'stat' }, el('b', {}, '+' + xp), t('xp')), el('div', { class: 'stat' }, el('b', {}, pct + ' %'), t('acc')), el('div', { class: 'stat' }, el('b', {}, '🔥 ' + S.streak), t('streak'))),
      won.map(w => el('div', { class: 'card' }, '🏅 ' + w)),
      el('button', { class: 'btn', onclick: () => go('home') }, t('next'))));
    chrome('home');
  }

  if (L.cards.length) showCard(); else nextEx();
}
const keyOf = ex => { const [l, i] = ex._key.split('#'); return [l, +i]; };
const dayAdd = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

// ---------- Démarrage ----------
load().then(home).catch(e => { view.textContent = 'Erreur de chargement : ' + e.message; });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
