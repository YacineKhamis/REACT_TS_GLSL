/**
 * Hook for managing Timeline UI state (modal, selected segment, etc.)
 * Separated from project data state for cleaner architecture.
 */

import { useState, useCallback } from 'react';

export interface TimelineUIState {
  isTimelineOpen: boolean;
  selectedSegmentIndex: number;
  selectedShapeType: 'circle' | 'wave' | 'epicycloid' | 'expandingCircle';
  expandedInstanceIds: Set<string>;
}

export interface TimelineUIActions {
  openTimeline: () => void;
  closeTimeline: () => void;
  setSelectedSegment: (index: number) => void;
  setSelectedShapeType: (type: TimelineUIState['selectedShapeType']) => void;
  toggleInstanceExpanded: (instanceId: string) => void;
  collapseAllInstances: () => void;
}

export function useTimelineUI() {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState(0);
  const [selectedShapeType, setSelectedShapeType] = useState<
    TimelineUIState['selectedShapeType']
  >('circle');
  const [expandedInstanceIds, setExpandedInstanceIds] = useState<Set<string>>(
    new Set()
  );

  const openTimeline = useCallback(() => {
    setIsTimelineOpen(true);
  }, []);

  const closeTimeline = useCallback(() => {
    setIsTimelineOpen(false);
  }, []);

  const setSelectedSegment = useCallback((index: number) => {
    setSelectedSegmentIndex(index);
    // Reset expanded instances when switching segments
    setExpandedInstanceIds(new Set());
  }, []);

  const toggleInstanceExpanded = useCallback((instanceId: string) => {
    setExpandedInstanceIds((prev) => {
      const next = new Set(prev);
      if (next.has(instanceId)) {
        next.delete(instanceId);
      } else {
        next.add(instanceId);
      }
      return next;
    });
  }, []);

  const collapseAllInstances = useCallback(() => {
    setExpandedInstanceIds(new Set());
  }, []);

  return {
    // State
    isTimelineOpen,
    selectedSegmentIndex,
    selectedShapeType,
    expandedInstanceIds,
    // Actions
    openTimeline,
    closeTimeline,
    setSelectedSegment,
    setSelectedShapeType,
    toggleInstanceExpanded,
    collapseAllInstances,
  };
}
