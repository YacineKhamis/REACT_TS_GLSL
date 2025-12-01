/**
 * Default values for shape instances, extracted from shader constants.
 * These values are used when creating new shape instances in the UI.
 */

// Maximum instances per shape type (from shader)
export const MAX_CIRCLES = 8;
export const MAX_EXPANDING_CIRCLES = 8;
export const MAX_WAVES = 8;
export const MAX_EPICYCLOIDS = 8;

// Circle defaults (from C_R, C_THICK, C_GLOW arrays)
export const CIRCLE_DEFAULTS = {
  radius: [0.01, 0.06, 0.06, 0.45, 0.44, 0.16, 0.9, 0.95],
  thickness: [0.0005, 0.0006, 0.0005, 0.0005, 0.0005, 0.0002, 0.0004, 0.0009],
  glow: [1.5, 0.85, 0.1, 1.3, 0.2, 0.9, 0.6, 1.7],
};

// Expanding Circle defaults (from EXPAND_* constants)
export const EXPANDING_CIRCLE_DEFAULTS = {
  period: 41.74,
  thickness: 0.0001,
  glow: 3.5,
  maxRadius: 1.5,
  startTime: 0, // Offset within segment
};

// Wave defaults (from W_AMP, W_FREQ, W_SPEED, W_THICK arrays)
export const WAVE_DEFAULTS = {
  amplitude: [0.3, 0.1, 0.15, 0.35, 0.25, 0.78, 0.32, 0.38],
  frequency: [0.3, 0.56, 0.62, 0.5, 0.65, 0.75, 0.8, 0.55],
  speed: [0.2, 0.15, 0.1, 0.18, 0.12, 0.16, 0.22, 0.14],
  thickness: [0.001, 0.004, 0.006, 0.003, 0.005, 0.05, 0.0035, 0.0045],
};

// Epicycloid defaults (from E_R, E_r, E_SCALE, E_THICK, E_SPEED, E_GLOW arrays)
export const EPICYCLOID_DEFAULTS = {
  R: [7.19, 1.85, 13.5, 20.0, 14.3, 9.1, 5.8, 7.5],
  r: [-3.03, 0.506, -3.94, 7.0, -3.5, 5.5, -4.0, 6.5],
  scale: [0.0075, 0.045, 0.031, 0.025, 0.04, 0.03, 0.038, 0.028],
  thickness: [0.0005, 0.001, 0.0005, 0.0006, 0.0004, 0.0005, 0.0006, 0.0005],
  speed: [0.09, 0.18, 0.035, 0.042, 0.028, 0.038, 0.045, 0.032],
  glow: [0.25, 1.0, 0.75, 1.5, 0.8, 0.85, 0.68, 0.78],
  samples: 100, // Default sample count
};

/**
 * Get default values for a circle instance at given index
 */
export function getCircleDefaults(index: number) {
  const i = Math.min(index, MAX_CIRCLES - 1);
  return {
    radius: CIRCLE_DEFAULTS.radius[i],
    thickness: CIRCLE_DEFAULTS.thickness[i],
    glow: CIRCLE_DEFAULTS.glow[i],
    color: [1, 1, 1] as [number, number, number], // White by default
  };
}

/**
 * Get default values for an expanding circle instance
 */
export function getExpandingCircleDefaults() {
  return {
    period: EXPANDING_CIRCLE_DEFAULTS.period,
    thickness: EXPANDING_CIRCLE_DEFAULTS.thickness,
    glow: EXPANDING_CIRCLE_DEFAULTS.glow,
    maxRadius: EXPANDING_CIRCLE_DEFAULTS.maxRadius,
    startTime: EXPANDING_CIRCLE_DEFAULTS.startTime,
  };
}

/**
 * Get default values for a wave instance at given index
 */
export function getWaveDefaults(index: number) {
  const i = Math.min(index, MAX_WAVES - 1);
  return {
    amplitude: WAVE_DEFAULTS.amplitude[i],
    frequency: WAVE_DEFAULTS.frequency[i],
    speed: WAVE_DEFAULTS.speed[i],
    thickness: WAVE_DEFAULTS.thickness[i],
  };
}

/**
 * Get default values for an epicycloid instance at given index
 */
export function getEpicycloidDefaults(index: number) {
  const i = Math.min(index, MAX_EPICYCLOIDS - 1);
  return {
    R: EPICYCLOID_DEFAULTS.R[i],
    r: EPICYCLOID_DEFAULTS.r[i],
    scale: EPICYCLOID_DEFAULTS.scale[i],
    thickness: EPICYCLOID_DEFAULTS.thickness[i],
    speed: EPICYCLOID_DEFAULTS.speed[i],
    glow: EPICYCLOID_DEFAULTS.glow[i],
    samples: EPICYCLOID_DEFAULTS.samples,
  };
}
