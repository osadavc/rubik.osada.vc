import { invertAlg } from "@/lib/cube";

/** Algorithms exactly as printed in the official Rubik's Master guide. */

/** Centers: white tile waiting on the front face, lower right of its block. */
export const CENTER_FRONT = "Rr U R'r'";
/** Centers: white tile waiting on the down face, lower right of its block. */
export const CENTER_DOWN = "Rr2 U Rr2";

/** Edges: the two pieces sit level - "Ddon't Run F'ast Unless R'unning Fast D'd'aily". */
export const EDGE_PAIR = "Dd R F' U R' F D'd'";
/** Edges: one piece high, one low - line them up first. */
export const EDGE_LINE_UP = "R F' U F";

/** Yellow-cross parity fix: left and right turns are inner slices. */
export const OLL_PARITY = "r2 B2 U2 l U2 r' U2 r U2 F2 r F2 l' B2 r2";
/** Final-edges parity fix - "Are you? Are you you? Are you?". */
export const PLL_PARITY = "r2 U2 r2 Uu2 r2 u2";

/* 3x3 algorithms reused once the cube is reduced; outer faces only. */
export const YELLOW_CROSS = "F U R U' R' F'";
export const SUNE = "R U R' U R U2 R'";
export const INSERT_RIGHT = "U R U' R' U' F' U F";
export const CORNER_PLL = "R' F R' B2 R F' R' B2 R2 U'";
export const EDGE_PLL = "F2 U L R' F2 L' R U F2";

const INV_EDGE_PAIR = invertAlg(EDGE_PAIR);

/**
 * Outer-only mixes: outer faces can never split an edge pair or break a
 * center block, so these scramble corners and edges while every group made
 * so far stays visibly intact.
 */
const OUTER_MIX = "R U' F2 D L' B U2 R' D' F";
const OUTER_MIX_SHORT = "R2 U' F D2 L' B";

/** Case setups reused by steps, diagrams and tests. */
export const SETUPS = {
  /* Centers stage: white logo up, exactly as the printed guide holds it. */
  centerFrontCase: invertAlg(CENTER_FRONT),
  centerDownCase: invertAlg(CENTER_DOWN),
  centerAlignCase: `${invertAlg(CENTER_FRONT)} U'`,
  /* Edges stage: white front so the featured pair is white and orange. */
  edgeAcrossCase: `x' ${INV_EDGE_PAIR}`,
  edgeDiagonalCase: `x' ${invertAlg(`${EDGE_LINE_UP} ${EDGE_PAIR}`)}`,
  /* Reduced states for the 3x3 stage. */
  reducedScrambled: OUTER_MIX,
  insertRightCase: `x2 ${invertAlg(INSERT_RIGHT)}`,
  /* Parity stage: yellow up. */
  ollParityCase: `x2 ${invertAlg(OLL_PARITY)}`,
  ollParityOneUp: `x2 ${invertAlg(`${OLL_PARITY} U ${YELLOW_CROSS}`)}`,
  yellowLCase: `x2 ${invertAlg(YELLOW_CROSS)}`,
  pllOppositeCase: `x2 ${invertAlg(PLL_PARITY)}`,
  pllAdjacentCase: `x2 ${invertAlg(`${PLL_PARITY} y ${EDGE_PLL}`)}`,
  /* Chapter outcome pictures. */
  centersDone: `x' ${INV_EDGE_PAIR} ${OUTER_MIX_SHORT}`,
  edgesDone: OUTER_MIX,
  crossDone: `x2 ${invertAlg(SUNE)}`,
  yellowDone: `x2 ${invertAlg(CORNER_PLL)}`,
} as const;

/** Multi-stage demos and practice solutions. */
export const DEMOS = {
  edgeDiagonalSolution: `${EDGE_LINE_UP} ${EDGE_PAIR}`,
  ollParityOneUpSolution: `${OLL_PARITY} U ${YELLOW_CROSS}`,
  pllAdjacentSolution: `${PLL_PARITY} y ${EDGE_PLL}`,
  slicesShowcase: "Rr U R'r' u2 f' Dd l",
} as const;
