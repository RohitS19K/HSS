import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { aiState, clamp01 } from "./store";

const nodeVertex = /* glsl */ `
  attribute float aOrder;
  attribute float aSize;
  uniform float uProgress;
  uniform float uTime;
  varying float vAlpha;
  void main() {
    float act = smoothstep(aOrder, aOrder + 0.1, uProgress);
    vAlpha = act;
    vec3 p = position * (0.985 + 0.015 * sin(uTime * 0.5 + aOrder * 31.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * (0.3 + act) * (24.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;
const nodeFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.05, d);
    gl_FragColor = vec4(vec3(0.96), a * (0.05 + 0.5 * vAlpha));
  }
`;
const lineVertex = /* glsl */ `
  attribute float aOrder;
  uniform float uProgress;
  varying float vAlpha;
  void main() {
    vAlpha = smoothstep(aOrder, aOrder + 0.12, uProgress);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const lineFragment = /* glsl */ `
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vec3(0.92), vAlpha * 0.14);
  }
`;

function fibonacciSphere(n, r) {
  const pts = new Float32Array(n * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    pts[i * 3] = Math.cos(th) * rad * r;
    pts[i * 3 + 1] = y * r;
    pts[i * 3 + 2] = Math.sin(th) * rad * r;
  }
  return pts;
}

export default function IntelligenceCore({ density = 1 }) {
  const group = useRef();
  const nodeMat = useRef();
  const lineMat = useRef();
  const glowMat = useRef();
  const coreMat = useRef();
  const ringRefs = useRef([]);
  const beamMat = useRef();
  const dataRef = useRef();
  const smooth = useRef(0);

  const isMobile = density < 1;
  const N = Math.floor(720 * density);

  const { nodeGeo, lineGeo, connections } = useMemo(() => {
    const positions = fibonacciSphere(N, 1.5);
    const orders = new Float32Array(N);
    const sizes = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      orders[i] = Math.random();
      sizes[i] = 1.0 + Math.random() * 1.6;
    }
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute("aOrder", new THREE.BufferAttribute(orders, 1));
    nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const connections = [];
    const degree = new Array(N).fill(0);
    const threshold = isMobile ? 0.62 : 0.55;
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        if (degree[i] >= 3) break;
        if (degree[j] >= 3) continue;
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < threshold * threshold) {
          connections.push([i, j]);
          degree[i]++;
          degree[j]++;
        }
      }
    }
    const linePos = new Float32Array(connections.length * 6);
    const lineOrd = new Float32Array(connections.length * 2);
    connections.forEach(([a, b], k) => {
      linePos.set(positions.slice(a * 3, a * 3 + 3), k * 6);
      linePos.set(positions.slice(b * 3, b * 3 + 3), k * 6 + 3);
      const o = Math.max(orders[a], orders[b]);
      lineOrd[k * 2] = o;
      lineOrd[k * 2 + 1] = o;
    });
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute("aOrder", new THREE.BufferAttribute(lineOrd, 1));
    return { nodeGeo, lineGeo, connections, positions };
  }, [N, isMobile]);

  const glowTexture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.35, "rgba(255,255,255,0.28)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);

  const rings = useMemo(() => {
    return [1.95, 2.35, 2.8].map((r, i) => {
      const pts = [];
      for (let k = 0; k <= 128; k++) {
        const a = (k / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      return { geo, tilt: [0.35 + i * 0.28, i * 0.7, 0.15 * i], speed: 0.08 + i * 0.05 };
    });
  }, []);

  const dataParticles = useMemo(() => {
    const count = isMobile ? 40 : 90;
    const items = [];
    for (let i = 0; i < count && connections.length; i++) {
      const seg = connections[Math.floor(Math.random() * connections.length)];
      items.push({ seg, t: Math.random(), speed: 0.1 + Math.random() * 0.35 });
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { items, geo };
  }, [connections, isMobile]);

  const beams = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const dirs = [
      new THREE.Vector3(1, 0.25, 0),
      new THREE.Vector3(-0.6, 0.85, 0.3),
      new THREE.Vector3(-0.5, -0.6, -0.6),
    ];
    const arr = new Float32Array(dirs.length * 6);
    dirs.forEach((d, i) => {
      d.normalize();
      arr.set([d.x * 0.4, d.y * 0.4, d.z * 0.4], i * 6);
      arr.set([d.x * 4.6, d.y * 4.6, d.z * 4.6], i * 6 + 3);
    });
    geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return geo;
  }, []);

  useFrame((state, delta) => {
    const target = clamp01(aiState.core);
    smooth.current = THREE.MathUtils.damp(smooth.current, target, 3.2, delta);
    const p = smooth.current;
    const t = state.clock.elapsedTime;

    if (nodeMat.current) nodeMat.current.uniforms.uProgress.value = p;
    if (nodeMat.current) nodeMat.current.uniforms.uTime.value = t;
    if (lineMat.current) lineMat.current.uniforms.uProgress.value = p;

    if (glowMat.current) glowMat.current.opacity = 0.14 + p * 0.16;
    if (coreMat.current) coreMat.current.opacity = 0.55 + p * 0.45;
    if (beamMat.current) beamMat.current.opacity = clamp01((p - 0.82) / 0.18) * 0.4;

    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      ring.rotation.z += delta * rings[i].speed;
      ring.rotation.x += delta * rings[i].speed * 0.4;
      ring.material.opacity = clamp01((p - 0.45 - i * 0.1) / 0.3) * 0.32;
    });

    // data particles travel along connections once network is alive
    if (dataRef.current) {
      const posAttr = dataRef.current.geometry.attributes.position;
      const posArr = nodeGeo.attributes.position.array;
      dataParticles.items.forEach((dp, i) => {
        dp.t = (dp.t + delta * dp.speed * (0.3 + p)) % 1;
        const [a, b] = dp.seg;
        const x = posArr[a * 3] + (posArr[b * 3] - posArr[a * 3]) * dp.t;
        const y = posArr[a * 3 + 1] + (posArr[b * 3 + 1] - posArr[a * 3 + 1]) * dp.t;
        const z = posArr[a * 3 + 2] + (posArr[b * 3 + 2] - posArr[a * 3 + 2]) * dp.t;
        posAttr.setXYZ(i, x, y, z);
      });
      posAttr.needsUpdate = true;
      dataRef.current.material.opacity = clamp01((p - 0.35) / 0.4) * 0.9;
    }

    if (group.current) {
      group.current.rotation.y += delta * 0.06;
      const mx = aiState.mouse.x;
      const my = aiState.mouse.y;
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, my * 0.18, 2.5, delta);
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, mx * 0.08, 2.5, delta);
      const s = 0.9 + p * 0.22;
      group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, s, 3, delta));
    }
  });

  return (
    <group ref={group}>
      {/* inner luminous core */}
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial ref={coreMat} color="#ffffff" transparent opacity={0.6} />
      </mesh>
      <sprite scale={[2.4, 2.4, 1]}>
        <spriteMaterial
          ref={glowMat}
          map={glowTexture}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </sprite>

      {/* neural node shell */}
      <points geometry={nodeGeo} frustumCulled={false}>
        <shaderMaterial
          ref={nodeMat}
          vertexShader={nodeVertex}
          fragmentShader={nodeFragment}
          uniforms={{ uProgress: { value: 0 }, uTime: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={lineGeo} frustumCulled={false}>
        <shaderMaterial
          ref={lineMat}
          vertexShader={lineVertex}
          fragmentShader={lineFragment}
          uniforms={{ uProgress: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* data particles */}
      <points ref={dataRef} geometry={dataParticles.geo} frustumCulled={false}>
        <pointsMaterial
          size={0.045}
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
        />
      </points>

      {/* orbital rings */}
      {rings.map((r, i) => (
        <lineLoop
          key={i}
          geometry={r.geo}
          rotation={r.tilt}
          ref={(el) => (ringRefs.current[i] = el)}
        >
          <lineBasicMaterial color="#f5f5f5" transparent opacity={0} depthWrite={false} />
        </lineLoop>
      ))}

      {/* three domain beams at full activation */}
      <lineSegments geometry={beams} frustumCulled={false}>
        <lineBasicMaterial
          ref={beamMat}
          color="#ffffff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
