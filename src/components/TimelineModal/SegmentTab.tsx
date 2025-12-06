/**
 * SegmentTab component for editing per-segment parameters.
 * Allows editing: background color, tint, shape counts, and transition duration.
 * Displays read-only information: duration, start time, end time.
 */

import type { UniformVec3, ShapeLimits, AudioTrackInfo } from '../../types/config';
import { SliderField } from '../FormFields/SliderField';
import { getSliderConfig } from '../../constants/sliderDefaults';

interface SegmentTabProps {
  durationSec: number;
  startSec: number;
  endSec: number;
  backgroundColor: UniformVec3;
  onBackgroundColorChange: (color: UniformVec3) => void;
  tint?: UniformVec3;
  onTintChange: (tint: UniformVec3 | undefined) => void;
  shapeCounts: {
    circles: number;
    expandingCircles: number;
    waves: number;
    epicycloids: number;
  };
  onShapeCountsChange: (counts: {
    circles: number;
    expandingCircles: number;
    waves: number;
    epicycloids: number;
  }) => void;
  transitionDuration: number;
  onTransitionDurationChange: (duration: number) => void;
  maxShapeLimits: ShapeLimits;
  audioTrack?: AudioTrackInfo;
  lockToAudioDuration: boolean;
  totalDuration: number;
}

export function SegmentTab({
  durationSec,
  startSec,
  endSec,
  backgroundColor,
  onBackgroundColorChange,
  tint,
  onTintChange,
  shapeCounts,
  onShapeCountsChange,
  transitionDuration,
  onTransitionDurationChange,
  maxShapeLimits,
  audioTrack,
  lockToAudioDuration,
  totalDuration,
}: SegmentTabProps) {
  const rgbToHex = (rgb: UniformVec3): string => {
    const r = Math.round(rgb[0] * 255).toString(16).padStart(2, '0');
    const g = Math.round(rgb[1] * 255).toString(16).padStart(2, '0');
    const b = Math.round(rgb[2] * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const hexToRgb = (hex: string): UniformVec3 => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b];
  };

  const useTint = tint !== undefined;

  // Calculate remaining audio time
  const remainingTime = audioTrack && Number.isFinite(audioTrack.duration)
    ? audioTrack.duration - totalDuration
    : undefined;

  return (
    <div className="space-y-6">
      {/* Timing Information - Read Only (Compact) */}
      <div className="pb-4 border-b border-dark-border">
        <h3 className="text-sm font-bold text-white mb-2">Timing</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Duration:</span>
            <span className="font-medium text-white">{durationSec.toFixed(2)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">Start:</span>
            <span className="font-medium text-white">{startSec.toFixed(2)}s</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">End:</span>
            <span className="font-medium text-white">{endSec.toFixed(2)}s</span>
          </div>
        </div>

        {/* Audio Lock Feedback */}
        {audioTrack && lockToAudioDuration && (
          <div className={`mt-3 p-2 rounded-lg text-xs ${
            remainingTime !== undefined && remainingTime < 0
              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
              : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
          }`}>
            {remainingTime !== undefined && remainingTime < 0 ? (
              <span>⚠️ Duration locked to audio track. Exceeded by {Math.abs(remainingTime).toFixed(2)}s</span>
            ) : (
              <span>🔒 Duration locked to audio track. {remainingTime?.toFixed(2)}s remaining</span>
            )}
          </div>
        )}
      </div>

      {/* Background Color */}
      <div>
        <label htmlFor="backgroundColor" className="block text-sm font-medium text-white mb-2">
          Background Color
        </label>
        <div className="flex items-center gap-3">
          <input
            id="backgroundColor"
            type="color"
            value={rgbToHex(backgroundColor)}
            onChange={(e) => onBackgroundColorChange(hexToRgb(e.target.value))}
            className="w-16 h-10 rounded border border-dark-border cursor-pointer"
          />
          <span className="text-sm text-gray-400">
            RGB({Math.round(backgroundColor[0] * 255)}, {Math.round(backgroundColor[1] * 255)}, {Math.round(backgroundColor[2] * 255)})
          </span>
        </div>
      </div>

      {/* Tint/Color Multiplier */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="useTint" className="text-sm font-medium text-white">
            Color Tint/Multiplier
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              id="useTint"
              type="checkbox"
              checked={useTint}
              onChange={(e) => {
                if (e.target.checked) {
                  onTintChange([1, 1, 1]);
                } else {
                  onTintChange(undefined);
                }
              }}
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-400">Enable</span>
          </label>
        </div>
        {useTint && tint && (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={rgbToHex(tint)}
              onChange={(e) => onTintChange(hexToRgb(e.target.value))}
              className="w-16 h-10 rounded border border-dark-border cursor-pointer"
            />
            <span className="text-sm text-gray-400">
              RGB({Math.round(tint[0] * 255)}, {Math.round(tint[1] * 255)}, {Math.round(tint[2] * 255)})
            </span>
          </div>
        )}
        {!useTint && (
          <p className="text-sm text-gray-500 italic">No tint applied (uses shape instance colors directly)</p>
        )}
      </div>

      {/* Transition Duration */}
      <div>
        <label htmlFor="transitionDuration" className="block text-sm font-medium text-white mb-2">
          Transition Duration (seconds)
        </label>
        <p className="text-xs text-gray-400 mb-2">
          Duration for smooth interpolation from previous segment
        </p>
        <input
          id="transitionDuration"
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={transitionDuration}
          onChange={(e) => onTransitionDurationChange(parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Shape Counts */}
      <div>
        <h4 className="text-sm font-medium text-white mb-3">Shape Instance Counts</h4>
        <p className="text-xs text-gray-400 mb-4">
          Number of instances to display for each shape type (use sliders to adjust)
        </p>

        <div className="space-y-4">
          {/* Fixed Circles */}
          {getSliderConfig('shapeCounts', 'circles') && (
            <SliderField
              label={`Fixed Circles (max: ${maxShapeLimits.circles})`}
              value={shapeCounts.circles}
              onChange={(value) => onShapeCountsChange({ ...shapeCounts, circles: Math.round(value) })}
              config={{ ...getSliderConfig('shapeCounts', 'circles')!, max: maxShapeLimits.circles }}
            />
          )}

          {/* Expanding Circles */}
          {getSliderConfig('shapeCounts', 'expandingCircles') && (
            <SliderField
              label={`Expanding Circles (max: ${maxShapeLimits.expandingCircles})`}
              value={shapeCounts.expandingCircles}
              onChange={(value) => onShapeCountsChange({ ...shapeCounts, expandingCircles: Math.round(value) })}
              config={{ ...getSliderConfig('shapeCounts', 'expandingCircles')!, max: maxShapeLimits.expandingCircles }}
            />
          )}

          {/* Waves */}
          {getSliderConfig('shapeCounts', 'waves') && (
            <SliderField
              label={`Waves (max: ${maxShapeLimits.waves})`}
              value={shapeCounts.waves}
              onChange={(value) => onShapeCountsChange({ ...shapeCounts, waves: Math.round(value) })}
              config={{ ...getSliderConfig('shapeCounts', 'waves')!, max: maxShapeLimits.waves }}
            />
          )}

          {/* Epicycloids */}
          {getSliderConfig('shapeCounts', 'epicycloids') && (
            <SliderField
              label={`Epicycloids (max: ${maxShapeLimits.epicycloids})`}
              value={shapeCounts.epicycloids}
              onChange={(value) => onShapeCountsChange({ ...shapeCounts, epicycloids: Math.round(value) })}
              config={{ ...getSliderConfig('shapeCounts', 'epicycloids')!, max: maxShapeLimits.epicycloids }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
