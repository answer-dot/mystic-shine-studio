import { useEffect, useState } from 'react';
import { X, UserCheck } from 'lucide-react';

const names = [
  "김**", "이**", "박**", "최**", "정**", "강**", "조**", "윤**", "장**", "임**",
  "한**", "오**", "서**", "신**", "권**", "황**", "안**", "송**", "류**", "홍**"
];

const getRandomName = () => names[Math.floor(Math.random() * names.length)];
const getRandomTime = () => Math.floor(Math.random() * 10) + 1;

export const SocialProofToast = () => {
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
    <div className="fixed bottom-4 left-4 z-50 animate-slide-up">
      <div className="glass-card rounded-xl p-4 pr-10 shadow-elevated max-w-sm relative">
        <button
          onClick={() => setVisible(false)}
          className="absolute top-2 right-2 p-1 hover:bg-secondary rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">{name}</span>님이 웨비나에 등록했습니다!
            </p>
            <p className="text-xs text-muted-foreground">{time}분 전</p>
          </div>
        </div>
      </div>
    </div>
  );
};
