import type { UniformSet } from '../types/config';

/**
 * Remove undefined values from a partial object. This is necessary to
 * prevent undefined values from overwriting defaults when merging.
 */
export function cleanPartialUniformSet<T extends Partial<UniformSet>>(
  partial: T
): Partial<UniformSet> {
  const cleaned: Partial<UniformSet> = {};

  (Object.keys(partial) as Array<keyof UniformSet>).forEach((key) => {
    const value = partial[key];
    if (value !== undefined) {
      // Using type assertion here is safe because we're just copying existing values
      (cleaned as Record<string, unknown>)[key] = value;
    }
  });

  return cleaned;
}

/**
 * Merge two uniform sets, giving precedence to override values. Nested
 * objects (shapeCounts and tints) are merged shallowly. Scalar and
 * vector properties override directly when defined.
 */
export function mergeUniformSets(
  base: UniformSet,
  override?: Partial<UniformSet>
): UniformSet {
  if (!override) return base;

  const cleaned = cleanPartialUniformSet(override);

  return {
    ...base,
    ...cleaned,
    shapeCounts: {
      ...(base.shapeCounts ?? {}),
      ...(cleaned.shapeCounts ?? {}),
    },
    tints: {
      ...(base.tints ?? {}),
      ...(cleaned.tints ?? {}),
    },
  };
}

/**
 * Type guard to check if a key is a scalar uniform key
 */
export function isScalarKey(key: keyof UniformSet): key is
  | 'circlesIntensity'
  | 'wavesIntensity'
  | 'epicycloidsIntensity'
  | 'expandingCirclesIntensity'
  | 'epicycloidsSampleFactor' {
  return [
    'circlesIntensity',
    'wavesIntensity',
    'epicycloidsIntensity',
    'expandingCirclesIntensity',
    'epicycloidsSampleFactor',
  ].includes(key);
}

/**
 * Type guard to check if a key is a color (Vec3) uniform key
 */
export function isColorKey(key: keyof UniformSet): key is 'backgroundColor' {
  return key === 'backgroundColor';
}

/**
 * Type guard to check if a key is the shapeCounts key
 */
export function isShapeCountsKey(key: keyof UniformSet): key is 'shapeCounts' {
  return key === 'shapeCounts';
}

/**
 * Type guard to check if a key is the tints key
 */
export function isTintsKey(key: keyof UniformSet): key is 'tints' {
  return key === 'tints';
}
