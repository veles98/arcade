// AI pop-up book, v2: thick die-cut cards, printed pages, cinematic camera and post.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { COVER, FINAL, WORDS, ATT, CHATS, BUBBLE_1950, COUNTER_CAPTION } from './content.js';
import CH1 from './chapters/ch1.js';
import { LIBRARY, BOOK_COVER, TOC_SPREAD, END_CARD } from './chapters/index.js';

// ---------- params ----------
const Q = new URLSearchParams(location.search);
const AUTO = Q.get('autoplay') === '1';
const READER = !AUTO;                       // default: the reader flips the pages; ?autoplay=1 keeps the reel timeline
const LAZY = READER;                        // reader: printed pages + pop-ups are built only around the open spread
const IS_MOBILE = matchMedia('(pointer: coarse)').matches || Math.min(screen.width, screen.height) < 620;
const SAVE_KEY = 'aiBook.pos.v1';
const store = { get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } } };
// The book's spreads in reading order. Reel: chapter 1 only. Reader: contents page + every ready chapter.
let SEQ = CH1.spreads.map((s, k) => ({ ...s, ch: 'ch1', k }));
const CHDATA = { ch1: CH1 };
// Reader: the pop-up is pressed onto the far part of the spread so the near part is free for the printed story.
const SQZ = 0.7, RZ = z => Math.round((SQZ * z - 0.16) * 1000) / 1000;
const squeeze = sp => ({ ...sp, sq: true, layers: sp.layers.map(l => ({ ...l, z0: l.z, z: RZ(l.z) })) });
const ar = n => String(n).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const CAPTURE = Q.get('capture') === '1';
const SPP = parseFloat(Q.get('spp') || '5');
const DOF = Q.get('dof') ? Q.get('dof') !== '0' : !(IS_MOBILE && READER);   // depth of field is skipped on phones in the reader (cost)
// voice-over cues (s): 1950, 1997, cat beat, 2012, 2017, 2022, end, total  (reels/S28_ai_book/CUES.md)
const CUES = (Q.get('cues') || '5.57,12.70,19.79,24.29,32.63,39.14,43.92,51.6').split(',').map(Number);
const USE_CUES = AUTO && Q.get('cues') !== 'off';
if (AUTO) document.body.classList.add('auto');

// ---------- dimensions ----------
const W = 1.0, H = 1.36, T = 0.024, B = 0.05, G = 0.0045;
let K, P_CLOSED, PAGE_Y;
function setDims() { K = SEQ.length - 1; P_CLOSED = T + B + K * G + B + T + 0.002; PAGE_Y = T + B + K * G + 0.016; }
setDims();
const NS = 44, NM = 14;
const FLIP = 1.35;

// ---------- easing / virtual time ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t, c = 1.6) => 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const camEase = t => ease(t) + 0.03 * Math.sin(Math.PI * clamp((t - 0.62) / 0.38)); // settle with a slight overshoot
let NOW = 0, DT = 1 / 60;
const tweens = [];
function tween(dur, fn, { delay = 0, e = ease, token } = {}) { return new Promise(res => tweens.push({ t0: NOW + delay, dur, fn, e, res, token })); }
const wait = s => tween(s, () => {});
function updateTweens() {
  for (let i = tweens.length - 1; i >= 0; i--) {
    const tw = tweens[i];
    if (tw.token && tw.token.dead) { tweens.splice(i, 1); tw.res(); continue; }
    if (NOW < tw.t0) continue;
    const p = clamp((NOW - tw.t0) / tw.dur);
    try { tw.fn(tw.e(p), p); } catch (err) { console.error(err); tweens.splice(i, 1); tw.res(); continue; }   // one broken beat must not stop the book
    if (p >= 1) { tweens.splice(i, 1); tw.res(); }
  }
}

// ---------- renderer / scene ----------
const canvas = document.getElementById('c');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: CAPTURE, powerPreference: 'high-performance' }); }
catch (e) { document.getElementById('loader').innerHTML = '<div class="lmsg">المتصفح هذا ما يدعم عرض الكتاب ثلاثي الأبعاد.<br>افتح الرابط في Safari أو Chrome.</div>'; throw e; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE && READER ? 1.75 : 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.88;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const MAXANI = renderer.capabilities.getMaxAnisotropy();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050302);
scene.fog = new THREE.Fog(0x050302, 6.5, 15);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 60);

// ---------- canvas / texture helpers ----------
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function canvasTex(c, srgb = true) { const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = MAXANI; return t; }
let noiseC;
function noiseCanvas() {
  if (noiseC) return noiseC;
  noiseC = mkCanvas(512, 512); const x = noiseC.getContext('2d'); const id = x.createImageData(512, 512);
  for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 70; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
  x.putImageData(id, 0, 0);
  x.globalAlpha = 0.12; x.strokeStyle = '#000'; x.lineWidth = 1;
  for (let i = 0; i < 1400; i++) { const a = Math.random() * 6.28, l = 5 + Math.random() * 24, px = Math.random() * 512, py = Math.random() * 512;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + 1) * l * .5, py + Math.sin(a + 1) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke(); }
  return noiseC;
}
const fibre = canvasTex(noiseCanvas(), false); fibre.wrapS = fibre.wrapT = THREE.RepeatWrapping;
const fibre3 = fibre.clone(); fibre3.repeat.set(3, 3); fibre3.needsUpdate = true;
const ROUGH_PAPER = 'rgb(0,236,0)', GOLD_MASK = 'rgb(0,95,200)';
function goldGrad(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#f7e2a2'); g.addColorStop(.4, '#c4923a'); g.addColorStop(.62, '#efd08a'); g.addColorStop(1, '#8a6222'); return g;
}
const texLoader = new THREE.TextureLoader();
const IMG = {}, CARD = {}, TEX = {};
const loadTex = (url, srgb = true, tries = 4) => new Promise(res => texLoader.load(url, t => { if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = MAXANI; res(t); }, undefined,
  () => { if (tries > 1) setTimeout(() => loadTex(url, srgb, tries - 1).then(res), 250); else { console.warn('missing', url); res(null); } }));
async function fetchJSON(url, tries = 4) { for (let i = 0; i < tries; i++) { try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) { /* retry */ } await new Promise(r => setTimeout(r, 250)); } return null; }
function metalFromImage(img, s = 512) {
  const c = mkCanvas(s, Math.max(2, Math.round(s * img.height / img.width))), x = c.getContext('2d');
  x.drawImage(img, 0, 0, c.width, c.height);
  const d = x.getImageData(0, 0, c.width, c.height), p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    const gold = clamp((r - b - 55) / 55) * clamp((r - 95) / 60) * clamp((g - b - 20) / 40);
    p[i] = 0; p[i + 1] = Math.round(lerp(236, 92, gold)); p[i + 2] = Math.round(190 * gold); p[i + 3] = 255;
  }
  x.putImageData(d, 0, 0); return canvasTex(c, false);
}

// ---------- lights ----------
const hemi = new THREE.HemisphereLight(0xffeedd, 0x140c06, 0.2); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffd9a8, 1.95);           // raking light from the left
key.position.set(-3.8, 2.3, 1.6); key.castShadow = true;
key.shadow.mapSize.setScalar(IS_MOBILE && READER ? 1024 : 2048);
Object.assign(key.shadow.camera, { left: -2.2, right: 2.2, top: 2.2, bottom: -2.2, near: 0.5, far: 12 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.01; key.shadow.radius = 4;
scene.add(key);
const fill = new THREE.DirectionalLight(0x9fb0ff, 0.18); fill.position.set(3, 2.2, -2.5); scene.add(fill);
const glint = new THREE.DirectionalLight(0xfff0d0, 0.55); scene.add(glint); // moving foil sweep (no shadow)
const stageSpot = new THREE.SpotLight(0xffe2a8, 0, 4, 0.32, 0.7, 1.2); stageSpot.position.set(0.1, 1.9, 1.0); scene.add(stageSpot, stageSpot.target);

// ---------- practical brass lamp ----------
const LAMP = { base: new THREE.Vector3(-1.75, 0, -1.15), head: new THREE.Vector3(-1.05, 1.45, -0.62), aim: new THREE.Vector3(0.05, 0.1, 0.0) };
const brass = new THREE.MeshStandardMaterial({ color: 0xb08a4a, metalness: 1, roughness: 0.28, envMapIntensity: 1.2 });
const brassDark = new THREE.MeshStandardMaterial({ color: 0x5c4524, metalness: 1, roughness: 0.42 });
let lampSpot, lampBulb, beam;
const LAMP_I = 3.4;
function buildLamp() {
  const g = new THREE.Group(); scene.add(g);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.05, 48), brass); base.position.copy(LAMP.base).y = 0.025; base.castShadow = base.receiveShadow = true; g.add(base);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 16), brassDark); knob.position.copy(LAMP.base).y = 0.07; g.add(knob);
  const elbow = LAMP.base.clone().add(new THREE.Vector3(0.12, 0.95, 0.12));
  const rod = (a, b, r) => { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 16), brass);
    m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; g.add(m); };
  rod(LAMP.base.clone().setY(0.06), elbow, 0.014); rod(elbow, LAMP.head, 0.012);
  const j = new THREE.Mesh(new THREE.SphereGeometry(0.026, 20, 14), brassDark); j.position.copy(elbow); g.add(j);
  const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector2(0.05 + t * t * 0.17 + t * 0.03, -t * 0.26)); }
  const shadeGeo = new THREE.LatheGeometry(pts, 48);
  const shade = new THREE.Group(); shade.position.copy(LAMP.head); g.add(shade);
  const outer = new THREE.Mesh(shadeGeo, brass); outer.castShadow = true; shade.add(outer);
  const inner = new THREE.Mesh(shadeGeo, new THREE.MeshStandardMaterial({ color: 0xfff2d8, emissive: 0xffd9a0, emissiveIntensity: 0.9, side: THREE.BackSide, roughness: .8 })); inner.scale.setScalar(0.985); shade.add(inner);
  lampBulb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffd08a, emissiveIntensity: 9 }));
  lampBulb.position.y = -0.07; shade.add(lampBulb);
  const dir = LAMP.aim.clone().sub(LAMP.head).normalize();
  shade.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
  lampSpot = new THREE.SpotLight(0xffc98a, LAMP_I, 7, 0.62, 0.85, 1.7);
  lampSpot.position.copy(LAMP.head).addScaledVector(dir, 0.08); lampSpot.target.position.copy(LAMP.aim);
  lampSpot.castShadow = true; lampSpot.shadow.mapSize.set(1024, 1024); lampSpot.shadow.bias = -0.0006; lampSpot.shadow.radius = 6; lampSpot.shadow.camera.near = 0.2;
  scene.add(lampSpot, lampSpot.target);
  const len = LAMP.head.distanceTo(LAMP.aim) * 1.05;
  const cone = new THREE.ConeGeometry(Math.tan(0.58) * len, len, 48, 1, true); cone.translate(0, -len / 2, 0);
  beam = new THREE.Mesh(cone, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uI: { value: 0.0 }, uTime: { value: 0 } },
    vertexShader: `varying vec3 vN; varying vec3 vP; varying float vY; void main(){ vY = uv.y; vec4 wp = modelMatrix*vec4(position,1.); vP = wp.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*wp; }`,
    fragmentShader: `uniform float uI; uniform float uTime; varying vec3 vN; varying vec3 vP; varying float vY;
      void main(){ vec3 v = normalize(cameraPosition - vP); float f = pow(abs(dot(normalize(vN), v)), 1.6);
        float along = smoothstep(0.0, 0.55, vY) * (0.35 + 0.65*vY);
        float n = 0.75 + 0.25*sin(vP.x*9.0 + uTime*0.4) * sin(vP.z*7.0 - uTime*0.3);
        gl_FragColor = vec4(vec3(1.0,0.78,0.48) * f * along * n * uI, 1.0); }`,
  }));
  beam.position.copy(LAMP.head); beam.quaternion.copy(shade.quaternion); scene.add(beam);
}
function setLamp(on) { lampSpot.intensity = LAMP_I * on; lampBulb.material.emissiveIntensity = 9 * on; beam.material.uniforms.uI.value = 0.075 * on; }

// ---------- desk + props ----------
function buildDesk() {
  const wood = TEX.wood; let mat;
  if (wood) { wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2.2, 2.2);
    const bump = wood.clone(); bump.colorSpace = THREE.NoColorSpace; bump.needsUpdate = true;
    mat = new THREE.MeshStandardMaterial({ map: wood, bumpMap: bump, bumpScale: 1.2, roughness: 0.38, metalness: 0, envMapIntensity: 0.35, color: 0x8a7a6c });
  } else mat = new THREE.MeshStandardMaterial({ color: 0x2a180c, roughness: .45 });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), mat); desk.rotation.x = -Math.PI / 2; desk.rotation.z = 0.06; desk.receiveShadow = true; scene.add(desk);
  if (TEX.map) {
    const g = new THREE.PlaneGeometry(1.5, 1.0, 24, 1); const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.max(0, (x - 0.55)) * 0.12 + Math.max(0, (-x - 0.6)) * 0.1); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: TEX.map, alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide, color: 0xd9ccb4, bumpMap: fibre, bumpScale: .6 }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = 0.32; m.position.set(-1.55, 0.002, -0.35); m.receiveShadow = true; m.castShadow = true; scene.add(m);
  }
  const pot = new THREE.Group(); pot.position.set(1.5, 0, -0.62); scene.add(pot);
  const prof = [[0, 0], [0.12, 0], [0.14, 0.02], [0.145, 0.1], [0.12, 0.15], [0.07, 0.17], [0.065, 0.2]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshPhysicalMaterial({ color: 0x0d1418, roughness: 0.08, metalness: 0, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.6 }));
  glass.castShadow = glass.receiveShadow = true; pot.add(glass);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.035, 32, 1, true), brass); collar.position.y = 0.205; pot.add(collar);
  const ink = new THREE.Mesh(new THREE.CircleGeometry(0.066, 32), new THREE.MeshStandardMaterial({ color: 0x020203, roughness: 0.05, metalness: 0.2 })); ink.rotation.x = -Math.PI / 2; ink.position.y = 0.2; pot.add(ink);
  if (TEX.quill) {
    const qa = TEX.quill.image.height / TEX.quill.image.width, qh = 0.95;
    const q = new THREE.Mesh(new THREE.PlaneGeometry(qh / qa, qh), new THREE.MeshStandardMaterial({ map: TEX.quill, alphaTest: 0.4, side: THREE.DoubleSide, roughness: .7 }));
    q.geometry.translate(0.06, qh / 2 - 0.02, 0); q.position.set(1.48, 0.17, -0.62); q.rotation.set(0, 0.6, -0.38); q.castShadow = true;
    q.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: TEX.quill, alphaTest: 0.4 }); scene.add(q);
  }
  const gl = new THREE.Group(); gl.position.set(1.32, 0.012, 0.78); gl.rotation.y = -0.5; scene.add(gl);
  const rimM = new THREE.MeshStandardMaterial({ color: 0x8c6a34, metalness: 1, roughness: .3 });
  for (const sx of [-1, 1]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.0045, 10, 48), rimM); rim.position.set(sx * 0.09, 0.07, 0); rim.rotation.x = -0.25; rim.castShadow = true; gl.add(rim);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.073, 40), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.95, roughness: 0.02, thickness: 0.01, transparent: true, opacity: 0.35, envMapIntensity: 1.5 }));
    lens.position.copy(rim.position); lens.rotation.copy(rim.rotation); gl.add(lens);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.26, 8), rimM); arm.rotation.x = Math.PI / 2 - 0.15; arm.position.set(sx * 0.165, 0.035, -0.13); arm.castShadow = true; gl.add(arm);
  }
  const bridge = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 8, 20, Math.PI), rimM); bridge.position.set(0, 0.085, 0); bridge.rotation.x = -0.25; gl.add(bridge);
}

// ---------- printed pages ----------
const PW = 1024, PH = Math.round(1024 * H / W);
let borderGold = null;
function paperBase(ctx, w, h) {
  if (TEX.paper) ctx.drawImage(TEX.paper.image, 0, 0, w, h); else { ctx.fillStyle = '#efe5cf'; ctx.fillRect(0, 0, w, h); }
  ctx.globalAlpha = 0.08; ctx.globalCompositeOperation = 'multiply';
  const n = noiseCanvas(); for (let y = 0; y < h; y += 512) for (let x = 0; x < w; x += 512) ctx.drawImage(n, x, y);
  ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(244,236,218,.18)'; ctx.fillRect(0, 0, w, h);
}
function drawMotif(ctx, motif, x0, w, h) {
  ctx.save(); ctx.strokeStyle = 'rgba(52,34,16,.16)'; ctx.fillStyle = 'rgba(52,34,16,.08)'; ctx.lineWidth = 2;
  const cx = x0 + w / 2, cy = h * 0.5;
  if (motif === 'chess') { const n = 8, s = 100, ox = cx - n * s / 2, oy = cy - n * s * .31;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2) { ctx.fillStyle = 'rgba(40,26,12,.12)'; ctx.fillRect(ox + i * s, oy + j * s * .62, s, s * .62); }
    ctx.strokeRect(ox, oy, n * s, n * s * .62);
  } else if (motif === 'grid') { for (let x = x0 + 90; x < x0 + w - 90; x += 44) for (let y = 140; y < h - 260; y += 44) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, 6.28); ctx.fill(); } }
  else if (motif === 'lines') { for (let y = 160; y < h - 280; y += 40) { let x = x0 + 130; while (x < x0 + w - 130) { const l = 30 + Math.random() * 110; ctx.fillRect(x, y, Math.min(l, x0 + w - 130 - x), 5); x += l + 16; } } }
  else if (motif === 'ripples') { for (let r = 60; r < w * .5; r += 70) { ctx.beginPath(); ctx.ellipse(cx, cy, r, r * .5, 0, 0, 6.28); ctx.stroke(); } }
  else if (motif === 'gears') { for (const [gx, gy, r] of [[cx - 260, cy - 260, 140], [cx + 220, cy + 160, 180]]) {
      ctx.beginPath(); for (let a = 0; a < 6.28; a += 6.28 / 48) { const rr = (Math.floor(a / (6.28 / 24)) % 2) ? r : r * .86; ctx.lineTo(gx + Math.cos(a) * rr, gy + Math.sin(a) * rr); } ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(gx, gy, r * .3, 0, 6.28); ctx.stroke(); } }
  ctx.restore();
}
function numberCartouche(ctx, x, y, n, col) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-58, 0); ctx.lineTo(-30, 0); ctx.moveTo(30, 0); ctx.lineTo(58, 0); ctx.stroke();
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.moveTo(s * 62, 0); ctx.lineTo(s * 68, -5); ctx.lineTo(s * 74, 0); ctx.lineTo(s * 68, 5); ctx.closePath(); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, 24, 0, 6.28); ctx.stroke();
  ctx.font = '600 26px Alexandria'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), 0, 2);
  ctx.restore();
}
// ---------- printed story (reader) ----------
// The pop-up stands on the far part of the spread; the near band (canvas y >= TXT_Y0) is the printed page:
// right page = number, title and the first paragraph; left page = the second paragraph and the «جرّب» line.
const TXT_Y0 = 905, TXT_Y1 = PH - 118, BODY = 'Amiri', INK = '#3a2412', INK_B = '#7a4510';
const TOC_ROWS = [];   // contents rows on the left page: { y0, y1, id } in canvas px
function richWords(html) {
  const out = []; let bold = false, glue = false;
  for (const part of String(html).split(/(<b>|<\/b>)/)) {
    if (part === '<b>') { bold = true; continue; } if (part === '</b>') { bold = false; continue; }
    const clean = part.replace(/<[^>]+>/g, ''), toks = clean.split(/\s+/).filter(Boolean);
    if (toks.length && out.length && glue && /^\S/.test(clean)) out[out.length - 1].t += toks.shift();   // «الشرق</b>.»: keep the dot on its word
    toks.forEach(t => out.push({ t, b: bold })); if (clean) glue = /\S$/.test(clean);
  }
  return out;
}
function wrapRich(ctx, words, maxW, size) {
  const lines = []; let line = [], lw = 0;
  ctx.font = `400 ${size}px ${BODY}`; const sp = ctx.measureText(' ').width;
  for (const wd of words) {
    ctx.font = `${wd.b ? 700 : 400} ${size}px ${BODY}`; wd.w = ctx.measureText(wd.t).width;
    if (line.length && lw + sp + wd.w > maxW) { lines.push(line); line = []; lw = 0; }
    lw += (line.length ? sp : 0) + wd.w; line.push(wd);
  }
  if (line.length) lines.push(line);
  return { lines, sp };
}
function fitRich(ctx, html, maxW, maxLines, size) {
  const words = richWords(html); let r;
  for (let s = size; s >= 28; s -= 2) { r = wrapRich(ctx, words, maxW, s); r.size = s; if (r.lines.length <= maxLines) break; }
  return r;
}
function drawRich(ctx, r, xr, y, maxW, lh, col = INK, colB = INK_B) {   // right-aligned, justified except the last line
  ctx.save(); ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic';
  r.lines.forEach((ln, i) => {
    const tw = ln.reduce((a, wd) => a + wd.w, 0), gaps = ln.length - 1;
    const sp = i < r.lines.length - 1 && gaps > 0 ? Math.min((maxW - tw) / gaps, r.sp * 2.2) : r.sp;
    let x = xr;
    for (const wd of ln) { ctx.font = `${wd.b ? 700 : 400} ${r.size}px ${BODY}`; ctx.fillStyle = wd.b ? colB : col; ctx.fillText(wd.t, x, y + i * lh); x -= wd.w + sp; }
  });
  ctx.restore();
  return y + (r.lines.length - 1) * lh;
}
function ornament(ctx, cx, y, wd, col) {   // a thin gold rule with a diamond
  ctx.save(); ctx.fillStyle = col; ctx.fillRect(cx - wd / 2, y, wd / 2 - 14, 2); ctx.fillRect(cx + 14, y, wd / 2 - 14, 2);
  ctx.beginPath(); ctx.moveTo(cx, y - 7); ctx.lineTo(cx + 8, y + 1); ctx.lineTo(cx, y + 9); ctx.lineTo(cx - 8, y + 1); ctx.closePath(); ctx.fill(); ctx.restore();
}
function printPages(sp, si, x, mx, bx) {
  const RX = PW + PW - 118, RW = PW - 118 - 132, LX = PW - 132, LW = PW - 132 - 118;   // right page: outer margin right; left page: outer margin left
  const gold = (ctx, col, fn) => { ctx.save(); fn(col); ctx.restore(); };
  const foilAll = fn => { x.save(); x.globalAlpha = 0.3; x.translate(2, 3); fn(x, 'rgba(70,45,15,1)'); x.restore(); fn(x, null); fn(mx, GOLD_MASK); bx.save(); bx.filter = 'blur(1.2px)'; fn(bx, '#ffffff'); bx.restore(); };
  if (sp.toc) {
    foilAll((ctx, col) => {
      ctx.textAlign = 'center'; ctx.direction = 'rtl'; ctx.font = '700 112px ArefRuqaa';
      ctx.fillStyle = col || goldGrad(ctx, PW + 260, TXT_Y0, PW + 760, TXT_Y0 + 140); ctx.fillText('الفهرس', PW + PW / 2 + 6, TXT_Y0 + 96);
      ornament(ctx, PW + PW / 2 + 6, TXT_Y0 + 134, 360, col || goldGrad(ctx, PW + 300, 0, PW + 720, 0));
    });
    x.save(); x.direction = 'rtl'; x.textAlign = 'center'; x.fillStyle = INK; x.font = `400 40px ${BODY}`;
    x.fillText('اختر الفصل اللي تبي تقرأه', PW + PW / 2 + 6, TXT_Y0 + 214);
    x.font = `400 32px ${BODY}`; x.fillStyle = 'rgba(70,48,22,.75)'; x.fillText('الفصول الجاهزة تنفتح باللمس… والباقي قريباً', PW + PW / 2 + 6, TXT_Y0 + 272); x.restore();
    TOC_ROWS.length = 0;
    const y0 = TXT_Y0 - 60, rh = (TXT_Y1 - y0) / LIBRARY.length;
    LIBRARY.forEach((c, i) => {
      const yb = y0 + rh * (i + 0.68), live = c.ready;
      TOC_ROWS.push({ y0: y0 + rh * i, y1: y0 + rh * (i + 1), id: c.id, ready: live });
      foilAll((ctx, col) => { ctx.direction = 'ltr'; ctx.textAlign = 'center'; ctx.font = '800 40px Alexandria';
        ctx.fillStyle = col || (live ? goldGrad(ctx, LX - 40, yb - 40, LX + 10, yb) : 'rgba(120,96,60,.55)'); ctx.fillText(c.n, LX - 18, yb); });
      x.save(); x.direction = 'rtl'; x.textAlign = 'right'; x.font = `${live ? 700 : 400} 38px ${BODY}`; x.fillStyle = live ? INK : 'rgba(80,60,35,.5)';
      x.fillText(c.title, LX - 62, yb);
      x.textAlign = 'left'; x.font = `400 28px ${BODY}`; x.fillStyle = live ? 'rgba(122,69,16,.9)' : 'rgba(80,60,35,.5)';
      x.fillText(live ? `${ar(SEQ.filter(q => q.ch === c.id).length)} صفحات` : 'قريباً', LX - LW, yb);
      if (i < LIBRARY.length - 1) { x.fillStyle = 'rgba(120,88,40,.18)'; x.fillRect(LX - LW, y0 + rh * (i + 1), LW, 1.5); }
      x.restore();
    });
    return;
  }
  const c = LIBRARY.find(q => q.id === sp.ch);
  // right page: chapter line, number + title in foil, ornament, first paragraph
  x.save(); x.direction = 'rtl'; x.textAlign = 'right'; x.font = `400 30px ${BODY}`; x.fillStyle = 'rgba(122,69,16,.85)';
  if (c) x.fillText(`${c.kicker} · ${c.title}`, RX, TXT_Y0 + 6); x.restore();
  foilAll((ctx, col) => {
    ctx.direction = 'rtl'; ctx.textAlign = 'right'; ctx.font = '700 66px ArefRuqaa';
    ctx.fillStyle = col || goldGrad(ctx, RX - RW, TXT_Y0 + 20, RX, TXT_Y0 + 100); ctx.fillText(sp.title, RX, TXT_Y0 + 86);
    ctx.direction = 'ltr'; ctx.textAlign = 'left'; ctx.font = '800 64px Alexandria';
    ctx.fillStyle = col || goldGrad(ctx, RX - RW, TXT_Y0 + 20, RX - RW + 200, TXT_Y0 + 90); ctx.fillText(sp.year, RX - RW, TXT_Y0 + 84);
    ctx.fillStyle = col || 'rgba(167,123,38,.9)'; ctx.fillRect(RX - RW, TXT_Y0 + 112, RW, 2);
  });
  const lh = 78, p1 = fitRich(x, sp.lines[0], RW, 3, 50);
  drawRich(x, p1, RX, TXT_Y0 + 178, RW, lh);
  // left page: second paragraph + the «جرّب» line
  if (sp.lines[1]) { const p2 = fitRich(x, sp.lines[1], LW, 4, 50); drawRich(x, p2, LX, TXT_Y0 + 60, LW, lh); }
  if (sp.tryText && false) foilAll((ctx, col) => {   // the «جرّب» line lives in the gold pill now
    ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.font = `700 34px ${BODY}`; ctx.fillStyle = col || '#8d6118';
    ctx.fillText(sp.tryText, LX - LW / 2, TXT_Y1 - 6); ornament(ctx, LX - LW / 2, TXT_Y1 - 62, 220, col || 'rgba(167,123,38,.9)');
  });
}
function spreadCanvases(si) {
  const sp = si >= 0 ? SEQ[si] : null, w = PW * 2, h = PH;   // si < 0: blank page pair (paper + border) for pages far from the reader
  const c = mkCanvas(w, h), m = mkCanvas(w, h), b = mkCanvas(w, h);
  const x = c.getContext('2d'), mx = m.getContext('2d'), bx = b.getContext('2d');
  paperBase(x, PW, h);
  x.save(); x.translate(w, 0); x.scale(-1, 1); paperBase(x, PW, h); x.restore();   // right page mirrored so toned edges sit outside
  mx.fillStyle = ROUGH_PAPER; mx.fillRect(0, 0, w, h);
  bx.fillStyle = '#808080'; bx.fillRect(0, 0, w, h); bx.globalAlpha = .5; bx.drawImage(noiseCanvas(), 0, 0, w, h); bx.drawImage(noiseCanvas(), 0, 0, 1024, 1024); bx.globalAlpha = 1;
  if (sp) { x.save(); if (READER) { x.beginPath(); x.rect(0, 0, w, TXT_Y0 - 40); x.clip(); } drawMotif(x, sp.motif, 0, PW, h); drawMotif(x, sp.motif, PW, PW, h); x.restore(); }
  if (TEX.border) for (const px of [0, PW]) {
    x.globalAlpha = 0.9; x.drawImage(TEX.border.image, px + 10, 10, PW - 20, h - 20); x.globalAlpha = 1;
    if (borderGold) { mx.drawImage(borderGold.m, px + 10, 10, PW - 20, h - 20); bx.drawImage(borderGold.b, px + 10, 10, PW - 20, h - 20); }
  }
  for (const side of [-1, 1]) {
    const g = x.createLinearGradient(w / 2, 0, w / 2 + side * 240, 0);
    g.addColorStop(0, 'rgba(60,36,14,.42)'); g.addColorStop(.3, 'rgba(60,36,14,.12)'); g.addColorStop(1, 'rgba(60,36,14,0)');
    x.fillStyle = g; x.fillRect(side < 0 ? w / 2 - 240 : w / 2, 0, 240, h);
  }
  // printed foil, embossed: year on the right page, title on the left page (bottom band, in front of the pop-up)
  const bandY = h - 175;
  const foil = (ctx, col) => {
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.direction = 'ltr'; ctx.font = '800 118px Alexandria';
    ctx.fillStyle = col || goldGrad(ctx, PW + 300, bandY - 100, PW + 720, bandY + 10);
    ctx.fillText(sp.year, PW + PW / 2, bandY + 20);
    ctx.direction = 'rtl'; ctx.font = '700 66px ArefRuqaa';
    ctx.fillStyle = col || goldGrad(ctx, 200, bandY - 60, 820, bandY + 20);
    ctx.fillText(sp.title, PW / 2, bandY + 8);
    ctx.fillRect(PW + PW / 2 - 150, bandY + 46, 300, 3); ctx.fillRect(PW / 2 - 150, bandY + 40, 300, 3);
    ctx.restore();
  };
  if (sp && READER) printPages(sp, si, x, mx, bx);    // reader: the story is printed on the page itself
  else if (sp && sp.toc) {   // contents page: big foil title + emblem on the right page (the list itself is the HTML sheet)
    const tocFoil = (ctx, col) => {
      ctx.save(); ctx.textAlign = 'center'; ctx.direction = 'rtl';
      ctx.font = '700 120px ArefRuqaa'; ctx.fillStyle = col || goldGrad(ctx, PW + 200, 200, PW + 820, 420);
      ctx.fillText('الفهرس', PW + PW / 2, h - 150);
      ctx.fillRect(PW + PW / 2 - 170, h - 118, 340, 3);
      ctx.font = '700 66px ArefRuqaa'; ctx.fillStyle = col || goldGrad(ctx, 200, h - 260, 820, h - 140);
      ctx.fillText('اختر فصلاً', PW / 2, h - 167); ctx.fillRect(PW / 2 - 150, h - 135, 300, 3);
      ctx.restore();
    };
    x.save(); x.globalAlpha = 0.35; x.translate(2, 3); tocFoil(x, 'rgba(70,45,15,1)'); x.restore();
    tocFoil(x, null); tocFoil(mx, GOLD_MASK); bx.save(); bx.filter = 'blur(1.5px)'; tocFoil(bx, '#ffffff'); bx.restore();
  } else if (sp) {
    x.save(); x.globalAlpha = 0.35; x.translate(2, 3); foil(x, 'rgba(70,45,15,1)'); x.restore();
    foil(x, null); foil(mx, GOLD_MASK); bx.save(); bx.filter = 'blur(1.5px)'; foil(bx, '#ffffff'); bx.restore();
  }
  if (sp) {
    numberCartouche(x, w - 150, h - 72, si * 2 + 2, 'rgba(70,48,22,.85)');
    numberCartouche(x, 150, h - 72, si * 2 + 3, 'rgba(70,48,22,.85)');
  }
  const halves = [];
  for (const px of [0, PW]) {
    const hc = mkCanvas(PW, h), hm = mkCanvas(PW, h), hb = mkCanvas(PW, h);
    hc.getContext('2d').drawImage(c, px, 0, PW, h, 0, 0, PW, h);
    hm.getContext('2d').drawImage(m, px, 0, PW, h, 0, 0, PW, h);
    hb.getContext('2d').drawImage(b, px, 0, PW, h, 0, 0, PW, h);
    halves.push({ map: canvasTex(hc), rm: canvasTex(hm, false), bump: canvasTex(hb, false) });
  }
  return { left: halves[0], right: halves[1] };
}
function prepBorderGold() {
  if (!TEX.border) return;
  const img = TEX.border.image, w = img.width, h = img.height;
  const src = mkCanvas(w, h), sx = src.getContext('2d'); sx.drawImage(img, 0, 0);
  const d = sx.getImageData(0, 0, w, h).data;
  const m = mkCanvas(w, h), b = mkCanvas(w, h), mc = m.getContext('2d'), bc = b.getContext('2d'), mi = mc.createImageData(w, h), bi = bc.createImageData(w, h);
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] / 255, gold = clamp((d[i] - d[i + 2] - 50) / 50) * a;
    mi.data[i] = 0; mi.data[i + 1] = lerp(236, 92, gold); mi.data[i + 2] = 200 * gold; mi.data[i + 3] = Math.round(255 * gold);
    const v = 128 + 120 * a; bi.data[i] = bi.data[i + 1] = bi.data[i + 2] = v; bi.data[i + 3] = Math.round(255 * a);
  }
  mc.putImageData(mi, 0, 0); bc.putImageData(bi, 0, 0);
  borderGold = { m, b };
}
function pageMat(hf) {
  return new THREE.MeshStandardMaterial({ map: hf.map, roughnessMap: hf.rm, metalnessMap: hf.rm, roughness: 1, metalness: 1, bumpMap: hf.bump, bumpScale: 1.4, envMapIntensity: 1.0 });
}

// ---------- book ----------
const book = new THREE.Group(); scene.add(book);
let leatherMat, coverGroup, spine, ribbon;
const leaves = [];
function edgeTex() {
  const c = mkCanvas(64, 512), x = c.getContext('2d'); x.fillStyle = '#e6dcc4'; x.fillRect(0, 0, 64, 512);
  for (let y = 0; y < 512; y += 3) { x.fillStyle = `rgba(110,80,40,${.12 + Math.random() * .22})`; x.fillRect(0, y, 64, 1); }
  return canvasTex(c);
}
const gildMat = new THREE.MeshStandardMaterial({ color: 0xc9a050, roughness: 0.3, metalness: 1, bumpMap: fibre, bumpScale: .5, envMapIntensity: 1.2 });
const edgeMat = new THREE.MeshStandardMaterial({ map: edgeTex(), roughness: 0.95 });
function leatherMaterial() {
  const t = TEX.leather;
  if (t) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.4, 1.4); const bump = t.clone(); bump.colorSpace = THREE.NoColorSpace; bump.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: t, bumpMap: bump, bumpScale: 3, roughness: 0.55, color: 0x9a8a80, envMapIntensity: .7 }); }
  return new THREE.MeshStandardMaterial({ color: 0x24140c, roughness: .6 });
}
function coverCanvases() {
  const w = 1024, h = Math.round(1024 * (H + 0.06) / (W + 0.04));
  const c = mkCanvas(w, h), m = mkCanvas(w, h), b = mkCanvas(w, h), x = c.getContext('2d'), mx = m.getContext('2d'), bx = b.getContext('2d');
  if (TEX.leather) { x.drawImage(TEX.leather.image, 0, 0, w, h); x.fillStyle = 'rgba(30,14,6,.25)'; x.fillRect(0, 0, w, h); } else { x.fillStyle = '#21130b'; x.fillRect(0, 0, w, h); }
  const vg = x.createRadialGradient(w / 2, h / 2, w * .2, w / 2, h / 2, w * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)'); x.fillStyle = vg; x.fillRect(0, 0, w, h);
  mx.fillStyle = 'rgb(0,150,10)'; mx.fillRect(0, 0, w, h);
  bx.fillStyle = '#808080'; bx.fillRect(0, 0, w, h); if (TEX.leather) { bx.globalAlpha = .6; bx.drawImage(TEX.leather.image, 0, 0, w, h); bx.globalAlpha = 1; }
  const draw = (ctx, col) => {
    const gg = col || goldGrad(ctx, 0, 0, w, h);
    ctx.strokeStyle = gg; ctx.fillStyle = gg; ctx.lineWidth = 6; ctx.strokeRect(50, 50, w - 100, h - 100);
    ctx.lineWidth = 2; ctx.strokeRect(68, 68, w - 136, h - 136);
    for (const [cx, cy] of [[68, 68], [w - 68, 68], [68, h - 68], [w - 68, h - 68]]) { ctx.beginPath(); ctx.arc(cx, cy, 11, 0, 6.28); ctx.fill(); }
    if (IMG.cover_emblem) {
      const s = 480, ex = (w - s) / 2, ey = h * 0.15, em = IMG.cover_emblem.image;
      if (col) { const tmp = mkCanvas(s, s), tx = tmp.getContext('2d'); tx.drawImage(em, 0, 0, s, s); tx.globalCompositeOperation = 'source-in'; tx.fillStyle = col; tx.fillRect(0, 0, s, s); ctx.drawImage(tmp, ex, ey); }
      else ctx.drawImage(em, ex, ey, s, s);
    }
    ctx.direction = 'rtl'; ctx.textAlign = 'center';
    ctx.font = '700 118px ArefRuqaa'; ctx.fillStyle = col || goldGrad(ctx, 200, h * .6, w - 200, h * .76);
    const CL = READER ? BOOK_COVER.lines : ['قصة الذكاء', 'الاصطناعي'];
    ctx.fillText(CL[0], w / 2, h * 0.665); ctx.fillText(CL[1], w / 2, h * 0.665 + 132);
    ctx.font = '500 42px Alexandria'; ctx.fillText(READER ? BOOK_COVER.subtitle : COVER.subtitle, w / 2, h * 0.665 + 232);
    ctx.fillRect(w / 2 - 130, h * 0.665 + 166, 260, 3);
  };
  x.save(); x.globalAlpha = .55; x.translate(3, 4); draw(x, 'rgba(0,0,0,1)'); x.restore();
  draw(x, null); draw(mx, GOLD_MASK); bx.save(); bx.filter = 'blur(2px)'; draw(bx, '#ffffff'); bx.restore();
  const tex = canvasTex(c), rm = canvasTex(m, false), bump = canvasTex(b, false);
  for (const t of [tex, rm, bump]) { t.center.set(.5, .5); t.rotation = Math.PI; }
  return { tex, rm, bump };
}
function cornerCaps(parent, x0, sx) {
  const L = 0.085, Z = (H + 0.06) / 2;
  for (const sz of [-1, 1]) {
    const s = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-L * sx, 0), new THREE.Vector2(0, -L * sz)]);
    const g = new THREE.ExtrudeGeometry(s, { depth: T + 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.003, bevelSegments: 2 });
    g.rotateX(Math.PI / 2); g.translate(x0 + 0.002 * sx, T + 0.003, sz * (Z + 0.002));
    const m = new THREE.Mesh(g, brass); m.castShadow = true; parent.add(m);
  }
}
function makeLeafGeoms() {
  const pos = new THREE.BufferAttribute(new Float32Array((NS + 1) * (NM + 1) * 3), 3); pos.setUsage(THREE.DynamicDrawUsage);
  const mk = back => {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', pos);
    const uv = new Float32Array((NS + 1) * (NM + 1) * 2);
    for (let j = 0; j <= NM; j++) for (let i = 0; i <= NS; i++) { const k = j * (NS + 1) + i; uv[k * 2] = back ? i / NS : 1 - i / NS; uv[k * 2 + 1] = 1 - j / NM; }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    const idx = [];
    for (let j = 0; j < NM; j++) for (let i = 0; i < NS; i++) { const a = j * (NS + 1) + i, b2 = a + 1, c = a + NS + 1, d = c + 1; if (!back) idx.push(a, b2, c, b2, d, c); else idx.push(a, c, b2, b2, c, d); }
    g.setIndex(idx); return g;
  };
  return { pos, front: mk(false), back: mk(true) };
}
function poseLeaf(L) {
  const { phi, curl } = L, t = phi / Math.PI;
  const pivotY = lerp(T + B + (L.i + 1) * G, T + B + (K - L.i) * G, t);
  const arr = L.pos.array, dw = W / NS, flat = 1 - Math.sin(phi);
  for (let j = 0; j <= NM; j++) {
    const vz = j / NM - 0.5, z = vz * H; let x = 0, y = 0;
    for (let i = 0; i <= NS; i++) {
      const k = (j * (NS + 1) + i) * 3;
      arr[k] = x; arr[k + 1] = pivotY + y + flat * 0.014 * (1 - Math.exp(-Math.abs(x) / 0.1)); arr[k + 2] = z;
      const s = (i + 0.5) / NS;
      const a = clamp(phi - curl * (Math.pow(s, 1.3) * 1.1 + vz * s * 0.8), 0, Math.PI);
      x += Math.cos(a) * dw; y += Math.sin(a) * dw;
    }
  }
  L.pos.needsUpdate = true; L.front.computeVertexNormals(); L.back.computeVertexNormals();
}
function leafEdgePoint(L, j) { const k = (j * (NS + 1) + NS) * 3, a = L.pos.array; return new THREE.Vector3(a[k], a[k + 1], a[k + 2]); }
// Printed pages. Reel: all built up front. Reader: only the open spread and its neighbours carry real pages;
// every other face shows a shared blank page, so texture memory stays flat however many chapters the book has.
const PAGES = new Map(); let BLANK = null, ltMesh, rtMesh;
function faceMesh(si, side) { return side === 'left' ? (si < K ? leaves[si].mF : ltMesh) : (si > 0 ? leaves[si - 1].mB : rtMesh); }
function buildPages(si) { const c = spreadCanvases(si); return { c, left: pageMat(c.left), right: pageMat(c.right) }; }
function disposePages(pg) { for (const side of ['left', 'right']) { const hf = pg.c[side]; hf.map.dispose(); hf.rm.dispose(); hf.bump.dispose(); pg[side].dispose(); } }
function initialMat(si, side) { if (LAZY) return BLANK[side]; let pg = PAGES.get(si); if (!pg) { pg = buildPages(si); PAGES.set(si, pg); } return pg[side]; }
function ensurePages(center, keep = []) {
  if (!LAZY) return;
  const want = new Set([center - 1, center, center + 1, ...keep].filter(s => s >= 0 && s <= K));
  for (const [si, pg] of PAGES) if (!want.has(si)) { faceMesh(si, 'left').material = BLANK.left; faceMesh(si, 'right').material = BLANK.right; disposePages(pg); PAGES.delete(si); }
  for (const si of want) if (!PAGES.has(si)) { const pg = buildPages(si); PAGES.set(si, pg); faceMesh(si, 'left').material = pg.left; faceMesh(si, 'right').material = pg.right; }
}
function buildBook() {
  leatherMat = leatherMaterial();
  if (LAZY) { const c = spreadCanvases(-1); BLANK = { c, left: pageMat(c.left), right: pageMat(c.right) }; }
  const back = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, T, H + 0.06), leatherMat); back.position.set(-(W + 0.04) / 2, T / 2, 0); back.castShadow = back.receiveShadow = true; book.add(back);
  cornerCaps(book, -(W + 0.04), -1);
  const lb = new THREE.Mesh(new THREE.BoxGeometry(W, B, H), [edgeMat, gildMat, edgeMat, edgeMat, gildMat, gildMat]); lb.position.set(-W / 2, T + B / 2, 0); lb.castShadow = lb.receiveShadow = true; book.add(lb);
  const lt = new THREE.Mesh(new THREE.PlaneGeometry(W, H), initialMat(K, 'left')); lt.rotation.x = -Math.PI / 2; lt.position.set(-W / 2, T + B + 0.0008, 0); lt.receiveShadow = true; book.add(lt); ltMesh = lt;
  coverGroup = new THREE.Group(); book.add(coverGroup);
  const fb = new THREE.Mesh(new THREE.BoxGeometry(W + 0.04, T, H + 0.06), leatherMat); fb.position.set((W + 0.04) / 2, T / 2, 0); fb.castShadow = fb.receiveShadow = true; coverGroup.add(fb);
  cornerCaps(coverGroup, W + 0.04, 1);
  const rb = new THREE.Mesh(new THREE.BoxGeometry(W, B, H), [gildMat, edgeMat, edgeMat, edgeMat, gildMat, gildMat]); rb.position.set(W / 2, T + B / 2, 0); rb.castShadow = rb.receiveShadow = true; coverGroup.add(rb);
  const rt = new THREE.Mesh(new THREE.PlaneGeometry(W, H), initialMat(0, 'right')); rt.rotation.x = -Math.PI / 2; rt.position.set(W / 2, T + B + 0.0008, 0); rt.receiveShadow = true; coverGroup.add(rt); rtMesh = rt;
  const cc = coverCanvases();
  const title = new THREE.Mesh(new THREE.PlaneGeometry(W + 0.04, H + 0.06), new THREE.MeshStandardMaterial({ map: cc.tex, roughnessMap: cc.rm, metalnessMap: cc.rm, roughness: 1, metalness: 1, bumpMap: cc.bump, bumpScale: 3, envMapIntensity: 1.3 }));
  title.rotation.x = Math.PI / 2; title.position.set((W + 0.04) / 2, -0.0008, 0); title.receiveShadow = true; coverGroup.add(title);
  spine = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1, H + 0.06), leatherMat); spine.castShadow = true; book.add(spine);
  for (let i = 0; i < K; i++) {
    const g = makeLeafGeoms(), L = { i, pos: g.pos, front: g.front, back: g.back, phi: Math.PI, curl: 0 };
    L.mF = new THREE.Mesh(g.front, initialMat(i, 'left')); L.mB = new THREE.Mesh(g.back, initialMat(i + 1, 'right'));
    for (const m of [L.mF, L.mB]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; book.add(m); }
    leaves.push(L); poseLeaf(L);
  }
  buildRibbon();
}
function buildRibbon() {
  const n = 48, geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((n + 1) * 2 * 3), 3));
  const uv = [], idx = []; for (let i = 0; i <= n; i++) { uv.push(0, i / n, 1, i / n); if (i < n) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  const mat = new THREE.MeshPhysicalMaterial({ color: 0x6e0f1c, roughness: 0.42, sheen: 1, sheenColor: new THREE.Color(0xff8a8a), sheenRoughness: 0.35, side: THREE.DoubleSide, envMapIntensity: .8 });
  ribbon = new THREE.Mesh(geo, mat); ribbon.castShadow = true; ribbon.receiveShadow = true; ribbon.frustumCulled = false; scene.add(ribbon);
  ribbon.userData.n = n;
}
function updateRibbon(open, time) {
  const z = H / 2, sw = Math.sin(time * 0.9) * 0.012;
  const closedP = [[-0.14, P_CLOSED * 0.55, z - 0.05], [-0.14, P_CLOSED * 0.5, z + 0.012], [-0.12, 0.03, z + 0.05], [-0.06, 0.002, z + 0.2], [0.06 + sw, 0.002, z + 0.33], [0.13 + sw * 2, 0.002, z + 0.43]];
  const openP = [[0.05, T + B + 0.0015, z - 0.3], [0.05, T + B + 0.0015, z - 0.01], [0.06, T + B - 0.01, z + 0.03], [0.09, 0.012, z + 0.09], [0.16 + sw, 0.002, z + 0.24], [0.3 + sw * 2, 0.002, z + 0.34]];
  const pts = closedP.map((p, i) => new THREE.Vector3(lerp(p[0], openP[i][0], open), lerp(p[1], openP[i][1], open), lerp(p[2], openP[i][2], open)));
  const curve = new THREE.CatmullRomCurve3(pts), n = ribbon.userData.n, arr = ribbon.geometry.attributes.position.array;
  const up = new THREE.Vector3(0, 1, 0), side = new THREE.Vector3();
  for (let i = 0; i <= n; i++) {
    const t = i / n, p = curve.getPointAt(t), tg = curve.getTangentAt(t);
    side.crossVectors(tg, up); if (side.lengthSq() < 1e-4) side.set(1, 0, 0); side.normalize().multiplyScalar(0.0135);
    arr.set([p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z], i * 6);
  }
  ribbon.geometry.attributes.position.needsUpdate = true; ribbon.geometry.computeVertexNormals();
}

// ---------- thick die-cut cards ----------
const cardEdgeBase = new THREE.MeshStandardMaterial({ color: 0xd8cbb0, roughness: 0.95, bumpMap: fibre3, bumpScale: 1 });
const cardBackBase = new THREE.MeshStandardMaterial({ color: 0xe3d7bf, roughness: 0.93, bumpMap: fibre3, bumpScale: .8 });
function cardGeometry(json, w, centered = false) {
  const asp = json.h / json.w;
  const shapes = json.shapes.map(sd => { const s = new THREE.Shape(sd.outer.map(([u, v]) => new THREE.Vector2(u, v * asp)));
    s.holes = sd.holes.map(hh => new THREE.Path(hh.map(([u, v]) => new THREE.Vector2(u, v * asp)))); return s; });
  const depth = 0.006 / w, bev = 0.0016 / w;
  const uvg = {
    generateTopUV(g, v, a, b, c) { return [a, b, c].map(i => new THREE.Vector2(v[i * 3], v[i * 3 + 1] / asp)); },
    generateSideWallUV(g, v, a, b, c, d) { return [a, b, c, d].map(i => new THREE.Vector2(v[i * 3] * 3 + v[i * 3 + 1], v[i * 3 + 2] * 30)); },
  };
  const geo = new THREE.ExtrudeGeometry(shapes, { depth, bevelEnabled: true, bevelThickness: bev, bevelSize: bev * 0.8, bevelSegments: 2, curveSegments: 1, UVGenerator: uvg });
  const [caps, sides] = geo.groups.map(g => ({ ...g })); const half = caps.count / 2;
  const z0 = geo.attributes.position.getZ(caps.start);
  geo.clearGroups();
  const backFirst = z0 < depth / 2;
  geo.addGroup(caps.start, half, backFirst ? 2 : 0); geo.addGroup(caps.start + half, half, backFirst ? 0 : 2);
  if (sides) geo.addGroup(sides.start, sides.count, 1);
  geo.computeBoundingBox(); const bb = geo.boundingBox;
  if (centered) geo.translate(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -depth / 2);
  else geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -depth / 2);
  geo.scale(w, w, w);
  return { geo, h: (bb.max.y - bb.min.y) * w, w: (bb.max.x - bb.min.x) * w };
}
function cardMesh(name, w, centered) {
  const c = CARD[name]; if (!c) return null;
  const { geo, h, w: ww } = cardGeometry(c.json, w, centered);
  const front = new THREE.MeshStandardMaterial({ map: c.tex, roughnessMap: c.rm, metalnessMap: c.rm, roughness: 1, metalness: 1, bumpMap: fibre3, bumpScale: .7, envMapIntensity: 1.15 });
  const mesh = new THREE.Mesh(geo, [front, cardEdgeBase.clone(), cardBackBase.clone()]);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return { mesh, h, w: ww };
}

// ---------- pop-up layers ----------
const spreadsRT = [];
const tabMat = new THREE.MeshStandardMaterial({ color: 0xe0d4bb, roughness: .95, bumpMap: fibre3, bumpScale: .6 });
const UP = new THREE.Vector3(0, 1, 0), XAX = new THREE.Vector3(1, 0, 0);
function makeLayer(group, cfg, idx) {
  const c = CARD[cfg.img]; if (!c) return null;
  const asp = c.json.h / c.json.w, w = cfg.h ? cfg.h / asp : cfg.w;
  const L = { cfg, idx, base: new THREE.Group(), inner: new THREE.Group(), u: 0, lean: 0.05 + 0.025 * ((idx * 37) % 7) / 7, flatDir: (cfg.z0 ?? cfg.z) < 0.05 ? 1 : -1, tabs: [], fade: -1 };
  L.base.position.set(cfg.x, PAGE_Y + idx * 0.0005, cfg.z); group.add(L.base); L.base.add(L.inner);
  if (cfg.spin) {
    const cm = cardMesh(cfg.img, w, true), fl = cfg.float || 0; L.h = cm.h + fl; L.w = cm.w;
    L.spinner = new THREE.Group(); L.spinner.position.y = cm.h / 2 + fl; L.spinner.add(cm.mesh); L.inner.add(L.spinner);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.014, cm.h / 2 + fl, 0.005), tabMat.clone()); stem.position.set(0, (cm.h / 2 + fl) / 2, -0.008); stem.castShadow = true; L.inner.add(stem);
    L.mesh = cm.mesh;
  } else {
    const cm = cardMesh(cfg.img, w, false); L.h = cm.h; L.w = cm.w; L.inner.add(cm.mesh); L.mesh = cm.mesh;
    if (!cfg.id && L.h > 0.22 && (cfg.z0 ?? cfg.z) < -0.2) for (const s of [-1, 1]) {           // glued support tabs behind the card
      const tab = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.003), tabMat.clone()); tab.geometry.translate(0, 0.5, 0);
      tab.castShadow = true; tab.receiveShadow = true; group.add(tab);
      L.tabs.push({ m: tab, tx: s * Math.min(L.w * 0.28, 0.4), hT: Math.min(0.24, L.h * 0.34) });
    }
  }
  L.mesh.traverse(o => { if (o.isMesh && cfg.hit) o.userData.hit = cfg.hit; });
  if (idx === 0) L.mesh.material[0].color.setHex(0xd2c8b8); // aerial depth: back plates slightly dimmer
  return L;
}
function procLayer(group, z, idx) {
  const L = { cfg: { z, x: 0 }, idx, base: new THREE.Group(), inner: new THREE.Group(), u: 0, lean: 0.02, flatDir: 1, tabs: [], fade: -1, h: 0.5 };
  L.base.position.set(0, PAGE_Y + idx * 0.0005, z); group.add(L.base); L.base.add(L.inner); return L;
}
function setOpacity(root, a) {
  root.traverse(o => { if (!o.material || o.isSprite) return; const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) { if (m.userData.o0 === undefined) { m.userData.o0 = m.opacity; m.userData.t0 = m.transparent; }
      m.opacity = m.userData.o0 * a; const tr = a < 0.999 || m.userData.t0; if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; } } });
}
const _v = new THREE.Vector3(), _p0 = new THREE.Vector3(), _p1 = new THREE.Vector3();
function applyLayer(L, u, time) {
  const vis = u > 0.003; L.base.visible = vis; for (const t of L.tabs) t.m.visible = vis; if (!vis) return;
  const fade = smooth(u / 0.32), rise = clamp((u - 0.04) / 0.96);
  const flat = L.flatDir * Math.PI / 2 * 0.88;
  let rx = lerp(flat, -L.lean, easeOutBack(rise, 1.25));
  if (L.cfg.sway) rx += Math.sin(time * 0.7 + L.idx) * 0.008;
  L.base.rotation.x = rx;
  if (Math.abs(fade - L.fade) > 0.002) { L.fade = fade; setOpacity(L.base, fade); for (const t of L.tabs) setOpacity(t.m, fade); }
  for (const t of L.tabs) {
    _p1.set(t.tx, t.hT, -0.006).applyAxisAngle(XAX, rx).add(L.base.position);
    _p0.set(L.cfg.x + t.tx, PAGE_Y - 0.001, L.cfg.z - 0.14);
    _v.subVectors(_p1, _p0); const len = _v.length();
    t.m.position.copy(_p0); t.m.scale.set(1, Math.max(0.001, len), 1); t.m.quaternion.setFromUnitVectors(UP, _v.normalize());
  }
}

// ---------- text cards (paper with thickness) ----------
function textCard(text, { w = 0.3, h = 0.13, font = 'Alexandria', size = 64, weight = 700, bg = '#f4ecd9', ink = '#1d130a', border = true, bubble = false, tail = 0 } = {}) {
  const pxw = 640, pxh = Math.round(pxw * h / w), c = mkCanvas(pxw, pxh), m = mkCanvas(pxw, pxh), x = c.getContext('2d'), mx = m.getContext('2d');
  const draw = (ctx, isM) => {
    ctx.clearRect(0, 0, pxw, pxh);
    const r = bubble ? pxh * .32 : 18, bh = bubble ? pxh * .8 : pxh - 8;
    ctx.beginPath(); ctx.roundRect(4, 4, pxw - 8, bh - 4, r);
    if (bubble) { const tx = tail > 0 ? pxw * .78 : pxw * .22; ctx.moveTo(tx - 26, bh - 2); ctx.lineTo(tx + tail * 10, pxh - 4); ctx.lineTo(tx + 26, bh - 2); }
    ctx.fillStyle = isM ? ROUGH_PAPER : bg; ctx.fill();
    if (!isM) { ctx.save(); ctx.clip(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = .1; ctx.drawImage(noiseCanvas(), 0, 0, pxw, pxh); ctx.restore(); }
    if (border) { ctx.lineWidth = 6; ctx.strokeStyle = isM ? GOLD_MASK : goldGrad(ctx, 0, 0, pxw, pxh); ctx.beginPath(); ctx.roundRect(12, 12, pxw - 24, bh - 20, r * .8); ctx.stroke(); }
    if (!isM) { ctx.fillStyle = ink; ctx.direction = 'rtl'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let fs = size; ctx.font = `${weight} ${fs}px ${font}`; while (ctx.measureText(text).width > pxw - 70 && fs > 18) { fs -= 2; ctx.font = `${weight} ${fs}px ${font}`; }
      ctx.fillText(text, pxw / 2, bh / 2 + 2); }
  };
  draw(x, false); draw(mx, true);
  const tex = canvasTex(c), rm = canvasTex(m, false);
  const face = new THREE.MeshStandardMaterial({ map: tex, roughnessMap: rm, metalnessMap: rm, roughness: 1, metalness: 1, alphaTest: 0.3, side: THREE.DoubleSide, envMapIntensity: 1.1 });
  let mesh;
  if (bubble) { const geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0); mesh = new THREE.Mesh(geo, face);
    mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: tex, alphaTest: 0.3 }); }
  else { face.alphaTest = 0; face.side = THREE.FrontSide; const geo = new THREE.BoxGeometry(w * 0.985, h * 0.94, 0.006); geo.translate(0, h / 2, 0);
    mesh = new THREE.Mesh(geo, [cardEdgeBase.clone(), cardEdgeBase.clone(), cardEdgeBase.clone(), cardEdgeBase.clone(), face, cardBackBase.clone()]); }
  mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.userData.redraw = t => { text = t; draw(x, false); tex.needsUpdate = true; };
  mesh.userData.face = face;
  return mesh;
}

// ---------- procedural scene pieces ----------
const goldC = new THREE.Color(0xffc861);
function haloTexture() { const c = mkCanvas(128, 128), x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,220,140,1)'); g.addColorStop(.3, 'rgba(255,190,80,.5)'); g.addColorStop(1, 'rgba(255,170,60,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return canvasTex(c); }
const HALO = haloTexture();
function buildProc(kind, L, rt, sp) {
  if (kind === 'net') {
    const cols = [4, 5, 5, 3], xs = [0.44, 0.16, -0.14, -0.42], nodes = [];
    const discTex = (() => { const c = mkCanvas(128, 128), x = c.getContext('2d'); x.fillStyle = '#f6f0e3'; x.fillRect(0, 0, 128, 128);
      x.beginPath(); x.arc(64, 64, 58, 0, 6.28); x.lineWidth = 8; x.strokeStyle = '#1a120a'; x.stroke(); x.lineWidth = 4; x.strokeStyle = '#b08a3a'; x.beginPath(); x.arc(64, 64, 38, 0, 6.28); x.stroke(); return canvasTex(c); })();
    cols.forEach((n, ci) => {
      for (let r = 0; r < n; r++) {
        const y = 0.36 + (r - (n - 1) / 2) * 0.115, z = 0.06 + (ci % 2 ? 0.03 : -0.03);
        const face = new THREE.MeshStandardMaterial({ map: discTex, roughness: .8, emissive: goldC, emissiveIntensity: 0 });
        const m = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.007, 40), [cardEdgeBase.clone(), face, cardBackBase.clone()]);
        m.rotation.x = Math.PI / 2; m.position.set(xs[ci], y, z); m.castShadow = true; L.inner.add(m);
        const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: HALO, color: 0xffd27a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
        halo.position.set(xs[ci], y, z + 0.012); halo.scale.setScalar(0.2); L.inner.add(halo);
        nodes.push({ m, face, halo, ci, a: 0 });
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.007, y, 0.003), tabMat.clone()); st.position.set(xs[ci], y / 2, z - 0.006); st.castShadow = true; L.inner.add(st);
      }
    });
    const segs = [];
    for (const a of nodes) for (const b of nodes) if (b.ci === a.ci + 1) {
      const pa = a.m.position, pb = b.m.position, len = pa.distanceTo(pb);
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.0028, 0.0028, len, 6), new THREE.MeshBasicMaterial({ color: 0x2a1d10, transparent: true, opacity: 0.6 }));
      cyl.position.copy(pa).lerp(pb, .5); cyl.position.z -= 0.008; cyl.quaternion.setFromUnitVectors(UP, pb.clone().sub(pa).normalize()); L.inner.add(cyl);
      segs.push([a, b, cyl]);
    }
    const label = textCard('قطة', { w: 0.24, h: 0.12, size: 80, bg: '#1a120a', ink: '#f3d995' });
    label.position.set(-0.64, 0.4, 0.04); label.scale.setScalar(0.001); L.inner.add(label);
    rt.extra.net = { nodes, segs, label, pulse: -1, loopStart: null };
  }
  if (kind === 'words') {
    const tiles = [], n = WORDS.length;
    WORDS.forEach((wd, i) => {
      const x = lerp(0.62, -0.62, i / (n - 1)), z = -Math.pow((i - (n - 1) / 2) / 2, 2) * 0.12;
      const card = textCard(wd, { w: 0.3, h: 0.15, size: 80, bg: '#21160c', ink: '#f6e4b6' }); card.position.set(x, 0.08, z); card.rotation.y = -x * 0.25;
      card.userData.hit = 'word'; card.userData.word = i; L.inner.add(card);
      const stem = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.08, 0.003), tabMat.clone()); stem.position.set(x, 0.04, z - 0.006); L.inner.add(stem);
      tiles.push({ card, top: new THREE.Vector3(x, 0.235, z) });
    });
    rt.extra.words = { tiles, arcs: [], L, sel: -1 };
  }
  if (kind === 'catq') {          // 1997 cat beat: a cat card the chess computer cannot name
    const c = CARD.s3_cat, asp = c ? c.json.h / c.json.w : 1.4;
    const cm = cardMesh('s3_cat', 0.34 / asp, false); const cat = new THREE.Group();
    if (cm) { cat.add(cm.mesh); cm.mesh.material[0].color.setHex(0xe8dfcf); } cat.position.set(-0.27, 0, 0.2); cat.scale.setScalar(0.001); L.inner.add(cat);
    const q = textCard('؟', { w: 0.2, h: 0.24, size: 190, weight: 800, bg: '#f4ead2', ink: '#5a3608' });
    q.position.set(-0.4, 0.3, -0.12); q.scale.setScalar(0.001); L.inner.add(q);
    rt.extra.catq = { cat, q };
  }
  if (kind === 'chat') {
    const q = textCard(CHATS[0][0], { w: 0.52, h: 0.15, size: 50, weight: 600, bubble: true, tail: 1 });
    const a = textCard(CHATS[0][1], { w: 0.62, h: 0.16, size: 46, weight: 600, bubble: true, tail: -1, bg: '#efd9a0' });
    q.position.set(0.16, 0.66, 0.0); a.position.set(-0.1, 0.47, 0.05);
    const counter = textCard('0', { w: 0.42, h: 0.12, size: 70, weight: 800, bg: '#1a120a', ink: '#f3d995' });
    counter.position.set(-0.5, 0.02, 0.26); counter.rotation.y = 0.2;
    const cap = textCard(COUNTER_CAPTION, { w: 0.34, h: 0.08, size: 54, weight: 700, border: false });
    cap.position.set(-0.5, 0.15, 0.26); cap.rotation.y = 0.2;
    for (const m of [q, a]) m.scale.setScalar(0.001);
    L.inner.add(q, a, counter, cap);
    rt.extra.chat = { q, a, counter, cap, i: 0 };
  }
  // ----- chapter 2 -----
  function stemAt(L, x, h, z) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.008, h, 0.003), tabMat.clone()); st.position.set(x, h / 2, z); L.inner.add(st); }
  const D = sp && CHDATA[sp.ch] ? CHDATA[sp.ch][kind] : null;
  if (kind === 'nextword') {   // sentence + three guesses whose gold bars grow; the strongest guess completes the sentence
    const sent = textCard(D[0].s + ' …', { w: 0.8, h: 0.13, size: 62, weight: 700 });
    sent.position.set(0.0, 0.7, -0.3); L.inner.add(sent);
    const stem = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.7, 0.003), tabMat.clone()); stem.position.set(0, 0.35, -0.306); L.inner.add(stem);
    const cands = D[0].c.map(([wd], i) => {
      const x = lerp(0.52, -0.52, i / 2), card = textCard(wd, { w: 0.36, h: 0.13, size: 72, weight: 700, bg: '#21160c', ink: '#f6e4b6' });
      card.position.set(x, 0.1, 0.06); card.rotation.y = -x * 0.2; L.inner.add(card); stemAt(L, x, 0.1, 0.054);
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1, 0.012), new THREE.MeshStandardMaterial({ color: 0xc9a050, metalness: 1, roughness: 0.3, emissive: 0xffa630, emissiveIntensity: 0 }));
      bar.geometry.translate(0, 0.5, 0); bar.position.set(x, 0.235, 0.05); bar.scale.y = 0.001; bar.castShadow = true; L.inner.add(bar);
      return { card, bar };
    });
    rt.extra.nw = { sent, cands, i: 0, D };
  }
  if (kind === 'books') {      // books fly onto the pile while a counter adds up the reading years
    const flyers = [];
    for (let i = 0; i < 6; i++) { const cm = cardMesh('c2_s2_book', 0.2, true); if (!cm) break; const g = new THREE.Group(); g.add(cm.mesh); g.scale.setScalar(0.001); L.inner.add(g); flyers.push(g); }
    const counter = textCard('٠', { w: 0.42, h: 0.15, size: 80, weight: 800, bg: '#1a120a', ink: '#f3d995' });
    counter.position.set(0.46, 0.2, 0.0); counter.rotation.y = -0.2; stemAt(L, 0.46, 0.2, -0.006);
    const cap = textCard(D.caption, { w: 0.5, h: 0.1, size: 54, weight: 700, border: false });
    cap.position.set(0.46, 0.36, 0.0); cap.rotation.y = -0.2;
    L.inner.add(counter, cap); rt.extra.books = { flyers, counter, D };
  }
  if (kind === 'archery') {    // three arrows, each one closer to the centre
    const shaftM = new THREE.MeshStandardMaterial({ color: 0x3a2614, roughness: 0.7 }), featherM = new THREE.MeshStandardMaterial({ color: 0xe8dcc0, side: THREE.DoubleSide, roughness: 0.9 });
    const mk = () => { const g = new THREE.Group();
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.32, 8), shaftM); shaft.rotation.z = Math.PI / 2; g.add(shaft);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.045, 12), brass); tip.rotation.z = Math.PI / 2; tip.position.x = -0.18; g.add(tip);
      for (const r of [0, Math.PI / 2]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.065, 0.024), featherM); f.position.x = 0.13; f.rotation.x = r; g.add(f); }
      g.traverse(o => { if (o.isMesh) o.castShadow = true; }); g.visible = false; L.inner.add(g); return g; };
    const label = textCard(D[0], { w: 0.52, h: 0.12, size: 60, weight: 700, bg: '#1a120a', ink: '#f3d995' });
    label.position.set(0.02, 0.68, -0.16); label.scale.setScalar(0.001); L.inner.add(label);
    rt.extra.arch = { arrows: [mk(), mk(), mk()], label, D, aim: sp.aim };
  }
  if (kind === 'story') {      // a confident answer about a book that does not exist, then the stamp
    const q = textCard(D.q, { w: 0.74, h: 0.17, size: 46, weight: 600, bubble: true, tail: -1 });
    const a = textCard(D.a, { w: 0.84, h: 0.18, size: 44, weight: 600, bubble: true, tail: 1, bg: '#efd9a0' });
    const stamp = textCard(D.stamp, { w: 0.66, h: 0.13, size: 54, weight: 800, bg: '#6e0f1c', ink: '#f6e4b6' });
    q.position.set(-0.42, 0.6, -0.14); a.position.set(-0.1, 0.38, -0.04); stamp.position.set(-0.34, 0.13, 0.16); stamp.rotation.set(0.0, 0.12, 0.05);
    for (const m of [q, a, stamp]) m.scale.setScalar(0.001);
    L.inner.add(q, a, stamp); rt.extra.story = { q, a, stamp };
  }
  if (kind === 'verify') {     // the lens passes over the important topics and stamps each one "check it"
    const items = D.cards.map((t, i) => {
      const x = lerp(0.52, -0.52, i / 2), card = textCard(t, { w: 0.36, h: 0.14, size: 72, weight: 700 });
      card.position.set(x, 0.08, 0); card.rotation.y = -x * 0.15; L.inner.add(card); stemAt(L, x, 0.08, -0.006);
      const seal = textCard(D.stamp, { w: 0.22, h: 0.09, size: 54, weight: 800, bg: '#1a120a', ink: '#f3d995' });
      seal.position.set(x, 0.235, 0.012); seal.rotation.z = (i - 1) * 0.08; seal.scale.setScalar(0.001); L.inner.add(seal);
      return { card, seal, x };
    });
    rt.extra.verify = { items };
  }
}
function buildSpreadPopup(s) {
  if (spreadsRT[s]) return spreadsRT[s];
  const group = new THREE.Group(); book.add(group);
  const rt = { group, layers: [], S: 0, by: {}, extra: {}, locked: false, s, glowUntil: 0 };
  SEQ[s].layers.forEach((cfg, k) => {
    let L;
    if (cfg.proc) { L = procLayer(group, cfg.z, k); L.cfg.proc = cfg.proc; if (SEQ[s].sq) L.inner.scale.z = SQZ; buildProc(cfg.proc, L, rt, SEQ[s]); } else L = makeLayer(group, cfg, k);
    if (!L) return;
    if (cfg.hit && L.mesh && L.mesh.material && L.mesh.material[0]) { const m = L.mesh.material[0]; m.emissiveMap = m.map; m.emissive.setHex(0); m.needsUpdate = true; (rt.hitMats = rt.hitMats || []).push(m); } rt.layers.push(L); if (cfg.id) rt.by[cfg.id] = L;
  });
  group.visible = false; spreadsRT[s] = rt;
  return rt;
}
function buildPopups() { for (let s = 0; s < SEQ.length; s++) buildSpreadPopup(s); }

// ---------- particles: gold ink, paper dust, beam dust ----------
const PMAX = 1400;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PMAX * 3), pCol = new Float32Array(PMAX * 3), pSize = new Float32Array(PMAX), pAlpha = new Float32Array(PMAX);
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1)); pGeo.setAttribute('alpha', new THREE.BufferAttribute(pAlpha, 1));
const pMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uScale: { value: 400 } },
  vertexShader: `attribute float size; attribute float alpha; attribute vec3 color; varying float vA; varying vec3 vC; uniform float uScale;
    void main(){ vA = alpha; vC = color; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = size*uScale/(-mv.z); gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying float vA; varying vec3 vC; void main(){ vec2 d = gl_PointCoord-0.5; float r = length(d); float a = smoothstep(0.5,0.0,r); a *= a; gl_FragColor = vec4(vC*a*vA, 1.0); }`,
});
const points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points);
const parts = [];
let beamAxis = null;
function emit(o) { if (parts.length >= PMAX) return; parts.push(Object.assign({ age: 0, life: 1, size: 0.02, a: 1, col: [1, .8, .4], drag: 0.6, delay: 0 }, o)); }
function emitBeamDust(n) {
  for (let i = 0; i < n; i++) emit({ kind: 'beam', t: Math.random(), r: Math.sqrt(Math.random()), th: Math.random() * 6.28, life: 1e9, size: 0.006 + Math.random() * 0.01, col: [1, .86, .62], a: 0.7, sp: (Math.random() - .5) * 0.02 });
}
function emitInk(from, targets, n = 140) {
  for (let i = 0; i < n; i++) {
    const tgt = targets[Math.floor(Math.random() * targets.length)].clone().add(new THREE.Vector3((Math.random() - .5) * 0.5, Math.random() * 0.4, (Math.random() - .5) * 0.06));
    const p0 = from.clone().add(new THREE.Vector3((Math.random() - .5) * 0.3, 0, (Math.random() - .5) * 0.05));
    const mid = p0.clone().lerp(tgt, .5); mid.y += 0.25 + Math.random() * 0.25;
    emit({ kind: 'path', p0, mid, p1: tgt, life: 0.9 + Math.random() * 0.6, delay: Math.random() * 0.45, size: 0.008 + Math.random() * 0.014, col: [1, .78, .36], a: 1 });
  }
}
function emitPuff(p, n = 10) {
  for (let i = 0; i < n; i++) emit({ kind: 'free', p: p.clone(), v: new THREE.Vector3((Math.random() - .5) * 0.25, Math.random() * 0.18, (Math.random() - .5) * 0.25), life: 0.8 + Math.random() * 0.7, size: 0.01 + Math.random() * 0.012, col: [0.95, .88, .74], a: 0.55, drag: 1.6 });
}
const _q = new THREE.Vector3();
function updateParticles(dt, time) {
  let n = 0;
  for (let i = parts.length - 1; i >= 0; i--) {
    const Pt = parts[i];
    if (Pt.delay > 0) { Pt.delay -= dt; continue; }
    Pt.age += dt; if (Pt.age > Pt.life) { parts.splice(i, 1); continue; }
    const k = Pt.age / Pt.life; let a = Pt.a;
    if (Pt.kind === 'path') { const t = ease(k); _q.copy(Pt.p0).multiplyScalar((1 - t) * (1 - t)).addScaledVector(Pt.mid, 2 * (1 - t) * t).addScaledVector(Pt.p1, t * t); Pt.p = _q.clone(); a *= Math.sin(Math.PI * k); }
    else if (Pt.kind === 'free') { Pt.v.multiplyScalar(Math.exp(-Pt.drag * dt)); Pt.v.y -= 0.03 * dt; Pt.p.addScaledVector(Pt.v, dt); a *= (1 - k); }
    else if (Pt.kind === 'beam' && beamAxis) {
      Pt.t += Pt.sp * dt; if (Pt.t > 1) Pt.t -= 1; if (Pt.t < 0) Pt.t += 1; Pt.th += dt * 0.05;
      const d = beamAxis.len * (0.15 + 0.85 * Pt.t), rad = beamAxis.r * Pt.r * (0.15 + 0.85 * Pt.t) * 0.85;
      _q.copy(beamAxis.o).addScaledVector(beamAxis.d, d).addScaledVector(beamAxis.u, Math.cos(Pt.th) * rad).addScaledVector(beamAxis.w, Math.sin(Pt.th) * rad);
      _q.y += Math.sin(time * 0.3 + Pt.th * 5) * 0.02; Pt.p = _q.clone();
      a *= beamAxis.on * (0.35 + 0.65 * Math.abs(Math.sin(time * 0.6 + Pt.th * 3))) * (1 - Pt.t * 0.6);
    }
    if (!Pt.p) continue;
    pPos[n * 3] = Pt.p.x; pPos[n * 3 + 1] = Pt.p.y; pPos[n * 3 + 2] = Pt.p.z; pCol.set(Pt.col, n * 3); pSize[n] = Pt.size; pAlpha[n] = a; n++;
  }
  pGeo.setDrawRange(0, n);
  for (const k of ['position', 'color', 'size', 'alpha']) pGeo.attributes[k].needsUpdate = true;
}
const flareTex = (() => { const c = mkCanvas(256, 256), x = c.getContext('2d'); const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,240,200,1)'); g.addColorStop(.12, 'rgba(255,210,130,.6)'); g.addColorStop(.4, 'rgba(255,180,80,.12)'); g.addColorStop(1, 'rgba(255,170,60,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.globalCompositeOperation = 'lighter'; for (let i = 0; i < 6; i++) { x.save(); x.translate(128, 128); x.rotate(i * Math.PI / 6 + .2); const s = x.createLinearGradient(-128, 0, 128, 0);
    s.addColorStop(0, 'rgba(255,220,150,0)'); s.addColorStop(.5, 'rgba(255,230,170,.55)'); s.addColorStop(1, 'rgba(255,220,150,0)'); x.fillStyle = s; x.fillRect(-128, -1.5, 256, 3); x.restore(); }
  return canvasTex(c); })();
const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: flareTex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 }));
flare.renderOrder = 10; scene.add(flare);
function fireFlare(pos) { flare.position.copy(pos); tween(0.75, (e, p) => { const k = Math.sin(Math.PI * p); flare.material.opacity = k * 0.9; flare.scale.setScalar(0.25 + p * 0.9); flare.material.rotation = p * 0.6; }, { e: x => x }); }

// ---------- scene beats ----------
let beatToken = { dead: false };
function resetSpread(s) {
  const rt = spreadsRT[s]; if (!rt) return; const by = rt.by;
  if (by.turing) by.turing.inner.position.set(0.3, 0, 0);
  if (by.king) by.king.inner.rotation.z = 0;
  if (by.knight) { by.knight.inner.position.set(0, 0, 0); by.knight.inner.rotation.z = 0; }
  if (rt.extra.net) { rt.extra.net.pulse = -1; rt.extra.net.loopStart = null; rt.extra.net.label.scale.setScalar(0.001); for (const nd of rt.extra.net.nodes) nd.a = 0; }
  if (rt.extra.chat) { rt.extra.chat.q.scale.setScalar(0.001); rt.extra.chat.a.scale.setScalar(0.001); rt.extra.chat.counter.userData.redraw('0'); }
  if (rt.extra.words) clearArcs(rt.extra.words);
  if (rt.extra.bubble) rt.extra.bubble.scale.setScalar(0.001);
  if (rt.extra.catq) { rt.extra.catq.cat.scale.setScalar(0.001); rt.extra.catq.q.scale.setScalar(0.001); rt.extra.catq.q.position.y = 0.3; }
  const x = rt.extra;
  if (x.nw) for (const c of x.nw.cands) c.bar.scale.y = 0.001;
  if (x.books) for (const g of x.books.flyers) g.scale.setScalar(0.001);
  if (x.arch) { x.arch.arrows.forEach(a => { a.visible = false; }); x.arch.label.scale.setScalar(0.001); }
  if (x.story) for (const m of [x.story.q, x.story.a, x.story.stamp]) m.scale.setScalar(0.001);
  if (x.verify) { x.verify.items.forEach(it => it.seal.scale.setScalar(0.001)); if (rt.by.glass) rt.by.glass.inner.position.set(0, 0, 0); }
  stageSpot.intensity = 0; rt.locked = false;
}
function catBeat(tok, delay = 0, rt = spreadsRT[state.cur]) {
  const cq = rt && rt.extra.catq; if (!cq) return; const o = { token: tok };
  tween(0.7, e => cq.cat.scale.setScalar(Math.max(0.001, e)), { delay, e: t => easeOutBack(t), ...o });
  tween(0.01, () => { const p = new THREE.Vector3(-0.32, PAGE_Y + 0.05, 0.0); book.localToWorld(p); emitPuff(p, 14); }, { delay, ...o });
  tween(1.4, (e, p) => { cq.q.scale.setScalar(Math.max(0.001, easeOutBack(clamp(p * 2)))); cq.q.position.y = lerp(0.3, 0.6, e); cq.q.rotation.z = Math.sin(p * 7) * 0.06 * (1 - p); }, { delay: delay + 0.5, ...o });
}
function runBeats(s, tok, replay = false, opt = {}) {
  const rt = spreadsRT[s]; if (!rt) return; const by = rt.by, o = { token: tok }, d = opt.d ?? (replay ? 0 : 0.5), b = SEQ[s].beat;
  if (b === 'turing' && by.turing) {
    const tu = by.turing;
    tween(1.8, (e, p) => { tu.inner.position.x = lerp(0.3, 0, e); tu.inner.position.y = Math.abs(Math.sin(p * Math.PI * 5)) * 0.012 * (1 - p); tu.inner.rotation.z = Math.sin(p * Math.PI * 5) * 0.025 * (1 - p); }, { delay: d, e: x => x, ...o });
    if (!rt.extra.bubble) { const b = textCard(BUBBLE_1950, { w: 0.52, h: 0.15, size: 52, weight: 700, bubble: true, tail: 1 }); b.position.set(-0.14, tu.h + 0.03, 0.02); tu.inner.add(b); rt.extra.bubble = b; }
    const b = rt.extra.bubble; b.scale.setScalar(0.001);
    tween(0.7, e => b.scale.setScalar(Math.max(0.001, e)), { delay: d + 1.4, e: t => easeOutBack(t), ...o });
    tween(1.2, (e, p) => { rt.extra.gearBoost = 1 + Math.sin(p * Math.PI) * 4; }, { delay: d + 1.2, ...o });
  }
  if (b === 'chess') {
    const kn = by.knight, ki = by.king; if (!kn || !ki) return;
    kn.inner.position.set(0, 0, 0); ki.inner.rotation.z = 0;
    tween(1.0, e => { stageSpot.intensity = 6 * e; }, { delay: d, ...o });
    tween(0.9, (e, p) => { kn.inner.position.x = lerp(0, -0.46, e); kn.inner.position.y = Math.sin(p * Math.PI) * 0.22; kn.inner.rotation.z = Math.sin(p * Math.PI) * 0.35; }, { delay: d + 0.6, ...o });
    tween(0.9, e => { ki.inner.rotation.z = e * Math.PI * 0.47; }, { delay: d + 1.45, e: t => (t < 1 ? easeOut(t) + Math.sin(t * 9) * 0.05 * (1 - t) : 1), ...o });
    tween(0.01, () => { const p = new THREE.Vector3(-0.32, PAGE_Y + 0.02, 0.26); book.localToWorld(p); emitPuff(p, 22); }, { delay: d + 2.1, ...o });
    if (!USE_CUES) catBeat(tok, d + 3.4, rt);
  }
  if (b === 'net') { const net = rt.extra.net; net.loopStart = NOW + d + 0.2; tween(0.6, e => net.label.scale.setScalar(Math.max(0.001, e)), { delay: d + 1.9, e: t => easeOutBack(t), ...o }); }
  if (b === 'words') tween(0.01, () => showArcs(rt.extra.words, 3), { delay: d + 0.4, ...o });
  if (b === 'chat') {
    const ch = rt.extra.chat;
    if (replay) { ch.i = (ch.i + 1) % CHATS.length; ch.q.userData.redraw(CHATS[ch.i][0]); ch.a.userData.redraw(CHATS[ch.i][1]); }
    ch.q.scale.setScalar(0.001); ch.a.scale.setScalar(0.001);
    tween(0.6, e => ch.q.scale.setScalar(Math.max(0.001, e)), { delay: d + 0.3, e: t => easeOutBack(t), ...o });
    tween(0.6, e => ch.a.scale.setScalar(Math.max(0.001, e)), { delay: d + 1.1, e: t => easeOutBack(t), ...o });
    if (!replay) tween(opt.counterDur || 2.0, e => ch.counter.userData.redraw(Math.round(1e6 * e).toLocaleString('en-US')), { delay: d + 0.4, e: t => 1 - Math.pow(1 - t, 2.4), ...o });
  }
  if (CH2_BEATS[b]) CH2_BEATS[b](rt, fxTok, d, replay);
}
// ----- chapter 2 beats (fxTok: a fresh token per run, so a tap restarts the scene without killing the text reveal) -----
let fxTok = { dead: false };
function newFx() { fxTok.dead = true; fxTok = { dead: false }; return fxTok; }
const pop = (m, dur, delay, o) => tween(dur, e => m.scale.setScalar(Math.max(0.001, e)), { delay, e: t => easeOutBack(t), ...o });
function puffAt(L, x, y, z, n = 12) { const p = new THREE.Vector3(x, y, z); L.inner.localToWorld(p); emitPuff(p, n); }
const CH2_BEATS = {
  nextword(rt, tok, d, replay) {
    const nw = rt.extra.nw, o = { token: tok }; if (!nw) return;
    if (replay) nw.i = (nw.i + 1) % nw.D.length;
    const it = nw.D[nw.i];
    nw.sent.userData.redraw(it.s + ' …'); nw.sent.userData.face.emissive.setHex(0);
    nw.cands.forEach((c, i) => { c.card.userData.redraw(it.c[i][0]); c.card.userData.face.emissive.setHex(0); c.bar.scale.y = 0.001; c.bar.material.emissiveIntensity = 0; });
    nw.cands.forEach((c, i) => tween(0.9, e => { c.bar.scale.y = Math.max(0.001, 0.02 + it.c[i][1] * 0.42 * e); }, { delay: d + 0.5 + i * 0.12, e: easeOut, ...o }));
    const win = nw.cands[0];
    tween(0.5, e => { win.card.userData.face.emissive.setRGB(0.55 * e, 0.36 * e, 0.08 * e); win.bar.material.emissiveIntensity = 0.8 * e; }, { delay: d + 1.6, ...o });
    tween(0.01, () => {
      const a = new THREE.Vector3(win.card.position.x, 0.2, 0.06), b2 = new THREE.Vector3(0, 0.74, -0.3);
      win.card.parent.localToWorld(a); win.card.parent.localToWorld(b2); emitInk(a, [b2], 60);
    }, { delay: d + 1.9, ...o });
    tween(0.01, () => { nw.sent.userData.redraw(it.s + ' ' + it.c[0][0]); nw.sent.userData.face.emissive.setRGB(0.25, 0.16, 0.03); }, { delay: d + 2.7, ...o });
    tween(0.5, (e, p) => nw.sent.scale.setScalar(1 + Math.sin(Math.PI * p) * 0.08), { delay: d + 2.7, ...o });
  },
  books(rt, tok, d, replay) {
    const bk = rt.extra.books, o = { token: tok }; if (!bk) return; const L = rt.layers.find(l => l.cfg.proc === 'books') || rt.layers[0];
    bk.counter.userData.redraw('٠');
    const end = new THREE.Vector3(-0.46, 0.95, -0.42);
    bk.flyers.forEach((g, i) => {
      const p0 = new THREE.Vector3(0.95, 0.3 + (i % 3) * 0.12, 0.25 - (i % 2) * 0.1), mid = p0.clone().lerp(end, 0.5); mid.y += 0.3 + (i % 3) * 0.06;
      g.scale.setScalar(0.001);
      tween(1.3, (e, p) => {
        const t = ease(p); g.position.set(0, 0, 0).addScaledVector(p0, (1 - t) * (1 - t)).addScaledVector(mid, 2 * (1 - t) * t).addScaledVector(end, t * t);
        const s = Math.sin(Math.PI * clamp(p * 1.15)); g.scale.set(Math.max(0.001, s * (0.55 + 0.45 * Math.abs(Math.cos(p * 18)))), Math.max(0.001, s), Math.max(0.001, s));
        g.rotation.set(0.2, 0, Math.sin(p * 6) * 0.2 - 0.25);
      }, { delay: d + 0.3 + i * 0.28, e: x => x, ...o });
      tween(0.01, () => puffAt(L, end.x, end.y, end.z, 6), { delay: d + 0.3 + i * 0.28 + 1.25, ...o });
    });
    tween(2.6, e => bk.counter.userData.redraw(ar(Math.round(1000 * e))), { delay: d + 0.6, e: t => 1 - Math.pow(1 - t, 2.2), ...o });
    tween(0.01, () => bk.counter.userData.redraw(bk.D.counter), { delay: d + 3.3, ...o });
    tween(0.5, (e, p) => bk.counter.scale.setScalar(1 + Math.sin(Math.PI * p) * 0.1), { delay: d + 3.3, ...o });
  },
  archery(rt, tok, d) {
    const ac = rt.extra.arch, o = { token: tok }; if (!ac) return; const L = rt.layers.find(l => l.cfg.proc === 'archery');
    const tgt = rt.by.target, aim = ac.aim, offs = [[0.11, 0.09], [-0.06, -0.05], [0, 0]];
    ac.arrows.forEach(a => { a.visible = false; }); ac.label.scale.setScalar(0.001);
    const from = new THREE.Vector3(0.42, 0.4, 0.16);
    offs.forEach(([ox, oy], i) => {
      const hit = new THREE.Vector3(aim.x + ox, aim.y + oy, aim.z + 0.02), a = ac.arrows[i];
      const dir = hit.clone().sub(from), yaw = Math.atan2(dir.z, -dir.x), t0 = d + 0.4 + i * 1.25;
      tween(0.5, (e, p) => {
        a.visible = true; a.position.lerpVectors(from, hit, p); a.position.y += Math.sin(Math.PI * p) * 0.05; a.position.x += 0.17;
        a.rotation.set(0, yaw, -Math.cos(Math.PI * p) * 0.12);
      }, { delay: t0, e: x => x, ...o });
      tween(0.01, () => { puffAt(L, hit.x, hit.y, hit.z, 10); ac.label.userData.redraw(ac.D[i]); }, { delay: t0 + 0.5, ...o });
      if (i === 0) pop(ac.label, 0.5, t0 + 0.5, o);
      if (tgt) tween(0.6, (e, p) => { tgt.inner.rotation.z = Math.sin(p * 18) * 0.02 * (1 - p); }, { delay: t0 + 0.5, ...o });
      if (i === 2) { tween(0.01, () => { const p = hit.clone(); L.inner.localToWorld(p); fireFlare(p); }, { delay: t0 + 0.5, ...o }); }
    });
  },
  story(rt, tok, d) {
    const st = rt.extra.story, o = { token: tok }; if (!st) return; const L = rt.layers.find(l => l.cfg.proc === 'story');
    for (const m of [st.q, st.a, st.stamp]) m.scale.setScalar(0.001);
    const te = rt.by.teller;
    if (te) tween(1.2, (e, p) => { te.inner.rotation.z = Math.sin(p * Math.PI * 4) * 0.02 * (1 - p); }, { delay: d + 1.0, ...o });
    pop(st.q, 0.6, d + 0.3, o); pop(st.a, 0.6, d + 1.3, o);
    tween(0.45, (e, p) => st.stamp.scale.setScalar(Math.max(0.001, p < 1 ? lerp(1.7, 1, easeOut(p)) * Math.min(1, p * 4) : 1)), { delay: d + 2.8, e: x => x, ...o });
    tween(0.01, () => puffAt(L, st.stamp.position.x, 0.04, st.stamp.position.z, 22), { delay: d + 3.2, ...o });
  },
  verify(rt, tok, d) {
    const vf = rt.extra.verify, o = { token: tok }; if (!vf) return; const gl = rt.by.glass; if (!gl) return;
    vf.items.forEach(it => { it.seal.scale.setScalar(0.001); it.card.userData.face.emissive.setHex(0); });
    const gx = gl.cfg.x, path = [gx, -0.62];
    tween(3.0, (e, p) => { gl.inner.position.x = lerp(0, path[1] - gx, e); gl.inner.position.y = Math.sin(p * Math.PI * 3) * 0.02; }, { delay: d + 0.3, ...o });
    tween(0.9, e => { gl.inner.position.x = lerp(-0.62 - gx, 0, e); }, { delay: d + 4.2, ...o });
    vf.items.forEach((it, i) => {
      const k = clamp((gx - it.x) / (gx + 0.62)), t = d + 0.3 + 3.0 * (k < 0.5 ? Math.cbrt(k / 4) : 1 - Math.cbrt((1 - k) / 4));
      tween(0.4, e => it.card.userData.face.emissive.setRGB(0.4 * e, 0.27 * e, 0.06 * e), { delay: t, ...o });
      tween(0.45, (e, p) => it.seal.scale.setScalar(Math.max(0.001, lerp(1.6, 1, easeOut(p)) * Math.min(1, p * 4))), { delay: t + 0.15, e: x => x, ...o });
    });
  },
};
function clearArcs(wd) { for (const a of wd.arcs) { wd.L.inner.remove(a.mesh); a.mesh.geometry.dispose(); } wd.arcs = []; wd.sel = -1; for (const t of wd.tiles) t.card.userData.face.emissive.setHex(0); }
function showArcs(wd, wi) {
  if (wd.sel === wi) return; clearArcs(wd); wd.sel = wi;
  wd.tiles.forEach((t, j) => { const w = j === wi ? 0.55 : ATT[wi][j]; t.card.userData.face.emissive.copy(new THREE.Color(0xc98a20).multiplyScalar(w * 0.8)); });
  const a = wd.tiles[wi];
  ATT[wi].forEach((wgt, j) => {
    if (j === wi || wgt < 0.04) return;
    const b = wd.tiles[j], mid = a.top.clone().lerp(b.top, .5); mid.y += 0.1 + a.top.distanceTo(b.top) * 0.45; mid.z += 0.04;
    const geo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a.top.clone(), mid, b.top.clone()), 64, 0.005 + wgt * 0.016, 10, false);
    const mat = new THREE.MeshStandardMaterial({ color: 0x9a6a1c, emissive: 0xffa630, emissiveIntensity: 0.3 + wgt * 1.8, metalness: .5, roughness: .4, transparent: wgt < 0.3, opacity: wgt < 0.3 ? 0.75 : 1 });
    const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; geo.setDrawRange(0, 0); wd.L.inner.add(mesh);
    const arc = { mesh, n: geo.index.count, w: wgt }; wd.arcs.push(arc);
    tween(0.9, e => geo.setDrawRange(0, Math.floor(arc.n * e / 6) * 6), { delay: (1 - wgt) * 0.4 });
  });
}

// ---------- camera ----------
const pose = { target: new THREE.Vector3(), dist: 6, el: 50, az: -20 };
const isPortrait = () => camera.aspect < 1.2;
function fitDist(halfW, halfD, asp = camera.aspect) {
  const vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * asp);
  return Math.max(halfW / Math.tan(hf), halfD / Math.tan(vf)) * 1.04;
}
function readingDist() { if (READER) return isPortrait() ? fitDist(0.97, 0.9) : fitDist(1.16, 0.86); return isPortrait() ? fitDist(1.12, 0.9) : fitDist(1.12, 0.8, camera.aspect * 0.62) * 1.06; }
function mkPose(target, dist, el, az) { return { target: new THREE.Vector3(...target), dist, el, az }; }
function poses() {
  const r = readingDist(), pt = isPortrait();
  return {
    hero: mkPose([-0.5, 0.06, 0.06], r * (pt ? 0.8 : 0.84), 52, -22),
    intro: mkPose([-0.3, 0.12, 0.0], r * 1.15, 9, -64),
    autoStart: mkPose([-0.45, 0.1, 0.05], r * 0.72, 40, -26),
  };
}
function spreadPose(s, which) {
  const c = SEQ[s].cam[which], r = readingDist(), pt = isPortrait();
  if (READER) {   // one calm reading frame: the pop-up behind, the printed page in front; small per-spread drift
    const a = which === 'a';
    return { target: new THREE.Vector3(c.focus[0] * 0.3, pt ? 0.3 : 0.3, pt ? 0.0 : 0.02), dist: r * (a ? 1.08 : 1.0) * (pt ? 1.0 : 1.2), el: pt ? (a ? 44 : 38) : (a ? 54 : 50), az: c.az * 0.22 };
  }
  return { target: new THREE.Vector3(c.focus[0], c.focus[1] + (pt ? 0.03 : 0), c.focus[2]), dist: r * c.df * (pt ? 0.94 : 1), el: c.el + (pt ? 5 : 0), az: c.az * (pt ? 0.7 : 1) };
}
function setPose(p) { pose.target.copy(p.target); pose.dist = p.dist; pose.el = p.el; pose.az = p.az; }
function poseTween(to, dur, opts = {}) {
  const from = { target: pose.target.clone(), dist: pose.dist, el: pose.el, az: pose.az };
  return tween(dur, e => { pose.target.lerpVectors(from.target, to.target, e); pose.dist = lerp(from.dist, to.dist, e); pose.el = lerp(from.el, to.el, e); pose.az = lerp(from.az, to.az, e); }, opts);
}
const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
function applyCamera() {
  if (READER && !isPortrait()) { const tg = state.cur < 0 && state.phase !== 'opening' ? 0.17 : 0; if (Math.abs(viewOX - tg) > 1e-4) { viewOX = Math.abs(viewOX - tg) < 0.002 ? tg : lerp(viewOX, tg, 0.05); setViewOff(); } }
  pointer.sx = lerp(pointer.sx, pointer.x, 0.03); pointer.sy = lerp(pointer.sy, pointer.y, 0.03);
  const az = THREE.MathUtils.degToRad(pose.az + Math.sin(NOW * 0.21) * 0.8 + pointer.sx * 3);
  const el = THREE.MathUtils.degToRad(pose.el + Math.sin(NOW * 0.15 + 1) * 0.4 - pointer.sy * 2);
  const t = pose.target;
  camera.position.set(t.x + Math.sin(az) * Math.cos(el) * pose.dist, t.y + Math.sin(el) * pose.dist, t.z + Math.cos(az) * Math.cos(el) * pose.dist);
  camera.lookAt(t);
}

// ---------- post-processing ----------
let composer, bokeh, bloom, grade, smaa;
const GradeShader = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uCenter: { value: new THREE.Vector2(0.5, 0.5) }, uFade: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform sampler2D tDiffuse; uniform float uTime; uniform vec2 uRes; uniform vec2 uCenter; uniform float uFade; varying vec2 vUv;
    float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
    void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb;
      float l = dot(c, vec3(.299,.587,.114));
      c = mix(c, c*vec3(1.06,1.0,0.88), 0.55);
      c += vec3(0.022,0.012,0.0)*(1.0-l)*(1.0-l);
      c = mix(vec3(l), c, 1.06);
      c = (c-0.5)*1.05+0.5;
      vec2 q = vUv-uCenter; q.x *= uRes.x/uRes.y;
      c *= mix(0.28, 1.0, smoothstep(1.15, 0.28, length(q)));
      c += (h(vUv*uRes + fract(uTime*7.13)*91.7)-0.5)*0.032;
      gl_FragColor = vec4(clamp(c,0.,1.)*uFade, 1.0); }`,
};
function setupPost() {
  const rt = new THREE.WebGLRenderTarget(16, 16, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  if (DOF) { bokeh = new BokehPass(scene, camera, { focus: 4, aperture: 0.0012, maxblur: 0.006 }); composer.addPass(bokeh); }
  bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.26, 0.45, 1.15); composer.addPass(bloom);
  composer.addPass(new OutputPass());
  smaa = new SMAAPass(16, 16); composer.addPass(smaa);
  grade = new ShaderPass(GradeShader); composer.addPass(grade);
}

// ---------- state ----------
const state = { phase: 'loading', cur: -1, cover: Math.PI, busy: false };
function updateBook(time, dt) {
  const phi = state.cover;
  coverGroup.rotation.z = phi;
  coverGroup.position.set((T + B) * Math.sin(phi) * 0.9, P_CLOSED * (phi / Math.PI), 0);
  const so = clamp((phi / Math.PI - 0.35) / 0.65);
  spine.visible = so > 0.01; spine.scale.y = Math.max(0.001, P_CLOSED * so); spine.position.set(0.012, P_CLOSED * so / 2, 0);
  for (const L of leaves) poseLeaf(L);
  updateRibbon(1 - phi / Math.PI, time);
  spreadsRT.forEach(rt => {
    const S = rt.S; rt.group.visible = S > 0.002;
    if (!rt.group.visible) { for (const L of rt.layers) for (const t of L.tabs) t.m.visible = false; return; }
    const n = rt.layers.length;
    rt.layers.forEach((L, k) => applyLayer(L, clamp((S - k * 0.08) / (1 - (n - 1) * 0.08)), time));
    if (!rt.locked && S > 0.985) { rt.locked = true; const p = new THREE.Vector3(0.05, PAGE_Y + 0.62, -0.25); book.localToWorld(p); fireFlare(p); }
    const net = rt.extra.net;
    if (net) {
      if (net.loopStart !== null && NOW > net.loopStart) net.pulse = (((NOW - net.loopStart) % 3.0) / 1.9) * 4.6;
      const lf = rt.layers[1] ? Math.max(0, rt.layers[1].fade) : 1;
      for (const nd of net.nodes) { const a = clamp(1 - Math.abs(net.pulse - (nd.ci + 0.5)) * 1.2); nd.a = Math.max(nd.a - dt * 0.9, a, net.loopStart !== null ? 0.15 : 0);
        nd.face.emissiveIntensity = nd.a * 1.6; nd.halo.material.opacity = nd.a * 0.95 * lf; nd.halo.scale.setScalar(0.12 + nd.a * 0.16); }
      for (const [a, b, cyl] of net.segs) { const v = Math.min(a.a, b.a); cyl.material.color.setRGB(lerp(0.16, 1.0, v), lerp(0.11, 0.78, v), lerp(0.06, 0.35, v)); }
    }
    if (rt.by.crowd) rt.by.crowd.inner.position.y = Math.sin(time * 1.6) * 0.004;
    if (rt.extra.chat) { rt.extra.chat.q.position.y = 0.66 + Math.sin(time * 1.3) * 0.012; rt.extra.chat.a.position.y = 0.47 + Math.sin(time * 1.3 + 1.4) * 0.012; }
    if (rt.extra.words) for (const a of rt.extra.words.arcs) a.mesh.material.emissiveIntensity = (0.3 + a.w * 1.8) * (0.75 + 0.25 * Math.sin(time * 4 - a.w * 3));
  });
  for (const rt0 of spreadsRT) if (rt0 && rt0.group.visible) for (const id of ['gearA', 'gearB']) { const L = rt0.by[id]; if (L && L.spinner) { L.spinAcc = (L.spinAcc || 0) + L.cfg.spin * (rt0.extra.gearBoost || 1) * dt; L.spinner.rotation.z = L.spinAcc; } }
  const cr = spreadsRT[state.cur];   // reader: the tappable pop-ups breathe a soft gold glow for a few seconds
  if (READER && cr && cr.hitMats) { const on = NOW < cr.glowUntil ? clamp((cr.glowUntil - NOW) / 1.5) : 0, k = on * (0.12 + 0.12 * Math.sin(NOW * 3.2));
    for (const m of cr.hitMats) m.emissive.setRGB(k, k * 0.78, k * 0.45); }
  stageSpot.target.position.set(-0.1, PAGE_Y, 0.3);
}

// ---------- UI ----------
const $ = s => document.querySelector(s);
const panel = $('#panel'), nav = $('nav'), titleCard = $('#titlecard'), finalCard = $('#final'), tocEl = $('#toc'), menuBtn = $('#menu');
if (READER) {
  titleCard.querySelector('.k').textContent = BOOK_COVER.kicker; titleCard.querySelector('h1').textContent = BOOK_COVER.title;
  $('#cover-intro').textContent = BOOK_COVER.intro; $('#cover-hint').textContent = BOOK_COVER.hint; document.title = BOOK_COVER.title;
  document.body.classList.add('reader');
} else $('#cover-intro').textContent = COVER.intro;
finalCard.innerHTML = `<p>${FINAL[0]}</p><p class="q">${FINAL[1]}</p>`;
if (AUTO) { $('#cover-hint').style.display = 'none'; $('#cover-intro').style.display = 'none'; }
const dots = $('.dots'); if (AUTO) SEQ.forEach(() => dots.appendChild(document.createElement('i')));
const chOf = s => SEQ[s] && LIBRARY.find(c => c.id === SEQ[s].ch);
const chSpreads = id => SEQ.filter(x => x.ch === id).length;
function savedIndex() { const v = store.get(SAVE_KEY); return v ? SEQ.findIndex(x => x.ch === v.ch && x.k === v.k) : -1; }
// ----- reader caption (phones) + contents chips + «جرّب» pill: slim, transparent, never a panel over the book -----
const cap = $('#cap'), capT = cap.querySelector('.ct b'), capPg = cap.querySelector('.ct .pg'), capP = cap.querySelector('.cp'), chipsEl = cap.querySelector('.chips'), tryPill = $('#trypill');
let capParas = [], capI = 0;
function setPara(i, animate) {
  capI = i; const go = () => { capP.innerHTML = capParas[i] || ''; capP.classList.remove('fade'); capPg.textContent = capParas.length > 1 ? `${ar(i + 1)}/${ar(capParas.length)}` + (i < capParas.length - 1 ? ' · المزيد' : '') : ''; };
  if (animate) { capP.classList.add('fade'); setTimeout(go, 260); } else go();
}
cap.addEventListener('click', e => { if (cap.classList.contains('toc') || capParas.length < 2) return; e.stopPropagation(); setPara((capI + 1) % capParas.length, true); });
function renderChips() {
  chipsEl.innerHTML = ''; const idx = savedIndex();
  const add = (html, cls, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'chip ' + cls; b.innerHTML = html; if (fn) b.onclick = e => { e.stopPropagation(); fn(); }; else { b.setAttribute('aria-disabled', 'true'); b.tabIndex = -1; } chipsEl.appendChild(b); };
  if (idx > 0) add(`كمّل: ${chOf(idx).kicker}، صفحة ${ar(SEQ[idx].k + 1)}`, 'gold', () => jumpTo(idx));
  for (const c of LIBRARY) add(`<span class="n">${c.n}</span>${c.title}${c.ready ? '' : ' · قريباً'}`, c.ready ? '' : 'locked', c.ready ? () => jumpTo(SEQ.findIndex(x => x.ch === c.id)) : null);
}
function showCaption(s, tok) {
  const sp = SEQ[s]; cap.classList.add('hide'); tryPill.classList.remove('show');
  return wait(0.35).then(() => {
    if (tok.dead) return;
    cap.classList.toggle('toc', !!sp.toc);
    if (sp.toc) { capT.textContent = 'الفهرس'; capPg.textContent = ''; capParas = []; renderChips(); }
    else { capT.textContent = sp.title; capParas = sp.lines; setPara(0); $('#trypill .t').textContent = sp.tryText;
      tween(0.01, () => { tryPill.classList.add('show'); const rt = spreadsRT[s]; if (rt) rt.glowUntil = NOW + 7; }, { delay: 1.1, token: tok }); }
    cap.classList.remove('hide');
  });
}
function setPanel(s, tok, lineAt) {
  if (READER) return showCaption(s, tok);
  const sp = SEQ[s]; panel.classList.add('hide'); tocEl.classList.add('hide');
  return wait(0.4).then(() => {
    if (tok.dead) return;
    if (sp.toc) { renderToc(); tocEl.classList.remove('hide'); return; }
    const c = chOf(s); panel.querySelector('.kick').textContent = READER && c ? `${c.kicker} · ${c.title}` : '';
    panel.querySelector('.year').textContent = sp.year; panel.querySelector('h2').textContent = sp.title;
    const lines = panel.querySelector('.lines'); lines.innerHTML = sp.lines.map(l => `<p>${l}</p>`).join('');
    $('#try .t').textContent = sp.tryText; $('#try').classList.remove('show'); panel.classList.remove('hide');
    const ps = [...lines.children], step = AUTO ? 0.55 : 0.6;
    ps.forEach((p, i) => tween(0.01, () => p.classList.add('show'), { delay: lineAt ? lineAt[i] : 0.2 + i * step, token: tok }));
    tween(0.01, () => $('#try').classList.add('show'), { delay: 0.2 + ps.length * step, token: tok });
  });
}
function renderToc() {
  const list = tocEl.querySelector('.chapters'); list.innerHTML = '';
  const cur = chOf(savedIndex());
  for (const c of LIBRARY) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'chap' + (c.ready ? '' : ' locked') + (cur && cur.id === c.id ? ' cur' : '');
    b.innerHTML = `<span class="n">${c.n}</span><span class="t">${c.title}</span><span class="m">${c.ready ? ar(chSpreads(c.id)) + ' صفحات' : 'قريباً'}</span>`;
    if (c.ready) b.addEventListener('click', e => { e.stopPropagation(); jumpTo(SEQ.findIndex(x => x.ch === c.id)); });
    else { b.setAttribute('aria-disabled', 'true'); b.tabIndex = -1; }
    list.appendChild(b);
  }
  const idx = savedIndex(), rs = tocEl.querySelector('.resume');
  rs.hidden = !(idx > 0);
  if (idx > 0) rs.querySelector('.t').textContent = `كمّل من حيث وقفت: ${chOf(idx).kicker}، صفحة ${ar(SEQ[idx].k + 1)}`;
}
function updateNav() {
  [...dots.children].forEach((d, i) => d.classList.toggle('on', i === state.cur));
  $('#prev').disabled = state.cur <= 0; $('#next').disabled = state.phase !== 'open';
  const sp = SEQ[state.cur];
  $('#count').textContent = !sp ? '' : sp.toc ? 'الفهرس' : `${ar(sp.k + 1)} من ${ar(chSpreads(sp.ch))}`;
  menuBtn.classList.toggle('hide', !(READER && state.phase === 'open' && sp && !sp.toc));
}
function showHintOnce() {
  if (!READER || store.get('aiBook.hint')) return; store.set('aiBook.hint', 1);
  const h = $('#hint'); h.classList.add('show'); setTimeout(() => h.classList.remove('show'), 5500);
}

// ---------- chapter assets (lazy, per chapter) ----------
async function loadCard(n) {
  if (CARD[n]) return;
  const [tex, json] = await Promise.all([loadTex(`img/cards/${n}.webp`), fetchJSON(`img/cards/${n}.json`)]);
  if (tex && json) CARD[n] = { tex, json, rm: metalFromImage(tex.image) };
}
const chLoad = {};
function loadChapter(ch, onProgress) {
  let job = chLoad[ch];
  if (!job) {
    const idxs = SEQ.map((x, i) => (x.ch === ch ? i : -1)).filter(i => i >= 0), names = new Set();
    idxs.forEach(i => { SEQ[i].layers.forEach(l => l.img && names.add(l.img)); (SEQ[i].needs || []).forEach(n => names.add(n)); });
    job = chLoad[ch] = { done: 0, total: names.size || 1, cbs: new Set() };
    job.p = Promise.all([...names].map(n => loadCard(n).then(() => { job.done++; job.cbs.forEach(cb => cb(job.done / job.total)); })))
      .then(() => { idxs.forEach(i => buildSpreadPopup(i)); job.ready = true; });
  }
  if (onProgress) { job.cbs.add(onProgress); onProgress(job.done / job.total); }
  return job.p;
}
async function loadWithPill(ch) {
  const pill = $('#chload'), bar = pill.querySelector('i');
  const tm = setTimeout(() => pill.classList.add('show'), 120);
  await loadChapter(ch, f => { bar.style.width = Math.round(f * 100) + '%'; });
  clearTimeout(tm); pill.classList.remove('show');
}
function preloadAround(s) { for (const t of [s + 1, s + 2]) if (SEQ[t] && !spreadsRT[t]) loadChapter(SEQ[t].ch); }

// ---------- flow ----------
async function intro() {             // film-title opening: lamp warms up, slow dolly across the desk to the book
  state.phase = 'intro'; setPose(poses().intro);
  setLamp(0); grade.uniforms.uFade.value = 0;
  tween(1.6, e => { grade.uniforms.uFade.value = e; });
  tween(1.4, (e, p) => setLamp(clamp(e + (p < .5 ? Math.sin(p * 60) * 0.25 : 0))), { delay: 0.5 });
  tween(0.01, () => titleCard.classList.add('show'), { delay: 2.2 });
  await poseTween(poses().hero, 5.2, { e: camEase });
  if (state.phase === 'intro') state.phase = 'closed';
}
async function openBook(fast = false, opt = null) {
  if (state.phase !== 'closed' && state.phase !== 'intro') return;
  state.phase = 'opening'; titleCard.classList.remove('show'); finalCard.classList.remove('show'); setLamp(1); grade.uniforms.uFade.value = 1;
  ensurePages(0);
  if (!(opt && opt.noCam)) poseTween(spreadPose(0, 'a'), fast ? 1.5 : 2.3, { e: camEase });
  const from = state.cover;
  await tween(fast === 'hook' ? 1.9 : fast ? 1.15 : 1.8, e => { state.cover = from * (1 - e); }, { delay: fast ? 0.15 : 0.4 });
  state.phase = 'open'; nav.classList.remove('hide');
  return arrive(0, opt || {});
}
function arrive(s, opt = {}) {
  beatToken.dead = true; beatToken = { dead: false }; const tok = beatToken; newFx();
  state.cur = s; updateNav(); resetSpread(s);
  if (LAZY) { ensurePages(s, [], false); setTimeout(() => { if (state.cur === s && !state.busy) ensurePages(s); }, 1500); }
  if (!opt.noPanel) setPanel(s, tok, opt.lineAt);
  const rt = spreadsRT[s];
  if (READER) {
    if (!SEQ[s].toc) store.set(SAVE_KEY, { ch: SEQ[s].ch, k: SEQ[s].k });
    preloadAround(s); showHintOnce();
  }
  if (!rt) return tok;
  tween(1.0, e => { rt.S = e; }, { e: x => x });
  const from = new THREE.Vector3(-0.5, PAGE_Y, 0.52), targets = rt.layers.map(L => new THREE.Vector3(L.cfg.x || 0, PAGE_Y + 0.15, L.cfg.z));
  book.localToWorld(from); targets.forEach(t => book.localToWorld(t)); emitInk(from, targets, IS_MOBILE && READER ? 100 : 160);
  if (!opt.noBeats) runBeats(s, tok, false, opt.beat || {});
  if (!opt.noCam) poseTween(spreadPose(s, 'b'), opt.camDur || (AUTO ? SPP - FLIP - 0.25 : 5.5), { delay: 0.15, token: tok, e: camEase });
  return tok;
}
async function flip(dir, opt = {}) {
  if (state.phase !== 'open' || state.busy) return;
  const from = state.cur, to = from + dir;
  if (to < 0) return;
  if (to >= SEQ.length) { closeBook(); return; }
  state.busy = true;
  if (!spreadsRT[to]) await loadWithPill(SEQ[to].ch);
  beatToken.dead = true; beatToken = { dead: false }; newFx();
  panel.classList.add('hide'); tocEl.classList.add('hide'); cap.classList.add('hide'); tryPill.classList.remove('show');
  if (LAZY) ensurePages(from, [to]);
  const leaf = leaves[dir > 0 ? from : from - 1];
  poseTween(spreadPose(to, 'a'), FLIP + 0.1, { e: camEase });
  const rtF = spreadsRT[from];
  let lastPuff = 0;
  await tween(FLIP, (e, p) => {
    if (rtF) rtF.S = 1 - smooth(p / 0.38);
    const lt = ease(clamp((p - 0.16) / 0.7));
    leaf.phi = dir > 0 ? Math.PI * (1 - lt) : Math.PI * lt;
    leaf.curl = Math.sin(Math.PI * lt) * dir;
    if (lt > 0.15 && lt < 0.85 && p - lastPuff > 0.07) { lastPuff = p; const ep = leafEdgePoint(leaf, Math.floor(Math.random() * NM)); book.localToWorld(ep); emitPuff(ep, 5); }
  }, { e: x => x });
  leaf.curl = 0; resetSpread(from); state.busy = false;
  return arrive(to, opt);
}
async function jumpTo(t) {           // contents / resume: riffle several leaves at once
  if (state.phase !== 'open' || state.busy || t === state.cur || t < 0 || t > K) return;
  const from = state.cur;
  if (Math.abs(t - from) === 1) return flip(t - from);
  state.busy = true;
  if (!spreadsRT[t]) await loadWithPill(SEQ[t].ch);
  beatToken.dead = true; beatToken = { dead: false }; newFx();
  panel.classList.add('hide'); tocEl.classList.add('hide'); cap.classList.add('hide'); tryPill.classList.remove('show');
  ensurePages(t, [from], false);
  poseTween(spreadPose(t, 'a'), 1.8, { e: camEase });
  const rtF = spreadsRT[from];
  if (rtF) await tween(0.35, (e, p) => { rtF.S = 1 - smooth(p); }, { e: x => x });
  resetSpread(from);
  const dir = t > from ? 1 : -1, ids = [];
  if (dir > 0) for (let i = from; i < t; i++) ids.push(i); else for (let i = from - 1; i >= t; i--) ids.push(i);
  const step = Math.min(0.12, 0.7 / ids.length);
  await Promise.all(ids.map((li, n) => tween(0.9, e => { const L = leaves[li]; L.phi = dir > 0 ? Math.PI * (1 - e) : Math.PI * e; L.curl = Math.sin(Math.PI * e) * dir * 0.8; }, { delay: n * step })));
  ids.forEach(li => { leaves[li].curl = 0; });
  state.busy = false;
  return arrive(t);
}
async function closeBook() {
  if (state.phase !== 'open' || state.busy) return;
  state.busy = true; state.phase = 'closing'; beatToken.dead = true; beatToken = { dead: false }; newFx();
  panel.classList.add('hide'); tocEl.classList.add('hide'); nav.classList.add('hide'); menuBtn.classList.add('hide'); cap.classList.add('hide'); tryPill.classList.remove('show');
  const rt = spreadsRT[state.cur];
  poseTween(poses().hero, 3.0, { e: camEase });
  if (rt) await tween(0.5, (e, p) => { rt.S = 1 - smooth(p); }, { e: x => x });
  resetSpread(state.cur);
  const jobs = [];
  for (let i = K - 1; i >= 0; i--) {
    const L = leaves[i]; if (L.phi > 3) continue;
    jobs.push(tween(0.85, e => { L.phi = Math.PI * e; L.curl = -Math.sin(Math.PI * e) * 0.7; }, { delay: (K - 1 - i) * 0.12 }));
  }
  await Promise.all(jobs); leaves.forEach(L => { L.curl = 0; L.phi = Math.PI; });
  await tween(1.1, e => { state.cover = Math.PI * e; }, { e: ease });
  state.cur = -1; state.phase = 'closed'; state.busy = false; updateNav();
  if (READER) showEnd(); else if (!USE_CUES) finalCard.classList.add('show');
}
function showEnd() {
  finalCard.innerHTML = `<p>${END_CARD.lines[0]}</p><p class="q">${END_CARD.lines[1]}</p><p class="f">${END_CARD.follow}</p>
    <div class="acts"><button type="button" id="end-toc">افتح الفهرس</button><button type="button" id="end-restart" class="ghost">اقرأ من البداية</button></div>`;
  $('#end-toc').onclick = e => { e.stopPropagation(); openBook(); };
  $('#end-restart').onclick = async e => { e.stopPropagation(); await openBook(); flip(1); };
  finalCard.classList.add('show');
}
const HIT_BEAT = { machine: 'turing', chess: 'chess', cat: 'net', chat: 'chat', type: 'nextword', books: 'books', archery: 'archery', story: 'story', verify: 'verify' };
const BEAT_HIT = Object.fromEntries(Object.entries(HIT_BEAT).map(([h, b]) => [b, h]));
function interact(hit) {
  if (state.phase !== 'open' || state.busy) return false;
  const s = state.cur, tok = beatToken, b = SEQ[s] && SEQ[s].beat;
  if (!b || HIT_BEAT[hit] !== b || !spreadsRT[s]) return false;
  if (b === 'chat') runBeats(s, tok, true);
  else if (CH2_BEATS[b]) { newFx(); runBeats(s, tok, true); }
  else { resetSpread(s); spreadsRT[s].locked = true; runBeats(s, tok, true); }
  return true;
}
const onTry = e => { e.stopPropagation(); const s = state.cur, b = SEQ[s] && SEQ[s].beat; if (spreadsRT[s]) spreadsRT[s].glowUntil = 0;
  if (b === 'words') { const wd = spreadsRT[s].extra.words; showArcs(wd, (wd.sel + 1 + WORDS.length) % WORDS.length); } else interact(BEAT_HIT[b]); };
$('#try').addEventListener('click', onTry); tryPill.addEventListener('click', onTry);
$('#next').addEventListener('click', e => { e.stopPropagation(); flip(1); });
$('#prev').addEventListener('click', e => { e.stopPropagation(); flip(-1); });
menuBtn.addEventListener('click', e => { e.stopPropagation(); jumpTo(0); });
tocEl.querySelector('.resume').addEventListener('click', e => { e.stopPropagation(); const i = savedIndex(); if (i > 0) jumpTo(i); });
$('#cover-open').addEventListener('click', e => { e.stopPropagation(); openBook(); });
$('#cover-resume').addEventListener('click', async e => { e.stopPropagation(); const i = savedIndex(); await openBook(); if (i > 0) { await wait(0.6); jumpTo(i); } });
addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === ' ' || e.key === 'PageDown') { if (state.phase === 'closed' || state.phase === 'intro') openBook(); else flip(1); e.preventDefault(); }
  if (e.key === 'ArrowRight' || e.key === 'PageUp') flip(-1);
  if (e.key === 'Enter' && (state.phase === 'closed' || state.phase === 'intro') && !(e.target.closest && e.target.closest('button'))) openBook();
  if (READER && e.key === 'Home') jumpTo(0);
});
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(cx, cy) {
  const r = canvas.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera);
  const objs = []; if (spreadsRT[state.cur]) spreadsRT[state.cur].group.traverse(o => o.isMesh && o.userData.hit && objs.push(o));
  const hits = ray.intersectObjects(objs, false); return hits.length ? hits[0].object : null;
}
function pickTocRow(cx, cy) {   // the contents list is printed on the left page of spread 0: tap a row to open it
  if (!READER || state.cur !== 0 || !leaves[0]) return null;
  const r = canvas.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
  camera.updateMatrixWorld(); ray.setFromCamera(ndc, camera);
  const h = ray.intersectObject(leaves[0].mF, false)[0]; if (!h || !h.uv) return null;
  const y = (1 - h.uv.y) * PH; return TOC_ROWS.find(q => y >= q.y0 && y < q.y1) || null;
}
function spineX() { const p = new THREE.Vector3(0, PAGE_Y, 0); book.localToWorld(p); p.project(camera); return (p.x + 1) / 2 * innerWidth; }
// Gestures: tap a pop-up = its scene; tap the left / right half of the book = next / previous (RTL); swipe right = next.
let down = null;
addEventListener('pointerdown', e => {
  if (!e.isPrimary || (e.target.closest && e.target.closest('button, a, .chapters'))) { down = null; return; }
  down = { x: e.clientX, y: e.clientY, onCanvas: e.target === canvas };
});
addEventListener('pointercancel', () => { down = null; });
addEventListener('pointerup', e => {
  if (!down || !e.isPrimary) return; const dx = e.clientX - down.x, dy = e.clientY - down.y, d0 = down; down = null;
  if (state.phase === 'closed' || state.phase === 'intro') { if (d0.onCanvas) openBook(); return; }
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) { flip(dx > 0 ? 1 : -1); return; } // RTL: drag right = next
  if (!d0.onCanvas || Math.hypot(dx, dy) > 14) return;
  const row = pickTocRow(e.clientX, e.clientY); if (row) { if (row.ready) jumpTo(SEQ.findIndex(x => x.ch === row.id)); return; }
  const o = pick(e.clientX, e.clientY);
  if (o) { if (o.userData.hit === 'word') { showArcs(spreadsRT[state.cur].extra.words, o.userData.word); return; } if (interact(o.userData.hit)) return; }
  if (READER && state.phase === 'open') flip(e.clientX < spineX() ? 1 : -1);
});
canvas.addEventListener('pointermove', e => {
  pointer.x = (e.clientX / innerWidth - .5) * 2; pointer.y = (e.clientY / innerHeight - .5) * 2;
  if (e.pointerType !== 'mouse' || state.phase !== 'open' || state.busy) return;
  const o = pick(e.clientX, e.clientY), row = pickTocRow(e.clientX, e.clientY); canvas.style.cursor = o || (row && row.ready) ? 'pointer' : 'default';
  if (o && o.userData.hit === 'word' && SEQ[state.cur].beat === 'words') showArcs(spreadsRT[state.cur].extra.words, o.userData.word);
});

// ---------- resize ----------
let viewOX = 0.17;   // reader, landscape: the closed book sits left of the title card, the open book is centred
function setViewOff() {
  const w = innerWidth, h = innerHeight;
  if (isPortrait()) camera.setViewOffset(w, h, 0, h * (READER ? -0.045 : 0.14), w, h); else camera.setViewOffset(w, h, w * (READER ? viewOX : 0.17), h * 0.03, w, h);
  camera.updateProjectionMatrix();
}
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  setViewOff();
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); grade.uniforms.uRes.value.set(w, h);
    grade.uniforms.uCenter.value.set(isPortrait() || READER ? 0.5 : 0.36, isPortrait() ? (READER ? 0.6 : 0.66) : 0.5); }
  pMat.uniforms.uScale.value = h * renderer.getPixelRatio() * 0.9;
}
addEventListener('resize', resize);

// ---------- loop ----------
function frame(dt) {
  DT = dt; NOW += dt;
  updateTweens(); updateBook(NOW, dt); updateParticles(dt, NOW); applyCamera();
  glint.position.set(Math.sin(NOW * 0.35 + pose.az * 0.05) * 4, 2.6, Math.cos(NOW * 0.35) * 3 + 2);
  beam.material.uniforms.uTime.value = NOW; beamAxis.on = clamp(lampSpot.intensity / LAMP_I);
  if (bokeh) bokeh.uniforms.focus.value = camera.position.distanceTo(pose.target);
  grade.uniforms.uTime.value = NOW;
  composer.render();
  if (CAPTURE) syncCssAnimations();
}
const cssStart = new WeakMap();
function syncCssAnimations() { for (const an of document.getAnimations()) { if (!cssStart.has(an)) { cssStart.set(an, NOW); an.pause(); } an.currentTime = (NOW - cssStart.get(an)) * 1000; } }
let last = 0;
function loop(ts) { const dt = Math.min(0.05, last ? (ts - last) / 1000 : 1 / 60); last = ts; frame(dt); requestAnimationFrame(loop); }

// Reel timeline (~33 s): hook (book already opening, 1950 rising) -> 5 spreads x 5 s -> close to the cover + final line.
// Voice-over timed reel (51.6 s): exact page cues from CUES.
async function autoplayCues() {
  const [c1950, c1997, cCat, c2012, c2017, c2022, cEnd, total] = CUES;
  const at = t => wait(Math.max(0, t - NOW)), LEAD = 0.9;   // flips start LEAD s before the cue so the page lands on the word
  setPose(poses().autoStart); state.cover = Math.PI * 0.97; setLamp(1);
  const hook = { target: new THREE.Vector3(0.0, 0.42, -0.14), dist: readingDist() * 0.8 * (isPortrait() ? 0.94 : 1), el: 30, az: -26 };
  poseTween(hook, c1950 - 0.2, { e: camEase });
  let tok = await openBook('hook', { noPanel: true, noBeats: true, noCam: true });         // 1950 rises during the hook
  await at(c1950);
  setPanel(0, tok, [0.1, 1.6]); runBeats(0, tok, false, { d: 0.2 });
  poseTween(spreadPose(0, 'b'), c1997 - LEAD - c1950 - 0.1, { token: tok, e: camEase });
  await at(c1997 - LEAD);
  const A1 = c1997 - LEAD + FLIP;
  tok = await flip(1, { lineAt: [0.1, cCat - A1 - 0.3], beat: { d: 17.5 - 1.45 - 0.9 - A1 }, camDur: c2012 - LEAD - A1 - 0.2 });
  await at(cCat); catBeat(tok, 0.1);
  for (const [cue, next, s] of [[c2012, c2017, 2], [c2017, c2022, 3], [c2022, cEnd, 4]]) {
    await at(cue - LEAD);
    const A = cue - LEAD + FLIP;
    await flip(1, { lineAt: [0.1, 1.4], camDur: next - A - 0.3, beat: s === 4 ? { d: 0.2, counterDur: 43.0 - (A + 0.6) } : {} });
  }
  await at(cEnd);
  closeBook();
  await at(cEnd + 1.2); finalCard.classList.add('show');
  await at(total); window.__done = true;
}
async function autoplay() {
  if (USE_CUES) return autoplayCues();
  setPose(poses().autoStart);
  state.cover = Math.PI * 0.72; setLamp(1);
  await openBook(true);
  for (let s = 0; s < SEQ.length - 1; s++) { await wait(SPP - FLIP); await flip(1); }
  await wait(SPP - 0.9);
  await closeBook();
  await wait(2.5); window.__done = true;
}

// ---------- boot ----------
(async function boot() {
  const bar = document.querySelector('#loader .bar i'); let pd = 0, pt = 1;
  const tick = () => { pd++; if (bar) bar.style.width = Math.round(100 * pd / pt) + '%'; };
  await Promise.all(['700 40px ArefRuqaa', '400 40px Alexandria', '800 40px Alexandria', '600 40px PlexArabic'].concat(READER ? ['400 40px Amiri', '700 40px Amiri'] : []).map(f => document.fonts.load(f))).catch(() => {});
  if (READER) {   // chapter data is tiny: import every ready chapter now, images load per chapter later
    const ready = LIBRARY.filter(c => c.ready);
    await Promise.all(ready.filter(c => !CHDATA[c.id]).map(c => import('./chapters/' + c.file.slice(2)).then(m => { CHDATA[c.id] = m.default; }).catch(e => console.warn('chapter', c.id, e))));
    SEQ = [squeeze(TOC_SPREAD)];
    for (const c of ready) if (CHDATA[c.id]) CHDATA[c.id].spreads.forEach((s, k) => SEQ.push(squeeze({ ...s, ch: c.id, k })));
    setDims();
  }
  const first = READER ? [SEQ[0]] : SEQ, names = new Set();
  first.forEach(s => { s.layers.forEach(l => l.img && names.add(l.img)); (s.needs || []).forEach(n => names.add(n)); });
  const jobs = [...names].map(n => loadCard(n).then(tick));
  jobs.push(loadTex('img/cover_emblem.webp').then(t => { if (t) IMG.cover_emblem = t; tick(); }));
  for (const [k, f] of [['wood', 'tex_wood.jpg'], ['paper', 'tex_paper.jpg'], ['leather', 'tex_leather.jpg'], ['border', 'page_border.webp'], ['quill', 'quill.webp'], ['map', 'map.webp']])
    jobs.push(loadTex(`img/${f}`).then(t => { if (t) TEX[k] = t; tick(); }));
  pt = jobs.length;
  await Promise.all(jobs);
  prepBorderGold();
  buildLamp(); buildDesk(); buildBook(); if (READER) buildSpreadPopup(0); else buildPopups(); setupPost();
  if (READER) ensurePages(0);
  const dir = LAMP.aim.clone().sub(LAMP.head), len = dir.length(); dir.normalize();
  const u = new THREE.Vector3().crossVectors(dir, UP).normalize(), w2 = new THREE.Vector3().crossVectors(dir, u).normalize();
  beamAxis = { o: LAMP.head.clone(), d: dir, len: len * 0.95, r: Math.tan(0.5) * len, u, w: w2, on: 1 };
  emitBeamDust(IS_MOBILE && READER ? 220 : 380);
  resize();
  state.phase = 'closed'; setPose(poses().hero);
  document.getElementById('loader').classList.add('done'); if (CAPTURE) document.getElementById('loader').style.display = 'none';
  window.__ready = true; window.__state = state; window.__rt = spreadsRT; window.__flip = flip; window.__open = openBook; window.__jump = jumpTo; window.__seq = SEQ;
  window.__tocPt = i => { const r = TOC_ROWS[i]; if (!r) return null; const p = new THREE.Vector3((PW * 0.55 / PW - 1) * W, T + B + K * G + 0.004, (r.y0 + r.y1) / 2 / PH * H - H / 2); book.localToWorld(p); p.project(camera); return [(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight]; };
  if (CAPTURE) { window.__frame = (dt = 1 / 30) => frame(dt); window.__run = async (n, dt = 1 / 30) => { for (let i = 0; i < n; i++) { frame(dt); await new Promise(r => setTimeout(r, 0)); } }; frame(1 / 30); }
  else requestAnimationFrame(loop);
  if (AUTO) autoplay();
  else {
    if (savedIndex() > 0) document.getElementById('cover-resume').hidden = false;
    intro();
    setTimeout(() => loadChapter(SEQ[1] ? SEQ[1].ch : 'ch1'), 600);   // first chapter warms up while the title plays
  }
})();
