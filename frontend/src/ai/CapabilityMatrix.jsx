import { useRef, useState } from "react";
import { motion } from "framer-motion";
import MaskReveal from "./MaskReveal";

const CAPS = [
  { name: "GENERATIVE AI", items: ["Knowledge", "Content", "Assistants"] },
  { name: "MACHINE LEARNING", items: ["Prediction", "Classification", "Pattern Recognition"] },
  { name: "COMPUTER VISION", items: ["Inspection", "Monitoring", "Visual Intelligence"] },
  { name: "NLP", items: ["Documents", "Language", "Knowledge Extraction"] },
  { name: "AUTOMATION", items: ["Workflows", "Operations", "Optimization"] },
  { name: "DATA INTELLIGENCE", items: ["Analytics", "Forecasting", "Decision Support"] },
];

function Panel({ cap, i, hovered, setHovered }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ rx: -py * 5, ry: px * 5 });
  };

  const isHovered = hovered === i;
  const otherHovered = hovered !== null && !isHovered;

  return (
    <motion.div
      ref={ref}
      data-testid={`capability-${cap.name.toLowerCase().replace(/\s+/g, "-")}`}
      data-cursor
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(i)}
      onMouseLeave={() => {
        setHovered(null);
        setTilt({ rx: 0, ry: 0 });
      }}
      animate={{
        opacity: otherHovered ? 0.4 : 1,
        scale: isHovered ? 1.03 : otherHovered ? 0.985 : 1,
        y: otherHovered ? (i % 2 ? 6 : -6) : 0,
      }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transformStyle: "preserve-3d",
      }}
      className="hairline border bg-[#0D0D0D] p-8 backdrop-blur-sm md:p-10"
    >
      <p className="text-[10px] font-medium tracking-[0.35em] text-[#555]">0{i + 1}</p>
      <h3 className="font-display mt-4 text-lg md:text-xl font-medium tracking-[-0.01em] text-[#F5F5F5]">
        {cap.name}
      </h3>
      <ul className="mt-6 space-y-2">
        {cap.items.map((item) => (
          <li
            key={item}
            className="flex items-center gap-3 text-xs md:text-sm font-light tracking-[0.1em] text-[#8A8A8A]"
          >
            <span className="h-px w-4 bg-[rgba(245,245,245,0.25)]" />
            {item}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

export default function CapabilityMatrix() {
  const [hovered, setHovered] = useState(null);

  return (
    <section
      id="ai-capabilities"
      data-testid="capability-matrix"
      className="relative px-6 py-32 md:px-16 md:py-48 lg:px-24"
    >
      <div className="mb-16 max-w-2xl">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.35em] text-[#8A8A8A]">
          AI Capability Matrix
        </p>
        <MaskReveal
          as="h2"
          testId="capability-headline"
          className="font-display text-3xl md:text-5xl lg:text-6xl font-medium tracking-[-0.03em] text-[#F5F5F5]"
          lines={["Intelligence, applied", "across every discipline."]}
        />
        <p className="mt-6 max-w-md text-sm md:text-base font-light leading-relaxed text-[#8A8A8A]">
          Capabilities Hillary Step can bring to platforms, people, and projects — as an
          intelligence layer, not a bolt-on product.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CAPS.map((cap, i) => (
          <Panel key={cap.name} cap={cap} i={i} hovered={hovered} setHovered={setHovered} />
        ))}
      </div>
    </section>
  );
}
