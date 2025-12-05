/**
 * SliderField - Editable numeric control with slider + number input
 * Provides both coarse (slider) and fine (input) control for numeric values
 */

import { useMemo } from 'react';
import type { SliderDef } from '../../constants/sliderDefaults';
import { formatSliderValue } from '../../constants/sliderDefaults';

interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  config: SliderDef;
  unit?: string;
  disabled?: boolean;
}

export function SliderField({
  label,
  value,
  onChange,
  config,
  unit,
  disabled = false,
}: SliderFieldProps) {
  // Clamp value to valid range
  const clampedValue = useMemo(() => {
    return Math.max(config.min, Math.min(config.max, value));
  }, [value, config.min, config.max]);

  // Format display value
  const displayValue = useMemo(() => {
    return formatSliderValue(clampedValue, config);
  }, [clampedValue, config]);

  // Calculate percentage for visual feedback
  const percentage = useMemo(() => {
    return ((clampedValue - config.min) / (config.max - config.min)) * 100;
  }, [clampedValue, config.min, config.max]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Label + Value Display */}
      <div className="flex justify-between items-baseline gap-2">
        <label className="text-xs font-medium text-gray-300">{label}</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={clampedValue}
            onChange={handleInputChange}
            min={config.min}
            max={config.max}
            step={config.step}
            disabled={disabled}
            className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-right font-mono text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-500 focus:border-primary focus:outline-none transition-colors"
          />
          {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
      </div>

      {/* Slider with background fill */}
      <div className="relative">
        <input
          type="range"
          value={clampedValue}
          onChange={handleSliderChange}
          min={config.min}
          max={config.max}
          step={config.step}
          disabled={disabled}
          className="w-full h-1.5 bg-gray-800 rounded appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed accent-primary slider-thumb"
          style={
            {
              '--slider-percentage': `${percentage}%`,
            } as React.CSSProperties
          }
        />
        {/* Background fill effect */}
        <div
          className="absolute top-0 left-0 h-1.5 rounded bg-primary/30 pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Min/Max indicators */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>{config.min}</span>
        <span>{displayValue}</span>
        <span>{config.max}</span>
      </div>
    </div>
  );
}
