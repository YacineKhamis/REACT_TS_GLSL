/**
 * ShapeInstanceEditor component - combines Segment and Shapes tabs.
 * Uses Radix Tabs for tab navigation.
 */

import * as Tabs from '@radix-ui/react-tabs';
import type { UniformVec3, ShapeLimits, AudioTrackInfo, TransitionProfile } from '../../types/config';
import type { ShapeInstanceCollection } from '../../types/shapeInstances';
import { SegmentTab } from './SegmentTab';
import { ShapesTab } from './ShapesTab';

interface ShapeInstanceEditorProps {
  // Timing info (read-only)
  durationSec: number;
  startSec: number;
  endSec: number;

  // Segment tab props
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
  transitionProfile?: TransitionProfile;
  onTransitionProfileChange: (profile: TransitionProfile | undefined) => void;

  // Shapes tab props
  shapeInstances: ShapeInstanceCollection;
  onShapeInstancesChange: (instances: ShapeInstanceCollection) => void;
  maxShapeLimits: ShapeLimits;

  // Audio lock props
  audioTrack?: AudioTrackInfo;
  lockToAudioDuration: boolean;
  totalDuration: number;
}

export function ShapeInstanceEditor({
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
  transitionProfile,
  onTransitionProfileChange,
  shapeInstances,
  onShapeInstancesChange,
  maxShapeLimits,
  audioTrack,
  lockToAudioDuration,
  totalDuration,
}: ShapeInstanceEditorProps) {
  return (
    <Tabs.Root defaultValue="segment" className="flex flex-col h-full">
      {/* Tab List */}
      <Tabs.List className="flex border-b border-dark-border mb-4">
        <Tabs.Trigger
          value="segment"
          className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Segment
        </Tabs.Trigger>
        <Tabs.Trigger
          value="shapes"
          className="px-6 py-3 text-sm font-medium text-gray-400 hover:text-white transition-colors data-[state=active]:text-white data-[state=active]:border-b-2 data-[state=active]:border-primary"
        >
          Shapes
        </Tabs.Trigger>
      </Tabs.List>

      {/* Tab Content */}
      <Tabs.Content value="segment" className="flex-1 overflow-y-auto pr-2">
        <SegmentTab
          durationSec={durationSec}
          startSec={startSec}
          endSec={endSec}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={onBackgroundColorChange}
          tint={tint}
          onTintChange={onTintChange}
          shapeCounts={shapeCounts}
          onShapeCountsChange={onShapeCountsChange}
          transitionDuration={transitionDuration}
          onTransitionDurationChange={onTransitionDurationChange}
          transitionProfile={transitionProfile}
          onTransitionProfileChange={onTransitionProfileChange}
          maxShapeLimits={maxShapeLimits}
          audioTrack={audioTrack}
          lockToAudioDuration={lockToAudioDuration}
          totalDuration={totalDuration}
        />
      </Tabs.Content>

      <Tabs.Content value="shapes" className="flex-1 overflow-hidden">
        <ShapesTab
          shapeInstances={shapeInstances}
          onShapeInstancesChange={onShapeInstancesChange}
          maxShapeLimits={maxShapeLimits}
          shapeCounts={shapeCounts}
        />
      </Tabs.Content>
    </Tabs.Root>
  );
}
