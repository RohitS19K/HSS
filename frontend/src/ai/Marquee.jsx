const ITEMS = [
  "TECHNOLOGY",
  "TALENT",
  "INFRASTRUCTURE",
  "INTELLIGENCE",
  "ONE SYSTEM",
  "ONE OPERATING STANDARD",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div className="ai-marquee" data-testid="editorial-marquee" aria-hidden="true">
      <div className="ai-marquee-track">
        {row.map((item, i) => (
          <span
            key={i}
            className="font-display flex items-center gap-8 pr-8 text-sm md:text-base font-medium uppercase tracking-[0.35em] text-[rgba(245,245,245,0.28)]"
          >
            {item}
            <span className="inline-block h-1 w-1 rounded-full bg-[rgba(245,245,245,0.3)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
