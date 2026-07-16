import type { Axis, CubeSize, Move } from "./types";

/**
 * Face letters with their axis and side. A clockwise quarter turn (looking at
 * the face straight on) is `-sign` quarter turns about the +axis.
 */
const FACES: Record<string, { axis: Axis; sign: 1 | -1 }> = {
  R: { axis: 0, sign: 1 },
  L: { axis: 0, sign: -1 },
  U: { axis: 1, sign: 1 },
  D: { axis: 1, sign: -1 },
  F: { axis: 2, sign: 1 },
  B: { axis: 2, sign: -1 },
};

/** 3x3-only middle slices, each following its lowercase neighbor's direction. */
const MIDDLE: Record<string, { axis: Axis; q: 1 | -1 }> = {
  M: { axis: 0, q: 1 }, // follows L
  E: { axis: 1, q: 1 }, // follows D
  S: { axis: 2, q: -1 }, // follows F
};

const ROTATIONS: Record<string, Axis> = { x: 0, y: 1, z: 2 };

const applySuffix = (base: 1 | -1, suffix: string | undefined): 1 | 2 | -1 =>
  suffix === "2" ? 2 : suffix === "'" ? ((-base) as 1 | -1) : base;

/**
 * Parses one move token for a cube of the given size.
 *
 * Shared: face letters `R L U D F B` with `'` / `2`, rotations `x y z`,
 * middle slices `M E S`.
 * Big-cube notation, as written in the official Rubik's Master guide:
 * lowercase `r l u d f b` turn the inner slice next to that face, and
 * doubled letters turn face and slice together: `Rr`, `Dd`, `Uu2`, `R'r'`.
 */
export const parseMove = (token: string, size: CubeSize = 3): Move => {
  const t = token.trim();
  const half = (size - 1) / 2;

  // Face + slice together: Rr, Rr2, Rr' and the guide's prime form R'r'.
  const wide =
    /^([RLUDFB])([a-z])(2|')?$/.exec(t) ?? /^([RLUDFB])'([a-z])'()$/.exec(t);
  if (wide) {
    const face = FACES[wide[1]];
    if (wide[2] !== wide[1].toLowerCase()) {
      throw new Error(`Invalid move token: "${token}"`);
    }
    const suffix = /'[a-z]'$/.test(t) ? "'" : wide[3] || undefined;
    return {
      axis: face.axis,
      layers: [face.sign * half, face.sign * (half - 1)],
      q: applySuffix((-face.sign) as 1 | -1, suffix),
    };
  }

  const outer = /^([RLUDFB])(2|')?$/.exec(t);
  if (outer) {
    const face = FACES[outer[1]];
    return {
      axis: face.axis,
      layers: [face.sign * half],
      q: applySuffix((-face.sign) as 1 | -1, outer[2]),
    };
  }

  const inner = /^([rludfb])(2|')?$/.exec(t);
  if (inner) {
    const face = FACES[inner[1].toUpperCase()];
    return {
      axis: face.axis,
      layers: [face.sign * (half - 1)],
      q: applySuffix((-face.sign) as 1 | -1, inner[2]),
    };
  }

  const middle = /^([MES])(2|')?$/.exec(t);
  if (middle) {
    const base = MIDDLE[middle[1]];
    return { axis: base.axis, layers: [0], q: applySuffix(base.q, middle[2]) };
  }

  const rotation = /^([xyz])(2|')?$/.exec(t);
  if (rotation) {
    return {
      axis: ROTATIONS[rotation[1]],
      layers: null,
      q: applySuffix(-1, rotation[2]),
    };
  }

  throw new Error(`Invalid move token: "${token}"`);
};

export const parseAlg = (alg: string, size: CubeSize = 3): Move[] =>
  alg
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => parseMove(token, size));

/** Canonical letters checked by formatMove, base (non-prime) forms only. */
const CANONICAL = [
  "R", "L", "U", "D", "F", "B",
  "M", "E", "S",
  "x", "y", "z",
  "r", "l", "u", "d", "f", "b",
  "Rr", "Ll", "Uu", "Dd", "Ff", "Bb",
];

const layersEqual = (a: readonly number[] | null, b: readonly number[] | null): boolean => {
  if (a === null || b === null) return a === b;
  return a.length === b.length && a.every((v) => b.includes(v));
};

export const formatMove = (move: Move, size: CubeSize = 3): string => {
  for (const letter of CANONICAL) {
    const base = parseMove(letter, size);
    if (base.axis !== move.axis || !layersEqual(base.layers, move.layers)) continue;
    if (move.q === 2) return `${letter}2`;
    if (move.q === base.q) return letter;
    // Prime form; the guide writes wide primes with both letters marked.
    return letter.length === 2 ? `${letter[0]}'${letter[1]}'` : `${letter}'`;
  }
  throw new Error("Unknown move");
};

export const invertMove = (move: Move): Move => ({
  ...move,
  q: move.q === 2 ? 2 : ((-move.q) as 1 | -1),
});

export const invertMoves = (moves: readonly Move[]): Move[] =>
  [...moves].reverse().map(invertMove);

/** Inverts one token textually, so it works for any cube size. */
export const invertToken = (token: string): string => {
  if (token.endsWith("2")) return token;
  const widePrime = /^([RLUDFB])'([a-z])'$/.exec(token);
  if (widePrime) return `${widePrime[1]}${widePrime[2]}`;
  const wide = /^([RLUDFB])([a-z])$/.exec(token);
  if (wide) return `${wide[1]}'${wide[2]}'`;
  return token.endsWith("'") ? token.slice(0, -1) : `${token}'`;
};

export const invertAlg = (alg: string): string =>
  alg
    .split(/\s+/)
    .filter(Boolean)
    .map(invertToken)
    .reverse()
    .join(" ");

/** Splits an alg string into display tokens, preserving author formatting. */
export const algTokens = (alg: string): string[] =>
  alg.split(/\s+/).filter(Boolean);
