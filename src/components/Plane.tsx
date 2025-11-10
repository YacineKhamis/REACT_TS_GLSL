import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import vertexShader from "../shaders/vertex.vert";
import fragmentShader from "../shaders/fragment.frag";
import { useFrame, useThree } from "@react-three/fiber";

export default function Plane() {
  const plane = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
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
    }),
    []
  );

  const { size } = useThree();
  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size, uniforms.uResolution.value]);

  useFrame(({ clock }) => {
    if (plane.current) {
      (plane.current.material as THREE.ShaderMaterial).uniforms.iTime.value =
        clock.getElapsedTime();
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