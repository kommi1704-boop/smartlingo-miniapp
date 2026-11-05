// SmartLingo Learning Universe — the interactive 3D scene (React Three Fiber).
//
// Design notes:
// - Fully PROCEDURAL: every island, tree, castle and cloud is built from cheap
//   three.js primitives. No external models/textures to download — the whole
//   universe arrives with this single lazy chunk.
// - Deep navy/indigo atmosphere, violet+blue lighting, cyan highlights (spec).
// - Interactions: orbit/zoom (mouse + touch), click an island to select it,
//   hover cursor, smooth camera focus on selection, locked worlds show a lock.
// - Performance: shared module-level geometries, low poly counts, shadows off
//   and reduced particle counts on low-end devices, capped DPR, ~40 draw calls.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WORLDS, type WorldId, type WorldStatus } from '../../lib/universe';

// ---------------------------------------------------------------------------
// Shared geometry/material kit (module level => created once, reused everywhere)
// ---------------------------------------------------------------------------

const G = {
  top: new THREE.CylinderGeometry(1.62, 1.5, 0.32, 9),
  cone: new THREE.ConeGeometry(0.42, 0.95, 6),
  coneSmall: new THREE.ConeGeometry(0.28, 0.6, 6),
  trunk: new THREE.CylinderGeometry(0.07, 0.1, 0.5, 5),
  box: new THREE.BoxGeometry(0.5, 0.5, 0.5),
  tower: new THREE.CylinderGeometry(0.22, 0.26, 1.1, 7),
  roof: new THREE.ConeGeometry(0.3, 0.5, 7),
  sphere: new THREE.SphereGeometry(0.16, 12, 10),
  bigSphere: new THREE.SphereGeometry(0.42, 16, 12),
  torus: new THREE.TorusGeometry(0.34, 0.07, 8, 20),
  ring: new THREE.TorusGeometry(1.15, 0.045, 8, 40),
  disc: new THREE.CylinderGeometry(1.05, 1.05, 0.05, 24),
  crystal: new THREE.OctahedronGeometry(0.4),
  peak: new THREE.ConeGeometry(0.95, 1.7, 7),
  snow: new THREE.ConeGeometry(0.42, 0.75, 7),
};

const rockGeo = new THREE.ConeGeometry(1.5, 2.4, 7);
rockGeo.rotateX(Math.PI); // point down — floating-island silhouette

const M = {
  rock: new THREE.MeshStandardMaterial({ color: '#343a63', flatShading: true, roughness: 0.95, metalness: 0.05 }),
  rockDim: new THREE.MeshStandardMaterial({ color: '#272b48', flatShading: true, roughness: 0.95, metalness: 0.05 }),
  top: new THREE.MeshStandardMaterial({ color: '#454a7d', flatShading: true, roughness: 0.9 }),
  topDim: new THREE.MeshStandardMaterial({ color: '#333656', flatShading: true, roughness: 0.9 }),
  wood: new THREE.MeshStandardMaterial({ color: '#6b4b3a', roughness: 0.9 }),
  white: new THREE.MeshStandardMaterial({ color: '#e8ecff', roughness: 0.6 }),
  dark: new THREE.MeshStandardMaterial({ color: '#1b1f3d', roughness: 0.85 }),
  lock: new THREE.MeshStandardMaterial({ color: '#8b90b8', roughness: 0.4, metalness: 0.55 }),
  glowCyan: new THREE.MeshStandardMaterial({ color: '#164e63', emissive: '#22d3ee', emissiveIntensity: 1.6, roughness: 0.4 }),
};

/** Muted accent material per world color; locked worlds share one dim look. */
function accentMaterial(color: string, locked: boolean): THREE.MeshStandardMaterial {
  if (locked) return new THREE.MeshStandardMaterial({ color: '#3a3f66', roughness: 0.85 });
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.35, flatShading: true, roughness: 0.55, metalness: 0.1 });
}

// ---------------------------------------------------------------------------
// Canvas-drawn sprites: island labels (name + progress) and soft cloud puffs
// ---------------------------------------------------------------------------

function makeLabelTexture(title: string, sub: string, color: string, locked: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 200;
  const ctx = c.getContext('2d')!;
  const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';
  const fit = (text: string, maxWidth: number, basePx: number): number => {
    let px = basePx;
    ctx.font = `700 ${px}px ${FONT}`;
    while (px > 30 && ctx.measureText(text).width > maxWidth) {
      px -= 2;
      ctx.font = `700 ${px}px ${FONT}`;
    }
    return px;
  };
  ctx.fillStyle = 'rgba(10,14,38,0.74)';
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(8, 8, 496, 184, 40);
  else ctx.rect(8, 8, 496, 184);
  ctx.fill();
  ctx.strokeStyle = locked ? 'rgba(139,144,184,0.55)' : `${color}aa`;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  fit(title, 440, 54);
  ctx.fillText(title, 256, 92);
  ctx.fillStyle = locked ? '#9aa0c8' : color;
  fit(sub, 440, 42);
  ctx.fillText(sub, 256, 156);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCloudTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 64, 8, 128, 64, 62);
  g.addColorStop(0, 'rgba(190,205,255,0.55)');
  g.addColorStop(0.6, 'rgba(150,170,240,0.22)');
  g.addColorStop(1, 'rgba(150,170,240,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ---------------------------------------------------------------------------
// Environment: stars, clouds, fireflies
// ---------------------------------------------------------------------------

function Starfield({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 26 + Math.random() * 34;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = Math.abs(r * Math.cos(p)) * 0.7 - 4;
      pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [count]);
  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.008;
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.12} color="#bcd0ff" transparent opacity={0.85} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function Clouds({ lowPerf }: { lowPerf: boolean }) {
  const tex = useMemo(() => makeCloudTexture(), []);
  const group = useRef<THREE.Group>(null);
  const puffs = useMemo(
    () =>
      Array.from({ length: lowPerf ? 5 : 9 }, () => ({
        p: [Math.random() * 24 - 12, 1.5 + Math.random() * 5.5, Math.random() * 24 - 12] as [number, number, number],
        s: 2.2 + Math.random() * 3.4,
        v: 0.05 + Math.random() * 0.08,
        o: 0.35 + Math.random() * 0.3,
      })),
    [lowPerf],
  );
  useFrame((_, d) => {
    if (!group.current) return;
    for (const child of group.current.children) {
      child.position.x += (child.userData.v as number) * d;
      if (child.position.x > 14) child.position.x = -14; // wrap: drifts forever
    }
  });
  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite key={i} position={p.p} scale={[p.s, p.s * 0.5, 1]} userData={{ v: p.v }}>
          <spriteMaterial map={tex} transparent opacity={p.o} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

function Fireflies({ lowPerf }: { lowPerf: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const n = lowPerf ? 60 : 130;
  const geo = useMemo(() => {
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 2.2 + Math.random() * 4.6;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * 3.4 - 0.4;
      pos[i * 3 + 2] = Math.sin(a) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, [n]);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.05;
    ref.current.position.y = Math.sin(t * 0.5) * 0.25;
  });
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial size={0.075} color="#67e8f9" transparent opacity={0.75} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// Central hub — the Universe Gate (decorative)
// ---------------------------------------------------------------------------

function Hub() {
  const crystal = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (crystal.current) {
      crystal.current.rotation.y = t * 0.6;
      crystal.current.position.y = 1.15 + Math.sin(t * 1.4) * 0.12;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.4;
      const s = 1 + Math.sin(t * 1.8) * 0.05;
      ring.current.scale.set(s, s, 1);
    }
  });
  return (
    <group>
      <mesh geometry={rockGeo} material={M.rock} position={[0, -1.05, 0]} />
      <mesh geometry={G.top} material={M.top} position={[0, 0.1, 0]} castShadow receiveShadow />
      <mesh ref={crystal} geometry={G.crystal} position={[0, 1.15, 0]}>
        <meshStandardMaterial color="#0e7490" emissive="#22d3ee" emissiveIntensity={2.2} roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh ref={ring} geometry={G.ring} position={[0, 1.15, 0]} rotation={[Math.PI / 2.2, 0, 0]}>
        <meshStandardMaterial color="#155e75" emissive="#22d3ee" emissiveIntensity={1.2} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Flowing dots along the hub→island paths (the "animated connecting paths")
// ---------------------------------------------------------------------------

const CURVES: Record<WorldId, THREE.CatmullRomCurve3> = {} as Record<WorldId, THREE.CatmullRomCurve3>;
for (const w of WORLDS) {
  CURVES[w.id] = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.5, 0),
    new THREE.Vector3(w.pos[0] * 0.45, Math.max(w.pos[1], 0.2) + 1.6, w.pos[2] * 0.45),
    new THREE.Vector3(w.pos[0], w.pos[1] + 0.55, w.pos[2]),
  ]);
}

function PathDots({ id, color, locked }: { id: WorldId; color: string; locked: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const curve = CURVES[id];
  const count = locked ? 6 : 12;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const offsets = useMemo(() => Array.from({ length: count }, (_, i) => i / count), [count]);
  const lineObj = useMemo(() => {
    const pts = curve.getPoints(40);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({ color: locked ? '#454a78' : color, transparent: true, opacity: locked ? 0.2 : 0.4, depthWrite: false });
    return new THREE.Line(geo, mat);
  }, [curve, color, locked]);
  useEffect(() => () => lineObj.geometry.dispose(), [lineObj]);
  useFrame((state) => {
    const mesh = ref.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const u = (offsets[i] + t * (locked ? 0.03 : 0.06)) % 1;
      const p = curve.getPointAt(u);
      dummy.position.copy(p);
      dummy.scale.setScalar(locked ? 0.055 : 0.11 - Math.abs(0.5 - u) * 0.035);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });
  return (
    <group>
      <primitive object={lineObj} />
      <instancedMesh ref={ref} args={[G.sphere, undefined, count]} frustumCulled={false}>
        <meshBasicMaterial color={locked ? '#565b8f' : '#7dedfb'} transparent opacity={locked ? 0.4 : 0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Theme props per island (small procedural compositions)
// ---------------------------------------------------------------------------

function ThemeProps({ id, color, locked, lowPerf }: { id: WorldId; color: string; locked: boolean; lowPerf: boolean }) {
  const acc = useMemo(() => accentMaterial(color, locked), [color, locked]);
  const beacon = useRef<THREE.Mesh>(null);
  const planet = useRef<THREE.Group>(null);
  const water = useRef<THREE.Mesh>(null);
  const waterRing = useRef<THREE.Mesh>(null);
  const books = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (beacon.current) beacon.current.scale.setScalar(1 + Math.sin(t * 2.4) * 0.22);
    if (planet.current) planet.current.rotation.y = t * 0.4;
    if (water.current) water.current.position.y = -0.05 + Math.sin(t * 1.2) * 0.03;
    if (waterRing.current) {
      const k = (t * 0.35) % 1;
      const s = 1 + k * 0.5;
      waterRing.current.scale.set(s, s, 1);
      (waterRing.current.material as THREE.MeshBasicMaterial).opacity = 0.5 - k * 0.45;
    }
    if (books.current) books.current.rotation.y = t * 0.3;
  });

  if (locked) {
    // a stone padlock hovering over a dim island
    return (
      <group position={[0, 1.5, 0]}>
        <mesh geometry={G.box} material={M.lock} scale={[0.8, 0.65, 0.55]} castShadow />
        <mesh geometry={G.torus} material={M.lock} position={[0, 0.52, 0]} rotation={[Math.PI / 2, 0, 0]} scale={0.75} />
        <mesh geometry={G.sphere} material={M.dark} position={[0, 0.02, 0.3]} scale={0.5} />
      </group>
    );
  }

  if (id === 'forest') {
    return (
      <group>
        <mesh geometry={G.trunk} material={M.wood} position={[-0.55, 0.55, 0.2]} castShadow />
        <mesh geometry={G.cone} material={acc} position={[-0.55, 1.25, 0.2]} castShadow />
        <mesh geometry={G.coneSmall} material={acc} position={[-0.55, 1.75, 0.2]} />
        <mesh geometry={G.trunk} material={M.wood} position={[0.6, 0.5, -0.35]} castShadow />
        <mesh geometry={G.coneSmall} material={acc} position={[0.6, 1.05, -0.35]} />
        <mesh geometry={G.cone} material={acc} position={[0.15, 1.1, 0.6]} castShadow />
        <mesh geometry={G.sphere} material={M.glowCyan} position={[0.55, 0.85, 0.5]} />
        <mesh geometry={G.sphere} material={M.glowCyan} position={[-0.2, 0.72, -0.5]} />
      </group>
    );
  }

  if (id === 'kingdom') {
    return (
      <group>
        <mesh geometry={G.box} material={M.white} position={[0, 0.55, 0]} scale={[0.9, 0.8, 0.9]} castShadow receiveShadow />
        <mesh geometry={G.tower} material={M.white} position={[-0.62, 0.75, -0.45]} castShadow />
        <mesh geometry={G.roof} material={acc} position={[-0.62, 1.55, -0.45]} castShadow />
        <mesh geometry={G.tower} material={M.white} position={[0.62, 0.75, -0.45]} castShadow />
        <mesh geometry={G.roof} material={acc} position={[0.62, 1.55, -0.45]} castShadow />
        <mesh geometry={G.tower} material={M.white} position={[0, 0.95, 0.55]} castShadow />
        <mesh geometry={G.roof} material={acc} position={[0, 1.8, 0.55]} castShadow />
        <mesh geometry={G.box} material={M.glowCyan} position={[0, 0.5, 0.47]} scale={[0.16, 0.16, 0.05]} />
        <mesh geometry={G.box} material={M.glowCyan} position={[-0.28, 0.35, 0.47]} scale={[0.14, 0.14, 0.05]} />
      </group>
    );
  }

  if (id === 'ocean') {
    return (
      <group>
        <mesh ref={water} geometry={G.disc} position={[0, -0.05, 0]}>
          <meshStandardMaterial color="#1d5f8f" transparent opacity={0.85} roughness={0.25} metalness={0.35} />
        </mesh>
        <mesh ref={waterRing} geometry={G.ring} position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#67e8f9" transparent opacity={0.4} depthWrite={false} />
        </mesh>
        <mesh geometry={G.trunk} material={M.wood} position={[0.4, 0.6, 0.3]} scale={[1, 1.6, 1]} castShadow />
        <mesh geometry={G.coneSmall} material={acc} position={[0.4, 1.25, 0.3]} scale={[1.5, 1, 1.5]} />
        <mesh geometry={G.box} material={M.wood} position={[-0.45, 0.28, -0.3]} scale={[0.5, 0.16, 0.26]} />
        <mesh geometry={G.box} material={M.white} position={[-0.45, 0.5, -0.3]} scale={[0.04, 0.4, 0.22]} />
      </group>
    );
  }

  if (id === 'mountain') {
    return (
      <group>
        <mesh geometry={G.peak} material={acc} position={[0, 0.9, 0]} castShadow />
        <mesh geometry={G.snow} material={M.white} position={[0, 1.75, 0]} castShadow />
        <mesh geometry={G.trunk} material={M.dark} position={[0.55, 0.7, 0.4]} scale={[0.5, 1.4, 0.5]} />
        <mesh ref={beacon} geometry={G.sphere} material={M.glowCyan} position={[0.55, 1.25, 0.4]} />
        <mesh geometry={G.coneSmall} material={acc} position={[-0.7, 0.5, -0.35]} scale={0.7} />
      </group>
    );
  }

  // galaxy: a ringed planet + floating glowing books + star dust
  return (
    <group>
      <group ref={planet} position={[0.35, 1.35, -0.2]}>
        <mesh geometry={G.bigSphere} material={acc} castShadow />
        <mesh geometry={G.ring} rotation={[Math.PI / 2.4, 0, 0]} scale={0.55}>
          <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.7} roughness={0.4} />
        </mesh>
      </group>
      <group ref={books}>
        <mesh geometry={G.box} material={M.white} position={[-0.5, 0.95, 0.35]} rotation={[0.3, 0.4, 0.2]} scale={[0.5, 0.1, 0.65]} castShadow />
        <mesh geometry={G.box} material={acc} position={[-0.35, 1.25, 0.15]} rotation={[-0.2, 0.9, -0.1]} scale={[0.45, 0.09, 0.6]} castShadow />
        <mesh geometry={G.sphere} material={M.glowCyan} position={[-0.75, 0.65, -0.4]} scale={0.5} />
      </group>
      {!lowPerf && <StarBits />}
    </group>
  );
}

function StarBits() {
  const geo = useMemo(() => {
    const pos = new Float32Array(24 * 3);
    for (let i = 0; i < 24; i++) {
      pos[i * 3] = Math.random() * 2.4 - 1.2;
      pos[i * 3 + 1] = Math.random() * 1.8 + 0.3;
      pos[i * 3 + 2] = Math.random() * 2.4 - 1.2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  return (
    <points geometry={geo}>
      <pointsMaterial size={0.06} color="#fde68a" transparent opacity={0.8} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

// ---------------------------------------------------------------------------
// The island: rock + ground + theme + label + selection ring + interactions
// ---------------------------------------------------------------------------

interface IslandProps {
  status: WorldStatus;
  selected: boolean;
  recommended: boolean;
  lowPerf: boolean;
  onSelect: (id: WorldId) => void;
}

function Island({ status, selected, recommended, lowPerf, onSelect }: IslandProps) {
  const { world, unlocked } = status;
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = world.pos[1];

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime + world.pos[0]; // per-island phase
    g.position.y = baseY + Math.sin(t * 0.7) * 0.18 + (hovered ? 0.12 : 0);
    if (ring.current) {
      ring.current.rotation.z = t * 0.8;
      const s = selected ? 1 + Math.sin(t * 3) * 0.05 : 1;
      ring.current.scale.setScalar(s);
    }
  });

  const label = useMemo(() => {
    const sub = unlocked ? `${status.progress}%${recommended ? '  •  tavsiya' : ''}` : `🔒 ${world.unlockLevel}-daraja`;
    return makeLabelTexture(`${world.emoji} ${world.name}`, sub, world.color, !unlocked);
  }, [unlocked, status.progress, recommended, world]);
  useEffect(() => () => label.dispose(), [label]);

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(world.id);
  };

  return (
    <group
      ref={group}
      position={[world.pos[0], baseY, world.pos[2]]}
      onClick={click}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = '';
      }}
    >
      <mesh geometry={rockGeo} material={unlocked ? M.rock : M.rockDim} position={[0, -1.05, 0]} />
      <mesh geometry={G.top} material={unlocked ? M.top : M.topDim} position={[0, 0.1, 0]} castShadow receiveShadow />
      <ThemeProps id={world.id} color={world.color} locked={!unlocked} lowPerf={lowPerf} />

      {selected && (
        <mesh ref={ring} geometry={G.ring} position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      )}

      <sprite position={[0, 2.85, 0]} scale={[2.7, 1.05, 1]}>
        <spriteMaterial map={label} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera rig: cinematic intro + smooth focus on the selected island + orbit
// ---------------------------------------------------------------------------

const INTRO_FROM = new THREE.Vector3(0.5, 13.5, 19.5);
const INTRO_TO = new THREE.Vector3(0, 6.8, 12.8);

function Rig({ selected, lowPerf }: { selected: WorldId | null; lowPerf: boolean }) {
  const { camera, gl } = useThree();
  const controls = useMemo(() => {
    const c = new OrbitControls(camera as THREE.PerspectiveCamera, gl.domElement);
    c.enableDamping = true;
    c.dampingFactor = 0.08;
    c.enablePan = false;
    c.minDistance = 6.5;
    c.maxDistance = 19;
    c.maxPolarAngle = 1.42;
    c.target.set(0, 0.6, 0);
    return c;
  }, [camera, gl]);
  const introT = useRef(0);
  const focus = useRef<{ to: THREE.Vector3; target: THREE.Vector3; until: number } | null>(null);

  useEffect(() => {
    const cancel = () => (focus.current = null);
    controls.addEventListener('start', cancel);
    return () => {
      controls.removeEventListener('start', cancel);
      controls.dispose();
    };
  }, [controls]);

  useEffect(() => {
    if (!selected) return;
    const w = WORLDS.find((x) => x.id === selected);
    if (!w) return;
    const target = new THREE.Vector3(w.pos[0], w.pos[1] + 0.7, w.pos[2]);
    const dir = new THREE.Vector3(w.pos[0], 0, w.pos[2]).normalize();
    const to = target.clone().add(dir.multiplyScalar(4.4)).add(new THREE.Vector3(0, 2.6, 0));
    focus.current = { to, target, until: performance.now() + 1400 };
  }, [selected]);

  useFrame((_, d) => {
    if (introT.current < 1) {
      introT.current = Math.min(1, introT.current + d / 1.6);
      const e = 1 - Math.pow(1 - introT.current, 3); // ease-out cubic
      camera.position.lerpVectors(INTRO_FROM, INTRO_TO, e);
    }
    const f = focus.current;
    if (f && performance.now() < f.until) {
      camera.position.lerp(f.to, 0.055);
      controls.target.lerp(f.target, 0.075);
    }
    controls.update();
  });

  return (
    <>
      <primitive object={controls} />
      <directionalLight
        position={[3, 8, 5]}
        intensity={2.2}
        color="#eef2ff"
        castShadow={!lowPerf}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <ambientLight intensity={0.68} color="#8b93d6" />
      <pointLight position={[-8, 3.5, 3]} intensity={lowPerf ? 60 : 90} distance={16} color="#7c3aed" />
      <pointLight position={[8, 2.5, -4]} intensity={lowPerf ? 50 : 70} distance={15} color="#0ea5e9" />
    </>
  );
}

// ---------------------------------------------------------------------------
// Root scene
// ---------------------------------------------------------------------------

export interface UniverseSceneProps {
  statuses: WorldStatus[];
  selected: WorldId | null;
  recommended: WorldId | null;
  lowPerf: boolean;
  onSelect: (id: WorldId) => void;
}

export default function UniverseScene({ statuses, selected, recommended, lowPerf, onSelect }: UniverseSceneProps) {
  return (
    <Canvas
      dpr={lowPerf ? [1, 1.5] : [1, 2]}
      shadows={!lowPerf}
      gl={{ antialias: !lowPerf, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.1, far: 120, position: [0.5, 13.5, 19.5] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
      style={{ touchAction: 'none' }}
    >
      <fogExp2 attach="fog" args={['#0a0f2e', 0.022]} />
      <Rig selected={selected} lowPerf={lowPerf} />
      <Starfield count={lowPerf ? 350 : 750} />
      <Clouds lowPerf={lowPerf} />
      <Fireflies lowPerf={lowPerf} />
      <Hub />
      {statuses.map((st) => (
        <PathDots key={st.world.id} id={st.world.id} color={st.world.color} locked={!st.unlocked} />
      ))}
      {statuses.map((st) => (
        <Island key={st.world.id} status={st} selected={selected === st.world.id} recommended={recommended === st.world.id} lowPerf={lowPerf} onSelect={onSelect} />
      ))}
    </Canvas>
  );
}
