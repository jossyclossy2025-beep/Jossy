#!/usr/bin/env bash
# Copia la interfaz web (fotos/) dentro de la app y ajusta rutas relativas.
set -euo pipefail
cd "$(dirname "$0")/.."
A=android/app/src/main
W=$A/assets/www
mkdir -p "$W/fonts" "$A/res/mipmap-xxxhdpi" "$A/res/mipmap-xhdpi"
cp fotos/swipe.js fotos/swipe.css "$W/"
sed 's#\.\./js/mascots\.js#mascots.js#' fotos/index.html | grep -v 'rel="manifest"' > "$W/index.html"
cp js/mascots.js "$W/mascots.js"
sed -i 's#\.\./fonts/#fonts/#g' "$W/swipe.css"
cp fonts/fredoka-latin-wght-normal.woff2 fonts/chewy-latin-400-normal.woff2 fonts/caveat-brush-latin-400-normal.woff2 "$W/fonts/"
cp icons/icon-512.png "$A/res/mipmap-xxxhdpi/ic_launcher.png"
cp icons/icon-192.png "$A/res/mipmap-xhdpi/ic_launcher.png"
echo "assets listos"
