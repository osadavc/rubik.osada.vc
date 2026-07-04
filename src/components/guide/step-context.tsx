"use client";

import { createContext, useContext } from "react";
import type { CubeState } from "@/lib/cube";
import type { GuideStep } from "@/lib/guides/types";

export type StepContextValue = {
  step: GuideStep;
  setupState: CubeState;
  isActive: boolean;
};

export const StepContext = createContext<StepContextValue | null>(null);

export const useStepContext = (): StepContextValue => {
  const value = useContext(StepContext);
  if (!value) throw new Error("Must be rendered inside a StepBlock");
  return value;
};
