import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const MESSAGE = "SOMETHING BIG IS COMING.";
const GLYPHS = "#/\\—+·:;*";
const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

function buildScramble(progress, tick) {
  const resolved = Math.floor(progress * MESSAGE.length);
  let out = "";
  for (let i = 0; i < MESSAGE.length; i++) {
    const ch = MESSAGE[i];
    if (ch === " ") {
      out += " ";
      continue;
    }
    if (i < resolved) out += ch;
    else out += GLYPHS[(i * 7 + tick) % GLYPHS.length];
  }
  return out;
}

export default function Teaser() {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const ringRef = useRef(null);
  const holdRef = useRef(false);
  const progRef = useRef(0);
  const [locked, setLocked] = useState(false);
  const [holding, setHolding] = useState(false);
  const reduced = useReducedMotion();

  // progress engine + canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let w = 0;
    let h = 0;
    let tick = 0;
    let parts = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.min(220, Math.floor(w / 5));
      parts = Array.from({ length: n }, () => ({
        r: 60 + Math.random() * Math.min(w, h) * 0.42,
        a: Math.random() * Math.PI * 2,
        speed: (0.0006 + Math.random() * 0.0014) * (Math.random() > 0.5 ? 1 : -1),
        size: 0.6 + Math.random() * 1.2,
        drift: Math.random() * Math.PI * 2,
      }));
    };

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    const loop = () => {
      tick++;
      // charge / decay
      if (holdRef.current && progRef.current < 1) {
        progRef.current = Math.min(1, progRef.current + 0.008);
      } else if (!holdRef.current && progRef.current > 0 && progRef.current < 1) {
        progRef.current = Math.max(0, progRef.current - 0.02);
      }
      const p = progRef.current;

      if (p >= 1 && !locked) setLocked(true);

      // ring + text
      if (ringRef.current) {
        ringRef.current.style.strokeDashoffset = String(RING_C * (1 - p));
      }
      if (textRef.current && (tick % 3 === 0 || p === 0 || p === 1)) {
        textRef.current.textContent =
          p >= 1 ? MESSAGE : p > 0.02 ? buildScramble(p, tick) : "";
      }

      // particles
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const collapse = 1 - 0.72 * p;

      // center glow while charging
      if (p > 0.02) {
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 140 * p + 30);
        grad.addColorStop(0, `rgba(255,255,255,${0.16 * p})`);
        grad.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      parts.forEach((q) => {
        q.a += q.speed * (1 + 9 * p) * 16;
        const r = q.r * collapse;
        let x = cx + Math.cos(q.a) * r;
        let y = cy + Math.sin(q.a) * r * 0.92;
        // idle cursor attraction
        const dx = mouse.x - x;
        const dy = mouse.y - y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14400) {
          const f = (1 - Math.sqrt(d2) / 120) * 10;
          x += (dx / (Math.sqrt(d2) + 1)) * f;
          y += (dy / (Math.sqrt(d2) + 1)) * f;
        }
        const alpha = 0.14 + 0.5 * p + (p >= 1 ? 0.2 : 0);
        ctx.fillStyle = `rgba(245,245,245,${alpha})`;
        ctx.fillRect(x, y, q.size, q.size);
      });

      // transmission ticks radiating at lock
      if (p >= 1 && tick % 50 < 25) {
        ctx.strokeStyle = "rgba(245,245,245,0.1)";
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.arc(cx, cy, 90 + ((tick * 1.2) % 120), 0, Math.PI * 2);
        ctx.stroke();
      }

      raf = requestAnimationFrame(loop);
    };

    resize();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    const sec = sectionRef.current;
    sec.addEventListener("pointermove", onMove);
    sec.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      sec?.removeEventListener("pointermove", onMove);
      sec?.removeEventListener("pointerleave", onLeave);
    };
  }, [locked]);

  const startHold = () => {
    if (locked) return;
    if (reduced) {
      progRef.current = 1;
      setLocked(true);
      return;
    }
    holdRef.current = true;
    setHolding(true);
  };
  const endHold = () => {
    holdRef.current = false;
    setHolding(false);
  };

  return (
    <section
      ref={sectionRef}
      id="ai-teaser"
      data-testid="teaser-section"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-32"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" data-testid="teaser-canvas" />

      <p className="relative z-[2] mb-10 text-[11px] font-medium uppercase tracking-[0.4em] text-[#8A8A8A]" data-testid="teaser-kicker">
        Incoming Transmission
      </p>

      <h2
        className="font-display relative z-[2] min-h-[3.5rem] max-w-5xl text-center text-[clamp(1.8rem,5.4vw,4.8rem)] font-medium leading-[1.08] tracking-[-0.02em] text-[#F5F5F5] md:min-h-[6rem]"
        data-testid="teaser-message"
        aria-live="polite"
      >
        <span ref={textRef}>{locked ? MESSAGE : ""}</span>
        {!locked && progRef.current <= 0.02 && (
          <span className="text-[#3a3a3a]">· · · · · · · · · · · ·</span>
        )}
      </h2>

      <div className="relative z-[2] mt-14 flex flex-col items-center gap-6">
        {!locked ? (
          <>
            <button
              type="button"
              data-testid="teaser-hold-button"
              data-cursor
              aria-label="Press and hold to reveal the transmission"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") startHold();
              }}
              onKeyUp={endHold}
              className={`relative flex h-32 w-32 items-center justify-center rounded-full outline-none transition-transform duration-300 focus-visible:ring-1 focus-visible:ring-[#F5F5F5] ${
                holding ? "scale-95" : "scale-100"
              }`}
            >
              <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden="true">
                <circle cx="64" cy="64" r={RING_R} fill="none" stroke="rgba(245,245,245,0.12)" strokeWidth="1" />
                <circle
                  ref={ringRef}
                  cx="64"
                  cy="64"
                  r={RING_R}
                  fill="none"
                  stroke="#F5F5F5"
                  strokeWidth="1.5"
                  strokeDasharray={RING_C}
                  strokeDashoffset={RING_C}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#F5F5F5]">
                {holding ? "Hold" : "Hold"}
              </span>
            </button>
            <p className="text-[10px] font-light uppercase tracking-[0.3em] text-[#555]" data-testid="teaser-instruction">
              Press and hold to lock the signal
            </p>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4" data-testid="teaser-locked">
            <p className="text-sm md:text-base font-light leading-relaxed text-[#8A8A8A]">
              The next chapter of the intelligence layer is in development.
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.4em] text-[#F5F5F5]">
              Stay close.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
