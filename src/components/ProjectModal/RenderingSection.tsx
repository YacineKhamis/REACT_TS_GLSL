/**
 * Rendering performance section for the Project Settings modal.
 * Controls GPU performance settings like epicycloid sample factor.
 */

import type { UniformSet } from '../../types/config';
import { SliderField } from '../FormFields/SliderField';
import { getSliderConfig } from '../../constants/sliderDefaults';

interface RenderingSectionProps {
  uniforms: UniformSet;
  onUniformsChange: (uniforms: UniformSet) => void;
}

export function RenderingSection({
  uniforms,
  onUniformsChange,
}: RenderingSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Rendering Performance</h3>
      <p className="text-sm text-gray-400">
        Control GPU performance by adjusting the epicycloid sample factor. Lower values reduce workload at the cost of visual fidelity.
      </p>

      {getSliderConfig('project', 'epicycloidsSampleFactor') && (
        <SliderField
          label="Epicycloid Sample Factor"
          value={uniforms.epicycloidsSampleFactor ?? 1}
          onChange={(value) => onUniformsChange({ ...uniforms, epicycloidsSampleFactor: value })}
          config={getSliderConfig('project', 'epicycloidsSampleFactor')!}
        />
      )}
    </div>
  );
}
