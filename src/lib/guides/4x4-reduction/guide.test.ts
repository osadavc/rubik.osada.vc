import { describe, expect, test } from "bun:test";
import {
  applyAlg,
  centersSolved,
  centerBlockComplete,
  edgesPaired,
  getStickers,
  hasYellowCross4,
  isReduced,
  isSolved,
  parseAlg,
  positionedYellowPairSides,
  stateAfter,
  yellowEdgePairsUp,
  yellowFaceComplete4,
} from "@/lib/cube";
import { guideSteps } from "../types";
import { fourByFourReduction } from "./index";
import { DEMOS, EDGE_PAIR, OLL_PARITY, PLL_PARITY, SETUPS } from "./algs";

const steps = guideSteps(fourByFourReduction);
const after4 = (alg: string) => stateAfter(alg, 4);

describe("guide data integrity", () => {
  test("step ids are unique", () => {
    const ids = steps.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("every setup, demo and drill parses as 4x4 notation", () => {
    for (const step of steps) {
      for (const alg of [step.setup, step.demo]) {
        if (alg) expect(() => parseAlg(alg, 4)).not.toThrow();
      }
      for (const drill of step.drills ?? []) {
        expect(() => parseAlg(drill.setup, 4)).not.toThrow();
        const solution = drill.solution;
        if (solution) expect(() => parseAlg(solution, 4)).not.toThrow();
      }
    }
  });

  test("demo notes and tokens align with the demo moves", () => {
    for (const step of steps) {
      if (!step.demo) continue;
      const moveCount = parseAlg(step.demo, 4).length;
      if (step.demoTokens) expect(step.demoTokens.length).toBe(moveCount);
      if (step.demoNotes) expect(step.demoNotes.length).toBe(moveCount);
    }
  });

  test("highlight masks accept every sticker of their setup state", () => {
    for (const step of steps) {
      if (!step.highlight) continue;
      const state = after4(step.setup ?? "");
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
        const start = after4(drill.setup);
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
      const stickers = getStickers(after4(step.setup ?? ""));
      expect(stickers.some((s) => step.spotlight!(s))).toBe(true);
    }
  });

  test("chapter outcomes parse", () => {
    for (const chapter of fourByFourReduction.chapters) {
      if (chapter.outcome) {
        expect(() => parseAlg(chapter.outcome!.setup, 4)).not.toThrow();
      }
    }
  });
});

describe("centers stage", () => {
  test("front and down cases each miss exactly one white tile up top", () => {
    for (const setup of [SETUPS.centerFrontCase, SETUPS.centerDownCase]) {
      const state = after4(setup);
      expect(centerBlockComplete(state, "white")).toBe(false);
      const whitesUp = getStickers(state).filter(
        (s) => s.face === "U" && s.pieceType === "center" && s.color === "white",
      );
      expect(whitesUp.length).toBe(3);
    }
  });

  test("outcome picture has all centers grouped but broken pairs", () => {
    const state = after4(SETUPS.centersDone);
    expect(centersSolved(state)).toBe(true);
    expect(edgesPaired(state)).toBe(false);
  });
});

describe("edges stage", () => {
  test("case setups keep every center block intact", () => {
    for (const setup of [SETUPS.edgeAcrossCase, SETUPS.edgeDiagonalCase]) {
      expect(centersSolved(after4(setup))).toBe(true);
      expect(edgesPaired(after4(setup))).toBe(false);
    }
  });

  test("pairing sequence never disturbs solved centers", () => {
    expect(centersSolved(applyAlg(after4(""), EDGE_PAIR))).toBe(true);
  });

  test("outcome picture is fully reduced", () => {
    expect(isReduced(after4(SETUPS.edgesDone))).toBe(true);
  });
});

describe("parity stages", () => {
  test("OLL parity cases show the advertised pair counts", () => {
    expect(yellowEdgePairsUp(after4(SETUPS.ollParityCase))).toBe(3);
    expect(yellowEdgePairsUp(after4(SETUPS.ollParityOneUp))).toBe(1);
    expect(yellowEdgePairsUp(after4(SETUPS.yellowLCase))).toBe(2);
  });

  test("OLL parity algorithm completes the cross from both cases", () => {
    expect(hasYellowCross4(applyAlg(after4(SETUPS.ollParityCase), OLL_PARITY))).toBe(true);
    expect(
      hasYellowCross4(
        applyAlg(after4(SETUPS.ollParityOneUp), DEMOS.ollParityOneUpSolution),
      ),
    ).toBe(true);
  });

  test("PLL parity cases show two placed pairs, opposite and adjacent", () => {
    const opposite = after4(SETUPS.pllOppositeCase);
    expect(yellowFaceComplete4(opposite)).toBe(true);
    expect(positionedYellowPairSides(opposite).sort()).toEqual(["L", "R"]);

    const adjacent = after4(SETUPS.pllAdjacentCase);
    expect(yellowFaceComplete4(adjacent)).toBe(true);
    expect(positionedYellowPairSides(adjacent).sort()).toEqual(["B", "L"]);
  });

  test("PLL parity solutions finish the cube", () => {
    expect(isSolved(applyAlg(after4(SETUPS.pllOppositeCase), PLL_PARITY))).toBe(true);
    expect(
      isSolved(applyAlg(after4(SETUPS.pllAdjacentCase), DEMOS.pllAdjacentSolution)),
    ).toBe(true);
  });
});
