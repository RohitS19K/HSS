import MaskReveal from "./MaskReveal";
import MagneticButton from "./MagneticButton";

export default function FinalCTA() {
  return (
    <section
      id="ai-cta"
      data-testid="final-cta"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-32 text-center"
    >
      <MaskReveal
        as="h2"
        testId="cta-headline"
        className="font-display text-[clamp(2.6rem,8vw,7.5rem)] font-medium leading-[1.02] tracking-[-0.03em] text-[#F5F5F5]"
        lines={["WHAT WILL YOU", "BUILD NEXT?"]}
      />
      <p className="mt-8 max-w-md text-base md:text-lg font-light leading-relaxed text-[#8A8A8A]" data-testid="cta-subcopy">
        Bring intelligence to your next stage of growth.
      </p>

      <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
        <MagneticButton
          label="Talk to Hillary Step"
          href="https://hillary-step.vercel.app/"
          variant="primary"
          testId="cta-talk-button"
        />
        <MagneticButton
          label="Explore Our Capabilities"
          href="https://hillary-step.vercel.app/"
          variant="secondary"
          testId="cta-explore-button"
        />
      </div>

      <p className="mt-20 text-[10px] font-medium uppercase tracking-[0.35em] text-[#555]" data-testid="cta-footer-line">
        Technology · Talent · Infrastructure · Intelligence
      </p>
    </section>
  );
}
