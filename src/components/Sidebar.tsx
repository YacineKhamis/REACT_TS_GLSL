import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, children }) => {
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
        <h2>Controls</h2>
        {children}
      </div>
    </>
  );
};

export default Sidebar;