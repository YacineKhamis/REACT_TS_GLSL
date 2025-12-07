/**
 * Migration utilities for converting old project formats to the latest version.
 * Ensures backward compatibility when loading projects saved with previous schemas.
 */

import type { ProjectConfig, SegmentConfig, ShapeLimits } from '../types/config';
import { shapeCountsToInstances } from './instanceToUniforms';
import { EXPANDING_CIRCLE_DEFAULTS } from '../constants/shapeDefaults';

/** Current migration version */
const MIGRATION_VERSION = 2;

/**
 * Default project-level shape limits (matches shader MAX constants).
 */
const DEFAULT_SHAPE_LIMITS: ShapeLimits = {
  circles: 8,
  waves: 8,
  epicycloids: 8,
  expandingCircles: 8,
};

/**
 * Migrates a project configuration to the latest version.
 * Handles conversion from legacy shapeCounts/master intensity system
 * to the new per-instance intensity + color system.
 *
 * @param data - Raw project data (possibly from old version)
 * @returns Migrated ProjectConfig conforming to version 2
 */
export function migrateProject(data: Record<string, unknown>): ProjectConfig {
  // Already at current version
  if (data.version === MIGRATION_VERSION) {
    return data as unknown as ProjectConfig;
  }

  console.log(`Migrating project from version ${data.version ?? 1} to ${MIGRATION_VERSION}`);

  // Add maxShapeLimits if missing (v1 → v2)
  if (!data.maxShapeLimits) {
    data.maxShapeLimits = { ...DEFAULT_SHAPE_LIMITS };
  }

  // Migrate all segments
  const projectUniforms = data.uniforms as Record<string, unknown>;
  data.segments = (data.segments as Record<string, unknown>[]).map((seg) =>
    migrateSegment(seg, projectUniforms)
  );

  // Clean uniforms - keep only non-deprecated fields
  data.uniforms = {
    backgroundColor: projectUniforms?.backgroundColor ?? [0, 0, 0],
    epicycloidsSampleFactor: projectUniforms?.epicycloidsSampleFactor ?? 1,
  };

  // Ensure new audio lock and cues defaults
  if (data.lockToAudioDuration === undefined) {
    data.lockToAudioDuration = false;
  }
  if (!data.audioCues) {
    data.audioCues = [];
  }

  // Update version
  data.version = MIGRATION_VERSION;

  return data as unknown as ProjectConfig;
}

/**
 * Migrates a single segment from v1 to v2 format.
 *
 * Changes:
 * - Adds transitionDuration (default: 1.0s)
 * - Adds backgroundColor (from uniformsOverride or project default)
 * - Converts shapeCounts → shapeInstances with per-instance intensity/color
 * - Applies old master intensities to all instances
 * - Applies old tints as instance colors
 *
 * @param seg - Segment data (v1 format)
 * @param projectUniforms - Project-level uniforms for fallback values
 * @returns Migrated segment conforming to v2 SegmentConfig
 */
function migrateSegment(
  seg: Record<string, unknown>,
  projectUniforms: Record<string, unknown>
): SegmentConfig {
  // Add transitionDuration if missing
  if (seg.transitionDuration === undefined) {
    seg.transitionDuration = 1.0;
  }

  // Ensure transition profile defaults
  if (!seg.transitionProfile) {
    seg.transitionProfile = {
      easing: 'easeInOut',
      paramClamp: 0.35,
    };
  }

  // Add backgroundColor (prefer segment override, fallback to project)
  if (!seg.backgroundColor) {
    const override = seg.uniformsOverride as Record<string, unknown> | undefined;
    seg.backgroundColor =
      override?.backgroundColor ?? projectUniforms?.backgroundColor ?? [0, 0, 0];
  }

  // Convert shapeCounts → shapeInstances if not already migrated
  if (!seg.shapeInstances) {
    const override = seg.uniformsOverride as Record<string, unknown> | undefined;

    // Extract shape counts (prefer segment, fallback to project, then defaults)
    const shapeCounts =
      (override?.shapeCounts as Record<string, number> | undefined) ??
      (projectUniforms?.shapeCounts as Record<string, number> | undefined) ?? {
        circles: 3,
        waves: 3,
        epicycloids: 2,
        expandingCircles: 2,
      };

    // Generate base instances with default parameters
    seg.shapeInstances = shapeCountsToInstances(shapeCounts);

    // Extract old master intensities
    const oldIntensities = {
      circles:
        (override?.circlesIntensity as number | undefined) ??
        (projectUniforms?.circlesIntensity as number | undefined) ??
        0.5,
      waves:
        (override?.wavesIntensity as number | undefined) ??
        (projectUniforms?.wavesIntensity as number | undefined) ??
        0.5,
      epicycloids:
        (override?.epicycloidsIntensity as number | undefined) ??
        (projectUniforms?.epicycloidsIntensity as number | undefined) ??
        0.5,
      expandingCircles:
        (override?.expandingCirclesIntensity as number | undefined) ??
        (projectUniforms?.expandingCirclesIntensity as number | undefined) ??
        0.5,
    };

    // Extract old tints
    const oldTints =
      (override?.tints as Record<string, [number, number, number]> | undefined) ??
      (projectUniforms?.tints as Record<string, [number, number, number]> | undefined) ??
      {};

    const instances = seg.shapeInstances as Record<string, Record<string, unknown>[]>;

    // Apply master intensity and tint to circles
    instances.circles?.forEach((circle) => {
      circle.intensity = oldIntensities.circles;
      if (oldTints.circles) {
        const baseColor = circle.color as [number, number, number];
        circle.color = [
          baseColor[0] * oldTints.circles[0],
          baseColor[1] * oldTints.circles[1],
          baseColor[2] * oldTints.circles[2],
        ];
      }
      if (circle.shape === undefined) {
        circle.shape = 'circle';
      }
      if (circle.rotationSpeed === undefined) {
        circle.rotationSpeed = 0;
      }
    });

    // Apply master intensity and tint to waves
    instances.waves?.forEach((wave) => {
      wave.intensity = oldIntensities.waves;
      wave.color = oldTints.waves
        ? [oldTints.waves[0], oldTints.waves[1], oldTints.waves[2]]
        : [1, 1, 1];
    });

    // Apply master intensity and tint to epicycloids
    instances.epicycloids?.forEach((epi) => {
      epi.intensity = oldIntensities.epicycloids;
      epi.color = oldTints.epicycloids
        ? [oldTints.epicycloids[0], oldTints.epicycloids[1], oldTints.epicycloids[2]]
        : [1, 1, 1];
    });

    // Apply master intensity and color to expanding circles
    instances.expandingCircles?.forEach((expand) => {
      expand.intensity = oldIntensities.expandingCircles;
      expand.color = [1, 0.647, 0]; // Orange (default expand color from shader)
      expand.startRadius = 0; // NEW field - all expanding circles started at radius 0 in v1
      if (expand.shape === undefined) {
        expand.shape = EXPANDING_CIRCLE_DEFAULTS.shape;
      }
      if (expand.pulseMode === undefined) {
        expand.pulseMode = EXPANDING_CIRCLE_DEFAULTS.pulseMode;
      }
      if (expand.attack === undefined) {
        expand.attack = EXPANDING_CIRCLE_DEFAULTS.attack;
      }
      if (expand.decay === undefined) {
        expand.decay = EXPANDING_CIRCLE_DEFAULTS.decay;
      }
      // Migrate maxRadius → expansionSpeed
      if ('maxRadius' in expand && expand.maxRadius !== undefined) {
        const oldPeriod = (expand.period as number) || 41.74;
        const oldMaxRadius = expand.maxRadius as number;
        expand.expansionSpeed = oldMaxRadius / oldPeriod;
        expand.period = 10.0; // Update to new default period
        delete expand.maxRadius;
      } else if (expand.expansionSpeed === undefined) {
        expand.expansionSpeed = EXPANDING_CIRCLE_DEFAULTS.expansionSpeed;
      }
      if (expand.period === undefined) {
        expand.period = EXPANDING_CIRCLE_DEFAULTS.period;
      }
    });
  }

  // Ensure expanding circle defaults even if shapeInstances already existed
  const instances = seg.shapeInstances as Record<string, Record<string, unknown>[]> | undefined;
  instances?.expandingCircles?.forEach((expand) => {
    if (expand.shape === undefined) {
      expand.shape = EXPANDING_CIRCLE_DEFAULTS.shape;
    }
    if (expand.pulseMode === undefined) {
      expand.pulseMode = EXPANDING_CIRCLE_DEFAULTS.pulseMode;
    }
    if (expand.attack === undefined) {
      expand.attack = EXPANDING_CIRCLE_DEFAULTS.attack;
    }
    if (expand.decay === undefined) {
      expand.decay = EXPANDING_CIRCLE_DEFAULTS.decay;
    }
    // Migrate maxRadius → expansionSpeed (for projects that already had shapeInstances)
    if ('maxRadius' in expand && expand.maxRadius !== undefined) {
      const oldPeriod = (expand.period as number) || 41.74;
      const oldMaxRadius = expand.maxRadius as number;
      expand.expansionSpeed = oldMaxRadius / oldPeriod;
      expand.period = 10.0; // Update to new default period
      delete expand.maxRadius;
    } else if (expand.expansionSpeed === undefined) {
      expand.expansionSpeed = EXPANDING_CIRCLE_DEFAULTS.expansionSpeed;
    }
    if (expand.period === undefined) {
      expand.period = EXPANDING_CIRCLE_DEFAULTS.period;
    }
  });

  // Remove deprecated uniformsOverride
  delete seg.uniformsOverride;

  return seg as unknown as SegmentConfig;
}
