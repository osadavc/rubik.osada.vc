import { getFaces, getStickers, pieceColors, pieceTypeOf } from "./facelets";
import { parseAlg } from "./notation";
import { applyMoves, createSolvedState, cubiePosition } from "./state";
import { stickerFace } from "./predicates";
import type { ColorName, CubeState, FaceName, Sticker } from "./types";

/**
 * Predicates for the Rubik's Master (4x4). Everything here works on facelets
 * or piece queries, so states of the wrong size simply fail the checks.
 */

const FACE_LIST: FaceName[] = ["U", "D", "L", "R", "F", "B"];

/** The four center stickers of a face, or null when not uniform. */
export const centerBlockColorOf = (
  state: CubeState,
  face: FaceName,
): ColorName | null => {
  const tiles = getStickers(state).filter(
    (s) => s.face === face && s.pieceType === "center",
  );
  const color = tiles[0]?.color ?? null;
  return tiles.every((s) => s.color === color) ? color : null;
};

/** Face currently showing a complete center block of `color`, if any. */
export const faceWithCenterBlock = (
  state: CubeState,
  color: ColorName,
): FaceName | null =>
  FACE_LIST.find((face) => centerBlockColorOf(state, face) === color) ?? null;

/** Some face shows a complete 2x2 block of `color`. */
export const centerBlockComplete = (state: CubeState, color: ColorName): boolean =>
  faceWithCenterBlock(state, color) !== null;

/** All 24 valid face-color layouts: the standard scheme in every orientation. */
const legalCenterLayouts = (() => {
  let cache: string[] | null = null;
  return (): string[] => {
    if (cache) return cache;
    const ups = ["", "x", "x'", "x2", "z", "z'"];
    const spins = ["", "y", "y'", "y2"];
    cache = ups.flatMap((up) =>
      spins.map((spin) => {
        const state = applyMoves(createSolvedState(3), parseAlg(`${up} ${spin}`));
        const faces = getFaces(state);
        return FACE_LIST.map((f) => faces[f][1][1]).join(",");
      }),
    );
    return cache;
  };
})();

/**
 * All six center blocks are grouped AND arranged in the standard color
 * scheme. A wrong arrangement makes the corners unsolvable later, which is
 * exactly the trap the printed guide warns about.
 */
export const centersSolved = (state: CubeState): boolean => {
  const layout = FACE_LIST.map((f) => centerBlockColorOf(state, f));
  if (layout.some((c) => c === null)) return false;
  return legalCenterLayouts().includes(layout.join(","));
};

/** The four (row, col) pairs on a face that form its edge slots. */
const EDGE_SLOT_PAIRS: ReadonlyArray<readonly [[number, number], [number, number]]> = [
  [[0, 1], [0, 2]],
  [[3, 1], [3, 2]],
  [[1, 0], [2, 0]],
  [[1, 3], [2, 3]],
];

/**
 * Every edge slot shows a single color on each of its faces: all 24 edge
 * pieces sit in matching pairs, like the 12 edges of a 3x3.
 */
export const edgesPaired = (state: CubeState): boolean => {
  const faces = getFaces(state);
  return FACE_LIST.every((face) =>
    EDGE_SLOT_PAIRS.every(
      ([[r1, c1], [r2, c2]]) => faces[face][r1][c1] === faces[face][r2][c2],
    ),
  );
};

/** Centers grouped correctly and all edges paired: a 3x3 in disguise. */
export const isReduced = (state: CubeState): boolean =>
  centersSolved(state) && edgesPaired(state);

/** Count of edge slots on the yellow face showing a matched yellow pair. */
export const yellowEdgePairsUp = (state: CubeState): number => {
  const up = faceWithCenterBlock(state, "yellow");
  if (!up) return 0;
  const grid = getFaces(state)[up];
  return EDGE_SLOT_PAIRS.filter(
    ([[r1, c1], [r2, c2]]) => grid[r1][c1] === "yellow" && grid[r2][c2] === "yellow",
  ).length;
};

/** Yellow cross on the big cube: all four edge pairs show yellow up. */
export const hasYellowCross4 = (state: CubeState): boolean =>
  yellowEdgePairsUp(state) === 4;

/** The entire yellow-center face shows yellow. */
export const yellowFaceComplete4 = (state: CubeState): boolean => {
  const up = faceWithCenterBlock(state, "yellow");
  if (!up) return false;
  return getStickers(state)
    .filter((s) => s.face === up)
    .every((s) => s.color === "yellow");
};

/**
 * Side faces whose yellow edge pair is fully placed: both pieces show yellow
 * up and their side color matches that face's center block.
 */
export const positionedYellowPairSides = (state: CubeState): FaceName[] => {
  const up = faceWithCenterBlock(state, "yellow");
  if (!up) return [];
  const correctPieces = new Map<FaceName, number>();
  for (const cubie of state) {
    if (pieceTypeOf(cubie) !== "edge") continue;
    const colors = pieceColors(cubie);
    if (!colors.includes("yellow")) continue;
    // Only pieces physically in the up layer count.
    if (stickerFace(state, cubie, "yellow") !== up) continue;
    const other = colors.find((c) => c !== "yellow")!;
    const side = stickerFace(state, cubie, other);
    if (centerBlockColorOf(state, side) !== other) continue;
    correctPieces.set(side, (correctPieces.get(side) ?? 0) + 1);
  }
  return FACE_LIST.filter((face) => correctPieces.get(face) === 2);
};

export const yellowPairsPositionedCount = (state: CubeState): number =>
  positionedYellowPairSides(state).length;

/** True for the 3x3-style corner-positioning goal, on paired 4x4 corners. */
export const yellowCornersPositioned4 = (state: CubeState): boolean => {
  const up = faceWithCenterBlock(state, "yellow");
  if (!up) return false;
  return state
    .filter((c) => pieceTypeOf(c) === "corner" && pieceColors(c).includes("yellow"))
    .every((cubie) =>
      pieceColors(cubie).every((color) => {
        const face = stickerFace(state, cubie, color);
        return centerBlockColorOf(state, face) === color;
      }),
    );
};

/** Sticker sits in the up layer (top quarter of the cube). */
export const inTopLayer4 = (s: Sticker): boolean => s.position[1] === 1.5;

/** Piece query: is this edge piece part of a matched pair right now? */
export const edgePieceIsPaired = (state: CubeState, cubieId: number): boolean => {
  const cubie = state.find((c) => c.id === cubieId);
  if (!cubie || pieceTypeOf(cubie) !== "edge") return false;
  const pos = cubiePosition(cubie);
  const colors = [...pieceColors(cubie)].sort().join(",");
  // Its partner sits at the neighboring edge position along the cube edge:
  // same two shell coordinates, mirrored inner coordinate.
  const partnerPos = pos.map((v) => (Math.abs(v) === 0.5 ? -v : v));
  const partner = state.find((c) => {
    const p = cubiePosition(c);
    return (
      c.id !== cubie.id &&
      pieceTypeOf(c) === "edge" &&
      p[0] === partnerPos[0] &&
      p[1] === partnerPos[1] &&
      p[2] === partnerPos[2]
    );
  });
  if (!partner) return false;
  if ([...pieceColors(partner)].sort().join(",") !== colors) return false;
  // Same colors and same orientation: each sticker color faces the same way.
  return pieceColors(cubie).every(
    (color) => stickerFace(state, cubie, color) === stickerFace(state, partner, color),
  );
};
