import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import MaskReveal from "./MaskReveal";

gsap.registerPlugin(ScrollTrigger);

const PILLARS = [
  { id: "cognitive-digital", name: "COGNITIVE DIGITAL", tag: "Platforms" },
  { id: "global-talent", name: "GLOBAL TALENT", tag: "People" },
  { id: "eco-smart-infra", name: "ECO SMART INFRA", tag: "Projects" },
];

const RING_R = [86, 142, 198];

export default function CoreArchitecture() {
  const ref = useRef(null);
  const diagramRef = useRef(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return undefined;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setActive(Math.min(2, Math.floor(self.progress * 3))),
      });
      gsap.fromTo(
        diagramRef.current,
        { scale: 0.92, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            end: "top 15%",
            scrub: true,
          },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const circlePath = (r) =>
    `M 260 260 m -${r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 -${r * 2} 0`;

  return (
    <section
      ref={ref}
      id="ai-architecture"
      data-testid="ai-architecture"
      className="relative h-[320vh]"
    >
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center px-6">
        <div className="mb-8 text-center">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A]">
            The Architecture
          </p>
          <MaskReveal
            as="h2"
            testId="architecture-headline"
            className="font-display text-3xl md:text-5xl font-medium tracking-[-0.03em] text-[#F5F5F5]"
            lines={["One core. Three domains."]}
          />
        </div>

        <div ref={diagramRef} className="relative">
          <svg
            width="520"
            height="520"
            viewBox="0 0 520 520"
            className="h-[320px] w-[320px] md:h-[460px] md:w-[460px]"
            role="img"
            aria-label="AI Core connected to Cognitive Digital, Global Talent and Eco Smart Infra orbital pathways"
          >
            <defs>
              <radialGradient id="coreGlow">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g transform="rotate(-16 260 260) scale(1 0.62) translate(0 160)">
              {RING_R.map((r, i) => (
                <g key={r}>
                  <path
                    id={`orbit-${i}`}
                    d={circlePath(r)}
                    fill="none"
                    stroke="#f5f5f5"
                    strokeOpacity={active === i ? 0.55 : 0.12}
                    strokeWidth={active === i ? 1.2 : 0.7}
                    style={{ transition: "stroke-opacity 0.6s, stroke-width 0.6s" }}
                  />
                  <circle r="2.4" fill="#f5f5f5" opacity={active === i ? 0.95 : 0.3}>
                    <animateMotion
                      dur={`${14 + i * 6}s`}
                      repeatCount="indefinite"
                      path={circlePath(r)}
                    />
                  </circle>
                  {/* pillar node on ring */}
                  <circle
                    cx={260 + r}
                    cy={260}
                    r={active === i ? 6 : 4}
                    fill={active === i ? "#ffffff" : "#3a3a3a"}
                    style={{ transition: "all 0.6s" }}
                  />
                </g>
              ))}
              {/* spokes from core to nodes */}
              {RING_R.map((r, i) => (
                <line
                  key={`spoke-${r}`}
                  x1="260"
                  y1="260"
                  x2={260 + r}
                  y2={260}
                  stroke="#f5f5f5"
                  strokeOpacity={active === i ? 0.35 : 0.07}
                  strokeDasharray="3 6"
                  style={{ transition: "stroke-opacity 0.6s" }}
                />
              ))}
            </g>
            <circle cx="260" cy="260" r="52" fill="url(#coreGlow)" className="core-pulse" />
            <circle cx="260" cy="260" r="13" fill="#ffffff" />
            <text
              x="260"
              y="316"
              textAnchor="middle"
              fill="#8A8A8A"
              fontSize="10"
              letterSpacing="3"
            >
              AI CORE
            </text>
          </svg>
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <div
              key={p.id}
              data-testid={`pillar-${p.id}`}
              className={`border-t pt-4 transition-colors duration-500 ${
                active === i ? "border-[rgba(245,245,245,0.7)]" : "hairline border"
              } border-x-0 border-b-0`}
            >
              <p
                className={`text-[10px] font-medium tracking-[0.3em] transition-colors duration-500 ${
                  active === i ? "text-[#F5F5F5]" : "text-[#8A8A8A]"
                }`}
              >
                0{i + 1} / {p.name}
              </p>
              <p
                className={`mt-1 text-sm font-light transition-colors duration-500 ${
                  active === i ? "text-[#F5F5F5]" : "text-[#8A8A8A]"
                }`}
              >
                {p.tag}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
