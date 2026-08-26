import { useState } from "react";
import MaskReveal from "./MaskReveal";

const STAGES = [
  { name: "SENSE", desc: "Collect signals from systems, people, and environments." },
  { name: "UNDERSTAND", desc: "Find meaning inside the noise — patterns, context, relationships." },
  { name: "PREDICT", desc: "Identify possibilities before they become problems or missed opportunities." },
  { name: "OPTIMIZE", desc: "Evaluate outcomes and allocate effort where it compounds." },
  { name: "ACT", desc: "Support execution with intelligence at the point of decision." },
  { name: "LEARN", desc: "Every cycle improves the system. The loop begins again, sharper." },
];

const R = 200;
const C = 280;

function arcPath(i, total) {
  const gap = 4;
  const a0 = (i / total) * 360 - 90 + gap;
  const a1 = ((i + 1) / total) * 360 - 90 - gap;
  const rad = (a) => (a * Math.PI) / 180;
  return `M ${C + R * Math.cos(rad(a0))} ${C + R * Math.sin(rad(a0))} A ${R} ${R} 0 0 1 ${C + R * Math.cos(rad(a1))} ${C + R * Math.sin(rad(a1))}`;
}

function nodePos(i, total) {
  const a = ((i / total) * 360 - 90) * (Math.PI / 180);
  return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) };
}

export default function IntelligenceLoop() {
  const [active, setActive] = useState(null);

  return (
    <section
      id="ai-loop"
      data-testid="intelligence-loop"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-32"
    >
      <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A]">
        The Operating Cycle
      </p>
      <MaskReveal
        as="h2"
        testId="loop-headline"
        className="font-display text-center text-3xl md:text-5xl font-medium tracking-[-0.03em] text-[#F5F5F5]"
        lines={["A system that never stops learning."]}
      />

      <div className="relative mt-16 h-[340px] w-[340px] md:h-[560px] md:w-[560px]">
        <svg viewBox="0 0 560 560" className="h-full w-full" role="img" aria-label="Intelligence loop: sense, understand, predict, optimize, act, learn">
          {/* slowly rotating orbital trace */}
          <g className="loop-ring-spin">
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={C + (R + 26) * Math.cos(a)}
                  cy={C + (R + 26) * Math.sin(a)}
                  r={i % 6 === 0 ? 1.6 : 0.7}
                  fill="#f5f5f5"
                  opacity={0.25}
                />
              );
            })}
          </g>
          {STAGES.map((s, i) => (
            <path
              key={s.name}
              d={arcPath(i, STAGES.length)}
              fill="none"
              stroke="#f5f5f5"
              strokeWidth={active === i ? 1.6 : 0.8}
              strokeOpacity={active === null ? 0.25 : active === i ? 0.9 : 0.08}
              style={{ transition: "stroke-opacity 0.4s, stroke-width 0.4s" }}
            />
          ))}
          {STAGES.map((s, i) => {
            const { x, y } = nodePos(i, STAGES.length);
            const isActive = active === i;
            return (
              <g
                key={s.name}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                data-testid={`loop-stage-${s.name.toLowerCase()}`}
                data-cursor
                style={{ cursor: "pointer" }}
              >
                <circle cx={x} cy={y} r="34" fill="transparent" />
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 9 : 5}
                  fill={isActive ? "#ffffff" : "#0d0d0d"}
                  stroke="#f5f5f5"
                  strokeOpacity={isActive ? 1 : 0.4}
                  style={{ transition: "all 0.4s" }}
                />
                <text
                  x={x}
                  y={y - 22}
                  textAnchor="middle"
                  fill={isActive ? "#F5F5F5" : "#8A8A8A"}
                  fontSize="10"
                  letterSpacing="3"
                  style={{ transition: "fill 0.4s", opacity: active === null || isActive ? 1 : 0.35 }}
                >
                  {s.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* center readout */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
          {active === null ? (
            <p className="text-[11px] font-medium uppercase tracking-[0.35em] text-[#555]">
              The Intelligence Loop
            </p>
          ) : (
            <>
              <p className="font-display text-lg md:text-xl font-medium tracking-tight text-[#F5F5F5]" data-testid="loop-active-title">
                {STAGES[active].name}
              </p>
              <p className="mt-3 max-w-[220px] text-xs md:text-sm font-light leading-relaxed text-[#8A8A8A]" data-testid="loop-active-desc">
                {STAGES[active].desc}
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
