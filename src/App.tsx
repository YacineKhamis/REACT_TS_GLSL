import { useCallback, useMemo, useState } from 'react';
import * as THREE from 'three';
import ThreeScene from './components/ThreeScene';
import PlaybackBar from './components/PlaybackBar';
import Sidebar from './components/Sidebar';
import ProjectControls from './components/ProjectControls';
import SegmentControls from './components/SegmentControls';
import { useProjectState } from './hooks/useProjectState';
import type { UniformSet } from './types/config';

/**
 * Default counts used when no overrides are defined.
 */
const DEFAULT_SHAPE_COUNTS = { circles: 3, waves: 3, epicycloids: 2, expandingCircles: 2 };

/**
 * Default tint used when none is specified. White means no tint.
 */
const DEFAULT_TINT: [number, number, number] = [1, 1, 1];

/**
 * Base colours for the primitive shapes used in the shader.
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
 * Merge a base uniform set with an optional overrides object.
 */
function mergeUniformSets(base: UniformSet, override?: Partial<UniformSet>): UniformSet {
  if (!override) return base;
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, [setIsPlaying]);

  const handleScrub = useCallback((time: number) => {
    setCurrentTime(time);
  }, [setCurrentTime]);

  const effectiveUniforms = useMemo(() => {
    return resolveUniformsForTime(currentTime);
  }, [resolveUniformsForTime, currentTime]);

  const shaderUniforms = useMemo(() => {
    const MAX_SEGMENTS = 20;
    const uniforms: any = {};
    
    // Time and resolution
    uniforms.iTime = { value: currentTime };
    uniforms.uResolution = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
    
    const numSegs = config.segments.length;
    uniforms.uNumSegments = { value: numSegs };
    
    const segStart = new Float32Array(MAX_SEGMENTS);
    const segDur = new Float32Array(MAX_SEGMENTS);
    config.segments.forEach((s, i) => {
      segStart[i] = s.startSec;
      segDur[i] = s.durationSec;
    });
    
    for (let i = numSegs; i < MAX_SEGMENTS; i++) {
      segStart[i] = segStart[Math.max(0, numSegs - 1)] ?? 0;
      segDur[i] = segDur[Math.max(0, numSegs - 1)] ?? 0;
    }
    
    uniforms.uSegStart = { value: segStart };
    uniforms.uSegDur = { value: segDur };
    
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
          sc.circles ?? DEFAULT_SHAPE_COUNTS.circles,
          sc.expandingCircles ?? DEFAULT_SHAPE_COUNTS.expandingCircles,
          sc.waves ?? DEFAULT_SHAPE_COUNTS.waves,
          sc.epicycloids ?? DEFAULT_SHAPE_COUNTS.epicycloids,
        );
        
        const t = resolved.tints ?? {};
        const circ = t.circles ?? DEFAULT_TINT;
        const wave = t.waves ?? DEFAULT_TINT;
        const epi = t.epicycloids ?? DEFAULT_TINT;
        
        tintCirc[i] = new THREE.Color(circ[0], circ[1], circ[2]);
        tintWave[i] = new THREE.Color(wave[0], wave[1], wave[2]);
        tintEpi[i] = new THREE.Color(epi[0], epi[1], epi[2]);
      } else {
        if (numSegs > 0) {
          intensities[i] = intensities[numSegs - 1].clone();
          counts[i] = counts[numSegs - 1].clone();
          tintCirc[i] = tintCirc[numSegs - 1].clone();
          tintWave[i] = tintWave[numSegs - 1].clone();
          tintEpi[i] = tintEpi[numSegs - 1].clone();
        } else {
          intensities[i] = new THREE.Vector4(0, 0, 0, 0);
          counts[i] = new THREE.Vector4(
            DEFAULT_SHAPE_COUNTS.circles,
            DEFAULT_SHAPE_COUNTS.expandingCircles,
            DEFAULT_SHAPE_COUNTS.waves,
            DEFAULT_SHAPE_COUNTS.epicycloids
          );
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
    
    uniforms.uBackgroundColor = { 
      value: new THREE.Color(
        effectiveUniforms.backgroundColor[0], 
        effectiveUniforms.backgroundColor[1], 
        effectiveUniforms.backgroundColor[2]
      ) 
    };
    
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
  }, [config.segments, config.uniforms, effectiveUniforms, currentTime]);

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
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(prev => !prev)}
        tabs={{
          Projet: (
            <ProjectControls
              uniforms={config.uniforms}
              onUniformsChange={updateProjectUniforms}
              onNew={() => {
                if (window.confirm('Êtes-vous sûr de vouloir créer un nouveau projet ? Toutes les modifications non sauvegardées seront perdues.')) {
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
      
      <ThreeScene
        currentTime={currentTime}
        isPlaying={isPlaying}
        totalDuration={totalDuration}
        setCurrentTime={setCurrentTime}
        uniforms={shaderUniforms}
      />
      
      <PlaybackBar
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onScrub={handleScrub}
        totalDuration={totalDuration}
        segments={config.segments.map(({ startSec, durationSec }) => ({ 
          start: startSec, 
          duration: durationSec 
        }))}
      />
    </>
  );
}