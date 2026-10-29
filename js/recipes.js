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
    salad: ['fresca|1|10|Lava y corta {0} en trozos.|Añade {1} desmenuzado o en cubos.|Agrega {2}.|Aliña con limón, aceite de oliva y {st}.',
      'tibia|2|20|Asa o saltea ligeramente {0}.|Cocina {1} y córtalo en tiras.|Mezcla con {2} y aliña con {st} mientras está tibio.',
      'en bowl con vinagreta casera|2|20|Bate limón, aceite, mostaza y {st} para la vinagreta.|Acomoda {0} como base y coloca {1} encima.|Termina con {2} y la vinagreta.',
      'estilo mediterráneo|3|30|Marina {1} con {st} 15 min.|Asa {1} y {0} ligeramente.|Arma la ensalada con {2} y reposa 5 min antes de servir.'],
    bowl: ['bowl|1|20|Cuece o calienta {0}.|Prepara {1} según tu preferencia.|Saltea o asa {2}.|Arma el bowl y termina con {3} y {st}.',
      'bowl al horno|2|35|Hornea {2} a 200 °C 20 min con {st}.|Cocina {1}.|Sirve sobre {0} y añade {3}.',
      'poke bowl|3|35|Prepara {0} y deja enfriar.|Corta {1} en cubos y marínalo 15 min con {st}.|Corta {2} fino y arma el bowl.|Termina con {3}.'],
    wrap: ['tacos|1|15|Calienta las tortillas o las hojas.|Cocina {0} con {st} en sartén y deshébralo o córtalo.|Saltea {1} 3 min.|Rellena y sirve con salsa fresca.',
      'wraps|2|20|Cocina {0} con {st}.|Saltea {1}.|Rellena las hojas, enrolla y corta a la mitad.',
      'tacos al horno|2|30|Precalienta el horno a 190 °C.|Mezcla {0} cocido con {1} y {st}.|Rellena, dora en el horno 10 min y sirve.'],
    soup: ['sopa|1|30|Sofríe cebolla y {1} 3 min.|Agrega {0}, caldo y {st}.|Cocina 20 min y sirve caliente.',
      'crema|2|35|Cuece {1} en caldo con {st} hasta suavizar.|Licúa hasta obtener una crema suave.|Añade {0} y calienta 5 min.',
      'caldo ligero|1|25|Hierve el caldo con {st}.|Añade {0} y {1} y cocina 15 min.',
      'pozole ligero|3|60|Hierve {0} en caldo con {st} 30 min.|Agrega {1} y cocina 20 min más.|Sirve con lechuga, limón y rábano.'],
    stew: ['curry|2|35|Sofríe cebolla con aceite y {st}.|Añade {0} y {1} y cocina 5 min.|Vierte leche de coco ligera y cocina 15 min.|Sirve sobre {2}.',
      'guiso|2|40|Sofríe {1} con {st}.|Agrega {0} y caldo y cocina 25 min.|Sirve con {2}.',
      'chili|3|60|Sofríe cebolla con {st}.|Añade {0}, {1} y tomate triturado.|Cocina a fuego bajo 40 min.|Sirve con {2}.',
      'tinga|3|50|Cuece y deshebra {0}.|Licúa tomate con {st} y cocina la salsa 10 min.|Mezcla con {1} y {0}; cocina 15 min.|Sirve con {2}.'],
    patty: ['hamburguesa|2|25|Mezcla {0} con {st} y forma discos.|Cocina en sartén o plancha 4-5 min por lado.|Sirve en hojas de lechuga con {1} y {2}.',
      'albóndigas|3|40|Mezcla {0} con {st} y forma bolitas.|Hornea a 200 °C 18 min.|Sirve con {1} y {2}.',
      'brochetas|2|30|Corta {0} y {1} en cubos y marina 15 min con {st}.|Ensarta en palillos y asa 10 min girando.|Acompaña con {2}.',
      'croquetas al horno|3|45|Tritura {0} con {st} y forma croquetas.|Hornea a 200 °C 20 min girando a la mitad.|Sirve con {1} y {2}.'],
    stuffed: ['relleno|2|40|Precalienta el horno a 190 °C.|Hueca {0} y reserva la pulpa.|Cocina {1} con la pulpa y {st}; rellena.|Hornea 25 min.',
      'rellenos gratinados|3|50|Hornea {0} 15 min para suavizar.|Rellena con {1} y {2} sazonado con {st}.|Gratina 10 min.'],
    omelet: ['omelette|1|10|Bate {f} con sal y pimienta.|Saltea {0} 2 min en sartén antiadherente.|Vierte el huevo, añade {1} y dobla cuando cuaje.',
      'frittata al horno|2|25|Precalienta el horno a 190 °C.|Saltea {0} y mezcla con {f} batido y {1}.|Hornea 15 min hasta dorar.',
      'muffins de huevo|2|30|Bate {f} y mezcla con {0}, {1} y {st}.|Vierte en moldes y hornea a 180 °C 18 min.',
      'soufflé|3|45|Separa claras y yemas de {f}.|Mezcla yemas con {0}, {1} y {st}.|Monta las claras, incorpora con movimientos envolventes y hornea a 180 °C 25 min.'],
    yog: ['bowl|1|5|Sirve {f} en un bowl.|Añade {0} y {1}.|Termina con {2} y {st}.',
      'parfait en vaso|1|8|Alterna capas de {f}, {0} y {1} en un vaso.|Corona con {2} y {st}.',
      'bowl helado (frozen)|2|15|Mezcla {f} con {0} y congela 40 min.|Mezcla, rompe y bate hasta cremoso.|Añade {1}, {2} y {st}.',
      'yogur horneado|3|40|Mezcla {f} con {0}, huevo y {st}.|Vierte en moldes y hornea a 170 °C 25 min.|Enfría y corona con {1} y {2}.'],
    oats: ['avena cocida|1|10|Cocina {f} con {2} 5 min removiendo.|Añade {0} y {st}.|Termina con {1}.',
      'overnight oats|1|5|Mezcla {f} con {2} y {st} en un frasco.|Refrigera toda la noche.|Corona con {0} y {1}.',
      'avena horneada|2|35|Mezcla {f} con {2}, {0} y {st}.|Hornea a 180 °C 25 min.|Termina con {1}.',
      'granola casera|3|45|Mezcla {f} con {1} y {st}.|Hornea a 150 °C 30 min moviendo cada 10.|Sirve con {0} y {2}.'],
    toast: ['tostada|1|8|Tuesta {f}.|Unta {0}.|Añade {1} y {2} encima.',
      'sándwich abierto|1|10|Tuesta {f} y unta {0}.|Coloca {1} y espolvorea {2}.',
      'bocadillo gratinado|2|15|Unta {0} en {f}.|Cubre con {1} y gratina 5 min.|Termina con {2}.'],
    scramble: ['revuelto|1|12|Desmenuza {f} y saltéalo 4 min con {st}.|Añade {0} y {1}.|Termina con {2}.',
      'scramble tipo mexicano|2|18|Saltea cebolla y {0} 3 min.|Agrega {f} desmenuzado con {st}.|Suma {1} y sirve con {2}.',
      'burrito bowl|3|30|Prepara {f} con {st}.|Asa {0} y {1}.|Arma el bowl y termina con {2}.'],
    pancake: ['panqueques|2|20|Licúa {f} hasta formar una masa.|Cocina porciones en sartén antiadherente 2 min por lado.|Sirve con {0} y {1}.',
      'waffles|3|25|Licúa {f}.|Cocina en wafflera 4 min.|Sirve con {0} y {1}.',
      'crepas|3|30|Licúa {f} con más líquido hasta una mezcla fina.|Cocina crepas delgadas.|Rellena con {0} y {1}.'],
    snackraw: ['crudos|1|5|Corta {0} en bastones.|Sirve con {1} para untar.',
      'chips al horno|2|30|Corta {0} muy fino y sazona con {st}.|Hornea a 180 °C 20 min.|Sirve con {1}.',
      'croquetas de verdura|3|35|Ralla {0} y mezcla con {st}.|Forma bolitas y hornea a 200 °C 20 min.|Sirve con {1}.'],
    mix: ['mix|1|3|Combina {0} y {1}.|Divide en porciones.',
      'mix tostado|2|15|Tuesta {0} a 160 °C 8 min con {st}.|Mezcla con {1} y deja enfriar.'],
    balls: ['bolitas|2|15|Tritura {f} con {0} hasta formar una masa.|Añade {1} y forma bolitas.|Refrigera 20 min.',
      'barritas|3|40|Mezcla {f}, {0} y {1}.|Presiona en un molde y hornea a 170 °C 20 min.|Enfría y corta.'],
    roll: ['rollitos|1|10|Extiende {1}.|Coloca {0} y {2}.|Enrolla y corta.',
      'rollitos al horno|2|20|Prepara {1}, {0} y {2}.|Enrolla y asegura con palillos.|Hornea 10 min a 180 °C.'],
    eggs: ['huevos cocidos con|1|15|Cuece {f} 10 min y enfría.|Pela, corta y sirve con {0} y {1}.',
      'huevos rellenos de|2|20|Cuece {f} y córtalos por la mitad.|Mezcla las yemas con {0} y {st}.|Rellena y termina con {1}.'],
    mousse: ['mousse|2|15|Licúa {0} con {f} hasta que quede suave.|Refrigera 30 min.|Sirve con {1} y {2}.',
      'pudín|1|10|Mezcla {f} con {0} y refrigera 2 h.|Sirve con {1} y {2}.',
      'helado casero|2|10|Congela {0} en trozos.|Licúa con {f} hasta cremoso.|Sirve con {1} y {2}.',
      'paletas heladas|2|10|Licúa {f} con {0}.|Vierte en moldes y congela 4 h.',
      'copa en capas|3|25|Prepara una crema con {f}.|Alterna capas de {0} y {1}.|Termina con {2}.'],
    bake: ['al horno|1|25|Precalienta el horno a 180 °C.|Corta {0} y coloca en una charola con {st}.|Hornea 20 min.|Sirve con {1} y {2}.',
      'en sartén|1|12|Cocina {0} en una sartén con {st} 6-8 min.|Sirve con {1} y {2}.',
      'en brochetas asadas|2|18|Ensarta {0} y asa 3 min por lado.|Sirve con {1} y {2}.',
      'crumble|3|40|Mezcla {1} con {f} para el crumble.|Hornea {0} 15 min, cubre con el crumble y hornea 15 min más.|Sirve con {2}.'],
    brownie: ['brownie|3|40|Tritura {0} con {f} hasta formar una masa.|Hornea a 180 °C 25 min.|Enfría y cubre con {1} y {2}.',
      'galletas|2|30|Mezcla {0} con {f} y forma galletas.|Hornea a 175 °C 12 min.|Decora con {1} y {2}.',
      'muffins|3|35|Mezcla {0} con {f}.|Rellena moldes y hornea a 180 °C 22 min.|Decora con {1} y {2}.',
      'mug cake|1|5|Mezcla {0} con {f} en una taza.|Microondas 90 s.|Termina con {1} y {2}.'],
    nice: ['helado|1|8|Congela {0} y {1} en trozos.|Procesa hasta cremoso con {f} y {st}.',
      'sorbete|2|10|Congela {0} y {1}.|Procesa con {f} y hielo hasta una textura suave.',
      'granizado|1|10|Congela {0} y {1}.|Tritura con {f} hasta granizar.'],
    panna: ['panna cotta ligera|3|30|Disuelve gelatina sin sabor en agua tibia.|Mezcla con {f} y {st}; vierte en vasitos y refrigera 4 h.|Corona con {0} y {1}.',
      'cheesecake en vaso|2|20|Bate {f} con {st}.|Alterna capas con {2}, {0} y {1}.|Refrigera 1 h.',
      'crema fría|1|10|Mezcla {f} con {st}.|Sirve con {0} y {1}.'],
    smooth: ['licuado|1|5|Licúa {0} con {f}.|Añade {1} y {st} y licúa 30 s.|Sirve frío.',
      'smoothie verde|1|5|Licúa {1} con {f} 30 s.|Añade {0} y {st} y licúa de nuevo.',
      'batido proteico|1|5|Licúa {0} con {f}.|Agrega {1} y {st}.',
      'batido helado|2|8|Congela {0} en trozos.|Licúa con {f} y {1}.|Sirve espeso.'],
    infus: ['agua infusionada|1|10|Corta {0} y {1}.|Colócalos en una jarra con {f}.|Refrigera 2 h.',
      'té helado|2|20|Prepara el té con {f}.|Añade {0} y {1} y enfría.|Sirve con hielo.',
      'limonada natural|1|8|Exprime limón y mezcla con {f}.|Añade {0} y {1}.|Endulza con stevia si quieres.',
      'kombucha exprés|3|30|Prepara una infusión fuerte.|Añade {0} y {1}.|Enfría y sirve con gas natural.'],
    hot: ['latte caliente|1|8|Calienta {f}.|Disuelve {0}.|Añade {1} y {st}.',
      'té especiado|2|12|Hierve {f} con {1}.|Añade {0} y reposa 5 min.|Cuela y sirve.',
      'chocolate caliente fit|2|10|Calienta {f}.|Bate {0} y {1} hasta integrar.|Sirve humeante.'],
    juice: ['jugo verde|1|8|Licúa {0} con agua.|Añade {1} y {2}.|Cuela si prefieres.',
      'jugo detox|2|10|Licúa {0} y {1}.|Agrega {2} y hielo.',
      'licuado verde cremoso|2|8|Licúa {0} con {f}.|Añade {1} y {2}.'],
  };

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
  const A = (cat, name, m, st, fx, ...slots) => AR.push({ cat, name, M: M[m].map((x) => { const p = x.split('|'); return { n: p[0], l: +p[1], t: +p[2], s: p.slice(3) }; }), st, fx: fx ? S(fx) : [], sl: slots.map(S) });

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
  A('aperitivo', 'Bastones {m} de {0} con {1}', 'snackraw', 'sav', '', 'zanahoria:80 pepino:100 apio:80 pimiento:80 calabacin:80 coliflor:80 kale:40 camote:70 brocoli:80 tomate:90', 'hummus:40 aguacate:50 yogur:60 tahini:15 cottage:50 feta:25');
  A('aperitivo', '{m} de {0} y {1}', 'mix', 'sweet', '', 'almendra:20 nuez:20 calabazas:20 mani:15 coco:15 chia:10', 'arandano:30 manzana:60 fresa:60 datil:15 cacao:8 platano:50 pera:60 kiwi:60');
  A('aperitivo', '{m} de {0} con {1}', 'balls', 'sweet', 'avena:30 datil:20', 'almendra:15 mani:15 nuez:15 tahini:12 coco:15 calabazas:15', 'cacao:8 chia:8 linaza:8 coco:8 arandano:15 canela:2');
  A('aperitivo', '{m} de {0} con {1} y {2}', 'roll', 'sav', '', 'pavo:40 atun:40 salmon:40 cottage:50 pollo:40 feta:25', 'pepino:70 lechuga:30 calabacin:70 zanahoria:60 pimiento:60', 'aguacate:30 hummus:20 tomate:30 yogur:25');
  A('aperitivo', '{m} {0}', 'eggs', 'sav', 'huevo:100', 'aguacate:40 yogur:30 hummus:25 atun:35 tomate:40 feta:20', 'espinaca:20 pimiento:30 tomate:40 pepino:30 calabazas:6');
  A('aperitivo', 'Chips {m} de {0} con {1}', 'snackraw', 'sav', 'aceite:3', 'kale:40 manzana:80 calabacin:100 zanahoria:90 camote:70 pina:80 pera:90', 'yogur:60 hummus:40 aguacate:50 tahini:12 cottage:50');

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
    const met = a.M[loc % a.M.length]; loc = Math.floor(loc / a.M.length);
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
      const steps = ['Lava y prepara ' + r.ings.map((x) => x.n).join(', ') + '.'];
      met.s.forEach((s) => steps.push(fill(s, ctx)));
      steps.push('Prueba, ajusta la sazón con ' + sty.sp + ' y sirve.');
      r.steps = steps;
      r.diets = J.DIETS.filter((d) => d[2](r)).map((d) => d[0]);
    }
    return r;
  }
  J.recipe = (G) => build(G, true);
  J.recipeLite = (G) => build(G, false);

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
