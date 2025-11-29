import React, { useCallback } from 'react';
import type { UniformSet, UniformVec3 } from '../types/config';
import { DEFAULT_EPI_SAMPLES, MAX_EPI } from '../constants/epicycloids';

interface UniformControlsProps {
  /**
   * The current set of uniforms to edit. Changes will be emitted via
   * the onChange callback. Consumers should treat this as immutable
   * and always pass a new object when updating.
   */
  uniforms: UniformSet;
  /**
   * Called whenever the user changes one of the uniform values. A
   * complete UniformSet is passed back, making it easy for callers
   * to update their state.
   */
  onChange: (next: UniformSet) => void;
}

/**
 * Convert a normalised RGB triple into a CSS hex string. Values are
 * clamped to the range [0,1] and scaled to [0,255].
 */
function vec3ToHex(v: UniformVec3): string {
  const [r, g, b] = v.map(c => Math.min(1, Math.max(0, c))) as [number, number, number];
  const toHex = (x: number) => x.toString(16).padStart(2, '0');
  return `#${toHex(Math.round(r * 255))}${toHex(Math.round(g * 255))}${toHex(Math.round(b * 255))}`;
}

/**
 * Convert a CSS hex string into a normalised RGB triple. If parsing
 * fails, returns black.
 */
function hexToVec3(hex: string): UniformVec3 {
  const value = hex.replace('#', '');
  if (value.length === 6) {
    const r = parseInt(value.substring(0, 2), 16) / 255;
    const g = parseInt(value.substring(2, 4), 16) / 255;
    const b = parseInt(value.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  return [0, 0, 0];
}

/**
 * Render inputs for editing the fields of a UniformSet. Colour values
 * are edited with native colour pickers; scalar values use numeric
 * inputs. The layout intentionally keeps each row narrow and labels
 * concise. Consumers may wrap this component in their own
 * container to control spacing.
 */
export const UniformControls: React.FC<UniformControlsProps> = ({ uniforms, onChange }) => {
  const handleColour = useCallback((key: keyof UniformSet) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = hexToVec3(e.target.value);
    onChange({ ...uniforms, [key]: next as any });
  }, [uniforms, onChange]);

  const handleScalar = useCallback((key: keyof UniformSet) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange({ ...uniforms, [key]: Number.isFinite(val) ? val : 0 } as any);
  }, [uniforms, onChange]);

  /**
   * Update a nested shape count. Creates or merges the shapeCounts
   * object immutably. If the value is NaN, defaults to zero. Accepts
   * integer values; decimals will be floored implicitly via number
   * input restrictions.
   */
  const handleShapeCount = useCallback((shape: keyof NonNullable<UniformSet['shapeCounts']>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    const nextCount = Number.isFinite(val) ? val : 0;
    onChange({
      ...uniforms,
      shapeCounts: {
        ...(uniforms.shapeCounts ?? {}),
        [shape]: nextCount,
      },
    } as UniformSet);
  }, [uniforms, onChange]);

  /**
   * Update a nested tint colour. Tints are optional; when undefined,
   * they inherit the base tint (white) from the shader. This handler
   * converts a hex string into a vec3 and updates the corresponding
   * entry in the tints object.
   */
  const handleTint = useCallback((shape: keyof NonNullable<UniformSet['tints']>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVec = hexToVec3(e.target.value);
    onChange({
      ...uniforms,
      tints: {
        ...(uniforms.tints ?? {}),
        [shape]: nextVec,
      },
    } as UniformSet);
  }, [uniforms, onChange]);

  const handleEpiSample = useCallback((index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    const nextValue = Number.isFinite(parsed) ? Math.max(1, parsed) : 1;
    const current = uniforms.epicycloidsSamples ?? DEFAULT_EPI_SAMPLES;
    const nextSamples = Array.from({ length: MAX_EPI }, (_, i) => current[i] ?? DEFAULT_EPI_SAMPLES[i]);
    nextSamples[index] = nextValue;
    onChange({
      ...uniforms,
      epicycloidsSamples: nextSamples,
    } as UniformSet);
  }, [uniforms, onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Background colour */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '120px' }}>Background</span>
        <input
          type="color"
          value={vec3ToHex(uniforms.backgroundColor)}
          onChange={handleColour('backgroundColor')}
        />
      </label>
      {/* Intensities */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '120px' }}>Circles Int.</span>
        <input
          type="number"
          min={0}
          max={2}
          step={0.01}
          value={uniforms.circlesIntensity}
          onChange={handleScalar('circlesIntensity')}
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '120px' }}>Waves Int.</span>
        <input
          type="number"
          min={0}
          max={2}
          step={0.01}
          value={uniforms.wavesIntensity}
          onChange={handleScalar('wavesIntensity')}
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '120px' }}>Epicycloids Int.</span>
        <input
          type="number"
          min={0}
          max={2}
          step={0.01}
          value={uniforms.epicycloidsIntensity}
          onChange={handleScalar('epicycloidsIntensity')}
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '120px' }}>Expand Int.</span>
        <input
          type="number"
          min={0}
          max={2}
          step={0.01}
          value={uniforms.expandingCirclesIntensity}
          onChange={handleScalar('expandingCirclesIntensity')}
        />
      </label>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ width: '120px' }}>Epi Sample Factor</span>
        <input
          type="number"
          min={0.1}
          max={1}
          step={0.05}
          value={uniforms.epicycloidsSampleFactor ?? 1}
          onChange={handleScalar('epicycloidsSampleFactor')}
        />
      </label>

      {/* Shape counts editing */}
      <fieldset style={{ border: '1px solid #444', padding: '8px', marginTop: '8px' }}>
        <legend style={{ padding: '0 4px' }}>Shape Counts</legend>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '120px' }}># Circles</span>
          <input
            type="number"
            min={0}
            max={8}
            step={1}
            value={uniforms.shapeCounts?.circles ?? 0}
            onChange={handleShapeCount('circles')}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '120px' }}># Expand</span>
          <input
            type="number"
            min={0}
            max={8}
            step={1}
            value={uniforms.shapeCounts?.expandingCircles ?? 0}
            onChange={handleShapeCount('expandingCircles')}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '120px' }}># Waves</span>
          <input
            type="number"
            min={0}
            max={8}
            step={1}
            value={uniforms.shapeCounts?.waves ?? 0}
            onChange={handleShapeCount('waves')}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '120px' }}># Epicycloids</span>
          <input
            type="number"
            min={0}
            max={8}
            step={1}
            value={uniforms.shapeCounts?.epicycloids ?? 0}
            onChange={handleShapeCount('epicycloids')}
          />
        </label>
      </fieldset>

      {/* Tint overrides */}
      <fieldset style={{ border: '1px solid #444', padding: '8px', marginTop: '8px' }}>
        <legend style={{ padding: '0 4px' }}>Tints</legend>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '120px' }}>Circles Tint</span>
          <input
            type="color"
            value={vec3ToHex(uniforms.tints?.circles ?? [1, 1, 1])}
            onChange={handleTint('circles')}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '120px' }}>Waves Tint</span>
          <input
            type="color"
            value={vec3ToHex(uniforms.tints?.waves ?? [1, 1, 1])}
            onChange={handleTint('waves')}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '120px' }}>Epicycloids Tint</span>
          <input
            type="color"
            value={vec3ToHex(uniforms.tints?.epicycloids ?? [1, 1, 1])}
            onChange={handleTint('epicycloids')}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '120px' }}>Expand Tint</span>
          <input
            type="color"
            value={vec3ToHex(uniforms.tints?.expandingCircles ?? [1, 1, 1])}
            onChange={handleTint('expandingCircles')}
          />
        </label>
      </fieldset>
      <fieldset style={{ border: '1px solid #444', padding: '8px', marginTop: '8px' }}>
        <legend style={{ padding: '0 4px' }}>Epicycloid Samples</legend>
        {Array.from({ length: MAX_EPI }).map((_, idx) => (
          <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: '120px' }}>Epi {idx}</span>
            <input
              type="number"
              min={1}
              max={2000}
              step={1}
              value={(uniforms.epicycloidsSamples ?? DEFAULT_EPI_SAMPLES)[idx] ?? DEFAULT_EPI_SAMPLES[idx]}
              onChange={handleEpiSample(idx)}
            />
          </label>
        ))}
      </fieldset>
    </div>
  );
};

export default UniformControls;
