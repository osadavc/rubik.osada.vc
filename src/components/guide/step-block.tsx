"use client";

import { useMemo } from "react";
import type { CubeState } from "@/lib/cube";
import type { GuideStep } from "@/lib/guides/types";
import { StepContext } from "./step-context";
import { YourTurn } from "./your-turn";

type StepBlockProps = {
  step: GuideStep;
  setupState: CubeState;
  isActive: boolean;
  registerStep: (id: string, el: HTMLElement | null) => void;
  onSolved: (stepId: string) => void;
};

export const StepBlock = ({
  step,
  setupState,
  isActive,
  registerStep,
  onSolved,
}: StepBlockProps) => {
  const contextValue = useMemo(
    () => ({ step, setupState, isActive }),
    [step, setupState, isActive],
  );

  return (
    <StepContext.Provider value={contextValue}>
      <section
        data-step-id={step.id}
        ref={(el) => registerStep(step.id, el)}
        className={`scroll-mt-[46dvh] space-y-5 py-14 transition-opacity duration-500 motion-reduce:transition-none lg:scroll-mt-32 lg:py-20 ${
          isActive ? "opacity-100" : "opacity-40"
        }`}
      >
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{step.title}</h3>
        <div className="space-y-5 text-[15px] leading-relaxed text-zinc-600 [&_strong]:font-semibold [&_strong]:text-zinc-900">
          {step.content}
        </div>
        {step.interaction === "execute" && <YourTurn onSolved={onSolved} />}
      </section>
    </StepContext.Provider>
  );
};
