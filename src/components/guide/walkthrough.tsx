"use client";

import {
  ArrowCounterClockwiseIcon,
  PauseIcon,
  PlayIcon,
  SkipBackIcon,
  SkipForwardIcon,
} from "@phosphor-icons/react";
import { algTokens } from "@/lib/cube";
import { useCubeStore } from "@/store/cube-store";
import { CubeSnapshot } from "./cube-snapshot";
import { describeMove, displayToken, MoveToken, type TokenState } from "./move-token";
import { useStepContext } from "./step-context";

const controlClass =
  "flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-[background-color,color,transform] duration-150 enabled:hover:bg-zinc-200/70 enabled:hover:text-zinc-900 enabled:active:scale-95 disabled:opacity-30";

type TokenStripProps = {
  tokens: readonly string[];
  /** Index of the next move to play; -1 renders every token as upcoming. */
  cursor: number;
  onSeek?: (index: number) => void;
};

/** Row of large move tokens; click one to jump the cube to that exact move. */
export const TokenStrip = ({ tokens, cursor, onSeek }: TokenStripProps) => (
  <div className="flex flex-wrap items-center gap-1.5">
    {tokens.map((token, i) => {
      const state: TokenState =
        cursor < 0 ? "upcoming" : i < cursor ? "done" : i === cursor ? "current" : "upcoming";
      return (
        <MoveToken
          key={`${token}-${i}`}
          token={token}
          state={state}
          onClick={onSeek ? () => onSeek(i) : undefined}
        />
      );
    })}
  </div>
);

/**
 * The step's demonstration: where the cube starts, where it ends up, and the
 * moves in between as large scrubbable tokens. Nothing plays until the
 * learner asks it to.
 */
export const Walkthrough = () => {
  const { step, setupState } = useStepContext();
  const program = useCubeStore((s) => s.program);
  const speed = useCubeStore((s) => s.speed);

  if (!step.demo) return null;
  const demo = step.demo;
  const tokens = step.demoTokens ?? algTokens(demo);
  const isMine = program?.id === step.id;
  const dirty = isMine && program.dirty;
  const cursor = isMine && !dirty ? program.cursor : 0;
  const playing = isMine && program.status === "playing";
  const finished = isMine && !dirty && cursor >= tokens.length;
  const started = isMine && !dirty && (cursor > 0 || playing);

  /** Make sure this step's program drives the cube before any control acts. */
  const ensureProgram = () => {
    const store = useCubeStore.getState();
    if (store.program?.id === step.id && !store.program.dirty) return;
    store.snapTo(setupState);
    store.loadProgram(step.id, demo, { pace: step.pace, tokens: [...tokens] });
  };

  const onPlay = () => {
    ensureProgram();
    useCubeStore.getState().play();
  };

  const onSeek = (index: number) => {
    ensureProgram();
    useCubeStore.getState().seekTo(index, { playMove: true });
  };

  const currentIndex = Math.min(cursor, tokens.length - 1);
  const note = step.demoNotes?.[currentIndex] ?? describeMove(tokens[currentIndex]);
  const nextSpeed = speed === 1 ? 0.5 : speed === 0.5 ? 1.5 : 1;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      {/* Before and after: see the destination before a single move plays. */}
      <div className="flex items-center justify-center gap-4 border-b border-zinc-100 px-5 py-4 sm:gap-8">
        <CubeSnapshot
          setup={step.setup ?? ""}
          mask={step.highlight}
          spotlight={step.spotlight}
          caption="Now"
        />
        <span aria-hidden className="flex flex-col items-center gap-1 text-zinc-300">
          <svg width="34" height="8" viewBox="0 0 34 8" fill="none">
            <path
              d="M0 4h31m0 0-3.4-3M31 4l-3.4 3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-mono text-[10px] tracking-wide text-zinc-400">
            {tokens.length} {tokens.length === 1 ? "move" : "moves"}
          </span>
        </span>
        <CubeSnapshot
          setup={`${step.setup ?? ""} ${demo}`}
          mask={step.highlight}
          spotlight={step.spotlight}
          caption="After"
        />
      </div>

      <div className="px-5 pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-[13px] font-medium leading-none text-zinc-500">
            The moves
          </p>
          <p className="text-xs tabular-nums text-zinc-400">
            {started || finished ? (
              <>
                <span className="font-medium text-zinc-900">
                  {Math.min(cursor + (finished ? 0 : 1), tokens.length)}
                </span>{" "}
                / {tokens.length}
              </>
            ) : (
              "tap a move to jump to it"
            )}
          </p>
        </div>
        <div className="mt-3">
          <TokenStrip tokens={tokens} cursor={isMine && !dirty ? cursor : -1} onSeek={onSeek} />
        </div>
        {/* Fixed-height note so the block never jumps while scrubbing. */}
        <div className="flex min-h-[3.25rem] items-center py-2.5">
          <p
            key={dirty ? "dirty" : finished ? "finished" : currentIndex}
            className="text-sm leading-relaxed text-zinc-600 transition-[opacity,filter] duration-300 ease-out starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none"
          >
            {dirty ? (
              "You turned the cube mid-demo. Restart to watch it clean."
            ) : finished ? (
              "That is the whole sequence. Replay it, or tap any move to study it again."
            ) : (
              <>
                <span className="font-mono font-semibold text-zinc-900">
                  {displayToken(tokens[currentIndex])}
                </span>
                <span aria-hidden className="mx-2 text-zinc-300">
                  &middot;
                </span>
                {note}
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/60 px-3 py-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            className={controlClass}
            onClick={() => {
              ensureProgram();
              useCubeStore.getState().restartProgram();
            }}
            disabled={!started && !finished && !dirty}
            aria-label="Restart demonstration"
          >
            <ArrowCounterClockwiseIcon size={15} weight="bold" />
          </button>
          <button
            type="button"
            className={controlClass}
            onClick={() => {
              ensureProgram();
              useCubeStore.getState().stepBackward();
            }}
            disabled={!isMine || dirty || cursor === 0}
            aria-label="Step back one move"
          >
            <SkipBackIcon size={15} weight="fill" />
          </button>
          <button
            type="button"
            className="mx-1 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-zinc-700 active:scale-95"
            onClick={playing ? () => useCubeStore.getState().pause() : onPlay}
            aria-label={playing ? "Pause" : finished ? "Replay" : "Play the moves"}
          >
            {playing ? (
              <PauseIcon size={16} weight="fill" />
            ) : (
              <PlayIcon size={16} weight="fill" className="translate-x-px" />
            )}
          </button>
          <button
            type="button"
            className={controlClass}
            onClick={() => {
              ensureProgram();
              useCubeStore.getState().stepForward();
            }}
            disabled={dirty || finished}
            aria-label="Step forward one move"
          >
            <SkipForwardIcon size={15} weight="fill" />
          </button>
        </div>
        <button
          type="button"
          className="h-8 rounded-full px-2.5 font-mono text-xs text-zinc-500 transition-colors duration-150 hover:bg-zinc-200/70 hover:text-zinc-900"
          onClick={() => useCubeStore.getState().setSpeed(nextSpeed)}
          aria-label={`Playback speed ${speed}x, click to change`}
        >
          {speed}x
        </button>
      </div>
    </div>
  );
};
