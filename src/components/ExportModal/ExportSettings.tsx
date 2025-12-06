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
