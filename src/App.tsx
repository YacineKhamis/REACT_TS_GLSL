import { useState, useEffect, useCallback, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import Plane from "./components/Plane";
import PlaybackBar from "./components/PlaybackBar";
import Sidebar from "./components/Sidebar";

export default function App() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Replicate GLSL segment data in JS for UI
  const SEG_START = [
    0.00,     // Segment 0 : (0:00:00)
    10.43,    // Segment 1 : (0:10:43)
    125.21,   // Segment 2 : (02:05:21)
    2963.47,  // Segment 3 : (49:23:47)
    4633.04,  // Segment 4 : (77:13:04)
    5958.26   // Segment 5 : (99:18:26)
  ];

  const SEG_DUR = [
    10.43,    // Segment 0 : (0:00:00 → 0:10:43)
    114.78,   // Segment 1 : (0:10:43 → 02:05:21)
    2838.26,  // Segment 2 : (02:05:21 → 49:23:47)
    1669.57,  // Segment 3 : (49:23:47 → 77:13:04)
    1325.22,  // Segment 4 : (77:13:04 → 99:18:26)
    10.43     // Segment 5 : (99:18:26 → 99:28:69)
  ];

  const segments = useMemo(() => {
    return SEG_START.map((start, index) => ({
      start: start,
      duration: SEG_DUR[index],
    }));
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

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)}>
        {/* Vous pouvez ajouter des contrôles pour les uniforms ici */}
        <p>Ceci est un panneau latéral pour les contrôles.</p>
      </Sidebar>
      <Canvas style={{ background: "black" }} orthographic camera={{ zoom: 1, position: [0, 0, 10] }}>
        <Plane iTime={currentTime} />
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