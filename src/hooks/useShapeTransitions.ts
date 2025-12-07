/**
 * Hook for smooth shape transitions between segments.
 * Applies easing and parameter clamping to reduce visual artifacts during transitions,
 * especially for epicycloids with large parameter differences.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import type { SegmentConfig, TransitionProfile } from '../types/config';
import type {
  EpicycloidInstance,
  ShapeInstanceCollection
} from '../types/shapeInstances';

/**
 * Smoothed segment state with transition progress tracking.
 */
export interface SmoothedSegmentState {
  segment: SegmentConfig;
  shapeInstances: ShapeInstanceCollection;
  transitionProgress: number; // 0-1, where 1 means transition complete
}

/**
 * Default transition profile if not specified.
 */
const DEFAULT_PROFILE: Required<TransitionProfile> = {
  easing: 'easeInOut',
  paramClamp: 0.35,
  enforceOrder: false,
};

/**
 * Easing function: linear interpolation.
 */
function easeLinear(t: number): number {
  return t;
}

/**
 * Easing function: ease in-out using smoothstep.
 */
function easeInOut(t: number): number {
  return t * t * (3 - 2 * t); // smoothstep
}

/**
 * Easing function: slow ease with cubic smoothing.
 */
function easeSlowEase(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10); // smootherstep
}

/**
 * Get the easing function based on profile.
 */
function getEasingFunction(easing: TransitionProfile['easing']): (t: number) => number {
  switch (easing) {
    case 'linear':
      return easeLinear;
    case 'easeInOut':
      return easeInOut;
    case 'slowEase':
      return easeSlowEase;
    default:
      return easeInOut;
  }
}

/**
 * Interpolate epicycloid instance parameters with smoothed progress scaling.
 * Uses paramClamp to slow down large parameter changes, preventing visual artifacts.
 */
function interpolateEpicycloid(
  prev: EpicycloidInstance,
  next: EpicycloidInstance,
  progress: number,
  profile: Required<TransitionProfile>
): EpicycloidInstance {
  // Apply easing function
  let easedProgress = getEasingFunction(profile.easing)(progress);

  // Calculate the maximum relative change across critical parameters
  const maxRelativeChange = Math.max(
    Math.abs(next.R - prev.R) / Math.max(prev.R, 0.01),
    Math.abs(next.r - prev.r) / Math.max(prev.r, 0.01),
    Math.abs(next.scale - prev.scale) / Math.max(prev.scale, 0.01),
  );

  // If the change is large, slow down the effective progress based on paramClamp
  // paramClamp acts as a "slowness factor": lower values = slower for large changes
  if (maxRelativeChange > profile.paramClamp) {
    const slowdownFactor = profile.paramClamp / maxRelativeChange;
    easedProgress = easedProgress * slowdownFactor + (1 - slowdownFactor) * progress * progress;
  }

  // Simple linear interpolation for all parameters
  const R = THREE.MathUtils.lerp(prev.R, next.R, easedProgress);
  const r = THREE.MathUtils.lerp(prev.r, next.r, easedProgress);
  const scale = THREE.MathUtils.lerp(prev.scale, next.scale, easedProgress);
  const speed = THREE.MathUtils.lerp(prev.speed, next.speed, easedProgress);
  const thickness = THREE.MathUtils.lerp(prev.thickness, next.thickness, easedProgress);

  // Lerp samples count (rounded to integer)
  const samples = Math.round(THREE.MathUtils.lerp(prev.samples, next.samples, easedProgress));

  // Simple lerp for other properties
  const glow = THREE.MathUtils.lerp(prev.glow, next.glow, easedProgress);
  const intensity = THREE.MathUtils.lerp(prev.intensity, next.intensity, easedProgress);

  // Color interpolation
  const color: [number, number, number] = [
    THREE.MathUtils.lerp(prev.color[0], next.color[0], easedProgress),
    THREE.MathUtils.lerp(prev.color[1], next.color[1], easedProgress),
    THREE.MathUtils.lerp(prev.color[2], next.color[2], easedProgress),
  ];

  return {
    ...next,
    R,
    r,
    scale,
    speed,
    thickness,
    samples,
    glow,
    intensity,
    color,
  };
}

/**
 * Hook that produces smoothed segment states with transition handling.
 *
 * @param segments - Array of segment configurations
 * @param currentTime - Current playback time in seconds
 * @param currentSegmentIndex - Index of the current segment
 * @returns Smoothed segment state for the current time
 */
export function useShapeTransitions(
  segments: SegmentConfig[],
  currentTime: number,
  currentSegmentIndex: number
): SmoothedSegmentState | null {
  return useMemo(() => {
    if (segments.length === 0 || currentSegmentIndex < 0) {
      return null;
    }

    const currentSegment = segments[currentSegmentIndex];
    if (!currentSegment) {
      return null;
    }

    // Get transition profile with defaults
    const profile: Required<TransitionProfile> = {
      ...DEFAULT_PROFILE,
      ...currentSegment.transitionProfile,
    };

    // Calculate transition progress
    const transitionDuration = currentSegment.transitionDuration;
    const timeInSegment = currentTime - currentSegment.startSec;
    const transitionProgress = transitionDuration > 0
      ? Math.min(1, Math.max(0, timeInSegment / transitionDuration))
      : 1;

    // If no transition or transition complete, return current segment as-is
    if (transitionDuration === 0 || transitionProgress >= 1 || currentSegmentIndex === 0) {
      return {
        segment: currentSegment,
        shapeInstances: currentSegment.shapeInstances,
        transitionProgress: 1,
      };
    }

    // Get previous segment for interpolation
    const prevSegment = segments[currentSegmentIndex - 1];
    if (!prevSegment) {
      return {
        segment: currentSegment,
        shapeInstances: currentSegment.shapeInstances,
        transitionProgress: 1,
      };
    }

    // Interpolate epicycloid instances with clamping
    const smoothedEpicycloids = currentSegment.shapeInstances.epicycloids.map((curr, idx) => {
      const prev = prevSegment.shapeInstances.epicycloids[idx];
      if (!prev) return curr;

      return interpolateEpicycloid(prev, curr, transitionProgress, profile);
    });

    // For other shape types, use simple lerp (no clamping needed)
    const smoothedShapeInstances: ShapeInstanceCollection = {
      ...currentSegment.shapeInstances,
      epicycloids: smoothedEpicycloids,
    };

    return {
      segment: currentSegment,
      shapeInstances: smoothedShapeInstances,
      transitionProgress,
    };
  }, [segments, currentTime, currentSegmentIndex]);
}
