import type { ColorName, Sticker } from "@/lib/cube";

export const centersOnly = (s: Sticker): boolean => s.pieceType === "center";

export const edgesOnly = (s: Sticker): boolean => s.pieceType === "edge";

export const cornersOnly = (s: Sticker): boolean => s.pieceType === "corner";

export const topLayer = (s: Sticker): boolean => s.position[1] === 1.5;

/** Centers stage: only the 24 center tiles matter. */
export const centersFocus = centersOnly;

/** White-center steps: the white tiles themselves, wherever they sit. */
export const whiteCenterTiles = (s: Sticker): boolean =>
  s.pieceType === "center" && s.color === "white";

/** Edge-pairing stage: edges plus centers (which must survive every run). */
export const edgesFocus = (s: Sticker): boolean =>
  s.pieceType === "edge" || s.pieceType === "center";

/** Parity stages: yellow corners do not matter yet. */
export const yellowEdgesFocus = (s: Sticker): boolean =>
  !(s.pieceType === "corner" && s.pieceColors.includes("yellow"));

/** Yellow edge pieces, glowing during the cross parity. */
export const yellowEdges = (s: Sticker): boolean =>
  s.pieceType === "edge" && s.pieceColors.includes("yellow");

/* Spotlight predicates. On the 4x4 a color set matches BOTH pieces of a
 * pair, which is exactly what the pairing chapter needs. */

/** Every piece whose sticker colors are exactly `colors`. */
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
