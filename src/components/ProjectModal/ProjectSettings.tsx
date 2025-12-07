/**
 * Project settings component.
 * Organized into modular sections for better maintainability.
 */

import type { UniformSet, ShapeLimits, AudioTrackInfo } from '../../types/config';
import { ProjectMetaSection } from './ProjectMetaSection';
import { AudioSection } from './AudioSection';
import { ShapeLimitSection } from './ShapeLimitSection';
import { RenderingSection } from './RenderingSection';
import { FileActions } from './FileActions';

interface ProjectSettingsProps {
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
  isAudioLockEnabled: boolean;
  onAudioLockChange: (value: boolean) => void;
  onNew: () => void;
  onSave: () => void;
  onLoad: (data: unknown) => void;
}

export function ProjectSettings({
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
  isAudioLockEnabled,
  onAudioLockChange,
  onNew,
  onSave,
  onLoad,
}: ProjectSettingsProps) {
  return (
    <div className="flex flex-col h-full w-full mx-auto">
      <div className="flex-1 overflow-y-auto pr-2">
        {/* Two-column grid on desktop for better space usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ProjectMetaSection
              projectName={projectName}
              onProjectNameChange={onProjectNameChange}
              fps={fps}
            />

            <ShapeLimitSection
              maxShapeLimits={maxShapeLimits}
              onMaxShapeLimitsChange={onMaxShapeLimitsChange}
            />

            <RenderingSection
              uniforms={uniforms}
              onUniformsChange={onUniformsChange}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AudioSection
              audioTrack={audioTrack}
              isAudioLoading={isAudioLoading}
              audioError={audioError}
              onAudioTrackSelect={onAudioTrackSelect}
              onAudioTrackRemove={onAudioTrackRemove}
              totalDuration={totalDuration}
              isAudioLockEnabled={isAudioLockEnabled}
              onAudioLockChange={onAudioLockChange}
            />

            <FileActions
              onNew={onNew}
              onSave={onSave}
              onLoad={onLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
