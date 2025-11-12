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

const shapeCountsSchema = z.object({
  // Les clés sont optionnelles pour permettre des overrides partiels.
  circles: z.number().optional(),
  waves: z.number().optional(),
  epicycloids: z.number().optional(),
  expandingCircles: z.number().optional(),
});

const tintsSchema = z.object({
  bg: uniformVec3Schema.optional(),
  circles: uniformVec3Schema.optional(),
  waves: uniformVec3Schema.optional(),
  epicycloids: uniformVec3Schema.optional(),
  expandingCircles: uniformVec3Schema.optional(),
});

// UniformSet schema. Nous n'annotons plus explicitement le type afin
// de garder les méthodes Zod (comme .partial()) disponibles. Les
// champs shapeCounts et tints sont eux-mêmes optionnels.
const uniformSetSchema = z.object({
  backgroundColor: uniformVec3Schema,
  circlesIntensity: z.number(),
  wavesIntensity: z.number(),
  epicycloidsIntensity: z.number(),
  expandingCirclesIntensity: z.number(),
  shapeCounts: shapeCountsSchema.optional(),
  tints: tintsSchema.optional(),
});

// Segment schema. Note that startSec and endSec are numbers but
// recalculated when loaded into state.
const segmentConfigSchema = z.object({
  id: z.string(),
  label: z.string(),
  durationSec: z.number().nonnegative(),
  startSec: z.number().nonnegative(),
  endSec: z.number().nonnegative(),
  uniformsOverride: uniformSetSchema.partial().optional(),
});

// Project schema. The list of segments is validated but further
// sanitisation (start/end recalculation) happens in the hook.
export const projectConfigSchema = z.object({
  projectName: z.string(),
  fps: z.number().positive(),
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