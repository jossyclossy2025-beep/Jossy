/* Ejercicios, actividades y generador de rutinas (todo local, sin internet). */
(function (J) {
  // id: [nombre, grupo, equipo, nivel, MET, descripción]
  // grupos: cardio, piernas, empuje, core, movilidad  | equipo: n = sin equipo, m = mancuernas/botellas con agua
  const EX = {
    jj: ['Jumping jacks', 'cardio', 'n', 2, 8, 'De pie, salta abriendo piernas y llevando los brazos arriba; vuelve a juntar.'],
    knees: ['Rodillas altas', 'cardio', 'n', 2, 8, 'Trota en el lugar subiendo las rodillas a la altura de la cadera.'],
    jog: ['Trote en el lugar', 'cardio', 'n', 1, 6.5, 'Trota suave sin despegar mucho los pies, brazos relajados.'],
    burpee: ['Burpees', 'cardio', 'n', 3, 10, 'Baja a plancha, flexión opcional, regresa de un salto y salta arriba con las manos al cielo.'],
    mclimb: ['Escaladores (mountain climbers)', 'cardio', 'n', 2, 8.5, 'En plancha alta, lleva las rodillas al pecho alternando rápido.'],
    heel: ['Talones al glúteo', 'cardio', 'n', 1, 7, 'Trota llevando los talones hacia los glúteos.'],
    skater: ['Skaters (patinador)', 'cardio', 'n', 2, 8, 'Salta lateralmente de una pierna a la otra como patinando.'],
    squatjump: ['Sentadilla con salto', 'cardio', 'n', 3, 9, 'Baja en sentadilla y salta explosivo; aterriza suave.'],
    shadow: ['Boxeo al aire', 'cardio', 'n', 1, 7, 'Lanza golpes rectos y ganchos al aire con los pies en movimiento.'],
    march: ['Marcha elevando brazos (bajo impacto)', 'cardio', 'n', 1, 4, 'Marcha en el lugar subiendo rodillas y brazos sin saltar. Ideal para articulaciones sensibles.'],
    sidestep: ['Pasos laterales con brazos (bajo impacto)', 'cardio', 'n', 1, 4.5, 'Da pasos laterales amplios moviendo los brazos al ritmo.'],
    dance: ['Baile libre', 'cardio', 'n', 1, 5.5, 'Pon tu canción favorita y muévete sin parar.'],
    stepup: ['Subir y bajar escalón', 'cardio', 'n', 1, 6, 'Sube y baja un escalón o banco firme alternando la pierna guía.'],
    sprawl: ['Sentadilla a plancha', 'cardio', 'n', 2, 8, 'Baja en cuclillas, lleva los pies atrás a plancha y regresa.'],
    squat: ['Sentadillas', 'piernas', 'n', 1, 5, 'Pies al ancho de hombros, baja la cadera atrás como sentándote, rodillas alineadas con los pies.'],
    lunge: ['Zancadas alternas', 'piernas', 'n', 1, 5, 'Da un paso largo, baja hasta ~90° en ambas rodillas y regresa.'],
    latlunge: ['Zancada lateral', 'piernas', 'n', 2, 5, 'Da un paso lateral y baja la cadera sobre esa pierna, la otra se mantiene recta.'],
    sumo: ['Sentadilla sumo', 'piernas', 'n', 1, 5, 'Pies muy abiertos y puntas afuera; baja con la espalda recta.'],
    bridge: ['Puente de glúteos', 'piernas', 'n', 1, 4, 'Boca arriba con rodillas dobladas, sube la cadera apretando glúteos.'],
    sbridge: ['Puente a una pierna', 'piernas', 'n', 3, 4.5, 'Igual que el puente pero con una pierna extendida.'],
    calf: ['Elevación de talones', 'piernas', 'n', 1, 3.5, 'Sube a puntas de pie y baja despacio.'],
    wall: ['Sentadilla isométrica en pared', 'piernas', 'n', 2, 4, 'Espalda en la pared, muslos paralelos al suelo, aguanta.'],
    donkey: ['Patada trasera de glúteo', 'piernas', 'n', 1, 4, 'En cuatro apoyos, empuja un talón al techo manteniendo la rodilla a 90°.'],
    bulg: ['Sentadilla búlgara', 'piernas', 'n', 3, 5.5, 'Pie trasero apoyado en una silla; baja con la pierna delantera.'],
    rdl: ['Peso muerto rumano con pesas', 'piernas', 'm', 2, 5, 'Con pesas, lleva la cadera atrás con la espalda recta hasta sentir los isquios.'],
    gsquat: ['Sentadilla goblet con pesa', 'piernas', 'm', 2, 5.5, 'Sostén una pesa al pecho y haz sentadilla profunda.'],
    push: ['Flexiones', 'empuje', 'n', 2, 6, 'Manos bajo los hombros, cuerpo recto, baja el pecho al suelo y empuja.'],
    kpush: ['Flexiones de rodillas', 'empuje', 'n', 1, 4.5, 'Igual que la flexión pero apoyando las rodillas.'],
    dpush: ['Flexiones diamante', 'empuje', 'n', 3, 6.5, 'Manos juntas formando un diamante; trabaja tríceps.'],
    dips: ['Fondos de tríceps en silla', 'empuje', 'n', 2, 5, 'Manos en el borde de una silla firme, baja y sube con los codos atrás.'],
    pike: ['Flexión pike (hombros)', 'empuje', 'n', 3, 5.5, 'Cadera arriba en V invertida, baja la cabeza hacia el suelo.'],
    press: ['Press de hombro con pesas', 'empuje', 'm', 2, 5, 'Empuja las pesas desde los hombros hacia arriba sin arquear la espalda.'],
    row: ['Remo con pesa', 'empuje', 'm', 2, 5, 'Inclinado, jala la pesa hacia la cadera apretando la espalda.'],
    curl: ['Curl de bíceps', 'empuje', 'm', 1, 4, 'Dobla los codos subiendo las pesas sin balancear el cuerpo.'],
    plank: ['Plancha', 'core', 'n', 2, 4, 'Sobre antebrazos, cuerpo en línea recta, abdomen firme.'],
    splank: ['Plancha lateral', 'core', 'n', 2, 4, 'De lado sobre un antebrazo, cadera arriba. Cambia de lado a la mitad.'],
    crunch: ['Crunch abdominal', 'core', 'n', 1, 3.8, 'Boca arriba, sube el torso despegando los hombros, sin jalar el cuello.'],
    bike: ['Bicicleta abdominal', 'core', 'n', 2, 4.5, 'Lleva codo a rodilla contraria alternando.'],
    legraise: ['Elevación de piernas', 'core', 'n', 2, 4, 'Boca arriba, sube las piernas rectas y baja sin tocar el suelo.'],
    deadbug: ['Dead bug', 'core', 'n', 1, 3.5, 'Boca arriba, extiende brazo y pierna contrarios sin despegar la espalda baja.'],
    bird: ['Bird dog', 'core', 'n', 1, 3.5, 'En cuatro apoyos, extiende brazo y pierna contrarios y aguanta.'],
    twist: ['Giros rusos', 'core', 'n', 2, 4.5, 'Sentado con el torso inclinado, gira de lado a lado.'],
    superman: ['Superman', 'core', 'n', 1, 3.5, 'Boca abajo, eleva brazos y piernas a la vez.'],
    hollow: ['Hollow hold', 'core', 'n', 3, 4.5, 'Boca arriba, brazos y piernas extendidos despegados del suelo.'],
    scissors: ['Tijeras', 'core', 'n', 2, 4, 'Boca arriba, cruza las piernas rectas alternando arriba y abajo.'],
    catcow: ['Gato-vaca', 'movilidad', 'n', 1, 2.3, 'En cuatro apoyos, arquea y redondea la espalda con la respiración.'],
    child: ['Postura del niño', 'movilidad', 'n', 1, 2, 'Siéntate sobre los talones y estira los brazos al frente.'],
    quadst: ['Estiramiento de cuádriceps', 'movilidad', 'n', 1, 2, 'De pie, lleva el talón al glúteo. Cambia de pierna a la mitad.'],
    thor: ['Rotación torácica', 'movilidad', 'n', 1, 2.3, 'En cuatro apoyos, mano en la nuca y gira el codo hacia el techo.'],
    hip: ['Apertura de cadera (90/90)', 'movilidad', 'n', 1, 2.3, 'Sentado, rodillas a 90° a cada lado y gira el torso.'],
    ham: ['Estiramiento de isquiotibiales', 'movilidad', 'n', 1, 2, 'Sentado con una pierna extendida, inclínate hacia el pie.'],
    shoulder: ['Círculos de hombros y brazos', 'movilidad', 'n', 1, 2.3, 'Haz círculos amplios con los brazos hacia adelante y atrás.'],
    cobra: ['Cobra', 'movilidad', 'n', 1, 2, 'Boca abajo, empuja con las manos y abre el pecho.'],
  };
  J.EX = EX;

  // Actividades libres (MET aproximados del Compendio de Actividades Físicas)
  J.ACT = [['Caminata ligera', 3.3], ['Caminata rápida', 4.8], ['Subir escaleras', 8], ['Trotar', 7.5], ['Correr', 10], ['Bicicleta paseo', 6.8], ['Bicicleta intensa', 10],
    ['Natación', 7], ['Yoga', 2.8], ['Pilates', 3.5], ['Baile / zumba', 6], ['Fútbol / deporte', 7.5], ['Limpieza del hogar', 3.3], ['Jardinería', 4], ['Saltar la cuerda', 11], ['Pesas', 5]];

  J.GOALS = [
    ['hiit', 'Quemar grasa (HIIT)', '🔥', ['cardio', 'cardio', 'core', 'piernas']],
    ['low', 'Cardio bajo impacto', '🚶', ['cardio', 'piernas', 'core']],
    ['legs', 'Piernas y glúteos', '🍑', ['piernas', 'piernas', 'core']],
    ['upper', 'Tren superior', '💪', ['empuje', 'empuje', 'core']],
    ['abs', 'Abdomen y core', '🎯', ['core', 'core', 'cardio']],
    ['full', 'Cuerpo completo', '⚡', ['piernas', 'empuje', 'core', 'cardio']],
    ['mob', 'Movilidad y estiramiento', '🧘', ['movilidad']],
  ];

  function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  const pick = (arr, r) => arr[Math.floor(r() * arr.length)];

  // Genera una rutina: calentamiento + circuitos + enfriamiento.
  J.makeRoutine = function ({ goal = 'hiit', level = 1, minutes = 20, equip = 'n', seed = Date.now() }) {
    const r = rng(seed);
    const g = J.GOALS.find((x) => x[0] === goal);
    const [work, rest] = goal === 'mob' ? [40, 10] : level === 1 ? [30, 30] : level === 2 ? [40, 20] : [45, 15];
    const okEq = (e) => equip === 'm' || e.eq === 'n';
    const all = Object.entries(EX).map(([id, e]) => ({ id, n: e[0], g: e[1], eq: e[2], l: e[3], met: e[4], d: e[5] }));
    const pool = (grp) => all.filter((e) => e.g === grp && e.l <= level + (grp === 'movilidad' ? 3 : 0) && okEq(e) && (goal !== 'low' || e.g !== 'cardio' || e.met <= 6.5));
    const steps = [];
    const step = (e, secs, type) => steps.push({ id: e.id, n: e.n, d: e.d, secs, type, met: type === 'rest' ? 2 : e.met });
    const mobs = pool('movilidad');
    const used = new Set();
    const take = (grp) => { const c = pool(grp).filter((e) => !used.has(e.id)); const e = c.length ? pick(c, r) : pick(pool(grp), r); used.add(e.id); return e; };
    const wm = goal === 'mob' ? 0 : Math.min(3, Math.max(1, Math.round(minutes / 10)));
    for (let i = 0; i < wm; i++) { const e = i === 0 ? { ...EX.march && { id: 'march', n: EX.march[0], d: EX.march[5], met: 4 } } : pick(mobs, r); step(e, 30, 'warm'); }
    const coolSecs = goal === 'mob' ? 0 : 3 * 30; const warmSecs = wm * 30;
    const avail = Math.max(60, minutes * 60 - coolSecs - warmSecs);
    const per = work + rest; const n = Math.max(4, Math.floor(avail / per));
    const seq = [];
    for (let i = 0; i < n; i++) seq.push(take(g[3][i % g[3].length]));
    seq.forEach((e, i) => { step(e, work, 'work'); if (i < seq.length - 1 && rest) step({ id: 'rest', n: 'Descanso', d: 'Respira y prepárate para el siguiente.', met: 2 }, rest, 'rest'); });
    const cool = goal === 'mob' ? 0 : 3;
    for (let i = 0; i < cool; i++) step(pick(mobs, r), 30, 'cool');
    if (goal === 'mob') for (let i = 0; i < 4; i++) { step(take('movilidad'), 40, 'work'); }
    return { goal, level, minutes, name: g[1], steps, total: steps.reduce((s, x) => s + x.secs, 0) };
  };
  J.routineKcal = (steps, kg) => steps.reduce((s, x) => s + x.met * kg * x.secs / 3600, 0);

  // Plan semanal para bajar de peso (3 niveles)
  J.WEEK = {
    1: [['low', 20, 'Caminata/cardio suave'], ['legs', 15, 'Piernas'], ['mob', 15, 'Movilidad'], ['abs', 15, 'Core'], ['low', 25, 'Cardio bajo impacto'], ['full', 20, 'Cuerpo completo'], [null, 0, 'Descanso activo: camina 30 min']],
    2: [['hiit', 20, 'HIIT'], ['legs', 25, 'Piernas'], ['low', 25, 'Cardio suave + core'], ['upper', 25, 'Tren superior'], ['hiit', 25, 'HIIT'], ['full', 30, 'Cuerpo completo'], ['mob', 20, 'Movilidad']],
    3: [['hiit', 30, 'HIIT intenso'], ['legs', 35, 'Piernas'], ['abs', 20, 'Core'], ['upper', 35, 'Tren superior'], ['hiit', 35, 'HIIT'], ['full', 40, 'Cuerpo completo'], ['mob', 25, 'Movilidad']],
  };

  J.TIPS = [
    'Beber un vaso de agua antes de comer te ayuda a sentirte lleno antes.', 'Dormir 7-8 horas regula el hambre y ayuda a bajar de peso.',
    'Las proteínas en cada comida ayudan a conservar músculo mientras pierdes grasa.', 'Camina 10 minutos después de comer: mejora la glucosa.',
    'No te peses a diario: mira la tendencia semanal.', 'Planear tus comidas reduce las decisiones impulsivas.',
    'La fibra (verduras, legumbres) te mantiene satisfecho por más tiempo.', 'Come despacio: la saciedad tarda ~20 min en llegar.',
    'Un día imperfecto no arruina el progreso: vuelve en la siguiente comida.', 'Prepara snacks saludables a la vista, y los dulces fuera de ella.',
    'La constancia pesa más que la intensidad: 20 min diarios valen mucho.', 'Estira al terminar: tu cuerpo lo agradece mañana.',
    'Sirve la comida en platos más chicos para controlar porciones.', 'Cambia bebidas azucaradas por agua, té o infusiones.',
    'La fuerza te ayuda a gastar más calorías en reposo: añade 2 días por semana.',
  ];
})(window.J = window.J || {});
