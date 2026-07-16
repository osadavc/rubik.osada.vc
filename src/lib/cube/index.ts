export * from "./types";
export * from "./math";
export * from "./state";
export * from "./notation";
export * from "./facelets";
export * from "./predicates";
export * from "./predicates4";
export * from "./scramble";

import { parseAlg } from "./notation";
import { applyMoves, createSolvedState, sizeOfState } from "./state";
import type { CubeSize, CubeState } from "./types";

export const applyAlg = (state: CubeState, alg: string): CubeState =>
  applyMoves(state, parseAlg(alg, sizeOfState(state)));

/** State reached by applying `alg` to a solved cube of the given size. */
export const stateAfter = (alg: string, size: CubeSize = 3): CubeState =>
  applyAlg(createSolvedState(size), alg);
