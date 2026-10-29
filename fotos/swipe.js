/* Guaco Swipe: elige fotos, encuentra repetidas/parecidas/borrosas y decide con swipe. Todo ocurre en el dispositivo. */
(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const mb = (b) => b >= 1e9 ? (b / 1e9).toFixed(2) + ' GB' : (b / 1e6).toFixed(1) + ' MB';
  const nf = (n) => n.toLocaleString('es-MX');
  const store = { get: () => { try { return JSON.parse(localStorage.getItem('guacoswipe.v1')) || {}; } catch (e) { return {}; } }, set: (v) => { try { localStorage.setItem('guacoswipe.v1', JSON.stringify(v)); } catch (e) {} } };
  const NATIVE = !!window.Android; // dentro de la app de Android hay acceso real a la galería
  let DEC = store.get(); // clave del archivo -> 'k' | 'd'
  const saveDec = () => store.set(DEC);
  const toast = (m) => { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); };

  let items = [], groups = [], screen = 'home', mode = null, queue = [], qi = 0, undo = [], gi = 0, dirRoot = null, prog = { n: 0, t: 0 };
  const keyOf = (it) => it.name + '|' + it.size + '|' + it.mod;
  const decOf = (it) => DEC[it.key];
  const setDec = (it, v) => { if (v) DEC[it.key] = v; else delete DEC[it.key]; saveDec(); };
  const url = (it) => it.nid != null ? '/n/view/' + it.nid : (it._u || (it._u = URL.createObjectURL(it.file)));
  const freeUrl = (it) => { if (it._u) { URL.revokeObjectURL(it._u); it._u = null; } };

  /* ---------- Lectura de fotos ---------- */
  async function addFiles(list, handles) {
    const files = Array.from(list).filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|heic|heif|gif|bmp|avif)$/i.test(f.name));
    if (!files.length) { toast('No encontré fotos'); return; }
    const seen = new Set(items.map((i) => i.key));
    files.forEach((f, i) => {
      const it = { id: items.length, file: f, name: f.name, size: f.size, mod: f.lastModified, h: handles && handles[i] };
      it.key = keyOf(it); if (seen.has(it.key)) return; seen.add(it.key); items.push(it);
    });
    items.forEach((it, i) => (it.id = i));
    await analyze();
  }

  function scanNative() {
    const go = () => {
      let list = []; try { list = JSON.parse(Android.listImages()); } catch (e) {}
      if (!list.length) { toast('No encontré fotos en la galería'); return; }
      items = list.map((r, i) => { const it = { id: i, nid: r[0], name: r[1], size: r[2], mod: r[3], bucket: r[6] }; it.key = keyOf(it); return it; });
      analyze();
    };
    if (Android.hasPermission()) go(); else { window.__perm = (ok) => (ok ? go() : toast('Necesito permiso para ver tus fotos')); Android.requestPermission(); }
  }
  const cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
  async function analyzeOne(it) {
    const nat = it.nid != null; let src = it.file;
    if (nat) { try { it.fp = (await (await fetch('/n/fp/' + it.nid)).text()).trim() || null; src = await (await fetch('/n/thumb/' + it.nid)).blob(); } catch (e) { it.fp = null; it.bad = true; it.th = ''; return; } }
    else try {
      const head = await it.file.slice(0, 16384).arrayBuffer(), tail = await it.file.slice(Math.max(0, it.size - 16384)).arrayBuffer();
      const buf = new Uint8Array(head.byteLength + tail.byteLength + 8); buf.set(new Uint8Array(head)); buf.set(new Uint8Array(tail), head.byteLength);
      new DataView(buf.buffer).setFloat64(buf.length - 8, it.size);
      const dg = new Uint8Array(await crypto.subtle.digest('SHA-1', buf)); it.fp = Array.from(dg.slice(0, 10), (b) => b.toString(16).padStart(2, '0')).join('');
    } catch (e) { it.fp = null; }
    try {
      const bmp = await createImageBitmap(src, { resizeWidth: 192, resizeQuality: 'medium' });
      const W = bmp.width, H = bmp.height; it.asp = H / W;
      cv.width = W; cv.height = H; cx.drawImage(bmp, 0, 0);
      const px = cx.getImageData(0, 0, W, H).data, g = new Float32Array(W * H);
      for (let i = 0, j = 0; i < px.length; i += 4, j++) g[j] = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      let s = 0, s2 = 0, n = 0; // varianza del laplaciano = nitidez
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const l = 4 * g[y * W + x] - g[y * W + x - 1] - g[y * W + x + 1] - g[(y - 1) * W + x] - g[(y + 1) * W + x]; s += l; s2 += l * l; n++; }
      it.sharp = n ? s2 / n - (s / n) * (s / n) : 0;
      cv.width = 9; cv.height = 8; cx.drawImage(bmp, 0, 0, 9, 8);
      const d = cx.getImageData(0, 0, 9, 8).data; let a = 0, b = 0;
      for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { const p = (y * 9 + x) * 4, q = p + 4, bit = (0.299 * d[p] + 0.587 * d[p + 1] + 0.114 * d[p + 2]) > (0.299 * d[q] + 0.587 * d[q + 1] + 0.114 * d[q + 2]) ? 1 : 0, k = y * 8 + x; if (k < 32) a |= bit << k; else b |= bit << (k - 32); }
      it.ha = a >>> 0; it.hb = b >>> 0;
      cv.width = 3; cv.height = 3; cx.drawImage(bmp, 0, 0, 3, 3);
      const c = cx.getImageData(0, 0, 3, 3).data; it.col = new Uint8Array(27); for (let i = 0; i < 9; i++) { it.col[i * 3] = c[i * 4]; it.col[i * 3 + 1] = c[i * 4 + 1]; it.col[i * 3 + 2] = c[i * 4 + 2]; }
      const tw = 140, th = Math.max(1, Math.round(tw * H / W)); cv.width = tw; cv.height = th; cx.drawImage(bmp, 0, 0, tw, th);
      it.th = cv.toDataURL('image/jpeg', 0.6); bmp.close && bmp.close();
    } catch (e) { it.bad = true; it.th = ''; }
  }

  async function analyze() {
    screen = 'analyzing'; prog = { n: 0, t: items.filter((i) => !i.done).length }; render();
    const todo = items.filter((i) => !i.done); let k = 0, last = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (k < todo.length) { const it = todo[k++]; await analyzeOne(it); it.done = true; prog.n++; const t = performance.now(); if (t - last > 150) { last = t; progressUI(); await new Promise((r) => setTimeout(r)); } }
    }));
    buildGroups(); screen = 'hub'; render();
  }

  /* ---------- Duplicadas y parecidas ---------- */
  const pop = (x) => { x -= (x >>> 1) & 0x55555555; x = (x & 0x33333333) + ((x >>> 2) & 0x33333333); return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24; };
  const ham = (a, b) => pop(a.ha ^ b.ha) + pop(a.hb ^ b.hb);
  const cdist = (a, b) => { let s = 0; for (let i = 0; i < 27; i++) s += Math.abs(a.col[i] - b.col[i]); return s / 27; };
  function buildGroups() {
    const ok = items.filter((i) => !i.bad && i.col), par = new Map(ok.map((i) => [i.id, i.id])), exactPair = new Set();
    const find = (x) => { while (par.get(x) !== x) { par.set(x, par.get(par.get(x))); x = par.get(x); } return x; }, uni = (a, b) => par.set(find(a), find(b));
    const byFp = new Map(); items.forEach((i) => { if (i.fp) { const k = i.fp; (byFp.get(k) || byFp.set(k, []).get(k)).push(i); } });
    byFp.forEach((l) => { for (let i = 1; i < l.length; i++) { if (par.has(l[0].id) && par.has(l[i].id)) uni(l[0].id, l[i].id); exactPair.add(l[0].id); exactPair.add(l[i].id); } });
    const sorted = ok.slice().sort((a, b) => a.mod - b.mod), win = sorted.length > 6000 ? 250 : sorted.length;
    for (let i = 0; i < sorted.length; i++) for (let j = i + 1; j < Math.min(sorted.length, i + 1 + win); j++) {
      const a = sorted[i], b = sorted[j]; if (Math.abs(a.asp - b.asp) > 0.2) continue;
      const h = ham(a, b); if (h > 12) continue; const c = cdist(a, b), dt = Math.abs(a.mod - b.mod);
      if ((h <= 8 && c <= 35) || (h <= 12 && c <= 45 && dt <= 90000)) uni(a.id, b.id);
    }
    const m = new Map(); ok.forEach((i) => { const r = find(i.id); (m.get(r) || m.set(r, []).get(r)).push(i); });
    groups = [];
    m.forEach((l) => { if (l.length < 2) return; l.sort((a, b) => a.mod - b.mod); const score = (i) => i.size * (1 + Math.min(i.sharp || 0, 600) / 200); let best = l[0]; l.forEach((i) => { if (score(i) > score(best)) best = i; }); groups.push({ items: l, best, exact: l.every((i) => i.fp === l[0].fp) }); });
    groups.sort((a, b) => b.items.length - a.items.length);
    items.forEach((i) => { i.shot = /screenshot|captura|screen[_ -]?shot/i.test(i.name + ' ' + (i.bucket || '')); });
  }
  const pendingGroups = () => groups.filter((g) => g.items.some((i) => !decOf(i)));

  /* ---------- Vistas ---------- */
  const app = $('#app');
  function render() {
    if (screen === 'home') home(); else if (screen === 'analyzing') analyzing(); else if (screen === 'hub') hub(); else if (screen === 'swipe') swipeView(); else if (screen === 'group') groupView(); else if (screen === 'trash') trash();
  }
  const mas = (k, s) => (window.J && J.mascot ? J.mascot(k, s, {}) : '');
  function home() {
    const canDir = 'showDirectoryPicker' in window;
    app.innerHTML = `<div class="hero">${mas('aguacate', 120)}<div class="hand" style="font-size:22px">limpia tu galería sin dolor</div><h1 class="disp">Guaco Swipe</h1><p>Desliza a la derecha para quedarte una foto y a la izquierda para borrarla. Yo te muestro las repetidas, parecidas y borrosas.</p></div>
      ${NATIVE ? '<button class="pill green big" id="scan">Escanear mi galería</button>' : '<label class="pill green big" style="cursor:pointer">Elegir mis fotos<input id="pick" type="file" accept="image/*" multiple hidden></label>'}
      ${canDir && !NATIVE ? '<button class="pill soft big" id="dir">Elegir una carpeta (puedo borrar de verdad)</button>' : ''}
      <div class="card note"><b>Tu privacidad:</b> las fotos no salen de tu dispositivo, no se suben a ningún lado y funciona sin internet.<br><br>${NATIVE ? '<b>Sobre borrar:</b> las fotos que marques se mueven a la papelera de tu galería (Android te pide un permiso una vez por lote) y se quedan ahí unos 30 días por si te arrepientes.' : '<b>Sobre borrar:</b> el navegador del celular no me deja borrar fotos de tu galería. En el celular te dejo la lista marcada para borrarlas tú; en una computadora con Chrome o Edge, al elegir una carpeta sí las borro de verdad.'}</div>`;
    const pk = $('#pick'); if (pk) pk.onchange = (e) => addFiles(e.target.files);
    const sc = $('#scan'); if (sc) sc.onclick = scanNative;
    const d = $('#dir'); if (d) d.onclick = pickDir;
  }
  async function pickDir() {
    try {
      const root = await window.showDirectoryPicker({ mode: 'readwrite' }); dirRoot = root; const fl = [], hs = [];
      const walk = async (dir) => { for await (const [name, h] of dir.entries()) { if (h.kind === 'file') { if (/\.(jpe?g|png|webp|heic|heif|gif|bmp|avif)$/i.test(name)) { fl.push(await h.getFile()); hs.push({ dir, name }); } } else await walk(h); } };
      toast('Leyendo la carpeta…'); await walk(root); await addFiles(fl, hs);
    } catch (e) { if (e.name !== 'AbortError') toast('No pude abrir la carpeta'); }
  }
  function analyzing() { app.innerHTML = `<div class="hero">${mas('aguacate', 110)}<h1 class="disp" style="font-size:34px">Mirando tus fotos…</h1><p id="pt">0 de ${nf(prog.t)}</p></div><div class="bar"><i id="pb" style="transform:scaleX(0)"></i></div><p class="note" style="text-align:center">Sigue en esta pantalla hasta que termine. Nada se sube a internet.</p>`; }
  function progressUI() { const b = $('#pb'), t = $('#pt'); if (b) b.style.transform = `scaleX(${prog.t ? prog.n / prog.t : 0})`; if (t) t.textContent = `${nf(prog.n)} de ${nf(prog.t)}`; }

  const counts = () => {
    const und = (l) => l.filter((i) => !decOf(i)), pg = pendingGroups(), ex = pg.filter((g) => g.exact), sim = pg.filter((g) => !g.exact);
    const sorted = items.filter((i) => i.sharp != null).sort((a, b) => a.sharp - b.sharp), med = sorted.length ? sorted[Math.floor(sorted.length / 2)].sharp : 0, blur = und(sorted.filter((i) => i.sharp < med * 0.3 || i.sharp < 8));
    return { ex, sim, blur, shot: und(items.filter((i) => i.shot)), all: und(items) };
  };
  function hub() {
    const c = counts(); c.blur.forEach((i) => (i.blurry = true)); const del = items.filter((i) => decOf(i) === 'd'), kept = items.filter((i) => decOf(i) === 'k'), freed = del.reduce((s, i) => s + i.size, 0);
    const M = (id, ic, bg, t, sub, n) => `<button class="mode" data-m="${id}" ${n ? '' : 'disabled'}><span class="ic" style="background:${bg}">${ic}</span><span><b>${t}</b><small>${sub}</small></span><span class="n">${nf(n)}</span></button>`;
    app.innerHTML = `<div class="top"><button class="back" id="home" aria-label="Empezar de nuevo">←</button><div class="grow"><div class="hand" style="font-size:19px;line-height:1">listo, ya las vi</div><h1 class="disp" style="font-size:30px;line-height:1.05">Tus fotos</h1></div>${mas('aguacate', 44)}</div>
      <div class="card stats"><div><b>${nf(items.length)}</b><span>fotos</span></div><div><b>${nf(del.length)}</b><span>para borrar</span></div><div><b>${mb(freed)}</b><span>se liberan</span></div></div>
      <div class="modes">${M('ex', '👯', '#FFD0DC', 'Repetidas exactas', 'La misma foto guardada varias veces', c.ex.length)}${M('sim', '🔍', '#E3DAFF', 'Muy parecidas', 'Ráfagas y tomas casi iguales: te propongo la mejor', c.sim.length)}${M('blur', '🌫️', '#CFF0B8', 'Borrosas', 'Las menos nítidas primero', c.blur.length)}${M('shot', '📱', '#FFE9A8', 'Capturas de pantalla', 'Las que se llaman «captura» o «screenshot»', c.shot.length)}${M('all', '👆', '#BFE6FF', 'Todas, estilo Tinder', 'Una por una, de la más vieja a la más nueva', c.all.length)}</div>
      <button class="pill red big" id="trash" ${del.length ? '' : 'disabled style="opacity:.45"'}>Revisar y borrar (${nf(del.length)})</button>
      ${NATIVE ? '<button class="pill soft big" id="rescan">Volver a escanear la galería</button>' : '<label class="pill soft big" style="cursor:pointer">Agregar más fotos<input id="pick" type="file" accept="image/*" multiple hidden></label>'}
      <p class="note" style="text-align:center">${nf(kept.length)} fotos marcadas para quedarse.</p>`;
    $('#home').onclick = () => { if (confirm('¿Empezar de nuevo con otras fotos? Tus decisiones se guardan.')) { items.forEach(freeUrl); items = []; groups = []; dirRoot = null; screen = 'home'; render(); } };
    const pk2 = $('#pick'); if (pk2) pk2.onchange = (e) => addFiles(e.target.files);
    const rs = $('#rescan'); if (rs) rs.onclick = () => { items.forEach(freeUrl); items = []; groups = []; scanNative(); };
    const t = $('#trash'); if (t && del.length) t.onclick = () => { screen = 'trash'; render(); };
    app.querySelectorAll('.mode').forEach((b) => (b.onclick = () => start(b.dataset.m)));
  }
  function start(m) {
    mode = m; const c = counts(); c.blur.forEach((i) => (i.blurry = true)); undo = [];
    if (m === 'ex' || m === 'sim') { gi = 0; queue = (m === 'ex' ? c.ex : c.sim); screen = 'group'; }
    else { queue = m === 'blur' ? c.blur.sort((a, b) => a.sharp - b.sharp) : m === 'shot' ? c.shot : c.all.sort((a, b) => a.mod - b.mod); qi = 0; screen = 'swipe'; }
    render();
  }

  /* ---------- Swipe tipo Tinder ---------- */
  const fmtDate = (t) => new Date(t).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  function cardHTML(it, cls) {
    const src = it.th ? url(it) : '';
    return `<div class="ph ${cls}" data-id="${it.id}">${src ? `<img src="${src}" alt="${esc(it.name)}" onerror="this.onerror=null;this.src='${it.th}'">` : `<div style="color:#fff;padding:20px;text-align:center">No pude mostrar esta foto (${esc(it.name)})</div>`}<div class="tags">${it.blurry ? '<span>Borrosa</span>' : ''}${it.shot ? '<span>Captura</span>' : ''}</div><div class="meta">${esc(it.name)}<br>${fmtDate(it.mod)} · ${mb(it.size)}</div>${cls === 'top' ? '<div class="stamp k">¡QUEDA!</div><div class="stamp d">BORRAR</div>' : ''}</div>`;
  }
  function swipeView() {
    const it = queue[qi];
    if (!it) { toast('¡Terminaste esta pila!'); screen = 'hub'; render(); return; }
    const nx = queue[qi + 1];
    app.innerHTML = `<div class="top"><button class="back" id="hb" aria-label="Volver">←</button><div class="grow"><div class="hand" style="font-size:19px;line-height:1">${qi + 1} de ${queue.length}</div></div><span class="hand" style="font-size:18px">← borrar · queda →</span></div>
      <div class="stage" id="stage">${nx ? cardHTML(nx, 'back') : ''}${cardHTML(it, 'top')}</div>
      <div class="acts"><button class="act d" data-a="d" aria-label="Borrar">✕</button><button class="act sm" data-a="u" aria-label="Deshacer">↶</button><button class="act sm" data-a="s" aria-label="Saltar">⏭</button><button class="act k" data-a="k" aria-label="Quedarme">♥</button></div>
      <p class="hintline">También puedes usar las flechas del teclado · ↑ para saltar</p>`;
    $('#hb').onclick = () => { screen = 'hub'; render(); };
    app.querySelectorAll('.act').forEach((b) => (b.onclick = () => act(b.dataset.a)));
    bindDrag($('.ph.top'));
  }
  let busy = false;
  function act(a, fromDrag) {
    if (busy) return; const it = queue[qi]; if (!it) return;
    if (a === 'u') { const u = undo.pop(); if (!u) return toast('No hay nada que deshacer'); setDec(u.it, u.prev); qi = u.qi; return swipeView(); }
    const top = $('.ph.top'); busy = true;
    if (!fromDrag && top) { top.style.transition = 'transform .28s cubic-bezier(.23,1,.32,1),opacity .28s'; top.style.transform = a === 'd' ? 'translateX(-130%) rotate(-18deg)' : a === 'k' ? 'translateX(130%) rotate(18deg)' : 'translateY(-110%)'; top.style.opacity = '0'; }
    setTimeout(() => { undo.push({ it, prev: decOf(it), qi }); if (a !== 's') setDec(it, a); freeUrl(it); qi++; busy = false; swipeView(); }, 240);
  }
  function bindDrag(el) {
    if (!el) return; let sx = 0, sy = 0, dx = 0, dy = 0, on = false; const kS = el.querySelector('.stamp.k'), dS = el.querySelector('.stamp.d');
    el.addEventListener('pointerdown', (e) => { on = true; sx = e.clientX; sy = e.clientY; el.setPointerCapture(e.pointerId); el.style.transition = 'none'; });
    el.addEventListener('pointermove', (e) => { if (!on) return; dx = e.clientX - sx; dy = Math.min(0, e.clientY - sy) * 0.6 + Math.max(0, e.clientY - sy) * 0.3; el.style.transform = `translate(${dx}px,${dy}px) rotate(${dx / 18}deg)`; kS.style.opacity = Math.max(0, Math.min(1, dx / 110)); dS.style.opacity = Math.max(0, Math.min(1, -dx / 110)); });
    const end = () => { if (!on) return; on = false;
      if (Math.abs(dx) > 110) { const a = dx > 0 ? 'k' : 'd'; el.style.transition = 'transform .25s cubic-bezier(.23,1,.32,1),opacity .25s'; el.style.transform = `translate(${dx > 0 ? 130 : -130}%,${dy}px) rotate(${dx > 0 ? 18 : -18}deg)`; el.style.opacity = '0'; act(a, true); setTimeout(() => {}, 0); }
      else if (dy < -120 && Math.abs(dx) < 80) { el.style.transition = 'transform .25s,opacity .25s'; el.style.transform = 'translateY(-110%)'; el.style.opacity = '0'; act('s', true); }
      else { el.style.transition = 'transform .35s cubic-bezier(.23,1,.32,1)'; el.style.transform = ''; kS.style.opacity = 0; dS.style.opacity = 0; } dx = dy = 0; };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }
  document.addEventListener('keydown', (e) => { if (screen !== 'swipe') return; if (e.key === 'ArrowLeft') act('d'); else if (e.key === 'ArrowRight') act('k'); else if (e.key === 'ArrowUp') act('s'); else if (e.key.toLowerCase() === 'z') act('u'); });

  /* ---------- Grupos (repetidas / parecidas) ---------- */
  let gsel = null;
  function groupView() {
    const g = queue[gi];
    if (!g) { toast('¡Listo con esta pila!'); screen = 'hub'; render(); return; }
    if (!gsel || gsel.g !== g) { gsel = { g, st: new Map(g.items.map((i) => [i.id, decOf(i) || (i === g.best ? 'k' : 'd')])) }; if (![...gsel.st.values()].includes('k')) gsel.st.set(g.best.id, 'k'); }
    const free = g.items.filter((i) => gsel.st.get(i.id) === 'd').reduce((s, i) => s + i.size, 0);
    app.innerHTML = `<div class="top"><button class="back" id="hb" aria-label="Volver">←</button><div class="grow"><div class="hand" style="font-size:19px;line-height:1">grupo ${gi + 1} de ${queue.length}</div><h1 class="disp" style="font-size:26px;line-height:1.05">${g.exact ? 'Son la misma foto' : 'Se parecen mucho'}</h1></div></div>
      <p class="note">Toca una foto para cambiar entre <b style="color:#3E7D2C">quedarme</b> y <b style="color:#D6384B">borrar</b>. La ⭐ es la que te recomiendo (más pesada y nítida).</p>
      <div class="grid ${g.items.length > 4 ? 'g3' : ''}">${g.items.map((i) => { const s = gsel.st.get(i.id); return `<button class="tile ${s}" data-id="${i.id}" aria-label="${esc(i.name)}: ${s === 'k' ? 'me quedo' : 'borrar'}"><img src="${i.th}" alt="">${i === g.best ? '<span class="badge">⭐ Mejor</span>' : ''}<span class="bd">${mb(i.size)}</span><span class="mark">${s === 'k' ? '✓' : '✕'}</span></button>`; }).join('')}</div>
      <div class="row" style="flex-wrap:wrap"><button class="pill soft grow" id="zoomb">🔍 Ver grandes</button></div>
      <p class="note" style="text-align:center">Se liberan ${mb(free)} en este grupo</p>
      <button class="pill green big" id="ok">Confirmar y seguir</button>
      <div class="row"><button class="pill soft grow" id="all">Quedarme con todas</button><button class="pill soft grow" id="skip">Saltar grupo</button></div>`;
    $('#hb').onclick = () => { gsel = null; screen = 'hub'; render(); };
    app.querySelectorAll('.tile').forEach((t) => (t.onclick = () => { const id = +t.dataset.id; gsel.st.set(id, gsel.st.get(id) === 'k' ? 'd' : 'k'); if (![...gsel.st.values()].includes('k')) { gsel.st.set(id, 'k'); toast('Tienes que quedarte con al menos una'); } groupView(); }));
    $('#zoomb').onclick = () => zoom(g.items, 0);
    $('#all').onclick = () => { g.items.forEach((i) => gsel.st.set(i.id, 'k')); groupView(); };
    $('#skip').onclick = () => { gsel = null; gi++; groupView(); };
    $('#ok').onclick = () => { g.items.forEach((i) => setDec(i, gsel.st.get(i.id))); gsel = null; gi++; groupView(); };
  }
  function zoom(list, i) {
    let v = $('#view'); if (!v) { v = document.createElement('div'); v.id = 'view'; document.body.appendChild(v); }
    const show = () => { const it = list[i]; v.innerHTML = `<img src="${url(it)}" alt="${esc(it.name)}"><button aria-label="Cerrar">✕</button>`; v.classList.add('on'); v.querySelector('button').onclick = (e) => { e.stopPropagation(); v.classList.remove('on'); }; };
    v.onclick = () => { i = (i + 1) % list.length; show(); }; show();
  }

  /* ---------- Para borrar ---------- */
  function trash() {
    const del = items.filter((i) => decOf(i) === 'd'), freed = del.reduce((s, i) => s + i.size, 0), canReal = del.some((i) => i.h), nat = NATIVE;
    app.innerHTML = `<div class="top"><button class="back" id="hb" aria-label="Volver">←</button><div class="grow"><div class="hand" style="font-size:19px;line-height:1">${mb(freed)} para liberar</div><h1 class="disp" style="font-size:28px;line-height:1.05">Para borrar (${nf(del.length)})</h1></div></div>
      <p class="note">Toca una foto si te arrepentiste y quieres quedártela.</p>
      <div class="grid g3">${del.slice(0, 300).map((i) => `<button class="tile d" data-id="${i.id}" aria-label="Rescatar ${esc(i.name)}"><img src="${i.th}" alt=""><span class="bd">${mb(i.size)}</span></button>`).join('')}</div>
      ${del.length > 300 ? `<p class="note" style="text-align:center">Mostrando 300 de ${nf(del.length)}.</p>` : ''}
      ${nat ? `<button class="pill red big" id="nat" ${del.length ? '' : 'disabled'}>Mover ${nf(del.length)} a la papelera</button><p class="note" style="text-align:center">Se quedan en la papelera de tu galería unos 30 días.</p>` : canReal ? '<button class="pill red big" id="real">Borrar de verdad desde la carpeta</button>' : '<div class="card note"><b>En el celular no puedo borrar por ti.</b> Descarga la lista, abre tu galería y busca esas fotos por nombre y fecha para borrarlas. Con una carpeta elegida desde Chrome o Edge en computadora sí las borro de verdad.</div>'}
      <button class="pill soft big" id="list">Descargar lista de nombres</button>
      ${navigator.share ? '<button class="pill soft big" id="share">Compartir lista</button>' : ''}`;
    $('#hb').onclick = () => { screen = 'hub'; render(); };
    app.querySelectorAll('.tile').forEach((t) => (t.onclick = () => { setDec(items[+t.dataset.id], 'k'); toast('Rescatada'); trash(); }));
    const txt = () => 'Fotos para borrar (Guaco Swipe)\n\n' + del.map((i) => `${i.name}\t${fmtDate(i.mod)}\t${mb(i.size)}`).join('\n');
    $('#list').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt()], { type: 'text/plain' })); a.download = 'fotos-para-borrar.txt'; a.click(); };
    const sh = $('#share'); if (sh) sh.onclick = () => navigator.share({ title: 'Fotos para borrar', text: txt() }).catch(() => {});
    const nb = $('#nat'); if (nb) nb.onclick = () => {
      if (!confirm(`Voy a mover ${nf(del.length)} fotos a la papelera (${mb(freed)}). Android te pedirá confirmar. ¿Seguimos?`)) return;
      window.__deleted = (ids, err) => {
        const gone = new Set(ids); const n = items.filter((i) => gone.has(i.nid)).length;
        items = items.filter((i) => !gone.has(i.nid)); items.forEach((i, k) => (i.id = k)); buildGroups();
        toast(n ? `Listo: ${nf(n)} fotos en la papelera` : err ? 'No se pudo borrar (' + err + ')' : 'No se borró ninguna foto'); screen = 'hub'; render();
      };
      toast('Esperando tu confirmación…'); Android.deleteBatch(JSON.stringify(del.map((i) => i.nid)));
    };
    const rl = $('#real'); if (rl) rl.onclick = async () => {
      if (!confirm(`Voy a borrar ${nf(del.length)} fotos de tu carpeta. Esto NO se puede deshacer. ¿Continuar?`)) return;
      let ok = 0, bad = 0; for (const i of del) { try { if (i.h) { await i.h.dir.removeEntry(i.h.name); ok++; i.gone = true; } } catch (e) { bad++; } }
      items = items.filter((i) => !i.gone); items.forEach((i, n) => (i.id = n)); buildGroups(); toast(`Borradas ${ok}${bad ? ` · ${bad} no se pudieron` : ''}`); screen = 'hub'; render();
    };
  }

  window.__back = () => { if (screen === 'swipe' || screen === 'group' || screen === 'trash') { gsel = null; screen = 'hub'; render(); return true; } if (screen === 'hub' && items.length) { return false; } return false; };
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (window.J && J.mascotCss) { const st = document.createElement('style'); st.textContent = J.mascotCss; document.head.appendChild(st); }
  render();
})();
