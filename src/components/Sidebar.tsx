import React, { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  tabs: { [key: string]: React.ReactNode };
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, tabs }) => {
  const tabKeys = Object.keys(tabs);
  const [activeTab, setActiveTab] = useState(tabKeys[0]);

  return (
    <>
      <button
        onClick={onToggle}
        style={{
          position: 'fixed',
          top: '20px',
          left: isOpen ? '270px' : '20px', // Adjust based on sidebar width
          zIndex: 1001,
          padding: '10px 15px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          transition: 'left 0.3s ease-in-out',
        }}
      >
        {isOpen ? 'Hide UI' : 'Show UI'}
      </button>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: isOpen ? 0 : '-250px', // Sidebar width
          width: '250px',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          boxSizing: 'border-box',
          transition: 'left 0.3s ease-in-out',
          zIndex: 1000,
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', borderBottom: '1px solid #444', marginBottom: '20px' }}>
          {tabKeys.map(tabName => (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: activeTab === tabName ? '#007bff' : 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                borderBottom: activeTab === tabName ? '2px solid white' : '2px solid transparent',
                transition: 'background-color 0.2s, border-bottom 0.2s',
              }}
            >
              {tabName}
            </button>
          ))}
        </div>
        
        {/* Affiche le contenu de l'onglet actif */}
        <div key={activeTab}>
          {tabs[activeTab]}
        </div>
      </div>
    </>
  );
};

export default Sidebar;