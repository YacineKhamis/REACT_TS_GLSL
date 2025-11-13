import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import vertexShader from '../shaders/vertex.vert';
import fragmentShader from '../shaders/fragment.frag';
import { useFrame, useThree } from '@react-three/fiber';

interface PlaneProps {
  /** Current playback time in seconds. Propagated to the shader as
   * iTime on each frame. */
  iTime: number;
  /** Whether the animation is currently playing. */
  isPlaying: boolean;
  /** Total duration of the timeline in seconds. */
  totalDuration: number;
  /** Callback to update the global current time state. */
  setCurrentTime: (time: number) => void;
  /** Reference to the shader uniform object. Provided by App via
   * useProjectState and updated when uniforms change. */
  uniforms: { [uniform: string]: THREE.IUniform<any> };
}

/**
 * Renders a full screen plane that fills the viewport. A custom
 * ShaderMaterial is applied to this mesh, using the supplied
 * vertex and fragment shaders. Uniforms are passed through and
 * updated on each frame. The plane scales itself to the current
 * viewport size to maintain aspect ratio.
 */
export default function Plane({
  iTime,
  isPlaying,
  totalDuration,
  setCurrentTime,
  uniforms,
}: PlaneProps) {
  const plane = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  
  // NOUVEAU: Référence locale pour le temps accumulé
  const localTimeRef = useRef(iTime);

  // Update resolution uniform when the canvas size changes
  useEffect(() => {
    if (uniforms.uResolution) {
      uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size, uniforms]);

  // NOUVEAU: Synchroniser le temps local avec iTime quand il change (scrubbing)
  useEffect(() => {
    localTimeRef.current = iTime;
  }, [iTime]);

  // Main animation loop. Advances time and updates the iTime uniform.
  useFrame((_, delta) => {
    if (plane.current) {
      const mat = plane.current.material as THREE.ShaderMaterial;
      
      if (isPlaying) {
        // CORRECTION: Incrémenter le temps local et wrapper
        localTimeRef.current += delta;
        if (localTimeRef.current >= totalDuration) {
          localTimeRef.current = localTimeRef.current % totalDuration;
        }
        // Mettre à jour le state parent
        setCurrentTime(localTimeRef.current);
      }

      // CRITIQUE: Toujours mettre à jour l'uniform du shader
      if (mat.uniforms.iTime) {
        mat.uniforms.iTime.value = localTimeRef.current;
      }
    }
  });

  return (
    <mesh ref={plane} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 64, 64]} />
      <shaderMaterial
        side={THREE.DoubleSide}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}