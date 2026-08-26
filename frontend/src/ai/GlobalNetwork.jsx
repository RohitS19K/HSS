import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { aiState, clamp01 } from "./store";
import MaskReveal from "./MaskReveal";

gsap.registerPlugin(ScrollTrigger);

const CITIES = [
  { name: "USA", lat: 39, lon: -98 },
  { name: "INDIA", lat: 21, lon: 78 },
  { name: "AUSTRALIA", lat: -25, lon: 134 },
];
const TILT = 0.42;

function toVec(lat, lon) {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
}

function project(v, rot, R, cx, cy) {
  const [x, y, z] = v;
  const xr = x * Math.cos(rot) + z * Math.sin(rot);
  const zr = -x * Math.sin(rot) + z * Math.cos(rot);
  const yt = y * Math.cos(TILT) - zr * Math.sin(TILT);
  const zt = y * Math.sin(TILT) + zr * Math.cos(TILT);
  return { x: cx + R * xr, y: cy - R * yt, front: zt > -0.08, depth: zt };
}

function GlobeCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (tms) => {
      const t = tms / 1000;
      const p = clamp01(aiState.globe);
      ctx.clearRect(0, 0, w, h);
      const R = Math.min(w, h) * 0.33;
      const cx = w / 2;
      const cy = h / 2;
      const rot = t * 0.05 + p * Math.PI * 1.4;

      // latitude lines
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let started = false;
        for (let lon = 0; lon <= 360; lon += 4) {
          const pt = project(toVec(lat, lon), rot, R, cx, cy);
          if (pt.front) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else ctx.lineTo(pt.x, pt.y);
          } else started = false;
        }
        ctx.strokeStyle = "rgba(245,245,245,0.09)";
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      // longitude lines
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -90; lat <= 90; lat += 4) {
          const pt = project(toVec(lat, lon), rot, R, cx, cy);
          if (pt.front) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else ctx.lineTo(pt.x, pt.y);
          } else started = false;
        }
        ctx.stroke();
      }
      // rim
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245,245,245,0.18)";
      ctx.stroke();

      // arcs between cities
      const cityPts = CITIES.map((c) => project(toVec(c.lat, c.lon), rot, R, cx, cy));
      const pairs = [[0, 1], [1, 2], [0, 2]];
      pairs.forEach(([a, b], pi) => {
        const va = toVec(CITIES[a].lat, CITIES[a].lon);
        const vb = toVec(CITIES[b].lat, CITIES[b].lon);
        const steps = 42;
        ctx.beginPath();
        let started = false;
        const arcPts = [];
        for (let i = 0; i <= steps; i++) {
          const tt = i / steps;
          let v = [
            va[0] + (vb[0] - va[0]) * tt,
            va[1] + (vb[1] - va[1]) * tt,
            va[2] + (vb[2] - va[2]) * tt,
          ];
          const len = Math.hypot(...v);
          const lift = 1 + 0.28 * Math.sin(tt * Math.PI);
          v = v.map((n) => (n / len) * lift);
          const pt = project(v, rot, R, cx, cy);
          arcPts.push(pt);
          if (pt.front) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else ctx.lineTo(pt.x, pt.y);
          } else started = false;
        }
        ctx.strokeStyle = `rgba(245,245,245,${0.06 + 0.3 * p})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        // pulse traveling along arc
        const pulseAt = arcPts[Math.floor(((t * 0.25 + pi * 0.33) % 1) * steps)];
        if (pulseAt && pulseAt.front && p > 0.15) {
          ctx.fillStyle = `rgba(255,255,255,${0.9 * p})`;
          ctx.beginPath();
          ctx.arc(pulseAt.x, pulseAt.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // city markers
      if (p > 0.3) {
        ctx.font = "10px 'SF Pro Text', sans-serif";
        ctx.letterSpacing = "3px";
        cityPts.forEach((pt, i) => {
          if (!pt.front) return;
          ctx.fillStyle = `rgba(255,255,255,${0.9 * p})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = `rgba(255,255,255,${0.3 * p})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8 + Math.sin(t * 2 + i) * 2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = `rgba(138,138,138,${p})`;
          ctx.fillText(CITIES[i].name, pt.x + 14, pt.y + 3);
        });
      }

      // AI core hovering above the globe
      const coreA = clamp01((p - 0.55) / 0.35);
      if (coreA > 0) {
        const coreY = cy - R - 46;
        const grad = ctx.createRadialGradient(cx, coreY, 0, cx, coreY, 60);
        grad.addColorStop(0, `rgba(255,255,255,${0.5 * coreA})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, coreY, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.95 * coreA})`;
        ctx.beginPath();
        ctx.arc(cx, coreY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(245,245,245,${0.35 * coreA})`;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.moveTo(cx, coreY + 8);
        ctx.lineTo(cx, cy - R + 6);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" data-testid="global-network-canvas" />;
}

export default function GlobalNetwork() {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          aiState.globe = self.progress;
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="ai-global"
      data-testid="global-network"
      className="relative h-[280vh]"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-16 lg:px-24">
        <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-12">
          <div className="relative z-[2] md:col-span-5">
            <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A]">
              Global AI Network
            </p>
            <MaskReveal
              as="h2"
              testId="global-headline"
              className="font-display text-[clamp(2.2rem,4.6vw,4.6rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[#F5F5F5]"
              lines={["GLOBAL SYSTEMS.", "ONE INTELLIGENCE LAYER."]}
            />
            <p className="mt-8 max-w-md text-sm md:text-base font-light leading-relaxed text-[#8A8A8A]">
              USA · India · Australia. Three regions, one operating standard — connected
              through a single intelligence layer.
            </p>
          </div>
          <div className="absolute inset-0 opacity-40 md:static md:col-span-7 md:h-[76vh] md:opacity-100">
            <GlobeCanvas />
          </div>
        </div>
      </div>
    </section>
  );
}
