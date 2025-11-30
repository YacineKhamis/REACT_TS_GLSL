import React, { useRef } from 'react';
import type { UniformSet } from '../types/config';
import UniformControls from './UniformControls';

interface ProjectControlsProps {
  /** Create a new project. */
  onNew: () => void;
  /** Trigger saving the project configuration. */
  onSave: () => void;
  /** Callback invoked with parsed JSON when a file is loaded. */
  onLoad: (data: unknown) => void;
  /** Current global uniforms used by the project. */
  uniforms: UniformSet;
  /** Update handler for the global uniforms. */
  onUniformsChange: (next: UniformSet) => void;
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginBottom: '10px',
  textAlign: 'center',
};

/**
 * Controls for the project tab. Provides editors for the global
 * uniforms and buttons to create, save and load project files. File
 * input is hidden and triggered via a button click.
 */
const ProjectControls: React.FC<ProjectControlsProps> = ({
  onNew,
  onSave,
  onLoad,
  uniforms,
  onUniformsChange,
}) => {
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
          console.error('Erreur lors du chargement du fichier JSON:', error);
          alert('Fichier JSON invalide.');
        }
      };
      reader.readAsText(file);
    }
    // Reset file input to allow loading the same file again
    if (event.target) {
      event.target.value = '';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Global uniforms section */}
      <div>
        <h4 style={{ marginTop: 0 }}>Uniforms (Projet)</h4>
        <UniformControls uniforms={uniforms} onChange={onUniformsChange} />
      </div>
      {/* File operations */}
      <div>
        <button style={buttonStyle} onClick={onNew}>Nouveau</button>
        <button style={buttonStyle} onClick={onSave}>Sauvegarder (JSON)</button>
        <button style={buttonStyle} onClick={handleLoadClick}>Charger (JSON)</button>
        <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".json" />
      </div>
    </div>
  );
};

export default ProjectControls;