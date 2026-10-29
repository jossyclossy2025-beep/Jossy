/* Motor de recetas: genera millones de recetas coherentes de forma determinista y sin internet.
   Cada receta = arquetipo (plantilla) + ingredientes por ranura + método + estilo.
   La nutrición se calcula sumando los ingredientes reales (valores por 100 g). */
(function (J) {
  // nombre, kcal, proteína, carbohidratos, grasa, azúcar (por 100 g), banderas
  // m carne, f pescado, d lácteo, e huevo, g gluten, n frutos secos, s azúcar añadida/miel
  const ING = {
    pollo: ['pechuga de pollo', 165, 31, 0, 3.6, 0, 'm'], pavo: ['pechuga de pavo', 135, 30, 0, 1, 0, 'm'],
    res: ['res magra', 180, 26, 0, 8, 0, 'm'], cerdo: ['lomo de cerdo', 143, 26, 0, 3.5, 0, 'm'],
    salmon: ['salmón', 208, 20, 0, 13, 0, 'f'], tilapia: ['filete de pescado blanco', 90, 19, 0, 1, 0, 'f'],
    atun: ['atún', 130, 29, 0, 1, 0, 'f'], camaron: ['camarones', 99, 24, 0.2, 0.3, 0, 'f'], sardina: ['sardinas', 208, 25, 0, 11, 0, 'f'],
    huevo: ['huevo', 143, 13, 1, 10, 1, 'e'], clara: ['claras de huevo', 52, 11, 0.7, 0.2, 0.7, 'e'],
    tofu: ['tofu firme', 76, 8, 2, 4.8, 0.6, ''], tempeh: ['tempeh', 193, 19, 9, 11, 0, ''],
    lenteja: ['lentejas cocidas', 116, 9, 20, 0.4, 1.8, ''], garbanzo: ['garbanzos cocidos', 164, 9, 27, 2.6, 4.8, ''],
    frijol: ['frijoles negros cocidos', 132, 9, 24, 0.5, 0.3, ''], chicharo: ['chícharos', 81, 5, 14, 0.4, 5.7, ''],
    cottage: ['queso cottage', 98, 11, 3.4, 4.3, 2.7, 'd'], yogur: ['yogur griego natural', 59, 10, 3.6, 0.4, 3.2, 'd'],
    feta: ['queso feta', 264, 14, 4, 21, 4, 'd'], mozz: ['mozzarella light', 250, 24, 3, 16, 1, 'd'],
    proteina: ['proteína en polvo', 380, 80, 8, 5, 3, 'd'],
    brocoli: ['brócoli', 34, 2.8, 7, 0.4, 1.7, ''], espinaca: ['espinaca', 23, 2.9, 3.6, 0.4, 0.4, ''],
    calabacin: ['calabacín', 17, 1.2, 3.1, 0.3, 2.5, ''], coliflor: ['coliflor', 25, 1.9, 5, 0.3, 1.9, ''],
    champi: ['champiñones', 22, 3.1, 3.3, 0.3, 2, ''], pimiento: ['pimiento', 31, 1, 6, 0.3, 4.2, ''],
    tomate: ['tomate', 18, 0.9, 3.9, 0.2, 2.6, ''], pepino: ['pepino', 15, 0.7, 3.6, 0.1, 1.7, ''],
    zanahoria: ['zanahoria', 41, 0.9, 10, 0.2, 4.7, ''], esparrago: ['espárragos', 20, 2.2, 3.9, 0.1, 1.9, ''],
    berenjena: ['berenjena', 25, 1, 6, 0.2, 3.5, ''], kale: ['col rizada (kale)', 49, 4.3, 9, 0.9, 2.3, ''],
    lechuga: ['lechuga', 15, 1.4, 2.9, 0.2, 0.8, ''], cebolla: ['cebolla', 40, 1.1, 9.3, 0.1, 4.2, ''],
    ejote: ['ejotes', 31, 1.8, 7, 0.2, 3.3, ''], apio: ['apio', 14, 0.7, 3, 0.2, 1.3, ''],
    aguacate: ['aguacate', 160, 2, 9, 15, 0.7, ''], aceite: ['aceite de oliva', 884, 0, 0, 100, 0, ''],
    almendra: ['almendras', 579, 21, 22, 50, 4, 'n'], nuez: ['nueces', 654, 15, 14, 65, 2.6, 'n'],
    chia: ['semillas de chía', 486, 17, 42, 31, 0, ''], calabazas: ['semillas de calabaza', 559, 30, 11, 49, 1.4, ''],
    linaza: ['linaza molida', 534, 18, 29, 42, 1.6, ''], mani: ['crema de cacahuate natural', 588, 25, 20, 50, 9, 'n'],
    hummus: ['hummus', 166, 8, 14, 10, 0.3, ''], tahini: ['tahini', 595, 17, 21, 54, 0.5, ''],
    aceituna: ['aceitunas', 115, 0.8, 6, 11, 0, ''], coco: ['coco rallado sin azúcar', 354, 3.3, 15, 33, 6, ''],
    lcoco: ['leche de coco ligera', 90, 1, 2, 9, 1, ''],
    arroz: ['arroz integral cocido', 112, 2.3, 24, 0.8, 0.2, ''], quinoa: ['quinoa cocida', 120, 4.4, 21, 1.9, 0.9, ''],
    avena: ['avena', 389, 17, 66, 7, 1, 'g'], pan: ['pan integral', 247, 13, 41, 3.4, 6, 'g'],
    tortilla: ['tortilla de maíz', 218, 5.7, 45, 2.9, 0.9, ''], pasta: ['pasta integral cocida', 124, 5, 25, 1.1, 0.6, 'g'],
    camote: ['camote', 86, 1.6, 20, 0.1, 4.2, ''], papa: ['papa', 77, 2, 17, 0.1, 0.8, ''],
    fresa: ['fresas', 32, 0.7, 7.7, 0.3, 4.9, ''], arandano: ['arándanos', 57, 0.7, 14, 0.3, 10, ''],
    manzana: ['manzana', 52, 0.3, 14, 0.2, 10, ''], platano: ['plátano', 89, 1.1, 23, 0.3, 12, ''],
    mango: ['mango', 60, 0.8, 15, 0.4, 14, ''], frambuesa: ['frambuesas', 52, 1.2, 12, 0.7, 4.4, ''],
    pina: ['piña', 50, 0.5, 13, 0.1, 10, ''], naranja: ['naranja', 47, 0.9, 12, 0.1, 9, ''],
    limon: ['limón', 29, 1.1, 9, 0.3, 2.5, ''], datil: ['dátiles', 282, 2.5, 75, 0.4, 63, ''],
    sandia: ['sandía', 30, 0.6, 8, 0.2, 6, ''], pera: ['pera', 57, 0.4, 15, 0.1, 10, ''], kiwi: ['kiwi', 61, 1.1, 15, 0.5, 9, ''],
    cacao: ['cacao puro en polvo', 228, 20, 58, 14, 1.8, ''], lalmendra: ['leche de almendra sin azúcar', 15, 0.6, 0.3, 1.2, 0, 'n'],
    ldescremada: ['leche descremada', 34, 3.4, 5, 0.1, 5, 'd'], agua: ['agua', 0, 0, 0, 0, 0, ''],
    te: ['té verde', 1, 0, 0.2, 0, 0, ''], cafe: ['café', 2, 0.1, 0, 0, 0, ''], miel: ['miel', 304, 0.3, 82, 0, 82, 's'],
    canela: ['canela', 247, 4, 81, 1.2, 2, ''], jengibre: ['jengibre fresco', 80, 1.8, 18, 0.8, 1.7, ''],
    menta: ['hojas de menta', 44, 3.3, 8, 0.7, 0, ''], curcuma: ['cúrcuma', 312, 10, 67, 3, 3, ''], caldo: ['caldo de verduras bajo en sodio', 5, 0.2, 0.8, 0.1, 0.4, ''],
    arrozb: ['arroz blanco cocido', 130, 2.7, 28, 0.3, 0.1, ''], pastab: ['pasta cocida', 158, 5.8, 31, 0.9, 0.6, 'g'],
    jamon: ['jamón de pavo', 104, 17, 2, 3, 1, 'm'], panela: ['queso panela', 260, 18, 3, 20, 2, 'd'], molida: ['carne molida magra', 215, 26, 0, 12, 0, 'm'],
    ajo: ['ajo', 149, 6.4, 33, 0.5, 1, ''], cilantro: ['cilantro', 23, 2.1, 3.7, 0.5, 0.9, ''], mantequilla: ['mantequilla', 717, 0.9, 0.1, 81, 0.1, 'd'],
    nopal: ['nopales', 16, 1.3, 3.3, 0.1, 1.1, ''], chayote: ['chayote', 19, 0.8, 4.5, 0.1, 1.7, ''], elote: ['granos de elote', 96, 3.4, 21, 1.5, 4.5, ''],
    durazno: ['durazno', 39, 0.9, 10, 0.3, 8.4, ''], uva: ['uvas', 69, 0.7, 18, 0.2, 15, ''], papaya: ['papaya', 43, 0.5, 11, 0.3, 7.8, ''], melon: ['melón', 34, 0.8, 8, 0.2, 7.9, ''],
    stevia: ['stevia', 0, 0, 0, 0, 0, ''],
  };
  J.ING = ING;

  const S = (s) => s.split(' ').map((x) => { const [k, g] = x.split(':'); return [k, +g]; });
  const PROT = 'pollo:150 pavo:150 res:130 cerdo:140 salmon:140 tilapia:160 atun:130 camaron:150 tofu:180 tempeh:130 sardina:120';
  const VEG = 'brocoli:120 esparrago:100 ejote:100 calabacin:120 coliflor:120 pimiento:100 berenjena:120 espinaca:100 zanahoria:100 champi:100 kale:80 chicharo:80';
  const CARB = 'arroz:120 quinoa:120 camote:150 papa:150 pasta:120 tortilla:60 lenteja:120 garbanzo:100 coliflor:150 calabacin:150 lechuga:100 frijol:120';
  const GREENS = 'lechuga:80 espinaca:60 kale:60 pepino:80 tomate:80 zanahoria:60 apio:50 pimiento:60 brocoli:70 calabacin:80';
  const FATS = 'aguacate:60 aceituna:25 nuez:15 feta:30 almendra:15 calabazas:15 hummus:30 mozz:30 tahini:15';
  const FRUIT = 'fresa:80 arandano:70 manzana:80 platano:60 mango:80 frambuesa:80 pina:80 naranja:80 kiwi:70 pera:80 sandia:100';
  const NUTS = 'chia:10 almendra:15 nuez:15 coco:10 calabazas:15 cacao:8 avena:25 mani:12 linaza:10 tahini:10';
  const VEGL = 'brocoli:70 espinaca:60 calabacin:70 coliflor:70 champi:70 pimiento:60 zanahoria:60 tomate:70 cebolla:30 esparrago:70 kale:50 berenjena:60';

  // Métodos: nombre|nivel|minutos|pasos... (placeholders {0}{1}{2}{3} = ingredientes por ranura, {f} fijos, {st} estilo)
  const M = {
    prot: ['a la plancha|1|15|Sazona {0} con {st}.|Calienta una sartén antiadherente con un poco de aceite a fuego medio-alto y cocina {0} 4-5 min por lado.|Cuece {1} al vapor o salteado 5 min.|Calienta {2} y sirve todo junto.',
      'al horno|2|35|Precalienta el horno a 200 °C.|Marina {0} con {st} y hornea 20-25 min.|Hornea {1} en la misma charola los últimos 15 min.|Prepara {2} y emplata.',
      'salteado en wok|2|20|Corta {0} y {1} en tiras finas.|Calienta el wok con aceite a fuego alto.|Saltea {0} 4 min, añade {1} y {st} y cocina 3 min más.|Sirve sobre {2}.',
      'al vapor|1|20|Coloca {0} en la vaporera con {st}.|Cuece 10-12 min; agrega {1} los últimos 5 min.|Sirve con {2}.',
      'a la parrilla|2|25|Calienta la parrilla a fuego alto.|Marina {0} 10 min con {st}.|Asa {0} y {1} 4-5 min por lado.|Acompaña con {2}.',
      'en papillote|3|40|Precalienta el horno a 190 °C y corta cuadros grandes de papel pergamino.|Coloca {0} y {1} al centro con {st} y un chorrito de aceite.|Cierra herméticamente y hornea 20-25 min.|Abre con cuidado y sirve con {2}.',
      'en costra de hierbas|3|45|Mezcla hierbas frescas picadas con {st} y aceite hasta formar una pasta.|Unta {0} y séllalo en sartén 2 min por lado.|Hornea a 190 °C 12-15 min.|Saltea {1} con el jugo de la sartén.|Reposa 5 min y sirve con {2}.',
      'estofado lento|3|90|Sella {0} en cubos en una olla con aceite.|Añade {1}, {st} y caldo bajo en sodio hasta cubrir.|Cocina tapado a fuego bajo 60-70 min.|Sirve sobre {2}.',
      'en freidora de aire|1|18|Precalienta la freidora de aire a 190 °C.|Sazona {0} con {st}.|Cocina {0} 10-12 min y {1} 8 min, moviendo a la mitad.|Sirve con {2}.'],
    salad: ['fresca|1|10|Pon {0} ya cortado en un bol grande.|Agrega {1}: si es proteína cocida, córtala en cubos de 1.5 cm o desmenúzala; si es queso, desmorónalo.|Añade {2} encima, sin mezclar todavía.|En una taza bate 1 cucharada de aceite de oliva, el jugo de ½ limón, una pizca de sal y {st} con un tenedor hasta que se integre (esa es la vinagreta).|Vierte la vinagreta justo antes de comer y mezcla con dos cucharas de abajo hacia arriba, 20 segundos, para que no se aplaste la verdura.',
      'tibia|2|20|Calienta una sartén a fuego medio con 1 cucharadita de aceite y saltea {0} 2-3 minutos, solo hasta que se ablande un poco pero conserve color y textura.|Cuece {1} en otra sartén hasta que esté bien cocido: dorado por fuera y sin partes crudas por dentro (el pollo debe llegar a 74 °C); déjalo reposar 3 minutos y córtalo en tiras.|Pon {0} en un plato hondo, acomoda {1} encima y añade {2}.|Mezcla en una taza 1 cucharada de aceite de oliva, el jugo de ½ limón, sal y {st}, y vierte sobre la ensalada mientras todavía está tibia, para que absorba el sabor.',
      'en bowl con vinagreta casera|2|20|Prepara la vinagreta: en un frasco con tapa pon 1 cucharada de aceite de oliva, 1 cucharada de jugo de limón, 1 cucharadita de mostaza (opcional), una pizca de sal, pimienta y {st}; cierra y agita 15 segundos hasta que se vea cremosa.|Acomoda {0} en el fondo de un bowl, formando una cama.|Coloca {1} en una sección del bowl, {2} en otra, sin mezclar, para que se vea bonito.|Rocía la vinagreta en zigzag justo antes de comer.',
      'estilo mediterráneo|3|30|Marina {1} 15 minutos con el jugo de ½ limón, 1 cucharadita de aceite, sal y {st}.|Calienta una sartén a fuego medio-alto y cuece {1} hasta que esté dorado por fuera y bien cocido por dentro (pollo y pavo: 74 °C; pescado: se desmorona con el tenedor).|Mientras reposa 3 minutos, saltea {0} 2 minutos en la misma sartén para aprovechar los jugos.|Arma la ensalada en un plato con {0}, {1} en rebanadas y {2}; termina con un hilo de aceite de oliva.'],
    bowl: ['bowl|1|20|Cocina o calienta {0} (si es arroz, quinoa o pasta, que esté caliente y suelto; si es camote o papa, que un tenedor entre sin resistencia).|Cocina {1} en una sartén con 1 cucharadita de aceite a fuego medio-alto hasta que esté dorado por fuera y bien cocido por dentro (que no queden partes rosadas); déjalo reposar 3 minutos y córtalo.|Saltea o ásalo {2} 4-5 minutos, hasta que esté suave pero con un poco de textura.|Arma el bowl: pon {0} en el fondo y acomoda {1} y {2} en secciones; termina con {3} y sazona con {st}.',
      'bowl al horno|2|35|Precalienta el horno a 200 °C y forra una charola con papel pergamino.|Mezcla {2} con 1 cucharadita de aceite, sal y {st}, extiéndelo en una sola capa y hornea 20 minutos, volteando a la mitad.|Mientras, cocina {1} en sartén a fuego medio-alto hasta que esté dorado y bien cocido, y deja reposar 3 minutos.|Calienta {0}, acomoda todo en un bowl y termina con {3}.',
      'poke bowl|3|35|Cocina {0} y déjalo enfriar 10 minutos para que no cueza lo demás.|Corta {1} (ya cocido y frío) en cubos de 2 cm y mézclalo 10 minutos con 1 cucharadita de salsa de soya baja en sodio, unas gotas de limón y {st}.|Corta {2} en láminas muy finas.|Arma el bowl: arroz o base al fondo, {1} marinado en un lado, {2} en otro y termina con {3}.'],
    wrap: ['tacos|1|15|Calienta las tortillas o las hojas de lechuga: las tortillas, 30 segundos por lado en una sartén seca; envuélvelas en un trapo para que no se endurezcan.|Calienta una sartén a fuego medio-alto con 1 cucharadita de aceite y cocina {0} con {st} 5-6 minutos hasta que esté dorado y bien cocido; deshébralo o córtalo en trocitos.|Saltea {1} en la misma sartén 3-4 minutos, hasta que esté suave.|Reparte el relleno en el centro de cada taco, sin sobrepasar 2 cucharadas por pieza para que no se rompa, y termina con salsa fresca o jugo de limón.',
      'wraps|2|20|Cocina {0} con {st} en una sartén caliente hasta que esté dorado y bien cocido (5-6 minutos); deja reposar 2 minutos y córtalo en tiras.|Saltea {1} 3-4 minutos en la misma sartén.|Pon la hoja o tortilla sobre la tabla, coloca el relleno en el centro dejando 3 cm libres en los bordes.|Dobla primero los lados hacia adentro, luego enrolla desde abajo apretando con firmeza, y córtalo por la mitad en diagonal.',
      'tacos al horno|2|30|Precalienta el horno a 190 °C y forra una charola con papel.|Mezcla {0} ya cocido con {1} picado y {st}.|Rellena cada tortilla con 2 cucharadas, dóblala y acomódala en la charola, con el doblez hacia abajo.|Rocía con unas gotas de aceite y hornea 10-12 minutos hasta que estén doradas y crujientes.'],
    soup: ['sopa|1|30|Calienta 1 cucharadita de aceite en una olla a fuego medio y sofríe la cebolla picada 3 minutos, hasta que se vea transparente.|Agrega {1} y cocina 3 minutos, moviendo.|Añade {0}, el caldo, {st} y sal; sube el fuego hasta que hierva, luego baja a fuego bajo.|Tapa y cocina 20 minutos, hasta que las verduras estén suaves al picarlas con un tenedor.|Prueba el caldo y ajusta la sal.',
      'crema|2|35|Calienta 1 cucharadita de aceite en una olla a fuego medio y sofríe la cebolla 3 minutos.|Agrega {1} en trozos, el caldo, {st} y sal; hierve, baja el fuego y cocina tapado 15-20 minutos hasta que todo esté muy suave.|Deja enfriar 5 minutos y licúa en tandas pequeñas (con la tapa sujeta con un trapo, porque el vapor empuja) hasta que quede una crema sin grumos.|Regresa a la olla, añade {0} y calienta 5 minutos a fuego bajo, moviendo. Si queda muy espesa, agrega un poco de agua caliente.',
      'caldo ligero|1|25|Pon el caldo a hervir en una olla con {st}.|Agrega {0} y {1} y cocina 15 minutos a fuego medio-bajo.|Prueba una verdura: debe estar suave. Ajusta la sal y sirve bien caliente.',
      'pozole ligero|3|60|Hierve {0} en el caldo con {st} y sal, 30 minutos a fuego bajo, quitando con una cuchara la espuma que suba a la superficie.|Agrega {1} y cocina 20 minutos más.|Prueba y ajusta la sal.|Sirve con lechuga picada, limón y rábano en rodajas.'],
    stew: ['curry|2|35|Calienta 1 cucharada de aceite en una sartén honda a fuego medio y sofríe la cebolla picada 3 minutos con {st}, hasta que huela rico.|Agrega {0} y {1} en trozos y cocina 5 minutos, moviendo.|Añade el tomate, la leche de coco ligera y sal; cuando suelte el hervor, baja el fuego, tapa y cocina 15 minutos.|Destapa los últimos 3 minutos para que espese. Sirve sobre {2}.',
      'guiso|2|40|Calienta el aceite en una olla a fuego medio y sofríe {1} con {st} 5 minutos.|Agrega {0}, el tomate picado, sal y ½ taza de agua o caldo.|Tapa y cocina a fuego bajo 25 minutos, moviendo de vez en cuando; si se seca, agrega un chorrito de agua.|Prueba, ajusta la sal y sirve con {2}.',
      'chili|3|60|Sofríe la cebolla con {st} en 1 cucharada de aceite, 4 minutos.|Añade {0} y {1}, mezcla y cocina 5 minutos.|Agrega el tomate molido o picado, sal y 1 taza de agua; cuando hierva, baja a fuego mínimo.|Tapa parcialmente y cocina 40 minutos, moviendo cada 10, hasta que espese. Sirve con {2}.',
      'tinga|3|50|Cuece {0} en agua con sal hasta que esté bien cocido y se deshaga; déjalo enfriar y deshébralo con dos tenedores.|Licúa el tomate con {st}, una pizca de sal y ¼ de taza de agua.|Sofríe cebolla en rodajas 4 minutos, vierte la salsa y cocina 10 minutos, moviendo.|Agrega {1} y {0} deshebrado y cocina 15 minutos a fuego bajo. Sirve con {2}.'],
    patty: ['hamburguesa|2|25|En un bol, mezcla {0} con {st}, el huevo, la avena y sal, con las manos limpias, solo hasta que se integre (si la amasas de más queda dura).|Divide en 2 porciones y forma discos de 2 cm de grosor, con un hueco pequeño en el centro con el pulgar (así no se infla).|Calienta una sartén o plancha a fuego medio-alto con unas gotas de aceite y cocina 4-5 minutos por lado sin aplastar; deben quedar bien cocidas por dentro (74 °C).|Sirve en hojas de lechuga o pan con {1} y {2}.',
      'albóndigas|3|40|Precalienta el horno a 200 °C y forra una charola con papel.|Mezcla {0} con {st}, el huevo, la avena y sal; forma bolitas de 3 cm (unas 8) mojándote las manos para que no se pegue.|Acomódalas en la charola sin que se toquen y hornea 18 minutos, volteándolas a la mitad.|Comprueba que estén bien cocidas cortando una por la mitad: no debe verse rosa. Sirve con {1} y {2}.',
      'brochetas|2|30|Remoja palillos largos de madera 15 minutos para que no se quemen.|Corta {0} y {1} en cubos de 2.5 cm y márinalos 15 minutos con {st}, aceite y sal.|Ensarta alternando los ingredientes, sin apretarlos.|Cocina en la parrilla o sartén a fuego medio-alto 10 minutos, girando cada 2-3 minutos, hasta que estén dorados y bien cocidos. Acompaña con {2}.',
      'croquetas al horno|3|45|Precalienta el horno a 200 °C y engrasa ligeramente una charola.|Tritura o machaca {0} hasta tener una pasta; mezcla con el huevo, la avena, {st} y sal.|Refrigera la masa 10 minutos para que sea fácil de manejar y forma 8 croquetas con las manos húmedas.|Hornea 20 minutos, volteándolas a la mitad, hasta que estén doradas. Sirve con {1} y {2}.'],
    stuffed: ['relleno|2|40|Precalienta el horno a 190 °C.|Parte {0} por la mitad a lo largo y hueca el centro con una cuchara, dejando una pared de 1 cm; guarda la pulpa picada.|En una sartén con aceite saltea la pulpa 3 minutos y agrega {1} y {2} con {st} y sal; cocina 6 minutos.|Rellena las mitades, cubre con el queso y hornea 25 minutos, hasta que estén suaves al picarlas con un tenedor y el queso esté dorado.',
      'rellenos gratinados|3|50|Precalienta el horno a 200 °C. Parte {0} a la mitad, hueca, unta con aceite y sal, y hornea 15 minutos boca abajo para suavizar.|Mientras, cocina {1} con {2} y {st} en sartén 6 minutos.|Voltea las mitades, rellénalas y cubre con queso.|Gratina 10 minutos, hasta que el queso burbujee y se dore.'],
    omelet: ['omelette|1|10|Bate {f} con una pizca de sal y pimienta hasta que no se vean hebras de clara.|Calienta una sartén antiadherente de 20 cm a fuego medio con unas gotas de aceite y saltea {0} 2-3 minutos, hasta que se ablande; pásalo a un plato.|Baja el fuego a medio-bajo, vierte el huevo y deja que cuaje 1 minuto; con la espátula, lleva los bordes cocidos hacia el centro e inclina la sartén para que el huevo crudo llegue a los bordes.|Cuando casi no haya líquido (pero siga brillante), pon {0} y {1} en una mitad, dobla con la espátula y deja 30 segundos. Desliza al plato.',
      'frittata al horno|2|25|Precalienta el horno a 190 °C.|Saltea {0} en una sartén apta para horno (de metal, sin mango de plástico) con aceite, 3 minutos.|Bate {f} con sal y pimienta, mezcla con {1} y viértelo sobre las verduras.|Cocina 2 minutos a fuego bajo y pasa al horno 12-15 minutos, hasta que el centro esté firme al tocarlo y los bordes ligeramente dorados. Deja reposar 3 minutos y corta en triángulos.',
      'muffins de huevo|2|30|Precalienta el horno a 180 °C y engrasa 4 moldes de muffin con aceite.|Bate {f} con sal, pimienta y {st}.|Reparte {0} y {1} en los moldes y vierte el huevo hasta ¾ de su altura.|Hornea 18-20 minutos, hasta que estén firmes y dorados. Deja enfriar 5 minutos antes de desmoldar con un cuchillo.',
      'soufflé|3|45|Precalienta el horno a 180 °C y engrasa un molde individual.|Separa las claras de las yemas de {f}. Mezcla las yemas con {0}, {1} y {st}.|Bate las claras con una pizca de sal a mano o con batidora hasta formar picos firmes (al voltear el bol no se caen).|Incorpora las claras en 2 tandas con movimientos envolventes de abajo hacia arriba, sin batir.|Vierte en el molde y hornea 25 minutos sin abrir el horno, hasta que haya crecido y esté dorado.'],
    yog: ['bowl|1|5|Sirve {f} en un bowl.|Lava y prepara {0} y colócalo en un lado.|Añade {1} en otro lado, sin revolver, para que se vea bonito.|Termina con {2} y {st}.',
      'parfait en vaso|1|8|Usa un vaso alto transparente.|Pon una capa de 3 cucharadas de {f} en el fondo.|Agrega una capa de {0} y luego una de {1}; repite una vez más.|Corona con {2} y {st}.',
      'bowl helado (frozen)|2|15|Mezcla {f} con {0} en un recipiente y congela 40 minutos, hasta que esté firme en los bordes.|Rompe con un tenedor y bate hasta que quede cremoso (o pásalo por la licuadora 20 segundos).|Pásalo a un bowl y añade {1}, {2} y {st}. Come de inmediato.',
      'yogur horneado|3|40|Precalienta el horno a 170 °C y engrasa un molde pequeño.|Mezcla {f} con {0}, 1 huevo y {st}.|Vierte en el molde y hornea 25 minutos, hasta que el centro esté firme.|Enfría 10 minutos y corona con {1} y {2}.'],
    oats: ['avena cocida|1|10|Pon {f} con {2} en un cazo pequeño.|Cocina a fuego medio 5 minutos, moviendo seguido con una cuchara para que no se pegue, hasta que espese y se vea cremosa.|Apaga, agrega {0} y {st} y mezcla.|Sirve en un tazón y termina con {1}.',
      'overnight oats|1|5|En un frasco de vidrio mezcla {f}, {2} y {st}.|Tapa y agita o revuelve bien para que no queden grumos.|Refrigera mínimo 6 horas (toda la noche).|Por la mañana, revuelve, y añade {0} y {1} encima.',
      'avena horneada|2|35|Precalienta el horno a 180 °C y engrasa un molde pequeño.|Mezcla {f}, {2}, {0} y {st} en un bol.|Vierte en el molde y hornea 25 minutos, hasta que esté firme y dorada por encima.|Deja reposar 5 minutos y termina con {1}.',
      'granola casera|3|45|Precalienta el horno a 150 °C y forra una charola con papel.|Mezcla {f} con {1}, {st} y una cucharada de aceite.|Extiende en una capa delgada y hornea 30 minutos, moviendo cada 10 para que se dore parejo.|Deja enfriar por completo (se pone crujiente al enfriar). Sirve con {0} y {2}.'],
    toast: ['tostada|1|8|Tuesta {f} en el tostador o en una sartén seca, 2 minutos por lado, hasta que esté dorado y crujiente.|Unta {0} de orilla a orilla con el reverso de una cuchara.|Añade {1} en una capa uniforme y espolvorea {2}.',
      'sándwich abierto|1|10|Tuesta {f} hasta que esté dorado.|Unta {0} sobre el pan.|Coloca {1} y espolvorea {2}.|Corta por la mitad en diagonal.',
      'bocadillo gratinado|2|15|Precalienta el horno a 200 °C con la rejilla arriba.|Unta {0} en {f} y acomódalo en una charola.|Cubre con {1} y hornea 5-6 minutos, vigilando que no se queme.|Termina con {2}.'],
    scramble: ['revuelto|1|12|Desmenuza {f} con las manos o un tenedor en trozos pequeños.|Calienta una sartén con aceite a fuego medio y saltea el tofu con {st} 4 minutos, hasta que se dore.|Añade {0} y {1} y cocina 3-4 minutos, hasta que estén suaves.|Termina con {2} y ajusta la sal.',
      'scramble tipo mexicano|2|18|Calienta una sartén con aceite a fuego medio y saltea cebolla y {0} 3-4 minutos.|Agrega {f} desmenuzado con {st} y cocina 5 minutos, moviendo.|Suma {1} y deja 2 minutos más.|Sirve con {2} y unas gotas de limón.',
      'burrito bowl|3|30|Desmenuza {f} y saltéalo con {st} 6 minutos hasta que se dore.|Ásalo {0} y {1} en otra sartén 5 minutos.|Arma el bowl: base de lo que prefieras, el tofu, las verduras y termina con {2}.'],
    pancake: ['panqueques|2|20|Licúa {f} 20 segundos, hasta tener una masa lisa y ligeramente espesa (como crema para batir).|Calienta una sartén antiadherente a fuego medio y engrásala apenas con un trapito con aceite.|Vierte ¼ de taza de masa por panqueque; cuando salgan burbujas en la superficie y los bordes se vean secos (2 minutos), voltea y cocina 1 minuto más.|Sirve con {0} y {1}.',
      'waffles|3|25|Licúa {f} hasta que quede lisa la masa. Deja reposar 5 minutos.|Calienta la wafflera y engrásala ligeramente.|Vierte la masa sin llegar a los bordes y cocina 4 minutos, hasta que deje de salir vapor y estén dorados.|Sirve con {0} y {1}.',
      'crepas|3|30|Licúa {f} agregando ¼ de taza de agua extra, hasta que la mezcla esté muy fina como leche espesa; reposa 10 minutos.|Calienta una sartén antiadherente de 20 cm a fuego medio y vierte un cucharón (unas 3 cucharadas); gira la sartén para extender la masa en una capa delgada.|Cocina 1 minuto, voltea con una espátula y cocina 30 segundos más.|Rellena con {0} y {1}, y dobla en cuatro.'],
    snackraw: ['crudos|1|5|Lava {0} y córtalo en bastones de unos 7 cm de largo y 1 cm de grosor.|Pon {1} en un tazón pequeño al centro de un plato.|Acomoda los bastones alrededor para mojar.',
      'chips al horno|2|30|Precalienta el horno a 180 °C y forra una charola con papel.|Corta {0} en rebanadas muy finas (2 mm; usa una mandolina o un pelador) y sécalas con papel.|Mézclalas con 1 cucharadita de aceite, sal y {st}; acomódalas en una capa sin encimar.|Hornea 20 minutos, volteando a la mitad y vigilando al final: se dora rápido. Deja enfriar 5 minutos (se ponen crujientes) y sirve con {1}.',
      'croquetas de verdura|3|35|Precalienta el horno a 200 °C y forra una charola con papel.|Ralla {0} fino, exprime con las manos para sacar el agua y mezcla con {st} y sal.|Si queda muy suelta, añade 1 cucharada de avena. Forma bolitas de 3 cm.|Hornea 20 minutos, volteando a la mitad, hasta que estén doradas. Sirve con {1}.'],
    mix: ['mix|1|3|Mide {0} y {1} con una taza medidora.|Mezcla en un bol y divide en porciones de un puñado en bolsitas o frascos.',
      'mix tostado|2|15|Precalienta el horno a 160 °C y forra una charola con papel.|Extiende {0}, rocía con {st} y hornea 8 minutos moviendo a la mitad, hasta que huela a tostado.|Deja enfriar 10 minutos y mezcla con {1}.'],
    balls: ['bolitas|2|15|Tritura {f} con {0} en un procesador de alimentos hasta que quede una pasta pegajosa; si no tienes, machaca fuerte con un tenedor.|Agrega {1} y mezcla.|Con las manos húmedas forma bolitas de 3 cm y pásalas a un plato.|Refrigera 20 minutos para que se firmen.',
      'barritas|3|40|Precalienta el horno a 170 °C y forra un molde cuadrado con papel.|Mezcla {f}, {0} y {1} hasta formar una masa y presiónala firmemente en el molde.|Hornea 20 minutos hasta que se dore ligeramente.|Enfría por completo antes de cortar en 6 barras.'],
    roll: ['rollitos|1|10|Extiende {1} sobre la tabla (si son rebanadas, hazlas largas y delgadas).|Coloca {0} y {2} a lo largo de uno de los bordes.|Enrolla con firmeza y corta en trozos de 3 cm; sujeta con palillos si hace falta.',
      'rollitos al horno|2|20|Precalienta el horno a 180 °C.|Extiende {1}, pon {0} y {2} y enrolla con firmeza, sujetando con palillos.|Hornea 10 minutos hasta que estén calientes y firmes.'],
    eggs: ['huevos cocidos con|1|15|Pon los huevos en una olla, cúbrelos con agua fría hasta 2 cm por encima y llévalos a hervir a fuego alto.|En cuanto hierva, apaga el fuego, tapa y deja 10 minutos (12 si te gusta la yema bien firme).|Pásalos a un bol con agua fría y hielo 3 minutos, golpea la cáscara y pélalos desde la parte ancha.|Parte por la mitad y sirve con {0} y {1}, con sal y pimienta.',
      'huevos rellenos de|2|20|Cuece los huevos como se indica (10 minutos), enfríalos y pélalos.|Córtalos por la mitad a lo largo y saca las yemas con una cucharita a un bol.|Aplasta las yemas con un tenedor y mezcla con {0}, {st} y sal.|Rellena las claras con una cuchara y termina con {1}.'],
    mousse: ['mousse|2|15|Pon {f} y {0} en la licuadora.|Licúa 40 segundos, hasta que esté muy suave y sin grumos; si queda muy espesa, agrega 1 cucharada de agua.|Pásala a vasitos y refrigera 30 minutos (al enfriar se pone más cremosa).|Sirve con {1} y {2}.',
      'pudín|1|10|Mezcla {f} con {0} en un frasco y revuelve bien.|Tapa y refrigera 2 horas, revolviendo una vez a los 15 minutos para que no se hagan grumos.|Sirve con {1} y {2}.',
      'helado casero|2|10|Congela {0} en trozos al menos 4 horas.|Licúa con {f} unos 30-45 segundos, ayudándote de una cuchara para empujar los trozos.|Sirve de inmediato con {1} y {2}, o congela 30 minutos para una textura más firme.',
      'paletas heladas|2|10|Licúa {f} con {0} hasta que quede suave.|Vierte en moldes para paleta (o vasos pequeños) y coloca un palito de madera.|Congela mínimo 4 horas. Para desmoldar, pasa agua tibia por fuera del molde 10 segundos.',
      'copa en capas|3|25|Prepara una crema suave con {f} mezclando 1 minuto con un batidor.|En un vaso alto, alterna capas: crema, {0} y {1}, repitiendo 2 veces.|Termina con {2}.|Refrigera 20 minutos antes de servir.'],
    bake: ['al horno|1|25|Precalienta el horno a 180 °C y forra una charola con papel.|Corta {0}, colócalo en la charola y espolvorea con {st}.|Hornea 20 minutos, hasta que se sienta suave al picarlo con un tenedor.|Sirve con {1} y {2}.',
      'en sartén|1|12|Calienta una sartén a fuego medio con una gota de aceite.|Cocina {0} con {st} 6-8 minutos, volteando una vez, hasta que esté dorado y suave.|Sirve con {1} y {2}.',
      'en brochetas asadas|2|18|Remoja palillos largos 15 minutos.|Ensarta {0} en cubos de 2.5 cm y ásalos 3 minutos por lado a fuego medio.|Sirve con {1} y {2}.',
      'crumble|3|40|Precalienta el horno a 180 °C.|Mezcla {1} con {f} y {st} hasta formar migajas.|Acomoda {0} en un refractario pequeño, cúbrelo con el crumble y hornea 30 minutos, hasta que esté dorado y burbujee el jugo.|Deja reposar 5 minutos y sirve con {2}.'],
    brownie: ['brownie|3|40|Precalienta el horno a 180 °C y forra un molde pequeño con papel.|Tritura o machaca {0} con {f} hasta que no queden grumos (en procesador o licuadora).|Vierte la masa en el molde, alisa y hornea 25 minutos: al picar con un palillo debe salir con migas húmedas, no líquido.|Enfría 15 minutos antes de cortar y decora con {1} y {2}.',
      'galletas|2|30|Precalienta el horno a 175 °C y forra una charola con papel.|Mezcla {0} con {f} hasta formar una masa que se pueda moldear.|Forma 6 bolitas, aplástalas hasta 1 cm de grosor y acomódalas separadas.|Hornea 12 minutos, enfría 10 minutos en la charola (se endurecen al enfriar) y decora con {1} y {2}.',
      'muffins|3|35|Precalienta el horno a 180 °C y coloca capacillos en un molde de muffins.|Mezcla {0} con {f} hasta que no queden grumos.|Llena los moldes ¾ y hornea 22 minutos, hasta que un palillo salga limpio.|Enfría 10 minutos y decora con {1} y {2}.',
      'mug cake|1|5|Engrasa ligeramente una taza grande apta para microondas.|Mezcla {0} con {f} en la taza hasta que no queden grumos.|Microondas 90 segundos (si tu microondas es débil, 2 minutos); debe verse firme en el centro.|Deja reposar 1 minuto y termina con {1} y {2}.'],
    nice: ['helado|1|8|Congela {0} y {1} en trozos al menos 4 horas.|Procesa con {f} y {st} hasta que quede cremoso, ayudándote de una cuchara para empujar los trozos.|Sirve de inmediato.',
      'sorbete|2|10|Congela {0} y {1} en trozos.|Procesa con {f} y unos cubos de hielo hasta una textura suave.|Sirve en copas y come rápido para que no se derrita.',
      'granizado|1|10|Congela {0} y {1}.|Tritura con {f} y hielo hasta que parezca nieve.|Sirve en un vaso con una pajita ancha.'],
    panna: ['panna cotta ligera|3|30|Espolvorea 1 sobre de grenetina sin sabor en 3 cucharadas de agua fría y deja hidratar 5 minutos.|Calienta {f} con {st} sin dejar que hierva y disuelve la grenetina hidratada moviendo.|Vierte en vasitos y refrigera 4 horas, hasta que cuajen.|Corona con {0} y {1}.',
      'cheesecake en vaso|2|20|Bate {f} con {st} hasta que quede cremoso.|En un vaso, alterna capas de {2}, la crema y {0}.|Termina con {1} y refrigera 1 hora.',
      'crema fría|1|10|Mezcla {f} con {st} hasta que quede suave.|Sirve en un vaso con {0} y {1}.'],
    smooth: ['licuado|1|5|Pon primero el líquido ({f}) en la licuadora y luego {0} (la fruta).|Añade {1} y {st}.|Licúa 30-40 segundos, hasta que no se vean trozos.|Sirve en un vaso frío; si no tienes la fruta congelada, agrega 3 cubos de hielo.',
      'smoothie verde|1|5|Licúa primero {1} con {f} 30 segundos, para que las hojas se deshagan por completo.|Añade {0} y {st} y licúa 30 segundos más.|Prueba y, si te gusta más dulce, agrega más fruta.',
      'batido proteico|1|5|Pon {f} y {0} en la licuadora.|Agrega {1} y {st}.|Licúa 30 segundos; si usas proteína en polvo, no licúes de más para que no haga mucha espuma.',
      'batido helado|2|8|Congela {0} en trozos al menos 4 horas.|Licúa con {f} y {1}, 40 segundos, empujando los trozos con una cuchara.|Debe quedar espeso, casi como helado. Sirve de inmediato.'],
    infus: ['agua infusionada|1|10|Lava y corta {0} y {1} en rodajas.|Colócalos en una jarra de 1 litro y vierte {f}.|Machaca suavemente con una cuchara para soltar el sabor y refrigera 2 horas.|Sirve con hielo.',
      'té helado|2|20|Calienta agua sin que hierva a tope (unos 80 °C) y prepara el té con {f} durante 3 minutos, para que no se amargue.|Retira la bolsita y añade {0} y {1}.|Deja enfriar a temperatura ambiente y refrigera.|Sirve con hielo.',
      'limonada natural|1|8|Exprime los limones y cuela para quitar semillas.|Mezcla con {f} en una jarra y agrega {0} y {1}.|Endulza, si quieres, con stevia al gusto, probando poco a poco.',
      'kombucha exprés|3|30|Prepara una infusión fuerte con 2 bolsitas de té en {f} caliente y deja reposar 5 minutos.|Añade {0} y {1} y deja enfriar completamente.|Refrigera 1 hora y sirve con hielo.'],
    hot: ['latte caliente|1|8|Calienta {f} en un cazo a fuego medio hasta que humee (sin hervir).|Disuelve {0} en la bebida caliente moviendo con una cuchara.|Añade {1} y {st}.|Si tienes un batidor, bate 30 segundos para hacer espuma.',
      'té especiado|2|12|Hierve {f} con {1} a fuego medio durante 5 minutos.|Agrega {0}, apaga y deja reposar 5 minutos tapado.|Cuela y sirve caliente.',
      'chocolate caliente fit|2|10|Calienta {f} en un cazo a fuego medio, sin que hierva.|Añade {0} y {1} y bate 1 minuto con un batidor hasta que no queden grumos.|Sirve humeante.'],
    juice: ['jugo verde|1|8|Pon {0} en la licuadora con ½ taza de agua y licúa 30 segundos.|Agrega {1} y {2} y licúa 30 segundos más.|Cuela con un colador fino si prefieres un jugo sin fibra, presionando con una cuchara.',
      'jugo detox|2|10|Licúa {0} y {1} con el agua 40 segundos.|Agrega {2} y unos cubos de hielo y licúa de nuevo.|Sirve enseguida para aprovechar los nutrientes.',
      'licuado verde cremoso|2|8|Licúa {0} con {f} 30 segundos.|Añade {1} y {2} y licúa 30 segundos más hasta que esté cremoso.'],
  };

  Object.assign(M, {
    eggsimple: ['revueltos|1|8|Calienta una sartén antiadherente a fuego medio con el aceite 1 minuto.|Cocina {0} 2-3 minutos moviendo, hasta que suelte su aroma y se ablande.|Baja el fuego a bajo, vierte el huevo batido y mueve despacio con una espátula, formando grumos grandes, 1 a 2 minutos. Apaga cuando aún se vea un poco húmedo: terminará de cocerse con el calor de la sartén.|Sirve junto a {1}.',
      'a la mexicana|1|12|Calienta la sartén a fuego medio con el aceite.|Sofríe {0} 3 minutos hasta que se ablande y se vea transparente.|Agrega el huevo batido y mueve suave 2 minutos hasta cuajar.|Sirve con {1} y un chorrito de limón.',
      'estrellados|1|8|Calienta la sartén a fuego medio-bajo con el aceite y espera 1 minuto.|Rompe los huevos primero en una taza y deslízalos con cuidado a la sartén, sin que se toquen.|Tapa y cocina 3 minutos hasta que la clara esté blanca y la yema siga brillante.|Sirve sobre {1} y acompaña con {0}.',
      'cocidos|1|15|Pon los huevos en una olla, cúbrelos con agua fría 2 cm por encima y llévalos a hervir.|En cuanto hierva, apaga, tapa y deja 10 minutos (12 para yema bien firme).|Pásalos a un bol con agua fría y hielo 3 minutos, golpea la cáscara y pélalos.|Pica {0}, mezcla con sal y sirve con los huevos partidos y {1}.',
      'pochados|2|12|Hierve 1 litro de agua en una olla; baja a fuego mínimo (burbujas muy pequeñas) y agrega 1 cucharada de vinagre.|Rompe cada huevo en una taza pequeña, haz un remolino suave en el agua y deslízalo al centro.|Cocina 3 minutos y sácalo con espumadera, secándolo sobre papel.|Sirve sobre {1} con {0}.',
      'al horno en ramekin|2|22|Precalienta el horno a 180 °C. Unta con aceite 2 moldes pequeños o tazas aptas para horno.|Coloca {0} en el fondo, rompe encima el huevo y añade sal y pimienta.|Hornea 12-15 minutos hasta que la clara cuaje.|Sirve con {1}.'],
    sandwich: ['tostado|1|10|Calienta una sartén a fuego medio, tuesta una cara de las rebanadas 1 minuto.|Arma: sobre la cara sin tostar pon {0} y luego {1}; tapa con la otra rebanada.|Tuesta el sándwich 2 minutos por lado presionando con la espátula hasta que dore.|Córtalo por la mitad en diagonal.',
      'frío|1|5|Corta las rebanadas por la mitad si quieres porciones pequeñas.|Unta o acomoda {0} sobre una rebanada, agrega {1} y cierra.|Presiona suave y corta en diagonal.',
      'abierto gratinado|2|15|Precalienta el horno a 200 °C con la parrilla arriba.|Acomoda el pan en una charola, cubre con {0} y {1}.|Gratina 5-6 minutos hasta que los bordes doren.'],
    rice: ['salteado|1|25|Sofríe cebolla y ajo con el aceite en una sartén grande 2 minutos a fuego medio.|Agrega {1} y cocina 4 minutos.|Añade {0} y 3 minutos más.|Incorpora el arroz y mezcla 3 minutos para que se caliente parejo; ajusta sal.',
      'frito casero|2|25|Calienta una sartén a fuego alto y agrega el aceite; sofríe ajo y cebolla 1 minuto.|Agrega {1} y {0} y saltea 4 minutos.|Empuja todo a un lado, añade el arroz frío (de preferencia del día anterior) y saltea 4 minutos para que quede suelto.|Termina con unas gotas de salsa de soya baja en sodio.',
      'guisado|2|40|Sofríe cebolla y ajo con el aceite 2 minutos.|Agrega el arroz crudo (⅓ de taza) y dóralo 2 minutos.|Añade {1}, {0}, el doble de agua o caldo y sal; tapa y cocina a fuego bajo 18-20 minutos sin destapar.|Reposa 5 minutos y esponja con tenedor.'],
    quesa: ['quesadillas|1|15|Calienta una sartén o comal a fuego medio.|Cocina {0} (ya picado) 3-4 minutos con una pizca de sal y reserva.|Coloca la tortilla en el comal, pon el queso panela en rebanadas y {0} en una mitad; dobla.|Cocina 2 minutos por lado hasta que dore y el queso esté suave. Sirve con {1}.',
      'quesadillas al horno|1|20|Precalienta el horno a 200 °C y forra una charola con papel.|Rellena las tortillas con queso y {0} ya cocido; dóblalas.|Hornea 8-10 minutos, volteando a la mitad. Sirve con {1}.',
      'tostadas gratinadas|1|15|Calienta las tortillas en el comal sin aceite 1 minuto por lado.|Hornéalas a 200 °C 8 minutos hasta que estén crujientes.|Cubre con queso, {0} y hornea 3 minutos más. Termina con {1}.'],
    potato: ['al horno|2|50|Precalienta el horno a 210 °C.|Lava las papas con un cepillo, sécalas, córtalas en cubos de 2 cm y mézclalas con el aceite, el ajo picado y sal.|Extiéndelas en una charola en una sola capa y hornea 30-35 minutos, volteando a los 15, hasta que doren y se sientan suaves al picarlas.|Cocina {0} aparte en sartén 5 minutos y sirve sobre las papas con {1}.',
      'salteadas|1|25|Cuece las papas en cubos 8 minutos en agua con sal; escurre bien.|Calienta el aceite en sartén a fuego medio-alto, agrega papas y cocina 8 minutos sin mover mucho hasta dorar.|Añade ajo y {0}; cocina 4 minutos. Sirve con {1}.',
      'rellenas|2|65|Precalienta el horno a 200 °C. Lava la papa, píncha con un tenedor y hornéala entera 45-50 minutos.|Abre por la mitad, aplasta la pulpa con un tenedor con sal y un poco de aceite.|Cocina {0} 5 minutos en sartén y rellena. Gratina 5 minutos. Sirve con {1}.'],
    pasta: ['al ajo|1|20|Hierve agua con 1 cucharadita de sal (≈ 1 litro) y cuece la pasta según el paquete (8-10 minutos), hasta que esté al dente.|Mientras, calienta el aceite a fuego bajo y dora el ajo 30 segundos sin que se queme.|Agrega {1} y {0} y cocina 4-5 minutos.|Añade la pasta con ¼ de taza del agua de cocción y mezcla 1 minuto.',
      'en salsa de tomate|2|35|Cuece la pasta al dente (8-10 minutos) y escúrrela.|Sofríe ajo con el aceite 1 minuto, agrega {1} y cocina 10 minutos hasta que se haga salsa; sazona con sal.|Añade {0} y cocina 5 minutos.|Mezcla con la pasta y sirve.',
      'fría|1|20|Cuece la pasta al dente, escúrrela y enfríala bajo agua fría.|Mezcla con {1} picado y {0} ya cocido.|Aliña con aceite, limón y sal y refrigera 15 minutos.'],
    saladsimple: ['picada|1|10|Pica {0} en cubitos y colócalo en un bol.|Añade {1}.|Aliña con el aceite, el jugo de limón, sal y pimienta y mezcla con cucharas.',
      'rallada|1|12|Ralla {0} con el lado grueso del rallador.|Mezcla con {1} en un bol.|Aliña con aceite, limón y sal; deja reposar 5 minutos.',
      'marinada|1|25|Corta {0} en rodajas finas y mézclalas con sal y limón.|Deja reposar 15 minutos y escurre el exceso de líquido.|Añade {1} y el aceite.'],
    beans: ['refritos|1|20|Calienta el aceite a fuego medio y sofríe la cebolla picada con el ajo 3 minutos.|Agrega los frijoles con ¼ de taza de su caldo (o agua) y aplástalos con un machacador o tenedor.|Cocina 8 minutos moviendo hasta tener una pasta espesa; ajusta sal.|Sirve con {0}.',
      'de la olla|1|15|Calienta los frijoles con su caldo, la cebolla y el ajo en una olla 10 minutos a fuego bajo.|Ajusta sal y sirve en un plato hondo con {0}.',
      'molletes|2|20|Precalienta el horno a 200 °C. Prepara los frijoles refritos como indican arriba.|Unta sobre rebanadas de pan o tortilla y cubre con queso.|Gratina 6-8 minutos y sirve con {0}.'],
    calab: ['a la mexicana|1|20|Calienta el aceite a fuego medio y sofríe la cebolla 2 minutos.|Agrega el calabacín en cubos y cocina 6 minutos.|Añade el elote y el tomate picado, tapa y cocina 8 minutos a fuego bajo.|Incorpora {0} y cocina 3 minutos.',
      'guisadas|1|30|Sofríe la cebolla 2 minutos, agrega el tomate picado y cocina 5 minutos hasta que suelte jugo.|Suma el calabacín y el elote con ¼ de taza de agua; tapa 10 minutos.|Agrega {0}, ajusta sal y cocina 5 minutos.',
      'gratinadas|2|40|Cocina las calabacitas como a la mexicana, 15 minutos.|Pásalas a un refractario, agrega {0} y hornea a 200 °C 10 minutos.'],
    tostada: ['tostadas|1|12|Precalienta el horno a 200 °C. Coloca las tortillas en una charola sin encimarlas.|Hornea 8 minutos, volteando a la mitad, hasta que estén doradas y crujientes.|Cubre con {0} y termina con {1}.',
      'tostadas en sartén|1|12|Calienta una sartén con una pizca de aceite y tuesta cada tortilla 2 minutos por lado.|Escurre sobre papel y cubre con {0} y {1}.'],
    fritters: ['en sartén|1|20|Ralla o pica finamente {0} y exprímelo con las manos para quitar el exceso de líquido.|Mezcla con el huevo, la avena y sal hasta formar una masa pegajosa.|Calienta una sartén con el aceite a fuego medio y forma tortitas de 1 cm de grosor con una cuchara.|Cocina 3-4 minutos por lado hasta que doren. Sirve con {1}.',
      'al horno|2|30|Precalienta el horno a 200 °C y forra una charola con papel.|Prepara la mezcla como arriba y forma 6 tortitas.|Hornea 12 minutos, voltea y hornea 8 más hasta que doren. Sirve con {1}.'],
    sticks: ['crudos|1|5|Lava {0} y córtalo en bastones de unos 7 cm de largo y 1 cm de grosor.|Pon {1} en un tazón pequeño al centro de un plato.|Acomoda los bastones alrededor para mojar.',
      'asados al horno|2|25|Precalienta el horno a 200 °C y forra una charola con papel.|Corta {0} en bastones de 1 cm, mézclalos con 1 cucharadita de aceite, sal y {st}.|Extiéndelos sin encimar y hornea 18-20 minutos, volteando a la mitad, hasta que estén dorados.|Sirve con {1}.',
      'en freidora de aire|1|15|Precalienta la freidora de aire a 190 °C.|Corta {0} en bastones de 1 cm y mézclalos con 1 cucharadita de aceite, sal y {st}.|Cocina 10-12 minutos, moviendo la canasta a la mitad, hasta que estén dorados. Sirve con {1}.'],
    chips: ['al horno|2|30|Precalienta el horno a 180 °C y forra una charola con papel.|Corta {0} en rebanadas muy finas (2 mm; con mandolina o pelador) y sécalas con papel.|Mézclalas con 1 cucharadita de aceite, sal y {st}; acomódalas en una capa sin encimar.|Hornea 20 minutos, volteando a la mitad y vigilando al final porque se doran rápido. Deja enfriar 5 minutos (se ponen crujientes) y sirve con {1}.',
      'en freidora de aire|1|20|Precalienta la freidora de aire a 160 °C.|Corta {0} en rebanadas de 2 mm y sécalas con papel.|Mézclalas con unas gotas de aceite, sal y {st}.|Cocina 8-10 minutos, moviendo la canasta cada 3 minutos, hasta que estén crujientes. Sirve con {1}.',
      'deshidratados en horno bajo|3|90|Precalienta el horno a 100 °C y forra dos charolas con papel.|Corta {0} en rebanadas muy finas (2 mm) y sécalas con papel.|Colócalas en una capa, espolvorea {st} y hornea 60-80 minutos, volteando a la mitad, hasta que estén secas y crujientes.|Deja enfriar 10 minutos y sirve con {1}.'],
    fruitsnack: ['rodajas|1|5|Lava la fruta y córtala en rodajas o bastones.|Acompaña con {1} para untar o espolvorear.',
      'brochetas|1|8|Lava y corta {0} en trozos de 2 cm.|Ensártalos en palillos y sirve con {1} al lado.'],
  });

  const STY = {
    sav: ['mexicano|comino, chile en polvo y limón', 'mediterráneo|orégano, ajo y limón', 'asiático|jengibre, ajo y salsa de soya baja en sodio',
      'al limón|ralladura de limón, pimienta y perejil', 'al curry suave|curry, cúrcuma y comino', 'a las hierbas|tomillo, romero y perejil',
      'picante|chile, pimentón y ajo', 'ahumado|pimentón ahumado y ajo en polvo', 'a la mostaza|mostaza de Dijon, ajo y pimienta',
      'italiano|albahaca, orégano y ajo', 'tailandés|lima, cilantro, jengibre y chile', 'cajún|pimentón, ajo en polvo y cayena',
      'griego|orégano, limón y eneldo', 'marroquí|comino, canela, cúrcuma y cilantro'],
    sweet: ['con canela|canela molida', 'con vainilla|extracto de vainilla', 'con cacao|cacao puro', 'con limón|ralladura de limón',
      'con coco|coco rallado', 'con jengibre|jengibre rallado', 'con menta|hojas de menta', 'con naranja|ralladura de naranja',
      'con cardamomo|cardamomo molido', 'con nuez moscada|nuez moscada'],
  };

  const LV = ['', 'Simple', 'Intermedia', 'Compleja'];
  J.LEVELS = LV;
  J.CATS = [['desayuno', 'Desayuno', '🍳'], ['comida', 'Comida', '🍛'], ['cena', 'Cena', '🥗'], ['aperitivo', 'Aperitivo', '🥕'], ['postre', 'Postre', '🍓'], ['bebida', 'Bebida', '🥤']];

  const AR = [];
  const A = (cat, name, m, st, fx, ...slots) => AR.push({ cat, name, fam: m, M: M[m].map((x) => { const p = x.split('|'); return { n: p[0], l: +p[1], t: +p[2], s: p.slice(3) }; }), st, fx: fx ? S(fx) : [], sl: slots.map(S) });

  // DESAYUNO
  A('desayuno', '{m} de {0} y {1}', 'omelet', 'sav', 'huevo:120 aceite:5', VEGL, 'feta:30 mozz:30 aguacate:50 cottage:60 atun:50 pavo:50 aceituna:20 hummus:30');
  A('desayuno', 'Omelette claro de {0} con {1}', 'omelet', 'sav', 'clara:200 aceite:4', VEGL, 'feta:25 aguacate:50 cottage:60 pavo:50 atun:50 mozz:30');
  A('desayuno', '{m} de yogur con {0}, {1} y {2}', 'yog', 'sweet', 'yogur:150', FRUIT, NUTS, 'chia:8 almendra:10 nuez:10 coco:8 calabazas:10 cacao:6 linaza:8 avena:15');
  A('desayuno', '{m} de {0} con {1} y {2}', 'oats', 'sweet', 'avena:40', FRUIT, 'chia:10 almendra:15 nuez:15 coco:10 calabazas:12 mani:12 linaza:10 cacao:6', 'lalmendra:150 agua:150 ldescremada:150 lcoco:100');
  A('desayuno', '{m} de {0} con {1} y {2}', 'toast', 'sav', 'pan:50', 'aguacate:60 hummus:40 cottage:60 mani:15 tahini:12 feta:30 yogur:50 atun:50', 'tomate:60 pepino:50 huevo:60 fresa:50 platano:50 espinaca:30 aceituna:20 pavo:40', 'chia:5 calabazas:8 almendra:8 coco:5 linaza:6 cacao:3');
  A('desayuno', '{m} de tofu con {0}, {1} y {2}', 'scramble', 'sav', 'tofu:150 aceite:5', VEGL, VEGL, 'aguacate:50 tomate:60 frijol:60 hummus:30 aceituna:20 tortilla:40');
  A('desayuno', '{m} de proteína con {0} y {1}', 'pancake', 'sweet', 'proteina:25 avena:20 huevo:60 lalmendra:60', FRUIT, 'mani:10 almendra:10 yogur:40 coco:8 chia:6 cacao:6 nuez:10 miel:8');
  A('desayuno', '{m} de calabacín y huevo con {0}', 'pancake', 'sav', 'calabacin:120 huevo:100 avena:15', 'aguacate:50 feta:30 yogur:50 tomate:60 espinaca:30 cottage:60', 'pimiento:40 champi:50 cebolla:20 kale:30 zanahoria:40 tomate:50');

  // COMIDA
  A('comida', '{0} {m} con {1} y {2}', 'prot', 'sav', 'aceite:8', PROT, VEG, CARB);
  A('comida', 'Ensalada {m} de {0} con {1} y {2}', 'salad', 'sav', 'aceite:8', GREENS, PROT.replace('tofu:180', 'huevo:100'), FATS);
  A('comida', '{m} de {0} con {1}, {2} y {3}', 'bowl', 'sav', '', 'arroz:130 quinoa:130 camote:150 lenteja:130 garbanzo:110 coliflor:150 papa:150 pasta:120', 'pollo:130 pavo:130 res:110 salmon:120 atun:110 tofu:150 tempeh:110 camaron:130', VEG, 'aguacate:50 hummus:30 tahini:12 feta:25 aceituna:20 mozz:30 nuez:10 calabazas:12');
  A('comida', '{m} de {0} con {1} y {2}', 'wrap', 'sav', 'tortilla:60 aceite:5', 'pollo:130 pavo:130 res:120 cerdo:120 tofu:150 camaron:120 atun:110 tempeh:110 lenteja:120', VEG, 'aguacate:50 cottage:40 feta:25 hummus:30 yogur:40 mozz:25');
  A('comida', '{m} de lechuga con {0}, {1} y {2}', 'wrap', 'sav', 'lechuga:80 aceite:5', 'pollo:150 pavo:150 res:140 cerdo:140 tofu:170 camaron:140 atun:130 tempeh:130', VEG, 'aguacate:50 cottage:40 feta:25 hummus:30 yogur:40 mozz:25');
  A('comida', '{m} de {0} con {1} y {2}', 'soup', 'sav', 'caldo:300 aceite:5', 'pollo:100 pavo:100 res:90 salmon:100 camaron:100 tofu:120 lenteja:120 garbanzo:100 frijol:110', VEGL, VEGL);
  A('comida', '{m} de {0} y {1} con {2}', 'stew', 'sav', 'lcoco:80 aceite:6 tomate:100', PROT.replace('sardina:120', 'garbanzo:150'), VEG, 'arroz:120 quinoa:120 coliflor:150 camote:120 lenteja:100 calabacin:150');
  A('comida', '{m} de {0} con {1} y {2}', 'patty', 'sav', 'huevo:30 avena:15 aceite:5', 'res:140 pavo:140 pollo:140 lenteja:150 garbanzo:130 atun:130 tofu:150 salmon:130', VEG, 'camote:130 papa:130 quinoa:110 arroz:110 lechuga:100 tomate:100');
  A('comida', '{0} {m} con {1} y {2}', 'prot', 'sav', 'aceite:8 limon:15', 'pollo:170 pavo:170 res:150 cerdo:160 salmon:160 tilapia:180 atun:150 camaron:170 tofu:200 tempeh:150', VEG, 'aguacate:60 aceituna:30 hummus:40 feta:40');

  // CENA
  A('cena', '{m} de {0} con {1} y {2}', 'soup', 'sav', 'caldo:250 aceite:4', 'pollo:80 pavo:80 camaron:80 tofu:100 tilapia:90 lenteja:100', VEGL, VEGL);
  A('cena', 'Ensalada {m} de {0} con {1} y {2}', 'salad', 'sav', 'aceite:6', GREENS, 'pollo:100 pavo:100 atun:90 camaron:100 huevo:100 tofu:120 salmon:90 cottage:100', 'aguacate:40 aceituna:20 nuez:10 feta:20 almendra:10 calabazas:10 hummus:25');
  A('cena', '{m} de {0} con {1} y {2}', 'wrap', 'sav', 'lechuga:70 aceite:4', 'pollo:110 pavo:110 res:100 cerdo:100 tofu:130 camaron:100 atun:90 tempeh:90', VEGL, 'aguacate:40 cottage:40 feta:20 hummus:25 yogur:40');
  A('cena', '{0} {m} con {1}', 'prot', 'sav', 'aceite:6', 'pollo:130 pavo:130 salmon:120 tilapia:140 atun:110 camaron:130 tofu:150 tempeh:110', VEG, 'espinaca:100 kale:80 calabacin:150 coliflor:150 lechuga:100 pimiento:100');
  A('cena', '{0} {m} con {1}', 'stuffed', 'sav', 'aceite:5 mozz:30', 'berenjena:200 pimiento:180 calabacin:200 tomate:180 champi:180', 'pollo:100 pavo:100 res:90 atun:90 tofu:110 lenteja:110 quinoa:90 garbanzo:90', 'espinaca:50 cebolla:30 champi:40 zanahoria:40 tomate:50 calabacin:50');
  A('cena', '{m} de {0} con {1} y {2}', 'omelet', 'sav', 'huevo:120 aceite:5', VEGL, 'feta:25 aguacate:40 cottage:50 atun:40 pavo:40 mozz:30', 'tomate:60 espinaca:30 kale:30 pimiento:40');

  // APERITIVO
  A('aperitivo', 'Bastones {m} de {0} con {1}', 'sticks', 'sav', '', 'zanahoria:80 pepino:100 apio:80 pimiento:80 calabacin:80 coliflor:80 kale:40 camote:70 brocoli:80 tomate:90', 'hummus:40 aguacate:50 yogur:60 tahini:15 cottage:50 feta:25');
  A('aperitivo', '{m} de {0} y {1}', 'mix', 'sweet', '', 'almendra:20 nuez:20 calabazas:20 mani:15 coco:15 chia:10', 'arandano:30 manzana:60 fresa:60 datil:15 cacao:8 platano:50 pera:60 kiwi:60');
  A('aperitivo', '{m} de {0} con {1}', 'balls', 'sweet', 'avena:30 datil:20', 'almendra:15 mani:15 nuez:15 tahini:12 coco:15 calabazas:15', 'cacao:8 chia:8 linaza:8 coco:8 arandano:15 canela:2');
  A('aperitivo', '{m} de {0} con {1} y {2}', 'roll', 'sav', '', 'pavo:40 atun:40 salmon:40 cottage:50 pollo:40 feta:25', 'pepino:70 lechuga:30 calabacin:70 zanahoria:60 pimiento:60', 'aguacate:30 hummus:20 tomate:30 yogur:25');
  A('aperitivo', '{m} {0}', 'eggs', 'sav', 'huevo:100', 'aguacate:40 yogur:30 hummus:25 atun:35 tomate:40 feta:20', 'espinaca:20 pimiento:30 tomate:40 pepino:30 calabazas:6');
  A('aperitivo', 'Chips {m} de {0} con {1}', 'chips', 'sav', 'aceite:3', 'kale:40 manzana:80 calabacin:100 zanahoria:90 camote:70 pina:80 pera:90', 'yogur:60 hummus:40 aguacate:50 tahini:12 cottage:50');

  // POSTRE
  A('postre', '{m} de {0} con {1} y {2}', 'mousse', 'sweet', 'cacao:12 stevia:1', 'aguacate:80 yogur:120 tofu:120 platano:80 mani:20 chia:30', 'fresa:50 frambuesa:50 arandano:40 platano:40 mango:50 naranja:50', 'nuez:10 almendra:10 coco:8 chia:6 calabazas:8 canela:2');
  A('postre', '{0} {m} con {1} y {2}', 'bake', 'sweet', 'canela:2', 'manzana:150 platano:120 mango:120 pina:120 pera:140 naranja:130', 'yogur:60 cottage:60 mani:10 nuez:12 almendra:12 coco:8', 'canela:2 chia:5 linaza:5 cacao:5 calabazas:8');
  A('postre', '{m} de {0} y cacao con {1} y {2}', 'brownie', 'sweet', 'cacao:15 huevo:50 stevia:1', 'frijol:100 camote:100 aguacate:60 platano:80 avena:40 garbanzo:80', 'nuez:10 almendra:10 coco:8 frambuesa:30 arandano:25 mani:10', 'cacao:5 chia:5 calabazas:6 fresa:30');
  A('postre', '{m} de {0} y {1}', 'nice', 'sweet', 'yogur:80 stevia:1', FRUIT, FRUIT.replace('fresa:80', 'cacao:10'));
  A('postre', '{m} de {0} con {1} y {2}', 'panna', 'sweet', 'yogur:100 stevia:1', FRUIT, 'nuez:10 almendra:10 coco:8 chia:6 calabazas:8 cacao:6 mani:8', 'avena:15 almendra:12 coco:8 linaza:6');
  A('postre', 'Gelatina cremosa con {0} y {1}', 'panna', 'sweet', 'cottage:100 stevia:1', FRUIT, 'chia:6 coco:8 almendra:10 cacao:6 nuez:10');

  // BEBIDA
  A('bebida', '{m} de {0} con {1}', 'smooth', 'sweet', 'lalmendra:200', FRUIT, 'espinaca:30 chia:10 avena:20 proteina:25 mani:12 cacao:8 yogur:60 aguacate:40 kale:30 jengibre:5');
  A('bebida', '{m} de {0} con {1}', 'smooth', 'sweet', 'ldescremada:200', FRUIT, 'espinaca:30 chia:10 avena:20 proteina:25 mani:12 cacao:8 yogur:60 aguacate:40 kale:30 jengibre:5');
  A('bebida', '{m} de {0} con {1}', 'smooth', 'sweet', 'agua:200', FRUIT, 'espinaca:30 chia:10 avena:20 proteina:25 mani:12 cacao:8 yogur:60 aguacate:40 kale:30 jengibre:5');
  A('bebida', '{m} de {0} y {1}', 'infus', 'sweet', 'agua:300', 'pepino:40 fresa:50 naranja:50 limon:30 manzana:50 pina:50 sandia:60 kiwi:40 frambuesa:40 arandano:40', 'menta:3 jengibre:5 limon:20 canela:2 naranja:30 pepino:30 fresa:30');
  A('bebida', '{m} de {0}', 'infus', 'sweet', 'te:300', 'limon:30 naranja:50 pina:50 fresa:50 frambuesa:40 manzana:50 arandano:40 kiwi:40', 'menta:3 jengibre:5 canela:2 limon:15 pepino:30 sandia:40');
  A('bebida', '{m} de {0} con {1}', 'hot', 'sweet', 'lalmendra:250', 'cacao:12 cafe:60 te:80 curcuma:2 canela:2', 'canela:2 jengibre:4 curcuma:2 miel:5 menta:3 stevia:1');
  A('bebida', '{m} de {0} con {1}', 'hot', 'sweet', 'ldescremada:250', 'cacao:12 cafe:60 te:80 curcuma:2 canela:2', 'canela:2 jengibre:4 curcuma:2 miel:5 menta:3 stevia:1');
  A('bebida', '{m} de {0}, {1} y {2}', 'juice', 'sweet', 'agua:150', 'pepino:100 apio:80 espinaca:50 kale:40 lechuga:60 brocoli:40', 'manzana:80 pina:60 limon:30 naranja:80 kiwi:60 pera:70 sandia:80', 'jengibre:5 menta:3 chia:8 limon:15 linaza:6');


  // ---- RECETAS SIMPLES con ingredientes de casa ----
  const HOME_VEG = 'tomate:80 cebolla:30 espinaca:50 champi:60 pimiento:50 nopal:70 calabacin:70 zanahoria:50';
  A('desayuno', 'Huevos {m} con {0}, acompañados de {1}', 'eggsimple', 'sav', 'huevo:100 aceite:5', 'jamon:40 tomate:80 cebolla:30 espinaca:50 champi:60 panela:40 frijol:60 nopal:70 pimiento:50 elote:50', 'tortilla:60 pan:50 arrozb:100 papa:100 aguacate:50 camote:100');
  A('desayuno', 'Sándwich {m} de {0} con {1}', 'sandwich', 'sav', 'pan:60', 'jamon:40 atun:60 panela:40 huevo:50 aguacate:60 cottage:50 pollo:60', 'tomate:50 lechuga:20 pepino:40 cebolla:15 zanahoria:30 espinaca:20');
  A('comida', 'Arroz {m} con {0} y {1}', 'rice', 'sav', 'arroz:150 aceite:6 ajo:3 cebolla:30', 'pollo:120 huevo:100 atun:80 frijol:90 jamon:60 tofu:100 molida:100 lenteja:90', 'zanahoria:60 chicharo:50 elote:50 brocoli:60 pimiento:50 ejote:50 espinaca:40 calabacin:60');
  A('comida', '{m} de {0} con {1}', 'quesa', 'sav', 'tortilla:90 panela:60', 'pollo:80 jamon:40 champi:80 nopal:80 espinaca:60 frijol:70 calabacin:80 pimiento:60 atun:60', 'aguacate:40 tomate:60 cebolla:20 cilantro:5 yogur:30 pepino:40');
  A('comida', 'Papas {m} con {0} y {1}', 'potato', 'sav', 'papa:200 aceite:8 ajo:3', 'pollo:120 atun:80 huevo:100 jamon:50 panela:50 champi:80 frijol:80 molida:100 cebolla:40 brocoli:80', 'tomate:60 aguacate:40 lechuga:40 yogur:40 cebolla:20');
  A('comida', 'Pasta {m} con {0} y {1}', 'pasta', 'sav', 'pastab:150 aceite:8 ajo:3', 'atun:80 pollo:100 jamon:50 camaron:100 molida:100 champi:80 tofu:100 panela:50', 'tomate:150 espinaca:50 calabacin:80 brocoli:80 pimiento:60 cebolla:30 chicharo:50');
  A('comida', 'Ensalada {m} de {0} con {1}', 'saladsimple', 'sav', 'aceite:6 limon:15', 'tomate:120 pepino:120 zanahoria:100 lechuga:100 apio:60 pimiento:80', 'cebolla:20 aguacate:50 panela:40 atun:60 huevo:50 jamon:40 frijol:60 garbanzo:60');
  A('comida', 'Frijoles {m} con {0}', 'beans', 'sav', 'frijol:200 aceite:5 cebolla:30 ajo:3', 'panela:50 aguacate:50 huevo:50 tortilla:60 tomate:60 arrozb:100 cottage:50');
  A('cena', 'Calabacitas {m} con {0}', 'calab', 'sav', 'calabacin:200 elote:50 tomate:60 cebolla:30 aceite:6', 'panela:50 pollo:100 jamon:50 frijol:80 huevo:60 cottage:50');
  A('cena', '{m} de {0} con {1}', 'tostada', 'sav', 'tortilla:60', 'atun:70 pollo:70 frijol:80 aguacate:60 panela:50 huevo:50 jamon:40 lenteja:80', 'tomate:60 lechuga:30 cebolla:15 pepino:40 zanahoria:30');
  A('cena', 'Tortitas {m} de {0} con {1}', 'fritters', 'sav', 'huevo:50 avena:15 aceite:5', 'atun:80 calabacin:100 zanahoria:80 espinaca:60 brocoli:80 pollo:80 papa:80 elote:60 nopal:80', 'tomate:80 aguacate:40 yogur:40 lechuga:40 cebolla:20');
  A('aperitivo', '{m} de {0} con {1}', 'fruitsnack', 'sweet', '', 'manzana:150 platano:120 pera:150 pepino:120 zanahoria:100 papaya:120 melon:150 durazno:130 uva:100', 'mani:15 yogur:60 almendra:15 canela:2 cottage:60 nuez:12');

  // Posiciones globales
  let acc = 0;
  AR.forEach((a, i) => {
    a.i = i; a.sty = STY[a.st].map((x) => { const p = x.split('|'); return { n: p[0], sp: p[1] }; });
    a.count = a.sl.reduce((n, l) => n * l.length, 1) * a.M.length * a.sty.length;
    a.start = acc; acc += a.count;
  });
  J.TOTAL = acc;
  J.AR = AR;
  J.catCount = {};
  AR.forEach((a) => { J.catCount[a.cat] = (J.catCount[a.cat] || 0) + a.count; });

  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const nm = (k) => ING[k][0];
  const fill = (t, ctx) => t.replace(/\{(\w+)\}/g, (_, k) => ctx[k] != null ? ctx[k] : '');

  // Diccionario de dietas / filtros (se evalúan por porción)
  J.DIETS = [
    ['sincarb', 'Sin carbohidratos / keto', (r) => r.ch <= 15],
    ['bajocarb', 'Bajo en carbohidratos', (r) => r.ch <= 35],
    ['sinazucar', 'Sin azúcares', (r) => r.sug <= 6 && !r.fl.includes('s')],
    ['vegano', 'Vegano', (r) => !/[mfdes]/.test(r.fl)],
    ['vegetariano', 'Vegetariano', (r) => !/[mf]/.test(r.fl)],
    ['singluten', 'Sin gluten', (r) => !r.fl.includes('g')],
    ['sinlacteos', 'Sin lácteos', (r) => !r.fl.includes('d')],
    ['sinhuevo', 'Sin huevo', (r) => !r.fl.includes('e')],
    ['sinnueces', 'Sin frutos secos', (r) => !r.fl.includes('n') && !r.keys.some((k) => ['nuez', 'almendra', 'mani'].includes(k))],
    ['altaprot', 'Alta en proteína', (r) => r.p >= 25],
    ['bajocal', 'Bajas calorías (≤350)', (r) => r.kcal <= 350],
    ['diabetico', 'Apta para glucosa controlada', (r) => r.ch <= 40 && r.sug <= 8],
    ['pescetariano', 'Pescetariano', (r) => !r.fl.includes('m')],
  ];

  function decode(G) {
    let lo = 0, hi = AR.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (AR[mid].start <= G) lo = mid; else hi = mid - 1; }
    return AR[lo];
  }

  function build(G, full) {
    const a = decode(G);
    let loc = G - a.start;
    const sty = a.sty[loc % a.sty.length]; loc = Math.floor(loc / a.sty.length);
    const metI = loc % a.M.length, met = a.M[metI]; loc = Math.floor(loc / a.M.length);
    const chosen = [];
    for (let i = 0; i < a.sl.length; i++) { chosen.push(a.sl[i][loc % a.sl[i].length]); loc = Math.floor(loc / a.sl[i].length); }
    const all = a.fx.concat(chosen);
    const ctx = { m: met.n, f: a.fx.filter((x) => !['aceite', 'stevia', 'canela'].includes(x[0])).map((x) => nm(x[0])).join(' y ') || 'los ingredientes', st: sty.sp };
    chosen.forEach((c, i) => { ctx[i] = nm(c[0]); });
    let name = cap(fill(a.name, ctx).replace(/\s+/g, ' ').trim());
    name += a.st === 'sav' ? ', estilo ' + sty.n : ', ' + sty.n;
    let kcal = 0, p = 0, ch = 0, f = 0, sug = 0, fl = ''; const keys = [];
    for (const [k, g] of all) {
      const d = ING[k]; const x = g / 100;
      kcal += d[1] * x; p += d[2] * x; ch += d[3] * x; f += d[4] * x; sug += d[5] * x;
      for (const c of d[6]) if (!fl.includes(c)) fl += c;
      keys.push(k);
    }
    const dup = new Set(keys).size < keys.length;
    const r = { id: G, dup, cat: a.cat, name, lvl: met.l, t: met.t, kcal: Math.round(kcal), p: Math.round(p), ch: Math.round(ch), f: Math.round(f), sug: Math.round(sug), fl, keys, ar: a.i };
    if (full) {
      r.ings = all.map(([k, g]) => ({ k, n: nm(k), g }));
      r.groups = J.makeSteps({ a, met, metI, all, chosen, ctx, sty });
      r.steps = r.groups.reduce((x, g) => x.concat(g.items), []);
      r.diets = J.DIETS.filter((d) => d[2](r)).map((d) => d[0]);
    }
    return r;
  }
  J.recipe = (G) => build(G, true);
  J.recipeLite = (G) => build(G, false);

  // Código de receta a partir de los índices elegidos (inverso de decode)
  function encode(a, sl, mi, si) { let loc = 0; for (let i = a.sl.length - 1; i >= 0; i--) loc = loc * a.sl[i].length + sl[i]; return a.start + ((loc * a.M.length + mi) * a.sty.length + si); }
  const STAPLES = new Set(['aceite', 'agua', 'stevia', 'canela']);
  // Solo recetas hechas con lo que el usuario tiene en casa (además de aceite, agua, sal y pimienta)
  J.searchHave = function (o) {
    const have = new Set(o.have || []); STAPLES.forEach((k) => have.add(k));
    const need = (o.diets || []).map((id) => J.DIETS.find((d) => d[0] === id)[2]);
    const q = (o.q || '').toLowerCase().trim(), excl = (o.excl || []).map((s) => s.toLowerCase());
    const pools = [];
    AR.forEach((a) => {
      if (o.cat && a.cat !== o.cat) return;
      if (!a.fx.every(([k]) => have.has(k))) return;
      const idx = a.sl.map((l) => l.map((x, i) => (have.has(x[0]) ? i : -1)).filter((i) => i >= 0));
      if (idx.some((l) => !l.length)) return;
      const n = idx.reduce((m, l) => m * l.length, 1) * a.M.length * a.sty.length;
      pools.push({ a, idx, n });
    });
    const total = pools.reduce((m, p) => m + p.n, 0);
    if (!total) return { items: [], cursor: 0, done: true, total: 0 };
    let mult = Math.floor(total * 0.6180339887) | 1; while (gcd(mult, total) !== 1) mult += 2;
    const off = (o.seed || 0) % total, items = [], seenName = new Set(); let pos = o.cursor || 0, scanned = 0;
    while (items.length < (o.limit || 12) && scanned < (o.maxScan || 60000) && pos < total) {
      let rem = (mult * pos + off) % total; pos++; scanned++;
      let pl = null; for (const p of pools) { if (rem < p.n) { pl = p; break; } rem -= p.n; }
      const a = pl.a, si = rem % a.sty.length; rem = Math.floor(rem / a.sty.length);
      const mi = rem % a.M.length; rem = Math.floor(rem / a.M.length);
      const sl = pl.idx.map((l) => { const v = l[rem % l.length]; rem = Math.floor(rem / l.length); return v; });
      const r = build(encode(a, sl, mi, si), false);
      if (r.dup || (o.lvl && r.lvl !== o.lvl) || (o.maxTime && r.t > o.maxTime)) continue;
      if (need.length && !need.every((fn) => fn(r))) continue;
      if (q && !(r.name.toLowerCase().includes(q) || r.keys.some((k) => ING[k][0].includes(q)))) continue;
      if (excl.length && r.keys.some((k) => excl.some((e) => ING[k][0].includes(e)))) continue;
      items.push(r);
    }
    return { items, cursor: pos, done: pos >= total, total };
  };

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  // Búsqueda: recorre el universo en un orden pseudoaleatorio (permutación) hasta juntar `limit` coincidencias.
  J.search = function (o) {
    const cats = AR.filter((a) => !o.cat || a.cat === o.cat);
    const total = cats.reduce((n, a) => n + a.count, 0);
    if (!total) return { items: [], cursor: 0, scanned: 0 };
    let mult = Math.floor(total * 0.6180339887) | 1;
    while (gcd(mult, total) !== 1) mult += 2;
    const off = (o.seed || 0) % total;
    const need = (o.diets || []).map((id) => J.DIETS.find((d) => d[0] === id)[2]);
    const q = (o.q || '').toLowerCase().trim();
    const excl = (o.excl || []).map((s) => s.toLowerCase());
    const items = []; let pos = o.cursor || 0, scanned = 0; const max = o.maxScan || 150000;
    while (items.length < (o.limit || 20) && scanned < max && pos < total) {
      const j = (mult * pos + off) % total; pos++; scanned++;
      let rem = j, a = null;
      for (const c of cats) { if (rem < c.count) { a = c; break; } rem -= c.count; }
      const r = build(a.start + rem, false);
      if (r.dup) continue;
      if (o.lvl && r.lvl !== o.lvl) continue;
      if (o.maxKcal && r.kcal > o.maxKcal) continue;
      if (o.maxTime && r.t > o.maxTime) continue;
      if (need.length && !need.every((fn) => fn(r))) continue;
      if (q && !(r.name.toLowerCase().includes(q) || r.keys.some((k) => ING[k][0].includes(q)))) continue;
      if (excl.length && r.keys.some((k) => excl.some((e) => ING[k][0].includes(e)))) continue;
      items.push(r);
    }
    return { items, cursor: pos, done: pos >= total, scanned };
  };
})(window.J = window.J || {});
