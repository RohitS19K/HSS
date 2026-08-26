import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import { aiState, clamp01, easeInOut } from "./store";

gsap.registerPlugin(ScrollTrigger);

const WORDS = ["DATA", "UNDERSTAND", "PREDICT", "OPTIMIZE", "DECIDE", "ACT"];

function StreamCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0;
    let h = 0;
    let parts = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      parts = Array.from({ length: 130 }, () => ({
        x: Math.random(),
        y: Math.random(),
        speed: 0.04 + Math.random() * 0.1,
        off: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (tms) => {
      const t = tms / 1000;
      const p = clamp01(aiState.pipeline);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const converge = easeInOut(clamp01(p * 1.15));

      parts.forEach((q) => {
        q.x = (q.x + q.speed * 0.016) % 1;
        const spreadY = h * (0.12 + q.y * 0.76);
        const pathY = cy + Math.sin(q.x * Math.PI * 2 + q.off + t * 0.6) * h * 0.06 * (1 - q.x);
        const y = spreadY + (pathY - spreadY) * converge;
        const x = q.x * w;
        const alpha = 0.12 + converge * 0.5 * q.x;
        ctx.fillStyle = `rgba(245,245,245,${alpha})`;
        ctx.fillRect(x, y, 1.4, 1.4);
      });

      // the stream resolves into the core
      const coreGlow = clamp01((p - 0.72) / 0.28);
      if (coreGlow > 0) {
        const r = 6 + coreGlow * 90;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(255,255,255,${0.55 * coreGlow})`);
        grad.addColorStop(0.35, `rgba(255,255,255,${0.12 * coreGlow})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255,255,255,${0.9 * coreGlow})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 3 + coreGlow * 3, 0, Math.PI * 2);
        ctx.fill();
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

  return <canvas ref={ref} className="h-full w-full" aria-hidden="true" data-testid="pipeline-stream-canvas" />;
}

export default function DataPipeline() {
  const ref = useRef(null);
  const wordRefs = useRef([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          aiState.pipeline = self.progress;
          const pos = self.progress * (WORDS.length - 1);
          wordRefs.current.forEach((el, i) => {
            if (!el) return;
            const d = Math.abs(pos - i);
            const op = clamp01(1.15 - d * 1.6);
            const y = (i - pos) * 170;
            el.style.opacity = String(0.04 + op * 0.96);
            el.style.transform = `translateY(${y}px) scale(${0.92 + op * 0.08})`;
            el.style.filter = `blur(${(1 - op) * 5}px)`;
            el.style.color = op > 0.6 ? "#F5F5F5" : "#3d3d3d";
          });
        },
      });
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="ai-pipeline"
      data-testid="data-pipeline"
      className="relative h-[560vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-0 opacity-70">
          <StreamCanvas />
        </div>
        <p className="absolute left-6 top-24 text-[11px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A] md:left-16 lg:left-24">
          Data → Decision
        </p>
        <div className="relative flex h-full flex-col items-center justify-center">
          {WORDS.map((word, i) => (
            <span
              key={word}
              ref={(el) => (wordRefs.current[i] = el)}
              data-testid={`pipeline-word-${word.toLowerCase()}`}
              className="font-display absolute text-[clamp(2.8rem,9vw,8.5rem)] font-medium tracking-[-0.03em] will-change-transform"
              style={{ opacity: i === 0 ? 1 : 0.06 }}
            >
              {word}
            </span>
          ))}
        </div>
        <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3 md:right-16 md:flex lg:right-24">
          {WORDS.map((w, i) => (
            <span key={w} className="text-[9px] font-medium tracking-[0.3em] text-[#555]">
              0{i + 1}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
