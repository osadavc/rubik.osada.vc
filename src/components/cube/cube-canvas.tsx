"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { useCubeStore } from "@/store/cube-store";
import { CubeModel } from "./cube-model";

const CameraRig = ({
  controls,
  interacting,
}: {
  controls: React.RefObject<OrbitControlsImpl | null>;
  interacting: React.RefObject<boolean>;
}) => {
  useFrame((_, delta) => {
    const { cameraTarget, setCameraTarget } = useCubeStore.getState();
    const orbit = controls.current;
    // Never fight the user: an in-progress drag always wins over auto-reorientation.
    if (!cameraTarget || !orbit || interacting.current) return;
    const azimuth = orbit.getAzimuthalAngle();
    const polar = orbit.getPolarAngle();
    const k = Math.min(delta * 5, 1);
    const nextAzimuth = azimuth + (cameraTarget.azimuth - azimuth) * k;
    const nextPolar = polar + (cameraTarget.polar - polar) * k;
    orbit.setAzimuthalAngle(nextAzimuth);
    orbit.setPolarAngle(nextPolar);
    orbit.update();
    if (
      Math.abs(cameraTarget.azimuth - nextAzimuth) < 0.01 &&
      Math.abs(cameraTarget.polar - nextPolar) < 0.01
    ) {
      setCameraTarget(null);
    }
  });
  return null;
};

type CubeCanvasProps = {
  interactive?: boolean;
  className?: string;
};

export const CubeCanvas = ({ interactive = true, className }: CubeCanvasProps) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const interactingRef = useRef(false);

  return (
    <Canvas
      className={className}
      dpr={[1, 2]}
      camera={{ position: [9, 7.4, 11], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: "none" }}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[6, 9, 7]} intensity={1.5} />
      <directionalLight position={[-7, -3, -6]} intensity={0.5} />
      <directionalLight position={[-4, 6, -8]} intensity={0.6} />
      <CubeModel
        interactive={interactive}
        setControlsEnabled={(enabled) => {
          if (controlsRef.current) controlsRef.current.enabled = enabled;
        }}
      />
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.9}
        onStart={() => {
          interactingRef.current = true;
          // Grabbing the cube cancels any pending auto camera move so the
          // user can look around the moment they touch it.
          const store = useCubeStore.getState();
          if (store.cameraTarget) store.setCameraTarget(null);
        }}
        onEnd={() => {
          interactingRef.current = false;
        }}
      />
      <CameraRig controls={controlsRef} interacting={interactingRef} />
    </Canvas>
  );
};
