import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  initialMinutes: number;
  startedAt: string;
  onTimeUp: () => void;
}

export const Timer: React.FC<TimerProps> = ({
  initialMinutes,
  startedAt,
  onTimeUp,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    const totalSeconds = initialMinutes * 60;
    const startMs = new Date(startedAt).getTime();
    const elapsedSeconds = Math.floor((Date.now() - startMs) / 1000);
    return Math.max(0, totalSeconds - elapsedSeconds);
  });

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining, onTimeUp]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const isUrgent = secondsRemaining < 120; // under 2 minutes

  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-sm ${
        isUrgent
          ? 'bg-red-50 text-red-700 border border-red-300 animate-pulse ring-2 ring-red-200'
          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
      }`}
    >
      <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-600' : 'text-indigo-600'}`} />
      <span>Còn lại: {formattedTime}</span>
      {isUrgent && (
        <span className="text-[10px] uppercase font-bold text-red-600 hidden sm:inline">
          (Sắp hết giờ)
        </span>
      )}
    </div>
  );
};
