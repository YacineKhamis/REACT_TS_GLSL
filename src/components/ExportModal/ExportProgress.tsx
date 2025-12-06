import type { ExportProgress as IExportProgress } from '../../types/export';

interface ExportProgressProps {
  progress: IExportProgress;
}

export function ExportProgress({ progress }: ExportProgressProps) {
  const percentage = progress.totalDuration > 0
    ? (progress.currentTime / progress.totalDuration) * 100
    : 0;

  const getStateLabel = () => {
    switch (progress.state) {
      case 'preparing': return 'Préparation...';
      case 'recording': return 'Enregistrement...';
      case 'processing': return 'Traitement...';
      case 'complete': return 'Terminé !';
      case 'error': return 'Erreur';
      default: return 'En attente';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-white mb-2">
          {getStateLabel()}
        </div>
        <div className="text-sm text-gray-400">
          {progress.currentTime.toFixed(1)}s / {progress.totalDuration.toFixed(1)}s
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-dark-lighter rounded-full overflow-hidden relative">
        <div
          key={`progress-${percentage.toFixed(2)}`}
          className="h-full bg-primary absolute top-0 left-0"
          style={{
            width: `${Math.min(percentage, 100)}%`,
          }}
        />
      </div>

      {/* Percentage display */}
      <div className="text-center text-sm text-gray-500">
        {percentage.toFixed(1)}%
      </div>

      {/* Recording Indicator */}
      {progress.state === 'recording' && (
        <div className="flex items-center justify-center gap-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold">REC</span>
        </div>
      )}

      {/* Error Message */}
      {progress.state === 'error' && progress.errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
          <div className="text-red-400 text-sm">
            {progress.errorMessage}
          </div>
        </div>
      )}
    </div>
  );
}
