"use client";

import type { CSSProperties } from "react";
import type { GuideChapter } from "@/lib/guides/types";
import { useCubeStore } from "@/store/cube-store";

const scrollToChapter = (chapterId: string) => {
  const behavior: ScrollBehavior = useCubeStore.getState().reducedMotion
    ? "auto"
    : "smooth";
  document
    .querySelector<HTMLElement>(`[data-chapter-id="${chapterId}"]`)
    ?.scrollIntoView({ behavior, block: "start" });
};

const chapterNumber = (index: number) => String(index + 1).padStart(2, "0");

/** Numbered chapter index shown in the guide lede. */
export const ContentsList = ({ chapters }: { chapters: GuideChapter[] }) => {
  const rows = Math.ceil(chapters.length / 2);
  return (
    <nav aria-label="Guide contents" className="mt-12">
      <p className="text-[13px] font-medium leading-none text-zinc-500">
        Contents
      </p>
      <ol
        className="mt-3 grid border-t border-zinc-200 sm:grid-flow-col sm:grid-rows-[repeat(var(--toc-rows),auto)] sm:gap-x-10"
        style={{ "--toc-rows": rows } as CSSProperties}
      >
        {chapters.map((chapter, i) => (
          <li key={chapter.id} className="border-b border-zinc-200/70">
            <button
              type="button"
              onClick={() => scrollToChapter(chapter.id)}
              className="group flex w-full items-baseline gap-3 py-2.5 text-left"
            >
              <span className="w-5 shrink-0 text-xs tabular-nums text-zinc-400 transition-colors duration-150 group-hover:text-zinc-900">
                {chapterNumber(i)}
              </span>
              <span className="truncate text-sm text-zinc-600 transition-colors duration-150 group-hover:text-zinc-900">
                {chapter.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

type ChapterRailProps = {
  chapters: GuideChapter[];
  activeIndex: number;
};

/**
 * Fixed tick rail on the right edge of the screen, desktop only. One tick per
 * chapter; the active one is elongated and dark. Hovering the rail reveals
 * every chapter label, turning it into a full table of contents.
 */
export const ChapterRail = ({ chapters, activeIndex }: ChapterRailProps) => (
  <nav
    aria-label="Chapters"
    className="group fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
  >
    <ol className="flex flex-col">
      {chapters.map((chapter, i) => {
        const isActive = i === activeIndex;
        const isDone = i < activeIndex;
        return (
          <li key={chapter.id} className="relative flex h-6 items-center justify-end">
            <span
              aria-hidden
              className={`pointer-events-none absolute right-9 whitespace-nowrap rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium leading-none opacity-0 shadow-sm shadow-zinc-900/5 transition-[opacity,transform] duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100 ${
                isActive
                  ? "translate-x-1.5 border-zinc-300 text-zinc-900"
                  : "translate-x-1.5 border-zinc-200 text-zinc-500"
              }`}
            >
              <span className="mr-1.5 tabular-nums text-zinc-400">
                {chapterNumber(i)}
              </span>
              {chapter.title}
            </span>
            <button
              type="button"
              onClick={() => scrollToChapter(chapter.id)}
              aria-label={`Chapter ${i + 1} of ${chapters.length}: ${chapter.title}`}
              aria-current={isActive ? "true" : undefined}
              className="group/tick flex h-6 w-9 items-center justify-end"
            >
              <span
                className={`h-0.5 w-6 origin-right rounded-full transition-[transform,background-color] duration-200 ease-out ${
                  isActive
                    ? "scale-x-100 bg-zinc-900"
                    : isDone
                      ? "scale-x-[0.45] bg-zinc-400 group-hover/tick:scale-x-75"
                      : "scale-x-[0.45] bg-zinc-300 group-hover/tick:scale-x-75"
                }`}
              />
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
