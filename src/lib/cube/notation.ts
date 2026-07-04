import type { Move } from "./types";

/**
 * Base moves, one clockwise quarter turn each.
 * Clockwise is defined looking at the face straight on (whole-cube
 * rotations x/y/z follow R, U and F respectively).
 */
const BASE: Record<string, Omit<Move, "q"> & { q: 1 | -1 }> = {
  R: { axis: 0, layer: 1, q: -1 },
  L: { axis: 0, layer: -1, q: 1 },
  U: { axis: 1, layer: 1, q: -1 },
  D: { axis: 1, layer: -1, q: 1 },
  F: { axis: 2, layer: 1, q: -1 },
  B: { axis: 2, layer: -1, q: 1 },
  M: { axis: 0, layer: 0, q: 1 },
  E: { axis: 1, layer: 0, q: 1 },
  S: { axis: 2, layer: 0, q: -1 },
  x: { axis: 0, layer: null, q: -1 },
  y: { axis: 1, layer: null, q: -1 },
  z: { axis: 2, layer: null, q: -1 },
};

const TOKEN_RE = /^([RLUDFBMES]|[xyz])(2|')?$/;

export const parseMove = (token: string): Move => {
  const match = TOKEN_RE.exec(token.trim());
  if (!match) throw new Error(`Invalid move token: "${token}"`);
  const base = BASE[match[1]];
  const q = match[2] === "2" ? 2 : match[2] === "'" ? ((-base.q) as 1 | -1) : base.q;
  return { axis: base.axis, layer: base.layer, q };
};

export const parseAlg = (alg: string): Move[] =>
  alg
    .split(/\s+/)
    .filter(Boolean)
    .map(parseMove);

export const formatMove = (move: Move): string => {
  const entry = Object.entries(BASE).find(
    ([, base]) => base.axis === move.axis && base.layer === move.layer,
  );
  if (!entry) throw new Error("Unknown move");
  const [letter, base] = entry;
  if (move.q === 2) return `${letter}2`;
  return move.q === base.q ? letter : `${letter}'`;
};

export const invertMove = (move: Move): Move => ({
  ...move,
  q: move.q === 2 ? 2 : ((-move.q) as 1 | -1),
});

export const invertMoves = (moves: readonly Move[]): Move[] =>
  [...moves].reverse().map(invertMove);

export const invertAlg = (alg: string): string =>
  invertMoves(parseAlg(alg)).map(formatMove).join(" ");

/** Splits an alg string into display tokens, preserving author formatting. */
export const algTokens = (alg: string): string[] =>
  alg.split(/\s+/).filter(Boolean);
