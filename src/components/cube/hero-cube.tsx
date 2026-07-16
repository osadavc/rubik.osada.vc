"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { CubeSize } from "@/lib/cube";

const HeroCubeCanvas = dynamic(
  () => import("./hero-cube-canvas").then((mod) => mod.HeroCubeCanvas),
  { ssr: false },
);

/** Client-only mount for the self-solving cube; sits still under reduced motion. */
export const HeroCube = ({
  className,
  size = 3,
}: {
  className?: string;
  size?: CubeSize;
}) => {
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
      <HeroCubeCanvas animate={!reducedMotion} size={size} />
    </div>
  );
};
