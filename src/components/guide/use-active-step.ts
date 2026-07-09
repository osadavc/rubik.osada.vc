"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ACTIVATION_RATIO = 0.42;
const BOTTOM_THRESHOLD_PX = 16;

/**
 * Scroll-spy for lesson steps. A step activates when its block crosses a
 * horizontal line at ~42% of the visible content area. On stacked (mobile)
 * layouts the sticky cube panel covers the top of the viewport, so the line
 * is measured within the region below it rather than the full viewport. At
 * the bottom of the page, the last step is always selected so it can light
 * up without extra padding.
 */
export const useActiveStep = (stepIds: readonly string[]) => {
  const [activeId, setActiveId] = useState<string | null>(stepIds[0] ?? null);
  const elements = useRef(new Map<string, HTMLElement>());
  const stepIdsRef = useRef(stepIds);
  useEffect(() => {
    stepIdsRef.current = stepIds;
  }, [stepIds]);

  const pickActive = useCallback(() => {
    const ids = stepIdsRef.current;
    if (ids.length === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - BOTTOM_THRESHOLD_PX) {
      setActiveId(ids[ids.length - 1]);
      return;
    }

    // On the stacked layout the sticky cube panel spans the full width and
    // hides the top of the viewport, so measure the line inside the strip of
    // content that is actually visible below it. On desktop the panel sits in
    // its own column and covers nothing, so the region is the whole viewport.
    let regionTop = 0;
    const panel = document.querySelector<HTMLElement>("[data-cube-panel]");
    if (panel) {
      const rect = panel.getBoundingClientRect();
      const isStacked = rect.width >= window.innerWidth * 0.9;
      if (isStacked) regionTop = Math.max(rect.bottom, 0);
    }
    const line = regionTop + (clientHeight - regionTop) * ACTIVATION_RATIO;
    let current = ids[0];
    for (const id of ids) {
      const el = elements.current.get(id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= line) current = id;
    }
    setActiveId(current);
  }, []);

  const registerStep = useCallback(
    (id: string, el: HTMLElement | null) => {
      if (el) elements.current.set(id, el);
      else elements.current.delete(id);
      pickActive();
    },
    [pickActive],
  );

  useEffect(() => {
    pickActive();
    window.addEventListener("scroll", pickActive, { passive: true });
    window.addEventListener("resize", pickActive, { passive: true });
    return () => {
      window.removeEventListener("scroll", pickActive);
      window.removeEventListener("resize", pickActive);
    };
  }, [pickActive]);

  return { activeId, registerStep };
};
