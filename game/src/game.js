// game.js — state, rules and scoring for Lantern Night Market.
// One game: 5 scenes x 10 differences. Click a difference in either panel
// to ring it on both. Three wrong guesses fail the scene.

import { SCENES } from './scenes.js';
import { sfx } from './sound.js';

export const PANELS = [
  { label: 'A · ORIGINAL', x: 16, y: 132, w: 600, h: 500 },
  { label: 'B · SPOT THE CHANGES', x: 664, y: 132, w: 600, h: 500 },
];

export function newGame() {
  return {
    scene: 0,
    found: new Set(),
    strikes: 0,
    hints: 3,
    score: 0,
    streak: 0,
    bestStreak: 0,
    elapsed: 0, // seconds in the current scene
    totalElapsed: 0,
    paused: false,
    failed: false,
    cleared: false,
    won: false,
    hintAt: -1, // diff index being hinted, -1 = none
    hintUntil: 0,
    latest: -1, // most recent find, drawn green
    foundAt: new Map(), // diff index -> performance.now() of the find
    cross: { panel: 0, x: 300, y: 250 },
    magnifier: false,
    mouse: { x: -1, y: -1, panel: -1 },
    winScore: 0,
    winTime: 0,
    started: false,
  };
}

export function sceneDiffs(g) {
  return SCENES[g.scene].diffs;
}

export function remaining(g) {
  return SCENES[g.scene].diffs.length - g.found.size;
}

export function fmtTime(s) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

// Convert a canvas click to a scene point, or null when outside both panels.
export function panelHit(g, x, y) {
  for (let p = 0; p < 2; p++) {
    const pn = PANELS[p];
    if (x >= pn.x && x < pn.x + pn.w && y >= pn.y && y < pn.y + pn.h) {
      return { panel: p, sx: x - pn.x, sy: y - pn.y };
    }
  }
  return null;
}

function nearDiff(d, sx, sy) {
  const dx = sx - d.x;
  const dy = sy - d.y;
  if (dx * dx + dy * dy <= d.r * d.r) return true;
  if (d.x2 !== undefined) {
    const dx2 = sx - d.x2;
    const dy2 = sy - d.y2;
    if (dx2 * dx2 + dy2 * dy2 <= d.r * d.r) return true;
  }
  return false;
}

// Guess at a scene point. Returns 'found' | 'miss' | 'ignored'.
export function guess(g, sx, sy, now) {
  if (g.paused || g.failed || g.cleared || g.won) return 'ignored';
  const diffs = sceneDiffs(g);
  for (let i = 0; i < diffs.length; i++) {
    if (g.found.has(i)) continue;
    if (nearDiff(diffs[i], sx, sy)) {
      g.found.add(i);
      g.latest = i;
      g.foundAt.set(i, now);
      g.streak += 1;
      g.bestStreak = Math.max(g.bestStreak, g.streak);
      g.score += 100 + 25 * (g.streak - 1);
      sfx.find();
      if (g.found.size === diffs.length) {
        const par = SCENES[g.scene].par;
        const bonus = 500 + Math.max(0, par - Math.floor(g.elapsed)) * 5;
        g.score += bonus;
        g.cleared = true;
        sfx.clear();
      }
      return 'found';
    }
  }
  g.strikes += 1;
  g.streak = 0;
  sfx.wrong();
  if (g.strikes >= 3) g.failed = true;
  return 'miss';
}

export function useHint(g, now) {
  if (g.paused || g.failed || g.cleared || g.won) return false;
  if (g.hints <= 0) return false;
  const diffs = sceneDiffs(g);
  const left = diffs.map((d, i) => i).filter((i) => !g.found.has(i));
  if (!left.length) return false;
  g.hints -= 1;
  g.hintAt = left[Math.floor(Math.random() * left.length)];
  g.hintUntil = now + 2500;
  sfx.hint();
  return true;
}

export function nextScene(g) {
  if (g.scene < SCENES.length - 1) {
    g.totalElapsed += g.elapsed;
    g.scene += 1;
    g.found = new Set();
    g.strikes = 0;
    g.hints = 3;
    g.elapsed = 0;
    g.cleared = false;
    g.failed = false;
    g.latest = -1;
    g.hintAt = -1;
    g.foundAt = new Map();
    g.streak = 0;
    g.cross = { panel: 0, x: 300, y: 250 };
    return true;
  }
  g.totalElapsed += g.elapsed;
  g.winScore = g.score;
  g.winTime = g.totalElapsed;
  g.won = true;
  sfx.win();
  try {
    const best = Number(localStorage.getItem('lantern-market-best') || 0);
    if (g.score > best) localStorage.setItem('lantern-market-best', String(g.score));
  } catch (e) { /* storage unavailable: ignore */ }
  return false;
}

export function retryScene(g) {
  g.found = new Set();
  g.strikes = 0;
  g.hints = 3;
  g.elapsed = 0;
  g.failed = false;
  g.latest = -1;
  g.hintAt = -1;
  g.foundAt = new Map();
  g.streak = 0;
}

export function restartAll(g) {
  const fresh = newGame();
  Object.assign(g, fresh);
}

export function bestScore() {
  try {
    return Number(localStorage.getItem('lantern-market-best') || 0);
  } catch (e) {
    return 0;
  }
}

// URL presets for screenshots and testing: ?scene=0&found=0,1,2&time=47&win=1
export function applyPreset(g) {
  const q = new URLSearchParams(location.search);
  if (q.get('win') === '1') {
    g.winScore = Number(q.get('score') || 4250);
    g.winTime = Number(q.get('time') || 512);
    g.won = true;
    g.scene = SCENES.length - 1;
    return;
  }
  const sc = Number(q.get('scene'));
  if (Number.isInteger(sc) && sc >= 0 && sc < SCENES.length) g.scene = sc;
  const found = q.get('found');
  if (found) {
    for (const n of found.split(',')) {
      const i = Number(n);
      if (Number.isInteger(i) && i >= 0 && i < SCENES[g.scene].diffs.length) {
        g.found.add(i);
        g.foundAt.set(i, performance.now() - 1000);
      }
    }
    if (g.found.size) {
      g.latest = [...g.found].pop();
      g.streak = g.found.size;
      g.score = g.found.size * 100;
    }
  }
  const t = Number(q.get('time'));
  if (Number.isFinite(t) && t > 0) g.elapsed = t;
}
