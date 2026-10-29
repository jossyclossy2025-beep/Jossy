/* Pantallas "Hoy" distintas por temática: cada una reorganiza TODO (estructura, no solo colores). */
(function (J) {
  const L = (J.LAYOUT = {});
  const SL = { desayuno: 'platano', comida: 'brocoli', cena: 'berenjena', aperitivo: 'fresa' };
  const pct = (a, b) => Math.max(0, Math.min(1, a / (b || 1)));

  // datos de una comida del día
  const meal = (c, x) => {
    const pe = x.pe;
    return {
      s: x.s, nm: x.nm, done: x.done, title: pe ? pe.r.name : 'Sin plan todavía', kcal: pe ? pe.kcal : 0,
      open: pe ? `data-a="rec" data-id="${pe.id}"` : 'data-a="genplan"', chk: `data-a="eatslot" data-slot="${x.s}"`, has: !!pe,
    };
  };
  const drops = (c, cls, inner) => Array.from({ length: 8 }, (_, i) => `<button class="${cls} ${i < c.water ? 'on' : ''}" data-a="water" data-i="${i}" aria-label="Vaso ${i + 1} de 8">${inner(i < c.water)}</button>`).join('');
  const work = (c, cls, label) => !c.w[0] ? `<div class="${cls}"><span>${c.w[2]}</span></div>` : `<button class="${cls}" data-a="startweek"><span>${c.workDone ? '¡Rutina lista! Otra vez' : label}</span><b>${c.w[2]} · ${c.w[1]} min</b></button>`;
  const head = (c, kick, title, cls) => `<header class="lh ${cls || ''}"><div><div class="lk">${kick}</div><h1 class="lt">${title}</h1></div><div class="lb"><button class="dot press" data-a="tab" data-t="temas" aria-label="Temáticas">${c.ic('palette', 22)}</button><button class="dot press" data-a="tab" data-t="yo" aria-label="Mi perfil">${c.ic('user', 22)}</button></div></header>`;
  const extra = (c) => `<div class="lx"><button class="pill soft" data-a="lflog">${c.ic('plus', 16, 3)} Registrar otra comida</button></div>`;
  const macros = (c) => [['Proteína', c.tot.p, c.t.p], ['Carbos', c.tot.ch, c.t.ch], ['Grasas', c.tot.f, c.t.f]];

  /* ATARDECER: el camino del sol (línea de tiempo vertical en zigzag) */
  L.sunset = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal), a = p * Math.PI, sx = 170 - 150 * Math.cos(a), sy = 165 - 150 * Math.sin(a);
    return `<div class="L L-sunset">${head(c, c.greet, 'Camino del sol')}
      <section class="arc"><svg viewBox="0 0 340 190" role="img" aria-label="${c.nf(c.tot.kcal)} de ${c.nf(c.t.kcal)} calorías"><path d="M20 165A150 150 0 0 1 320 165" fill="none" stroke="currentColor" stroke-opacity=".25" stroke-width="10" stroke-linecap="round" stroke-dasharray="2 14"/><path d="M20 165A150 150 0 0 1 320 165" fill="none" stroke="var(--butter)" stroke-width="10" stroke-linecap="round" stroke-dasharray="471" stroke-dashoffset="${(471 * (1 - p)).toFixed(0)}"/><circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="14" fill="var(--butter)" stroke="var(--card)" stroke-width="4"/></svg><div class="big"><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span></div></section>
      <ol class="path">${c.slots.map((x, i) => { const m = meal(c, x); return `<li class="${i % 2 ? 'r' : 'l'} ${m.done ? 'done' : ''}"><button class="stop" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 18, 3.4) : ''}</button><button class="bub" ${m.open}><small>${m.nm}</small><b>${c.esc(m.title)}</b>${m.has ? `<i>${m.kcal} kcal</i>` : ''}</button></li>`; }).join('')}</ol>
      <div class="sunrow"><div class="wl">${c.water} de 8 vasos</div><div class="dr">${drops(c, 'sd', (on) => `<span></span>`)}</div></div>
      ${work(c, 'sunwork', 'Hoy toca entrenar')}${extra(c)}</div>`;
  };

  /* PLAYA: nivel de marea + conchas que se deslizan de lado */
  L.beach = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal);
    return `<div class="L L-beach">${head(c, c.greet, 'Marea de hoy')}
      <section class="tide"><div class="glass" role="img" aria-label="${Math.round(p * 100)}% de tus calorías"><div class="lvl" style="transform:scaleY(${p.toFixed(2)})"></div><div class="num"><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span></div></div>
      <div class="side"><div class="mini">${macros(c).map((m) => `<div><span>${m[0]}</span><b>${Math.round(m[1])}/${m[2]} g</b></div>`).join('')}</div><div class="bot">${drops(c, 'bt', () => '')}</div><div class="wl">${c.water} de 8 vasos de agua</div></div></section>
      <div class="hint">desliza para ver tus comidas →</div>
      <div class="shells">${c.slots.map((x) => { const m = meal(c, x); return `<article class="shell ${m.done ? 'done' : ''}"><small>${m.nm}</small><button class="ttl" ${m.open}>${c.esc(m.title)}</button><div class="ft"><b>${m.has ? m.kcal + ' kcal' : ''}</b><button class="mk" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 20, 3.4) : 'Listo'}</button></div></article>`; }).join('')}</div>
      ${work(c, 'surf', 'Hora de surfear')}${extra(c)}</div>`;
  };

  /* CIELO: globo de calorías y nubes escalonadas */
  L.sky = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal), C = 2 * Math.PI * 62;
    return `<div class="L L-sky">${head(c, c.greet, 'Mi cielo')}
      <section class="balloon"><svg viewBox="0 0 170 190" aria-hidden="true"><circle cx="85" cy="82" r="62" fill="var(--card)" stroke="var(--line)" stroke-width="3"/><circle cx="85" cy="82" r="62" fill="none" stroke="var(--pink)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C.toFixed(0)}" stroke-dashoffset="${(C * (1 - p)).toFixed(0)}" transform="rotate(-90 85 82)"/><path d="M60 148h50l-8 22H68z" fill="var(--butter)"/><path d="M70 144l-2 6M100 144l2 6" stroke="var(--ink)" stroke-width="2"/></svg><div class="num"><b>${c.nf(c.tot.kcal)}</b><span>kcal</span></div></section>
      <div class="clouds">${c.slots.map((x) => { const m = meal(c, x); return `<div class="cl ${m.done ? 'done' : ''}"><button class="in" ${m.open}><small>${m.nm}</small><b>${c.esc(m.title)}</b>${m.has ? `<i>${m.kcal} kcal</i>` : ''}</button><button class="mk" ${m.chk} aria-label="Marcar ${m.nm}">${c.ic('check', 18, 3.4)}</button></div>`; }).join('')}</div>
      <div class="rain"><span>${c.water}/8</span>${drops(c, 'rd', () => '')}</div>
      ${work(c, 'skywork', 'Vuela un poco')}${extra(c)}</div>`;
  };

  /* JARDÍN: macetas que florecen al comer */
  L.garden = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal);
    return `<div class="L L-garden">${head(c, c.greet, 'Mi macetero')}
      <section class="sunbar"><div class="lab"><span>Sol de hoy</span><b>${c.nf(c.tot.kcal)} / ${c.nf(c.t.kcal)} kcal</b></div><div class="rail"><i style="transform:scaleX(${p.toFixed(2)})"></i></div></section>
      <div class="pots">${c.slots.map((x) => { const m = meal(c, x); return `<article class="pot ${m.done ? 'done' : ''}"><div class="plant">${m.done ? c.mas(SL[x.s], 66, {}) : `<svg width="40" height="50" viewBox="0 0 40 50" aria-hidden="true"><path d="M20 48V24" stroke="var(--avo-d)" stroke-width="4" stroke-linecap="round"/><path d="M20 28C8 28 4 18 4 10c10 0 16 6 16 18zM20 32c0-10 6-16 16-16 0 8-4 16-16 16z" fill="var(--avo)"/></svg>`}</div><div class="soil"><small>${m.nm}</small><button class="ttl" ${m.open}>${c.esc(m.title)}</button><button class="mk" ${m.chk}>${m.done ? 'Cosechada' : 'Regar y comer'}</button></div></article>`; }).join('')}</div>
      <section class="can"><span>Regadera</span>${drops(c, 'cd', () => '')}<b>${c.water}/8</b></section>
      ${work(c, 'gwork', 'Toca ejercitar')}${extra(c)}</div>`;
  };

  /* GALAXIA: planetas que orbitan un planeta central */
  L.galaxy = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal), C = 2 * Math.PI * 70, pos = [['50%', '8%'], ['90%', '50%'], ['50%', '92%'], ['10%', '50%']];
    return `<div class="L L-galaxy">${head(c, c.greet, 'Órbita')}
      <section class="orb"><i class="r1"></i><i class="r2"></i>
        <div class="core"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="70" fill="none" stroke="var(--line)" stroke-width="8"/><circle cx="80" cy="80" r="70" fill="none" stroke="var(--pink)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C.toFixed(0)}" stroke-dashoffset="${(C * (1 - p)).toFixed(0)}" transform="rotate(-90 80 80)"/></svg><div><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)}</span></div></div>
        ${c.slots.map((x, i) => { const m = meal(c, x); return `<div class="pl ${m.done ? 'done' : ''}" style="left:${pos[i][0]};top:${pos[i][1]}"><button class="ball" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 24, 3.4) : c.esc(m.nm.slice(0, 3))}</button><button class="cap" ${m.open}>${m.nm}${m.has ? ' · ' + m.kcal : ''}</button></div>`; }).join('')}
      </section>
      <section class="log">${macros(c).map((m) => `<div><span>${m[0]}</span><i><u style="transform:scaleX(${pct(m[1], m[2]).toFixed(2)})"></u></i></div>`).join('')}<div class="wa"><span>Combustible (agua)</span><div>${drops(c, 'wd', () => '')}</div></div></section>
      ${work(c, 'gxwork', 'Misión de entrenamiento')}${extra(c)}</div>`;
  };

  /* ARCADE: HUD de videojuego con misiones */
  L.arcade = (c) => {
    const hp = Math.round(pct(c.tot.kcal, c.t.kcal) * 10);
    return `<div class="L L-arcade"><header class="hud"><div><small>JUGADOR</small><b>${c.esc(c.name || 'GUACO')}</b></div><div><small>NIVEL</small><b>${c.lvl}</b></div><div><small>PUNTOS</small><b>${String(c.pts).padStart(4, '0')}</b></div><div class="lb"><button class="dot press" data-a="tab" data-t="temas" aria-label="Temáticas">${c.ic('palette', 22)}</button><button class="dot press" data-a="tab" data-t="yo" aria-label="Mi perfil">${c.ic('user', 22)}</button></div></header>
      <section class="nrg"><span>ENERGÍA</span><div class="seg10">${Array.from({ length: 10 }, (_, i) => `<i class="${i < hp ? 'on' : ''}"></i>`).join('')}</div><b>${c.nf(c.tot.kcal)}/${c.nf(c.t.kcal)}</b></section>
      <h2 class="q">MISIONES DE HOY</h2>
      <ol class="quests">${c.slots.map((x, i) => { const m = meal(c, x); return `<li class="${m.done ? 'done' : ''}"><button class="qb" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? 'X' : ' '}</button><button class="qt" ${m.open}><small>MISIÓN ${i + 1} · ${m.nm.toUpperCase()}</small><b>${c.esc(m.title)}</b></button><em>${m.has ? '+' + m.kcal : '--'}</em></li>`; }).join('')}
        <li class="${c.water >= 8 ? 'done' : ''}"><span class="qb">${c.water >= 8 ? 'X' : ' '}</span><div class="qt"><small>MISIÓN 5 · AGUA</small><div class="hearts">${drops(c, 'hh', (on) => (on ? '♥' : '♡'))}</div></div><em>${c.water}/8</em></li></ol>
      ${work(c, 'boss', 'JEFE FINAL')}${extra(c)}</div>`;
  };

  /* CUADERNO: agenda con papel rayado, tareas y notas pegadas */
  L.notebook = (c) => `<div class="L L-notebook">${head(c, c.dateTxt, 'Mi agenda')}
      <section class="paper"><div class="ln hd">Lo que como hoy</div>${c.slots.map((x) => { const m = meal(c, x); return `<div class="ln it ${m.done ? 'done' : ''}"><button class="bx" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 18, 3.4) : ''}</button><button class="tx" ${m.open}><u>${m.nm}:</u> ${c.esc(m.title)}${m.has ? ' (' + m.kcal + ' kcal)' : ''}</button></div>`; }).join('')}
        <div class="ln it"><span class="tx"><u>Agua:</u> ${'|||| '.repeat(Math.floor(c.water / 5)) + '|'.repeat(c.water % 5)}</span><span class="cnt">${c.water}/8</span><button class="plus" data-a="water" data-i="${Math.min(7, c.water)}" aria-label="Agregar un vaso">+</button></div>
        <div class="ln it"><span class="tx"><u>Ejercicio:</u> ${c.w[0] ? c.w[2] + ' · ' + c.w[1] + ' min' : c.w[2]}</span>${c.w[0] ? '<button class="go" data-a="startweek">Empezar</button>' : ''}</div></section>
      <section class="notes"><div class="sum">Total del día<b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span></div>${macros(c).map((m, i) => `<div class="sticky s${i}"><span>${m[0]}</span><b>${Math.round(m[1])}</b><small>de ${m[2]} g</small></div>`).join('')}</section>${extra(c)}</div>`;

  /* MATCHA: minimalista, mucho espacio, una sola figura (enso) */
  L.matcha = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal), C = 2 * Math.PI * 82;
    return `<div class="L L-matcha">${head(c, c.greet, 'Hoy')}
      <section class="enso"><svg viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="82" fill="none" stroke="var(--line)" stroke-width="3"/><circle cx="100" cy="100" r="82" fill="none" stroke="var(--ink)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C.toFixed(0)}" stroke-dashoffset="${(C * (1 - p * 0.92)).toFixed(0)}" transform="rotate(-100 100 100)"/></svg><div><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span></div></section>
      <ol class="ma">${c.slots.map((x, i) => { const m = meal(c, x); return `<li class="${m.done ? 'done' : ''}"><span class="kn">${['01', '02', '03', '04'][i]}</span><button class="mt" ${m.open}><small>${m.nm}</small>${c.esc(m.title)}</button><button class="ck" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 16, 3) : ''}</button></li>`; }).join('')}</ol>
      <div class="dots">${drops(c, 'dt', () => '')}</div>${work(c, 'mwork', 'Practicar')}${extra(c)}</div>`;
  };

  /* NEÓN: panel tipo bento con mosaicos */
  L.neon = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal);
    return `<div class="L L-neon">${head(c, c.greet, 'Panel')}
      <div class="bento"><div class="t big"><small>CALORÍAS</small><b>${c.nf(c.tot.kcal)}</b><div class="rail"><i style="transform:scaleX(${p.toFixed(2)})"></i></div><span>meta ${c.nf(c.t.kcal)}</span></div>
      ${macros(c).map((m) => `<div class="t sm"><small>${m[0].toUpperCase()}</small><b>${Math.round(m[1])}</b><span>/ ${m[2]} g</span></div>`).join('')}
      ${c.slots.map((x) => { const m = meal(c, x); return `<div class="t meal ${m.done ? 'done' : ''}"><small>${m.nm.toUpperCase()}</small><button class="ttl" ${m.open}>${c.esc(m.title)}</button><div class="ft"><b>${m.has ? m.kcal : '--'}</b><button class="mk" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 16, 3.4) : 'OK'}</button></div></div>`; }).join('')}
      <div class="t wide"><small>AGUA ${c.water}/8</small><div class="dr">${drops(c, 'nd', () => '')}</div></div>
      ${work(c, 't wide go', 'ENTRENAR')}</div>${extra(c)}</div>`;
  };

  /* INVIERNO: taza que se llena y una sola comida a la vez (pestañas) */
  L.winter = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal), cur = c.slots.find((x) => x.s === c.sel) || c.slots[0], m = meal(c, cur);
    return `<div class="L L-winter">${head(c, c.greet, 'Mi taza de hoy')}
      <section class="mugrow"><div class="mug" role="img" aria-label="${Math.round(p * 100)}% de tus calorías"><div class="fill" style="transform:scaleY(${p.toFixed(2)})"></div><div class="steam"><i></i><i></i><i></i></div></div><div class="info"><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span>${macros(c).map((q) => `<div class="mc"><em>${q[0]}</em><i><u style="transform:scaleX(${pct(q[1], q[2]).toFixed(2)})"></u></i></div>`).join('')}</div></section>
      <div class="tabs2" role="tablist">${c.slots.map((x) => `<button role="tab" aria-selected="${x.s === cur.s}" class="${x.s === cur.s ? 'on' : ''}" data-a="wsel" data-s="${x.s}">${x.nm}${x.done ? ' ✓' : ''}</button>`).join('')}</div>
      <article class="focus ${m.done ? 'done' : ''}"><small>${m.nm}</small><h2>${c.esc(m.title)}</h2>${m.has ? `<p>${m.kcal} kcal</p>` : ''}<div class="ft"><button class="pill soft" ${m.open}>${m.has ? 'Ver receta' : 'Crear mi plan'}</button><button class="pill green" ${m.chk}>${m.done ? 'Desmarcar' : 'Ya comí esto'}</button></div></article>
      <section class="flakes">${c.water}/8 ${drops(c, 'fd', () => '')}</section>${work(c, 'wwork', 'Entrena para entrar en calor')}${extra(c)}</div>`;
  };
})(window.J = window.J || {});
