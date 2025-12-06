/**
 * Project settings modal component using Radix Dialog.
 * Provides interface for editing global uniforms and managing project files.
 * Style matches TimelineModal for UI consistency.
 */

import * as Dialog from '@radix-ui/react-dialog';
import type { UniformSet, ShapeLimits, AudioTrackInfo } from '../../types/config';
import { ProjectSettings } from './ProjectSettings';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  onProjectNameChange: (name: string) => void;
  fps: number;
  maxShapeLimits: ShapeLimits;
  onMaxShapeLimitsChange: (limits: ShapeLimits) => void;
  uniforms: UniformSet;
  onUniformsChange: (uniforms: UniformSet) => void;
  audioTrack?: AudioTrackInfo;
  isAudioLoading: boolean;
  audioError?: string | null;
  onAudioTrackSelect: (file: File) => void;
  onAudioTrackRemove: () => void;
  totalDuration: number;
  isAudioLocked: boolean;
  onAudioLockChange: (value: boolean) => void;
  onNew: () => void;
  onSave: () => void;
  onLoad: (data: unknown) => void;
}

export function ProjectModal({
  isOpen,
  onClose,
  projectName,
  onProjectNameChange,
  fps,
  maxShapeLimits,
  onMaxShapeLimitsChange,
  uniforms,
  onUniformsChange,
  audioTrack,
  isAudioLoading,
  audioError,
  onAudioTrackSelect,
  onAudioTrackRemove,
  totalDuration,
  isAudioLocked,
  onAudioLockChange,
  onNew,
  onSave,
  onLoad,
}: ProjectModalProps) {
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
                Project Settings
              </Dialog.Title>
              <Dialog.Description className="text-sm text-gray-400 mt-1">
                Configure global uniforms and manage project files
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

          {/* Main content */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full">
              <ProjectSettings
                projectName={projectName}
                onProjectNameChange={onProjectNameChange}
                fps={fps}
                maxShapeLimits={maxShapeLimits}
                onMaxShapeLimitsChange={onMaxShapeLimitsChange}
                uniforms={uniforms}
                onUniformsChange={onUniformsChange}
                audioTrack={audioTrack}
                isAudioLoading={isAudioLoading}
                audioError={audioError}
                onAudioTrackSelect={onAudioTrackSelect}
                onAudioTrackRemove={onAudioTrackRemove}
                totalDuration={totalDuration}
                isAudioLockEnabled={isAudioLocked}
                onAudioLockChange={onAudioLockChange}
                onNew={onNew}
                onSave={onSave}
                onLoad={onLoad}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
