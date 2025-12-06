/**
 * Segment list panel for the Timeline modal.
 * Displays all segments with CRUD operations and audio alignment helpers.
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
  audioDuration?: number;
  totalDuration: number;
  lockToAudioDuration: boolean;
  onToggleAudioLock: (value: boolean) => void;
  onExtendToTrackEnd: (index: number) => void;
  onDistributeRemaining: () => void;
  onScrub?: (time: number) => void;
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
  audioDuration,
  totalDuration,
  lockToAudioDuration,
  onToggleAudioLock,
  onExtendToTrackEnd,
  onDistributeRemaining,
  onScrub,
}: SegmentListProps) {
  const remaining =
    audioDuration !== undefined ? audioDuration - totalDuration : undefined;
  const canDistribute =
    !!audioDuration &&
    lockToAudioDuration &&
    remaining !== undefined &&
    remaining > 0 &&
    segments.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 space-y-2">
        <h2 className="text-lg font-bold text-white">Segments</h2>
        <p className="text-xs text-gray-400">
          {segments.length} segment{segments.length !== 1 ? 's' : ''} •{' '}
          {totalDuration.toFixed(2)}s au total
        </p>
        {audioDuration !== undefined && (
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between text-gray-300">
              <span>Durée audio</span>
              <span>{audioDuration.toFixed(2)}s</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>Durée segments</span>
              <span>{totalDuration.toFixed(2)}s</span>
            </div>
            {remaining !== undefined && (
              <p
                className={
                  remaining >= 0 ? 'text-emerald-300' : 'text-red-300'
                }
              >
                {remaining >= 0
                  ? `Temps restant: ${remaining.toFixed(2)}s`
                  : `Dépassement: ${Math.abs(remaining).toFixed(2)}s`}
              </p>
            )}
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                className="w-3.5 h-3.5"
                checked={lockToAudioDuration}
                onChange={(e) => onToggleAudioLock(e.target.checked)}
              />
              Verrouiller sur la piste audio
            </label>
            <button
              type="button"
              onClick={onDistributeRemaining}
              disabled={!canDistribute}
              className={`w-full px-2 py-1 rounded text-xs font-medium border ${
                canDistribute
                  ? 'border-primary text-primary hover:bg-primary/10'
                  : 'border-dark-border text-gray-500 cursor-not-allowed'
              }`}
            >
              Répartir la durée restante
            </button>
          </div>
        )}
      </div>

      {/* Scrollable segment list */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {segments.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
            No segments yet
          </div>
        ) : (
          segments.map((segment, index) => {
            const availableForSegment =
              audioDuration !== undefined
                ? Math.max(
                    0,
                    audioDuration - (totalDuration - segment.durationSec)
                  )
                : 0;
            const extendDisabled =
              audioDuration === undefined ||
              availableForSegment <= segment.durationSec + 0.0001;

            return (
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
                onExtendToEnd={
                  audioDuration !== undefined
                    ? () => onExtendToTrackEnd(index)
                    : undefined
                }
                extendDisabled={extendDisabled}
                onScrub={onScrub}
              />
            );
          })
        )}
      </div>

      {/* Add button */}
      <button
        onClick={onAddSegment}
        className="mt-4 w-full px-4 py-2 bg-primary text-white rounded-lg font-bold text-lg hover:bg-primary/90 transition-colors"
        title="Add segment"
      >
        +
      </button>
    </div>
  );
}
