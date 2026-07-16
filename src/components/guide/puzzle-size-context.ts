"use client";

import { createContext, useContext } from "react";
import type { CubeSize } from "@/lib/cube";

/**
 * The size of the cube the current guide teaches. Provided once by GuideView
 * so snapshots, diagrams and practice panels build states of the right size
 * without threading a prop through every step.
 */
export const PuzzleSizeContext = createContext<CubeSize>(3);

export const usePuzzleSize = (): CubeSize => useContext(PuzzleSizeContext);
