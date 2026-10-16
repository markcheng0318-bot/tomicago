// TomicaGo 3D 擬真畫面：用遊戲現有的賽道資料（彎度＋高度）重建立體賽道，物理與操控完全不動，只換「畫面」。
// 真實太陽位置與陰影、雨與濕滑路面、OpenStreetMap 真實建物、PBR 車輛、夜間頭燈與煞車燈。
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { buildCar } from './car3d.js';

const D2R = Math.PI / 180, A_PHYS = 0.009;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function sunAngles(latDeg, doy, hour) {
  const lat = latDeg * D2R, decl = 23.44 * D2R * Math.sin(2 * Math.PI * (284 + doy) / 365), H = (hour - 12) * 15 * D2R;
  const alt = Math.asin(Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(H));
  const az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) + Math.PI;
  return { alt, az };
}
function seeded(seed) { let s = (seed * 2654435761) >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function canvasTex(w, h, draw, repeat, renderer) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); if (repeat) t.repeat.set(repeat[0], repeat[1]); return t;
}

export async function create(opts) {
  const { glCanvas, T, tdef, RC, env, carsData, baked, quality, playerCar } = opts;
  const hs = tdef.hs || 120, SEG = RC.SEG, halfW = RC.ROAD / SEG, N = T.segs.length, loop = !T.p2p;
  const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.pixelRatio || 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !!quality.shadows; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.3, 4500);
  const rnd = seeded(tdef.seed || 7), disposables = [];

  // ───────── 中心線：把每一段的彎度累加成路線（每段 1 公尺），高度＝遊戲高度 ÷ 高度比例 ─────────
  let closeErr = 0; const PX = new Float32Array(N + 1), PZ = new Float32Array(N + 1), PY = new Float32Array(N + 1);
  const i16 = b64 => { const bin = atob(b64), n = bin.length >> 1, out = new Int16Array(n), dv = new DataView(new ArrayBuffer(bin.length)); for (let i = 0; i < bin.length; i++) dv.setUint8(i, bin.charCodeAt(i)); for (let i = 0; i < n; i++) out[i] = dv.getInt16(i * 2, true); return out; };
  if (loop && baked && baked.route && baked.n === N) {
    // 賽道：直接用真實路線（跟真實建物同一個座標系，而且一定會接成一圈）
    const dx = i16(baked.route.dx), dz = i16(baked.route.dz); let x = baked.route.x0, z = baked.route.z0;
    for (let i = 0; i < N; i++) { PX[i] = x; PZ[i] = z; PY[i] = T.segs[i].p1.world.y / hs; x += dx[i] / 1000; z += dz[i] / 1000; }
    closeErr = Math.hypot(x - PX[0], z - PZ[0]);
    const ex = x - PX[0], ez = z - PZ[0]; for (let i = 0; i < N; i++) { PX[i] -= ex * i / N; PZ[i] -= ez * i / N; }
    PX[N] = PX[0]; PZ[N] = PZ[0]; PY[N] = PY[0];
  } else {
    // 沒有真實路線資料（山道）：把每一段的彎度累加成路線
    let th = 0, x = 0, z = 0;
    for (let i = 0; i < N; i++) {
      PX[i] = x; PZ[i] = z; PY[i] = T.segs[i].p1.world.y / hs;
      const c = T.segs[i].curve * A_PHYS, mid = th + c / 2; x += Math.sin(mid); z -= Math.cos(mid); th += c;
    }
    PX[N] = x; PZ[N] = z; PY[N] = T.segs[N - 1].p2.world.y / hs;
    if (loop) { closeErr = Math.hypot(x - PX[0], z - PZ[0]); const ex = x - PX[0], ez = z - PZ[0]; for (let i = 0; i <= N; i++) { PX[i] -= ex * i / N; PZ[i] -= ez * i / N; } PY[N] = PY[0]; }
  }
  const FX = new Float32Array(N + 1), FZ = new Float32Array(N + 1);          // 每個節點的前進方向
  for (let i = 0; i <= N; i++) {
    const a = loop ? (i - 1 + N) % N : Math.max(0, i - 1), b = loop ? (i + 1) % N : Math.min(N, i + 1);
    let dx = PX[loop && i === N ? 1 : b] - PX[loop && i === N ? N - 1 : a], dz = PZ[loop && i === N ? 1 : b] - PZ[loop && i === N ? N - 1 : a];
    if (loop && i === N) { dx = PX[1] - PX[N - 1]; dz = PZ[1] - PZ[N - 1]; }
    const l = Math.hypot(dx, dz) || 1; FX[i] = dx / l; FZ[i] = dz / l;
  }
  const wrapU = u => loop ? ((u % N) + N) % N : clamp(u, 0, N - 0.001);
  function at(u, lateral = 0, out = {}) {            // 路線上 u 段的位置（lateral 為往右的公尺數）
    u = wrapU(u); const i = Math.floor(u), f = u - i, j = i + 1;
    const fx = FX[i] + (FX[j] - FX[i]) * f, fz = FZ[i] + (FZ[j] - FZ[i]) * f, l = Math.hypot(fx, fz) || 1, tx = fx / l, tz = fz / l;
    out.x = PX[i] + (PX[j] - PX[i]) * f - tz * lateral; out.z = PZ[i] + (PZ[j] - PZ[i]) * f + tx * lateral; out.y = PY[i] + (PY[j] - PY[i]) * f;
    out.tx = tx; out.tz = tz; out.slope = (PY[Math.min(N, i + 1)] - PY[Math.max(0, i - 1)]) / 2; return out;
  }

  // ───────── 地面高度：離路線最近點的高度（越遠越低）─────────
  let minX = 1e9, maxX = -1e9, minZ = 1e9, maxZ = -1e9, sumY = 0;
  for (let i = 0; i <= N; i++) { minX = Math.min(minX, PX[i]); maxX = Math.max(maxX, PX[i]); minZ = Math.min(minZ, PZ[i]); maxZ = Math.max(maxZ, PZ[i]); sumY += PY[i]; }
  const avgY = sumY / (N + 1), CELL = 40, grid = new Map();
  for (let i = 0; i <= N; i += 3) { const k = Math.floor(PX[i] / CELL) + ',' + Math.floor(PZ[i] / CELL); (grid.get(k) || grid.set(k, []).get(k)).push(i); }
  function near(x, z) {
    let best = -1, bd = 1e12;
    for (let r = 1; r <= 6 && best < 0; r++) for (let cx = Math.floor(x / CELL) - r; cx <= Math.floor(x / CELL) + r; cx++) for (let cz = Math.floor(z / CELL) - r; cz <= Math.floor(z / CELL) + r; cz++) {
      const a = grid.get(cx + ',' + cz); if (!a) continue;
      for (const i of a) { const d = (PX[i] - x) ** 2 + (PZ[i] - z) ** 2; if (d < bd) { bd = d; best = i; } }
    }
    return best < 0 ? { y: avgY, d: 300 } : { y: PY[best], d: Math.sqrt(bd) };
  }
  function minNear(x, z, rad) {   // 附近路線上最低的高度（地面要壓在所有附近路面的下面，才不會蓋住路）
    let m = 1e9; const r = Math.ceil(rad / CELL);
    for (let cx = Math.floor(x / CELL) - r; cx <= Math.floor(x / CELL) + r; cx++) for (let cz = Math.floor(z / CELL) - r; cz <= Math.floor(z / CELL) + r; cz++) { const a = grid.get(cx + ',' + cz); if (!a) continue; for (const i of a) if ((PX[i] - x) ** 2 + (PZ[i] - z) ** 2 < rad * rad && PY[i] < m) m = PY[i]; }
    return m;
  }
  const groundY = (x, z) => { const { y, d } = near(x, z); const lo = d < 120 ? minNear(x, z, 70) : y; return Math.min(y, lo) - 1.2 - Math.min(14, Math.max(0, d - 20) * 0.045); };

  // ───────── 天空、太陽（真實位置）、光 ─────────
  const sky = new Sky(); sky.scale.setScalar(4200); scene.add(sky);
  const sun = new THREE.DirectionalLight(0xffffff, 3); sun.castShadow = !!quality.shadows;
  sun.shadow.mapSize.set(quality.shadowSize || 2048, quality.shadowSize || 2048); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.06;
  Object.assign(sun.shadow.camera, { left: -60, right: 60, top: 60, bottom: -60, near: 1, far: 380 });
  scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight(0xbcd4ff, 0x4a4438, 0.5); scene.add(hemi);
  scene.fog = new THREE.FogExp2(0xaab8c8, 0.0004);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const now = new Date(), doy = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const lat = (baked && baked.lat) || tdef.lat || 36, rain = env.weather === 'rain' ? env.intensity : 0;
  const hour = tdef.night ? 21.6 : 8.6 + (env.phase || 0.5) * 8.2;
  const { alt, az } = sunAngles(lat, doy, hour), sunVec = new THREE.Vector3(Math.sin(az) * Math.cos(alt), Math.sin(alt), -Math.cos(az) * Math.cos(alt));
  const day = tdef.night ? 0 : clamp(Math.sin(alt) * 3 + 0.25, 0, 1), nightK = clamp(1 - day * 1.6, 0, 1), headOn = nightK > 0.45 || rain > 0.6;
  {
    const u = sky.material.uniforms;
    u.turbidity.value = 2 + 14 * rain + (alt < 0.2 ? 4 : 0); u.rayleigh.value = 1.2 + 2.5 * (1 - day) - 0.6 * rain; u.mieCoefficient.value = 0.004 + 0.02 * rain; u.mieDirectionalG.value = 0.8; u.sunPosition.value.copy(sunVec);
    sun.color.copy(new THREE.Color(0xfff2e0).lerp(new THREE.Color(0xff9a4a), clamp(1 - alt / 0.45, 0, 1)));
    sun.intensity = alt > 0 && !tdef.night ? Math.max(0, Math.sin(alt)) * 3.4 * (1 - 0.88 * rain) : 0;
    hemi.intensity = 0.4 + 0.45 * day * (1 - 0.35 * rain); hemi.color.set(0xbcd4ff).lerp(new THREE.Color(0x4a5b86), 1 - day);
    renderer.toneMappingExposure = 0.34 + 0.5 * day;
    scene.fog.color.copy(new THREE.Color(0xaec2d8).multiplyScalar(0.12 + 0.88 * day).lerp(new THREE.Color(0x6c7480).multiplyScalar(0.2 + 0.8 * day), rain));
    scene.fog.density = 0.00035 + 0.0024 * rain;
    const tmp = new THREE.Scene(); tmp.add(sky); const rt = pmrem.fromScene(tmp, 0, 0.1, 5000); scene.add(sky); scene.environment = rt.texture; disposables.push(rt);
  }

  // ───────── 路面、路肩、護牆 ─────────
  const rr = seeded(99);
  const asphaltTex = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = tdef.road_c ? tdef.road_c[0] : '#4a4c53'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(30,32,38,0.42)'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26000; i++) { const v = 40 + rr() * 70; g.fillStyle = `rgba(${v},${v},${v + 4},${0.25 + rr() * 0.4})`; g.fillRect(rr() * w, rr() * h, 1 + rr() * 1.6, 1 + rr() * 1.6); }
    for (const x of [0.30, 0.70]) { const gr = g.createLinearGradient((x - 0.09) * w, 0, (x + 0.09) * w, 0); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.5, 'rgba(0,0,0,0.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect((x - 0.09) * w, 0, 0.18 * w, h); }
    g.fillStyle = 'rgba(245,245,245,0.92)'; g.fillRect(0.02 * w, 0, 0.012 * w, h); g.fillRect(0.968 * w, 0, 0.012 * w, h);
  }, null, renderer);
  const puddleTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { const x = rr() * w, y = rr() * h, r = 14 + rr() * 46, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(0,0,0,0.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); } }, null, renderer);
  puddleTex.colorSpace = THREE.NoColorSpace;
  const W2 = halfW;                                      // 路面半寬（公尺）
  function ribbon(offA, offB, dy, vScale, hDelta, dyB) {     // 沿路線的帶狀曲面；hDelta 不為 0 時做成垂直牆面
    const pos = [], uv = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const fx = FX[i], fz = FZ[i], rx = -fz, rz = fx;
      if (hDelta) pos.push(PX[i] + rx * offA, PY[i] + dy, PZ[i] + rz * offA, PX[i] + rx * offA, PY[i] + dy + hDelta, PZ[i] + rz * offA);
      else pos.push(PX[i] + rx * offA, PY[i] + dy, PZ[i] + rz * offA, PX[i] + rx * offB, PY[i] + (dyB === undefined ? dy : dyB), PZ[i] + rz * offB);
      const v = i / vScale; uv.push(0, v, 1, v);
      if (i < N) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const roadMat = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.93, metalness: 0 });
  roadMat.roughness = 0.93 - 0.74 * rain; roadMat.color.setScalar(1 - 0.38 * rain); roadMat.envMapIntensity = 0.5 + 1.6 * rain; if (rain > 0.12) roadMat.roughnessMap = puddleTex;
  const roadMesh = new THREE.Mesh(ribbon(-W2, W2, 0.04, 10), roadMat); roadMesh.name = 'road'; roadMesh.receiveShadow = true; scene.add(roadMesh);
  const rumbleCols = tdef.rumble || ['#d62828', '#f1f1f1'];
  const kerbTex = canvasTex(128, 32, (g, w, h) => { for (let i = 0; i < 4; i++) { g.fillStyle = rumbleCols[i % 2]; g.fillRect(i * 32, 0, 32, h); } }, null, renderer);
  [[-1], [1]].forEach(([s]) => {
    const g = ribbon(s * W2, s * (W2 + 0.9), 0.06, 3); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: kerbTex, roughness: 0.6, side: THREE.DoubleSide })); m.name = 'kerb'; m.receiveShadow = true; scene.add(m);
  });
  { // 路肩外側的草地帶：緊貼著路面高度、往外慢慢降低，這樣不管路面多斜，路和地面之間都不會出現破洞或把路蓋住
    const gc = new THREE.Color(tdef.grass ? tdef.grass[0] : '#4a9a4e'), sm = new THREE.MeshStandardMaterial({ color: gc, roughness: 0.96, side: THREE.DoubleSide });
    [[-1], [1]].forEach(([sd]) => { const g = ribbon(sd * (W2 + 0.85), sd * (W2 + 0.85 + 22), 0.0, 8, 0, -1.6); const m = new THREE.Mesh(g, sm); m.name = 'shoulder'; m.receiveShadow = true; scene.add(m); });
  }
  if (tdef.wall) {
    const wallCols = tdef.wall.cols, wH = Math.max(0.9, tdef.wall.h / SEG), off = W2 * tdef.wall.off + 0.35;
    const tex = canvasTex(64, 64, (g, w, h) => { g.fillStyle = wallCols[0]; g.fillRect(0, 0, w, h / 2); g.fillStyle = wallCols[1]; g.fillRect(0, h / 2, w, h / 2); }, null, renderer);
    [[-1], [1]].forEach(([s]) => { const g = ribbon(s * off, 0, 0.04, 6, wH); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; scene.add(m); });
  } else {
    // 一般賽道：路肩外有低矮的護欄
    const gm = new THREE.MeshStandardMaterial({ color: 0xcfd3d9, roughness: 0.55, metalness: 0.6, side: THREE.DoubleSide });
    [[-1], [1]].forEach(([s]) => { const g = ribbon(s * (W2 + 3.2), 0, 0.05, 6, 0.75); const m = new THREE.Mesh(g, gm); m.castShadow = true; scene.add(m); });
  }
  // 起跑／終點線與門架
  const lineMats = {};
  T.segs.forEach((sg, i) => {
    if (sg.line) { const m = lineMats[sg.line] || (lineMats[sg.line] = new THREE.MeshBasicMaterial({ color: new THREE.Color(sg.line) })); const b = new THREE.Mesh(new THREE.PlaneGeometry(W2 * 2, 1).rotateX(-Math.PI / 2), m); b.position.set(PX[i] + FX[i] * 0.5, PY[i] + 0.07, PZ[i] + FZ[i] * 0.5); b.rotation.y = Math.atan2(-FX[i], -FZ[i]) + Math.PI; b.renderOrder = 2; scene.add(b); }
    if (sg.gantry) {
      const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color: 0x2b2f3a, roughness: 0.6 });
      [-1, 1].forEach(s => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.5, 7, 0.5), m); p.position.set(s * (W2 + 1.2), 3.5, 0); g.add(p); });
      const ban = new THREE.Mesh(new THREE.BoxGeometry(W2 * 2 + 2.4, 1.6, 0.4), new THREE.MeshStandardMaterial({ map: canvasTex(256, 32, (c, w, h) => { for (let x = 0; x < 32; x++) for (let y = 0; y < 4; y++) { c.fillStyle = (x + y) % 2 ? '#15171c' : '#f0f0f0'; c.fillRect(x * 8, y * 8, 8, 8); } }, [1, 1], renderer), roughness: 0.6 }));
      ban.position.set(0, 6.4, 0); g.add(ban); g.position.set(PX[i], PY[i], PZ[i]); g.rotation.y = Math.atan2(-FX[i], -FZ[i]) + Math.PI; g.traverse(o => { o.castShadow = true; }); scene.add(g);
    }
  });

  // ───────── 地面（跟著路線高度起伏）─────────
  {
    const pad = 420, w = maxX - minX + pad * 2, h = maxZ - minZ + pad * 2, cell = clamp(Math.sqrt(w * h / 22000), 14, 60);
    const nx = Math.ceil(w / cell), nz = Math.ceil(h / cell), pos = new Float32Array((nx + 1) * (nz + 1) * 3), col = new Float32Array((nx + 1) * (nz + 1) * 3), idx = [];
    const g0 = new THREE.Color(tdef.grass ? tdef.grass[0] : '#4a9a4e'), g1 = new THREE.Color(tdef.grass ? tdef.grass[1] : '#428f46'), far = new THREE.Color(tdef.mtn || '#7aa6c4'), c = new THREE.Color();
    for (let k = 0, iz = 0; iz <= nz; iz++) for (let ix = 0; ix <= nx; ix++, k += 3) {
      const x = minX - pad + ix * cell, z = minZ - pad + iz * cell, ng = near(x, z);
      pos[k] = x; pos[k + 1] = groundY(x, z); pos[k + 2] = z;
      c.copy(g0).lerp(g1, rnd()).lerp(far, clamp((ng.d - 120) / 500, 0, 0.55)); col[k] = c.r; col[k + 1] = c.g; col[k + 2] = c.b;
    }
    for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) { const a = iz * (nx + 1) + ix, b = a + 1, d = a + nx + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals();
    const gm = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.96 })); gm.name = 'ground'; gm.receiveShadow = true; scene.add(gm);
  }

  // ───────── 建物：OpenStreetMap 真實輪廓（已預先排除壓到賽道的），沒有資料的賽道只用遊戲內的景物 ─────────
  const winTex = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#d9d2c3'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2; i++) { g.fillStyle = '#34465a'; g.fillRect(i * 64 + 14, 12, 36, 40); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(i * 64 + 14, 12, 36, 12); g.fillStyle = '#b9b1a2'; g.fillRect(i * 64 + 12, 52, 40, 4); } }, [1 / 6, 1 / 3.4], renderer);
  const winEmit = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#000'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2; i++) if (rr() < 0.5) { g.fillStyle = rr() < 0.7 ? '#ffd9a0' : '#bfe3ff'; g.fillRect(i * 64 + 14, 12, 36, 40); } }, [1 / 6, 1 / 3.4], renderer);
  const tints = [0xffffff, 0xf3e6d2, 0xe9efe8, 0xe8ddd0, 0xf6d9b8, 0xd7dde6];
  const winMats = tints.map(c => new THREE.MeshStandardMaterial({ color: c, map: winTex, emissive: 0xffffff, emissiveMap: winEmit, emissiveIntensity: nightK * 3.2, roughness: 0.82, metalness: 0.05 }));
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x8a8d92, roughness: 0.9 });
  let nBuild = 0;
  const footprints = [];   // 建物在世界座標裡的輪廓（檢查是否壓到賽道用）
  if (baked && baked.buildings) for (const b of baked.buildings) {
    const pts = [];
    for (let k = 0; k < b.w.length; k += 2) pts.push(new THREE.Vector2(b.w[k], -b.w[k + 1]));   // 世界座標（跟路線同一個座標系），輪廓維持原樣
    if (pts.length < 3) continue;
    footprints.push(pts.map(p => [p.x, -p.y])); footprints[footprints.length - 1].src = b;
    const shape = new THREE.Shape(pts), depth = Math.max(2.5, b.h - b.mh);
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
    const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length, cz = -pts.reduce((a, p) => a + p.y, 0) / pts.length;
    const mesh = new THREE.Mesh(geo, [roofMat, winMats[nBuild % winMats.length]]); mesh.position.y = groundY(cx, cz) + b.mh; mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); nBuild++;
  }

  // ───────── 路邊景物：遊戲裡每一段本來就有的樹、燈、看台…，換成立體的 ─────────
  const inst = {};   // type -> [{x,y,z,s,rot,c}]
  T.segs.forEach((sg, i) => sg.sprites.forEach(sp => {
    const side = Math.sign(sp.offset) || 1, lat = sp.offset * halfW, q = at(i + 0.5, lat, {});
    if (sp.type === 'building' && nBuild > 40) return;              // 已有真實建物就不再放示意用的方塊
    (inst[sp.type] = inst[sp.type] || []).push({ x: q.x, y: groundY(q.x, q.z), z: q.z, s: 0.75 + sp.seed * 0.6, rot: sp.seed * 6.28, tx: q.tx, tz: q.tz, side });
  }));
  const leafCol = new THREE.Color(tdef.leaf || '#3b9a45');
  function instMesh(geos, list, tint) {
    // geos: [{g, m, y}]；全部做成 InstancedMesh（一種零件一個）
    const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new THREE.Vector3(), P3 = new THREE.Vector3();
    geos.forEach(({ g, m, y = 0, sc = [1, 1, 1] }) => {
      const im = new THREE.InstancedMesh(g, m, list.length); im.castShadow = true; im.receiveShadow = true;
      list.forEach((o, k) => { Q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), o.rot); S3.set(o.s * sc[0], o.s * sc[1], o.s * sc[2]); P3.set(o.x, o.y + y * o.s, o.z); M4.compose(P3, Q, S3); im.setMatrixAt(k, M4); if (tint) im.setColorAt(k, tint(o, k)); });
      im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; scene.add(im);
    });
  }
  const mat = (c, r = 0.9) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const colJit = (base) => (o, k) => new THREE.Color(base).offsetHSL((((k * 37) % 17) / 17 - 0.5) * 0.06, 0, (((k * 53) % 13) / 13 - 0.5) * 0.12);
  const trunk = mat(0x5b4631);
  if (inst.tree) instMesh([{ g: new THREE.CylinderGeometry(0.22, 0.32, 3.2, 6), m: trunk, y: 1.6 }, { g: new THREE.IcosahedronGeometry(2.1, 1), m: mat(0xfdfdfd), y: 4.4, sc: [1, 1.15, 1] }].map((e, k) => k ? e : e), inst.tree, null);
  if (inst.tree) { /* 樹冠顏色用實例顏色 */ }
  if (inst.pine) instMesh([{ g: new THREE.CylinderGeometry(0.2, 0.28, 2.4, 6), m: trunk, y: 1.2 }, { g: new THREE.ConeGeometry(1.9, 5.4, 8), m: mat(0xfdfdfd), y: 5 }], inst.pine, null);
  if (inst.bush) instMesh([{ g: new THREE.IcosahedronGeometry(1.0, 1), m: mat(0xfdfdfd), y: 0.7, sc: [1.3, 0.8, 1.3] }], inst.bush, null);
  if (inst.palm) instMesh([{ g: new THREE.CylinderGeometry(0.18, 0.3, 7.5, 6), m: mat(0x8a6a44), y: 3.7 }, { g: new THREE.ConeGeometry(2.6, 1.4, 7), m: mat(0x2f8f43), y: 7.8, sc: [1, 0.6, 1] }], inst.palm, null);
  if (inst.tire) instMesh([{ g: new THREE.CylinderGeometry(0.55, 0.55, 1.5, 12), m: mat(0x15161a, 0.8), y: 0.75 }, { g: new THREE.CylinderGeometry(0.56, 0.56, 0.18, 12), m: mat(0xf1f1f1, 0.7), y: 1.0 }], inst.tire, null);
  if (inst.flag) instMesh([{ g: new THREE.CylinderGeometry(0.05, 0.05, 5, 5), m: mat(0xdddddd, 0.4), y: 2.5 }, { g: new THREE.BoxGeometry(1.5, 0.9, 0.04), m: mat(0xffffff), y: 4.5, sc: [1, 1, 1] }], inst.flag, null);
  if (inst.lamp) instMesh([{ g: new THREE.CylinderGeometry(0.08, 0.12, 8, 6), m: mat(0x9aa4b0, 0.4), y: 4 }, { g: new THREE.SphereGeometry(0.35, 8, 6), m: new THREE.MeshStandardMaterial({ color: 0xfff1c0, emissive: 0xffe0a0, emissiveIntensity: 0.4 + nightK * 4 }), y: 8 }], inst.lamp, null);
  if (inst.neon) instMesh([{ g: new THREE.BoxGeometry(3.5, 5, 0.3), m: new THREE.MeshStandardMaterial({ color: 0x222633, emissive: 0xff2d95, emissiveIntensity: 0.3 + nightK * 2.6 }), y: 4 }], inst.neon, null);
  if (inst.yacht) instMesh([{ g: new THREE.BoxGeometry(5, 3, 14), m: mat(0xf4f6fa, 0.4), y: 1.5 }, { g: new THREE.BoxGeometry(3.4, 2, 6), m: mat(0xdde3ee, 0.4), y: 4 }], inst.yacht, null);
  if (inst.grandstand) instMesh([{ g: new THREE.BoxGeometry(32, 7, 7), m: new THREE.MeshStandardMaterial({ map: canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#9aa1ad'; g.fillRect(0, 0, w, h); for (let i = 0; i < 700; i++) { g.fillStyle = ['#e63946', '#f1faee', '#ffd166', '#118ab2', '#06d6a0'][Math.floor(rr() * 5)]; g.fillRect(rr() * w, rr() * h, 2, 2); } }, [3, 1], renderer), roughness: 0.8 }), y: 3.5 }, { g: new THREE.BoxGeometry(32.4, 0.4, 8), m: mat(0x4b5260), y: 7.2 }], inst.grandstand.map(o => ({ ...o, rot: Math.atan2(o.tx, o.tz) + (o.side > 0 ? Math.PI / 2 * 0 : 0) + Math.PI / 2 })), null);
  if (inst.building) instMesh([{ g: new THREE.BoxGeometry(14, 1, 14), m: winMats[1], y: 0.5, sc: [1, 1, 1] }], inst.building.map((o, k) => ({ ...o, s: 1 + ((k * 7) % 5) * 0.2 })), null);
  // 樹冠、針葉的顏色：用實例顏色隨機一點（上面建立時先給白色材質）
  scene.traverse(o => {
    if (o.isInstancedMesh && o.material && o.material.color && o.material.color.getHex() === 0xfdfdfd && !o.instanceColor) {
      for (let k = 0; k < o.count; k++) o.setColorAt(k, new THREE.Color(leafCol).offsetHSL(((k * 37) % 17 / 17 - 0.5) * 0.07, 0, ((k * 53) % 13 / 13 - 0.5) * 0.14));
      if (o.instanceColor) o.instanceColor.needsUpdate = true;
    }
  });

  // ───────── 雨 ─────────
  const RAIN_N = quality.rainN || 5000, rainPos = new Float32Array(RAIN_N * 3), rainVel = new Float32Array(RAIN_N), RB = { x: 80, y: 45, z: 80 };
  for (let i = 0; i < RAIN_N; i++) { rainPos[i * 3] = (rnd() - 0.5) * RB.x * 2; rainPos[i * 3 + 1] = rnd() * RB.y; rainPos[i * 3 + 2] = (rnd() - 0.5) * RB.z * 2; rainVel[i] = 24 + rnd() * 10; }
  const rainLines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.3 + 0.4 * rain * (0.4 + 0.6 * day), fog: false, depthWrite: false }));
  rainLines.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(RAIN_N * 6), 3)); rainLines.frustumCulled = false; rainLines.visible = rain > 0.02; rainLines.geometry.setDrawRange(0, Math.floor(RAIN_N * 2 * Math.min(1, rain * 1.1))); scene.add(rainLines);
  function stepRain(dt) {
    if (!rainLines.visible) return; const out = rainLines.geometry.attributes.position.array, wind = 3.5, cp = camera.position;
    for (let i = 0; i < RAIN_N; i++) {
      const k = i * 3; rainPos[k + 1] -= rainVel[i] * dt; rainPos[k] -= wind * dt;
      if (rainPos[k + 1] < 0) { rainPos[k + 1] = RB.y; rainPos[k] = (rnd() - 0.5) * RB.x * 2; rainPos[k + 2] = (rnd() - 0.5) * RB.z * 2; }
      if (rainPos[k] < -RB.x) rainPos[k] += RB.x * 2;
      const x = cp.x + rainPos[k], y = cp.y - 8 + rainPos[k + 1], z = cp.z + rainPos[k + 2], L = rainVel[i] * 0.045, j = i * 6;
      out[j] = x; out[j + 1] = y; out[j + 2] = z; out[j + 3] = x + wind * 0.045; out[j + 4] = y + L; out[j + 5] = z;
    }
    rainLines.geometry.attributes.position.needsUpdate = true;
  }

  // ───────── 車輛 ─────────
  const poolTex = canvasTex(64, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.18, 2, w / 2, h * 0.5, h * 0.5); gr.addColorStop(0, 'rgba(255,244,214,0.95)'); gr.addColorStop(0.45, 'rgba(255,236,190,0.35)'); gr.addColorStop(1, 'rgba(255,230,170,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, null, renderer);
  poolTex.wrapS = poolTex.wrapT = THREE.ClampToEdgeWrapping;
  const poolGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
  const CAR_K = 0.8;            // 車子相對真實尺寸縮小一點，賽道看起來才不會太窄
  const cars = new Map();       // key -> {api, lastSpeed, brakeT, pool}
  const up = new THREE.Vector3(0, 1, 0), M4 = new THREE.Matrix4(), Z0 = new THREE.Vector3();
  function ensureCar(key, id, color) {
    let c = cars.get(key); if (c && c.id === id && c.color === color) return c;
    if (c) { scene.remove(c.api.group); c.api.dispose(); if (c.pool) scene.remove(c.pool); }
    const api = buildCar(carsData, id, color); api.group.scale.setScalar(CAR_K); scene.add(api.group);
    const pool = new THREE.Mesh(poolGeo, new THREE.MeshBasicMaterial({ map: poolTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.0, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4, fog: false })); pool.renderOrder = 3; scene.add(pool);
    c = { api, id, color, lastSpeed: 0, brake: 0, pool }; cars.set(key, c); return c;
  }
  const headL = new THREE.SpotLight(0xfff2d8, 0, 80, 0.55, 0.6, 1.4), headR = headL.clone(), tgtL = new THREE.Object3D(), tgtR = new THREE.Object3D();
  scene.add(headL, headR, tgtL, tgtR); headL.target = tgtL; headR.target = tgtR;
  const tmpO = {}, tmpO2 = {};
  function placeCar(c, u, lateral, speedMs, dt, yawExtra, brake) {
    const g = c.api.group, p = at(u, lateral, tmpO);
    g.position.set(p.x, p.y + 0.04, p.z);
    M4.lookAt(new THREE.Vector3(p.tx, p.slope, p.tz).normalize(), Z0, up); g.quaternion.setFromRotationMatrix(M4); if (yawExtra) g.rotateY(yawExtra);
    c.api.roll(speedMs * dt);
    c.api.setLights(brake, headOn);
    c.pool.material.opacity = headOn ? 0.5 : 0;
    if (headOn) { const q = at(u + 11, lateral, tmpO2); c.pool.position.set(q.x, q.y + 0.07, q.z); c.pool.rotation.y = Math.atan2(-p.tx, -p.tz) + Math.PI; c.pool.scale.set(8, 1, 24); c.pool.visible = true; } else c.pool.visible = false;
    return p;
  }

  // ───────── 每一幀 ─────────
  const camPos = new THREE.Vector3(), camLook = new THREE.Vector3(); let camInit = false, shakeT = 0;
  const camTmp = {}, lookTmp = {}, v3 = new THREE.Vector3();
  function frame(st) {
    const dt = clamp(st.dt, 0.001, 0.06), uPlayer = (st.position + RC.PLAYER_Z) / SEG, spdMs = st.speed / SEG;
    // 玩家
    const pc = ensureCar('me', playerCar.id, playerCar.color);
    const slipRot = st.slipT > 0 ? Math.sin(st.slipT * 11) * 0.28 * st.slipDir : 0;
    const pp = placeCar(pc, uPlayer, st.playerX * halfW, spdMs, dt, -st.steer * 0.12 + slipRot, !!st.braking);
    if (headOn) {
      const f = new THREE.Vector3(pp.tx, 0, pp.tz), r = new THREE.Vector3(-pp.tz, 0, pp.tx);
      [headL, headR].forEach((h, i) => { h.position.copy(pc.api.group.position).addScaledVector(f, pc.api.length * CAR_K * 0.46).addScaledVector(r, (i ? 1 : -1) * 0.55).add(v3.set(0, 0.7, 0)); });
      tgtL.position.copy(pc.api.group.position).addScaledVector(f, 28).addScaledVector(r, -1.2); tgtR.position.copy(pc.api.group.position).addScaledVector(f, 28).addScaledVector(r, 1.2);
      headL.intensity = headR.intensity = 1500;
    }
    // 對手
    const seen = new Set();
    st.cars.forEach(o => {
      const key = 'ai' + o.id; seen.add(key); const c = ensureCar(key, o.carId, o.color);
      const sp = o.speed / SEG, br = (o.speed < c.lastSpeed - 14 * dt * 60 * 0.15) ? 1 : 0; c.brake = c.brake * 0.85 + br * 0.15; c.lastSpeed = o.speed;
      placeCar(c, o.z / SEG, o.offset * halfW, sp, dt, o.slipT > 0 ? Math.sin(o.slipT * 11) * 0.25 : 0, c.brake > 0.5);
      c.api.group.visible = true;
    });
    cars.forEach((c, k) => { if (k !== 'me' && !seen.has(k)) c.api.group.visible = false; });
    // 太陽的陰影跟著玩家
    sun.position.copy(pc.api.group.position).addScaledVector(sunVec, 170); sun.target.position.copy(pc.api.group.position); sun.target.updateMatrixWorld();
    // 追尾鏡頭
    const back = 10.8 - Math.min(1.8, spdMs * 0.012), cu = uPlayer - back, cp = at(cu, st.playerX * halfW * 0.78, camTmp);
    const wantPos = v3.set(cp.x, cp.y + 3.5 + Math.min(0.7, spdMs * 0.005), cp.z).clone();
    const lk = at(uPlayer + 9, st.playerX * halfW * 0.9, lookTmp), wantLook = new THREE.Vector3(lk.x, lk.y + 0.8, lk.z);
    if (!camInit) { camPos.copy(wantPos); camLook.copy(wantLook); camInit = true; }
    const kP = 1 - Math.exp(-dt * 9), kL = 1 - Math.exp(-dt * 12); camPos.lerp(wantPos, kP); camLook.lerp(wantLook, kL);
    camera.position.copy(camPos);
    if (st.crashT > 0) { shakeT += dt; camera.position.x += Math.sin(shakeT * 70) * 0.06; camera.position.y += Math.cos(shakeT * 83) * 0.05; }
    camera.lookAt(camLook);
    const asp = camera.aspect, fov = (asp < 0.8 ? 68 : 54) + clamp(spdMs / 55, 0, 1) * 6; if (Math.abs(camera.fov - fov) > 0.05) { camera.fov = fov; camera.updateProjectionMatrix(); }
    stepRain(dt);
    renderer.render(scene, camera);
  }
  function resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  function dispose() {
    cars.forEach(c => { c.api.dispose(); });
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { const ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(m => { ['map', 'emissiveMap', 'roughnessMap'].forEach(k => { if (m[k]) m[k].dispose(); }); m.dispose(); }); } });
    disposables.forEach(d => d.dispose()); pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
  }
  // 檢查：建物輪廓有沒有壓到路面（含路肩與護牆）；回傳壓到的路段數與建物離路中心線最近的距離
  function audit(rays) {
    const inside = (x, z, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
    const wallOff = tdef.wall ? W2 * tdef.wall.off + 0.4 : W2 + 3.3; let hits = 0, hitSegs = new Set(), minGap = 1e9, tmp = {};
    for (let i = 0; i < N; i += 2) for (const lat of [-wallOff, -W2, 0, W2, wallOff]) { const q = at(i, lat, tmp); for (const poly of footprints) { if (Math.abs(poly[0][0] - q.x) > 400 || Math.abs(poly[0][1] - q.z) > 400) continue; if (inside(q.x, q.z, poly)) { hits++; hitSegs.add(i); poly.hit = (poly.hit || 0) + 1; break; } } }
    for (const poly of footprints) for (let k = 0; k < poly.length; k++) { const a = poly[k], b = poly[(k + 1) % poly.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]), m = Math.max(1, Math.ceil(L / 2)); for (let t = 0; t < m; t++) { const d = near(a[0] + (b[0] - a[0]) * t / m, a[1] + (b[1] - a[1]) * t / m).d; if (d < minGap) minGap = d; } }
    const worst = footprints.filter(f => f.hit).sort((a, b) => b.hit - a.hit).slice(0, 3).map(f => ({ hit: f.hit, h: f.src.h, p: f.src.w.slice(0, 16), n: f.length }));
    // 路面有沒有被地面蓋住：從路面正上方往下射線，最先碰到的如果不是路／路肩／緣石就是被蓋住了
    const rc_ = new THREE.Raycaster(), dir = new THREE.Vector3(0, -1, 0), targets = scene.children.filter(o => o.name === 'ground' || o.name === 'road' || o.name === 'kerb' || o.name === 'shoulder');
    let covered = 0, coveredAt = []; const tp = {};
    if (rays) for (let i = 0; i < N; i += 3) for (const lat of [-W2 * 0.9, 0, W2 * 0.9]) { const q = at(i, lat, tp); rc_.set(new THREE.Vector3(q.x, q.y + 30, q.z), dir); const h = rc_.intersectObjects(targets, false)[0]; if (h && h.object.name === 'ground') { covered++; if (coveredAt.length < 8) coveredAt.push([i, +(h.point.y - q.y).toFixed(2)]); } }
    // 彎道半徑比路面半寬還小的地方（路面會在彎的內側折疊起來）
    let folds = 0, minR = 1e9;
    const walk = (i0, dir) => { let d = 0, k = i0, c = 0; while (d < 4 && c < 400) { const k2 = (k + dir + N) % N; d += Math.hypot(PX[k2] - PX[k], PZ[k2] - PZ[k]); k = k2; c++; } return k; };
    for (let i = 0; i < N; i += 2) { const A = walk(i, -1), C = walk(i, 1), ab = Math.hypot(PX[i] - PX[A], PZ[i] - PZ[A]), bc = Math.hypot(PX[C] - PX[i], PZ[C] - PZ[i]), ca = Math.hypot(PX[A] - PX[C], PZ[A] - PZ[C]), a2 = Math.abs((PX[i] - PX[A]) * (PZ[C] - PZ[A]) - (PZ[i] - PZ[A]) * (PX[C] - PX[A])); if (a2 > 1e-6) { const R = ab * bc * ca / (2 * a2); minR = Math.min(minR, R); if (R < W2 + 0.3) { folds++; (audit.foldAt = audit.foldAt || []).push([i, +R.toFixed(1), Math.round(PX[i]), Math.round(PZ[i])]); } } }
    return { foldAt: audit.foldAt && audit.foldAt.slice(0, 8), folds, minRadius: +minR.toFixed(1), covered, coveredAt, worst, footprints: footprints.length, hits, hitSegs: [...hitSegs].slice(0, 12), minGapToCenter: +minGap.toFixed(1), roadHalf: W2, wallOff: +wallOff.toFixed(1) };
  }
  return { frame, resize, dispose, audit, camera, scene, at, N, info: { closeErr: Math.round(closeErr), buildings: nBuild, hour, alt: alt / D2R, headOn }, renderer };
}
