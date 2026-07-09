import type { ColorName, Sticker } from "@/lib/cube";

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

/* Spotlight predicates: pieces the cube makes pulse so the eye can track them. */

/** Exactly the one piece whose sticker colors are `colors`. */
export const piece =
  (...colors: ColorName[]) =>
  (s: Sticker): boolean =>
    s.pieceColors.length === colors.length &&
    colors.every((c) => s.pieceColors.includes(c));

/** Union of several `piece` predicates. */
export const pieces = (...sets: ColorName[][]): ((s: Sticker) => boolean) => {
  const fns = sets.map((set) => piece(...set));
  return (s) => fns.some((fn) => fn(s));
};

export const whiteEdges = (s: Sticker): boolean =>
  s.pieceType === "edge" && s.pieceColors.includes("white");

/** Finished petals: white edges already sitting in the top layer. */
export const whiteEdgesOnTop = (s: Sticker): boolean =>
  whiteEdges(s) && s.position[1] === 1;

export const yellowEdges = (s: Sticker): boolean =>
  s.pieceType === "edge" && s.pieceColors.includes("yellow");

export const yellowCorners = (s: Sticker): boolean =>
  s.pieceType === "corner" && s.pieceColors.includes("yellow");

/** The three yellow edges that cycle in the final stage (the green one stays home). */
export const cyclingYellowEdges = (s: Sticker): boolean =>
  yellowEdges(s) && !s.pieceColors.includes("green");
