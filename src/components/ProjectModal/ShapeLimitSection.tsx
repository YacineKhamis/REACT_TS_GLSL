/**
 * Shape limits section for the Project Settings modal.
 * Allows users to set maximum instance counts per shape type.
 */

import type { ShapeLimits } from '../../types/config';

interface ShapeLimitSectionProps {
  maxShapeLimits: ShapeLimits;
  onMaxShapeLimitsChange: (limits: ShapeLimits) => void;
}

export function ShapeLimitSection({
  maxShapeLimits,
  onMaxShapeLimitsChange,
}: ShapeLimitSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Maximum Shape Limits</h3>
      <p className="text-sm text-gray-400">
        Define the maximum number of instances allowed per shape type. Each segment can use up to these limits.
      </p>

      <div className="grid grid-cols-2 gap-4">
        {/* Fixed Shapes */}
        <div>
          <label htmlFor="maxCircles" className="block text-sm font-medium text-white mb-2">
            Fixed Shapes
          </label>
          <input
            id="maxCircles"
            type="number"
            min="0"
            max="8"
            value={maxShapeLimits.circles}
            onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, circles: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Expanding Shapes */}
        <div>
          <label htmlFor="maxExpandingCircles" className="block text-sm font-medium text-white mb-2">
            Expanding Shapes
          </label>
          <input
            id="maxExpandingCircles"
            type="number"
            min="0"
            max="8"
            value={maxShapeLimits.expandingCircles}
            onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, expandingCircles: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Waves */}
        <div>
          <label htmlFor="maxWaves" className="block text-sm font-medium text-white mb-2">
            Waves
          </label>
          <input
            id="maxWaves"
            type="number"
            min="0"
            max="8"
            value={maxShapeLimits.waves}
            onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, waves: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Epicycloids */}
        <div>
          <label htmlFor="maxEpicycloids" className="block text-sm font-medium text-white mb-2">
            Epicycloids
          </label>
          <input
            id="maxEpicycloids"
            type="number"
            min="0"
            max="8"
            value={maxShapeLimits.epicycloids}
            onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, epicycloids: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
