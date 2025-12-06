import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import ThreeScene from './components/ThreeScene';
import PlaybackBar from './components/PlaybackBar';
import ErrorBoundary from './components/ErrorBoundary';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProjectModal } from './components/ProjectModal/ProjectModal';
import { TimelineModal } from './components/TimelineModal/TimelineModal';
import { ExportModal } from './components/ExportModal/ExportModal';
import { useProjectState } from './hooks/useProjectState';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useAudioTrackLoader } from './hooks/useAudioTrack';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useVideoExport } from './hooks/useVideoExport';
import { extractAudioTrackFromElement } from './utils/export/audioHelpers';
import type { ExportSettings } from './types/export';
import { MAX_SEGMENTS, MAX_INSTANCES, TOTAL_INSTANCE_SLOTS, LOOP_DETECTION_THRESHOLD } from './constants/rendering';

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
    updateProjectName,
    updateMaxShapeLimits,
    updateSegmentTransition,
    updateSegmentBackground,
    updateSegmentTint,
    updateSegmentShapeInstances,
    updateProjectUniforms,
    saveProject,
    loadProject,
    updateAudioTrack,
    setLockToAudioDuration,
    extendSegmentToAudioEnd,
    distributeRemainingDuration,
  } = useProjectState();

  const [isDashboardVisible, setIsDashboardVisible] = useState(true);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const previousTimeRef = useRef(currentTime);
  const currentTimeRef = useRef(currentTime);

  // Keep currentTimeRef in sync
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Navigation state
  const navigation = useAppNavigation();

  const currentAudioTrack = config.audioTrack;
  const {
    isLoading: isAudioLoading,
    error: audioError,
    loadFromFile: loadAudioFromFile,
    resetError: resetAudioError,
  } = useAudioTrackLoader();

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
  }, [setIsPlaying]);

  const audioCallbacks = useMemo(() => ({ onEnded: handleAudioEnded }), [handleAudioEnded]);
  const audioPlayer = useAudioPlayer(config.audioTrack, audioCallbacks);
  const { play: playAudio, pause: pauseAudio, seek: seekAudio, audioElement } = audioPlayer;

  // Video Export hook
  const {
    isExporting,
    progress: exportProgress,
    startExport,
    finishExport,
    updateProgress,
  } = useVideoExport({
    onComplete: (result) => {
      console.log('Export terminé:', result);
      // Téléchargement automatique
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (error) => {
      console.error('Erreur export:', error);
      alert(`Échec export: ${error}`);
    },
  });

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Mettre à jour la progression d'export en temps réel
  useEffect(() => {
    if (isExporting) {
      updateProgress(currentTime);
    }
  }, [currentTime, isExporting, updateProgress]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => {
      const next = !prev;
      if (next) {
        playAudio(currentTimeRef.current);
      } else {
        pauseAudio();
      }
      return next;
    });
  }, [pauseAudio, playAudio, setIsPlaying]);

  const handleScrub = useCallback((time: number) => {
    setCurrentTime(time);
    seekAudio(time);
  }, [seekAudio, setCurrentTime]);

  // Keep audio looped with the timeline when total duration wraps around.
  useEffect(() => {
    const prev = previousTimeRef.current;
    previousTimeRef.current = currentTime;

    if (
      !config.audioTrack ||
      !isPlaying ||
      totalDuration <= 0
    ) {
      return;
    }

    const nearEnd = prev > totalDuration - LOOP_DETECTION_THRESHOLD;
    const looped = currentTime < prev && nearEnd;
    if (looped) {
      seekAudio(0);
      playAudio(0);
    }
  }, [config.audioTrack, currentTime, isPlaying, playAudio, seekAudio, totalDuration]);

  // Calculate current segment index (changes ~1-2 times per minute instead of 60 times per second)
  const currentSegmentIndex = useMemo(() => {
    for (let i = 0; i < config.segments.length; i++) {
      const seg = config.segments[i];
      if (currentTime >= seg.startSec && currentTime < seg.startSec + seg.durationSec) {
        return i;
      }
    }
    return config.segments.length > 0 ? config.segments.length - 1 : 0;
  }, [config.segments, currentTime]);

  // NEW: Generate shader uniforms from per-instance data
  // Only sends current + previous segment data (16 slots total: 0-7 prev, 8-15 current)
  // OPTIMIZED: Only recalculates when segment changes or config changes, NOT on every frame
  const shaderUniforms = useMemo(() => {
    const uniforms: Record<string, { value: unknown }> = {};

    // Basic uniforms
    uniforms.iTime = { value: 0 }; // Updated by ThreeScene
    uniforms.uResolution = { value: new THREE.Vector2(window.innerWidth, window.innerHeight) };
    uniforms.uNumSegments = { value: config.segments.length };
    uniforms.uEpiSampleFactor = { value: config.uniforms.epicycloidsSampleFactor ?? 1 };

    // Per-segment arrays (all segments for timeline management)
    const segStart = new Float32Array(MAX_SEGMENTS);
    const segDur = new Float32Array(MAX_SEGMENTS);
    const segTransition = new Float32Array(MAX_SEGMENTS);
    const shapeCounts: THREE.Vector4[] = new Array(MAX_SEGMENTS);
    const bgColors: THREE.Color[] = new Array(MAX_SEGMENTS);

    config.segments.forEach((seg, segIdx) => {
      segStart[segIdx] = seg.startSec;
      segDur[segIdx] = seg.durationSec;
      segTransition[segIdx] = seg.transitionDuration;

      const instances = seg.shapeInstances;
      shapeCounts[segIdx] = new THREE.Vector4(
        instances.circles.length,
        instances.expandingCircles.length,
        instances.waves.length,
        instances.epicycloids.length
      );
      bgColors[segIdx] = new THREE.Color(seg.backgroundColor[0], seg.backgroundColor[1], seg.backgroundColor[2]);
    });

    // Padding for remaining segments
    for (let i = config.segments.length; i < MAX_SEGMENTS; i++) {
      segStart[i] = 0;
      segDur[i] = 0;
      segTransition[i] = 1.0;
      shapeCounts[i] = new THREE.Vector4(0, 0, 0, 0);
      bgColors[i] = new THREE.Color(0, 0, 0);
    }

    uniforms.uSegStart = { value: segStart };
    uniforms.uSegDur = { value: segDur };
    uniforms.uSegTransitionDur = { value: segTransition };
    uniforms.uShapeCountsSeg = { value: shapeCounts };
    uniforms.uBgColorSeg = { value: bgColors };

    // Per-instance arrays (only 16 slots: previous + current segments)
    // Colors and intensities
    const circleColors: THREE.Color[] = new Array(TOTAL_INSTANCE_SLOTS);
    const circleIntensities = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const waveColors: THREE.Color[] = new Array(TOTAL_INSTANCE_SLOTS);
    const waveIntensities = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const epiColors: THREE.Color[] = new Array(TOTAL_INSTANCE_SLOTS);
    const epiIntensities = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const expandColors: THREE.Color[] = new Array(TOTAL_INSTANCE_SLOTS);
    const expandIntensities = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const expandStartRadius = new Float32Array(TOTAL_INSTANCE_SLOTS);

    // Geometric parameters for circles
    const circleRadius = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const circleThickness = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const circleGlow = new Float32Array(TOTAL_INSTANCE_SLOTS);

    // Geometric parameters for expanding circles
    const expandPeriod = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const expandThickness = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const expandGlow = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const expandMaxRadius = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const expandStartTime = new Float32Array(TOTAL_INSTANCE_SLOTS);

    // Geometric parameters for waves
    const waveAmplitude = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const waveFrequency = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const waveSpeed = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const waveThickness = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const waveGlow = new Float32Array(TOTAL_INSTANCE_SLOTS);

    // Geometric parameters for epicycloids
    const epiR = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const epir = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const epiScale = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const epiThickness = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const epiSpeed = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const epiGlow = new Float32Array(TOTAL_INSTANCE_SLOTS);
    const epiSamples = new Int32Array(TOTAL_INSTANCE_SLOTS);

    // Use pre-calculated segment index from useMemo above
    const currentSegIdx = currentSegmentIndex;
    const prevSegIdx = Math.max(0, currentSegIdx - 1);

    // Helper to fill instance data for a segment at offset (0 for prev, 8 for current)
    const fillSegmentInstances = (segIdx: number, offset: number) => {
      const seg = config.segments[segIdx];
      if (!seg || !seg.shapeInstances) return;

      const instances = seg.shapeInstances;

      for (let i = 0; i < MAX_INSTANCES; i++) {
        const idx = offset + i;

        // Circles
        if (i < instances.circles.length) {
          const circle = instances.circles[i];
          circleColors[idx] = new THREE.Color(circle.color[0], circle.color[1], circle.color[2]);
          circleIntensities[idx] = circle.enabled ? circle.intensity : 0; // Only show if enabled
          circleRadius[idx] = circle.radius;
          circleThickness[idx] = circle.thickness;
          circleGlow[idx] = circle.glow;
        } else {
          circleColors[idx] = new THREE.Color(1, 1, 1);
          circleIntensities[idx] = 0;
          circleRadius[idx] = 0.5;
          circleThickness[idx] = 0.0005;
          circleGlow[idx] = 1.0;
        }

        // Waves
        if (i < instances.waves.length) {
          const wave = instances.waves[i];
          waveColors[idx] = new THREE.Color(wave.color[0], wave.color[1], wave.color[2]);
          waveIntensities[idx] = wave.enabled ? wave.intensity : 0; // Only show if enabled
          waveAmplitude[idx] = wave.amplitude;
          waveFrequency[idx] = wave.frequency;
          waveSpeed[idx] = wave.speed;
          waveThickness[idx] = wave.thickness;
          waveGlow[idx] = wave.glow;
        } else {
          waveColors[idx] = new THREE.Color(1, 1, 1);
          waveIntensities[idx] = 0;
          waveAmplitude[idx] = 0.3;
          waveFrequency[idx] = 0.5;
          waveSpeed[idx] = 0.2;
          waveThickness[idx] = 0.003;
          waveGlow[idx] = 1.0;
        }

        // Epicycloids
        if (i < instances.epicycloids.length) {
          const epi = instances.epicycloids[i];
          epiColors[idx] = new THREE.Color(epi.color[0], epi.color[1], epi.color[2]);
          epiIntensities[idx] = epi.enabled ? epi.intensity : 0; // Only show if enabled
          epiR[idx] = epi.R;
          epir[idx] = epi.r;
          epiScale[idx] = epi.scale;
          epiThickness[idx] = epi.thickness;
          epiSpeed[idx] = epi.speed;
          epiGlow[idx] = epi.glow;
          epiSamples[idx] = epi.samples;
        } else {
          epiColors[idx] = new THREE.Color(1, 1, 1);
          epiIntensities[idx] = 0;
          epiR[idx] = 7.19;
          epir[idx] = -3.03;
          epiScale[idx] = 0.0075;
          epiThickness[idx] = 0.0005;
          epiSpeed[idx] = 0.09;
          epiGlow[idx] = 0.25;
          epiSamples[idx] = 100;
        }

        // Expanding circles
        if (i < instances.expandingCircles.length) {
          const expand = instances.expandingCircles[i];
          expandColors[idx] = new THREE.Color(expand.color[0], expand.color[1], expand.color[2]);
          expandIntensities[idx] = expand.enabled ? expand.intensity : 0; // Only show if enabled
          expandStartRadius[idx] = expand.startRadius;
          expandPeriod[idx] = expand.period;
          expandThickness[idx] = expand.thickness;
          expandGlow[idx] = expand.glow;
          expandMaxRadius[idx] = expand.maxRadius;
          expandStartTime[idx] = expand.startTime;
        } else {
          expandColors[idx] = new THREE.Color(1, 0.647, 0);
          expandIntensities[idx] = 0;
          expandStartRadius[idx] = 0;
          expandPeriod[idx] = 41.74;
          expandThickness[idx] = 0.0001;
          expandGlow[idx] = 3.5;
          expandMaxRadius[idx] = 1.5;
          expandStartTime[idx] = 0;
        }
      }
    };

    // Fill previous segment (offset 0)
    fillSegmentInstances(prevSegIdx, 0);
    // Fill current segment (offset 8)
    fillSegmentInstances(currentSegIdx, MAX_INSTANCES);

    // Set per-instance uniforms - colors and intensities
    uniforms.uCircleColors = { value: circleColors };
    uniforms.uCircleIntensities = { value: circleIntensities };
    uniforms.uWaveColors = { value: waveColors };
    uniforms.uWaveIntensities = { value: waveIntensities };
    uniforms.uEpiColors = { value: epiColors };
    uniforms.uEpiIntensities = { value: epiIntensities };
    uniforms.uExpandColors = { value: expandColors };
    uniforms.uExpandIntensities = { value: expandIntensities };
    uniforms.uExpandStartRadius = { value: expandStartRadius };

    // Set per-instance uniforms - geometric parameters
    // Circles
    uniforms.uCircleRadius = { value: circleRadius };
    uniforms.uCircleThickness = { value: circleThickness };
    uniforms.uCircleGlow = { value: circleGlow };

    // Expanding circles
    uniforms.uExpandPeriod = { value: expandPeriod };
    uniforms.uExpandThickness = { value: expandThickness };
    uniforms.uExpandGlow = { value: expandGlow };
    uniforms.uExpandMaxRadius = { value: expandMaxRadius };
    uniforms.uExpandStartTime = { value: expandStartTime };

    // Waves
    uniforms.uWaveAmplitude = { value: waveAmplitude };
    uniforms.uWaveFrequency = { value: waveFrequency };
    uniforms.uWaveSpeed = { value: waveSpeed };
    uniforms.uWaveThickness = { value: waveThickness };
    uniforms.uWaveGlow = { value: waveGlow };

    // Epicycloids
    uniforms.uEpiR = { value: epiR };
    uniforms.uEpir = { value: epir };
    uniforms.uEpiScale = { value: epiScale };
    uniforms.uEpiThickness = { value: epiThickness };
    uniforms.uEpiSpeed = { value: epiSpeed };
    uniforms.uEpiGlow = { value: epiGlow };
    uniforms.uEpiSamples = { value: epiSamples };

    return uniforms;
  }, [config.segments, config.uniforms.epicycloidsSampleFactor, currentSegmentIndex]);

  const handleAudioTrackSelect = useCallback(
    async (file: File) => {
      try {
        const track = await loadAudioFromFile(file);
        if (currentAudioTrack?.objectUrl) {
          URL.revokeObjectURL(currentAudioTrack.objectUrl);
        }
        resetAudioError();
        updateAudioTrack(track);
      } catch (err) {
        console.error('Erreur lors du chargement audio:', err);
      }
    },
    [currentAudioTrack, loadAudioFromFile, resetAudioError, updateAudioTrack],
  );

  const handleAudioTrackRemove = useCallback(() => {
    if (currentAudioTrack?.objectUrl) {
      URL.revokeObjectURL(currentAudioTrack.objectUrl);
    }
    resetAudioError();
    updateAudioTrack(undefined);
  }, [currentAudioTrack, resetAudioError, updateAudioTrack]);

  const handleAudioLockChange = useCallback(
    (locked: boolean) => {
      setLockToAudioDuration(locked);
    },
    [setLockToAudioDuration],
  );

  const handleExtendSegmentToAudioEnd = useCallback(
    (index: number) => {
      extendSegmentToAudioEnd(index);
    },
    [extendSegmentToAudioEnd],
  );

  const handleDistributeRemainingDurations = useCallback(() => {
    distributeRemainingDuration();
  }, [distributeRemainingDuration]);

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

  const handleLoadProject = useCallback((data: unknown) => {
    try {
      if (currentAudioTrack?.objectUrl) {
        URL.revokeObjectURL(currentAudioTrack.objectUrl);
      }
      loadProject(data);
      resetAudioError();
    } catch (err) {
      console.error('Erreur lors du chargement du projet:', err);
      alert('Fichier JSON invalide ou incompatible.');
    }
  }, [currentAudioTrack, loadProject, resetAudioError]);

  const handleStartExport = useCallback(async (settings: ExportSettings) => {
    // Récupérer le canvas WebGL
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas) {
      alert('Canvas introuvable');
      return;
    }

    // Extraire la piste audio depuis l'élément audio qui joue déjà
    let audioTrack: MediaStreamTrack | undefined;
    if (config.audioTrack && audioElement) {
      try {
        audioTrack = extractAudioTrackFromElement(audioElement);
        if (!audioTrack) {
          console.warn('Impossible d\'extraire l\'audio, export vidéo sans son');
        }
      } catch (err) {
        console.error('Erreur extraction audio:', err);
        // Continuer sans audio
      }
    }

    // Réinitialiser au début et lancer la lecture
    setCurrentTime(0);

    // Petit délai pour que le canvas et l'audio soient prêts
    await new Promise(resolve => setTimeout(resolve, 200));

    setIsPlaying(true);

    // Démarrer l'enregistrement
    await startExport(canvas, audioTrack, totalDuration, settings);

    // Attendre la fin de l'animation, puis finaliser
    setTimeout(async () => {
      setIsPlaying(false);
      await finishExport();
      setIsExportModalOpen(false); // Fermer le modal après export
    }, totalDuration * 1000 + 500); // +500ms de marge

  }, [config.audioTrack, audioElement, totalDuration, startExport, finishExport, setCurrentTime, setIsPlaying]);

  return (
    <>
      {/* Dashboard toggle button - always visible on home view */}
      {navigation.isHome && (
        <>
          <button
            onClick={() => {
              console.log('Button clicked! Current state:', isDashboardVisible);
              setIsDashboardVisible(prev => !prev);
            }}
            className="fixed top-5 left-5 z-40 px-4 py-2.5 bg-primary text-white rounded-lg transition-all duration-300 ease-in-out hover:bg-primary/90"
          >
            {isDashboardVisible ? 'Hide Dashboard' : 'Show Dashboard'}
          </button>

          {/* Dashboard content */}
          {isDashboardVisible && (
            <Dashboard
              projectName={config.projectName}
              fps={config.fps}
              segmentCount={config.segments.length}
              totalDuration={totalDuration}
              isVisible={isDashboardVisible}
              onToggleVisibility={() => setIsDashboardVisible(prev => !prev)}
              onEditProject={navigation.openProject}
              onEditTimeline={navigation.openTimeline}
              onExportVideo={() => setIsExportModalOpen(true)}
            />
          )}
        </>
      )}

      <ErrorBoundary>
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <ThreeScene
            currentTime={currentTime}
            isPlaying={isPlaying}
            totalDuration={totalDuration}
            setCurrentTime={setCurrentTime}
            uniforms={shaderUniforms}
          />
        </div>
      </ErrorBoundary>

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

      <ProjectModal
        isOpen={navigation.isProjectOpen}
        onClose={navigation.goHome}
        projectName={config.projectName}
        onProjectNameChange={updateProjectName}
        fps={config.fps}
        maxShapeLimits={config.maxShapeLimits}
        onMaxShapeLimitsChange={updateMaxShapeLimits}
        uniforms={config.uniforms}
        onUniformsChange={updateProjectUniforms}
        audioTrack={config.audioTrack}
        isAudioLoading={isAudioLoading}
        audioError={audioError}
        onAudioTrackSelect={handleAudioTrackSelect}
        onAudioTrackRemove={handleAudioTrackRemove}
        totalDuration={totalDuration}
        isAudioLocked={config.lockToAudioDuration ?? false}
        onAudioLockChange={handleAudioLockChange}
        onNew={() => {
          if (window.confirm('Are you sure you want to create a new project? All unsaved changes will be lost.')) {
            window.location.reload();
          }
        }}
        onSave={handleSaveProject}
        onLoad={handleLoadProject}
      />

      <TimelineModal
        isOpen={navigation.isTimelineOpen}
        onClose={navigation.goHome}
        segments={config.segments}
        selectedSegmentIndex={selectedSegmentIndex}
        onSelectSegment={setSelectedSegmentIndex}
        onAddSegment={addSegment}
        onDuplicateSegment={duplicateSegment}
        onDeleteSegment={removeSegment}
        onUpdateSegmentLabel={updateSegmentLabel}
        onUpdateSegmentDuration={updateSegmentDuration}
        maxShapeLimits={config.maxShapeLimits}
        onUpdateSegmentBackground={updateSegmentBackground}
        onUpdateSegmentTint={updateSegmentTint}
        onUpdateSegmentTransition={updateSegmentTransition}
        onUpdateSegmentShapeInstances={updateSegmentShapeInstances}
        currentTime={currentTime}
        isPlaying={isPlaying}
        totalDuration={totalDuration}
        audioTrack={config.audioTrack}
        lockToAudioDuration={config.lockToAudioDuration ?? false}
        onToggleAudioLock={handleAudioLockChange}
        onExtendSegmentToAudioEnd={handleExtendSegmentToAudioEnd}
        onDistributeRemainingDuration={handleDistributeRemainingDurations}
        onPlayPause={handlePlayPause}
        onScrub={handleScrub}
        shaderUniforms={shaderUniforms}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onStartExport={handleStartExport}
        progress={exportProgress}
        isExporting={isExporting}
      />
    </>
  );
}
