import { axisRotation, IDENTITY, matEquals, mulMatMat, mulMatVec } from "./math";
import type { CubeSize, CubeState, Cubie, Move, Vec3 } from "./types";

/**
 * Layer coordinates for a given size: 3x3 uses {-1, 0, 1}, 4x4 uses
 * {-1.5, -0.5, 0.5, 1.5}. Half-integers are exact in floating point, so
 * strict equality on coordinates stays safe.
 */
const coordsFor = (size: CubeSize): number[] => {
  const half = (size - 1) / 2;
  const coords: number[] = [];
  for (let c = -half; c <= half; c++) coords.push(c);
  return coords;
};

export const createSolvedState = (size: CubeSize = 3): CubeState => {
  const half = (size - 1) / 2;
  const coords = coordsFor(size);
  const cubies: Cubie[] = [];
  let id = 0;
  for (const x of coords) {
    for (const y of coords) {
      for (const z of coords) {
        // Skip fully interior positions (no visible sticker).
        if (Math.abs(x) < half && Math.abs(y) < half && Math.abs(z) < half) continue;
        cubies.push({ id: id++, origin: [x, y, z], rotation: IDENTITY });
      }
    }
  }
  return cubies;
};

/** Cube size inferred from the piece count: 26 for 3x3, 56 for 4x4. */
export const sizeOfState = (state: CubeState): CubeSize =>
  state.length === 56 ? 4 : 3;

export const cubiePosition = (cubie: Cubie): Vec3 =>
  mulMatVec(cubie.rotation, cubie.origin);

export const applyMove = (state: CubeState, move: Move): CubeState => {
  const rot = axisRotation(move.axis, move.q);
  return state.map((cubie) => {
    if (move.layers !== null) {
      const pos = cubiePosition(cubie);
      if (!move.layers.includes(pos[move.axis])) return cubie;
    }
    return { ...cubie, rotation: mulMatMat(rot, cubie.rotation) };
  });
};

export const applyMoves = (state: CubeState, moves: readonly Move[]): CubeState =>
  moves.reduce(applyMove, state);

/**
 * Strict state equality. Note this distinguishes center-cubie spin, which is
 * invisible on a plain cube; prefer facelet comparisons for visual equality.
 */
export const statesEqual = (a: CubeState, b: CubeState): boolean =>
  a.every((cubie, i) => matEquals(cubie.rotation, b[i].rotation));
