import type { Sticker } from "@/lib/cube";

export const centersOnly = (s: Sticker): boolean => s.pieceType === "center";

export const edgesOnly = (s: Sticker): boolean => s.pieceType === "edge";

export const cornersOnly = (s: Sticker): boolean => s.pieceType === "corner";

export const topLayer = (s: Sticker): boolean => s.position[1] === 1;

/** Daisy and white cross: white edges plus every center. */
export const whiteEdgesFocus = (s: Sticker): boolean =>
  s.pieceType === "center" ||
  (s.pieceType === "edge" && s.pieceColors.includes("white"));

/** White corner stage: everything white plus centers. */
export const layerOneFocus = (s: Sticker): boolean =>
  s.pieceType === "center" || s.pieceColors.includes("white");

/** Middle layer stage: the top (yellow) pieces do not matter yet. */
export const noYellowFocus = (s: Sticker): boolean =>
  !s.pieceColors.includes("yellow") || s.pieceType === "center";

/** Yellow cross stage: corners do not matter yet. */
export const yellowEdgesFocus = (s: Sticker): boolean =>
  !(s.pieceType === "corner" && s.pieceColors.includes("yellow"));
