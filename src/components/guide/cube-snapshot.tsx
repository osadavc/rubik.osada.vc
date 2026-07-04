"use client";

import { useMemo } from "react";
import { BODY_COLOR, DIM_STICKER_COLOR, STICKER_COLORS } from "@/lib/colors";
import { getStickers, stateAfter } from "@/lib/cube";
import type { FaceName, Sticker } from "@/lib/cube";

const SQ3 = Math.sqrt(3) / 2;
/** Cell size in svg units. */
const S = 17;

type Cell = { color: string; spot: boolean };
type FaceGridLit = Cell[][];

/** World cube-corner coordinates (0..3 per axis) to screen. */
const toScreen = (x: number, y: number, z: number): [number, number] => [
  (x - z) * SQ3 * S,
  ((x + z) * 0.5 + (3 - y)) * S,
];

const quadPath = (pts: [number, number][], inset: number): string => {
  const cx = pts.reduce((a, p) => a + p[0], 0) / 4;
  const cy = pts.reduce((a, p) => a + p[1], 0) / 4;
  const q = pts.map(([x, y]) => [x + (cx - x) * inset, y + (cy - y) * inset]);
  return `M${q[0][0]},${q[0][1]}L${q[1][0]},${q[1][1]}L${q[2][0]},${q[2][1]}L${q[3][0]},${q[3][1]}Z`;
};

/** Corner points of the visible cell (face, row, col) in world units. */
const cellCorners = (face: "U" | "F" | "R", row: number, col: number): [number, number][] => {
  switch (face) {
    case "U":
      return [
        toScreen(col, 3, row),
        toScreen(col + 1, 3, row),
        toScreen(col + 1, 3, row + 1),
        toScreen(col, 3, row + 1),
      ];
    case "F":
      return [
        toScreen(col, 3 - row, 3),
        toScreen(col + 1, 3 - row, 3),
        toScreen(col + 1, 2 - row, 3),
        toScreen(col, 2 - row, 3),
      ];
    case "R":
      return [
        toScreen(3, 3 - row, 3 - col),
        toScreen(3, 3 - row, 2 - col),
        toScreen(3, 2 - row, 2 - col),
        toScreen(3, 2 - row, 3 - col),
      ];
  }
};

type CubeSnapshotProps = {
  /** Moves from solved producing the pictured state. */
  setup: string;
  /** Stickers outside this predicate render dimmed, matching the 3D cube. */
  mask?: (sticker: Sticker) => boolean;
  /** Stickers to ring with a glow, matching the 3D spotlight. */
  spotlight?: (sticker: Sticker) => boolean;
  caption?: string;
  className?: string;
};

/**
 * Small isometric snapshot of a cube state: up, front and right faces.
 * Used for the start/goal cards so learners see where they are headed
 * before any move plays.
 */
export const CubeSnapshot = ({
  setup,
  mask,
  spotlight,
  caption,
  className,
}: CubeSnapshotProps) => {
  const grids = useMemo(() => {
    const state = stateAfter(setup);
    const make = (): FaceGridLit =>
      Array.from({ length: 3 }, () =>
        Array.from({ length: 3 }, () => ({ color: DIM_STICKER_COLOR, spot: false })),
      );
    const result: Record<"U" | "F" | "R", FaceGridLit> = {
      U: make(),
      F: make(),
      R: make(),
    };
    for (const sticker of getStickers(state)) {
      const face = sticker.face as FaceName;
      if (face !== "U" && face !== "F" && face !== "R") continue;
      const lit = mask ? mask(sticker) : true;
      result[face][sticker.row][sticker.col] = {
        color: lit ? STICKER_COLORS[sticker.color] : DIM_STICKER_COLOR,
        spot: spotlight ? spotlight(sticker) : false,
      };
    }
    return result;
  }, [setup, mask, spotlight]);

  // Bounds: x in [-3*SQ3*S, 3*SQ3*S], y in [0, 6*S].
  const pad = 3;
  const width = 6 * SQ3 * S + pad * 2;
  const height = 6 * S + pad * 2;
  const offsetX = 3 * SQ3 * S + pad;

  const outline = [
    toScreen(0, 3, 0),
    toScreen(3, 3, 0),
    toScreen(3, 0, 0),
    toScreen(3, 0, 3),
    toScreen(0, 0, 3),
    toScreen(0, 3, 3),
  ]
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join("");

  return (
    <figure className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={caption ?? "Cube state"}
      >
        <g transform={`translate(${offsetX}, ${pad})`}>
          <path d={`${outline}Z`} fill={BODY_COLOR} />
          {(["U", "F", "R"] as const).map((face) =>
            grids[face].map((rowCells, row) =>
              rowCells.map((cell, col) => {
                const corners = cellCorners(face, row, col);
                return (
                  <g key={`${face}-${row}-${col}`}>
                    <path d={quadPath(corners, 0.1)} fill={cell.color} />
                    {cell.spot && (
                      <path
                        d={quadPath(corners, 0.1)}
                        fill="none"
                        stroke="#fffdf4"
                        strokeWidth={1.6}
                        strokeLinejoin="round"
                        opacity={0.95}
                      />
                    )}
                  </g>
                );
              }),
            ),
          )}
        </g>
      </svg>
      {caption && (
        <figcaption className="text-center text-xs font-medium text-zinc-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
