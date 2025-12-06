export type ExportBackend = 'mediarecorder' | 'ffmpeg-wasm' | 'server';
export type ExportFormat = 'webm' | 'mp4';
export type ExportResolution = '480p' | '720p' | '1080p' | '4k';
export type ExportState = 'idle' | 'preparing' | 'recording' | 'processing' | 'complete' | 'error';

export interface ExportSettings {
  backend: ExportBackend;
  format: ExportFormat;
  resolution: ExportResolution;
  fps: number;
  videoBitrate: number; // kbps
  audioBitrate: number; // kbps
}

export interface ExportProgress {
  state: ExportState;
  currentTime: number;
  totalDuration: number;
  estimatedTimeRemaining?: number;
  errorMessage?: string;
}

export interface VideoExportResult {
  blob: Blob;
  filename: string;
  duration: number;
  size: number;
  format: ExportFormat;
}

export interface ExportStrategy {
  prepare(settings: ExportSettings): Promise<void>;
  startRecording(canvas: HTMLCanvasElement, audioTrack?: MediaStreamTrack, duration?: number): Promise<void>;
  stopRecording(): Promise<VideoExportResult>;
  cancelRecording(): void;
  getProgress(): ExportProgress;
  cleanup(): void;
}
