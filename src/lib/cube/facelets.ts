import { mulMatVec } from "./math";
import { cubiePosition } from "./state";
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

export const pieceTypeOf = (cubie: Cubie): PieceType => {
  const count =
    Math.abs(cubie.origin[0]) + Math.abs(cubie.origin[1]) + Math.abs(cubie.origin[2]);
  return count === 1 ? "center" : count === 2 ? "edge" : "corner";
};

/** Outward sticker normals of a cubie in its solved orientation. */
export const stickerNormals = (cubie: Cubie): Vec3[] => {
  const normals: Vec3[] = [];
  if (cubie.origin[0] !== 0) normals.push([cubie.origin[0], 0, 0]);
  if (cubie.origin[1] !== 0) normals.push([0, cubie.origin[1], 0]);
  if (cubie.origin[2] !== 0) normals.push([0, 0, cubie.origin[2]]);
  return normals;
};

export const pieceColors = (cubie: Cubie): ColorName[] =>
  stickerNormals(cubie).map((n) => SOLVED_COLORS[faceOfNormal(n)]);

/** 0..2 grid coordinates for a sticker at world position `p` on `face`. */
const gridCoords = (face: FaceName, p: Vec3): { row: number; col: number } => {
  switch (face) {
    case "U":
      return { row: p[2] + 1, col: p[0] + 1 };
    case "D":
      return { row: 1 - p[2], col: p[0] + 1 };
    case "F":
      return { row: 1 - p[1], col: p[0] + 1 };
    case "B":
      return { row: 1 - p[1], col: 1 - p[0] };
    case "R":
      return { row: 1 - p[1], col: 1 - p[2] };
    case "L":
      return { row: 1 - p[1], col: p[2] + 1 };
  }
};

export const getStickers = (state: CubeState): Sticker[] => {
  const stickers: Sticker[] = [];
  for (const cubie of state) {
    const colors = pieceColors(cubie);
    const type = pieceTypeOf(cubie);
    const position = cubiePosition(cubie);
    for (const n0 of stickerNormals(cubie)) {
      const homeFace = faceOfNormal(n0);
      const normal = mulMatVec(cubie.rotation, n0);
      const face = faceOfNormal(normal);
      const { row, col } = gridCoords(face, position);
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
  const faces = {} as Record<FaceName, FaceGrid>;
  for (const name of Object.keys(FACE_NORMALS) as FaceName[]) {
    faces[name] = [
      ["white", "white", "white"],
      ["white", "white", "white"],
      ["white", "white", "white"],
    ];
  }
  for (const sticker of getStickers(state)) {
    faces[sticker.face][sticker.row][sticker.col] = sticker.color;
  }
  return faces;
};
