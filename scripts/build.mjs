import { mkdir, copyFile } from 'node:fs/promises';
// An explicit allowlist prevents server source and private catalogue downloads.
await mkdir('dist/shared', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'robots.txt', 'shared/dependencies.mjs']) {
  await copyFile(file, `dist/${file}`);
}
