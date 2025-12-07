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
 * Metadata for an audio track associated with the project.
 * Stores duration and file info; runtime-only fields (objectUrl) are optional.
 */
export interface AudioTrackInfo {
  /** Original file name (displayed to the user). */
  name: string;
  /** Length in seconds. */
  duration: number;
  /** File size in bytes. */
  size?: number;
  /** MIME type reported by the browser (e.g., audio/mpeg). */
  mimeType?: string;
  /** Last modified timestamp from the File handle. */
  lastModified?: number;
  /** Current availability of the underlying file asset. */
  status: 'ready' | 'missing';
  /** Runtime-only object URL for playback (not persisted). */
  objectUrl?: string;
}

/**
 * User-defined cue/marker on the audio timeline.
 */
export interface AudioCue {
  id: string;
  timeSec: number;
  label: string;
}

/**
 * Project-level maximum shape instance counts.
 * Defines the maximum number of instances allowed per shape type for the entire project.
 * Each segment can then use up to these limits.
 */
export interface ShapeLimits {
  /** Maximum number of fixed circle instances (default: 8) */
  circles: number;
  /** Maximum number of wave instances (default: 8) */
  waves: number;
  /** Maximum number of epicycloid instances (default: 8) */
  epicycloids: number;
  /** Maximum number of expanding circle instances (default: 8) */
  expandingCircles: number;
}

/**
 * A set of uniform values. This object represents the high level
 * parameters used to drive the fragment shader. Optional fields allow
 * segments to override only specific properties without redefining
 * everything. See the fragment shader for how these values map to
 * uniforms such as uIntensitySegX and uTint*.
 *
 * DEPRECATED: Most fields are deprecated in favor of per-instance parameters
 * in ShapeInstanceCollection. Kept for backward compatibility and migration.
 */
export interface UniformSet {
  /**
   * Background colour of the scene.
   * @deprecated Use SegmentConfig.backgroundColor instead (per-segment)
   */
  backgroundColor: UniformVec3;
  /**
   * Master intensity for circular shapes.
   * @deprecated Use CircleInstance.intensity instead (per-instance)
   */
  circlesIntensity?: UniformScalar;
  /**
   * Master intensity for wave shapes.
   * @deprecated Use WaveInstance.intensity instead (per-instance)
   */
  wavesIntensity?: UniformScalar;
  /**
   * Master intensity for epicycloid shapes.
   * @deprecated Use EpicycloidInstance.intensity instead (per-instance)
   */
  epicycloidsIntensity?: UniformScalar;
  /**
   * Master intensity for expanding circles.
   * @deprecated Use ExpandingCircleInstance.intensity instead (per-instance)
   */
  expandingCirclesIntensity?: UniformScalar;
  /**
   * Multiplier applied to the epicycloid sample count. Lowering this
   * value reduces GPU workload at the cost of fidelity.
   */
  epicycloidsSampleFactor?: UniformScalar;
  /**
   * Optional explicit sample counts for each epicycloid instance. When
   * provided, overrides the shader's default E_SAMPLES array. Values
   * are integers representing how many points are evaluated per curve.
   */
  epicycloidsSamples?: number[];
  /**
   * Optional per–shape counts. If provided, the application should
   * propagate these values into the shader's uShapeCountsSeg* uniforms.
   * @deprecated Use shapeInstances.length instead (per-instance counts)
   */
  shapeCounts?: {
    /** Nombre de cercles à dessiner. Si non défini, la valeur par défaut est utilisée. */
    circles?: number;
    /** Nombre de vagues à dessiner. Si non défini, la valeur par défaut est utilisée. */
    waves?: number;
    /** Nombre d'épicycloïdes à dessiner. Si non défini, la valeur par défaut est utilisée. */
    epicycloids?: number;
    /** Nombre de cercles expansifs à dessiner. Si non défini, la valeur par défaut est utilisée. */
    expandingCircles?: number;
  };
  /**
   * Optional tints for each shape category. When undefined, the default
   * colour from the shader remains in effect. Colours are specified as
   * normalised RGB triples.
   * @deprecated Use instance.color instead (per-instance colors)
   */
  tints?: {
    /** Teinte appliquée au fond. Si non défini, aucun effet. */
    bg?: UniformVec3;
    /** Teinte appliquée aux cercles. Si non défini, aucun effet. */
    circles?: UniformVec3;
    /** Teinte appliquée aux vagues. Si non défini, aucun effet. */
    waves?: UniformVec3;
    /** Teinte appliquée aux épicycloïdes. Si non défini, aucun effet. */
    epicycloids?: UniformVec3;
    /** Teinte appliquée aux cercles expansifs. Si non défini, aucun effet. */
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
   * Optional resolution setting (e.g., "1080p", "720p", "4K").
   * Currently for display purposes only.
   */
  resolution?: string;
  /**
   * Project-level maximum shape instance counts.
   * Defines the upper limit for each shape type across all segments.
   */
  maxShapeLimits: ShapeLimits;
  /**
   * Global uniform defaults applied to all segments unless overridden.
   * @deprecated Most fields deprecated in favor of per-segment and per-instance parameters.
   * Kept for backward compatibility and migration.
   */
  uniforms: UniformSet;
  /**
   * List of timeline segments. Segments are stored in sequential order
   * and their start/end times are derived from the cumulative durations.
   */
  segments: SegmentConfig[];
  /**
   * Optional audio track metadata for aligning the timeline.
   */
  audioTrack?: AudioTrackInfo;
  /**
   * When true, the sum of segment durations is clamped to the audio track duration.
   */
  lockToAudioDuration?: boolean;
  /**
   * Collection of audio cues/markers used for snapping and automation.
   */
  audioCues?: AudioCue[];
}

/**
 * Transition profile for smooth shape parameter interpolation.
 * Controls easing behavior and parameter clamping during segment transitions.
 */
export interface TransitionProfile {
  /** Easing function type for interpolation */
  easing: 'linear' | 'easeInOut' | 'slowEase';
  /** Maximum parameter change per second (as fraction of transition duration) */
  paramClamp?: number;
  /** Whether to enforce parameter order constraints */
  enforceOrder?: boolean;
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
   * Duration in seconds for interpolating from the previous segment's values
   * to this segment's values. The transition starts at the beginning of this
   * segment and lasts for the specified duration. Set to 0 for instant transition.
   */
  transitionDuration: number;
  /**
   * Transition profile for smooth shape parameter interpolation.
   * Controls easing and clamping behavior during transitions.
   * Defaults to { easing: 'easeInOut', paramClamp: 0.35 } if not specified.
   */
  transitionProfile?: TransitionProfile;
  /**
   * Background color for this segment. Overrides project-level background.
   */
  backgroundColor: UniformVec3;
  /**
   * Optional global color multiplier/tint applied to all shapes in this segment.
   * If undefined, no tint is applied (values default to [1, 1, 1]).
   */
  tint?: UniformVec3;
  /**
   * Shape instances for this segment with per-instance parameters.
   * This is now REQUIRED and replaces the legacy shapeCounts system.
   */
  shapeInstances: import('./shapeInstances').ShapeInstanceCollection;
  /**
   * Optional overrides for uniforms for this segment. Overrides
   * partially shadow the project's global uniform set. Any fields not
   * specified here fall back to the project's defaults.
   * @deprecated Use per-segment fields (backgroundColor, transitionDuration) and
   * shapeInstances instead. Kept for backward compatibility and migration only.
   */
  uniformsOverride?: Partial<UniformSet>;
}
