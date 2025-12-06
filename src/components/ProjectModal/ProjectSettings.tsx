/**
 * Project settings component.
 * Allows editing project metadata (name, author, resolution) and file operations.
 * Global uniforms are collapsible to keep the interface clean.
 */

import { useState, useRef } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import type { UniformSet, ShapeLimits, AudioTrackInfo } from '../../types/config';
import { ReadOnlyField } from '../FormFields/ReadOnlyField';
import { SliderField } from '../FormFields/SliderField';
import { getSliderConfig } from '../../constants/sliderDefaults';
import UniformControls from '../UniformControls';

interface ProjectSettingsProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  fps: number;
  maxShapeLimits: ShapeLimits;
  onMaxShapeLimitsChange: (limits: ShapeLimits) => void;
  uniforms: UniformSet;
  onUniformsChange: (uniforms: UniformSet) => void;
  audioTrack?: AudioTrackInfo;
  isAudioLoading: boolean;
  audioError?: string | null;
  onAudioTrackSelect: (file: File) => void;
  onAudioTrackRemove: () => void;
  totalDuration: number;
  isAudioLockEnabled: boolean;
  onAudioLockChange: (value: boolean) => void;
  onNew: () => void;
  onSave: () => void;
  onLoad: (data: unknown) => void;
}

export function ProjectSettings({
  projectName,
  onProjectNameChange,
  fps,
  maxShapeLimits,
  onMaxShapeLimitsChange,
  uniforms,
  onUniformsChange,
  audioTrack,
  isAudioLoading,
  audioError,
  onAudioTrackSelect,
  onAudioTrackRemove,
  totalDuration,
  isAudioLockEnabled,
  onAudioLockChange,
  onNew,
  onSave,
  onLoad,
}: ProjectSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [author, setAuthor] = useState('');
  const [resolution, setResolution] = useState<string>('1080p');
  const [isUniformsOpen, setIsUniformsOpen] = useState(false);

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          onLoad(json);
        } catch (error) {
          console.error('Error loading JSON file:', error);
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

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
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {/* Project Metadata Section */}
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

          {/* Author Name */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-white mb-2">
              Author
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          {/* Resolution Selector */}
          <div>
            <label htmlFor="resolution" className="block text-sm font-medium text-white mb-2">
              Resolution (not yet implemented)
            </label>
            <select
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="240p">240p (426×240)</option>
              <option value="360p">360p (640×360)</option>
              <option value="480p">480p (854×480)</option>
              <option value="720p">720p (1280×720)</option>
              <option value="1080p">1080p (1920×1080)</option>
              <option value="4K">4K (3840×2160)</option>
            </select>
          </div>

          {/* FPS - Read Only */}
          <ReadOnlyField
            label="Frames Per Second"
            value={fps}
            unit="fps"
          />
        </div>

        {/* Audio Track Section */}
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
                    Le fichier original est introuvable. Réimportez-le pour l’écouter.
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

        {/* Maximum Shape Limits Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Maximum Shape Limits</h3>
          <p className="text-sm text-gray-400">
            Define the maximum number of instances allowed per shape type. Each segment can use up to these limits.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Circles */}
            <div>
              <label htmlFor="maxCircles" className="block text-sm font-medium text-white mb-2">
                Fixed Circles
              </label>
              <input
                id="maxCircles"
                type="number"
                min="0"
                max="8"
                value={maxShapeLimits.circles}
                onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, circles: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Expanding Circles */}
            <div>
              <label htmlFor="maxExpandingCircles" className="block text-sm font-medium text-white mb-2">
                Expanding Circles
              </label>
              <input
                id="maxExpandingCircles"
                type="number"
                min="0"
                max="8"
                value={maxShapeLimits.expandingCircles}
                onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, expandingCircles: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Waves */}
            <div>
              <label htmlFor="maxWaves" className="block text-sm font-medium text-white mb-2">
                Waves
              </label>
              <input
                id="maxWaves"
                type="number"
                min="0"
                max="8"
                value={maxShapeLimits.waves}
                onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, waves: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Epicycloids */}
            <div>
              <label htmlFor="maxEpicycloids" className="block text-sm font-medium text-white mb-2">
                Epicycloids
              </label>
              <input
                id="maxEpicycloids"
                type="number"
                min="0"
                max="8"
                value={maxShapeLimits.epicycloids}
                onChange={(e) => onMaxShapeLimitsChange({ ...maxShapeLimits, epicycloids: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-dark-lighter border border-dark-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Rendering Performance Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Rendering Performance</h3>
          <p className="text-sm text-gray-400">
            Control GPU performance by adjusting the epicycloid sample factor. Lower values reduce workload at the cost of visual fidelity.
          </p>

          {getSliderConfig('project', 'epicycloidsSampleFactor') && (
            <SliderField
              label="Epicycloid Sample Factor"
              value={uniforms.epicycloidsSampleFactor ?? 1}
              onChange={(value) => onUniformsChange({ ...uniforms, epicycloidsSampleFactor: value })}
              config={getSliderConfig('project', 'epicycloidsSampleFactor')!}
            />
          )}
        </div>

        {/* Global Uniforms - Collapsible */}
        <Collapsible.Root open={isUniformsOpen} onOpenChange={setIsUniformsOpen}>
          <Collapsible.Trigger className="flex items-center justify-between w-full p-3 bg-dark-lighter rounded-lg border border-dark-border hover:bg-dark-border transition-colors">
            <span className="text-sm font-medium text-white">Global Uniforms (Advanced)</span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isUniformsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </Collapsible.Trigger>

          <Collapsible.Content className="mt-4">
            <div className="p-4 bg-dark-lighter/50 rounded-lg border border-dark-border">
              <UniformControls uniforms={uniforms} onChange={onUniformsChange} />
            </div>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* File Actions Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">File Operations</h3>

          <p className="text-sm text-gray-400">
            Manage your project configuration. Save your work to JSON or load existing projects.
          </p>

          <div className="space-y-3">
            <button
              onClick={onNew}
              className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white font-medium hover:bg-dark-border transition-colors"
            >
              New Project
            </button>

            <button
              onClick={onSave}
              className="w-full px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Save Project (JSON)
            </button>

            <button
              onClick={handleLoadClick}
              className="w-full px-4 py-3 bg-dark-lighter border border-dark-border rounded-lg text-white font-medium hover:bg-dark-border transition-colors"
            >
              Load Project (JSON)
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept=".json"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
