import React, { useState, useEffect, useRef } from 'react';

interface PlaybackBarProps {
  currentTime: number;
  isPlaying: boolean;
  onPlayPause: () => void;
  onScrub: (time: number) => void;
  totalDuration: number;
  segments: { start: number; duration: number }[];
}

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
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
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

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: 'white',
      padding: '10px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      zIndex: 1000,
      boxSizing: 'border-box',
    }}>
      <button onClick={onPlayPause} style={{
        padding: '8px 15px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '15px',
      }}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px', minWidth: '80px' }}>
          {formatTime(displayTime)} / {formatTime(totalDuration)}
        </span>
        <input
          type="range"
          min="0"
          max={totalDuration}
          step="0.01"
          value={displayTime}
          onChange={handleSliderChange}
          onMouseDown={() => (isScrubbing.current = true)}
          onMouseUp={() => (isScrubbing.current = false)}
          style={{ flexGrow: 1, height: '5px', cursor: 'pointer' }}
        />
        <span style={{ marginLeft: '15px', fontWeight: 'bold', minWidth: '100px', textAlign: 'right' }}>
          {getCurrentSegmentName(displayTime)}
        </span>
      </div>
    </div>
  );
};

export default PlaybackBar;