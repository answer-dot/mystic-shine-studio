import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

interface EventCountdownTimerProps {
  targetDate: string;
  onExpire?: () => void;
}

export const EventCountdownTimer = ({ targetDate, onExpire }: EventCountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ 
    days: 0, 
    hours: 0, 
    minutes: 0, 
    seconds: 0,
    expired: false 
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        onExpire?.();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        expired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate, onExpire]);

  if (timeLeft.expired) {
    return null;
  }

  const formatTime = (value: number) => String(value).padStart(2, '0');

  // Compact format for event cards
  if (timeLeft.days > 0) {
    return (
      <div className="flex flex-row items-center gap-1.5 text-xs sm:text-sm font-medium flex-nowrap whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        <span className="text-white tabular-nums">
          {timeLeft.days}일 {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)} 남음
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-row items-center gap-1.5 text-xs sm:text-sm font-medium flex-nowrap whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />
      <span className="text-white tabular-nums">
        {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)} 남음
      </span>
    </div>
  );
};
