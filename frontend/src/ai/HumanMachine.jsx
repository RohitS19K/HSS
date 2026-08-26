import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const HUMAN = ["Experience", "Judgment", "Creativity", "Leadership"];
const MACHINE = ["Speed", "Scale", "Pattern Recognition", "Automation"];

export default function HumanMachine() {
  const ref = useRef(null);
  const humanRef = useRef(null);
  const machineRef = useRef(null);
  const augRef = useRef(null);
  const outcomesRef = useRef(null);
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
        [humanRef.current, machineRef.current],
        { opacity: 0.25 },
        { opacity: 1, duration: 0.15 },
        0,
      );
      tl.to(humanRef.current, { x: "16vw", duration: 0.4, ease: "power2.inOut" }, 0.1);
      tl.to(machineRef.current, { x: "-16vw", duration: 0.4, ease: "power2.inOut" }, 0.1);
      tl.to(
        [humanRef.current, machineRef.current],
        { opacity: 0, filter: "blur(16px)", scale: 0.9, duration: 0.18, ease: "power2.in" },
        0.52,
      );
      tl.fromTo(
        augRef.current,
        { opacity: 0, filter: "blur(18px)", scale: 0.94 },
        { opacity: 1, filter: "blur(0px)", scale: 1, duration: 0.22, ease: "power2.out" },
        0.62,
      );
      tl.fromTo(
        outcomesRef.current.children,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.12 },
        0.78,
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const sideCls =
    "absolute top-1/2 -translate-y-1/2 will-change-transform";
  const wordCls =
    "font-display text-[clamp(2.4rem,7vw,6.5rem)] font-medium tracking-[-0.03em] text-[#F5F5F5]";

  return (
    <section
      ref={ref}
      id="ai-human-machine"
      data-testid="human-machine"
      className="relative h-[300vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden px-6">
        <div ref={humanRef} className={`${sideCls} left-[6%] text-left`} data-testid="human-side">
          <h2 className={wordCls}>HUMAN</h2>
          <ul className="mt-6 space-y-1.5">
            {HUMAN.map((t) => (
              <li key={t} className="text-xs md:text-sm font-light tracking-[0.15em] text-[#8A8A8A]">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div ref={machineRef} className={`${sideCls} right-[6%] text-right`} data-testid="machine-side">
          <h2 className={wordCls}>MACHINE</h2>
          <ul className="mt-6 space-y-1.5">
            {MACHINE.map((t) => (
              <li key={t} className="text-xs md:text-sm font-light tracking-[0.15em] text-[#8A8A8A]">
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div
          ref={augRef}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center will-change-transform"
          style={{ opacity: reduced ? 1 : 0 }}
          data-testid="augmented-intelligence"
        >
          <p className="mb-6 text-[11px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A]">
            Human + Machine
          </p>
          <h2 className="font-display max-w-5xl text-[clamp(2.2rem,6vw,5.5rem)] font-medium leading-[1.05] tracking-[-0.03em] text-[#F5F5F5]">
            AUGMENTED INTELLIGENCE
          </h2>
          <div ref={outcomesRef} className="mt-10 flex flex-col gap-3 md:flex-row md:gap-10">
            {["Better Decisions.", "Better Systems.", "Better Outcomes."].map((o) => (
              <p key={o} className="text-sm md:text-base font-light text-[#8A8A8A]">
                {o}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
