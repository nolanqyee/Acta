/**
 * @fileoverview Tests for the camera. These are worth having because every pointer
 * interaction depends on `toWorld` being the exact inverse of `toScreen`: if they
 * drift, dragging a node feels like it slips away from the cursor, and hit-testing
 * misses. That class of bug is invisible in a screenshot and obvious here.
 */

import { describe, expect, it } from "vitest";
import { boundsOf, Camera } from "@/features/graph/engine/camera";

const VIEW = { width: 1200, height: 800 };

describe("Camera", () => {
  it("round-trips screen and world coordinates at any zoom", () => {
    const camera = new Camera();
    camera.zoomAt(2.5, 300, 200, VIEW.width, VIEW.height);
    camera.panByScreen(-140, 60);

    for (const point of [
      { x: 0, y: 0 },
      { x: 137.5, y: -42.25 },
      { x: -980, y: 640 },
    ]) {
      const screen = camera.toScreen(point.x, point.y, VIEW.width, VIEW.height);
      const world = camera.toWorld(screen.x, screen.y, VIEW.width, VIEW.height);
      expect(world.x).toBeCloseTo(point.x, 6);
      expect(world.y).toBeCloseTo(point.y, 6);
    }
  });

  it("holds the pointer's world position still while zooming", () => {
    const camera = new Camera();
    const pointer = { x: 910, y: 145 };
    const before = camera.toWorld(
      pointer.x,
      pointer.y,
      VIEW.width,
      VIEW.height,
    );

    camera.zoomAt(1.8, pointer.x, pointer.y, VIEW.width, VIEW.height);
    const after = camera.toWorld(pointer.x, pointer.y, VIEW.width, VIEW.height);

    expect(after.x).toBeCloseTo(before.x, 6);
    expect(after.y).toBeCloseTo(before.y, 6);
  });

  it("pans by exactly the screen delta, independent of zoom", () => {
    const camera = new Camera();
    camera.zoomAt(3, 0, 0, VIEW.width, VIEW.height);

    const before = camera.toScreen(50, -20, VIEW.width, VIEW.height);
    camera.panByScreen(35, -15);
    const after = camera.toScreen(50, -20, VIEW.width, VIEW.height);

    expect(after.x - before.x).toBeCloseTo(35, 6);
    expect(after.y - before.y).toBeCloseTo(-15, 6);
  });

  it("fits bounds centred, inside the padded viewport", () => {
    const camera = new Camera();
    const bounds = { minX: -400, minY: -100, maxX: 200, maxY: 300 };
    camera.fit(bounds, VIEW.width, VIEW.height, 80);

    const center = camera.toScreen(-100, 100, VIEW.width, VIEW.height);
    expect(center.x).toBeCloseTo(VIEW.width / 2, 6);
    expect(center.y).toBeCloseTo(VIEW.height / 2, 6);

    const corner = camera.toScreen(
      bounds.minX,
      bounds.minY,
      VIEW.width,
      VIEW.height,
    );
    expect(corner.x).toBeGreaterThanOrEqual(80 - 0.001);
    expect(corner.y).toBeGreaterThanOrEqual(80 - 0.001);
  });

  it("measures bounds over every node, and stays sane when there are none", () => {
    expect(
      boundsOf([
        { x: -3, y: 8 },
        { x: 12, y: -4 },
      ]),
    ).toEqual({
      minX: -3,
      minY: -4,
      maxX: 12,
      maxY: 8,
    });
    expect(boundsOf([])).toEqual({ minX: -1, minY: -1, maxX: 1, maxY: 1 });
  });
});
