import { useState, useCallback, useEffect } from 'react';
import { Users, Star, Clock, Play, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CountdownTimer } from './CountdownTimer';
import { WebinarRegistrationForm } from './WebinarRegistrationForm';
import { useSettings } from '@/hooks/useSettings';
import { usePrimaryCourse } from '@/hooks/usePrimaryCourse';
import { useCourses } from '@/hooks/useCourses';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWebinarRealtime } from '@/hooks/useWebinarRealtime';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const HeroSection = () => {
  const { settings } = useSettings();
  const { primaryCourse } = usePrimaryCourse();
  const { isEnrolled } = useCourses();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Real-time webinar notifications
  useWebinarRealtime();
  
  // Modal state for registration form
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  
  // Calculate initial timer expired state based on current time vs webinar date
  const getInitialExpiredState = useCallback(() => {
    if (!settings.webinarDate) return false;
    const webinarTime = new Date(settings.webinarDate).getTime();
    return Date.now() >= webinarTime;
  }, [settings.webinarDate]);

  // Track if timer has expired (webinar started)
  const [isTimerExpired, setIsTimerExpired] = useState(getInitialExpiredState);

  // Update expired state when settings change (real-time sync)
  useEffect(() => {
    setIsTimerExpired(getInitialExpiredState());
  }, [getInitialExpiredState]);

  const handleTimerExpire = useCallback(() => {
    setIsTimerExpired(true);
  }, []);

  // Check if user is enrolled in the primary course
  const userIsEnrolled = user && primaryCourse && isEnrolled(primaryCourse.id);
  
  const scrollToCurriculum = () => {
    document.getElementById('curriculum')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  // Determine if registration is closed
  const isClosed = settings.remainingSeats <= 0 || isTimerExpired;

  // Handle successful registration
  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
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
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, hsl(var(--primary)/0.3) 1px, transparent 1px),
                            radial-gradient(circle at 80% 70%, hsl(var(--primary)/0.2) 1px, transparent 1px),
                            radial-gradient(circle at 50% 50%, hsl(280,60%,50%,0.15) 1px, transparent 1px)`,
          backgroundSize: '100px 100px, 150px 150px, 200px 200px'
        }} />

        <div className="section-container relative z-10 w-full">
          <div className="max-w-6xl mx-auto px-2 sm:px-4">
            {/* Expanded Premium Card */}
            <div className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-2xl" style={{
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
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight lg:text-4xl">
                      다시 오신 것을{' '}
                      <span className="text-gradient-gold">환영합니다!</span> 👋
                    </h2>
                    <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                      <span className="text-primary font-medium">{primaryCourse?.title || '강의'}</span>를 이어서 학습해보세요.
                    </p>
                  </div>
                  
                  {/* Right: Action Buttons - Unified sizing */}
                  <div className="flex flex-col gap-4 w-full lg:w-auto lg:min-w-[280px]">
                    <Button variant="hero" size="xl" onClick={() => navigate('/dashboard')} className="w-full min-h-[56px] px-8 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300" style={{
                      boxShadow: '0 0 40px -10px hsl(var(--primary)/0.5), 0 10px 30px -10px rgba(0,0,0,0.3)'
                    }}>
                      <Play className="w-6 h-6 mr-3" />
                      이어서 학습하기
                    </Button>
                    <Button variant="outline" size="xl" onClick={scrollToCurriculum} className="w-full min-h-[56px] px-8 border-2 border-primary/40 hover:border-primary/60 hover:bg-primary/10">
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

  // Default Hero for non-enrolled users - WEBINAR FOCUSED (Clean CTA + Modal)
  return (
    <>
      <section className="relative min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-32 sm:w-64 h-32 sm:h-64 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="section-container relative z-10 w-full">
          <div className="max-w-4xl mx-auto text-center px-4">
            {/* Badge - Centered */}
            <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm text-primary font-medium">2월 특별 오픈 클래스</span>
              </div>
            </div>

            {/* Main headline - Centered */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 sm:mb-6 animate-fade-in text-center">
              지식 창업가를 위한{' '}
              <span className="text-gradient-gold block sm:inline">수익 자동화 시스템</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto animate-fade-in text-center">
              {primaryCourse?.description || '타로의 신비로운 세계에 입문하세요. 15년 경력의 마스터가 직접 전수하는 체계적인 커리큘럼으로 전문 리더로 성장하세요.'}
            </p>

            {/* 🔥 WEBINAR CTA CARD - Only Timer + Button (No Form) */}
            <div className="flex justify-center animate-fade-in">
              <div className="glass-card rounded-2xl p-6 sm:p-8 w-full max-w-md border-2 border-primary/30 text-center" style={{
                background: 'linear-gradient(135deg, rgba(20,20,30,0.95) 0%, rgba(15,15,25,0.98) 100%)',
                boxShadow: '0 0 40px -10px hsl(var(--primary)/0.4)'
              }}>
                {/* Webinar Header */}
                <div className="mb-4">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                    🔮 무료 웨비나 시작까지
                  </h3>
                  <p className="text-sm text-muted-foreground">지금 바로 자리를 확보하세요!</p>
                </div>

                {/* Countdown Timer - Large & Prominent */}
                <div className="w-full mb-6">
                  <CountdownTimer 
                    targetDate={settings.webinarDate} 
                    onExpire={handleTimerExpire}
                  />
                </div>

                {/* Real-time Seat Counter */}
                <div className="flex items-center justify-center gap-3 py-3 px-6 rounded-full mb-6 mx-auto" style={{
                  background: isClosed 
                    ? 'rgba(239, 68, 68, 0.2)' 
                    : settings.remainingSeats <= 5 
                      ? 'rgba(239, 68, 68, 0.15)' 
                      : 'rgba(34, 197, 94, 0.1)',
                  border: isClosed 
                    ? '1px solid rgba(239, 68, 68, 0.4)' 
                    : settings.remainingSeats <= 5 
                      ? '1px solid rgba(239, 68, 68, 0.3)' 
                      : '1px solid rgba(34, 197, 94, 0.3)'
                }}>
                  {isClosed ? (
                    <span className="text-destructive font-bold text-lg">🚫 마감되었습니다</span>
                  ) : settings.remainingSeats <= 5 ? (
                    <>
                      <span className="text-destructive font-bold text-lg animate-pulse">🔥 마감 임박!</span>
                      <span className="text-sm sm:text-base text-foreground">
                        잔여 <span className="text-primary font-extrabold text-xl">{settings.remainingSeats}</span>석
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-green-400 font-bold text-base">✓ 신청 가능</span>
                      <span className="text-sm sm:text-base text-foreground">
                        잔여 <span className="text-primary font-extrabold text-xl">{settings.remainingSeats}</span>석
                      </span>
                    </>
                  )}
                </div>

                {/* CTA Button - Opens Modal */}
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full text-lg font-bold py-6"
                  onClick={() => setShowRegistrationModal(true)}
                  disabled={isClosed}
                  style={{
                    boxShadow: '0 0 30px -8px hsl(var(--primary)/0.5)'
                  }}
                >
                  {isClosed ? '🚫 마감되었습니다' : '🔮 무료 웨비나 신청하기'}
                </Button>
              </div>
            </div>

            {/* Stats - Centered */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-10 animate-fade-in">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-base text-muted-foreground"><span className="font-bold text-foreground">2,847</span> 수강생</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary fill-primary" />
                <span className="text-base text-muted-foreground"><span className="font-bold text-foreground">4.9</span> 평점</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-base text-muted-foreground"><span className="font-bold text-foreground">{primaryCourse?.duration || '14주'}</span> 과정</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Modal - Clean Popup with proper mobile spacing */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent 
          className="w-[calc(100vw-32px)] max-w-[420px] p-0 border-0 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16161d 100%)',
          }}
        >
          {/* Modal Header - Fixed with padding for close button */}
          <div className="px-6 pt-8 pb-4 text-center border-b border-white/10">
            <h2 className="text-xl font-bold text-white mb-1">
              🔮 무료 웨비나 신청
            </h2>
            <p className="text-sm text-gray-400">
              아래 정보를 입력하시면 안내를 받으실 수 있습니다
            </p>
          </div>
          
          {/* Modal Body - Scrollable with proper padding */}
          <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
            <WebinarRegistrationForm 
              isExpired={isTimerExpired}
              onSuccess={handleRegistrationSuccess}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
