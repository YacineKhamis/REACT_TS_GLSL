import React, { useCallback } from 'react';

interface SegmentControlsProps {
  segments: { start: number; duration: number }[];
  onSegmentDurationChange: (index: number, newDuration: number) => void;
}

const SegmentControls: React.FC<SegmentControlsProps> = ({ segments, onSegmentDurationChange }) => {
  const handleDurationChange = useCallback(
    (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = parseFloat(event.target.value);
      onSegmentDurationChange(index, newDuration);
    },
    [onSegmentDurationChange]
  );

  return (
    <div>
      <h3>Segment Durations</h3>
      {segments.map((segment, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <label>
            Segment {index}:
            <input
              type="number"
              value={segment.duration}
              onChange={(event) => handleDurationChange(index, event)}
              style={{ width: '80px', marginLeft: '10px' }}
            />
          </label>
        </div>
      ))}
    </div>
  );
};

export default SegmentControls;