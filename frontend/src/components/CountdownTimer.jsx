import { useState, useEffect, useCallback } from 'react';

export default function CountdownTimer({ targetDate, targetTime }) {
  
  const getTargetDateTime = useCallback(() => {
    if (!targetDate) return null;
    try {
      // Extract YYYY-MM-DD portion safely from any date format
      const d = new Date(targetDate);
      if (isNaN(d.getTime())) return null;
      const dateStr = d.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const timeStr = (targetTime && /^\d{2}:\d{2}/.test(targetTime)) ? targetTime : '00:00:00';
      const combined = new Date(`${dateStr}T${timeStr}`);
      if (isNaN(combined.getTime())) return null;
      return combined;
    } catch(e) {
      return null;
    }
  }, [targetDate, targetTime]);

  const calculateTimeLeft = useCallback(() => {
    const target = getTargetDateTime();
    if (!target) return { invalid: true, days: 0, hours: 0, minutes: 0, seconds: 0 };

    const difference = target.getTime() - Date.now();
    
    if (difference <= 0) {
      // Within 24h past event: "Event Started"; beyond 24h: "Event Ended"
      return { 
        days: 0, hours: 0, minutes: 0, seconds: 0, 
        started: true,
        ended: difference < -(1000 * 60 * 60 * 24),
        invalid: false
      };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      started: false,
      ended: false,
      invalid: false
    };
  }, [getTargetDateTime]);

  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

  useEffect(() => {
    // Recalculate immediately when props change
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  if (timeLeft.invalid) {
    return <div className="text-gray-500 font-semibold text-center py-2">Date TBA</div>;
  }

  if (timeLeft.ended) {
    return (
      <div className="flex justify-center">
        <span className="text-red-500 font-bold text-lg bg-red-50 px-6 py-3 rounded-xl border border-red-100">
          Event Ended
        </span>
      </div>
    );
  }

  if (timeLeft.started) {
    return (
      <div className="flex justify-center">
        <span className="text-green-600 font-bold text-lg bg-green-50 px-6 py-3 rounded-xl border border-green-100 animate-pulse">
          🎉 Event Started!
        </span>
      </div>
    );
  }

  const units = [
    { label: 'Days',    value: timeLeft.days    },
    { label: 'Hours',   value: timeLeft.hours   },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="flex gap-3 md:gap-4 justify-center">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-glow tabular-nums">
            {String(unit.value ?? 0).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-500 mt-2">{unit.label}</p>
        </div>
      ))}
    </div>
  );
}
