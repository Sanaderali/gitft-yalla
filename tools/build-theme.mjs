// Minifies the readable theme sources (shopify-theme/src) into shopify-theme/assets.
// Edit src/theme.js and src/theme.css, then run:  npm run build:theme   (or npm run watch:theme)
import { build, context } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'shopify-theme');
const opts = {
  entryPoints: { 'theme': join(root, 'src/theme.js') },
  outdir: join(root, 'assets'),
  bundle: false, minify: true, target: ['es2020', 'chrome90', 'safari14'], legalComments: 'none', logLevel: 'info'
};
const css = { entryPoints: { theme: join(root, 'src/theme.css') }, outdir: join(root, 'assets'), minify: true, target: ['chrome90', 'safari14'], logLevel: 'info' };

if (process.argv.includes('--watch')) {
  for (const o of [opts, css]) (await context(o)).watch();
} else {
  await build(opts); await build(css);
}
