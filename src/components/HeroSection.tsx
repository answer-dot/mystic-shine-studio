import { ArrowRight, Users, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { useSettings } from '@/hooks/useSettings';

export const HeroSection = () => {
  const { settings } = useSettings();

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen pt-24 pb-16 flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-primary font-medium">2월 특별 오픈 클래스</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in">
            지식 창업가를 위한{' '}
            <span className="text-gradient-gold">수익 자동화 시스템</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
            타로의 신비로운 세계에 입문하세요. 15년 경력의 마스터가 직접 전수하는 
            체계적인 커리큘럼으로 전문 리더로 성장하세요.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-10 animate-fade-in">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground"><span className="font-bold text-foreground">2,847</span> 수강생</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary fill-primary" />
              <span className="text-muted-foreground"><span className="font-bold text-foreground">4.9</span> 평점</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-muted-foreground"><span className="font-bold text-foreground">14주</span> 과정</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button variant="hero" size="xl" onClick={scrollToPricing}>
              무료 체험 시작
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl" onClick={() => document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' })}>
              커리큘럼 보기
            </Button>
          </div>

          {/* Urgency */}
          <div className="glass-card rounded-2xl p-6 sm:p-8 max-w-xl mx-auto mb-10 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-destructive font-semibold animate-pulse">🔥 마감 임박!</span>
              <span className="text-sm text-muted-foreground">
                잔여 <span className="text-primary font-bold">{settings.remainingSeats}</span>석
              </span>
            </div>
            <CountdownTimer targetDate={settings.webinarDate} />
          </div>
        </div>
      </div>
    </section>
  );
};
