/**
 * Centralized slider configuration for all numeric controls
 * Defines min, max, step, and formatting for every slider in the app
 */

export interface SliderDef {
  min: number;
  max: number;
  step: number;
  label: string;
  format?: (value: number) => string;
}

export const SLIDER_CONFIG = {
  // ===== Shape Intensities (0-1 range) =====
  intensity: {
    min: 0,
    max: 1,
    step: 0.01,
    label: 'Intensity',
    format: (v: number) => `${(v * 100).toFixed(0)}%`,
  } as SliderDef,

  // ===== Fixed Circles Parameters =====
  circles: {
    radius: {
      min: 0.01,
      max: 1,
      step: 0.01,
      label: 'Radius',
    } as SliderDef,
    thickness: {
      min: 0.0001,
      max: 0.01,
      step: 0.0001,
      label: 'Thickness',
      format: (v: number) => v.toExponential(1),
    } as SliderDef,
    glow: {
      min: 0,
      max: 3,
      step: 0.1,
      label: 'Glow',
    } as SliderDef,
  },

  // ===== Expanding Circles Parameters =====
  expandingCircles: {
    startRadius: {
      min: 0,
      max: 1,
      step: 0.05,
      label: 'Start Radius',
    } as SliderDef,
    period: {
      min: 0.1,
      max: 100,
      step: 0.1,
      label: 'Period (s)',
    } as SliderDef,
    maxRadius: {
      min: 0,
      max: 1.5,
      step: 0.05,
      label: 'Max Radius',
    } as SliderDef,
    thickness: {
      min: 0.0001,
      max: 0.01,
      step: 0.0001,
      label: 'Thickness',
      format: (v: number) => v.toExponential(1),
    } as SliderDef,
    glow: {
      min: 0,
      max: 10,
      step: 0.1,
      label: 'Glow',
    } as SliderDef,
    startTime: {
      min: 0,
      max: 60,
      step: 0.1,
      label: 'Start Time',
    } as SliderDef,
  },

  // ===== Waves Parameters =====
  waves: {
    amplitude: {
      min: 0,
      max: 1,
      step: 0.01,
      label: 'Amplitude',
    } as SliderDef,
    frequency: {
      min: 0,
      max: 2,
      step: 0.01,
      label: 'Frequency',
    } as SliderDef,
    speed: {
      min: -2,
      max: 2,
      step: 0.1,
      label: 'Speed',
    } as SliderDef,
    thickness: {
      min: 0.0001,
      max: 0.01,
      step: 0.0001,
      label: 'Thickness',
      format: (v: number) => v.toExponential(1),
    } as SliderDef,
    glow: {
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Glow',
    } as SliderDef,
  },

  // ===== Epicycloids Parameters =====
  epicycloids: {
    R: {
      min: 0.1,
      max: 2,
      step: 0.05,
      label: 'Major Radius (R)',
    } as SliderDef,
    r: {
      min: 0.01,
      max: 1,
      step: 0.05,
      label: 'Minor Radius (r)',
    } as SliderDef,
    scale: {
      min: 0.1,
      max: 5,
      step: 0.1,
      label: 'Scale',
    } as SliderDef,
    thickness: {
      min: 0.0001,
      max: 0.01,
      step: 0.0001,
      label: 'Thickness',
      format: (v: number) => v.toExponential(1),
    } as SliderDef,
    speed: {
      min: 0,
      max: 2,
      step: 0.01,
      label: 'Speed',
    } as SliderDef,
    glow: {
      min: 0,
      max: 5,
      step: 0.1,
      label: 'Glow',
    } as SliderDef,
    samples: {
      min: 10,
      max: 200,
      step: 1,
      label: 'Samples',
    } as SliderDef,
  },

  // ===== Project-level Settings =====
  project: {
    fps: {
      min: 1,
      max: 120,
      step: 1,
      label: 'FPS',
    } as SliderDef,
    epicycloidsSampleFactor: {
      min: 0.1,
      max: 10,
      step: 0.1,
      label: 'Sample Factor',
    } as SliderDef,
  },

  // ===== Shape Instance Counts (per-segment limits) =====
  shapeCounts: {
    circles: {
      min: 0,
      max: 8,
      step: 1,
      label: 'Fixed Circles',
    } as SliderDef,
    expandingCircles: {
      min: 0,
      max: 8,
      step: 1,
      label: 'Expanding Circles',
    } as SliderDef,
    waves: {
      min: 0,
      max: 8,
      step: 1,
      label: 'Waves',
    } as SliderDef,
    epicycloids: {
      min: 0,
      max: 8,
      step: 1,
      label: 'Epicycloids',
    } as SliderDef,
  },
} as const;

/**
 * Get slider configuration for a specific field
 * @param category - The category (e.g., 'circles', 'expandingCircles', 'waves', 'epicycloids', 'intensity', 'project')
 * @param field - The field name (e.g., 'radius', 'period', 'scale')
 * @returns SliderDef or undefined if not found
 */
export function getSliderConfig(
  category: string,
  field?: string
): SliderDef | undefined {
  const sliderConfig = SLIDER_CONFIG as Record<
    string,
    SliderDef | Record<string, SliderDef>
  >;

  if (!field) {
    // If no field specified, assume category is the direct key (like 'intensity')
    const value = sliderConfig[category];
    if (
      value &&
      typeof value === 'object' &&
      'min' in value &&
      'max' in value
    ) {
      return value as SliderDef;
    }
    return undefined;
  }

  const categoryConfig = sliderConfig[category];
  if (
    categoryConfig &&
    typeof categoryConfig === 'object' &&
    !('min' in categoryConfig)
  ) {
    // It's a nested object (like circles, waves, etc.)
    const nested = categoryConfig as Record<string, SliderDef>;
    return nested[field];
  }

  return undefined;
}

/**
 * Format a numeric value for display using the slider's formatter
 */
export function formatSliderValue(
  value: number,
  config: SliderDef
): string {
  if (config.format) {
    return config.format(value);
  }
  return value.toString();
}
