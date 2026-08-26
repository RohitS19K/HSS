import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const LAYERS = ["TECHNOLOGY", "PEOPLE", "INFRASTRUCTURE", "INTELLIGENCE"];

export default function Summit() {
  const ref = useRef(null);
  const coreRef = useRef(null);
  const flashRef = useRef(null);
  const textRef = useRef(null);
  const layerRefs = useRef([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });
      tl.fromTo(
        coreRef.current,
        { y: "52vh", opacity: 0.4 },
        { y: "-16vh", opacity: 1, duration: 0.8, ease: "none" },
        0,
      );
      layerRefs.current.forEach((el, i) => {
        tl.fromTo(el, { opacity: 0.1 }, { opacity: 1, duration: 0.08 }, 0.12 + i * 0.16);
        tl.to(el, { opacity: 0.25, duration: 0.08 }, 0.24 + i * 0.16);
      });
      tl.to(flashRef.current, { opacity: 1, duration: 0.05 }, 0.82);
      tl.to(flashRef.current, { opacity: 0, duration: 0.08 }, 0.87);
      tl.fromTo(
        textRef.current.children,
        { opacity: 0, y: 40, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.05, duration: 0.1 },
        0.88,
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section
      ref={ref}
      id="ai-summit"
      data-testid="summit"
      className="relative h-[340vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* abstract geometric terrain */}
        <svg
          className="absolute inset-x-0 bottom-0 h-[46vh] w-full"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline
            points="0,400 0,330 180,260 360,310 540,200 720,250 900,150 1080,220 1260,120 1440,190 1440,400"
            fill="none"
            stroke="rgba(245,245,245,0.1)"
            strokeWidth="1"
          />
          <polyline
            points="0,400 0,360 220,300 420,340 640,260 860,310 1100,230 1300,280 1440,240 1440,400"
            fill="none"
            stroke="rgba(245,245,245,0.07)"
            strokeWidth="1"
          />
          <polyline
            points="0,400 160,380 380,360 600,330 820,355 1060,320 1280,345 1440,330 1440,400"
            fill="none"
            stroke="rgba(245,245,245,0.05)"
            strokeWidth="1"
          />
        </svg>

        {/* ascending core */}
        <div
          ref={coreRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 will-change-transform"
          data-testid="summit-core"
        >
          <div className="core-pulse h-3 w-3 rounded-full bg-white shadow-[0_0_60px_24px_rgba(255,255,255,0.18)]" />
        </div>

        {/* layer labels along the ascent */}
        <div className="absolute left-6 top-1/2 flex -translate-y-1/2 flex-col gap-10 md:left-16 lg:left-24">
          {LAYERS.map((l, i) => (
            <p
              key={l}
              ref={(el) => (layerRefs.current[i] = el)}
              className="text-[10px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A]"
              style={{ opacity: reduced ? 1 : 0.1 }}
            >
              {l}
            </p>
          ))}
        </div>

        {/* white summit flash */}
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-white"
          style={{ opacity: 0 }}
          aria-hidden="true"
        />

        {/* final statement */}
        <div
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        >
          <h2
            className="font-display text-[clamp(2.4rem,7vw,6.5rem)] font-medium leading-[1.04] tracking-[-0.03em] text-[#F5F5F5]"
            data-testid="summit-headline"
            style={{ opacity: reduced ? 1 : undefined }}
          >
            THE NEXT ASCENT
            <br />
            IS INTELLIGENT.
          </h2>
          <p
            className="mt-8 text-[11px] font-medium uppercase tracking-[0.4em] text-[#8A8A8A]"
            data-testid="summit-brand"
          >
            Hillary Step Solutions
          </p>
        </div>
      </div>
    </section>
  );
}
