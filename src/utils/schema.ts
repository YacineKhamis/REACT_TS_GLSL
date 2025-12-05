/**
 * Zod schemas for validating project configuration files. Parsing user
 * provided JSON through these schemas ensures that the imported data
 * matches our expectations and fills in optional fields. If the
 * validation fails, an exception is thrown which can then be caught and
 * reported to the user.
 */

import { z } from 'zod';
import type { ProjectConfig } from '../types/config';

// Primitive schemas
const uniformVec3Schema = z.tuple([z.number(), z.number(), z.number()]);

// Shape instance schemas (new system)
const circleInstanceSchema = z.object({
  id: z.string(),
  type: z.literal('circle'),
  enabled: z.boolean(),
  radius: z.number(),
  thickness: z.number(),
  glow: z.number(),
  intensity: z.number(),
  color: uniformVec3Schema,
});

const expandingCircleInstanceSchema = z.object({
  id: z.string(),
  type: z.literal('expandingCircle'),
  enabled: z.boolean(),
  startRadius: z.number(),
  period: z.number(),
  thickness: z.number(),
  glow: z.number(),
  maxRadius: z.number(),
  startTime: z.number(),
  intensity: z.number(),
  color: uniformVec3Schema,
});

const waveInstanceSchema = z.object({
  id: z.string(),
  type: z.literal('wave'),
  enabled: z.boolean(),
  amplitude: z.number(),
  frequency: z.number(),
  speed: z.number(),
  thickness: z.number(),
  glow: z.number(),
  intensity: z.number(),
  color: uniformVec3Schema,
});

const epicycloidInstanceSchema = z.object({
  id: z.string(),
  type: z.literal('epicycloid'),
  enabled: z.boolean(),
  R: z.number(),
  r: z.number(),
  scale: z.number(),
  thickness: z.number(),
  speed: z.number(),
  glow: z.number(),
  samples: z.number().int().min(1),
  intensity: z.number(),
  color: uniformVec3Schema,
});

const shapeInstanceCollectionSchema = z.object({
  circles: z.array(circleInstanceSchema),
  expandingCircles: z.array(expandingCircleInstanceSchema),
  waves: z.array(waveInstanceSchema),
  epicycloids: z.array(epicycloidInstanceSchema),
});

// UniformSet schema (v2) - cleaned up to only include non-deprecated fields.
// Per-instance intensity and colors are now in shapeInstances.
const uniformSetSchema = z.object({
  backgroundColor: uniformVec3Schema,
  epicycloidsSampleFactor: z.number(),
});

// Segment schema (v2). uniformsOverride removed - now uses shapeInstances only.
const segmentConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  durationSec: z.number().nonnegative(),
  startSec: z.number().nonnegative(),
  endSec: z.number().nonnegative(),
  transitionDuration: z.number().nonnegative(),
  backgroundColor: uniformVec3Schema,
  tint: uniformVec3Schema.optional(),
  shapeInstances: shapeInstanceCollectionSchema,
});

// Shape limits schema (max instances per type)
export const shapeLimitsSchema = z.object({
  circles: z.number().int().nonnegative(),
  waves: z.number().int().nonnegative(),
  epicycloids: z.number().int().nonnegative(),
  expandingCircles: z.number().int().nonnegative(),
});

// Project schema (v2). The list of segments is validated but further
// sanitisation (start/end recalculation) happens in the hook.
export const projectConfigSchema = z.object({
  version: z.number().int().optional(), // Optional for backward compatibility
  projectName: z.string(),
  fps: z.number().positive(),
  maxShapeLimits: shapeLimitsSchema,
  uniforms: uniformSetSchema,
  segments: z.array(segmentConfigSchema),
});

/**
 * Parse an unknown JSON value into a ProjectConfig. Throws if the
 * structure does not conform to the expected schema. Consumers
 * should catch and handle ZodError appropriately. After parsing,
 * further normalisation (start/end recomputation) is performed by
 * the project state hook.
 */
export function parseProjectConfig(data: unknown): ProjectConfig {
  // parse will throw a ZodError on invalid input
  return projectConfigSchema.parse(data);
}
