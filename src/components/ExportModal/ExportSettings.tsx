import { useState } from 'react';
import type { ExportSettings, ExportResolution, ExportProgress as IExportProgress } from '../../types/export';
import { DEFAULT_EXPORT_SETTINGS, BITRATE_RECOMMENDATIONS } from '../../constants/export';
import { ExportProgress } from './ExportProgress';

interface ExportSettingsProps {
  onStartExport: (settings: ExportSettings) => void;
  progress: IExportProgress;
  isExporting: boolean;
}

export function ExportSettings({ onStartExport, progress, isExporting }: ExportSettingsProps) {
  const [resolution, setResolution] = useState<ExportResolution>('1080p');

  if (isExporting) {
    return <ExportProgress progress={progress} />;
  }

  const handleStart = () => {
    const settings: ExportSettings = {
      ...DEFAULT_EXPORT_SETTINGS,
      resolution,
      videoBitrate: BITRATE_RECOMMENDATIONS[resolution],
    };
    onStartExport(settings);
  };

  return (
    <div className="space-y-6">
      {/* Resolution Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Résolution
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['480p', '720p', '1080p'] as ExportResolution[]).map((res) => (
            <button
              key={res}
              onClick={() => setResolution(res)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                resolution === res
                  ? 'bg-primary text-white'
                  : 'bg-dark-lighter text-gray-400 hover:bg-dark-border'
              }`}
            >
              {res}
            </button>
          ))}
        </div>
      </div>

      {/* Bitrate Info */}
      <div className="p-4 bg-dark-lighter rounded-lg">
        <div className="text-sm text-gray-400">Bitrate estimé:</div>
        <div className="text-lg font-semibold text-white">
          {BITRATE_RECOMMENDATIONS[resolution] / 1000} Mbps
        </div>
      </div>

      {/* Info WebM */}
      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <div className="flex gap-2 items-start">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-300">
            <strong>Format WebM :</strong> La navigation dans la vidéo peut être limitée dans VLC.
            Pour une meilleure lecture, utilisez Chrome, Firefox ou convertissez en MP4 avec VLC (Média → Convertir/Enregistrer).
          </div>
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
      >
        Démarrer l'export
      </button>
    </div>
  );
}
