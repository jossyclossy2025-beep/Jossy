/* Pantallas "Hoy" de las temáticas extra: cada una con una estructura distinta. */
(function (J) {
  const L = J.LAYOUT, { meal, drops, work, head, extra, macros, pct, SL } = J.LK;
  const hhmm = (h) => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
  const TIME = { desayuno: 8, comida: 14, aperitivo: 17, cena: 20 };

  /* OCÉANO: burbujas flotando */
  L.ocean = (c) => {
    const pos = [[26, 14], [74, 30], [28, 58], [72, 80]], p = pct(c.tot.kcal, c.t.kcal);
    return `<div class="L L-ocean">${head(c, c.greet, 'Mar de hoy')}
      <section class="sea">${c.slots.map((x, i) => { const m = meal(c, x); return `<div class="bb ${m.done ? 'done' : ''}" style="left:${pos[i][0]}%;top:${pos[i][1]}%"><button class="in" ${m.open}><small>${m.nm}</small><b>${c.esc(m.title)}</b><i>${m.has ? m.kcal + ' kcal' : ''}</i></button><button class="mk" ${m.chk} aria-label="Marcar ${m.nm}">${c.ic('check', 16, 3.4)}</button></div>`; }).join('')}
        <div class="core"><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span><u style="transform:scaleX(${p.toFixed(2)})"></u></div></section>
      <div class="air">${drops(c, 'ab', () => '')}</div><div class="airl">${c.water} de 8 burbujas de agua</div>${work(c, 'owork', 'A nadar')}${extra(c)}</div>`;
  };

  /* DULCERÍA: estantes con frascos */
  L.bakery = (c) => `<div class="L L-bakery">${head(c, c.greet, 'Mostrador')}
      <div class="tag"><small>Hoy llevas</small><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span></div>
      ${c.slots.map((x) => { const m = meal(c, x); return `<section class="shelf ${m.done ? 'done' : ''}"><div class="jar">${m.done ? c.mas(SL[x.s], 54, {}) : '<i></i>'}</div><button class="lab" ${m.open}><small>${m.nm}</small><b>${c.esc(m.title)}</b>${m.has ? `<em>$ ${m.kcal} kcal</em>` : ''}</button><button class="buy" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 20, 3.4) : 'Listo'}</button></section>`; }).join('')}
      <div class="candy"><span>Agua</span>${drops(c, 'cdy', () => '')}</div>${work(c, 'bwork', 'Quema el postre')}${extra(c)}</div>`;

  /* CAFÉ: reloj de 24 horas */
  L.cafe = (c) => {
    const pt = (h, r) => { const a = (h / 24) * 2 * Math.PI - Math.PI / 2; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; }, nw = pt(c.hr, 34);
    return `<div class="L L-cafe">${head(c, c.dateTxt, 'Reloj del día')}
      <section class="dial"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="var(--ink)" stroke-width="1.2"/>${Array.from({ length: 24 }, (_, i) => { const a = pt(i, 46), b = pt(i, i % 6 ? 43.5 : 41); return `<path d="M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${b[0].toFixed(1)} ${b[1].toFixed(1)}" stroke="var(--ink)" stroke-width="${i % 6 ? .5 : 1.2}"/>`; }).join('')}<path d="M50 50L${nw[0].toFixed(1)} ${nw[1].toFixed(1)}" stroke="var(--avo-d)" stroke-width="1.6" stroke-linecap="round"/><circle cx="50" cy="50" r="2.4" fill="var(--avo-d)"/></svg>
        <div class="mid"><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span></div>
        ${c.slots.map((x) => { const m = meal(c, x), q = pt(TIME[x.s], 34); return `<button class="mark ${m.done ? 'done' : ''}" style="left:${q[0].toFixed(1)}%;top:${q[1].toFixed(1)}%" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 18, 3.4) : m.nm[0]}</button>`; }).join('')}</section>
      <ol class="agenda">${[...c.slots].sort((a, b) => TIME[a.s] - TIME[b.s]).map((x) => { const m = meal(c, x); return `<li class="${m.done ? 'done' : ''}"><time>${hhmm(TIME[x.s])}</time><button ${m.open}><small>${m.nm}</small>${c.esc(m.title)}</button><b>${m.has ? m.kcal : ''}</b></li>`; }).join('')}</ol>
      <div class="cups"><span>${c.water}/8 tazas</span>${drops(c, 'cup', () => '')}</div>${work(c, 'cwork', 'Paseo después del café')}${extra(c)}</div>`;
  };

  /* FONDA: menú del día con puntos guía */
  L.fonda = (c) => `<div class="L L-fonda">${head(c, c.greet, 'Menú del día')}
      <section class="menu"><h2>— Hoy se sirve —</h2>${c.slots.map((x) => { const m = meal(c, x); return `<div class="item ${m.done ? 'done' : ''}"><button class="nm" ${m.open}><span>${m.nm}</span><i></i><b>${m.has ? m.kcal : '--'}</b></button><p>${c.esc(m.title)}</p><button class="stamp" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? 'SERVIDO' : 'Pedir'}</button></div>`; }).join('')}
        <div class="total"><span>CUENTA</span><i></i><b>${c.nf(c.tot.kcal)} / ${c.nf(c.t.kcal)}</b></div></section>
      <div class="agua"><span>Aguas frescas</span>${drops(c, 'af', () => '')}</div>${work(c, 'fwork', 'Baila para bajar la comida')}${extra(c)}</div>`;

  /* CHAT: conversación con Guaco */
  L.chat = (c) => `<div class="L L-chat"><header class="bar"><div class="av">${c.mas(J.themeById('chat').comp, 40, {})}</div><div><b>Guaco</b><small>en línea · ${c.dateTxt}</small></div><div class="lb"><button class="dot press" data-a="tab" data-t="temas" aria-label="Temáticas">${c.ic('palette', 20)}</button><button class="dot press" data-a="tab" data-t="yo" aria-label="Mi perfil">${c.ic('user', 20)}</button></div></header>
      <div class="msgs"><div class="m in">${c.greet} Llevas <b>${c.nf(c.tot.kcal)}</b> de ${c.nf(c.t.kcal)} kcal.</div>
      ${c.slots.map((x) => { const m = meal(c, x); return `<div class="m in"><small>${m.nm}</small><button class="t" ${m.open}>${c.esc(m.title)}${m.has ? ' · ' + m.kcal + ' kcal' : ''}</button></div>${m.done ? '<div class="m out">¡Ya lo comí! ✓</div>' : `<div class="quick"><button ${m.chk}>Ya lo comí</button></div>`}`; }).join('')}
      <div class="m in">¿Y el agua? Van <b>${c.water}</b> de 8.</div><div class="quick">${drops(c, 'q', (on) => (on ? '💧' : '○'))}</div>
      <div class="m in">${c.w[0] ? `Hoy toca <b>${c.w[2]}</b> (${c.w[1]} min).` : c.w[2]}</div>${c.w[0] ? '<div class="quick"><button data-a="startweek">Empezar rutina</button></div>' : ''}</div>${extra(c)}</div>`;

  /* PERIÓDICO: portada en columnas */
  L.news = (c) => `<div class="L L-news"><header class="mast"><div class="rule"></div><h1>El Diario del Guaco</h1><div class="rule"></div><div class="sub"><span>${c.dateTxt}</span><span class="lb"><button class="dot press" data-a="tab" data-t="temas" aria-label="Temáticas">${c.ic('palette', 18)}</button><button class="dot press" data-a="tab" data-t="yo" aria-label="Mi perfil">${c.ic('user', 18)}</button></span></div></header>
      <h2 class="head">Calorías llegan a ${c.nf(c.tot.kcal)} de ${c.nf(c.t.kcal)}</h2>
      <div class="cols">${c.slots.map((x) => { const m = meal(c, x); return `<article class="${m.done ? 'done' : ''}"><small>${m.nm.toUpperCase()}</small><button class="hl" ${m.open}>${c.esc(m.title)}</button><p>${m.has ? m.kcal + ' kcal.' : 'Aún sin plan.'}</p><button class="conf" ${m.chk}>${m.done ? '✓ Confirmado' : 'Confirmar'}</button></article>`; }).join('')}</div>
      <div class="boxes"><div><small>CLIMA</small><b>${c.water}/8 vasos</b><div class="dr">${drops(c, 'nw', () => '')}</div></div><div><small>DEPORTES</small>${work(c, 'nwk', 'Rutina de hoy')}</div></div>${extra(c)}</div>`;

  /* CARRETERA: tablero de auto */
  L.road = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal), ang = -90 + p * 180, wp = pct(c.water, 8);
    return `<div class="L L-road">${head(c, c.greet, 'Tablero')}
      <section class="gauges"><div class="g big"><svg viewBox="0 0 200 120" aria-hidden="true"><path d="M20 110A80 80 0 0 1 180 110" fill="none" stroke="var(--line)" stroke-width="14" stroke-linecap="round"/><path d="M20 110A80 80 0 0 1 180 110" fill="none" stroke="var(--avo)" stroke-width="14" stroke-linecap="round" stroke-dasharray="251" stroke-dashoffset="${(251 * (1 - p)).toFixed(0)}"/><g transform="rotate(${ang.toFixed(0)} 100 110)"><path d="M100 110V44" stroke="var(--pink)" stroke-width="4" stroke-linecap="round"/></g><circle cx="100" cy="110" r="8" fill="var(--ink)"/></svg><b>${c.nf(c.tot.kcal)}</b><span>kcal · meta ${c.nf(c.t.kcal)}</span></div>
        <div class="g sm"><small>COMBUSTIBLE</small><div class="tank"><i style="transform:scaleY(${wp.toFixed(2)})"></i></div><span>${c.water}/8</span></div></section>
      ${c.slots.map((x, i) => { const m = meal(c, x); return `<div class="sign ${m.done ? 'done' : ''}"><button class="ex" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 22, 3.4) : i + 1}</button><button class="tx" ${m.open}><small>SALIDA ${i + 1} · ${m.nm.toUpperCase()}</small><b>${c.esc(m.title)}</b></button><em>${m.has ? m.kcal : ''}</em></div>`; }).join('')}
      <div class="drops">${drops(c, 'rdd', () => '')}</div>${work(c, 'rwork', 'Autopista del ejercicio')}${extra(c)}</div>`;
  };

  /* ISLA DEL TESORO: mapa con islas */
  L.island = (c) => {
    const pos = [[22, 12], [72, 30], [26, 52], [70, 74]];
    return `<div class="L L-island">${head(c, c.greet, 'Mapa del tesoro')}
      <section class="map"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M22 18C60 20 80 22 72 36S30 40 26 58 80 62 70 80" fill="none" stroke="var(--ink)" stroke-width=".8" stroke-dasharray="2 2.2"/></svg>
        ${c.slots.map((x, i) => { const m = meal(c, x); return `<div class="isl ${m.done ? 'done' : ''}" style="left:${pos[i][0]}%;top:${pos[i][1]}%"><button class="land" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.mas(SL[x.s], 50, {}) : `<b>${i + 1}</b>`}</button><button class="cap" ${m.open}><small>${m.nm}</small>${c.esc(m.title)}</button></div>`; }).join('')}
        <div class="treasure"><b>X</b><span>${c.nf(c.tot.kcal)} / ${c.nf(c.t.kcal)} kcal</span></div></section>
      <div class="rum"><span>Ron de agua ${c.water}/8</span>${drops(c, 'rm', () => '')}</div>${work(c, 'iwork', 'Zarpa a entrenar')}${extra(c)}</div>`;
  };

  /* BARAJA: cartas que deslizas */
  L.cards = (c) => {
    const S = ['♥', '♠', '♦', '♣'];
    return `<div class="L L-cards">${head(c, c.greet, 'Tu baraja')}
      <div class="deck"><article class="card ace"><i>A♠</i><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span><p>${macros(c).map((m) => `${m[0]} ${Math.round(m[1])}/${m[2]} g`).join(' · ')}</p><i class="r">A♠</i></article>
      ${c.slots.map((x, i) => { const m = meal(c, x); return `<article class="card ${m.done ? 'done' : ''} ${i % 2 ? 'red' : ''}"><i>${i + 2}${S[i]}</i><small>${m.nm}</small><button class="ttl" ${m.open}>${c.esc(m.title)}</button><span>${m.has ? m.kcal + ' kcal' : ''}</span><button class="play" ${m.chk}>${m.done ? 'Jugada ✓' : 'Jugar carta'}</button><i class="r">${i + 2}${S[i]}</i></article>`; }).join('')}</div>
      <div class="hint">desliza para ver tus cartas →</div><div class="chips">${drops(c, 'chp', () => '')}</div>${work(c, 'kwork', 'Apuesta por un entrenamiento')}${extra(c)}</div>`;
  };

  /* TERMINAL: líneas de comandos */
  L.hacker = (c) => `<div class="L L-hacker"><div class="term"><div class="ln">$ guaco --status <span class="lb"><button class="dot press" data-a="tab" data-t="temas" aria-label="Temáticas">${c.ic('palette', 18)}</button><button class="dot press" data-a="tab" data-t="yo" aria-label="Mi perfil">${c.ic('user', 18)}</button></span></div>
      <div class="ln">kcal=${c.nf(c.tot.kcal)}/${c.nf(c.t.kcal)} [${'#'.repeat(Math.round(pct(c.tot.kcal, c.t.kcal) * 20)).padEnd(20, '.')}]</div>
      ${macros(c).map((m) => `<div class="ln dim">${m[0].slice(0, 5).padEnd(5, ' ')}=${Math.round(m[1])}/${m[2]}g</div>`).join('')}
      <div class="ln">$ guaco meals --today</div>
      ${c.slots.map((x) => { const m = meal(c, x); return `<div class="row ${m.done ? 'done' : ''}"><button class="bx" ${m.chk} aria-label="Marcar ${m.nm}">[${m.done ? 'x' : ' '}]</button><button class="tx" ${m.open}>${m.nm.toLowerCase()}: ${c.esc(m.title)} (${m.has ? m.kcal : 0}kcal)</button></div>`; }).join('')}
      <div class="ln">$ guaco water</div><div class="ln">[${'#'.repeat(c.water)}${'.'.repeat(8 - c.water)}] ${c.water}/8 <button class="plus" data-a="water" data-i="${Math.min(7, c.water)}">+1</button></div>
      <div class="ln">$ guaco train</div>${c.w[0] ? `<button class="run" data-a="startweek">&gt; ./${c.w[2].toLowerCase().replace(/\W+/g, '_')} --min=${c.w[1]}</button>` : `<div class="ln dim">${c.w[2]}</div>`}
      <div class="ln"><button class="run" data-a="lflog">&gt; ./registrar_comida</button></div><div class="ln">$ <u>_</u></div></div></div>`;

  /* BOSQUE: anillos de tronco + hongos */
  L.forest = (c) => {
    const rings = [['Calorías', c.tot.kcal, c.t.kcal, 'var(--avo-d)', 70], ['Proteína', c.tot.p, c.t.p, 'var(--pink-d)', 56], ['Carbos', c.tot.ch, c.t.ch, 'var(--butter-d)', 42], ['Grasas', c.tot.f, c.t.f, 'var(--lav-d)', 28]];
    const next = c.slots.find((x) => !x.done) || c.slots[0], nm = meal(c, next);
    return `<div class="L L-forest">${head(c, c.greet, 'Anillos del bosque')}
      <section class="rings"><svg viewBox="0 0 160 160" aria-hidden="true">${rings.map((r) => { const C = 2 * Math.PI * r[4]; return `<circle cx="80" cy="80" r="${r[4]}" fill="none" stroke="var(--line)" stroke-width="10"/><circle cx="80" cy="80" r="${r[4]}" fill="none" stroke="${r[3]}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C.toFixed(0)}" stroke-dashoffset="${(C * (1 - pct(r[1], r[2]))).toFixed(0)}" transform="rotate(-90 80 80)"/>`; }).join('')}</svg>
        <ul>${rings.map((r) => `<li><i style="background:${r[3]}"></i><span>${r[0]}</span><b>${Math.round(r[1])}/${Math.round(r[2])}</b></li>`).join('')}</ul></section>
      <div class="shrooms">${c.slots.map((x) => { const m = meal(c, x); return `<button class="sh ${m.done ? 'done' : ''}" ${m.chk} aria-label="Marcar ${m.nm}">${c.mas(SL[x.s], 46, {})}<small>${m.nm}</small>${m.done ? '<u>✓</u>' : ''}</button>`; }).join('')}</div>
      <article class="nextc"><small>Sigue · ${nm.nm}</small><button class="ttl" ${nm.open}>${c.esc(nm.title)}</button><span>${nm.has ? nm.kcal + ' kcal' : ''}</span></article>
      <div class="dew"><span>Rocío ${c.water}/8</span>${drops(c, 'dw', () => '')}</div>${work(c, 'fwk', 'Camina por el bosque')}${extra(c)}</div>`;
  };

  /* FIESTA: globos */
  L.party = (c) => {
    const col = ['var(--pink)', 'var(--butter)', 'var(--lav)', 'var(--mint)'], rot = [-12, -4, 4, 12];
    return `<div class="L L-party">${head(c, c.greet, '¡Fiesta!')}
      <div class="banner"><span>¡LLEVAS ${c.nf(c.tot.kcal)} DE ${c.nf(c.t.kcal)} KCAL!</span></div>
      <section class="fan">${c.slots.map((x, i) => { const m = meal(c, x); return `<div class="bl ${m.done ? 'done' : ''}" style="transform:rotate(${rot[i]}deg)"><button class="ball" style="background:${col[i]}" ${m.open}><b>${m.nm}</b><span>${m.has ? m.kcal + ' kcal' : '—'}</span></button><i class="str"></i><button class="mk" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? '¡ñam!' : c.ic('check', 16, 3)}</button></div>`; }).join('')}</section>
      <div class="titles">${c.slots.map((x) => { const m = meal(c, x); return `<p><b>${m.nm}:</b> ${c.esc(m.title)}</p>`; }).join('')}</div>
      <div class="conf"><span>${c.water}/8</span>${drops(c, 'cf', () => '')}</div>${work(c, 'pwork', '¡A bailar!')}${extra(c)}</div>`;
  };

  /* CINE: boletos */
  L.cinema = (c) => `<div class="L L-cinema">${head(c, c.greet, 'Cartelera')}
      <div class="bulbs"></div><div class="now"><small>EN CARTELERA HOY</small><b>${c.nf(c.tot.kcal)}</b><span>de ${c.nf(c.t.kcal)} kcal</span></div>
      ${c.slots.map((x, i) => { const m = meal(c, x); return `<div class="tk ${m.done ? 'done' : ''}"><div class="st"><small>FILA</small><b>${i + 1}</b></div><button class="bd" ${m.open}><small>${m.nm.toUpperCase()}</small><b>${c.esc(m.title)}</b><i>${m.has ? m.kcal + ' kcal' : ''}</i></button><button class="ad" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 22, 3.4) : 'ENTRAR'}</button></div>`; }).join('')}
      <div class="pop"><span>Palomitas de agua ${c.water}/8</span>${drops(c, 'pp', () => '')}</div>${work(c, 'xwork', 'Función de ejercicio')}${extra(c)}</div>`;

  /* VOLCÁN: termómetro de lava */
  L.volcano = (c) => {
    const p = pct(c.tot.kcal, c.t.kcal);
    return `<div class="L L-volcano">${head(c, c.greet, 'Lava de hoy')}
      <section class="thermo"><div class="tube" role="img" aria-label="${Math.round(p * 100)}% de tus calorías"><i style="transform:scaleY(${p.toFixed(2)})"></i><b>${c.nf(c.tot.kcal)}</b></div>
        <div class="stack">${c.slots.map((x) => { const m = meal(c, x); return `<div class="lv ${m.done ? 'done' : ''}"><button class="tx" ${m.open}><small>${m.nm}</small><b>${c.esc(m.title)}</b><i>${m.has ? m.kcal + ' kcal' : ''}</i></button><button class="mk" ${m.chk} aria-label="Marcar ${m.nm}">${m.done ? c.ic('check', 20, 3.4) : 'Listo'}</button></div>`; }).join('')}</div></section>
      <div class="rocks"><span>Agua ${c.water}/8</span>${drops(c, 'rk', () => '')}</div>${work(c, 'vwork', 'Entrena con fuego')}${extra(c)}</div>`;
  };
})(window.J = window.J || {});
