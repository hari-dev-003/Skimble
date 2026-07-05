/**
 * Generates the full Skimble favicon / app-icon / social-image set from the
 * single source of truth: src/assets/logo-mark.svg
 *
 * Run:  node scripts/generate-icons.mjs
 * Deps: sharp, png-to-ico (devDependencies)
 *
 * All raster outputs go to /public so they resolve at "/<file>" in dev and on
 * Vercel without any import step.
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const markPath = join(root, 'src/assets/logo-mark.svg');
const publicDir = join(root, 'public');
const out = (name) => join(publicDir, name);

const markSvg = readFileSync(markPath);

const render = (size) =>
  sharp(markSvg, { density: 384 }).resize(size, size, { fit: 'contain' }).png();

// PNG icon sizes used across favicons, Apple touch, and PWA.
const pngSizes = {
  'favicon-16x16.png': 16,
  'favicon-32x32.png': 32,
  'favicon-48x48.png': 48,
  'apple-touch-icon.png': 180,
  'android-chrome-192x192.png': 192,
  'android-chrome-512x512.png': 512,
};

// Social share card (Open Graph / Twitter). Light branded backdrop + mark + wordmark.
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#0B1220"/>
      <stop offset="1" stop-color="#111C33"/>
    </linearGradient>
    <linearGradient id="tile" x1="470" y1="200" x2="730" y2="430" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#3B82F6"/>
      <stop offset="1" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="wm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#DBE7FF"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#page)"/>

  <!-- subtle grid -->
  <g stroke="#3B82F6" stroke-opacity="0.06" stroke-width="1">
    ${Array.from({ length: 13 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="630"/>`).join('')}
    ${Array.from({ length: 7 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1200" y2="${i * 100}"/>`).join('')}
  </g>

  <!-- logo tile -->
  <g transform="translate(470,150) scale(0.5078)">
    <rect x="0" y="0" width="512" height="512" rx="128" fill="url(#tile)"/>
    <path d="M256 116 L336 200 L300 316 L256 356 L212 316 L176 200 Z" fill="#ffffff"/>
    <path d="M256 200 L256 344" stroke="#1D4ED8" stroke-width="18" stroke-linecap="round"/>
    <circle cx="256" cy="232" r="16" fill="#1D4ED8"/>
    <path d="M150 408 Q256 456 366 380" stroke="#ffffff" stroke-width="28" stroke-linecap="round" fill="none"/>
  </g>

  <text x="600" y="470" text-anchor="middle" fill="url(#wm)"
        font-family="Sora, Segoe UI, Arial, Helvetica, sans-serif" font-weight="800"
        font-size="86" letter-spacing="-3">Skimble</text>
  <text x="600" y="530" text-anchor="middle" fill="#93B4F5"
        font-family="'Plus Jakarta Sans', Segoe UI, Arial, Helvetica, sans-serif" font-weight="500"
        font-size="30" letter-spacing="0.5">Collaborative real-time whiteboard &amp; notes</text>
</svg>`;

async function main() {
  // 1. Scalable favicon = the master mark, untouched.
  copyFileSync(markPath, out('favicon.svg'));

  // 2. PNG icon set.
  for (const [name, size] of Object.entries(pngSizes)) {
    await render(size).toFile(out(name));
    console.log('  ✓', name);
  }

  // 3. Multi-resolution .ico (16/32/48) for legacy browsers/tabs.
  const icoBuffers = await Promise.all(
    [16, 32, 48].map((s) => render(s).toBuffer())
  );
  writeFileSync(out('favicon.ico'), await pngToIco(icoBuffers));
  console.log('  ✓ favicon.ico');

  // 4. Social share image.
  await sharp(Buffer.from(ogSvg)).png().toFile(out('og-image.png'));
  console.log('  ✓ og-image.png');

  console.log('\nDone — all icons written to /public');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
