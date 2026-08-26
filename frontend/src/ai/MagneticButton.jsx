import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function MagneticButton({ label, href, variant = "primary", testId }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 16, mass: 0.4 });
  const y = useSpring(my, { stiffness: 180, damping: 16, mass: 0.4 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left - r.width / 2) * 0.18);
    my.set((e.clientY - r.top - r.height / 2) * 0.28);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const base =
    "group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-xs md:text-sm font-medium uppercase tracking-[0.2em] transition-colors duration-300";
  const skin =
    variant === "primary"
      ? "border border-[rgba(245,245,245,0.35)] text-[#F5F5F5] hover:border-[#F5F5F5]"
      : "border border-[rgba(245,245,245,0.12)] text-[#8A8A8A] hover:text-[#F5F5F5] hover:border-[rgba(245,245,245,0.4)]";

  return (
    <motion.a
      ref={ref}
      href={href}
      data-testid={testId}
      data-cursor
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x, y }}
      className={`${base} ${skin}`}
      whileTap={{ scale: 0.97 }}
    >
      <span
        className="absolute inset-0 origin-bottom scale-y-0 bg-[rgba(245,245,245,0.08)] transition-transform duration-300 ease-out group-hover:scale-y-100"
        aria-hidden="true"
      />
      <span className="relative transition-transform duration-300 group-hover:translate-x-1">
        {label}
      </span>
      <ArrowRight
        className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5"
        strokeWidth={1.5}
      />
    </motion.a>
  );
}
