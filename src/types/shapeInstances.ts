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
  color: [number, number, number]; // RGB normalized [0-1]
}

// Expanding circle instance (animated outward)
export interface ExpandingCircleInstance extends ShapeInstanceBase {
  type: 'expandingCircle';
  period: number; // Override EXPAND_PERIOD
  thickness: number; // Override EXPAND_THICKNESS
  glow: number; // Override EXPAND_GLOW
  maxRadius: number; // Override EXPAND_MAX_RADIUS
  startTime: number; // Offset within segment (seconds)
}

// Wave instance (animated sine wave)
export interface WaveInstance extends ShapeInstanceBase {
  type: 'wave';
  amplitude: number; // Override W_AMP[i]
  frequency: number; // Override W_FREQ[i]
  speed: number; // Override W_SPEED[i]
  thickness: number; // Override W_THICK[i]
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
