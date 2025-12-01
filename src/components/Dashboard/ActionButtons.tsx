/**
 * Action buttons for Dashboard navigation.
 * Provides buttons to open Project Settings and Timeline Editor modals.
 */

interface ActionButtonsProps {
  onEditProject: () => void;
  onEditTimeline: () => void;
}

export function ActionButtons({ onEditProject, onEditTimeline }: ActionButtonsProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-md">
      <button
        onClick={onEditProject}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Edit Project Settings
      </button>

      <button
        onClick={onEditTimeline}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Edit Timeline
      </button>
    </div>
  );
}
