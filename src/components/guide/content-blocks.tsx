"use client";

import { LightbulbIcon, ShuffleIcon } from "@phosphor-icons/react";
import { STICKER_COLORS } from "@/lib/colors";
import type { ColorName } from "@/lib/cube";
import { useCubeStore } from "@/store/cube-store";
import { displayToken } from "./move-token";

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

export const Tip = ({ children }: { children: React.ReactNode }) => (
  <aside className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600">
    <LightbulbIcon size={16} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
    <div className="space-y-2">{children}</div>
  </aside>
);

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
