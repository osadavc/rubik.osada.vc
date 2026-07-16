import type { CatalogEntry } from "./types";

/** Server-safe catalog metadata. Full guide data lives in the client registry. */
export const CATALOG: CatalogEntry[] = [
  {
    slug: "beginners-method",
    title: "The Beginner's Method",
    tagline:
      "The official layered method, taught interactively. Solve your first cube in an afternoon.",
    puzzle: "3x3",
    difficulty: "beginner",
    estMinutes: 45,
    available: true,
  },
  {
    slug: "cfop",
    title: "CFOP",
    tagline:
      "Cross, F2L, OLL, PLL. The speedcuber's method, once the basics feel automatic.",
    puzzle: "3x3",
    difficulty: "intermediate",
    estMinutes: 120,
    available: false,
  },
  {
    slug: "4x4-reduction",
    title: "4x4 Reduction",
    tagline:
      "Pair up centers and edges until the big cube plays by 3x3 rules.",
    puzzle: "4x4",
    difficulty: "advanced",
    estMinutes: 90,
    available: true,
  },
];
