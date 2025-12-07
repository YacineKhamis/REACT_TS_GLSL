/**
 * Type definitions for shape instances.
 * Each segment can contain individual shape instances with their own parameters.
 */

// Base interface for all shape instances
export interface ShapeInstanceBase {
  id: string; // Unique identifier for React keys
  enabled: boolean; // Toggle visibility without deletion
}

// Circle instance with fixed position
export interface CircleInstance extends ShapeInstanceBase {
  type: 'circle';
  radius: number; // Override C_R[i]
  thickness: number; // Override C_THICK[i]
  glow: number; // Override C_GLOW[i]
  shape: 'circle' | 'square' | 'triangle' | 'heart'; // Outline type
  rotationSpeed: number; // Rotation speed for non-circular outlines
  intensity: number; // Individual instance intensity (0-1), replaces master circlesIntensity
  color: [number, number, number]; // RGB normalized [0-1], per-instance color
}

// Expanding circle instance (animated outward)
export interface ExpandingCircleInstance extends ShapeInstanceBase {
  type: 'expandingCircle';
  startRadius: number; // Starting radius (circles begin expanding from this radius)
  period: number; // Duration of one expansion cycle in seconds
  thickness: number; // Line thickness
  glow: number; // Glow intensity
  expansionSpeed: number; // Expansion speed in units per second (replaces maxRadius)
  startTime: number; // Offset within segment (seconds)
  intensity: number; // Individual instance intensity (0-1), replaces master expandingCirclesIntensity
  color: [number, number, number]; // RGB normalized [0-1], per-instance color
  shape: 'circle' | 'square' | 'triangle' | 'heart'; // Shape type for expanding outline
  pulseMode: 'loop' | 'single'; // Loop: repeat pulses, Single: pulse once then stop
  attack: number; // Seconds to reach full intensity (fade in)
  decay: number; // Seconds to fade out to zero intensity
}

// Wave instance (animated sine wave)
export interface WaveInstance extends ShapeInstanceBase {
  type: 'wave';
  amplitude: number; // Override W_AMP[i]
  frequency: number; // Override W_FREQ[i]
  speed: number; // Override W_SPEED[i]
  thickness: number; // Override W_THICK[i]
  glow: number; // Override W_GLOW[i]
  intensity: number; // Individual instance intensity (0-1), replaces master wavesIntensity
  color: [number, number, number]; // RGB normalized [0-1], per-instance color
}

// Epicycloid instance (parametric curve)
export interface EpicycloidInstance extends ShapeInstanceBase {
  type: 'epicycloid';
  R: number; // Major radius - Override E_R[i]
  r: number; // Minor radius - Override E_r[i]
  scale: number; // Overall scale - Override E_SCALE[i]
  thickness: number; // Line thickness - Override E_THICK[i]
  speed: number; // Animation speed - Override E_SPEED[i]
  glow: number; // Glow intensity - Override E_GLOW[i]
  samples: number; // Number of samples for rendering - Override E_SAMPLES[i]
  intensity: number; // Individual instance intensity (0-1), replaces master epicycloidsIntensity
  color: [number, number, number]; // RGB normalized [0-1], per-instance color
}

// Union type for all shape instances
export type ShapeInstance =
  | CircleInstance
  | ExpandingCircleInstance
  | WaveInstance
  | EpicycloidInstance;

// Collection of shape instances for a segment
export interface ShapeInstanceCollection {
  circles: CircleInstance[];
  expandingCircles: ExpandingCircleInstance[];
  waves: WaveInstance[];
  epicycloids: EpicycloidInstance[];
}

// Type guard helpers
export function isCircleInstance(instance: ShapeInstance): instance is CircleInstance {
  return instance.type === 'circle';
}

export function isExpandingCircleInstance(
  instance: ShapeInstance
): instance is ExpandingCircleInstance {
  return instance.type === 'expandingCircle';
}

export function isWaveInstance(instance: ShapeInstance): instance is WaveInstance {
  return instance.type === 'wave';
}

export function isEpicycloidInstance(
  instance: ShapeInstance
): instance is EpicycloidInstance {
  return instance.type === 'epicycloid';
}

// Helper to create empty collection
export function createEmptyCollection(): ShapeInstanceCollection {
  return {
    circles: [],
    expandingCircles: [],
    waves: [],
    epicycloids: [],
  };
}

// Helper to generate unique IDs
export function generateInstanceId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}
