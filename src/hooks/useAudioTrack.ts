import { useCallback, useState } from 'react';
import type { AudioTrackInfo } from '../types/config';

/**
 * Read audio metadata (duration) using an HTMLAudioElement.
 */
async function readAudioDuration(objectUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = objectUrl;

    const cleanup = () => {
      audio.onloadedmetadata = null;
      audio.onerror = null;
    };

    audio.onloadedmetadata = () => {
      cleanup();
      if (!Number.isFinite(audio.duration)) {
        reject(new Error('Audio duration unavailable.'));
      } else {
        resolve(audio.duration);
      }
    };

    audio.onerror = () => {
      cleanup();
      reject(new Error('Impossible de lire les métadonnées audio.'));
    };

    audio.load();
  });
}

/**
 * Hook responsible for loading audio files and extracting metadata.
 * Returns helper state for showing progress and reporting errors.
 */
export function useAudioTrackLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetError = useCallback(() => setError(null), []);

  const loadFromFile = useCallback(async (file: File): Promise<AudioTrackInfo> => {
    setIsLoading(true);
    setError(null);
    const objectUrl = URL.createObjectURL(file);
    try {
      const duration = await readAudioDuration(objectUrl);
      const track: AudioTrackInfo = {
        name: file.name,
        duration,
        size: file.size,
        mimeType: file.type,
        lastModified: file.lastModified,
        status: 'ready',
        objectUrl,
      };
      setIsLoading(false);
      return track;
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'Échec du chargement audio.');
      throw err;
    }
  }, []);

  return {
    isLoading,
    error,
    loadFromFile,
    resetError,
  };
}
