"use client";

import { CaretLeftIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { CubeViewport } from "@/components/cube/cube-viewport";
import { algTokens, stateAfter } from "@/lib/cube";
import type { Guide } from "@/lib/guides/types";
import { guideSteps } from "@/lib/guides/types";
import { useCubeStore } from "@/store/cube-store";
import { ChapterRail, ContentsList } from "./chapter-nav";
import { PlaybackControls, WhenProgramLoaded } from "./playback-controls";
import { StepBlock } from "./step-block";
import { useActiveStep } from "./use-active-step";

const ACTIVATION_DEBOUNCE_MS = 160;
const AUTOPLAY_DELAY_MS = 550;

const DIFFICULTY_LABEL = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
} as const;

const pad = (n: number) => String(n).padStart(2, "0");

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

  const activeChapterIndex = useMemo(() => {
    if (!activeId) return 0;
    const index = guide.chapters.findIndex((c) =>
      c.steps.some((s) => s.id === activeId),
    );
    return index === -1 ? 0 : index;
  }, [guide, activeId]);

  const progress = useMemo(() => {
    const index = activeId ? stepIds.indexOf(activeId) : 0;
    return (Math.max(index, 0) + 1) / stepIds.length;
  }, [activeId, stepIds]);

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-[var(--background)]/85 backdrop-blur-md">
        <div className="relative flex h-12 items-center justify-between px-4 sm:px-6 lg:h-14">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-500 transition-colors duration-150 hover:text-zinc-900"
          >
            <CaretLeftIcon
              size={12}
              weight="bold"
              className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
            />
            All guides
          </Link>
          {/* Keyed remount + starting-style gives a soft swap when the chapter changes. */}
          <span
            key={activeChapterIndex}
            className="absolute left-1/2 max-w-[38%] -translate-x-1/2 truncate text-[13px] font-medium text-zinc-900 transition-[opacity,filter] duration-300 ease-out starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none"
          >
            {guide.chapters[activeChapterIndex].title}
          </span>
          <span
            className="text-xs tabular-nums text-zinc-400"
            aria-label={`Chapter ${activeChapterIndex + 1} of ${guide.chapters.length}`}
          >
            <span className="font-medium text-zinc-900">
              {pad(activeChapterIndex + 1)}
            </span>
            <span aria-hidden> / {pad(guide.chapters.length)}</span>
          </span>
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-zinc-900 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ transform: `scaleX(${progress})` }}
        />
      </header>

      <ChapterRail chapters={guide.chapters} activeIndex={activeChapterIndex} />

      <div className="mx-auto max-w-[90rem] lg:grid lg:grid-cols-2">
        {/* Cube panel: pinned below the header on mobile, full-height left column on desktop. */}
        <div className="sticky top-12 z-20 flex h-[42dvh] flex-col border-b border-zinc-200/80 bg-[var(--background)] shadow-[0_8px_24px_-20px_rgba(24,24,27,0.4)] lg:top-14 lg:h-[calc(100dvh-3.5rem)] lg:border-b-0 lg:shadow-none">
          <div className="min-h-0 flex-1">
            <CubeViewport interactive={false} />
          </div>
          <div className="hidden pb-6 lg:block">
            <PlaybackControls />
          </div>
        </div>

        {/* Lesson content. */}
        <div className="px-5 pb-28 sm:px-8 lg:px-12 lg:pb-16">
          <div className="mx-auto max-w-xl lg:mx-0 lg:max-w-[34rem]">
            {/* Guide lede: title, meta, and table of contents. */}
            <header className="pt-14 lg:pt-20">
              <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-zinc-400">
                <span>{guide.puzzle.replace("x", "\u00d7")}</span>
                <span aria-hidden className="text-zinc-300">
                  &middot;
                </span>
                <span>{DIFFICULTY_LABEL[guide.difficulty]}</span>
                <span aria-hidden className="text-zinc-300">
                  &middot;
                </span>
                <span>About {guide.estMinutes} min</span>
                <span aria-hidden className="text-zinc-300">
                  &middot;
                </span>
                <span>{guide.chapters.length} chapters</span>
              </p>
              <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900">
                {guide.title}
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-zinc-500">
                {guide.tagline}
              </p>
              <ContentsList chapters={guide.chapters} />
            </header>

            {guide.chapters.map((chapter, chapterIndex) => (
              <section key={chapter.id} className="pt-16 lg:pt-24">
                <div
                  data-chapter-id={chapter.id}
                  className="scroll-mt-[calc(42dvh+4rem)] lg:scroll-mt-24"
                >
                  <div className="flex items-center gap-4">
                    <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
                      Chapter{" "}
                      <span className="tabular-nums">
                        {pad(chapterIndex + 1)}
                      </span>
                    </span>
                    <span aria-hidden className="h-px flex-1 bg-zinc-200" />
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900">
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
                  />
                ))}
              </section>
            ))}

            <footer className="mt-8 flex items-center justify-between border-t border-zinc-200 py-10">
              <Link
                href="/"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors duration-150 hover:text-zinc-900"
              >
                <CaretLeftIcon
                  size={12}
                  weight="bold"
                  className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5"
                />
                All guides
              </Link>
              <a
                href="https://osada.vc"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-400 transition-colors duration-150 hover:text-zinc-900"
              >
                osada.vc
              </a>
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
