import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import vertexShader from '../shaders/vertex.vert';
import fragmentShader from '../shaders/fragment.frag';

interface ThreeSceneProps {
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  setCurrentTime: (time: number) => void;
  uniforms: { [uniform: string]: THREE.IUniform<any> };
}

/**
 * Composant qui gère le rendu THREE.js pur (sans React Three Fiber).
 * Crée une scène, une caméra et un renderer, puis anime le shader.
 */
export default function ThreeScene({
  currentTime,
  isPlaying,
  totalDuration,
  setCurrentTime,
  uniforms,
}: ThreeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const localTimeRef = useRef(currentTime);
  const lastFrameTimeRef = useRef(performance.now());

  // Initialisation de la scène THREE.js
  useEffect(() => {
    if (!containerRef.current) return;

    // Créer la scène
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Créer la caméra orthographique
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Créer le renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Créer le mesh avec le shader
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Gérer le redimensionnement
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      rendererRef.current.setSize(width, height);
      
      // Mettre à jour l'uniform de résolution
      if (uniforms.uResolution) {
        uniforms.uResolution.value.set(width, height);
      }
    };

    window.addEventListener('resize', handleResize);

    // Initialiser la résolution
    if (uniforms.uResolution) {
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }

    // Boucle d'animation
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!meshRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) {
        return;
      }

      const now = performance.now();
      const delta = (now - lastFrameTimeRef.current) / 1000; // Convertir en secondes
      lastFrameTimeRef.current = now;

      // Mettre à jour le temps
      if (isPlaying) {
        localTimeRef.current += delta;
        if (localTimeRef.current >= totalDuration) {
          localTimeRef.current = localTimeRef.current % totalDuration;
        }
        setCurrentTime(localTimeRef.current);
      }

      // Mettre à jour l'uniform iTime
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms.iTime) {
        material.uniforms.iTime.value = localTimeRef.current;
      }

      // Rendre la scène
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    // Nettoyage
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        (meshRef.current.material as THREE.Material).dispose();
      }
    };
  }, []); // On n'initialise qu'une fois

  // Synchroniser le temps local avec currentTime (pour le scrubbing)
  useEffect(() => {
    localTimeRef.current = currentTime;
  }, [currentTime]);

  // Mettre à jour les uniforms quand ils changent
  useEffect(() => {
    if (!meshRef.current) return;
    
    const material = meshRef.current.material as THREE.ShaderMaterial;
    
    // Remplacer tous les uniforms
    Object.keys(uniforms).forEach(key => {
      if (material.uniforms[key]) {
        material.uniforms[key].value = uniforms[key].value;
      }
    });
    
    material.uniformsNeedUpdate = true;
  }, [uniforms]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
}