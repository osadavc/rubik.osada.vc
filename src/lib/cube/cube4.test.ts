import { describe, expect, test } from "bun:test";
import {
  applyAlg,
  centerBlockColorOf,
  centersSolved,
  createSolvedState,
  edgesPaired,
  formatMove,
  getFaces,
  getStickers,
  hasYellowCross4,
  invertAlg,
  isReduced,
  isSolved,
  parseAlg,
  parseMove,
  sizeOfState,
  stateAfter,
  statesEqual,
  yellowEdgePairsUp,
  yellowFaceComplete4,
  yellowPairsPositionedCount,
  positionedYellowPairSides,
} from "./index";

const after4 = (alg: string) => stateAfter(alg, 4);

describe("4x4 state", () => {
  test("has 56 visible pieces", () => {
    const state = createSolvedState(4);
    expect(state.length).toBe(56);
    expect(sizeOfState(state)).toBe(4);
    expect(isSolved(state)).toBe(true);
  });

  test("counts 24 centers, 24 edges, 8 corners", () => {
    const stickers = getStickers(createSolvedState(4));
    expect(stickers.length).toBe(96);
    const byType = { center: new Set(), edge: new Set(), corner: new Set() };
    for (const s of stickers) byType[s.pieceType].add(s.cubieId);
    expect(byType.center.size).toBe(24);
    expect(byType.edge.size).toBe(24);
    expect(byType.corner.size).toBe(8);
  });

  test("solved faces are uniform 4x4 grids", () => {
    const faces = getFaces(createSolvedState(4));
    expect(faces.U.length).toBe(4);
    expect(faces.U.every((row) => row.every((c) => c === "white"))).toBe(true);
    expect(faces.F.every((row) => row.every((c) => c === "green"))).toBe(true);
  });
});

describe("4x4 notation", () => {
  test("four quarter turns restore the cube", () => {
    for (const token of ["R", "L", "U", "D", "F", "B", "r", "l", "u", "d", "f", "b", "Rr", "Dd", "Uu", "x", "y", "z"]) {
      expect(isSolved(after4(`${token} ${token} ${token} ${token}`))).toBe(true);
    }
  });

  test("wide and slice moves parse to the right layers", () => {
    expect(parseMove("R", 4).layers).toEqual([1.5]);
    expect(parseMove("r", 4).layers).toEqual([0.5]);
    expect(parseMove("Rr", 4).layers).toEqual([1.5, 0.5]);
    expect(parseMove("l'", 4).layers).toEqual([-0.5]);
    expect(parseMove("Dd", 4).layers).toEqual([-1.5, -0.5]);
    expect(parseMove("Uu2", 4).q).toBe(2);
    expect(parseMove("R'r'", 4)).toEqual(parseMove("Rr'", 4));
  });

  test("moves invert cleanly, including guide-style wide primes", () => {
    const alg = "Rr U R'r' Dd r2 u' Uu2 l' B2 x y'";
    const state = applyAlg(after4(alg), invertAlg(alg));
    expect(statesEqual(state, createSolvedState(4))).toBe(true);
  });

  test("invertAlg round-trips guide tokens textually", () => {
    expect(invertAlg("Rr U R'r'")).toBe("Rr U' R'r'");
    expect(invertAlg("Dd R F' U R' F D'd'")).toBe("Dd F' R U' F R' D'd'");
    expect(invertAlg("r2 U2")).toBe("U2 r2");
  });

  test("formatMove round-trips 4x4 tokens", () => {
    for (const token of ["R", "r2", "l'", "Rr", "Dd", "Uu2", "x2"]) {
      expect(formatMove(parseMove(token, 4), 4)).toBe(token);
    }
    expect(formatMove(parseMove("Rr'", 4), 4)).toBe("R'r'");
  });

  test("rejects invalid tokens", () => {
    expect(() => parseMove("Rl", 4)).toThrow();
    expect(() => parseAlg("R Q", 4)).toThrow();
  });
});

describe("official center algorithms", () => {
  test("outer turns never break center blocks", () => {
    const state = after4("R U' F2 L D B' R2 U F D2 L' B2");
    for (const face of ["U", "D", "L", "R", "F", "B"] as const) {
      expect(centerBlockColorOf(state, face)).not.toBeNull();
    }
  });

  test("front insert Rr U R'r' restores centers from its inverse", () => {
    const setup = after4(invertAlg("Rr U R'r'"));
    expect(centersSolved(setup)).toBe(false);
    expect(centersSolved(applyAlg(setup, "Rr U R'r'"))).toBe(true);
  });

  test("bottom insert Rr2 U Rr2 restores centers from its inverse", () => {
    const setup = after4(invertAlg("Rr2 U Rr2"));
    expect(centersSolved(setup)).toBe(false);
    expect(centersSolved(applyAlg(setup, "Rr2 U Rr2"))).toBe(true);
  });

  test("front-case setup shows the missing white tile on the front face", () => {
    const setup = after4(invertAlg("Rr U R'r'"));
    const faces = getFaces(setup);
    const whiteOnU = [faces.U[1][1], faces.U[1][2], faces.U[2][1], faces.U[2][2]]
      .filter((c) => c === "white").length;
    const whiteOnF = [faces.F[1][1], faces.F[1][2], faces.F[2][1], faces.F[2][2]]
      .filter((c) => c === "white").length;
    expect(whiteOnU).toBe(3);
    expect(whiteOnF).toBe(1);
  });

  test("down-case setup shows the missing white tile on the down face", () => {
    const setup = after4(invertAlg("Rr2 U Rr2"));
    const faces = getFaces(setup);
    const whiteOnU = [faces.U[1][1], faces.U[1][2], faces.U[2][1], faces.U[2][2]]
      .filter((c) => c === "white").length;
    const whiteOnD = [faces.D[1][1], faces.D[1][2], faces.D[2][1], faces.D[2][2]]
      .filter((c) => c === "white").length;
    expect(whiteOnU).toBe(3);
    expect(whiteOnD).toBe(1);
  });
});

describe("official edge pairing algorithms", () => {
  const PAIR = "Dd R F' U R' F D'd'";
  const LINE_UP = "R F' U F";

  test("pairing sequence preserves solved center blocks", () => {
    const state = applyAlg(createSolvedState(4), PAIR);
    expect(centersSolved(state)).toBe(true);
  });

  test("line-up sequence preserves solved center blocks", () => {
    const state = applyAlg(createSolvedState(4), LINE_UP);
    expect(centersSolved(state)).toBe(true);
  });

  test("pair case: inverse breaks pairing, algorithm restores it", () => {
    const setup = after4(invertAlg(PAIR));
    expect(edgesPaired(setup)).toBe(false);
    expect(centersSolved(setup)).toBe(true);
    expect(edgesPaired(applyAlg(setup, PAIR))).toBe(true);
  });

  test("line-up case resolves with line-up then pair", () => {
    const setup = after4(invertAlg(`${LINE_UP} ${PAIR}`));
    expect(edgesPaired(setup)).toBe(false);
    expect(centersSolved(setup)).toBe(true);
    expect(edgesPaired(applyAlg(setup, `${LINE_UP} ${PAIR}`))).toBe(true);
  });
});

describe("official parity algorithms", () => {
  const OLL_PARITY = "r2 B2 U2 l U2 r' U2 r U2 F2 r F2 l' B2 r2";
  const PLL_PARITY = "r2 U2 r2 Uu2 r2 u2";
  const EDGE_PLL = "F2 U L R' F2 L' R U F2";

  test("OLL parity keeps the cube reduced and flips one edge pair in place", () => {
    const base = after4("x2");
    const state = applyAlg(base, OLL_PARITY);
    expect(centersSolved(state)).toBe(true);
    // A flipped pair still shows uniform colors, so pairing survives; only
    // the cross count changes - that is what makes parity so sneaky.
    expect(edgesPaired(state)).toBe(true);
    expect(yellowEdgePairsUp(state)).toBe(3);
  });

  test("OLL parity case: three yellow pairs up, algorithm completes the cross", () => {
    const setup = applyAlg(after4("x2"), invertAlg(OLL_PARITY));
    expect(hasYellowCross4(setup)).toBe(false);
    expect(yellowEdgePairsUp(setup)).toBe(3);
    const fixed = applyAlg(setup, OLL_PARITY);
    expect(hasYellowCross4(fixed)).toBe(true);
    expect(isSolved(fixed)).toBe(true);
  });

  test("PLL parity swaps two opposite edge pairs and nothing else", () => {
    const base = after4("x2");
    const state = applyAlg(base, PLL_PARITY);
    expect(isReduced(state)).toBe(true);
    expect(yellowFaceComplete4(state)).toBe(true);
    expect(yellowPairsPositionedCount(state)).toBe(2);
    const sides = positionedYellowPairSides(state);
    // The two still-correct pairs sit opposite each other.
    expect(sides.length).toBe(2);
    expect(isSolved(applyAlg(state, PLL_PARITY))).toBe(true);
  });

  test("adjacent case resolves with parity then the 3x3 edge cycle", () => {
    const solution = `${PLL_PARITY} ${EDGE_PLL}`;
    const setup = applyAlg(after4("x2"), invertAlg(solution));
    expect(yellowFaceComplete4(setup)).toBe(true);
    expect(isSolved(applyAlg(setup, solution))).toBe(true);
  });
});
