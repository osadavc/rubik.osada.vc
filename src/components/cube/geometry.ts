import * as THREE from "three";

export const CUBIE_SIZE = 1.0;
export const CUBIE_SPACING = 1.0;
const STICKER_SIZE = 0.86;
const STICKER_RADIUS = 0.13;
/** Distance from cubie center to sticker surface. */
export const STICKER_OFFSET = CUBIE_SIZE / 2 + 0.004;

const roundedRectShape = (size: number, radius: number): THREE.Shape => {
  const half = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-half + radius, -half);
  shape.lineTo(half - radius, -half);
  shape.quadraticCurveTo(half, -half, half, -half + radius);
  shape.lineTo(half, half - radius);
  shape.quadraticCurveTo(half, half, half - radius, half);
  shape.lineTo(-half + radius, half);
  shape.quadraticCurveTo(-half, half, -half, half - radius);
  shape.lineTo(-half, -half + radius);
  shape.quadraticCurveTo(-half, -half, -half + radius, -half);
  return shape;
};

export const stickerGeometry = new THREE.ShapeGeometry(
  roundedRectShape(STICKER_SIZE, STICKER_RADIUS),
);
