import { useRef, useEffect } from "react";
import * as THREE from "three";
import vertexShader from "../shaders/vertex.vert";
import fragmentShader from "../shaders/fragment.frag";
import { useFrame, useThree } from "@react-three/fiber";

interface PlaneProps {
  iTime: number;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
}

export default function Plane({ iTime, uniforms }: PlaneProps) {
  const plane = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size, uniforms.uResolution.value]);
  
  useFrame(() => {
    if (plane.current && plane.current.material) {
      (plane.current.material as THREE.ShaderMaterial).uniforms.iTime.value = iTime;
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