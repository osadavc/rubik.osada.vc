"use client";

import { useMemo } from "react";
import { DIM_STICKER_COLOR, STICKER_COLORS } from "@/lib/colors";
import { getFaces, stateAfter } from "@/lib/cube";
import type { ColorName } from "@/lib/cube";

const CELL = 15;
const GAP = 2;
const STRIP = 7;
const PAD = 2;

type TopViewProps = {
  /** Moves from solved producing the pictured state. */
  setup: string;
  label?: string;
  /** Show only yellow stickers in color, like the PDF's case pictures. */
  dimNonYellow?: boolean;
};

/**
 * PDF-style case picture: the up face from above with the neighboring faces'
 * top rows as thin strips around it.
 */
export const TopView = ({ setup, label, dimNonYellow = false }: TopViewProps) => {
  const { grid, strips } = useMemo(() => {
    const faces = getFaces(stateAfter(setup));
    return {
      grid: faces.U,
      strips: {
        // Order matches world x/z left-to-right and top-to-bottom.
        top: [faces.B[0][2], faces.B[0][1], faces.B[0][0]],
        bottom: [faces.F[0][0], faces.F[0][1], faces.F[0][2]],
        left: [faces.L[0][0], faces.L[0][1], faces.L[0][2]],
        right: [faces.R[0][2], faces.R[0][1], faces.R[0][0]],
      },
    };
  }, [setup]);

  const fill = (color: ColorName) =>
    dimNonYellow && color !== "yellow" ? DIM_STICKER_COLOR : STICKER_COLORS[color];

  const gridStart = PAD + STRIP + GAP;
  const gridSize = CELL * 3 + GAP * 2;
  const total = gridStart * 2 + gridSize;
  const cellPos = (i: number) => gridStart + i * (CELL + GAP);

  return (
    <figure className="flex flex-col items-center gap-2">
      <svg
        width={total}
        height={total}
        viewBox={`0 0 ${total} ${total}`}
        role="img"
        aria-label={label ?? "Cube top view"}
      >
        {grid.map((row, r) =>
          row.map((color, c) => (
            <rect
              key={`u-${r}-${c}`}
              x={cellPos(c)}
              y={cellPos(r)}
              width={CELL}
              height={CELL}
              rx={3}
              fill={fill(color)}
              stroke="rgba(24,24,27,0.12)"
            />
          )),
        )}
        {strips.top.map((color, i) => (
          <rect
            key={`t-${i}`}
            x={cellPos(i)}
            y={PAD}
            width={CELL}
            height={STRIP}
            rx={2.5}
            fill={fill(color)}
            stroke="rgba(24,24,27,0.12)"
          />
        ))}
        {strips.bottom.map((color, i) => (
          <rect
            key={`b-${i}`}
            x={cellPos(i)}
            y={gridStart + gridSize + GAP}
            width={CELL}
            height={STRIP}
            rx={2.5}
            fill={fill(color)}
            stroke="rgba(24,24,27,0.12)"
          />
        ))}
        {strips.left.map((color, i) => (
          <rect
            key={`l-${i}`}
            x={PAD}
            y={cellPos(i)}
            width={STRIP}
            height={CELL}
            rx={2.5}
            fill={fill(color)}
            stroke="rgba(24,24,27,0.12)"
          />
        ))}
        {strips.right.map((color, i) => (
          <rect
            key={`r-${i}`}
            x={gridStart + gridSize + GAP}
            y={cellPos(i)}
            width={STRIP}
            height={CELL}
            rx={2.5}
            fill={fill(color)}
            stroke="rgba(24,24,27,0.12)"
          />
        ))}
      </svg>
      {label && <figcaption className="text-xs text-zinc-500">{label}</figcaption>}
    </figure>
  );
};
