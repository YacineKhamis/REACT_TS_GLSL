import React, { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  tabs: { [key: string]: React.ReactNode };
}

/**
 * Sidebar component providing a toggleable drawer with tabbed content.
 * When open, it slides in from the left and displays a set of tabs
 * passed via props. The caller controls whether the sidebar is open or
 * closed via the `isOpen` prop and toggles it through the `onToggle`
 * callback.
 *
 * Now using Tailwind CSS for consistent styling with TimelineModal.
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, tabs }) => {
  const tabKeys = Object.keys(tabs);
  const [activeTab, setActiveTab] = useState(tabKeys[0]);

  return (
    <>
      {/* Toggle button with proper z-index (below modal z-50) */}
      <button
        onClick={onToggle}
        className={`
          fixed top-5 z-40 px-4 py-2.5 bg-primary text-white rounded-lg
          transition-all duration-300 ease-in-out hover:bg-primary/90
          ${isOpen ? 'left-[270px]' : 'left-5'}
        `}
      >
        {isOpen ? 'Hide UI' : 'Show UI'}
      </button>

      {/* Sidebar panel with z-40 (below modal z-50) */}
      <div
        className={`
          fixed top-0 w-[250px] h-full bg-dark/90 backdrop-blur-sm text-white
          p-5 pb-20 transition-all duration-300 ease-in-out z-40 overflow-y-auto
          ${isOpen ? 'left-0' : '-left-[250px]'}
        `}
      >
        {/* Tab buttons */}
        <div className="flex border-b border-dark-border mb-5">
          {tabKeys.map((tabName) => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              className={`
                flex-1 py-2.5 px-3 transition-all duration-200
                ${
                  activeTab === tabName
                    ? 'bg-primary text-white border-b-2 border-white'
                    : 'bg-transparent text-white border-b-2 border-transparent hover:bg-dark-lighter'
                }
              `}
            >
              {tabName}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div key={activeTab}>{tabs[activeTab]}</div>
      </div>
    </>
  );
};

export default Sidebar;