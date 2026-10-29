# Guaco Fit

Planner de comidas + rutinas de ejercicio + calorías por foto, en una app para el celular que **funciona sin internet**.
Mascota: Guaco, un aguacatito kawaii.

## Qué incluye
- **1,158,898 recetas** generadas en el teléfono (desayuno, comida, cena, aperitivo, postre y bebida), de simples a complejas. Cada una calcula calorías y macros reales a partir de sus ingredientes.
- **Dietas**: sin carbohidratos/keto, bajo en carbos, sin azúcares, vegano, vegetariano, sin gluten, sin lácteos, sin huevo, sin frutos secos, alta en proteína, bajas calorías, glucosa controlada y pescetariano. Se pueden combinar.
- **Plan semanal** automático según tus calorías, con porciones ajustadas y lista de compras.
- **Ejercicio**: plan semanal para bajar de peso (3 niveles), generador de rutinas (HIIT, bajo impacto, piernas, tren superior, abdomen, cuerpo completo, movilidad), temporizador con voz, sonido y vibración, y registro de actividad libre.
- **Foto de comida**: detecta colores y tamaño del plato, sugiere alimentos, calcula calorías aproximadas y las compara con lo que tenías planeado. Es una estimación (±30 %), siempre editable.
- **Cambio de interfaz por hora**: mañana, almuerzo, tarde y noche cambian colores, mascota y pantalla de inicio solos. Se puede fijar a mano en Mi progreso.
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
- `js/app.js`: interfaz y lógica. `sw.js`: caché offline. Fuentes en `fonts/`.
