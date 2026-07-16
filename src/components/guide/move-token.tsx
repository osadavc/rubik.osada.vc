"use client";

import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowsClockwiseIcon,
  HandIcon,
} from "@phosphor-icons/react";

type ParsedToken = {
  letter: string;
  prime: boolean;
  double: boolean;
  /** Whole-cube re-grip (x, y, z) rather than a face turn. */
  regrip: boolean;
};

const parseToken = (token: string): ParsedToken => {
  // Wide big-cube tokens: Rr, Dd2, and the guide's prime form R'r'.
  const wide =
    /^([RLUDFB])[a-z](2|')?$/.exec(token) ?? /^([RLUDFB])'[a-z]'$/.exec(token);
  if (wide) {
    return {
      letter: `${wide[1]}${wide[1].toLowerCase()}`,
      prime: token.includes("'"),
      double: token.endsWith("2"),
      regrip: false,
    };
  }
  const match = /^([RLUDFBMES]|[rludfb]|[xyz])(2|')?$/.exec(token);
  const letter = match?.[1] ?? token;
  return {
    letter,
    prime: match?.[2] === "'",
    double: match?.[2] === "2",
    regrip: letter === "x" || letter === "y" || letter === "z",
  };
};

const FACE_LABEL: Record<string, string> = {
  U: "top face",
  D: "bottom face",
  L: "left face",
  R: "right face",
  F: "front face",
  B: "back face",
  M: "middle slice",
  E: "middle slice",
  S: "middle slice",
  u: "inside-up slice",
  d: "inside-down slice",
  l: "inside-left slice",
  r: "inside-right slice",
  f: "inside-front slice",
  b: "inside-back slice",
  Uu: "top face and inside-up slice together",
  Dd: "bottom face and inside-down slice together",
  Ll: "left face and inside-left slice together",
  Rr: "right face and inside-right slice together",
  Ff: "front face and inside-front slice together",
  Bb: "back face and inside-back slice together",
};

/** Plain-English reading of a move token, e.g. "Right face, quarter turn counterclockwise". */
export const describeMove = (token: string): string => {
  const { letter, prime, double, regrip } = parseToken(token);
  if (regrip) {
    return "Re-grip: turn the whole cube in your hands. No layer moves.";
  }
  const face = FACE_LABEL[letter] ?? letter;
  const capitalized = face.charAt(0).toUpperCase() + face.slice(1);
  if (double) return `${capitalized}, half turn. Two quarter turns, either direction.`;
  return `${capitalized}, quarter turn ${prime ? "counterclockwise" : "clockwise"}.`;
};

/** Display form with real prime marks: R'r' renders as R′r′. */
export const displayToken = (token: string): string =>
  token.replaceAll("'", "\u2032");

export type TokenState = "done" | "current" | "upcoming";

const STATE_CLASS: Record<TokenState, string> = {
  done: "border-transparent bg-zinc-100 text-zinc-400",
  current: "border-zinc-900 bg-zinc-900 text-zinc-50 shadow-md shadow-zinc-900/20",
  upcoming: "border-zinc-200 bg-white text-zinc-800",
};

export const DirectionGlyph = ({
  token,
  className,
}: {
  token: string;
  className?: string;
}) => {
  const { prime, double, regrip } = parseToken(token);
  if (regrip) return <HandIcon size={11} weight="bold" className={className} />;
  if (double) return <ArrowsClockwiseIcon size={11} weight="bold" className={className} />;
  return prime ? (
    <ArrowCounterClockwiseIcon size={11} weight="bold" className={className} />
  ) : (
    <ArrowClockwiseIcon size={11} weight="bold" className={className} />
  );
};

type MoveTokenProps = {
  token: string;
  state: TokenState;
  onClick?: () => void;
};

/**
 * One big, legible move in a walkthrough strip. The letter carries the face,
 * the glyph underneath carries the direction, so primes are impossible to miss.
 */
export const MoveToken = ({ token, state, onClick }: MoveTokenProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Move ${token}: ${describeMove(token)}`}
    aria-current={state === "current" ? "step" : undefined}
    className={`flex min-w-12 flex-col items-center gap-0.5 rounded-xl border px-2.5 pb-1.5 pt-2 transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none ${
      STATE_CLASS[state]
    } ${state === "current" ? "scale-[1.06]" : "hover:border-zinc-300 active:scale-[0.96]"}`}
  >
    <span className="font-mono text-xl font-semibold leading-none">
      {displayToken(token)}
    </span>
    <DirectionGlyph
      token={token}
      className={
        state === "current"
          ? "text-zinc-400"
          : state === "done"
            ? "text-zinc-300"
            : "text-zinc-400"
      }
    />
  </button>
);
