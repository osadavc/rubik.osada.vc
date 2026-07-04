import { formatMove, parseMove } from "./notation";
import type { Move } from "./types";

const FACES = ["R", "L", "U", "D", "F", "B"] as const;
const SUFFIXES = ["", "'", "2"] as const;

export const randomScramble = (
  length = 22,
  random: () => number = Math.random,
): Move[] => {
  const moves: Move[] = [];
  let prevAxis = -1;
  let prevPrevAxis = -1;
  while (moves.length < length) {
    const face = FACES[Math.floor(random() * FACES.length)];
    const move = parseMove(face + SUFFIXES[Math.floor(random() * SUFFIXES.length)]);
    // Avoid trivially reducible sequences: same face twice, or three moves on one axis.
    if (moves.length > 0) {
      const prev = moves[moves.length - 1];
      if (prev.axis === move.axis && prev.layer === move.layer) continue;
      if (move.axis === prevAxis && move.axis === prevPrevAxis) continue;
    }
    prevPrevAxis = prevAxis;
    prevAxis = move.axis;
    moves.push(move);
  }
  return moves;
};

export const scrambleToString = (moves: readonly Move[]): string =>
  moves.map(formatMove).join(" ");
