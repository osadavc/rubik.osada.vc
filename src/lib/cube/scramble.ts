import { parseMove } from "./notation";
import type { CubeSize, Move } from "./types";

const FACES = ["R", "L", "U", "D", "F", "B"] as const;
/** Inner slices used to break up centers and edge pairs on the big cube. */
const SLICES = ["r", "l", "u", "d", "f", "b"] as const;
const SUFFIXES = ["", "'", "2"] as const;

const layersEqual = (a: readonly number[] | null, b: readonly number[] | null): boolean => {
  if (a === null || b === null) return a === b;
  return a.length === b.length && a.every((v) => b.includes(v));
};

export const randomScramble = (
  length = 22,
  size: CubeSize = 3,
  random: () => number = Math.random,
): Move[] => {
  const moves: Move[] = [];
  let prevAxis = -1;
  let prevPrevAxis = -1;
  while (moves.length < length) {
    // On the 4x4, roughly a third of the turns are inner slices so centers
    // and edge pairs actually break apart.
    const useSlice = size === 4 && random() < 0.34;
    const pool = useSlice ? SLICES : FACES;
    const letter = pool[Math.floor(random() * pool.length)];
    const move = parseMove(
      letter + SUFFIXES[Math.floor(random() * SUFFIXES.length)],
      size,
    );
    // Avoid trivially reducible sequences: same layer twice, or three moves on one axis.
    if (moves.length > 0) {
      const prev = moves[moves.length - 1];
      if (prev.axis === move.axis && layersEqual(prev.layers, move.layers)) continue;
      if (move.axis === prevAxis && move.axis === prevPrevAxis) continue;
    }
    prevPrevAxis = prevAxis;
    prevAxis = move.axis;
    moves.push(move);
  }
  return moves;
};
