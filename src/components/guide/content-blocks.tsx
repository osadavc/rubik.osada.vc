"use client";

import { LightbulbIcon, PauseIcon, PlayIcon, ShuffleIcon } from "@phosphor-icons/react";
import { STICKER_COLORS } from "@/lib/colors";
import type { ColorName } from "@/lib/cube";
import { useCubeStore, viewAdjustedMove } from "@/store/cube-store";
import { DirectionGlyph, displayToken } from "./move-token";
import { useStepContext } from "./step-context";

/** Inline color swatch, used when the text names a sticker color. */
export const Swatch = ({ color }: { color: ColorName }) => (
  <span
    className="mx-0.5 inline-block h-3 w-3 -translate-y-px rounded-[4px] align-middle ring-1 ring-inset ring-black/10"
    style={{ backgroundColor: STICKER_COLORS[color] }}
    aria-label={color}
  />
);

/** Inline move notation that reads as a keycap instead of vanishing into prose. */
export const M = ({ children }: { children: string }) => (
  <span className="mx-px inline-block rounded-md bg-zinc-100 px-1.5 py-px align-baseline font-mono text-[0.9em] font-semibold text-zinc-800">
    {displayToken(children)}
  </span>
);

/** A physical keyboard key, for shortcut hints. */
export const Kbd = ({ children }: { children: string }) => (
  <kbd className="inline-block rounded-md border border-zinc-300 bg-white px-1.5 py-px align-baseline font-mono text-[10px] font-semibold leading-4 text-zinc-600 shadow-[0_1px_0_rgba(24,24,27,0.08)]">
    {children}
  </kbd>
);

export const Tip = ({ children }: { children: React.ReactNode }) => (
  <aside className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600">
    <LightbulbIcon size={16} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
    <div className="space-y-2">{children}</div>
  </aside>
);

type TryMoveProps = {
  token: string;
  /** Short meaning shown next to the letter, e.g. "up - the top". */
  label: string;
};

/**
 * A tappable move card for concept steps: pressing it performs the move on
 * the live cube immediately, so learners can feel each turn instead of
 * watching a demo.
 */
export const TryMove = ({ token, label }: TryMoveProps) => (
  <button
    type="button"
    onClick={() => useCubeStore.getState().userMove(viewAdjustedMove(token))}
    aria-label={`Turn: ${token}, ${label}`}
    className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-left transition-[border-color,box-shadow,transform] duration-150 hover:border-zinc-300 hover:shadow-sm active:scale-[0.96]"
  >
    <span className="flex w-8 shrink-0 flex-col items-center gap-0.5">
      <span className="font-mono text-2xl font-semibold leading-none text-zinc-900">
        {displayToken(token)}
      </span>
      <DirectionGlyph token={token} className="text-zinc-400" />
    </span>
    <span className="text-xs leading-tight text-zinc-500 transition-colors duration-150 group-hover:text-zinc-700">
      {label}
    </span>
  </button>
);

type PlayChipProps = {
  alg: string;
  label: string;
  pace?: number;
};

/**
 * A lightweight play button for concept demos that are not solve steps:
 * no snapshots, no token strip, just "press and watch the cube".
 */
export const PlayChip = ({ alg, label, pace }: PlayChipProps) => {
  const { step } = useStepContext();
  const programId = `${step.id}::try`;
  const playing = useCubeStore(
    (s) => s.program?.id === programId && s.program.status === "playing",
  );

  const onClick = () => {
    const store = useCubeStore.getState();
    if (playing) {
      store.pause();
      return;
    }
    if (store.program?.id !== programId) {
      store.loadProgram(programId, alg, { pace });
    }
    store.play();
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-white py-2 pl-2.5 pr-4 transition-[border-color,box-shadow,transform] duration-150 hover:border-zinc-300 hover:shadow-sm active:scale-[0.97]"
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-zinc-50 transition-colors duration-150 group-hover:bg-zinc-700">
        {playing ? (
          <PauseIcon size={12} weight="fill" />
        ) : (
          <PlayIcon size={12} weight="fill" className="translate-x-px" />
        )}
      </span>
      <span className="text-sm font-medium text-zinc-900">{label}</span>
    </button>
  );
};

/** Scramble button for the free-play ending. */
export const ScrambleChip = () => (
  <button
    type="button"
    onClick={() => useCubeStore.getState().scramble()}
    className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:border-zinc-300 hover:shadow-sm active:scale-[0.98]"
  >
    <ShuffleIcon size={15} weight="bold" />
    Scramble the cube
  </button>
);
