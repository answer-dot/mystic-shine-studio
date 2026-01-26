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
    <div className={`flex flex-col items-center ${compact ? '' : 'min-w-[48px] sm:min-w-[70px] md:min-w-[80px]'}`}>
      <div className={`
        ${compact ? 'text-xl sm:text-2xl px-2 py-1' : 'text-2xl sm:text-4xl md:text-5xl px-2 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4'}
        font-bold text-primary bg-card rounded-lg sm:rounded-xl border border-border shadow-elevated
        animate-count-pulse w-full text-center
      `}>
        {String(value).padStart(2, '0')}
      </div>
      <span className={`${compact ? 'text-xs' : 'text-[10px] sm:text-xs md:text-sm'} text-muted-foreground mt-1 sm:mt-2 uppercase tracking-wider`}>
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <span className={`${compact ? 'text-xl' : 'text-xl sm:text-3xl md:text-5xl'} font-bold text-primary self-start mt-2 sm:mt-3 md:mt-4`}>:</span>
  );

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4 w-full">
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
