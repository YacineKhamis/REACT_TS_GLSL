import type { ExportResolution, ExportSettings } from '../types/export';

export const RESOLUTION_PRESETS: Record<ExportResolution, { width: number; height: number }> = {
  '480p': { width: 854, height: 480 },
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

export const BITRATE_RECOMMENDATIONS: Record<ExportResolution, number> = {
  '480p': 2500,   // 2.5 Mbps
  '720p': 5000,   // 5 Mbps
  '1080p': 8000,  // 8 Mbps
  '4k': 35000,    // 35 Mbps
};

export const DEFAULT_EXPORT_SETTINGS: ExportSettings = {
  backend: 'mediarecorder',
  format: 'webm',
  resolution: '1080p',
  fps: 60,
  videoBitrate: 8000,
  audioBitrate: 192,
};
