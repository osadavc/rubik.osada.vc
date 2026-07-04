import type { ReactNode } from "react";
import type { CubeState, Sticker } from "@/lib/cube";

export type CameraPose = { azimuth: number; polar: number };

export type StepInteraction = "watch" | "execute";

export type GuideStep = {
  id: string;
  /** Short label used in navigation. */
  title: string;
  content: ReactNode;
  /** Moves from solved that produce this step's starting cube. */
  setup?: string;
  /** Algorithm demonstrated on the cube when the step activates. */
  demo?: string;
  /** Display tokens for the demo, defaults to demo.split(" "). */
  demoTokens?: string[];
  /** Autoplay the demo on activation. Defaults to true when demo is set. */
  autoplay?: boolean;
  /** Demo pace multiplier, lower is slower. Defaults to 0.8. */
  pace?: number;
  /** Stickers outside this predicate render dimmed, like the PDF's gray tiles. */
  highlight?: (sticker: Sticker) => boolean;
  interaction?: StepInteraction;
  /** Target state for execute steps; only used by tests to validate solutions. */
  goal?: (state: CubeState) => boolean;
  /** One-sentence description of the goal, shown in the practice block. */
  goalText?: string;
  /** Extra hint text revealed on request in practice blocks. */
  hint?: string;
  /** Algorithm played by "Show me" in practice blocks. */
  solution?: string;
  camera?: CameraPose;
};

export type GuideChapter = {
  id: string;
  title: string;
  /** Short chapter subtitle for the index. */
  summary: string;
  steps: GuideStep[];
};

export type Guide = {
  slug: string;
  title: string;
  tagline: string;
  puzzle: "3x3" | "4x4";
  difficulty: "beginner" | "intermediate" | "advanced";
  estMinutes: number;
  chapters: GuideChapter[];
};

export type CatalogEntry = {
  slug: string;
  title: string;
  tagline: string;
  puzzle: "3x3" | "4x4";
  difficulty: "beginner" | "intermediate" | "advanced";
  estMinutes: number;
  available: boolean;
};

export const guideStepCount = (guide: Guide): number =>
  guide.chapters.reduce((sum, chapter) => sum + chapter.steps.length, 0);

export const guideSteps = (guide: Guide): GuideStep[] =>
  guide.chapters.flatMap((chapter) => chapter.steps);
