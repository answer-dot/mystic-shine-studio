import { Check, Shield, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const PricingSection = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    if (user) {
      // Logged in: go to dashboard
      navigate('/dashboard');
    } else {
      // Not logged in: go to signup
      navigate('/auth?mode=signup');
    }
  };

  const features = [
    "14주 완성 체계적 커리큘럼",
    "평생 무제한 영상 시청",
    "주 2회 라이브 Q&A 세션",
    "수강생 전용 커뮤니티 접근",
    "1:1 피드백 무제한",
    "수료증 발급",
    "보너스: 비즈니스 가이드북",
  ];

  return (
    <section id="pricing" className="py-20 sm:py-28 bg-gradient-to-b from-surface-overlay to-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ 특별 할인
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">지금 바로 시작하세요</h2>
          <p className="text-muted-foreground">한정 시간 특별가로 만나보세요</p>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="glass-card rounded-3xl p-8 sm:p-10 relative overflow-hidden">
            {/* Glow effect */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Badge */}
              <div className="flex justify-center mb-6">
                <span className="px-4 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-bold">
                  45% 할인 • 곧 종료됩니다
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <p className="text-muted-foreground line-through text-lg mb-2">{settings.originalPrice}</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl sm:text-6xl font-extrabold text-gradient-gold">{settings.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">일시불 결제시</p>
              </div>

              {/* Countdown */}
              <div className="mb-8 p-4 rounded-xl bg-secondary/50">
                <p className="text-center text-sm text-muted-foreground mb-4">⏰ 할인 마감까지</p>
                <CountdownTimer targetDate={settings.webinarDate} compact />
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Urgency */}
              <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <Zap className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">
                  잔여 {settings.remainingSeats}석만 남았습니다!
                </span>
              </div>

              {/* CTA */}
              <Button variant="hero" size="xl" className="w-full" onClick={handleRegisterClick}>
                {user ? '내 강의실 가기' : '지금 등록하기'}
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  <span>안전 결제</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>7일 환불 보장</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
