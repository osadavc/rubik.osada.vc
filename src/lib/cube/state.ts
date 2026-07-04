import { axisRotation, IDENTITY, matEquals, mulMatMat, mulMatVec } from "./math";
import type { CubeState, Cubie, Move, Vec3 } from "./types";

const COORDS = [-1, 0, 1] as const;

export const createSolvedState = (): CubeState => {
  const cubies: Cubie[] = [];
  let id = 0;
  for (const x of COORDS) {
    for (const y of COORDS) {
      for (const z of COORDS) {
        if (x === 0 && y === 0 && z === 0) continue;
        cubies.push({ id: id++, origin: [x, y, z], rotation: IDENTITY });
      }
    }
  }
  return cubies;
};

export const cubiePosition = (cubie: Cubie): Vec3 =>
  mulMatVec(cubie.rotation, cubie.origin);

export const applyMove = (state: CubeState, move: Move): CubeState => {
  const rot = axisRotation(move.axis, move.q);
  return state.map((cubie) => {
    if (move.layer !== null) {
      const pos = cubiePosition(cubie);
      if (pos[move.axis] !== move.layer) return cubie;
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
