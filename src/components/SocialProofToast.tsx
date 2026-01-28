import { useEffect, useState, forwardRef } from 'react';
import { X, UserCheck } from 'lucide-react';

const names = [
  "김**", "이**", "박**", "최**", "정**", "강**", "조**", "윤**", "장**", "임**",
  "한**", "오**", "서**", "신**", "권**", "황**", "안**", "송**", "류**", "홍**"
];

const getRandomName = () => names[Math.floor(Math.random() * names.length)];
const getRandomTime = () => Math.floor(Math.random() * 10) + 1;

export const SocialProofToast = forwardRef<HTMLDivElement>((_, ref) => {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState(getRandomName());
  const [time, setTime] = useState(getRandomTime());

  useEffect(() => {
    const showToast = () => {
      setName(getRandomName());
      setTime(getRandomTime());
      setVisible(true);

      setTimeout(() => {
        setVisible(false);
      }, 4000);
    };

    // Initial delay
    const initialTimeout = setTimeout(showToast, 5000);
    
    // Recurring interval
    const interval = setInterval(showToast, 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!visible) return null;

  return (
    <div ref={ref} className="fixed top-20 right-4 z-50 animate-fade-in">
      <div className="glass-card rounded-xl p-3 pr-9 shadow-elevated max-w-xs relative border border-primary/20" style={{
        background: 'linear-gradient(135deg, rgba(20,20,30,0.95) 0%, rgba(15,15,25,0.98) 100%)'
      }}>
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 p-1 hover:bg-secondary rounded-full transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-xs font-medium text-foreground">
              <span className="text-primary">{name}</span>님이 신청했습니다!
            </p>
            <p className="text-[10px] text-muted-foreground">{time}분 전</p>
          </div>
        </div>
      </div>
    </div>
  );
});

SocialProofToast.displayName = 'SocialProofToast';
