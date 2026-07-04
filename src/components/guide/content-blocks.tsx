"use client";

import { LightbulbIcon, PlayIcon, ShuffleIcon } from "@phosphor-icons/react";
import { STICKER_COLORS } from "@/lib/colors";
import { algTokens } from "@/lib/cube";
import type { ColorName } from "@/lib/cube";
import { useCubeStore } from "@/store/cube-store";
import { AlgTokens } from "./alg-tokens";
import { useStepContext } from "./step-context";

/** Inline color swatch, used when the text names a sticker color. */
export const Swatch = ({ color }: { color: ColorName }) => (
  <span
    className="mx-0.5 inline-block h-3 w-3 -translate-y-px rounded-[4px] align-middle ring-1 ring-inset ring-black/10"
    style={{ backgroundColor: STICKER_COLORS[color] }}
    aria-label={color}
  />
);

export const Tip = ({ children }: { children: React.ReactNode }) => (
  <aside className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600">
    <LightbulbIcon size={16} weight="fill" className="mt-0.5 shrink-0 text-zinc-400" />
    <div className="space-y-2">{children}</div>
  </aside>
);

type AlgChipProps = {
  alg: string;
  /** Optional display tokens when they differ from the alg (e.g. hiding rotations). */
  tokens?: string[];
  label?: string;
  pace?: number;
};

/** A live algorithm: click to watch it play on the cube from this step's start state. */
export const AlgChip = ({ alg, tokens, label, pace }: AlgChipProps) => {
  const { step, setupState } = useStepContext();
  const programId = `${step.id}::${alg}`;
  const program = useCubeStore((s) => s.program);
  const isMine = program?.id === programId;
  const cursor = isMine && !program.dirty ? program.cursor : -1;

  return (
    <button
      type="button"
      onClick={() => {
        const store = useCubeStore.getState();
        store.snapTo(setupState);
        store.loadProgram(programId, alg, {
          autoplay: true,
          pace,
          tokens: tokens ?? algTokens(alg),
        });
      }}
      className="group inline-flex w-fit items-center gap-2.5 rounded-xl border border-zinc-200 bg-white py-2 pl-3 pr-4 text-left transition hover:border-zinc-300 hover:shadow-sm active:scale-[0.98]"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-zinc-50 transition group-hover:bg-zinc-700">
        <PlayIcon size={11} weight="fill" />
      </span>
      <span className="flex flex-col gap-0.5">
        {label && <span className="text-xs text-zinc-500">{label}</span>}
        <AlgTokens tokens={tokens ?? algTokens(alg)} cursor={cursor} />
      </span>
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
