"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { STICKER_COLORS } from "@/lib/colors";
import {
  applyMove,
  applyMoves,
  createSolvedState,
  cubiePosition,
  faceOfNormal,
  randomScramble,
  SOLVED_COLORS,
  stickerNormals,
} from "@/lib/cube";
import type { Axis, CubeSize, Mat3, Move } from "@/lib/cube";
import { Cubie, type StickerSpec } from "./cubie";
import { CUBIE_SPACING } from "./geometry";

const AXIS_VECTORS: Record<Axis, THREE.Vector3> = {
  0: new THREE.Vector3(1, 0, 0),
  1: new THREE.Vector3(0, 1, 0),
  2: new THREE.Vector3(0, 0, 1),
};

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

const matrixToQuaternion = (m: Mat3): THREE.Quaternion => {
  const mat4 = new THREE.Matrix4().set(
    m[0][0], m[0][1], m[0][2], 0,
    m[1][0], m[1][1], m[1][2], 0,
    m[2][0], m[2][1], m[2][2], 0,
    0, 0, 0, 1,
  );
  return new THREE.Quaternion().setFromRotationMatrix(mat4);
};

/** One entry of the endless performance: a turn, or a rest when `move` is null. */
type Beat = { move: Move | null; duration: number };

/** Moves applied instantly on the first frame so the cube never shows solved. */
const INITIAL_SHUFFLE_LENGTH = 18;

/** Rest, then wander to a fresh shuffle with a short burst of turns. */
const nextCycle = (size: CubeSize): Beat[] => {
  const burst = randomScramble(7, size);
  return [
    { move: null, duration: 1500 },
    ...burst.map((move) => ({ move, duration: move.q === 2 ? 360 : 235 })),
  ];
};

const noopMaterial = () => {};

const ShufflingCube = ({ animate, size }: { animate: boolean; size: CubeSize }) => {
  const initial = useMemo(() => createSolvedState(size), [size]);
  const groups = useRef(new Map<number, THREE.Group>());
  const state = useRef(initial);
  const shuffled = useRef(false);
  const queue = useRef<Beat[]>([]);
  const current = useRef<(Beat & { startedAt: number }) | null>(null);

  const stickerSpecs = useMemo(() => {
    const specs = new Map<number, StickerSpec[]>();
    for (const cubie of initial) {
      specs.set(
        cubie.id,
        stickerNormals(cubie).map((normal) => ({
          homeFace: faceOfNormal(normal),
          normal,
          baseColor: STICKER_COLORS[SOLVED_COLORS[faceOfNormal(normal)]],
        })),
      );
    }
    return specs;
  }, [initial]);

  useFrame(() => {
    const now = performance.now();
    // Land in a random shuffle before anything renders, even under reduced
    // motion: the hero cube never sits solved.
    if (!shuffled.current) {
      shuffled.current = true;
      state.current = applyMoves(
        state.current,
        randomScramble(INITIAL_SHUFFLE_LENGTH, size),
      );
    }
    if (animate && !current.current) {
      if (queue.current.length === 0) queue.current = nextCycle(size);
      current.current = { ...queue.current.shift()!, startedAt: now };
    }

    // Snapshot before committing so this frame still renders the old state
    // with the full turn applied; the committed state matches next frame.
    const cubies = state.current;
    let animQuat: THREE.Quaternion | null = null;
    let animMove: Move | null = null;
    const active = current.current;
    if (active) {
      const progress = Math.min((now - active.startedAt) / active.duration, 1);
      if (active.move) {
        const angle = active.move.q * (Math.PI / 2) * easeOutCubic(progress);
        animQuat = new THREE.Quaternion().setFromAxisAngle(
          AXIS_VECTORS[active.move.axis],
          angle,
        );
        animMove = active.move;
      }
      if (progress >= 1) {
        if (active.move) state.current = applyMove(state.current, active.move);
        current.current = null;
      }
    }

    for (const cubie of cubies) {
      const group = groups.current.get(cubie.id);
      if (!group) continue;
      const pos = cubiePosition(cubie);
      const quat = matrixToQuaternion(cubie.rotation);
      const affected =
        animMove !== null &&
        (animMove.layers === null || animMove.layers.includes(pos[animMove.axis]));
      const vec = new THREE.Vector3(
        pos[0] * CUBIE_SPACING,
        pos[1] * CUBIE_SPACING,
        pos[2] * CUBIE_SPACING,
      );
      if (affected && animQuat) {
        vec.applyQuaternion(animQuat);
        group.quaternion.copy(animQuat).multiply(quat);
      } else {
        group.quaternion.copy(quat);
      }
      group.position.copy(vec);
    }
  });

  return (
    <group scale={3 / size}>
      {initial.map((cubie) => (
        <Cubie
          key={cubie.id}
          cubieId={cubie.id}
          stickers={stickerSpecs.get(cubie.id) ?? []}
          registerGroup={(id, group) => {
            if (group) groups.current.set(id, group);
            else groups.current.delete(id);
          }}
          registerMaterial={noopMaterial}
        />
      ))}
    </group>
  );
};

/**
 * Landing-page cube: always shuffled, drifting from one random state to the
 * next and never showing solved. Purely decorative; pointer input is ignored.
 */
const HeroCubeCanvas = ({ animate, size = 3 }: { animate: boolean; size?: CubeSize }) => (
  <Canvas
    dpr={[1, 2]}
    camera={{ position: [6.8, 5.6, 8.3], fov: 30 }}
    gl={{ antialias: true, alpha: true }}
  >
    <ambientLight intensity={1.35} />
    <directionalLight position={[6, 9, 7]} intensity={1.15} />
    <directionalLight position={[-7, -3, -6]} intensity={0.45} />
    <directionalLight position={[-4, 6, -8]} intensity={0.5} />
    <ShufflingCube animate={animate} size={size} />
    <OrbitControls
      enablePan={false}
      enableZoom={false}
      enableRotate={false}
      autoRotate={animate}
      autoRotateSpeed={1}
    />
  </Canvas>
);

export { HeroCubeCanvas };
