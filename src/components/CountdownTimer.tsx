import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: string;
  compact?: boolean;
}

export const CountdownTimer = ({ targetDate, compact = false }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className={`flex flex-col items-center ${compact ? '' : 'min-w-[60px] sm:min-w-[80px]'}`}>
      <div className={`
        ${compact ? 'text-xl sm:text-2xl px-2 py-1' : 'text-3xl sm:text-5xl px-4 py-3 sm:px-6 sm:py-4'}
        font-bold text-primary bg-card rounded-xl border border-border shadow-elevated
        animate-count-pulse
      `}>
        {String(value).padStart(2, '0')}
      </div>
      <span className={`${compact ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground mt-2 uppercase tracking-wider`}>
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <span className={`${compact ? 'text-xl' : 'text-3xl sm:text-5xl'} font-bold text-primary self-start mt-3 sm:mt-4`}>:</span>
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <TimeBlock value={timeLeft.days} label="일" />
      <Separator />
      <TimeBlock value={timeLeft.hours} label="시간" />
      <Separator />
      <TimeBlock value={timeLeft.minutes} label="분" />
      <Separator />
      <TimeBlock value={timeLeft.seconds} label="초" />
    </div>
  );
};
