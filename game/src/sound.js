// sound.js — tiny WebAudio chimes, no audio files, no network.

let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type, vol) {
  if (muted) return;
  const a = ac();
  if (!a) return;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type || 'sine';
  o.frequency.value = freq;
  const t = a.currentTime + start;
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

export const sfx = {
  find() {
    tone(660, 0, 0.14, 'sine', 0.14);
    tone(990, 0.09, 0.2, 'sine', 0.14);
  },
  wrong() {
    tone(160, 0, 0.22, 'sawtooth', 0.06);
    tone(120, 0.08, 0.2, 'sawtooth', 0.05);
  },
  hint() {
    tone(520, 0, 0.12, 'triangle', 0.1);
    tone(780, 0.08, 0.16, 'triangle', 0.1);
  },
  clear() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.22, 'sine', 0.13));
  },
  win() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.3, 'sine', 0.13));
  },
  click() {
    tone(440, 0, 0.06, 'sine', 0.07);
  },
  isMuted() {
    return muted;
  },
  toggleMute() {
    muted = !muted;
    return muted;
  },
};
