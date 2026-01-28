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
    <div 
      ref={ref} 
      className="fixed bottom-4 left-4 z-40 animate-fade-in pointer-events-auto"
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      <div 
        className="rounded-lg p-3 pr-10 shadow-lg relative border border-primary/30"
        style={{
          background: 'linear-gradient(135deg, rgba(20,20,30,0.98) 0%, rgba(15,15,25,1) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={() => setVisible(false)}
          className="absolute top-1/2 -translate-y-1/2 right-2 w-6 h-6 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
          aria-label="닫기"
        >
          <X className="w-3.5 h-3.5 text-gray-400" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">
              <span className="text-primary font-bold">{name}</span>님이 신청완료!
            </p>
            <p className="text-[10px] text-gray-400">{time}분 전</p>
          </div>
        </div>
      </div>
    </div>
  );
});

SocialProofToast.displayName = 'SocialProofToast';
