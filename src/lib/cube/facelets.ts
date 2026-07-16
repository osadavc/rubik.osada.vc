import { mulMatVec } from "./math";
import { cubiePosition, sizeOfState } from "./state";
import type {
  ColorName,
  CubeState,
  Cubie,
  FaceName,
  PieceType,
  Sticker,
  Vec3,
} from "./types";

export const SOLVED_COLORS: Record<FaceName, ColorName> = {
  U: "white",
  D: "yellow",
  F: "green",
  B: "blue",
  R: "red",
  L: "orange",
};

export const FACE_NORMALS: Record<FaceName, Vec3> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

export const faceOfNormal = (n: Vec3): FaceName => {
  if (n[1] === 1) return "U";
  if (n[1] === -1) return "D";
  if (n[0] === 1) return "R";
  if (n[0] === -1) return "L";
  if (n[2] === 1) return "F";
  return "B";
};

/**
 * Outer-shell coordinate of a cubie: 1 on a 3x3, 1.5 on a 4x4. Every visible
 * cubie has at least one component on the shell, so this doubles as the size
 * marker for a single piece.
 */
const shellOf = (cubie: Cubie): number =>
  Math.max(
    Math.abs(cubie.origin[0]),
    Math.abs(cubie.origin[1]),
    Math.abs(cubie.origin[2]),
  );

export const pieceTypeOf = (cubie: Cubie): PieceType => {
  const shell = shellOf(cubie);
  const count = cubie.origin.filter((c) => Math.abs(c) === shell).length;
  return count === 1 ? "center" : count === 2 ? "edge" : "corner";
};

/** Outward unit sticker normals of a cubie in its solved orientation. */
export const stickerNormals = (cubie: Cubie): Vec3[] => {
  const shell = shellOf(cubie);
  const normals: Vec3[] = [];
  if (Math.abs(cubie.origin[0]) === shell) normals.push([Math.sign(cubie.origin[0]), 0, 0]);
  if (Math.abs(cubie.origin[1]) === shell) normals.push([0, Math.sign(cubie.origin[1]), 0]);
  if (Math.abs(cubie.origin[2]) === shell) normals.push([0, 0, Math.sign(cubie.origin[2])]);
  return normals;
};

export const pieceColors = (cubie: Cubie): ColorName[] =>
  stickerNormals(cubie).map((n) => SOLVED_COLORS[faceOfNormal(n)]);

/** 0..size-1 grid coordinates for a sticker at world position `p` on `face`. */
const gridCoords = (
  face: FaceName,
  p: Vec3,
  half: number,
): { row: number; col: number } => {
  switch (face) {
    case "U":
      return { row: p[2] + half, col: p[0] + half };
    case "D":
      return { row: half - p[2], col: p[0] + half };
    case "F":
      return { row: half - p[1], col: p[0] + half };
    case "B":
      return { row: half - p[1], col: half - p[0] };
    case "R":
      return { row: half - p[1], col: half - p[2] };
    case "L":
      return { row: half - p[1], col: p[2] + half };
  }
};

export const getStickers = (state: CubeState): Sticker[] => {
  const half = (sizeOfState(state) - 1) / 2;
  const stickers: Sticker[] = [];
  for (const cubie of state) {
    const colors = pieceColors(cubie);
    const type = pieceTypeOf(cubie);
    const position = cubiePosition(cubie);
    for (const n0 of stickerNormals(cubie)) {
      const homeFace = faceOfNormal(n0);
      const normal = mulMatVec(cubie.rotation, n0);
      const face = faceOfNormal(normal);
      const { row, col } = gridCoords(face, position, half);
      stickers.push({
        face,
        row,
        col,
        color: SOLVED_COLORS[homeFace],
        cubieId: cubie.id,
        homeFace,
        pieceType: type,
        pieceColors: colors,
        normal,
        position,
      });
    }
  }
  return stickers;
};

export type FaceGrid = ColorName[][];

export const getFaces = (state: CubeState): Record<FaceName, FaceGrid> => {
  const size = sizeOfState(state);
  const faces = {} as Record<FaceName, FaceGrid>;
  for (const name of Object.keys(FACE_NORMALS) as FaceName[]) {
    faces[name] = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => "white" as ColorName),
    );
  }
  for (const sticker of getStickers(state)) {
    faces[sticker.face][sticker.row][sticker.col] = sticker.color;
  }
  return faces;
};
