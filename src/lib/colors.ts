import type { ColorName } from "./cube/types";

/**
 * Sticker palette, tuned slightly desaturated so the cube reads premium
 * rather than toy-bright. Single source for 3D materials and SVG diagrams.
 * Yellow is kept saturated enough that it never reads as gray next to white
 * petals; orange stays a deeper red-orange so the two never collide.
 */
export const STICKER_COLORS: Record<ColorName, string> = {
  white: "#f6f5f0",
  yellow: "#f0c400",
  red: "#cf4534",
  orange: "#e06818",
  green: "#46a25c",
  blue: "#3c6fd1",
};

/** Color used for stickers outside the current step's focus. */
export const DIM_STICKER_COLOR = "#000";

/** Cubie plastic body. */
export const BODY_COLOR = "#232326";
