import { Calendar, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/useSettings';

export const EventsSection = () => {
  const { settings } = useSettings();

  const getStatusBadge = (status: string) => {
    const styles = {
      ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
      upcoming: "bg-primary/20 text-primary border-primary/30",
      ended: "bg-muted text-muted-foreground border-border",
    };
    const labels = {
      ongoing: "진행중",
      upcoming: "예정",
      ended: "종료",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
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

        <div className="max-w-4xl mx-auto space-y-6">
          {settings.events.map((event) => (
            <div 
              key={event.id}
              className="glass-card rounded-2xl p-6 sm:p-8 hover:border-primary/30 transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                {/* Event info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    {getStatusBadge(event.status)}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 sm:mb-0">
                    {event.description}
                  </p>
                </div>

                {/* CTA */}
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>잔여 {event.spots}석</span>
                  </div>
                  <Button 
                    variant={event.status === 'ended' ? 'outline' : 'gold'} 
                    size="lg"
                    disabled={event.status === 'ended'}
                    className="w-full sm:w-auto"
                  >
                    {event.status === 'ended' ? '종료됨' : '신청하기'}
                    {event.status !== 'ended' && <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
