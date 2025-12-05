/**
 * TimelinePlaybackBar component - Compact playback controls for Timeline Modal.
 * Similar to main PlaybackBar but optimized for modal footer.
 */

import { useState, useEffect, useRef } from 'react';

interface TimelinePlaybackBarProps {
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onScrub: (time: number) => void;
  totalDuration: number;
  segments: Array<{ start: number; duration: number }>;
}

export function TimelinePlaybackBar({
  currentTime,
  isPlaying,
  onPlayPause,
  onScrub,
  totalDuration,
  segments,
}: TimelinePlaybackBarProps) {
  const [displayTime, setDisplayTime] = useState(currentTime);
  const isScrubbing = useRef(false);

  useEffect(() => {
    if (!isScrubbing.current) {
      setDisplayTime(currentTime);
    }
  }, [currentTime]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds
      .toString()
      .padStart(3, '0')}`;
  };

  const getCurrentSegmentName = (time: number) => {
    for (let i = 0; i < segments.length; i++) {
      if (time >= segments[i].start && time < segments[i].start + segments[i].duration) {
        return `Segment ${i + 1}`;
      }
    }
    return 'End';
  };

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setDisplayTime(newTime);
    onScrub(newTime);
  };

  const handleMouseDown = () => {
    isScrubbing.current = true;
  };

  const handleMouseUp = () => {
    isScrubbing.current = false;
    onScrub(displayTime);
  };

  return (
    <div className="border-t border-dark-border bg-dark-lighter/50 px-4 py-3 flex items-center gap-3">
      {/* Play/Pause button */}
      <button
        onClick={onPlayPause}
        className="px-3 py-1.5 bg-primary text-white text-sm rounded hover:bg-primary/90 transition-colors flex-shrink-0"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      {/* Timeline controls */}
      <div className="flex-1 flex items-center gap-2">
        {/* Time display */}
        <span className="text-xs font-mono text-gray-300 flex-shrink-0">
          {formatTime(displayTime)}
        </span>

        {/* Scrubber */}
        <input
          type="range"
          min="0"
          max={totalDuration}
          step="0.01"
          value={displayTime}
          onChange={handleSliderChange}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          className="flex-1 h-1.5 cursor-pointer accent-primary"
        />

        {/* Total duration */}
        <span className="text-xs font-mono text-gray-400 flex-shrink-0">
          {formatTime(totalDuration)}
        </span>
      </div>

      {/* Current segment indicator */}
      <span className="text-xs font-medium text-gray-300 flex-shrink-0 min-w-[80px] text-right">
        {getCurrentSegmentName(displayTime)}
      </span>
    </div>
  );
}
