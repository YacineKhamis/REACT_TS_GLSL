import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import vertexShader from '../shaders/vertex.vert';
import fragmentShader from '../shaders/fragment.frag';

interface ThreeSceneProps {
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  setCurrentTime: (time: number) => void;
  uniforms: { [uniform: string]: THREE.IUniform<unknown> };
}

/**
 * Composant qui gère le rendu THREE.js pur (sans React Three Fiber).
 * Crée une scène, une caméra et un renderer, puis anime le shader.
 * OPTIMISÉ pour éviter les boucles de re-render.
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
  const lastFrameTimeRef = useRef<number>(0);

  const [isReady, setIsReady] = useState(false);

  // Refs pour éviter les re-renders
  const currentTimeRef = useRef(currentTime);
  const isPlayingRef = useRef(isPlaying);
  const totalDurationRef = useRef(totalDuration);
  const setCurrentTimeRef = useRef(setCurrentTime);

  // Synchroniser les refs avec les props
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    totalDurationRef.current = totalDuration;
  }, [totalDuration]);

  useEffect(() => {
    setCurrentTimeRef.current = setCurrentTime;
  }, [setCurrentTime]);

  // Initialisation de la scène THREE.js (une seule fois)
  useEffect(() => {
    // Capturer la référence du container au début de l'effet
    const container = containerRef.current;
    if (!container) return;

    // Attendre que le container ait une taille avant d'initialiser
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      const checkSize = requestAnimationFrame(() => {
        setIsReady(true); // Force re-render when container is ready
      });
      return () => cancelAnimationFrame(checkSize);
    }

    // Créer la scène
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Créer la caméra orthographique
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;
    cameraRef.current = camera;

    // Créer le renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
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
      if (!camera || !renderer || !container) return;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      renderer.setSize(width, height);

      // Mettre à jour l'uniform de résolution
      const mat = mesh.material as THREE.ShaderMaterial;
      if (mat.uniforms.uResolution) {
        mat.uniforms.uResolution.value.set(width, height);
      }
    };

    // Initialiser la résolution
    if (material.uniforms.uResolution) {
      material.uniforms.uResolution.value.set(width, height);
    }

    // Observer pour détecter les changements de taille du conteneur
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', handleResize);

    // Forcer une mise à jour initiale après un court délai (pour laisser le DOM se stabiliser)
    setTimeout(() => handleResize(), 0);

    // Initialiser le temps de la dernière frame
    lastFrameTimeRef.current = performance.now();

    // Boucle d'animation (définie une seule fois)
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      if (!mesh || !scene || !camera || !renderer) return;

      const now = performance.now();
      const delta = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;

      const material = mesh.material as THREE.ShaderMaterial;

      // Mettre à jour le temps si en lecture
      if (isPlayingRef.current && totalDurationRef.current > 0) {
        let newTime = currentTimeRef.current + delta;
        if (newTime >= totalDurationRef.current) {
          newTime = newTime % totalDurationRef.current;
        }
        currentTimeRef.current = newTime;

        // Mettre à jour le state React (throttled naturellement par RAF)
        setCurrentTimeRef.current(newTime);
      }

      // Toujours mettre à jour l'uniform iTime
      if (material.uniforms.iTime) {
        material.uniforms.iTime.value = currentTimeRef.current;
      }

      // Rendre la scène
      renderer.render(scene, camera);
    };

    animate();

    // Nettoyage - utilise la variable locale 'container' capturée au début de l'effet
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);

      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }

      if (container && renderer) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady]); // Re-run when container becomes ready

  // Mettre à jour les uniforms quand ils changent (sans toucher à iTime et uResolution)
  useEffect(() => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;

    // Mettre à jour tous les uniforms SAUF iTime et uResolution
    // uResolution est géré par handleResize pour s'adapter au conteneur
    Object.keys(uniforms).forEach(key => {
      if (key !== 'iTime' && key !== 'uResolution' && material.uniforms[key]) {
        material.uniforms[key].value = uniforms[key].value;
      }
    });

    material.uniformsNeedUpdate = true;
  }, [uniforms]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
}