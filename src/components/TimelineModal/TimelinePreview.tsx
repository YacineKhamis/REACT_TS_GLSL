/**
 * TimelinePreview component - Wrapper for ThreeScene in the Timeline Modal.
 * Displays live shader preview with proper sizing for modal context.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import ThreeScene from '../ThreeScene';
import type { SegmentConfig } from '../../types/config';

interface TimelinePreviewProps {
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  uniforms: Record<string, { value: unknown }>;
  onTimeUpdate: (time: number) => void;
  segments: SegmentConfig[];
  selectedSegmentIndex: number;
}

export function TimelinePreview({
  currentTime,
  isPlaying,
  totalDuration,
  uniforms,
  onTimeUpdate,
  segments,
  selectedSegmentIndex,
}: TimelinePreviewProps) {
  // Create a deep copy of uniforms to avoid sharing uResolution with the main ThreeScene
  const modalUniforms = useMemo(() => {
    const copy: Record<string, { value: unknown }> = {};
    for (const key in uniforms) {
      const value = uniforms[key].value;

      // Deep clone THREE.js objects
      let clonedValue: unknown;
      if (value instanceof THREE.Vector2) {
        clonedValue = value.clone();
      } else if (value instanceof THREE.Vector3) {
        clonedValue = value.clone();
      } else if (value instanceof THREE.Color) {
        clonedValue = value.clone();
      } else if (Array.isArray(value)) {
        // Clone arrays (for uniform arrays)
        clonedValue = value.map(v => {
          if (v instanceof THREE.Vector2) return v.clone();
          if (v instanceof THREE.Vector3) return v.clone();
          if (v instanceof THREE.Color) return v.clone();
          return v;
        });
      } else {
        // Primitive values (numbers, etc.)
        clonedValue = value;
      }

      copy[key] = { value: clonedValue };
    }
    return copy;
  }, [uniforms]);
  // Find current segment based on currentTime
  const getCurrentSegment = () => {
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (currentTime >= seg.startSec && currentTime < seg.startSec + seg.durationSec) {
        return { index: i, segment: seg };
      }
    }
    return null;
  };

  const currentSegmentInfo = getCurrentSegment();
  const selectedSegment = segments[selectedSegmentIndex];

  return (
    <div className="relative h-full bg-black rounded-lg border-2 border-dark-border overflow-hidden">
      {/* ThreeScene fills the container */}
      <div className="absolute inset-0">
        <ThreeScene
          currentTime={currentTime}
          isPlaying={isPlaying}
          totalDuration={totalDuration}
          setCurrentTime={onTimeUpdate}
          uniforms={modalUniforms}
        />
      </div>

      {/* Top: Preview label */}
      <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-gray-400 pointer-events-none">
        Live Preview
      </div>

      {/* Bottom: Current segment indicator */}
      <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg pointer-events-none">
        <div className="flex items-center justify-between text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-gray-400 text-xs">Current Segment:</span>
            {currentSegmentInfo ? (
              <span className="text-white font-medium">
                Segment {currentSegmentInfo.index + 1}: {currentSegmentInfo.segment.label}
              </span>
            ) : (
              <span className="text-gray-500 italic">No segment</span>
            )}
          </div>

          {selectedSegmentIndex !== currentSegmentInfo?.index && (
            <div className="flex flex-col gap-1 items-end">
              <span className="text-gray-400 text-xs">Editing:</span>
              <span className="text-primary font-medium">
                Segment {selectedSegmentIndex + 1}: {selectedSegment?.label || 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
