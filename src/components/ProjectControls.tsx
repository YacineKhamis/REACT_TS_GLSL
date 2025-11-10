import React, { useRef } from 'react';

interface ProjectControlsProps {
  onNew: () => void;
  onSave: () => void;
  onLoad: (data: any) => void;
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

const ProjectControls: React.FC<ProjectControlsProps> = ({ onNew, onSave, onLoad }) => {
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
          console.error("Erreur lors du chargement du fichier JSON:", error);
          alert("Fichier JSON invalide.");
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
    <div>
      <button style={buttonStyle} onClick={onNew}>Nouveau</button>
      <button style={buttonStyle} onClick={onSave}>Sauvegarder (JSON)</button>
      <button style={buttonStyle} onClick={handleLoadClick}>Charger (JSON)</button>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".json" />
    </div>
  );
};

export default ProjectControls;