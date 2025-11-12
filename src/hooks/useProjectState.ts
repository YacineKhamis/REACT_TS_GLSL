import { useState, useCallback, useMemo } from 'react';
import type {
  ProjectConfig,
  SegmentConfig,
  UniformSet,
} from '../types/config';
import { parseProjectConfig } from '../utils/schema';

/**
 * Utility to generate a pseudo‑unique ID for segments. Using
 * crypto.randomUUID() would be ideal but is not universally available.
 */
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Default global uniform values. These match the defaults hard coded
 * in the fragment shader for colours and intensities. Feel free to
 * adjust these as sensible defaults for new projects.
 */
const DEFAULT_UNIFORMS: UniformSet = {
  backgroundColor: [0, 0, 0],
  circlesIntensity: 0.5,
  wavesIntensity: 0.5,
  epicycloidsIntensity: 0.5,
  expandingCirclesIntensity: 0.5,
};

/**
 * Create a minimal project configuration for new documents. The
 * timeline starts with one 10‑second segment.
 */
function createDefaultProject(): ProjectConfig {
  const segment: SegmentConfig = {
    id: generateId(),
    label: 'Segment 0',
    durationSec: 10,
    startSec: 0,
    endSec: 10,
  };
  return {
    projectName: 'Untitled',
    fps: 60,
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
 * Merge two uniform sets, giving precedence to override values. Nested
 * objects (shapeCounts and tints) are merged shallowly. Scalar and
 * vector properties override directly when defined.
 */
function mergeUniformSets(base: UniformSet, override: Partial<UniformSet> | undefined): UniformSet {
  if (!override) return base;
  return {
    ...base,
    ...override,
    shapeCounts: {
      ...base.shapeCounts,
      ...(override.shapeCounts ?? {}),
    },
    tints: {
      ...base.tints,
      ...(override.tints ?? {}),
    },
  };
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
   * Add a new segment to the end of the timeline. The new segment
   * inherits the project's default uniforms by default.
   */
  const addSegment = useCallback(() => {
    setSegments([...config.segments, {
      id: generateId(),
      label: `Segment ${config.segments.length}`,
      durationSec: 10,
      startSec: 0,
      endSec: 0,
    }]);
  }, [config.segments, setSegments]);

  /**
   * Duplicate an existing segment. The copy will be inserted after the
   * source index and given a new ID. Overrides, if present, are
   * deep‑copied.
   */
  const duplicateSegment = useCallback((index: number) => {
    const target = config.segments[index];
    if (!target) return;
    const clone: SegmentConfig = {
      ...target,
      id: generateId(),
      label: `${target.label} copy`,
      uniformsOverride: target.uniformsOverride
        ? {
            ...target.uniformsOverride,
            shapeCounts: target.uniformsOverride.shapeCounts
              ? { ...target.uniformsOverride.shapeCounts }
              : undefined,
            tints: target.uniformsOverride.tints
              ? { ...target.uniformsOverride.tints }
              : undefined,
          }
        : undefined,
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
        const { uniformsOverride, ...rest } = seg;
        return rest;
      }
      return {
        ...seg,
        uniformsOverride: { ...seg.uniformsOverride, ...newOverrides, shapeCounts: { ...(seg.uniformsOverride?.shapeCounts ?? {}), ...(newOverrides.shapeCounts ?? {}) }, tints: { ...(seg.uniformsOverride?.tints ?? {}), ...(newOverrides.tints ?? {}) } },
      } as SegmentConfig;
    });
    setSegments(segments);
  }, [config.segments, setSegments]);

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
   * Load a project from arbitrary JSON data. Validation is performed
   * using the Zod schema; if parsing fails, the caller must handle the
   * thrown error. Start and end times are recalculated after loading.
   */
  const loadProject = useCallback((data: unknown) => {
    const parsed = parseProjectConfig(data);
    const segments = recalcSegmentTimes(parsed.segments);
    setConfig({ ...parsed, segments });
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
    updateProjectUniforms,
    updateSegmentOverrides,
    getSegmentIndexForTime,
    resolveUniformsForTime,
    saveProject,
    loadProject,
  };
}