import type { ExpandingCircleInstance } from '../../types/shapeInstances';

type ShapeKind = ExpandingCircleInstance['shape'];
type PulseMode = ExpandingCircleInstance['pulseMode'];

interface ShapeBadgeProps {
  shape: ShapeKind;
  pulseMode?: PulseMode;
  size?: 'sm' | 'md';
  label?: string;
}

const SHAPE_LABEL: Record<ShapeKind, string> = {
  circle: 'Circle',
  square: 'Square',
  triangle: 'Triangle',
  heart: 'Heart',
};

function shapeGlyph(shape: ShapeKind, size: 'sm' | 'md') {
  const stroke = size === 'md' ? 2 : 1.5;
  switch (shape) {
    case 'circle':
      return (
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth={stroke} />
      );
    case 'square':
      return (
        <rect
          x="5"
          y="5"
          width="14"
          height="14"
          rx={2}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
        />
      );
    case 'triangle':
      return (
        <path
          d="M12 4 L20 19 H4 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
      );
    case 'heart':
      return (
        <path
          d="M12 19c-4.5-3.5-7.5-6-7.5-9.5 0-2.2 1.8-4 4-4 1.5 0 2.9.8 3.5 2 0.6-1.2 2-2 3.5-2 2.2 0 4 1.8 4 4 0 3.5-3 6-7.5 9.5z"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
        />
      );
    default:
      return null;
  }
}

export function ShapeBadge({
  shape,
  pulseMode,
  size = 'sm',
  label,
}: ShapeBadgeProps) {
  const colorClass = pulseMode === 'single' ? 'text-amber-300' : 'text-emerald-300';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-full bg-dark-border/60 ${colorClass}`}
        style={{
          width: size === 'md' ? 40 : 28,
          height: size === 'md' ? 40 : 28,
        }}
      >
        <svg
          width={size === 'md' ? 28 : 20}
          height={size === 'md' ? 28 : 20}
          viewBox="0 0 24 24"
          aria-hidden
        >
          {shapeGlyph(shape, size)}
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`font-medium text-white ${textSize}`}>
          {label ?? SHAPE_LABEL[shape]}
        </span>
        {pulseMode && (
          <span className="text-xs text-gray-400">
            {pulseMode === 'loop' ? 'Looping pulse' : 'Single pulse'}
          </span>
        )}
      </div>
    </div>
  );
}
