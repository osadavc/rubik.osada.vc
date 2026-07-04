"use client";

import {
  ArrowCounterClockwiseIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@phosphor-icons/react";
import { useCubeStore } from "@/store/cube-store";
import { AlgTokens } from "./alg-tokens";

const controlClass =
  "flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 transition enabled:hover:bg-zinc-100 enabled:hover:text-zinc-900 enabled:active:scale-95 disabled:opacity-30";

/** Renders children only while a demo program is loaded. */
export const WhenProgramLoaded = ({ children }: { children: React.ReactNode }) => {
  const hasProgram = useCubeStore((s) => s.program !== null);
  return hasProgram ? <>{children}</> : null;
};

export const PlaybackControls = () => {
  const program = useCubeStore((s) => s.program);
  const speed = useCubeStore((s) => s.speed);
  const setSpeed = useCubeStore((s) => s.setSpeed);
  const play = useCubeStore((s) => s.play);
  const pause = useCubeStore((s) => s.pause);
  const stepForward = useCubeStore((s) => s.stepForward);
  const stepBackward = useCubeStore((s) => s.stepBackward);
  const restartProgram = useCubeStore((s) => s.restartProgram);

  const hasProgram = program !== null && program.moves.length > 0;
  const playing = program?.status === "playing";
  const atStart = !program || program.cursor === 0;
  const atEnd = !program || program.cursor >= program.moves.length;
  const dirty = program?.dirty ?? false;

  const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 0.5 : 1;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex min-h-7 items-center justify-center px-4">
        {hasProgram && (
          <AlgTokens tokens={program.tokens} cursor={dirty ? -1 : program.cursor} size="sm" />
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={controlClass}
          onClick={() => restartProgram()}
          disabled={!hasProgram || (atStart && !dirty)}
          aria-label="Restart demonstration"
        >
          <ArrowCounterClockwiseIcon size={16} weight="bold" />
        </button>
        <button
          type="button"
          className={controlClass}
          onClick={stepBackward}
          disabled={!hasProgram || atStart || dirty}
          aria-label="Step back one move"
        >
          <SkipBackIcon size={16} weight="fill" />
        </button>
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-zinc-50 transition enabled:hover:bg-zinc-700 enabled:active:scale-95 disabled:opacity-30"
          onClick={playing ? pause : play}
          disabled={!hasProgram}
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <PauseIcon size={18} weight="fill" />
          ) : (
            <PlayIcon size={18} weight="fill" />
          )}
        </button>
        <button
          type="button"
          className={controlClass}
          onClick={stepForward}
          disabled={!hasProgram || atEnd || dirty}
          aria-label="Step forward one move"
        >
          <SkipForwardIcon size={16} weight="fill" />
        </button>
        <button
          type="button"
          className="h-9 min-w-9 rounded-full px-2 font-mono text-xs text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
          onClick={() => setSpeed(nextSpeed)}
          aria-label={`Playback speed ${speed}x, click to change`}
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};
