import { mkdir, copyFile, cp } from 'node:fs/promises';
const base = new URL('./', import.meta.url);
await mkdir(new URL('dist/', base), { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'sculpture.js', 'config.js']) {
  await copyFile(new URL(file, base), new URL(`dist/${file}`, base));
}
await cp(new URL('assets/', base), new URL('dist/assets/', base), { recursive: true });
console.log('Nexora Gaming: sitio preparado en dist/');
