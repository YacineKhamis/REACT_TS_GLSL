/**
 * Segment list panel for the Timeline modal.
 * Displays all segments with CRUD operations.
 */

import type { SegmentConfig } from '../../types/config';
import { SegmentItem } from './SegmentItem';

interface SegmentListProps {
  segments: SegmentConfig[];
  selectedSegmentIndex: number;
  onSelectSegment: (index: number) => void;
  onAddSegment: () => void;
  onDuplicateSegment: (index: number) => void;
  onDeleteSegment: (index: number) => void;
  onUpdateSegmentLabel: (index: number, label: string) => void;
  onUpdateSegmentDuration: (index: number, duration: number) => void;
}

export function SegmentList({
  segments,
  selectedSegmentIndex,
  onSelectSegment,
  onAddSegment,
  onDuplicateSegment,
  onDeleteSegment,
  onUpdateSegmentLabel,
  onUpdateSegmentDuration,
}: SegmentListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Segments</h2>
        <p className="text-xs text-gray-400">
          {segments.length} segment{segments.length !== 1 ? 's' : ''} •{' '}
          {segments.reduce((sum, seg) => sum + seg.durationSec, 0).toFixed(2)}s
          total
        </p>
      </div>

      {/* Scrollable segment list */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {segments.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No segments yet
          </div>
        ) : (
          segments.map((segment, index) => (
            <SegmentItem
              key={segment.id}
              segment={segment}
              index={index}
              isSelected={index === selectedSegmentIndex}
              onSelect={() => onSelectSegment(index)}
              onUpdateLabel={(label) => onUpdateSegmentLabel(index, label)}
              onUpdateDuration={(duration) =>
                onUpdateSegmentDuration(index, duration)
              }
              onDuplicate={() => onDuplicateSegment(index)}
              onDelete={() => onDeleteSegment(index)}
            />
          ))
        )}
      </div>

      {/* Add button */}
      <button
        onClick={onAddSegment}
        className="mt-4 w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        + Add Segment
      </button>
    </div>
  );
}
