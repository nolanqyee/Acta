/**
 * @fileoverview React hook wiring slide-scroll controller to landing page refs.
 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  createLandingScrollController,
  type LandingScrollController,
  type LandingSlideId,
} from "./landing-scroll";

/**
 * Binds slide-style section navigation to a track + slide ref list.
 *
 * @param disabled - When true (e.g. reduced motion), native scroll and anchors only.
 * @returns Refs, active index, and nav helpers for the landing page shell.
 */
export function useLandingScroll(disabled: boolean) {
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const controllerRef = useRef<LandingScrollController | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const setSlideRef =
    (index: number) =>
    (node: HTMLElement | null): void => {
      slideRefs.current[index] = node;
    };

  useEffect(() => {
    const track = trackRef.current;
    const slides = slideRefs.current.filter(
      (node): node is HTMLElement => node !== null,
    );
    if (!track || slides.length === 0) return;

    const { controller, destroy } = createLandingScrollController({
      track,
      slides,
      disabled,
      onIndexChange: setActiveIndex,
    });
    controllerRef.current = controller;

    return () => {
      destroy();
      controllerRef.current = null;
    };
  }, [disabled]);

  const onNavClick =
    (id: LandingSlideId) =>
    (event: React.MouseEvent<HTMLAnchorElement>): void => {
      controllerRef.current?.onNavClick(id)(event);
    };

  const goToId = (id: LandingSlideId): void => {
    controllerRef.current?.goToId(id);
  };

  return {
    trackRef,
    setSlideRef,
    activeIndex,
    slideMode: !disabled,
    onNavClick,
    goToId,
  };
}
