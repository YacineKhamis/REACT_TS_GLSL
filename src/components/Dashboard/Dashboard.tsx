/**
 * Dashboard component - Landing page for the application.
 * Displays project summary and navigation buttons over the shader preview.
 */

import { ProjectSummary } from './ProjectSummary';
import { ActionButtons } from './ActionButtons';

interface DashboardProps {
  projectName: string;
  fps: number;
  segmentCount: number;
  totalDuration: number;
  isVisible: boolean;
  onToggleVisibility: () => void;
  onEditProject: () => void;
  onEditTimeline: () => void;
}

export function Dashboard({
  projectName,
  fps,
  segmentCount,
  totalDuration,
  isVisible,
  onToggleVisibility,
  onEditProject,
  onEditTimeline,
}: DashboardProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-start justify-start pointer-events-none">
      <div className="flex flex-col gap-6 p-5 pt-20 pointer-events-auto">
        <ProjectSummary
          projectName={projectName}
          fps={fps}
          segmentCount={segmentCount}
          totalDuration={totalDuration}
        />

        <ActionButtons
          onEditProject={onEditProject}
          onEditTimeline={onEditTimeline}
        />
      </div>
    </div>
  );
}
