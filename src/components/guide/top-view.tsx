"use client";

import { useMemo } from "react";
import { BODY_COLOR, STICKER_COLORS } from "@/lib/colors";
import { getFaces, stateAfter } from "@/lib/cube";
import type { ColorName } from "@/lib/cube";

const CELL = 16;
const GAP = 3;
const STRIP = 6;
const PLATE_PAD = 5;
const STRIP_GAP = 4;

/** Blank plastic tile on the dark plate, for stickers outside the focus. */
const DIM_CELL_COLOR = "#3b3b40";
/** Dimmed side stickers sit on the page background, so they stay light. */
const DIM_STRIP_COLOR = "#e4e4e7";

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

  const cellFill = (color: ColorName) =>
    dimNonYellow && color !== "yellow" ? DIM_CELL_COLOR : STICKER_COLORS[color];
  const stripFill = (color: ColorName) =>
    dimNonYellow && color !== "yellow" ? DIM_STRIP_COLOR : STICKER_COLORS[color];

  const gridSize = CELL * 3 + GAP * 2;
  const plateSize = gridSize + PLATE_PAD * 2;
  const plateStart = STRIP + STRIP_GAP;
  const gridStart = plateStart + PLATE_PAD;
  const total = plateStart * 2 + plateSize;
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
        {/* Plastic plate under the up face, echoing the 3D cube's body. */}
        <rect
          x={plateStart}
          y={plateStart}
          width={plateSize}
          height={plateSize}
          rx={8}
          fill={BODY_COLOR}
        />
        {grid.map((row, r) =>
          row.map((color, c) => (
            <rect
              key={`u-${r}-${c}`}
              x={cellPos(c)}
              y={cellPos(r)}
              width={CELL}
              height={CELL}
              rx={4}
              fill={cellFill(color)}
            />
          )),
        )}
        {strips.top.map((color, i) => (
          <rect
            key={`t-${i}`}
            x={cellPos(i)}
            y={0}
            width={CELL}
            height={STRIP}
            rx={3}
            fill={stripFill(color)}
          />
        ))}
        {strips.bottom.map((color, i) => (
          <rect
            key={`b-${i}`}
            x={cellPos(i)}
            y={plateStart + plateSize + STRIP_GAP}
            width={CELL}
            height={STRIP}
            rx={3}
            fill={stripFill(color)}
          />
        ))}
        {strips.left.map((color, i) => (
          <rect
            key={`l-${i}`}
            x={0}
            y={cellPos(i)}
            width={STRIP}
            height={CELL}
            rx={3}
            fill={stripFill(color)}
          />
        ))}
        {strips.right.map((color, i) => (
          <rect
            key={`r-${i}`}
            x={plateStart + plateSize + STRIP_GAP}
            y={cellPos(i)}
            width={STRIP}
            height={CELL}
            rx={3}
            fill={stripFill(color)}
          />
        ))}
      </svg>
      {label && (
        <figcaption className="max-w-40 text-center text-xs text-zinc-500">
          {label}
        </figcaption>
      )}
    </figure>
  );
};
