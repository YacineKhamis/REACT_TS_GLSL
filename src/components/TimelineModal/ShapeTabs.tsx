/**
 * Shape tabs placeholder for Timeline modal.
 * Will be implemented in Phase 3 with instance management.
 */

export function ShapeTabs() {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Shape Instances</h2>
        <p className="text-xs text-gray-400">
          Shape management will be implemented in Phase 3
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-dark-lighter rounded-lg border border-dark-border">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🎨</div>
          <div className="text-sm">Shape instance editor</div>
          <div className="text-xs mt-1">Coming in Phase 3</div>
        </div>
      </div>
    </div>
  );
}
