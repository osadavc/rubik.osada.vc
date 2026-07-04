"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { DIM_STICKER_COLOR, STICKER_COLORS } from "@/lib/colors";
import {
  createSolvedState,
  cubiePosition,
  faceOfNormal,
  getStickers,
  SOLVED_COLORS,
  stickerNormals,
} from "@/lib/cube";
import type { Axis, Mat3, Move } from "@/lib/cube";
import { useCubeStore } from "@/store/cube-store";
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

type DragGesture = {
  pointerId: number;
  cubieId: number;
  startX: number;
  startY: number;
  point: THREE.Vector3;
  normal: THREE.Vector3;
  consumed: boolean;
};

type CubeModelProps = {
  interactive: boolean;
  setControlsEnabled: (enabled: boolean) => void;
};

export const CubeModel = ({ interactive, setControlsEnabled }: CubeModelProps) => {
  const initial = useMemo(() => createSolvedState(), []);
  const groups = useRef(new Map<number, THREE.Group>());
  const materials = useRef(new Map<string, THREE.MeshStandardMaterial>());
  const targetColors = useRef(new Map<string, THREE.Color>());
  const gesture = useRef<DragGesture | null>(null);
  const { camera, gl, size } = useThree();

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

  // Recompute target sticker colors whenever the logical state or mask changes.
  useEffect(() => {
    const update = () => {
      const { state, highlight } = useCubeStore.getState();
      const next = new Map<string, THREE.Color>();
      for (const sticker of getStickers(state)) {
        const key = `${sticker.cubieId}:${sticker.homeFace}`;
        const lit = highlight ? highlight(sticker) : true;
        next.set(
          key,
          new THREE.Color(lit ? STICKER_COLORS[sticker.color] : DIM_STICKER_COLOR),
        );
      }
      targetColors.current = next;
    };
    update();
    return useCubeStore.subscribe((cur, prev) => {
      if (cur.state !== prev.state || cur.highlight !== prev.highlight) update();
    });
  }, []);

  useFrame((_, delta) => {
    const store = useCubeStore.getState();
    if (!store.anim && store.queue.length > 0) store.startNextAnim();

    const anim = useCubeStore.getState().anim;
    let animQuat: THREE.Quaternion | null = null;
    let animMove: Move | null = null;
    if (anim) {
      const progress = Math.min(
        (performance.now() - anim.startedAt) / anim.duration,
        1,
      );
      const angle = anim.move.q * (Math.PI / 2) * easeOutCubic(progress);
      animQuat = new THREE.Quaternion().setFromAxisAngle(
        AXIS_VECTORS[anim.move.axis],
        angle,
      );
      animMove = anim.move;
      if (progress >= 1) {
        // Commit after computing this frame's final transform; the committed
        // state renders identically next frame, so there is no visual jump.
        store.completeAnim();
      }
    }

    const state = store.state;
    for (const cubie of state) {
      const group = groups.current.get(cubie.id);
      if (!group) continue;
      const pos = cubiePosition(cubie);
      const quat = matrixToQuaternion(cubie.rotation);
      const affected =
        animMove !== null &&
        (animMove.layer === null || pos[animMove.axis] === animMove.layer);
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

    // Smooth sticker color transitions.
    const k = Math.min(delta * 10, 1);
    for (const [key, material] of materials.current) {
      const target = targetColors.current.get(key);
      if (target) material.color.lerp(target, k);
    }
  });

  // Drag-a-face-to-turn.
  useEffect(() => {
    if (!interactive) return;
    const dom = gl.domElement;

    const onMove = (event: PointerEvent) => {
      const g = gesture.current;
      if (!g || g.consumed || event.pointerId !== g.pointerId) return;
      const dx = event.clientX - g.startX;
      const dy = event.clientY - g.startY;
      if (dx * dx + dy * dy < 12 * 12) return;
      g.consumed = true;

      // Screen-space direction of each face-tangent world axis at the grab point.
      const project = (world: THREE.Vector3) => {
        const projected = world.clone().project(camera);
        return new THREE.Vector2(
          (projected.x * 0.5 + 0.5) * size.width,
          (1 - (projected.y * 0.5 + 0.5)) * size.height,
        );
      };
      const origin2d = project(g.point);
      const dragDir = new THREE.Vector2(dx, dy).normalize();

      let best: { tangent: THREE.Vector3; score: number } | null = null;
      for (const axis of [0, 1, 2] as const) {
        const world = AXIS_VECTORS[axis];
        if (Math.abs(world.dot(g.normal)) > 0.5) continue;
        for (const sign of [1, -1]) {
          const tangent = world.clone().multiplyScalar(sign);
          const screenDir = project(g.point.clone().add(tangent.clone().multiplyScalar(0.5)))
            .sub(origin2d)
            .normalize();
          const score = screenDir.dot(dragDir);
          if (!best || score > best.score) best = { tangent, score };
        }
      }
      if (!best) return;

      const rotationAxis = g.normal.clone().cross(best.tangent);
      let axis: Axis = 0;
      let maxAbs = 0;
      for (const a of [0, 1, 2] as const) {
        const component = rotationAxis.getComponent(a);
        if (Math.abs(component) > maxAbs) {
          maxAbs = Math.abs(component);
          axis = a;
        }
      }

      const state = useCubeStore.getState().state;
      const cubie = state.find((c) => c.id === g.cubieId);
      if (!cubie) return;
      const layer = cubiePosition(cubie)[axis] as -1 | 0 | 1;

      // Pick the turn direction that moves the grabbed point along the drag.
      const velocity = AXIS_VECTORS[axis].clone().cross(g.point);
      const q = velocity.dot(best.tangent) > 0 ? 1 : -1;
      useCubeStore.getState().userMove({ axis, layer, q });
    };

    const onUp = (event: PointerEvent) => {
      if (gesture.current?.pointerId !== event.pointerId) return;
      gesture.current = null;
      setControlsEnabled(true);
    };

    dom.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      dom.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [interactive, camera, gl, size, setControlsEnabled]);

  return (
    <group
      onPointerDown={(event) => {
        if (!interactive) return;
        const hit = event.intersections.find((i) => i.object.userData?.sticker);
        const object = hit?.object;
        if (!hit || !object) return;
        event.stopPropagation();
        setControlsEnabled(false);
        const normal = new THREE.Vector3(0, 0, 1)
          .applyQuaternion(object.getWorldQuaternion(new THREE.Quaternion()))
          .round();
        gesture.current = {
          pointerId: event.pointerId,
          cubieId: object.userData.cubieId as number,
          startX: event.clientX,
          startY: event.clientY,
          point: hit.point.clone(),
          normal,
          consumed: false,
        };
      }}
    >
      {initial.map((cubie) => (
        <Cubie
          key={cubie.id}
          cubieId={cubie.id}
          stickers={stickerSpecs.get(cubie.id) ?? []}
          registerGroup={(id, group) => {
            if (group) groups.current.set(id, group);
            else groups.current.delete(id);
          }}
          registerMaterial={(key, material) => {
            if (material) materials.current.set(key, material);
            else materials.current.delete(key);
          }}
        />
      ))}
    </group>
  );
};