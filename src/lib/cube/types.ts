export type Axis = 0 | 1 | 2;

export type Vec3 = readonly [number, number, number];

/** Row-major 3x3 integer rotation matrix. */
export type Mat3 = readonly [Vec3, Vec3, Vec3];

export type FaceName = "U" | "D" | "L" | "R" | "F" | "B";

export type ColorName =
  | "white"
  | "yellow"
  | "green"
  | "blue"
  | "red"
  | "orange";

export type PieceType = "center" | "edge" | "corner";

export type Cubie = {
  /** Stable index into the initial cubie list. */
  readonly id: number;
  /** Position when solved, components in {-1, 0, 1}. */
  readonly origin: Vec3;
  /** Cumulative rotation applied to this cubie. */
  readonly rotation: Mat3;
};

export type CubeState = readonly Cubie[];

/**
 * A layer rotation. `layer === null` rotates the whole cube.
 * `q` counts quarter turns using the right-hand rule about the +axis.
 */
export type Move = {
  readonly axis: Axis;
  readonly layer: -1 | 0 | 1 | null;
  readonly q: 1 | 2 | -1;
};

/** One visible sticker in the current state. */
export type Sticker = {
  /** Face the sticker currently sits on. */
  readonly face: FaceName;
  /** 0..2 grid coordinates within the face. */
  readonly row: number;
  readonly col: number;
  readonly color: ColorName;
  readonly cubieId: number;
  /** Face this sticker belongs to when the cube is solved and unrotated. */
  readonly homeFace: FaceName;
  readonly pieceType: PieceType;
  /** All sticker colors of the piece this sticker belongs to. */
  readonly pieceColors: readonly ColorName[];
  /** Current world-space outward normal. */
  readonly normal: Vec3;
  /** Current world-space cubie position, components in {-1, 0, 1}. */
  readonly position: Vec3;
};
