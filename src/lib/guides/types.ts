import type { ReactNode } from "react";
import type { CubeState, Sticker } from "@/lib/cube";

type CameraPose = { azimuth: number; polar: number };

type StepInteraction = "watch" | "execute";

/** One scramble variant for a practice step. */
export type PracticeDrill = {
  /** Moves from solved that produce the drill's starting cube. */
  setup: string;
  /** Short human name shown in the drill switcher, e.g. "Flipped petal". */
  label: string;
  hint?: string;
  /** Algorithm that reaches the goal; also drives the goal snapshot and "Show me". */
  solution?: string;
};

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
  /** Per-token teaching notes, aligned with demoTokens. Null skips a note. */
  demoNotes?: (string | null)[];
  /** Demo pace multiplier, lower is slower. Defaults to 0.8. */
  pace?: number;
  /** Stickers outside this predicate render dimmed, like the PDF's gray tiles. */
  highlight?: (sticker: Sticker) => boolean;
  /** Pieces to track with a pulsing glow: "watch this one travel". */
  spotlight?: (sticker: Sticker) => boolean;
  /**
   * Allow direct turns (drag, keyboard) while this step is active, outside a
   * practice session. Everywhere else, the cube only turns when the lesson
   * asks for it.
   */
  freePlay?: boolean;
  interaction?: StepInteraction;
  /** Target state for execute steps. */
  goal?: (state: CubeState) => boolean;
  /** One-sentence description of the goal, shown in the practice block. */
  goalText?: string;
  /** Practice variants. The first drill should match `setup`. */
  drills?: PracticeDrill[];
  camera?: CameraPose;
};

export type GuideChapter = {
  id: string;
  title: string;
  /** Short chapter subtitle for the index. */
  summary: string;
  /** End state of the chapter, shown as a snapshot in the chapter header. */
  outcome?: { setup: string; caption: string };
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

export const guideSteps = (guide: Guide): GuideStep[] =>
  guide.chapters.flatMap((chapter) => chapter.steps);

/** Kind of a step, used for the phase eyebrow in the lesson column. */
export const stepKind = (step: GuideStep): "learn" | "watch" | "practice" => {
  if (step.interaction === "execute") return "practice";
  if (step.demo) return "watch";
  return "learn";
};
