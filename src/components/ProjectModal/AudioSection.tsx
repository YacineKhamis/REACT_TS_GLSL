/**
 * Audio track section for the Project Settings modal.
 * Handles audio file upload, display, and lock-to-duration controls.
 */

import { useRef } from 'react';
import type { AudioTrackInfo } from '../../types/config';

interface AudioSectionProps {
  audioTrack?: AudioTrackInfo;
  isAudioLoading: boolean;
  audioError?: string | null;
  onAudioTrackSelect: (file: File) => void;
  onAudioTrackRemove: () => void;
  totalDuration: number;
  isAudioLockEnabled: boolean;
  onAudioLockChange: (value: boolean) => void;
}

export function AudioSection({
  audioTrack,
  isAudioLoading,
  audioError,
  onAudioTrackSelect,
  onAudioTrackRemove,
  totalDuration,
  isAudioLockEnabled,
  onAudioLockChange,
}: AudioSectionProps) {
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleAudioBrowse = () => {
    audioInputRef.current?.click();
  };

  const handleAudioFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAudioTrackSelect(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleAudioDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      onAudioTrackSelect(file);
    }
  };

  const handleAudioDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const formatDuration = (seconds: number) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const totalSeconds = Math.max(0, Math.round(seconds));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const base = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    return hours > 0 ? `${hours}:${base}` : base;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return undefined;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const describeAudioTrack = (track: AudioTrackInfo) => {
    const detailParts = [
      formatDuration(track.duration),
      track.mimeType || undefined,
      formatSize(track.size),
    ].filter((value): value is string => Boolean(value));
    return detailParts.join(' • ');
  };

  const remainingTime =
    audioTrack && Number.isFinite(audioTrack.duration)
      ? audioTrack.duration - totalDuration
      : undefined;

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-white">Project Audio</h3>
      <p className="text-sm text-gray-400">
        Charge un fichier audio pour préparer la synchronisation de la timeline.
      </p>

      <div
        className={`p-4 border-2 rounded-xl transition-colors ${
          audioTrack ? 'border-primary/70 bg-dark-lighter/40' : 'border-dashed border-dark-border bg-dark-lighter/30 cursor-pointer'
        } ${isAudioLoading ? 'opacity-60 pointer-events-none' : !audioTrack ? 'hover:border-primary/70' : ''}`}
        onClick={!audioTrack && !isAudioLoading ? handleAudioBrowse : undefined}
        onDrop={handleAudioDrop}
        onDragOver={handleAudioDragOver}
      >
        {isAudioLoading && (
          <p className="text-sm text-gray-300">Chargement du fichier audio...</p>
        )}

        {!isAudioLoading && audioTrack && (
          <div className="space-y-1">
            <p className="text-white font-medium">{audioTrack.name}</p>
            <p className="text-sm text-gray-400">
              {describeAudioTrack(audioTrack)}
            </p>
            {audioTrack.status === 'missing' && (
              <p className="text-sm text-amber-400">
                Le fichier original est introuvable. Réimportez-le pour l'écouter.
              </p>
            )}
          </div>
        )}

        {!isAudioLoading && !audioTrack && (
          <p className="text-sm text-gray-400">
            Glissez un fichier audio ici ou cliquez pour en sélectionner un.
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAudioBrowse}
          disabled={isAudioLoading}
          className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:bg-primary/40 transition-colors"
        >
          Choisir un fichier audio
        </button>
        {audioTrack && (
          <button
            type="button"
            onClick={onAudioTrackRemove}
            className="px-4 py-2 rounded-lg border border-dark-border text-white hover:bg-dark-border transition-colors"
          >
            Retirer la piste
          </button>
        )}
      </div>

      {audioError && (
        <p className="text-sm text-red-400">
          {audioError}
        </p>
      )}

      {audioTrack && (
        <div className="space-y-1 text-sm text-gray-300">
          <div className="flex items-center justify-between">
            <span>Durée audio</span>
            <span>{formatDuration(audioTrack.duration)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Durée des segments</span>
            <span>{totalDuration.toFixed(2)}s</span>
          </div>
          {remainingTime !== undefined && (
            <p
              className={`text-xs ${
                remainingTime >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {remainingTime >= 0
                ? `Temps restant: ${remainingTime.toFixed(2)}s`
                : `Dépassement: ${Math.abs(remainingTime).toFixed(2)}s`}
            </p>
          )}
        </div>
      )}

      <label
        className={`flex items-center gap-2 text-sm ${
          audioTrack ? 'text-gray-300' : 'text-gray-600'
        }`}
      >
        <input
          type="checkbox"
          className="w-4 h-4"
          checked={!!audioTrack && isAudioLockEnabled}
          onChange={(e) => onAudioLockChange(e.target.checked)}
          disabled={!audioTrack}
        />
        Verrouiller la durée sur la piste audio
      </label>

      {!audioTrack && (
        <p className="text-xs text-gray-500">
          Charge une piste pour activer le verrou de durée.
        </p>
      )}

      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={handleAudioFileChange}
      />
    </div>
  );
}
