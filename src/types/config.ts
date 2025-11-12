/**
 * Definitions of configuration types for the GLSL timeline project.
 *
 * These types describe the shape of the project state that is persisted
 * to disk (JSON) and used throughout the React application. The goal is
 * to keep configuration data serialisable and declarative. Values that
 * must be reconstructed at runtime (e.g. THREE.Color) are handled
 * elsewhere when uniforms are resolved.
 */

/**
 * A scalar uniform value. Many shader intensities are single numbers.
 */
export type UniformScalar = number;

/**
 * A three‑component colour. Values are normalised between 0 and 1.
 */
export type UniformVec3 = [number, number, number];

/**
 * A set of uniform values. This object represents the high level
 * parameters used to drive the fragment shader. Optional fields allow
 * segments to override only specific properties without redefining
 * everything. See the fragment shader for how these values map to
 * uniforms such as uIntensitySegX and uTint*.
 */
export interface UniformSet {
  /**
   * Background colour of the scene.
   */
  backgroundColor: UniformVec3;
  /**
   * Master intensity for circular shapes.
   */
  circlesIntensity: UniformScalar;
  /**
   * Master intensity for wave shapes.
   */
  wavesIntensity: UniformScalar;
  /**
   * Master intensity for epicycloid shapes.
   */
  epicycloidsIntensity: UniformScalar;
  /**
   * Master intensity for expanding circles.
   */
  expandingCirclesIntensity: UniformScalar;
  /**
   * Optional per–shape counts. If provided, the application should
   * propagate these values into the shader's uShapeCountsSeg* uniforms.
   */
  shapeCounts?: {
    circles: number;
    waves: number;
    epicycloids: number;
    expandingCircles: number;
  };
  /**
   * Optional tints for each shape category. When undefined, the default
   * colour from the shader remains in effect. Colours are specified as
   * normalised RGB triples.
   */
  tints?: {
    bg?: UniformVec3;
    circles?: UniformVec3;
    waves?: UniformVec3;
    epicycloids?: UniformVec3;
    expandingCircles?: UniformVec3;
  };
}

/**
 * Top–level configuration of a project. A project describes an entire
 * timeline composed of multiple segments, along with global uniforms and
 * metadata such as the desired frame rate and project name.
 */
export interface ProjectConfig {
  /**
   * Friendly name of the project. Displayed to the user and persisted
   * alongside the configuration.
   */
  projectName: string;
  /**
   * Frames per second. Used to convert frame increments into seconds
   * when advancing the timeline.
   */
  fps: number;
  /**
   * Global uniform defaults applied to all segments unless overridden.
   */
  uniforms: UniformSet;
  /**
   * List of timeline segments. Segments are stored in sequential order
   * and their start/end times are derived from the cumulative durations.
   */
  segments: SegmentConfig[];
}

/**
 * Description of a single timeline segment. Each segment has its own
 * label, duration and optional uniform overrides. When parsed or
 * manipulated via the state hook, startSec and endSec are recomputed
 * based on the order of segments to ensure a coherent, linear
 * progression without overlaps or gaps.
 */
export interface SegmentConfig {
  /**
   * A unique identifier for the segment. Useful for React keying and
   * persistence. Can be generated via crypto.randomUUID() or any other
   * sufficiently unique strategy.
   */
  id: string;
  /**
   * A human readable name for the segment. Displayed in the UI.
   */
  label: string;
  /**
   * Length of the segment in seconds. Editable by the user.
   */
  durationSec: number;
  /**
   * Start timestamp of the segment in seconds. Calculated by summing
   * durations of all previous segments. Not editable directly.
   */
  startSec: number;
  /**
   * End timestamp of the segment in seconds. Equivalent to
   * startSec + durationSec. Not editable directly.
   */
  endSec: number;
  /**
   * Optional overrides for uniforms for this segment. Overrides
   * partially shadow the project's global uniform set. Any fields not
   * specified here fall back to the project's defaults.
   */
  uniformsOverride?: Partial<UniformSet>;
}