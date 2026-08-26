import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import IntelligenceCore from "./IntelligenceCore";

export default function CoreCanvas({ active }) {
  const [density, setDensity] = useState(1);

  useEffect(() => {
    const weak =
      window.innerWidth < 768 ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
    setDensity(weak ? 0.5 : 1);
  }, []);

  return (
    <Canvas
      data-testid="intelligence-core-canvas"
      frameloop={active ? "always" : "never"}
      dpr={density < 1 ? [1, 1.5] : [1, 2]}
      camera={{ position: [0, 0, 7], fov: 42 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      style={{ background: "transparent" }}
    >
      <IntelligenceCore density={density} />
    </Canvas>
  );
}
