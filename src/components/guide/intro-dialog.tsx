"use client";

import {
  HandGrabbingIcon,
  MouseScrollIcon,
  PlayIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useSyncExternalStore } from "react";

const STORAGE_KEY = "rubik:guide-intro-seen";

/* Tiny external store over the localStorage flag, so the dialog's visibility
 * is SSR-safe (hidden on the server) and lint-clean (no setState in effects). */
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getSnapshot = () => localStorage.getItem(STORAGE_KEY) === null;
const getServerSnapshot = () => false;
const markSeen = () => {
  localStorage.setItem(STORAGE_KEY, "1");
  for (const listener of listeners) listener();
};

const POINTS = [
  {
    icon: MouseScrollIcon,
    title: "Just scroll",
    body: "The cube sets itself up for whatever you are reading. Tiles that don't matter yet stay dark.",
  },
  {
    icon: PlayIcon,
    title: "Watch, move by move",
    body: "Algorithms play one turn at a time, as big cards. Tap any card to jump straight to that move.",
  },
  {
    icon: HandGrabbingIcon,
    title: "The cube is real",
    body: "Drag the space around the cube to look from any angle. When it's your turn, drag a tile — or press its letter key — to turn that layer.",
  },
  {
    icon: TargetIcon,
    title: "Then it's your turn",
    body: "Practice blocks hand you a scramble and a goal, and unlock the cube. Nothing can break — reset any time.",
  },
] as const;

/**
 * One-time orientation shown on the first visit to a guide. Uses a native
 * dialog for the focus trap and Escape handling; dismissing it in any way
 * marks the intro as seen.
 */
export const IntroDialog = () => {
  const ref = useRef<HTMLDialogElement | null>(null);
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  if (!open) return null;

  const dismiss = () => {
    ref.current?.close();
  };

  return (
    <dialog
      ref={ref}
      // Escape lands here too; never show the intro twice.
      onClose={markSeen}
      onClick={(e) => {
        // Clicks on the backdrop hit the dialog element itself.
        if (e.target === ref.current) dismiss();
      }}
      className="fixed inset-0 m-auto w-[calc(100vw-2.5rem)] max-w-md rounded-3xl border border-zinc-200 bg-white p-0 shadow-2xl shadow-zinc-950/20 backdrop:bg-zinc-950/30 backdrop:backdrop-blur-[2px] open:transition-[opacity,transform,filter] open:duration-300 open:ease-[cubic-bezier(0.23,1,0.32,1)] open:starting:scale-[0.96] open:starting:opacity-0 open:starting:blur-[2px] motion-reduce:open:transition-none"
    >
      <div className="p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-400">
          Before you start
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          This guide is played, not read
        </h2>

        <ul className="mt-6 space-y-5">
          {POINTS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-3.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
                <Icon size={15} weight="fill" />
              </span>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-zinc-500">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          autoFocus
          onClick={dismiss}
          className="mt-7 w-full rounded-xl bg-zinc-900 py-3 text-sm font-semibold text-zinc-50 outline-none transition-[background-color,transform] duration-150 hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 active:scale-[0.985]"
        >
          Start learning
        </button>
      </div>
    </dialog>
  );
};
