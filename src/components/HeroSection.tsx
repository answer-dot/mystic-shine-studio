import { ArrowRight, Users, Star, Clock, Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { useSettings } from '@/hooks/useSettings';
import { usePrimaryCourse } from '@/hooks/usePrimaryCourse';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const HeroSection = () => {
  const { settings } = useSettings();
  const { primaryCourse } = usePrimaryCourse();
  const { isEnrolled } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is enrolled in the primary course
  const userIsEnrolled = user && primaryCourse && isEnrolled(primaryCourse.id);

  const handleCTAClick = () => {
    if (!user) {
      // Not logged in: go to signup
      navigate('/auth?mode=signup');
    } else if (userIsEnrolled) {
      // Enrolled: go directly to dashboard/course player
      navigate('/dashboard');
    } else {
      // Logged in but not enrolled: scroll to curriculum to encourage purchase
      document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCurriculum = () => {
    document.getElementById('curriculum')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Enrolled User: Show expanded premium "Welcome Back" banner
  if (userIsEnrolled) {
    return (
      <section className="relative pt-20 sm:pt-28 pb-12 sm:pb-20 overflow-hidden min-h-[50vh] sm:min-h-[60vh] flex items-center">
        {/* Premium Background - Mystic Tarot Theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0d0d14]" />
        
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_hsl(var(--primary)/0.15)_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_hsl(280,60%,30%,0.12)_0%,_transparent_50%)]" />
        </div>
        
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/6 w-64 sm:w-96 h-64 sm:h-96 bg-primary/15 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/6 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        
        {/* Subtle star pattern overlay */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.3) 1px, transparent 1px),
                              radial-gradient(circle at 80% 70%, hsl(var(--primary)/0.2) 1px, transparent 1px),
                              radial-gradient(circle at 50% 50%, hsl(280,60%,50%,0.15) 1px, transparent 1px)`,
            backgroundSize: '100px 100px, 150px 150px, 200px 200px'
          }}
        />

        <div className="section-container relative z-10 w-full">
          <div className="max-w-5xl mx-auto px-4">
            {/* Expanded Premium Card */}
            <div className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-2xl" 
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(20,20,30,0.9) 0%, rgba(15,15,25,0.95) 100%)',
                   boxShadow: '0 0 60px -15px hsl(var(--primary)/0.3), 0 25px 50px -12px rgba(0,0,0,0.5)'
                 }}>
              {/* Inner glow border */}
              <div className="absolute inset-0 rounded-3xl border border-primary/20 pointer-events-none" />
              
              <div className="p-8 sm:p-12 lg:p-16">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                  {/* Left: Welcome Content */}
                  <div className="text-center lg:text-left flex-1">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold mb-4 border border-green-500/30">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                      수강 중
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight">
                      다시 오신 것을{' '}
                      <span className="text-gradient-gold">환영합니다!</span> 👋
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                      <span className="text-primary font-medium">{primaryCourse?.title || '강의'}</span>를 이어서 학습해보세요.
                    </p>
                  </div>
                  
                  {/* Right: Action Buttons */}
                  <div className="flex flex-col gap-4 w-full lg:w-auto">
                    <Button 
                      variant="hero" 
                      size="xl" 
                      onClick={() => navigate('/dashboard')} 
                      className="w-full lg:w-auto px-10 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                      style={{
                        boxShadow: '0 0 40px -10px hsl(var(--primary)/0.5), 0 10px 30px -10px rgba(0,0,0,0.3)'
                      }}
                    >
                      <Play className="w-6 h-6 mr-3" />
                      이어서 학습하기
                    </Button>
                    <Button 
                      variant="outline" 
                      size="lg" 
                      onClick={scrollToCurriculum} 
                      className="w-full lg:w-auto border-2 border-primary/40 hover:border-primary/60 hover:bg-primary/10"
                    >
                      <BookOpen className="w-5 h-5 mr-2" />
                      커리큘럼 보기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Default Hero for non-enrolled users
  return (
    <section className="relative min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 sm:mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs sm:text-sm text-primary font-medium">2월 특별 오픈 클래스</span>
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6 animate-fade-in px-2">
            지식 창업가를 위한{' '}
            <span className="text-gradient-gold block sm:inline">수익 자동화 시스템</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto animate-fade-in px-4">
            {primaryCourse?.description || '타로의 신비로운 세계에 입문하세요. 15년 경력의 마스터가 직접 전수하는 체계적인 커리큘럼으로 전문 리더로 성장하세요.'}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-6 md:gap-12 mb-8 sm:mb-10 animate-fade-in px-2 sm:px-4">
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-base text-muted-foreground text-center"><span className="font-bold text-foreground">2,847</span> 수강생</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-primary fill-primary" />
              <span className="text-xs sm:text-base text-muted-foreground text-center"><span className="font-bold text-foreground">4.9</span> 평점</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="text-xs sm:text-base text-muted-foreground text-center"><span className="font-bold text-foreground">{primaryCourse?.duration || '14주'}</span> 과정</span>
            </div>
          </div>

          {/* CTA Buttons - Smart Redirection */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 animate-fade-in px-4">
            <Button variant="hero" size="xl" className="w-full sm:w-auto" onClick={handleCTAClick}>
              {!user ? '무료 체험 시작' : '커리큘럼 보기'}
              <ArrowRight className="w-5 h-5" />
            </Button>
            {!user && (
              <Button variant="outline" size="xl" className="w-full sm:w-auto" onClick={scrollToCurriculum}>
                커리큘럼 보기
              </Button>
            )}
          </div>

          {/* Urgency */}
          <div className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 max-w-xl mb-8 sm:mb-10 animate-fade-in mx-4 sm:mx-auto">
            <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
              <span className="text-destructive font-semibold animate-pulse text-sm sm:text-base">🔥 마감 임박!</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
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
