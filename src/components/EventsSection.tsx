import { Calendar, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';

// Default placeholder for events without images
const defaultEventImage = "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=400&fit=crop&q=80";

export const EventsSection = () => {
  const { settings } = useSettings();

  const getStatusBadge = (status: string) => {
    if (status === 'ongoing') {
      return (
        <span className="relative px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/40">
          {/* Neon glow effect */}
          <span className="absolute inset-0 rounded-full bg-green-500/30 blur-md animate-pulse" />
          <span className="relative flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            진행중
          </span>
        </span>
      );
    }
    
    if (status === 'upcoming') {
      return (
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            예정
          </span>
        </span>
      );
    }
    
    return (
      <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
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
              className="group relative rounded-2xl overflow-hidden border border-primary/20 bg-card shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
              style={{
                boxShadow: event.status === 'ongoing' 
                  ? '0 0 30px rgba(var(--primary), 0.15), 0 10px 40px -10px rgba(0,0,0,0.3)' 
                  : undefined
              }}
            >
              {/* Premium gold border glow for ongoing events */}
              {event.status === 'ongoing' && (
                <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 pointer-events-none" />
              )}

              <div className="flex flex-col lg:flex-row">
                {/* Image Section - Left side */}
                <div className="lg:w-2/5 relative overflow-hidden">
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-full">
                    <img 
                      src={event.imageUrl || defaultEventImage}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card lg:bg-gradient-to-r lg:from-transparent lg:to-card" />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent lg:hidden" />
                  </div>
                  
                  {/* Status badge - positioned on image */}
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(event.status)}
                  </div>
                </div>

                {/* Content Section - Right side */}
                <div className="lg:w-3/5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{new Date(event.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  
                  {/* Title - Large & Bold */}
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                    {event.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-6">
                    {event.description}
                  </p>

                  {/* Footer: Spots + CTA */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-foreground font-medium">잔여 {event.spots}석</span>
                      </div>
                      {event.spots <= 10 && event.status !== 'ended' && (
                        <span className="text-red-400 text-xs font-medium animate-pulse">마감임박!</span>
                      )}
                    </div>
                    
                    <Button 
                      variant={event.status === 'ended' ? 'outline' : 'gold'} 
                      size="lg"
                      disabled={event.status === 'ended'}
                      className="w-full sm:w-auto text-base px-8 group/btn"
                    >
                      {event.status === 'ended' ? '종료됨' : '신청하기'}
                      {event.status !== 'ended' && (
                        <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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
