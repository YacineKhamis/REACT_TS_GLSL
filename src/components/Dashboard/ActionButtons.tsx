/**
 * Action buttons for Dashboard navigation.
 * Provides buttons to open Project Settings, Timeline Editor, and Video Export modals.
 */

interface ActionButtonsProps {
  onEditProject: () => void;
  onEditTimeline: () => void;
  onExportVideo: () => void;
}

export function ActionButtons({ onEditProject, onEditTimeline, onExportVideo }: ActionButtonsProps) {
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

      <button
        onClick={onExportVideo}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
        Export Video
      </button>
    </div>
  );
}
