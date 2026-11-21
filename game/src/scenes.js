// scenes.js — the five night-market scenes, drawn flat-vector in code.
// Each scene draws in a 600 x 500 space. drawScene(ctx, index, variant, ox, oy)
// draws the scene at offset (ox, oy); variant 0 is the original, variant 1 the
// changed panel. DIFFS lists the 10 fair differences per scene with their
// click targets; moved diffs carry x2/y2 (the new spot).

import { rr, circle, starField, lantern, stall, stringLights, cat, kite, bamboo, teapot, firework } from './draw.js';

function nightSky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 500);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 500);
}

function cobbles(ctx, y0, base, dot) {
  ctx.fillStyle = base;
  ctx.fillRect(0, y0, 600, 500 - y0);
  ctx.fillStyle = dot;
  for (let y = y0 + 14; y < 500; y += 22) {
    for (let x = (y % 44 ? 8 : 24); x < 600; x += 34) {
      ctx.beginPath();
      ctx.ellipse(x, y, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ---- Scene 1: The Lantern Stalls -----------------------------------------
function drawStalls(ctx, v) {
  nightSky(ctx, '#241640', '#4a2a6b');
  starField(ctx, 11, 46, 0, 0, 600, 190);
  // moon (moved in variant 1)
  const mx = v ? 468 : 522;
  const my = v ? 86 : 54;
  ctx.fillStyle = '#f7e8b0';
  circle(ctx, mx, my, 26);
  ctx.fill();
  ctx.fillStyle = '#e8d28a';
  circle(ctx, mx - 8, my - 5, 6);
  ctx.fill();
  circle(ctx, mx + 9, my + 8, 4);
  ctx.fill();
  cobbles(ctx, 400, '#3a2f4a', '#4a3d5e');
  // string of lanterns across the top
  lantern(ctx, 90, 96, 20, v ? '#2a9d8f' : '#e4572e', 'rgba(255,120,60,0.35)');
  lantern(ctx, 170, 84, 16, '#f7c948', 'rgba(255,200,80,0.3)');
  lantern(ctx, 300, 96, 20, '#e4572e', 'rgba(255,120,60,0.35)');
  lantern(ctx, 430, 84, 16, '#f7c948', 'rgba(255,200,80,0.3)');
  if (v) lantern(ctx, 520, 122, 14, '#f7c948', 'rgba(255,200,80,0.3)');
  // flag on stall 2 (flipped in variant 1)
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  if (v) {
    ctx.moveTo(380, 78);
    ctx.lineTo(352, 88);
    ctx.lineTo(380, 98);
  } else {
    ctx.moveTo(380, 78);
    ctx.lineTo(408, 88);
    ctx.lineTo(380, 98);
  }
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5a3a22';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(380, 78);
  ctx.lineTo(380, 120);
  ctx.stroke();
  // the three stalls
  stall(ctx, 20, 260, 180, ['#e4572e', '#fff3e0'], '茶', v ? '#f7c948' : '#ffd166');
  stall(ctx, 220, 260, 180, v ? ['#2a9d8f', '#2a9d8f'] : ['#2a9d8f', '#fff3e0'], '灯', '#ffd166');
  stall(ctx, 420, 260, 180, ['#f7c948', '#fff3e0'], '食', '#ffd166');
  // goods on the counters
  ctx.fillStyle = v ? '#7fb069' : '#f4842c';
  for (const [ox, oy] of [[0, 0], [16, -4], [32, 0], [8, -10], [24, -10]]) {
    circle(ctx, 108 + ox, 372 + oy, 9);
    ctx.fill();
  }
  ctx.fillStyle = '#c0392b';
  for (const [ox, oy] of [[0, 0], [16, -4], [32, 0], [8, -10]]) {
    circle(ctx, 296 + ox, 374 + oy, 9);
    ctx.fill();
  }
  ctx.fillStyle = '#e8c88a';
  for (const [ox, oy] of [[0, 0], [18, -3], [36, 0]]) {
    circle(ctx, 492 + ox, 374 + oy, 10);
    ctx.fill();
  }
  // paper crane on stall 2 counter (bigger in variant 1)
  const cs = v ? 1.7 : 1;
  ctx.save();
  ctx.translate(252, 352);
  ctx.scale(cs, cs);
  ctx.fillStyle = '#fff3e0';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(14, 4);
  ctx.lineTo(-12, 8);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-10, -14);
  ctx.lineTo(4, -2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  // cat on stall 3 roof (gone in variant 1)
  if (!v) cat(ctx, 452, 252, 14);
  // one extra star in variant 1
  if (v) {
    ctx.fillStyle = '#ffe9a8';
    circle(ctx, 200, 45, 2.4);
    ctx.fill();
  }
}

const DIFFS_STALLS = [
  { x: 90, y: 96, r: 24, kind: 'recoloured', label: 'red lantern turned teal' },
  { x: 310, y: 278, r: 22, kind: 'removed', label: 'awning stripe gone' },
  { x: 520, y: 122, r: 18, kind: 'added', label: 'extra lantern' },
  { x: 180, y: 205, r: 18, kind: 'recoloured', label: 'sign character re-inked' },
  { x: 452, y: 252, r: 24, kind: 'removed', label: 'roof cat gone' },
  { x: 495, y: 70, x2: 468, y2: 86, r: 40, kind: 'moved', label: 'moon moved' },
  { x: 124, y: 368, r: 22, kind: 'recoloured', label: 'oranges turned green' },
  { x: 380, y: 88, r: 20, kind: 'flipped', label: 'flag points the other way' },
  { x: 252, y: 352, r: 22, kind: 'resized', label: 'paper crane grew' },
  { x: 200, y: 45, r: 14, kind: 'added', label: 'extra star' },
];

// ---- Scene 2: The Dumpling Cart ------------------------------------------
function drawCart(ctx, v) {
  nightSky(ctx, '#2b1630', '#5a2a44');
  starField(ctx, 23, 34, 0, 0, 600, 160);
  lantern(ctx, 80, 82, 24, v ? '#f7c948' : '#e4572e', 'rgba(255,120,60,0.4)');
  // wall and string lights
  ctx.fillStyle = '#3d2138';
  ctx.fillRect(0, 200, 600, 300);
  stringLights(ctx, 130, 60, 560, 52, 9);
  // canopy over the cart
  ctx.fillStyle = '#e4572e';
  ctx.beginPath();
  ctx.moveTo(140, 190);
  ctx.lineTo(460, 190);
  ctx.lineTo(480, 150);
  ctx.lineTo(120, 150);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#fff3e0';
  for (let i = 0; i < 5; i++) {
    const x0 = 140 + i * 64;
    ctx.beginPath();
    ctx.moveTo(x0, 190);
    ctx.lineTo(x0 + 32, 190);
    ctx.lineTo(x0 + 26, 150);
    ctx.lineTo(x0 + 6, 150);
    ctx.closePath();
    ctx.fill();
  }
  // one canopy stripe flips in variant 1
  ctx.fillStyle = v ? '#e4572e' : '#fff3e0';
  ctx.beginPath();
  ctx.moveTo(172, 190);
  ctx.lineTo(204, 190);
  ctx.lineTo(198, 150);
  ctx.lineTo(178, 150);
  ctx.closePath();
  ctx.fill();
  // cart body
  ctx.fillStyle = '#7a4a26';
  rr(ctx, 150, 300, 300, 120, 10);
  ctx.fill();
  ctx.fillStyle = '#8f5a30';
  ctx.fillRect(150, 300, 300, 10);
  // wheels (one loses a spoke in variant 1)
  for (const wx of [195, 405]) {
    ctx.fillStyle = '#2b1b10';
    circle(ctx, wx, 432, 24);
    ctx.fill();
    ctx.strokeStyle = '#d9a066';
    ctx.lineWidth = 3;
    const spokes = wx === 405 && v ? 5 : 6;
    for (let i = 0; i < spokes; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(wx, 432);
      ctx.lineTo(wx + Math.cos(a) * 20, 432 + Math.sin(a) * 20);
      ctx.stroke();
    }
    ctx.fillStyle = '#f7c948';
    circle(ctx, wx, 432, 5);
    ctx.fill();
  }
  // steamer baskets
  for (let i = 0; i < 3; i++) {
    const y = 300 - i * 26;
    ctx.fillStyle = i === 1 && v ? '#4a2c14' : '#c89b5a';
    rr(ctx, 268, y - 24, 64, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#8a6a3a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(268, y - 12);
    ctx.lineTo(332, y - 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#8a6a3a';
  ctx.beginPath();
  ctx.ellipse(300, 222, 32, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  // steam curls (one extra in variant 1)
  ctx.strokeStyle = 'rgba(255,243,224,0.75)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const [sx, sy] of [[288, 205], [306, 195], [318, 208]]) {
    ctx.beginPath();
    ctx.moveTo(sx, sy + 12);
    ctx.quadraticCurveTo(sx - 8, sy, sx + 4, sy - 12);
    ctx.stroke();
  }
  if (v) {
    ctx.beginPath();
    ctx.moveTo(330, 200);
    ctx.quadraticCurveTo(322, 188, 334, 176);
    ctx.stroke();
  }
  // bowls on the counter (one gone in variant 1)
  ctx.fillStyle = '#2a9d8f';
  ctx.beginPath();
  ctx.ellipse(205, 322, 26, 12, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillRect(179, 322, 52, 10);
  if (!v) {
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.ellipse(398, 322, 26, 12, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(372, 322, 52, 10);
  }
  // chopstick cup (three sticks in variant 1)
  ctx.fillStyle = '#fff3e0';
  rr(ctx, 246, 330, 22, 26, 4);
  ctx.fill();
  ctx.strokeStyle = '#b8452e';
  ctx.lineWidth = 3;
  for (const [cx, tilt] of [[252, -0.12], [260, 0.1]]) {
    ctx.beginPath();
    ctx.moveTo(cx, 332);
    ctx.lineTo(cx + tilt * 60, 300);
    ctx.stroke();
  }
  if (v) {
    ctx.beginPath();
    ctx.moveTo(256, 332);
    ctx.lineTo(256, 298);
    ctx.stroke();
  }
  // menu board (price digit changes in variant 1)
  ctx.fillStyle = '#2b1b4d';
  rr(ctx, 470, 150, 96, 90, 8);
  ctx.fill();
  ctx.strokeStyle = '#f7c948';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#ffd166';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('DUMPLING', 518, 176);
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText(v ? '9' : '8', 518, 214);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = '#fff3e0';
  ctx.fillText('coins a basket', 518, 232);
  // small wall lantern (added in variant 1)
  if (v) lantern(ctx, 520, 330, 13, '#f7c948', 'rgba(255,200,80,0.3)');
  // cat under the cart (gone in variant 1)
  if (!v) cat(ctx, 300, 462, 13);
  cobbles(ctx, 452, '#33263e', '#423450');
}

const DIFFS_CART = [
  { x: 80, y: 82, r: 26, kind: 'recoloured', label: 'big lantern turned gold' },
  { x: 256, y: 316, r: 18, kind: 'added', label: 'third chopstick' },
  { x: 398, y: 322, r: 20, kind: 'removed', label: 'red bowl gone' },
  { x: 330, y: 190, r: 20, kind: 'added', label: 'extra steam puff' },
  { x: 518, y: 200, r: 22, kind: 'recoloured', label: 'menu price 8 became 9' },
  { x: 405, y: 432, r: 24, kind: 'removed', label: 'wheel lost a spoke' },
  { x: 300, y: 462, r: 22, kind: 'removed', label: 'cat under the cart gone' },
  { x: 300, y: 262, r: 24, kind: 'recoloured', label: 'steamer tier darkened' },
  { x: 188, y: 170, r: 20, kind: 'flipped', label: 'canopy stripe flipped' },
  { x: 520, y: 330, r: 18, kind: 'added', label: 'wall lantern added' },
];

// ---- Scene 3: The Paper Kite Shop ----------------------------------------
function drawKites(ctx, v) {
  nightSky(ctx, '#1f2a4d', '#3d4a7a');
  starField(ctx, 37, 30, 0, 0, 600, 140);
  // shop wall and door
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(0, 120, 600, 380);
  ctx.fillStyle = '#54371f';
  ctx.fillRect(0, 120, 600, 14);
  // window with shutter (closed in variant 1)
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(60, 180, 110, 110);
  ctx.strokeStyle = '#3a2410';
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 180, 110, 110);
  ctx.beginPath();
  ctx.moveTo(115, 180);
  ctx.lineTo(115, 290);
  ctx.moveTo(60, 235);
  ctx.lineTo(170, 235);
  ctx.stroke();
  if (v) {
    ctx.fillStyle = '#8a5a30';
    ctx.fillRect(60, 180, 110, 110);
  }
  // door
  ctx.fillStyle = '#3a2410';
  rr(ctx, 260, 170, 110, 230, 8);
  ctx.fill();
  ctx.fillStyle = '#7a4a26';
  rr(ctx, 268, 178, 94, 214, 6);
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  circle(ctx, 348, 290, 5);
  ctx.fill();
  // sign above the door (re-inked in variant 1)
  ctx.fillStyle = '#2b1b4d';
  rr(ctx, 230, 128, 170, 36, 8);
  ctx.fill();
  ctx.strokeStyle = '#f7c948';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = v ? '#7fb069' : '#ffd166';
  ctx.font = 'bold 22px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('风 筝', 315, 147);
  // kites hanging from the awning
  kite(ctx, 150, 150, 30, v ? '#2a6db0' : '#e4572e', 3);
  // fish kite (tail loses a bow in variant 1)
  ctx.save();
  ctx.translate(430, 140);
  ctx.fillStyle = '#f7c948';
  ctx.beginPath();
  ctx.ellipse(0, 0, 34, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(30, 0);
  ctx.lineTo(48, -12);
  ctx.lineTo(48, 12);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1d1426';
  if (!v) circle(ctx, -16, -4, 3);
  ctx.fill();
  ctx.strokeStyle = '#e4572e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-32, 0);
  ctx.quadraticCurveTo(-52, 20, -60, 44);
  ctx.stroke();
  const bows = v ? 2 : 3;
  for (let i = 0; i < bows; i++) {
    ctx.fillStyle = i % 2 ? '#2a9d8f' : '#e4572e';
    ctx.beginPath();
    ctx.moveTo(-46 - i * 8, 14 + i * 14);
    ctx.lineTo(-38 - i * 8, 14 + i * 14);
    ctx.lineTo(-42 - i * 8, 22 + i * 14);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  // bird kite (eye gone in variant 1)
  ctx.save();
  ctx.translate(520, 150);
  ctx.fillStyle = '#7fb069';
  ctx.beginPath();
  ctx.ellipse(0, 0, 26, 12, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-20, -4);
  ctx.quadraticCurveTo(-44, -18, -52, -6);
  ctx.quadraticCurveTo(-38, 0, -20, 2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#1d1426';
  if (!v) circle(ctx, 14, -4, 2.5);
  ctx.fill();
  ctx.restore();
  // extra small kite (added in variant 1)
  if (v) kite(ctx, 96, 96, 14, '#e4572e', 1);
  // shelf with paper rolls
  ctx.fillStyle = '#54371f';
  ctx.fillRect(60, 380, 480, 12);
  for (const [rx, col] of [[90, '#fff3e0'], [150, v ? '#f4a7b9' : '#fff3e0'], [210, '#e8c88a'], [270, '#fff3e0']]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(rx, 368, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#c9a86a';
    circle(ctx, rx, 368, 5);
    ctx.fill();
  }
  // spool of string (gone in variant 1)
  if (!v) {
    ctx.fillStyle = '#2a9d8f';
    circle(ctx, 350, 368, 14);
    ctx.fill();
    ctx.strokeStyle = '#fff3e0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 368);
    ctx.lineTo(380, 400);
    ctx.stroke();
  }
  // scissors on the counter (flipped in variant 1)
  ctx.save();
  ctx.translate(450, 396);
  ctx.scale(v ? -1 : 1, 1);
  ctx.strokeStyle = '#c0c8d0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(26, -14);
  ctx.moveTo(0, 0);
  ctx.lineTo(26, 12);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-4, -4, 5, 0, Math.PI * 2);
  ctx.arc(-4, 8, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
  // paper scrap on the ground (added in variant 1)
  if (v) {
    ctx.fillStyle = '#fff3e0';
    ctx.save();
    ctx.translate(180, 462);
    ctx.rotate(0.5);
    ctx.fillRect(-12, -8, 24, 16);
    ctx.restore();
  }
  cobbles(ctx, 430, '#33304a', '#423e5a');
}

const DIFFS_KITES = [
  { x: 150, y: 150, r: 26, kind: 'recoloured', label: 'diamond kite turned blue' },
  { x: 390, y: 172, r: 22, kind: 'removed', label: 'fish kite lost a tail bow' },
  { x: 350, y: 368, r: 20, kind: 'removed', label: 'string spool gone' },
  { x: 450, y: 396, r: 20, kind: 'flipped', label: 'scissors flipped' },
  { x: 96, y: 96, r: 18, kind: 'added', label: 'tiny kite added' },
  { x: 115, y: 235, r: 26, kind: 'recoloured', label: 'window shutter closed' },
  { x: 150, y: 368, r: 18, kind: 'recoloured', label: 'paper roll turned pink' },
  { x: 534, y: 146, r: 14, kind: 'removed', label: 'bird kite lost its eye' },
  { x: 315, y: 147, r: 20, kind: 'recoloured', label: 'shop sign re-inked green' },
  { x: 180, y: 462, r: 16, kind: 'added', label: 'paper scrap on the ground' },
];

// ---- Scene 4: The Tea House Steps ----------------------------------------
function drawTea(ctx, v) {
  nightSky(ctx, '#1d2b3a', '#3a4a5e');
  starField(ctx, 51, 36, 0, 0, 600, 170);
  // cherry blossom branch, top right
  ctx.strokeStyle = '#4a2a3a';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(600, 20);
  ctx.quadraticCurveTo(520, 60, 470, 40);
  ctx.stroke();
  ctx.fillStyle = '#f4a7b9';
  for (const [bx, by] of [[540, 46], [510, 60], [560, 70], [490, 44], [530, 84]]) {
    circle(ctx, bx, by, 9);
    ctx.fill();
  }
  if (v) {
    circle(ctx, 556, 92, 6);
    ctx.fill();
  }
  // bamboo on the left (one stalk gone in variant 1)
  bamboo(ctx, 52, 150, 430, 8);
  if (!v) bamboo(ctx, 92, 190, 430, 7);
  bamboo(ctx, 130, 170, 430, 8);
  // tea house at the top
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(200, 90, 200, 120);
  ctx.fillStyle = '#7a4a26';
  ctx.beginPath();
  ctx.moveTo(180, 96);
  ctx.lineTo(420, 96);
  ctx.lineTo(400, 60);
  ctx.lineTo(200, 60);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(250, 120, 100, 60);
  ctx.strokeStyle = '#3a2410';
  ctx.lineWidth = 4;
  ctx.strokeRect(250, 120, 100, 60);
  ctx.beginPath();
  ctx.moveTo(300, 120);
  ctx.lineTo(300, 180);
  ctx.moveTo(250, 150);
  ctx.lineTo(350, 150);
  ctx.stroke();
  ctx.fillStyle = '#2b1b4d';
  rr(ctx, 500, 100, 66, 44, 6);
  ctx.fill();
  ctx.fillStyle = v ? '#7fb069' : '#ffd166';
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('茶 屋', 533, 123);
  // stone steps
  ctx.fillStyle = '#8a8494';
  for (let i = 0; i < 5; i++) {
    const y = 220 + i * 36;
    const w = 200 - i * 14;
    rr(ctx, 300 - w / 2, y, w, 34, 4);
    ctx.fill();
    ctx.fillStyle = v && i === 3 ? '#a86a5a' : '#8a8494';
    ctx.fillRect(300 - w / 2, y, w, 34);
  }
  // lantern posts (one lantern gone, one re-inked in variant 1)
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(96, 230, 8, 130);
  ctx.fillRect(496, 230, 8, 130);
  lantern(ctx, 100, 208, 18, v ? '#2a9d8f' : '#e4572e', 'rgba(255,120,60,0.3)');
  if (!v) lantern(ctx, 500, 208, 18, '#e4572e', 'rgba(255,120,60,0.3)');
  // stone lantern (lit in variant 1)
  ctx.fillStyle = '#6a6474';
  ctx.fillRect(172, 320, 16, 60);
  ctx.fillRect(160, 300, 40, 20);
  ctx.fillRect(156, 380, 48, 10);
  if (v) {
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(168, 322, 24, 14);
    ctx.fill();
  } else {
    ctx.fillStyle = '#3a3444';
    ctx.fillRect(168, 322, 24, 14);
    ctx.fill();
  }
  // stone table with teapot and cups
  ctx.fillStyle = '#6a6474';
  rr(ctx, 240, 380, 140, 16, 4);
  ctx.fill();
  ctx.fillRect(258, 396, 12, 40);
  ctx.fillRect(350, 396, 12, 40);
  teapot(ctx, 292, 356, 20, v);
  ctx.fillStyle = '#2a9d8f';
  for (const cx of [336, 358]) {
    if (cx === 358 && v) continue; // one cup gone in variant 1
    ctx.beginPath();
    ctx.ellipse(cx, 372, 9, 5, 0, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(cx - 9, 372, 18, 8);
  }
  // cat on a step (gone in variant 1)
  if (!v) cat(ctx, 420, 322, 13);
  cobbles(ctx, 430, '#2e2a3a', '#3d3848');
}

const DIFFS_TEA = [
  { x: 292, y: 356, r: 24, kind: 'flipped', label: 'teapot spout swapped sides' },
  { x: 358, y: 374, r: 16, kind: 'removed', label: 'a tea cup gone' },
  { x: 100, y: 208, r: 22, kind: 'recoloured', label: 'post lantern turned teal' },
  { x: 500, y: 208, r: 22, kind: 'removed', label: 'right post lantern gone' },
  { x: 420, y: 322, r: 22, kind: 'removed', label: 'cat on the step gone' },
  { x: 556, y: 92, r: 16, kind: 'added', label: 'extra blossom petal' },
  { x: 92, y: 300, r: 20, kind: 'removed', label: 'a bamboo stalk gone' },
  { x: 533, y: 123, r: 20, kind: 'recoloured', label: 'tea house sign re-inked' },
  { x: 180, y: 330, r: 22, kind: 'recoloured', label: 'stone lantern lit' },
  { x: 300, y: 340, r: 20, kind: 'recoloured', label: 'a step stone turned rust' },
];

// ---- Scene 5: The Firework Alley -----------------------------------------
function drawFireworks(ctx, v) {
  nightSky(ctx, '#160f2e', '#3a1f5e');
  starField(ctx, 67, 40, 0, 0, 600, 150);
  // buildings left and right
  ctx.fillStyle = '#241a3a';
  ctx.fillRect(0, 180, 90, 320);
  ctx.fillRect(510, 180, 90, 320);
  // windows (one goes dark in variant 1)
  for (const [wx, wy, lit] of [[20, 210, true], [50, 260, true], [20, 310, true], [530, 210, true], [560, 260, v ? false : true], [530, 310, true]]) {
    ctx.fillStyle = lit ? '#ffd166' : '#3a2f4a';
    ctx.fillRect(wx, wy, 22, 28);
  }
  // fireworks in the sky
  firework(ctx, 300, 105, 42, v ? '#b388ff' : '#f7c948', 10);
  if (!v) firework(ctx, 452, 72, 28, '#e4572e', 8);
  firework(ctx, 150, 92, 26, '#2a9d8f', 8);
  if (v) firework(ctx, 196, 52, 16, '#f4a7b9', 6);
  // string lights across the alley
  stringLights(ctx, 90, 120, 510, 120, 10, (i) => !(v && i === 4));
  // banner across the alley (re-inked in variant 1)
  ctx.fillStyle = '#e4572e';
  rr(ctx, 180, 185, 240, 40, 8);
  ctx.fill();
  ctx.fillStyle = v ? '#7fb069' : '#ffd166';
  ctx.font = 'bold 24px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('夜 市', 300, 206);
  // rocket on a stick (gone in variant 1)
  if (!v) {
    ctx.strokeStyle = '#5a3a22';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(520, 330);
    ctx.lineTo(520, 280);
    ctx.stroke();
    ctx.fillStyle = '#e4572e';
    ctx.beginPath();
    ctx.moveTo(520, 252);
    ctx.lineTo(530, 282);
    ctx.lineTo(510, 282);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f7c948';
    circle(ctx, 520, 272, 4);
    ctx.fill();
  }
  // stalls at the bottom
  stall(ctx, 110, 330, 150, ['#e4572e', '#fff3e0'], null, null);
  stall(ctx, 340, 330, 150, ['#2a9d8f', '#fff3e0'], null, null);
  // extra lantern on the second stall (added in variant 1)
  if (v) lantern(ctx, 470, 320, 13, '#f7c948', 'rgba(255,200,80,0.3)');
  // crowd silhouettes
  ctx.fillStyle = '#120a24';
  for (const [cx, s] of [[150, 1], [185, 0.9], [215, 1.05]]) {
    circle(ctx, cx, 452 - 14 * s, 9 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, 478, 13 * s, 16 * s, 0, Math.PI, 0);
    ctx.fill();
  }
  for (const [cx, s] of [[380, 1], [415, 0.95], [450, 1.05]]) {
    if (cx === 415 && v) continue; // one person gone in variant 1
    circle(ctx, cx, 452 - 14 * s, 9 * s);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, 478, 13 * s, 16 * s, 0, Math.PI, 0);
    ctx.fill();
  }
  // puddle with a reflection (gone in variant 1)
  ctx.fillStyle = 'rgba(120,140,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(300, 468, 70, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!v) {
    ctx.fillStyle = 'rgba(247,201,72,0.5)';
    ctx.beginPath();
    ctx.ellipse(300, 468, 34, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  cobbles(ctx, 440, '#2a2140', '#382e52');
}

const DIFFS_FIREWORKS = [
  { x: 300, y: 105, r: 30, kind: 'recoloured', label: 'big firework turned purple' },
  { x: 452, y: 72, r: 26, kind: 'removed', label: 'red firework gone' },
  { x: 196, y: 52, r: 18, kind: 'added', label: 'small pink burst added' },
  { x: 262, y: 138, r: 14, kind: 'recoloured', label: 'a string bulb went dark' },
  { x: 520, y: 282, r: 20, kind: 'removed', label: 'rocket on a stick gone' },
  { x: 571, y: 274, r: 20, kind: 'recoloured', label: 'a window went dark' },
  { x: 300, y: 206, r: 20, kind: 'recoloured', label: 'banner re-inked green' },
  { x: 300, y: 468, r: 26, kind: 'removed', label: 'puddle reflection gone' },
  { x: 470, y: 320, r: 18, kind: 'added', label: 'extra stall lantern' },
  { x: 415, y: 462, r: 22, kind: 'removed', label: 'a person left the crowd' },
];

// ---- Registry -------------------------------------------------------------
export const SCENES = [
  { name: 'The Lantern Stalls', par: 150, diffs: DIFFS_STALLS, draw: drawStalls },
  { name: 'The Dumpling Cart', par: 150, diffs: DIFFS_CART, draw: drawCart },
  { name: 'The Paper Kite Shop', par: 150, diffs: DIFFS_KITES, draw: drawKites },
  { name: 'The Tea House Steps', par: 150, diffs: DIFFS_TEA, draw: drawTea },
  { name: 'The Firework Alley', par: 150, diffs: DIFFS_FIREWORKS, draw: drawFireworks },
];

export const SCENE_W = 600;
export const SCENE_H = 500;

export function drawScene(ctx, index, variant, ox, oy) {
  ctx.save();
  ctx.translate(ox, oy);
  ctx.beginPath();
  ctx.rect(0, 0, SCENE_W, SCENE_H);
  ctx.clip();
  SCENES[index].draw(ctx, variant);
  ctx.restore();
}
