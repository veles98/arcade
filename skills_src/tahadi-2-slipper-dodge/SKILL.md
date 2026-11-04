---
name: tahadi-2-slipper-dodge
description: Build «اهرب من الشبشب» (Dodge the Slipper), a polished one-file Arabic mobile web game. Slippers fly at a cartoon kid and the player drags a finger to dodge them, with near-miss combos, dates as bonus pickups, five funny family stages that get harder, hit-stop, screen shake, particles and a game-over card worth sharing. Use when the user asks for the slipper game, «اهرب من الشبشب», «لعبة الشبشب», or a phone dodge game like it.
---

# اهرب من الشبشب (Dodge the Slipper)

Build this exact game as ONE self-contained HTML file. It was built and play-tested on a phone screen (430x932) with real touch input. The reference implementation at the end is the tested version: deliver that game so it plays the same.

## The game at a glance
- A cute round kid's face (sticker style, his eyes follow the danger) stands on a living-room rug. Slippers are thrown at him from the edges of the screen.
- Before every throw a white speech bubble with "!" pops up at the edge it will come from (a silent "mum shouting"), with a ring that fills up. Then the slipper flies in, spinning, aimed at where the kid is heading.
- Drag anywhere on the screen and the kid follows your finger (relative drag x1.35, so the finger never covers him). A mouse moves him directly; arrow keys and WASD work too.
- One hit and the game is over.

## Rules (keep these numbers)
- Score: +10 per second alive. A near miss (a slipper passes within 22 px of a hit without touching) gives +20 x combo. The combo grows when near misses come less than 2.4 s apart, up to x5. Every near miss: 0.16 s of slow motion (0.4x), sparkles, a gold word (قريبة! / يا ساتر! / فاتتك! / نجوت!) and a combo chip next to the score.
- Dates (تمرة) appear every 4.5 to 7.5 s and stay 6 s: +50 with a gold burst.
- Stages, each announced by a banner: 7 s «بدأت تعصب!» (fast coral slippers), 15 s «جابت الفردة الثانية!» (two at once), 24 s «الجدة دخلت!» (teal slippers that curve toward you for 0.95 s), 34 s «أبوك دخل الخط!» (big brown slippers and fans of three), 46 s «العيلة كلها عليك!».
- Difficulty ramps over 55 s: throw interval 1.05 s to 0.46 s, warning time 0.74 s to 0.42 s, speed 310 to 540 px/s (scaled to the screen size).
- Fair hitbox: the kid's circle x0.78 against two circles along the slipper.
- When hit: a 0.16 s freeze (hit-stop), white flash, strong shake, knock-back, X eyes and dizzy stars, a stamp «جاك الشبشب!», 1 s of slow motion, then the game-over card.
- Game-over card: the score counts up, «صمدت N ثانية», «نجوت بأعجوبة: N», «رقم قياسي جديد!» with confetti when the best is beaten, the best score, and two buttons: «مرة ثانية» and «تحدّ صاحبك» (Web Share, or copies the text when sharing is not available).
- Best score and mute are saved in localStorage inside try/catch. The game pauses when the tab is hidden.
- 60 fps on phones: sprites are drawn once to off-screen canvases, physics runs in fixed 120 Hz sub-steps, device pixel ratio is capped at 2.

## Look
- Colours: ink #0B0A0E, plum #2B1D30, coral #F06445, gold #D8B25A, paper #F3EFE6. Font: Alexandria from Google Fonts, with system Arabic fonts as fallback.
- Right-to-left Arabic interface, numbers in Western digits, no emoji anywhere.
- Sounds are made with Web Audio (no files) and kept quiet. A mute button sits at the top left.

## How to build it
1. Output the reference implementation below as one HTML file (an artifact named «اهرب من الشبشب», or `index.html`). Do not shorten it, do not "simplify" it, do not split it into several files.
2. Change only what the user asks for: names, colours, the thrown object, the language of the text. Keep every rule and number above.
3. For a different thrown object (shoes, tomatoes, emails), change the drawing in `buildSprites()` and the words, nothing else.
4. Before handing it over, check: the start screen shows the title and a pulsing «ابدأ»; dragging moves the kid; standing still loses within about 3 s; the game-over card appears; «مرة ثانية» starts a new game.

## In ChatGPT or another assistant
Same instructions: return the full file below in one code block, so the user can save it as `index.html` and open it on the phone.

## Reference implementation (complete and tested: copy it exactly)

```html
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0B0A0E">
<title>اهرب من الشبشب</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Alexandria:wght@400;700;800;900&display=swap" rel="stylesheet">
<style>
:root{--ink:#0B0A0E;--plum:#2B1D30;--coral:#F06445;--gold:#D8B25A;--paper:#F3EFE6}
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{height:100%;background:#0B0A0E;overflow:hidden;overscroll-behavior:none}
body{font-family:Alexandria,"Segoe UI",Tahoma,system-ui,sans-serif;color:var(--paper);-webkit-user-select:none;user-select:none;touch-action:none;-webkit-touch-callout:none}
#c{position:fixed;inset:0;width:100%;height:100%;display:block;touch-action:none}
#hud{position:fixed;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top,0px) + 14px) 14px 0;pointer-events:none;text-align:center;opacity:0}
#score{font-weight:900;font-size:56px;line-height:1;direction:ltr;display:inline-block;text-shadow:0 4px 0 rgba(0,0,0,.4),0 0 26px rgba(216,178,90,.35)}
#sub{margin-top:6px;font-size:13px;font-weight:700;opacity:.7}
#sub b{color:var(--gold);font-weight:900}
#sw{position:relative;display:inline-block;direction:ltr}
#combo{position:absolute;left:100%;top:8px;margin-left:8px;background:var(--gold);color:var(--ink);font-weight:900;font-size:22px;border-radius:999px;padding:2px 12px 6px;opacity:0;direction:ltr;pointer-events:none}
.ib{position:fixed;top:calc(env(safe-area-inset-top,0px) + 14px);width:44px;height:44px;border-radius:14px;border:0;background:rgba(255,255,255,.09);display:grid;place-items:center;cursor:pointer;z-index:5}
.ib svg{width:22px;height:22px;fill:none;stroke:var(--paper);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
#muteBtn{left:14px}#pauseBtn{left:66px}
.screen{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;text-align:center;padding:24px}
.hidden{display:none!important}
#menu{justify-content:space-between;padding:calc(env(safe-area-inset-top,0px) + 12vh) 24px calc(env(safe-area-inset-bottom,0px) + 7vh);background:radial-gradient(ellipse 80% 60% at 50% 50%,rgba(11,10,14,0),rgba(11,10,14,.45))}
.logo{font-weight:900;line-height:1.08}
.logo .l1{display:block;font-size:min(38px,10vw);color:var(--paper)}
.logo .l2{display:block;font-size:min(78px,18.5vw);color:var(--coral);text-shadow:0 7px 0 #7a2416,0 0 44px rgba(240,100,69,.45)}
.bottom{display:flex;flex-direction:column;align-items:center}
.hint{display:flex;align-items:center;gap:16px;font-size:15px;font-weight:700;background:rgba(11,10,14,.7);border:1px solid rgba(255,255,255,.12);padding:9px 16px 12px;border-radius:16px}
.hint .dot{width:16px;height:16px;border-radius:50%;background:var(--paper);box-shadow:0 0 0 5px rgba(243,239,230,.18)}
.btn{font-family:inherit;font-weight:900;font-size:28px;border:0;border-radius:999px;padding:13px 64px 20px;background:var(--coral);color:#fff;box-shadow:0 6px 0 #9c3420,0 16px 34px rgba(240,100,69,.35);cursor:pointer;margin-top:18px;touch-action:manipulation}
.btn:active{transform:translateY(4px);box-shadow:0 2px 0 #9c3420}
.btn.ghost{background:rgba(255,255,255,.1);box-shadow:none;color:var(--paper)}
.best{margin-top:14px;font-size:15px;opacity:.8;font-weight:700}
.best b,.bestl b{color:var(--gold);font-weight:900}
#over,#pause{justify-content:center;background:rgba(11,10,14,.5)}
.card{width:min(360px,92vw);background:linear-gradient(170deg,#2B1D30,#140e17);border:2px solid rgba(240,100,69,.75);border-radius:30px;padding:22px 18px 20px;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.card h2{font-size:34px;font-weight:900;color:var(--coral);line-height:1.3}
.big{font-size:80px;font-weight:900;color:var(--gold);line-height:1.1;direction:ltr;margin:4px 0 6px;text-shadow:0 0 30px rgba(216,178,90,.35)}
.stats{font-size:15px;font-weight:700;opacity:.85;line-height:1.7}
.stats b{font-weight:900}
.rec{display:inline-block;margin-top:10px;background:var(--gold);color:var(--ink);font-weight:900;border-radius:999px;padding:4px 16px 8px;font-size:16px}
.bestl{margin-top:10px;font-size:14px;opacity:.8;font-weight:700}
.row{display:flex;gap:10px;margin-top:18px}
.row .btn{flex:1;margin:0;font-size:19px;padding:13px 8px 17px;white-space:nowrap}
#banner{position:fixed;left:50%;top:27%;font-weight:900;font-size:min(30px,7.6vw);white-space:nowrap;background:rgba(11,10,14,.86);border:2px solid var(--gold);color:var(--gold);border-radius:18px;padding:7px 20px 12px;opacity:0;pointer-events:none;transform:translate(-50%,-50%)}
#stamp{position:fixed;left:50%;top:40%;font-weight:900;font-size:min(40px,9.5vw);color:#fff;background:var(--coral);padding:2px 20px 11px;border-radius:20px;border:3px solid #fff;box-shadow:0 10px 0 rgba(0,0,0,.35);white-space:nowrap;opacity:0;pointer-events:none;transform:translate(-50%,-50%)}
#toast{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 26px);transform:translateX(-50%);background:rgba(11,10,14,.92);border:1px solid rgba(255,255,255,.15);padding:10px 16px 13px;border-radius:14px;font-size:15px;font-weight:700;opacity:0;pointer-events:none;white-space:nowrap;z-index:9}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hud"><div id="sw"><span id="score">0</span><span id="combo">×2</span></div><div id="sub">أفضل نتيجة <b id="bestH">0</b></div></div>
<button class="ib" id="muteBtn" aria-label="الصوت"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path id="wav" d="M16.5 8.5a5 5 0 0 1 0 7M19.2 5.8a8.8 8.8 0 0 1 0 12.4"/><path id="xx" d="M16.5 9.5l5 5M21.5 9.5l-5 5"/></svg></button>
<button class="ib hidden" id="pauseBtn" aria-label="إيقاف مؤقت"><svg viewBox="0 0 24 24"><path d="M9 5.5v13M15 5.5v13"/></svg></button>
<div id="banner"></div>
<div id="stamp">جاك الشبشب!</div>
<div id="menu" class="screen">
  <div class="logo" id="logo"><span class="l1">اهرب من</span><span class="l2">الشبشب</span></div>
  <div class="bottom">
    <div class="hint"><span class="dot" id="hintDot"></span>اسحب إصبعك وتفادى الشباشب</div>
    <button class="btn" id="startBtn">ابدأ</button>
    <div class="best">أفضل نتيجة: <b id="bestM">0</b></div>
  </div>
</div>
<div id="over" class="screen hidden">
  <div class="card" id="card">
    <h2>جاك الشبشب!</h2>
    <div class="big" id="ovScore">0</div>
    <div class="stats">صمدت <b id="ovTime">0</b> ثانية<br>نجوت بأعجوبة: <b id="ovNear">0</b></div>
    <div class="rec hidden" id="rec">رقم قياسي جديد!</div>
    <div class="bestl">أفضل نتيجة: <b id="ovBest">0</b></div>
    <div class="row"><button class="btn" id="againBtn">مرة ثانية</button><button class="btn ghost" id="shareBtn">تحدّ صاحبك</button></div>
  </div>
</div>
<div id="pause" class="screen hidden"><div class="card"><h2 style="color:var(--paper)">متوقف</h2><div class="row"><button class="btn" id="resumeBtn">كمّل</button><button class="btn ghost" id="quitBtn">من جديد</button></div></div></div>
<div id="toast"></div>
<script>
(() => {
'use strict';
const cv = document.getElementById('c'), ctx = cv.getContext('2d', { alpha: false });
const $ = id => document.getElementById(id);
const Q = new URLSearchParams(location.search);
const MAXDPR = Q.has('hq') ? 3 : 2;
let DPR = 1, W = 0, H = 0, K = 1;

/* ---------- helpers ---------- */
if (!CanvasRenderingContext2D.prototype.roundRect) CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r); this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
};
const BASESEED = Q.has('seed') ? (parseInt(Q.get('seed'), 10) || 1) : 0;
let seed = BASESEED || ((Math.random() * 2147483647) | 0);
function rnd() { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
const R = (a, b) => a + (b - a) * rnd();
const fr = (a, b) => a + (b - a) * Math.random();
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, u) => a + (b - a) * u;
const easeOut = u => 1 - Math.pow(1 - clamp(u, 0, 1), 3);
const easeBack = u => { const c = 1.7; u = clamp(u, 0, 1) - 1; return 1 + u * u * ((c + 1) * u + c); };
const pick = a => a[(Math.random() * a.length) | 0];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) {} }
};
let best = parseInt(store.get('shb_best', '0'), 10) || 0;
let muted = store.get('shb_mute', '0') === '1';

/* ---------- sound (synthesised, no files) ---------- */
let AC = null, master = null, noiseBuf = null;
function unlockAudio() {
  try {
    if (!AC) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
      AC = new C(); master = AC.createGain(); master.gain.value = 0.3; master.connect(AC.destination);
      const n = (AC.sampleRate * 0.6) | 0; noiseBuf = AC.createBuffer(1, n, AC.sampleRate);
      const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended') AC.resume();
  } catch (e) { AC = null; }
}
function nz(t0, dur, f0, f1, vol, type) {
  if (!AC || muted) return;
  try {
    const t = AC.currentTime + t0, s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
    s.buffer = noiseBuf; f.type = type || 'bandpass'; f.Q.value = 1.1;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, dur * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.03);
  } catch (e) {}
}
function tn(t0, dur, f0, f1, vol, type) {
  if (!AC || muted) return;
  try {
    const t = AC.currentTime + t0, o = AC.createOscillator(), g = AC.createGain();
    o.type = type || 'sine'; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.03);
  } catch (e) {}
}
const sfx = {
  warn() { tn(0, 0.08, 760, 0, 0.04, 'triangle'); },
  throw(big) { nz(0, big ? 0.4 : 0.24, big ? 300 : 650, big ? 1100 : 2500, big ? 0.32 : 0.2); },
  near(c) { nz(0, 0.14, 3200, 1500, 0.12, 'highpass'); tn(0.02, 0.15, 520 + c * 70, 800 + c * 90, 0.11, 'triangle'); },
  date() { tn(0, 0.09, 880, 0, 0.13); tn(0.07, 0.16, 1320, 0, 0.11); },
  slap() { nz(0, 0.08, 2600, 1400, 0.6); nz(0, 0.32, 420, 90, 0.4, 'lowpass'); tn(0, 0.26, 150, 55, 0.3); },
  phase() { tn(0, 0.45, 196, 147, 0.12, 'sawtooth'); nz(0, 0.3, 800, 200, 0.1, 'lowpass'); },
  click() { tn(0, 0.05, 600, 0, 0.08, 'triangle'); },
  record() { [0, 0.11, 0.22].forEach((d, i) => tn(d, 0.2, 660 * [1, 1.26, 1.5][i], 0, 0.12, 'triangle')); }
};
function vib(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

/* ---------- slipper sprites ---------- */
const TYPES = [
  { sole: '#3E7BE0', bed: '#86AEF3', rim: '#1D4A9E', strap: '#F3EFE6', len: 56, spd: 1, sc: 1 },          // mum's classic
  { sole: '#F06445', bed: '#FF9C84', rim: '#A3361F', strap: '#0B0A0E', len: 50, spd: 1.45, sc: 1 },       // fast
  { sole: '#2BB3A6', bed: '#78DCD1', rim: '#137067', strap: '#D8B25A', len: 56, spd: 0.86, sc: 1 },       // grandma's (curves)
  { sole: '#8A5A3B', bed: '#B98559', rim: '#4A2B18', strap: '#2A1A12', len: 56, spd: 0.7, sc: 1.8, band: true } // dad's (big)
];
let SPR = [];
function slipperPath(g, L) {
  const tw = L * 0.22, hw = L * 0.17, ww = L * 0.15;
  g.beginPath();
  g.moveTo(tw, -tw);
  g.bezierCurveTo(L * 0.42, -tw * 1.04, L * 0.56, -ww, L - hw, -hw);
  g.arc(L - hw, 0, hw, -Math.PI / 2, Math.PI / 2);
  g.bezierCurveTo(L * 0.56, ww, L * 0.42, tw * 1.04, tw, tw);
  g.arc(tw, 0, tw, Math.PI / 2, Math.PI * 1.5);
  g.closePath();
}
function buildSprites() {
  SPR = TYPES.map(T => {
    const L = T.len, pad = 4, sc = T.sc * K * DPR;
    const c = document.createElement('canvas');
    c.width = Math.ceil((L + pad * 2) * sc); c.height = Math.ceil((L * 0.5 + pad * 2) * sc);
    const g = c.getContext('2d');
    g.scale(sc, sc); g.translate(pad, pad + L * 0.25);
    slipperPath(g, L); g.fillStyle = T.rim; g.fill();
    g.save(); g.translate(L * 0.04, 0); g.scale(0.92, 0.84); slipperPath(g, L); g.fillStyle = T.sole; g.fill(); g.restore();
    g.save(); g.translate(L * 0.1, 0); g.scale(0.8, 0.64); slipperPath(g, L); g.globalAlpha = 0.6; g.fillStyle = T.bed; g.fill(); g.restore();
    g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = L * 0.028; g.lineCap = 'round';
    g.beginPath(); g.moveTo(L * 0.22, -L * 0.165); g.quadraticCurveTo(L * 0.5, -L * 0.165, L * 0.76, -L * 0.115); g.stroke();
    if (T.band) {
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.roundRect(L * 0.27, -L * 0.235, L * 0.2, L * 0.47, L * 0.06); g.fill();
      g.fillStyle = T.strap; g.beginPath(); g.roundRect(L * 0.25, -L * 0.235, L * 0.2, L * 0.47, L * 0.06); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = L * 0.025; g.beginPath(); g.moveTo(L * 0.3, -L * 0.2); g.lineTo(L * 0.3, L * 0.2); g.stroke();
    } else {
      g.lineJoin = 'round';
      const strap = (w, col, dy) => {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath();
        g.moveTo(L * 0.52, -L * 0.17 + dy); g.quadraticCurveTo(L * 0.31, -L * 0.07 + dy, L * 0.2, dy);
        g.quadraticCurveTo(L * 0.31, L * 0.07 + dy, L * 0.52, L * 0.17 + dy); g.stroke();
      };
      strap(L * 0.11, 'rgba(0,0,0,.28)', L * 0.02);
      strap(L * 0.085, T.strap, 0);
      g.fillStyle = T.strap; g.beginPath(); g.arc(L * 0.2, 0, L * 0.055, 0, 7); g.fill();
    }
    return { c, cx: (pad + L / 2) * sc, cy: (pad + L * 0.25) * sc };
  });
}

/* ---------- background ---------- */
const BLEED = 26;
let BG = null, VIGR = null;
function star8(g, x, y, r) {
  g.beginPath();
  for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, rr = i % 2 ? r * 0.55 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  g.closePath(); g.fill();
}
function buildBg() {
  BG = document.createElement('canvas');
  BG.width = Math.ceil((W + BLEED * 2) * DPR); BG.height = Math.ceil((H + BLEED * 2) * DPR);
  const g = BG.getContext('2d'); g.scale(DPR, DPR); g.translate(BLEED, BLEED);
  const gr = g.createRadialGradient(W / 2, H * 0.45, 10, W / 2, H * 0.45, Math.max(W, H) * 0.8);
  gr.addColorStop(0, '#36243C'); gr.addColorStop(0.55, '#1B1221'); gr.addColorStop(1, '#0B0A0E');
  g.fillStyle = gr; g.fillRect(-BLEED, -BLEED, W + BLEED * 2, H + BLEED * 2);
  // living-room rug
  const rx = W * 0.09, ry = H * 0.16, rw = W * 0.82, rh = H * 0.7;
  g.fillStyle = 'rgba(240,100,69,.055)'; g.beginPath(); g.roundRect(rx, ry, rw, rh, 26 * K); g.fill();
  g.strokeStyle = 'rgba(216,178,90,.16)'; g.lineWidth = 2;
  g.beginPath(); g.roundRect(rx, ry, rw, rh, 26 * K); g.stroke();
  g.strokeStyle = 'rgba(216,178,90,.09)'; g.setLineDash([6 * K, 7 * K]);
  g.beginPath(); g.roundRect(rx + 12 * K, ry + 12 * K, rw - 24 * K, rh - 24 * K, 18 * K); g.stroke(); g.setLineDash([]);
  g.strokeStyle = 'rgba(216,178,90,.12)'; g.lineWidth = 2;
  for (let x = rx + 14 * K; x < rx + rw - 8 * K; x += 11 * K) {
    g.beginPath(); g.moveTo(x, ry); g.lineTo(x, ry - 9 * K); g.stroke();
    g.beginPath(); g.moveTo(x, ry + rh); g.lineTo(x, ry + rh + 9 * K); g.stroke();
  }
  // floor tiles with small 8-point stars
  const s = 74 * K;
  g.strokeStyle = 'rgba(216,178,90,.045)'; g.lineWidth = 1.2;
  for (let x = (W / 2) % s; x < W + BLEED; x += s) { g.beginPath(); g.moveTo(x, -BLEED); g.lineTo(x, H + BLEED); g.stroke(); }
  for (let y = (H / 2) % s; y < H + BLEED; y += s) { g.beginPath(); g.moveTo(-BLEED, y); g.lineTo(W + BLEED, y); g.stroke(); }
  g.fillStyle = 'rgba(216,178,90,.075)';
  for (let x = (W / 2) % s; x < W + BLEED; x += s) for (let y = (H / 2) % s; y < H + BLEED; y += s) star8(g, x, y, s * 0.13);
  // rug centre medallion
  g.fillStyle = 'rgba(216,178,90,.06)'; star8(g, W / 2, ry + rh / 2, 70 * K);
  g.fillStyle = 'rgba(240,100,69,.06)'; star8(g, W / 2, ry + rh / 2, 40 * K);
  // vignette
  const vg = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = vg; g.fillRect(-BLEED, -BLEED, W + BLEED * 2, H + BLEED * 2);
  // danger vignette (low-res, scaled up when drawn)
  VIGR = document.createElement('canvas'); VIGR.width = Math.ceil(W / 4); VIGR.height = Math.ceil(H / 4);
  const v = VIGR.getContext('2d'), w4 = VIGR.width, h4 = VIGR.height;
  const rg = v.createRadialGradient(w4 / 2, h4 / 2, Math.min(w4, h4) * 0.3, w4 / 2, h4 / 2, Math.max(w4, h4) * 0.72);
  rg.addColorStop(0, 'rgba(226,69,58,0)'); rg.addColorStop(1, 'rgba(226,69,58,.85)');
  v.fillStyle = rg; v.fillRect(0, 0, w4, h4);
}

/* ---------- state ---------- */
const P = { x: 0, y: 0, tx: 0, ty: 0, vx: 0, vy: 0, svx: 0, svy: 0, r: 22, hit: false, kx: 0, ky: 0, spin: 0, squash: 0, sweat: 0, blinkT: 2, blink: 0, lx: 0, ly: 1 };
const S = [], WARN = [], DATES = [], PARTS = [], TXT = [];
const PHASES = [
  { at: 0, txt: '' },
  { at: 7, txt: 'بدأت تعصب!' },
  { at: 15, txt: 'جابت الفردة الثانية!' },
  { at: 24, txt: 'الجدة دخلت!' },
  { at: 34, txt: 'أبوك دخل الخط!' },
  { at: 46, txt: 'العيلة كلها عليك!' }
];
let state = 'menu', clock = 0, tGame = 0, score = 0, nearCount = 0, combo = 0, comboT = 0, phase = 0;
let nextSpawn = 0, nextDate = 0, demoT = 0.4, hitstop = 0, slowT = 0, shake = 0, flash = 0, danger = 0, dieT = 0;
let moved = false, overT = -1, bannerT = -1, stampT = -1, comboPop = -1, scorePop = -1, toastT = -1, isRecord = false, finalScore = 0, games = 0;
let shownScore = -1, shownCombo = -1, keys = new Set();

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, MAXDPR);
  W = window.innerWidth; H = window.innerHeight;
  K = clamp(Math.min(W / 400, H / 780), 0.8, 1.5);
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  P.r = 22 * K;
  buildBg(); buildSprites();
  if (state === 'menu') { P.x = P.tx = W / 2; P.y = P.ty = H * 0.53; }
  clampTarget(); P.x = clamp(P.x, P.r, W - P.r); P.y = clamp(P.y, P.r, H - P.r);
}
function clampTarget() {
  P.tx = clamp(P.tx, P.r + 4, W - P.r - 4);
  P.ty = clamp(P.ty, P.r + 4, H - P.r - 4);
}

/* ---------- particles & floating text ---------- */
function part(x, y, vx, vy, life, size, color, kind) {
  if (PARTS.length > 380) PARTS.shift();
  PARTS.push({ x, y, vx, vy, life, max: life, size, color, kind: kind || 0, rot: fr(0, 6.28), vr: fr(-8, 8) });
}
function burst(x, y, n, colors, v0, v1, s0, s1, kind, life) {
  for (let i = 0; i < n; i++) { const a = fr(0, 6.283), v = fr(v0, v1) * K; part(x, y, Math.cos(a) * v, Math.sin(a) * v, fr(life * 0.6, life), fr(s0, s1) * K, pick(colors), kind); }
}
function ftext(x, y, str, color, size, life) { TXT.push({ x, y, str, color, size, life, max: life }); }

/* ---------- spawning ---------- */
function edgePoint(edge) {
  const m = 34 * K, o = 46 * K;
  if (edge === 0) { const x = R(W * 0.12, W * 0.88); return { bx: x, by: 104 * K, ox: x, oy: -o }; }
  if (edge === 1) { const y = R(H * 0.14, H * 0.86); return { bx: m, by: y, ox: -o, oy: y }; }
  if (edge === 2) { const y = R(H * 0.14, H * 0.86); return { bx: W - m, by: y, ox: W + o, oy: y }; }
  const x = R(W * 0.1, W * 0.9); return { bx: x, by: H - m, ox: x, oy: H + o };
}
function pickEdge(used) {
  for (let k = 0; k < 8; k++) {
    const r = rnd(), e = r < 0.38 ? 0 : r < 0.64 ? 1 : r < 0.9 ? 2 : 3;
    if (!used.includes(e)) return e;
  }
  return (used[0] + 1) % 4;
}
function pickType() {
  const r = rnd();
  if (phase >= 4 && r < 0.14) return 3;
  if (phase >= 3 && r < 0.34) return 2;
  if (phase >= 1 && r < (phase >= 3 ? 0.56 : 0.3)) return 1;
  return 0;
}
function spawnWave() {
  const d = clamp(tGame / 55, 0, 1);
  const tele = lerp(0.74, 0.42, d);
  const n = (phase >= 2 && rnd() < (phase >= 5 ? 0.6 : 0.4)) ? 2 : 1;
  const used = [];
  for (let i = 0; i < n; i++) {
    const edge = pickEdge(used); used.push(edge);
    const type = pickType();
    const fan = (phase >= 4 && type === 0 && rnd() < 0.32) ? 3 : 1;
    const e = edgePoint(edge);
    WARN.push({ ...e, edge, type, fan, t: -i * 0.14, dur: tele });
  }
  sfx.warn();
  nextSpawn = lerp(1.05, 0.46, d) * (n === 2 ? 1.4 : 1) * R(0.85, 1.15);
}
function launch(w) {
  const T = TYPES[w.type], d = clamp(tGame / 55, 0, 1);
  const spd = lerp(310, 540, d) * K * T.spd;
  const lead = R(0, 0.22);
  const tx = P.x + P.svx * lead + R(-16, 16) * K, ty = P.y + P.svy * lead + R(-16, 16) * K;
  const ang = Math.atan2(ty - w.oy, tx - w.ox);
  for (let i = 0; i < w.fan; i++) addSlipper(w.ox, w.oy, ang + (w.fan === 1 ? 0 : (i - 1) * 0.26), spd, w.type, false);
  sfx.throw(w.type === 3);
  for (let i = 0; i < 9; i++) part(w.bx, w.by, fr(-90, 90) * K, fr(-90, 90) * K, fr(0.25, 0.45), fr(3, 6) * K, 'rgba(243,239,230,.55)', 0);
  if (w.type === 3) shake = Math.max(shake, 6 * K);
}
function addSlipper(x, y, ang, spd, type, demo) {
  const rr = demo ? fr : R;
  S.push({ x, y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, a: rr(0, 6.28), va: (type === 3 ? rr(4, 6) : rr(9, 15)) * (rr(0, 1) < 0.5 ? -1 : 1),
    flip: rr(0, 6.28), type, sc: TYPES[type].sc, near: false, minD: 1e9, age: 0, demo,
    hx: new Float32Array(5).fill(x), hy: new Float32Array(5).fill(y), ha: new Float32Array(5), hi: 0 });
}
function demoThrow() {
  const e = edgePoint((Math.random() * 4) | 0);
  const side = Math.random() < 0.5 ? -1 : 1;
  const tx = P.x + fr(-30, 30) * K, ty = P.y + side * fr(95, 150) * K;
  addSlipper(e.ox, e.oy, Math.atan2(ty - e.oy, tx - e.ox), fr(330, 460) * K, (Math.random() * 3) | 0, true);
}
function spawnDate() {
  for (let k = 0; k < 12; k++) {
    const x = R(W * 0.14, W * 0.86), y = R(H * 0.2, H * 0.72);
    if (Math.hypot(x - P.x, y - P.y) > 130 * K) { DATES.push({ x, y, t: 0, life: 6 }); return; }
  }
}

/* ---------- events ---------- */
function nearMiss(s, px, py) {
  s.near = true; nearCount++;
  combo = comboT > 0 ? Math.min(combo + 1, 5) : 1; comboT = 2.4;
  const pts = 20 * combo; score += pts;
  ftext(P.x, P.y - P.r * 2.3, pick(['قريبة!', 'يا ساتر!', 'فاتتك!', 'نجوت!']), '#D8B25A', 27, 0.85);
  ftext(P.x + (P.x > W / 2 ? -1 : 1) * P.r * 2.6, P.y - P.r * 0.6, '+' + pts, '#F3EFE6', 20, 0.8);
  burst(px, py, 12, ['#D8B25A', '#F3EFE6'], 60, 260, 2, 4.5, 1, 0.5);
  slowT = 0.16; shake = Math.max(shake, 4 * K); P.sweat = 1;
  if (combo > 1) comboPop = 0;
  scorePop = 0; sfx.near(combo); vib(12);
}
function pickupDate(i) {
  const d = DATES[i]; DATES.splice(i, 1);
  const pts = 50; score += pts;
  ftext(d.x, d.y - 26 * K, '+' + pts, '#D8B25A', 26, 0.8);
  burst(d.x, d.y, 16, ['#D8B25A', '#F0C56A', '#8A4B22'], 80, 300, 2.5, 5, 0, 0.55);
  P.squash = 1; scorePop = 0; sfx.date(); vib(10);
}
function hit(s) {
  state = 'dying'; dieT = 0; hitstop = 0.16; shake = 20 * K; flash = 1; P.hit = true; P.spin = 0;
  const ang = Math.atan2(P.y - s.y, P.x - s.x);
  P.kx = Math.cos(ang) * 300 * K; P.ky = Math.sin(ang) * 300 * K;
  s.vx *= -0.35; s.vy *= -0.35; s.va *= 1.8;
  burst(P.x, P.y, 30, ['#F06445', '#F3EFE6', '#FF9C84'], 120, 440, 3, 7, 0, 0.8);
  burst(P.x, P.y, 9, ['#D8B25A'], 80, 230, 7, 11, 1, 1);
  sfx.slap(); vib([60, 40, 90]);
  stampT = 0; $('pauseBtn').classList.add('hidden');
}
function gameOver() {
  state = 'over'; overT = 0;
  finalScore = Math.floor(score);
  isRecord = finalScore > best && finalScore > 0;
  if (isRecord) { best = finalScore; store.set('shb_best', best); }
  $('ovScore').textContent = '0'; $('ovTime').textContent = tGame.toFixed(1); $('ovNear').textContent = nearCount;
  $('rec').classList.toggle('hidden', !isRecord); $('ovBest').textContent = best; $('bestH').textContent = best; $('bestM').textContent = best;
  $('over').classList.remove('hidden'); $('card').style.opacity = 0; $('over').style.pointerEvents = 'none';
  if (isRecord) { sfx.record(); for (let i = 0; i < 70; i++) part(fr(0, W), -20, fr(-60, 60) * K, fr(120, 420) * K, fr(1.4, 2.4), fr(4, 7) * K, pick(['#F06445', '#D8B25A', '#F3EFE6', '#2BB3A6', '#3E7BE0']), 2); }
}
function startGame() {
  unlockAudio(); sfx.click();
  games++; if (BASESEED) seed = BASESEED + games - 1;
  S.length = 0; WARN.length = 0; DATES.length = 0; TXT.length = 0;
  state = 'play'; tGame = 0; score = 0; nearCount = 0; combo = 0; comboT = 0; phase = 0;
  nextSpawn = 0.9; nextDate = 3.4; hitstop = 0; slowT = 0; danger = 0; moved = false;
  P.hit = false; P.kx = P.ky = 0; P.spin = 0; P.x = P.tx = W / 2; P.y = P.ty = H * 0.6;
  overT = -1; stampT = -1; bannerT = -1;
  $('menu').classList.add('hidden'); $('over').classList.add('hidden'); $('pause').classList.add('hidden');
  $('pauseBtn').classList.remove('hidden'); $('hud').style.opacity = 1; $('stamp').style.opacity = 0; $('banner').style.opacity = 0;
  $('bestH').textContent = best;
  ftext(W / 2, H * 0.43, 'اهرب!', '#F06445', 46, 0.9);
  shownScore = -1;
}
function setPause(on) {
  if (on && state === 'play') { state = 'paused'; $('pause').classList.remove('hidden'); }
  else if (!on && state === 'paused') { state = 'play'; $('pause').classList.add('hidden'); }
}
function toMenu() {
  state = 'menu'; S.length = 0; WARN.length = 0; DATES.length = 0;
  P.hit = false; P.kx = P.ky = 0; P.x = P.tx = W / 2; P.y = P.ty = H * 0.53;
  ['over', 'pause'].forEach(id => $(id).classList.add('hidden')); $('menu').classList.remove('hidden');
  $('hud').style.opacity = 0; $('pauseBtn').classList.add('hidden'); $('stamp').style.opacity = 0;
}
function toast(msg) { $('toast').textContent = msg; toastT = 0; }
async function share() {
  const text = 'هربت من الشبشب وجبت ' + finalScore + ' نقطة! تقدر تهزمني؟';
  const url = location.href.split('#')[0].split('?')[0];
  try { if (navigator.share) { await navigator.share({ title: 'اهرب من الشبشب', text, url }); return; } }
  catch (e) { if (e && e.name === 'AbortError') return; }
  try { await navigator.clipboard.writeText(text + ' ' + url); toast('انسخت النتيجة، أرسلها لصاحبك'); }
  catch (e) { toast(text); }
}

/* ---------- input ---------- */
let drag = null;
cv.addEventListener('pointerdown', e => {
  unlockAudio();
  if (state !== 'play') return;
  e.preventDefault();
  if (e.pointerType === 'mouse') { P.tx = e.clientX; P.ty = e.clientY; clampTarget(); moved = true; return; }
  drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY };
  try { cv.setPointerCapture(e.pointerId); } catch (_) {}
});
cv.addEventListener('pointermove', e => {
  if (state !== 'play') return;
  if (e.pointerType === 'mouse') { P.tx = e.clientX; P.ty = e.clientY; clampTarget(); moved = true; return; }
  if (!drag || e.pointerId !== drag.id) return;
  const s = 1.35;
  P.tx += (e.clientX - drag.lx) * s; P.ty += (e.clientY - drag.ly) * s;
  drag.lx = e.clientX; drag.ly = e.clientY; clampTarget(); moved = true;
});
const endDrag = e => { if (drag && e.pointerId === drag.id) drag = null; };
cv.addEventListener('pointerup', endDrag); cv.addEventListener('pointercancel', endDrag);
document.addEventListener('contextmenu', e => e.preventDefault());
const KEYMAP = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r', ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd' };
addEventListener('keydown', e => {
  if (KEYMAP[e.key]) { keys.add(KEYMAP[e.key]); e.preventDefault(); }
  if ((e.key === ' ' || e.key === 'Enter') && (state === 'menu' || (state === 'over' && overT > 0.6))) { e.preventDefault(); startGame(); }
  if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && (state === 'play' || state === 'paused')) setPause(state === 'play');
});
addEventListener('keyup', e => { if (KEYMAP[e.key]) keys.delete(KEYMAP[e.key]); });
addEventListener('blur', () => keys.clear());
document.addEventListener('visibilitychange', () => { if (document.hidden) setPause(true); });
$('startBtn').addEventListener('click', startGame);
$('againBtn').addEventListener('click', () => { if (overT > 0.5) startGame(); });
$('shareBtn').addEventListener('click', () => { if (overT > 0.5) share(); });
$('resumeBtn').addEventListener('click', () => setPause(false));
$('quitBtn').addEventListener('click', startGame);
$('pauseBtn').addEventListener('click', () => setPause(true));
function paintMute() { $('wav').style.display = muted ? 'none' : ''; $('xx').style.display = muted ? '' : 'none'; }
$('muteBtn').addEventListener('click', () => { muted = !muted; store.set('shb_mute', muted ? '1' : '0'); paintMute(); unlockAudio(); if (!muted) sfx.click(); });
paintMute();
addEventListener('resize', resize);

/* ---------- simulation ---------- */
function updatePlayer(h) {
  if (state === 'dying' || state === 'over') {
    P.x += P.kx * h; P.y += P.ky * h; const f = Math.exp(-h * 5); P.kx *= f; P.ky *= f;
    if (P.x < P.r || P.x > W - P.r) P.kx *= -0.6; if (P.y < P.r || P.y > H - P.r) P.ky *= -0.6;
    P.x = clamp(P.x, P.r, W - P.r); P.y = clamp(P.y, P.r, H - P.r);
    P.spin += h * 7; P.svx *= f; P.svy *= f; return;
  }
  if (state === 'play' && keys.size) {
    const sp = 560 * K * h;
    if (keys.has('l')) P.tx -= sp; if (keys.has('r')) P.tx += sp; if (keys.has('u')) P.ty -= sp; if (keys.has('d')) P.ty += sp;
    clampTarget(); moved = true;
  }
  if (state === 'menu') { P.tx = W / 2 + Math.sin(clock * 0.9) * 26 * K; P.ty = H * 0.53 + Math.sin(clock * 1.3) * 10 * K; }
  const k = 1 - Math.exp(-h * 30), px = P.x, py = P.y;
  P.x += (P.tx - P.x) * k; P.y += (P.ty - P.y) * k;
  P.vx = (P.x - px) / h; P.vy = (P.y - py) / h;
  const ks = 1 - Math.exp(-h * 14); P.svx += (P.vx - P.svx) * ks; P.svy += (P.vy - P.svy) * ks;
}
function step(h) {
  if (state === 'play') {
    tGame += h; score += h * 10;
    if (comboT > 0) { comboT -= h; if (comboT <= 0) combo = 0; }
    if (phase + 1 < PHASES.length && tGame >= PHASES[phase + 1].at) {
      phase++; bannerT = 0; $('banner').textContent = PHASES[phase].txt; sfx.phase(); shake = Math.max(shake, 7 * K); danger = Math.max(danger, 0.7);
    }
    nextSpawn -= h; if (nextSpawn <= 0) spawnWave();
    nextDate -= h; if (nextDate <= 0) { spawnDate(); nextDate = R(4.5, 7.5); }
  } else if (state === 'menu') {
    demoT -= h; if (demoT <= 0) { demoThrow(); demoT = fr(0.65, 1.15); }
  }
  for (let i = WARN.length - 1; i >= 0; i--) {
    const w = WARN[i]; w.t += h;
    if (w.t >= w.dur) { WARN.splice(i, 1); if (state === 'play') launch(w); }
  }
  updatePlayer(h);
  const mg = 160 * K;
  for (let i = S.length - 1; i >= 0; i--) {
    const s = S[i]; s.age += h;
    if (s.type === 2 && !s.demo && s.age < 0.95 && state === 'play') {
      const want = Math.atan2(P.y - s.y, P.x - s.x), cur = Math.atan2(s.vy, s.vx);
      let da = want - cur; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      const na = cur + clamp(da, -1.9 * h, 1.9 * h), sp = Math.hypot(s.vx, s.vy);
      s.vx = Math.cos(na) * sp; s.vy = Math.sin(na) * sp;
    }
    s.x += s.vx * h; s.y += s.vy * h; s.a += s.va * h; s.flip += 7 * h;
    if (s.age > 0.4 && (s.x < -mg || s.x > W + mg || s.y < -mg || s.y > H + mg)) { S.splice(i, 1); continue; }
    if (state !== 'play' || s.demo) continue;
    const L = TYPES[s.type].len * K * s.sc, ca = Math.cos(s.a), sa = Math.sin(s.a), off = L * 0.27, cr = L * 0.19;
    const ax = s.x + ca * off, ay = s.y + sa * off, bx = s.x - ca * off, by = s.y - sa * off;
    const d1 = Math.hypot(P.x - ax, P.y - ay), d2 = Math.hypot(P.x - bx, P.y - by), dm = Math.min(d1, d2);
    if (dm < P.r * 0.78 + cr) { hit(s); return; }
    if (!s.near) {
      if (dm < s.minD) s.minD = dm;
      else if (s.minD < P.r + cr + 22 * K && dm > s.minD + 5 * K) nearMiss(s, d1 < d2 ? ax : bx, d1 < d2 ? ay : by);
    }
  }
  for (let i = DATES.length - 1; i >= 0; i--) {
    const d = DATES[i]; d.t += h;
    if (d.t > d.life) { DATES.splice(i, 1); continue; }
    if (state === 'play' && Math.hypot(d.x - P.x, d.y - P.y) < P.r + 17 * K) pickupDate(i);
  }
}
function tick(dtr) {
  clock += dtr;
  uiTick(dtr);
  flash = Math.max(0, flash - dtr * 4);
  if (state === 'paused') return;
  if (hitstop > 0) { hitstop -= dtr; return; }
  let ts = 1;
  if (slowT > 0) { slowT -= dtr; ts = 0.4; }
  if (state === 'dying') { ts = 0.35; dieT += dtr; if (dieT > 1.05) gameOver(); }
  const dt = dtr * ts, n = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / n;
  for (let i = 0; i < n && h > 0; i++) step(h);
  for (const s of S) { s.hi = (s.hi + 1) % 5; s.hx[s.hi] = s.x; s.hy[s.hi] = s.y; s.ha[s.hi] = s.a; }
  shake *= Math.exp(-dtr * 9); if (shake < 0.25) shake = 0;
  P.squash = Math.max(0, P.squash - dtr * 4); P.sweat = Math.max(0, P.sweat - dtr * 1.2);
  P.blinkT -= dtr; if (P.blinkT < 0) { P.blink = 0.12; P.blinkT = fr(2, 4.5); } P.blink = Math.max(0, P.blink - dtr);
  for (let i = PARTS.length - 1; i >= 0; i--) {
    const p = PARTS[i]; p.life -= dt; if (p.life <= 0) { PARTS.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
    if (p.kind === 2) { p.vy += 30 * K * dt; p.vx += Math.sin(clock * 3 + p.rot) * 40 * K * dt; } else { const f = Math.exp(-dt * 3.5); p.vx *= f; p.vy *= f; }
  }
  for (let i = TXT.length - 1; i >= 0; i--) { TXT[i].life -= dtr; if (TXT[i].life <= 0) TXT.splice(i, 1); }
  // danger + where the eyes look
  let dg = 0, lx = 0, ly = 0;
  if (state === 'play') {
    for (const s of S) {
      if (s.demo) continue;
      const rx = P.x - s.x, ry = P.y - s.y, vv = s.vx * s.vx + s.vy * s.vy; if (vv < 1) continue;
      const tca = (rx * s.vx + ry * s.vy) / vv; if (tca < 0 || tca > 0.7) continue;
      const dca = Math.hypot(s.x + s.vx * tca - P.x, s.y + s.vy * tca - P.y);
      const v = clamp(1 - (dca - P.r) / (110 * K), 0, 1) * clamp(1.15 - tca / 0.7, 0, 1);
      if (v > dg) { dg = v; lx = -rx; ly = -ry; }
    }
    if (dg < 0.15 && WARN.length) { lx = WARN[0].bx - P.x; ly = WARN[0].by - P.y; }
  } else if (S.length) { const s = S[S.length - 1]; lx = s.x - P.x; ly = s.y - P.y; }
  danger += (clamp(dg, 0, 1) - danger) * (1 - Math.exp(-dtr * 10));
  const ll = Math.hypot(lx, ly);
  if (ll > 1) { P.lx += (lx / ll - P.lx) * (1 - Math.exp(-dtr * 12)); P.ly += (ly / ll - P.ly) * (1 - Math.exp(-dtr * 12)); }
}

/* ---------- UI animation (driven by the game clock) ---------- */
function uiTick(dtr) {
  if (state === 'menu') {
    $('logo').style.transform = 'translateY(' + (Math.sin(clock * 2.2) * 6).toFixed(1) + 'px) rotate(' + (Math.sin(clock * 1.1) * 1.5).toFixed(2) + 'deg)';
    $('hintDot').style.transform = 'translateX(' + (Math.sin(clock * 3.2) * 5).toFixed(1) + 'px)';
    $('startBtn').style.transform = 'scale(' + (1 + Math.sin(clock * 5) * 0.035).toFixed(3) + ')';
  }
  const sc = Math.floor(score);
  if (sc !== shownScore && (state === 'play' || state === 'dying')) { shownScore = sc; $('score').textContent = sc; }
  if (scorePop >= 0) { scorePop += dtr; const u = scorePop / 0.25; $('score').style.transform = 'scale(' + (1 + 0.28 * (1 - easeOut(u))).toFixed(3) + ')'; if (u >= 1) scorePop = -1; }
  const cb = $('combo');
  if (combo !== shownCombo) { shownCombo = combo; cb.textContent = '×' + combo; }
  const cOn = combo > 1 && state === 'play';
  cb.style.opacity = cOn ? Math.min(1, comboT * 2) : 0;
  if (comboPop >= 0) { comboPop += dtr; const u = comboPop / 0.3; cb.style.transform = 'scale(' + (1 + 0.6 * (1 - easeOut(u))).toFixed(3) + ') rotate(' + (-8 * (1 - easeOut(u))).toFixed(1) + 'deg)'; if (u >= 1) comboPop = -1; }
  if (bannerT >= 0) {
    bannerT += dtr; const b = $('banner'), u = bannerT;
    const s = u < 0.22 ? lerp(1.8, 1, easeBack(u / 0.22)) : 1;
    b.style.opacity = u < 0.1 ? u / 0.1 : u > 1.6 ? Math.max(0, (1.9 - u) / 0.3) : 1;
    b.style.transform = 'translate(-50%,-50%) scale(' + s.toFixed(3) + ')';
    if (u > 1.9) { bannerT = -1; b.style.opacity = 0; }
  }
  if (stampT >= 0) {
    stampT += dtr; const st = $('stamp'), u = stampT;
    const s = u < 0.2 ? lerp(2.6, 1, easeOut(u / 0.2)) : 1;
    const out = state === 'over' ? clamp(overT / 0.25, 0, 1) : 0;
    st.style.opacity = (u < 0.08 ? u / 0.08 : 1) * (1 - out);
    st.style.transform = 'translate(-50%,-50%) scale(' + (s * (1 - out * 0.3)).toFixed(3) + ') rotate(' + (-7 + out * 4).toFixed(1) + 'deg)';
    if (out >= 1) stampT = -1;
  }
  if (overT >= 0) {
    overT += dtr; const c = $('card'), u = overT;
    c.style.opacity = clamp(u / 0.18, 0, 1);
    c.style.transform = 'translateY(' + ((1 - easeBack(u / 0.5)) * 70).toFixed(1) + 'px) scale(' + lerp(0.9, 1, easeOut(u / 0.4)).toFixed(3) + ')';
    $('ovScore').textContent = Math.floor(finalScore * easeOut(clamp((u - 0.15) / 0.7, 0, 1)));
    $('over').style.pointerEvents = u > 0.5 ? 'auto' : 'none';
    const r = $('rec'); if (isRecord) r.style.transform = 'scale(' + (1 + Math.sin(clock * 6) * 0.05).toFixed(3) + ')';
  }
  if (toastT >= 0) { toastT += dtr; const t = $('toast'); t.style.opacity = toastT < 0.15 ? toastT / 0.15 : toastT > 2.2 ? Math.max(0, (2.5 - toastT) / 0.3) : 1; if (toastT > 2.5) toastT = -1; }
}

/* ---------- drawing ---------- */
function drawSlipper(s, shx, shy, sx, sy, sa, alpha) {
  const sp = SPR[s.type], c = Math.cos(sa), n = Math.sin(sa), w = 0.8 + 0.2 * Math.cos(s.flip);
  ctx.globalAlpha = alpha;
  ctx.setTransform(c * DPR, n * DPR, -n * w * DPR, c * w * DPR, (sx + shx) * DPR, (sy + shy) * DPR);
  ctx.drawImage(sp.c, -sp.cx, -sp.cy);
}
function drawPlayer() {
  const r = P.r;
  ctx.fillStyle = 'rgba(0,0,0,.38)'; ctx.beginPath(); ctx.ellipse(P.x, P.y + r * 1.08, r * 0.9, r * 0.3, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.translate(P.x, P.y);
  const sp = Math.hypot(P.svx, P.svy), st = clamp(sp / (1800 * K), 0, 0.18), ang = Math.atan2(P.svy, P.svx);
  ctx.rotate(ang); ctx.scale(1 + st - P.squash * 0.14, 1 - st * 0.6 + P.squash * 0.14); ctx.rotate(-ang);
  ctx.scale(1, 1 + Math.sin(clock * 5) * 0.025);
  if (P.hit) ctx.rotate(Math.sin(P.spin) * 0.45);
  ctx.fillStyle = '#F3EFE6'; ctx.beginPath(); ctx.arc(0, 0, r + 3 * K, 0, 7); ctx.fill();
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#F6CDA4'); g.addColorStop(1, '#D9915C');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  // hair
  ctx.fillStyle = '#2A1A14'; ctx.beginPath();
  ctx.arc(0, 0, r, Math.PI * 1.1, Math.PI * 1.9); ctx.quadraticCurveTo(r * 0.2, -r * 0.08, -r * 0.95, -r * 0.31); ctx.fill();
  ctx.strokeStyle = '#2A1A14'; ctx.lineWidth = r * 0.13; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-r * 0.05, -r * 0.95); ctx.quadraticCurveTo(r * 0.1, -r * 1.35, r * 0.38, -r * 1.22); ctx.stroke();
  // cheeks
  ctx.fillStyle = 'rgba(240,100,69,.35)';
  ctx.beginPath(); ctx.arc(-r * 0.58, r * 0.3, r * 0.17, 0, 7); ctx.arc(r * 0.58, r * 0.3, r * 0.17, 0, 7); ctx.fill();
  const ex = r * 0.36, ey = r * 0.02, er = r * 0.27, scared = danger > 0.5;
  ctx.lineCap = 'round';
  for (const sx of [-1, 1]) {
    const cx = sx * ex;
    if (P.hit) {
      ctx.strokeStyle = '#0B0A0E'; ctx.lineWidth = r * 0.12; const q = er * 0.6;
      ctx.beginPath(); ctx.moveTo(cx - q, ey - q); ctx.lineTo(cx + q, ey + q); ctx.moveTo(cx + q, ey - q); ctx.lineTo(cx - q, ey + q); ctx.stroke();
    } else if (P.blink > 0) {
      ctx.strokeStyle = '#0B0A0E'; ctx.lineWidth = r * 0.1;
      ctx.beginPath(); ctx.moveTo(cx - er * 0.7, ey); ctx.lineTo(cx + er * 0.7, ey); ctx.stroke();
    } else {
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx, ey, er * 0.88, er * (scared ? 1.18 : 1), 0, 0, 7); ctx.fill();
      const pr = er * (scared ? 0.36 : 0.5), qx = cx + P.lx * er * 0.42, qy = ey + P.ly * er * 0.5;
      ctx.fillStyle = '#0B0A0E'; ctx.beginPath(); ctx.arc(qx, qy, pr, 0, 7); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(qx - pr * 0.35, qy - pr * 0.4, pr * 0.32, 0, 7); ctx.fill();
    }
    if (scared && !P.hit) {
      ctx.strokeStyle = '#2A1A14'; ctx.lineWidth = r * 0.09;
      ctx.beginPath(); ctx.moveTo(cx - sx * er * 0.75, ey - er * 1.35); ctx.lineTo(cx + sx * er * 0.55, ey - er * 1.7); ctx.stroke();
    }
  }
  ctx.fillStyle = '#5A1E14'; ctx.strokeStyle = '#5A1E14'; ctx.lineWidth = r * 0.09;
  if (P.hit) {
    ctx.beginPath(); ctx.moveTo(-r * 0.3, r * 0.52);
    for (let i = 1; i <= 4; i++) ctx.lineTo(-r * 0.3 + i * r * 0.15, r * 0.52 + (i % 2 ? -1 : 1) * r * 0.07);
    ctx.stroke();
  } else if (scared) {
    ctx.beginPath(); ctx.ellipse(0, r * 0.5, r * 0.15, r * 0.2, 0, 0, 7); ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, r * 0.32, r * 0.24, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  if ((P.sweat > 0 || scared) && !P.hit) {
    ctx.fillStyle = '#9FD3FF'; ctx.globalAlpha = Math.max(P.sweat, danger);
    const dx = r * 0.86, dy = -r * 0.5 + (1 - P.sweat) * r * 0.25;
    ctx.beginPath(); ctx.moveTo(dx, dy - r * 0.26); ctx.quadraticCurveTo(dx + r * 0.17, dy, dx, dy + r * 0.1); ctx.quadraticCurveTo(dx - r * 0.17, dy, dx, dy - r * 0.26); ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  if (P.hit) {
    ctx.fillStyle = '#D8B25A';
    for (let i = 0; i < 3; i++) { const a = clock * 5 + i * 2.094; drawStar(P.x + Math.cos(a) * r * 1.05, P.y - r * 1.3 + Math.sin(a) * r * 0.28, r * 0.28, a); }
  }
}
function drawStar(x, y, r, rot) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function drawWarn(w) {
  if (w.t < 0) return;
  const T = TYPES[w.type], u = clamp(w.t / w.dur, 0, 1);
  const r = (w.type === 3 ? 25 : 19) * K * (u < 0.18 ? easeBack(u / 0.18) : 1) * (1 + Math.sin(clock * 20) * 0.05);
  ctx.save(); ctx.translate(w.bx, w.by);
  const ta = Math.atan2(w.oy - w.by, w.ox - w.bx);
  ctx.fillStyle = '#F3EFE6';
  ctx.beginPath(); ctx.moveTo(Math.cos(ta - 0.5) * r * 0.9, Math.sin(ta - 0.5) * r * 0.9); ctx.lineTo(Math.cos(ta) * r * 1.6, Math.sin(ta) * r * 1.6); ctx.lineTo(Math.cos(ta + 0.5) * r * 0.9, Math.sin(ta + 0.5) * r * 0.9); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = T.sole; ctx.lineWidth = 4 * K; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(0, 0, r + 5 * K, -Math.PI / 2, -Math.PI / 2 + u * Math.PI * 2); ctx.stroke();
  ctx.fillStyle = T.rim; ctx.font = '900 ' + Math.round(r * 1.25) + 'px Alexandria, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'ltr';
  ctx.fillText(w.type === 1 ? '!!' : w.type === 3 ? '!!!' : '!', 0, r * 0.04);
  ctx.restore();
}
function drawDate(d) {
  const a = d.t < 0.3 ? easeBack(d.t / 0.3) : 1, blink = d.life - d.t < 1.2 ? (Math.sin(d.t * 26) > 0 ? 1 : 0.3) : 1;
  ctx.save(); ctx.translate(d.x, d.y + Math.sin(clock * 4 + d.x) * 3 * K); ctx.scale(a, a); ctx.globalAlpha = blink;
  ctx.fillStyle = 'rgba(216,178,90,.16)'; ctx.beginPath(); ctx.arc(0, 0, 27 * K * (1 + Math.sin(clock * 6) * 0.08), 0, 7); ctx.fill();
  ctx.rotate(-0.45);
  ctx.fillStyle = '#F3EFE6'; ctx.beginPath(); ctx.ellipse(0, 0, 12.5 * K, 17.5 * K, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#6B341A'; ctx.beginPath(); ctx.ellipse(0, 0, 10 * K, 15 * K, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#9C5630'; ctx.beginPath(); ctx.ellipse(-3 * K, -4 * K, 3.5 * K, 7 * K, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#D8B25A'; ctx.beginPath(); ctx.roundRect(-3.5 * K, -17 * K, 7 * K, 4 * K, 2 * K); ctx.fill();
  ctx.restore(); ctx.globalAlpha = 1;
}
function draw() {
  const shx = shake ? fr(-1, 1) * shake : 0, shy = shake ? fr(-1, 1) * shake : 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.drawImage(BG, Math.round((shx - BLEED) * DPR), Math.round((shy - BLEED) * DPR));
  ctx.setTransform(DPR, 0, 0, DPR, shx * DPR, shy * DPR);
  for (const d of DATES) drawDate(d);
  for (const w of WARN) drawWarn(w);
  ctx.fillStyle = 'rgba(0,0,0,.26)';
  for (const s of S) {
    const L = TYPES[s.type].len * K * s.sc;
    ctx.save(); ctx.translate(s.x + 10 * K * s.sc, s.y + 15 * K * s.sc); ctx.rotate(s.a); ctx.beginPath(); ctx.ellipse(0, 0, L * 0.45, L * 0.18, 0, 0, 7); ctx.fill(); ctx.restore();
  }
  drawPlayer();
  for (const s of S) {
    for (let k = 4; k >= 1; k--) {
      const j = (s.hi - k + 5) % 5;
      drawSlipper(s, shx, shy, s.hx[j], s.hy[j], s.ha[j], 0.07 * (5 - k));
    }
    drawSlipper(s, shx, shy, s.x, s.y, s.a, 1);
  }
  ctx.globalAlpha = 1; ctx.setTransform(DPR, 0, 0, DPR, shx * DPR, shy * DPR);
  for (const p of PARTS) {
    const u = p.life / p.max; ctx.globalAlpha = clamp(u * 1.5, 0, 1); ctx.fillStyle = p.color;
    if (p.kind === 1) drawStar(p.x, p.y, p.size * (0.5 + 0.5 * u), p.rot);
    else if (p.kind === 2) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6); ctx.restore(); }
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (0.35 + 0.65 * u), 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
  if (state === 'play' && !moved && tGame < 5) {
    const fx = P.x + Math.sin(clock * 4) * 46 * K, fy = P.y + P.r * 3.4;
    ctx.globalAlpha = 0.85 * clamp((5 - tGame) * 2, 0, 1);
    ctx.fillStyle = 'rgba(243,239,230,.25)'; ctx.beginPath(); ctx.arc(fx, fy, 20 * K, 0, 7); ctx.fill();
    ctx.fillStyle = '#F3EFE6'; ctx.beginPath(); ctx.arc(fx, fy, 11 * K, 0, 7); ctx.fill();
    ctx.font = '800 ' + Math.round(17 * K) + 'px Alexandria, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl';
    ctx.fillText('اسحب إصبعك', P.x, fy + 36 * K);
    ctx.globalAlpha = 1;
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.direction = 'rtl'; ctx.lineJoin = 'round';
  for (const t of TXT) {
    const age = t.max - t.life, u = t.life / t.max, s = age < 0.14 ? lerp(1.7, 1, easeOut(age / 0.14)) : 1;
    ctx.save(); ctx.translate(t.x, t.y - age * 42 * K); ctx.scale(s, s); ctx.globalAlpha = clamp(u * 3, 0, 1); ctx.direction = /[؀-ۿ]/.test(t.str) ? 'rtl' : 'ltr';
    ctx.font = '900 ' + Math.round(t.size * K) + 'px Alexandria, sans-serif';
    ctx.lineWidth = 6 * K; ctx.strokeStyle = 'rgba(11,10,14,.92)'; ctx.strokeText(t.str, 0, 0);
    ctx.fillStyle = t.color; ctx.fillText(t.str, 0, 0); ctx.restore();
  }
  ctx.globalAlpha = 1; ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (danger > 0.03) { ctx.globalAlpha = danger * 0.5; ctx.drawImage(VIGR, 0, 0, cv.width, cv.height); ctx.globalAlpha = 1; }
  if (flash > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (flash * 0.65).toFixed(3) + ')'; ctx.fillRect(0, 0, cv.width, cv.height); }
}

/* ---------- loop ---------- */
let lastTs = null;
function frame(ts) {
  requestAnimationFrame(frame);
  if (lastTs === null) lastTs = ts;
  let dtr = (ts - lastTs) / 1000; lastTs = ts;
  if (!(dtr > 0)) dtr = 0; if (dtr > 0.05) dtr = 0.05;
  tick(dtr); draw();
}
resize();
$('bestM').textContent = best; $('bestH').textContent = best;
const go = () => requestAnimationFrame(frame);
if (document.fonts && document.fonts.load) document.fonts.load('900 30px Alexandria').then(go, go); else go();
window.__shb = {
  peek: () => ({ state, t: tGame, score: Math.floor(score), phase, near: nearCount, combo, W, H, K,
    p: [P.x, P.y, P.tx, P.ty, P.r, P.svx, P.svy], s: S.filter(s => !s.demo).map(s => [s.x, s.y, s.vx, s.vy, s.type, s.sc, s.a]),
    w: WARN.map(w => [w.bx, w.by, w.ox, w.oy, w.dur - w.t, w.type]), d: DATES.map(d => [d.x, d.y]) }),
  start: startGame
};
})();
</script>
</body>
</html>
```
