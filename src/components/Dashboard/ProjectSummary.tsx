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
    <div className="bg-dark/90 backdrop-blur-sm rounded-lg border border-dark-border p-8 max-w-md w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🎨</div>
        <h1 className="text-2xl font-bold text-white mb-2">GLSL Shader Project</h1>
        <h2 className="text-lg text-gray-300">{projectName}</h2>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-lighter rounded-lg p-4 border border-dark-border">
          <div className="text-xs text-gray-400 mb-1">FPS</div>
          <div className="text-2xl font-bold text-white">{fps}</div>
        </div>

        <div className="bg-dark-lighter rounded-lg p-4 border border-dark-border">
          <div className="text-xs text-gray-400 mb-1">Segments</div>
          <div className="text-2xl font-bold text-white">{segmentCount}</div>
        </div>
      </div>

      {/* Duration */}
      <div className="bg-dark-lighter rounded-lg p-4 border border-dark-border text-center">
        <div className="text-xs text-gray-400 mb-1">Total Duration</div>
        <div className="text-xl font-bold text-white">{formatDuration(totalDuration)}</div>
      </div>
    </div>
  );
}
