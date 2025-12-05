/**
 * Project summary card displaying key project information.
 * Shows project name, FPS, segment count, and total duration.
 */

interface ProjectSummaryProps {
  projectName: string;
  fps: number;
  segmentCount: number;
  totalDuration: number;
}

export function ProjectSummary({
  projectName,
  fps,
  segmentCount,
  totalDuration,
}: ProjectSummaryProps) {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toFixed(1)}s`;
  };

  return (
    <div className="bg-dark/90 backdrop-blur-sm rounded-lg border border-dark-border p-4 max-w-sm w-full">
      {/* Header */}
      <div className="mb-3">
        <h1 className="text-lg font-bold text-white">GLSL Shader Project</h1>
        <h2 className="text-sm text-gray-300">{projectName}</h2>
      </div>

      {/* Compact Stats - Single line */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-400">FPS:</span>
          <span className="font-semibold text-white">{fps}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Segments:</span>
          <span className="font-semibold text-white">{segmentCount}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Duration:</span>
          <span className="font-semibold text-white">{formatDuration(totalDuration)}</span>
        </div>
      </div>
    </div>
  );
}
