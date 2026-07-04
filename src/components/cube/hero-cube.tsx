"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroCubeCanvas = dynamic(
  () => import("./hero-cube-canvas").then((mod) => mod.HeroCubeCanvas),
  { ssr: false },
);

/** Client-only mount for the self-solving cube; sits still under reduced motion. */
export const HeroCube = ({ className }: { className?: string }) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div className={className}>
      <HeroCubeCanvas animate={!reducedMotion} />
    </div>
  );
};
