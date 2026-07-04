export * from "./types";
export * from "./math";
export * from "./state";
export * from "./notation";
export * from "./facelets";
export * from "./predicates";
export * from "./scramble";

import { parseAlg } from "./notation";
import { applyMoves, createSolvedState } from "./state";
import type { CubeState } from "./types";

export const applyAlg = (state: CubeState, alg: string): CubeState =>
  applyMoves(state, parseAlg(alg));

/** State reached by applying `alg` to a solved cube. */
export const stateAfter = (alg: string): CubeState =>
  applyAlg(createSolvedState(), alg);
