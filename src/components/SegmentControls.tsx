import React, { useState, useCallback } from 'react';
import type { SegmentConfig, UniformSet } from '../types/config';
import UniformControls from './UniformControls';

interface SegmentControlsProps {
  /** List of segments in the project. */
  segments: SegmentConfig[];
  /** The project's global uniforms. Used as a base when computing
   * effective values for the editor. */
  projectUniforms: UniformSet;
  /** Handler for when a segment's duration changes. */
  onDurationChange: (index: number, duration: number) => void;
  /** Handler for when a segment's label changes. */
  onLabelChange: (index: number, label: string) => void;
  /** Handler for when a segment's uniform overrides change. Pass
   * undefined to remove overrides. */
  onOverrideChange: (index: number, overrides: Partial<UniformSet> | undefined) => void;
  /** Add a new segment to the end of the list. */
  onAdd: () => void;
  /** Duplicate a segment at the given index. */
  onDuplicate: (index: number) => void;
  /** Remove a segment at the given index. */
  onRemove: (index: number) => void;
}

/**
 * Component for managing timeline segments. Renders a scrollable list of
 * segment summaries and exposes an editor for the selected segment.
 * Users can edit labels, durations and override uniforms for each
 * segment. Duplicate, delete and add actions are also provided.
 */
const SegmentControls: React.FC<SegmentControlsProps> = ({
  segments,
  projectUniforms,
  onDurationChange,
  onLabelChange,
  onOverrideChange,
  onAdd,
  onDuplicate,
  onRemove,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Compute the effective uniform values shown in the editor for the
  // selected segment. We merge the project defaults with any overrides.
  const effectiveUniforms = useCallback((): UniformSet => {
    const seg = segments[selectedIndex];
    if (!seg) return projectUniforms;
    const overrides = seg.uniformsOverride ?? {};
    return {
      ...projectUniforms,
      ...overrides,
      shapeCounts: {
        ...(projectUniforms.shapeCounts ?? {}),
        ...(overrides.shapeCounts ?? {}),
      },
      tints: {
        ...(projectUniforms.tints ?? {}),
        ...(overrides.tints ?? {}),
      },
    };
  }, [segments, selectedIndex, projectUniforms]);

  const handleUniformChange = useCallback(
    (next: UniformSet) => {
      // Compute partial overrides by comparing to projectUniforms
      const overrides: Partial<UniformSet> = {};
      (Object.keys(projectUniforms) as (keyof UniformSet)[]).forEach(key => {
        const base = (projectUniforms as any)[key];
        const curr = (next as any)[key];
        if (typeof base === 'number') {
          if (base !== curr) {
            (overrides as any)[key] = curr;
          }
        } else if (Array.isArray(base)) {
          // compare vectors
          if (JSON.stringify(base) !== JSON.stringify(curr)) {
            (overrides as any)[key] = curr;
          }
        } else {
          // nested objects (shapeCounts or tints)
          // compute nested diffs
          const nested: any = {};
          Object.keys(curr ?? {}).forEach(nKey => {
            const b = (base ?? {})[nKey];
            const c = curr ? (curr as any)[nKey] : undefined;
            if (JSON.stringify(b) !== JSON.stringify(c)) {
              nested[nKey] = c;
            }
          });
          if (Object.keys(nested).length > 0) {
            (overrides as any)[key] = nested;
          }
        }
      });
      // If overrides is empty, pass undefined to clear
      if (Object.keys(overrides).length === 0) {
        onOverrideChange(selectedIndex, undefined);
      } else {
        onOverrideChange(selectedIndex, overrides);
      }
    },
    [projectUniforms, selectedIndex, onOverrideChange],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <h3 style={{ marginTop: 0 }}>Segments</h3>
      <div style={{ maxHeight: '40vh', overflowY: 'auto', border: '1px solid #444', padding: '4px' }}>
        {segments.map((seg, i) => (
          <div
            key={seg.id}
            onClick={() => setSelectedIndex(i)}
            style={{
              padding: '6px',
              marginBottom: '4px',
              backgroundColor: selectedIndex === i ? 'rgba(0,123,255,0.3)' : 'transparent',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <input
                style={{ flex: 1, marginRight: '8px', backgroundColor: 'transparent', color: 'white', border: '1px solid #555', padding: '2px' }}
                value={seg.label}
                onChange={e => onLabelChange(i, e.target.value)}
              />
              <button onClick={() => onDuplicate(i)} style={{ marginRight: '4px' }}>Dup</button>
              <button onClick={() => onRemove(i)}>Del</button>
            </div>
            <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ marginRight: '8px' }}>Durée&nbsp;(s):</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={seg.durationSec}
                onChange={e => onDurationChange(i, parseFloat(e.target.value))}
                style={{ width: '80px' }}
              />
            </div>
            <small>Start: {seg.startSec.toFixed(2)}s — End: {seg.endSec.toFixed(2)}s</small>
          </div>
        ))}
      </div>
      <button onClick={onAdd}>+ Ajouter un segment</button>
      {/* Editor for selected segment overrides */}
      {segments[selectedIndex] && (
        <div style={{ marginTop: '12px' }}>
          <h4>Uniforms (Segment)</h4>
          <UniformControls uniforms={effectiveUniforms()} onChange={handleUniformChange} />
          <button onClick={() => onOverrideChange(selectedIndex, undefined)} style={{ marginTop: '8px' }}>
            Réinitialiser les overrides
          </button>
        </div>
      )}
    </div>
  );
};

export default SegmentControls;