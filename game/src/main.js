// main.js — rendering, input and the frame loop for Lantern Night Market.
// One 1280 x 800 canvas: header, two panels, footer. No network, no images.

import { SCENES, SCENE_W, SCENE_H, drawScene } from './scenes.js';
import { lantern } from './draw.js';
import { sfx } from './sound.js';
import {
  PANELS, newGame, sceneDiffs, remaining, fmtTime, panelHit, guess, useHint,
  nextScene, retryScene, restartAll, bestScore, applyPreset,
} from './game.js';

const W = 1280;
const H = 800;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const g = newGame();
applyPreset(g);

const BTNS = {
  hint: { x: 16, y: 700, w: 116, h: 36 },
  pause: { x: 140, y: 700, w: 96, h: 36 },
  sound: { x: 244, y: 700, w: 110, h: 36 },
  zoom: { x: 362, y: 700, w: 110, h: 36 },
  next: { x: 1088, y: 700, w: 176, h: 36 },
};

function inRect(r, x, y) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

function sceneBtnRect(i) {
  return { x: 560 + i * 44, y: 700, w: 36, h: 36 };
}

function jumpScene(i) {
  if (i === g.scene && !g.cleared && !g.failed) return;
  g.totalElapsed += g.elapsed;
  g.scene = i;
  g.found = new Set();
  g.strikes = 0;
  g.hints = 3;
  g.elapsed = 0;
  g.cleared = false;
  g.failed = false;
  g.won = false;
  g.latest = -1;
  g.hintAt = -1;
  g.foundAt = new Map();
  g.streak = 0;
  g.cross = { panel: 0, x: 300, y: 250 };
  sfx.click();
}

// ---- drawing --------------------------------------------------------------
function drawButton(r, label, enabled, accent) {
  ctx.save();
  ctx.fillStyle = enabled ? (accent ? '#e4572e' : '#3d2a56') : '#2a2138';
  ctx.strokeStyle = accent ? '#f7c948' : '#6a5578';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = enabled ? '#fff3e0' : '#6a5a7a';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, r.x + r.w / 2, r.y + r.h / 2 + 1);
  ctx.restore();
}

function drawHeader() {
  // title block
  lantern(ctx, 34, 30, 13, '#e4572e', 'rgba(255,120,60,0.3)');
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 27px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('Lantern Night Market', 54, 38);
  ctx.fillStyle = '#f4a7b9';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('S P O T   T H E   D I F F E R E N C E', 54, 62);
  ctx.fillStyle = '#cbb8e0';
  ctx.font = '13px sans-serif';
  ctx.fillText(`Best score: ${bestScore()}`, 54, 84);

  // big counter, centre
  const left = remaining(g);
  ctx.fillStyle = '#f7c948';
  ctx.font = 'bold 40px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(g.won ? 'ALL FOUND!' : `${left} to find`, 640, 46);
  ctx.fillStyle = '#fff3e0';
  ctx.font = '16px sans-serif';
  ctx.fillText(`Scene ${g.scene + 1} of ${SCENES.length} · ${SCENES[g.scene].name}`, 640, 72);

  // timer / strikes / score, right
  const par = SCENES[g.scene].par;
  ctx.fillStyle = g.elapsed > par ? '#ff7a6b' : '#fff3e0';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${fmtTime(g.elapsed)} / ${fmtTime(par)}`, 1264, 36);
  ctx.fillStyle = '#fff3e0';
  ctx.font = '16px sans-serif';
  let strikes = 'Strikes: ';
  for (let i = 0; i < 3; i++) strikes += i < g.strikes ? '✕ ' : '○ ';
  ctx.fillText(strikes, 1264, 62);
  ctx.fillText(`Score ${g.score} · Streak ×${g.streak}`, 1264, 86);
}

function ringAt(px, py, r, color, pulse) {
  const rr = pulse ? r + 2 + Math.sin(performance.now() / 180) * 2 : r;
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(px, py, rr, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(px, py, rr + 3, 0, Math.PI * 2);
  ctx.stroke();
  // check mark
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px - r * 0.4, py);
  ctx.lineTo(px - r * 0.1, py + r * 0.35);
  ctx.lineTo(px + r * 0.45, py - r * 0.35);
  ctx.stroke();
}

function drawRings(panel) {
  const pn = PANELS[panel];
  const diffs = sceneDiffs(g);
  const now = performance.now();
  for (const i of g.found) {
    const d = diffs[i];
    const color = i === g.latest ? '#22c55e' : '#f5b301';
    const pulse = i === g.latest;
    if (d.x2 !== undefined) {
      ringAt(pn.x + d.x, pn.y + d.y, d.r, color, pulse);
      ringAt(pn.x + d.x2, pn.y + d.y2, d.r, color, pulse);
      ctx.strokeStyle = color;
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pn.x + d.x, pn.y + d.y);
      ctx.lineTo(pn.x + d.x2, pn.y + d.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      ringAt(pn.x + d.x, pn.y + d.y, d.r + 4, color, pulse);
    }
  }
  // hint pulse
  if (g.hintAt >= 0 && now < g.hintUntil) {
    const d = diffs[g.hintAt];
    const pr = d.r + 6 + Math.sin(now / 120) * 4;
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.arc(pn.x + d.x, pn.y + d.y, pr, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawPanel(p) {
  const pn = PANELS[p];
  const variant = p; // panel 0 = original, panel 1 = changed
  ctx.save();
  // frame
  ctx.fillStyle = '#17102a';
  ctx.beginPath();
  ctx.roundRect(pn.x - 6, pn.y - 34, pn.w + 12, pn.h + 40, 10);
  ctx.fill();
  ctx.strokeStyle = '#6a4a8a';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // label strip
  ctx.fillStyle = variant ? '#e4572e' : '#2a9d8f';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(pn.label, pn.x + 10, pn.y - 17);
  ctx.fillStyle = '#cbb8e0';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(variant ? '10 changes hide here' : 'the original', pn.x + pn.w - 10, pn.y - 17);
  // scene
  drawScene(ctx, g.scene, variant, pn.x, pn.y);
  drawRings(p);
  // crosshair on the active panel
  if (!g.paused && !g.failed && !g.cleared && !g.won && g.cross.panel === p) {
    const cx = pn.x + g.cross.x;
    const cy = pn.y + g.cross.y;
    ctx.strokeStyle = 'rgba(247,201,72,0.95)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy);
    ctx.lineTo(cx + 18, cy);
    ctx.moveTo(cx, cy - 18);
    ctx.lineTo(cx, cy + 18);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMagnifier() {
  if (!g.magnifier || g.mouse.panel < 0) return;
  const p = g.mouse.panel;
  const pn = PANELS[p];
  const mx = g.mouse.x;
  const my = g.mouse.y;
  const sx = mx - pn.x;
  const sy = my - pn.y;
  const R = 82;
  ctx.save();
  ctx.beginPath();
  ctx.arc(mx, my, R, 0, Math.PI * 2);
  ctx.clip();
  ctx.translate(mx, my);
  ctx.scale(2, 2);
  ctx.translate(-(pn.x + sx), -(pn.y + sy));
  drawScene(ctx, g.scene, p, pn.x, pn.y);
  drawRings(p);
  ctx.restore();
  ctx.strokeStyle = '#f7c948';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(mx, my, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f7c948';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('2×', mx, my - R - 8);
}

function drawFooter() {
  // found dots + progress
  const diffs = sceneDiffs(g);
  ctx.fillStyle = '#cbb8e0';
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Found:', 16, 668);
  for (let i = 0; i < diffs.length; i++) {
    ctx.fillStyle = g.found.has(i) ? '#f5b301' : '#4a3a5e';
    ctx.beginPath();
    ctx.arc(78 + i * 22, 668, 7, 0, Math.PI * 2);
    ctx.fill();
    if (g.found.has(i)) {
      ctx.strokeStyle = '#17102a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(78 + i * 22 - 3, 668);
      ctx.lineTo(78 + i * 22 - 1, 670);
      ctx.lineTo(78 + i * 22 + 4, 665);
      ctx.stroke();
    }
  }
  ctx.fillStyle = '#2a2138';
  ctx.beginPath();
  ctx.roundRect(320, 660, 260, 14, 7);
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.roundRect(320, 660, Math.max(14, (260 * g.found.size) / diffs.length), 14, 7);
  ctx.fill();

  drawButton(BTNS.hint, `Hint (${g.hints})`, g.hints > 0 && !g.won);
  drawButton(BTNS.pause, g.paused ? 'Resume' : 'Pause', !g.won);
  drawButton(BTNS.sound, sfx.isMuted() ? 'Sound: off' : 'Sound: on', true);
  drawButton(BTNS.zoom, g.magnifier ? 'Zoom: on' : 'Zoom: off', true);
  for (let i = 0; i < SCENES.length; i++) {
    drawButton(sceneBtnRect(i), String(i + 1), true, i === g.scene);
  }
  ctx.fillStyle = '#cbb8e0';
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Scenes:', 500, 718);
  drawButton(BTNS.next, 'Next scene →', g.cleared, g.cleared);

  ctx.fillStyle = '#8a7aa8';
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Click a difference in either panel · Arrows move the crosshair, Enter guesses · H hint · P pause · M magnifier · N next scene · R retry',
    640, 762,
  );
}

function drawOverlays() {
  if (g.won) {
    ctx.fillStyle = 'rgba(23,16,42,0.82)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('You found them all!', 640, 300);
    ctx.fillStyle = '#fff3e0';
    ctx.font = '24px sans-serif';
    ctx.fillText(`50 differences · ${fmtTime(g.winTime)} · Score ${g.winScore}`, 640, 356);
    ctx.fillStyle = '#f4a7b9';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Best score: ${Math.max(bestScore(), g.winScore)} — press R to play again`, 640, 398);
    return;
  }
  if (g.paused) {
    ctx.fillStyle = 'rgba(23,16,42,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 40px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', 640, 380);
    ctx.fillStyle = '#fff3e0';
    ctx.font = '18px sans-serif';
    ctx.fillText('Press P or the Pause button to resume', 640, 424);
  }
  if (g.failed) {
    ctx.fillStyle = 'rgba(23,16,42,0.7)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ff7a6b';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('Three wrong guesses!', 640, 360);
    ctx.fillStyle = '#fff3e0';
    ctx.font = '18px sans-serif';
    ctx.fillText('This scene resets — press R to try it again', 640, 404);
  }
  if (g.cleared && !g.won) {
    ctx.fillStyle = 'rgba(23,16,42,0.55)';
    ctx.fillRect(0, 648, W, 52);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      g.scene < SCENES.length - 1
        ? 'Scene clear! Press N or Next scene to keep going'
        : 'Scene clear! Press N to see your win screen',
      640, 674,
    );
  }
}

function render() {
  ctx.clearRect(0, 0, W, H);
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1d1426');
  bg.addColorStop(1, '#2b1b3d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  drawHeader();
  drawPanel(0);
  drawPanel(1);
  // VS badge between the panels
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  ctx.arc(640, 382, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f7c948';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#fff3e0';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('VS', 640, 383);
  drawMagnifier();
  drawFooter();
  drawOverlays();
}

// ---- input -----------------------------------------------------------------
function canvasPos(e) {
  const r = canvas.getBoundingClientRect();
  return {
    x: ((e.clientX - r.left) / r.width) * W,
    y: ((e.clientY - r.top) / r.height) * H,
  };
}

canvas.addEventListener('click', (e) => {
  const { x, y } = canvasPos(e);
  if (g.won) {
    restartAll(g);
    return;
  }
  if (inRect(BTNS.hint, x, y)) {
    useHint(g, performance.now());
    return;
  }
  if (inRect(BTNS.pause, x, y)) {
    g.paused = !g.paused;
    sfx.click();
    return;
  }
  if (inRect(BTNS.sound, x, y)) {
    sfx.toggleMute();
    return;
  }
  if (inRect(BTNS.zoom, x, y)) {
    g.magnifier = !g.magnifier;
    sfx.click();
    return;
  }
  if (inRect(BTNS.next, x, y) && g.cleared) {
    nextScene(g);
    return;
  }
  for (let i = 0; i < SCENES.length; i++) {
    if (inRect(sceneBtnRect(i), x, y)) {
      jumpScene(i);
      return;
    }
  }
  if (g.failed) {
    retryScene(g);
    return;
  }
  const hit = panelHit(g, x, y);
  if (hit) {
    g.cross = { panel: hit.panel, x: hit.sx, y: hit.sy };
    guess(g, hit.sx, hit.sy, performance.now());
  }
});

canvas.addEventListener('mousemove', (e) => {
  const { x, y } = canvasPos(e);
  const hit = panelHit(g, x, y);
  g.mouse = { x, y, panel: hit ? hit.panel : -1 };
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    g.cross.panel = 1 - g.cross.panel;
    return;
  }
  const step = e.shiftKey ? 3 : 10;
  if (e.key === 'ArrowLeft') {
    g.cross.x = Math.max(0, g.cross.x - step);
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    g.cross.x = Math.min(SCENE_W, g.cross.x + step);
    e.preventDefault();
  } else if (e.key === 'ArrowUp') {
    g.cross.y = Math.max(0, g.cross.y - step);
    e.preventDefault();
  } else if (e.key === 'ArrowDown') {
    g.cross.y = Math.min(SCENE_H, g.cross.y + step);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    guess(g, g.cross.x, g.cross.y, performance.now());
    e.preventDefault();
  } else if (e.key === 'h' || e.key === 'H') {
    useHint(g, performance.now());
  } else if (e.key === 'p' || e.key === 'P') {
    if (!g.won) g.paused = !g.paused;
  } else if (e.key === 'm' || e.key === 'M') {
    g.magnifier = !g.magnifier;
  } else if (e.key === 'n' || e.key === 'N') {
    if (g.cleared) nextScene(g);
  } else if (e.key === 'r' || e.key === 'R') {
    if (g.won) restartAll(g);
    else if (g.failed) retryScene(g);
    else retryScene(g);
  } else if (e.key >= '1' && e.key <= '5') {
    jumpScene(Number(e.key) - 1);
  }
});

// Exposed for automated play-testing only (screenshots and players never see it).
window.__game = g;
window.__remaining = () => remaining(g);

// ---- frame loop -------------------------------------------------------------
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.25, (now - last) / 1000);
  last = now;
  if (!g.paused && !g.won) {
    g.elapsed += dt;
    if (g.hintAt >= 0 && now > g.hintUntil) g.hintAt = -1;
  }
  render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
