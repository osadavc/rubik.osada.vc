import { afterAll, describe, expect, test } from "bun:test";
import { parseMove } from "@/lib/cube";
import { liveCamera, viewAdjustedMove } from "./cube-store";

const HALF_PI = Math.PI / 2;

describe("viewAdjustedMove", () => {
  afterAll(() => {
    liveCamera.azimuth = 0.68;
  });

  test("default guide camera keeps notation as-is", () => {
    liveCamera.azimuth = 0.68;
    for (const token of ["F", "R'", "B2", "U", "D'"]) {
      expect(viewAdjustedMove(token)).toEqual(parseMove(token));
    }
  });

  test("camera orbited to the right side: that side becomes F", () => {
    liveCamera.azimuth = HALF_PI;
    expect(viewAdjustedMove("F")).toEqual(parseMove("R"));
    expect(viewAdjustedMove("R")).toEqual(parseMove("B"));
    expect(viewAdjustedMove("B")).toEqual(parseMove("L"));
    expect(viewAdjustedMove("L")).toEqual(parseMove("F"));
    expect(viewAdjustedMove("F'")).toEqual(parseMove("R'"));
    expect(viewAdjustedMove("F2")).toEqual(parseMove("R2"));
  });

  test("camera behind the cube: back becomes F", () => {
    liveCamera.azimuth = Math.PI;
    expect(viewAdjustedMove("F")).toEqual(parseMove("B"));
    expect(viewAdjustedMove("R")).toEqual(parseMove("L"));
  });

  test("azimuth wraps at negative pi the same as positive pi", () => {
    liveCamera.azimuth = -Math.PI + 0.05;
    expect(viewAdjustedMove("F")).toEqual(parseMove("B"));
  });

  test("camera orbited to the left side", () => {
    liveCamera.azimuth = -HALF_PI;
    expect(viewAdjustedMove("F")).toEqual(parseMove("L"));
    expect(viewAdjustedMove("L")).toEqual(parseMove("B"));
  });

  test("up and down are never remapped", () => {
    liveCamera.azimuth = HALF_PI;
    expect(viewAdjustedMove("U")).toEqual(parseMove("U"));
    expect(viewAdjustedMove("D'")).toEqual(parseMove("D'"));
    expect(viewAdjustedMove("U2")).toEqual(parseMove("U2"));
  });
});
