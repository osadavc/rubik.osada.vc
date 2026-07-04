"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const ACTIVATION_RATIO = 0.42;
const BOTTOM_THRESHOLD_PX = 16;

/**
 * Scroll-spy for lesson steps. A step activates when its block crosses a
 * horizontal line at ~42% of the viewport. At the bottom of the page, the
 * last step is always selected so it can light up without extra padding.
 */
export const useActiveStep = (stepIds: readonly string[]) => {
  const [activeId, setActiveId] = useState<string | null>(stepIds[0] ?? null);
  const elements = useRef(new Map<string, HTMLElement>());
  const stepIdsRef = useRef(stepIds);
  stepIdsRef.current = stepIds;

  const pickActive = useCallback(() => {
    const ids = stepIdsRef.current;
    if (ids.length === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollTop + clientHeight >= scrollHeight - BOTTOM_THRESHOLD_PX) {
      setActiveId(ids[ids.length - 1]);
      return;
    }

    const line = clientHeight * ACTIVATION_RATIO;
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
