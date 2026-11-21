// take-shots.mjs — serve game/ and take the screenshots listed in shots.json.
// Run from the repo root: node take-shots.mjs
// Playwright is resolved from the xe-sdk install (it has a cached chromium).

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire('/home/hatch/workspace/xe-sdk/package.json');
const { chromium } = require('playwright');

const NODE = '/home/hatch/workspace/tools/node-v22.23.4-linux-x64/bin/node';
const shots = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8')).shots;

const server = spawn(NODE, [join(here, 'serve.ts'), '8080'], { stdio: 'pipe' });
await new Promise((r) => setTimeout(r, 1200));

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});

for (const s of shots) {
  await page.goto(`http://localhost:8080${s.url}`, { waitUntil: 'load' });
  await page.waitForTimeout(900);
  const out = join(here, 'screenshots', s.file);
  await page.screenshot({ path: out, type: 'jpeg', quality: 80 });
  const size = statSync(out).size;
  console.log(`${s.file}: ${size} bytes ${size <= 262144 ? 'OK' : 'OVER 256 KiB!'}`);
}

await browser.close();
server.kill();
console.log(errors.length ? `PAGE/CONSOLE ERRORS:\n${errors.join('\n')}` : 'no page/console errors');
