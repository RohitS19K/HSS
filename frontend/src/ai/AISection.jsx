import { Suspense, lazy, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useReducedMotion } from "framer-motion";
import { aiState } from "./store";
import CustomCursor from "./CustomCursor";
import Hero from "./Hero";
import Statement from "./Statement";
import CoreArchitecture from "./CoreArchitecture";
import DomainSection, { DOMAINS } from "./DomainSection";
import DataPipeline from "./DataPipeline";
import IntelligenceLoop from "./IntelligenceLoop";
import HumanMachine from "./HumanMachine";
import Marquee from "./Marquee";
import CapabilityMatrix from "./CapabilityMatrix";
import GlobalNetwork from "./GlobalNetwork";
import Summit from "./Summit";
import Teaser from "./Teaser";
import FinalCTA from "./FinalCTA";

const CoreCanvas = lazy(() => import("./CoreCanvas"));

gsap.registerPlugin(ScrollTrigger);

export default function AISection() {
  const rootRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const [coreOn, setCoreOn] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    let lenis;
    let rafFn;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      rafFn = (time) => lenis.raf(time * 1000);
      gsap.ticker.add(rafFn);
      gsap.ticker.lagSmoothing(0);
      window.__lenis = lenis;
    }

    const onMove = (e) => {
      aiState.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      aiState.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove);

    const ctx = gsap.context(() => {
      // Core activation: dormant at hero -> fully active end of architecture
      ScrollTrigger.create({
        trigger: "#ai-hero",
        start: "top top",
        endTrigger: "#ai-architecture",
        end: "bottom 70%",
        onUpdate: (self) => {
          aiState.core = self.progress;
        },
      });

      // Fade the fixed 3D core out after the architecture section
      gsap.to(canvasWrapRef.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#ai-architecture",
          start: "top 55%",
          end: "center 45%",
          scrub: true,
        },
      });
      ScrollTrigger.create({
        trigger: "#ai-architecture",
        start: "center 45%",
        onLeave: () => setCoreOn(false),
        onEnterBack: () => setCoreOn(true),
      });
    }, rootRef);

    return () => {
      ctx.revert();
      window.removeEventListener("pointermove", onMove);
      if (lenis) {
        gsap.ticker.remove(rafFn);
        lenis.destroy();
      }
    };
  }, [reduced]);

  return (
    <div
      ref={rootRef}
      className={`ai-root ${reduced ? "reduced" : ""}`}
      data-testid="ai-experience"
    >
      {/* atmosphere */}
      <div className="ai-atmo" aria-hidden="true">
        <div className="ai-atmo-glow" />
        <div className="ai-atmo-grid" />
        <div className="ai-atmo-grain" />
        <div className="ai-atmo-vignette" />
      </div>

      {/* fixed 3D intelligence core */}
      <div ref={canvasWrapRef} className="pointer-events-none fixed inset-0 z-[1]">
        <Suspense fallback={null}>
          <CoreCanvas active={coreOn} />
        </Suspense>
      </div>

      <CustomCursor />

      {/* header */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-16 lg:px-24">
        <a
          href="https://hillary-step.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="header-brand"
          data-cursor
          className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#F5F5F5]"
        >
          Hillary Step
        </a>
        <a
          href="https://hillary-step.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="header-contact-link"
          data-cursor
          className="text-[11px] font-medium uppercase tracking-[0.3em] text-[#8A8A8A] transition-colors duration-300 hover:text-[#F5F5F5]"
        >
          Talk to Hillary Step
        </a>
      </header>

      <main className="relative z-[2]">
        <Hero />
        <Statement />
        <CoreArchitecture />

        {/* from here on, sections sit on solid ground above the faded core */}
        <div className="relative bg-[#050505]">
          {DOMAINS.map((d, i) => (
            <DomainSection key={d.mode} index={i} {...d} />
          ))}
          <DataPipeline />
          <IntelligenceLoop />
          <HumanMachine />
          <Marquee />
          <CapabilityMatrix />
          <GlobalNetwork />
          <Summit />
          <Teaser />
          <FinalCTA />
        </div>
      </main>
    </div>
  );
}
