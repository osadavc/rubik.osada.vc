import { beginnersMethod } from "./beginners-method";
import { fourByFourReduction } from "./4x4-reduction";
import type { Guide } from "./types";

const GUIDES: Record<string, Guide> = {
  [beginnersMethod.slug]: beginnersMethod,
  [fourByFourReduction.slug]: fourByFourReduction,
};

export const getGuide = (slug: string): Guide | null => GUIDES[slug] ?? null;
