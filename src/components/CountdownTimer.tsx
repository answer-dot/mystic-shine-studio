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
    <div className={`flex flex-col items-center flex-shrink-0 ${compact ? 'min-w-[40px]' : 'min-w-[44px] sm:min-w-[64px] md:min-w-[80px]'}`}>
      <div className={`
        ${compact ? 'text-lg sm:text-xl px-2 py-1' : 'text-xl sm:text-3xl md:text-4xl lg:text-5xl px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3'}
        font-bold text-primary bg-card rounded-lg sm:rounded-xl border border-border shadow-elevated
        w-full text-center whitespace-nowrap leading-none tabular-nums
      `}>
        {String(value).padStart(2, '0')}
      </div>
      <span className={`${compact ? 'text-[10px]' : 'text-[9px] sm:text-xs md:text-sm'} text-muted-foreground mt-1 sm:mt-1.5 uppercase tracking-wider whitespace-nowrap`}>
        {label}
      </span>
    </div>
  );

  const Separator = () => (
    <span className={`${compact ? 'text-lg' : 'text-lg sm:text-2xl md:text-4xl'} font-bold text-primary flex-shrink-0 leading-none`}>:</span>
  );

  return (
    <div className="flex flex-row items-start justify-center gap-1 sm:gap-2 md:gap-3 w-full flex-nowrap overflow-hidden">
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
