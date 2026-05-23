/**
 * Icon generation script for Say It Anyway.
 * Run: node scripts/generate-icons.mjs
 * Outputs all PNG icons + favicon.svg to artifacts/say-it-anyway/public/
 */

import sharp from "sharp";
import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../artifacts/say-it-anyway/public");

// ---------------------------------------------------------------------------
// SVG designs
// ---------------------------------------------------------------------------

/**
 * Full app icon — 512×512 viewBox.
 * Three stacked parchment cards on a warm charcoal background.
 * Front card has a stylised open-quote mark in warm copper.
 * All shapes are paths/primitives — no font dependency.
 */
const APP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="38%" cy="32%" r="72%">
      <stop offset="0%"   stop-color="#2c1e14"/>
      <stop offset="100%" stop-color="#150d08"/>
    </radialGradient>
    <filter id="cs" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="2" dy="5" stdDeviation="9" flood-color="#000" flood-opacity="0.38"/>
    </filter>
  </defs>

  <!-- ── Background (rounded square) ── -->
  <rect width="512" height="512" rx="104" fill="url(#bg)"/>

  <!-- ── Back card  (−11°, slightly lower) ── -->
  <g transform="translate(256,264) rotate(-11)" filter="url(#cs)">
    <rect x="-86" y="-122" width="172" height="244" rx="13" fill="#b8a998" opacity="0.42"/>
  </g>

  <!-- ── Middle card (−4°) ── -->
  <g transform="translate(256,260) rotate(-4)" filter="url(#cs)">
    <rect x="-86" y="-122" width="172" height="244" rx="13" fill="#d4c8b6" opacity="0.60"/>
  </g>

  <!-- ── Front card (+5°) ── -->
  <g transform="translate(256,255) rotate(5)" filter="url(#cs)">
    <rect x="-86" y="-122" width="172" height="244" rx="13" fill="#f5ebe0"/>

    <!-- Opening double-quote: two ovals side by side -->
    <!-- Each oval is a small filled ellipse; together they read as " -->
    <ellipse cx="-20" cy="-52" rx="12" ry="15" fill="#c4836c"/>
    <ellipse cx="10"  cy="-52" rx="12" ry="15" fill="#c4836c"/>

    <!-- Three text-line stubs — suggest a prompt -->
    <rect x="-46" y="18" width="92" height="5" rx="2.5" fill="#c8b8a6" opacity="0.55"/>
    <rect x="-34" y="33" width="68" height="5" rx="2.5" fill="#c8b8a6" opacity="0.42"/>
    <rect x="-40" y="48" width="80" height="5" rx="2.5" fill="#c8b8a6" opacity="0.32"/>
  </g>
</svg>`;

/**
 * Maskable icon — 512×512, full bleed background, content in central 80%.
 * iOS/Android adaptive icon crop-safe.
 */
const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="mbg" cx="38%" cy="32%" r="72%">
      <stop offset="0%"   stop-color="#2c1e14"/>
      <stop offset="100%" stop-color="#150d08"/>
    </radialGradient>
    <filter id="mcs" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="1" dy="4" stdDeviation="7" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Full bleed background (no rounded corners) -->
  <rect width="512" height="512" fill="url(#mbg)"/>

  <!-- Cards scaled to ~75% so they live inside the safe zone -->

  <!-- Back card -->
  <g transform="translate(256,264) rotate(-11) scale(0.78)" filter="url(#mcs)">
    <rect x="-86" y="-122" width="172" height="244" rx="13" fill="#b8a998" opacity="0.42"/>
  </g>

  <!-- Middle card -->
  <g transform="translate(256,260) rotate(-4) scale(0.78)" filter="url(#mcs)">
    <rect x="-86" y="-122" width="172" height="244" rx="13" fill="#d4c8b6" opacity="0.60"/>
  </g>

  <!-- Front card -->
  <g transform="translate(256,255) rotate(5) scale(0.78)" filter="url(#mcs)">
    <rect x="-86" y="-122" width="172" height="244" rx="13" fill="#f5ebe0"/>
    <ellipse cx="-20" cy="-52" rx="12" ry="15" fill="#c4836c"/>
    <ellipse cx="10"  cy="-52" rx="12" ry="15" fill="#c4836c"/>
    <rect x="-46" y="18" width="92" height="5" rx="2.5" fill="#c8b8a6" opacity="0.55"/>
    <rect x="-34" y="33" width="68" height="5" rx="2.5" fill="#c8b8a6" opacity="0.42"/>
    <rect x="-40" y="48" width="80" height="5" rx="2.5" fill="#c8b8a6" opacity="0.32"/>
  </g>
</svg>`;

/**
 * Favicon SVG — 32×32 viewBox, simplified.
 * Two cards visible, small quote dots on the front card.
 * Used directly as favicon.svg (browsers render it natively at any size).
 */
const FAVICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <radialGradient id="fbg" cx="38%" cy="32%" r="72%">
      <stop offset="0%"   stop-color="#2c1e14"/>
      <stop offset="100%" stop-color="#150d08"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="32" height="32" rx="7" fill="url(#fbg)"/>

  <!-- Back card -->
  <g transform="translate(16,16) rotate(-9)">
    <rect x="-7" y="-10" width="14" height="20" rx="2" fill="#c0b0a0" opacity="0.4"/>
  </g>

  <!-- Front card -->
  <g transform="translate(17,15.5) rotate(5)">
    <rect x="-7" y="-10" width="14" height="20" rx="2" fill="#f5ebe0"/>
    <!-- Quote dots (two small circles) -->
    <circle cx="-2.5" cy="-4" r="1.8" fill="#c4836c"/>
    <circle cx="2.5"  cy="-4" r="1.8" fill="#c4836c"/>
    <!-- Text line hint -->
    <rect x="-4.5" y="2" width="9" height="1.5" rx="0.75" fill="#c8b8a6" opacity="0.5"/>
    <rect x="-3"   y="5" width="6" height="1.5" rx="0.75" fill="#c8b8a6" opacity="0.38"/>
  </g>
</svg>`;

// ---------------------------------------------------------------------------
// Write favicon.svg (used by modern browsers directly — no rasterisation)
// ---------------------------------------------------------------------------
writeFileSync(join(OUT, "favicon.svg"), FAVICON_SVG, "utf8");
console.log("✓ favicon.svg");

// ---------------------------------------------------------------------------
// Rasterise with sharp
// ---------------------------------------------------------------------------
async function render(svgString, outPath, size) {
  await sharp(Buffer.from(svgString))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`✓ ${outPath.replace(OUT + "/", "")}  (${size}×${size})`);
}

// Wrap the 32×32 PNG bytes into a minimal ICO container.
function pngToIco(pngBytes) {
  const buf = Buffer.allocUnsafe(6 + 16 + pngBytes.length);
  let o = 0;
  // ICO header
  buf.writeUInt16LE(0,    o); o += 2; // reserved
  buf.writeUInt16LE(1,    o); o += 2; // type = 1 (ICO)
  buf.writeUInt16LE(1,    o); o += 2; // count = 1

  // Directory entry
  buf.writeUInt8(32,  o); o++;        // width  (0 = 256)
  buf.writeUInt8(32,  o); o++;        // height
  buf.writeUInt8(0,   o); o++;        // colour count (0 = truecolor)
  buf.writeUInt8(0,   o); o++;        // reserved
  buf.writeUInt16LE(1, o); o += 2;   // planes
  buf.writeUInt16LE(32, o); o += 2;  // bit count
  buf.writeUInt32LE(pngBytes.length, o); o += 4;
  buf.writeUInt32LE(22, o); o += 4;  // data offset = 6 + 16

  pngBytes.copy(buf, o);
  return buf;
}

async function main() {
  // app icons
  await render(APP_ICON_SVG,  join(OUT, "icon-512.png"),         512);
  await render(APP_ICON_SVG,  join(OUT, "icon-192.png"),         192);
  await render(APP_ICON_SVG,  join(OUT, "apple-touch-icon.png"), 180);
  await render(MASKABLE_SVG,  join(OUT, "maskable-icon-512.png"),512);

  // favicon.ico  (32×32 PNG wrapped in ICO container)
  const favPngPath = join(OUT, "_fav32.png");
  await render(FAVICON_SVG, favPngPath, 32);
  const pngBytes = readFileSync(favPngPath);
  writeFileSync(join(OUT, "favicon.ico"), pngToIco(pngBytes));
  console.log("✓ favicon.ico  (32×32 wrapped)");

  // clean up temp file
  const { unlinkSync } = await import("fs");
  unlinkSync(favPngPath);
}

main().catch(err => { console.error(err); process.exit(1); });
