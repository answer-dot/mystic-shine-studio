import { Calendar, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Default placeholder for events without images
const defaultEventImage = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&h=600&fit=crop&q=80";

export const EventsSection = () => {
  const { settings } = useSettings();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleApplyClick = () => {
    if (!user) {
      // Redirect to signup if not logged in
      navigate('/auth?mode=signup');
    } else {
      // Logged-in users go to dashboard
      navigate('/dashboard');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ongoing') {
      return (
        <span className="relative inline-flex items-center whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/40 backdrop-blur-sm">
          {/* Neon glow effect */}
          <span className="absolute inset-0 rounded-full bg-green-500/30 blur-md animate-pulse" />
          <span className="relative inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <span>진행중</span>
          </span>
        </span>
      );
    }
    
    if (status === 'upcoming') {
      return (
        <span className="inline-flex items-center whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40 backdrop-blur-sm">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span>예정</span>
          </span>
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center whitespace-nowrap px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs font-medium bg-muted/80 text-muted-foreground border border-border backdrop-blur-sm">
        종료
      </span>
    );
  };

  return (
    <section id="events" className="py-20 sm:py-28 bg-gradient-to-b from-surface-overlay to-background">
      <div className="section-container">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            ✦ 이벤트
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">진행중인 이벤트</h2>
          <p className="text-muted-foreground">특별 혜택이 있는 이벤트를 놓치지 마세요</p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {settings.events.map((event) => (
            <div 
              key={event.id}
              className="group relative rounded-2xl overflow-hidden border border-primary/20 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
              style={{
                boxShadow: event.status === 'ongoing' 
                  ? '0 0 30px rgba(var(--primary), 0.15), 0 10px 40px -10px rgba(0,0,0,0.3)' 
                  : undefined
              }}
            >
              {/* Premium gold border glow for ongoing events */}
              {event.status === 'ongoing' && (
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none z-20" />
              )}

              {/* Full Background Image - Taller on mobile for content visibility */}
              <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
                <img 
                  src={event.imageUrl || defaultEventImage}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Dark gradient overlay - stronger on mobile for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30 sm:from-black/90 sm:via-black/50 sm:to-black/20" />
                
                {/* Floating Status Badge - Top Left */}
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
                  {getStatusBadge(event.status)}
                </div>

                {/* Content Overlay - Bottom */}
                <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 lg:p-10">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 mb-2 sm:mb-3">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  
                  {/* Title - Responsive sizing */}
                  <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-white group-hover:text-primary transition-colors duration-300 leading-tight">
                    {event.title}
                  </h3>
                  
                  {/* Description - Line clamped on mobile */}
                  <p className="text-white/80 text-sm sm:text-lg leading-relaxed mb-4 sm:mb-6 max-w-3xl line-clamp-3 sm:line-clamp-none">
                    {event.description}
                  </p>

                  {/* Footer: Spots + CTA */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-white/20">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-white font-medium">잔여 {event.spots}석</span>
                      </div>
                      {event.spots <= 10 && event.status !== 'ended' && (
                        <span className="text-red-400 text-xs font-medium animate-pulse">마감임박!</span>
                      )}
                    </div>
                    
                    <Button 
                      variant={event.status === 'ended' ? 'outline' : 'gold'} 
                      size="lg"
                      disabled={event.status === 'ended'}
                      className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 group/btn"
                      onClick={event.status !== 'ended' ? handleApplyClick : undefined}
                    >
                      {event.status === 'ended' ? '종료됨' : '신청하기'}
                      {event.status !== 'ended' && (
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
