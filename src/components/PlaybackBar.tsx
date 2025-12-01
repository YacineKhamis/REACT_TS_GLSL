import React, { useState, useEffect, useRef } from 'react';

interface PlaybackBarProps {
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onScrub: (time: number) => void;
  totalDuration: number;
  segments: { start: number; duration: number }[];
}

/**
 * Playback bar component. Displays the current time, allows scrubbing
 * through the timeline and toggling play/pause. It also labels the
 * current segment for clarity.
 */
const PlaybackBar: React.FC<PlaybackBarProps> = ({
  currentTime,
  isPlaying,
  onPlayPause,
  onScrub,
  totalDuration,
  segments,
}) => {
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
    let currentSegmentIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      if (time >= segments[i].start && time < segments[i].start + segments[i].duration) {
        currentSegmentIndex = i;
        break;
      }
    }
    return currentSegmentIndex !== -1 ? `Segment ${currentSegmentIndex}` : 'End';
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
    // S'assurer que le temps affiché correspond au temps scrubé
    onScrub(displayTime);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark/80 backdrop-blur-sm text-white px-5 py-2.5 flex items-center justify-between z-40">
      {/* Play/Pause button */}
      <button
        onClick={onPlayPause}
        className="px-4 py-2 bg-primary text-white rounded-lg mr-4 hover:bg-primary/90 transition-colors"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>

      {/* Timeline controls */}
      <div className="flex-1 flex items-center gap-2.5">
        {/* Time display */}
        <span className="min-w-[140px] text-sm font-mono">
          {formatTime(displayTime)} / {formatTime(totalDuration)}
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

        {/* Current segment name */}
        <span className="ml-4 font-bold min-w-[100px] text-right text-sm">
          {getCurrentSegmentName(displayTime)}
        </span>
      </div>
    </div>
  );
};

export default PlaybackBar;