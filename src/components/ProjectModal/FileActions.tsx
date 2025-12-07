/**
 * File operations section for the Project Settings modal.
 * Handles New/Save/Load project actions.
 */

import { useRef } from 'react';

interface FileActionsProps {
  onNew: () => void;
  onSave: () => void;
  onLoad: (data: unknown) => void;
}

export function FileActions({
  onNew,
  onSave,
  onLoad,
}: FileActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  );
}
