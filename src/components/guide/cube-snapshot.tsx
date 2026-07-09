"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three-stdlib";
import {
  CUBIE_SIZE,
  CUBIE_SPACING,
  STICKER_OFFSET,
  stickerGeometry,
} from "@/components/cube/geometry";
import { BODY_COLOR, DIM_STICKER_COLOR, STICKER_COLORS } from "@/lib/colors";
import {
  cubiePosition,
  faceOfNormal,
  getStickers,
  stateAfter,
  stickerNormals,
} from "@/lib/cube";
import type { Mat3, Sticker } from "@/lib/cube";

const Z_AXIS = new THREE.Vector3(0, 0, 1);

/* Shared across every snapshot; passed by reference so r3f never disposes them. */
const bodyGeometry = new RoundedBoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE, 3, 0.09);
const bodyMaterial = new THREE.MeshStandardMaterial({
  color: BODY_COLOR,
  roughness: 0.42,
});

const matrixToQuaternion = (m: Mat3): THREE.Quaternion => {
  const mat4 = new THREE.Matrix4().set(
    m[0][0], m[0][1], m[0][2], 0,
    m[1][0], m[1][1], m[1][2], 0,
    m[2][0], m[2][1], m[2][2], 0,
    0, 0, 0, 1,
  );
  return new THREE.Quaternion().setFromRotationMatrix(mat4);
};

type MiniSticker = {
  key: string;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  color: string;
  /** Spotlighted stickers glow softly, matching the live cube. */
  glow: string | null;
};

type MiniCubie = {
  id: number;
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  stickers: MiniSticker[];
};

const buildCubies = (
  setup: string,
  mask?: (sticker: Sticker) => boolean,
  spotlight?: (sticker: Sticker) => boolean,
): MiniCubie[] => {
  const state = stateAfter(setup);
  const info = new Map<string, { color: string; glow: string | null }>();
  for (const sticker of getStickers(state)) {
    const lit = mask ? mask(sticker) : true;
    const color = lit ? STICKER_COLORS[sticker.color] : DIM_STICKER_COLOR;
    const spot = lit && (spotlight?.(sticker) ?? false);
    info.set(`${sticker.cubieId}:${sticker.homeFace}`, {
      color,
      // Same hue as the sticker - a white-tinted glow made matched tiles look
      // like a different shade than their center.
      glow: spot ? color : null,
    });
  }
  return state.map((cubie) => {
    const pos = cubiePosition(cubie);
    return {
      id: cubie.id,
      position: new THREE.Vector3(
        pos[0] * CUBIE_SPACING,
        pos[1] * CUBIE_SPACING,
        pos[2] * CUBIE_SPACING,
      ),
      quaternion: matrixToQuaternion(cubie.rotation),
      stickers: stickerNormals(cubie).map((normal) => {
        const n = new THREE.Vector3(...normal);
        const detail = info.get(`${cubie.id}:${faceOfNormal(normal)}`)!;
        return {
          key: `${cubie.id}:${faceOfNormal(normal)}`,
          position: n.clone().multiplyScalar(STICKER_OFFSET),
          quaternion: new THREE.Quaternion().setFromUnitVectors(Z_AXIS, n),
          ...detail,
        };
      }),
    };
  });
};

/** Mounts children only while the element is near the viewport. */
const useInView = (rootMargin: string) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
};

type CubeSnapshotProps = {
  /** Moves from solved producing the pictured state. */
  setup: string;
  /** Stickers outside this predicate render dimmed, matching the 3D cube. */
  mask?: (sticker: Sticker) => boolean;
  /** Stickers to glow, matching the 3D spotlight. */
  spotlight?: (sticker: Sticker) => boolean;
  caption?: string;
  className?: string;
};

/**
 * Miniature 3D cube for the start/goal cards, rendered with the same
 * materials and palette as the live cube. The WebGL canvas exists only
 * while the card is near the viewport: it renders a single static frame
 * on mount and is torn down as soon as the reader scrolls away.
 */
export const CubeSnapshot = ({
  setup,
  mask,
  spotlight,
  caption,
  className,
}: CubeSnapshotProps) => {
  const { ref, inView } = useInView("200px 0px");
  const cubies = useMemo(
    () => (inView ? buildCubies(setup, mask, spotlight) : null),
    [inView, setup, mask, spotlight],
  );

  return (
    <figure className={`flex flex-col items-center gap-1 ${className ?? ""}`}>
      <div ref={ref} className="h-24 w-24 sm:h-28 sm:w-28" aria-label={caption ?? "Cube state"} role="img">
        {cubies && (
          <div className="h-full w-full transition-opacity duration-500 ease-out starting:opacity-0 motion-reduce:transition-none">
            <Canvas
              frameloop="demand"
              dpr={[1, 2]}
              camera={{ position: [6.2, 5.0, 7.5], fov: 30 }}
              gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
              style={{ pointerEvents: "none" }}
            >
              <ambientLight intensity={1.35} />
              <directionalLight position={[6, 9, 7]} intensity={1.15} />
              <directionalLight position={[-7, -3, -6]} intensity={0.45} />
              <directionalLight position={[-4, 6, -8]} intensity={0.5} />
              {cubies.map((cubie) => (
                <group
                  key={cubie.id}
                  position={cubie.position}
                  quaternion={cubie.quaternion}
                >
                  <mesh geometry={bodyGeometry} material={bodyMaterial} />
                  {cubie.stickers.map((sticker) => (
                    <mesh
                      key={sticker.key}
                      geometry={stickerGeometry}
                      position={sticker.position}
                      quaternion={sticker.quaternion}
                    >
                      <meshStandardMaterial
                        color={sticker.color}
                        roughness={0.36}
                        metalness={0}
                        toneMapped={false}
                        emissive={sticker.glow ?? "#000000"}
                        emissiveIntensity={sticker.glow ? 0.16 : 0}
                      />
                    </mesh>
                  ))}
                </group>
              ))}
            </Canvas>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="text-center text-xs font-medium text-zinc-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
