import { useRef } from "react";
import { motion, useInView } from "framer-motion";

// Masked line-by-line reveal. Lines slide up from behind an overflow mask.
// The in-view observer watches the static wrapper, not the animated spans.
export default function MaskReveal({
  lines,
  as: Tag = "h2",
  className = "",
  lineClassName = "",
  delay = 0,
  onLoad = false,
  testId,
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const show = onLoad || inView;

  return (
    <Tag ref={ref} className={className} data-testid={testId}>
      {lines.map((line, i) => (
        <span className="mask-line" key={i}>
          <motion.span
            className={lineClassName}
            initial={{ y: "112%", rotate: 1.5 }}
            animate={show ? { y: "0%", rotate: 0 } : { y: "112%", rotate: 1.5 }}
            transition={{
              duration: 1.1,
              delay: delay + i * 0.09,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
