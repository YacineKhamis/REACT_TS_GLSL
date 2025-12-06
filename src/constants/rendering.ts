/**
 * Rendering and performance constants for the shader application.
 * Centralizes magic numbers and configuration values.
 */

/**
 * Maximum number of segments supported by the shader uniforms.
 * This value must match the shader's MAX_SEGMENTS constant.
 */
export const MAX_SEGMENTS = 20;

/**
 * Maximum number of shape instances per type (circles, waves, etc.).
 * This value must match the shader's MAX_INSTANCES constant.
 */
export const MAX_INSTANCES = 8;

/**
 * Total instance slots for prev + current segment data (8 + 8 = 16).
 * The shader receives data for the previous and current segment only.
 */
export const TOTAL_INSTANCE_SLOTS = 16;

/**
 * Time threshold (in seconds) for detecting timeline loops.
 * When currentTime jumps from near the end to near the beginning,
 * this threshold determines what "near the end" means.
 */
export const LOOP_DETECTION_THRESHOLD = 0.1;
