import type { ExportStrategy, ExportProgress, VideoExportResult } from '../../types/export';

export class MediaRecorderStrategy implements ExportStrategy {
  private recorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private progress: ExportProgress;

  constructor() {
    this.progress = {
      state: 'idle',
      currentTime: 0,
      totalDuration: 0,
    };
  }

  async prepare(): Promise<void> {
    this.progress.state = 'preparing';

    // Vérifier support navigateur
    if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        throw new Error('Navigateur ne supporte pas l\'enregistrement WebM');
      }
    }

    this.progress.state = 'idle';
  }

  async startRecording(
    canvas: HTMLCanvasElement,
    audioTrack?: MediaStreamTrack,
    duration?: number
  ): Promise<void> {
    this.recordedChunks = [];

    if (duration) {
      this.progress.totalDuration = duration;
    }

    // Capturer stream canvas à 60fps
    const canvasStream = canvas.captureStream(60);

    // Combiner avec audio si disponible
    let combinedStream: MediaStream;
    if (audioTrack) {
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        audioTrack
      ]);
    } else {
      combinedStream = canvasStream;
    }

    // Créer MediaRecorder avec meilleur codec
    const mimeType = this.getBestMimeType();
    this.recorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond: 8000000, // 8 Mbps
    });

    // Collecter chunks
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.recorder.start(100); // Chunk tous les 100ms
    this.progress.state = 'recording';
  }

  async stopRecording(): Promise<VideoExportResult> {
    return new Promise((resolve, reject) => {
      if (!this.recorder) {
        reject(new Error('Aucun enregistrement actif'));
        return;
      }

      this.recorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
        const filename = `shader-animation-${Date.now()}.webm`;

        const result: VideoExportResult = {
          blob,
          filename,
          duration: this.progress.totalDuration,
          size: blob.size,
          format: 'webm',
        };

        this.progress.state = 'complete';
        resolve(result);
      };

      this.recorder.onerror = (error) => {
        this.progress.state = 'error';
        this.progress.errorMessage = 'Échec enregistrement';
        reject(error);
      };

      this.recorder.stop();
    });
  }

  cancelRecording(): void {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
    this.recordedChunks = [];
    this.progress.state = 'idle';
  }

  getProgress(): ExportProgress {
    return { ...this.progress };
  }

  cleanup(): void {
    this.cancelRecording();
    this.recorder = null;
  }

  private getBestMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'video/webm';
  }
}
