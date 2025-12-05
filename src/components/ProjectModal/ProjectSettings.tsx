/**
 * Project settings component.
 * Allows editing project metadata (name, author, resolution) and file operations.
 * Global uniforms are collapsible to keep the interface clean.
 */

import { useState, useRef } from 'react';
import * as Collapsible from '@radix-ui/react-collapsible';
import type { UniformSet, ShapeLimits } from '../../types/config';
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
  onNew,
  onSave,
  onLoad,
}: ProjectSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
