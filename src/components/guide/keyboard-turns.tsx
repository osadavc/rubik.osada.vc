"use client";

import { useEffect, useRef } from "react";
import { useCubeStore, viewAdjustedMove } from "@/store/cube-store";
import { Kbd } from "./content-blocks";

const TURN_KEYS = "UDLRFB";

/**
 * Keyboard turns, matching notation exactly: press a face letter for a
 * clockwise quarter turn, hold Shift for the prime (counterclockwise) turn.
 * Faces are view-relative, and turns obey the same lock as dragging;
 * refused presses nudge the hint pill.
 */
export const useKeyboardTurns = () => {
  const installed = useRef(false);

  useEffect(() => {
    if (installed.current) return;
    installed.current = true;

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (event.key.length !== 1) return;
      const letter = event.key.toUpperCase();
      if (!TURN_KEYS.includes(letter)) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("dialog, input, textarea, select, [contenteditable]")) return;

      const store = useCubeStore.getState();
      if (!store.canTurn()) {
        store.nudgeLock();
        return;
      }
      store.userMove(viewAdjustedMove(event.shiftKey ? `${letter}'` : letter));
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      installed.current = false;
    };
  }, []);
};

/**
 * The one keyboard legend, docked under the cube. Appears only while
 * turning is actually allowed, so its presence doubles as the "you may
 * turn now" signal.
 */
export const KeyboardHint = () => {
  const canTurn = useCubeStore((s) => s.practice !== null || !s.turnLocked);
  if (!canTurn) return null;
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-[11px] text-zinc-400 transition-[opacity,filter] duration-300 ease-out starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none">
      <span className="inline-flex gap-0.5">
        {["F", "R", "U", "L", "D", "B"].map((k) => (
          <Kbd key={k}>{k}</Kbd>
        ))}
      </span>
      <span>turn faces &middot;</span>
      <Kbd>Shift</Kbd>
      <span>
        = counterclockwise (&#8242;) &middot;{" "}
        <span className="font-mono font-semibold">F</span> is the side facing
        you
      </span>
    </p>
  );
};

/**
 * Transient pill over the cube shown when a turn was refused: explains that
 * the cube unlocks in practice blocks. Pure CSS timing (keyed remount plays
 * the fade-in/hold/fade-out animation), so no timers or state.
 */
export const LockNudge = () => {
  const nudgeAt = useCubeStore((s) => s.lockNudgeAt);
  if (!nudgeAt) return null;
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center">
      <p
        key={nudgeAt}
        className="animate-[lock-nudge_2.6s_ease-out_forwards] rounded-full border border-zinc-200 bg-white/95 px-3.5 py-1.5 text-xs font-medium text-zinc-600 shadow-lg shadow-zinc-900/10 backdrop-blur"
      >
        Watch for now — you turn the cube in{" "}
        <span className="font-semibold text-zinc-900">practice</span> blocks
      </p>
    </div>
  );
};
