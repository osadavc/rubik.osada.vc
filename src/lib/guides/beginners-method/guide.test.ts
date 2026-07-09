import { describe, expect, test } from "bun:test";
import {
  applyAlg,
  centerColorOf,
  cubiePosition,
  faceWithCenter,
  findPiece,
  firstLayerSolved,
  getFaces,
  getStickers,
  hasDaisy,
  hasWhiteCross,
  hasYellowCross,
  isSolved,
  middleLayerSolved,
  parseAlg,
  pieceColors,
  pieceIsPositioned,
  pieceTypeOf,
  stateAfter,
  statesLookEqual,
  stickerFace,
  yellowCornersOrientedCount,
  yellowCornersPositioned,
  yellowFaceComplete,
} from "@/lib/cube";
import type { CubeState } from "@/lib/cube";
import { beginnersMethod } from "./index";
import { guideSteps } from "../types";
import {
  CORNER_DOWN_FIX,
  CORNER_LEFT,
  CORNER_PLL,
  CORNER_RIGHT,
  DAISY_FLIP,
  DEMOS,
  EDGE_PLL,
  EDGE_PLL_PRIME,
  INSERT_LEFT,
  INSERT_RIGHT,
  SETUPS,
  SUNE,
  YELLOW_CROSS,
} from "./algs";

const steps = guideSteps(beginnersMethod);

describe("guide data integrity", () => {
  test("step ids are unique", () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every setup, demo and drill parses", () => {
    for (const step of steps) {
      for (const alg of [step.setup, step.demo]) {
        if (alg) expect(() => parseAlg(alg)).not.toThrow();
      }
      for (const drill of step.drills ?? []) {
        expect(() => parseAlg(drill.setup)).not.toThrow();
        const solution = drill.solution;
        if (solution) expect(() => parseAlg(solution)).not.toThrow();
      }
    }
  });

  test("demo notes and tokens align with the demo moves", () => {
    for (const step of steps) {
      if (!step.demo) continue;
      const moveCount = parseAlg(step.demo).length;
      if (step.demoTokens) expect(step.demoTokens.length).toBe(moveCount);
      if (step.demoNotes) expect(step.demoNotes.length).toBe(moveCount);
    }
  });

  test("highlight masks accept every sticker of their setup state", () => {
    for (const step of steps) {
      if (!step.highlight) continue;
      const state = stateAfter(step.setup ?? "");
      for (const sticker of getStickers(state)) {
        expect(typeof step.highlight(sticker)).toBe("boolean");
      }
    }
  });

  test("every drill starts unsatisfied and its solution satisfies the goal", () => {
    for (const step of steps) {
      if (step.interaction !== "execute" || !step.goal) continue;
      expect(step.drills?.length ?? 0).toBeGreaterThan(0);
      for (const drill of step.drills!) {
        const start = stateAfter(drill.setup);
        expect(step.goal(start)).toBe(false);
        if (drill.solution) {
          expect(step.goal(applyAlg(start, drill.solution))).toBe(true);
        }
      }
    }
  });

  test("drill labels are unique within a step", () => {
    for (const step of steps) {
      const labels = (step.drills ?? []).map((d) => d.label);
      expect(new Set(labels).size).toBe(labels.length);
    }
  });

  test("spotlights select at least one piece of their setup state", () => {
    for (const step of steps) {
      if (!step.spotlight) continue;
      const stickers = getStickers(stateAfter(step.setup ?? ""));
      expect(stickers.some((s) => step.spotlight!(s))).toBe(true);
    }
  });

  test("chapter outcomes parse", () => {
    for (const chapter of beginnersMethod.chapters) {
      if (chapter.outcome) expect(() => parseAlg(chapter.outcome!.setup)).not.toThrow();
    }
  });
});

/** Petals on top whose side tile happens to match the center below it. */
const matchedPetalCount = (state: CubeState): number => {
  const up = faceWithCenter(state, "yellow");
  let matched = 0;
  for (const cubie of state) {
    if (pieceTypeOf(cubie) !== "edge") continue;
    const colors = pieceColors(cubie);
    if (!colors.includes("white")) continue;
    if (stickerFace(state, cubie, "white") !== up) continue;
    const other = colors.find((c) => c !== "white")!;
    if (centerColorOf(state, stickerFace(state, cubie, other)) === other) matched++;
  }
  return matched;
};

describe("daisy stage", () => {
  test("teaching states never show petals matched to their centers", () => {
    // The daisy must not imply that side colors matter; matching is taught
    // later, in the cross stage.
    const teachingSetups = [
      SETUPS.daisyMixed,
      SETUPS.daisyTopCase,
      SETUPS.daisyMiddleCase,
      SETUPS.daisyBumpCase,
      SETUPS.daisyBottomCase,
      SETUPS.daisyFlipCase,
      SETUPS.daisyPractice,
      "x2 R2 B2 U'",
    ];
    for (const setup of teachingSetups) {
      expect(matchedPetalCount(stateAfter(setup))).toBe(0);
    }
  });

  test("mixed daisy is a complete daisy", () => {
    expect(hasDaisy(stateAfter(SETUPS.daisyMixed))).toBe(true);
  });

  test("middle layer case rises into the daisy", () => {
    expect(hasDaisy(applyAlg(stateAfter(SETUPS.daisyMiddleCase), "F'"))).toBe(true);
  });

  test("bump case clears the slot first", () => {
    expect(hasDaisy(applyAlg(stateAfter(SETUPS.daisyBumpCase), "U F2"))).toBe(true);
  });

  test("bottom case comes straight up", () => {
    expect(hasDaisy(applyAlg(stateAfter(SETUPS.daisyBottomCase), "F2"))).toBe(true);
  });

  test("flip case shows white on the right face and the algorithm fixes it", () => {
    const state = stateAfter(SETUPS.daisyFlipCase);
    expect(hasDaisy(state)).toBe(false);
    const whiteOnRight = getStickers(state).filter(
      (s) => s.face === "R" && s.pieceType === "edge" && s.color === "white",
    );
    expect(whiteOnRight.length).toBe(1);
    expect(hasDaisy(applyAlg(state, DAISY_FLIP))).toBe(true);
  });
});

describe("white cross stage", () => {
  test("mismatch daisy cannot line every petal up with one top turn", () => {
    const state = stateAfter(SETUPS.crossMismatch);
    expect(hasDaisy(state)).toBe(true);
    expect(matchedPetalCount(state)).toBe(0);
    for (const turn of ["U", "U'", "U2"] as const) {
      expect(matchedPetalCount(applyAlg(state, turn))).toBeLessThan(4);
    }
  });

  test("match and send down completes the cross one petal at a time", () => {
    expect(hasWhiteCross(applyAlg(stateAfter(SETUPS.crossMismatch), DEMOS.crossAround))).toBe(true);
    expect(
      hasWhiteCross(applyAlg(stateAfter(SETUPS.crossPractice), DEMOS.crossPracticeSolution)),
    ).toBe(true);
  });

  test("send-down setup already has the front petal matched", () => {
    expect(matchedPetalCount(stateAfter(SETUPS.crossMatchedPair))).toBe(2);
    expect(hasWhiteCross(applyAlg(stateAfter(SETUPS.crossMatchedPair), "F2 B2 U2 L2 R2"))).toBe(
      true,
    );
  });

  test("cross done state has the cross but unsolved corners", () => {
    const state = stateAfter(SETUPS.crossDone);
    expect(hasWhiteCross(state)).toBe(true);
    expect(firstLayerSolved(state)).toBe(false);
  });
});

describe("white corners stage", () => {
  test("align demo returns the corner underneath its slot", () => {
    const aligned = applyAlg(stateAfter(SETUPS.cornerAlignCase), "D2");
    expect(statesLookEqual(aligned, stateAfter(SETUPS.cornerRightCase))).toBe(true);
  });

  test("right case: white faces front on the right and inserts cleanly", () => {
    const state = stateAfter(SETUPS.cornerRightCase);
    const corner = findPiece(state, ["white", "green", "red"]);
    expect(cubiePosition(corner)).toEqual([1, -1, 1]);
    expect(stickerFace(state, corner, "white")).toBe("F");
    expect(firstLayerSolved(applyAlg(state, CORNER_RIGHT))).toBe(true);
  });

  test("left case: white faces front on the left and inserts cleanly", () => {
    const state = stateAfter(SETUPS.cornerLeftCase);
    const corner = findPiece(state, ["white", "green", "orange"]);
    expect(cubiePosition(corner)).toEqual([-1, -1, 1]);
    expect(stickerFace(state, corner, "white")).toBe("F");
    expect(firstLayerSolved(applyAlg(state, CORNER_LEFT))).toBe(true);
  });

  test("top layer escape drops the corner without breaking the cross", () => {
    const state = stateAfter(SETUPS.cornerTopCase);
    const corner = findPiece(state, ["white", "green", "red"]);
    expect(cubiePosition(corner)[1]).toBe(1);
    expect(hasWhiteCross(state)).toBe(true);
    const after = applyAlg(state, DEMOS.cornerEscape);
    const dropped = findPiece(after, ["white", "green", "red"]);
    expect(cubiePosition(dropped)[1]).toBe(-1);
    expect(hasWhiteCross(after)).toBe(true);
  });

  test("white facing down gets rotated to the front, then inserts", () => {
    const state = stateAfter(SETUPS.cornerDownCase);
    const corner = findPiece(state, ["white", "green", "red"]);
    expect(stickerFace(state, corner, "white")).toBe("D");
    const fixed = applyAlg(state, CORNER_DOWN_FIX);
    const fixedCorner = findPiece(fixed, ["white", "green", "red"]);
    expect(stickerFace(fixed, fixedCorner, "white")).toBe("F");
    expect(hasWhiteCross(fixed)).toBe(true);
    expect(firstLayerSolved(applyAlg(fixed, CORNER_RIGHT))).toBe(true);
  });

  test("layer one done state keeps layer one and scrambles the rest", () => {
    const state = stateAfter(SETUPS.layerOneDone);
    expect(firstLayerSolved(state)).toBe(true);
    expect(middleLayerSolved(state)).toBe(false);
  });
});

describe("middle layer stage", () => {
  test("both inserts solve their own case", () => {
    expect(middleLayerSolved(applyAlg(stateAfter(SETUPS.insertRightCase), INSERT_RIGHT))).toBe(true);
    expect(middleLayerSolved(applyAlg(stateAfter(SETUPS.insertLeftCase), INSERT_LEFT))).toBe(true);
  });

  test("insert cases keep layer one intact", () => {
    expect(firstLayerSolved(stateAfter(SETUPS.insertRightCase))).toBe(true);
    expect(firstLayerSolved(stateAfter(SETUPS.insertLeftCase))).toBe(true);
  });

  test("stuck edge gets ejected into the top layer", () => {
    const state = stateAfter(SETUPS.middleStuckCase);
    const displaced = state.filter((c) => {
      if (pieceTypeOf(c) !== "edge") return false;
      const colors = pieceColors(c);
      if (colors.includes("white") || colors.includes("yellow")) return false;
      return cubiePosition(c)[1] === 0 && !pieceIsPositioned(state, c);
    });
    expect(displaced.length).toBe(1);
    const after = applyAlg(state, INSERT_RIGHT);
    const ejected = findPiece(after, pieceColors(displaced[0]));
    expect(cubiePosition(ejected)[1]).toBe(1);
  });

  test("middle done state has two layers and no yellow cross yet", () => {
    const state = stateAfter(SETUPS.middleDone);
    expect(middleLayerSolved(state)).toBe(true);
    expect(hasYellowCross(state)).toBe(false);
  });
});

describe("final layer stages", () => {
  test("yellow cross: L solves in one pass, line in two, dot in three", () => {
    expect(hasYellowCross(applyAlg(stateAfter(SETUPS.yellowL), YELLOW_CROSS))).toBe(true);
    expect(hasYellowCross(applyAlg(stateAfter(SETUPS.yellowLine), DEMOS.yellowLine2x))).toBe(true);
    expect(hasYellowCross(applyAlg(stateAfter(SETUPS.yellowDot), DEMOS.yellowDotSolution))).toBe(true);
  });

  test("yellow cross cases show the advertised shapes", () => {
    const edgesUp = (setup: string) =>
      getStickers(stateAfter(setup)).filter(
        (s) => s.face === "U" && s.pieceType === "edge" && s.color === "yellow",
      ).length;
    expect(edgesUp(SETUPS.yellowDot)).toBe(0);
    expect(edgesUp(SETUPS.yellowL)).toBe(2);
    expect(edgesUp(SETUPS.yellowLine)).toBe(2);
  });

  test("orient cases show 0, 1 and 2 yellow corners and all resolve", () => {
    expect(yellowCornersOrientedCount(stateAfter(SETUPS.suneNone))).toBe(0);
    expect(yellowCornersOrientedCount(stateAfter(SETUPS.suneFish))).toBe(1);
    expect(yellowCornersOrientedCount(stateAfter(SETUPS.suneTwo))).toBe(2);
    expect(yellowFaceComplete(applyAlg(stateAfter(SETUPS.suneFish), SUNE))).toBe(true);
    expect(yellowFaceComplete(applyAlg(stateAfter(SETUPS.suneNone), DEMOS.suneTwice))).toBe(true);
    expect(yellowFaceComplete(applyAlg(stateAfter(SETUPS.suneTwo), DEMOS.suneTwoSolution))).toBe(true);
  });

  test("corner positioning: tail lights in back, then solved", () => {
    const adjacent = stateAfter(SETUPS.cornersAdjacent);
    expect(yellowFaceComplete(adjacent)).toBe(true);
    const backCorners = adjacent.filter((c) => {
      if (pieceTypeOf(c) !== "corner" || !pieceColors(c).includes("yellow")) return false;
      return pieceIsPositioned(adjacent, c);
    });
    expect(backCorners.length).toBe(2);
    for (const corner of backCorners) {
      expect(cubiePosition(corner)[2]).toBe(-1);
    }
    expect(yellowCornersPositioned(applyAlg(adjacent, CORNER_PLL))).toBe(true);

    const diagonal = stateAfter(SETUPS.cornersDiagonal);
    const positioned = diagonal.filter(
      (c) =>
        pieceTypeOf(c) === "corner" &&
        pieceColors(c).includes("yellow") &&
        pieceIsPositioned(diagonal, c),
    );
    expect(positioned.length).toBe(0);
    const fixed = applyAlg(diagonal, DEMOS.cornersDiagonal2x);
    expect(yellowCornersPositioned(fixed)).toBe(true);
    expect(yellowFaceComplete(fixed)).toBe(true);
  });

  test("edge positioning: solid face sits in back and one pass solves", () => {
    for (const [setup, alg] of [
      [SETUPS.edgesCycle, EDGE_PLL],
      [SETUPS.edgesCyclePrime, EDGE_PLL_PRIME],
    ] as const) {
      const state = stateAfter(setup);
      const back = getFaces(state).B;
      expect(back.every((row) => row.every((c) => c === back[1][1]))).toBe(true);
      expect(isSolved(state)).toBe(false);
      expect(isSolved(applyAlg(state, alg))).toBe(true);
    }
  });

  test("edge direction tip: front edge matches left center for U version, right for U' version", () => {
    const faces = getFaces(stateAfter(SETUPS.edgesCycle));
    expect(faces.F[0][1]).toBe(faces.L[1][1]);
    const facesPrime = getFaces(stateAfter(SETUPS.edgesCyclePrime));
    expect(facesPrime.F[0][1]).toBe(facesPrime.R[1][1]);
  });
});
