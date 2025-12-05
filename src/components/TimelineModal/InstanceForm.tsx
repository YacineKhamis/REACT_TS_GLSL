/**
 * InstanceForm component - displays and edits parameters for a selected shape instance.
 * Uses sliders for all numeric controls + color picker for colors.
 */

import type { ShapeInstance, CircleInstance, WaveInstance, EpicycloidInstance, ExpandingCircleInstance } from '../../types/shapeInstances';
import { SliderField } from '../FormFields/SliderField';
import { getSliderConfig } from '../../constants/sliderDefaults';

interface InstanceFormProps {
  instance: ShapeInstance;
  onUpdate: (instance: ShapeInstance) => void;
}

export function InstanceForm({ instance, onUpdate }: InstanceFormProps) {
  const rgbToHex = (rgb: [number, number, number]): string => {
    const r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  // Common fields for all types
  const renderCommonFields = () => {
    const intensityConfig = getSliderConfig('intensity');
    return (
      <>
        {/* Intensity - with slider */}
        {intensityConfig && (
          <SliderField
            label="Intensity"
            value={instance.intensity}
            onChange={(value) => onUpdate({ ...instance, intensity: value })}
            config={intensityConfig}
          />
        )}

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={rgbToHex(instance.color)}
              onChange={(e) => onUpdate({ ...instance, color: hexToRgb(e.target.value) })}
              className="w-16 h-10 rounded border border-dark-border cursor-pointer"
            />
            <span className="text-sm text-gray-400">
              RGB({Math.round(instance.color[0] * 255)}, {Math.round(instance.color[1] * 255)}, {Math.round(instance.color[2] * 255)})
            </span>
          </div>
        </div>
      </>
    );
  };

  // Circle-specific fields
  if (instance.type === 'circle') {
    const circle = instance as CircleInstance;
    const radiusConfig = getSliderConfig('circles', 'radius');
    const thicknessConfig = getSliderConfig('circles', 'thickness');
    const glowConfig = getSliderConfig('circles', 'glow');

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">Fixed Circle Parameters</h4>

        {radiusConfig && (
          <SliderField
            label="Radius"
            value={circle.radius}
            onChange={(value) => onUpdate({ ...circle, radius: value })}
            config={radiusConfig}
          />
        )}

        {thicknessConfig && (
          <SliderField
            label="Thickness"
            value={circle.thickness}
            onChange={(value) => onUpdate({ ...circle, thickness: value })}
            config={thicknessConfig}
          />
        )}

        {glowConfig && (
          <SliderField
            label="Glow"
            value={circle.glow}
            onChange={(value) => onUpdate({ ...circle, glow: value })}
            config={glowConfig}
          />
        )}

        {renderCommonFields()}
      </div>
    );
  }

  // Wave-specific fields
  if (instance.type === 'wave') {
    const wave = instance as WaveInstance;
    const amplitudeConfig = getSliderConfig('waves', 'amplitude');
    const frequencyConfig = getSliderConfig('waves', 'frequency');
    const speedConfig = getSliderConfig('waves', 'speed');
    const thicknessConfig = getSliderConfig('waves', 'thickness');
    const glowConfig = getSliderConfig('waves', 'glow');

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">Wave Parameters</h4>

        {amplitudeConfig && (
          <SliderField
            label="Amplitude"
            value={wave.amplitude}
            onChange={(value) => onUpdate({ ...wave, amplitude: value })}
            config={amplitudeConfig}
          />
        )}

        {frequencyConfig && (
          <SliderField
            label="Frequency"
            value={wave.frequency}
            onChange={(value) => onUpdate({ ...wave, frequency: value })}
            config={frequencyConfig}
          />
        )}

        {speedConfig && (
          <SliderField
            label="Speed"
            value={wave.speed}
            onChange={(value) => onUpdate({ ...wave, speed: value })}
            config={speedConfig}
          />
        )}

        {thicknessConfig && (
          <SliderField
            label="Thickness"
            value={wave.thickness}
            onChange={(value) => onUpdate({ ...wave, thickness: value })}
            config={thicknessConfig}
          />
        )}

        {glowConfig && (
          <SliderField
            label="Glow"
            value={wave.glow}
            onChange={(value) => onUpdate({ ...wave, glow: value })}
            config={glowConfig}
          />
        )}

        {renderCommonFields()}
      </div>
    );
  }

  // Epicycloid-specific fields
  if (instance.type === 'epicycloid') {
    const epi = instance as EpicycloidInstance;
    const RConfig = getSliderConfig('epicycloids', 'R');
    const rConfig = getSliderConfig('epicycloids', 'r');
    const scaleConfig = getSliderConfig('epicycloids', 'scale');
    const thicknessConfig = getSliderConfig('epicycloids', 'thickness');
    const speedConfig = getSliderConfig('epicycloids', 'speed');
    const glowConfig = getSliderConfig('epicycloids', 'glow');
    const samplesConfig = getSliderConfig('epicycloids', 'samples');

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">Epicycloid Parameters</h4>

        {RConfig && (
          <SliderField
            label="R (Major Radius)"
            value={epi.R}
            onChange={(value) => onUpdate({ ...epi, R: value })}
            config={RConfig}
          />
        )}

        {rConfig && (
          <SliderField
            label="r (Minor Radius)"
            value={epi.r}
            onChange={(value) => onUpdate({ ...epi, r: value })}
            config={rConfig}
          />
        )}

        {scaleConfig && (
          <SliderField
            label="Scale"
            value={epi.scale}
            onChange={(value) => onUpdate({ ...epi, scale: value })}
            config={scaleConfig}
          />
        )}

        {thicknessConfig && (
          <SliderField
            label="Thickness"
            value={epi.thickness}
            onChange={(value) => onUpdate({ ...epi, thickness: value })}
            config={thicknessConfig}
          />
        )}

        {speedConfig && (
          <SliderField
            label="Speed"
            value={epi.speed}
            onChange={(value) => onUpdate({ ...epi, speed: value })}
            config={speedConfig}
          />
        )}

        {glowConfig && (
          <SliderField
            label="Glow"
            value={epi.glow}
            onChange={(value) => onUpdate({ ...epi, glow: value })}
            config={glowConfig}
          />
        )}

        {samplesConfig && (
          <SliderField
            label="Samples"
            value={epi.samples}
            onChange={(value) => onUpdate({ ...epi, samples: Math.round(value) })}
            config={samplesConfig}
          />
        )}

        {renderCommonFields()}
      </div>
    );
  }

  // Expanding Circle-specific fields
  if (instance.type === 'expandingCircle') {
    const expand = instance as ExpandingCircleInstance;
    const startRadiusConfig = getSliderConfig('expandingCircles', 'startRadius');
    const periodConfig = getSliderConfig('expandingCircles', 'period');
    const maxRadiusConfig = getSliderConfig('expandingCircles', 'maxRadius');
    const thicknessConfig = getSliderConfig('expandingCircles', 'thickness');
    const glowConfig = getSliderConfig('expandingCircles', 'glow');
    const startTimeConfig = getSliderConfig('expandingCircles', 'startTime');

    return (
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white">Expanding Circle Parameters</h4>

        {startRadiusConfig && (
          <SliderField
            label="Start Radius"
            value={expand.startRadius}
            onChange={(value) => onUpdate({ ...expand, startRadius: value })}
            config={startRadiusConfig}
          />
        )}

        {periodConfig && (
          <SliderField
            label="Period (seconds)"
            value={expand.period}
            onChange={(value) => onUpdate({ ...expand, period: value })}
            config={periodConfig}
          />
        )}

        {maxRadiusConfig && (
          <SliderField
            label="Max Radius"
            value={expand.maxRadius}
            onChange={(value) => onUpdate({ ...expand, maxRadius: value })}
            config={maxRadiusConfig}
          />
        )}

        {thicknessConfig && (
          <SliderField
            label="Thickness"
            value={expand.thickness}
            onChange={(value) => onUpdate({ ...expand, thickness: value })}
            config={thicknessConfig}
          />
        )}

        {glowConfig && (
          <SliderField
            label="Glow"
            value={expand.glow}
            onChange={(value) => onUpdate({ ...expand, glow: value })}
            config={glowConfig}
          />
        )}

        {startTimeConfig && (
          <SliderField
            label="Start Time (offset in segment)"
            value={expand.startTime}
            onChange={(value) => onUpdate({ ...expand, startTime: value })}
            config={startTimeConfig}
            unit="seconds"
          />
        )}

        {renderCommonFields()}
      </div>
    );
  }

  return null;
}
