import { beginnersMethod } from "./beginners-method";
import type { Guide } from "./types";

const GUIDES: Record<string, Guide> = {
  [beginnersMethod.slug]: beginnersMethod,
};

export const getGuide = (slug: string): Guide | null => GUIDES[slug] ?? null;
