import { invertAlg } from "@/lib/cube";

/** Algorithms exactly as taught in the official Rubik's solution guide. */
export const DAISY_FLIP = "R' U F'";
export const CORNER_RIGHT = "D' R' D R";
export const CORNER_LEFT = "D L D' L'";
const CORNER_ESCAPE = "R' D' R";
export const CORNER_DOWN_FIX = "F D' F' D2";
export const INSERT_RIGHT = "U R U' R' U' F' U F";
export const INSERT_LEFT = "U' L' U L U F U' F'";
export const YELLOW_CROSS = "F U R U' R' F'";
export const SUNE = "R U R' U R U2 R'";
export const CORNER_PLL = "R' F R' B2 R F' R' B2 R2 U'";
export const EDGE_PLL = "F2 U L R' F2 L' R U F2";
export const EDGE_PLL_PRIME = "F2 U' L R' F2 L' R U' F2";

/** A daisy straight from solved: yellow up, four white petals. */
export const DAISY_SETUP = "x2 F2 R2 B2 L2";

/**
 * The honest daisy: top layer turned a quarter, so no petal's side color
 * matches the center below it. Used for daisy-stage examples to avoid
 * implying that petals must match (they must not until the cross stage).
 */
const DAISY_MIXED = `${DAISY_SETUP} U'`;

const INV_YELLOW_CROSS = invertAlg(YELLOW_CROSS);
const INV_SUNE = invertAlg(SUNE);
const INV_CORNER_PLL = invertAlg(CORNER_PLL);
const INV_EDGE_PLL = invertAlg(EDGE_PLL);
const INV_EDGE_PLL_PRIME = invertAlg(EDGE_PLL_PRIME);
export const INV_INSERT_RIGHT = invertAlg(INSERT_RIGHT);
export const INV_INSERT_LEFT = invertAlg(INSERT_LEFT);

/** Case setups reused by steps, diagrams and tests. */
export const SETUPS = {
  daisy: DAISY_SETUP,
  daisyMixed: DAISY_MIXED,
  daisyTopCase: "x2 F2 B2 U",
  daisyMiddleCase: `${DAISY_MIXED} F`,
  daisyBumpCase: "x2 R2 B2 L2 U'",
  daisyBottomCase: `${DAISY_MIXED} F2`,
  daisyFlipCase: `${DAISY_MIXED} ${invertAlg(DAISY_FLIP)}`,
  daisyPractice: `${DAISY_MIXED} R2 U2`,
  /**
   * Daisy with opposite petals swapped. No single U turn lines every petal
   * up at once - you have to match, send down, and repeat. Trailing U so the
   * starting view has zero petals matched.
   */
  crossMismatch: `${DAISY_SETUP} F2 B2 U2 F2 B2 U`,
  /** Same swap, with the front (and back) petal already matched - ready to send down. */
  crossMatchedPair: `${DAISY_SETUP} F2 B2 U2 F2 B2`,
  crossPractice: `${DAISY_SETUP} F2 B2 U2 F2 B2 U`,
  crossDone: "R' D' R L D L' D2",
  cornerRightCase: invertAlg(CORNER_RIGHT),
  cornerLeftCase: invertAlg(CORNER_LEFT),
  cornerAlignCase: `${invertAlg(CORNER_RIGHT)} D2`,
  cornerTopCase: "R' D' R L D L'",
  cornerDownCase: "R' F' R2 F R",
  // Break two middle slots and spin the top; the white layer stays intact.
  layerOneDone: `x2 ${INV_INSERT_RIGHT} y ${INV_INSERT_RIGHT} U`,
  insertRightCase: `x2 ${INV_INSERT_RIGHT}`,
  insertLeftCase: `x2 ${INV_INSERT_LEFT}`,
  // Pull the front-right edge out, spin to the next face, insert it into the
  // wrong slot: a mismatched, yellow-free edge stuck in the middle layer.
  middleStuckCase: `x2 ${INV_INSERT_RIGHT} y U' ${INSERT_RIGHT}`,
  middlePractice: `x2 ${INV_INSERT_RIGHT} U'`,
  middleDone: `x2 ${INV_YELLOW_CROSS}`,
  yellowL: `x2 ${INV_YELLOW_CROSS}`,
  yellowLine: `x2 ${INV_YELLOW_CROSS} ${INV_YELLOW_CROSS}`,
  yellowDot: `x2 ${INV_YELLOW_CROSS} ${INV_YELLOW_CROSS} U ${INV_YELLOW_CROSS}`,
  suneFish: `x2 ${INV_SUNE}`,
  suneNone: `x2 ${INV_SUNE} ${INV_SUNE}`,
  suneTwo: `x2 ${SUNE} y ${INV_SUNE}`,
  cornersAdjacent: `x2 ${INV_CORNER_PLL}`,
  cornersDiagonal: `x2 ${INV_CORNER_PLL} y2 ${INV_CORNER_PLL}`,
  edgesCycle: `x2 ${INV_EDGE_PLL}`,
  edgesCyclePrime: `x2 ${INV_EDGE_PLL_PRIME}`,
} as const;

/** Demos and practice solutions that involve repetition or re-holds. */
export const DEMOS = {
  daisyPracticeSolution: "U2 R2",
  /** Match, send down, re-grip, repeat - the real one-petal-at-a-time loop. */
  crossAround: "U' F2 y U2 F2 y U2 F2 y U2 F2",
  /** Same solve without re-grips: send the matched pair, then the other pair. */
  crossPracticeSolution: "U' F2 B2 U2 L2 R2",
  cornerEscape: `y' ${CORNER_ESCAPE}`,
  middlePracticeSolution: `U ${INSERT_RIGHT}`,
  yellowLine2x: `${YELLOW_CROSS} ${YELLOW_CROSS}`,
  yellowDotSolution: `${YELLOW_CROSS} y ${YELLOW_CROSS} ${YELLOW_CROSS}`,
  suneTwice: `${SUNE} ${SUNE}`,
  suneTwoSolution: `${SUNE} y ${SUNE} y2 ${SUNE}`,
  cornersDiagonal2x: `${CORNER_PLL} y2 ${CORNER_PLL}`,
} as const;
