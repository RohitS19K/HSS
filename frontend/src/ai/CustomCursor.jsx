import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [fine, setFine] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.6 });
  const ringRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    if (!mq.matches) return undefined;

    const move = (e) => {
      x.set(e.clientX - 3);
      y.set(e.clientY - 3);
    };
    const over = (e) => {
      const t = e.target.closest("a, button, [data-cursor]");
      ringRef.current?.classList.toggle("is-active", !!t);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!fine) return null;

  return (
    <>
      <motion.div className="ai-cursor-dot" style={{ x, y }} data-testid="custom-cursor-dot" />
      <motion.div
        ref={ringRef}
        className="ai-cursor-ring"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        data-testid="custom-cursor-ring"
      />
    </>
  );
}
