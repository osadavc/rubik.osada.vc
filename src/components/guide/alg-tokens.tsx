"use client";

type AlgTokensProps = {
  tokens: readonly string[];
  /** Index of the next move to play; tokens before it render as done. */
  cursor?: number;
  size?: "sm" | "md";
};

export const AlgTokens = ({ tokens, cursor = -1, size = "md" }: AlgTokensProps) => (
  <span
    className={`inline-flex flex-wrap items-center gap-1 font-mono ${
      size === "sm" ? "text-xs" : "text-sm"
    }`}
  >
    {tokens.map((token, i) => {
      const state = cursor < 0 ? "idle" : i < cursor ? "done" : i === cursor ? "next" : "idle";
      return (
        <span
          key={`${token}-${i}`}
          className={`rounded-md px-1.5 py-0.5 transition-colors duration-200 ${
            state === "next"
              ? "bg-zinc-900 text-zinc-50"
              : state === "done"
                ? "bg-zinc-100 text-zinc-400"
                : "bg-zinc-100 text-zinc-700"
          }`}
        >
          {token}
        </span>
      );
    })}
  </span>
);
