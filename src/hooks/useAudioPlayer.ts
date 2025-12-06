import { useCallback, useEffect, useRef, useState } from 'react';
import type { AudioTrackInfo } from '../types/config';

interface UseAudioPlayerOptions {
  onEnded?: () => void;
  onTimeUpdate?: (time: number) => void;
}

/**
 * Lightweight audio player controller tied to a single HTMLAudioElement.
 * Handles track swapping, playback state and exposes imperative controls.
 */
export function useAudioPlayer(
  track?: AudioTrackInfo,
  options?: UseAudioPlayerOptions
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.preload = 'auto';
  }

  // Extract callbacks to avoid re-creating listeners on every render
  const onEnded = options?.onEnded;
  const onTimeUpdate = options?.onTimeUpdate;

  // Attach lifecycle listeners once.
  useEffect(() => {
    const audio = audioRef.current!;

    const handleCanPlay = () => {
      setIsReady(true);
      setError(null);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleTimeUpdate = () => {
      onTimeUpdate?.(audio.currentTime);
    };
    const handleError = () => {
      setError('Lecture audio impossible.');
      setIsReady(false);
      setIsPlaying(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('error', handleError);
    };
  }, [onEnded, onTimeUpdate]);

  // Update the audio source whenever the track changes.
  useEffect(() => {
    const audio = audioRef.current!;
    setIsReady(false);
    setIsPlaying(false);
    setError(null);

    if (track && track.status === 'ready' && track.objectUrl) {
      audio.src = track.objectUrl;
      audio.currentTime = 0;
      audio.load();
    } else {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
  }, [track]);

  const canPlayTrack = track && track.status === 'ready' && !!track.objectUrl;

  const play = useCallback(
    async (startTime?: number) => {
      if (!canPlayTrack) return;
      const audio = audioRef.current!;
      if (typeof startTime === 'number' && Number.isFinite(startTime)) {
        audio.currentTime = Math.max(0, startTime);
      }
      try {
        await audio.play();
      } catch (err) {
        console.error('Erreur lecture audio:', err);
        setError('Impossible de démarrer la lecture audio.');
      }
    },
    [canPlayTrack],
  );

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
  }, []);

  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(time)) return;
      const max = audio.duration && Number.isFinite(audio.duration)
        ? audio.duration
        : track?.duration ?? time;
      const clamped = Math.min(Math.max(time, 0), max || time);
      audio.currentTime = clamped;
    },
    [track],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
  }, []);

  return {
    isReady: !!canPlayTrack && isReady,
    isPlaying,
    error,
    duration: track?.duration ?? audioRef.current?.duration ?? 0,
    play,
    pause,
    seek,
    stop,
    audioElement: audioRef.current,
  };
}
