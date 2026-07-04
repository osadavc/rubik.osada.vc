"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useCubeStore } from "@/store/cube-store";

const CubeCanvas = dynamic(
  () => import("./cube-canvas").then((mod) => mod.CubeCanvas),
  {
    ssr: false,
  },
);

type CubeViewportProps = {
  interactive?: boolean;
  className?: string;
};

/** Client-only cube mount. Also syncs prefers-reduced-motion into the store. */
export const CubeViewport = ({ interactive = true, className }: CubeViewportProps) => {
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => useCubeStore.getState().setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div className={`h-full w-full ${className ?? ""}`}>
      <CubeCanvas interactive={interactive} />
    </div>
  );
};
