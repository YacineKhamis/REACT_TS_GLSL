/**
 * InstanceList component - displays list of shape instances for the selected type.
 * Shows instance ID, enabled status, and allows selection for editing.
 */

import type { ShapeInstance, ExpandingCircleInstance, CircleInstance } from '../../types/shapeInstances';
import { ShapeBadge } from './ShapeBadge';

interface InstanceListProps {
  instances: ShapeInstance[];
  selectedInstanceId: string | null;
  onSelectInstance: (id: string) => void;
  onToggleEnabled: (id: string) => void;
  onDeleteInstance: (id: string) => void;
  onAddInstance: () => void;
  maxInstances: number;
  shapeTypeLabel: string;
}

export function InstanceList({
  instances,
  selectedInstanceId,
  onSelectInstance,
  onToggleEnabled,
  onDeleteInstance,
  onAddInstance,
  maxInstances,
  shapeTypeLabel,
}: InstanceListProps) {
  const canAddMore = instances.length < maxInstances;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-white">
          {shapeTypeLabel} ({instances.length}/{maxInstances})
        </h4>
        <button
          onClick={onAddInstance}
          disabled={!canAddMore}
          className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Instance list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {instances.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-4">
            No instances. Click "Add" to create one.
          </p>
        )}

        {instances.map((instance, idx) => (
          <div
            key={instance.id}
            onClick={() => onSelectInstance(instance.id)}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedInstanceId === instance.id
                ? 'bg-primary/20 border-primary'
                : 'bg-dark-lighter border-dark-border hover:border-gray-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">#{idx + 1}</span>
                <input
                  type="checkbox"
                  checked={instance.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    onToggleEnabled(instance.id);
                  }}
                  className="w-4 h-4"
                  title="Enable/disable instance"
                />
                <span className="text-xs text-gray-400">
                  {instance.enabled ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Delete this instance?')) {
                    onDeleteInstance(instance.id);
                  }
                }}
                className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
              >
                Delete
              </button>
            </div>
            {instance.type === 'expandingCircle' && (
              <div className="mt-2">
                <ShapeBadge
                  shape={(instance as ExpandingCircleInstance).shape}
                  pulseMode={(instance as ExpandingCircleInstance).pulseMode}
                />
              </div>
            )}
            {instance.type === 'circle' && (
              <div className="mt-2">
                <ShapeBadge
                  shape={(instance as CircleInstance).shape}
                  pulseMode="loop"
                  size="sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
