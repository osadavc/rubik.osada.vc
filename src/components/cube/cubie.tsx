"use client";

import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { BODY_COLOR } from "@/lib/colors";
import type { FaceName, Vec3 } from "@/lib/cube";
import { CUBIE_SIZE, STICKER_OFFSET, stickerGeometry } from "./geometry";

export type StickerSpec = {
  homeFace: FaceName;
  /** Outward normal in the cubie's solved orientation. */
  normal: Vec3;
  baseColor: string;
};

const Z_AXIS = new THREE.Vector3(0, 0, 1);

type CubieProps = {
  cubieId: number;
  stickers: StickerSpec[];
  registerGroup: (id: number, group: THREE.Group | null) => void;
  registerMaterial: (key: string, material: THREE.MeshStandardMaterial | null) => void;
};

export const Cubie = ({ cubieId, stickers, registerGroup, registerMaterial }: CubieProps) => (
  <group ref={(g) => registerGroup(cubieId, g)}>
    <RoundedBox args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} radius={0.09} smoothness={3}>
      <meshStandardMaterial color={BODY_COLOR} roughness={0.42} />
    </RoundedBox>
    {stickers.map((sticker) => {
      const normal = new THREE.Vector3(...sticker.normal);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(Z_AXIS, normal);
      return (
        <mesh
          key={sticker.homeFace}
          geometry={stickerGeometry}
          position={normal.clone().multiplyScalar(STICKER_OFFSET)}
          quaternion={quaternion}
          userData={{ cubieId, homeFace: sticker.homeFace, sticker: true }}
        >
          <meshStandardMaterial
            ref={(m) => registerMaterial(`${cubieId}:${sticker.homeFace}`, m)}
            color={sticker.baseColor}
            roughness={0.36}
            metalness={0}
          />
        </mesh>
      );
    })}
  </group>
);
