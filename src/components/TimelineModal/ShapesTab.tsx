/**
 * ShapesTab component - manages shape instances for a segment.
 * Layout: [Type Selector] [Instance List | Instance Form]
 */

import { useState } from 'react';
import type { ShapeInstanceCollection, ShapeInstance, CircleInstance, WaveInstance, EpicycloidInstance, ExpandingCircleInstance } from '../../types/shapeInstances';
import type { ShapeLimits } from '../../types/config';
import { generateInstanceId } from '../../types/shapeInstances';
import { getCircleDefaults, getWaveDefaults, getEpicycloidDefaults, getExpandingCircleDefaults } from '../../constants/shapeDefaults';
import { InstanceList } from './InstanceList';
import { InstanceForm } from './InstanceForm';

type ShapeType = 'circle' | 'wave' | 'epicycloid' | 'expandingCircle';

interface ShapesTabProps {
  shapeInstances: ShapeInstanceCollection;
  onShapeInstancesChange: (instances: ShapeInstanceCollection) => void;
  maxShapeLimits: ShapeLimits;
  shapeCounts: {
    circles: number;
    expandingCircles: number;
    waves: number;
    epicycloids: number;
  };
}

export function ShapesTab({
  shapeInstances,
  onShapeInstancesChange,
  maxShapeLimits: _maxShapeLimits,
  shapeCounts,
}: ShapesTabProps) {
  const [selectedType, setSelectedType] = useState<ShapeType>('circle');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  // Get current instances array for selected type
  const getCurrentInstances = (): ShapeInstance[] => {
    switch (selectedType) {
      case 'circle':
        return shapeInstances.circles;
      case 'wave':
        return shapeInstances.waves;
      case 'epicycloid':
        return shapeInstances.epicycloids;
      case 'expandingCircle':
        return shapeInstances.expandingCircles;
    }
  };

  // Get max limit for selected type (from shapeCounts slider)
  const getMaxLimit = (): number => {
    switch (selectedType) {
      case 'circle':
        return shapeCounts.circles;
      case 'wave':
        return shapeCounts.waves;
      case 'epicycloid':
        return shapeCounts.epicycloids;
      case 'expandingCircle':
        return shapeCounts.expandingCircles;
    }
  };

  // Get label for selected type
  const getTypeLabel = (): string => {
    switch (selectedType) {
      case 'circle':
        return 'Fixed Shapes';
      case 'wave':
        return 'Waves';
      case 'epicycloid':
        return 'Epicycloids';
      case 'expandingCircle':
        return 'Expanding Shapes';
    }
  };

  // Add new instance
  const handleAddInstance = () => {
    const instances = getCurrentInstances();
    if (instances.length >= getMaxLimit()) return;

    const id = generateInstanceId();
    const index = instances.length;

    let newInstance: ShapeInstance;
    switch (selectedType) {
      case 'circle':
        newInstance = {
          id,
          type: 'circle',
          enabled: true,
          ...getCircleDefaults(index),
        } as CircleInstance;
        onShapeInstancesChange({
          ...shapeInstances,
          circles: [...shapeInstances.circles, newInstance as CircleInstance],
        });
        break;
      case 'wave':
        newInstance = {
          id,
          type: 'wave',
          enabled: true,
          ...getWaveDefaults(index),
        } as WaveInstance;
        onShapeInstancesChange({
          ...shapeInstances,
          waves: [...shapeInstances.waves, newInstance as WaveInstance],
        });
        break;
      case 'epicycloid':
        newInstance = {
          id,
          type: 'epicycloid',
          enabled: true,
          ...getEpicycloidDefaults(index),
        } as EpicycloidInstance;
        onShapeInstancesChange({
          ...shapeInstances,
          epicycloids: [...shapeInstances.epicycloids, newInstance as EpicycloidInstance],
        });
        break;
      case 'expandingCircle':
        newInstance = {
          id,
          type: 'expandingCircle',
          enabled: true,
          ...getExpandingCircleDefaults(),
        } as ExpandingCircleInstance;
        onShapeInstancesChange({
          ...shapeInstances,
          expandingCircles: [...shapeInstances.expandingCircles, newInstance as ExpandingCircleInstance],
        });
        break;
    }

    setSelectedInstanceId(id);
  };

  // Toggle instance enabled
  const handleToggleEnabled = (id: string) => {
    switch (selectedType) {
      case 'circle':
        onShapeInstancesChange({
          ...shapeInstances,
          circles: shapeInstances.circles.map(inst =>
            inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
          ),
        });
        break;
      case 'wave':
        onShapeInstancesChange({
          ...shapeInstances,
          waves: shapeInstances.waves.map(inst =>
            inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
          ),
        });
        break;
      case 'epicycloid':
        onShapeInstancesChange({
          ...shapeInstances,
          epicycloids: shapeInstances.epicycloids.map(inst =>
            inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
          ),
        });
        break;
      case 'expandingCircle':
        onShapeInstancesChange({
          ...shapeInstances,
          expandingCircles: shapeInstances.expandingCircles.map(inst =>
            inst.id === id ? { ...inst, enabled: !inst.enabled } : inst
          ),
        });
        break;
    }
  };

  // Delete instance
  const handleDeleteInstance = (id: string) => {
    switch (selectedType) {
      case 'circle':
        onShapeInstancesChange({
          ...shapeInstances,
          circles: shapeInstances.circles.filter(inst => inst.id !== id),
        });
        break;
      case 'wave':
        onShapeInstancesChange({
          ...shapeInstances,
          waves: shapeInstances.waves.filter(inst => inst.id !== id),
        });
        break;
      case 'epicycloid':
        onShapeInstancesChange({
          ...shapeInstances,
          epicycloids: shapeInstances.epicycloids.filter(inst => inst.id !== id),
        });
        break;
      case 'expandingCircle':
        onShapeInstancesChange({
          ...shapeInstances,
          expandingCircles: shapeInstances.expandingCircles.filter(inst => inst.id !== id),
        });
        break;
    }
    if (selectedInstanceId === id) {
      setSelectedInstanceId(null);
    }
  };

  // Update instance
  const handleUpdateInstance = (updatedInstance: ShapeInstance) => {
    switch (selectedType) {
      case 'circle':
        onShapeInstancesChange({
          ...shapeInstances,
          circles: shapeInstances.circles.map(inst =>
            inst.id === updatedInstance.id ? (updatedInstance as CircleInstance) : inst
          ),
        });
        break;
      case 'wave':
        onShapeInstancesChange({
          ...shapeInstances,
          waves: shapeInstances.waves.map(inst =>
            inst.id === updatedInstance.id ? (updatedInstance as WaveInstance) : inst
          ),
        });
        break;
      case 'epicycloid':
        onShapeInstancesChange({
          ...shapeInstances,
          epicycloids: shapeInstances.epicycloids.map(inst =>
            inst.id === updatedInstance.id ? (updatedInstance as EpicycloidInstance) : inst
          ),
        });
        break;
      case 'expandingCircle':
        onShapeInstancesChange({
          ...shapeInstances,
          expandingCircles: shapeInstances.expandingCircles.map(inst =>
            inst.id === updatedInstance.id ? (updatedInstance as ExpandingCircleInstance) : inst
          ),
        });
        break;
    }
  };

  const currentInstances = getCurrentInstances();
  const selectedInstance = selectedInstanceId
    ? currentInstances.find(inst => inst.id === selectedInstanceId)
    : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Shape Type Selector */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">Shape Type</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setSelectedType('circle');
              setSelectedInstanceId(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'circle'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-400 hover:bg-dark-border'
            }`}
          >
            Fixed Shapes
          </button>
          <button
            onClick={() => {
              setSelectedType('expandingCircle');
              setSelectedInstanceId(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'expandingCircle'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-400 hover:bg-dark-border'
            }`}
          >
            Expanding Shapes
          </button>
          <button
            onClick={() => {
              setSelectedType('wave');
              setSelectedInstanceId(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'wave'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-400 hover:bg-dark-border'
            }`}
          >
            Waves
          </button>
          <button
            onClick={() => {
              setSelectedType('epicycloid');
              setSelectedInstanceId(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'epicycloid'
                ? 'bg-primary text-white'
                : 'bg-dark-lighter text-gray-400 hover:bg-dark-border'
            }`}
          >
            Epicycloids
          </button>
        </div>
      </div>

      {/* Two-column layout: Instance List | Instance Form */}
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
        {/* Left: Instance List */}
        <div className="overflow-hidden border border-dark-border rounded-lg p-4 bg-dark-lighter/30">
          <InstanceList
            instances={currentInstances}
            selectedInstanceId={selectedInstanceId}
            onSelectInstance={setSelectedInstanceId}
            onToggleEnabled={handleToggleEnabled}
            onDeleteInstance={handleDeleteInstance}
            onAddInstance={handleAddInstance}
            maxInstances={getMaxLimit()}
            shapeTypeLabel={getTypeLabel()}
          />
        </div>

        {/* Right: Instance Form */}
        <div className="overflow-y-auto border border-dark-border rounded-lg p-4 bg-dark-lighter/30">
          {selectedInstance ? (
            <InstanceForm instance={selectedInstance} onUpdate={handleUpdateInstance} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-gray-500 italic">Select an instance to edit its parameters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
