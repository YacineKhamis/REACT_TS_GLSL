/**
 * Project metadata section for the Project Settings modal.
 * Displays project name and FPS (read-only).
 */

import { ReadOnlyField } from '../FormFields/ReadOnlyField';

interface ProjectMetaSectionProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  fps: number;
}

export function ProjectMetaSection({
  projectName,
  onProjectNameChange,
  fps,
}: ProjectMetaSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-white">Project Information</h3>

      {/* Project Name */}
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-white mb-2">
          Project Name
        </label>
        <input
          id="projectName"
          type="text"
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="My Shader Project"
        />
      </div>

      {/* FPS - Read Only */}
      <ReadOnlyField
        label="Frames Per Second"
        value={fps}
        unit="fps"
      />
    </div>
  );
}
