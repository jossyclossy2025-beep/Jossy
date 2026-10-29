/* Pasos detallados: cómo lavar, pelar, cortar y cocinar cada ingrediente, con medidas caseras. */
(function (J) {
  const ING = J.ING;
  const nm = (k) => ING[k][0];
  const CLS = {};
  const def = (c, keys) => keys.split(' ').forEach((k) => { CLS[k] = c; });
  def('meat', 'pollo pavo res cerdo'); def('fish', 'salmon tilapia'); def('shell', 'camaron'); def('canned', 'atun sardina'); def('plant', 'tofu tempeh');
  def('legume', 'lenteja garbanzo frijol chicharo'); def('grain', 'arroz arrozb quinoa pasta pastab'); def('bread', 'pan tortilla');
  def('hard', 'papa camote zanahoria coliflor brocoli ejote esparrago chayote elote'); def('soft', 'calabacin berenjena pimiento champi tomate pepino cebolla apio nopal'); def('leaf', 'espinaca kale lechuga');
  const NOPREP = new Set('aceite agua stevia canela caldo cacao proteina miel curcuma lalmendra ldescremada lcoco te cafe mantequilla'.split(' '));

  /* ---- medidas caseras ---- */
  const UNIT = { huevo: [50, 'huevo', 'huevos'], clara: [33, 'clara', 'claras'], tomate: [120, 'tomate', 'tomates'], cebolla: [110, 'cebolla', 'cebollas'], zanahoria: [70, 'zanahoria', 'zanahorias'], platano: [120, 'plátano', 'plátanos'], manzana: [180, 'manzana', 'manzanas'], naranja: [130, 'naranja', 'naranjas'], limon: [60, 'limón', 'limones'], pepino: [300, 'pepino', 'pepinos'], pimiento: [150, 'pimiento', 'pimientos'], calabacin: [200, 'calabacín', 'calabacines'], tortilla: [30, 'tortilla', 'tortillas'], pan: [30, 'rebanada de pan integral', 'rebanadas de pan integral'], papa: [170, 'papa', 'papas'], camote: [200, 'camote', 'camotes'], kiwi: [70, 'kiwi', 'kiwis'], pera: [180, 'pera', 'peras'], aguacate: [170, 'aguacate', 'aguacates'], durazno: [130, 'durazno', 'duraznos'], ajo: [5, 'diente de ajo', 'dientes de ajo'], berenjena: [250, 'berenjena', 'berenjenas'], chayote: [200, 'chayote', 'chayotes'], nopal: [100, 'nopal', 'nopales'], datil: [8, 'dátil', 'dátiles'], aceituna: [4, 'aceituna', 'aceitunas'] };
  const SPOON = { aceite: [14, 5], miel: [21, 7], mani: [16, 5], tahini: [15, 5], chia: [12, 4], linaza: [7, 2.5], mantequilla: [14, 5], cacao: [7, 3], calabazas: [9, 3], coco: [6, 2], hummus: [16, 5] };
  const CUP = { avena: 80, yogur: 245, lalmendra: 240, ldescremada: 240, lcoco: 240, agua: 240, te: 240, cafe: 240, caldo: 240, arroz: 160, arrozb: 160, quinoa: 185, lenteja: 180, garbanzo: 165, frijol: 175, pasta: 140, pastab: 140 };
  const NUTS = new Set(['almendra', 'nuez', 'calabazas']);
  const frac = (x) => { const q = Math.round(x * 4) / 4, w = Math.floor(q), r = q - w; const f = { 0: '', 0.25: '¼', 0.5: '½', 0.75: '¾' }[r]; return (w ? w : '') + (w && f ? '' : '') + f || '¼'; };
  function qty(k, g) {
    const n = nm(k), u = UNIT[k], sp = SPOON[k], cp = CUP[k];
    if (u && g / u[0] >= 0.2) { const x = g / u[0], t = frac(x); return `${t} ${x <= 1.01 ? u[1] : u[2]} (${Math.round(g)} g)`; }
    if (sp && g <= 25) { const tsp = g < 12 ? 'cucharadita' : 'cucharada', x = g < 12 ? g / sp[1] : g / sp[0], t = frac(x); return `${t} ${x <= 1.01 ? tsp : tsp + 's'} de ${n} (${Math.round(g)} g)`; }
    if (NUTS.has(k) && g >= 10) { const x = g / 30; return `${frac(x)} ${x <= 1.01 ? 'puñado' : 'puñados'} de ${n} (${Math.round(g)} g)`; }
    if (cp && g >= 60) { const x = g / cp; return `${frac(x)} ${x <= 1.01 ? 'taza' : 'tazas'} de ${n} (${Math.round(g)} g)`; }
    return `${Math.round(g)} g de ${n}`;
  }
  J.qty = qty;

  /* ---- preparación por ingrediente ---- */
  const CUT = { filetes: 'filetes de 1.5 cm de grosor', tiras: 'tiras de 1 cm de ancho y unos 5 cm de largo', cubos: 'cubos de 2 cm', chico: 'cubitos de 1 cm' };
  const meatPrep = (q, c, extra) => `Saca ${q} del refrigerador 15 minutos antes de cocinarlo para que se cocine parejo. Sécalo muy bien con papel de cocina por los dos lados (si está mojado no se dora). ${c === 'filetes' && extra ? extra : `Córtalo en ${CUT[c]}. `}Sazona por todos lados con ¼ de cucharadita de sal y una pizca de pimienta negra.`;
  const PREPK = {
    pollo: (q, c) => meatPrep(q, c, 'Ponlo sobre la tabla, apoya una mano encima y, con el cuchillo paralelo a la tabla, córtalo por la mitad a lo ancho (como abrir un libro) para tener 2 filetes delgados de 1.5 cm. '),
    pavo: (q, c) => meatPrep(q, c, 'Córtalo por la mitad a lo ancho, con el cuchillo paralelo a la tabla, para tener filetes de 1.5 cm. '),
    res: (q, c) => `Saca ${q} del refrigerador 15 minutos antes. Sécala con papel de cocina y quítale con la punta del cuchillo los nervios o grasa dura. Córtala ${c === 'filetes' ? 'en filetes de 1.5 cm' : 'en ' + CUT[c]}, siempre en contra de la fibra (así queda tierna). Sazona con ¼ de cucharadita de sal y pimienta.`,
    cerdo: (q, c) => `Saca ${q} del refrigerador 15 minutos antes. Sécalo con papel de cocina, quita el exceso de grasa y córtalo ${c === 'filetes' ? 'en medallones de 2 cm' : 'en ' + CUT[c]}. Sazona con ¼ de cucharadita de sal y pimienta.`,
    salmon: (q) => `Seca ${q} con papel de cocina. Pasa la yema del dedo sobre la carne para detectar espinas y retíralas con unas pinzas. Sazona con ¼ de cucharadita de sal, pimienta y unas gotas de limón; déjalo reposar 5 minutos.`,
    tilapia: (q) => `Seca ${q} con papel de cocina por ambos lados. Revisa que no tenga espinas y sazona con ¼ de cucharadita de sal, pimienta y unas gotas de limón; déjalo reposar 5 minutos.`,
    camaron: (q) => `Si son congelados, descongélalos 10 minutos en un bol con agua fría. Pela ${q}, quita la vena oscura del lomo haciendo un corte superficial y sacándola con la punta del cuchillo, enjuágalos y sécalos muy bien. Sazona con una pizca de sal y unas gotas de limón.`,
    atun: (q) => `Abre la lata de ${q} y escurre muy bien el líquido (presiona la tapa contra el atún sobre el fregadero). Desmenúzalo con un tenedor en un plato.`,
    sardina: (q) => `Abre la lata de ${q}, escúrrelas y retira con el tenedor las espinas grandes del centro. Desmenúzalas ligeramente.`,
    tofu: (q, c) => `Saca ${q} del empaque, escúrrelo y envuélvelo en papel de cocina. Pon encima un plato con algo pesado (una lata, por ejemplo) 10 minutos para sacarle el agua. Córtalo en ${CUT[c === 'filetes' ? 'cubos' : c]}.`,
    tempeh: (q) => `Corta ${q} en rebanadas de 1 cm. Si lo quieres menos amargo, hiérvelo 5 minutos en agua y escúrrelo.`,
    molida: (q) => `Pon ${q} en un bol, desmenúzala con las manos y mézclala con ¼ de cucharadita de sal y una pizca de pimienta. No la amases de más para que quede suave.`,
    jamon: (q) => `Separa las rebanadas de ${q}; apila 3 y córtalas en cuadritos de 1 cm.`,
    huevo: (q) => `Rompe ${q} en un tazón pequeño (así, si cae cáscara, la sacas fácil). Agrega una pizca de sal y bate con un tenedor 30 segundos hasta que no se vean hebras de clara.`,
    clara: (q) => `Separa ${q}: rompe cada huevo sobre un tazón, pasando la yema de una mitad de cáscara a la otra para que caiga la clara. Bátelas con una pizca de sal 20 segundos.`,
    lenteja: (q) => `Abre ${q} (cocidas), escúrrelas en un colador y enjuágalas con agua fría 30 segundos para quitar el exceso de sal; déjalas escurrir bien.`,
    garbanzo: (q) => `Abre ${q} (cocidos), escúrrelos en un colador y enjuágalos con agua fría 30 segundos; déjalos escurrir bien.`,
    frijol: (q) => `Abre ${q} (cocidos), escúrrelos en un colador y enjuágalos con agua fría 30 segundos para quitar el exceso de sal; déjalos escurrir.`,
    chicharo: (q) => `Si son congelados, pasa ${q} por agua caliente 1 minuto y escúrrelos.`,
    arroz: (q) => `Ten listo ${q}. Si hay que cocerlo: enjuaga ⅓ de taza de arroz integral crudo en un colador hasta que el agua salga casi clara, ponlo en una olla con ⅔ de taza de agua y una pizca de sal, hierve, baja el fuego al mínimo, tapa y cocina 40 minutos sin destapar; apaga y deja tapado 10 minutos más. Rinde cerca de 1 taza cocida.`,
    arrozb: (q) => `Ten listo ${q}. Si hay que cocerlo: enjuaga ⅓ de taza de arroz blanco, ponlo en una olla con ⅔ de taza de agua y una pizca de sal, hierve, baja el fuego, tapa y cocina 15-18 minutos; deja reposar tapado 5 minutos y esponja con un tenedor.`,
    quinoa: (q) => `Ten lista ${q}. Si hay que cocerla: enjuaga ⅓ de taza de quinoa en un colador fino 1 minuto (quita el amargor), hiérvela con ⅔ de taza de agua y una pizca de sal, baja el fuego, tapa 15 minutos, apaga y reposa 5 minutos; esponja con un tenedor.`,
    pasta: (q, c, g) => `Ten lista ${q} (≈ ${Math.round(g / 2.2 / 5) * 5} g de pasta seca): hierve 1 litro de agua con 1 cucharadita de sal, agrega la pasta y cuécela según el paquete (8-10 minutos) hasta que esté al dente, es decir, firme al morder. Reserva ¼ de taza del agua y escúrrela.`,
    pastab: (q, c, g) => `Ten lista ${q} (≈ ${Math.round(g / 2.2 / 5) * 5} g de pasta seca): hierve 1 litro de agua con 1 cucharadita de sal, agrega la pasta y cuécela según el paquete (8-10 minutos) hasta que esté al dente, es decir, firme al morder. Reserva ¼ de taza del agua y escúrrela.`,
    pan: (q) => `Si lo quieres crujiente, tuesta ${q} 2 minutos por lado en una sartén seca o en el tostador.`,
    tortilla: (q) => `Calienta ${q} en una sartén seca a fuego medio 30 segundos por lado y envuélvelas en un trapo limpio para que se mantengan suaves.`,
    papa: (q, c) => `Lava ${q} con un cepillo bajo el chorro de agua, pélala si quieres (con cáscara tiene más fibra), córtala en ${CUT[c === 'filetes' ? 'cubos' : c]} y enjuágala para quitar el almidón; sécala con un trapo.`,
    camote: (q, c) => `Lava ${q}, pélalo con un pelador y córtalo en ${CUT[c === 'filetes' ? 'cubos' : c]}; sécalo con un trapo.`,
    zanahoria: (q, c) => `Lava ${q}, pélala con un pelador, corta las puntas y córtala en ${c === 'tiras' ? 'bastones finos de 5 cm' : c === 'chico' ? 'cubitos de 1 cm' : 'rodajas de 0.5 cm'}.`,
    coliflor: (q) => `Lava ${q}, quita las hojas y el tallo duro, y separa los ramitos del tamaño de un bocado (3-4 cm); sécalos bien.`,
    brocoli: (q) => `Lava ${q}, separa los ramitos con el cuchillo, pela el tallo con un pelador y córtalo en rodajas de 0.5 cm; los ramitos deben medir 3-4 cm.`,
    ejote: (q) => `Lava ${q}, quita la punta dura de cada ejote y córtalos en trozos de 4 cm.`,
    esparrago: (q) => `Lava ${q}. Sostén cada espárrago por los extremos y dóblalo: se rompe solo donde empieza lo duro. Desecha esa base y corta el resto en trozos de 5 cm.`,
    chayote: (q) => `Lava ${q}, pélalo (suelta un poco de baba, es normal), córtalo por la mitad, quita la semilla y córtalo en cubos de 2 cm.`,
    elote: (q) => `Si son granos congelados, descongélalos y escúrrelos; si es un elote fresco, desgrana con un cuchillo, cortando de arriba hacia abajo.`,
    calabacin: (q, c) => `Lava ${q}, corta las puntas y córtalo ${c === 'tiras' ? 'en tiras de 1 cm' : 'a lo largo en dos mitades y luego en medias lunas de 1 cm'}.`,
    berenjena: (q) => `Lava ${q}, quita el tallo y córtala en cubos de 2 cm. Espolvorea ½ cucharadita de sal, déjala 10 minutos en un colador y sécala con papel de cocina para quitarle el amargor y el exceso de agua.`,
    pimiento: (q) => `Lava ${q}, córtalo por la mitad a lo largo, quita el tallo, las semillas y las venas blancas con una cuchara, y córtalo en tiras de 1 cm (o en cubitos si lo prefieres).`,
    champi: (q) => `Limpia ${q} con un paño de cocina húmedo (no los remojes: absorben agua), corta la punta seca del tallo y rebánalos en láminas de 0.5 cm.`,
    tomate: (q) => `Lava ${q}, quita el hueco del tallo con la punta del cuchillo y córtalo en cubos de 1 cm. Si quieres quitarle la piel, hazle una cruz en la base y sumérgelo 30 segundos en agua hirviendo.`,
    pepino: (q) => `Lava ${q} bajo el chorro de agua, pélalo con un pelador (opcional: la cáscara tiene fibra), córtalo a lo largo en tiras largas y luego en cuadritos de 1 cm.`,
    cebolla: (q) => `Pela ${q}, córtala por la mitad de arriba abajo, apoya la cara plana en la tabla y haz cortes finos; luego córtalos en cubitos de 0.5 cm. (Si te arden los ojos, enfría la cebolla 10 minutos antes.)`,
    apio: (q) => `Lava ${q}, corta las puntas y córtalo en bastones de 5 cm o en medias lunas delgadas.`,
    nopal: (q) => `Si ${q} tiene espinas, quítalas raspando con el cuchillo; lávalos y córtalos en cuadritos de 1 cm. Para quitarles la baba, cuécelos 5 minutos en agua con sal y escúrrelos.`,
    espinaca: (q) => `Lava ${q} en un bol grande con agua, moviéndolas y escurriendo; repite si hay tierra. Sécalas con un trapo y quita los tallos gruesos.`,
    kale: (q) => `Lava ${q}, retira el tallo duro deslizando los dedos hacia arriba por cada hoja y córtalo en tiras de 2 cm. Si va crudo, masajéalo 1 minuto con unas gotas de limón.`,
    lechuga: (q) => `Separa las hojas de ${q}, lávalas, sécalas muy bien con un trapo y rómpelas en trozos con las manos.`,
    fresa: (q) => `Lava ${q}, quítales el rabito verde y córtalas en láminas.`,
    arandano: (q) => `Enjuaga ${q} con cuidado y escúrrelos sobre papel de cocina.`,
    frambuesa: (q) => `Enjuaga ${q} muy suavemente (se deshacen fácil) y escúrrelas sobre papel de cocina.`,
    manzana: (q) => `Lava ${q}, córtala en cuartos, quita el corazón con las semillas y córtala en cubos de 1.5 cm o en rebanadas finas.`,
    platano: (q) => `Pela ${q} y córtalo en rodajas de 1 cm.`,
    mango: (q) => `Pela ${q}, corta la pulpa a lo largo pegada al hueso y córtala en cubos de 1.5 cm.`,
    pina: (q) => `Pela ${q}, quita el centro duro y córtala en cubos de 1.5 cm.`,
    naranja: (q) => `Pela ${q}, quita lo blanco y sepárala en gajos (o exprime el jugo con un exprimidor).`,
    limon: (q) => `Lava ${q}; si vas a usar ralladura, ralla primero la parte verde y luego exprime el jugo quitando las semillas.`,
    sandia: (q) => `Quita la cáscara y las semillas de ${q} y córtala en cubos de 2 cm.`,
    melon: (q) => `Quita la cáscara y las semillas de ${q} y córtalo en cubos de 2 cm.`,
    papaya: (q) => `Quita la cáscara y las semillas de ${q} y córtala en cubos de 2 cm.`,
    pera: (q) => `Lava ${q}, quita el corazón y córtala en cubos de 1.5 cm.`,
    durazno: (q) => `Lava ${q}, córtalo por la mitad, retira el hueso y córtalo en cubos de 1.5 cm.`,
    kiwi: (q) => `Pela ${q} con un cuchillo o con una cuchara y rebánalo en rodajas de 0.5 cm.`,
    datil: (q) => `Quita el hueso a ${q} con un cuchillo y píquelos finamente.`,
    uva: (q) => `Lava ${q}, quítales el rabillo y córtalas por la mitad.`,
    almendra: (q) => `Pica ${q} en trozos gruesos con un cuchillo grande sobre la tabla.`,
    nuez: (q) => `Pica ${q} en trozos gruesos con un cuchillo grande sobre la tabla.`,
    chia: (q) => `Mide ${q} con una cuchara medidora, al ras.`,
    linaza: (q) => `Mide ${q} con una cuchara medidora, al ras.`,
    calabazas: (q) => `Mide ${q} con una cuchara medidora.`,
    coco: (q) => `Mide ${q}; si quieres más sabor, tuéstalo 2 minutos en una sartén seca moviendo sin parar.`,
    yogur: (q) => `Mide ${q} y revuélvelo con una cuchara para que quede cremoso.`,
    cottage: (q) => `Mide ${q} y escúrrele el líquido si viene muy húmedo.`,
    feta: (q) => `Desmorona ${q} con los dedos en trozos pequeños.`,
    mozz: (q) => `Corta ${q} en cubitos de 1 cm o rállalo con el lado grueso del rallador.`,
    panela: (q) => `Corta ${q} en rebanadas de 1 cm o en cubos.`,
    aguacate: (q) => `Corta ${q} por la mitad rodeando el hueso, gira las mitades para separarlas, clava suavemente el cuchillo en el hueso y gíralo para sacarlo. Saca la pulpa con una cuchara y córtala en cubos o aplástala con un tenedor con unas gotas de limón y una pizca de sal (el limón evita que se oscurezca).`,
    hummus: (q) => `Mide ${q}.`, tahini: (q) => `Revuelve el frasco (el aceite se separa) y mide ${q}.`, mani: (q) => `Revuelve el frasco y mide ${q}.`,
    aceituna: (q) => `Escurre ${q} y rebánalas en aros.`,
    ajo: (q) => `Pela ${q}: aplasta el diente con el lado plano del cuchillo, quita la cáscara y píquelo finísimo.`,
    cilantro: (q) => `Lava ${q}, sécalo y pica finamente las hojas y los tallos tiernos.`,
    jengibre: (q) => `Pela ${q} raspándolo con una cuchara y rállalo fino.`,
    menta: (q) => `Lava ${q} y separa las hojas del tallo.`,
  };

  /* ---- cocción de la proteína (ranura 0) y verduras (ranura 1) del arquetipo «prot» ---- */
  const SETUP = [
    'Calienta una sartén antiadherente grande a fuego medio-alto 2 minutos. Agrega 1 cucharadita de aceite de oliva y repártela moviendo la sartén: debe verse brillante pero sin humear.',
    'Precalienta el horno a 200 °C (400 °F) con la rejilla en el centro. Cubre una charola con papel pergamino o úntala con un poco de aceite.',
    'Calienta un wok o una sartén profunda a fuego alto 2 minutos. Agrega 1 cucharada de aceite: al inclinar la sartén debe correr como agua.',
    'Pon 3 cm de agua en una olla, tápala y llévala a hervir; coloca encima una vaporera o un colador metálico sin que toque el agua.',
    'Calienta la parrilla o una sartén de parrilla a fuego alto 5 minutos y úntala con un trapito o papel con aceite para que no se pegue.',
    'Precalienta el horno a 190 °C. Corta cuatro cuadros de papel pergamino (o aluminio) de unos 35 cm por lado.',
    'Precalienta el horno a 190 °C. En un plato mezcla 1 cucharada de hierbas frescas picadas (perejil, tomillo o romero), la mitad del sazonador, 1 cucharada de aceite y una pizca de sal hasta formar una pasta.',
    'Elige una olla con tapa de unos 3 litros y caliéntala a fuego medio con 1 cucharada de aceite.',
    'Precalienta la freidora de aire a 190 °C durante 3 minutos.',
  ];
  const PCOOK = {
    meat: [
      'Coloca {n} en la sartén caliente y no lo muevas: cocina 5-6 minutos hasta que se despegue solo y esté dorado. Voltéalo y cocina 4-5 minutos más. Está listo cuando por dentro ya no hay rosa (74 °C en pollo, pavo y cerdo) y, al picarlo, sale jugo transparente. Pásalo a un plato y tápalo con aluminio 5 minutos para que se reparta el jugo.',
      'Coloca {n} en la charola, rocíalo con 1 cucharadita de aceite y hornea 18-22 minutos (filetes de 1.5 cm) hasta que el centro marque 74 °C o salga jugo transparente al picarlo. Déjalo reposar 5 minutos antes de cortar.',
      'Cuando el aceite esté muy caliente, agrega {n} en una sola capa y déjalo 1 minuto sin mover para que dore. Luego mueve sin parar 3-4 minutos hasta que no quede nada rosa. Retíralo a un plato.',
      'Coloca {n} en la vaporera, tapa y cuece 15-18 minutos (filetes delgados) hasta que no quede rosa por dentro (74 °C).',
      'Coloca {n} en la parrilla y no lo muevas 5 minutos para marcar líneas; voltéalo y cocina 4-6 minutos más hasta que salga jugo transparente. Déjalo reposar 5 minutos.',
      'Coloca {n} en el centro de un cuadro de papel con un chorrito de aceite, el sazonador y una cucharada de agua. Cierra doblando los bordes varias veces para sellar y hornea 25-30 minutos.',
      'Sella {n} en una sartén caliente con 1 cucharadita de aceite, 2 minutos por lado. Pásalo a una charola, úntale la pasta de hierbas y hornea 12-15 minutos hasta que marque 74 °C.',
      'Sella {n} en la olla 2-3 minutos por lado hasta dorar y retíralo. Agrega ½ taza de agua y raspa el fondo con una cuchara de madera. Regresa la carne, agrega caldo o agua casi hasta cubrirla, tapa y cocina a fuego bajo 60-70 minutos, hasta que se deshaga con el tenedor.',
      'Coloca {n} en la canasta sin encimar, rocíalo con 1 cucharadita de aceite y cocina 10-14 minutos; a los 6 minutos voltéalo. Está listo cuando marque 74 °C o salga jugo transparente.',
    ],
    fish: [
      'Coloca {n} en la sartén caliente, con la piel hacia abajo si tiene, y cocina 3-4 minutos sin moverlo. Voltéalo con cuidado y cocina 2-3 minutos más. Está listo cuando se desmorona fácilmente con el tenedor y se ve opaco.',
      'Coloca {n} en la charola con 1 cucharadita de aceite y hornea 12-15 minutos, hasta que se desmenuce con el tenedor.',
      'Agrega {n} en trozos, 1 minuto sin mover y luego 2-3 minutos volteando con cuidado hasta que esté opaco.',
      'Coloca {n} en la vaporera, tapa y cuece 8-10 minutos hasta que se desmenuce con el tenedor.',
      'Unta aceite en {n} y colócalo en la parrilla 3-4 minutos por lado, volteándolo una sola vez con una espátula ancha.',
      'Coloca {n} en el centro del papel con un chorrito de aceite, rodajas de limón y el sazonador. Cierra bien y hornea 15-18 minutos.',
      'Sella {n} 1 minuto por lado, úntale la pasta de hierbas y hornea 8-10 minutos hasta que se desmenuce.',
      'Corta {n} en trozos y agrégalo los últimos 10 minutos, para que no se deshaga.',
      'Coloca {n} en la canasta, rocíalo con aceite y cocina 8-10 minutos hasta que se desmenuce con el tenedor.',
    ],
    shell: [
      'Agrega {n} a la sartén caliente en una sola capa y cocina 2 minutos por lado, hasta que se pongan rosados y se enrosquen en forma de C. No los pases de tiempo: se endurecen.',
      'Coloca {n} en la charola con 1 cucharadita de aceite y hornea 6-8 minutos, hasta que estén rosados y firmes.',
      'Agrega {n} y saltea 2-3 minutos hasta que se pongan rosados.',
      'Coloca {n} en la vaporera y cuece 4-5 minutos hasta que estén rosados.',
      'Ensarta {n} en palillos de madera mojados y ásalos 2 minutos por lado.',
      'Coloca {n} en el centro del papel con aceite, limón y el sazonador; cierra y hornea 12 minutos.',
      'Sella {n} 1 minuto por lado y pásalos con la pasta de hierbas a la charola; hornea 4-5 minutos.',
      'Agrega {n} los últimos 5 minutos de cocción para que no se endurezcan.',
      'Coloca {n} en la canasta y cocina 5-6 minutos, moviendo a la mitad, hasta que estén rosados.',
    ],
    plant: [
      'Seca {n} y colócalo en la sartén caliente. Cocina 3-4 minutos por lado sin moverlo hasta que se dore y se despegue solo.',
      'Mezcla {n} con 1 cucharadita de aceite y el sazonador, extiéndelo en la charola y hornea 25 minutos, volteando a la mitad, hasta que esté dorado y firme.',
      'Agrega {n} y deja 2 minutos sin mover para que dore; luego mueve 3-4 minutos más.',
      'Coloca {n} en la vaporera y cuece 10 minutos; luego dóralo 2 minutos en sartén si quieres textura.',
      'Unta {n} con aceite y ásalo 4 minutos por lado hasta que se marquen las líneas.',
      'Coloca {n} en el centro del papel con aceite y sazonador; cierra y hornea 20 minutos.',
      'Sella {n} 2 minutos por lado, úntalo con la pasta de hierbas y hornea 15 minutos.',
      'Dora {n} aparte 3 minutos y agrégalo los últimos 15 minutos de cocción.',
      'Coloca {n} en la canasta con 1 cucharadita de aceite y cocina 12-14 minutos, moviendo a la mitad, hasta que esté dorado.',
    ],
    canned: ['Calienta {n} en la sartén 2 minutos con una cucharadita de aceite y el sazonador, moviendo, hasta que se caliente parejo.'],
  };
  const VCOOK = {
    hard: [
      'Pon {n} en la misma sartén con 2 cucharadas de agua, tapa y cocina 4 minutos; destapa y dora 3 minutos moviendo, hasta que un tenedor entre fácil.',
      'Mezcla {n} con 1 cucharadita de aceite y una pizca de sal, extiéndelo en una sola capa en la charola y hornéalo 20-25 minutos, volteando a la mitad, hasta que dore en las orillas.',
      'Cuando termines con la proteína, saltea {n} 5-6 minutos, agrega 2 cucharadas de agua, tapa 1 minuto y destapa para que se evapore.',
      'Pon {n} en la vaporera los últimos 8-10 minutos, hasta que un tenedor entre fácil.',
      'Cuece {n} 3 minutos en agua hirviendo, escúrrelo y ásalo 3-4 minutos por lado en la parrilla.',
      'Acomoda {n} alrededor de la proteína dentro del paquete (cortado en piezas pequeñas para que se cueza).',
      'Mezcla {n} con aceite y sal y hornéalo en la misma charola los últimos 20 minutos.',
      'Agrega {n} a la olla los últimos 25 minutos.',
      'Mezcla {n} con 1 cucharadita de aceite y cocínalo 12-15 minutos en la canasta, moviendo a la mitad.',
    ],
    soft: [
      'Después de la proteína, cocina {n} en la misma sartén 4-5 minutos moviendo, hasta que se ablande y se dore ligeramente.',
      'Mezcla {n} con 1 cucharadita de aceite y sal, agrégalo a la charola los últimos 15 minutos de horno.',
      'Saltea {n} 3-4 minutos en el wok, hasta que esté suave pero aún con textura.',
      'Pon {n} en la vaporera los últimos 5-6 minutos.',
      'Unta {n} con aceite y ásalo 3 minutos por lado hasta que se marque.',
      'Acomoda {n} alrededor de la proteína dentro del paquete.',
      'Agrega {n} en la misma charola los últimos 15 minutos.',
      'Agrega {n} a la olla los últimos 15 minutos.',
      'Mezcla {n} con 1 cucharadita de aceite y cocínalo 8-10 minutos en la canasta, moviendo a la mitad.',
    ],
    leaf: [
      'Agrega {n} al final a la sartén, 1-2 minutos, hasta que apenas se marchite.',
      'Agrega {n} sobre la charola los últimos 2 minutos para que se marchite con el calor.',
      'Agrega {n} los últimos 30 segundos y mezcla hasta que se marchite.',
      'Coloca {n} en la vaporera los últimos 2 minutos.',
      'Ásalo 1 minuto por lado o déjalo crudo.',
      'Acomódalo dentro del paquete debajo de la proteína.',
      'Agrega {n} al final, cuando saques la charola, y mezcla con el calor.',
      'Agrega {n} apagando el fuego y tapa 2 minutos.',
      'Agrega {n} los últimos 2 minutos de cocción.',
    ],
  };
  const PRECOOK = { papa: '12-15 minutos, hasta que un tenedor entre sin resistencia', camote: '12-15 minutos, hasta que un tenedor entre sin resistencia', coliflor: '4-5 minutos, hasta que estén suaves pero firmes', brocoli: '3-4 minutos, hasta que estén verde brillante y firmes', ejote: '5 minutos, hasta que estén suaves pero crujientes', esparrago: '3 minutos, hasta que estén verde brillante', chayote: '10 minutos, hasta que estén suaves' };
  const SIDE = {
    grain: 'Calienta {n}: 1 minuto en microondas con 1 cucharada de agua y tapado, o 3 minutos en una sartén con una cucharada de agua, moviendo.',
    legume: 'Calienta {n} en una cacerola pequeña con 2 cucharadas de agua, 3-4 minutos a fuego medio, moviendo.',
    bread: 'Calienta {n} en una sartén seca a fuego medio, 30 segundos por lado, y mantenlas envueltas en un trapo.',
    raw: 'Deja {n} crudo y fresco, listo para acompañar.',
  };

  /* ---- generación de los pasos ---- */
  const FAM_TOOLS = { smooth: 'una licuadora, un vaso y una cuchara', juice: 'una licuadora, un colador y un vaso', infus: 'una jarra, un cuchillo y una tabla', hot: 'un cazo pequeño, una cuchara y una taza', yog: 'un bowl o vaso y una cuchara', oats: 'un tazón o frasco y una cuchara', mix: 'un bol y una cuchara', fruitsnack: 'un cuchillo, una tabla y un plato' };
  const TOOLS_DEF = 'una tabla para picar, un cuchillo afilado, tazas y cucharas medidoras, un tazón, papel de cocina y una sartén antiadherente';
  const cutFor = (a, i) => a.fam === 'prot' ? ['filetes', 'filetes', 'tiras', 'filetes', 'filetes', 'filetes', 'filetes', 'cubos', 'cubos'][i] : ['salad', 'saladsimple', 'patty', 'soup'].includes(a.fam) ? 'chico' : ['wrap', 'quesa', 'tostada'].includes(a.fam) ? 'tiras' : 'cubos';
  const fill = (t, ctx) => t.replace(/\{(\w+)\}/g, (_, k) => (ctx[k] != null ? ctx[k] : ''));

  J.makeSteps = function ({ a, met, metI, all, chosen, ctx, sty }) {
    const fam = a.fam, cut = cutFor(a, metI), lowN = (k) => nm(k);
    const eggRaw = fam === 'eggs' || (fam === 'eggsimple' && metI > 1);
    const G = [];
    const list = all.filter(([k]) => k !== 'agua').map(([k, g]) => qty(k, g));
    G.push({ h: 'Antes de empezar', items: [
      'Lávate las manos con agua y jabón durante 20 segundos y limpia tu área de trabajo.',
      'Ten a la mano: ' + (FAM_TOOLS[fam] || TOOLS_DEF) + '.',
      'Mide y separa tus ingredientes (para 1 porción): ' + list.join('; ') + '. Además ten sal y pimienta negra a mano.',
      'Tiempo aproximado: ' + met.t + ' minutos en total.',
    ] });
    const prep = [], seen = new Set();
    all.forEach(([k, g]) => {
      if (seen.has(k) || NOPREP.has(k) || !PREPK[k]) return; seen.add(k);
      if (eggRaw && (k === 'huevo' || k === 'clara')) return;
      prep.push(PREPK[k](qty(k, g), cut, g));
    });
    if (prep.length) G.push({ h: 'Prepara los ingredientes', items: prep });
    let cook = [];
    if (fam === 'prot') {
      const [p0, p1, p2] = chosen.map((c) => c[0]), pc = CLS[p0] || 'meat', vc = CLS[p1] || 'soft', sc = CLS[p2];
      const pt = PCOOK[pc] || PCOOK.meat;
      const side = SIDE[sc] || null;
      cook.push(SETUP[metI].replace('{st}', ctx.st));
      cook.push(fill(pt[pt.length === 1 ? 0 : metI], { n: lowN(p0), st: ctx.st }).replace('{n}', lowN(p0)));
      const vt = VCOOK[vc] || VCOOK.soft; cook.push(vt[metI].replace(/\{n\}/g, lowN(p1)));
      if (side) cook.push(side.replace(/\{n\}/g, lowN(p2)));
      else if (['hard', 'soft', 'leaf'].includes(sc)) cook.push(VCOOK[sc][metI].replace(/\{n\}/g, lowN(p2)));
      else cook.push(SIDE.raw.replace(/\{n\}/g, lowN(p2)));
      cook.push(`Mezcla el sazonador estilo ${sty.n}: ${sty.sp} (en total ½ cucharadita de especias o el jugo de ½ limón) y repártelo sobre todo.`);
    } else {
      const seenH = new Set();
      if (!['potato', 'soup', 'stew', 'rice', 'calab', 'beans'].includes(fam)) all.forEach(([k]) => { if (PRECOOK[k] && !seenH.has(k)) { seenH.add(k); cook.push(`Cuece ${lowN(k)}: pon a hervir 1 litro de agua con ½ cucharadita de sal, agrégalo y cuécelo ${PRECOOK[k]}; escúrrelo bien y resérvalo.`); } });
      cook = cook.concat(met.s.map((t) => fill(t, ctx)));
    }
    G.push({ h: 'Cocina', items: cook });
    const end = ['Prueba y ajusta la sazón: más sal (de pizca en pizca), unas gotas de limón o ' + sty.sp + '.'];
    end.push(fam === 'prot' ? `Emplata: pon ${lowN(chosen[2][0])} como base, encima ${lowN(chosen[1][0])} y ${lowN(chosen[0][0])}; sirve enseguida, mientras está caliente.` : 'Sirve enseguida en un plato o tazón.');
    const pk = CLS[chosen[0] && chosen[0][0]];
    end.push(['meat', 'fish', 'shell', 'canned'].includes(pk) ? 'Si sobra, guárdalo en un recipiente hermético en el refrigerador hasta 2 días y recaliéntalo hasta que esté muy caliente.' : 'Si sobra, guárdalo tapado en el refrigerador y consúmelo en 1 o 2 días.');
    G.push({ h: 'Termina y sirve', items: end });
    return G;
  };
})(window.J = window.J || {});
