// Shared mutable state written by GSAP ScrollTrigger, read by render loops.
export const aiState = {
  core: 0, // 0 dormant -> 1 fully active intelligence core
  domain: { technology: 0, people: 0, infrastructure: 0 },
  pipeline: 0,
  globe: 0,
  summit: 0,
  mouse: { x: 0, y: 0 },
};

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
