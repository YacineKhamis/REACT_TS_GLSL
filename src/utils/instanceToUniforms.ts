/**
 * Adapter layer between the new shape instance system and legacy shapeCounts format.
 * This allows the new UI to work with the existing shader without modifications.
 */

import type {
  ShapeInstanceCollection,
  CircleInstance,
  ExpandingCircleInstance,
  WaveInstance,
  EpicycloidInstance,
} from '../types/shapeInstances';
import type { UniformSet, SegmentConfig } from '../types/config';
import {
  generateInstanceId,
  createEmptyCollection,
} from '../types/shapeInstances';
import {
  getCircleDefaults,
  getExpandingCircleDefaults,
  getWaveDefaults,
  getEpicycloidDefaults,
} from '../constants/shapeDefaults';

/**
 * Convert shape instances to legacy shapeCounts format for shader compatibility.
 * Only counts enabled instances.
 */
export function instancesToShapeCounts(
  instances?: ShapeInstanceCollection
): UniformSet['shapeCounts'] {
  if (!instances) {
    return undefined;
  }

  return {
    circles: instances.circles.filter((c) => c.enabled).length,
    expandingCircles: instances.expandingCircles.filter((c) => c.enabled).length,
    waves: instances.waves.filter((w) => w.enabled).length,
    epicycloids: instances.epicycloids.filter((e) => e.enabled).length,
  };
}

/**
 * Generate default shape instances based on shapeCounts (backward compatibility).
 * Creates instances with default parameters from shader constants.
 */
export function shapeCountsToInstances(
  shapeCounts?: UniformSet['shapeCounts']
): ShapeInstanceCollection {
  if (!shapeCounts) {
    return createEmptyCollection();
  }

  const circles: CircleInstance[] = Array.from(
    { length: shapeCounts.circles ?? 0 },
    (_, i) => ({
      id: generateInstanceId(),
      type: 'circle',
      enabled: true,
      ...getCircleDefaults(i),
    })
  );

  const expandingCircles: ExpandingCircleInstance[] = Array.from(
    { length: shapeCounts.expandingCircles ?? 0 },
    () => ({
      id: generateInstanceId(),
      type: 'expandingCircle',
      enabled: true,
      ...getExpandingCircleDefaults(),
    })
  );

  const waves: WaveInstance[] = Array.from(
    { length: shapeCounts.waves ?? 0 },
    (_, i) => ({
      id: generateInstanceId(),
      type: 'wave',
      enabled: true,
      ...getWaveDefaults(i),
    })
  );

  const epicycloids: EpicycloidInstance[] = Array.from(
    { length: shapeCounts.epicycloids ?? 0 },
    (_, i) => ({
      id: generateInstanceId(),
      type: 'epicycloid',
      enabled: true,
      ...getEpicycloidDefaults(i),
    })
  );

  return {
    circles,
    expandingCircles,
    waves,
    epicycloids,
  };
}

/**
 * Resolve effective shape instances for a segment with priority handling.
 *
 * Priority order:
 * 1. segment.shapeInstances (new format - highest priority)
 * 2. segment.uniformsOverride.shapeCounts (legacy override)
 * 3. projectShapeCounts (global legacy default)
 * 4. Empty collection (no shapes)
 */
export function resolveShapeInstances(
  segment: SegmentConfig,
  projectShapeCounts?: UniformSet['shapeCounts']
): ShapeInstanceCollection {
  // Priority 1: Explicit shape instances (new system)
  if (segment.shapeInstances) {
    return segment.shapeInstances;
  }

  // Priority 2: Segment-level shapeCounts override (legacy)
  if (segment.uniformsOverride?.shapeCounts) {
    return shapeCountsToInstances(segment.uniformsOverride.shapeCounts);
  }

  // Priority 3: Project-level shapeCounts (legacy global)
  if (projectShapeCounts) {
    return shapeCountsToInstances(projectShapeCounts);
  }

  // Priority 4: Empty collection (no shapes defined)
  return createEmptyCollection();
}

/**
 * Create a new circle instance with default values at given index.
 */
export function createCircleInstance(index: number): CircleInstance {
  return {
    id: generateInstanceId(),
    type: 'circle',
    enabled: true,
    ...getCircleDefaults(index),
  };
}

/**
 * Create a new expanding circle instance with default values.
 */
export function createExpandingCircleInstance(): ExpandingCircleInstance {
  return {
    id: generateInstanceId(),
    type: 'expandingCircle',
    enabled: true,
    ...getExpandingCircleDefaults(),
  };
}

/**
 * Create a new wave instance with default values at given index.
 */
export function createWaveInstance(index: number): WaveInstance {
  return {
    id: generateInstanceId(),
    type: 'wave',
    enabled: true,
    ...getWaveDefaults(index),
  };
}

/**
 * Create a new epicycloid instance with default values at given index.
 */
export function createEpicycloidInstance(index: number): EpicycloidInstance {
  return {
    id: generateInstanceId(),
    type: 'epicycloid',
    enabled: true,
    ...getEpicycloidDefaults(index),
  };
}
