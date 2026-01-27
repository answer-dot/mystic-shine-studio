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

  // Inline styles to FORCE horizontal layout - no CSS can override this
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: compact ? '4px' : '8px',
    width: '100%',
    overflow: 'visible',
  };

  const blockStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    minWidth: compact ? '40px' : '48px',
  };

  const digitStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: compact ? '18px' : '24px',
    padding: compact ? '6px 8px' : '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    color: 'hsl(var(--primary))',
    minWidth: compact ? '36px' : '44px',
    textAlign: 'center' as const,
    fontVariantNumeric: 'tabular-nums',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: compact ? '10px' : '11px',
    color: 'hsl(var(--muted-foreground))',
    marginTop: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const separatorStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: compact ? '18px' : '24px',
    color: 'hsl(var(--primary))',
    flexShrink: 0,
    paddingTop: compact ? '6px' : '8px',
  };

  return (
    <div style={containerStyle}>
      <div style={blockStyle}>
        <div style={digitStyle}>{String(timeLeft.days).padStart(2, '0')}</div>
        <span style={labelStyle}>일</span>
      </div>
      <span style={separatorStyle}>:</span>
      <div style={blockStyle}>
        <div style={digitStyle}>{String(timeLeft.hours).padStart(2, '0')}</div>
        <span style={labelStyle}>시간</span>
      </div>
      <span style={separatorStyle}>:</span>
      <div style={blockStyle}>
        <div style={digitStyle}>{String(timeLeft.minutes).padStart(2, '0')}</div>
        <span style={labelStyle}>분</span>
      </div>
      <span style={separatorStyle}>:</span>
      <div style={blockStyle}>
        <div style={digitStyle}>{String(timeLeft.seconds).padStart(2, '0')}</div>
        <span style={labelStyle}>초</span>
      </div>
    </div>
  );
};
