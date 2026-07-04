"use client";

import { useMemo } from "react";
import type { CubeState } from "@/lib/cube";
import type { GuideStep } from "@/lib/guides/types";
import { stepKind } from "@/lib/guides/types";
import { useCubeStore } from "@/store/cube-store";
import { PracticePanel } from "./practice-panel";
import { StepContext } from "./step-context";
import { Walkthrough } from "./walkthrough";

const KIND_LABEL = {
  learn: "Learn",
  watch: "Watch",
  practice: "Practice",
} as const;

type StepBlockProps = {
  step: GuideStep;
  setupState: CubeState;
  isActive: boolean;
  registerStep: (id: string, el: HTMLElement | null) => void;
};

export const StepBlock = ({
  step,
  setupState,
  isActive,
  registerStep,
}: StepBlockProps) => {
  const practiceStepId = useCubeStore((s) => s.practice?.stepId ?? null);
  const contextValue = useMemo(
    () => ({ step, setupState, isActive }),
    [step, setupState, isActive],
  );

  const kind = stepKind(step);
  // Focus mode: while another step is being practiced, this one recedes.
  const dimmedByPractice = practiceStepId !== null && practiceStepId !== step.id;

  return (
    <StepContext.Provider value={contextValue}>
      <section
        data-step-id={step.id}
        ref={(el) => registerStep(step.id, el)}
        className={`scroll-mt-[calc(42dvh+3rem)] space-y-5 py-14 transition-[opacity,filter] duration-500 motion-reduce:transition-none lg:scroll-mt-32 lg:py-20 ${
          dimmedByPractice
            ? "pointer-events-none opacity-20 blur-[1.5px] select-none"
            : isActive
              ? "opacity-100"
              : "opacity-40"
        }`}
      >
        <div>
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${
                kind === "practice"
                  ? "bg-amber-500"
                  : kind === "watch"
                    ? "bg-zinc-900"
                    : "bg-zinc-300"
              }`}
            />
            {KIND_LABEL[kind]}
          </p>
          <h3 className="mt-2.5 text-xl font-semibold tracking-tight text-zinc-900">
            {step.title}
          </h3>
        </div>
        <div className="space-y-5 text-[15px] leading-relaxed text-zinc-600 [&_strong]:font-semibold [&_strong]:text-zinc-900">
          {step.content}
        </div>
        {step.demo && step.interaction !== "execute" && <Walkthrough />}
        {step.interaction === "execute" && <PracticePanel />}
      </section>
    </StepContext.Provider>
  );
};
