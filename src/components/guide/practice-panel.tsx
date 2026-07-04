"use client";

import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  HandGrabbingIcon,
  LightbulbIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { algTokens, stateAfter } from "@/lib/cube";
import type { PracticeDrill } from "@/lib/guides/types";
import { useCubeStore } from "@/store/cube-store";
import { CubeSnapshot } from "./cube-snapshot";
import { useStepContext } from "./step-context";
import { TokenStrip } from "./walkthrough";

const ghostButton =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-[background-color,color,transform] duration-150 hover:bg-zinc-100 hover:text-zinc-900 active:scale-95";

/**
 * The hands-on block of a practice step. Shows where the cube starts and
 * where it must end, then hands the cube over. While a session runs, the
 * rest of the lesson dims so the cube and this panel are all that matter.
 */
export const PracticePanel = () => {
  const { step, setupState } = useStepContext();
  const practice = useCubeStore((s) => s.practice);
  const program = useCubeStore((s) => s.program);
  const [showHint, setShowHint] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const drills: PracticeDrill[] = step.drills ?? [
    { setup: step.setup ?? "", label: "Drill 1" },
  ];
  const isMine = practice?.stepId === step.id;
  const drillIndex = isMine ? Math.min(practice.drillIndex, drills.length - 1) : 0;
  const drill = drills[drillIndex];
  const solved = isMine && practice.status === "solved";

  const solutionProgramId = `${step.id}::solution`;
  const showingSolution = program?.id === solutionProgramId && !program.dirty;

  /** Prepare the cube for a drill and (re)start the session counters. */
  const beginDrill = (index: number) => {
    const store = useCubeStore.getState();
    const target = drills[index];
    store.snapTo(index === 0 && !step.drills ? setupState : stateAfter(target.setup));
    store.clearProgram();
    store.setHighlight(step.highlight ?? null);
    store.setSpotlight(null);
    if (step.camera) store.setCameraTarget(step.camera);
    if (store.practice?.stepId === step.id) store.setPracticeDrill(index);
    else store.startPractice(step.id, index);
    setShowHint(false);
    panelRef.current?.scrollIntoView({
      behavior: store.reducedMotion ? "auto" : "smooth",
      block: "nearest",
    });
  };

  // Watch the cube while this session is active; any state that satisfies
  // the goal ends the attempt and fires the celebration wave.
  useEffect(() => {
    if (!isMine || !step.goal) return;
    return useCubeStore.subscribe((cur, prev) => {
      if (cur.state === prev.state) return;
      if (cur.practice?.stepId !== step.id || cur.practice.status !== "active") return;
      if (cur.queue.length > 0 || cur.anim) return;
      if (step.goal!(cur.state)) useCubeStore.getState().practiceSolved();
    });
  }, [isMine, step]);

  const goalSetup = drill.solution ? `${drill.setup} ${drill.solution}` : null;

  return (
    <div
      ref={panelRef}
      className={`overflow-hidden rounded-2xl border transition-[border-color,box-shadow] duration-300 ${
        isMine
          ? "border-zinc-900/20 shadow-[0_12px_40px_-16px_rgba(24,24,27,0.35)]"
          : "border-zinc-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3 px-5 pt-4">
        <div className="flex items-start gap-2.5">
          <HandGrabbingIcon
            size={17}
            weight="bold"
            className="mt-0.5 shrink-0 text-zinc-400"
          />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
              Your turn
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-900">
              {step.goalText ?? "Reach the goal shown below."}
            </p>
          </div>
        </div>
        {isMine && (
          <button
            type="button"
            onClick={() => useCubeStore.getState().endPractice()}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-zinc-400 transition-colors duration-150 hover:bg-zinc-100 hover:text-zinc-900"
            aria-label="End practice"
          >
            <XIcon size={14} weight="bold" />
          </button>
        )}
      </div>

      {/* Drill switcher, once there is more than one scramble to try. */}
      {isMine && drills.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-1.5 px-5">
          {drills.map((d, i) => (
            <button
              key={d.label}
              type="button"
              onClick={() => beginDrill(i)}
              aria-current={i === drillIndex ? "true" : undefined}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-[background-color,border-color,color] duration-150 ${
                i === drillIndex
                  ? "border-zinc-900 bg-zinc-900 text-zinc-50"
                  : "border-zinc-200 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 px-5 py-4 sm:gap-8">
        <CubeSnapshot setup={drill.setup} mask={step.highlight} caption="Start" />
        <span aria-hidden className="flex flex-col items-center gap-1 text-zinc-300">
          <svg width="34" height="8" viewBox="0 0 34 8" fill="none">
            <path
              d="M0 4h31m0 0-3.4-3M31 4l-3.4 3"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
          <span className="font-mono text-[10px] tracking-wide text-zinc-400">you</span>
        </span>
        {goalSetup ? (
          <CubeSnapshot setup={goalSetup} mask={step.highlight} caption="Goal" />
        ) : (
          <p className="max-w-40 text-center text-xs leading-relaxed text-zinc-500">
            {step.goalText}
          </p>
        )}
      </div>

      {!isMine ? (
        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={() => beginDrill(0)}
            className="w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-zinc-700 active:scale-[0.985]"
          >
            Start practicing
          </button>
          {drills.length > 1 && (
            <p className="mt-2.5 text-center text-xs text-zinc-400">
              {drills.length} scrambles to try
            </p>
          )}
        </div>
      ) : solved ? (
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-4 transition-[opacity,filter] duration-500 ease-out starting:opacity-0 starting:blur-[3px] motion-reduce:transition-none">
          <div className="flex items-center gap-2.5">
            <CheckCircleIcon size={20} weight="fill" className="shrink-0 text-emerald-600" />
            <p className="text-sm font-medium text-zinc-900">
              {practice.assisted
                ? "Solved, with a little help. Run it once more on your own."
                : `Solved in ${practice.moveCount} ${practice.moveCount === 1 ? "move" : "moves"}.`}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => beginDrill(drillIndex)}
              className="rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-50 transition-[background-color,transform] duration-150 hover:bg-zinc-700 active:scale-95"
            >
              {practice.assisted ? "Try it solo" : "Again"}
            </button>
            {drills.length > 1 && (
              <button
                type="button"
                onClick={() => beginDrill((drillIndex + 1) % drills.length)}
                className="rounded-lg border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-900 transition-[border-color,transform] duration-150 hover:border-zinc-300 active:scale-95"
              >
                Next scramble
              </button>
            )}
            <button
              type="button"
              onClick={() => useCubeStore.getState().endPractice()}
              className={ghostButton}
            >
              Keep going
            </button>
          </div>
        </div>
      ) : (
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-3.5">
          {showHint && drill.hint && (
            <p className="mb-3 flex gap-2 text-sm leading-relaxed text-zinc-600 transition-[opacity,filter] duration-300 ease-out starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none">
              <LightbulbIcon
                size={15}
                weight="fill"
                className="mt-0.5 shrink-0 text-amber-500"
              />
              {drill.hint}
            </p>
          )}
          {showingSolution && program && (
            <div className="mb-3">
              <TokenStrip
                tokens={program.tokens}
                cursor={program.cursor}
                onSeek={(i) => useCubeStore.getState().seekTo(i, { playMove: true })}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              <button type="button" onClick={() => beginDrill(drillIndex)} className={ghostButton}>
                <ArrowCounterClockwiseIcon size={13} weight="bold" />
                Reset
              </button>
              {drill.hint && !showHint && (
                <button type="button" onClick={() => setShowHint(true)} className={ghostButton}>
                  Hint
                </button>
              )}
              {drill.solution && !showingSolution && (
                <button
                  type="button"
                  onClick={() => {
                    const store = useCubeStore.getState();
                    store.snapTo(stateAfter(drill.setup));
                    store.markPracticeAssisted();
                    store.loadProgram(solutionProgramId, drill.solution!, {
                      autoplay: true,
                      pace: 0.55,
                      tokens: algTokens(drill.solution!),
                    });
                  }}
                  className={ghostButton}
                >
                  Show me
                </button>
              )}
            </div>
            <p className="text-xs tabular-nums text-zinc-400">
              {practice.moveCount} {practice.moveCount === 1 ? "move" : "moves"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
