import { useState, useCallback, useRef } from 'react';
import type { ExportSettings, ExportProgress, VideoExportResult } from '../types/export';
import { MediaRecorderStrategy } from '../utils/export/MediaRecorderStrategy';
import { DEFAULT_EXPORT_SETTINGS } from '../constants/export';

interface UseVideoExportOptions {
  onComplete?: (result: VideoExportResult) => void;
  onError?: (error: string) => void;
  onProgressUpdate?: (progress: ExportProgress) => void;
}

export function useVideoExport(options?: UseVideoExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({
    state: 'idle',
    currentTime: 0,
    totalDuration: 0,
  });

  const strategyRef = useRef<MediaRecorderStrategy | null>(null);
  const settingsRef = useRef<ExportSettings>(DEFAULT_EXPORT_SETTINGS);

  const getStrategy = useCallback(() => {
    if (!strategyRef.current) {
      strategyRef.current = new MediaRecorderStrategy();
    }
    return strategyRef.current;
  }, []);

  const startExport = useCallback(async (
    canvas: HTMLCanvasElement,
    audioTrack?: MediaStreamTrack,
    totalDuration?: number,
    customSettings?: Partial<ExportSettings>
  ) => {
    try {
      setIsExporting(true);

      settingsRef.current = { ...settingsRef.current, ...customSettings };
      const strategy = getStrategy();

      await strategy.prepare();
      await strategy.startRecording(canvas, audioTrack, totalDuration);

      const currentProgress = strategy.getProgress();
      setProgress(currentProgress);
      options?.onProgressUpdate?.(currentProgress);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      setProgress({ ...progress, state: 'error', errorMessage: message });
      options?.onError?.(message);
      setIsExporting(false);
    }
  }, [getStrategy, options, progress]);

  const finishExport = useCallback(async () => {
    const strategy = getStrategy();

    try {
      setProgress({ ...progress, state: 'processing' });
      const result = await strategy.stopRecording();

      setProgress(strategy.getProgress());
      setIsExporting(false);

      options?.onComplete?.(result);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Export failed';
      setProgress({ ...progress, state: 'error', errorMessage: message });
      options?.onError?.(message);
      setIsExporting(false);
      throw error;
    }
  }, [getStrategy, options, progress]);

  const cancelExport = useCallback(() => {
    const strategy = strategyRef.current;
    if (strategy) {
      strategy.cancelRecording();
      setProgress(strategy.getProgress());
    }
    setIsExporting(false);
  }, []);

  const updateSettings = useCallback((settings: Partial<ExportSettings>) => {
    settingsRef.current = { ...settingsRef.current, ...settings };
  }, []);

  const updateProgress = useCallback((currentTime: number) => {
    if (isExporting) {
      setProgress(prev => ({
        ...prev,
        currentTime,
      }));
    }
  }, [isExporting]);

  return {
    isExporting,
    progress,
    settings: settingsRef.current,
    startExport,
    finishExport,
    cancelExport,
    updateSettings,
    updateProgress,
  };
}
