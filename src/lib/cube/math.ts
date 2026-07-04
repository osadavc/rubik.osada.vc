import type { Axis, Mat3, Vec3 } from "./types";

export const IDENTITY: Mat3 = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
];

export const mulMatVec = (m: Mat3, v: Vec3): Vec3 => [
  m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
  m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
  m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
];

export const mulMatMat = (a: Mat3, b: Mat3): Mat3 => {
  const row = (i: number): Vec3 => [
    a[i][0] * b[0][0] + a[i][1] * b[1][0] + a[i][2] * b[2][0],
    a[i][0] * b[0][1] + a[i][1] * b[1][1] + a[i][2] * b[2][1],
    a[i][0] * b[0][2] + a[i][1] * b[1][2] + a[i][2] * b[2][2],
  ];
  return [row(0), row(1), row(2)];
};

export const matEquals = (a: Mat3, b: Mat3): boolean => {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (a[i][j] !== b[i][j]) return false;
    }
  }
  return true;
};

export const vecEquals = (a: Vec3, b: Vec3): boolean =>
  a[0] === b[0] && a[1] === b[1] && a[2] === b[2];

/**
 * Rotation by `q` quarter turns about the +axis, right-hand rule.
 * Exact integer matrices, no trigonometry.
 */
export const axisRotation = (axis: Axis, q: number): Mat3 => {
  const turns = ((q % 4) + 4) % 4;
  let m = IDENTITY;
  const quarter = QUARTER[axis];
  for (let i = 0; i < turns; i++) m = mulMatMat(quarter, m);
  return m;
};

/** +90 degrees about each axis (right-hand rule). */
const QUARTER: readonly Mat3[] = [
  // x: y -> z, z -> -y
  [
    [1, 0, 0],
    [0, 0, -1],
    [0, 1, 0],
  ],
  // y: z -> x, x -> -z
  [
    [0, 0, 1],
    [0, 1, 0],
    [-1, 0, 0],
  ],
  // z: x -> y, y -> -x
  [
    [0, -1, 0],
    [1, 0, 0],
    [0, 0, 1],
  ],
];
