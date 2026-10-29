/* Animaciones de los pasos de preparación: cada paso muestra una escena según lo que hay que hacer,
   protagonizada por la mascota del ingrediente. Solo se anima transform y opacity. */
(function (J) {
  const ING = J.ING;
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const STOP = new Set('cocidos cocida cocido natural magra blanco blanca integral griego griega verde puro polvo light fresco firme ligera rallado sin azucar baja sodio'.split(' '));
  // Palabras completas de cada ingrediente (con plural), para no confundir «res» con «reposar»
  const NAMES = Object.keys(ING).map((k) => [k, norm(ING[k][0]).split(' ').filter((w) => w.length >= 3 && !STOP.has(w) && w !== 'de').map((w) => new RegExp('(^|[^a-z])' + w.replace(/s$/, '') + '(s|es)?([^a-z]|$)'))]).filter((x) => x[1].length);
  // Qué ingrediente protagoniza el paso: el primero que aparezca como palabra completa en el texto
  function itemOf(text, fallback) {
    const t = norm(text); let best = null, bestIdx = 1e9;
    for (const [k, res] of NAMES) {
      const m = J.mascotFor(k); if (!m) continue;
      for (const re of res) { const x = t.search(re); if (x >= 0 && x < bestIdx) { bestIdx = x; best = m; } }
    }
    return best || fallback || 'aguacate';
  }
  const RULES = [
    [/lavate las manos|jabon/, 'hands'], [/precalienta|hornea|horno\b|gratina|hornear/, 'bake'], [/\b(licua|licuadora|procesa|tritura|batidora)\b/, 'blend'],
    [/\b(hierve|hervir|cuece|cuecelo|cuecela|olla|vaporera|escalda|cacerola|cazo)\b/, 'boil'], [/sarten|\bsaltea|\bdora\b|dorar|\bsella\b|plancha|parrilla|\bwok\b|\bfrie\b|comal|freidora/, 'pan'],
    [/\b(tuesta|tostador)\b|tostada/, 'toast'], [/\bralla\b/, 'grate'], [/\bexprime\b|exprimidor/, 'squeeze'], [/\bescurre|\bescurr|colador/, 'drain'],
    [/\b(bate|mezcla|revuelve|incorpora|integra|amasa|unta|aplasta|machaca|rompe)\b/, 'mix'], [/\b(corta|pica|picalo|rebana|rebanalos|parte|trocea|cortalo|cortala|cortalos)\b|cubos|tiras|rodajas|ramitos/, 'chop'],
    [/\b(pela|pelala|pelalo|descascara)\b|quita la piel/, 'peel'], [/\b(lava|enjuaga|remoja)\b/, 'wash'], [/\bsazona|pimienta|espolvorea|salpica|ajusta la sazon|\bprueba\b|mezcla el sazonador/, 'season'],
    [/\brefrigera\b|congela|\benfria\b|helad|hielo|si sobra|hermetico/, 'cool'], [/\breposa|deja reposar|\bespera|\btapa\b|descansa|tiempo aproximado/, 'rest'], [/\b(sirve|emplata|acomoda|corona|termina|decora|cubre)\b/, 'serve'],
    [/\bcalienta\b/, 'pan'], [/\bmide\b|separa tus|ten a la mano|ten listo|ten lista|\btaza\b|cuchara|\bsaca\b/, 'measure'],
  ];
  const sceneFor = (text) => { const t = norm(text); const r = RULES.find((x) => x[0].test(t)); return r ? r[1] : 'sparkle'; };

  const col = (k) => (J.MASCOT[k] && J.MASCOT[k].c && J.MASCOT[k].c[0]) || '#7CC35B';
  const it = (k, cx, cy, s, cls, mood, acc) => `<g class="${cls || ''}" ${cls ? 'style="transform-box:fill-box;transform-origin:50% 100%"' : ''}><g transform="translate(${cx - 60 * s} ${cy - 80 * s}) scale(${s})">${J.mascotInner(k, { mood, acc })}</g></g>`;
  const drops = (x, y, n, c) => Array.from({ length: n }, (_, i) => `<ellipse class="a a-drop" cx="${x + (i % 3) * 7 - 7}" cy="${y}" rx="1.8" ry="2.6" fill="${c || '#6EC6FF'}" style="animation-delay:${i * 0.28}s"/>`).join('');
  const sparkle = (x, y, d, c) => `<path class="a a-tw" transform="translate(${x} ${y})" d="M0-5l1.4 3.6L5 0 1.4 1.4 0 5-1.4 1.4-5 0l3.6-1.4z" fill="${c || '#FFD76A'}" style="animation-delay:${d || 0}s"/>`;
  const bubbles = (x, y, n, c) => Array.from({ length: n }, (_, i) => `<circle class="a a-rise" cx="${x + (i * 9) % 22 - 8}" cy="${y}" r="${2 + (i % 3)}" fill="none" stroke="${c || '#fff'}" stroke-width="1.4" style="animation-delay:${i * 0.35}s"/>`).join('');
  const steam = (x, y) => `<path class="a a-rise" d="M${x} ${y}q-3-4 0-8t0-8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/><path class="a a-rise" style="animation-delay:.6s" d="M${x + 7} ${y}q-3-4 0-8t0-8" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" opacity=".8"/>`;

  const S = {
    hands: (k) => `<rect class="a a-rub" x="22" y="30" width="30" height="22" rx="11" fill="#FFD2B0"/><rect class="a a-rub2" x="44" y="28" width="30" height="22" rx="11" fill="#FFC09A"/>${bubbles(48, 30, 6, '#8CCBFF')}${[[30, 24], [66, 22], [50, 14]].map((p, i) => `<circle class="a a-rise" cx="${p[0]}" cy="${p[1]}" r="${3 + i}" fill="#fff" opacity=".85" style="animation-delay:${i * 0.5}s"/>`).join('')}`,
    wash: (k) => `<path d="M10 14h26q8 0 8 8v2" stroke="#9AA9B8" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="42" y="22" width="6" height="5" rx="2" fill="#9AA9B8"/>${drops(45, 30, 6)}${it(k, 58, 54, 0.38, 'a a-bob')}${bubbles(70, 60, 3)}`,
    peel: (k) => `${it(k, 36, 44, 0.42, 'a a-bob')}<g class="a a-slide"><rect x="62" y="16" width="5" height="30" rx="2.5" fill="#B0764A"/><path d="M58 18h13l-2 8H60z" fill="#C9D1D9"/></g><path class="a a-grow" d="M64 48q10 6 2 14t-14 2" stroke="${col(k)}" stroke-width="4" fill="none" stroke-linecap="round" style="transform-origin:50% 0"/>`,
    chop: (k) => `<rect x="8" y="54" width="80" height="12" rx="5" fill="#E2B77A"/><rect x="8" y="54" width="80" height="4" rx="2" fill="#F0CD98"/>${[24, 38, 52].map((x, i) => `<rect class="a a-hop" x="${x}" y="46" width="9" height="9" rx="3" fill="${col(k)}" style="animation-delay:${i * 0.14}s"/>`).join('')}<g class="a a-chop" style="transform-origin:78px 20px"><rect x="74" y="12" width="9" height="14" rx="3" fill="#8A5A36"/><path d="M26 24h54l-2 12H34q-6 0-8-12z" fill="#D9E1EA"/><path d="M26 24h54v3H26z" fill="#fff" opacity=".6"/></g>${it(k, 18, 34, 0.26, 'a a-bob')}`,
    mix: (k) => `<path d="M14 34h68q-2 26-34 28T14 34z" fill="#fff" stroke="#C9B8FF" stroke-width="3"/><path d="M18 38h60q-2 18-30 20T18 38z" fill="${col(k)}" opacity=".85"/><g class="a a-whisk" style="transform-origin:48px 46px"><path d="M48 46L62 8" stroke="#9AA9B8" stroke-width="3" stroke-linecap="round"/><path d="M62 8q8 6 0 16M62 8q-8 6 0 16" stroke="#9AA9B8" stroke-width="2" fill="none"/></g>${drops(30, 30, 3, col(k))}${it(k, 78, 22, 0.28, 'a a-bob', 'wow')}`,
    pan: (k) => `<ellipse cx="44" cy="46" rx="32" ry="10" fill="#4A4F57"/><ellipse cx="44" cy="43" rx="28" ry="8" fill="#6B7280"/><rect x="72" y="42" width="22" height="6" rx="3" fill="#4A4F57"/>${it(k, 44, 32, 0.4, 'a a-hop')}${[26, 44, 62].map((x, i) => `<path class="a a-flick" d="M${x} 64q-6-8 0-16 6 8 0 16z" fill="${['#FF7B3A', '#FFB02E', '#FF5A3A'][i]}" style="transform-origin:${x}px 64px;animation-delay:${i * 0.15}s"/>`).join('')}${steam(34, 24)}`,
    boil: (k) => `<rect x="18" y="32" width="58" height="30" rx="8" fill="#9AA9B8"/><rect x="12" y="38" width="8" height="5" rx="2.5" fill="#6B7280"/><rect x="74" y="38" width="8" height="5" rx="2.5" fill="#6B7280"/><path d="M22 36h50v6H22z" fill="#6EC6FF" opacity=".7"/>${it(k, 47, 28, 0.3, 'a a-bob')}${bubbles(40, 52, 5, '#fff')}<g class="a a-shake" style="transform-origin:47px 22px"><path d="M16 30h62q-4-10-31-10T16 30z" fill="#C9D1D9"/><circle cx="47" cy="19" r="3" fill="#6B7280"/></g>${steam(30, 16)}`,
    bake: (k) => `<rect x="10" y="14" width="76" height="52" rx="10" fill="#C9D1D9"/><rect x="18" y="30" width="60" height="28" rx="6" fill="#3A2F2A"/><rect class="a a-glow" x="20" y="32" width="56" height="24" rx="5" fill="#FF9F43"/>${it(k, 48, 46, 0.28, 'a a-bob')}<circle cx="24" cy="22" r="4" fill="#6B7280"/><circle cx="38" cy="22" r="4" fill="#6B7280"/><circle cx="72" cy="22" r="7" fill="#fff"/><path class="a a-spin" d="M72 22V17" stroke="#3A2142" stroke-width="2" stroke-linecap="round" style="transform-origin:72px 22px"/>`,
    blend: (k) => `<path d="M26 12h44l-6 44H32z" fill="#E6F4FF" stroke="#9AC8EE" stroke-width="2.5"/><path d="M31 32h34l-3 24H34z" fill="${col(k)}" opacity=".9"/><g class="a a-spin2" style="transform-origin:48px 44px"><path d="M36 44h24M48 34v20" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/></g><rect x="22" y="56" width="52" height="12" rx="5" fill="#6B7280"/><rect x="28" y="6" width="40" height="7" rx="3" fill="#9AA9B8"/>${drops(48, 26, 3, col(k))}${sparkle(80, 20, 0)}`,
    season: (k) => `<g class="a a-tilt" style="transform-origin:62px 18px"><path d="M52 8h20l2 14H50z" fill="#fff" stroke="#C9D1D9" stroke-width="2"/><rect x="52" y="4" width="20" height="6" rx="3" fill="#9AA9B8"/>${[56, 62, 68].map((x) => `<circle cx="${x}" cy="16" r="1" fill="#9AA9B8"/>`).join('')}</g>${[52, 58, 64, 70].map((x, i) => `<circle class="a a-drop2" cx="${x - 8}" cy="26" r="1.4" fill="#fff" stroke="#C9D1D9" stroke-width=".6" style="animation-delay:${i * 0.2}s"/>`).join('')}${it(k, 40, 52, 0.42, 'a a-bob')}`,
    rest: (k) => `${it(k, 44, 46, 0.46, 'a a-bob', 'sleepy')}<text class="a a-zzz" x="64" y="26" font-family="sans-serif" font-weight="700" font-size="13" fill="#9B7BFF">z</text><text class="a a-zzz" style="animation-delay:.8s" x="74" y="16" font-family="sans-serif" font-weight="700" font-size="10" fill="#9B7BFF">z</text><circle cx="16" cy="16" r="9" fill="#fff" stroke="#C9B8FF" stroke-width="2"/><path class="a a-spin" d="M16 16V10" stroke="#3A2142" stroke-width="2" stroke-linecap="round" style="transform-origin:16px 16px"/>`,
    cool: (k) => `<g class="a a-shiver">${it(k, 48, 48, 0.44, '', 'wow')}</g><g class="a a-spin2" style="transform-origin:76px 20px"><path d="M76 8v24M66 14l20 12M66 26l20-12" stroke="#8CCBFF" stroke-width="2.6" stroke-linecap="round"/></g><g class="a a-spin2" style="transform-origin:16px 52px;animation-direction:reverse"><path d="M16 44v16M9 48l14 8M9 56l14-8" stroke="#BFE6FF" stroke-width="2" stroke-linecap="round"/></g>${sparkle(30, 14, 0.3, '#BFE6FF')}`,
    serve: (k) => `<ellipse cx="48" cy="58" rx="36" ry="9" fill="#fff" stroke="#E8DCD0" stroke-width="2"/><ellipse cx="48" cy="56" rx="26" ry="6" fill="#F5EFE6"/>${it(k, 48, 40, 0.42, 'a a-hop', 'happy', 'chef')}${sparkle(14, 20, 0)}${sparkle(82, 26, 0.5)}${sparkle(70, 8, 1, '#fff')}${steam(30, 40)}`,
    drain: (k) => `<path d="M16 28h64q-2 28-32 30T16 28z" fill="#C9D1D9" stroke="#9AA9B8" stroke-width="2.5"/>${[30, 42, 54, 66].map((x) => `<circle cx="${x}" cy="44" r="1.8" fill="#6B7280"/>`).join('')}${it(k, 48, 24, 0.36, 'a a-bob')}${drops(48, 58, 6)}`,
    measure: (k) => `<path d="M24 14h40l-4 48H28z" fill="#E6F4FF" stroke="#9AC8EE" stroke-width="2.5"/><rect class="a a-level" x="28" y="26" width="32" height="34" rx="3" fill="${col(k)}" opacity=".9" style="transform-origin:44px 60px"/>${[22, 32, 42, 52].map((y) => `<path d="M24 ${y}h8" stroke="#6B7280" stroke-width="1.6"/>`).join('')}<g class="a a-slide"><ellipse cx="76" cy="26" rx="9" ry="6" fill="#C9D1D9"/><rect x="74" y="30" width="4" height="22" rx="2" fill="#9AA9B8"/></g>${it(k, 12, 52, 0.22, 'a a-bob')}`,
    grate: (k) => `<path d="M30 14h36l8 50H22z" fill="#C9D1D9" stroke="#9AA9B8" stroke-width="2.5"/>${[36, 46, 56].map((y) => `<g fill="#6B7280"><circle cx="38" cy="${y}" r="1.8"/><circle cx="48" cy="${y}" r="1.8"/><circle cx="58" cy="${y}" r="1.8"/></g>`).join('')}<g class="a a-slide">${it(k, 76, 22, 0.28, '', 'wow')}</g>${[30, 40, 50, 60].map((x, i) => `<rect class="a a-drop2" x="${x}" y="64" width="3" height="6" rx="1.5" fill="${col(k)}" style="animation-delay:${i * 0.25}s"/>`).join('')}`,
    squeeze: (k) => `<g class="a a-squash" style="transform-origin:50% 100%">${it('limon', 44, 38, 0.42, '', 'wow')}</g>${drops(44, 54, 5, '#E4F27A')}<path d="M18 62h52" stroke="#E2B77A" stroke-width="5" stroke-linecap="round"/>${sparkle(78, 18, 0.2)}`,
    toast: (k) => `<rect x="14" y="30" width="68" height="34" rx="10" fill="#C9D1D9"/><rect x="24" y="34" width="48" height="6" rx="3" fill="#3A2F2A"/><rect class="a a-pop" x="28" y="26" width="40" height="24" rx="6" fill="#E8B779"/><rect class="a a-pop" x="31" y="29" width="34" height="18" rx="4" fill="#F4D6A8"/>${sparkle(84, 18, 0)}<circle cx="72" cy="52" r="3" fill="#FF7B6B"/>${it(k, 12, 22, 0.22, 'a a-bob')}`,
    sparkle: (k) => `${it(k, 48, 44, 0.5, 'a a-bob')}${sparkle(14, 18, 0)}${sparkle(82, 22, 0.6)}${sparkle(74, 56, 1.1, '#fff')}`,
  };

  J.stepScene = function (text, fallbackKey) {
    const k = itemOf(text, fallbackKey), id = sceneFor(text);
    return `<svg class="scn" viewBox="0 0 96 72" width="96" height="72" aria-hidden="true" focusable="false">${S[id](k)}</svg>`;
  };
  J.sceneName = sceneFor;
  J.sceneInner = (id, key) => S[id](key);
  // Pausa las escenas que no se ven en pantalla
  J.watchScenes = function (root) {
    const els = root.querySelectorAll('.scn'); if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('play')); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('play', e.isIntersecting)), { root: null, threshold: 0.1 });
    els.forEach((e) => io.observe(e));
  };

  J.animCss = `.scn{flex:none;border-radius:20px;background:var(--scn-bg,rgba(255,255,255,.55));overflow:hidden}
.scn .a{transform-box:fill-box;transform-origin:50% 50%;animation-play-state:paused}.scn.play .a,.scn.play *{animation-play-state:running}
.scn .a-bob{animation:abob 1.8s ease-in-out infinite}.scn .a-hop{animation:ahop 1.1s cubic-bezier(.23,1,.32,1) infinite}.scn .a-drop{animation:adrop 1.4s cubic-bezier(.23,1,.32,1) infinite}.scn .a-drop2{animation:adrop2 1.2s ease-in infinite}
.scn .a-rise{animation:arise 2.2s ease-out infinite}.scn .a-flick{animation:aflick .5s ease-in-out infinite alternate}.scn .a-shake{animation:ashake .5s ease-in-out infinite alternate}.scn .a-spin{animation:aspin 4s linear infinite}.scn .a-spin2{animation:aspin 1.2s linear infinite}
.scn .a-chop{animation:achop 1.1s cubic-bezier(.23,1,.32,1) infinite}.scn .a-slide{animation:aslide 1.6s ease-in-out infinite alternate}.scn .a-tw{animation:atw 1.6s ease-in-out infinite}.scn .a-tilt{animation:atilt 1.4s ease-in-out infinite alternate}
.scn .a-squash{animation:asquash 1s ease-in-out infinite alternate}.scn .a-grow{animation:agrow 1.6s cubic-bezier(.23,1,.32,1) infinite}.scn .a-pop{animation:apop 1.8s cubic-bezier(.23,1,.32,1) infinite}.scn .a-level{animation:alevel 2.4s cubic-bezier(.23,1,.32,1) infinite alternate}
.scn .a-zzz{animation:azzz 2.2s ease-out infinite}.scn .a-shiver{animation:ashiver .25s linear infinite alternate}.scn .a-rub{animation:arub .5s ease-in-out infinite alternate}.scn .a-rub2{animation:arub .5s ease-in-out infinite alternate-reverse}
.scn .a-whisk{animation:awhisk .7s ease-in-out infinite alternate}.scn .a-glow{animation:aglow 1.6s ease-in-out infinite alternate}
@keyframes abob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes ahop{0%,100%{transform:translateY(0) scale(1.04,.95)}35%{transform:translateY(-8px) scale(.97,1.04)}}
@keyframes adrop{0%{transform:translateY(-4px);opacity:0}20%{opacity:1}100%{transform:translateY(22px);opacity:0}}
@keyframes adrop2{0%{transform:translateY(0);opacity:0}15%{opacity:1}100%{transform:translateY(26px);opacity:0}}
@keyframes arise{0%{transform:translateY(0);opacity:0}25%{opacity:.9}100%{transform:translateY(-20px);opacity:0}}
@keyframes aflick{from{transform:scaleY(1) scaleX(1)}to{transform:scaleY(1.3) scaleX(.9)}}
@keyframes ashake{from{transform:rotate(-3deg) translateY(0)}to{transform:rotate(3deg) translateY(-1.5px)}}
@keyframes aspin{to{transform:rotate(360deg)}}
@keyframes achop{0%{transform:rotate(-26deg)}30%{transform:rotate(4deg)}55%,100%{transform:rotate(-26deg)}}
@keyframes aslide{from{transform:translateY(-6px)}to{transform:translateY(10px)}}
@keyframes atw{0%,100%{transform:scale(.4) rotate(0);opacity:.3}50%{transform:scale(1.1) rotate(20deg);opacity:1}}
@keyframes atilt{from{transform:rotate(0)}to{transform:rotate(-28deg)}}
@keyframes asquash{from{transform:scale(1,1)}to{transform:scale(1.06,.84)}}
@keyframes agrow{0%{transform:scaleY(.05);opacity:.2}60%{transform:scaleY(1);opacity:1}100%{transform:scaleY(1);opacity:0}}
@keyframes apop{0%,100%{transform:translateY(8px)}45%,60%{transform:translateY(-4px)}}
@keyframes alevel{from{transform:scaleY(.15)}to{transform:scaleY(1)}}
@keyframes azzz{0%{transform:translate(0,6px);opacity:0}30%{opacity:1}100%{transform:translate(6px,-10px);opacity:0}}
@keyframes ashiver{from{transform:translateX(-1.4px)}to{transform:translateX(1.4px)}}
@keyframes arub{from{transform:translateX(-4px)}to{transform:translateX(4px)}}
@keyframes awhisk{from{transform:rotate(-24deg)}to{transform:rotate(24deg)}}
@keyframes aglow{from{opacity:.65}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.scn .a,.scn .a *{animation:none!important}}`;
})(window.J = window.J || {});
