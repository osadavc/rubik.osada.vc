"use client";

import { CaretLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { CubeViewport } from "@/components/cube/cube-viewport";
import { algTokens, stateAfter } from "@/lib/cube";
import type { Guide } from "@/lib/guides/types";
import { guideSteps } from "@/lib/guides/types";
import { useCubeStore } from "@/store/cube-store";
import { PlaybackControls, WhenProgramLoaded } from "./playback-controls";
import { StepBlock } from "./step-block";
import { useActiveStep } from "./use-active-step";

const ACTIVATION_DEBOUNCE_MS = 160;
const AUTOPLAY_DELAY_MS = 550;

export const GuideView = ({ guide }: { guide: Guide }) => {
  const steps = useMemo(() => guideSteps(guide), [guide]);
  const stepIds = useMemo(() => steps.map((s) => s.id), [steps]);
  const setupStates = useMemo(
    () => new Map(steps.map((step) => [step.id, stateAfter(step.setup ?? "")])),
    [steps]
  );
  const { activeId, registerStep } = useActiveStep(stepIds);

  const activationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Drop any legacy step hash from the URL without restoring scroll position.
  useEffect(() => {
    if (!window.location.hash) return;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}`,
    );
  }, []);

  // Drive the cube from the active step.
  useEffect(() => {
    if (!activeId) return;
    if (activationTimer.current) clearTimeout(activationTimer.current);
    if (autoplayTimer.current) clearTimeout(autoplayTimer.current);

    activationTimer.current = setTimeout(() => {
      const step = steps.find((s) => s.id === activeId);
      const setup = setupStates.get(activeId);
      if (!step || !setup) return;
      const store = useCubeStore.getState();

      store.snapTo(setup);
      store.setHighlight(step.highlight ?? null);
      store.setCameraTarget(step.camera ?? null);

      if (step.demo) {
        store.loadProgram(step.id, step.demo, {
          pace: step.pace,
          tokens: step.demoTokens ?? algTokens(step.demo),
        });
        const shouldAutoplay =
          step.autoplay !== false &&
          step.interaction !== "execute" &&
          !store.reducedMotion;
        if (shouldAutoplay) {
          autoplayTimer.current = setTimeout(
            () => useCubeStore.getState().play(),
            AUTOPLAY_DELAY_MS
          );
        }
      } else {
        store.clearProgram();
      }
    }, ACTIVATION_DEBOUNCE_MS);

    return () => {
      if (activationTimer.current) clearTimeout(activationTimer.current);
      if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
    };
  }, [activeId, steps, setupStates]);

  const scrollToStep = useCallback((stepId: string, behavior: ScrollBehavior) => {
    document
      .querySelector<HTMLElement>(`[data-step-id="${stepId}"]`)
      ?.scrollIntoView({ behavior, block: "center" });
  }, []);

  const advanceFrom = useCallback(
    (stepId: string) => {
      const index = stepIds.indexOf(stepId);
      const nextId = stepIds[index + 1];
      if (!nextId) return;
      const reduced = useCubeStore.getState().reducedMotion;
      setTimeout(
        () => scrollToStep(nextId, reduced ? "auto" : "smooth"),
        1300,
      );
    },
    [stepIds, scrollToStep],
  );

  const activeChapter = useMemo(() => {
    if (!activeId) return guide.chapters[0];
    return (
      guide.chapters.find((c) => c.steps.some((s) => s.id === activeId)) ??
      guide.chapters[0]
    );
  }, [guide, activeId]);

  return (
    <div className="min-h-dvh">
      <header className="flex h-14 items-center justify-between px-5 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 transition hover:text-zinc-900"
        >
          <CaretLeftIcon size={14} weight="bold" />
          All guides
        </Link>
        <span className="text-sm font-medium text-zinc-900">{guide.title}</span>
        <span aria-hidden className="w-16" />
      </header>

      <div className="mx-auto max-w-[90rem] lg:grid lg:grid-cols-2">
        {/* Cube panel: pinned top on mobile, full-height left column on desktop. */}
        <div className="sticky top-0 z-20 flex h-[44dvh] flex-col border-b border-zinc-200/80 bg-[var(--background)] shadow-[0_8px_24px_-20px_rgba(24,24,27,0.4)] lg:h-dvh lg:border-b-0 lg:shadow-none">
          <div className="min-h-0 flex-1">
            <CubeViewport />
          </div>
          <div className="hidden pb-6 lg:block">
            <PlaybackControls />
          </div>
        </div>

        {/* Lesson content. */}
        <div className="px-5 pb-32 sm:px-8 lg:px-12 lg:pb-12">
          {/* Chapter rail, desktop only. */}
          <div className="sticky top-0 z-10 hidden border-b border-zinc-100 bg-[var(--background)] lg:block">
            <div className="flex items-baseline justify-between py-3.5">
              <span className="text-sm font-medium text-zinc-900">
                {activeChapter.title}
              </span>
              <span className="text-xs tabular-nums text-zinc-400">
                Chapter {guide.chapters.indexOf(activeChapter) + 1} of{" "}
                {guide.chapters.length}
              </span>
            </div>
          </div>

          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-[34rem]">
            {guide.chapters.map((chapter) => (
              <div key={chapter.id}>
                <div className="pt-20 lg:pt-28">
                  <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
                    {chapter.title}
                  </h2>
                  <p className="mt-2.5 text-[15px] leading-relaxed text-zinc-500">
                    {chapter.summary}
                  </p>
                </div>
                {chapter.steps.map((step) => (
                  <StepBlock
                    key={step.id}
                    step={step}
                    setupState={setupStates.get(step.id)!}
                    isActive={activeId === step.id}
                    registerStep={registerStep}
                    onSolved={advanceFrom}
                  />
                ))}
              </div>
            ))}
            <footer className="flex items-center justify-between border-t border-zinc-200 py-10">
              <Link
                href="/"
                className="text-sm text-zinc-500 transition hover:text-zinc-900"
              >
                Back to all guides
              </Link>
            </footer>
          </div>
        </div>
      </div>

      {/* Mobile playback controls, floating at the bottom of the screen. */}
      <WhenProgramLoaded>
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center lg:hidden">
          <div className="pointer-events-auto rounded-2xl border border-zinc-200 bg-white/95 px-3 py-1.5 shadow-lg shadow-zinc-900/5 backdrop-blur">
            <PlaybackControls />
          </div>
        </div>
      </WhenProgramLoaded>
    </div>
  );
};
