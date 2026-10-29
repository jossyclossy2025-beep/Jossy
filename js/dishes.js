/* Platillos y antojos comunes (valores aproximados por 100 g) con su porción típica.
   Formato: clave|nombre|kcal|proteína|carbohidratos|grasa|porción|gramos por porción */
(function (J) {
  const RAW = `pastelchoc|Pastel de chocolate|371|5|50|17|rebanada|110
pastelvan|Pastel de vainilla con betún|350|4|52|14|rebanada|110
pastelfruta|Pastel con crema y mermelada de fruta|300|3.5|45|12|rebanada|120
tresleches|Pastel tres leches|260|5|35|11|rebanada|130
cheesecake|Cheesecake|321|5.5|26|23|rebanada|120
pastelzan|Pastel de zanahoria|350|4|45|17|rebanada|110
pastelito|Pastelito empacado|420|4|58|19|pieza|50
brownie|Brownie|405|5|52|20|pieza|60
galleta|Galleta dulce|480|5|65|22|galleta|15
galletaMaria|Galleta tipo María o salada|430|7|72|12|galleta|7
concha|Pan dulce (concha)|390|7|60|13|pieza|70
dona|Dona glaseada|420|5|50|23|pieza|65
churro|Churros|380|5|45|20|churro|40
helado|Helado de crema|207|3.5|24|11|bola|70
paleta|Paleta helada de fruta|80|0.5|19|0.2|pieza|70
gelatina|Gelatina de sabor|62|1.5|14|0|vaso|120
flan|Flan|145|4|22|4.5|porción|110
arrozleche|Arroz con leche|130|3|22|3|vaso|200
pay|Pay de limón|300|4|42|13|rebanada|110
chocolate|Chocolate con leche|535|7.5|58|30|barra chica|40
dulces|Dulces y caramelos|390|0|98|0|puñado|30
hotcakes|Hot cakes con miel|230|5|38|6|hot cake|80
cereal|Cereal azucarado|380|6|84|2|tazón|40
taco|Taco (carne, pollo o pastor)|215|13|20|9|taco|90
tacodorado|Tacos dorados|260|9|25|14|taco|60
quesadilla|Quesadilla de queso|300|13|27|16|pieza|110
burrito|Burrito|215|9|28|7|pieza|250
enchiladas|Enchiladas|165|8|15|8|plato|300
tamal|Tamal|205|5|27|9|pieza|130
torta|Torta (sándwich mexicano)|250|11|28|10|pieza|300
sope|Sope o gordita|215|6|26|10|pieza|100
tostadaprep|Tostada con frijol y pollo|190|8|22|8|pieza|110
chilaquiles|Chilaquiles|180|6|18|9|plato|300
pozole|Pozole|85|7|8|3|tazón|400
mole|Mole con pollo|170|14|10|8|plato|300
birria|Birria de res|180|20|3|10|plato|300
pambazo|Pambazo|280|10|30|13|pieza|180
sopapasta|Sopa de pasta|95|3|16|2|plato|250
sopaverd|Sopa o caldo de verduras|40|1.5|7|1|plato|300
caldopollo|Caldo de pollo|50|5|3|2|plato|300
arrozrojo|Arroz rojo o a la mexicana|140|3|27|2.5|plato|150
frijolref|Frijoles refritos|110|6|15|3|ración|100
huevomex|Huevo a la mexicana|140|9|4|10|plato|180
omelette|Omelette con jamón y queso|190|13|2|14|pieza|150
hamburguesa|Hamburguesa con queso|265|14|24|13|pieza|200
hotdog|Hot dog|265|10|20|16|pieza|120
pizza|Pizza de queso o pepperoni|270|11|33|10|rebanada|110
papasfritas|Papas fritas|312|3.4|41|15|porción|120
nuggets|Nuggets de pollo|296|15|18|18|porción|100
pollofrito|Pollo frito empanizado|260|20|10|15|pieza|130
polloasado|Pollo asado|190|27|0|9|pieza|150
milanesa|Milanesa empanizada|250|20|14|12|pieza|150
carneasada|Carne asada|230|26|0|14|porción|120
pescadofrito|Pescado empanizado|230|16|14|12|pieza|160
ceviche|Ceviche o tostada de camarón|100|13|6|2|plato|200
spaghetti|Espagueti con salsa de tomate|130|5|24|2|plato|300
lasana|Lasaña|135|8|13|6|porción|250
sushi|Sushi roll|150|5|28|2|pieza|30
sandwich|Sándwich de jamón y queso|260|13|28|10|pieza|180
ensalada|Ensalada verde con aderezo|90|2|7|6|plato|200
panblanco|Pan blanco o bolillo|270|9|52|2|pieza|60
palomitas|Palomitas de maíz|380|11|60|12|bolsa|50
papitas|Papitas de bolsa|540|6|52|34|bolsa|45
cacahuates|Cacahuates|580|26|16|50|puñado|30
nachos|Nachos con queso|320|8|34|17|plato|150
totopos|Totopos|490|7|60|25|porción|40
guacamole|Guacamole|160|2|9|14|ración|60
elote|Elote con mayonesa y queso|190|5|25|8|pieza|200
esquites|Esquites|120|4|20|3|vaso|200
frutapicada|Fruta picada|50|0.7|12|0.2|vaso|250
jugonaranja|Jugo de naranja|45|0.7|10|0.2|vaso|250
refresco|Refresco|42|0|10.6|0|lata|355
cerveza|Cerveza|43|0.5|3.6|0|lata|355
vino|Vino tinto|85|0.1|2.6|0|copa|150
cafeleche|Café con leche|40|2|4|1.5|taza|240
cafeazucar|Café con azúcar|20|0|5|0|taza|240
licuado|Licuado de fruta con leche|75|2.5|14|1.5|vaso|350
atole|Atole|65|1.5|12|1.2|vaso|250
chocolatecal|Chocolate caliente|80|3|11|3|taza|240
aguasabor|Agua de sabor con azúcar|25|0|6.5|0|vaso|350
yogurfruta|Yogur con fruta|90|3|15|2|vaso|150`;
  J.DISH = {};
  RAW.split('\n').forEach((l) => { const p = l.split('|'); J.DISH[p[0]] = [p[1], +p[2], +p[3], +p[4], +p[5], 0, '', p[6], +p[7]]; });
  J.foodOf = (k) => J.DISH[k] || J.ING[k];
})(window.J = window.J || {});
