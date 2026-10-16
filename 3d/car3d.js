// 3D 車輛：把遊戲裡每台車的規格（3d/cars.json）建成 PBR 材質的圓滑車身，輪子會轉，煞車燈／頭燈可以個別控制
import * as THREE from 'three';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

const D2R = Math.PI / 180;

// 順著車身曲線放樣：沿用遊戲的規格（長寬高、腰線、車頭車尾比例），把一格一格的折面改成圓滑曲面
function loftBody(S, carId) {
  const U = 0.98 / 1700, Lm = S.L * U * 0.82, Wm = S.W * U, Hm = S.H * U, hw = Wm / 2;
  const yb = 0.13, belt = S.belt * Hm, roofY = Hm * 0.985, deckY = belt * 1.03, cowlY = belt * 1.07, noseY = belt * S.nose;
  const wb = hw * 0.86, ws = hw, wDeck = hw * 0.92, wRoof = hw * (carId === 'rx7' ? 0.74 : 0.7), ym = Math.min(0.3, belt - 0.04);
  const P = f => f * Lm, bz = P(S.rS + (S.rE - S.rS) * 0.55), duck = S.wing === 'duck' ? 0.05 : 0;
  const knots = [[0, belt * 0.98, wDeck * 0.96, ''], [P(0.03), deckY + duck, wDeck, 'deck'], [P(S.tE), deckY + duck * 0.4, wDeck * 0.97, 'deck'], [P(S.rS), roofY, wRoof, 'rear'],
    [bz - 0.02, roofY, wRoof, 'roof'], [bz + 0.02, roofY, wRoof, 'pillar'], [P(S.rE), roofY * 0.995, wRoof, 'roof'], [P(S.wB), cowlY, wDeck * 0.96, 'front'],
    [P(Math.min(0.97, S.wB + 0.04)), belt * 1.04, wDeck, 'deck'], [P(0.97), noseY * 1.02, wDeck * 0.96, 'hood'], [Lm, noseY * 0.92, wDeck * 0.9, 'hood']];
  const rings = knots.map(p => { const top = p[1], z = p[0], bl = Math.min(belt, top), sw = z < 0.04 ? ws * 0.98 : z > Lm - 0.08 ? ws * 0.95 : ws; return [[-wb, yb, z], [-sw, ym, z], [-sw, bl, z], [-p[2], top, z], [p[2], top, z], [sw, bl, z], [sw, ym, z], [wb, yb, z]]; });
  const V = a => new THREE.Vector3(a[0], a[1], a[2]);
  const along = rings[0].map((_, j) => new THREE.CatmullRomCurve3(rings.map(r => V(r[j])), false, 'catmullrom', 0.5));
  const K = 7, SUB = 4, stations = [], nInt = rings.length - 1;
  for (let i = 0; i < nInt; i++) for (let k = (i ? 1 : 0); k <= K; k++) { const t = (i + k / K) / nInt; stations.push({ pts: along.map(c => c.getPoint(t)), seg: knots[Math.min(nInt, i + (k === 0 ? 0 : 1))][3] }); }
  const section = st => { const c = new THREE.CatmullRomCurve3(st.pts, false, 'catmullrom', 0.5), out = []; for (let j = 0; j < 7; j++) for (let u = 0; u < SUB; u++) out.push({ p: c.getPoint((j + u / SUB) / 7), j }); out.push({ p: c.getPoint(1), j: 6 }); return out; };
  const secs = stations.map(section), cc = new THREE.Vector3(0, belt * 0.9, Lm / 2);
  const out = { paint: [], low: [], glass: [] };
  const push = (arr, a, b, c) => { const n = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a)); const m = a.clone().add(b).add(c).multiplyScalar(1 / 3).sub(cc); if (n.dot(m) < 0) [b, c] = [c, b]; arr.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); };
  for (let a = 1; a < secs.length; a++) {
    const A = secs[a - 1], B = secs[a], seg = stations[a].seg;
    for (let q = 0; q < A.length - 1; q++) {
      const j = A[q].j; let kind = 'paint';
      if (j === 0 || j === 6) kind = 'low'; else if ((j === 2 || j === 4) && seg === 'roof') kind = 'glass'; else if (j === 3 && (seg === 'rear' || seg === 'front')) kind = 'glass';
      push(out[kind], A[q].p, A[q + 1].p, B[q + 1].p); push(out[kind], A[q].p, B[q + 1].p, B[q].p);
    }
  }
  [secs[0], secs[secs.length - 1]].forEach(sc => { const ctr = sc.reduce((s, q) => s.add(q.p), new THREE.Vector3()).multiplyScalar(1 / sc.length); for (let q = 0; q < sc.length - 1; q++) push(out.paint, ctr, sc[q].p, sc[q + 1].p); });
  return out;
}

const KIND_MAT = { body: 'paint', roof: 'paint', rearcap: 'paint', frontcap: 'paint', mirror: 'paint', low: 'low', glass: 'glass', stripe: 'stripe', trim: 'trim', diff: 'trim', fin: 'trim', grille: 'trim', pipein: 'trim', bar: 'tail', led: 'tail', lamp: 'tail', head: 'head', chrome: 'chrome', pipe: 'chrome', carbon: 'carbon', wing: 'wing', plate: 'plate', platetxt: 'platetxt' };
const SMOOTH = new Set(['mirror']);
const geoCache = new Map();   // 同一台車的幾何只算一次，每台實際的車再配自己的材質

function carGeometry(carsData, id) {
  if (geoCache.has(id)) return geoCache.get(id);
  const car = carsData.cars[id], M = car.model, S = M.S;
  const buckets = {};
  const addFace = f => {
    const mk = KIND_MAT[f.kind] || 'trim'; const b = (buckets[mk] = buckets[mk] || { mk, tris: [], norms: [] });
    const v = f.v, n = f.n;
    const tri = (A, B, C) => {
      const e1 = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], e2 = [C[0] - A[0], C[1] - A[1], C[2] - A[2]];
      const cx = e1[1] * e2[2] - e1[2] * e2[1], cy = e1[2] * e2[0] - e1[0] * e2[2], cz = e1[0] * e2[1] - e1[1] * e2[0];
      const o = cx * n[0] + cy * n[1] + cz * n[2] < 0 ? [A, C, B] : [A, B, C];
      o.forEach(p => { b.tris.push(p[0], p[1], p[2]); b.norms.push(n[0], n[1], n[2]); });
    };
    for (let k = 1; k < v.length - 1; k++) tri(v[0], v[k], v[k + 1]);
  };
  M.extra.forEach(addFace);
  const parts = [];
  for (const b of Object.values(buckets)) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.tris, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.norms, 3));
    parts.push({ mk: b.mk, geo: g });
  }
  const lb = loftBody(S, id);
  for (const [k, arr] of Object.entries(lb)) { if (!arr.length) continue; let g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); g = toCreasedNormals(g, 62 * D2R); parts.push({ mk: k, geo: g, body: true }); }
  const res = { parts, M, S, scale: (S.L / 1000) / M.L, car };
  geoCache.set(id, res); return res;
}

const tireGeo = new Map();
export function buildCar(carsData, id, color, opts = {}) {
  const G = carGeometry(carsData, id), { M, S, scale, car } = G;
  const body = new THREE.Color(color || car.body);
  const po = (f, u) => ({ polygonOffset: true, polygonOffsetFactor: f, polygonOffsetUnits: u });
  const mats = {
    paint: new THREE.MeshPhysicalMaterial({ color: body, metalness: 0.55, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.3 }),
    low: new THREE.MeshStandardMaterial({ color: car.two ? new THREE.Color(car.two) : body.clone().multiplyScalar(0.28), roughness: 0.55, metalness: 0.1 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x070d14, metalness: 0.85, roughness: 0.04, envMapIntensity: 2.0, clearcoat: 1 }),
    stripe: new THREE.MeshPhysicalMaterial({ color: new THREE.Color(car.stripe || '#f2f2f2'), metalness: 0.2, roughness: 0.3, clearcoat: 1, ...po(-2, -2) }),
    trim: new THREE.MeshStandardMaterial({ color: 0x14161a, roughness: 0.5, metalness: 0.2, ...po(-2, -2) }),
    chrome: new THREE.MeshStandardMaterial({ color: 0xdfe3ea, roughness: 0.1, metalness: 1, envMapIntensity: 1.6, ...po(-2, -2) }),
    carbon: new THREE.MeshStandardMaterial({ color: 0x15171b, roughness: 0.35, metalness: 0.35 }),
    tail: new THREE.MeshStandardMaterial({ color: 0x5a0008, emissive: 0xff1020, emissiveIntensity: 0.15, roughness: 0.25, ...po(-3, -3) }),
    head: new THREE.MeshStandardMaterial({ color: 0xe9f1ff, emissive: 0xfff3d6, emissiveIntensity: 0.1, roughness: 0.1, ...po(-3, -3) }),
    plate: new THREE.MeshStandardMaterial({ color: 0xf1f1ec, roughness: 0.6, ...po(-3, -3) }),
    platetxt: new THREE.MeshStandardMaterial({ color: 0x1b1d22, roughness: 0.7, ...po(-4, -4) }),
  };
  mats.wing = (S.wing === 'gt' || S.wing === 'evo') ? mats.carbon : mats.paint;
  const inner = new THREE.Group();
  for (const p of G.parts) {
    const mat = p.mk === 'glass' ? mats.glass : p.mk === 'low' ? mats.low : mats[p.mk] || mats.trim;
    const mesh = new THREE.Mesh(p.geo, mat); mesh.castShadow = p.mk !== 'glass' || true; mesh.receiveShadow = !!p.body; inner.add(mesh);
  }
  const wheels = [];
  const tireM = new THREE.MeshStandardMaterial({ color: 0x0e0f11, roughness: 0.9 }), rimM = new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.22, metalness: 1, envMapIntensity: 1.5 });
  const wellM = new THREE.MeshBasicMaterial({ color: 0x050506, polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 });
  M.wheels.forEach(w => [-1, 1].forEach(s => {
    const key = w.r + '|' + w.hw; let tg = tireGeo.get(key);
    if (!tg) { const r = w.r, wd = w.hw * 2 * 1.05; tg = { tire: new THREE.CylinderGeometry(r, r, wd, 28).rotateZ(Math.PI / 2), rim: new THREE.CylinderGeometry(r * 0.66, r * 0.66, wd * 1.02, 24).rotateZ(Math.PI / 2), spoke: new THREE.BoxGeometry(wd * 1.06, r * 0.1, r * 0.62), well: new THREE.RingGeometry(r * 0.99, r * 1.28, 32) }; tireGeo.set(key, tg); }
    const wg = new THREE.Group(); const r = w.r;
    const tire = new THREE.Mesh(tg.tire, tireM); tire.castShadow = true;
    const rim = new THREE.Mesh(tg.rim, rimM);
    wg.add(tire, rim); for (let k = 0; k < 5; k++) { const sp = new THREE.Mesh(tg.spoke, tireM); sp.rotation.x = k / 5 * Math.PI; wg.add(sp); }
    wg.position.set(s * (M.hw - w.hw - 0.012), r, w.z); wg.userData.r = r; wheels.push(wg); inner.add(wg);
    const well = new THREE.Mesh(tg.well, wellM); well.position.set(s * (M.hw + 0.003), r, w.z); well.rotation.y = s * Math.PI / 2; inner.add(well);
  }));
  inner.scale.setScalar(scale); inner.position.set(0, 0, -M.L / 2 * scale);
  const group = new THREE.Group(); group.add(inner);
  const api = {
    group, mats, wheels, scale, length: S.L / 1000, width: S.W / 1000,
    spin: 0,
    setLights(brake, head) { mats.tail.emissiveIntensity = brake ? 4 : head ? 1.1 : 0.15; mats.head.emissiveIntensity = head ? 3.2 : 0.1; },
    roll(dist) { api.spin += dist; wheels.forEach(w => { w.rotation.x = -api.spin / w.userData.r / scale; }); },
    dispose() { Object.values(mats).forEach(m => m.dispose()); tireM.dispose(); rimM.dispose(); wellM.dispose(); },
  };
  return api;
}
