"use client";

import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  HandGrabbingIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { STICKER_COLORS } from "@/lib/colors";
import { algTokens } from "@/lib/cube";
import { useCubeStore } from "@/store/cube-store";
import { useStepContext } from "./step-context";

type YourTurnProps = {
  onSolved: (stepId: string) => void;
};

export const YourTurn = ({ onSolved }: YourTurnProps) => {
  const { step, setupState, isActive } = useStepContext();
  const [solvedNow, setSolvedNow] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const done = solvedNow;

  useEffect(() => {
    if (!isActive || done || !step.goal) return;
    const check = () => {
      const { state, anim, queue } = useCubeStore.getState();
      if (anim || queue.length > 0) return;
      if (step.goal!(state)) {
        setSolvedNow(true);
        onSolved(step.id);
      }
    };
    check();
    return useCubeStore.subscribe((cur, prev) => {
      if (cur.state !== prev.state) check();
    });
  }, [isActive, done, step, onSolved]);

  return (
    <div
      className={`space-y-4 rounded-2xl border p-5 transition-colors duration-500 ${
        solvedNow ? "border-transparent" : "border-zinc-200"
      }`}
      style={solvedNow ? { backgroundColor: `${STICKER_COLORS.green}14`, borderColor: `${STICKER_COLORS.green}55` } : undefined}
    >
      {done ? (
        <div className="flex items-center gap-2.5" style={{ color: "#2c7a44" }}>
          <CheckCircleIcon size={20} weight="fill" />
          <p className="text-sm font-medium">You did it. On to the next step.</p>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2.5 text-zinc-900">
            <HandGrabbingIcon size={18} weight="bold" className="mt-0.5 shrink-0 text-zinc-400" />
            <p className="text-sm font-medium leading-relaxed">
              Your turn: {step.goalText ?? "reach the goal shown above."}{" "}
              <span className="font-normal text-zinc-500">
                Drag any face of the cube to turn it.
              </span>
            </p>
          </div>
          {showHint && step.hint && (
            <p className="rounded-xl bg-zinc-50 p-3.5 text-sm leading-relaxed text-zinc-600">
              {step.hint}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const store = useCubeStore.getState();
                store.snapTo(setupState);
                store.clearProgram();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
            >
              <ArrowCounterClockwiseIcon size={13} weight="bold" />
              Reset
            </button>
            {step.hint && !showHint && (
              <button
                type="button"
                onClick={() => setShowHint(true)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
              >
                Hint
              </button>
            )}
            {step.solution && (
              <button
                type="button"
                onClick={() => {
                  const store = useCubeStore.getState();
                  store.snapTo(setupState);
                  store.loadProgram(`${step.id}::solution`, step.solution!, {
                    autoplay: true,
                    pace: 0.55,
                    tokens: algTokens(step.solution!),
                  });
                }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 active:scale-95"
              >
                Show me
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
