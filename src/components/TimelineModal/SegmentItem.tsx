/**
 * Individual segment item in the segment list.
 * Displays segment info with inline editing and CRUD controls.
 */

import { useState, useCallback } from 'react';
import type { SegmentConfig } from '../../types/config';

interface SegmentItemProps {
  segment: SegmentConfig;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateLabel: (label: string) => void;
  onUpdateDuration: (duration: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SegmentItem({
  segment,
  index,
  isSelected,
  onSelect,
  onUpdateLabel,
  onUpdateDuration,
  onDuplicate,
  onDelete,
}: SegmentItemProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDuration, setIsEditingDuration] = useState(false);
  const [labelValue, setLabelValue] = useState(segment.label);
  const [durationValue, setDurationValue] = useState(
    segment.durationSec.toString()
  );

  const handleLabelSubmit = useCallback(() => {
    setIsEditingLabel(false);
    if (labelValue.trim() !== segment.label) {
      onUpdateLabel(labelValue.trim());
    }
  }, [labelValue, segment.label, onUpdateLabel]);

  const handleDurationSubmit = useCallback(() => {
    setIsEditingDuration(false);
    const parsed = parseFloat(durationValue);
    if (!isNaN(parsed) && parsed > 0 && parsed !== segment.durationSec) {
      onUpdateDuration(parsed);
    } else {
      setDurationValue(segment.durationSec.toString());
    }
  }, [durationValue, segment.durationSec, onUpdateDuration]);

  return (
    <div
      className={`
        p-3 mb-2 rounded-lg border cursor-pointer transition-all
        ${
          isSelected
            ? 'bg-primary/20 border-primary'
            : 'bg-dark-lighter border-dark-border hover:bg-dark-lighter/80'
        }
      `}
      onClick={onSelect}
    >
      {/* Segment header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs text-gray-400">#{index + 1}</span>
          {isEditingLabel ? (
            <input
              type="text"
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={handleLabelSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLabelSubmit();
                if (e.key === 'Escape') {
                  setIsEditingLabel(false);
                  setLabelValue(segment.label);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-dark border border-primary rounded px-2 py-1 text-sm text-white outline-none"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 font-medium text-white truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditingLabel(true);
              }}
              title="Double-click to edit"
            >
              {segment.label}
            </span>
          )}
        </div>
      </div>

      {/* Duration */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <span>Duration:</span>
        {isEditingDuration ? (
          <input
            type="number"
            value={durationValue}
            onChange={(e) => setDurationValue(e.target.value)}
            onBlur={handleDurationSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleDurationSubmit();
              if (e.key === 'Escape') {
                setIsEditingDuration(false);
                setDurationValue(segment.durationSec.toString());
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-20 bg-dark border border-primary rounded px-2 py-0.5 text-white outline-none"
            autoFocus
            step="0.1"
            min="0.1"
          />
        ) : (
          <span
            className="font-mono hover:text-white cursor-text"
            onDoubleClick={(e) => {
              e.stopPropagation();
              setIsEditingDuration(true);
            }}
            title="Double-click to edit"
          >
            {segment.durationSec.toFixed(2)}s
          </span>
        )}
      </div>

      {/* Time range */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <span>
          {segment.startSec.toFixed(2)}s → {segment.endSec.toFixed(2)}s
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="flex-1 px-2 py-1 bg-dark border border-dark-border rounded text-xs text-white hover:bg-dark-lighter transition-colors"
          title="Duplicate segment"
        >
          Duplicate
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete segment "${segment.label}"?`)) {
              onDelete();
            }
          }}
          className="flex-1 px-2 py-1 bg-red-900/30 border border-red-700 rounded text-xs text-red-300 hover:bg-red-900/50 transition-colors"
          title="Delete segment"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
