import { useState, useCallback, useMemo } from 'react';
import type {
  ProjectConfig,
  SegmentConfig,
  UniformSet,
  UniformVec3,
  ShapeLimits,
} from '../types/config';
import type { ShapeInstanceCollection } from '../types/shapeInstances';
import { parseProjectConfig } from '../utils/schema';
import { mergeUniformSets, cleanPartialUniformSet } from '../utils/uniformHelpers';
import { migrateProject } from '../utils/migration';
import { createEmptyCollection } from '../types/shapeInstances';

/**
 * Utility to generate a pseudo‑unique ID for segments. Using
 * crypto.randomUUID() would be ideal but is not universally available.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

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
 * Default transition duration for new segments (in seconds).
 */
const DEFAULT_SEGMENT_TRANSITION = 1.0;

/**
 * Default global uniform values (DEPRECATED - kept for backward compatibility).
 * Most of these are replaced by per-segment and per-instance parameters.
 */
const DEFAULT_UNIFORMS: UniformSet = {
  backgroundColor: [0, 0, 0], // Fallback only
  epicycloidsSampleFactor: 1,
};

/**
 * Create a minimal project configuration for new documents. The
 * timeline starts with one 10‑second segment with empty shape instances.
 */
function createDefaultProject(): ProjectConfig {
  const segment: SegmentConfig = {
    id: generateId(),
    label: 'Segment 0',
    durationSec: 10,
    startSec: 0,
    endSec: 10,
    transitionDuration: DEFAULT_SEGMENT_TRANSITION,
    backgroundColor: [0, 0, 0],
    shapeInstances: createEmptyCollection(),
  };
  return {
    projectName: 'Untitled',
    fps: 60,
    maxShapeLimits: { ...DEFAULT_SHAPE_LIMITS },
    uniforms: { ...DEFAULT_UNIFORMS },
    segments: [segment],
  };
}

/**
 * Recalculate segment start and end times based on the order of the
 * array and their durations. This ensures that the timeline is always
 * contiguous and non‑overlapping. Does not mutate the original objects.
 */
function recalcSegmentTimes(segments: SegmentConfig[]): SegmentConfig[] {
  let acc = 0;
  return segments.map(seg => {
    const startSec = acc;
    const endSec = acc + seg.durationSec;
    acc = endSec;
    return { ...seg, startSec, endSec };
  });
}


/**
 * Custom hook encapsulating the logic for managing a project's state. It
 * handles immutable updates to the project configuration, automatic
 * recalculation of segment times, and derived values such as total
 * duration. It also exposes helpers for saving/loading JSON and
 * resolving the uniform set for a given playback time.
 */
export function useProjectState(initialConfig?: ProjectConfig) {
  const [config, setConfig] = useState<ProjectConfig>(() => {
    if (initialConfig) {
      // Ensure segment times are coherent on initial load
      return { ...initialConfig, segments: recalcSegmentTimes(initialConfig.segments) };
    }
    return createDefaultProject();
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Derived total duration of all segments
  const totalDuration = useMemo(() => {
    return config.segments.reduce((sum, s) => sum + s.durationSec, 0);
  }, [config.segments]);

  /**
   * Update the list of segments and recalculate start/end times.
   */
  const setSegments = useCallback(
    (segments: SegmentConfig[]) => {
      setConfig(prev => ({ ...prev, segments: recalcSegmentTimes(segments) }));
    },
    [setConfig],
  );

  /**
   * Add a new segment to the end of the timeline with default values.
   */
  const addSegment = useCallback(() => {
    setSegments([...config.segments, {
      id: generateId(),
      label: `Segment ${config.segments.length}`,
      durationSec: 10,
      startSec: 0,
      endSec: 0,
      transitionDuration: DEFAULT_SEGMENT_TRANSITION,
      backgroundColor: [0, 0, 0],
      shapeInstances: createEmptyCollection(),
    }]);
  }, [config.segments, setSegments]);

  /**
   * Duplicate an existing segment. The copy will be inserted after the
   * source index and given a new ID. Shape instances are deep-copied.
   */
  const duplicateSegment = useCallback((index: number) => {
    const target = config.segments[index];
    if (!target) return;
    const clone: SegmentConfig = {
      ...target,
      id: generateId(),
      label: `${target.label} copy`,
      backgroundColor: [...target.backgroundColor] as UniformVec3,
      tint: target.tint ? ([...target.tint] as UniformVec3) : undefined,
      shapeInstances: {
        circles: target.shapeInstances.circles.map(c => ({ ...c, id: generateId() })),
        waves: target.shapeInstances.waves.map(w => ({ ...w, id: generateId() })),
        epicycloids: target.shapeInstances.epicycloids.map(e => ({ ...e, id: generateId() })),
        expandingCircles: target.shapeInstances.expandingCircles.map(ec => ({ ...ec, id: generateId() })),
      },
    };
    const segments = [...config.segments];
    segments.splice(index + 1, 0, clone);
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Remove a segment by index. Ensures there is always at least one
   * segment remaining. Optionally prompts for confirmation outside.
   */
  const removeSegment = useCallback((index: number) => {
    if (config.segments.length <= 1) return;
    const segments = config.segments.filter((_, i) => i !== index);
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Update a segment's duration. This will trigger recalculation of
   * start/end times for all segments.
   */
  const updateSegmentDuration = useCallback((index: number, newDuration: number) => {
    const duration = Math.max(0, newDuration);
    const segments = config.segments.map((seg, i) => i === index ? { ...seg, durationSec: duration } : seg);
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Update a segment's label.
   */
  const updateSegmentLabel = useCallback((index: number, newLabel: string) => {
    const segments = config.segments.map((seg, i) => i === index ? { ...seg, label: newLabel } : seg);
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Update global project uniforms. Completely replaces the existing
   * uniform set.
   */
  const updateProjectUniforms = useCallback((uniforms: UniformSet) => {
    setConfig(prev => ({ ...prev, uniforms }));
  }, []);

  /**
   * Update the overrides of a particular segment. Partial updates are
   * merged with existing overrides. To remove overrides entirely, pass
   * undefined as the newOverrides argument.
   */
  const updateSegmentOverrides = useCallback((index: number, newOverrides: Partial<UniformSet> | undefined) => {
    const segments = config.segments.map((seg, i) => {
      if (i !== index) return seg;
      if (!newOverrides) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { uniformsOverride, ...rest } = seg;
        return rest;
      }
      // Filter out undefined values from newOverrides so that they do not
      // overwrite existing values with undefined. Nested objects are
      // filtered separately.
      const cleaned = cleanPartialUniformSet(newOverrides);
      const mergedShapeCounts = {
        ...(seg.uniformsOverride?.shapeCounts ?? {}),
        ...(cleaned.shapeCounts ?? {}),
      };
      const mergedTints = {
        ...(seg.uniformsOverride?.tints ?? {}),
        ...(cleaned.tints ?? {}),
      };
      // Remove shapeCounts and tints from cleaned to avoid duplication in top level
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { shapeCounts, tints, ...restCleaned } = cleaned;
      return {
        ...seg,
        uniformsOverride: {
          ...seg.uniformsOverride,
          ...restCleaned,
          shapeCounts: mergedShapeCounts,
          tints: mergedTints,
        },
      } as SegmentConfig;
    });
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Update the project name.
   */
  const updateProjectName = useCallback((name: string) => {
    setConfig(prev => ({ ...prev, projectName: name }));
  }, []);

  /**
   * Update the project-level maximum shape limits.
   */
  const updateMaxShapeLimits = useCallback((limits: ShapeLimits) => {
    setConfig(prev => ({ ...prev, maxShapeLimits: limits }));
  }, []);

  /**
   * Update the transition duration for a specific segment.
   */
  const updateSegmentTransition = useCallback((index: number, duration: number) => {
    const segments = config.segments.map((seg, i) =>
      i === index ? { ...seg, transitionDuration: Math.max(0, duration) } : seg
    );
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Update the background color for a specific segment.
   */
  const updateSegmentBackground = useCallback((index: number, color: UniformVec3) => {
    const segments = config.segments.map((seg, i) =>
      i === index ? { ...seg, backgroundColor: color } : seg
    );
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Update the tint (color multiplier) for a specific segment.
   */
  const updateSegmentTint = useCallback((index: number, tint: UniformVec3 | undefined) => {
    const segments = config.segments.map((seg, i) =>
      i === index ? { ...seg, tint } : seg
    );
    setSegments(segments);
  }, [config.segments, setSegments]);

  /**
   * Update the shape instances for a specific segment.
   * Validates that instance counts don't exceed project maximum limits.
   */
  const updateSegmentShapeInstances = useCallback(
    (index: number, instances: ShapeInstanceCollection) => {
      const limits = config.maxShapeLimits;
      if (
        instances.circles.length > limits.circles ||
        instances.waves.length > limits.waves ||
        instances.epicycloids.length > limits.epicycloids ||
        instances.expandingCircles.length > limits.expandingCircles
      ) {
        throw new Error('Shape instance count exceeds project maximum limits');
      }

      const segments = config.segments.map((seg, i) =>
        i === index ? { ...seg, shapeInstances: instances } : seg
      );
      setSegments(segments);
    },
    [config.segments, config.maxShapeLimits, setSegments]
  );

  /**
   * Determine which segment is active at a given time. Returns the
   * index of the segment. If the time is beyond the last segment, the
   * last index is returned.
   */
  const getSegmentIndexForTime = useCallback((time: number): number => {
    for (let i = 0; i < config.segments.length; i++) {
      const seg = config.segments[i];
      if (time >= seg.startSec && time < seg.endSec) return i;
    }
    return config.segments.length - 1;
  }, [config.segments]);

  /**
   * Compute the effective uniform set for a given time by merging the
   * project's global uniforms with any overrides defined on the current
   * segment.
   */
  const resolveUniformsForTime = useCallback((time: number): UniformSet => {
    const index = getSegmentIndexForTime(time);
    const seg = config.segments[index];
    return mergeUniformSets(config.uniforms, seg.uniformsOverride);
  }, [config.uniforms, config.segments, getSegmentIndexForTime]);

  /**
   * Serialise the current project to a JSON string. Consumers may
   * download this string as a file. No validation is performed here.
   */
  const saveProject = useCallback((): string => {
    return JSON.stringify(config, null, 2);
  }, [config]);

  /**
   * Load a project from arbitrary JSON data. Automatically migrates old
   * project formats to the current version. Validation is performed
   * using the Zod schema; if parsing fails, the caller must handle the
   * thrown error. Start and end times are recalculated after loading.
   */
  const loadProject = useCallback((data: unknown) => {
    // Migrate project to current version if needed
    const migrated = migrateProject(data as Record<string, unknown>);
    const parsed = parseProjectConfig(migrated);
    const segments = recalcSegmentTimes(parsed.segments);
    setConfig({ ...parsed, segments });
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  return {
    config,
    setConfig,
    currentTime,
    setCurrentTime,
    isPlaying,
    setIsPlaying,
    totalDuration,
    addSegment,
    duplicateSegment,
    removeSegment,
    updateSegmentDuration,
    updateSegmentLabel,
    updateProjectName,
    updateMaxShapeLimits,
    updateSegmentTransition,
    updateSegmentBackground,
    updateSegmentTint,
    updateSegmentShapeInstances,
    updateProjectUniforms,
    updateSegmentOverrides,
    getSegmentIndexForTime,
    resolveUniformsForTime,
    saveProject,
    loadProject,
  };
}
