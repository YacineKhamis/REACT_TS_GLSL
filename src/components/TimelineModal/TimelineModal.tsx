/**
 * Main Timeline modal component using Radix Dialog.
 * Displays segment management and shape instance editing in a large overlay.
 */

import * as Dialog from '@radix-ui/react-dialog';
import type { SegmentConfig } from '../../types/config';
import { SegmentList } from './SegmentList';
import { ShapeTabs } from './ShapeTabs';

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
}: TimelineModalProps) {
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

          {/* Main content grid */}
          <div className="flex-1 grid grid-cols-[300px_1fr] gap-6 p-6 overflow-hidden">
            {/* Left: Segment list */}
            <div className="overflow-hidden">
              <SegmentList
                segments={segments}
                selectedSegmentIndex={selectedSegmentIndex}
                onSelectSegment={onSelectSegment}
                onAddSegment={onAddSegment}
                onDuplicateSegment={onDuplicateSegment}
                onDeleteSegment={onDeleteSegment}
                onUpdateSegmentLabel={onUpdateSegmentLabel}
                onUpdateSegmentDuration={onUpdateSegmentDuration}
              />
            </div>

            {/* Right: Shape tabs (placeholder for Phase 3) */}
            <div className="overflow-hidden">
              <ShapeTabs />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
