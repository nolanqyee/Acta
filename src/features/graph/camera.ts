/**
 * @fileoverview The view onto the graph: what part of world space is on screen.
 *
 * Owning this ourselves (rather than letting a graph library own it) is what makes
 * the rest possible — zoom-gated labels need to know the current scale, hit-testing
 * needs an exact screen→world inverse, and panning must never move the simulation's
 * idea of where the centre is.
 *
 * Convention: the camera looks at a world point (`centerX`/`centerY`) and magnifies by
 * `scale`. World origin `(0, 0)` is where gravity pulls, so a freshly loaded graph is
 * centred by looking at the origin.
 */

/** Zoom limits. Below the minimum a graph is unreadable dust; above the maximum it's a few dots. */
export const MIN_CAMERA_SCALE = 0.15;
export const MAX_CAMERA_SCALE = 6;

/** A rectangle in world units. */
export interface WorldBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * A pan/zoom view onto world space.
 */
export class Camera {
  private centerX = 0;
  private centerY = 0;
  private scale = 1;
  /**
   * Screen-space nudge (CSS px) added to every projected x, so the graph can be pushed
   * clear of a floating panel without changing what world point is "centred" (that stays
   * a physics/fit concern) or which nodes are on screen. Eased toward its target by
   * whoever owns the render loop — the camera itself just applies whatever it's told.
   */
  private focusOffsetX = 0;

  /** @returns Current magnification. 1 means one world unit per CSS pixel. */
  getScale(): number {
    return this.scale;
  }

  /** @returns The current focus offset (CSS px); see {@link focusOffsetX}. */
  getFocusOffset(): number {
    return this.focusOffsetX;
  }

  /**
   * Sets the focus offset directly. Callers own any easing — this just applies it.
   *
   * @param offsetX - Screen-space px to add to every projected x.
   */
  setFocusOffset(offsetX: number): void {
    this.focusOffsetX = offsetX;
  }

  /**
   * Converts a world point to canvas (CSS pixel) coordinates.
   *
   * @param x - World x.
   * @param y - World y.
   * @param viewWidth - Canvas width in CSS pixels.
   * @param viewHeight - Canvas height in CSS pixels.
   * @returns Screen position.
   */
  toScreen(
    x: number,
    y: number,
    viewWidth: number,
    viewHeight: number,
  ): { x: number; y: number } {
    return {
      x: (x - this.centerX) * this.scale + viewWidth / 2 + this.focusOffsetX,
      y: (y - this.centerY) * this.scale + viewHeight / 2,
    };
  }

  /**
   * Converts a canvas point back to world coordinates. Used for hit-testing and drag,
   * so it must be the exact inverse of {@link toScreen}.
   *
   * @param x - Screen x in CSS pixels.
   * @param y - Screen y in CSS pixels.
   * @param viewWidth - Canvas width in CSS pixels.
   * @param viewHeight - Canvas height in CSS pixels.
   * @returns World position.
   */
  toWorld(
    x: number,
    y: number,
    viewWidth: number,
    viewHeight: number,
  ): { x: number; y: number } {
    return {
      x: (x - viewWidth / 2 - this.focusOffsetX) / this.scale + this.centerX,
      y: (y - viewHeight / 2) / this.scale + this.centerY,
    };
  }

  /**
   * Pans by a screen-space delta, so dragging the background moves the graph exactly
   * with the pointer at any zoom.
   *
   * @param deltaX - Screen x movement in CSS pixels.
   * @param deltaY - Screen y movement in CSS pixels.
   */
  panByScreen(deltaX: number, deltaY: number): void {
    this.centerX -= deltaX / this.scale;
    this.centerY -= deltaY / this.scale;
  }

  /**
   * Zooms about a fixed screen point, so the graph appears to scale around the
   * pointer rather than the middle of the canvas.
   *
   * @param factor - Multiplier (>1 zooms in).
   * @param screenX - Screen x to hold still.
   * @param screenY - Screen y to hold still.
   * @param viewWidth - Canvas width in CSS pixels.
   * @param viewHeight - Canvas height in CSS pixels.
   */
  zoomAt(
    factor: number,
    screenX: number,
    screenY: number,
    viewWidth: number,
    viewHeight: number,
  ): void {
    const before = this.toWorld(screenX, screenY, viewWidth, viewHeight);
    this.scale = Math.min(MAX_CAMERA_SCALE, Math.max(MIN_CAMERA_SCALE, this.scale * factor));
    const after = this.toWorld(screenX, screenY, viewWidth, viewHeight);

    this.centerX += before.x - after.x;
    this.centerY += before.y - after.y;
  }

  /**
   * Frames the given bounds with padding — used once the graph has settled, never
   * mid-settle (a view fitted to moving positions lands off-centre).
   *
   * @param bounds - World rectangle to fit.
   * @param viewWidth - Canvas width in CSS pixels.
   * @param viewHeight - Canvas height in CSS pixels.
   * @param padding - Screen-space margin to leave, in CSS pixels.
   * @param screenOffsetX - Post-fit horizontal nudge in CSS px (positive moves the graph right).
   * @param screenOffsetY - Post-fit vertical nudge in CSS px (positive moves the graph down).
   * @param scaleBoost - Multiplier applied after the fit scale (values &gt; 1 zoom in).
   */
  fit(
    bounds: WorldBounds,
    viewWidth: number,
    viewHeight: number,
    padding = 80,
    screenOffsetX = 0,
    screenOffsetY = 0,
    scaleBoost = 1,
  ): void {
    const width = Math.max(1, bounds.maxX - bounds.minX);
    const height = Math.max(1, bounds.maxY - bounds.minY);

    this.centerX = (bounds.minX + bounds.maxX) / 2;
    this.centerY = (bounds.minY + bounds.maxY) / 2;
    this.scale = Math.min(
      MAX_CAMERA_SCALE,
      Math.max(
        MIN_CAMERA_SCALE,
        Math.min(
          (viewWidth - padding * 2) / width,
          (viewHeight - padding * 2) / height,
        ) * scaleBoost,
      ),
    );

    if (screenOffsetX !== 0) {
      this.centerX -= screenOffsetX / this.scale;
    }
    if (screenOffsetY !== 0) {
      this.centerY -= screenOffsetY / this.scale;
    }
  }
}

/**
 * Computes the world rectangle containing every node.
 *
 * @param nodes - Positioned nodes.
 * @returns The bounding box, or a unit box when there are no nodes.
 */
export function boundsOf(nodes: { x: number; y: number }[]): WorldBounds {
  if (nodes.length === 0) return { minX: -1, minY: -1, maxX: 1, maxY: 1 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    if (node.x < minX) minX = node.x;
    if (node.y < minY) minY = node.y;
    if (node.x > maxX) maxX = node.x;
    if (node.y > maxY) maxY = node.y;
  }

  return { minX, minY, maxX, maxY };
}
