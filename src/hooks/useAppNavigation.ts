/**
 * Hook for managing application navigation between Dashboard, Project Modal, and Timeline Modal.
 * Centralizes navigation state and provides clean methods for switching between views.
 */

import { useState, useCallback } from 'react';

export type AppView = 'home' | 'project' | 'timeline';

export interface UseAppNavigationReturn {
  currentView: AppView;
  isHome: boolean;
  isProjectOpen: boolean;
  isTimelineOpen: boolean;
  openProject: () => void;
  openTimeline: () => void;
  goHome: () => void;
}

/**
 * Manages navigation state for the three-level navigation system:
 * - Home: Dashboard with project summary
 * - Project: Modal for editing project settings and uniforms
 * - Timeline: Modal for editing segments and shape instances
 */
export function useAppNavigation(): UseAppNavigationReturn {
  const [currentView, setCurrentView] = useState<AppView>('home');

  const openProject = useCallback(() => {
    setCurrentView('project');
  }, []);

  const openTimeline = useCallback(() => {
    setCurrentView('timeline');
  }, []);

  const goHome = useCallback(() => {
    setCurrentView('home');
  }, []);

  return {
    currentView,
    isHome: currentView === 'home',
    isProjectOpen: currentView === 'project',
    isTimelineOpen: currentView === 'timeline',
    openProject,
    openTimeline,
    goHome,
  };
}
