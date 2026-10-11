// Inline dist/ into one self-contained HTML file that runs from file://.
// Run after `vite build`:  node scripts/singlefile.mjs  →  Vosotrosaurus.html
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
if (!existsSync(resolve(dist, 'index.html'))) {
  console.error('dist/index.html not found — run `vite build` first.');
  process.exit(1);
}

let html = readFileSync(resolve(dist, 'index.html'), 'utf8');

// Inline every local stylesheet and script that Vite emitted.
html = html.replace(/<link[^>]+rel="stylesheet"[^>]+href="\.\/(assets\/[^"]+)"[^>]*>/g, (_, p) =>
  `<style>${readFileSync(resolve(dist, p), 'utf8')}</style>`);
// Scripts move to the end of <body>: a classic script in <head> would run
// before #root exists (module scripts were deferred; this one is not).
const scripts = [];
html = html.replace(/<script[^>]+src="\.\/(assets\/[^"]+)"[^>]*><\/script>/g, (_, p) => {
  scripts.push(`<script>${readFileSync(resolve(dist, p), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
  return '';
});
html = html.replace('</body>', () => `${scripts.join('\n')}\n</body>`);

const out = resolve(root, 'Vosotrosaurus.html');
writeFileSync(out, html);
// Same file as docs/index.html so GitHub Pages (Settings → Pages → /docs) serves it.
mkdirSync(resolve(root, 'docs'), { recursive: true });
writeFileSync(resolve(root, 'docs', 'index.html'), html);
// Sandbox copy: same app, but localStorage is namespaced so it opens as a brand-new user
// and never touches real progress. Handy for checking the first-run experience. (gitignored)
const shim = `<script>
(function () {
  var P = 'sandbox.', S = window.Storage.prototype;
  var g = S.getItem, s = S.setItem, r = S.removeItem;
  S.getItem = function (k) { return g.call(this, P + k); };
  S.setItem = function (k, v) { return s.call(this, P + k, v); };
  S.removeItem = function (k) { return r.call(this, P + k); };
})();
</script>`;
const sandbox = html.replace('<head>', () => `<head>\n${shim}`).replace('<title>Vosotrosaurus</title>', '<title>Vosotrosaurus (new-user sandbox)</title>');
writeFileSync(resolve(root, 'VosotrosaurusNew.html'), sandbox);
console.log(`wrote ${out}, docs/index.html and VosotrosaurusNew.html (${Math.round(html.length / 1024)} kB)`);
