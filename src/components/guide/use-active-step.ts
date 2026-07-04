"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll-spy for lesson steps. A step activates when its block crosses a
 * horizontal line at ~42% of the viewport, via IntersectionObserver only.
 */
export const useActiveStep = (stepIds: readonly string[]) => {
  const [activeId, setActiveId] = useState<string | null>(stepIds[0] ?? null);
  const elements = useRef(new Map<string, HTMLElement>());
  const observer = useRef<IntersectionObserver | null>(null);

  const registerStep = useCallback((id: string, el: HTMLElement | null) => {
    const existing = elements.current.get(id);
    if (existing && observer.current) observer.current.unobserve(existing);
    if (el) {
      elements.current.set(id, el);
      observer.current?.observe(el);
    } else {
      elements.current.delete(id);
    }
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.getAttribute("data-step-id");
          if (id) setActiveId(id);
        }
      },
      { rootMargin: "-42% 0px -58% 0px", threshold: 0 },
    );
    for (const el of elements.current.values()) observer.current.observe(el);
    return () => observer.current?.disconnect();
  }, []);

  return { activeId, registerStep };
};
