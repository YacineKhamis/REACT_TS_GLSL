import { useCallback, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import Plane from './components/Plane';
import PlaybackBar from './components/PlaybackBar';
import Sidebar from './components/Sidebar';
import ProjectControls from './components/ProjectControls';
import SegmentControls from './components/SegmentControls';
import { useProjectState } from './hooks/useProjectState';
import type { UniformSet } from './types/config';

/**
 * Default counts used when no overrides are defined. These values
 * correspond loosely to the defaults in the original fragment shader
 * comments. Circles and waves both start with 3 instances, epicycloids
 * with 3, and expanding circles with 2.
 */
const DEFAULT_SHAPE_COUNTS = { circles: 3, waves: 3, epicycloids: 3, expandingCircles: 2 };

/**
 * Default tint used when none is specified. White means no tint and
 * therefore preserves the base colour defined in the shader.
 */
const DEFAULT_TINT: [number, number, number] = [1, 1, 1];

/**
 * Base colours for the primitive shapes used in the shader. These
 * values mirror those set up in getInitialUniforms() in the original
 * implementation. Storing them outside of the component ensures they
 * are not recreated on every render.
 */
const BASE_COLOURS = {
  circle0: new THREE.Color(0xff0000),
  circle1: new THREE.Color(0x00ff00),
  circle2: new THREE.Color(0x0000ff),
  wave0: new THREE.Color(0xffff00),
  wave1: new THREE.Color(0x00ffff),
  wave2: new THREE.Color(0xff00ff),
  epi0: new THREE.Color(0xffffff),
  epi1: new THREE.Color(0xaaaaaa),
  expand: new THREE.Color(0xffa500),
};

/**
 * Merge a base uniform set with an optional overrides object. Nested
 * objects (shapeCounts and tints) are shallowly merged. Returns a new
 * object without mutating the inputs. This function is defined here
 * rather than exported from the hook to avoid creating a new closure
 * during render.
 */
function mergeUniformSets(base: UniformSet, override?: Partial<UniformSet>): UniformSet {
  if (!override) return base;
  // Filter out undefined properties so that undefined does not override the base.
  const cleaned: any = {};
  Object.keys(override).forEach(key => {
    const val = (override as any)[key];
    if (val !== undefined) {
      cleaned[key] = val;
    }
  });
  return {
    ...base,
    ...cleaned,
    shapeCounts: {
      ...(base.shapeCounts ?? {}),
      ...((cleaned.shapeCounts ?? {}) as any),
    },
    tints: {
      ...(base.tints ?? {}),
      ...((cleaned.tints ?? {}) as any),
    },
  };
}

/**
 * Top‑level application component. It orchestrates the project state
 * hook, playback, uniform resolution and UI layout. All React state
 * and side effects are managed here; child components remain
 * presentational and communicate via callbacks.
 */
export default function App() {
  const {
    config,
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
    saveProject,
    loadProject,
    resolveUniformsForTime,
  } = useProjectState();

  /**
   * Advance the playback timer when the composition is playing. The
   * timer wraps around to zero when reaching the end of the total
   * duration. The increment per frame is fixed at 0.01 seconds, which
   * produces a reasonably smooth animation; adjust this constant to
   * change playback speed globally.
   */
  useEffect(() => {
    let animationId: number;
    if (isPlaying) {
      const animate = () => {
        setCurrentTime(prev => {
          const next = prev + 0.01;
          return next >= totalDuration ? 0 : next;
        });
        animationId = requestAnimationFrame(animate);
      };
      animationId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, totalDuration, setCurrentTime]);

  /**
   * Toggle play/pause state. Bound to the playback bar's play/pause
   * button.
   */
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, [setIsPlaying]);

  /**
   * Scrub to a specific time on the timeline. Invoked when the user
   * interacts with the playback bar slider.
   */
  const handleScrub = useCallback((time: number) => {
    setCurrentTime(time);
  }, [setCurrentTime]);

  /**
   * Compute the resolved uniform set for the current time. This uses
   * the hook's resolver to merge global uniforms with any overrides on
   * the active segment. Memoised by currentTime and config changes.
   */
  const effectiveUniforms = useMemo(() => {
    return resolveUniformsForTime(currentTime);
  }, [resolveUniformsForTime, currentTime]);

  /**
   * Construct the uniforms object expected by THREE.ShaderMaterial.
   * Each property is wrapped in an object with a `value` field so
   * that the renderer can detect changes. Arrays of primitives or
   * THREE.Vector types are passed directly; colours are converted to
   * THREE.Color instances. This memoised computation runs whenever
   * the configuration or effective uniforms change.
   */
  const shaderUniforms = useMemo(() => {
    /*
     * Three.js expects uniform arrays declared with a fixed length in the
     * shader (e.g. `uIntensitySeg[MAX_SEGMENTS]`) to be supplied with
     * exactly that many elements. If we pass shorter arrays, Three.js
     * will still attempt to iterate through the full `MAX_SEGMENTS` and
     * call `toArray()` on each element. For indices beyond our actual
     * segment count the values would be undefined, triggering errors at
     * runtime. To avoid this, construct arrays of length MAX_SEGMENTS
     * and populate unused entries with safe defaults.
     */
    const MAX_SEGMENTS = 20;
    const uniforms: any = {};
    // Time and resolution
    uniforms.iTime = { value: currentTime };
    uniforms.uResolution = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
    // Number of active segments
    const numSegs = config.segments.length;
    uniforms.uNumSegments = { value: numSegs };
    // Segment start and duration arrays padded to MAX_SEGMENTS
    const segStart = new Float32Array(MAX_SEGMENTS);
    const segDur = new Float32Array(MAX_SEGMENTS);
    config.segments.forEach((s, i) => {
      segStart[i] = s.startSec;
      segDur[i] = s.durationSec;
    });
    // Fill remaining slots with zeros
    for (let i = numSegs; i < MAX_SEGMENTS; i++) {
      segStart[i] = segStart[Math.max(0, numSegs - 1)] ?? 0;
      segDur[i] = segDur[Math.max(0, numSegs - 1)] ?? 0;
    }
    uniforms.uSegStart = { value: segStart };
    uniforms.uSegDur = { value: segDur };
    // Per‑segment uniform arrays padded to MAX_SEGMENTS
    const intensities: THREE.Vector4[] = new Array(MAX_SEGMENTS);
    const counts: THREE.Vector4[] = new Array(MAX_SEGMENTS);
    const tintCirc: THREE.Color[] = new Array(MAX_SEGMENTS);
    const tintWave: THREE.Color[] = new Array(MAX_SEGMENTS);
    const tintEpi: THREE.Color[] = new Array(MAX_SEGMENTS);
    for (let i = 0; i < MAX_SEGMENTS; i++) {
      if (i < numSegs) {
        const seg = config.segments[i];
        const resolved = mergeUniformSets(config.uniforms, seg.uniformsOverride);
        intensities[i] = new THREE.Vector4(
          resolved.circlesIntensity,
          resolved.wavesIntensity,
          resolved.epicycloidsIntensity,
          resolved.expandingCirclesIntensity,
        );
        const sc = { ...DEFAULT_SHAPE_COUNTS, ...(resolved.shapeCounts ?? {}) };
        counts[i] = new THREE.Vector4(
          sc.circles,
          sc.expandingCircles,
          sc.waves,
          sc.epicycloids,
        );
        const t = resolved.tints ?? {};
        const circ = t.circles ?? DEFAULT_TINT;
        const wave = t.waves ?? DEFAULT_TINT;
        const epi = t.epicycloids ?? DEFAULT_TINT;
        tintCirc[i] = new THREE.Color(circ[0], circ[1], circ[2]);
        tintWave[i] = new THREE.Color(wave[0], wave[1], wave[2]);
        tintEpi[i] = new THREE.Color(epi[0], epi[1], epi[2]);
      } else {
        // For unused slots, replicate the last valid segment or use safe defaults
        if (numSegs > 0) {
          intensities[i] = intensities[numSegs - 1].clone();
          counts[i] = counts[numSegs - 1].clone();
          tintCirc[i] = tintCirc[numSegs - 1].clone();
          tintWave[i] = tintWave[numSegs - 1].clone();
          tintEpi[i] = tintEpi[numSegs - 1].clone();
        } else {
          // If no segments are defined (should not happen), use zeros and white tints
          intensities[i] = new THREE.Vector4(0, 0, 0, 0);
          counts[i] = new THREE.Vector4(0, 0, 0, 0);
          tintCirc[i] = new THREE.Color(1, 1, 1);
          tintWave[i] = new THREE.Color(1, 1, 1);
          tintEpi[i] = new THREE.Color(1, 1, 1);
        }
      }
    }
    uniforms.uIntensitySeg = { value: intensities };
    uniforms.uShapeCountsSeg = { value: counts };
    uniforms.uTintCircSeg = { value: tintCirc };
    uniforms.uTintWaveSeg = { value: tintWave };
    uniforms.uTintEpiSeg = { value: tintEpi };
    // Global colours: project background uses effective uniforms
    uniforms.uBackgroundColor = { value: new THREE.Color(effectiveUniforms.backgroundColor[0], effectiveUniforms.backgroundColor[1], effectiveUniforms.backgroundColor[2]) };
    // Base colours for shapes remain constant; reuse cached instances
    uniforms.uCircleColor0 = { value: BASE_COLOURS.circle0 };
    uniforms.uCircleColor1 = { value: BASE_COLOURS.circle1 };
    uniforms.uCircleColor2 = { value: BASE_COLOURS.circle2 };
    uniforms.uWaveColor0 = { value: BASE_COLOURS.wave0 };
    uniforms.uWaveColor1 = { value: BASE_COLOURS.wave1 };
    uniforms.uWaveColor2 = { value: BASE_COLOURS.wave2 };
    uniforms.uEpiColor0 = { value: BASE_COLOURS.epi0 };
    uniforms.uEpiColor1 = { value: BASE_COLOURS.epi1 };
    uniforms.uExpandColor = { value: BASE_COLOURS.expand };
    return uniforms;
  }, [config.segments, config.uniforms, currentTime, effectiveUniforms]);

  /**
   * Handle saving the project. Serialises the current configuration
   * using the hook's helper and triggers a file download with a
   * timestamped filename. Errors are logged to the console.
   */
  const handleSaveProject = useCallback(() => {
    try {
      const json = saveProject();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `project-${dateStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du projet:', err);
    }
  }, [saveProject]);

  /**
   * Handle loading a project from JSON data. The data is passed
   * directly to the hook, which validates and normalises it.
   */
  const handleLoadProject = useCallback((data: any) => {
    try {
      loadProject(data);
    } catch (err) {
      console.error('Erreur lors du chargement du projet:', err);
      alert('Fichier JSON invalide ou incompatible.');
    }
  }, [loadProject]);

  return (
    <>
      <Sidebar
        isOpen={true}
        onToggle={() => {}}
        tabs={{
          Projet: (
            <ProjectControls
              /*
               * Pass the project's global uniforms and update handler directly. The
               * ProjectControls component expects a `uniforms` prop containing
               * the current UniformSet and an `onUniformsChange` callback for
               * updates. We provide a confirmation dialog when creating a
               * new project to avoid accidental state resets.
               */
              uniforms={config.uniforms}
              onUniformsChange={updateProjectUniforms}
              onNew={() => {
                if (window.confirm('Êtes-vous sûr de vouloir créer un nouveau projet ? Toutes les modifications non sauvegardées seront perdues.')) {
                  // Simple approach: reload the page to reset the hook state.
                  window.location.reload();
                }
              }}
              onSave={handleSaveProject}
              onLoad={handleLoadProject}
            />
          ),
          Segments: (
            <SegmentControls
              segments={config.segments}
              projectUniforms={config.uniforms}
              onDurationChange={updateSegmentDuration}
              onLabelChange={updateSegmentLabel}
              onOverrideChange={updateSegmentOverrides}
              onAdd={addSegment}
              onDuplicate={duplicateSegment}
              onRemove={removeSegment}
            />
          ),
        }}
      />
      {/*
       * Specify frameloop="always" so that the scene continues to render
       * even if no useFrame callbacks are registered. Without this, React
       * Three Fiber v8 defaults to a on-demand render loop, which stops
       * updating the canvas when there are no subscribers. Because the
       * Plane component no longer uses a useFrame callback to update the
       * iTime uniform, we must keep the render loop running to animate
       * continuously.
       */}
      <Canvas frameloop="always" style={{ background: 'black' }} orthographic camera={{ zoom: 1, position: [0, 0, 10] }}>
        <Plane iTime={currentTime} uniforms={shaderUniforms} />
      </Canvas>
      <PlaybackBar
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onScrub={handleScrub}
        totalDuration={totalDuration}
        // Provide segments with start times and durations for the scrubber
        segments={config.segments.map(({ startSec, durationSec }) => ({ start: startSec, duration: durationSec }))}
      />
    </>
  );
}