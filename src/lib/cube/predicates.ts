import {
  FACE_NORMALS,
  faceOfNormal,
  getStickers,
  pieceColors,
  pieceTypeOf,
} from "./facelets";
import { mulMatVec } from "./math";
import { cubiePosition } from "./state";
import type { ColorName, CubeState, Cubie, FaceName, Sticker } from "./types";

/**
 * Solved means every face shows a single color. Facelet-based on purpose:
 * center cubies spin in place during face turns, which no plain cube reveals.
 */
export const isSolved = (state: CubeState): boolean => {
  const seen: Partial<Record<FaceName, ColorName>> = {};
  for (const sticker of getStickers(state)) {
    const expected = seen[sticker.face];
    if (expected === undefined) seen[sticker.face] = sticker.color;
    else if (expected !== sticker.color) return false;
  }
  return true;
};

/** Visual equality: same colors in the same places, ignoring center spin. */
export const statesLookEqual = (a: CubeState, b: CubeState): boolean => {
  const key = (s: Sticker) => `${s.face}:${s.row}:${s.col}`;
  const colorsA = new Map(getStickers(a).map((s) => [key(s), s.color]));
  return getStickers(b).every((s) => colorsA.get(key(s)) === s.color);
};

/** The face whose center currently shows `color`. */
export const faceWithCenter = (state: CubeState, color: ColorName): FaceName => {
  for (const cubie of state) {
    if (pieceTypeOf(cubie) !== "center") continue;
    if (pieceColors(cubie)[0] !== color) continue;
    return faceOfNormal(cubiePosition(cubie));
  }
  throw new Error(`No center with color ${color}`);
};

export const centerColorOf = (state: CubeState, face: FaceName): ColorName => {
  for (const cubie of state) {
    if (pieceTypeOf(cubie) !== "center") continue;
    if (faceOfNormal(cubiePosition(cubie)) === face) return pieceColors(cubie)[0];
  }
  throw new Error(`No center on face ${face}`);
};

/** Finds the unique edge or corner whose sticker colors match `colors` exactly. */
export const findPiece = (state: CubeState, colors: readonly ColorName[]): Cubie => {
  const wanted = [...colors].sort().join(",");
  for (const cubie of state) {
    const own = pieceColors(cubie);
    if (own.length !== colors.length) continue;
    if ([...own].sort().join(",") === wanted) return cubie;
  }
  throw new Error(`No piece with colors ${colors.join(",")}`);
};

/** The face a specific colored sticker of `cubie` currently faces. */
export const stickerFace = (state: CubeState, cubie: Cubie, color: ColorName): FaceName => {
  const colors = pieceColors(cubie);
  const normals = [
    cubie.origin[0] !== 0 ? ([cubie.origin[0], 0, 0] as const) : null,
    cubie.origin[1] !== 0 ? ([0, cubie.origin[1], 0] as const) : null,
    cubie.origin[2] !== 0 ? ([0, 0, cubie.origin[2]] as const) : null,
  ].filter((n) => n !== null);
  for (let i = 0; i < normals.length; i++) {
    if (colors[i] !== color) continue;
    return faceOfNormal(mulMatVec(cubie.rotation, normals[i]));
  }
  throw new Error(`Piece has no ${color} sticker`);
};

/** True when every sticker of the piece sits on the face matching its color's center. */
export const pieceIsPlacedAndOriented = (state: CubeState, cubie: Cubie): boolean => {
  const colors = pieceColors(cubie);
  return colors.every((color) => stickerFace(state, cubie, color) === faceWithCenter(state, color));
};

/** True when the piece sits between the correct centers, ignoring orientation. */
export const pieceIsPositioned = (state: CubeState, cubie: Cubie): boolean => {
  const colors = pieceColors(cubie);
  const targetFaces = new Set(colors.map((c) => faceWithCenter(state, c)));
  const pos = cubiePosition(cubie);
  const touching = (Object.keys(FACE_NORMALS) as FaceName[]).filter((face) => {
    const n = FACE_NORMALS[face];
    return pos[0] * n[0] + pos[1] * n[1] + pos[2] * n[2] === 1;
  });
  return touching.length === colors.length && touching.every((f) => targetFaces.has(f));
};

const EDGE_SLOTS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 0],
  [1, 2],
  [2, 1],
];

const stickersOn = (state: CubeState, face: FaceName): Sticker[] =>
  getStickers(state).filter((s) => s.face === face);

/** Four white edge stickers surrounding the yellow center (white cross does not need to match sides). */
export const hasDaisy = (state: CubeState): boolean => {
  const yellowFace = faceWithCenter(state, "yellow");
  const stickers = stickersOn(state, yellowFace);
  return EDGE_SLOTS.every((slot) =>
    stickers.some(
      (s) => s.row === slot[0] && s.col === slot[1] && s.color === "white",
    ),
  );
};

/** White cross with each cross edge matched to its side center. */
export const hasWhiteCross = (state: CubeState): boolean => {
  const edges = state.filter(
    (c) => pieceTypeOf(c) === "edge" && pieceColors(c).includes("white"),
  );
  return edges.every((edge) => pieceIsPlacedAndOriented(state, edge));
};

/** White cross plus all four white corners. */
export const firstLayerSolved = (state: CubeState): boolean =>
  state
    .filter((c) => pieceTypeOf(c) !== "center" && pieceColors(c).includes("white"))
    .every((c) => pieceIsPlacedAndOriented(state, c));

/** First layer plus the four middle-layer edges. */
export const middleLayerSolved = (state: CubeState): boolean => {
  if (!firstLayerSolved(state)) return false;
  const middleEdges = state.filter((c) => {
    if (pieceTypeOf(c) !== "edge") return false;
    const colors = pieceColors(c);
    return !colors.includes("white") && !colors.includes("yellow");
  });
  return middleEdges.every((c) => pieceIsPlacedAndOriented(state, c));
};

/** Yellow edge stickers form a plus on the yellow-center face. */
export const hasYellowCross = (state: CubeState): boolean => {
  const yellowFace = faceWithCenter(state, "yellow");
  const stickers = stickersOn(state, yellowFace);
  return EDGE_SLOTS.every((slot) =>
    stickers.some(
      (s) => s.row === slot[0] && s.col === slot[1] && s.color === "yellow",
    ),
  );
};

/** Entire yellow face shows yellow (corners oriented). */
export const yellowFaceComplete = (state: CubeState): boolean => {
  const yellowFace = faceWithCenter(state, "yellow");
  return stickersOn(state, yellowFace).every((s) => s.color === "yellow");
};

/** All four yellow corners sit in their correct slots (orientation ignored). */
export const yellowCornersPositioned = (state: CubeState): boolean =>
  state
    .filter((c) => pieceTypeOf(c) === "corner" && pieceColors(c).includes("yellow"))
    .every((c) => pieceIsPositioned(state, c));

/** Count of yellow corner stickers on the yellow-center face. */
export const yellowCornersOrientedCount = (state: CubeState): number => {
  const yellowFace = faceWithCenter(state, "yellow");
  return stickersOn(state, yellowFace).filter(
    (s) => s.pieceType === "corner" && s.color === "yellow",
  ).length;
};
