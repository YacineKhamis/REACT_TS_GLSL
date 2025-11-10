import { useState, useEffect, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import Plane from "./components/Plane";
import PlaybackBar from "./components/PlaybackBar";
import Sidebar from "./components/Sidebar";
import ProjectControls from "./components/ProjectControls";
import SegmentControls from "./components/SegmentControls";

const getInitialUniforms = () => ({
  iTime: { value: 0.0 },
  uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },

  // Couleurs
  uBackgroundColor: { value: new THREE.Color(0x000000) },
  uCircleColor0: { value: new THREE.Color(0xff0000) },
  uCircleColor1: { value: new THREE.Color(0x00ff00) },
  uCircleColor2: { value: new THREE.Color(0x0000ff) },
  uWaveColor0: { value: new THREE.Color(0xffff00) },
  uWaveColor1: { value: new THREE.Color(0x00ffff) },
  uWaveColor2: { value: new THREE.Color(0xff00ff) },
  uEpiColor0: { value: new THREE.Color(0xffffff) },

  uEpiColor1: { value: new THREE.Color(0xaaaaaa) },
  uExpandColor: { value: new THREE.Color(0xffa500) },
  // Counts
  uShapeCountsSeg0: { value: new THREE.Vector4(3, 0, 3, 2) },
  uShapeCountsSeg1: { value: new THREE.Vector4(3, 3, 3, 2) },
  uShapeCountsSeg2: { value: new THREE.Vector4(3, 3, 3, 2) },
  uShapeCountsSeg3: { value: new THREE.Vector4(5, 5, 5, 3) },
  uShapeCountsSeg4: { value: new THREE.Vector4(3, 3, 3, 2) },

  uShapeCountsSeg5: { value: new THREE.Vector4(3, 0, 3, 2) },
  // Intensities
  uIntensitySeg0: { value: new THREE.Vector4(0.0, 0.1, 0.1, 0.0) },
  uIntensitySeg1: { value: new THREE.Vector4(0.6, 0.6, 0.6, 0.6) },
  uIntensitySeg2: { value: new THREE.Vector4(0.9, 0.9, 0.9, 0.9) },
  uIntensitySeg3: { value: new THREE.Vector4(1.05, 0.15, 1.0, 1.05) },
  uIntensitySeg4: { value: new THREE.Vector4(0.9, 0.9, 0.9, 0.9) },
  uIntensitySeg5: { value: new THREE.Vector4(0.0, 0.1, 0.1, 0.0) },

  // Tints
  uTintCirc0: { value: new THREE.Color(0xffffff) },
  uTintCirc1: { value: new THREE.Color(0xffffff) },
  uTintCirc2: { value: new THREE.Color(0xffffff) },
  uTintCirc3: { value: new THREE.Color(0xffffff) },
  uTintCirc4: { value: new THREE.Color(0xffffff) },
  uTintCirc5: { value: new THREE.Color(0xffffff) },
  uTintWave0: { value: new THREE.Color(0xffffff) },
  uTintWave1: { value: new THREE.Color(0xffffff) },
  uTintWave2: { value: new THREE.Color(0xffffff) },

  uTintWave3: { value: new THREE.Color(0xffffff) },
  uTintWave4: { value: new THREE.Color(0xffffff) },
  uTintWave5: { value: new THREE.Color(0xffffff) },
  uTintEpi0: { value: new THREE.Color(0xffffff) },
  uTintEpi1: { value: new THREE.Color(0xffffff) },
  uTintEpi2: { value: new THREE.Color(0xffffff) },
  uTintEpi3: { value: new THREE.Color(0xffffff) },
  uTintEpi4: { value: new THREE.Color(0xffffff) },
  uTintEpi5: { value: new THREE.Color(0xffffff) },
});

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);

  const [currentTime, setCurrentTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [uniforms, setUniforms] = useState(getInitialUniforms());
  
  const [segments, setSegments] = useState(() => {
    const initialDurations = [10.43, 114.78, 2838.26, 1669.57, 1325.22, 10.43];
    let accumulatedTime = 0;
    return initialDurations.map(duration => {
      const start = accumulatedTime;
      accumulatedTime += duration;
      return { start, duration };
    });
  });

  const handleSegmentDurationChange = useCallback((index: number, newDuration: number) => {
    // Ensure duration is not negative
    const safeNewDuration = Math.max(0, newDuration);

    setSegments(currentSegments => {
      const newSegments = [...currentSegments];
      // Update the duration of the target segment
      newSegments[index] = { ...newSegments[index], duration: safeNewDuration };

      // Recalculate start times for all subsequent segments
      let accumulatedTime = 0;
      for (let i = 0; i < newSegments.length; i++) {
        newSegments[i].start = accumulatedTime;
        accumulatedTime += newSegments[i].duration;
      }

      return newSegments;
    });
  }, []);

  const totalDuration = useMemo(() => {
    return segments.reduce((sum, seg) => sum + seg.duration, 0);
  }, [segments]);

  useEffect(() => {
    let animationFrameId: number;
    if (isPlaying) {
      const animate = () => {
        setCurrentTime((prevTime) => (prevTime + 0.01) % totalDuration); // Increment time, loop if it exceeds total duration
        animationFrameId = requestAnimationFrame(animate);
      };
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, totalDuration]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleScrub = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleNewProject = useCallback(() => {
    if (window.confirm("Êtes-vous sûr de vouloir créer un nouveau projet ? Toutes les modifications non sauvegardées seront perdues.")) {
      setUniforms(getInitialUniforms());
      setCurrentTime(0);
      console.log("Nouveau projet créé.");
    }
  }, []);

  const handleSaveProject = useCallback(() => {
    const dataToSave: { [key: string]: any } = {};
    for (const key in uniforms) {
      if (key !== 'iTime' && key !== 'uResolution') { // Ne pas sauvegarder le temps ou la résolution
        const uniformValue = uniforms[key as keyof typeof uniforms].value;
        if (uniformValue instanceof THREE.Color) {
          dataToSave[key] = { type: 'Color', value: uniformValue.getHex() };
        } else if (uniformValue instanceof THREE.Vector4) {
          dataToSave[key] = { type: 'Vector4', value: uniformValue.toArray() };
        }
      }
    }

    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shader-project.json';
    a.click();
    URL.revokeObjectURL(url);
    console.log("Projet sauvegardé.");
  }, [uniforms]);

  const handleLoadProject = useCallback((data: any) => {
    // Logique de chargement à implémenter
    console.log("Chargement du projet...", data);
    // Ici, vous devrez parcourir `data` et mettre à jour l'état `uniforms`
    // en recréant les objets THREE.Color et THREE.Vector4.
    alert("La fonctionnalité de chargement est en cours de développement.");
  }, []);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} tabs={{
        "Projet": <ProjectControls onNew={handleNewProject} onSave={handleSaveProject} onLoad={handleLoadProject} />,
        "Segments": <SegmentControls segments={segments} onSegmentDurationChange={handleSegmentDurationChange} />,
      }} />
      <Canvas style={{ background: "black" }} orthographic camera={{ zoom: 1, position: [0, 0, 10] }}>
        <Plane iTime={currentTime} uniforms={uniforms} />
      </Canvas>
      <PlaybackBar
        currentTime={currentTime}
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onScrub={handleScrub}
        totalDuration={totalDuration}
        segments={segments}
      />
    </>
  );

}