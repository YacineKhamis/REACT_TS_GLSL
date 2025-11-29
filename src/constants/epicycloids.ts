export const MAX_EPI = 8;

/**
 * Default number of samples for each epicycloid curve. These values
 * mirror the GLSL constant array E_SAMPLES defined in
 * src/shaders/fragment.frag. Keep them in sync when tweaking shader
 * defaults so the UI reflects the correct baseline.
 */
export const DEFAULT_EPI_SAMPLES = [118, 11, 900, 1100, 500, 700, 900, 650];
