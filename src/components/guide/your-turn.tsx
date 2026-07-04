"use client";

import { ArrowCounterClockwiseIcon, HandGrabbingIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { algTokens } from "@/lib/cube";
import { useCubeStore } from "@/store/cube-store";
import { useStepContext } from "./step-context";

export const YourTurn = () => {
  const { step, setupState } = useStepContext();
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 p-5">
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
    </div>
  );
};
