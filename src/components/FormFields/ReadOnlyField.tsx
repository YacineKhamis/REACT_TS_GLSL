/**
 * ReadOnlyField - Display informational values that cannot be edited
 * Used for: Duration, Start Time, End Time, FPS, Current Time, etc.
 */

import type { ReactNode } from 'react';

interface ReadOnlyFieldProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  variant?: 'default' | 'secondary';
}

export function ReadOnlyField({
  label,
  value,
  unit,
  icon,
  variant = 'default',
}: ReadOnlyFieldProps) {
  const bgClass = variant === 'secondary' ? 'bg-gray-900' : 'bg-gray-950';
  const borderClass = variant === 'secondary' ? 'border-gray-600' : 'border-gray-700';

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 px-3 py-2.5 ${bgClass} border ${borderClass} rounded text-sm font-mono text-gray-300 cursor-default select-none transition-colors hover:border-gray-600`}
      >
        {icon && <span className="text-gray-500 flex-shrink-0">{icon}</span>}
        <span className="flex-1 truncate">{value}</span>
        {unit && <span className="text-gray-500 text-xs flex-shrink-0">{unit}</span>}
      </div>
    </div>
  );
}
