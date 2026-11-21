// draw.js — small canvas helpers shared by every night-market scene.
// Everything here is deterministic: fixed values only, no Math.random.

export function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

// Deterministic star field: same positions every run.
export function starField(ctx, seed, count, x0, y0, x1, y1) {
  let s = seed;
  const next = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const x = x0 + next() * (x1 - x0);
    const y = y0 + next() * (y1 - y0);
    const r = 0.8 + next() * 1.6;
    ctx.fillStyle = next() > 0.25 ? '#ffe9a8' : '#ffd166';
    ctx.globalAlpha = 0.5 + next() * 0.5;
    circle(ctx, x, y, r);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// A glowing paper lantern: round body, ribs, caps, tassel.
export function lantern(ctx, x, y, s, body, glow) {
  ctx.save();
  if (glow) {
    const g = ctx.createRadialGradient(x, y, s * 0.2, x, y, s * 1.7);
    g.addColorStop(0, glow);
    g.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = g;
    circle(ctx, x, y, s * 1.7);
    ctx.fill();
  }
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(x - s * 0.22, y - s * 1.05, s * 0.44, s * 0.16);
  ctx.fillRect(x - s * 0.22, y + s * 0.9, s * 0.44, s * 0.16);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.72, s * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 1.5;
  for (const dx of [-0.42, -0.18, 0.18, 0.42]) {
    ctx.beginPath();
    ctx.ellipse(x, y, s * 0.72 * Math.abs(dx) + s * 0.1, s * 0.95, 0, -Math.PI / 2.4, Math.PI / 2.4);
    ctx.stroke();
  }
  ctx.strokeStyle = '#f7c948';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + s * 1.05);
  ctx.lineTo(x, y + s * 1.35);
  ctx.stroke();
  ctx.fillStyle = '#f7c948';
  circle(ctx, x, y + s * 1.42, s * 0.1);
  ctx.fill();
  ctx.restore();
}

// A market stall: posts, striped awning, wooden counter.
export function stall(ctx, x, y, w, colors, signText, signColor) {
  const awnH = 34;
  ctx.fillStyle = '#5a3a22';
  ctx.fillRect(x + 6, y, 8, 150);
  ctx.fillRect(x + w - 14, y, 8, 150);
  // awning
  const stripes = 6;
  const sw = w / stripes;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(x + i * sw, y);
    ctx.lineTo(x + (i + 1) * sw, y);
    ctx.lineTo(x + (i + 1) * sw + 4, y + awnH);
    ctx.lineTo(x + i * sw + 4, y + awnH);
    ctx.closePath();
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(x, y + awnH - 4, w, 4);
  // counter
  ctx.fillStyle = '#7a4a26';
  rr(ctx, x - 4, y + 96, w + 8, 54, 6);
  ctx.fill();
  ctx.fillStyle = '#8f5a30';
  for (let px = x + 12; px < x + w; px += 26) ctx.fillRect(px, y + 104, 3, 38);
  // hanging sign
  if (signText) {
    ctx.fillStyle = '#2b1b4d';
    rr(ctx, x + w / 2 - 26, y + 40, 52, 44, 6);
    ctx.fill();
    ctx.strokeStyle = '#f7c948';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = signColor || '#ffd166';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(signText, x + w / 2, y + 63);
  }
}

// A string of small bulbs between two points.
export function stringLights(ctx, x1, y1, x2, y2, n, lit) {
  ctx.strokeStyle = '#1d1426';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo((x1 + x2) / 2, Math.max(y1, y2) + 26, x2, y2);
  ctx.stroke();
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const bx = x1 + (x2 - x1) * t;
    const by = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * (Math.max(y1, y2) + 26) + t * t * y2;
    const on = lit === undefined || lit(i);
    ctx.fillStyle = on ? '#ffd166' : '#4a3a5a';
    if (on) {
      const g = ctx.createRadialGradient(bx, by + 7, 1, bx, by + 7, 12);
      g.addColorStop(0, 'rgba(255,209,102,0.9)');
      g.addColorStop(1, 'rgba(255,209,102,0)');
      ctx.fillStyle = g;
      circle(ctx, bx, by + 7, 12);
      ctx.fill();
      ctx.fillStyle = '#ffd166';
    }
    circle(ctx, bx, by + 7, 4);
    ctx.fill();
  }
}

// A small cat silhouette sitting.
export function cat(ctx, x, y, s, color) {
  ctx.fillStyle = color || '#1d1426';
  ctx.beginPath();
  ctx.ellipse(x, y, s * 0.9, s * 0.7, 0, 0, Math.PI * 2);
  ctx.fill();
  circle(ctx, x + s * 0.55, y - s * 0.75, s * 0.55);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.25, y - s * 1.05);
  ctx.lineTo(x + s * 0.35, y - s * 1.5);
  ctx.lineTo(x + s * 0.6, y - s * 1.05);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.6, y - s * 1.05);
  ctx.lineTo(x + s * 0.75, y - s * 1.5);
  ctx.lineTo(x + s * 0.95, y - s * 1.0);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - s * 0.85, y + s * 0.3);
  ctx.quadraticCurveTo(x - s * 1.5, y - s * 0.2, x - s * 1.2, y - s * 0.9);
  ctx.quadraticCurveTo(x - s * 0.9, y - s * 0.4, x - s * 0.7, y + s * 0.35);
  ctx.closePath();
  ctx.fill();
}

// A diamond kite with a bow tail.
export function kite(ctx, x, y, s, color, tailBows) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(s * 0.75, 0);
  ctx.lineTo(0, s);
  ctx.lineTo(-s * 0.75, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.lineTo(0, s);
  ctx.moveTo(-s * 0.75, 0);
  ctx.lineTo(s * 0.75, 0);
  ctx.stroke();
  ctx.strokeStyle = '#3a2410';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, s);
  ctx.quadraticCurveTo(s * 0.2, s * 1.8, 0, s * 2.4);
  ctx.stroke();
  for (let i = 0; i < tailBows; i++) {
    const ty = s * (1.3 + i * 0.45);
    ctx.fillStyle = i % 2 ? '#ffd166' : '#e4572e';
    ctx.beginPath();
    ctx.moveTo(-6, ty - 4);
    ctx.lineTo(6, ty - 4);
    ctx.lineTo(0, ty + 5);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// A bamboo stalk with leaves.
export function bamboo(ctx, x, yTop, yBottom, w) {
  ctx.strokeStyle = '#2e7d4f';
  ctx.lineWidth = w;
  ctx.beginPath();
  ctx.moveTo(x, yBottom);
  ctx.lineTo(x, yTop);
  ctx.stroke();
  ctx.strokeStyle = '#1f5c39';
  ctx.lineWidth = 1.5;
  for (let y = yTop + 24; y < yBottom; y += 30) {
    ctx.beginPath();
    ctx.moveTo(x - w / 2, y);
    ctx.lineTo(x + w / 2, y);
    ctx.stroke();
  }
  ctx.fillStyle = '#3a9e63';
  for (const [lx, ly, a] of [[-14, -30, -0.7], [12, -55, 0.7], [-10, -80, -0.6]]) {
    ctx.save();
    ctx.translate(x + lx, yTop - ly * 0 + ly);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// A paper teapot: body, lid, spout, handle. spoutLeft flips the spout side.
export function teapot(ctx, x, y, s, spoutLeft) {
  ctx.fillStyle = '#b8452e';
  ctx.beginPath();
  ctx.ellipse(x, y, s, s * 0.72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8f2f1d';
  ctx.beginPath();
  ctx.ellipse(x, y - s * 0.68, s * 0.45, s * 0.18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f7c948';
  circle(ctx, x, y - s * 0.82, s * 0.12);
  ctx.fill();
  const dir = spoutLeft ? -1 : 1;
  ctx.strokeStyle = '#b8452e';
  ctx.lineWidth = s * 0.3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + dir * s * 0.8, y - s * 0.1);
  ctx.quadraticCurveTo(x + dir * s * 1.5, y - s * 0.5, x + dir * s * 1.45, y - s * 0.95);
  ctx.stroke();
  ctx.strokeStyle = '#8f2f1d';
  ctx.lineWidth = s * 0.22;
  ctx.beginPath();
  ctx.moveTo(x - dir * s * 0.85, y - s * 0.3);
  ctx.quadraticCurveTo(x - dir * s * 1.5, y, x - dir * s * 0.9, y + s * 0.4);
  ctx.stroke();
}

// A firework burst: radial streaks.
export function firework(ctx, x, y, r, color, arms) {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  for (let i = 0; i < arms; i++) {
    const a = (i / arms) * Math.PI * 2;
    const len = r * (0.7 + ((i * 37) % 10) / 28);
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * r * 0.25, y + Math.sin(a) * r * 0.25);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
    ctx.fillStyle = color;
    circle(ctx, x + Math.cos(a) * len, y + Math.sin(a) * len, 2.5);
    ctx.fill();
  }
  ctx.fillStyle = '#fff3c4';
  circle(ctx, x, y, 4);
  ctx.fill();
  ctx.restore();
}
