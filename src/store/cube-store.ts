"use client";

import { create } from "zustand";
import {
  applyMove,
  applyMoves,
  createSolvedState,
  invertMove,
  parseAlg,
  parseMove,
  randomScramble,
} from "@/lib/cube";
import type { CubeState, Move, Sticker } from "@/lib/cube";

type HighlightFn = (sticker: Sticker) => boolean;

type MoveSource = "user" | "program" | "program-back" | "system";

export type QueuedMove = {
  move: Move;
  source: MoveSource;
  /** Milliseconds; 0 commits instantly. */
  duration: number;
};

type ActiveAnim = QueuedMove & { startedAt: number };

type PlaybackStatus = "idle" | "playing" | "paused";

type Program = {
  id: string;
  moves: Move[];
  tokens: string[];
  cursor: number;
  status: PlaybackStatus;
  /** True once the user turned faces mid-program; stepping is unreliable until restart. */
  dirty: boolean;
  baseState: CubeState;
  /** Demo pace multiplier; < 1 plays slower than user moves. */
  pace: number;
};

type PracticeSession = {
  stepId: string;
  drillIndex: number;
  status: "active" | "solved";
  /** Face turns made by the user in this attempt. */
  moveCount: number;
  /** True once "Show me" played the solution for this attempt. */
  assisted: boolean;
};

type CameraPose = { azimuth: number; polar: number };

/**
 * Live camera azimuth in radians, written by the canvas every frame and read
 * synchronously by input handlers (keyboard turns map "F" to whatever face
 * is toward the viewer). Deliberately outside zustand: it changes per frame
 * and must never trigger renders.
 */
export const liveCamera = { azimuth: 0.68 };

/** Side faces in camera-orbit order: each quarter turn of azimuth shifts by one. */
const VIEW_RING = ["F", "R", "B", "L"] as const;

/**
 * Parse a token like "F" / "R'" / "U2" with its face taken from the viewer's
 * frame: "F" is always the side currently facing the viewer, however the
 * cube has been orbited. U and D stay world up and down.
 */
export const viewAdjustedMove = (token: string): Move => {
  const match = /^([UDLRFB])(2|')?$/.exec(token);
  if (!match) return parseMove(token);
  const idx = VIEW_RING.indexOf(match[1] as (typeof VIEW_RING)[number]);
  if (idx === -1) return parseMove(token);
  const quarter = Math.round(liveCamera.azimuth / (Math.PI / 2));
  const letter = VIEW_RING[(((idx + quarter) % 4) + 4) % 4];
  return parseMove(`${letter}${match[2] ?? ""}`);
};

type CubeStore = {
  state: CubeState;
  queue: QueuedMove[];
  anim: ActiveAnim | null;
  speed: number;
  reducedMotion: boolean;
  highlight: HighlightFn | null;
  /** Pieces to track with a pulsing glow, independent of the dim mask. */
  spotlight: HighlightFn | null;
  program: Program | null;
  practice: PracticeSession | null;
  /** performance.now() of the last solve celebration, drives the glow wave. */
  celebrateAt: number | null;
  cameraTarget: CameraPose | null;
  /** Bumped on every instant state replacement so views can crossfade. */
  snapId: number;
  /**
   * When true, direct turns (drag, keyboard) are refused unless a practice
   * session is active. Set per step by the guide so learners can only turn
   * the cube where turning is part of the lesson.
   */
  turnLocked: boolean;
  /** Timestamp of the last refused turn attempt, drives the hint pill. */
  lockNudgeAt: number | null;

  startNextAnim: () => void;
  completeAnim: () => void;
  snapTo: (state: CubeState) => void;
  loadProgram: (
    id: string,
    alg: string,
    opts?: { autoplay?: boolean; pace?: number; tokens?: string[] },
  ) => void;
  clearProgram: () => void;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  /** Jump the loaded program to `cursor`, optionally animating that one move. */
  seekTo: (cursor: number, opts?: { playMove?: boolean }) => void;
  restartProgram: (opts?: { autoplay?: boolean }) => void;
  userMove: (move: Move) => void;
  scramble: () => void;
  resetSolved: () => void;
  startPractice: (stepId: string, drillIndex: number) => void;
  setPracticeDrill: (drillIndex: number) => void;
  practiceSolved: () => void;
  markPracticeAssisted: () => void;
  endPractice: () => void;
  setSpeed: (speed: number) => void;
  setReducedMotion: (value: boolean) => void;
  setHighlight: (fn: HighlightFn | null) => void;
  setSpotlight: (fn: HighlightFn | null) => void;
  setCameraTarget: (pose: CameraPose | null) => void;
  setTurnLocked: (locked: boolean) => void;
  /** True when a direct turn is currently allowed. */
  canTurn: () => boolean;
  /** Record a refused turn attempt so the UI can explain the lock. */
  nudgeLock: () => void;
};

const BASE_QUARTER_MS = 260;
const BASE_HALF_MS = 420;

const moveDuration = (move: Move, speed: number, pace: number, reduced: boolean): number => {
  if (reduced) return 0;
  const base = move.q === 2 ? BASE_HALF_MS : BASE_QUARTER_MS;
  return base / (speed * pace);
};

export const useCubeStore = create<CubeStore>((set, get) => ({
  state: createSolvedState(),
  queue: [],
  anim: null,
  speed: 1,
  reducedMotion: false,
  highlight: null,
  spotlight: null,
  program: null,
  practice: null,
  celebrateAt: null,
  cameraTarget: null,
  snapId: 0,
  turnLocked: false,
  lockNudgeAt: null,

  startNextAnim: () => {
    const { anim, queue } = get();
    if (anim || queue.length === 0) return;
    const [next, ...rest] = queue;
    if (next.duration <= 0) {
      // Commit instantly without an animation frame.
      set({ queue: rest });
      commitMove(set, get, next);
      return;
    }
    set({ queue: rest, anim: { ...next, startedAt: performance.now() } });
  },

  completeAnim: () => {
    const { anim } = get();
    if (!anim) return;
    set({ anim: null });
    commitMove(set, get, anim);
  },

  snapTo: (state) => {
    set((prev) => ({
      state,
      queue: [],
      anim: null,
      snapId: prev.snapId + 1,
    }));
  },

  loadProgram: (id, alg, opts) => {
    const { state } = get();
    const moves = parseAlg(alg);
    const tokens = opts?.tokens ?? alg.split(/\s+/).filter(Boolean);
    const program: Program = {
      id,
      moves,
      tokens,
      cursor: 0,
      status: "idle",
      dirty: false,
      baseState: state,
      pace: opts?.pace ?? 0.8,
    };
    set({ program, queue: [], anim: get().anim });
    if (opts?.autoplay) get().play();
  },

  clearProgram: () => set({ program: null }),

  play: () => {
    const { program } = get();
    if (!program || program.moves.length === 0) return;
    if (program.cursor >= program.moves.length || program.dirty) {
      get().restartProgram({ autoplay: true });
      return;
    }
    set({ program: { ...program, status: "playing" } });
    enqueueProgramMove(set, get);
  },

  pause: () => {
    const { program } = get();
    if (!program) return;
    set({ program: { ...program, status: "paused" } });
  },

  stepForward: () => {
    const { program, anim, queue } = get();
    if (!program || program.dirty || anim || queue.length > 0) return;
    if (program.cursor >= program.moves.length) return;
    set({ program: { ...program, status: "paused" } });
    enqueueProgramMove(set, get);
  },

  stepBackward: () => {
    const { program, anim, queue, speed, reducedMotion } = get();
    if (!program || program.dirty || anim || queue.length > 0) return;
    if (program.cursor === 0) return;
    const move = invertMove(program.moves[program.cursor - 1]);
    set({
      program: { ...program, status: "paused" },
      queue: [
        {
          move,
          source: "program-back",
          duration: moveDuration(move, speed, program.pace, reducedMotion),
        },
      ],
    });
  },

  seekTo: (cursor, opts) => {
    const { program, speed, reducedMotion } = get();
    if (!program) return;
    const clamped = Math.max(0, Math.min(cursor, program.moves.length));
    const state = applyMoves(program.baseState, program.moves.slice(0, clamped));
    set((prev) => ({
      state,
      queue: [],
      anim: null,
      snapId: prev.snapId + 1,
      program: { ...program, cursor: clamped, dirty: false, status: "paused" },
    }));
    if (opts?.playMove && clamped < program.moves.length) {
      const move = program.moves[clamped];
      set({
        queue: [
          {
            move,
            source: "program",
            duration: moveDuration(move, speed, program.pace, reducedMotion),
          },
        ],
      });
    }
  },

  restartProgram: (opts) => {
    const { program } = get();
    if (!program) return;
    set((prev) => ({
      state: program.baseState,
      queue: [],
      anim: null,
      snapId: prev.snapId + 1,
      program: { ...program, cursor: 0, dirty: false, status: "idle" },
    }));
    if (opts?.autoplay) get().play();
  },

  userMove: (move) => {
    const { program, practice, speed, reducedMotion, queue } = get();
    // Keep interaction responsive: never build a long backlog from fast drags.
    if (queue.length > 2) return;
    // Any user turn taints a loaded program, even one that has not started
    // yet: play must never run the moves from a tampered state, so playback
    // controls treat a dirty program as "reset to the base state first".
    if (program) {
      set({
        program: {
          ...program,
          status: program.status === "playing" ? "paused" : program.status,
          dirty: true,
        },
      });
    }
    if (practice && practice.status === "active") {
      set({ practice: { ...practice, moveCount: practice.moveCount + 1 } });
    }
    set((prev) => ({
      queue: [
        ...prev.queue,
        { move, source: "user", duration: moveDuration(move, speed, 1.4, reducedMotion) },
      ],
    }));
  },

  scramble: () => {
    const { reducedMotion } = get();
    const moves = randomScramble(22);
    if (reducedMotion) {
      set((prev) => ({
        state: applyMoves(prev.state, moves),
        queue: [],
        anim: null,
        snapId: prev.snapId + 1,
      }));
      return;
    }
    set((prev) => ({
      program: null,
      queue: [
        ...prev.queue,
        ...moves.map((move) => ({ move, source: "system" as const, duration: 70 })),
      ],
    }));
  },

  resetSolved: () => {
    get().snapTo(createSolvedState());
    set({ program: null });
  },

  startPractice: (stepId, drillIndex) =>
    set({
      practice: { stepId, drillIndex, status: "active", moveCount: 0, assisted: false },
    }),

  setPracticeDrill: (drillIndex) => {
    const { practice } = get();
    if (!practice) return;
    set({
      practice: { ...practice, drillIndex, status: "active", moveCount: 0, assisted: false },
    });
  },

  practiceSolved: () => {
    const { practice } = get();
    if (!practice || practice.status === "solved") return;
    set({
      practice: { ...practice, status: "solved" },
      celebrateAt: performance.now(),
    });
  },

  markPracticeAssisted: () => {
    const { practice } = get();
    if (!practice) return;
    set({ practice: { ...practice, assisted: true } });
  },

  endPractice: () => set({ practice: null }),

  setSpeed: (speed) => set({ speed }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setHighlight: (fn) => set({ highlight: fn }),
  setSpotlight: (fn) => set({ spotlight: fn }),
  setCameraTarget: (pose) => set({ cameraTarget: pose }),
  setTurnLocked: (locked) => set({ turnLocked: locked }),
  canTurn: () => {
    const { turnLocked, practice } = get();
    return practice !== null || !turnLocked;
  },
  nudgeLock: () => set({ lockNudgeAt: performance.now() }),
}));

type Set = (
  partial:
    | Partial<CubeStore>
    | ((state: CubeStore) => Partial<CubeStore>),
) => void;
type Get = () => CubeStore;

const commitMove = (set: Set, get: Get, done: QueuedMove) => {
  set((prev) => ({ state: applyMove(prev.state, done.move) }));
  const { program } = get();
  if (!program) return;
  if (done.source === "program") {
    const cursor = program.cursor + 1;
    const finished = cursor >= program.moves.length;
    set({
      program: {
        ...program,
        cursor,
        status: finished ? "idle" : program.status,
      },
    });
    if (!finished && program.status === "playing") enqueueProgramMove(set, get);
  } else if (done.source === "program-back") {
    set({ program: { ...program, cursor: program.cursor - 1 } });
  }
};

const enqueueProgramMove = (set: Set, get: Get) => {
  const { program, speed, reducedMotion, queue, anim } = get();
  if (!program || anim || queue.length > 0) return;
  if (program.cursor >= program.moves.length) return;
  const move = program.moves[program.cursor];
  set({
    queue: [
      {
        move,
        source: "program",
        duration: moveDuration(move, speed, program.pace, reducedMotion),
      },
    ],
  });
};
