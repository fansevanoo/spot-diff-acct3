// playtest.mjs — drive the game in a real browser and assert the rules.
// Run from the repo root: node playtest.mjs
// Checks: find a diff (ring + counter), wrong click (strike), H hint,
// P pause, Enter guess at the crosshair, clear a scene, next scene,
// all scenes -> win screen, zero console/page errors, zero external requests.

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire('/home/hatch/workspace/xe-sdk/package.json');
const { chromium } = require('playwright');

const NODE = '/home/hatch/workspace/tools/node-v22.23.4-linux-x64/bin/node';
const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail: detail || '' });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

const server = spawn(NODE, [join(here, 'serve.ts'), '8081'], { stdio: 'pipe' });
await new Promise((r) => setTimeout(r, 1200));

const browser = await chromium.launch({
  executablePath: '/home/hatch/.cache/ms-playwright/chromium-1255/chrome-linux64/chrome',
});
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
const external = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('request', (req) => {
  const u = req.url();
  if (!u.startsWith('http://localhost:8081') && !u.startsWith('data:')) external.push(u);
});

await page.goto('http://localhost:8081/', { waitUntil: 'load' });
await page.waitForTimeout(600);

// Panel A origin on the canvas: (16, 132). Canvas is 1280 wide on a 1280 viewport.
const clickScene = async (sx, sy, panel = 0) => {
  const px = (panel === 0 ? 16 : 664) + sx;
  const py = 132 + sy;
  await page.mouse.click(px, py);
  await page.waitForTimeout(120);
};
const state = () => page.evaluate(() => ({
  remaining: window.__remaining(),
  strikes: window.__game.strikes,
  hints: window.__game.hints,
  score: window.__game.score,
  paused: window.__game.paused,
  cleared: window.__game.cleared,
  failed: window.__game.failed,
  won: window.__game.won,
  scene: window.__game.scene,
  found: [...window.__game.found],
}));

// 1. click a real difference (lantern, scene 0 diff 0 at 90,96)
let s = await state();
check('starts with 10 to find', s.remaining === 10, `remaining=${s.remaining}`);
await clickScene(90, 96);
s = await state();
check('click diff -> ring + counter 10->9', s.remaining === 9 && s.found.includes(0), `remaining=${s.remaining} score=${s.score}`);

// 2. wrong click -> strike (cobbles, no diff near 300,430)
await clickScene(300, 430);
s = await state();
check('wrong click -> strike', s.strikes === 1 && s.remaining === 9, `strikes=${s.strikes}`);

// 3. hint
await page.keyboard.press('h');
await page.waitForTimeout(150);
s = await state();
check('H -> hint used', s.hints === 2, `hints=${s.hints}`);

// 4. pause / resume
await page.keyboard.press('p');
await page.waitForTimeout(150);
s = await state();
check('P -> paused', s.paused === true);
await page.keyboard.press('p');
await page.waitForTimeout(150);
s = await state();
check('P again -> resumed', s.paused === false);

// 5. Enter guess at the crosshair: put the crosshair on diff 6 (oranges, 124,368)
await page.evaluate(() => {
  window.__game.cross = { panel: 0, x: 124, y: 368 };
});
await page.keyboard.press('Enter');
await page.waitForTimeout(150);
s = await state();
check('Enter at crosshair -> find', s.found.includes(6) && s.remaining === 8, `remaining=${s.remaining}`);

// 6. clear scene 0: click the remaining 8 diffs
const rest = [[310, 278], [520, 122], [180, 205], [452, 252], [495, 70], [380, 88], [252, 352], [200, 45]];
for (const [x, y] of rest) await clickScene(x, y);
s = await state();
check('all 10 found -> scene cleared', s.cleared === true && s.remaining === 0, `remaining=${s.remaining}`);

// 7. N -> scene 1
await page.keyboard.press('n');
await page.waitForTimeout(200);
s = await state();
check('N -> scene 2 starts fresh', s.scene === 1 && s.remaining === 10 && s.cleared === false, `scene=${s.scene}`);

// 8. win screen via preset
await page.goto('http://localhost:8081/?win=1&score=4250&time=512', { waitUntil: 'load' });
await page.waitForTimeout(600);
s = await state();
check('win preset -> win screen', s.won === true && s.scene === 4, `won=${s.won}`);

// 9. three strikes fail a scene
await page.goto('http://localhost:8081/', { waitUntil: 'load' });
await page.waitForTimeout(500);
await clickScene(300, 430);
await clickScene(300, 430);
await clickScene(300, 430);
s = await state();
check('3 wrong clicks -> scene failed', s.failed === true && s.strikes === 3, `strikes=${s.strikes}`);
await page.keyboard.press('r');
await page.waitForTimeout(150);
s = await state();
check('R -> scene retried', s.failed === false && s.strikes === 0 && s.remaining === 10);

check('0 console/page errors', errors.length === 0, errors.join(' | ').slice(0, 300));
check('0 external network requests', external.length === 0, external.join(', ').slice(0, 300));

await browser.close();
server.kill();
const fails = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - fails}/${results.length} checks passed`);
process.exit(fails ? 1 : 0);
