import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import vertexShader from '../shaders/vertex.vert';
import fragmentShader from '../shaders/fragment.frag';
import { useThree } from '@react-three/fiber';

interface PlaneProps {
  /** Current playback time in seconds. Propagated to the shader as
   * iTime on each frame. */
  iTime: number;
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
export default function Plane({ iTime, uniforms }: PlaneProps) {
  const plane = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  // Update resolution uniform when the canvas size changes
  useEffect(() => {
    if (uniforms.uResolution) {
      uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size, uniforms]);

  // Update the iTime uniform whenever the prop changes. This avoids
  // capturing stale values in a useFrame callback.
  useEffect(() => {
    if (plane.current && plane.current.material) {
      const mat = plane.current.material as THREE.ShaderMaterial;
      if (mat.uniforms && mat.uniforms.iTime) {
        mat.uniforms.iTime.value = iTime;
      }
    }
  }, [iTime]);

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