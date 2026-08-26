import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

export default function Statement() {
  const ref = useRef(null);
  const line1 = useRef(null);
  const line2 = useRef(null);
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
        line1.current,
        { opacity: 1, filter: "blur(0px)", y: 0 },
        { opacity: 0, filter: "blur(14px)", y: -50, duration: 0.42, ease: "power2.in" },
        0,
      );
      tl.fromTo(
        line2.current,
        { opacity: 0, filter: "blur(14px)", y: 50 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.42, ease: "power2.out" },
        0.52,
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const cls =
    "font-display text-[clamp(2.6rem,8vw,7.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#F5F5F5]";

  return (
    <section
      ref={ref}
      id="ai-statement"
      data-testid="ai-statement"
      className="relative h-[240vh]"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center px-6">
        <h2 ref={line1} className={`stmt ${cls}`} data-testid="statement-line-1">
          <span>
            AI IS NOT
            <br />
            AN ADD-ON.
          </span>
        </h2>
        <h2 ref={line2} className={`stmt ${cls}`} style={{ opacity: 0 }} data-testid="statement-line-2">
          <span>
            IT&rsquo;S THE
            <br />
            INTELLIGENCE LAYER.
          </span>
        </h2>
      </div>
    </section>
  );
}
