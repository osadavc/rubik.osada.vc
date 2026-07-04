"use client";

import { create } from "zustand";
import {
  applyMove,
  applyMoves,
  createSolvedState,
  invertMove,
  parseAlg,
  randomScramble,
} from "@/lib/cube";
import type { CubeState, Move, Sticker } from "@/lib/cube";

export type HighlightFn = (sticker: Sticker) => boolean;

export type MoveSource = "user" | "program" | "program-back" | "system";

export type QueuedMove = {
  move: Move;
  source: MoveSource;
  /** Milliseconds; 0 commits instantly. */
  duration: number;
};

export type ActiveAnim = QueuedMove & { startedAt: number };

export type PlaybackStatus = "idle" | "playing" | "paused";

export type Program = {
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

export type CameraPose = { azimuth: number; polar: number };

type CubeStore = {
  state: CubeState;
  queue: QueuedMove[];
  anim: ActiveAnim | null;
  speed: number;
  reducedMotion: boolean;
  highlight: HighlightFn | null;
  program: Program | null;
  cameraTarget: CameraPose | null;
  /** Bumped on every instant state replacement so views can crossfade. */
  snapId: number;

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
  restartProgram: (opts?: { autoplay?: boolean }) => void;
  userMove: (move: Move) => void;
  scramble: () => void;
  resetSolved: () => void;
  setSpeed: (speed: number) => void;
  setReducedMotion: (value: boolean) => void;
  setHighlight: (fn: HighlightFn | null) => void;
  setCameraTarget: (pose: CameraPose | null) => void;
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
  program: null,
  cameraTarget: null,
  snapId: 0,

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
    const { program, speed, reducedMotion, queue } = get();
    // Keep interaction responsive: never build a long backlog from fast drags.
    if (queue.length > 2) return;
    if (program && (program.status === "playing" || program.cursor > 0)) {
      set({
        program: {
          ...program,
          status: program.status === "playing" ? "paused" : program.status,
          dirty: true,
        },
      });
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

  setSpeed: (speed) => set({ speed }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setHighlight: (fn) => set({ highlight: fn }),
  setCameraTarget: (pose) => set({ cameraTarget: pose }),
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
