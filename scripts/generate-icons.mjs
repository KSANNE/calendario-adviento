// Genera los iconos PNG de la app sin dependencias externas: `npm run icons`.
// Dibujo: fondo naranja pastel con una estrella blanca y un brillo.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixel) {
  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    for (let x = 0; x < size; x++) row.set(pixel(x, y), 1 + x * 4);
    rows.push(row);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8 bits, RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t)); // Estrella de cinco puntas: un punto está dentro si cruza un número impar de lados (regla par-impar).
function starPolygon(cx, cy, outer, inner) {
  return Array.from({ length: 10 }, (_, i) => {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });
}

function inPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function drawIcon(size) {
  const top = [255, 200, 172];
  const bottom = [240, 104, 48];
  const white = [255, 255, 255];
  const star = starPolygon(size / 2, size * 0.53, size * 0.34, size * 0.15);
  const SAMPLES = 4; // 4×4 muestras por píxel para que los bordes no tengan dientes.
  return encodePng(size, (x, y) => {
    let color = mix(top, bottom, (x + y) / (2 * size));
    let hits = 0;
    for (let sy = 0; sy < SAMPLES; sy++) {
      for (let sx = 0; sx < SAMPLES; sx++) {
        if (inPolygon(x + (sx + 0.5) / SAMPLES, y + (sy + 0.5) / SAMPLES, star)) hits++;
      }
    }
    color = mix(color, white, hits / (SAMPLES * SAMPLES));
    // Brillo naranja dentro de la estrella, arriba a la izquierda.
    const shine = Math.hypot(x - size * 0.44, y - size * 0.44) / (size * 0.05);
    if (hits > 0 && shine < 1) color = mix(color, [255, 190, 160], (1 - shine) * 0.7);
    return [...color, 255];
  });
}

mkdirSync('public', { recursive: true });
for (const [file, size] of [
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
]) {
  writeFileSync(`public/${file}`, drawIcon(size));
  console.log(`public/${file} (${size}x${size})`);
}
