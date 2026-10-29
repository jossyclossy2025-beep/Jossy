# Guaco Fit

Planner de comidas + rutinas de ejercicio + calorías por foto, en una app para el celular que **funciona sin internet**.
Mascota: Guaco, un aguacatito kawaii.

## Qué incluye
- **1,158,898 recetas** generadas en el teléfono (desayuno, comida, cena, aperitivo, postre y bebida), de simples a complejas. Cada una calcula calorías y macros reales a partir de sus ingredientes.
- **Dietas**: sin carbohidratos/keto, bajo en carbos, sin azúcares, vegano, vegetariano, sin gluten, sin lácteos, sin huevo, sin frutos secos, alta en proteína, bajas calorías, glucosa controlada y pescetariano. Se pueden combinar.
- **Plan semanal** automático según tus calorías, con porciones ajustadas y lista de compras.
- **Ejercicio**: plan semanal para bajar de peso (3 niveles), generador de rutinas (HIIT, bajo impacto, piernas, tren superior, abdomen, cuerpo completo, movilidad), temporizador con voz, sonido y vibración, y registro de actividad libre.
- **Mi Huerta**: 8 hábitos diarios (agua, 5 frutas y verduras, moverte, dormir…), un arcoíris de colores de frutas y verduras, reto semanal y semillas para desbloquear una colección de **44 mascotas** de frutas y verduras, todas animadas.
- **Pasos con animación**: cada paso de una receta tiene su escena (lavar, pelar, cortar, batir, saltear, hervir, hornear, licuar…) protagonizada por la mascota del ingrediente.
- **Temáticas**: Atardecer, Playa, Cielo, Jardín, Galaxia, Arcade, Cuaderno, Matcha, Neón e Invierno. Cada una cambia tipografía, forma de las tarjetas, menú, fondo animado y mascotas. «Por la hora» cambia sola entre mañana, almuerzo, tarde y noche.
- **Registrar comidas libres**: más de 80 platillos y antojos (pastel, tacos, pizza…) y todos los ingredientes, con porciones.
- Agua, peso con gráfica, rachas, stickers, respaldo/restauración de datos.

## Instalar en el celular
La app es una PWA. Necesita abrirse **una vez con internet** desde una dirección https para guardarse; después funciona sin conexión.
1. En GitHub: Settings → Pages → Source: GitHub Actions. Al hacer merge a `main` se publica con `.github/workflows/pages.yml`.
2. Abre la dirección de Pages en Chrome (Android) o Safari (iPhone).
3. Menú del navegador → «Agregar a pantalla de inicio».

## Desarrollo
Sin dependencias ni build: archivos estáticos.
```
python3 -m http.server 8000   # y abrir http://localhost:8000
```
- `js/recipes.js`: motor de recetas (arquetipos × ingredientes × método × estilo).
- `js/exercise.js`: ejercicios, plan semanal y generador de rutinas.
- `js/steps.js`: pasos detallados con medidas caseras. `js/mascots.js`: mascotas. `js/anim.js`: escenas de los pasos. `js/themes.js` y `css/themes.css`: temáticas. `js/dishes.js`: platillos.
- `js/app.js`: interfaz y lógica. `sw.js`: caché offline. Fuentes en `fonts/`.

## Guaco Swipe (`/fotos/`)
App aparte para limpiar la galería: eliges fotos, detecta repetidas exactas, muy parecidas, borrosas y capturas, y decides con swipe tipo Tinder. Todo se procesa en el dispositivo. En celular solo puede marcar (el navegador no deja borrar de la galería); eligiendo una carpeta en Chrome/Edge de escritorio sí borra de verdad.
