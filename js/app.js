/* Guaco Fit — lógica de la app (todo local: localStorage + service worker) */
(function () {
  'use strict';
  const J = window.J;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const nf = (n) => Math.round(n).toLocaleString('es-MX');
  const KEY = 'guacofit.v1';
  const DEF = { profile: { name: '', sex: 'f', age: 30, h: 165, w: 70, gw: 62, act: 1.4, rate: 0.5, lvl: 1, diets: [], excl: '' }, weights: [], log: {}, plan: null, favs: [], shopDone: {}, workouts: 0, mood: 'auto', setup: false, pantry: [], usePantry: false, dv: 2, theme: 'auto', garden: null };
  let S;
  try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); S.profile = Object.assign({}, DEF.profile, S.profile); } catch (e) { S = JSON.parse(JSON.stringify(DEF)); }
  if (!S.garden || typeof S.garden !== 'object') S.garden = {};
  S.garden = Object.assign({ seeds: 5, owned: J.STARTERS.slice(), companion: null, days: {}, weeks: {} }, S.garden);
  if (!S.theme) S.theme = 'auto';
  // Si cambió el catálogo de recetas, los códigos guardados ya no coinciden: se reinicia el plan y las favoritas
  let dataReset = false;
  if (S.dv !== 2) { S.plan = null; S.favs = []; S.dv = 2; dataReset = true; }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('No pude guardar: la memoria del navegador está llena'); } };
  const L = (k = dkey()) => S.log[k] || (S.log[k] = { food: [], water: 0, act: [] });
  const todayIdx = () => (new Date().getDay() + 6) % 7;
  const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const SLOTS = [['desayuno', 'Desayuno', 0.25, '#FFE9A8'], ['comida', 'Comida', 0.35, '#CFF0B8'], ['cena', 'Cena', 0.28, '#E3DAFF'], ['aperitivo', 'Aperitivo', 0.12, '#FFD0DC']];
  const SLOT_ICON = {
    desayuno: '<circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    comida: '<path d="M4 12h16a8 8 0 01-16 0zM8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4"/>',
    cena: '<path d="M20 14.5A8 8 0 019.5 4 8 8 0 1020 14.5z"/>',
    aperitivo: '<path d="M12 6c-2-3-7-2-7 3 0 5 5 10 7 11 2-1 7-6 7-11 0-5-5-6-7-3z"/>',
    postre: '<path d="M12 6c-2-3-7-2-7 3 0 5 5 10 7 11 2-1 7-6 7-11 0-5-5-6-7-3z"/>', bebida: '<path d="M6 4h12l-1.5 16h-9zM7 9h10"/>',
  };
  const CATCOL = { desayuno: '#FFE9A8', comida: '#CFF0B8', cena: '#E3DAFF', aperitivo: '#FFD0DC', postre: '#FFD0DC', bebida: '#BFE6FF' };

  /* ---------- Iconos (SVG de trazo; sin emojis) ---------- */
  const P = { sprout: '<path d="M12 22V12"/><path d="M12 12C12 7 8 4 3 4c0 5 3 8 9 8zM12 14c0-4 3-7 9-7 0 5-3 8-9 8z"/>', palette: '<path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2.5-1.5H18a3 3 0 003-3C21 7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>', home: '<path d="M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/>', book: '<path d="M4 5a2 2 0 012-2h13v17H6a2 2 0 00-2 2z"/><path d="M8 7h7M8 11h5"/>', cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>', bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>', cam: '<path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="12" cy="13" r="3.8"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 5-6 8-6s7 1 8 6"/>', search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', check: '<path d="M5 12.5l5 5L19 7"/>', x: '<path d="M5 5l14 14M19 5L5 19"/>', back: '<path d="M15 5l-7 7 7 7"/>', swap: '<path d="M4 9a8 8 0 0114-3l2 2M20 15a8 8 0 01-14 3l-2-2M20 4v4h-4M4 20v-4h4"/>', cart: '<path d="M3 4h2l2.4 11h11l2-8H6"/><circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/>', star: '<path d="M12 3l2.2 5.3L20 9l-4.3 3.9L17 19l-5-3-5 3 1.3-6.1L4 9l5.8-.7z"/>', heart: '<path d="M12 20s-8-5-8-11a4.5 4.5 0 018-2.5A4.5 4.5 0 0120 9c0 6-8 11-8 11z"/>', plus: '<path d="M12 5v14M5 12h14"/>', trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>', img: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>' };
  const ic = (n, s = 22, w = 2.4, fill = 'none') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n] || (n[0] === 'M' ? `<path d="${n}"/>` : n)}</svg>`;
  const slotIc = (s, sz = 24) => ic(SLOT_ICON[s] || SLOT_ICON.comida, sz, 2.3);
  const dropSvg = '<svg width="26" height="32" viewBox="0 0 26 32" aria-hidden="true"><path d="M13 2C13 2 3 14 3 21a10 10 0 0020 0C23 14 13 2 13 2z"/></svg>';

  /* ---------- Mascota compañera: la elegida en la colección o la de la temática ---------- */
  const compKey = () => S.garden.companion && S.garden.owned.includes(S.garden.companion) ? S.garden.companion : J.themeById(S.theme).comp;
  const mascotName = (k) => (J.MASCOT[k] || J.MASCOT.aguacate).n;
  const seedIc = (n = 16) => `<svg width="${n}" height="${n}" viewBox="0 0 24 24" aria-hidden="true" style="vertical-align:-3px"><path d="M12 3C7 8 5 12 5 15a7 7 0 0014 0c0-3-2-7-7-12z" fill="#C98A4F"/><path d="M12 8c-2 3-3 5-3 7" stroke="#8A5A36" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;

  /* ---------- Cambio de interfaz según la hora ---------- */
  const MOODS = {
    morning: { greet: '¡buenos días!', slot: 'desayuno', acc: 'sprout', toast: 'Buenos días: modo mañana', order: ['say', 'hero', 'now', 'water', 'meals', 'work', 'extra'] },
    lunch: { greet: '¡hora de comer!', slot: 'comida', acc: 'chef', toast: 'Hora de comer: modo almuerzo', order: ['say', 'now', 'hero', 'meals', 'water', 'work', 'extra'] },
    eve: { greet: '¡buena tarde!', slot: 'aperitivo', acc: 'band', toast: 'Buena tarde: modo energía', order: ['say', 'work', 'now', 'hero', 'water', 'meals', 'extra'] },
    night: { greet: '¡buenas noches!', slot: 'cena', acc: 'cap', toast: 'Buenas noches: modo descanso', order: ['say', 'now', 'hero', 'meals', 'extra', 'water', 'work'] },
  };
  function moodNow() {
    if (S.mood !== 'auto' && MOODS[S.mood]) return S.mood;
    const h = new Date().getHours();
    return h >= 5 && h < 11 ? 'morning' : h >= 11 && h < 16 ? 'lunch' : h >= 16 && h < 19 ? 'eve' : 'night';
  }
  let lastMood = null;
  function applyMood() {
    const m = moodNow();
    document.documentElement.dataset.mood = m;
    const tc = $('meta[name=theme-color]'); if (tc) tc.content = m === 'night' ? '#241533' : m === 'lunch' ? '#FFF7CF' : m === 'eve' ? '#FFE3EC' : '#FFF1E6';
    if (lastMood && lastMood !== m) { toast(MOODS[m].toast); if (!$('#player.on')) render(); }
    lastMood = m;
  }

  /* ---------- Cálculos ---------- */
  function targets() {
    const p = S.profile, bmr = 10 * p.w + 6.25 * p.h - 5 * p.age + (p.sex === 'm' ? 5 : -161), tdee = bmr * p.act;
    const kcal = Math.max(p.sex === 'm' ? 1500 : 1200, Math.round((tdee - p.rate * 7700 / 7) / 10) * 10);
    const sp = p.diets.includes('sincarb') ? [0.25, 0.05, 0.7] : p.diets.includes('altaprot') ? [0.35, 0.35, 0.3] : [0.25, 0.45, 0.3];
    return { kcal, p: Math.round(kcal * sp[0] / 4), ch: Math.round(kcal * sp[1] / 4), f: Math.round(kcal * sp[2] / 9), tdee: Math.round(tdee) };
  }
  const totals = (k) => L(k).food.reduce((a, x) => ({ kcal: a.kcal + x.kcal, p: a.p + (x.p || 0), ch: a.ch + (x.ch || 0), f: a.f + (x.f || 0) }), { kcal: 0, p: 0, ch: 0, f: 0 });
  const burned = (k) => L(k).act.reduce((a, x) => a + x.kcal, 0);
  function streak() {
    let n = 0; const d = new Date();
    for (let i = 0; i < 400; i++) { const l = S.log[dkey(d)]; if (l && (l.food.length || l.act.length)) n++; else if (i > 0) break; d.setDate(d.getDate() - 1); }
    return n;
  }
  const kg = () => S.profile.w;
  const lastW = () => (S.weights.length ? S.weights[S.weights.length - 1].w : S.profile.w);

  /* ---------- Utilidades de UI ---------- */
  let tab = 'hoy', mt = 'plan';
  function toast(t) { const e = document.createElement('div'); e.className = 'toast'; e.textContent = t; document.body.appendChild(e); setTimeout(() => e.remove(), 2600); }
  function openSheet(html) { $('#sheet').innerHTML = `<button class="x" data-a="close" aria-label="Cerrar">${ic('x', 18, 3)}</button>` + html; $('#modal').classList.add('on'); $('#sheet').scrollTop = 0; }
  function closeSheet() { $('#modal').classList.remove('on'); }
  function confetti() {
    const c = $('#confetti'), x = c.getContext('2d'); c.width = innerWidth; c.height = innerHeight;
    const cols = ['#7CC35B', '#FF9DB5', '#FFD76A', '#CDBFFF', '#6EC6FF', '#FF7B6B'];
    const ps = Array.from({ length: 90 }, () => ({ x: innerWidth / 2, y: innerHeight * 0.4, vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 13 - 3, r: Math.random() * 6 + 3, c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * 6 }));
    let f = 0;
    (function step() {
      x.clearRect(0, 0, c.width, c.height);
      ps.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.a += 0.2; x.fillStyle = p.c; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); });
      if (++f < 120) requestAnimationFrame(step); else x.clearRect(0, 0, c.width, c.height);
    })();
  }

  /* ---------- Recetas: tarjetas ---------- */
  const SHORT = { vegano: ['Vegano', 't-g'], sincarb: ['Sin carbo', 't-y'], sinazucar: ['Sin azúcar', 't-p'], altaprot: ['Alta proteína', 't-l'], singluten: ['Sin gluten', 't-y'], sinlacteos: ['Sin lácteos', 't-g'] };
  const dietTags = (r) => J.DIETS.filter((d) => SHORT[d[0]] && d[2](r)).slice(0, 3).map((d) => `<span class="tag ${SHORT[d[0]][1]}">${SHORT[d[0]][0]}</span>`).join('');
  function foodArt(cat) {
    const col = { desayuno: ['#FFD76A', '#FF9F43'], comida: ['#7CC35B', '#FF7B6B'], cena: ['#CDBFFF', '#7CC35B'], aperitivo: ['#FF9DB5', '#7CC35B'], postre: ['#FF7B8F', '#FFD76A'], bebida: ['#6EC6FF', '#FF9DB5'] }[cat] || ['#7CC35B', '#FFD76A'];
    if (cat === 'bebida') return `<svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true"><path d="M14 14h32l-4 34a4 4 0 01-4 3H22a4 4 0 01-4-3z" fill="#fff"/><path d="M16 26h28l-2 22H18z" fill="${col[0]}"/><circle cx="36" cy="18" r="6" fill="${col[1]}"/><path d="M40 8l6-5" stroke="#3A2142" stroke-width="3" stroke-linecap="round"/></svg>`;
    if (cat === 'desayuno') return `<svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="31" r="24" fill="#fff"/><circle cx="30" cy="31" r="17" fill="${col[0]}"/><circle cx="30" cy="31" r="7" fill="${col[1]}"/></svg>`;
    if (cat === 'postre') return `<svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true"><path d="M10 30h40l-4 20H14z" fill="#fff"/><path d="M12 30a18 16 0 0136 0z" fill="${col[0]}"/><circle cx="30" cy="14" r="5" fill="#FF7B6B"/></svg>`;
    return `<svg width="56" height="56" viewBox="0 0 60 60" aria-hidden="true"><ellipse cx="30" cy="32" rx="26" ry="10" fill="#fff"/><path d="M6 30a24 22 0 0048 0z" fill="${col[0]}"/><circle cx="22" cy="28" r="5" fill="${col[1]}"/><circle cx="34" cy="26" r="5" fill="#FFD76A"/><circle cx="42" cy="30" r="4" fill="#E4F2A6"/></svg>`;
  }
  function recCard(r, i) {
    const fav = S.favs.includes(r.id);
    return `<div class="rcw"><button class="rc blob2" data-a="rec" data-id="${r.id}" style="animation-delay:${Math.min(i, 8) * 40}ms"><div class="thumb" style="background:${CATCOL[r.cat]}">${foodArt(r.cat)}</div><div class="col"><div class="ttl" style="font-size:15.5px;padding-right:26px">${esc(r.name)}</div><div style="display:flex;gap:6px;flex-wrap:wrap">${dietTags(r)}</div><div class="meta"><span>${r.kcal} kcal</span><span>${r.t} min</span><span>${J.LEVELS[r.lvl]}</span></div></div></button><button class="fav" data-a="fav" data-id="${r.id}" aria-label="Favorita" style="color:${fav ? '#FF5C8A' : 'var(--ink2)'}">${ic('heart', 22, 2.4, fav ? '#FF5C8A' : 'none')}</button></div>`;
  }
  function openRecipe(id, sv = 1) {
    const r = J.recipe(id), f = (x) => Math.round(x * sv * 10) / 10, main = (r.ings.map((i) => J.mascotFor(i.k)).find(Boolean)) || 'aguacate';
    const diets = r.diets.map((d) => J.DIETS.find((x) => x[0] === d)[1]);
    openSheet(`<div style="padding-right:46px"><div class="hand muted" style="font-size:20px;line-height:1">${J.CATS.find((c) => c[0] === r.cat)[1]} · ${J.LEVELS[r.lvl]} · ${r.t} min</div><h2 class="disp" style="font-size:27px;line-height:1.1;margin-top:4px">${esc(r.name)}</h2></div>
      <div class="seg" role="group" aria-label="Porciones">${[0.5, 1, 1.5, 2].map((v) => `<button class="${v === sv ? 'on' : ''}" data-a="rsv" data-id="${id}" data-v="${v}">${v === 1 ? '1 porción' : v + ' porc.'}</button>`).join('')}</div>
      <div class="nut"><div style="background:var(--butter-l)"><b>${Math.round(r.kcal * sv)}</b><span>kcal</span></div><div style="background:var(--avo-l)"><b>${f(r.p)}</b><span>proteína g</span></div><div style="background:var(--lav-l)"><b>${f(r.ch)}</b><span>carbos g</span></div><div style="background:var(--pink-l)"><b>${f(r.f)}</b><span>grasa g</span></div></div>
      <div class="wrapchips">${diets.map((d) => `<span class="tag t-g">${d}</span>`).join('')}</div>
      <div><h3 class="fr" style="font-size:17px;margin-bottom:4px">Ingredientes</h3>${r.ings.map((i) => `<div class="ing"><span>${esc(J.qty(i.k, i.g * sv))}</span></div>`).join('')}</div>
      ${(() => { let n = 0; return r.groups.map((g) => `<div style="display:flex;flex-direction:column;gap:8px"><h3 class="fr" style="font-size:17px">${esc(g.h)}</h3>${g.items.map((t) => `<div class="step"><b>${++n}</b><p>${esc(t)}</p>${J.stepScene(t, main)}</div>`).join('')}</div>`).join(''); })()}
      <div class="grid2"><button class="pill green big" data-a="eat" data-id="${id}" data-v="${sv}">Comí esto</button><button class="pill pink big" data-a="toplan" data-id="${id}" data-v="${sv}">Añadir al plan</button></div>
      <button class="pill soft big" data-a="fav" data-id="${id}" data-sheet="1">${ic('heart', 20, 2.4, S.favs.includes(id) ? '#FF5C8A' : 'none')} ${S.favs.includes(id) ? 'Quitar de favoritas' : 'Guardar en favoritas'}</button>`);
    J.watchScenes($('#sheet'));
  }

  /* ---------- HOY ---------- */
  function planEntry(day, slot) {
    const e = S.plan && S.plan.days[day] && S.plan.days[day][slot]; if (!e) return null;
    const r = J.recipeLite(e.id); return { ...e, r, kcal: Math.round(r.kcal * e.sv) };
  }
  function sayText(m, t, tot) {
    const left = 8 - L().water;
    if (m === 'night') return tot.kcal ? `Hoy sumaste ${nf(tot.kcal)} kcal. ¡Buen trabajo! Ahora a descansar.` : 'Ya es de noche. ¿Registramos lo que comiste hoy?';
    if (m === 'lunch') return left > 3 ? '¡Hora de comer! No olvides tu agua.' : '¡Hora de comer algo rico y ligero!';
    if (m === 'eve') return 'La tarde es perfecta para moverte un poquito.';
    return left > 0 ? `¡Te faltan ${left} vaso${left > 1 ? 's' : ''} de agua para tu meta!` : '¡Meta de agua lista! Eres increíble.';
  }
  function secHero(m, t, tot) {
    const b = burned(), pct = Math.min(1, tot.kcal / t.kcal), C = 364.4, over = tot.kcal > t.kcal;
    const bar = (lab, v, g, col) => `<div><div class="mt"><span>${lab}</span><span>${Math.round(v)} / ${g} g</span></div><div class="bar"><i style="width:${Math.min(100, v / g * 100)}%;background:${col}"></i></div></div>`;
    return `<div class="hero blob"><div class="ringbox"><svg width="138" height="138" viewBox="0 0 138 138" aria-hidden="true"><circle cx="69" cy="69" r="58" fill="#FFF1E6"/><circle cx="69" cy="69" r="58" fill="none" stroke="#fff" stroke-width="16" opacity=".6"/><circle cx="69" cy="69" r="58" fill="none" stroke="${over ? '#C2402F' : '#FF7B6B'}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" transform="rotate(-90 69 69)" style="transition:stroke-dashoffset 1s"/></svg><div class="mid"><div class="disp" style="font-size:34px;line-height:1">${nf(tot.kcal)}</div><div class="fr" style="font-size:12px;font-weight:600;color:#6B5473">de ${nf(t.kcal)} kcal</div></div></div>
      <div class="grow" style="display:flex;flex-direction:column;gap:9px">${bar('Proteína', tot.p, t.p, '#7CC35B')}${bar('Carbohidratos', tot.ch, t.ch, '#CDBFFF')}${bar('Grasas', tot.f, t.f, '#FF9DB5')}<div class="fr" style="font-size:12px;font-weight:600;color:#6B5473">${b ? '+' + nf(b) + ' kcal quemadas hoy' : 'Aún sin ejercicio hoy'}</div></div></div>`;
  }
  function secNow(m) {
    const slot = MOODS[m].slot, nm = SLOTS.find((s) => s[0] === slot)[1], pe = planEntry(todayIdx(), slot);
    if (!pe) return `<div class="mealnow blob2"><div class="hand" style="font-size:20px;line-height:1">${m === 'night' ? 'para cenar' : 'ahora toca'} · ${nm}</div><div class="fr" style="font-weight:600;font-size:17px">Aún no tienes plan para hoy</div><button class="go" data-a="genplan">Crear mi plan semanal</button></div>`;
    const done = L().food.some((x) => x.ref === 'plan:' + slot);
    return `<div class="mealnow blob2"><div class="hand" style="font-size:20px;line-height:1">${m === 'night' ? 'para cenar' : 'ahora toca'} · ${nm}</div><div class="fr" style="font-weight:700;font-size:19px;line-height:1.2">${esc(pe.r.name)}</div><div class="fr" style="font-size:13px;font-weight:600;opacity:.95">${pe.kcal} kcal · ${pe.r.t} min</div><div style="display:flex;gap:8px"><button class="go" data-a="eatslot" data-slot="${slot}">${done ? 'Hecho, desmarcar' : 'Registrar comida'}</button><button class="go" style="background:transparent;color:inherit;box-shadow:none;border:2px solid currentColor" data-a="rec" data-id="${pe.id}">Ver receta</button></div></div>`;
  }
  function secWater() {
    const w = L().water;
    return `<div class="card blob2 water"><div class="fr" style="font-weight:600;font-size:14px;width:56px;line-height:1.1">Agua<br><span class="muted sm" style="font-weight:500">${w} de 8</span></div><div class="drops">${Array.from({ length: 8 }, (_, i) => `<button class="drop ${i < w ? 'on' : ''}" data-a="water" data-i="${i}" aria-label="Vaso ${i + 1}">${dropSvg}</button>`).join('')}</div></div>`;
  }
  function secMeals() {
    return `<div class="rise" style="display:flex;flex-direction:column;gap:10px">${SLOTS.map(([s, nm, , col]) => {
      const pe = planEntry(todayIdx(), s), done = L().food.some((x) => x.ref === 'plan:' + s);
      return `<div class="card blob2 row"><button class="chk ${done ? 'on' : ''}" data-a="eatslot" data-slot="${s}" aria-label="Marcar ${nm}">${done ? ic('check', 24, 3.2) : ''}</button><button class="grow" style="text-align:left;background:none;border:0;padding:0" ${pe ? `data-a="rec" data-id="${pe.id}"` : 'data-a="genplan"'}><div class="hand muted" style="font-size:17px;line-height:1">${nm}${pe && pe.sv !== 1 ? ' · ' + pe.sv + ' porc.' : ''}</div><div class="ttl" style="font-size:15px">${pe ? esc(pe.r.name) : 'Toca para crear tu plan'}</div></button>${pe ? `<div class="fr" style="font-weight:700;font-size:15px;text-align:right">${pe.kcal}<div style="font-size:10.5px;font-weight:500">kcal</div></div>` : ''}</div>`;
    }).join('')}</div>`;
  }
  function secWork() {
    const lv = S.profile.lvl, w = J.WEEK[lv][todayIdx()], done = L().act.some((a) => a.rt);
    if (!w[0]) return `<div class="card blob2 row" style="background:var(--lav)"><div class="grow"><div class="hand" style="font-size:17px;line-height:1;color:#3A2142">hoy toca</div><div class="fr" style="font-weight:600;font-size:16px;color:#3A2142">${w[2]}</div></div></div>`;
    const est = Math.round(w[1] * 60 * 5.5 * kg() / 3600);
    return `<div class="blob2 row" style="background:var(--lav);padding:14px 16px;box-shadow:0 6px 0 var(--lav-d);color:#3A2142">${ic('bolt', 32, 2.2)}<div class="grow"><div class="hand" style="font-size:17px;line-height:1">${done ? '¡rutina lista hoy!' : 'hoy toca'}</div><div class="fr" style="font-weight:600;font-size:16px">${w[2]} · ${w[1]} min · ~${est} kcal</div></div><button class="pill" data-a="startweek">${done ? 'Otra vez' : 'Empezar'}</button></div>`;
  }
  function secExtra() {
    const f = L().food.filter((x) => !x.ref);
    return `<div class="card blob2"><div style="display:flex;justify-content:space-between;align-items:center"><div class="hand muted" style="font-size:20px">otros registros de hoy</div><button class="pill soft" style="padding:7px 12px" data-a="lflog">${ic('plus', 16, 3)} Añadir</button></div>${f.length ? f.map((x) => `<div class="row" style="padding:8px 0;border-bottom:2px dotted var(--line)">${x.thumb ? `<img src="${x.thumb}" width="40" height="40" style="border-radius:14px;object-fit:cover" alt="">` : ''}<div class="grow ttl" style="font-size:14.5px">${esc(x.name)}</div><b class="fr">${Math.round(x.kcal)} kcal</b><button class="swap" data-a="delfood" data-id="${x.id}" aria-label="Borrar">${ic('trash', 16, 2.4)}</button></div>`).join('') : '<div class="muted sm" style="padding-top:6px">Aquí aparecen las comidas que registres: antojos, platillos o ingredientes.</div>'}</div>`;
  }
  let wsel = 'desayuno';
  function hoyCtx(m, M, t, tot) {
    const w = J.WEEK[S.profile.lvl][todayIdx()], pts = Object.keys(S.log).length * 10 + S.garden.owned.length * 25;
    const d = new Date();
    return { m, t, tot, esc, nf, ic, w, name: S.profile.name, greet: M.greet, water: L().water, workDone: L().act.some((a) => a.rt), sel: wsel, pts, lvl: 1 + Math.floor(pts / 100),
      dateTxt: d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }), mas: (k, sz, o) => J.mascot(k, sz, o),
      slots: SLOTS.map(([s, nm]) => ({ s, nm, pe: planEntry(todayIdx(), s), done: L().food.some((x) => x.ref === 'plan:' + s) })) };
  }
  function vHoy() {
    const m = moodNow(), M = MOODS[m], t = targets(), tot = totals();
    if (J.LAYOUT[S.theme]) return J.LAYOUT[S.theme](hoyCtx(m, M, t, tot));
    const sec = {
      say: `<div style="display:flex;align-items:flex-end;gap:8px">${J.mascot(compKey(), 92, { acc: M.acc })}<div class="say hand blob">${sayText(m, t, tot)}</div></div>`,
      hero: secHero(m, t, tot), now: secNow(m), water: secWater(), meals: secMeals(), work: secWork(), extra: secExtra(),
    };
    const nm = S.profile.name ? ', ' + esc(S.profile.name) : '';
    const hi = { morning: 'Hola', lunch: 'A comer', eve: 'Muévete', night: 'Buenas noches' }[m];
    return `<div class="top"><div><div class="hand sub">${M.greet}</div><h1 class="disp">${hi}${m === 'night' || m === 'lunch' ? '' : nm}</h1></div><div style="display:flex;gap:8px"><button class="dot press" style="background:var(--pink);border:4px solid var(--card);box-shadow:0 5px 0 var(--pink-d)" data-a="tab" data-t="temas" aria-label="Temáticas">${ic('palette', 24)}</button><button class="dot press" style="background:var(--lav);border:4px solid var(--card);box-shadow:0 5px 0 var(--lav-d)" data-a="tab" data-t="yo" aria-label="Mi perfil">${ic('user', 24)}</button></div></div>` + M.order.map((k) => sec[k]).join('');
  }

  /* ---------- RECETAS ---------- */
  const R = { cat: '', diets: [], lvl: 0, q: '', seed: 7, cursor: 0, items: [], fav: false, loading: false };
  function vRec() {
    const cats = [['', 'Todas', 'var(--ink)']].concat(J.CATS.map((c) => [c[0], c[1], CATCOL[c[0]]]));
    return `<div class="top"><div><div class="hand sub">elige tu antojo saludable</div><h1 class="disp">Recetas</h1></div><div class="fr" style="background:var(--avo-d);color:#fff;font-weight:600;font-size:12px;padding:7px 12px;border-radius:18px;text-align:center;line-height:1.15">${nf(J.TOTAL)}<br><span style="font-weight:500;font-size:11px">sin internet</span></div></div>
      <label class="search"><span class="muted">${ic('search', 22, 2.6)}</span><input id="q" type="search" placeholder="Busca pollo, aguacate, smoothie…" value="${esc(R.q)}" autocomplete="off"></label>
      <div class="grid2"><button class="chip ${S.usePantry && S.pantry.length ? 'on' : ''}" data-a="usepan" style="padding:11px 14px">Solo con lo que tengo</button><button class="chip" data-a="pantry" style="padding:11px 14px">Mi despensa (${S.pantry.length})</button></div>
      <div class="chips" role="group" aria-label="Categoría">${cats.map((c) => `<button class="chip ${R.cat === c[0] && !R.fav ? 'on' : ''}" style="${R.cat === c[0] && !R.fav ? '' : c[0] ? 'background:' + c[2] + ';color:#3A2142' : ''}" data-a="rcat" data-v="${c[0]}">${c[1]}</button>`).join('')}<button class="chip ${R.fav ? 'on' : ''}" data-a="rfav">Favoritas (${S.favs.length})</button></div>
      <div><div class="hand muted" style="font-size:19px;margin-bottom:6px">tu tipo de dieta</div><div class="wrapchips dietrow">${J.DIETS.map((d) => `<button class="chip ${R.diets.includes(d[0]) ? 'on' : ''}" data-a="rdiet" data-v="${d[0]}">${d[1]}</button>`).join('')}</div></div>
      <div class="row"><div class="fr muted sm" style="font-weight:600">Nivel</div><div class="seg grow">${['Todos', 'Simple', 'Media', 'Compleja'].map((n, i) => `<button class="${R.lvl === i ? 'on' : ''}" data-a="rlvl" data-v="${i}">${n}</button>`).join('')}</div></div>
      <div id="rlist" style="display:flex;flex-direction:column;gap:12px"></div>
      <div class="grid2"><button class="pill soft big" data-a="rmore">Ver más recetas</button><button class="pill pink big" data-a="rshuffle">${ic('swap', 18, 2.6)} Sorpréndeme</button></div>`;
  }
  function loadRec(reset) {
    if (reset) { R.cursor = 0; R.items = []; }
    const box = $('#rlist'); if (!box) return;
    if (R.fav) { R.items = S.favs.map((id) => J.recipeLite(id)); box.innerHTML = R.items.length ? R.items.map(recCard).join('') : '<div class="card blob2 muted" style="text-align:center">Toca el corazón en una receta para guardarla aquí.</div>'; return; }
    const mine = S.usePantry && S.pantry.length;
    const res = mine ? J.searchHave({ have: S.pantry, cat: R.cat, diets: R.diets, lvl: R.lvl, q: R.q, excl: exclList(), seed: R.seed, cursor: R.cursor, limit: 12 }) : J.search({ cat: R.cat, diets: R.diets, lvl: R.lvl, q: R.q, excl: exclList(), seed: R.seed, cursor: R.cursor, limit: 12 });
    R.cursor = res.cursor; R.items = R.items.concat(res.items);
    box.innerHTML = (mine ? `<div class="hand muted" style="font-size:19px">hechas solo con lo que tienes en casa</div>` : '') + (R.items.length ? R.items.map(recCard).join('') : `<div class="card blob2 muted" style="text-align:center">${mine ? 'Con tu despensa no hay recetas con esa mezcla de filtros. Marca más ingredientes en «Mi despensa» o quita algún filtro.' : 'No encontré recetas con esa mezcla. Quita algún filtro.'}</div>`);
  }
  const exclList = () => S.profile.excl.split(',').map((s) => s.trim()).filter(Boolean);

  /* ---------- Mi despensa (qué tengo en casa) ---------- */
  const PAN = [['Proteínas', 'pollo pavo res cerdo molida jamon salmon tilapia camaron atun sardina huevo clara tofu tempeh lenteja garbanzo frijol chicharo'], ['Lácteos', 'yogur cottage feta mozz panela mantequilla ldescremada lalmendra lcoco'], ['Verduras', 'tomate cebolla ajo pepino zanahoria brocoli espinaca calabacin coliflor champi pimiento esparrago berenjena kale lechuga ejote apio nopal chayote elote cilantro aguacate'], ['Frutas', 'platano manzana naranja limon fresa arandano mango frambuesa pina sandia pera kiwi durazno uva papaya melon datil'], ['Granos y panes', 'arroz arrozb quinoa avena pan tortilla pasta pastab camote papa'], ['Despensa', 'caldo almendra nuez chia calabazas linaza mani hummus tahini aceituna coco cacao te cafe miel jengibre menta curcuma proteina']];
  const BASICS = 'huevo jamon pollo atun frijol arroz arrozb pasta pastab tortilla pan papa tomate cebolla ajo zanahoria limon platano manzana avena ldescremada panela aguacate caldo'.split(' ');
  function openPantry() {
    const known = new Set(PAN.flatMap((g) => g[1].split(' '))), rest = Object.keys(J.ING).filter((k) => !known.has(k) && !['aceite', 'agua', 'stevia', 'canela'].includes(k));
    const groups = PAN.concat(rest.length ? [['Otros', rest.join(' ')]] : []);
    openSheet(`<h2 class="disp" style="font-size:28px;padding-right:46px">Mi despensa</h2><div class="muted sm">Marca lo que tienes en casa. Aceite, agua, sal y pimienta ya se dan por hechos. Después usa «Solo con lo que tengo» y verás recetas que puedes cocinar ahora mismo.</div>
      <div class="grid2"><button class="pill soft" data-a="ppreset">Marcar lo básico</button><button class="pill soft" data-a="pclear">Borrar todo</button></div>
      ${groups.map((g) => `<div><div class="hand muted" style="font-size:20px;margin-bottom:4px">${g[0]}</div><div class="wrapchips">${g[1].split(' ').filter((k) => J.ING[k]).map((k) => `<button class="chip ${S.pantry.includes(k) ? 'on' : ''}" data-a="pchk" data-k="${k}">${esc(J.ING[k][0])}</button>`).join('')}</div></div>`).join('')}
      <button class="pill green big" data-a="pdone">Listo (${S.pantry.length} ingredientes)</button>`);
  }
  const reopenPantry = () => { const y = $('#sheet').scrollTop; openPantry(); $('#sheet').scrollTop = y; };

  /* ---------- PLAN ---------- */
  let rnd = Math.random;
  const seedRng = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  function pickFor(cat, kcal, r, used) {
    const seed = Math.floor(r() * 1e7);
    let res = S.usePantry && S.pantry.length ? J.searchHave({ have: S.pantry, cat, diets: S.profile.diets, excl: exclList(), seed, limit: 40, maxScan: 20000 }) : { items: [] };
    if (!res.items.length) res = J.search({ cat, diets: S.profile.diets, excl: exclList(), seed, limit: 40, maxScan: 40000 });
    const c = res.items.filter((x) => x.kcal > 40 && !used.has(x.name)).map((x) => ({ x, d: Math.abs(Math.log(kcal / x.kcal)) })).sort((a, b) => a.d - b.d).slice(0, 6);
    if (!c.length) return null;
    const x = c[Math.floor(r() * c.length)].x; used.add(x.name);
    return { id: x.id, sv: Math.min(3, Math.max(0.5, Math.round(kcal / x.kcal * 4) / 4)) };
  }
  function genPlan() {
    const t = targets(), r = seedRng(Date.now() & 0xffffff), used = new Set();
    S.plan = { seed: Date.now(), days: Array.from({ length: 7 }, () => { const d = {}; SLOTS.forEach(([s, , sh]) => { d[s] = pickFor(s, t.kcal * sh, r, used); }); return d; }) };
    S.shopDone = {}; save();
  }
  let pd = todayIdx();
  function vPlan() {
    const t = targets(), d = S.plan && S.plan.days[pd];
    const dayKcal = d ? SLOTS.reduce((a, s) => a + (planEntry(pd, s[0]) ? planEntry(pd, s[0]).kcal : 0), 0) : 0;
    const dt = new Date(); dt.setDate(dt.getDate() - todayIdx() + pd);
    return `<div class="top"><div><div class="hand sub">semana sin pensarlo</div><h1 class="disp">Mi plan</h1></div><button class="pill pink" data-a="genplan">${ic('star', 18, 2.6)} Generar semana</button></div>
      <div class="days">${DAYS.map((n, i) => { const x = new Date(); x.setDate(x.getDate() - todayIdx() + i); return `<button class="day ${i === pd ? 'on' : ''}" data-a="pday" data-i="${i}"><span>${n}</span><b>${x.getDate()}</b></button>`; }).join('')}</div>
      <div class="grid2"><div class="blob2" style="background:var(--avo-l);padding:10px 14px;box-shadow:0 5px 0 rgba(0,0,0,.08)"><div class="hand" style="font-size:17px;line-height:1">planeado</div><div class="disp" style="font-size:27px">${nf(dayKcal)} <span class="fr" style="font-size:13px">kcal</span></div></div><div class="blob2" style="background:var(--butter);color:#3A2142;padding:10px 14px;box-shadow:0 5px 0 var(--butter-d)"><div class="hand" style="font-size:17px;line-height:1">tu meta</div><div class="disp" style="font-size:27px">${nf(t.kcal)} <span class="fr" style="font-size:13px">kcal</span></div></div></div>
      ${d ? `<div class="rise" style="display:flex;flex-direction:column;gap:10px">${SLOTS.map(([s, nm, , col]) => { const pe = planEntry(pd, s); return `<div class="card blob2 row"><div class="dot" style="background:${col}">${slotIc(s)}</div><button class="grow" style="text-align:left;background:none;border:0;padding:0" ${pe ? `data-a="rec" data-id="${pe.id}"` : ''}><div class="hand muted" style="font-size:17px;line-height:1">${nm}${pe ? ' · ' + pe.sv + ' porc.' : ''}</div><div class="ttl" style="font-size:15px">${pe ? esc(pe.r.name) : 'Sin receta: cambia tus filtros'}</div></button>${pe ? `<div class="fr" style="font-weight:700;font-size:14px;text-align:right">${pe.kcal}<div style="font-size:10.5px;font-weight:500">kcal</div></div>` : ''}<button class="swap" data-a="reroll" data-s="${s}" aria-label="Cambiar receta">${ic('swap', 18, 2.6)}</button></div>`; }).join('')}</div>
      <button class="pill big" style="justify-content:flex-start;border-radius:34px 28px 36px 30px" data-a="shop">${ic('cart', 26)}<span class="grow" style="text-align:left">Lista de compras de la semana</span></button>`
      : `<div class="card blob2" style="text-align:center;display:flex;flex-direction:column;gap:10px;align-items:center">${J.mascot(compKey(), 90, {})}<div class="hand" style="font-size:22px">Aún no tienes plan. ¡${esc(mascotName(compKey()))} te arma una semana completa!</div><button class="pill green big" data-a="genplan">Crear plan semanal</button></div>`}`;
  }
  function shopList() {
    const m = {};
    S.plan.days.forEach((d) => SLOTS.forEach(([s]) => { if (!d[s]) return; const r = J.recipe(d[s].id); r.ings.forEach((i) => { if (['agua', 'stevia'].includes(i.k)) return; m[i.k] = (m[i.k] || 0) + i.g * d[s].sv; }); }));
    const G = { 'Proteínas': 'pollo pavo res cerdo salmon tilapia atun camaron sardina huevo clara tofu tempeh lenteja garbanzo frijol chicharo cottage yogur feta mozz proteina', 'Verduras y frutas': 'brocoli espinaca calabacin coliflor champi pimiento tomate pepino zanahoria esparrago berenjena kale lechuga cebolla ejote apio aguacate fresa arandano manzana platano mango frambuesa pina naranja limon sandia pera kiwi datil jengibre menta', 'Granos y panes': 'arroz quinoa avena pan tortilla pasta camote papa' };
    const out = {}; Object.keys(m).forEach((k) => { const g = Object.keys(G).find((x) => G[x].split(' ').includes(k)) || 'Despensa'; (out[g] = out[g] || []).push([k, m[k]]); });
    return out;
  }
  function openShop() {
    if (!S.plan) return;
    const g = shopList(), plain = [];
    openSheet(`<h2 class="disp" style="font-size:28px;padding-right:46px">Lista de compras</h2>` + Object.keys(g).map((n) => `<div><div class="hand muted" style="font-size:20px">${n}</div>${g[n].sort().map(([k, v]) => { plain.push(`- ${J.ING[k][0]} ${Math.round(v / 10) * 10} g`); const on = S.shopDone[k]; return `<button class="ing" style="width:100%;background:none;border-left:0;border-right:0;border-top:0;text-align:left;${on ? 'opacity:.45;text-decoration:line-through' : ''}" data-a="shopchk" data-k="${k}"><span>${on ? '✓ ' : '○ '}${J.ING[k][0]}</span><span class="muted">${Math.max(10, Math.round(v / 10) * 10)} g</span></button>`; }).join('')}</div>`).join('') + `<button class="pill soft big" data-a="copyshop">Copiar lista</button>`);
    window._shop = plain.join('\n');
  }

  /* ---------- MOVER ---------- */
  const GEN = { goal: 'hiit', level: 1, minutes: 20, equip: 'n' };
  let CUR = null;
  const mn = (s) => Math.floor(s / 60) + ':' + pad(s % 60);
  function vMov() {
    const tabs = [['plan', 'Mi semana'], ['gen', 'Crear rutina'], ['lib', 'Ejercicios'], ['act', 'Actividad']];
    let body = '';
    if (mt === 'plan') {
      const lv = S.profile.lvl;
      body = `<div class="seg" role="group" aria-label="Nivel">${['Principiante', 'Intermedio', 'Avanzado'].map((n, i) => `<button class="${lv === i + 1 ? 'on' : ''}" data-a="lvl" data-v="${i + 1}">${n}</button>`).join('')}</div><div class="rise" style="display:flex;flex-direction:column;gap:10px">${J.WEEK[lv].map((w, i) => `<div class="card blob2 row" ${i === todayIdx() ? 'style="outline:3px solid var(--avo)"' : ''}><div class="dot" style="background:var(--lav)">${ic(w[0] ? 'bolt' : 'heart', 22)}</div><div class="grow"><div class="hand muted" style="font-size:17px;line-height:1">${DAYS[i]}${i === todayIdx() ? ' · hoy' : ''}</div><div class="ttl" style="font-size:15.5px">${w[2]}${w[1] ? ' · ' + w[1] + ' min' : ''}</div></div>${w[0] ? `<button class="pill green" data-a="startday" data-i="${i}">Ir</button>` : ''}</div>`).join('')}</div>`;
    } else if (mt === 'gen') {
      if (!CUR) CUR = J.makeRoutine({ ...GEN, seed: Date.now() });
      const est = Math.round(J.routineKcal(CUR.steps, kg()));
      body = `<div><div class="hand muted" style="font-size:19px;margin-bottom:6px">¿qué quieres lograr?</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${J.GOALS.map((g) => `<button class="goal ${GEN.goal === g[0] ? 'on' : ''}" data-a="ggoal" data-v="${g[0]}">${ic(g[0] === 'mob' ? 'heart' : g[0] === 'low' ? 'M3 17l4-8 4 6 4-10 6 12' : 'bolt', 24, 2.3)}${g[1]}</button>`).join('')}</div></div>
        <div class="row"><span class="fr muted sm" style="font-weight:600;width:52px">Nivel</span><div class="seg grow">${['Fácil', 'Medio', 'Reto'].map((n, i) => `<button class="${GEN.level === i + 1 ? 'on' : ''}" data-a="glvl" data-v="${i + 1}">${n}</button>`).join('')}</div></div>
        <div class="row"><span class="fr muted sm" style="font-weight:600;width:52px">Tiempo</span><div class="seg grow">${[10, 15, 20, 30, 45].map((n) => `<button class="${GEN.minutes === n ? 'on' : ''}" data-a="gmin" data-v="${n}">${n}′</button>`).join('')}</div></div>
        <div class="row"><span class="fr muted sm" style="font-weight:600;width:52px">Equipo</span><div class="seg grow"><button class="${GEN.equip === 'n' ? 'on' : ''}" data-a="geq" data-v="n">Sin equipo</button><button class="${GEN.equip === 'm' ? 'on' : ''}" data-a="geq" data-v="m">Con pesas</button></div></div>
        <div class="card blob2"><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="hand muted" style="font-size:20px">${esc(CUR.name)}</div><div class="fr" style="font-weight:700">${mn(CUR.total)} · ~${est} kcal</div></div>${CUR.steps.filter((s) => s.type !== 'rest').map((s) => `<div class="exr" style="margin-top:6px;box-shadow:none;background:var(--ground)"><span class="tag ${s.type === 'work' ? 't-p' : 't-g'}">${s.type === 'work' ? 'Trabajo' : s.type === 'warm' ? 'Calentar' : 'Estirar'}</span><div class="grow ttl" style="font-size:14.5px">${esc(s.n)}</div><span class="fr muted sm">${s.secs}s</span></div>`).join('')}</div>
        <div class="grid2"><button class="pill soft big" data-a="gnew">${ic('swap', 18, 2.6)} Otra rutina</button><button class="pill green big" data-a="gstart">Empezar</button></div>`;
    } else if (mt === 'lib') {
      const groups = [['cardio', 'Cardio'], ['piernas', 'Piernas y glúteos'], ['empuje', 'Tren superior'], ['core', 'Abdomen'], ['movilidad', 'Movilidad']];
      body = groups.map(([g, n]) => `<div><div class="hand muted" style="font-size:20px;margin-bottom:4px">${n}</div><div style="display:flex;flex-direction:column;gap:6px">${Object.values(J.EX).filter((e) => e[1] === g).map((e) => `<div class="exr"><div class="grow"><div class="ttl" style="font-size:14.5px">${e[0]}</div><div class="muted sm">${e[5]}</div></div><span class="tag t-l">${['', 'Fácil', 'Medio', 'Reto'][e[3]]}</span></div>`).join('')}</div></div>`).join('');
    } else {
      body = `<div class="card blob2" style="display:flex;flex-direction:column;gap:10px"><div class="hand muted" style="font-size:20px">registra una actividad libre</div><div class="grid2"><label class="field">Actividad<select id="actsel">${J.ACT.map((a, i) => `<option value="${i}">${a[0]}</option>`).join('')}</select></label><label class="field">Minutos<input id="actmin" type="number" inputmode="numeric" min="1" value="30"></label></div><button class="pill green big" data-a="actadd">Guardar</button></div>
        <div class="card blob2"><div class="hand muted" style="font-size:20px">hoy</div>${L().act.length ? L().act.map((a, i) => `<div class="row" style="padding:7px 0;border-bottom:2px dotted var(--line)"><div class="grow ttl" style="font-size:14.5px">${esc(a.name)} · ${a.min} min</div><b class="fr">${Math.round(a.kcal)} kcal</b><button class="swap" data-a="actdel" data-i="${i}" aria-label="Borrar">${ic('trash', 16)}</button></div>`).join('') : '<div class="muted sm">Aún nada. ¡Camina un poquito!</div>'}</div>`;
    }
    return `<div class="top"><div><div class="hand sub">¡a mover el esqueleto!</div><h1 class="disp">Mover</h1></div></div><div class="chips" role="tablist">${tabs.map((t) => `<button class="chip ${mt === t[0] ? 'on' : ''}" data-a="mt" data-v="${t[0]}">${t[1]}</button>`).join('')}</div>` + body;
  }

  /* ---------- Reproductor de rutina ---------- */
  let PL = null, wake = null, actx = null, voiceOn = true;
  function beep(f = 880, d = 0.12) { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = f; g.gain.value = 0.15; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + d); } catch (e) { /* sin audio */ } }
  function say(t) { try { if (!voiceOn || !window.speechSynthesis) return; const u = new SpeechSynthesisUtterance(t); u.lang = 'es-MX'; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) { /* sin voz */ } }
  function startPlayer(r) {
    PL = { r, i: 0, left: r.steps[0].secs, paused: false, kcal: 0, secs: 0, t: setInterval(tick, 1000) };
    $('#player').classList.add('on'); document.body.style.overflow = 'hidden';
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then((w) => { wake = w; }).catch(() => {}); } catch (e) { /* sin wake lock */ }
    announce(); drawPlayer();
  }
  function announce() { const s = PL.r.steps[PL.i]; beep(s.type === 'rest' ? 520 : 880, 0.25); say(s.type === 'rest' ? 'Descansa' : s.n); if (navigator.vibrate) navigator.vibrate(s.type === 'rest' ? 80 : 200); }
  function tick() {
    if (!PL || PL.paused) return;
    const s = PL.r.steps[PL.i]; PL.secs++; PL.kcal += s.met * kg() / 3600;
    PL.left--; if (PL.left <= 3 && PL.left > 0) beep(660, 0.08);
    if (PL.left <= 0) { if (PL.i >= PL.r.steps.length - 1) return finishPlayer(true); PL.i++; PL.left = PL.r.steps[PL.i].secs; announce(); }
    drawPlayer();
  }
  function drawPlayer() {
    const { r, i, left, paused } = PL, s = r.steps[i], nx = r.steps.slice(i + 1).find((x) => x.type !== 'rest'), rest = s.type === 'rest', C = 804.2;
    const lab = rest ? 'Descanso' : s.type === 'warm' ? 'Calentamiento' : s.type === 'cool' ? 'Estiramiento' : '¡MUEVE!';
    $('#player').className = 'on' + (rest ? ' rest' : '');
    $('#player').innerHTML = `<div style="display:flex;align-items:center;gap:12px;width:100%;max-width:480px"><button class="ctl" data-a="pclose" style="width:42px;height:42px" aria-label="Salir">${ic('x', 20, 3)}</button><div style="flex:1;text-align:center"><div class="hand" style="font-size:19px;line-height:1;color:#6B5473">rutina de hoy</div><div class="fr" style="font-weight:700;font-size:18px">${esc(r.name)} · ${r.minutes} min</div></div><button class="ctl" data-a="pvoice" style="width:42px;height:42px" aria-label="Voz">${ic(voiceOn ? 'M4 9v6h4l5 4V5L8 9zM16 8a5 5 0 010 8' : 'M4 9v6h4l5 4V5L8 9zM17 9l4 6M21 9l-4 6', 20, 2.6)}</button></div>
      <div class="segs" style="max-width:480px">${r.steps.map((x, k) => `<i class="${k < i ? 'd' : k === i ? 'c' : ''}" ${x.type === 'rest' ? 'style="max-width:6px"' : ''}></i>`).join('')}</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:2px"><div class="fr" style="background:${rest ? '#3E7D2C' : '#FF7B6B'};color:#fff;font-weight:700;font-size:13px;padding:5px 14px;border-radius:16px;letter-spacing:.5px">${lab}</div><h1 class="disp" style="font-size:36px;line-height:1.05;text-align:center;margin-top:6px">${esc(rest ? 'Respira hondo' : s.n)}</h1><p class="hand" style="margin:4px 16px 0;font-size:20px;line-height:1.15;text-align:center;color:#4F3858;max-width:340px">${esc(s.d)}</p></div>
      <div class="stage ${rest ? 'restz' : ''}"><svg class="rg" viewBox="0 0 290 290" aria-hidden="true"><circle cx="145" cy="145" r="128" fill="#fff" opacity=".55"/><circle cx="145" cy="145" r="128" fill="none" stroke="#fff" stroke-width="16"/><circle cx="145" cy="145" r="128" fill="none" stroke="${rest ? '#3E7D2C' : '#FF7B6B'}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - left / s.secs)}" transform="rotate(-90 145 145)" style="transition:stroke-dashoffset 1s linear"/><path class="sp" d="M40 60l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" fill="#FFD76A"/><path class="sp" style="animation-delay:-.6s" d="M250 70l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#fff"/></svg>${J.mascot(compKey(), 120, { acc: rest ? 'cap' : 'band', cls: 'jack', anim: null })}<div style="position:absolute;bottom:-6px;background:#3A2142;color:#fff;border-radius:26px;padding:6px 20px 4px;display:flex;align-items:baseline;gap:6px"><span class="disp" style="font-size:40px;line-height:1">${left}</span><span class="fr" style="font-size:14px;font-weight:600">segundos</span></div></div>
      <div style="background:rgba(255,255,255,.8);border-radius:28px;padding:10px 16px;display:flex;align-items:center;gap:10px;width:100%;max-width:480px;margin-top:6px"><div class="hand" style="font-size:19px;color:#6B5473">Sigue:</div><div class="fr grow" style="font-weight:600;font-size:16px">${nx ? esc(nx.n) : '¡Terminas!'}</div><div class="fr sm" style="font-weight:600;color:#6B5473">${Math.round(PL.kcal)} kcal · ${mn(PL.secs)}</div></div>
      <div style="display:flex;align-items:center;justify-content:center;gap:22px;margin-top:auto"><button class="ctl" data-a="pprev" style="width:58px;height:58px" aria-label="Anterior">${ic('M6 5h2.5v14H6zM20 5v14L9.5 12z', 26, 1, '#3A2142')}</button><button class="ctl" data-a="ppause" style="width:90px;height:90px;background:#3E7D2C;box-shadow:0 7px 0 #2B5A1D;color:#fff" aria-label="${paused ? 'Continuar' : 'Pausar'}">${paused ? ic('M7 4l13 8-13 8z', 38, 1, '#fff') : ic('<rect x="5" y="4" width="5" height="16" rx="2"/><rect x="14" y="4" width="5" height="16" rx="2"/>', 38, 1, '#fff')}</button><button class="ctl" data-a="pnext" style="width:58px;height:58px" aria-label="Saltar">${ic('M15.5 5H18v14h-2.5zM4 5v14l10.5-7z', 26, 1, '#3A2142')}</button></div>`;
  }
  function stopPlayer() { if (PL) clearInterval(PL.t); PL = null; $('#player').classList.remove('on'); document.body.style.overflow = ''; try { wake && wake.release(); } catch (e) { /* ok */ } wake = null; try { speechSynthesis.cancel(); } catch (e) { /* ok */ } }
  function finishPlayer(done) {
    const p = PL, min = Math.max(1, Math.round(p.secs / 60)); stopPlayer();
    if (p.secs < 20) return render();
    L().act.push({ name: p.r.name + ' (rutina)', min, kcal: p.kcal, rt: 1 }); S.workouts++; save(); render();
    if (done) { confetti(); beep(988, 0.3); }
    toast(`${done ? '¡Rutina completa! ' : ''}${min} min · ${Math.round(p.kcal)} kcal`);
  }

  /* ---------- Registrar una comida libre (platillos, antojos e ingredientes con porciones) ---------- */
  const food = (k) => J.foodOf(k);
  const LF = { k: null, n: 1 };
  const fmt = (n) => (Math.round(n * 2) / 2).toString().replace('.5', '½').replace(/^0½$/, '½');
  function foodRows(q) {
    const t = q.trim().toLowerCase(), all = Object.keys(J.DISH).map((k) => [k, J.DISH[k], 'Platillo']).concat(Object.keys(J.ING).filter((k) => J.ING[k][1] > 5).map((k) => [k, J.ING[k], 'Ingrediente']));
    const rec = (S.recentFood || []).filter((k) => food(k)).map((k) => [k, food(k), 'Reciente']);
    const rows = t ? all.filter((r) => r[1][0].toLowerCase().includes(t)) : rec.concat(all.filter((r) => r[2] === 'Platillo'));
    return rows.slice(0, 40).map((r) => `<button class="exr press" style="width:100%;text-align:left" data-a="lfpick" data-k="${r[0]}"><div class="grow"><div class="ttl" style="font-size:14.5px">${esc(r[1][0])}</div><div class="muted sm">${r[1][8] ? '1 ' + r[1][7] + ' ≈ ' + r[1][8] + ' g · ' : ''}${Math.round(r[1][1])} kcal por 100 g</div></div><span class="tag t-l">${r[2]}</span></button>`).join('') || '<div class="muted sm">No encontré eso. Prueba con otra palabra, como «pastel», «taco» o «pollo».</div>';
  }
  function openFoodLog() {
    openSheet(`<h2 class="disp" style="font-size:26px;padding-right:46px">¿Qué comiste?</h2><label class="search"><span class="muted">${ic('search', 22, 2.6)}</span><input id="fq" type="search" placeholder="pastel, tacos, pizza, pollo, arroz…" autocomplete="off"></label><div id="fres" style="display:flex;flex-direction:column;gap:6px">${foodRows('')}</div><button class="pill soft big" data-a="quickadd">Escribir las calorías a mano</button>`);
    const q = $('#fq'); q.addEventListener('input', () => { $('#fres').innerHTML = foodRows(q.value); });
  }
  function openFoodPortion() {
    const d = food(LF.k), unit = d[8] || 0, g = unit ? Math.round(LF.n * unit) : Math.round(LF.n), x = g / 100;
    openSheet(`<h2 class="disp" style="font-size:24px;padding-right:46px;line-height:1.1">${esc(d[0])}</h2>
      <div class="row" style="justify-content:center;gap:18px"><button class="swap press" style="width:48px;height:48px;font-size:24px" data-a="lfn" data-d="-1" aria-label="Menos">−</button><div style="text-align:center;min-width:130px"><div class="disp" style="font-size:40px;line-height:1">${unit ? fmt(LF.n) : g}</div><div class="fr muted sm">${unit ? d[7] + (LF.n === 1 ? '' : 's') + ' · ' + g + ' g' : 'gramos'}</div></div><button class="swap press" style="width:48px;height:48px;font-size:24px" data-a="lfn" data-d="1" aria-label="Más">+</button></div>
      <div class="nut"><div style="background:var(--butter-l)"><b>${Math.round(d[1] * x)}</b><span>kcal</span></div><div style="background:var(--avo-l)"><b>${Math.round(d[2] * x)}</b><span>proteína g</span></div><div style="background:var(--lav-l)"><b>${Math.round(d[3] * x)}</b><span>carbos g</span></div><div style="background:var(--pink-l)"><b>${Math.round(d[4] * x)}</b><span>grasa g</span></div></div>
      <div class="muted sm">Calorías aproximadas: dependen de cómo esté preparado y del tamaño real de la porción.</div>
      <button class="pill green big" data-a="lfsave">Guardar en mi día</button>`);
  }

  /* ---------- Mi Huerta: hábitos, arcoíris de frutas y verduras, y colección de mascotas ---------- */
  const gday = (k = dkey()) => S.garden.days[k] || (S.garden.days[k] = { h: {}, c: {}, a: {} });
  const colorTotal = (k) => Object.values(gday(k).c).reduce((a, b) => a + b, 0);
  const HAB = [
    ['agua', 'Tomé mis 8 vasos de agua', 'auto', (k) => L(k).water >= 8],
    ['arco', 'Comí 5 porciones de frutas y verduras', 'auto', (k) => colorTotal(k) >= 5],
    ['mover', 'Me moví 30 minutos o más', 'auto', (k) => L(k).act.reduce((a, x) => a + x.min, 0) >= 30],
    ['registro', 'Registré mis comidas del día', 'auto', (k) => L(k).food.length >= 3],
    ['sinazucar', 'Sin refrescos ni jugos azucarados', 'manual'],
    ['despacio', 'Comí despacio y sin pantallas', 'manual'],
    ['dormi', 'Dormí 7 horas o más', 'manual'],
    ['cena', 'Cené 2 horas antes de dormir', 'manual'],
  ];
  const habDone = (h, k = dkey()) => (h[2] === 'auto' ? h[3](k) : !!gday(k).h[h[0]]);
  const colorGroup = (ing) => { const m = J.mascotFor(ing); if (!m || !['frutas', 'verduras'].includes(J.MASCOT[m].grp)) return null; const r = J.RAINBOW.find((c) => c[3].includes(m)); return r ? r[0] : null; };
  const colorsOf = (r) => { const o = {}; r.ings.forEach((i) => { const c = colorGroup(i.k); if (c) o[c] = (o[c] || 0) + 1; }); return o; };
  const addColors = (o, sign, day) => { const d = gday(day); Object.keys(o || {}).forEach((c) => { d.c[c] = Math.max(0, (d.c[c] || 0) + sign * o[c]); }); };
  const weekDates = () => { const d = new Date(); d.setDate(d.getDate() - todayIdx()); return Array.from({ length: 7 }, (_, i) => { const x = new Date(d); x.setDate(d.getDate() + i); return dkey(x); }); };
  const weekKey = () => { const d = new Date(), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())); t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7)); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)); return t.getUTCFullYear() + '-' + Math.ceil(((t - y0) / 864e5 + 1) / 7); };
  const CHAL = [
    ['Cinco días con 5 frutas y verduras', 5, (ds) => ds.filter((k) => colorTotal(k) >= 5).length],
    ['Meta de agua los 7 días', 7, (ds) => ds.filter((k) => L(k).water >= 8).length],
    ['Tres rutinas de ejercicio esta semana', 3, (ds) => ds.reduce((a, k) => a + L(k).act.filter((x) => x.rt).length, 0)],
    ['Prueba los 6 colores del arcoíris', 6, (ds) => new Set(ds.flatMap((k) => Object.keys(gday(k).c).filter((c) => gday(k).c[c] > 0))).size],
    ['Cinco días sin bebidas azucaradas', 5, (ds) => ds.filter((k) => gday(k).h.sinazucar).length],
    ['Registra tus comidas cinco días', 5, (ds) => ds.filter((k) => L(k).food.length >= 3).length],
  ];
  function challenge() { const wk = weekKey(), i = (parseInt(wk.split('-')[1], 10) || 0) % CHAL.length, c = CHAL[i]; return { wk, title: c[0], goal: c[1], n: Math.min(c[1], c[2](weekDates())) }; }
  // Otorga semillas por cada hábito logrado (una sola vez por día), bonus por día completo y premio del reto semanal
  function syncSeeds() {
    const k = dkey(), d = gday(k); let gain = 0, msg = [];
    HAB.forEach((h) => { if (habDone(h, k) && !d.a[h[0]]) { d.a[h[0]] = 1; gain += 1; } });
    if (HAB.every((h) => habDone(h, k)) && !d.a.bonus) { d.a.bonus = 1; gain += 3; msg.push('¡Día perfecto!'); setTimeout(confetti, 250); }
    const ch = challenge(); if (ch.n >= ch.goal && !S.garden.weeks[ch.wk]) { S.garden.weeks[ch.wk] = 1; gain += 10; msg.push('¡Reto semanal cumplido!'); setTimeout(confetti, 250); }
    if (gain) { S.garden.seeds += gain; save(); toast((msg.length ? msg.join(' ') + ' ' : '') + '+' + gain + (gain === 1 ? ' semilla' : ' semillas')); }
  }
  function vHuerta() {
    syncSeeds();
    const g = S.garden, d = gday(), done = HAB.filter((h) => habDone(h)).length, ch = challenge(), tot = colorTotal(dkey());
    const owned = g.owned.filter((k) => J.MASCOT[k] && J.MASCOT[k].cost < 99);
    return `<div class="top"><div><div class="hand sub">tus hábitos hacen crecer amigos</div><h1 class="disp">Mi Huerta</h1></div><div class="seedpill blob2">${seedIc(26)}<b class="disp">${g.seeds}</b><span class="fr">semillas</span></div></div>
      <div class="plot blob"><div class="plot-row">${owned.slice(0, 14).map((k, i) => `<div class="plant" style="animation-delay:${i * 60}ms"><button class="plantb" data-a="mdetail" data-k="${k}" aria-label="${esc(mascotName(k))}">${J.mascot(k, 58, { acc: k === compKey() ? 'crown' : null })}</button></div>`).join('')}</div><div class="soil"></div><div class="hand plot-txt">${owned.length} ${owned.length === 1 ? 'amigo' : 'amigos'} en tu huerta · toca uno para conocerlo</div></div>
      <div class="card blob2"><div class="row"><div class="hand muted grow" style="font-size:21px">hábitos de hoy</div><b class="disp" style="font-size:24px">${done}/${HAB.length}</b></div><div class="bar bar-s"><i style="width:${done / HAB.length * 100}%;background:var(--avo)"></i></div>
        <div class="habits rise">${HAB.map((h) => { const on = habDone(h); return `<button class="habit press ${on ? 'on' : ''}" data-a="habit" data-id="${h[0]}"><span class="chk ${on ? 'on' : ''}">${on ? ic('check', 22, 3.2) : ''}</span><span class="grow ttl" style="font-size:15px;text-align:left">${h[1]}</span>${h[2] === 'auto' ? '<span class="tag t-l">automático</span>' : ''}</button>`; }).join('')}</div>
        <div class="muted sm" style="margin-top:6px">Cada hábito da 1 semilla. Si logras los ${HAB.length}, ganas 3 extra.</div></div>
      <div class="card blob2"><div class="row"><div class="hand muted grow" style="font-size:21px">arcoíris de hoy</div><b class="disp" style="font-size:24px">${tot}/5</b></div><div class="bar bar-s"><i style="width:${Math.min(100, tot / 5 * 100)}%;background:var(--pink)"></i></div>
        <div class="rbgrid">${J.RAINBOW.map((c) => `<div class="rbt" style="--rc:${c[2]}"><button class="rbb press" data-a="rb" data-c="${c[0]}" aria-label="Sumar una porción ${c[1]}"><span class="rbdot">${J.mascot(c[3][0], 34, { anim: null })}</span><span class="fr rbn">${gday().c[c[0]] || 0}</span></button><div class="fr rbl">${c[1]}</div><div class="muted rbs">${c[4]}</div><button class="rbm" data-a="rbm" data-c="${c[0]}" aria-label="Quitar una porción ${c[1]}">−</button></div>`).join('')}</div>
        <div class="muted sm" style="margin-top:6px">Toca un color cada vez que comas una porción de fruta o verdura de ese color. Las recetas que registras suman solas.</div></div>
      <div class="card blob2"><div class="hand muted" style="font-size:21px">reto de la semana</div><div class="ttl" style="font-size:17px;margin:2px 0 8px">${esc(ch.title)}</div><div class="bar bar-s"><i style="width:${ch.n / ch.goal * 100}%;background:var(--butter)"></i></div><div class="row" style="margin-top:6px"><span class="fr sm" style="font-weight:600">${ch.n} de ${ch.goal}</span><span class="grow"></span><span class="tag t-y">${g.weeks[ch.wk] ? 'Premio recibido' : 'Premio: 10 semillas'}</span></div></div>
      <div><div class="row"><div class="hand muted grow" style="font-size:21px">colección</div><span class="fr sm muted">${owned.length} de ${J.COLLECT.length}</span></div>
        <div class="coll">${J.COLLECT.map((m) => { const own = g.owned.includes(m.k), can = !own && g.seeds >= m.cost; return `<button class="cm press ${own ? 'own' : ''} ${can ? 'can' : ''}" data-a="mdetail" data-k="${m.k}" aria-label="${esc(m.n)}${own ? '' : ', bloqueada'}">${own ? J.mascot(m.k, 62, {}) : J.mascotLocked(m.k, 62)}<span class="cmn fr">${own ? esc(m.n) : '<span class="seedcost">' + seedIc(13) + m.cost + '</span>'}</span></button>`; }).join('')}</div></div>`;
  }
  function openMascot(k) {
    const m = J.MASCOT[k], g = S.garden, own = g.owned.includes(k), need = Math.max(0, m.cost - g.seeds);
    openSheet(`<div style="text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:8px"><div class="hand muted" style="font-size:20px;line-height:1">${m.grp === 'frutas' ? 'fruta' : m.grp === 'verduras' ? 'verdura' : 'ingrediente'}${own ? '' : ' · bloqueada'}</div><div class="disp" style="font-size:34px;line-height:1.1">${own ? esc(m.n) : '???'}</div>
      <div class="mbig">${own ? J.mascot(k, 150, { mood: 'wow' }) : J.mascotLocked(k, 150)}</div>
      ${own ? `<div class="card blob2" style="text-align:left"><div class="hand muted" style="font-size:19px;line-height:1">dato curioso</div><div style="margin-top:4px">${esc(m.fact)}</div></div>
        <button class="pill ${compKey() === k ? 'soft' : 'green'} big" data-a="setcomp" data-k="${k}">${compKey() === k ? 'Es tu compañero' : 'Hacerlo mi compañero'}</button>`
        : `<div class="muted">Se desbloquea con ${seedIc(16)} <b>${m.cost} semillas</b>. ${need ? 'Te faltan ' + need + ': logra tus hábitos de hoy.' : '¡Ya te alcanza!'}</div><button class="pill green big" data-a="unlock" data-k="${k}" ${need ? 'disabled style="opacity:.5"' : ''}>Desbloquear por ${m.cost} semillas</button>`}</div>`);
  }

  /* ---------- TEMÁTICAS ---------- */
  const themeGrid = () => `${J.THEMES.map((t) => `<button class="tcard press ${S.theme === t.id ? 'on' : ''}" data-a="theme" data-id="${t.id}" style="background:${t.pv.bg};color:${t.pv.ink}" aria-pressed="${S.theme === t.id}"><div class="tmas">${t.set.slice(0, 3).map((k, i) => J.mascot(k, 44, {})).join('')}</div><div class="tname" style="font-family:${t.pv.fd}">${esc(t.name)}</div><div class="tsub" style="font-family:${t.pv.fb}">${esc(t.blurb)}</div><span class="ttag" style="background:${t.pv.acc}">${esc(t.pv.t)}</span>${S.theme === t.id ? `<span class="tcheck" style="background:${t.pv.acc}">${ic('check', 16, 3.4)}</span>` : ''}</button>`).join('')}`;
  function vTemas() {
    return `<div class="top"><div><div class="hand sub">cambia todo: colores, letras, menú y fondo</div><h1 class="disp">Temáticas</h1></div><button class="dot press" style="background:var(--card);box-shadow:0 4px 0 var(--shadow)" data-a="tab" data-t="hoy" aria-label="Volver">${ic('back', 22, 3)}</button></div>
      <div class="themes rise">${themeGrid()}</div><button class="pill soft big" data-a="fx">Fondo animado: ${S.fx === 'lite' ? 'apagado (más rápido)' : 'encendido'}</button>`;
  }

  /* ---------- YO ---------- */
  function lineChart() {
    const ws = S.weights.slice(-8); if (ws.length < 2) return '<div class="muted sm" style="padding:14px 4px">Registra tu peso al menos dos veces para ver tu gráfica.</div>';
    const vals = ws.map((x) => x.w), gw = S.profile.gw, lo = Math.floor(Math.min(...vals, gw) - 0.5), hi = Math.ceil(Math.max(...vals) + 0.5), W = 350, Hh = 150, x0 = 36, x1 = 336, y0 = 14, y1 = 126;
    const X = (i) => x0 + (x1 - x0) * i / (ws.length - 1), Y = (v) => y0 + (hi - v) / (hi - lo) * (y1 - y0);
    const pts = ws.map((p, i) => [X(i), Y(p.w)]), path = pts.map((p) => p.join(',')).join(' ');
    const ticks = []; for (let v = lo; v <= hi; v += Math.max(1, Math.round((hi - lo) / 4))) ticks.push(v);
    return `<svg width="100%" viewBox="0 0 ${W} ${Hh}" role="img" aria-label="Peso de ${vals[0]} a ${vals[vals.length - 1]} kilos" style="display:block">${ticks.map((v) => `<path d="M${x0} ${Y(v)}H${x1}" stroke="currentColor" stroke-opacity=".12" stroke-width="1.5"/><text x="28" y="${Y(v) + 4}" text-anchor="end" font-family="Fredoka" font-size="11" font-weight="600" fill="currentColor" opacity=".65">${v}</text>`).join('')}<path d="M${x0} ${Y(gw)}H${x1}" stroke="#FF7B6B" stroke-width="2.5" stroke-dasharray="6 6" stroke-linecap="round"/><text x="${x1}" y="${Y(gw) - 5}" text-anchor="end" font-family="Caveat Brush" font-size="16" fill="#FF7B6B">meta ${gw}</text><path d="M${path.replace(/ /g, 'L')}L${pts[pts.length - 1][0]},${y1}L${x0},${y1}z" fill="#7CC35B" opacity=".18"/><polyline points="${path}" fill="none" stroke="var(--avo-d)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" style="stroke:#5FAE3F"/><circle cx="${pts[pts.length - 1][0]}" cy="${pts[pts.length - 1][1]}" r="8" fill="#5FAE3F" stroke="var(--card)" stroke-width="3"/></svg>`;
  }
  function barChart() {
    const t = targets(), days = []; const d = new Date(); d.setDate(d.getDate() - 6);
    for (let i = 0; i < 7; i++) { days.push({ n: DAYS[(d.getDay() + 6) % 7], k: Math.round(totals(dkey(d)).kcal), today: i === 6 }); d.setDate(d.getDate() + 1); }
    const mx = Math.max(t.kcal * 1.2, ...days.map((x) => x.k)), H = 96;
    return `<div style="position:relative;height:${H + 24}px;display:flex;align-items:flex-end;gap:6px;padding:0 4px"><div style="position:absolute;left:4px;right:4px;bottom:${22 + t.kcal / mx * H}px;border-top:2.5px dashed var(--ink2);opacity:.7"></div><div class="fr" style="position:absolute;right:6px;bottom:${26 + t.kcal / mx * H}px;font-size:11px;font-weight:700;color:var(--ink2);background:var(--card);padding:0 4px">meta ${nf(t.kcal)}</div>${days.map((x, i) => `<div class="bt"><i style="height:${Math.max(4, x.k / mx * H)}px;background:${x.k > t.kcal ? '#FF7B6B' : x.today ? 'var(--avo-l)' : '#7CC35B'};${x.today ? 'border:3px dashed #7CC35B;border-bottom:0' : ''};animation-delay:${i * 50}ms"></i>${x.n}</div>`).join('')}</div>`;
  }
  const STK = [['Primera rutina', () => S.workouts >= 1, '#CDBFFF', '<path d="M34 16L20 34h10l-2 14 16-20H33z" fill="#3A2142"/>'], ['Racha de 7 días', () => streak() >= 7, '#FFD76A', '<path d="M32 12c2 8 14 12 14 24a14 14 0 01-28 0c0-7 4-10 6-14 2 4 4 5 5 5 0-6-1-10 3-15z" fill="#FF7B6B"/>'], ['Hidratación completa', () => Object.values(S.log).some((l) => l.water >= 8), '#BFE6FF', '<path d="M32 12S18 30 18 40a14 14 0 0028 0C46 30 32 12 32 12z" fill="#6EC6FF"/>'], ['Un kilo menos', () => S.weights.length > 1 && S.weights[0].w - lastW() >= 1, '#CFF0B8', '<path d="M32 12c14 0 22 20 22 34 0 8-8 12-22 12S10 54 10 46c0-14 8-34 22-34z" fill="#4F8F3B"/><circle cx="32" cy="44" r="8" fill="#A5683D"/>'], ['10 rutinas', () => S.workouts >= 10, '#FFD0DC', '<path d="M12 36h40M18 28v16M46 28v16M10 32v8M54 32v8" stroke="#3A2142" stroke-width="5" stroke-linecap="round"/>'], ['5 favoritas', () => S.favs.length >= 5, '#FFD0DC', '<path d="M32 50S14 40 14 27a9 9 0 0118-4 9 9 0 0118 4c0 13-18 23-18 23z" fill="#FF5C8A"/>']];
  function vYo() {
    const p = S.profile, t = targets(), wl = S.weights.length > 1 ? (S.weights[0].w - lastW()) : 0;
    const f = (id, lab, v, ex = '') => `<label class="field">${lab}<input id="${id}" data-a="pf" data-k="${id}" value="${esc(v)}" ${ex}></label>`;
    return `<div class="top"><div><div class="hand sub">¡mira cuánto avanzaste!</div><h1 class="disp">Mi progreso</h1></div><div class="blob2" style="background:var(--butter);color:#3A2142;padding:6px 12px;display:flex;align-items:center;gap:6px;box-shadow:0 4px 0 var(--butter-d)"><span class="disp" style="font-size:26px;line-height:1">${streak()}</span><span class="fr" style="font-size:11px;font-weight:600;line-height:1">días<br>seguidos</span></div></div>
      <div class="card blob"><div style="display:flex;align-items:flex-end;justify-content:space-between"><div><div class="hand muted" style="font-size:19px;line-height:1">peso</div><div class="disp" style="font-size:38px;line-height:1.1">${lastW()} <span class="fr" style="font-size:15px">kg</span></div></div>${wl ? `<div class="fr" style="background:var(--avo-l);font-weight:700;font-size:13px;padding:6px 12px;border-radius:16px">${wl > 0 ? '−' : '+'}${Math.abs(wl).toFixed(1)} kg</div>` : ''}</div>${lineChart()}<div class="row" style="margin-top:8px"><label class="field grow">Peso de hoy (kg)<input id="wnew" type="number" step="0.1" inputmode="decimal" placeholder="${lastW()}"></label><button class="pill green" data-a="wadd">Guardar</button></div></div>
      <div class="card blob2"><div style="display:flex;justify-content:space-between;align-items:baseline"><div class="hand muted" style="font-size:19px">kcal por día</div></div>${barChart()}</div>
      <div><div class="hand muted" style="font-size:20px;margin-bottom:4px">tus stickers</div><div style="display:flex;gap:8px;justify-content:space-between">${STK.slice(0, 5).map((s) => { const on = s[1](); return `<svg class="st" viewBox="0 0 64 64" role="img" aria-label="${s[0]}${on ? '' : ' (bloqueado)'}" style="${on ? '' : 'opacity:.4;filter:grayscale(1)'}"><circle cx="32" cy="32" r="28" fill="${s[2]}"/>${s[3]}</svg>`; }).join('')}</div></div>
      <div class="card blob2" style="display:flex;flex-direction:column;gap:10px"><div class="hand muted" style="font-size:20px">mi perfil y metas</div><div class="grid2">${f('name', 'Nombre', p.name)}<label class="field">Sexo<select id="sex" data-a="pf" data-k="sex"><option value="f" ${p.sex === 'f' ? 'selected' : ''}>Mujer</option><option value="m" ${p.sex === 'm' ? 'selected' : ''}>Hombre</option></select></label>${f('age', 'Edad', p.age, 'type="number" inputmode="numeric"')}${f('h', 'Estatura (cm)', p.h, 'type="number" inputmode="numeric"')}${f('w', 'Peso (kg)', p.w, 'type="number" step="0.1" inputmode="decimal"')}${f('gw', 'Meta (kg)', p.gw, 'type="number" step="0.1" inputmode="decimal"')}</div>
        <div class="grid2"><label class="field">Actividad<select id="act" data-a="pf" data-k="act">${[[1.2, 'Sedentaria'], [1.4, 'Ligera'], [1.6, 'Moderada'], [1.8, 'Alta']].map((a) => `<option value="${a[0]}" ${p.act === a[0] ? 'selected' : ''}>${a[1]}</option>`).join('')}</select></label><label class="field">Ritmo<select id="rate" data-a="pf" data-k="rate">${[[0.25, '0.25 kg/sem'], [0.5, '0.5 kg/sem'], [0.75, '0.75 kg/sem']].map((a) => `<option value="${a[0]}" ${p.rate === a[0] ? 'selected' : ''}>${a[1]}</option>`).join('')}</select></label></div>
        <div class="blob2" style="background:var(--butter);color:#3A2142;padding:10px 14px"><div class="hand" style="font-size:18px;line-height:1">tu meta diaria</div><div class="disp" style="font-size:30px">${nf(t.kcal)} kcal</div><div class="fr sm" style="font-weight:600">Proteína ${t.p} g · Carbos ${t.ch} g · Grasa ${t.f} g · Gasto total ~${nf(t.tdee)}</div></div>
        <div><div class="fr muted sm" style="font-weight:600;margin-bottom:6px">Mi dieta (filtra tus recetas y plan)</div><div class="wrapchips">${J.DIETS.map((d) => `<button class="chip ${p.diets.includes(d[0]) ? 'on' : ''}" data-a="pdiet" data-v="${d[0]}">${d[1]}</button>`).join('')}</div></div>
        ${f('excl', 'No me gusta o soy alérgic@ a (separa con comas)', p.excl, 'placeholder="ej. camarones, cacahuate"')}</div>
      <div class="card blob2" style="display:flex;flex-direction:column;gap:10px"><div class="hand muted" style="font-size:20px">apariencia</div><button class="pill pink big" data-a="tab" data-t="temas">${ic('palette', 20)} Temática: ${esc(J.themeById(S.theme).name)}</button>${S.theme === 'auto' ? `<div class="seg" role="group" aria-label="Franja horaria">${[['auto', 'Por la hora'], ['morning', 'Mañana'], ['lunch', 'Almuerzo'], ['eve', 'Tarde'], ['night', 'Noche']].map((m) => `<button class="${S.mood === m[0] ? 'on' : ''}" data-a="mood" data-v="${m[0]}">${m[1]}</button>`).join('')}</div><div class="muted sm">En «Por la hora» la interfaz cambia sola: mañana (5-11), almuerzo (11-16), tarde (16-19) y noche (19-5).</div>` : '<div class="muted sm">Con otra temática, los colores, letras y menú son los de esa temática.</div>'}</div>
      <div class="card blob2" style="display:flex;flex-direction:column;gap:10px"><div class="hand muted" style="font-size:20px">mis datos</div><div class="grid2"><button class="pill soft" data-a="export">Guardar respaldo</button><label class="pill soft" style="cursor:pointer;justify-content:center">Restaurar<input id="imp" type="file" accept="application/json" hidden></label></div><div class="muted sm">Todo se guarda solo en este teléfono. Instálala desde el menú del navegador: «Agregar a pantalla de inicio».</div></div>`;
  }

  /* ---------- Navegación y render ---------- */
  const NAV = [['hoy', 'Hoy', 'home'], ['rec', 'Recetas', 'book'], ['huerta', 'Huerta', 'sprout'], ['plan', 'Plan', 'cal'], ['mov', 'Mover', 'bolt']];
  let navOpen = false;
  function renderNav() {
    const th = J.themeById(S.theme), bubble = th.nav === 'bubble';
    $('#nav').className = 'nav' + (bubble && navOpen ? ' open' : '');
    $('#nav').innerHTML = (bubble ? `<button class="navtog" data-a="navtog" aria-label="Abrir menú" aria-expanded="${navOpen}">${ic('plus', 30, 3)}</button>` : '') + NAV.map((n) => n[0] === 'huerta' ? `<button class="fab press" data-a="tab" data-t="huerta" aria-label="Mi Huerta">${ic('sprout', 30)}</button>` : `<button class="nv press ${tab === n[0] ? 'on' : ''}" data-a="tab" data-t="${n[0]}"><span class="ic">${ic(n[2])}</span>${n[1]}</button>`).join('');
  }
  function render() {
    const V = { hoy: vHoy, rec: vRec, plan: vPlan, mov: vMov, huerta: vHuerta, temas: vTemas, yo: vYo };
    $('#view').innerHTML = V[tab](); renderNav();
    if (tab === 'rec') loadRec(true);
    const im = $('#imp'); if (im) im.addEventListener('change', () => { const rd = new FileReader(); rd.onload = () => { try { S = Object.assign({}, DEF, JSON.parse(rd.result)); save(); toast('Respaldo restaurado'); render(); } catch (e) { toast('Ese archivo no es un respaldo válido'); } }; rd.readAsText(im.files[0]); });
    const q = $('#q'); if (q) { let t; q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { R.q = q.value; loadRec(true); }, 250); }); }
    const dayEl = $('.day.on'); if (dayEl && dayEl.scrollIntoView) dayEl.scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  function go(t) { tab = t; render(); window.scrollTo(0, 0); }

  /* ---------- Acciones ---------- */
  function eatEntry(r, sv, ref) { const x = (v) => Math.round(v * sv * 10) / 10, col = colorsOf(J.recipe(r.id)); addColors(col, 1, dkey()); L().food.push({ id: Date.now() + Math.random(), ref, col, name: r.name, kcal: Math.round(r.kcal * sv), p: x(r.p), ch: x(r.ch), f: x(r.f) }); }
  const A = {
    close: () => closeSheet(), tab: (e) => { closeSheet(); navOpen = false; go(e.dataset.t); },
    wsel: (e) => { wsel = e.dataset.s; render(); },
    navtog: () => { navOpen = !navOpen; renderNav(); },
    theme: (e) => { S.theme = e.dataset.id; save(); J.applyTheme(S.theme); lastMood = null; applyMood(); renderNav(); const g = $('.themes'); if (g) g.innerHTML = themeGrid(); toast('Temática: ' + J.themeById(S.theme).name); },
    fx: () => { S.fx = S.fx === 'lite' ? 'full' : 'lite'; save(); document.documentElement.dataset.fx = S.fx; render(); },
    habit: (e) => { const h = HAB.find((x) => x[0] === e.dataset.id); if (h[2] === 'auto') { toast('Este hábito se marca solo cuando lo logras'); return; } const d = gday(); d.h[h[0]] = !d.h[h[0]]; save(); render(); },
    rb: (e) => { const d = gday(); d.c[e.dataset.c] = (d.c[e.dataset.c] || 0) + 1; save(); render(); },
    rbm: (e) => { const d = gday(); d.c[e.dataset.c] = Math.max(0, (d.c[e.dataset.c] || 0) - 1); save(); render(); },
    mdetail: (e) => openMascot(e.dataset.k),
    unlock: (e) => { const m = J.MASCOT[e.dataset.k]; if (S.garden.seeds < m.cost) return; S.garden.seeds -= m.cost; S.garden.owned.push(m.k); save(); confetti(); openMascot(m.k); render(); toast('¡' + m.n + ' se unió a tu huerta!'); },
    setcomp: (e) => { S.garden.companion = e.dataset.k; save(); openMascot(e.dataset.k); render(); toast(mascotName(e.dataset.k) + ' es tu compañero'); },
    rec: (e) => openRecipe(+e.dataset.id), rsv: (e) => openRecipe(+e.dataset.id, +e.dataset.v),
    fav: (e) => { const id = +e.dataset.id, i = S.favs.indexOf(id); if (i >= 0) S.favs.splice(i, 1); else { S.favs.push(id); toast('Guardada en favoritas'); } save(); if (e.dataset.sheet) openRecipe(id); else if (tab === 'rec') { const y = scrollY; render(); scrollTo(0, y); } },
    eat: (e) => { const r = J.recipeLite(+e.dataset.id); eatEntry(r, +e.dataset.v, null); save(); closeSheet(); toast('Registrado: ' + Math.round(r.kcal * e.dataset.v) + ' kcal'); render(); },
    toplan: (e) => { if (!S.plan) genPlan(); openSheet(`<h2 class="disp" style="font-size:26px;padding-right:46px">¿Dónde la agrego?</h2><div class="days">${DAYS.map((n, i) => `<button class="day ${i === pd ? 'on' : ''}" data-a="pday2" data-i="${i}"><span>${n}</span></button>`).join('')}</div><div class="grid2">${SLOTS.map((s) => `<button class="pill soft big" data-a="putplan" data-s="${s[0]}" data-id="${e.dataset.id}" data-v="${e.dataset.v}">${s[1]}</button>`).join('')}</div>`); },
    pday2: (e) => { pd = +e.dataset.i; $$('.day').forEach((d) => d.classList.toggle('on', d === e)); },
    putplan: (e) => { S.plan.days[pd][e.dataset.s] = { id: +e.dataset.id, sv: +e.dataset.v }; save(); closeSheet(); toast('Añadida al plan del ' + DAYS[pd]); tab === 'plan' && render(); },
    genplan: () => { genPlan(); toast('¡Plan semanal listo!'); confetti(); if (tab !== 'plan' && tab !== 'hoy') tab = 'plan'; render(); },
    pday: (e) => { pd = +e.dataset.i; render(); },
    reroll: (e) => { const s = e.dataset.s, t = targets(), sh = SLOTS.find((x) => x[0] === s)[2]; const n = pickFor(s, t.kcal * sh, Math.random, new Set()); if (n) { S.plan.days[pd][s] = n; save(); render(); } else toast('No hay otra receta con tus filtros'); },
    shop: () => openShop(), shopchk: (e) => { S.shopDone[e.dataset.k] = !S.shopDone[e.dataset.k]; save(); const y = $('#sheet').scrollTop; openShop(); $('#sheet').scrollTop = y; },
    copyshop: () => { try { navigator.clipboard.writeText(window._shop).then(() => toast('Lista copiada')).catch(() => toast('No pude copiar')); } catch (e) { toast('No pude copiar'); } },
    eatslot: (e) => { const s = e.dataset.slot, l = L(), i = l.food.findIndex((x) => x.ref === 'plan:' + s); if (i >= 0) { addColors(l.food[i].col, -1, dkey()); l.food.splice(i, 1); } else { const pe = planEntry(todayIdx(), s); if (!pe) return A.genplan(); eatEntry(pe.r, pe.sv, 'plan:' + s); toast('¡Registrado! ' + pe.kcal + ' kcal'); } save(); render(); },
    water: (e) => { const l = L(), i = +e.dataset.i; l.water = l.water === i + 1 ? i : i + 1; save(); if (l.water === 8) { confetti(); toast('¡Meta de agua cumplida!'); } render(); },
    delfood: (e) => { const l = L(), x = l.food.find((y) => String(y.id) === e.dataset.id); if (x) addColors(x.col, -1, dkey()); l.food = l.food.filter((y) => String(y.id) !== e.dataset.id); save(); render(); },
    quickadd: () => openSheet(`<h2 class="disp" style="font-size:26px;padding-right:46px">Registro rápido</h2><label class="field">¿Qué comiste?<input id="qn" placeholder="ej. manzana con crema de cacahuate"></label><label class="field">Calorías aproximadas<input id="qk" type="number" inputmode="numeric" placeholder="150"></label><button class="pill green big" data-a="qsave">Guardar</button>`),
    qsave: () => { const n = $('#qn').value.trim() || 'Comida libre', k = +$('#qk').value; if (!k) return toast('Escribe las calorías'); L().food.push({ id: Date.now(), name: n, kcal: k }); save(); closeSheet(); render(); },
    startweek: () => { const w = J.WEEK[S.profile.lvl][todayIdx()]; startPlayer(J.makeRoutine({ goal: w[0], level: S.profile.lvl, minutes: w[1], equip: 'n', seed: Date.now() })); },
    startday: (e) => { const w = J.WEEK[S.profile.lvl][+e.dataset.i]; startPlayer(J.makeRoutine({ goal: w[0], level: S.profile.lvl, minutes: w[1], equip: 'n', seed: Date.now() })); },
    lvl: (e) => { S.profile.lvl = +e.dataset.v; GEN.level = +e.dataset.v; save(); render(); },
    mt: (e) => { mt = e.dataset.v; render(); },
    ggoal: (e) => { GEN.goal = e.dataset.v; CUR = null; render(); }, glvl: (e) => { GEN.level = +e.dataset.v; CUR = null; render(); }, gmin: (e) => { GEN.minutes = +e.dataset.v; CUR = null; render(); }, geq: (e) => { GEN.equip = e.dataset.v; CUR = null; render(); },
    gnew: () => { CUR = null; render(); }, gstart: () => startPlayer(CUR),
    actadd: () => { const a = J.ACT[+$('#actsel').value], m = Math.max(1, +$('#actmin').value || 0); L().act.push({ name: a[0], min: m, kcal: a[1] * kg() * m / 60 }); save(); toast('¡Actividad guardada!'); render(); },
    actdel: (e) => { L().act.splice(+e.dataset.i, 1); save(); render(); },
    pclose: () => finishPlayer(false), pvoice: () => { voiceOn = !voiceOn; drawPlayer(); },
    ppause: () => { PL.paused = !PL.paused; drawPlayer(); },
    pnext: () => { if (PL.i >= PL.r.steps.length - 1) return finishPlayer(true); PL.i++; PL.left = PL.r.steps[PL.i].secs; announce(); drawPlayer(); },
    pprev: () => { PL.i = Math.max(0, PL.i - 1); PL.left = PL.r.steps[PL.i].secs; announce(); drawPlayer(); },
    usepan: () => { if (!S.pantry.length) { openPantry(); return; } S.usePantry = !S.usePantry; save(); render(); },
    pantry: () => openPantry(),
    pchk: (e) => { const k = e.dataset.k, i = S.pantry.indexOf(k); i >= 0 ? S.pantry.splice(i, 1) : S.pantry.push(k); save(); reopenPantry(); },
    ppreset: () => { BASICS.forEach((k) => { if (!S.pantry.includes(k)) S.pantry.push(k); }); save(); reopenPantry(); },
    pclear: () => { S.pantry = []; S.usePantry = false; save(); reopenPantry(); },
    pdone: () => { closeSheet(); if (S.pantry.length) S.usePantry = true; save(); render(); },
    rcat: (e) => { R.cat = e.dataset.v; R.fav = false; render(); }, rfav: () => { R.fav = !R.fav; render(); },
    rdiet: (e) => { const v = e.dataset.v, i = R.diets.indexOf(v); i >= 0 ? R.diets.splice(i, 1) : R.diets.push(v); render(); },
    rlvl: (e) => { R.lvl = +e.dataset.v; render(); }, rmore: () => { loadRec(false); toast('Más recetas listas'); }, rshuffle: () => { R.seed = Math.floor(Math.random() * 1e7); loadRec(true); },
    lflog: () => openFoodLog(),
    lfpick: (e) => { LF.k = e.dataset.k; const d = food(LF.k); LF.n = d[8] ? 1 : 100; openFoodPortion(); },
    lfn: (e) => { const d = food(LF.k), unit = d[8] || 0, st = unit ? 0.5 : 10; LF.n = Math.max(st, Math.round((LF.n + st * +e.dataset.d) * 100) / 100); openFoodPortion(); },
    lfsave: () => { const d = food(LF.k), unit = d[8] || 0, g = unit ? LF.n * unit : LF.n, x = g / 100; L().food.push({ id: Date.now(), name: d[0] + (unit ? ' · ' + fmt(LF.n) + ' ' + d[7] + (LF.n === 1 ? '' : 's') : ' · ' + Math.round(g) + ' g'), kcal: Math.round(d[1] * x), p: Math.round(d[2] * x), ch: Math.round(d[3] * x), f: Math.round(d[4] * x) }); S.recentFood = [LF.k].concat((S.recentFood || []).filter((k) => k !== LF.k)).slice(0, 8); save(); closeSheet(); render(); toast('Guardado: ' + Math.round(d[1] * x) + ' kcal'); },
    wadd: () => { const v = parseFloat($('#wnew').value); if (!v) return toast('Escribe tu peso'); S.weights.push({ d: dkey(), w: v }); S.profile.w = v; save(); toast('Peso guardado'); render(); },
    pdiet: (e) => { const v = e.dataset.v, d = S.profile.diets, i = d.indexOf(v); i >= 0 ? d.splice(i, 1) : d.push(v); save(); render(); },
    mood: (e) => { S.mood = e.dataset.v; save(); lastMood = null; applyMood(); render(); },
    export: () => { const b = new Blob([JSON.stringify(S)], { type: 'application/json' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'guaco-fit-respaldo-' + dkey() + '.json'; a.click(); },
  };
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  document.addEventListener('click', (ev) => { const e = ev.target.closest('[data-a]'); if (!e || e.tagName === 'SELECT' || e.tagName === 'INPUT') return; if (A[e.dataset.a]) A[e.dataset.a](e, ev); });
  document.addEventListener('change', (ev) => {
    const e = ev.target, a = e.dataset && e.dataset.a;
    if (a === 'pf') { const k = e.dataset.k; S.profile[k] = ['name', 'excl'].includes(k) ? e.value : k === 'sex' ? e.value : parseFloat(e.value) || S.profile[k]; save(); render(); }
  });
  $('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeSheet(); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) applyMood(); });

  /* ---------- Inicio ---------- */
  { const st = document.createElement('style'); st.textContent = J.mascotCss + J.animCss; document.head.appendChild(st); }
  if (!S.fx) S.fx = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3 ? 'lite' : 'full';
  document.documentElement.dataset.fx = S.fx;
  { let st; addEventListener('scroll', () => { const h = document.documentElement; if (!h.classList.contains('scrolling')) h.classList.add('scrolling'); clearTimeout(st); st = setTimeout(() => h.classList.remove('scrolling'), 160); }, { passive: true }); }
  J.applyTheme(S.theme);
  applyMood(); setInterval(applyMood, 60000);
  if (!S.setup) { S.setup = true; save(); }
  if (dataReset) { save(); setTimeout(() => toast('Actualicé las recetas con pasos detallados. Genera tu plan de nuevo.'), 800); }
  render();
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
