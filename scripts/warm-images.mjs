// Run once after adding products (or whenever pictures feel slow on the first visit):
//    node scripts/warm-images.mjs
// Cloudinary creates each picture size the FIRST time somebody asks for it, which is slow.
// This script asks for every size the shop uses, so your real visitors always get the fast, ready version.
import { img, videoPoster } from '../src/utils/img.js';

const API = process.env.API_URL || 'https://backend-5anz.onrender.com';
const headers = { 'x-site-subdomain': 'ts-mode' };
const get = async (path) => (await fetch(API + path, { headers })).json();

console.log('Waking the server and reading your catalog…');
const [products, categories, settings] = await Promise.all([get('/products'), get('/categories'), get('/site-settings')]);

const urls = new Set();
for (const p of products) {
  const all = [...(p.images || []), ...(p.variants || []).flatMap((v) => v.images || [])];
  for (const u of all) { urls.add(img(u, 800)); urls.add(img(u, 1400, 'best')); urls.add(img(u, 300, 'good')); urls.add(img(u, 400, 'good')); }
}
for (const c of categories) if (c.imageUrl) urls.add(img(c.imageUrl, 900));
if (settings.heroVideo) { urls.add(videoPoster(settings.heroVideo, 1280)); urls.add(videoPoster(settings.heroVideo, 800)); }
const list = [...urls].filter((u) => u && u.startsWith('https://res.cloudinary.com'));
console.log(`${list.length} pictures to prepare.\n`);

let done = 0, failed = 0;
async function worker() {
  while (list.length) {
    const url = list.pop();
    const t0 = Date.now();
    try {
      const res = await fetch(url);
      const kb = Math.round((await res.arrayBuffer()).byteLength / 1024);
      console.log(`${res.ok ? 'OK  ' : 'FAIL'} ${res.status} ${kb} KB ${Date.now() - t0} ms  ${url.slice(-60)}`);
      if (!res.ok) failed++;
    } catch (err) { failed++; console.log(`FAIL ${err.message}  ${url.slice(-60)}`); }
    done++;
  }
}
await Promise.all([worker(), worker(), worker(), worker()]);
console.log(`\nFinished: ${done - failed} ready, ${failed} failed. Run it again if some failed.`);
