import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { aiState, clamp01, easeInOut } from "./store";
import MaskReveal from "./MaskReveal";

gsap.registerPlugin(ScrollTrigger);

export const DOMAINS = [
  {
    mode: "technology",
    kicker: "AI × TECHNOLOGY",
    headline: ["TURNING COMPLEXITY", "INTO INTELLIGENCE."],
    copy: "AI can help transform large amounts of information into patterns, insights, automation, and better digital decisions.",
    stages: ["DATA", "PATTERNS", "INSIGHTS", "AUTOMATION", "DECISIONS"],
    foot: "Cognitive Digital — Platforms",
  },
  {
    mode: "people",
    kicker: "AI × PEOPLE",
    headline: ["INTELLIGENCE", "FOR PEOPLE."],
    copy: "AI augments workforce intelligence — helping organizations understand skills, requirements, patterns, and operational needs. Decision support, never decision replacement.",
    stages: ["SKILLS", "EXPERIENCE", "LOCATION", "DEMAND", "CAPABILITY"],
    results: ["RIGHT PEOPLE", "RIGHT CAPABILITY", "RIGHT OPPORTUNITY"],
    foot: "Global Talent — People",
  },
  {
    mode: "infrastructure",
    kicker: "AI × INFRASTRUCTURE",
    headline: ["ENGINEERING INTELLIGENCE", "INTO THE PHYSICAL WORLD."],
    copy: "From raw geometry to living structures — AI pathways scan across infrastructure, detecting patterns, anomalies, risks, and opportunities before they surface.",
    stages: ["POINTS", "LINES", "GEOMETRY", "STRUCTURE", "INFRASTRUCTURE"],
    foot: "Eco Smart Infra — Projects",
  },
];

/* ---------------- 2D canvas scenes ---------------- */

function buildClusters(w, h) {
  const N = 240;
  const centers = [];
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
    centers.push([w / 2 + Math.cos(a) * w * 0.24, h / 2 + Math.sin(a) * h * 0.26]);
  }
  const pts = [];
  const cols = 16;
  for (let i = 0; i < N; i++) {
    const c = i % 5;
    pts.push({
      sx: Math.random() * w,
      sy: Math.random() * h,
      cx: centers[c][0] + (Math.random() - 0.5) * w * 0.09,
      cy: centers[c][1] + (Math.random() - 0.5) * h * 0.12,
      gx: w * 0.24 + (i % cols) * ((w * 0.52) / cols),
      gy: h * 0.3 + Math.floor(i / cols) * ((h * 0.4) / (N / cols)),
      c,
    });
  }
  return { pts, centers };
}

function buildNetwork(w, h) {
  const N = 90;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const ring = i % 3;
    const a = Math.random() * Math.PI * 2;
    const r = [0.12, 0.24, 0.36][ring];
    pts.push({
      hx: w / 2 + Math.cos(a) * w * r,
      hy: h / 2 + Math.sin(a) * h * r * 0.9,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.8,
      links: [],
    });
  }
  pts.forEach((p, i) => {
    for (let k = 0; k < 2; k++) {
      const j = (i + 1 + Math.floor(Math.random() * 12)) % N;
      if (!p.links.includes(j)) p.links.push(j);
    }
  });
  return pts;
}

function buildWireframe(w, h) {
  const segs = [];
  const base = h * 0.82;
  const push = (x1, y1, x2, y2) => segs.push([x1, y1, x2, y2]);
  // terrain
  push(w * 0.05, base, w * 0.95, base);
  // bridge: arch + deck + cables
  const bx1 = w * 0.1, bx2 = w * 0.55, by = base - h * 0.16;
  push(bx1, by, bx2, by);
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const x = bx1 + (bx2 - bx1) * t;
    const y = by - Math.sin(t * Math.PI) * h * 0.14;
    push(x, by, x, y);
    if (i > 0) {
      const tp = (i - 1) / 16;
      push(bx1 + (bx2 - bx1) * tp, by - Math.sin(tp * Math.PI) * h * 0.14, x, y);
    }
  }
  push(bx1, by, bx1, base);
  push(bx2, by, bx2, base);
  // tower with cross braces
  const tx = w * 0.68, tw = w * 0.1, th = h * 0.52;
  push(tx, base, tx, base - th);
  push(tx + tw, base, tx + tw, base - th);
  push(tx, base - th, tx + tw, base - th);
  for (let i = 0; i < 6; i++) {
    const y1 = base - (i / 6) * th;
    const y2 = base - ((i + 1) / 6) * th;
    push(tx, y1, tx + tw, y2);
    push(tx + tw, y1, tx, y2);
  }
  // city grid blocks
  for (let i = 0; i < 4; i++) {
    const gx = w * (0.82 + i * 0.045);
    const gh = h * (0.1 + ((i * 7) % 3) * 0.07);
    push(gx, base, gx, base - gh);
    push(gx, base - gh, gx + w * 0.03, base - gh);
    push(gx + w * 0.03, base - gh, gx + w * 0.03, base);
  }
  return segs;
}

function DomainCanvas({ mode }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0;
    let h = 0;
    let scene = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (mode === "technology") scene = buildClusters(w, h);
      else if (mode === "people") scene = buildNetwork(w, h);
      else scene = buildWireframe(w, h);
    };

    const draw = (tms) => {
      const t = tms / 1000;
      const p = easeInOut(clamp01(aiState.domain[mode]));
      ctx.clearRect(0, 0, w, h);

      if (mode === "technology") {
        const { pts, centers } = scene;
        const p1 = easeInOut(clamp01(p / 0.55));
        const p2 = easeInOut(clamp01((p - 0.55) / 0.45));
        const pos = pts.map((q) => {
          let x = q.sx + (q.cx - q.sx) * p1;
          let y = q.sy + (q.cy - q.sy) * p1;
          x += (q.gx - x) * p2;
          y += (q.gy - y) * p2;
          return [x, y];
        });
        // cluster links
        if (p1 > 0.4 && p2 < 0.9) {
          ctx.strokeStyle = `rgba(245,245,245,${0.14 * p1 * (1 - p2)})`;
          ctx.lineWidth = 0.5;
          centers.forEach((c, ci) => {
            pts.forEach((q, i) => {
              if (q.c !== ci || i % 3) return;
              ctx.beginPath();
              ctx.moveTo(c[0], c[1]);
              ctx.lineTo(pos[i][0], pos[i][1]);
              ctx.stroke();
            });
          });
        }
        // grid links
        if (p2 > 0.3) {
          ctx.strokeStyle = `rgba(245,245,245,${0.1 * p2})`;
          for (let i = 0; i < pos.length - 1; i++) {
            if ((i + 1) % 16 === 0) continue;
            ctx.beginPath();
            ctx.moveTo(pos[i][0], pos[i][1]);
            ctx.lineTo(pos[i + 1][0], pos[i + 1][1]);
            ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(245,245,245,0.85)";
        pos.forEach(([x, y]) => {
          ctx.fillRect(x, y, 1.4, 1.4);
        });
      } else if (mode === "people") {
        const chaos = 1 - p;
        const pos = scene.map((n) => [
          n.hx + Math.sin(t * n.speed + n.phase) * 46 * chaos,
          n.hy + Math.cos(t * n.speed * 0.8 + n.phase) * 46 * chaos,
        ]);
        ctx.lineWidth = 0.5;
        scene.forEach((n, i) => {
          n.links.forEach((j) => {
            const dx = pos[i][0] - pos[j][0];
            const dy = pos[i][1] - pos[j][1];
            const d = Math.sqrt(dx * dx + dy * dy);
            const max = w * 0.22;
            if (d > max) return;
            ctx.strokeStyle = `rgba(245,245,245,${(1 - d / max) * 0.28 * p})`;
            ctx.beginPath();
            ctx.moveTo(pos[i][0], pos[i][1]);
            ctx.lineTo(pos[j][0], pos[j][1]);
            ctx.stroke();
          });
        });
        pos.forEach(([x, y], i) => {
          const r = 1.2 + p * 1.6 + (i % 9 === 0 ? 1.2 : 0);
          ctx.fillStyle = `rgba(245,245,245,${0.35 + p * 0.6})`;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        });
        if (p > 0.82) {
          ctx.fillStyle = "rgba(138,138,138,0.9)";
          ctx.font = "9px 'SF Pro Text', sans-serif";
          ctx.letterSpacing = "2px";
          const labels = DOMAINS[1].stages;
          for (let i = 0; i < labels.length; i++) {
            const idx = Math.floor((i / labels.length) * pos.length);
            ctx.fillText(labels[i], pos[idx][0] + 8, pos[idx][1] - 6);
          }
        }
      } else {
        const segs = scene;
        const total = segs.length;
        segs.forEach((s, i) => {
          const local = clamp01((p * total - i) / 2.2);
          if (local <= 0) return;
          ctx.strokeStyle = `rgba(245,245,245,${0.55 * local})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(s[0], s[1]);
          ctx.lineTo(s[0] + (s[2] - s[0]) * local, s[1] + (s[3] - s[1]) * local);
          ctx.stroke();
          if (local >= 1) {
            ctx.fillStyle = "rgba(245,245,245,0.7)";
            ctx.fillRect(s[2] - 0.8, s[3] - 0.8, 1.6, 1.6);
          }
        });
        // predictive scan
        if (p > 0.3) {
          const sx = w * (0.05 + ((t * 0.08) % 0.9));
          const grad = ctx.createLinearGradient(sx - 40, 0, sx, 0);
          grad.addColorStop(0, "rgba(245,245,245,0)");
          grad.addColorStop(1, `rgba(245,245,245,${0.16 * p})`);
          ctx.fillStyle = grad;
          ctx.fillRect(sx - 40, h * 0.1, 40, h * 0.75);
          ctx.fillStyle = `rgba(245,245,245,${0.5 * p})`;
          ctx.fillRect(sx, h * 0.1, 1, h * 0.75);
        }
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
  }, [mode]);

  return (
    <canvas
      ref={ref}
      className="h-full w-full"
      data-testid={`domain-canvas-${mode}`}
      aria-hidden="true"
    />
  );
}

/* ---------------- section ---------------- */

export default function DomainSection({ index, mode, kicker, headline, copy, stages, results, foot }) {
  const ref = useRef(null);
  const [stage, setStage] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          aiState.domain[mode] = self.progress;
          setStage(Math.min(stages.length - 1, Math.floor(self.progress * stages.length)));
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [mode, stages.length, reduced]);

  const activeStage = reduced ? stages.length - 1 : stage;

  return (
    <section
      ref={ref}
      id={`ai-domain-${mode}`}
      data-testid={`domain-${mode}`}
      className="relative h-[340vh]"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-6 md:px-16 lg:px-24">
        <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-12">
          <div className="relative z-[2] md:col-span-5">
            <p className="mb-6 flex items-baseline gap-4 text-[11px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A]">
              <span className="text-[#F5F5F5]">0{index + 1}</span> {kicker}
            </p>
            <MaskReveal
              as="h2"
              testId={`domain-${mode}-headline`}
              className="font-display text-[clamp(2.2rem,4.6vw,4.6rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[#F5F5F5]"
              lines={headline}
            />
            <p className="mt-8 max-w-md text-sm md:text-base font-light leading-relaxed text-[#8A8A8A]">
              {copy}
            </p>

            <div className="mt-10 space-y-0" data-testid={`domain-${mode}-stages`}>
              {stages.map((s, i) => (
                <div
                  key={s}
                  className={`flex items-center gap-4 border-t py-2.5 transition-colors duration-500 ${
                    i <= activeStage ? "border-[rgba(245,245,245,0.35)]" : "hairline"
                  }`}
                >
                  <span
                    className={`h-1 w-1 rounded-full transition-colors duration-500 ${
                      i <= activeStage ? "bg-[#F5F5F5]" : "bg-[#3a3a3a]"
                    }`}
                  />
                  <span
                    className={`text-[11px] font-medium uppercase tracking-[0.3em] transition-colors duration-500 ${
                      i <= activeStage ? "text-[#F5F5F5]" : "text-[#555]"
                    }`}
                  >
                    {s}
                  </span>
                </div>
              ))}
            </div>

            {results && (
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {results.map((r, i) => (
                  <span
                    key={r}
                    className={`text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-700 ${
                      activeStage >= stages.length - 1 - (results.length - 1 - i)
                        ? "text-[#F5F5F5]"
                        : "text-[#3a3a3a]"
                    }`}
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}

            <p className="mt-10 text-[10px] font-medium uppercase tracking-[0.3em] text-[#555]">
              {foot}
            </p>
          </div>

          <div className="absolute inset-0 opacity-40 md:static md:col-span-7 md:h-[70vh] md:opacity-100">
            <DomainCanvas mode={mode} />
          </div>
        </div>
      </div>
    </section>
  );
}
