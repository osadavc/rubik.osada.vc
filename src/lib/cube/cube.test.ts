import { describe, expect, test } from "bun:test";
import {
  applyAlg,
  applyMoves,
  createSolvedState,
  cubiePosition,
  faceWithCenter,
  findPiece,
  firstLayerSolved,
  formatMove,
  getFaces,
  hasDaisy,
  hasWhiteCross,
  hasYellowCross,
  invertAlg,
  isSolved,
  middleLayerSolved,
  parseAlg,
  parseMove,
  pieceIsPositioned,
  pieceTypeOf,
  pieceColors,
  randomScramble,
  stateAfter,
  statesEqual,
  stickerFace,
  yellowCornersOrientedCount,
  yellowCornersPositioned,
  yellowFaceComplete,
} from "./index";

describe("moves", () => {
  test("four quarter turns restore the cube", () => {
    for (const face of ["R", "L", "U", "D", "F", "B", "M", "E", "S", "x", "y", "z"]) {
      expect(isSolved(stateAfter(`${face} ${face} ${face} ${face}`))).toBe(true);
    }
  });

  test("sexy move has order six", () => {
    let state = createSolvedState();
    for (let i = 0; i < 6; i++) {
      state = applyAlg(state, "R U R' U'");
      expect(isSolved(state)).toBe(i === 5);
    }
  });

  test("U sends the front-right top corner to the front-left", () => {
    const state = stateAfter("U");
    const corner = findPiece(state, ["white", "green", "red"]);
    expect(cubiePosition(corner)).toEqual([-1, 1, 1]);
  });

  test("R pulls the yellow bottom column onto the front face", () => {
    const faces = getFaces(stateAfter("R"));
    expect(faces.F[0][2]).toBe("yellow");
    expect(faces.F[1][2]).toBe("yellow");
    expect(faces.F[2][2]).toBe("yellow");
    expect(faces.U[0][2]).toBe("green");
    expect(faces.U[1][2]).toBe("green");
    expect(faces.U[2][2]).toBe("green");
  });

  test("x2 flips white to the bottom", () => {
    const state = stateAfter("x2");
    expect(faceWithCenter(state, "white")).toBe("D");
    expect(faceWithCenter(state, "yellow")).toBe("U");
    expect(isSolved(state)).toBe(true);
  });

  test("moves invert cleanly", () => {
    const alg = "R U2 F' L D B2 M E' S x y' z2";
    const state = applyAlg(stateAfter(alg), invertAlg(alg));
    expect(isSolved(state)).toBe(true);
    expect(statesEqual(state, createSolvedState())).toBe(true);
  });
});

describe("notation", () => {
  test("parse and format round-trip", () => {
    for (const token of ["R", "R'", "R2", "U'", "F2", "x", "y'", "z2", "M'"]) {
      expect(formatMove(parseMove(token))).toBe(token);
    }
  });

  test("rejects invalid tokens", () => {
    expect(() => parseMove("Q")).toThrow();
    expect(() => parseAlg("R U R'2")).toThrow();
  });
});

describe("stage predicates", () => {
  const DAISY = "x2 F2 R2 B2 L2";

  test("solved cube passes every stage", () => {
    const state = createSolvedState();
    expect(hasWhiteCross(state)).toBe(true);
    expect(firstLayerSolved(state)).toBe(true);
    expect(middleLayerSolved(state)).toBe(true);
    expect(hasYellowCross(state)).toBe(true);
    expect(yellowFaceComplete(state)).toBe(true);
    expect(isSolved(state)).toBe(true);
  });

  test("daisy construction forms a daisy but not a cross", () => {
    const state = stateAfter(DAISY);
    expect(hasDaisy(state)).toBe(true);
    expect(hasWhiteCross(state)).toBe(false);
  });

  test("scrambles break the daisy", () => {
    expect(hasDaisy(stateAfter("x2 R U F D L B"))).toBe(false);
  });

  test("sending daisy edges down forms the matched white cross", () => {
    const state = applyAlg(stateAfter(DAISY), "F2 R2 B2 L2");
    expect(hasWhiteCross(state)).toBe(true);
  });
});

describe("guide algorithms", () => {
  const SUNE = "R U R' U R U2 R'";
  const YELLOW_CROSS = "F U R U' R' F'";
  const CORNER_PLL = "R' F R' B2 R F' R' B2 R2 U'";
  const EDGE_PLL = "F2 U L R' F2 L' R U F2";
  const RIGHT_INSERT = "U R U' R' U' F' U F";
  const LEFT_INSERT = "U' L' U L U F U' F'";

  test("sune case shows exactly one oriented corner and keeps the cross", () => {
    const state = applyAlg(stateAfter("x2"), invertAlg(SUNE));
    expect(hasYellowCross(state)).toBe(true);
    expect(yellowCornersOrientedCount(state)).toBe(1);
    expect(yellowFaceComplete(applyAlg(state, SUNE))).toBe(true);
  });

  test("yellow cross algorithm turns an L into the cross", () => {
    const state = applyAlg(stateAfter("x2"), invertAlg(YELLOW_CROSS));
    expect(hasYellowCross(state)).toBe(false);
    expect(middleLayerSolved(state)).toBe(true);
    expect(hasYellowCross(applyAlg(state, YELLOW_CROSS))).toBe(true);
  });

  test("corner algorithm swaps the two front corners and preserves everything below", () => {
    const base = stateAfter("x2");
    const once = applyAlg(base, CORNER_PLL);
    expect(middleLayerSolved(once)).toBe(true);
    expect(yellowFaceComplete(once)).toBe(true);
    const yellowCorners = once.filter(
      (c) => pieceTypeOf(c) === "corner" && pieceColors(c).includes("yellow"),
    );
    const positioned = yellowCorners.filter((c) => pieceIsPositioned(once, c));
    expect(positioned.length).toBe(2);
    const twice = applyAlg(once, CORNER_PLL);
    expect(yellowCornersPositioned(twice)).toBe(true);
  });

  test("edge algorithm cycles three edges and has order three", () => {
    const base = stateAfter("x2");
    let state = base;
    for (let i = 0; i < 3; i++) {
      state = applyAlg(state, EDGE_PLL);
      expect(yellowFaceComplete(state)).toBe(true);
      expect(yellowCornersPositioned(state)).toBe(true);
      expect(middleLayerSolved(state)).toBe(true);
      expect(isSolved(state)).toBe(i === 2);
    }
  });

  test("middle layer inserts restore the middle layer from their own setup", () => {
    for (const alg of [RIGHT_INSERT, LEFT_INSERT]) {
      const setup = applyAlg(stateAfter("x2"), invertAlg(alg));
      expect(firstLayerSolved(setup)).toBe(true);
      expect(middleLayerSolved(setup)).toBe(false);
      expect(middleLayerSolved(applyAlg(setup, alg))).toBe(true);
    }
  });
});

describe("queries", () => {
  test("stickerFace tracks a sticker through moves", () => {
    const solved = createSolvedState();
    const edge = findPiece(solved, ["white", "green"]);
    expect(stickerFace(solved, edge, "white")).toBe("U");
    expect(stickerFace(solved, edge, "green")).toBe("F");
    const after = stateAfter("F");
    const moved = findPiece(after, ["white", "green"]);
    expect(stickerFace(after, moved, "white")).toBe("R");
  });
});

describe("scramble", () => {
  test("produces the requested number of legal moves", () => {
    const moves = randomScramble(22);
    expect(moves.length).toBe(22);
    for (let i = 1; i < moves.length; i++) {
      const prev = moves[i - 1];
      const cur = moves[i];
      const same =
        cur.axis === prev.axis &&
        cur.layers !== null &&
        prev.layers !== null &&
        cur.layers.length === prev.layers.length &&
        cur.layers.every((l) => prev.layers!.includes(l));
      expect(same).toBe(false);
    }
    expect(isSolved(applyMoves(createSolvedState(), moves))).toBe(false);
  });

  test("4x4 scrambles use 4x4 layers and break the cube", () => {
    const moves = randomScramble(30, 4);
    expect(moves.length).toBe(30);
    for (const move of moves) {
      expect(move.layers!.every((l) => Math.abs(l) === 1.5 || Math.abs(l) === 0.5)).toBe(true);
    }
    expect(isSolved(applyMoves(createSolvedState(4), moves))).toBe(false);
  });
});
