/**
 * Main Timeline modal component using Radix Dialog.
 * Displays segment management, live preview, and shape instance editing with playback controls.
 */

import * as Dialog from '@radix-ui/react-dialog';
import type { SegmentConfig, ShapeLimits, UniformVec3, AudioTrackInfo, TransitionProfile } from '../../types/config';
import type { ShapeInstanceCollection } from '../../types/shapeInstances';
import { generateInstanceId } from '../../types/shapeInstances';
import { getCircleDefaults, getExpandingCircleDefaults, getWaveDefaults, getEpicycloidDefaults } from '../../constants/shapeDefaults';
import { SegmentList } from './SegmentList';
import { ShapeInstanceEditor } from './ShapeInstanceEditor';
import { TimelinePreview } from './TimelinePreview';
import { TimelinePlaybackBar } from './TimelinePlaybackBar';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  segments: SegmentConfig[];
  selectedSegmentIndex: number;
  onSelectSegment: (index: number) => void;
  onAddSegment: () => void;
  onDuplicateSegment: (index: number) => void;
  onDeleteSegment: (index: number) => void;
  onUpdateSegmentLabel: (index: number, label: string) => void;
  onUpdateSegmentDuration: (index: number, duration: number) => void;
  maxShapeLimits: ShapeLimits;
  onUpdateSegmentBackground: (index: number, color: UniformVec3) => void;
  onUpdateSegmentTint: (index: number, tint: UniformVec3 | undefined) => void;
  onUpdateSegmentTransition: (index: number, duration: number) => void;
  onUpdateSegmentTransitionProfile: (index: number, profile: TransitionProfile | undefined) => void;
  onUpdateSegmentShapeInstances: (index: number, instances: ShapeInstanceCollection) => void;
  // Playback props
  currentTime: number;
  isPlaying: boolean;
  totalDuration: number;
  audioTrack?: AudioTrackInfo;
  lockToAudioDuration: boolean;
  onToggleAudioLock: (value: boolean) => void;
  onExtendSegmentToAudioEnd: (index: number) => void;
  onDistributeRemainingDuration: () => void;
  onPlayPause: () => void;
  onScrub: (time: number) => void;
  shaderUniforms: Record<string, { value: unknown }>;
}

export function TimelineModal({
  isOpen,
  onClose,
  segments,
  selectedSegmentIndex,
  onSelectSegment,
  onAddSegment,
  onDuplicateSegment,
  onDeleteSegment,
  onUpdateSegmentLabel,
  onUpdateSegmentDuration,
  maxShapeLimits,
  onUpdateSegmentBackground,
  onUpdateSegmentTint,
  onUpdateSegmentTransition,
  onUpdateSegmentTransitionProfile,
  onUpdateSegmentShapeInstances,
  currentTime,
  isPlaying,
  totalDuration,
  audioTrack,
  lockToAudioDuration,
  onToggleAudioLock,
  onExtendSegmentToAudioEnd,
  onDistributeRemainingDuration,
  onPlayPause,
  onScrub,
  shaderUniforms,
}: TimelineModalProps) {
  const selectedSegment = segments[selectedSegmentIndex];

  // Calculate shape counts from shapeInstances
  const shapeCounts = selectedSegment?.shapeInstances
    ? {
        circles: selectedSegment.shapeInstances.circles.length,
        expandingCircles: selectedSegment.shapeInstances.expandingCircles.length,
        waves: selectedSegment.shapeInstances.waves.length,
        epicycloids: selectedSegment.shapeInstances.epicycloids.length,
      }
    : { circles: 0, expandingCircles: 0, waves: 0, epicycloids: 0 };

  // Auto-jump to segment start when segment is selected
  const handleSelectSegment = (index: number) => {
    onSelectSegment(index);
    const segment = segments[index];
    if (segment) {
      onScrub(segment.startSec);
    }
  };

  // Handle shape count changes by adjusting shapeInstances
  const handleShapeCountsChange = (newCounts: typeof shapeCounts) => {
    if (!selectedSegment?.shapeInstances) return;

    const instances = { ...selectedSegment.shapeInstances };

    // Helper to adjust array length
    const adjustArray = <T extends { id: string; type: string; enabled: boolean }>(
      arr: T[],
      targetLength: number,
      createDefault: (index: number) => T
    ): T[] => {
      if (arr.length === targetLength) return arr;
      if (arr.length > targetLength) {
        // Remove excess instances from the end
        return arr.slice(0, targetLength);
      }
      // Add new instances
      const newInstances = [...arr];
      for (let i = arr.length; i < targetLength; i++) {
        newInstances.push(createDefault(i));
      }
      return newInstances;
    };

    // Adjust each shape type
    instances.circles = adjustArray(
      instances.circles,
      newCounts.circles,
      (i) => ({
        id: generateInstanceId(),
        type: 'circle',
        enabled: false, // Disabled by default - user must enable manually in Shapes tab
        ...getCircleDefaults(i),
      })
    );

    instances.expandingCircles = adjustArray(
      instances.expandingCircles,
      newCounts.expandingCircles,
      () => ({
        id: generateInstanceId(),
        type: 'expandingCircle',
        enabled: false, // Disabled by default - user must enable manually in Shapes tab
        ...getExpandingCircleDefaults(),
      })
    );

    instances.waves = adjustArray(
      instances.waves,
      newCounts.waves,
      (i) => ({
        id: generateInstanceId(),
        type: 'wave',
        enabled: false, // Disabled by default - user must enable manually in Shapes tab
        ...getWaveDefaults(i),
      })
    );

    instances.epicycloids = adjustArray(
      instances.epicycloids,
      newCounts.epicycloids,
      (i) => ({
        id: generateInstanceId(),
        type: 'epicycloid',
        enabled: false, // Disabled by default - user must enable manually in Shapes tab
        ...getEpicycloidDefaults(i),
      })
    );

    onUpdateSegmentShapeInstances(selectedSegmentIndex, instances);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        {/* Backdrop with blur */}
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />

        {/* Modal content */}
        <Dialog.Content
          className="fixed inset-[5vh] bg-dark rounded-lg overflow-hidden z-50 flex flex-col"
          onEscapeKeyDown={onClose}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-border">
            <div>
              <Dialog.Title className="text-2xl font-bold text-white">
                Timeline Editor
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-400 mt-1">
                Manage segments and configure shape instances
              </Dialog.Description>
            </div>

            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-lighter hover:bg-dark-border text-gray-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Main content grid - 3 columns */}
          <div className="flex-1 grid grid-cols-[180px_1fr_400px] gap-4 p-4 overflow-hidden">
            {/* Left: Segment list */}
            <div className="overflow-hidden">
              <SegmentList
                segments={segments}
                selectedSegmentIndex={selectedSegmentIndex}
                onSelectSegment={handleSelectSegment}
                onAddSegment={onAddSegment}
                onDuplicateSegment={onDuplicateSegment}
                onDeleteSegment={onDeleteSegment}
                onUpdateSegmentLabel={onUpdateSegmentLabel}
                onUpdateSegmentDuration={onUpdateSegmentDuration}
                audioDuration={audioTrack?.duration}
                totalDuration={totalDuration}
                lockToAudioDuration={lockToAudioDuration}
                onToggleAudioLock={onToggleAudioLock}
                onExtendToTrackEnd={onExtendSegmentToAudioEnd}
                onDistributeRemaining={onDistributeRemainingDuration}
                onScrub={onScrub}
              />
            </div>

            {/* Center: Live Preview */}
            <div className="overflow-hidden">
              <TimelinePreview
                currentTime={currentTime}
                isPlaying={isPlaying}
                totalDuration={totalDuration}
                uniforms={shaderUniforms}
                onTimeUpdate={onScrub}
                segments={segments}
                selectedSegmentIndex={selectedSegmentIndex}
              />
            </div>

            {/* Right: Shape Instance Editor */}
            <div className="overflow-hidden">
              {selectedSegment && selectedSegment.shapeInstances ? (
                <ShapeInstanceEditor
                  durationSec={selectedSegment.durationSec}
                  startSec={selectedSegment.startSec}
                  endSec={selectedSegment.endSec}
                  backgroundColor={selectedSegment.backgroundColor}
                  onBackgroundColorChange={(color) =>
                    onUpdateSegmentBackground(selectedSegmentIndex, color)
                  }
                  tint={selectedSegment.tint}
                  onTintChange={(tint) => onUpdateSegmentTint(selectedSegmentIndex, tint)}
                  shapeCounts={shapeCounts}
                  onShapeCountsChange={handleShapeCountsChange}
                  transitionDuration={selectedSegment.transitionDuration}
                  onTransitionDurationChange={(duration) =>
                    onUpdateSegmentTransition(selectedSegmentIndex, duration)
                  }
                  transitionProfile={selectedSegment.transitionProfile}
                  onTransitionProfileChange={(profile) =>
                    onUpdateSegmentTransitionProfile(selectedSegmentIndex, profile)
                  }
                  shapeInstances={selectedSegment.shapeInstances}
                  onShapeInstancesChange={(instances) =>
                    onUpdateSegmentShapeInstances(selectedSegmentIndex, instances)
                  }
                  maxShapeLimits={maxShapeLimits}
                  audioTrack={audioTrack}
                  lockToAudioDuration={lockToAudioDuration}
                  totalDuration={totalDuration}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-500 italic">
                    Select a segment to edit its parameters
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer: Playback Bar */}
          <TimelinePlaybackBar
            currentTime={currentTime}
            isPlaying={isPlaying}
            onPlayPause={onPlayPause}
            onScrub={onScrub}
            totalDuration={totalDuration}
            segments={segments.map(seg => ({ start: seg.startSec, duration: seg.durationSec }))}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
